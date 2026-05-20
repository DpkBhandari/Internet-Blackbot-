const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

exports.notFound = (req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.path}`));
};

exports.errorHandler = (err, req, res, next) => {
  let status = err.status || err.statusCode || 500;
  let message = err.message || 'Internal server error';

  // Mongoose validation
  if (err.name === 'ValidationError') {
    status = 422;
    message = Object.values(err.errors).map(e => e.message).join(', ');
  }
  // Mongoose duplicate key
  if (err.code === 11000) {
    status = 409;
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    message = `${field} already exists`;
  }
  // JWT errors
  if (err.name === 'JsonWebTokenError') { status = 401; message = 'Invalid token'; }
  if (err.name === 'TokenExpiredError') { status = 401; message = 'Token expired'; }
  // Zod errors
  if (err.name === 'ZodError') {
    status = 422;
    message = err.errors?.map(e => `${e.path.join('.')}: ${e.message}`).join(', ') || 'Validation failed';
  }

  if (status >= 500) logger.error(`${req.method} ${req.path} → ${status}: ${message}`, { stack: err.stack });

  res.status(status).json({ error: message, ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }) });
};
