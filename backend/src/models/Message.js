const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
  senderType: { type: String, enum: ['customer', 'owner', 'system'], required: true },
  senderPhone: { type: String, default: '' },
  message: { type: String, required: true },
  messageType: { type: String, enum: ['text', 'image', 'video', 'document', 'audio', 'location'], default: 'text' },
  // Meta's wamid. Sparse+unique: outbound messages get this only after Meta's
  // API responds, inbound messages get it immediately from the webhook payload —
  // used to dedupe retried webhook deliveries.
  whatsappMessageId: { type: String, default: undefined },
  status: { type: String, enum: ['sending', 'sent', 'delivered', 'read', 'failed'], default: 'sending' },
  // Media metadata only — the actual bytes are never stored here. WhatsApp
  // media is fetched on demand via a short-lived signed URL resolved from
  // mediaId (see whatsapp.service.getMediaUrl), re-resolved on every view.
  mediaId: { type: String, default: undefined },
  mediaMimeType: { type: String, default: undefined },
  mediaFilename: { type: String, default: undefined },
  mediaCaption: { type: String, default: undefined }
}, { timestamps: { createdAt: true, updatedAt: false } });

messageSchema.index({ whatsappMessageId: 1 }, { unique: true, sparse: true });

module.exports = mongoose.models.Message || mongoose.model('Message', messageSchema);
