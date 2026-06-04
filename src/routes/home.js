// src/routes/home.js
const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');

// FAQPage + ProfessionalService JSON-LD for the homepage. This is the
// primary AEO (Answer Engine Optimization) asset — Google, Bing, and
// generative AI search systems use these Q&A pairs as authoritative
// snippets when answering questions about IT consulting in Indonesia.
function buildHomeJsonLd(siteUrl) {
  const orgId = `${siteUrl}#organization`;
  return `<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ProfessionalService',
        '@id': `${siteUrl}#service-org`,
        name: 'IDE Asia — PT Solusi Inovasi Bangsa',
        url: siteUrl,
        image: `${siteUrl}/images/og-home.jpg`,
        priceRange: '$$',
        telephone: '+62-818-0580-7807',
        email: 'info@ide.asia',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Graha Binakarsa 7th Floor, Jl. H.R. Rasuna Said Kav C-18',
          addressLocality: 'South Jakarta',
          addressRegion: 'DKI Jakarta',
          postalCode: '12940',
          addressCountry: 'ID',
        },
        areaServed: [
          { '@type': 'Country', name: 'Indonesia' },
          { '@type': 'Country', name: 'Vietnam' },
          { '@type': 'Country', name: 'Singapore' },
          { '@type': 'Country', name: 'Malaysia' },
          { '@type': 'Country', name: 'Australia' },
          { '@type': 'Place', name: 'Southeast Asia' },
        ],
        knowsAbout: [
          'IT Consulting', 'IT Outsourcing', 'Cloud Migration',
          'Cybersecurity', 'IBM watsonx', 'IBM Cloud', 'IBM Db2',
          'QRadar SIEM', 'IBM Z Mainframe', 'AWS', 'Microsoft Azure',
          'Google Cloud Platform', 'Kubernetes', 'OpenShift',
          'Information Security ISO 27001', 'OJK Compliance',
        ],
        slogan: 'Driving enterprise transformation through intelligent technology',
        founder: { '@type': 'Organization', name: 'PT Solusi Inovasi Bangsa' },
        foundingDate: '2019',
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'IDE Asia Services',
          itemListElement: [
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'IT Consulting', url: `${siteUrl}/services/it-consulting` } },
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'IT Outsourcing', url: `${siteUrl}/services/it-outsourcing` } },
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'IT Hiring', url: `${siteUrl}/services/it-hiring` } },
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Cloud Infrastructure', url: `${siteUrl}/services/cloud-infrastructure` } },
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'IT Security', url: `${siteUrl}/services/it-security` } },
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Squad Based Delivery', url: `${siteUrl}/services/squad-delivery` } },
          ],
        },
      },
      {
        '@type': 'FAQPage',
        '@id': `${siteUrl}#faq`,
        mainEntity: [
          {
            '@type': 'Question',
            name: 'What is IDE Asia?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'IDE Asia is the trading name of PT Solusi Inovasi Bangsa, an Indonesian enterprise IT services firm founded in 2013 (incorporated 2019). Headquartered in Jakarta with offices in Bandung, Hanoi, and Sydney. IDE Asia is an IBM Certified Partner, Deloitte Independent Contractor, and is ISO 9001:2015 + ISO 27001:2013 certified.',
            },
          },
          {
            '@type': 'Question',
            name: 'What services does IDE Asia offer?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Six service lines: IT Consulting (digital transformation strategy), IT Outsourcing (managed IT services, ~30% cost reduction, 99.5% SLA), IT Hiring (500+ pre-vetted candidates, 5-7 day shortlist), Cloud Infrastructure (AWS/Azure/GCP/IBM Cloud, ~40% cost reduction), IT Security (ISO 27001 certified, OJK/BI compliant, CEH/OSCP engineers), and Squad Based Delivery (dedicated agile squads, 2-week sprints).',
            },
          },
          {
            '@type': 'Question',
            name: 'Is IDE Asia an IBM partner?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes. IDE Asia is an official IBM Certified Partner authorized to source, deploy, integrate, and support the full IBM portfolio across watsonx, IBM Cloud, Db2, automation (Instana, Turbonomic), security (QRadar, Guardium, Verify), storage (FlashSystem), and mainframes (IBM Z, Power, LinuxONE). Full catalog: https://ide.asia/products.',
            },
          },
          {
            '@type': 'Question',
            name: 'Where is IDE Asia located?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Headquartered at Graha Binakarsa, 7th Floor, Jl. H.R. Rasuna Said Kav C-18, South Jakarta 12940, Indonesia. Other offices: Bandung (Indonesia), Hanoi (Vietnam), and Sydney (Australia).',
            },
          },
          {
            '@type': 'Question',
            name: 'Is IDE Asia OJK or BI compliant for Indonesian banking projects?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes. IDE Asia has delivered projects subject to OJK (Otoritas Jasa Keuangan) and BI (Bank Indonesia) regulatory requirements including data residency, vendor risk management, and audit trail. Engineers have OJK-experienced backgrounds. ISO 27001:2013 covers the information security baseline that financial services regulators require.',
            },
          },
          {
            '@type': 'Question',
            name: 'Which IBM product is best for online banking fraud detection?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'IBM Trusteer combines behavioral biometrics, device fingerprinting, and ML-based fraud scoring to detect account takeover and scams in real time. Often paired with QRadar SIEM for SOC-level correlation. IDE Asia delivers Trusteer for Indonesian and regional banks.',
            },
          },
          {
            '@type': 'Question',
            name: 'How do I get a quote from IDE Asia?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Three channels: email info@ide.asia, WhatsApp +62 818-0580-7807, or web form at https://ide.asia/contact. Typical first response is within 4 business hours during Jakarta hours (UTC+7), Monday to Friday. A free initial consultation is provided for qualified enterprise enquiries.',
            },
          },
          {
            '@type': 'Question',
            name: 'What clients has IDE Asia served?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Notable clients include Bank Jakarta, Bank Rakyat Indonesia (BRI), UOB Indonesia, Accenture, Telkomsel, Pertamina, and Semen Indonesia Group. IDE Asia has served 20+ enterprise clients across banking, telecommunications, insurance, manufacturing, oil & gas, and government sectors.',
            },
          },
        ],
      },
    ],
  })}</script>`;
}

router.get('/', async (req, res) => {
  try {
    const recentBlogs = await Blog.find({ published: true })
      .sort({ createdAt: -1 }).limit(3).select('title titleId slug excerpt excerptId category createdAt readTime');
    const siteUrl = res.locals.siteUrl || 'https://ide.asia';
    res.render('pages/home', {
      title: 'Integrated Digital Ecosystem Asia',
      description: 'Enterprise IT Consulting, Outsourcing, Cloud Infrastructure, IT Security, and Squad-Based Delivery across Southeast Asia. IBM Certified Partner. ISO 27001 certified.',
      ogImage: '/images/og-home.jpg',
      recentBlogs,
      currentPage: 'home',
      jsonLd: buildHomeJsonLd(siteUrl),
    });
  } catch (e) {
    const siteUrl = res.locals.siteUrl || 'https://ide.asia';
    res.render('pages/home', { title: 'Integrated Digital Ecosystem Asia', description: '', ogImage: '/images/og-home.jpg', recentBlogs: [], currentPage: 'home', jsonLd: buildHomeJsonLd(siteUrl) });
  }
});

// Set language
router.get('/lang/:lang', (req, res) => {
  const lang = ['en', 'id'].includes(req.params.lang) ? req.params.lang : 'en';
  res.cookie('lang', lang, { maxAge: 365 * 24 * 60 * 60 * 1000 });
  res.redirect('back');
});

module.exports = router;
