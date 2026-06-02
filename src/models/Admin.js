const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  username:  { type: String, required: true, unique: true, lowercase: true },
  // Phone untuk login via WhatsApp OTP — normalisasi ke format 62xxx (Indonesia)
  // sparse: true → admin lama tanpa phone tidak conflict dengan unique constraint
  phone:     { type: String, unique: true, sparse: true, index: true },
  name:      String,
  email:     String,
  // Password kept untuk legacy / opsional. OTP flow tidak butuh.
  password:  { type: String },
  role:      { type: String, default: 'superadmin' },
  lastLogin: Date,
}, { timestamps: true });

adminSchema.pre('save', async function(next) {
  if (this.password && this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

adminSchema.methods.comparePassword = async function(candidate) {
  if (!this.password) return false;
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('Admin', adminSchema);
