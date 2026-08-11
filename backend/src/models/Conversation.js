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
  unreadCount: { type: Number, default: 0 },
  lastMessage: { type: String, default: '' },
  lastMessageAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Search (name/phone/device) is done with case-insensitive regex in the
// controller, not a $text index — $text only matches whole tokens, which
// breaks partial phone-number searches like "9004".

module.exports = mongoose.models.Conversation || mongoose.model('Conversation', conversationSchema);
