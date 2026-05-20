const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  user:               { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  research:           { type: mongoose.Schema.Types.ObjectId, ref: 'Research', required: true, index: true },
  status:             { type: String, enum: ['PENDING','PROCESSING','READY','FAILED'], default: 'PENDING', index: true },
  summary:            String,
  sentiment:          { label: String, score: Number },
  keywords:           [String],
  toxicity:           { label: String, score: Number },
  claims:             [{ text: String, verdict: String, confidence: Number }],
  misinformationScore:{ type: Number, default: 0 },
  credibilityScore:   { type: Number, default: 0.5 },
  metrics:            { wordCount: Number, sentenceCount: Number, keywordCount: Number, claimCount: Number },
  error:              String,
}, { timestamps: true });
module.exports = mongoose.model('Analysis', schema);
