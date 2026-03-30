#!/usr/bin/env node
/**
 * Create the first admin user
 * Run: node scripts/create-admin.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const readline = require('readline');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise(r => rl.question(q, r));

async function main() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/idea_website');
  console.log('✅ Connected to MongoDB\n');

  const Admin = require('../src/models/Admin');

  const existing = await Admin.countDocuments();
  if (existing > 0) {
    console.log(`ℹ️  ${existing} admin(s) already exist.`);
    const cont = await ask('Continue and add another? (y/N): ');
    if (cont.toLowerCase() !== 'y') { rl.close(); process.exit(0); }
  }

  console.log('── Create Admin Account ──────────────────');
  const username = (await ask('Username: ')).trim().toLowerCase();
  const name     = (await ask('Full Name: ')).trim();
  const email    = (await ask('Email: ')).trim();
  const password = (await ask('Password (min 8 chars): ')).trim();
  const role     = (await ask('Role [superadmin/editor] (default: superadmin): ')).trim() || 'superadmin';

  if (!username || !name || !email || password.length < 8) {
    console.error('❌ Invalid input. Password must be at least 8 characters.');
    rl.close(); process.exit(1);
  }

  const admin = await Admin.create({ username, name, email, password, role });
  console.log(`\n✅ Admin created!`);
  console.log(`   Username : ${admin.username}`);
  console.log(`   Name     : ${admin.name}`);
  console.log(`   Role     : ${admin.role}`);
  console.log(`\n🔐 Login at: ${process.env.SITE_URL || 'http://localhost:3000'}/admin/login`);

  rl.close();
  process.exit(0);
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
