// src/routes/capability.js
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  const lang = res.locals.lang || 'en';
  const isId = lang === 'id';

  // SEO meta — sharp, scannable, keyword-loaded
  const title = isId
    ? 'Kapabilitas Teknologi & Talenta — IDEA Asia'
    : 'Capability — Tech Stack & Talent | IDEA Asia';
  const description = isId
    ? '40+ teknologi development, 25+ tools infrastruktur, 20+ stack keamanan, dan 24 peran IT siap embed dalam squad Anda. Pre-vetted dalam 5–7 hari.'
    : '40+ development technologies, 25+ infrastructure tools, 20+ security stacks, and 24 IT roles ready to embed in your squad. Pre-vetted in 5–7 days.';

  // ItemList JSON-LD — bantu Google parse coverage area kita
  const capabilityJsonLd = `<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    'name': title,
    'description': description,
    'url': (res.locals.siteUrl || 'https://ide.asia') + '/capability',
    'inLanguage': isId ? 'id' : 'en',
    'isPartOf': { '@id': (res.locals.siteUrl || 'https://ide.asia') + '#website' },
    'about': {
      '@type': 'ItemList',
      'name': 'Technology Stack & IT Talent Pool',
      'numberOfItems': 6,
      'itemListElement': [
        { '@type': 'ListItem', position: 1, name: 'Development Technologies' },
        { '@type': 'ListItem', position: 2, name: 'Cloud & Infrastructure' },
        { '@type': 'ListItem', position: 3, name: 'Security Stacks' },
        { '@type': 'ListItem', position: 4, name: 'Engineering Talent' },
        { '@type': 'ListItem', position: 5, name: 'DevOps & SRE Talent' },
        { '@type': 'ListItem', position: 6, name: 'Data, ML & AI Talent' },
      ],
    },
  })}</script>`;

  res.render('pages/capability', {
    title,
    description,
    ogImage: '/images/og-capability.jpg',
    currentPage: 'capability',
    jsonLd: capabilityJsonLd,
  });
});

module.exports = router;
