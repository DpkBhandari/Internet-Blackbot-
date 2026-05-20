const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  level:   { type: String, enum: ['error','warn','info','http','debug'], index: true },
  message: String,
  meta:    mongoose.Schema.Types.Mixed,
  timestamp: { type: Date, default: Date.now, index: true },
}, { timestamps: false });
module.exports = mongoose.model('Log', schema);
