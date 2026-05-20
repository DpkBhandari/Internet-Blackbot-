const mongoose = require('mongoose');
module.exports = mongoose.model('Citation', new mongoose.Schema({
  analysis: { type: mongoose.Schema.Types.ObjectId, ref: 'Analysis', index: true },
  source: { type: mongoose.Schema.Types.ObjectId, ref: 'Source' },
  claimText: String,
  quote: String,
  pageOrLocation: String,
}, { timestamps: true }));
