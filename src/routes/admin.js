const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const Blog = require('../models/Blog');
const { requireAuth } = require('../middleware/auth');
const sanitizeHtml = require('sanitize-html');
const { generateBlogPost } = require('../../blog-bot/index');

// Admin layout — all admin pages use admin layout
router.use((req, res, next) => {
  res.locals.adminLayout = true;
  next();
});

// ─── LOGIN ───────────────────────────────────────────────────────────
router.get('/login', (req, res) => {
  if (req.session.adminId) return res.redirect('/admin');
  res.render('admin/login', {
    layout: 'layouts/admin',
    title: 'Admin Login - IDEA Asia',
    description: '',
    currentPage: 'admin',
    error: req.query.error,
  });
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username: username.toLowerCase() });
    if (!admin || !(await admin.comparePassword(password))) {
      return res.redirect('/admin/login?error=invalid');
    }
    req.session.adminId = admin._id;
    req.session.adminUsername = admin.username;
    admin.lastLogin = new Date();
    await admin.save();
    const redirect = req.query.redirect || '/admin';
    res.redirect(redirect);
  } catch (e) {
    console.error(e);
    res.redirect('/admin/login?error=server');
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/admin/login');
});

// ─── DASHBOARD ───────────────────────────────────────────────────────
router.get('/', requireAuth, async (req, res) => {
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
    currentPage: 'admin',
    stats: { total, published, draft: total - published, categories },
    recentBlogs,
    adminUsername: req.session.adminUsername,
  });
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
