const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  analysis:   { type: mongoose.Schema.Types.ObjectId, ref: 'Analysis', index: true },
  claim:      String,
  verdict:    { type: String, enum: ['TRUE','FALSE','MISLEADING','UNVERIFIED'], default: 'UNVERIFIED' },
  explanation:String,
  confidence: { type: Number, default: 0.5 },
  sources:    [{ url: String, title: String }],
}, { timestamps: true });
module.exports = mongoose.model('FactCheck', schema);
