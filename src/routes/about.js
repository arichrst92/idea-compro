// src/routes/about.js
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('pages/about', {
    title: 'About Us - IDEAsia - PT Solusi Inovasi Bangsa',
    description: 'Learn about IDEA (Integrated Digital Ecosystem Asia) - our mission, values, and the team powering enterprise IT across Southeast Asia.',
    ogImage: '/images/og-about.png',
    currentPage: 'about'
  });
});

module.exports = router;
