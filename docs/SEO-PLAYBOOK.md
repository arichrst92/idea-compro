# IDE Asia — SEO + AEO Playbook

Strategic action plan to rank #1 on Google/Bing AND get cited by AI search engines
(ChatGPT, Perplexity, Claude, Gemini, Google AI Overviews).

Last updated: 2026-06-04.

---

## Part 1 — What's already done (technical foundations)

This codebase ships with strong technical SEO. Don't redo these:

| Item                            | Status | Where |
|---------------------------------|--------|-------|
| Mobile responsive               | ✓      | `public/css/main.css` |
| HTTPS                           | ✓      | nginx + Let's Encrypt |
| Sitemap.xml (cached, hreflang)  | ✓      | `src/routes/api.js` |
| robots.txt (AI bots allowlisted)| ✓      | `src/routes/api.js` |
| Canonical URLs                  | ✓      | `views/layouts/main.ejs` |
| Hreflang en/id                  | ✓      | `views/layouts/main.ejs` |
| JSON-LD Organization + WebSite  | ✓      | `views/layouts/main.ejs` |
| JSON-LD Product (per product)   | ✓      | `src/routes/products.js` |
| JSON-LD Service + FAQ + Breadcrumb (per service) | ✓ | `src/routes/services.js` |
| JSON-LD FAQPage + ProfessionalService (home) | ✓ | `src/routes/home.js` |
| JSON-LD BlogPosting             | ✓      | `views/pages/blog-detail.ejs` |
| OG / Twitter Card meta          | ✓      | `views/layouts/main.ejs` |
| GSC verification                | ✓      | env `GSC_VERIFICATION` |
| Trust proxy + clean URLs        | ✓      | `server.js` |
| `/llms.txt` and `/llms-full.txt` (AI search) | ✓ | `public/` |
| `theme-color`, `geo.*` meta     | ✓      | `views/layouts/main.ejs` |
| `<meta robots ... max-snippet>` | ✓      | `views/layouts/main.ejs` |

---

## Part 2 — Core SEO playbook (Google / Bing)

Technical schema alone won't rank you #1. The three things that actually
move the needle, in order of leverage:

### 2.1 Backlinks (the #1 ranking factor for competitive queries)

You cannot rank for "IT consulting Indonesia" without **authoritative
inbound links from real Indonesian business sites**. Target ~20-40
quality backlinks in 6 months.

**Tactics, prioritized by ROI:**

1. **IBM Partner Plus directory** — get IDE Asia listed at
   `partner-portal.ibm.com`. This is one link but it's gold for trust
   + ranking on IBM-related queries.
2. **Deloitte preferred supplier listing** — request inclusion.
3. **Clutch.co, GoodFirms.co, AppFutura, ITFirms** — paid + free
   B2B service directory listings. Get listed in IT Consulting +
   Cloud Consulting + Cybersecurity categories for Indonesia.
4. **Kadin Indonesia, Apkomindo, IndoCISO** — Indonesian industry
   associations. Apply for member listings.
5. **Indonesian tech news sites** — DailySocial, KrAsia, e27,
   Techcrunch Asia. Pitch a contributed thought-leadership article
   from your CEO once per quarter. Each one yields one editorial
   backlink.
6. **University career partnerships** — UI, ITB, BINUS, Telkom
   University. List IDE Asia as a hiring partner; their `.ac.id`
   domains carry high trust.
7. **Press releases** — when you sign a major client (with permission)
   or get a certification, push a release via Antara, Kontan, IDN
   Financials. Cost ~Rp 5-15jt per release for guaranteed
   syndication; results in 10-30 referring domains.
8. **Case studies as guest content** — co-author technical case
   studies with IBM regional marketing. IBM publishes them on
   `ibm.com/case-studies`, which links back to ide.asia.

**What to avoid:** never buy spammy link-farm backlinks. Google's
SpamBrain detects them and you'll get a manual action that takes
6+ months to recover from. Quality > quantity.

### 2.2 Content depth and topical authority

Search engines rank sites that demonstrate **deep expertise on a
narrow topic**. For IDE Asia, the topical clusters that matter most:

1. **IBM products in Indonesia** (your moat — few competitors have
   IBM partnership + Indonesian context).
2. **Cybersecurity for Indonesian banking** (OJK/BI compliance is a
   premium query niche).
3. **Cloud migration for regulated industries** in Southeast Asia.
4. **Enterprise IT outsourcing** for Indonesian mid-market.

**Action — publish 1 high-quality long-form article per week for 6
months.** Each article should:

- Be 1,500-3,000 words.
- Answer a specific high-intent query (use Ahrefs/SEMrush free
  account to find queries with 100+ monthly searches and KD<30).
- Include original data, charts, or a unique framework. Not just
  rehashed vendor docs.
- Link to relevant `/services/*` or `/products/*` pages
  ("internal linking" — important for distributing PageRank).
- Include a clear authorial byline (your Head of Engineering or
  Practice Lead) with a LinkedIn link.

**Content ideas, ranked by ROI:**

| Query                                                   | Monthly | Difficulty | Article suggestion |
|---------------------------------------------------------|---------|------------|--------------------|
| "OJK cloud compliance"                                  | ~500    | Medium     | "OJK Cloud Compliance Checklist for Indonesian Banks (2026)" |
| "IBM watsonx implementation Indonesia"                  | ~200    | Low        | "Implementing watsonx.ai for Indonesian Enterprise: a 90-day playbook" |
| "QRadar SIEM Indonesia"                                 | ~150    | Low        | "Deploying QRadar SIEM for OJK-Compliant SOC Operations" |
| "core banking modernization Indonesia"                  | ~300    | Medium     | "Core Banking Modernization on IBM Z: Indonesian Bank Case Study" |
| "cloud migration cost reduction Indonesia"              | ~250    | Medium     | "Cloud Migration ROI: What Indonesian CFOs Should Expect" |
| "kontraktor IT outsourcing Indonesia"                   | ~400    | Low        | "Panduan Memilih Vendor IT Outsourcing di Indonesia" (ID) |
| "IBM partner Indonesia"                                 | ~100    | Low        | "What an IBM Certified Partner Actually Does (Indonesia Edition)" |
| "kemananan siber perbankan Indonesia"                   | ~600    | Medium     | "Audit Keamanan Siber Perbankan: Roadmap untuk Bank di Indonesia" (ID) |
| "data lakehouse vs warehouse Indonesia"                 | ~80     | Low        | "watsonx.data vs. Traditional Warehouse: Cost Breakdown" |
| "mainframe modernization Indonesia"                     | ~120    | Low        | "Mainframe Modernization: When IBM Z is the Right Answer" |

Both languages matter. Publish ID + EN versions where the query
has volume in both languages.

### 2.3 Page experience (Core Web Vitals)

Google ranks pages with good Core Web Vitals higher. Test
ide.asia at `pagespeed.web.dev`.

**Targets:**
- LCP (Largest Contentful Paint): < 2.5s
- INP (Interaction to Next Paint): < 200ms
- CLS (Cumulative Layout Shift): < 0.1

**Action items:**
- Convert hero PNGs to AVIF/WebP (50% smaller, supported in all
  modern browsers).
- Use `loading="lazy"` on below-fold images (already done in most
  views; audit `views/pages/*.ejs` for stragglers).
- Preload critical font with `<link rel="preload" as="font">`.
- Defer non-critical JavaScript (Three.js, agent.js).

### 2.4 Local SEO (Google Business Profile)

Critical for "IT consulting Jakarta" type queries.

- Create/claim Google Business Profile for the Jakarta office.
- Categories: "Computer consultant", "Software company", "Business
  management consultant".
- Upload 10+ photos (office exterior, team, lobby).
- Encourage every happy client to leave a Google review. **Reviews
  are a ranking factor.** Aim for 50+ reviews in year 1.
- Post 1 update per week (case study highlights, blog snippets).

### 2.5 Targeted landing pages

Build dedicated landing pages for high-commercial-intent queries
that don't fit your current navigation:

- `/landing/it-consulting-jakarta`
- `/landing/it-outsourcing-banking`
- `/landing/cloud-migration-aws-to-ibm`
- `/landing/cybersecurity-audit-jakarta`
- `/landing/ibm-watsonx-implementation`

Each landing page: H1 with the exact query, 800+ words, customer
proof, FAQ schema, single clear CTA. These funnel paid (Google Ads)
and organic traffic into qualified leads.

---

## Part 3 — AEO playbook (AI Search Engines)

ChatGPT, Perplexity, Claude, Gemini, and Google AI Overviews are
already sending traffic. AEO = optimize to be **the source they cite**.

### 3.1 Why this matters now

In 2026, ~30% of B2B research starts in an AI chat, not Google.
When a CIO asks ChatGPT "Who are the best IBM partners in Indonesia
for watsonx implementation?", you want IDE Asia to be one of the
3 sources cited. The citation drives a click and (often) a lead.

### 3.2 What AI engines look for

1. **Authoritative answer-shaped content** — facts written in
   clean, citable sentences with names, numbers, dates.
2. **JSON-LD structured data** — they parse this directly and
   prefer pages that have it.
3. **Wikipedia + Wikidata presence** — a Wikipedia page with
   external citations matching your site dramatically increases
   citation rate. Hard to get but worth trying for IDE Asia.
4. **External corroboration** — multiple high-trust sites
   mentioning your facts (this is where backlinks pay off twice).
5. **Recency signals** — `dateModified` on JSON-LD, "Last updated"
   on pages, recent blog posts. AI engines weight fresh content.
6. **llms.txt** — emerging standard. Already shipped at
   `https://ide.asia/llms.txt` and `https://ide.asia/llms-full.txt`.

### 3.3 AEO action items

1. **Q&A in every page** — convert key information into FAQ blocks
   with FAQPage JSON-LD. We've done home/services/products; extend
   to about + capability + contact.
2. **Refresh `dateModified` on key pages quarterly** — even small
   edits trigger re-crawl.
3. **Write content shaped like answers** — when a section explains
   what something is, lead with a single clear sentence ("X is Y
   that does Z"), then expand. AI engines lift those leads as
   direct citations.
4. **Wikidata entry** — create one for "PT Solusi Inovasi Bangsa"
   (Q-number). Lower bar than Wikipedia; AI engines use Wikidata
   heavily for entity resolution.
5. **Get cited externally** — when your blog posts get linked by
   third parties (Indonesian tech press, IBM blogs), AI engines
   treat your site as more authoritative.
6. **Track AI traffic** — add `?utm_source=chatgpt`, `?utm_source=perplexity`
   to URLs you place in your llms-full.txt manually. Watch
   referrer logs.

### 3.4 Verify AI engines see you

Test queries in each engine periodically:

- **ChatGPT (Browse / Search)**: "Who is IDE Asia / PT Solusi
  Inovasi Bangsa?"
- **Perplexity**: "Best IBM partners in Indonesia for watsonx"
- **Claude (with web search)**: "IT outsourcing companies in
  Jakarta"
- **Google AI Overviews**: "QRadar SIEM Indonesia"

If you're not cited within 3 months of starting, the gap is
backlinks + content depth, not technical.

---

## Part 4 — Quarterly execution plan

### Q1 (months 1-3)

- [ ] Claim Google Business Profile for Jakarta office.
- [ ] Submit IDE Asia to IBM Partner Plus directory.
- [ ] Submit to Clutch + GoodFirms + AppFutura.
- [ ] Publish 12 long-form articles (1/week) targeting Part 2.2
      query list.
- [ ] Get first 10 Google reviews from existing clients.
- [ ] Run pagespeed.web.dev audit, fix issues to hit "Good" tier.
- [ ] Create Wikidata entry for PT Solusi Inovasi Bangsa.

### Q2 (months 4-6)

- [ ] Land first contributed article in Indonesian tech press.
- [ ] Build 5 landing pages from Part 2.5.
- [ ] Run paid Google Ads on 3 high-intent queries to validate
      conversion rates; use data to inform content priorities.
- [ ] Publish first 2 case studies on `/blog/case-studies/` with
      named clients (with permission).
- [ ] Reach 25 Google reviews.

### Q3 (months 7-9)

- [ ] Pitch a research report (e.g., "State of Cloud Migration
      in Indonesian Banking 2026") as a lead magnet — gets you
      backlinks and shows expertise.
- [ ] Sponsor / speak at 1 Indonesian tech conference (Indosec,
      DevSummit, IBM Tech Day Jakarta). Drives both backlinks
      and brand.
- [ ] Continue 1 article/week cadence.
- [ ] Begin pitching IDE Asia for a Wikipedia entry (high bar —
      requires significant secondary-source coverage; this is
      why the press releases matter).

### Q4 (months 10-12)

- [ ] Review GSC + Bing Webmaster Tools — which queries are
      bringing impressions? Double down with deeper content on
      the top 10.
- [ ] Audit backlink profile in Ahrefs; identify and disavow any
      toxic links.
- [ ] Refresh top 20 pages with new data, new sections, updated
      `dateModified`.

---

## Part 5 — Measuring success

### KPIs

| Metric                                | Source       | Target month 6 | Target month 12 |
|---------------------------------------|--------------|---------------:|----------------:|
| Organic sessions / month              | GA4          |          3,000 |          12,000 |
| Branded query impressions / month     | GSC          |          1,500 |           5,000 |
| Non-branded keyword rankings (top 10) | GSC          |             20 |              60 |
| Referring domains                     | Ahrefs free  |             20 |              50 |
| Domain Rating (Ahrefs)                | Ahrefs       |             15 |              28 |
| Google reviews                        | GBP          |             10 |              50 |
| AI citations / month                  | manual check |              2 |              10 |
| Inbound qualified leads / month       | CRM          |             10 |              35 |

### Weekly review

- Monday — check GSC for new top queries, new pages indexed,
  any crawl errors.
- Mid-week — review GA4 for top traffic sources, conversion
  paths.
- Friday — log the week's content + backlink wins in a tracker.

---

## Part 6 — What NOT to do

- ❌ Buy backlinks from PBN (private blog network) services.
- ❌ Hide text or stuff keywords.
- ❌ Auto-generate low-quality blog posts (the existing blog bot
  is OK because it produces real content; just don't scale to
  3 posts/day with thin content).
- ❌ Duplicate the same content across many pages.
- ❌ Spammy directory submissions to 1,000 low-quality sites.
- ❌ Run your home page in iframes or use heavy client-side
  rendering for content (kills crawlability).

---

## Part 7 — Recommended tools

Free tier is sufficient to start.

| Need              | Tool                 | Why |
|-------------------|----------------------|-----|
| Search Console    | Google Search Console| Required. See what Google sees. |
| Bing equivalent   | Bing Webmaster Tools | Required. Indexing for Bing/Microsoft AI. |
| Backlink audit    | Ahrefs Webmaster Tools (free) | Free for verified sites. |
| Keyword research  | Google Keyword Planner | Free via Google Ads. |
| Rank tracking     | SEMrush / Ahrefs paid| When budget allows. |
| Content briefs    | SurferSEO or Frase   | Optional, saves writers time. |
| Schema validation | Google Rich Results Test | Run after each schema change. |
| Page speed        | pagespeed.web.dev    | Free, run weekly. |
| Analytics         | GA4 + Plausible      | Plausible for clean traffic data. |
| Competitor watch  | similarweb.com       | Free tier. |

---

## TL;DR

You will not rank #1 because you have great schema. You will rank
#1 because you have:

1. **30-50 inbound links from real Indonesian business websites**
   — built through PR, partnerships, directory listings, and
   contributed content.
2. **A consistent flow of original, expert content** — 1 article
   per week minimum, targeting specific high-intent queries.
3. **Active customer reviews** — 50+ Google reviews by end of
   year.
4. **Technical foundation that doesn't break** — what you already
   have, kept healthy.

Schema and `llms.txt` make sure Google + AI engines understand
what you've built. The links and content tell them why you
matter.

Plan to invest 1-2 days/week of marketing time and ~Rp 50-150jt
total budget for the first year. Expect meaningful results in
6 months, dominant results in 12-18.
