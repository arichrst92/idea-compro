// src/routes/home.js
const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');

router.get('/', async (req, res) => {
  try {
    const recentBlogs = await Blog.find({ published: true })
      .sort({ createdAt: -1 }).limit(3).select('title titleId slug excerpt excerptId category createdAt readTime');
    res.render('pages/home', {
      title: 'Integrated Digital Ecosystem Asia',
      description: 'Enterprise IT Consulting, Outsourcing, Cloud Infrastructure, IT Security, and Squad-Based Delivery across Southeast Asia.',
      ogImage: '/images/og-home.png',
      recentBlogs,
      currentPage: 'home'
    });
  } catch (e) {
    res.render('pages/home', { title: 'Integrated Digital Ecosystem Asia', description: '', ogImage: '/images/og-home.png', recentBlogs: [], currentPage: 'home' });
  }
});

// Set language
router.get('/lang/:lang', (req, res) => {
  const lang = ['en', 'id'].includes(req.params.lang) ? req.params.lang : 'en';
  res.cookie('lang', lang, { maxAge: 365 * 24 * 60 * 60 * 1000 });
  res.redirect('back');
});

module.exports = router;
