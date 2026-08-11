const Message = require('../models/Message');
const { touchAfterMessage } = require('./conversation.service');

// Inbound (customer) message from the webhook. Dedupes on whatsappMessageId
// so a retried webhook delivery doesn't create a second copy — Meta retries
// webhook calls that don't get a fast 200 response.
async function recordIncoming({ conversationId, senderPhone, text, whatsappMessageId, messageType = 'text' }) {
  if (whatsappMessageId) {
    const existing = await Message.findOne({ whatsappMessageId });
    if (existing) return { duplicate: true, message: existing };
  }

  const message = await Message.create({
    conversationId,
    senderType: 'customer',
    senderPhone,
    message: text,
    messageType,
    whatsappMessageId: whatsappMessageId || undefined,
    status: 'delivered'
  });

  const conversation = await touchAfterMessage(conversationId, { text, fromCustomer: true });
  return { duplicate: false, message, conversation };
}

// Outbound (owner/admin) message. Saved immediately as 'sending' so it shows
// up in the UI right away; the caller updates it to 'sent'/'failed' once the
// WhatsApp API call resolves.
async function recordOutgoing({ conversationId, senderPhone, text, senderType = 'owner', messageType = 'text' }) {
  const message = await Message.create({
    conversationId,
    senderType,
    senderPhone,
    message: text,
    messageType,
    status: 'sending'
  });

  const conversation = await touchAfterMessage(conversationId, { text, fromCustomer: false });
  return { message, conversation };
}

async function markSent(messageId, whatsappMessageId) {
  return Message.findByIdAndUpdate(
    messageId,
    { $set: { status: 'sent', whatsappMessageId: whatsappMessageId || undefined } },
    { returnDocument: 'after' }
  );
}

async function markFailed(messageId) {
  return Message.findByIdAndUpdate(messageId, { $set: { status: 'failed' } }, { returnDocument: 'after' });
}

// Meta delivery-status webhook events (sent/delivered/read/failed) reference
// the outbound message by its wamid.
async function updateStatusByWhatsAppId(whatsappMessageId, status) {
  if (!whatsappMessageId) return null;
  return Message.findOneAndUpdate(
    { whatsappMessageId },
    { $set: { status } },
    { returnDocument: 'after' }
  );
}

async function listMessages(conversationId, { limit = 200 } = {}) {
  return Message.find({ conversationId }).sort({ createdAt: 1 }).limit(limit);
}

module.exports = {
  recordIncoming,
  recordOutgoing,
  markSent,
  markFailed,
  updateStatusByWhatsAppId,
  listMessages
};
