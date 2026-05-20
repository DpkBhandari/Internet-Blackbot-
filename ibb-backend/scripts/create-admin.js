#!/usr/bin/env node
require('dotenv').config();
const mongoose = require('mongoose');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@ibb.local';
const ADMIN_PASS  = process.env.ADMIN_PASS  || 'Admin@123456';
const ADMIN_NAME  = process.env.ADMIN_NAME  || 'IBB Admin';

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error('ERROR: MONGODB_URI not set in .env');
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGODB_URI);

  const User = require('../src/models/User');
  const existing = await User.findOne({ email: ADMIN_EMAIL });
  if (existing) {
    existing.role = 'admin';
    await existing.save();
    console.log('Promoted', ADMIN_EMAIL, 'to admin');
  } else {
    await User.create({ name: ADMIN_NAME, email: ADMIN_EMAIL, password: ADMIN_PASS, role: 'admin' });
    console.log('\n✅ Admin created!');
    console.log('  Email:   ', ADMIN_EMAIL);
    console.log('  Password:', ADMIN_PASS);
    console.log('  URL:      http://localhost:5173/login');
    console.log('  Admin:    http://localhost:5173/admin/dashboard\n');
  }
  await mongoose.disconnect();
}
main().catch(e => { console.error(e.message); process.exit(1); });
