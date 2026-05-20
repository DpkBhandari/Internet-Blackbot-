const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  user:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title:         { type: String, default: '' },
  description:   { type: String, default: '' },
  topic:         { type: String, default: '' },
  tags:          [String],
  fileName:      String,
  filePath:      String,
  fileType:      String,
  fileSize:      Number,
  mimeType:      String,
  extractedText: { type: String, select: false },
  status:        { type: String, enum: ['PENDING','PROCESSING','READY','FAILED'], default: 'PENDING', index: true },
}, { timestamps: true });

schema.index({ title: 'text', topic: 'text', tags: 'text' });

module.exports = mongoose.model('Research', schema);
