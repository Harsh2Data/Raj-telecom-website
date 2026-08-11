const Conversation = require('../models/Conversation');

function normalizePhone(value) {
  const digits = String(value || '').replace(/\D/g, '');
  return digits.length === 10 ? `91${digits}` : digits;
}

function makeCode() {
  return `RT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

// Called from lead.service.js / booking.service.js at lead/booking creation,
// and from the webhook when a customer messages in. One conversation per
// customer phone number, reused across leads/bookings/messages.
async function getOrCreateConversation(lead) {
  const customerPhone = normalizePhone(lead.phone);
  let conversation = await Conversation.findOne({ customerPhone });

  if (!conversation) {
    conversation = await Conversation.create({
      code: makeCode(),
      customerPhone,
      customerWhatsAppId: customerPhone,
      customerName: lead.name || 'Customer',
      deviceBrand: lead.brand || '',
      deviceModel: lead.model || '',
      issue: lead.issue || '',
      status: 'open',
      stage: 'lead'
    });
  } else {
    if (lead.name) conversation.customerName = lead.name;
    if (lead.brand) conversation.deviceBrand = lead.brand;
    if (lead.model) conversation.deviceModel = lead.model;
    if (lead.issue) conversation.issue = lead.issue;
    await conversation.save();
  }

  return conversation;
}

async function getConversationByCode(code) {
  if (!code) return null;
  return Conversation.findOne({ code: String(code).toUpperCase() });
}

async function getConversationById(id) {
  return Conversation.findById(id);
}

// Generic field patch — e.g. lead.service.js/booking.service.js move a
// conversation's lifecycle forward with { stage: 'booking_confirmed' }.
// Deliberately separate from the open/closed `status` field used by the
// admin panel, so booking progress and admin triage don't collide.
async function updateConversation(code, changes) {
  return Conversation.findOneAndUpdate(
    { code: String(code || '').toUpperCase() },
    { $set: changes },
    { returnDocument: 'after' }
  );
}

async function setStatus(id, status) {
  if (!['open', 'closed'].includes(status)) throw new Error(`Invalid conversation status: ${status}`);
  return Conversation.findByIdAndUpdate(id, { $set: { status } }, { returnDocument: 'after' });
}

async function markAsRead(id) {
  return Conversation.findByIdAndUpdate(id, { $set: { unreadCount: 0 } }, { returnDocument: 'after' });
}

// Bumps preview fields shown in the conversation list, and — per spec test 5 —
// reopens a closed conversation when the customer messages again.
async function touchAfterMessage(conversationId, { text, fromCustomer }) {
  const update = {
    lastMessage: text,
    lastMessageAt: new Date()
  };
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) return null;

  conversation.lastMessage = text;
  conversation.lastMessageAt = new Date();
  if (fromCustomer) {
    conversation.unreadCount += 1;
    if (conversation.status === 'closed') conversation.status = 'open';
  }
  await conversation.save();
  return conversation;
}

async function listConversations({ status, search } = {}) {
  const query = {};
  if (status && status !== 'all') query.status = status;
  if (search) {
    const regex = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    query.$or = [{ customerName: regex }, { customerPhone: regex }, { deviceModel: regex }, { deviceBrand: regex }];
  }
  return Conversation.find(query).sort({ lastMessageAt: -1 });
}

async function dashboardSummary() {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [unread, active, closed, total, today] = await Promise.all([
    Conversation.countDocuments({ unreadCount: { $gt: 0 } }),
    Conversation.countDocuments({ status: 'open' }),
    Conversation.countDocuments({ status: 'closed' }),
    Conversation.countDocuments({}),
    Conversation.countDocuments({ createdAt: { $gte: startOfToday } })
  ]);

  return { unread, active, closed, total, today };
}

module.exports = {
  normalizePhone,
  getOrCreateConversation,
  getConversationByCode,
  getConversationById,
  updateConversation,
  setStatus,
  markAsRead,
  touchAfterMessage,
  listConversations,
  dashboardSummary
};
