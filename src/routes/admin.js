const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const Blog = require('../models/Blog');
const Contact = require('../models/Contact');
const OtpToken = require('../models/OtpToken');
const { requireAuth } = require('../middleware/auth');
const sanitizeHtml = require('sanitize-html');
const { generateBlogPost } = require('../../blog-bot/index');
const { sendWhatsApp, normalizePhone, generateOtp, otpMessage } = require('../services/fonnte');

// Admin layout flag (untuk halaman authed)
router.use((req, res, next) => {
  res.locals.adminLayout = true;
  next();
});

const SANITIZE_OPTS = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat([
    'h2', 'h3', 'h4', 'img', 'figure', 'figcaption',
    'strong', 'em', 'ul', 'ol', 'li', 'blockquote', 'pre', 'code',
  ]),
};

const CATEGORIES = [
  'it-consulting', 'it-outsourcing', 'it-hiring',
  'cloud-infrastructure', 'it-security', 'squad-delivery',
];

// ═══════════════════════════════════════════════════════════════════
// AUTH — WhatsApp OTP
// ═══════════════════════════════════════════════════════════════════

// STEP 1 — phone input
router.get('/login', (req, res) => {
  if (req.session.adminId) return res.redirect('/admin');
  res.render('admin/login', {
    layout: 'layouts/auth',
    title: 'Admin Login - IDEA Asia',
    description: '',
    currentPage: 'admin',
    error: req.query.error,
    info: req.query.info,
  });
});

// Request OTP — kirim kode via WA
router.post('/login', async (req, res) => {
  try {
    const phone = normalizePhone(req.body.phone);
    if (!phone) return res.redirect('/admin/login?error=invalid_phone');

    const admin = await Admin.findOne({ phone });
    if (!admin) {
      await new Promise(r => setTimeout(r, 500));
      return res.redirect('/admin/login?error=invalid_phone');
    }

    const recentCount = await OtpToken.countDocuments({ phone });
    if (recentCount >= 3) return res.redirect('/admin/login?error=too_many_otp');

    const code = generateOtp();
    const hash = await bcrypt.hash(code, 10);
    await OtpToken.create({ phone, hash });

    try {
      await sendWhatsApp(phone, otpMessage(code, 5));
    } catch (sendErr) {
      console.error('Fonnte send failed:', sendErr.message);
      return res.redirect('/admin/login?error=send_failed');
    }

    req.session.otpPhone = phone;
    req.session.otpRequestedAt = Date.now();
    const redirect = req.query.redirect || '/admin';
    res.redirect('/admin/verify?redirect=' + encodeURIComponent(redirect));
  } catch (e) {
    console.error('OTP request error:', e.stack || e);
    res.redirect('/admin/login?error=server');
  }
});

// STEP 2 — input OTP
router.get('/verify', (req, res) => {
  if (req.session.adminId) return res.redirect('/admin');
  if (!req.session.otpPhone) return res.redirect('/admin/login');
  const p = req.session.otpPhone;
  const masked = p.slice(0, 4) + 'xxxx' + p.slice(-4);
  res.render('admin/verify', {
    layout: 'layouts/auth',
    title: 'Verify OTP - IDEA Asia',
    description: '',
    currentPage: 'admin',
    error: req.query.error,
    maskedPhone: masked,
  });
});

router.post('/verify', async (req, res) => {
  try {
    const phone = req.session.otpPhone;
    if (!phone) return res.redirect('/admin/login');

    const code = String(req.body.otp || '').trim();
    if (!/^\d{6}$/.test(code)) return res.redirect('/admin/verify?error=invalid_code');

    const token = await OtpToken.findOne({ phone, used: false }).sort({ createdAt: -1 });
    if (!token) return res.redirect('/admin/login?error=otp_expired');
    if (token.attempts >= 5) return res.redirect('/admin/login?error=locked');

    const ok = await bcrypt.compare(code, token.hash);
    if (!ok) {
      token.attempts += 1;
      await token.save();
      return res.redirect('/admin/verify?error=wrong_code');
    }

    token.used = true;
    await token.save();
    await OtpToken.deleteMany({ phone, _id: { $ne: token._id } });

    const admin = await Admin.findOne({ phone });
    if (!admin) return res.redirect('/admin/login?error=invalid_phone');

    req.session.adminId = admin._id;
    req.session.adminUsername = admin.username;
    req.session.adminName = admin.name || admin.username;
    delete req.session.otpPhone;
    delete req.session.otpRequestedAt;

    await Admin.updateOne({ _id: admin._id }, { $set: { lastLogin: new Date() } });

    const redirect = req.query.redirect || '/admin';
    res.redirect(redirect);
  } catch (e) {
    console.error('OTP verify error:', e.stack || e);
    res.redirect('/admin/login?error=server');
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/admin/login?info=logged_out'));
});

// Helper: ambil common locals untuk semua admin pages
function adminLocals(req) {
  return {
    adminName:     req.session.adminName || req.session.adminUsername || 'Admin',
    adminUsername: req.session.adminUsername || 'Admin',
  };
}

// Provide global vars untuk SEMUA halaman ber-auth (sidebar pakai ini)
router.use(requireAuth, (req, res, next) => {
  Object.assign(res.locals, adminLocals(req));
  next();
});

// ═══════════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════════
router.get('/', async (req, res, next) => {
  try {
    const [totalBlogs, publishedBlogs, totalContacts, newContacts, recentBlogs, recentContacts, categoryStats] = await Promise.all([
      Blog.countDocuments(),
      Blog.countDocuments({ published: true }),
      Contact.countDocuments(),
      Contact.countDocuments({ status: 'new' }),
      Blog.find().sort({ createdAt: -1 }).limit(8).select('title slug category published views'),
      Contact.find().sort({ createdAt: -1 }).limit(8).select('name email service status createdAt'),
      Blog.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 }, views: { $sum: '$views' } } },
        { $sort: { count: -1 } },
      ]),
    ]);
    res.render('admin/dashboard', {
      ...adminLocals(req),
      layout: 'layouts/admin',
      title: 'Dashboard - IDEA Admin',
      description: '',
      currentPage: 'admin-dashboard',
      stats: { totalBlogs, publishedBlogs, totalContacts, newContacts },
      recentBlogs, recentContacts, categoryStats,
    });
  } catch (err) {
    console.error('Dashboard error:', err.stack || err);
    next(err);
  }
});

// ═══════════════════════════════════════════════════════════════════
// BLOG MANAGEMENT
// ═══════════════════════════════════════════════════════════════════
router.get('/blogs', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const search = (req.query.search || '').trim();
    const category = (req.query.category || '').trim();

    const filter = {};
    if (category) filter.category = category;
    if (search) filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { excerpt: { $regex: search, $options: 'i' } },
    ];

    const [blogs, total] = await Promise.all([
      Blog.find(filter).sort({ createdAt: -1 }).skip((page-1)*limit).limit(limit)
        .select('title slug category published createdAt views readTime'),
      Blog.countDocuments(filter),
    ]);

    res.render('admin/blogs', {
      ...adminLocals(req),
      layout: 'layouts/admin',
      title: 'Blog Posts - IDEA Admin',
      description: '',
      currentPage: 'admin-blogs',
      blogs, page, total, limit,
      totalPages: Math.ceil(total/limit) || 1,
      search, category,
    });
  } catch (err) {
    console.error('Blog list error:', err.stack || err);
    next(err);
  }
});

router.get('/blogs/new', (req, res) => {
  res.render('admin/blog-form', {
    ...adminLocals(req),
    layout: 'layouts/admin',
    title: 'New Blog Post - IDEA Admin',
    description: '',
    currentPage: 'admin-blog-new',
    blog: null,
    isNew: true,
    error: null,
  });
});

router.post('/blogs/new', async (req, res) => {
  try {
    const { title, titleId, excerpt, excerptId, content, contentId, category, tags, metaTitle, metaDescription, published, featured } = req.body;
    const blog = new Blog({
      title: title.trim(),
      titleId: (titleId || '').trim(),
      excerpt: excerpt.trim(),
      excerptId: (excerptId || '').trim(),
      content: sanitizeHtml(content, SANITIZE_OPTS),
      contentId: contentId ? sanitizeHtml(contentId, SANITIZE_OPTS) : '',
      category,
      tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      metaTitle: (metaTitle || '').trim(),
      metaDescription: (metaDescription || '').trim(),
      published: published === 'on' || published === 'true' || published === true,
      featured: featured === 'on' || featured === 'true' || featured === true,
    });
    await blog.save();
    res.redirect('/admin/blogs?success=created');
  } catch (e) {
    res.render('admin/blog-form', {
      ...adminLocals(req),
      layout: 'layouts/admin',
      title: 'New Blog Post - IDEA Admin',
      description: '',
      currentPage: 'admin-blog-new',
      blog: req.body, isNew: true, error: e.message,
    });
  }
});

router.get('/blogs/:id/edit', async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.redirect('/admin/blogs?error=not_found');
    res.render('admin/blog-form', {
      ...adminLocals(req),
      layout: 'layouts/admin',
      title: 'Edit Blog - IDEA Admin',
      description: '',
      currentPage: 'admin-blogs',
      blog, isNew: false, error: null,
    });
  } catch (err) { next(err); }
});

router.post('/blogs/:id/edit', async (req, res, next) => {
  try {
    const { title, titleId, excerpt, excerptId, content, contentId, category, tags, metaTitle, metaDescription, published, featured } = req.body;
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.redirect('/admin/blogs');
    blog.title = title.trim();
    blog.titleId = (titleId || '').trim();
    blog.excerpt = excerpt.trim();
    blog.excerptId = (excerptId || '').trim();
    blog.content = sanitizeHtml(content, SANITIZE_OPTS);
    blog.contentId = contentId ? sanitizeHtml(contentId, SANITIZE_OPTS) : '';
    blog.category = category;
    blog.tags = tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [];
    blog.metaTitle = (metaTitle || '').trim();
    blog.metaDescription = (metaDescription || '').trim();
    blog.published = published === 'on' || published === 'true' || published === true;
    blog.featured  = featured  === 'on' || featured  === 'true' || featured  === true;
    await blog.save();
    res.redirect('/admin/blogs?success=updated');
  } catch (e) {
    const blog = await Blog.findById(req.params.id);
    res.render('admin/blog-form', {
      ...adminLocals(req),
      layout: 'layouts/admin',
      title: 'Edit Blog - IDEA Admin',
      description: '',
      currentPage: 'admin-blogs',
      blog, isNew: false, error: e.message,
    });
  }
});

router.post('/blogs/:id/delete', async (req, res, next) => {
  try {
    await Blog.findByIdAndDelete(req.params.id);
    res.redirect('/admin/blogs?success=deleted');
  } catch (err) { next(err); }
});

router.post('/blogs/:id/toggle', async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (blog) { blog.published = !blog.published; await blog.save(); }
    res.redirect('/admin/blogs');
  } catch (err) { next(err); }
});

// ═══════════════════════════════════════════════════════════════════
// BLOG BOT (manual trigger)
// View posts ke /admin/bot/generate
// ═══════════════════════════════════════════════════════════════════
router.post('/bot/generate', async (req, res) => {
  try {
    const blog = await generateBlogPost();
    if (req.xhr || req.headers.accept?.includes('application/json')) {
      return res.json({ success: true, message: `"${blog?.title}" generated`, slug: blog?.slug });
    }
    res.redirect('/admin/blogs?success=generated');
  } catch (e) {
    if (req.xhr || req.headers.accept?.includes('application/json')) {
      return res.json({ success: false, message: e.message });
    }
    res.redirect('/admin/blogs?error=bot_failed');
  }
});

// ═══════════════════════════════════════════════════════════════════
// CONTACT MANAGEMENT
// ═══════════════════════════════════════════════════════════════════
router.get('/contacts', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const status = (req.query.status || '').trim();

    const filter = {};
    if (['new', 'read', 'replied', 'archived'].includes(status)) filter.status = status;

    const [contacts, total] = await Promise.all([
      Contact.find(filter).sort({ createdAt: -1 }).skip((page-1)*limit).limit(limit),
      Contact.countDocuments(filter),
    ]);
    res.render('admin/contacts', {
      ...adminLocals(req),
      layout: 'layouts/admin',
      title: 'Contacts - IDEA Admin',
      description: '',
      currentPage: 'admin-contacts',
      contacts, page, total, limit,
      totalPages: Math.ceil(total/limit) || 1,
      status,
    });
  } catch (err) { next(err); }
});

router.get('/contacts/:id', async (req, res, next) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) return res.redirect('/admin/contacts');
    // Auto-mark as read on open
    if (contact.status === 'new') {
      contact.status = 'read';
      await contact.save();
    }
    res.render('admin/contact-detail', {
      ...adminLocals(req),
      layout: 'layouts/admin',
      title: `Contact from ${contact.name} - IDEA Admin`,
      description: '',
      currentPage: 'admin-contacts',
      contact,
    });
  } catch (err) { next(err); }
});

router.post('/contacts/:id/status', async (req, res, next) => {
  try {
    const status = req.body.status;
    if (!['new', 'read', 'replied', 'archived'].includes(status)) {
      return res.redirect('/admin/contacts');
    }
    await Contact.updateOne({ _id: req.params.id }, { $set: { status } });
    res.redirect(req.get('Referer') || '/admin/contacts');
  } catch (err) { next(err); }
});

router.post('/contacts/:id/delete', async (req, res, next) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.redirect('/admin/contacts?success=deleted');
  } catch (err) { next(err); }
});

module.exports = router;
