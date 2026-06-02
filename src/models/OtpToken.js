const mongoose = require('mongoose');

// OTP token disimpan sebagai hash (bcrypt) dengan TTL otomatis di Mongo.
// Setelah `expires` detik dari createdAt, dokumen di-purge oleh Mongo.
const otpSchema = new mongoose.Schema({
  phone:     { type: String, required: true, index: true }, // 62xxx
  hash:      { type: String, required: true }, // bcrypt hash dari OTP code
  attempts:  { type: Number, default: 0 },     // gagal verify; lock setelah 5
  used:      { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now, expires: 300 }, // TTL 5 menit
});

module.exports = mongoose.model('OtpToken', otpSchema);
