const r = require('express').Router();
const c = require('../controllers/notification.controller');
const { authenticate } = require('../middlewares/auth');
r.use(authenticate);
r.get('/',          c.list);
r.patch('/read-all', c.readAll);
r.patch('/:id/read', c.read);
module.exports = r;
