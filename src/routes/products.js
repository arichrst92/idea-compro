// src/routes/products.js
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  const lang = res.locals.lang || 'en';
  const isId = lang === 'id';

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
  });
});

module.exports = router;
