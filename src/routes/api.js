const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');

router.get('/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

// Sitemap XML
router.get('/sitemap.xml', async (req, res) => {
  const baseUrl = process.env.SITE_URL || 'https://idea-asia.com';
  const blogs = await Blog.find({ published: true }).select('slug updatedAt').sort({ updatedAt: -1 });
  const staticPages = ['', '/services', '/about', '/contact', '/blog',
    '/services/it-consulting', '/services/it-outsourcing', '/services/it-hiring',
    '/services/cloud-infrastructure', '/services/it-security', '/services/squad-delivery'];
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;
  for (const page of staticPages) {
    xml += `<url><loc>${baseUrl}${page}</loc><changefreq>weekly</changefreq><priority>${page === '' ? '1.0' : '0.8'}</priority></url>`;
  }
  for (const blog of blogs) {
    xml += `<url><loc>${baseUrl}/blog/${blog.slug}</loc><lastmod>${blog.updatedAt.toISOString().split('T')[0]}</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>`;
  }
  xml += '</urlset>';
  res.header('Content-Type', 'application/xml');
  res.send(xml);
});

// Robots.txt
router.get('/robots.txt', (req, res) => {
  const baseUrl = process.env.SITE_URL || 'https://idea-asia.com';
  res.type('text/plain');
  res.send(`User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: ${baseUrl}/api/sitemap.xml`);
});

module.exports = router;
