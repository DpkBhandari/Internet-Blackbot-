const mongoose = require('mongoose');
module.exports = mongoose.model('AIChat', new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: String,
  contextResearch: { type: mongoose.Schema.Types.ObjectId, ref: 'Research' },
}, { timestamps: true }));
