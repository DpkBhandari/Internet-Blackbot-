const { z } = require('zod');
exports.inviteSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  role: z.enum(['USER','ADMIN']).default('USER'),
});
exports.updateUserSchema = z.object({
  role: z.enum(['USER','ADMIN']).optional(),
  isActive: z.boolean().optional(),
});
