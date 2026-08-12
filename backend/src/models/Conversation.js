const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true }, // human-readable RT-XXXX code, used by the legacy owner-replies-from-their-own-WhatsApp fallback
  customerName: { type: String, default: 'Customer' },
  customerPhone: { type: String, required: true, index: true }, // normalized, digits only, e.g. 91XXXXXXXXXX
  customerWhatsAppId: { type: String, index: true }, // Meta's wa_id — same as customerPhone in practice, kept separate per spec
  deviceBrand: { type: String, default: '' },
  deviceModel: { type: String, default: '' },
  issue: { type: String, default: '' },
  status: { type: String, enum: ['open', 'closed'], default: 'open', index: true }, // conversation open/closed, for the admin panel
  stage: { type: String, default: 'lead' }, // lead lifecycle marker (lead / booking_confirmed / ...), separate from open/closed
  // Repair workflow stage — deliberately separate from `stage` above (which
  // tracks lead/booking lifecycle) so neither concern breaks the other.
  repairStage: {
    type: String,
    enum: ['new_lead', 'inspection', 'estimate_sent', 'repair_approved', 'repair_in_progress', 'ready_for_pickup', 'completed'],
    default: 'new_lead'
  },
  unreadCount: { type: Number, default: 0 },
  lastMessage: { type: String, default: '' },
  lastMessageAt: { type: Date, default: Date.now },
  // Timestamp of the most recent message FROM the customer specifically
  // (unlike lastMessageAt, which updates on owner messages too) — this is
  // what the WhatsApp 24h customer-service window is actually measured
  // from, and lets "expiring soon" be queried cheaply across all
  // conversations instead of loading every message history.
  lastCustomerMessageAt: { type: Date, default: null }
}, { timestamps: true });

// Search (name/phone/device) is done with case-insensitive regex in the
// controller, not a $text index — $text only matches whole tokens, which
// breaks partial phone-number searches like "9004".

module.exports = mongoose.models.Conversation || mongoose.model('Conversation', conversationSchema);
