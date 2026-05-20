const mongoose = require('mongoose');
module.exports = mongoose.model('SemanticMatch', new mongoose.Schema({
  analysis: { type: mongoose.Schema.Types.ObjectId, ref: 'Analysis', index: true },
  source: { type: mongoose.Schema.Types.ObjectId, ref: 'Source' },
  claim: String,
  matchedText: String,
  similarity: Number,
}, { timestamps: true }));
