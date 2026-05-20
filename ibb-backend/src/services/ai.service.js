const AIChat = require('../models/AIChat');
const AIHistory = require('../models/AIHistory');
const python = require('./python.service');
const { emitToUser } = require('../sockets');
const { EVENTS } = require('../config/constants');
const Research = require('../models/Research');

async function getOrCreateChat({ chatId, userId, title, contextResearch }) {
  if (chatId) {
    const c = await AIChat.findOne({ _id: chatId, user: userId });
    if (c) return c;
  }
  return AIChat.create({ user: userId, title: title || 'New chat', contextResearch });
}

async function ask({ user, message, chatId, contextResearch }) {
  const chat = await getOrCreateChat({ chatId, userId: user._id, contextResearch });
  await AIHistory.create({ chat: chat._id, role: 'user', content: message });
  const history = await AIHistory.find({ chat: chat._id }).sort('createdAt').lean();
  const messages = [
    { role: 'system', content: 'You are the Internet Black Box research assistant. Use only verified information.' },
    ...history.map(h => ({ role: h.role, content: h.content })),
  ];
  if (contextResearch) {
    const r = await Research.findOne({ _id: contextResearch, user: user._id }).select('+extractedText title');
    if (r) messages.unshift({ role: 'system', content: `Context document: ${r.title}\n\n${(r.extractedText || '').slice(0, 8000)}` });
  }
  let full = '';
  try {
    full = await python.chatStream(messages, (chunk) => emitToUser(user._id.toString(), EVENTS.AI_STREAM, { chatId: chat._id, chunk }));
  } catch {
    const result = await python.chat(messages);
    full = result.content;
  }
  const saved = await AIHistory.create({ chat: chat._id, role: 'assistant', content: full });
  return { chatId: chat._id, message: saved };
}

module.exports = { ask, getOrCreateChat };
