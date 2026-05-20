const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');
const Research = require('../models/Research');
const Analysis = require('../models/Analysis');
const Report = require('../models/Report');
const Notification = require('../models/Notification');
const Invite = require('../models/Invite');
const Log = require('../models/Log');
const ApiError = require('../utils/ApiError');
const crypto = require('crypto');

exports.stats = asyncHandler(async (req, res) => {
  const [users, research, analyses, reports] = await Promise.all([
    User.countDocuments(),
    Research.countDocuments(),
    Analysis.countDocuments(),
    Report.countDocuments(),
  ]);
  res.json({ users, research, analyses, reports });
});

exports.listUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, q, role } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (q) filter.$or = [{ name: { $regex: q, $options: 'i' } }, { email: { $regex: q, $options: 'i' } }];
  const skip = (Number(page)-1)*Number(limit);
  const [items, total] = await Promise.all([
    User.find(filter).select('-password -refreshTokens').sort('-createdAt').skip(skip).limit(Number(limit)).lean(),
    User.countDocuments(filter),
  ]);
  res.json({ items, total, page: Number(page), limit: Number(limit) });
});

exports.updateUser = asyncHandler(async (req, res) => {
  const { role, isActive } = req.body;
  const update = {};
  if (role) update.role = role;
  if (isActive !== undefined) update.isActive = isActive;
  const u = await User.findByIdAndUpdate(req.params.id, update, { new: true }).select('-password -refreshTokens');
  if (!u) throw new ApiError(404, 'User not found');
  res.json(u);
});

exports.deleteUser = asyncHandler(async (req, res) => {
  if (req.params.id === req.user._id.toString()) throw new ApiError(400, 'Cannot delete yourself');
  await User.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

exports.createInvite = asyncHandler(async (req, res) => {
  const { email, role = 'user' } = req.body;
  if (!email) throw new ApiError(400, 'email required');
  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(409, 'User already exists');
  const code = crypto.randomBytes(20).toString('hex');
  const invite = await Invite.create({ email, role, code, createdBy: req.user._id, expiresAt: new Date(Date.now() + 7*24*60*60*1000) });
  res.status(201).json(invite);
});

exports.listInvites = asyncHandler(async (req, res) => {
  const items = await Invite.find().sort('-createdAt').populate('createdBy','name email').lean();
  res.json(items);
});

exports.revokeInvite = asyncHandler(async (req, res) => {
  await Invite.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

exports.logs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 100, level } = req.query;
  const filter = {};
  if (level) filter.level = level;
  const skip = (Number(page)-1)*Number(limit);
  const [items, total] = await Promise.all([
    Log.find(filter).sort('-timestamp').skip(skip).limit(Number(limit)).lean(),
    Log.countDocuments(filter),
  ]);
  res.json({ items, total });
});

exports.health = asyncHandler(async (req, res) => {
  const mongoose = require('mongoose');
  const { getRedis } = require('../config/redis');
  const redis = getRedis();
  let redisPing = false;
  try { if (redis) { await redis.ping(); redisPing = true; } } catch {}
  res.json({
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    redis: redisPing ? 'connected' : 'disconnected',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString(),
  });
});

exports.analytics = asyncHandler(async (req, res) => {
  const [usersByDay, analysisByStatus] = await Promise.all([
    User.aggregate([{ $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } }, { $sort: { _id: 1 } }, { $limit: 30 }]),
    Analysis.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
  ]);
  res.json({ usersByDay, analysisByStatus });
});
