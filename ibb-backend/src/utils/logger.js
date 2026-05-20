const winston = require('winston');
const path = require('path');
const fs = require('fs');

const logsDir = path.resolve('./logs');
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message }) => `${timestamp} ${level}: ${message}`)
      ),
    }),
    new winston.transports.File({ filename: path.join(logsDir, 'error.log'), level: 'error', maxsize: 5 * 1024 * 1024, maxFiles: 5 }),
    new winston.transports.File({ filename: path.join(logsDir, 'combined.log'), maxsize: 10 * 1024 * 1024, maxFiles: 10 }),
  ],
});

// DB transport — store logs in MongoDB if available
logger.on('data', async (log) => {
  try {
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) return;
    const Log = require('../models/Log');
    await Log.create({ level: log.level, message: log.message, meta: log.meta, timestamp: new Date(log.timestamp) });
  } catch { /* don't log errors here */ }
});

module.exports = logger;
