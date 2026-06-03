const express = require('express');
const router = express.Router();
const { sendContactNotification, sendAutoReply } = require('../services/email');

router.get('/', (req, res) => {
  res.render('pages/contact', {
    title: 'Contact Us - IDEAsia - PT Solusi Inovasi Bangsa',
    description: 'Get in touch with IDEAsia - PT Solusi Inovasi Bangsa for IT consulting, outsourcing, cloud infrastructure, and enterprise technology solutions.',
    ogImage: '/images/og-contact.jpg',
    currentPage: 'contact',
    success: req.query.success,
    error: req.query.error
  });
});

router.post('/submit', async (req, res) => {
  try {
    const { name, email, company, service, message } = req.body;
    if (!name || !email || !message) return res.redirect('/contact?error=missing_fields');

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.redirect('/contact?error=invalid_email');

    // Send emails in parallel (non-blocking — don't fail the request if email fails)
    Promise.all([
      sendContactNotification({ name, email, company, service, message }),
      sendAutoReply({ name, email, service }),
    ]).catch(err => console.error('Email send error:', err.message));

    console.log(`📧 Contact: ${name} <${email}> — ${service || 'general'}`);
    res.redirect('/contact?success=1');
  } catch (e) {
    console.error('Contact form error:', e);
    res.redirect('/contact?error=server_error');
  }
});

module.exports = router;
