const conversationService = require('../services/conversation.service');
const messageService = require('../services/message.service');
const { sendTextMessage, sendTemplateMessage } = require('../services/whatsapp.service');
const { getIO } = require('../realtime/socket');
const { listTemplates, findTemplate } = require('../config/templates');

async function dashboard(req, res) {
  const summary = await conversationService.dashboardSummary();
  res.json({ success: true, summary });
}

async function list(req, res) {
  const { status, search, repairStage, expiringSoon } = req.query;
  const conversations = await conversationService.listConversations({
    status,
    search,
    repairStage,
    expiringSoon: expiringSoon === 'true'
  });
  res.json({ success: true, conversations });
}

async function getOne(req, res) {
  const conversation = await conversationService.getConversationById(req.params.id);
  if (!conversation) return res.status(404).json({ success: false, message: 'Conversation not found.' });

  const messages = await messageService.listMessages(conversation._id);
  if (conversation.unreadCount > 0) {
    await conversationService.markAsRead(conversation._id);
    conversation.unreadCount = 0;
    getIO().emit('conversation:updated', { conversation });
  }

  res.json({ success: true, conversation, messages });
}

async function sendMessage(req, res) {
  const { text } = req.body || {};
  if (!text || !text.trim()) {
    return res.status(400).json({ success: false, message: 'Message text is required.' });
  }

  const conversation = await conversationService.getConversationById(req.params.id);
  if (!conversation) return res.status(404).json({ success: false, message: 'Conversation not found.' });

  const { message } = await messageService.recordOutgoing({
    conversationId: conversation._id,
    senderPhone: process.env.OWNER_PHONE || '',
    text: text.trim()
  });
  getIO().emit('message:new', { conversation, message });

  try {
    const result = await sendTextMessage(conversation.customerPhone, text.trim());
    const whatsappMessageId = result?.messages?.[0]?.id;
    const updated = await messageService.markSent(message._id, whatsappMessageId);
    getIO().emit('message:status', { messageId: message._id, conversationId: conversation._id, status: 'sent' });
    return res.json({ success: true, message: updated });
  } catch (error) {
    await messageService.markFailed(message._id);
    getIO().emit('message:status', { messageId: message._id, conversationId: conversation._id, status: 'failed' });
    // Most common cause: WhatsApp's 24h customer-service window has closed,
    // which requires an approved template — see whatsapp.service.sendTemplateMessage.
    return res.status(502).json({ success: false, message: error.message });
  }
}

async function setStatus(req, res) {
  const { status } = req.body || {};
  try {
    const conversation = await conversationService.setStatus(req.params.id, status);
    if (!conversation) return res.status(404).json({ success: false, message: 'Conversation not found.' });
    getIO().emit('conversation:updated', { conversation });
    res.json({ success: true, conversation });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}

async function updateRepairStage(req, res) {
  const { repairStage } = req.body || {};
  try {
    const conversation = await conversationService.setRepairStage(req.params.id, repairStage);
    if (!conversation) return res.status(404).json({ success: false, message: 'Conversation not found.' });
    getIO().emit('conversation:updated', { conversation });
    res.json({ success: true, conversation });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}

function templates(req, res) {
  res.json({ success: true, templates: listTemplates() });
}

// Fallback for when the 24h free-reply window has closed — same
// record/broadcast/status pattern as sendMessage, but via sendTemplateMessage.
// Only templates registered in config/templates.js can be sent; this never
// attempts an unapproved template name against the Meta API.
async function sendTemplate(req, res) {
  const { templateName, params } = req.body || {};
  const template = findTemplate(templateName);
  if (!template) {
    return res.status(400).json({ success: false, message: 'Unknown or unapproved template.' });
  }

  const conversation = await conversationService.getConversationById(req.params.id);
  if (!conversation) return res.status(404).json({ success: false, message: 'Conversation not found.' });

  const parameters = Array.isArray(params) ? params : template.params.map(() => '');
  const previewText = `[Template: ${template.label}] ${parameters.join(' / ')}`;

  const { message } = await messageService.recordOutgoing({
    conversationId: conversation._id,
    senderPhone: process.env.OWNER_PHONE || '',
    text: previewText
  });
  getIO().emit('message:new', { conversation, message });

  try {
    const result = await sendTemplateMessage(conversation.customerPhone, template.name, parameters);
    const whatsappMessageId = result?.messages?.[0]?.id;
    const updated = await messageService.markSent(message._id, whatsappMessageId);
    getIO().emit('message:status', { messageId: message._id, conversationId: conversation._id, status: 'sent' });
    return res.json({ success: true, message: updated });
  } catch (error) {
    await messageService.markFailed(message._id);
    getIO().emit('message:status', { messageId: message._id, conversationId: conversation._id, status: 'failed' });
    return res.status(502).json({ success: false, message: error.message });
  }
}

module.exports = { dashboard, list, getOne, sendMessage, setStatus, updateRepairStage, templates, sendTemplate };
