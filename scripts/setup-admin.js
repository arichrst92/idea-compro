#!/usr/bin/env node
/**
 * Seed admin pertama (WhatsApp OTP login).
 * Jalankan: node scripts/setup-admin.js
 * Atau di VPS: cd /var/www/idea-website && node scripts/setup-admin.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const readline = require('readline');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise(r => rl.question(q, r));

function normalizePhone(raw) {
  if (!raw) return null;
  let p = String(raw).replace(/[^\d]/g, '');
  if (p.startsWith('0'))   p = '62' + p.slice(1);
  else if (p.startsWith('8'))  p = '62' + p;
  if (!/^628\d{7,12}$/.test(p)) return null;
  return p;
}

async function main() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/idea_website');
  console.log('Connected to MongoDB');

  const Admin = require('../src/models/Admin');

  console.log('\n── Setup Admin (WhatsApp OTP) ──');
  const username = (await ask('Username: ')).trim().toLowerCase();
  const name     = (await ask('Nama lengkap: ')).trim();
  const email    = (await ask('Email (opsional): ')).trim();
  const phoneRaw = (await ask('Nomor WhatsApp (08xxx atau 62xxx): ')).trim();

  const phone = normalizePhone(phoneRaw);
  if (!username || !phone) {
    console.error('ERROR: Username dan nomor WA wajib. Format nomor: 08xxx / 62xxx.');
    rl.close(); process.exit(1);
  }

  // Cek apakah username/phone sudah ada
  const existsByU = await Admin.findOne({ username });
  const existsByP = await Admin.findOne({ phone });
  if (existsByU) {
    console.log(`Admin dengan username "${username}" sudah ada. Update phone-nya ke ${phone}?`);
    const cont = (await ask('Lanjut? (y/N): ')).toLowerCase();
    if (cont !== 'y') { rl.close(); process.exit(0); }
    existsByU.phone = phone;
    if (name) existsByU.name = name;
    if (email) existsByU.email = email;
    await existsByU.save();
    console.log('Admin updated.');
  } else if (existsByP) {
    console.log(`Phone ${phone} sudah dipakai oleh admin "${existsByP.username}".`);
    rl.close(); process.exit(1);
  } else {
    const admin = await Admin.create({ username, name, email, phone, role: 'superadmin' });
    console.log(`\nAdmin terbuat: ${admin.username} (phone ${admin.phone})`);
  }

  console.log(`\nLogin di: ${process.env.SITE_URL || 'http://localhost:3000'}/admin/login`);
  rl.close(); process.exit(0);
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
