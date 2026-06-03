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
    ogImage: '/images/og-services.png',
    services: SERVICES_DATA,
    currentPage: 'services'
  });
});

router.get('/:slug', (req, res) => {
  const service = SERVICES_DATA.find(s => s.slug === req.params.slug);
  if (!service) return res.redirect('/services');
  res.render('pages/service-detail', {
    title: `${service.titleEn} - IDEAsia - PT Solusi Inovasi Bangsa`,
    description: service.descEn,
    ogImage: `/images/og-${service.slug}.png`,
    service,
    currentPage: 'services'
  });
});

module.exports = router;
module.exports.SERVICES_DATA = SERVICES_DATA;
