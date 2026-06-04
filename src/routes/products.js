// src/routes/products.js
const express = require('express');
const router = express.Router();
const { CATEGORIES, PRODUCTS, getBySlug, getCategory, getByCategoryId } = require('../data/ibm-products');

// ─── /products — catalog list (server-side filter via ?cat=) ──
router.get('/', (req, res) => {
  const lang = res.locals.lang || 'en';
  const isId = lang === 'id';

  // Server-side category filter, like the blog page (?category=)
  const activeCat = (typeof req.query.cat === 'string' && CATEGORIES.some(c => c.id === req.query.cat))
    ? req.query.cat
    : '';
  const filteredProducts = activeCat ? PRODUCTS.filter(p => p.categoryId === activeCat) : PRODUCTS;

  const title = isId
    ? 'Katalog Produk IBM — IDEA Asia'
    : 'IBM Product Catalog | IDEA Asia';
  const description = isId
    ? 'Katalog produk IBM yang dapat kami implementasikan untuk enterprise Anda — AI, Cloud, Data, Security, Automation, dan Integration. Partner resmi IBM di Asia Tenggara.'
    : 'IBM product catalog we implement for enterprise customers — AI, Cloud, Data, Security, Automation, and Integration. Official IBM partner in Southeast Asia.';

  res.render('pages/products', {
    title,
    description,
    ogImage: '/images/og-products.jpg',
    currentPage: 'products',
    categories: CATEGORIES,
    products: filteredProducts,
    activeCat,
  });
});

// ─── /products/:slug — product detail ─────────────────────────
router.get('/:slug', (req, res, next) => {
  const lang = res.locals.lang || 'en';
  const isId = lang === 'id';

  const product = getBySlug(req.params.slug);
  if (!product) return next(); // → 404 handler

  const category = getCategory(product.categoryId);
  const related = getByCategoryId(product.categoryId)
    .filter(p => p.slug !== product.slug)
    .slice(0, 3);

  const productName = product.name;
  const title = isId
    ? `${productName} — Implementasi oleh IDEA Asia`
    : `${productName} — Implemented by IDEA Asia`;
  const description = isId ? product.descLongId : product.descLongEn;

  // JSON-LD: Product + BreadcrumbList + FAQ for AEO snippet capture
  const siteUrl = process.env.SITE_URL || 'https://ide.asia';
  const productUrl = `${siteUrl}/products/${product.slug}`;
  const faqs = [
    [`What is ${product.name}?`, product.descLongEn],
    [`How does IDE Asia implement ${product.name}?`, `As an IBM Certified Partner, IDE Asia delivers ${product.name} implementations including architecture design, deployment, integration with existing systems, managed services, and internal team training. Typical implementation timeline: ${product.timeline}.`],
    [`What is the pricing model for ${product.name}?`, `${product.name} licensing model: ${product.tier}. Specific pricing depends on workload, region, and contract terms — contact IDE Asia at https://ide.asia/contact for an enterprise quote.`],
  ];

  const jsonLd = `<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Product',
        '@id': `${productUrl}#product`,
        name: productName,
        description: isId ? product.descLongId : product.descLongEn,
        brand: { '@type': 'Brand', name: 'IBM' },
        category: isId ? category.titleId : category.titleEn,
        url: productUrl,
        offers: {
          '@type': 'Offer',
          seller: { '@id': `${siteUrl}#organization` },
          availability: 'https://schema.org/InStock',
          priceCurrency: 'USD',
          priceSpecification: { '@type': 'PriceSpecification', valueAddedTaxIncluded: false },
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home',     item: siteUrl + '/' },
          { '@type': 'ListItem', position: 2, name: 'Products', item: siteUrl + '/products' },
          { '@type': 'ListItem', position: 3, name: isId ? category.titleId : category.titleEn, item: `${siteUrl}/products?cat=${category.id}` },
          { '@type': 'ListItem', position: 4, name: productName, item: productUrl },
        ],
      },
      {
        '@type': 'FAQPage',
        '@id': `${productUrl}#faq`,
        mainEntity: faqs.map(([q, a]) => ({
          '@type': 'Question',
          name: q,
          acceptedAnswer: { '@type': 'Answer', text: a },
        })),
      },
    ],
  })}</script>`;

  res.render('pages/product-detail', {
    title,
    description,
    ogImage: '/images/og-products.jpg',
    currentPage: 'products',
    product,
    category,
    related,
    jsonLd,
  });
});

module.exports = router;
