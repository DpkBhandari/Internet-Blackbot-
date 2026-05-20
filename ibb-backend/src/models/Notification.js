const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title:   { type: String, required: true },
  message: { type: String, default: '' },
  type:    { type: String, enum: ['info','success','warning','error'], default: 'info' },
  link:    { type: String, default: '' },
  read:    { type: Boolean, default: false, index: true },
  readAt:  Date,
}, { timestamps: true });
module.exports = mongoose.model('Notification', schema);
