const asyncHandler = require('../utils/asyncHandler');
const Research = require('../models/Research');
const Analysis = require('../models/Analysis');
const ApiError = require('../utils/ApiError');
const repo = require('../repositories/research.repo');
const extraction = require('../services/extraction.service');
const { analysisQueue } = require('../jobs/queues');
const { ANALYSIS_STATUS } = require('../config/constants');
const fs = require('fs/promises');

exports.create = asyncHandler(async (req, res) => {
  const r = await repo.create({ ...req.body, user: req.user._id });
  res.status(201).json(r);
});

exports.upload = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'No file uploaded');
  const fileType = extraction.detectType(req.file.originalname);
  if (!fileType) throw new ApiError(400, 'Unsupported file');
  const text = await extraction.extractText(req.file.path, fileType);
  const r = await Research.create({
    user: req.user._id,
    title: req.body.title || req.file.originalname,
    description: req.body.description,
    topic: req.body.topic,
    tags: req.body.tags ? JSON.parse(req.body.tags) : [],
    fileName: req.file.originalname,
    filePath: req.file.path,
    fileType, fileSize: req.file.size,
    extractedText: text,
    status: 'PROCESSING',
  });
  const analysis = await Analysis.create({ research: r._id, user: req.user._id, status: ANALYSIS_STATUS.PENDING });
  await analysisQueue.add('analyze', { analysisId: analysis._id.toString() }, { removeOnComplete: 100, removeOnFail: 100, attempts: 2 });
  res.status(201).json({ research: r, analysis });
});

exports.list = asyncHandler(async (req, res) => {
  const { page, limit, q, status } = req.query;
  const filter = { user: req.user._id };
  if (status) filter.status = status;
  if (q) filter.$text = { $search: q };
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([repo.search(filter, { skip, limit }), repo.count(filter)]);
  res.json({ items, total, page, limit });
});

exports.get = asyncHandler(async (req, res) => {
  const r = await repo.byId(req.params.id);
  if (!r || r.user.toString() !== req.user._id.toString()) throw new ApiError(404, 'Not found');
  res.json(r);
});

exports.remove = asyncHandler(async (req, res) => {
  const r = await repo.byId(req.params.id);
  if (!r || r.user.toString() !== req.user._id.toString()) throw new ApiError(404, 'Not found');
  if (r.filePath) await fs.unlink(r.filePath).catch(() => {});
  await r.deleteOne();
  res.json({ ok: true });
});
