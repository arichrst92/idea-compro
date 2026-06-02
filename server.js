require('dotenv').config();
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const compression = require('compression');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const methodOverride = require('method-override');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Trust Nginx reverse proxy — needed for correct req.ip + express-rate-limit
// '1' = trust first hop (Nginx on same VPS). See https://expressjs.com/en/guide/behind-proxies.html
app.set('trust proxy', 1);

// Security & Performance
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://www.googletagmanager.com", "https://www.google-analytics.com", "https://cdnjs.cloudflare.com", "https://cdn.jsdelivr.net", "https://unpkg.com"],
      imgSrc: ["'self'", "data:", "blob:", "https:"],
      connectSrc: ["'self'", "blob:", "https://www.google-analytics.com", "https://region1.google-analytics.com", "https://api.groq.com", "https://cdnjs.cloudflare.com", "https://cdn.jsdelivr.net"],
      workerSrc: ["'self'", "blob:"],
      childSrc: ["'self'", "blob:"],
    }
  }
}));
app.use(compression());
app.use(morgan('combined'));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// Static files
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: process.env.NODE_ENV === 'production' ? '7d' : '0',
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.glb')) res.set('Content-Type', 'model/gltf-binary');
    if (filePath.endsWith('.gltf')) res.set('Content-Type', 'model/gltf+json');
  }
}));

// Rate limiting
const contactLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });
app.use('/contact/submit', contactLimiter);
// Limit OTP request (Fonnte) lebih ketat
const otpRequestLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 6, message: 'Terlalu banyak permintaan OTP, coba lagi 15 menit.' });
app.use('/admin/login', otpRequestLimiter);
const otpVerifyLimiter  = rateLimit({ windowMs: 15 * 60 * 1000, max: 30 });
app.use('/admin/verify', otpVerifyLimiter);
const agentLimiter = rateLimit({ windowMs: 60 * 1000, max: 20, message: { error: 'Too many requests, please slow down.' } });
app.use('/agent/chat', agentLimiter);

// Session — MongoStore dibuat SEKALI di module scope (bukan per-request).
// Dulu store dibuat di dalam middleware tiap request → MaxListeners leak di PM2 cluster.
const sessionStore = MongoStore.create({
  mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/idea_website',
  ttl: 8 * 60 * 60, // 8 hours, match cookie
  touchAfter: 24 * 3600, // lazy session update
});
sessionStore.on('error', (err) => console.error('MongoStore error:', err.message));

app.use(session({
  secret: process.env.ADMIN_SESSION_SECRET || 'idea-dev-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 8 * 60 * 60 * 1000, // 8 hours
  },
}));

// Template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');
app.set('layout extractScripts', true);
app.set('layout extractStyles', true);

// Global locals middleware
app.use((req, res, next) => {
  const lang = req.cookies.lang || req.query.lang || 'en';
  res.locals.lang = ['en', 'id'].includes(lang) ? lang : 'en';
  res.locals.siteUrl = process.env.SITE_URL || 'https://ide.asia';
  res.locals.siteName = process.env.SITE_NAME || 'IDEA Asia';
  res.locals.gaId = process.env.GA_MEASUREMENT_ID || '';
  res.locals.gscVerification = process.env.GSC_VERIFICATION || '';
  // Path tanpa query string — untuk canonical + hreflang
  res.locals.currentPath = req.path;
  next();
});

// Routes
app.use('/', require('./src/routes/home'));
app.use('/services', require('./src/routes/services'));
app.use('/blog', require('./src/routes/blog'));
app.use('/about', require('./src/routes/about'));
app.use('/contact', require('./src/routes/contact'));
app.use('/api', require('./src/routes/api'));
app.use('/admin', require('./src/routes/admin'));
app.use('/agent', require('./src/routes/agent'));

// 404
app.use((req, res) => {
  res.status(404).render('pages/404', { title: '404 - Page Not Found', description: 'Page not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('pages/500', { title: 'Server Error', description: 'Something went wrong' });
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/idea_website')
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => {
      console.log(`🚀 IDEA Website running on port ${PORT}`);
      console.log(`🔐 Admin panel: http://localhost:${PORT}/admin`);
      if (process.env.BLOG_ENABLED !== 'false') {
        require('./blog-bot/index');
        console.log('🤖 Blog bot started');
      }
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

module.exports = app;
