const crypto = require('crypto');
const express = require('express');
const router = express.Router();
const { sendTextMessage } = require('../services/whatsapp.service');
const conversationService = require('../services/conversation.service');

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

function messageText(message) {
  if (message.type === 'text') return message.text && message.text.body;
  if (message.type === 'button') return message.button && message.button.text;
  if (message.type === 'interactive') {
    return message.interactive?.button_reply?.title || message.interactive?.list_reply?.title;
  }
  return `[${message.type || 'unsupported'} message received]`;
}

async function handleCustomerMessage(from, customerName, text, messageId) {
  const conversation = conversationService.getOrCreateConversation({ phone: from, name: customerName });
  conversationService.addMessage(conversation.code, 'customer', text, messageId);
  await sendTextMessage(
    process.env.OWNER_PHONE,
    `Customer reply from ${conversation.customerName}\nConversation: ${conversation.code}\nMessage: ${text}\n\nReply here using:\n${conversation.code} your reply`
  );
}

async function handleOwnerReply(text, messageId) {
  const match = String(text || '').trim().match(/^#?(RT-[A-Z0-9-]+)\s+([\s\S]+)/i);
  if (!match) {
    await sendTextMessage(process.env.OWNER_PHONE, 'Reply format: RT-XXXX your message\nUse the conversation code shown above.');
    return;
  }
  const conversation = conversationService.getConversationByCode(match[1]);
  if (!conversation) {
    await sendTextMessage(process.env.OWNER_PHONE, `Conversation ${match[1]} was not found. Please use a valid code.`);
    return;
  }
  const reply = match[2].trim();
  await sendTextMessage(conversation.customerPhone, reply);
  conversationService.addMessage(conversation.code, 'owner', reply, messageId);
  await sendTextMessage(process.env.OWNER_PHONE, `Delivered to ${conversation.customerName} (${conversation.code}).`);
}

router.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) return res.status(200).send(challenge);
  return res.sendStatus(403);
});

router.post('/webhook', async (req, res) => {
    console.log('🔥 WEBHOOK POST RECEIVED');
    console.log('Headers:', req.headers);
    console.log('Body:', JSON.stringify(req.body, null, 2));

console.log('RAW BODY EXISTS:', !!req.rawBody);
console.log('RAW BODY LENGTH:', req.rawBody?.length);
console.log('SIGNATURE EXISTS:', !!req.get('x-hub-signature-256'));
console.log('APP SECRET EXISTS:', !!process.env.META_APP_SECRET);

if (!validSignature(req)) {
    console.log('❌ Invalid webhook signature');
    return res.sendStatus(401);
}

  console.log('✅ Webhook signature valid');

  try {
    console.log('📦 Webhook body:', JSON.stringify(req.body, null, 2));
    const changes = req.body?.entry?.flatMap((entry) => entry.changes || []) || [];
    for (const change of changes) {
      const value = change.value || {};
      const contacts = value.contacts || [];
      const contactNames = new Map(contacts.map((contact) => [contact.wa_id, contact.profile?.name || 'Customer']));
      for (const message of value.messages || []) {
        if (conversationService.isDuplicateMessage(message.id)) continue;
        const from = conversationService.normalizePhone(message.from);
        const text = messageText(message);
        if (!text) continue;
        if (from === conversationService.normalizePhone(process.env.OWNER_PHONE)) {
          await handleOwnerReply(text, message.id);
        } else {
          await handleCustomerMessage(from, contactNames.get(message.from) || 'Customer', text, message.id);
        }
      }
    }
    return res.sendStatus(200);
  } catch (error) {
    console.error('Webhook processing failed:', error.response?.data || error.message);
    return res.sendStatus(500);
  }
});

module.exports = router;
