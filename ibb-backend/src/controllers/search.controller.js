const asyncHandler = require('../utils/asyncHandler');
const Research = require('../models/Research');
const Analysis = require('../models/Analysis');
const Source = require('../models/Source');

exports.search = asyncHandler(async (req, res) => {
  const { q = '', type = 'all', page = 1, limit = 20 } = req.query;
  const uid = req.user._id;
  const skip = (Number(page) - 1) * Number(limit);

  if (!q.trim()) return res.json({ results: [], total: 0, q, page, limit });

  const textFilter = { $text: { $search: q } };
  const results = [];

  if (type === 'all' || type === 'research') {
    const docs = await Research.find({ user: uid, ...textFilter })
      .select('title fileName fileType topic status createdAt')
      .sort({ score: { $meta: 'textScore' } })
      .skip(skip).limit(Number(limit)).lean();
    docs.forEach(d => results.push({ id: d._id, type: 'research', title: d.title || d.fileName, subtitle: d.topic || d.fileType, status: d.status, createdAt: d.createdAt }));
  }

  if (type === 'all' || type === 'source') {
    const srcs = await Source.find({ ...textFilter, analysis: { $exists: true } })
      .populate({ path: 'analysis', match: { user: uid }, select: 'user' })
      .select('title url domain credibilityScore snippet createdAt')
      .sort({ score: { $meta: 'textScore' } })
      .limit(Number(limit)).lean();
    srcs.filter(s => s.analysis).forEach(s =>
      results.push({ id: s._id, type: 'source', title: s.title || s.url, subtitle: s.domain, url: s.url, credibility: s.credibilityScore, snippet: s.snippet, createdAt: s.createdAt })
    );
  }

  results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({ results: results.slice(0, Number(limit)), total: results.length, q, page, limit });
});
