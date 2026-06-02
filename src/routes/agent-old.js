const express = require('express');
const router = express.Router();
const axios = require('axios');

const SYSTEM_PROMPT = `You are IDEA Assistant, an expert AI consultant for IDEA Asia (PT Solusi Inovasi Bangsa) — an enterprise IT company based in Jakarta, Indonesia.

IDEA Asia's core services:
1. IT Consulting — strategic IT alignment, digital transformation roadmap (6-8 weeks)
2. IT Outsourcing — managed IT operations, 99.5% SLA uptime, 30% cost reduction
3. IT Hiring — pre-vetted tech talent pool of 500+, shortlist in 5-7 days
4. Cloud Infrastructure — multi-cloud strategy, zero-downtime migration, 40% cost reduction
5. IT Security — ISO 27001, OJK/BI compliance, CEH/OSCP certified engineers
6. Squad Based Delivery — full-stack agile squads, 2-week sprints

Key facts:
- Founded 2013, officially 2019. ISO 9001:2015 & ISO 27001:2013 certified.
- Clients: Bank Jakarta, BRI, Telkomsel, UOB, Accenture, Pertamina, SIG, Modena
- Offices: Jakarta HQ, Bandung, Hanoi, Sydney
- Contact: info@ide.asia | +62 821-1567-8446

Guidelines:
- Be concise, professional, and helpful
- Respond in the same language the user uses (Indonesian or English)
- For pricing, explain it depends on scope and invite free consultation
- Keep responses under 200 words unless detail is genuinely needed`;

router.get('/', (req, res) => {
  res.render('pages/agent', {
    layout: 'layouts/agent',
    title: 'AI Consultant - IDEA Asia',
    description: 'Chat with IDEA Assistant — your AI-powered IT consultant from IDEA Asia.',
    currentPage: 'agent'
  });
});

router.post('/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid messages format' });
    }
    const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages.slice(-10)],
      max_tokens: 512,
      temperature: 0.7,
      stream: false
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });
    const reply = response.data.choices[0].message.content;
    res.json({ reply });
  } catch (err) {
    console.error('Agent chat error:', err?.response?.data || err.message);
    res.status(500).json({ error: 'AI service unavailable. Please try again.' });
  }
});

module.exports = router;
