const fs = require('fs');
const path = require('path');

const dataDirectory = path.join(__dirname, '../../data');
const dataFile = path.join(dataDirectory, 'conversations.json');

function normalizePhone(value) {
  const digits = String(value || '').replace(/\D/g, '');
  return digits.length === 10 ? `91${digits}` : digits;
}

function readStore() {
  try {
    if (!fs.existsSync(dataFile)) return { conversations: [], processedMessageIds: [] };
    return JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  } catch (error) {
    console.error('Could not read conversation store:', error.message);
    return { conversations: [], processedMessageIds: [] };
  }
}

function writeStore(store) {
  fs.mkdirSync(dataDirectory, { recursive: true });
  fs.writeFileSync(dataFile, JSON.stringify(store, null, 2), 'utf8');
}

function makeCode() {
  return `RT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

function getOrCreateConversation(lead) {
  const store = readStore();
  const customerPhone = normalizePhone(lead.phone);
  let conversation = store.conversations.find((item) => item.customerPhone === customerPhone);

  if (!conversation) {
    conversation = {
      code: makeCode(),
      customerPhone,
      customerName: lead.name || 'Customer',
      device: `${lead.brand || ''} ${lead.model || ''}`.trim(),
      issue: lead.issue || '',
      status: 'lead',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    store.conversations.push(conversation);
  } else {
    conversation.customerName = lead.name || conversation.customerName;
    conversation.device = `${lead.brand || ''} ${lead.model || ''}`.trim() || conversation.device;
    conversation.issue = lead.issue || conversation.issue;
    conversation.updatedAt = new Date().toISOString();
  }

  writeStore(store);
  return conversation;
}

function getConversationByCode(code) {
  const store = readStore();
  return store.conversations.find((item) => item.code.toUpperCase() === String(code || '').toUpperCase());
}

function updateConversation(code, changes) {
  const store = readStore();
  const conversation = store.conversations.find((item) => item.code.toUpperCase() === String(code || '').toUpperCase());
  if (!conversation) return null;
  Object.assign(conversation, changes, { updatedAt: new Date().toISOString() });
  writeStore(store);
  return conversation;
}

function addMessage(code, direction, text, messageId) {
  const store = readStore();
  const conversation = store.conversations.find((item) => item.code.toUpperCase() === String(code || '').toUpperCase());
  if (!conversation) return null;
  conversation.messages.push({ direction, text, messageId: messageId || null, at: new Date().toISOString() });
  conversation.messages = conversation.messages.slice(-50);
  conversation.updatedAt = new Date().toISOString();
  writeStore(store);
  return conversation;
}

function isDuplicateMessage(messageId) {
  if (!messageId) return false;
  const store = readStore();
  if (store.processedMessageIds.includes(messageId)) return true;
  store.processedMessageIds.push(messageId);
  store.processedMessageIds = store.processedMessageIds.slice(-500);
  writeStore(store);
  return false;
}

module.exports = { normalizePhone, getOrCreateConversation, getConversationByCode, updateConversation, addMessage, isDuplicateMessage };
