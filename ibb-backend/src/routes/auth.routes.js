const r = require('express').Router();
const c = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth');
const { authLimiter } = require('../middlewares/rateLimit');
const validate = require('../middlewares/validate');
const v = require('../validators/auth.validator');

r.post('/register',       authLimiter, validate(v.registerSchema),       c.register);
r.post('/login',          authLimiter, validate(v.loginSchema),           c.login);
r.post('/refresh',                     validate(v.refreshSchema),          c.refresh);
r.post('/logout',         authenticate,                                    c.logout);
r.post('/forgot-password',authLimiter,                                    c.forgot);
r.post('/reset-password',                                                  c.reset);
r.get('/me',              authenticate,                                    c.me);
r.delete('/delete',       authenticate,                                    c.deleteAccount);
module.exports = r;
