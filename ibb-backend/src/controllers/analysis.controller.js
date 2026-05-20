const asyncHandler = require('../utils/asyncHandler');
const Analysis = require('../models/Analysis');
const Source = require('../models/Source');
const FactCheck = require('../models/FactCheck');
const ApiError = require('../utils/ApiError');

exports.list = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const filter = { user: req.user._id };
  if (status) filter.status = status;
  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    Analysis.find(filter).sort('-createdAt').skip(skip).limit(Number(limit))
      .populate({ path: 'research', select: 'title fileName fileType topic' }).lean(),
    Analysis.countDocuments(filter),
  ]);
  res.json({ items, total, page: Number(page), limit: Number(limit) });
});

exports.get = asyncHandler(async (req, res) => {
  const a = await Analysis.findOne({ _id: req.params.id, user: req.user._id })
    .populate({ path: 'research', select: 'title fileName fileType topic description tags' });
  if (!a) throw new ApiError(404, 'Analysis not found');
  const [sources, facts] = await Promise.all([
    Source.find({ analysis: a._id }).sort('-credibilityScore').limit(30).lean(),
    FactCheck.find({ analysis: a._id }).limit(20).lean(),
  ]);
  res.json({ ...a.toObject(), sources, factChecks: facts });
});

exports.summary = asyncHandler(async (req, res) => {
  const a = await Analysis.findOne({ _id: req.params.id, user: req.user._id }).lean();
  if (!a) throw new ApiError(404, 'Not found');
  res.json({ summary: a.summary, sentiment: a.sentiment, credibilityScore: a.credibilityScore, misinformationScore: a.misinformationScore, metrics: a.metrics });
});
