const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Report = require('../models/Report');
const reportService = require('../services/report.service');
const path = require('path');
const fs = require('fs');

exports.list = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    Report.find({ user: req.user._id }).sort('-createdAt').skip(skip).limit(Number(limit))
      .populate({ path: 'analysis', select: 'status summary' })
      .populate({ path: 'research', select: 'title fileName' })
      .lean(),
    Report.countDocuments({ user: req.user._id }),
  ]);
  res.json({ items, total, page: Number(page), limit: Number(limit) });
});

exports.generate = asyncHandler(async (req, res) => {
  const { analysisId } = req.body;
  if (!analysisId) throw new ApiError(400, 'analysisId required');
  const report = await reportService.generateReport({ analysisId, userId: req.user._id });
  res.status(201).json(report);
});

exports.get = asyncHandler(async (req, res) => {
  const r = await Report.findOne({ _id: req.params.id, user: req.user._id }).lean();
  if (!r) throw new ApiError(404, 'Report not found');
  res.json(r);
});

exports.download = asyncHandler(async (req, res) => {
  const r = await Report.findOne({ _id: req.params.id, user: req.user._id });
  if (!r) throw new ApiError(404, 'Report not found');
  if (r.status !== 'READY' || !r.filePath) throw new ApiError(400, 'Report not ready');
  if (!fs.existsSync(r.filePath)) throw new ApiError(404, 'Report file missing');
  res.download(r.filePath, `ibb-report-${r._id}.pdf`);
});
