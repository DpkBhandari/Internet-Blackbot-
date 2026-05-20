const Log = require('../models/Log');
module.exports = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    Log.create({
      level: res.statusCode >= 500 ? 'error' : 'info',
      message: 'request',
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Date.now() - start,
      user: req.user?._id,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    }).catch(() => {});
  });
  next();
};
