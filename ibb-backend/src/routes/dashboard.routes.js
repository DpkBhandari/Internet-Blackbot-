const r = require('express').Router();
const { authenticate } = require('../middlewares/auth');
const asyncHandler = require('../utils/asyncHandler');
const Research = require('../models/Research');
const Analysis = require('../models/Analysis');
const AIHistory = require('../models/AIHistory');
const Report = require('../models/Report');

r.use(authenticate);

r.get('/', asyncHandler(async (req, res) => {
  const uid = req.user._id;

  const [uploadCount, analysisCount, flagCount, aiCount, reportCount, recentItems, sentimentDocs] = await Promise.all([
    Research.countDocuments({ user: uid }),
    Analysis.countDocuments({ user: uid }),
    Analysis.countDocuments({ user: uid, misinformationScore: { $gte: 0.5 } }),
    AIHistory.countDocuments({ user: uid }),
    Report.countDocuments({ user: uid }),
    Research.find({ user: uid }).sort('-createdAt').limit(8).lean(),
    Analysis.find({ user: uid, 'sentiment.label': { $exists: true } }).sort('-createdAt').limit(30).lean(),
  ]);

  // Build sentiment time series
  const sentimentMap = {};
  for (const a of sentimentDocs) {
    const date = new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (!sentimentMap[date]) sentimentMap[date] = { positive: 0, neutral: 0, negative: 0, count: 0 };
    const label = (a.sentiment?.label || 'neutral').toLowerCase();
    if (label === 'positive') sentimentMap[date].positive++;
    else if (label === 'negative') sentimentMap[date].negative++;
    else sentimentMap[date].neutral++;
    sentimentMap[date].count++;
  }
  const sentimentSeries = Object.entries(sentimentMap).slice(-14).map(([date, v]) => ({ date, ...v }));

  // Topic volume
  const topicMap = {};
  for (const item of recentItems) {
    const t = item.topic || (item.title || '').split(' ')[0];
    if (t) topicMap[t] = (topicMap[t] || 0) + 1;
  }
  const topicVolume = Object.entries(topicMap).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([topic, count]) => ({ topic, count }));

  const recent = recentItems.map(item => ({
    id: item._id,
    title: item.title || item.fileName,
    type: (item.fileType || 'document').toUpperCase(),
    status: (item.status || 'PENDING').toUpperCase(),
    createdAt: item.createdAt,
  }));

  res.json({
    stats: { uploads: uploadCount, analyses: analysisCount, flags: flagCount, aiQueries: aiCount, reports: reportCount },
    sentimentSeries,
    topicVolume,
    recent,
  });
}));

module.exports = r;
