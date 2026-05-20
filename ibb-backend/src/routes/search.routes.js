const r = require('express').Router();
const c = require('../controllers/search.controller');
const { authenticate } = require('../middlewares/auth');
r.use(authenticate);
r.get('/', c.search);
module.exports = r;
