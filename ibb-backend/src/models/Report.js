const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  analysis: { type: mongoose.Schema.Types.ObjectId, ref: 'Analysis', index: true },
  research: { type: mongoose.Schema.Types.ObjectId, ref: 'Research' },
  status:   { type: String, enum: ['PENDING','GENERATING','READY','FAILED'], default: 'PENDING', index: true },
  filePath: String,
  fileSize: Number,
  error:    String,
}, { timestamps: true });
module.exports = mongoose.model('Report', schema);
