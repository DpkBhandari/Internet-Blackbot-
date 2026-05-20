const r = require('express').Router();
const c = require('../controllers/research.controller');
const { authenticate } = require('../middlewares/auth');
const { upload } = require('../middlewares/upload');
const validate = require('../middlewares/validate');
const v = require('../validators/research.validator');

r.use(authenticate);
r.get('/', validate(v.searchSchema, 'query'), c.list);
r.post('/', validate(v.createResearchSchema), c.create);
r.post('/upload', upload.single('file'), c.upload);
r.get('/:id', c.get);
r.delete('/:id', c.remove);
module.exports = r;
