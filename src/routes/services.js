// src/routes/services.js
const express = require('express');
const router = express.Router();

const SERVICES_DATA = [
  {
    slug: 'it-consulting',
    icon: 'consulting',
    titleEn: 'IT Consulting',
    titleId: 'Konsultasi IT',
    descEn: 'Strategic technology advisory to align your IT investments with business objectives. We help organizations design robust digital roadmaps.',
    descId: 'Konsultasi teknologi strategis untuk menyelaraskan investasi IT Anda dengan tujuan bisnis. Kami membantu organisasi merancang peta jalan digital yang kuat.',
    features: ['Digital Transformation Strategy', 'IT Architecture Review', 'Technology Roadmap', 'Vendor Selection', 'IT Governance Framework'],
    featuresId: ['Strategi Transformasi Digital', 'Review Arsitektur IT', 'Peta Jalan Teknologi', 'Pemilihan Vendor', 'Framework Tata Kelola IT'],
  },
  {
    slug: 'it-outsourcing',
    icon: 'outsourcing',
    titleEn: 'IT Outsourcing',
    titleId: 'Outsourcing IT',
    descEn: 'End-to-end managed IT services that reduce operational complexity and cost while elevating service quality and reliability.',
    descId: 'Layanan IT terkelola end-to-end yang mengurangi kompleksitas operasional dan biaya sambil meningkatkan kualitas dan keandalan layanan.',
    features: ['Managed IT Services', 'Helpdesk & Support', 'Infrastructure Management', 'Application Management', 'SLA-driven Operations'],
    featuresId: ['Layanan IT Terkelola', 'Helpdesk & Dukungan', 'Manajemen Infrastruktur', 'Manajemen Aplikasi', 'Operasi Berbasis SLA'],
  },
  {
    slug: 'it-hiring',
    icon: 'hiring',
    titleEn: 'IT Hiring',
    titleId: 'Rekrutmen IT',
    descEn: 'Expert talent acquisition connecting top-tier tech professionals with organizations seeking the right digital talent.',
    descId: 'Akuisisi talenta ahli yang menghubungkan profesional teknologi terbaik dengan organisasi yang mencari talenta digital yang tepat.',
    features: ['Technical Talent Sourcing', 'IT Staff Augmentation', 'Executive IT Placement', 'Contract & Permanent Hire', 'Technical Assessments'],
    featuresId: ['Pencarian Talenta Teknis', 'Penambahan Staf IT', 'Penempatan Eksekutif IT', 'Rekrutmen Kontrak & Permanen', 'Asesmen Teknis'],
  },
  {
    slug: 'cloud-infrastructure',
    icon: 'cloud',
    titleEn: 'Cloud Infrastructure',
    titleId: 'Infrastruktur Cloud',
    descEn: 'Modern cloud architecture, migration, and optimization services across AWS, Azure, and GCP to power your digital enterprise.',
    descId: 'Arsitektur cloud modern, migrasi, dan layanan optimasi di AWS, Azure, dan GCP untuk mendukung perusahaan digital Anda.',
    features: ['Cloud Migration', 'Multi-Cloud Architecture', 'DevOps & CI/CD', 'Kubernetes & Containers', 'Cost Optimization'],
    featuresId: ['Migrasi Cloud', 'Arsitektur Multi-Cloud', 'DevOps & CI/CD', 'Kubernetes & Kontainer', 'Optimasi Biaya'],
  },
  {
    slug: 'it-security',
    icon: 'security',
    titleEn: 'IT Security',
    titleId: 'Keamanan IT',
    descEn: 'Comprehensive cybersecurity solutions protecting your enterprise from evolving threats with proactive defense strategies.',
    descId: 'Solusi keamanan siber komprehensif yang melindungi perusahaan Anda dari ancaman yang terus berkembang dengan strategi pertahanan proaktif.',
    features: ['Security Audit & Assessment', 'Penetration Testing', 'SOC & SIEM', 'Zero Trust Implementation', 'Compliance & Governance'],
    featuresId: ['Audit & Asesmen Keamanan', 'Penetration Testing', 'SOC & SIEM', 'Implementasi Zero Trust', 'Kepatuhan & Tata Kelola'],
  },
  {
    slug: 'squad-delivery',
    icon: 'squad',
    titleEn: 'Squad Based Delivery',
    titleId: 'Squad Based Delivery',
    descEn: 'Agile, cross-functional squads embedded in your organization to accelerate product delivery and digital innovation at scale.',
    descId: 'Squad lintas fungsi yang agile, tertanam dalam organisasi Anda untuk mempercepat pengiriman produk dan inovasi digital dalam skala besar.',
    features: ['Dedicated Agile Squads', 'Product Engineering', 'Design & UX', 'Quality Engineering', 'Delivery Management'],
    featuresId: ['Squad Agile Dedikasi', 'Rekayasa Produk', 'Desain & UX', 'Rekayasa Kualitas', 'Manajemen Pengiriman'],
  },
];

router.get('/', (req, res) => {
  res.render('pages/services', {
    title: 'Our Services - IDEAsia - PT Solusi Inovasi Bangsa',
    description: 'IT Consulting, Outsourcing, Hiring, Cloud Infrastructure, Security and Squad-Based Delivery services.',
    ogImage: '/images/og-services.jpg',
    services: SERVICES_DATA,
    currentPage: 'services'
  });
});

// Per-service FAQ (used by AEO / generative search snippets)
const SERVICE_FAQ = {
  'it-consulting': [
    ['What is IT consulting at IDE Asia?', 'IDE Asia IT consulting delivers digital transformation strategy, IT architecture review, technology roadmap, vendor selection, and IT governance frameworks for enterprise clients. Typical engagement is 6–8 weeks and reduces business-IT misalignment by approximately 35%.'],
    ['How much does IT consulting cost?', 'Pricing depends on engagement scope. Discovery and roadmap engagements are commonly fixed-fee; implementation projects are time-and-materials. IDE Asia provides a free initial consultation at https://ide.asia/contact.'],
    ['What industries does IDE Asia consult for?', 'Banking and financial services (BRI, UOB, Bank Jakarta), telecommunications (Telkomsel), energy (Pertamina), manufacturing (Semen Indonesia Group), and government sectors across Southeast Asia.'],
  ],
  'it-outsourcing': [
    ['What is IT outsourcing at IDE Asia?', 'End-to-end managed IT services including helpdesk and support, infrastructure management, application management, and SLA-driven operations. Clients typically see 30% cost reduction versus in-house, with 99.5% uptime SLA.'],
    ['What SLAs does IDE Asia offer?', 'Standard managed-service SLAs include 99.5% uptime, defined response and resolution times by priority tier, and 24/7 support for critical systems. Custom SLAs are available for regulated workloads.'],
    ['Can IDE Asia handle banking workloads?', 'Yes. ISO 27001:2013 certified, with OJK/BI compliance experience for Indonesian financial services and 24/7 SOC capabilities.'],
  ],
  'it-hiring': [
    ['How does IDE Asia source IT talent?', 'Pool of 500+ pre-vetted candidates across engineering, data, security, and DevOps. Typical shortlist delivery is 5–7 days. Permanent placement, contract, and staff augmentation models available.'],
    ['What roles can IDE Asia hire for?', 'Full-stack engineers, backend (Java, Go, Python, Node.js), frontend (React, Next.js, Vue), DevOps and SRE, cloud architects (AWS/Azure/GCP/IBM Cloud), data engineers, ML engineers, security engineers (SOC analyst, penetration tester), and engineering managers.'],
  ],
  'cloud-infrastructure': [
    ['What cloud platforms does IDE Asia support?', 'AWS, Microsoft Azure, Google Cloud Platform, and IBM Cloud. Multi-cloud architecture, migration, DevOps & CI/CD, Kubernetes/OpenShift, and FinOps cost optimization.'],
    ['Does IDE Asia do AWS to IBM Cloud migration?', 'Yes. IDE Asia delivers cross-cloud migration including AWS↔IBM Cloud and AWS↔Azure with zero-downtime methodology and typical 40% cost reduction depending on workload.'],
    ['Can IDE Asia handle banking cloud workloads?', 'Yes. IBM Cloud financial-services-validated regions plus IBM Cloud Satellite for on-prem extension support OJK data sovereignty requirements.'],
  ],
  'it-security': [
    ['What security services does IDE Asia provide?', 'Security audit and assessment, penetration testing, SOC and SIEM operations, Zero Trust implementation, and compliance and governance. Engineers hold CEH and OSCP certifications.'],
    ['Is IDE Asia ISO 27001 certified?', 'Yes. IDE Asia holds ISO 27001:2013 certification with annual audit. The company is also OJK/BI compliance experienced for Indonesian financial services.'],
    ['Which SIEM does IDE Asia recommend?', 'IBM QRadar SIEM is the primary recommendation for enterprise SOCs requiring AI-driven threat prioritization, MITRE ATT&CK mapping, and integration across 700+ data sources.'],
  ],
  'squad-delivery': [
    ['What is squad-based delivery?', 'Dedicated cross-functional agile squads (typically 5–9 members) embedded in client organizations to accelerate product engineering, design and UX, quality engineering, and delivery management. Two-week sprint cadence.'],
    ['How is squad delivery different from outsourcing?', 'Outsourcing manages your existing systems; squad delivery builds new product capabilities. Squads operate as an extension of client product teams with shared backlog and ceremonies.'],
  ],
};

router.get('/:slug', (req, res) => {
  const service = SERVICES_DATA.find(s => s.slug === req.params.slug);
  if (!service) return res.redirect('/services');

  const siteUrl = res.locals.siteUrl || 'https://ide.asia';
  const serviceUrl = `${siteUrl}/services/${service.slug}`;
  const faqs = SERVICE_FAQ[service.slug] || [];

  const jsonLd = `<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        '@id': `${serviceUrl}#service`,
        name: service.titleEn,
        description: service.descEn,
        url: serviceUrl,
        provider: { '@id': `${siteUrl}#organization` },
        areaServed: [
          { '@type': 'Place', name: 'Indonesia' },
          { '@type': 'Place', name: 'Southeast Asia' },
        ],
        serviceType: service.titleEn,
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: `${service.titleEn} capabilities`,
          itemListElement: service.features.map((f, i) => ({
            '@type': 'Offer',
            position: i + 1,
            itemOffered: { '@type': 'Service', name: f },
          })),
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl + '/' },
          { '@type': 'ListItem', position: 2, name: 'Services', item: siteUrl + '/services' },
          { '@type': 'ListItem', position: 3, name: service.titleEn, item: serviceUrl },
        ],
      },
      faqs.length ? {
        '@type': 'FAQPage',
        '@id': `${serviceUrl}#faq`,
        mainEntity: faqs.map(([q, a]) => ({
          '@type': 'Question',
          name: q,
          acceptedAnswer: { '@type': 'Answer', text: a },
        })),
      } : null,
    ].filter(Boolean),
  })}</script>`;

  res.render('pages/service-detail', {
    title: `${service.titleEn} — IDE Asia | PT Solusi Inovasi Bangsa`,
    description: service.descEn,
    ogImage: `/images/og-${service.slug}.jpg`,
    service,
    currentPage: 'services',
    jsonLd,
  });
});

module.exports = router;
module.exports.SERVICES_DATA = SERVICES_DATA;
