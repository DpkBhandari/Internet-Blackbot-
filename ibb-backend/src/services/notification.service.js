const Notification = require('../models/Notification');
const { emitToUser } = require('../sockets');
const { EVENTS } = require('../config/constants');

async function create({ userId, title, message, type = 'info', link = '' }) {
  const n = await Notification.create({ user: userId, title, message, type, link });
  try { emitToUser(userId.toString(), EVENTS.NOTIFICATION, { id: n._id, title, message, type, link, createdAt: n.createdAt }); }
  catch (_) {}
  return n;
}

async function markRead(notificationId, userId) {
  return Notification.findOneAndUpdate({ _id: notificationId, user: userId }, { read: true, readAt: new Date() }, { new: true });
}

async function markAllRead(userId) {
  return Notification.updateMany({ user: userId, read: false }, { read: true, readAt: new Date() });
}

module.exports = { create, markRead, markAllRead };
