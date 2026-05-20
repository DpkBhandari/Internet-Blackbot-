const asyncHandler = require('../utils/asyncHandler');
const auth = require('../services/auth.service');

exports.register = asyncHandler(async (req, res) => res.status(201).json(await auth.register(req.body)));
exports.login    = asyncHandler(async (req, res) => res.json(await auth.login(req.body)));
exports.refresh  = asyncHandler(async (req, res) => res.json(await auth.refresh(req.body)));
exports.logout   = asyncHandler(async (req, res) => {
  await auth.logout({ userId: req.user?._id, refreshToken: req.body.refreshToken });
  res.clearCookie('refreshToken');
  res.json({ ok: true });
});
exports.forgot   = asyncHandler(async (req, res) => res.json(await auth.forgotPassword(req.body)));
exports.reset    = asyncHandler(async (req, res) => res.json(await auth.resetPassword(req.body)));
exports.me       = asyncHandler(async (req, res) => res.json(auth.sanitize(req.user)));
exports.deleteAccount = asyncHandler(async (req, res) => {
  res.json(await auth.deleteAccount({ userId: req.user._id, password: req.body.password }));
});
