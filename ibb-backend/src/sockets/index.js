const { Server } = require('socket.io');
const { verifyAccess } = require('../utils/jwt');
const logger = require('../utils/logger');

let io = null;

// Map userId -> Set of socket IDs
const userSockets = new Map();

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: (process.env.CLIENT_ORIGIN || '*').split(','),
      credentials: true,
    },
    pingTimeout: 60000,
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');
    if (!token) return next(new Error('Missing auth token'));
    try {
      const payload = verifyAccess(token);
      socket.userId = payload.sub;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const uid = socket.userId;
    if (!userSockets.has(uid)) userSockets.set(uid, new Set());
    userSockets.get(uid).add(socket.id);
    logger.info(`Socket connected: ${uid} (${socket.id})`);

    socket.join(`user:${uid}`);

    socket.on('disconnect', () => {
      userSockets.get(uid)?.delete(socket.id);
      if (!userSockets.get(uid)?.size) userSockets.delete(uid);
      logger.info(`Socket disconnected: ${uid} (${socket.id})`);
    });
  });

  logger.info('Socket.IO initialized');
  return io;
}

function emitToUser(userId, event, data) {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, data);
}

function getIO() { return io; }

module.exports = { initSocket, emitToUser, getIO };
