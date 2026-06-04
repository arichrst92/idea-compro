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

  // JSON-LD: Product schema
  const jsonLd = `<script type="application/ld+json">
${JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: productName,
  description: isId ? product.descLongId : product.descLongEn,
  brand: { '@type': 'Brand', name: 'IBM' },
  category: isId ? category.titleId : category.titleEn,
  url: (process.env.SITE_URL || 'https://ide.asia') + '/products/' + product.slug,
  offers: {
    '@type': 'Offer',
    seller: {
      '@type': 'Organization',
      name: 'PT Solusi Inovasi Bangsa (IDEA Asia)',
    },
    availability: 'https://schema.org/InStock',
  },
}, null, 2)}
</script>`;

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
