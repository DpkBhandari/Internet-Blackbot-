const r = require('express').Router();
const c = require('../controllers/report.controller');
const { authenticate } = require('../middlewares/auth');
r.use(authenticate);
r.get('/',          c.list);
r.post('/',         c.generate);
r.get('/:id',       c.get);
r.get('/:id/export',c.download);
module.exports = r;
