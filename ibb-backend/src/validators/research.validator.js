const { z } = require('zod');
exports.createResearchSchema = z.object({
  title: z.string().trim().min(1).max(255),
  description: z.string().max(5000).optional(),
  topic: z.string().max(255).optional(),
  tags: z.array(z.string().max(60)).max(20).optional(),
});
exports.searchSchema = z.object({
  q: z.string().max(255).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.string().optional(),
});
