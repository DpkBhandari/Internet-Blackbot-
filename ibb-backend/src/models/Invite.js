const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  email:      { type: String, required: true },
  role:       { type: String, enum: ['user','admin'], default: 'user' },
  code:       { type: String, unique: true },
  createdBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  expiresAt:  Date,
  usedAt:     Date,
}, { timestamps: true });
module.exports = mongoose.model('Invite', schema);
