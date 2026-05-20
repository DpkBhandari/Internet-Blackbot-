const jwt = require('jsonwebtoken');

function getSecret(key, fallback) {
  const val = process.env[key];
  if (!val || val === fallback) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`FATAL: ${key} must be set in production`);
    }
    console.warn(`WARNING: ${key} not set — using insecure default`);
    return fallback;
  }
  return val;
}

const ACCESS_SECRET  = () => getSecret('JWT_ACCESS_SECRET',  'dev_access_secret_change_me');
const REFRESH_SECRET = () => getSecret('JWT_REFRESH_SECRET', 'dev_refresh_secret_change_me');

exports.signAccess = (payload) =>
  jwt.sign(payload, ACCESS_SECRET(), { expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m' });

exports.signRefresh = (payload) =>
  jwt.sign(payload, REFRESH_SECRET(), { expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d' });

exports.verifyAccess = (token) => jwt.verify(token, ACCESS_SECRET());
exports.verifyRefresh = (token) => jwt.verify(token, REFRESH_SECRET());
