const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name:    { type: String, required: true },
  email:   { type: String, required: true },
  company: String,
  phone:   String,
  service: String,
  message: { type: String, required: true },
  status:  { type: String, enum: ['new', 'read', 'replied', 'archived'], default: 'new' },
  ip:      String,
  lang:    { type: String, default: 'en' },
}, { timestamps: true });

module.exports = mongoose.model('Contact', contactSchema);
