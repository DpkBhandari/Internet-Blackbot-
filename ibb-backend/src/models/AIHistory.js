const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  sessionId: { type: String, default: 'default', index: true },
  role:      { type: String, enum: ['user','assistant'], required: true },
  content:   { type: String, required: true },
}, { timestamps: true });
module.exports = mongoose.model('AIHistory', schema);
