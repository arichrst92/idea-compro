// src/routes/capability.js
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('pages/capability', {
    title: 'Capability - IDEA Asia - Tech Stack & Talent',
    description: 'Full technology stack across development, infrastructure, and security — plus the IT roles we deliver as outsourced talent.',
    ogImage: '/images/og-capability.jpg',
    currentPage: 'capability',
  });
});

module.exports = router;
