const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const python = require('../services/python.service');
const AIChat = require('../models/AIChat');
const AIHistory = require('../models/AIHistory');

exports.chat = asyncHandler(async (req, res) => {
  const { message, researchId, sessionId } = req.body;
  if (!message?.trim()) throw new ApiError(400, 'Message required');

  let context = '';
  if (researchId) {
    const Research = require('../models/Research');
    const r = await Research.findOne({ _id: researchId, user: req.user._id }).select('+extractedText');
    if (r) context = (r.extractedText || '').slice(0, 8000);
  }

  const reply = await python.chat(message, context);

  await AIHistory.create({ user: req.user._id, sessionId: sessionId || 'default', role: 'user', content: message });
  await AIHistory.create({ user: req.user._id, sessionId: sessionId || 'default', role: 'assistant', content: reply });

  res.json({ reply, sessionId: sessionId || 'default' });
});

exports.history = asyncHandler(async (req, res) => {
  const { sessionId, page = 1, limit = 50 } = req.query;
  const filter = { user: req.user._id };
  if (sessionId) filter.sessionId = sessionId;
  const items = await AIHistory.find(filter)
    .sort('-createdAt').skip((Number(page)-1)*Number(limit)).limit(Number(limit)).lean();
  res.json({ items, page: Number(page), limit: Number(limit) });
});

exports.insights = asyncHandler(async (req, res) => {
  const Analysis = require('../models/Analysis');
  const recent = await Analysis.find({ user: req.user._id, status: 'READY' })
    .sort('-createdAt').limit(5).lean();
  const insights = recent.map(a => ({
    id: a._id, summary: a.summary, credibilityScore: a.credibilityScore,
    misinformationScore: a.misinformationScore, sentiment: a.sentiment,
  }));
  res.json({ insights });
});

exports.recommendations = asyncHandler(async (req, res) => {
  const Research = require('../models/Research');
  const recent = await Research.find({ user: req.user._id }).sort('-createdAt').limit(10)
    .select('title topic tags').lean();
  const topics = [...new Set(recent.flatMap(r => [r.topic, ...(r.tags || [])]).filter(Boolean))];
  res.json({ recommendations: topics.slice(0, 8).map(t => ({ topic: t, reason: 'Related to your recent research' })) });
});
