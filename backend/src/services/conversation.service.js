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

const REPAIR_STAGES = ['new_lead', 'inspection', 'estimate_sent', 'repair_approved', 'repair_in_progress', 'ready_for_pickup', 'completed'];

async function setRepairStage(id, repairStage) {
  if (!REPAIR_STAGES.includes(repairStage)) throw new Error(`Invalid repair stage: ${repairStage}`);
  return Conversation.findByIdAndUpdate(id, { $set: { repairStage } }, { returnDocument: 'after' });
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
    conversation.lastCustomerMessageAt = new Date();
    if (conversation.status === 'closed') conversation.status = 'open';
  }
  await conversation.save();
  return conversation;
}

const WHATSAPP_WINDOW_MS = 24 * 60 * 60 * 1000;

// A conversation's 24h free-reply window closes at lastCustomerMessageAt+24h.
// "Expiring soon" = that close time is still in the future, but within
// EXPIRING_SOON_MINUTES (default 120) from now — expressed as a range on
// lastCustomerMessageAt so it's a plain indexed-field query, no per-document
// computation needed.
function expiringSoonRange() {
  const now = Date.now();
  const thresholdMs = (Number(process.env.EXPIRING_SOON_MINUTES) || 120) * 60000;
  return { $gt: new Date(now - WHATSAPP_WINDOW_MS), $lte: new Date(now - WHATSAPP_WINDOW_MS + thresholdMs) };
}

async function listConversations({ status, search, repairStage, expiringSoon } = {}) {
  const query = {};
  if (expiringSoon) {
    query.status = 'open';
    query.lastCustomerMessageAt = expiringSoonRange();
  } else if (status && status !== 'all') {
    query.status = status;
  }
  if (repairStage && repairStage !== 'all') query.repairStage = repairStage;
  if (search) {
    const regex = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    query.$or = [{ customerName: regex }, { customerPhone: regex }, { deviceModel: regex }, { deviceBrand: regex }, { code: regex }];
  }
  return Conversation.find(query).sort({ lastMessageAt: -1 });
}

async function dashboardSummary() {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [unread, active, closed, total, today, expiringSoon] = await Promise.all([
    Conversation.countDocuments({ unreadCount: { $gt: 0 } }),
    Conversation.countDocuments({ status: 'open' }),
    Conversation.countDocuments({ status: 'closed' }),
    Conversation.countDocuments({}),
    Conversation.countDocuments({ createdAt: { $gte: startOfToday } }),
    Conversation.countDocuments({ status: 'open', lastCustomerMessageAt: expiringSoonRange() })
  ]);

  return { unread, active, closed, total, today, expiringSoon };
}

module.exports = {
  normalizePhone,
  getOrCreateConversation,
  getConversationByCode,
  getConversationById,
  updateConversation,
  setStatus,
  setRepairStage,
  markAsRead,
  touchAfterMessage,
  listConversations,
  dashboardSummary
};
