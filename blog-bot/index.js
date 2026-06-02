const cron = require('node-cron');
const axios = require('axios');
const mongoose = require('mongoose');

let Blog;
const getBlogModel = () => {
  if (!Blog) Blog = require('../src/models/Blog');
  return Blog;
};

const SERVICES = [
  { key: 'it-consulting',        name: 'IT Consulting' },
  { key: 'it-outsourcing',       name: 'IT Outsourcing' },
  { key: 'it-hiring',            name: 'IT Hiring' },
  { key: 'cloud-infrastructure', name: 'Cloud Infrastructure' },
  { key: 'it-security',          name: 'IT Security' },
  { key: 'squad-delivery',       name: 'Squad Based Delivery' },
];

const TOPICS = {
  'it-consulting':        ['How to align IT strategy with business goals','Digital transformation roadmap: where to start','ROI of IT consulting for mid-size enterprises','Building a technology governance framework','Common IT consulting mistakes to avoid'],
  'it-outsourcing':       ['IT outsourcing vs in-house: which is right for you','Managing remote IT teams effectively','Cost benefits of IT outsourcing in Southeast Asia','SLA best practices in IT outsourcing','How to transition to an outsourced IT model'],
  'it-hiring':            ['Attracting top tech talent in a competitive market','Technical interview best practices','Building diverse engineering teams','IT staff retention strategies that work','Skills every modern IT professional needs'],
  'cloud-infrastructure': ['Multi-cloud vs single-cloud strategy for enterprises','Cloud cost optimization techniques','Migrating legacy systems to the cloud','Kubernetes vs Docker Swarm for production','Cloud-native architecture patterns for scalability'],
  'it-security':          ['Zero trust security model explained','Top cybersecurity threats facing businesses in 2025','How to conduct an effective IT security audit','Incident response planning step by step','DevSecOps: integrating security into CI/CD'],
  'squad-delivery':       ['Agile squad model: scaling development teams','How squad-based delivery accelerates product launches','Building effective cross-functional teams','OKRs and squad alignment in product development','Measuring squad performance beyond velocity'],
};

async function generateBlogPost() {
  try {
    const service = SERVICES[Math.floor(Math.random() * SERVICES.length)];
    const topics  = TOPICS[service.key];
    const topic   = topics[Math.floor(Math.random() * topics.length)];
    console.log(`🤖 Generating: "${topic}" — ${service.name}`);

    const prompt = `You are a professional IT blog writer for IDEA Asia, an enterprise IT consulting company in Indonesia and Southeast Asia.

Write a comprehensive SEO-optimized blog post about: "${topic}"
Service category: ${service.name}

Rules:
- Professional and authoritative tone
- 800-1000 words
- Practical insights and actionable advice
- Audience: enterprise business and technical leaders

Return ONLY a valid JSON object with NO markdown, NO backticks, NO extra text:
{
  "title": "SEO title max 60 chars",
  "titleId": "Indonesian translation of title",
  "excerpt": "Meta description 150-160 chars",
  "excerptId": "Indonesian translation of excerpt",
  "content": "Full HTML blog post min 800 words using h2 h3 p ul li tags",
  "contentId": "Full Indonesian HTML translation same structure",
  "tags": ["tag1","tag2","tag3","tag4"],
  "metaTitle": "SEO meta title max 60 chars",
  "metaDescription": "SEO meta description max 160 chars"
}`;

    const resp = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.1-8b-instant',
        max_tokens: 4096,
        temperature: 0.7,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        },
        timeout: 60000
      }
    );

    const data = JSON.parse(resp.data.choices[0].message.content.trim());
    const BlogModel = getBlogModel();

    const blog = new BlogModel({
      title:           data.title,
      titleId:         data.titleId,
      excerpt:         data.excerpt,
      excerptId:       data.excerptId,
      content:         data.content,
      contentId:       data.contentId,
      category:        service.key,
      tags:            data.tags || [],
      metaTitle:       data.metaTitle || data.title,
      metaDescription: data.metaDescription || data.excerpt,
      author:          'IDEA Team',
      published:       true,
    });

    await blog.save();
    console.log(`✅ Blog saved: "${blog.title}"`);

    try {
      const { sendBlogNotification } = require('../src/services/email');
      await sendBlogNotification({ title: blog.title, slug: blog.slug, category: blog.category });
    } catch(e) {}

    return blog;
  } catch(err) {
    console.error('❌ Blog error:', err.message);
    if (err.response) console.error('API:', JSON.stringify(err.response.data));
  }
}

const schedule = process.env.BLOG_CRON_SCHEDULE || '0 */8 * * *';
cron.schedule(schedule, async () => {
  console.log('⏰ Cron: generating blog...');
  await generateBlogPost();
});
console.log(`📅 Blog bot scheduled: ${schedule}`);

async function initBlogBot() {
  const BlogModel = getBlogModel();
  const count = await BlogModel.countDocuments();
  if (count < 6) {
    console.log(`📝 Seeding ${6 - count} initial posts...`);
    for (let i = count; i < 6; i++) {
      await generateBlogPost();
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}

const tryInit = setInterval(() => {
  if (mongoose.connection.readyState === 1) {
    clearInterval(tryInit);
    initBlogBot().catch(console.error);
  }
}, 1000);

module.exports = { generateBlogPost };
