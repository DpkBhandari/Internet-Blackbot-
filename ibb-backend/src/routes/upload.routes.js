const r = require('express').Router();
const { authenticate } = require('../middlewares/auth');
const { upload } = require('../middlewares/upload');
const asyncHandler = require('../utils/asyncHandler');
const Research = require('../models/Research');
const Analysis = require('../models/Analysis');
const ApiError = require('../utils/ApiError');
const extraction = require('../services/extraction.service');
const { analysisQueue } = require('../jobs/queues');
const { ANALYSIS_STATUS } = require('../config/constants');
const fs = require('fs/promises');

r.use(authenticate);

// List all uploads for user
r.get('/', asyncHandler(async (req, res) => {
  const items = await Research.find({ user: req.user._id })
    .select('fileName fileSize fileType status createdAt mimeType')
    .sort('-createdAt').lean();
  res.json(items.map(i => ({
    id: i._id,
    filename: i.fileName || 'untitled',
    size: i.fileSize || 0,
    mimeType: i.mimeType || '',
    status: (i.status || 'queued').toLowerCase(),
    createdAt: i.createdAt,
  })));
}));

// Upload single file
r.post('/', upload.single('file'), asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'No file uploaded');
  const fileType = extraction.detectType(req.file.originalname);
  if (!fileType) throw new ApiError(400, 'Unsupported file type. Use PDF, DOCX, TXT, or CSV.');

  let text = '';
  try {
    text = await extraction.extractText(req.file.path, fileType);
  } catch (e) {
    text = '';
  }

  const r_ = await Research.create({
    user: req.user._id,
    title: req.body.title || req.file.originalname,
    description: req.body.description || '',
    topic: req.body.topic || '',
    fileName: req.file.originalname,
    filePath: req.file.path,
    fileType, fileSize: req.file.size,
    mimeType: req.file.mimetype,
    extractedText: text,
    status: 'PROCESSING',
  });

  const analysis = await Analysis.create({ research: r_._id, user: req.user._id, status: ANALYSIS_STATUS.PENDING });
  await analysisQueue.add('analyze', { analysisId: analysis._id.toString() }, { removeOnComplete: 100, removeOnFail: 100, attempts: 2, backoff: { type: 'exponential', delay: 3000 } });

  res.status(201).json({
    id: r_._id,
    filename: r_.fileName,
    size: r_.fileSize,
    status: 'queued',
    createdAt: r_.createdAt,
    analysisId: analysis._id,
  });
}));

// Get one upload
r.get('/:id', asyncHandler(async (req, res) => {
  const doc = await Research.findOne({ _id: req.params.id, user: req.user._id }).lean();
  if (!doc) throw new ApiError(404, 'Not found');
  res.json({ id: doc._id, filename: doc.fileName, size: doc.fileSize, status: (doc.status || 'queued').toLowerCase(), createdAt: doc.createdAt, extractedText: doc.extractedText });
}));

// Delete upload
r.delete('/:id', asyncHandler(async (req, res) => {
  const doc = await Research.findOne({ _id: req.params.id, user: req.user._id });
  if (!doc) throw new ApiError(404, 'Not found');
  if (doc.filePath) await fs.unlink(doc.filePath).catch(() => {});
  await doc.deleteOne();
  res.json({ ok: true });
}));

module.exports = r;
