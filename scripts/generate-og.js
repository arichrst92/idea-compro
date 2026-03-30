#!/usr/bin/env node
/**
 * Generate placeholder OG images and favicon SVG
 * Run: node scripts/generate-og.js
 */
const fs = require('fs');
const path = require('path');

const imagesDir = path.join(__dirname, '../public/images');
if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });

// Favicon SVG (IDEA chevron mark)
const faviconSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" fill="#0a0a0a" rx="6"/>
  <path d="M8 24L16 10L18 14L12 24Z" fill="#1A50E8"/>
  <path d="M14 24L22 10L24 14L18 24Z" fill="#1A50E8" opacity="0.6"/>
</svg>`;
fs.writeFileSync(path.join(imagesDir, 'favicon.svg'), faviconSVG);

// OG image SVG templates
const ogPages = [
  { name: 'og-default', subtitle: 'Enterprise IT Solutions' },
  { name: 'og-home', subtitle: 'Enterprise IT Solutions for Asia' },
  { name: 'og-services', subtitle: 'IT Consulting, Cloud, Security & More' },
  { name: 'og-blog', subtitle: 'Technology Insights & Guides' },
  { name: 'og-about', subtitle: 'Our Story & Mission' },
  { name: 'og-contact', subtitle: 'Get In Touch With Our Team' },
  { name: 'og-it-consulting', subtitle: 'Strategic IT Advisory' },
  { name: 'og-it-outsourcing', subtitle: 'Managed IT Services' },
  { name: 'og-it-hiring', subtitle: 'Tech Talent Acquisition' },
  { name: 'og-cloud-infrastructure', subtitle: 'Cloud Migration & Architecture' },
  { name: 'og-it-security', subtitle: 'Cybersecurity Solutions' },
  { name: 'og-squad-delivery', subtitle: 'Agile Squad-Based Delivery' },
];

ogPages.forEach(({ name, subtitle }) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <rect width="1200" height="630" fill="#0a0a0a"/>
  <rect width="1200" height="630" fill="url(#grad)" opacity="0.4"/>
  <defs>
    <radialGradient id="grad" cx="30%" cy="20%" r="60%">
      <stop offset="0%" stop-color="#1A50E8" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="#0a0a0a" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <!-- Grid -->
  <g opacity="0.07" stroke="#ffffff" stroke-width="1">
    ${Array.from({length:25},(_,i)=>`<line x1="${i*50}" y1="0" x2="${i*50}" y2="630"/>`).join('')}
    ${Array.from({length:13},(_,i)=>`<line x1="0" y1="${i*50}" x2="1200" y2="${i*50}"/>`).join('')}
  </g>
  <!-- IDEA Chevron Mark -->
  <path d="M80 500L160 340L185 390L115 500Z" fill="#1A50E8"/>
  <path d="M130 500L210 340L235 390L165 500Z" fill="#1A50E8" opacity="0.5"/>
  <!-- Logo text -->
  <text x="80" y="280" font-family="Arial,sans-serif" font-size="96" font-weight="900" fill="white" letter-spacing="-4">IDEA</text>
  <text x="80" y="320" font-family="Arial,sans-serif" font-size="20" fill="rgba(255,255,255,0.5)" letter-spacing="6">INTEGRATED DIGITAL ECOSYSTEM ASIA</text>
  <!-- Subtitle -->
  <text x="80" y="390" font-family="Arial,sans-serif" font-size="32" fill="rgba(255,255,255,0.8)" font-weight="300">${subtitle}</text>
  <!-- Domain -->
  <text x="1120" y="590" font-family="Arial,sans-serif" font-size="18" fill="rgba(255,255,255,0.3)" text-anchor="end">idea-asia.com</text>
</svg>`;
  fs.writeFileSync(path.join(imagesDir, `${name}.svg`), svg);
  // Also save as .jpg placeholder note
  fs.writeFileSync(path.join(imagesDir, `${name}.jpg`), `SVG OG Image - replace with actual PNG/JPG for production`);
});

console.log('✅ OG images and favicon generated in public/images/');
console.log('📌 For production: convert SVGs to PNG/JPG (1200x630px) for better compatibility');
console.log('   Use: npx sharp-cli or Figma/Canva to create final images');
