const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  analysis:          { type: mongoose.Schema.Types.ObjectId, ref: 'Analysis', index: true },
  url:               String,
  title:             String,
  snippet:           String,
  domain:            String,
  publishedAt:       Date,
  sourceType:        { type: String, enum: ['news','academic','web','factcheck'], default: 'web' },
  credibilityScore:  { type: Number, default: 0.5 },
  relevanceScore:    { type: Number, default: 0 },
  semanticSimilarity:{ type: Number, default: 0 },
}, { timestamps: true });
schema.index({ title: 'text', snippet: 'text', domain: 'text' });
module.exports = mongoose.model('Source', schema);
