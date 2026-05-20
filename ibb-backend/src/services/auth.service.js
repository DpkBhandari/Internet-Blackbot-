const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { signAccess, signRefresh, verifyRefresh } = require('../utils/jwt');
const ApiError = require('../utils/ApiError');
const userRepo = require('../repositories/user.repo');
const User = require('../models/User');
const logger = require('../utils/logger');

// ── Nodemailer transport ─────────────────────────────────────────────────────
let transporter = null;
function getTransporter() {
  if (transporter) return transporter;
  if (!process.env.SMTP_HOST) {
    logger.warn('SMTP not configured — email sending disabled');
    return null;
  }
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: parseInt(process.env.SMTP_PORT || '587', 10) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  return transporter;
}

async function sendMail(to, subject, html) {
  const t = getTransporter();
  if (!t) { logger.warn(`Email not sent to ${to} (SMTP unconfigured)`); return; }
  try {
    await t.sendMail({ from: process.env.MAIL_FROM || 'no-reply@ibb.local', to, subject, html });
    logger.info(`Email sent to ${to}: ${subject}`);
  } catch (e) {
    logger.error(`Email send failed: ${e.message}`);
  }
}

// ── Token helpers ────────────────────────────────────────────────────────────
const tokenPair = (user) => ({
  accessToken: signAccess({ sub: user._id.toString(), role: user.role }),
  refreshToken: signRefresh({ sub: user._id.toString() }),
});

// ── Auth methods ─────────────────────────────────────────────────────────────
exports.register = async ({ name, email, password }) => {
  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(409, 'Email already registered');
  const user = await userRepo.create({ name, email, password });
  const tokens = tokenPair(user);
  user.refreshTokens = [tokens.refreshToken];
  await user.save();
  return { user: sanitize(user), ...tokens };
};

exports.login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password +refreshTokens');
  if (!user) throw new ApiError(401, 'Invalid credentials');
  if (!user.isActive) throw new ApiError(401, 'Account suspended. Contact support.');
  const ok = await user.comparePassword(password);
  if (!ok) throw new ApiError(401, 'Invalid credentials');
  const tokens = tokenPair(user);
  user.refreshTokens = [...(user.refreshTokens || []).slice(-9), tokens.refreshToken];
  user.lastLoginAt = new Date();
  await user.save();
  logger.info(`Login: ${email} (${user._id})`);
  return { user: sanitize(user), ...tokens };
};

exports.refresh = async ({ refreshToken }) => {
  if (!refreshToken) throw new ApiError(401, 'Refresh token required');
  let payload;
  try { payload = verifyRefresh(refreshToken); } catch { throw new ApiError(401, 'Invalid refresh token'); }
  const user = await User.findById(payload.sub).select('+refreshTokens');
  if (!user) throw new ApiError(401, 'User not found');
  if (!user.isActive) throw new ApiError(401, 'Account suspended');
  if (!(user.refreshTokens || []).includes(refreshToken)) throw new ApiError(401, 'Refresh token revoked');
  const tokens = tokenPair(user);
  user.refreshTokens = user.refreshTokens.filter(t => t !== refreshToken).concat(tokens.refreshToken);
  await user.save();
  return tokens;
};

exports.logout = async ({ userId, refreshToken }) => {
  const user = await User.findById(userId).select('+refreshTokens');
  if (!user) return;
  if (refreshToken) {
    user.refreshTokens = (user.refreshTokens || []).filter(t => t !== refreshToken);
  } else {
    user.refreshTokens = [];
  }
  await user.save();
};

exports.forgotPassword = async ({ email }) => {
  const user = await User.findOne({ email });
  if (!user) return { ok: true }; // Don't reveal existence
  const token = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
  user.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 min
  await user.save();

  const resetUrl = `${process.env.CLIENT_ORIGIN || 'http://localhost:5173'}/reset-password?token=${token}`;
  await sendMail(email, 'Reset your Internet Black Box password', `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f9f9fc; border-radius: 12px;">
      <h2 style="color: #1a1a2e; margin-bottom: 8px;">Reset your password</h2>
      <p style="color: #666; margin-bottom: 24px;">Click the button below to reset your password. This link expires in 30 minutes.</p>
      <a href="${resetUrl}" style="display: inline-block; background: #4f46e5; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">Reset Password</a>
      <p style="color: #999; font-size: 12px; margin-top: 24px;">If you didn't request this, you can safely ignore this email.</p>
    </div>
  `);
  logger.info(`Password reset requested: ${email}`);
  return { ok: true };
};

exports.resetPassword = async ({ token, password }) => {
  if (!token || !password) throw new ApiError(400, 'Token and password required');
  const hashed = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({ resetPasswordToken: hashed, resetPasswordExpires: { $gt: new Date() } }).select('+password +refreshTokens');
  if (!user) throw new ApiError(400, 'Invalid or expired reset token');
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  user.refreshTokens = [];
  await user.save();
  logger.info(`Password reset: ${user.email}`);
  return { ok: true };
};

exports.deleteAccount = async ({ userId, password }) => {
  const user = await User.findById(userId).select('+password');
  if (!user) throw new ApiError(404, 'User not found');
  const ok = await user.comparePassword(password);
  if (!ok) throw new ApiError(403, 'Incorrect password');
  await user.deleteOne();
  return { ok: true };
};

function sanitize(u) {
  return { id: u._id, name: u.name, email: u.email, role: u.role, avatar: u.avatar, createdAt: u.createdAt };
}
exports.sanitize = sanitize;
