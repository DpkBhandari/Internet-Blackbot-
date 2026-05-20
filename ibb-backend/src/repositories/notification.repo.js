const Notification = require('../models/Notification');
exports.create = (data) => Notification.create(data);
exports.list = (userId, opts) => Notification.find({ user: userId }).sort('-createdAt').skip(opts.skip).limit(opts.limit);
exports.markRead = (id, userId) => Notification.findOneAndUpdate({ _id: id, user: userId }, { readAt: new Date() }, { new: true });
exports.markAllRead = (userId) => Notification.updateMany({ user: userId, readAt: null }, { readAt: new Date() });
exports.unreadCount = (userId) => Notification.countDocuments({ user: userId, readAt: null });
