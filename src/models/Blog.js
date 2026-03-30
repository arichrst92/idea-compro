const mongoose = require('mongoose');
const slugify = require('slugify');

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  titleId: { type: String }, // Indonesian title
  slug: { type: String, unique: true },
  excerpt: { type: String, required: true },
  excerptId: { type: String },
  content: { type: String, required: true },
  contentId: { type: String },
  category: { 
    type: String, 
    enum: ['it-consulting','it-outsourcing','it-hiring','cloud-infrastructure','it-security','squad-delivery'],
    required: true 
  },
  tags: [String],
  metaTitle: String,
  metaDescription: String,
  ogImage: { type: String, default: '/images/og-default.jpg' },
  author: { type: String, default: 'IDEA Team' },
  featured: { type: Boolean, default: false },
  published: { type: Boolean, default: true },
  readTime: { type: Number, default: 5 },
  views: { type: Number, default: 0 },
}, { timestamps: true });

blogSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true, strict: true }) + '-' + Date.now();
  }
  // Estimate reading time (avg 200 words/min)
  const wordCount = this.content.split(/\s+/).length;
  this.readTime = Math.ceil(wordCount / 200);
  next();
});

module.exports = mongoose.model('Blog', blogSchema);
