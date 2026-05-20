const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const schema = new mongoose.Schema({
  name:                  { type: String, required: true, trim: true },
  email:                 { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:              { type: String, required: true, select: false, minlength: 8 },
  role:                  { type: String, enum: ['user','admin'], default: 'user', index: true },
  isActive:              { type: Boolean, default: true, index: true },
  avatar:                String,
  refreshTokens:         { type: [String], select: false, default: [] },
  resetPasswordToken:    { type: String, select: false },
  resetPasswordExpires:  { type: Date, select: false },
  lastLoginAt:           Date,
}, { timestamps: true });

schema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

schema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model('User', schema);
