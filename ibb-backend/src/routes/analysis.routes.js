const r = require('express').Router();
const c = require('../controllers/analysis.controller');
const { authenticate } = require('../middlewares/auth');
r.use(authenticate);
r.get('/',           c.list);
r.get('/:id',        c.get);
r.get('/:id/summary',c.summary);
module.exports = r;
