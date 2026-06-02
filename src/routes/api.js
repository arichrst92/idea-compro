const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');

router.get('/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

// Sitemap XML — include blog pagination + hreflang alternates
router.get('/sitemap.xml', async (req, res) => {
  const baseUrl = process.env.SITE_URL || 'https://ide.asia';
  const BLOGS_PER_PAGE = 9; // match src/routes/blog.js
  const blogs = await Blog.find({ published: true }).select('slug updatedAt').sort({ updatedAt: -1 });
  const totalBlogPages = Math.max(1, Math.ceil(blogs.length / BLOGS_PER_PAGE));

  const staticPages = [
    { path: '',                                    priority: '1.0', changefreq: 'weekly'  },
    { path: '/services',                           priority: '0.9', changefreq: 'monthly' },
    { path: '/services/it-consulting',             priority: '0.8', changefreq: 'monthly' },
    { path: '/services/it-outsourcing',            priority: '0.8', changefreq: 'monthly' },
    { path: '/services/it-hiring',                 priority: '0.8', changefreq: 'monthly' },
    { path: '/services/cloud-infrastructure',      priority: '0.8', changefreq: 'monthly' },
    { path: '/services/it-security',               priority: '0.8', changefreq: 'monthly' },
    { path: '/services/squad-delivery',            priority: '0.8', changefreq: 'monthly' },
    { path: '/about',                              priority: '0.7', changefreq: 'monthly' },
    { path: '/contact',                            priority: '0.7', changefreq: 'monthly' },
    { path: '/blog',                               priority: '0.8', changefreq: 'daily'   },
  ];
  // Blog list pagination
  for (let p = 2; p <= totalBlogPages; p++) {
    staticPages.push({ path: `/blog?page=${p}`, priority: '0.5', changefreq: 'weekly' });
  }

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">`;

  for (const page of staticPages) {
    const url = `${baseUrl}${page.path}`;
    const sep = page.path.includes('?') ? '&amp;' : '?';
    xml += `<url>`;
    xml += `<loc>${url}</loc>`;
    xml += `<changefreq>${page.changefreq}</changefreq>`;
    xml += `<priority>${page.priority}</priority>`;
    xml += `<xhtml:link rel="alternate" hreflang="en" href="${url}${sep}lang=en"/>`;
    xml += `<xhtml:link rel="alternate" hreflang="id" href="${url}${sep}lang=id"/>`;
    xml += `<xhtml:link rel="alternate" hreflang="x-default" href="${url}"/>`;
    xml += `</url>`;
  }
  for (const blog of blogs) {
    const url = `${baseUrl}/blog/${blog.slug}`;
    const lastmod = blog.updatedAt.toISOString().split('T')[0];
    xml += `<url>`;
    xml += `<loc>${url}</loc>`;
    xml += `<lastmod>${lastmod}</lastmod>`;
    xml += `<changefreq>monthly</changefreq>`;
    xml += `<priority>0.6</priority>`;
    xml += `<xhtml:link rel="alternate" hreflang="en" href="${url}?lang=en"/>`;
    xml += `<xhtml:link rel="alternate" hreflang="id" href="${url}?lang=id"/>`;
    xml += `<xhtml:link rel="alternate" hreflang="x-default" href="${url}"/>`;
    xml += `</url>`;
  }
  xml += '</urlset>';
  res.header('Content-Type', 'application/xml');
  res.send(xml);
});

// Robots.txt
router.get('/robots.txt', (req, res) => {
  const baseUrl = process.env.SITE_URL || 'https://ide.asia';
  res.type('text/plain');
  res.send(`User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /agent/chat

Sitemap: ${baseUrl}/sitemap.xml
`);
});

module.exports = router;
