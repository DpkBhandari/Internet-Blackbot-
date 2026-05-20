const { z } = require('zod');

exports.registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});
exports.loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
exports.refreshSchema = z.object({
  refreshToken: z.string().optional(),
}).passthrough();
