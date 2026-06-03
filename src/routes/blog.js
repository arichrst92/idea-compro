const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');

router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 9;
    const category = req.query.category || '';
    const filter = { published: true };
    if (category) filter.category = category;
    const total = await Blog.countDocuments(filter);
    const blogs = await Blog.find(filter)
      .sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit)
      .select('title titleId slug excerpt excerptId category createdAt readTime tags');
    res.render('pages/blog', { currentPage: 'blog',
      title: 'Blog - IDEAsia - PT Solusi Inovasi Bangsa',
      description: 'Insights, guides and trends in IT Consulting, Cloud, Security and Digital Transformation.',
      ogImage: '/images/og-blog.jpg',
      blogs, page, limit, total, category,
      totalPages: Math.ceil(total / limit),
      currentPage: 'blog'
    });
  } catch (e) {
    res.render('pages/blog', { currentPage: 'blog',
      title: 'Blog - IDEAsia - PT Solusi Inovasi Bangsa', description: '', ogImage: '/images/og-blog.jpg',
      blogs: [], page: 1, limit: 9, total: 0, category: '', totalPages: 1, currentPage: 'blog'
    });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug, published: true });
    if (!blog) return res.status(404).render('pages/404', { title: '404', description: '' });
    blog.views++;
    await blog.save();
    const related = await Blog.find({ category: blog.category, _id: { $ne: blog._id }, published: true })
      .sort({ createdAt: -1 }).limit(3).select('title titleId slug excerpt excerptId createdAt readTime');
    res.render('pages/blog-detail', {
      currentPage: 'blog',
      title: blog.metaTitle || blog.title,
      description: blog.metaDescription || blog.excerpt,
      ogImage: blog.ogImage || '/images/og-blog.jpg',
      blog, related,
      currentPage: 'blog'
    });
  } catch (e) {
    res.status(500).render('pages/500', { title: 'Error', description: '' });
  }
});

module.exports = router;
