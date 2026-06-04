const express = require('express');
const router = express.Router();
const axios = require('axios');
const { CATEGORIES, PRODUCTS } = require('../data/ibm-products');

// Build compact IBM catalog reference for the system prompt.
// Format: one line per product → "slug · Name (Category) — short use case"
// This gives Jarvis enough context to recommend the right IBM product
// and deep-link to its detail page (/products/<slug>).
const IBM_CATALOG_BLOCK = (() => {
  const lines = [];
  for (const cat of CATEGORIES) {
    const items = PRODUCTS.filter(p => p.categoryId === cat.id);
    if (!items.length) continue;
    lines.push(`# ${cat.titleEn}`);
    for (const p of items) {
      lines.push(`- ${p.slug} · ${p.name} — ${p.useEn} [tier: ${p.tier}; ~${p.timeline}]`);
    }
  }
  return lines.join('\n');
})();

// System prompt — IDEA Asia context
const SYSTEM_PROMPT = `You are Jarvis, a professional digital consultant for IDEA Asia (PT Solusi Inovasi Bangsa) — an IT services company based in Jakarta, Indonesia with offices in Bandung, Hanoi (Vietnam), and Sydney (Australia).

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
- Partnerships: IBM Certified Partner, Deloitte Independent Contractor
- Legal: PT Solusi Inovasi Bangsa, AHU-AH.01.09-0249721
- Clients: Bank Jakarta, BRI, UOB, Accenture, Telkomsel, Pertamina, SIG, and 20+ enterprise clients
- Website: ide.asia | Email: info@ide.asia | WhatsApp: (+62) 818-0580-7807
- Values: P.R.I.D.E — Professionalism, Reliability, Innovation, Diversity, Excellence

IBM PRODUCT CATALOG (IDEA Asia is an official IBM Certified Partner — these are the products we source, deploy, integrate, and support):

${IBM_CATALOG_BLOCK}

How to use the IBM catalog:
- When a user asks about a specific IBM product (e.g. "watsonx.ai", "QRadar", "IBM Z"), use the bullet line above as the source of truth — never invent features not listed.
- For deeper detail (features, use cases, pricing tier, timeline), each product has a dedicated page at /products/<slug>. Use a "navigate" action to link to it (e.g. /products/watsonx-ai).
- When the user describes a problem (e.g. "we need fraud detection for online banking" or "how do I move VMware to cloud"), recommend the 1-2 most relevant IBM products by name and explain why, then offer a navigate action to the product detail page and a contact action for an implementation consultation.
- If user asks "what IBM products do you support / sell", point them to /products with a navigate action.
- Never quote a price — pricing always depends on workload, region, and licensing model. Direct pricing questions to /contact with service "it-consulting".

Guidelines:
- The session language is set externally — a separate system message will tell you which language to use. Stick to it strictly.
- Keep responses concise and structured — use bullet points when listing multiple items
- For pricing or detailed proposals, always recommend scheduling a consultation at /contact
- If asked about topics unrelated to IT/technology/IDEA Asia, politely redirect
- Never make up information — if unsure, acknowledge and suggest contacting the team

ACTION CAPABILITIES — IMPORTANT
You can suggest concrete next steps as clickable action buttons by appending a special JSON block on the LAST line of your reply.

Format (single line, no markdown, last line of reply):
[ACTIONS]{"actions":[{"type":"contact","label":"Book a consultation","service":"it-consulting"}]}[/ACTIONS]

Available action types:
- "contact"  — opens /contact form, pre-fills service select. Required: label. Optional: service (one of: it-consulting, it-outsourcing, it-hiring, cloud-infrastructure, it-security, squad-delivery), message
- "whatsapp" — opens WhatsApp chat. Required: label. Optional: message (URL-encoded text to pre-fill)
- "navigate" — go to internal page. Required: label, url (must start with /)
- "external" — open external URL in new tab. Required: label, url (must start with https://)
- "call"     — open phone dialer (+62 818-0580-7807). Required: label

Rules for [ACTIONS]:
- Use AT MOST 2 actions per reply
- Only include [ACTIONS] when actions clearly help user move forward
- Skip [ACTIONS] when reply is purely informational (definitions, explanations, "what is X")
- Translate "label" to user's language (Indonesian/English)
- Place [ACTIONS] strictly at the very end, on its own line

Examples:
User: "I want to talk to someone"
You: "Sure, you can reach our team directly. Our consultants reply within 4 hours during business hours.
[ACTIONS]{"actions":[{"type":"whatsapp","label":"Chat on WhatsApp","message":"Hi IDEA Asia, I'd like to talk to a consultant."},{"type":"contact","label":"Send a message"}]}[/ACTIONS]"

User: "How much does IT outsourcing cost?"
You: "Pricing depends on team size, technology stack, and engagement duration. Typically clients see 30% cost reduction vs in-house. Let's discuss your specific needs.
[ACTIONS]{"actions":[{"type":"contact","label":"Get a quote","service":"it-outsourcing"}]}[/ACTIONS]"

User: "What is cloud migration?"
You: "Cloud migration is the process of moving data, applications, and workloads from on-premise infrastructure to cloud platforms like AWS, Azure, or GCP. Benefits include scalability, cost optimization, and improved reliability." (NO actions — purely informational)

User: "Tell me about watsonx.ai"
You: "watsonx.ai is IBM's enterprise studio for building, validating, tuning, and deploying foundation models. It supports IBM Granite plus open-source models (Llama, Mistral) and runs across cloud or on-prem. Common use cases: customer service copilots, document extraction, and enterprise code generation. Typical implementation: 4–8 weeks.
[ACTIONS]{\"actions\":[{\"type\":\"navigate\",\"label\":\"See watsonx.ai details\",\"url\":\"/products/watsonx-ai\"},{\"type\":\"contact\",\"label\":\"Discuss implementation\",\"service\":\"it-consulting\",\"message\":\"I want to discuss watsonx.ai\"}]}[/ACTIONS]"

User: "We need fraud detection for our mobile banking app"
You: "For mobile banking fraud, IBM Trusteer is the right fit — it combines behavioral biometrics, device fingerprinting, and real-time fraud scoring to detect account takeover and scams. It's deployed across Indonesian and Southeast Asian banks. Pair it with QRadar SIEM if you also want SOC-level correlation across other channels.
[ACTIONS]{\"actions\":[{\"type\":\"navigate\",\"label\":\"See Trusteer details\",\"url\":\"/products/trusteer\"},{\"type\":\"contact\",\"label\":\"Talk to a security consultant\",\"service\":\"it-security\"}]}[/ACTIONS]"

User: "What IBM products do you support?"
You: "We're an IBM Certified Partner covering 30+ products across watsonx (AI), IBM Cloud, Db2 & analytics, automation (Instana, Turbonomic, Apptio), security (QRadar, Guardium, Verify), integration (API Connect, MQ), storage (FlashSystem), and IBM Z / Power / LinuxONE.
[ACTIONS]{\"actions\":[{\"type\":\"navigate\",\"label\":\"Explore the catalog\",\"url\":\"/products\"}]}[/ACTIONS]"`;

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
  // Did the user EXPLICITLY pick a language? (query > cookie). Used to
  // show a language picker on first visit so Jarvis stays consistent.
  const langExplicit = !!(req.query.lang || req.cookies.lang);
  res.render('pages/agent', {
    title: 'IDEA AI Consultant — ide.asia',
    description: 'Chat with IDEA AI — your intelligent digital consultant. Get instant answers about IT consulting, outsourcing, cloud, and enterprise tech solutions.',
    ogImage: '/images/og-agent.jpg',
    currentPage: 'agent',
    layout: 'layouts/agent',
    langExplicit,
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

    // Lock response language to what user picked at the start of the
    // session. Priority: explicit body.lang > cookie > query > 'en'.
    // The system prompt + a system-level "stay in language X" reminder
    // injected after every user turn keep Jarvis consistent.
    const rawLang = (req.body && req.body.lang) || req.cookies.lang || req.query.lang || res.locals.lang || 'en';
    const lang = ['en', 'id'].includes(rawLang) ? rawLang : 'en';
    const langName = lang === 'id' ? 'Bahasa Indonesia' : 'English';
    const langLockEn = `LANGUAGE LOCK — VERY IMPORTANT:
The user has selected ${langName} as their session language. You MUST respond ONLY in ${langName} for the entire conversation, REGARDLESS of what language the user types in (even if they write in English/Indonesian/mixed). Never switch languages mid-conversation. Translate product names and IBM-specific terms only when natural — keep brand names (e.g. "watsonx.ai", "QRadar SIEM", "IBM Z") in their original form.`;
    const langLockId = `KUNCI BAHASA — SANGAT PENTING:
User memilih ${langName} sebagai bahasa sesi. Anda WAJIB merespons HANYA dalam ${langName} sepanjang percakapan, TIDAK PEDULI dalam bahasa apa user mengetik (meskipun mereka menulis dalam Bahasa Inggris/Indonesia/campur). Jangan pernah ganti bahasa di tengah percakapan. Terjemahkan istilah produk IBM hanya bila terdengar natural — pertahankan nama brand (mis. "watsonx.ai", "QRadar SIEM", "IBM Z") apa adanya.`;
    const languageLock = lang === 'id' ? langLockId : langLockEn;

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
          // Place language lock AFTER the base prompt and AFTER history,
          // right before the user's latest turn — last instructions win.
          { role: 'system', content: languageLock },
          ...messages
        ],
        max_tokens: 600,
        temperature: 0.5, // slightly lower for more deterministic language adherence
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

    const raw = response.data.choices?.[0]?.message?.content;
    if (!raw) throw new Error('Empty response from AI');

    // Extract [ACTIONS]...[/ACTIONS] JSON block if present
    let reply = raw;
    let actions = [];
    const actionMatch = raw.match(/\[ACTIONS\]\s*(\{[\s\S]*?\})\s*\[\/ACTIONS\]/);
    if (actionMatch) {
      reply = raw.replace(actionMatch[0], '').trim();
      try {
        const parsed = JSON.parse(actionMatch[1]);
        if (Array.isArray(parsed.actions)) {
          // Validate + sanitize each action (max 2)
          const ALLOWED_TYPES = ['contact', 'whatsapp', 'navigate', 'external', 'call'];
          const ALLOWED_SERVICES = ['it-consulting', 'it-outsourcing', 'it-hiring', 'cloud-infrastructure', 'it-security', 'squad-delivery'];
          actions = parsed.actions.slice(0, 2).filter(a => {
            if (!a || typeof a !== 'object') return false;
            if (!ALLOWED_TYPES.includes(a.type)) return false;
            if (!a.label || typeof a.label !== 'string') return false;
            if (a.label.length > 60) return false;
            if (a.type === 'contact' && a.service && !ALLOWED_SERVICES.includes(a.service)) {
              delete a.service;
            }
            if ((a.type === 'navigate' || a.type === 'external')) {
              if (typeof a.url !== 'string') return false;
              if (a.type === 'navigate' && !a.url.startsWith('/')) return false;
              if (a.type === 'external' && !a.url.startsWith('https://')) return false;
              if (a.url.length > 200) return false;
            }
            if (a.message && typeof a.message === 'string') {
              a.message = a.message.substring(0, 300);
            }
            return true;
          });
        }
      } catch (parseErr) {
        console.warn('Agent action JSON parse failed:', parseErr.message);
      }
    }

    res.json({ reply, actions });

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
