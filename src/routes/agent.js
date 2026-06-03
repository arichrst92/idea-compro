const express = require('express');
const router = express.Router();
const axios = require('axios');

// System prompt — IDEA Asia context
const SYSTEM_PROMPT = `You are Carolla, a professional digital consultant for IDEA Asia (PT Solusi Inovasi Bangsa) — an IT services company based in Jakarta, Indonesia with offices in Bandung, Hanoi (Vietnam), and Sydney (Australia).

You help visitors understand IDEA Asia's services and guide them toward the right solutions. You are knowledgeable, concise, and professional — but also friendly and approachable.

IDEA Asia Services:
1. IT Consulting — Strategy & digital transformation roadmap, 35% misalignment reduction, 6-8 week delivery
2. IT Outsourcing — Managed IT operations, 30% cost reduction, 99.5% SLA uptime
3. IT Hiring — Tech talent sourcing, 5-7 day shortlist, 500+ pre-vetted candidates
4. Cloud Infrastructure — AWS/GCP/Azure migration & management, 40% cost reduction, zero-downtime migration
5. IT Security — ISO 27001 certified, OJK/BI compliant, CEH/OSCP certified engineers
6. Squad Based Delivery — Dedicated agile squads, 2-week sprints, full-stack teams

Company facts:
- Founded: 2013 (first project), officially 2019
- Certified: ISO 9001:2015 & ISO 27001:2013
- Legal: PT Solusi Inovasi Bangsa, AHU-AH.01.09-0249721
- Clients: Bank Jakarta, BRI, UOB, Accenture, Telkomsel, Pertamina, SIG, and 20+ enterprise clients
- Website: ide.asia | Email: info@ide.asia | WhatsApp: (+62) 818-0580-7807
- Values: P.R.I.D.E — Professionalism, Reliability, Innovation, Diversity, Excellence

Guidelines:
- Answer in the same language the user writes in (Indonesian or English)
- Keep responses concise and structured — use bullet points when listing multiple items
- For pricing or detailed proposals, always recommend scheduling a consultation at /contact
- If asked about topics unrelated to IT/technology/IDEA Asia, politely redirect
- Never make up information — if unsure, acknowledge and suggest contacting the team`;

// Override CSP for agent page — Three.js needs blob: workers
router.use((req, res, next) => {
  res.setHeader('Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net https://unpkg.com https://www.googletagmanager.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: blob: https:; " +
    "connect-src 'self' blob: https://api.groq.com https://cdnjs.cloudflare.com https://cdn.jsdelivr.net https://unpkg.com https://www.google-analytics.com; " +
    "worker-src 'self' blob:; " +
    "child-src 'self' blob:;"
  );
  next();
});

router.get('/', (req, res) => {
  // Sync lang cookie dan override res.locals.lang langsung
  if (req.query.lang && ['en','id'].includes(req.query.lang)) {
    res.cookie('lang', req.query.lang, { maxAge: 365*24*60*60*1000, httpOnly: false });
    res.locals.lang = req.query.lang;
  }
  res.render('pages/agent', {
    title: 'IDEA AI Consultant — ide.asia',
    description: 'Chat with IDEA AI — your intelligent digital consultant. Get instant answers about IT consulting, outsourcing, cloud, and enterprise tech solutions.',
    ogImage: '/images/og-agent.png',
    currentPage: 'agent',
    layout: 'layouts/agent'
  });
});

// Rate limit: agent chat gets its own limiter via server.js or inline
router.post('/chat', async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (message.trim().length > 1000) {
      return res.status(400).json({ error: 'Message too long (max 1000 characters)' });
    }

    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      return res.status(500).json({ error: 'AI service not configured' });
    }

    // Build messages array with history (max 10 turns to keep context manageable)
    const messages = [];
    if (Array.isArray(history)) {
      const recentHistory = history.slice(-10);
      for (const turn of recentHistory) {
        if (turn.role && turn.content && typeof turn.content === 'string') {
          messages.push({ role: turn.role, content: turn.content.substring(0, 2000) });
        }
      }
    }
    messages.push({ role: 'user', content: message.trim() });

    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages
        ],
        max_tokens: 600,
        temperature: 0.7,
        stream: false
      },
      {
        headers: {
          'Authorization': `Bearer ${groqApiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      }
    );

    const reply = response.data.choices?.[0]?.message?.content;
    if (!reply) throw new Error('Empty response from AI');

    res.json({ reply });

  } catch (err) {
    console.error('Agent chat error:', err?.response?.data || err.message);
    const status = err?.response?.status === 429 ? 429 : 500;
    const message = status === 429
      ? 'AI is busy right now, please try again in a moment.'
      : 'Something went wrong. Please try again.';
    res.status(status).json({ error: message });
  }
});

module.exports = router;
