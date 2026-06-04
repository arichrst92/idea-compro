const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const { sendContactNotification, sendAutoReply } = require('../services/email');

const ALLOWED_SERVICES = ['it-consulting', 'it-outsourcing', 'it-hiring', 'cloud-infrastructure', 'it-security', 'squad-delivery', 'software-development', 'ai-development', 'managed-service', 'general'];

router.get('/', (req, res) => {
  // Allow pre-fill via query params (e.g. from Jarvis action chip)
  const prefillService = ALLOWED_SERVICES.includes(req.query.service) ? req.query.service : '';
  const prefillMessage = req.query.msg ? String(req.query.msg).substring(0, 500) : '';

  res.render('pages/contact', {
    title: 'Contact Us - IDEAsia - PT Solusi Inovasi Bangsa',
    description: 'Get in touch with IDEAsia - PT Solusi Inovasi Bangsa for IT consulting, outsourcing, cloud infrastructure, and enterprise technology solutions.',
    ogImage: '/images/og-contact.jpg',
    currentPage: 'contact',
    success: req.query.success,
    error: req.query.error,
    prefillService,
    prefillMessage,
  });
});

router.post('/submit', async (req, res) => {
  try {
    const { name, email, company, phone, service, message } = req.body;

    if (!name || !email || !message) {
      return res.redirect('/contact?error=missing_fields');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.redirect('/contact?error=invalid_email');
    }

    // 1) Save ke MongoDB — primary source of truth untuk admin dashboard
    try {
      await Contact.create({
        name:    String(name).trim(),
        email:   String(email).trim().toLowerCase(),
        company: company ? String(company).trim() : undefined,
        phone:   phone   ? String(phone).trim()   : undefined,
        service: service ? String(service).trim() : 'general',
        message: String(message).trim(),
        status:  'new',
        ip:      req.ip || req.headers['x-forwarded-for'] || '',
        lang:    res.locals.lang || 'en',
      });
      console.log(`Contact saved: ${name} <${email}> — ${service || 'general'}`);
    } catch (dbErr) {
      // Jangan hilangkan lead — lanjut kirim email walaupun DB error
      console.error('Contact DB save failed:', dbErr.message);
    }

    // 2) Kirim notifikasi email (non-blocking, tidak gagalkan request)
    Promise.all([
      sendContactNotification({ name, email, company, phone, service, message }),
      sendAutoReply({ name, email, service }),
    ]).catch(err => console.error('Email send error:', err.message));

    res.redirect('/contact?success=1');
  } catch (e) {
    console.error('Contact form error:', e.stack || e);
    res.redirect('/contact?error=server_error');
  }
});

module.exports = router;
