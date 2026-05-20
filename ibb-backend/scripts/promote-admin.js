#!/usr/bin/env node
require('dotenv').config();
const mongoose = require('mongoose');
const email = process.argv[2];
if (!email) { console.error('Usage: node scripts/promote-admin.js your@email.com'); process.exit(1); }
async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const User = require('../src/models/User');
  const u = await User.findOneAndUpdate({ email }, { role: 'admin' }, { new: true });
  if (!u) { console.error('User not found:', email); process.exit(1); }
  console.log('✅', email, 'is now admin');
  await mongoose.disconnect();
}
main().catch(e => { console.error(e.message); process.exit(1); });
