const { ZodError } = require('zod');

module.exports = function validate(schema) {
  return async (req, res, next) => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(422).json({ error: err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ') });
      }
      next(err);
    }
  };
};
