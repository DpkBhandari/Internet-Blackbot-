const asyncHandler = require('../utils/asyncHandler');
const Notification = require('../models/Notification');
const notifService = require('../services/notification.service');

exports.list = asyncHandler(async (req, res) => {
  const { page = 1, limit = 30, unread } = req.query;
  const filter = { user: req.user._id };
  if (unread === 'true') filter.read = false;
  const [items, total, unreadCount] = await Promise.all([
    Notification.find(filter).sort('-createdAt').skip((page - 1) * Number(limit)).limit(Number(limit)).lean(),
    Notification.countDocuments(filter),
    Notification.countDocuments({ user: req.user._id, read: false }),
  ]);
  res.json({ items, total, unreadCount, page: Number(page), limit: Number(limit) });
});

exports.read = asyncHandler(async (req, res) => {
  const n = await notifService.markRead(req.params.id, req.user._id);
  if (!n) return res.status(404).json({ error: 'Not found' });
  res.json(n);
});

exports.readAll = asyncHandler(async (req, res) => {
  await notifService.markAllRead(req.user._id);
  res.json({ ok: true });
});
