const { z } = require('zod');
exports.askSchema = z.object({
  message: z.string().min(1).max(4000),
  chatId: z.string().optional(),
  contextResearch: z.string().optional(),
});
