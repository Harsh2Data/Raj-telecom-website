const crypto = require('crypto');
const express = require('express');
const router = express.Router();
const { sendTextMessage } = require('../services/whatsapp.service');
const conversationService = require('../services/conversation.service');
const messageService = require('../services/message.service');
const { getIO } = require('../realtime/socket');

function validSignature(req) {
  const appSecret = process.env.META_APP_SECRET;
  if (!appSecret) return process.env.ALLOW_UNVERIFIED_WEBHOOKS === 'true';
  const signature = req.get('x-hub-signature-256');
  if (!signature || !req.rawBody) return false;
  const expected = `sha256=${crypto.createHmac('sha256', appSecret).update(req.rawBody).digest('hex')}`;
  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(signature);
  return expectedBuffer.length === receivedBuffer.length && crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
}

const MEDIA_TYPES = ['image', 'video', 'audio', 'document'];

// WhatsApp media messages carry only a mediaId + mime type (+ filename for
// documents, + optional caption) — never the bytes themselves. The actual
// file is fetched on demand later via whatsapp.service.getMediaUrl/downloadMedia.
function extractMedia(message) {
  if (!MEDIA_TYPES.includes(message.type)) return null;
  const payload = message[message.type] || {};
  return {
    messageType: message.type,
    mediaId: payload.id,
    mediaMimeType: payload.mime_type,
    mediaFilename: payload.filename,
    mediaCaption: payload.caption
  };
}

const MEDIA_PREVIEW_LABEL = { image: '📷 Photo', video: '🎥 Video', audio: '🎤 Voice message' };

function messageText(message) {
  if (message.type === 'text') return message.text && message.text.body;
  if (message.type === 'button') return message.button && message.button.text;
  if (message.type === 'interactive') {
    return message.interactive?.button_reply?.title || message.interactive?.list_reply?.title;
  }
  const media = extractMedia(message);
  if (media) {
    if (media.mediaCaption) return media.mediaCaption;
    if (media.messageType === 'document') return `📄 ${media.mediaFilename || 'Document'}`;
    return MEDIA_PREVIEW_LABEL[media.messageType];
  }
  return `[${message.type || 'unsupported'} message received]`;
}

// Safe to broadcast even if no admin panel is connected — Socket.IO just has
// zero listeners in that case.
function broadcastNewMessage(conversation, message) {
  try {
    getIO().emit('message:new', { conversation, message });
  } catch (error) {
    // Socket.IO not initialized (shouldn't happen once server.js starts it) — don't fail the webhook over it.
    console.warn('Socket broadcast skipped:', error.message);
  }
}

function broadcastStatus(update) {
  try {
    getIO().emit('message:status', update);
  } catch (error) {
    console.warn('Socket broadcast skipped:', error.message);
  }
}

// A customer texting the business WhatsApp number. Stored in the admin
// panel's conversation/message system — this is now the primary way the
// shop sees and answers customer messages (see conversation.controller.js),
// replacing the old "relay everything to the owner's personal WhatsApp" flow.
async function handleCustomerMessage(from, customerName, text, messageId, media) {
  const conversation = await conversationService.getOrCreateConversation({ phone: from, name: customerName });
  const { duplicate, message } = await messageService.recordIncoming({
    conversationId: conversation._id,
    senderPhone: from,
    text,
    whatsappMessageId: messageId,
    messageType: media?.messageType,
    mediaId: media?.mediaId,
    mediaMimeType: media?.mediaMimeType,
    mediaFilename: media?.mediaFilename,
    mediaCaption: media?.mediaCaption
  });
  if (duplicate) return;
  broadcastNewMessage(conversation, message);
}

// Legacy fallback: the owner can still reply by texting the business number
// from their own WhatsApp with "RT-XXXX your message" — kept working as-is
// (not the primary flow anymore, but not removed either) and now also
// mirrored into the conversation/message store so it shows up correctly in
// the admin panel regardless of which channel the owner replied from.
async function handleOwnerReply(text, messageId) {
  const match = String(text || '').trim().match(/^#?(RT-[A-Z0-9-]+)\s+([\s\S]+)/i);
  if (!match) {
    await sendTextMessage(process.env.OWNER_PHONE, 'Reply format: RT-XXXX your message\nUse the conversation code shown in the admin panel.');
    return;
  }
  const conversation = await conversationService.getConversationByCode(match[1]);
  if (!conversation) {
    await sendTextMessage(process.env.OWNER_PHONE, `Conversation ${match[1]} was not found.`);
    return;
  }
  const reply = match[2].trim();
  const { message } = await messageService.recordOutgoing({
    conversationId: conversation._id,
    senderPhone: process.env.OWNER_PHONE || '',
    text: reply
  });
  try {
    const result = await sendTextMessage(conversation.customerPhone, reply);
    await messageService.markSent(message._id, result?.messages?.[0]?.id);
    broadcastNewMessage(conversation, message);
    await sendTextMessage(process.env.OWNER_PHONE, `Delivered to ${conversation.customerName} (${conversation.code}).`);
  } catch (error) {
    await messageService.markFailed(message._id);
    await sendTextMessage(process.env.OWNER_PHONE, `Could not deliver to ${conversation.customerName}: ${error.message}`);
  }
}

async function handleIncomingMessages(value) {
  const contacts = value.contacts || [];
  const contactNames = new Map(contacts.map((contact) => [contact.wa_id, contact.profile?.name || 'Customer']));

  for (const message of value.messages || []) {
    const from = conversationService.normalizePhone(message.from);
    const text = messageText(message);
    if (!text) continue;
    if (from === conversationService.normalizePhone(process.env.OWNER_PHONE)) {
      await handleOwnerReply(text, message.id);
    } else {
      const media = extractMedia(message);
      await handleCustomerMessage(from, contactNames.get(message.from) || 'Customer', text, message.id, media);
    }
  }
}

async function handleStatusUpdates(value) {
  for (const status of value.statuses || []) {
    const updated = await messageService.updateStatusByWhatsAppId(status.id, status.status);
    if (updated) {
      broadcastStatus({ messageId: updated._id, conversationId: updated.conversationId, status: status.status });
    }
  }
}

router.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) return res.status(200).send(challenge);
  return res.sendStatus(403);
});

router.post('/webhook', async (req, res) => {
  if (!validSignature(req)) {
    console.log('❌ Invalid webhook signature');
    return res.sendStatus(401);
  }

  try {
    const changes = req.body?.entry?.flatMap((entry) => entry.changes || []) || [];
    for (const change of changes) {
      const value = change.value || {};
      if (value.messages?.length) await handleIncomingMessages(value);
      if (value.statuses?.length) await handleStatusUpdates(value);
    }
    return res.sendStatus(200);
  } catch (error) {
    console.error('Webhook processing failed:', error.response?.data || error.message);
    return res.sendStatus(500);
  }
});

module.exports = router;
