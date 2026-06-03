const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const Blog = require('../models/Blog');
const OtpToken = require('../models/OtpToken');
const { requireAuth } = require('../middleware/auth');
const sanitizeHtml = require('sanitize-html');
const { generateBlogPost } = require('../../blog-bot/index');
const { sendWhatsApp, normalizePhone, generateOtp, otpMessage } = require('../services/fonnte');

// Admin layout
router.use((req, res, next) => {
  res.locals.adminLayout = true;
  next();
});

// ─── LOGIN: STEP 1 — phone input ─────────────────────────────────────
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

// ─── LOGIN: REQUEST OTP — kirim kode via WA ──────────────────────────
router.post('/login', async (req, res) => {
  try {
    const phone = normalizePhone(req.body.phone);
    if (!phone) {
      return res.redirect('/admin/login?error=invalid_phone');
    }

    // Hanya admin terdaftar yang bisa request OTP
    const admin = await Admin.findOne({ phone });
    if (!admin) {
      // Constant-time-ish: tetap delay sebentar untuk menghindari enumeration
      await new Promise(r => setTimeout(r, 500));
      return res.redirect('/admin/login?error=invalid_phone');
    }

    // Throttle: max 3 OTP / phone / 5 menit (TTL window)
    const recentCount = await OtpToken.countDocuments({ phone });
    if (recentCount >= 3) {
      return res.redirect('/admin/login?error=too_many_otp');
    }

    // Generate & store
    const code = generateOtp();
    const hash = await bcrypt.hash(code, 10);
    await OtpToken.create({ phone, hash });

    // Kirim via Fonnte
    try {
      await sendWhatsApp(phone, otpMessage(code, 5));
    } catch (sendErr) {
      console.error('Fonnte send failed:', sendErr.message);
      return res.redirect('/admin/login?error=send_failed');
    }

    // Simpan phone di session untuk step verify (jangan ekspos di URL)
    req.session.otpPhone = phone;
    req.session.otpRequestedAt = Date.now();

    const redirect = req.query.redirect || '/admin';
    res.redirect('/admin/verify?redirect=' + encodeURIComponent(redirect));
  } catch (e) {
    console.error('OTP request error:', e);
    res.redirect('/admin/login?error=server');
  }
});

// ─── LOGIN: STEP 2 — input OTP ───────────────────────────────────────
router.get('/verify', (req, res) => {
  if (req.session.adminId) return res.redirect('/admin');
  if (!req.session.otpPhone) return res.redirect('/admin/login');
  // Mask phone untuk UI: 628xxxxxx1234
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
    if (!/^\d{6}$/.test(code)) {
      return res.redirect('/admin/verify?error=invalid_code');
    }

    // Ambil OTP terbaru untuk phone ini, yang belum used
    const token = await OtpToken.findOne({ phone, used: false }).sort({ createdAt: -1 });
    if (!token) {
      return res.redirect('/admin/login?error=otp_expired');
    }
    if (token.attempts >= 5) {
      return res.redirect('/admin/login?error=locked');
    }

    const ok = await bcrypt.compare(code, token.hash);
    if (!ok) {
      token.attempts += 1;
      await token.save();
      return res.redirect('/admin/verify?error=wrong_code');
    }

    // Sukses — mark used + invalidate semua OTP lama untuk phone ini
    token.used = true;
    await token.save();
    await OtpToken.deleteMany({ phone, _id: { $ne: token._id } });

    const admin = await Admin.findOne({ phone });
    if (!admin) return res.redirect('/admin/login?error=invalid_phone');

    req.session.adminId = admin._id;
    req.session.adminUsername = admin.username;
    delete req.session.otpPhone;
    delete req.session.otpRequestedAt;

    // updateOne (bukan save) untuk skip schema validation yang mungkin gagal
    // pada dokumen lama yang field-nya tidak lengkap (mis. password required).
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

// ─── DASHBOARD ───────────────────────────────────────────────────────
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const [total, published, categories] = await Promise.all([
      Blog.countDocuments(),
      Blog.countDocuments({ published: true }),
      Blog.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
    ]);
    const recentBlogs = await Blog.find().sort({ createdAt: -1 }).limit(10)
      .select('title slug category published createdAt views readTime');
    res.render('admin/dashboard', {
      layout: 'layouts/admin',
      title: 'Dashboard - IDEA Admin',
      description: '',
      currentPage: 'admin-dashboard',
      stats: { total, published, draft: total - published, categories: categories || [] },
      recentBlogs: recentBlogs || [],
      adminUsername: req.session.adminUsername || 'Admin',
    });
  } catch (err) {
    console.error('Dashboard error:', err.stack || err);
    next(err);
  }
});

// ─── BLOG LIST ───────────────────────────────────────────────────────
router.get('/blogs', requireAuth, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 20;
  const filter = {};
  if (req.query.category) filter.category = req.query.category;
  if (req.query.status === 'published') filter.published = true;
  if (req.query.status === 'draft') filter.published = false;
  const [blogs, total] = await Promise.all([
    Blog.find(filter).sort({ createdAt: -1 }).skip((page-1)*limit).limit(limit)
      .select('title slug category published createdAt views readTime'),
    Blog.countDocuments(filter),
  ]);
  res.render('admin/blogs', {
    layout: 'layouts/admin',
    title: 'Blogs - IDEA Admin',
    description: '',
    currentPage: 'admin',
    blogs, page, total, limit,
    totalPages: Math.ceil(total/limit),
    filter: req.query,
    adminUsername: req.session.adminUsername,
  });
});

// ─── NEW BLOG ─────────────────────────────────────────────────────────
router.get('/blogs/new', requireAuth, (req, res) => {
  res.render('admin/blog-form', {
    layout: 'layouts/admin',
    title: 'New Blog - IDEA Admin',
    description: '',
    currentPage: 'admin',
    blog: null,
    mode: 'create',
    adminUsername: req.session.adminUsername,
    error: null,
  });
});

router.post('/blogs/new', requireAuth, async (req, res) => {
  try {
    const { title, titleId, excerpt, excerptId, content, contentId, category, tags, published } = req.body;
    const blog = new Blog({
      title: title.trim(),
      titleId: titleId?.trim(),
      excerpt: excerpt.trim(),
      excerptId: excerptId?.trim(),
      content: sanitizeHtml(content, { allowedTags: sanitizeHtml.defaults.allowedTags.concat(['h2','h3','h4','img','figure','figcaption','strong','em','ul','ol','li','blockquote','pre','code']) }),
      contentId: contentId ? sanitizeHtml(contentId, { allowedTags: sanitizeHtml.defaults.allowedTags.concat(['h2','h3','h4','img','figure','figcaption','strong','em','ul','ol','li','blockquote','pre','code']) }) : '',
      category,
      tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      published: published === 'on',
    });
    await blog.save();
    res.redirect('/admin/blogs?success=created');
  } catch (e) {
    res.render('admin/blog-form', {
      layout: 'layouts/admin', title: 'New Blog - IDEA Admin', description: '', currentPage: 'admin',
      blog: req.body, mode: 'create', adminUsername: req.session.adminUsername, error: e.message,
    });
  }
});

// ─── EDIT BLOG ────────────────────────────────────────────────────────
router.get('/blogs/:id/edit', requireAuth, async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) return res.redirect('/admin/blogs');
  res.render('admin/blog-form', {
    layout: 'layouts/admin',
    title: 'Edit Blog - IDEA Admin',
    description: '',
    currentPage: 'admin',
    blog,
    mode: 'edit',
    adminUsername: req.session.adminUsername,
    error: null,
  });
});

router.post('/blogs/:id/edit', requireAuth, async (req, res) => {
  try {
    const { title, titleId, excerpt, excerptId, content, contentId, category, tags, published } = req.body;
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.redirect('/admin/blogs');
    blog.title = title.trim();
    blog.titleId = titleId?.trim();
    blog.excerpt = excerpt.trim();
    blog.excerptId = excerptId?.trim();
    blog.content = sanitizeHtml(content, { allowedTags: sanitizeHtml.defaults.allowedTags.concat(['h2','h3','h4','img','figure','figcaption','strong','em','ul','ol','li','blockquote','pre','code']) });
    blog.contentId = contentId ? sanitizeHtml(contentId, { allowedTags: sanitizeHtml.defaults.allowedTags.concat(['h2','h3','h4','img','figure','figcaption','strong','em','ul','ol','li','blockquote','pre','code']) }) : '';
    blog.category = category;
    blog.tags = tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [];
    blog.published = published === 'on';
    await blog.save();
    res.redirect('/admin/blogs?success=updated');
  } catch (e) {
    const blog = await Blog.findById(req.params.id);
    res.render('admin/blog-form', {
      layout: 'layouts/admin', title: 'Edit Blog - IDEA Admin', description: '', currentPage: 'admin',
      blog, mode: 'edit', adminUsername: req.session.adminUsername, error: e.message,
    });
  }
});

// ─── DELETE BLOG ──────────────────────────────────────────────────────
router.post('/blogs/:id/delete', requireAuth, async (req, res) => {
  await Blog.findByIdAndDelete(req.params.id);
  res.redirect('/admin/blogs?success=deleted');
});

// ─── TOGGLE PUBLISH ───────────────────────────────────────────────────
router.post('/blogs/:id/toggle', requireAuth, async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (blog) { blog.published = !blog.published; await blog.save(); }
  res.json({ published: blog?.published });
});

// ─── GENERATE BLOG (manual trigger) ──────────────────────────────────
router.post('/generate-blog', requireAuth, async (req, res) => {
  try {
    const blog = await generateBlogPost();
    res.json({ success: true, message: `Blog "${blog?.title}" generated`, slug: blog?.slug });
  } catch (e) {
    res.json({ success: false, message: e.message });
  }
});

module.exports = router;
