const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
  senderType: { type: String, enum: ['customer', 'owner', 'system'], required: true },
  senderPhone: { type: String, default: '' },
  message: { type: String, required: true },
  // 'text' only for now — kept as a field (not hardcoded) so images/documents/
  // audio/location can be added later without a schema migration.
  messageType: { type: String, enum: ['text', 'image', 'document', 'audio', 'location'], default: 'text' },
  // Meta's wamid. Sparse+unique: outbound messages get this only after Meta's
  // API responds, inbound messages get it immediately from the webhook payload —
  // used to dedupe retried webhook deliveries.
  whatsappMessageId: { type: String, default: undefined },
  status: { type: String, enum: ['sending', 'sent', 'delivered', 'read', 'failed'], default: 'sending' }
}, { timestamps: { createdAt: true, updatedAt: false } });

messageSchema.index({ whatsappMessageId: 1 }, { unique: true, sparse: true });

module.exports = mongoose.models.Message || mongoose.model('Message', messageSchema);
