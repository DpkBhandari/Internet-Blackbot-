const { verifyAccess } = require('../utils/jwt');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

exports.authenticate = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) throw new ApiError(401, 'No auth token');
  const token = header.slice(7);
  let payload;
  try { payload = verifyAccess(token); } catch { throw new ApiError(401, 'Invalid or expired token'); }
  const user = await User.findById(payload.sub).select('-password -refreshTokens');
  if (!user) throw new ApiError(401, 'User not found');
  if (!user.isActive) throw new ApiError(401, 'Account suspended');
  req.user = user;
  next();
});

exports.authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) throw new ApiError(403, 'Insufficient permissions');
  next();
};
