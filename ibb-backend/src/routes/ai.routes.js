const r = require('express').Router();
const c = require('../controllers/ai.controller');
const { authenticate } = require('../middlewares/auth');
r.use(authenticate);
r.post('/chat',          c.chat);
r.get('/history',        c.history);
r.get('/insights',       c.insights);
r.get('/recommendations',c.recommendations);
module.exports = r;
