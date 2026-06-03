# OG Image Generation Prompt — IDEA Asia

Prompt ini dibuat untuk **GPT-4o / DALL·E 3 / Sora image** atau model image gen lainnya, supaya OG image yang dihasilkan konsisten dengan brand IDEA Asia (Silicon Valley premium, putih dominan, biru elektrik).

Daftar OG image yang perlu di-generate ada di akhir dokumen.

---

## Master prompt (template universal)

> Paste prompt di bawah ke ChatGPT (model dengan image generation), lalu **isi `[VARIANT]` dan `[TOPIC HEADLINE]`** sesuai halaman target. Spec lainnya jangan diubah — itu yang menjaga konsistensi visual.

```text
Create a 1200×630 px Open Graph (social media share) image for "IDEA Asia"
(Integrated Digital Ecosystem Asia), an enterprise IT consulting company.

VISUAL STYLE — non-negotiable:
• Silicon Valley premium tech aesthetic. Think Linear, Vercel, Stripe,
  or Anthropic landing pages.
• White-dominant background (#FFFFFF) with subtle radial gradient mesh
  in the corners using electric blue (#1A50E8) at ~8-12% opacity.
• Clean, minimal, generous whitespace. NO clutter, NO emoji, NO 3D realism.
• Sharp geometric lines, subtle grid pattern in background (very faint, ~5%
  opacity), modern typography hierarchy.
• Mood: confident, premium, enterprise-grade, technically credible.

COMPOSITION:
• Left half (60% width): bold headline + small eyebrow tag
• Right half (40% width): abstract visual element related to the topic
  (geometric, line-art style, monochrome blue or near-black, NOT cartoon)
• Bottom-left corner: small "IDEA" wordmark in #0A0F1C (near-black)
• Bottom-right corner: tiny credential row showing "ISO 27001 · ISO 9001 ·
  IBM Partner" in #6B7280 (muted gray, 11px size proportionally)

TYPOGRAPHY:
• Font: Inter (or Inter-like geometric sans-serif). NO serif, NO script.
• Eyebrow tag: 14px equivalent, ALL CAPS, electric blue #1A50E8,
  letter-spacing wider, weight 600. Inside a small pill-shaped chip with
  light blue background (#EFF3FF) and 1px border #DCE5FF.
• Main headline: 56-64px equivalent, weight 700, color #0A0F1C, tight
  letter-spacing (-0.025em), line-height 1.05, max 2 lines.
• Subtle accent: 1-2 words in the headline can use a blue-to-indigo
  gradient (#1A50E8 → #5C7CFA).

COLOR PALETTE (strict):
• Background:  #FFFFFF (white)
• Soft tint:   #F8F9FB (off-white)
• Ink:         #0A0F1C (near-black, slight blue undertone)
• Secondary:   #6B7280 (gray)
• Accent:      #1A50E8 (electric blue)
• Accent gradient end: #5C7CFA (lavender-blue)
• Subtle borders: #E5E7EB

DO NOT:
• Use stock photos of people, offices, or hardware
• Add gradient meshes that are too colorful or 90s-style
• Render any 3D objects, glassmorphism balls, isometric illustrations
• Include text other than what's specified
• Use rounded cartoonish icons or hand-drawn elements

VARIANT = [VARIANT]
EYEBROW TAG TEXT = [EYEBROW]
HEADLINE TEXT = [TOPIC HEADLINE]
RIGHT-SIDE VISUAL CONCEPT = [VISUAL CONCEPT]

Output one image at exactly 1200×630 px.
```

---

## Variants — copy-paste yang sudah diisi per halaman

Tinggal paste salah satu blok ini ke ChatGPT (model image-gen). Hasil simpan di `public/images/og-[slug].jpg`, optimize ~120 KB max.

### 1. `og-home.jpg` — landing page

```text
VARIANT = home
EYEBROW TAG TEXT = ENTERPRISE TECHNOLOGY PARTNER
HEADLINE TEXT = Integrated Digital Ecosystem
RIGHT-SIDE VISUAL CONCEPT = An abstract minimal network constellation — a few
clean nodes connected by thin straight lines, suggesting interconnected systems.
Monochrome: nodes in #0A0F1C, lines in #1A50E8 at 60% opacity. No glow, no
gradient circles. Crisp, geometric.
```

### 2. `og-services.jpg` — services overview

```text
VARIANT = services
EYEBROW TAG TEXT = WHAT WE DO
HEADLINE TEXT = Enterprise Solutions, Engineered to Scale
RIGHT-SIDE VISUAL CONCEPT = A 3-column abstract grid of thin-line icon
silhouettes representing IT services (e.g. a chip outline, a cloud outline,
a graph outline) — all rendered in single-line strokes, color #1A50E8,
arranged neatly in a faint #F8F9FB grid.
```

### 3. `og-about.jpg`

```text
VARIANT = about
EYEBROW TAG TEXT = ABOUT IDEA
HEADLINE TEXT = The Digital Ecosystem Powering Asia
RIGHT-SIDE VISUAL CONCEPT = A minimal map-like visual: dotted outlines of
Indonesia, Vietnam, and Australia with thin connecting blue lines between
them, suggesting Asia-Pacific footprint. Very abstract — not a literal map,
more like 4-5 small geometric pin marks connected by clean lines.
```

### 4. `og-blog.jpg`

```text
VARIANT = blog
EYEBROW TAG TEXT = INSIGHTS
HEADLINE TEXT = Notes from the Front Line of Enterprise Tech
RIGHT-SIDE VISUAL CONCEPT = An abstract stack of horizontal lines varying
in length — like a minimalist representation of paragraphs of text. Lines
in #0A0F1C at varying opacity (100% → 20%), creating a fade-out effect.
```

### 5. `og-contact.jpg`

```text
VARIANT = contact
EYEBROW TAG TEXT = LET'S TALK
HEADLINE TEXT = Start a Conversation
RIGHT-SIDE VISUAL CONCEPT = A single envelope outline (line-art, stroke
1.5px) in #1A50E8, with a small chat-bubble shape nearby in #0A0F1C —
suggesting communication. Very minimal, lots of whitespace around them.
```

### 6. `og-it-consulting.jpg`

```text
VARIANT = it-consulting
EYEBROW TAG TEXT = SERVICE · IT CONSULTING
HEADLINE TEXT = Strategy That Moves at the Speed of Business
RIGHT-SIDE VISUAL CONCEPT = An abstract roadmap visual: a single thin
horizontal line with 4-5 milestone dots, each labeled with a number (01-05)
in muted gray. Line color #1A50E8, dots #0A0F1C. Minimal, blueprint-like.
```

### 7. `og-it-outsourcing.jpg`

```text
VARIANT = it-outsourcing
EYEBROW TAG TEXT = SERVICE · IT OUTSOURCING
HEADLINE TEXT = Operational Excellence, Outsourced
RIGHT-SIDE VISUAL CONCEPT = An abstract gear or settings cog made entirely
from thin line-art (stroke 1.5px, color #1A50E8). Modern, NOT realistic.
Surrounded by 3-4 small ticker-dot indicators (filled circles in #0A0F1C)
suggesting 24/7 monitoring.
```

### 8. `og-it-hiring.jpg`

```text
VARIANT = it-hiring
EYEBROW TAG TEXT = SERVICE · TECH TALENT HIRING
HEADLINE TEXT = The Right Engineers. Faster.
RIGHT-SIDE VISUAL CONCEPT = Three minimal avatar silhouettes (just circles
with a half-arc shoulder line each, line-art only, no faces, no detail),
arranged in a tight cluster. Two in #0A0F1C, one in #1A50E8 (the
highlighted "match"). Very abstract.
```

### 9. `og-cloud-infrastructure.jpg`

```text
VARIANT = cloud-infrastructure
EYEBROW TAG TEXT = SERVICE · CLOUD INFRASTRUCTURE
HEADLINE TEXT = Cloud That Works for You, Not Against You
RIGHT-SIDE VISUAL CONCEPT = A minimal cloud outline (stroke 1.5px, color
#1A50E8) above a small horizontal data-flow line (3 connected nodes in
#0A0F1C). Suggests cloud → infrastructure. Clean line-art only.
```

### 10. `og-it-security.jpg`

```text
VARIANT = it-security
EYEBROW TAG TEXT = SERVICE · IT SECURITY
HEADLINE TEXT = Defense, Designed for the Threat Landscape You Face
RIGHT-SIDE VISUAL CONCEPT = A minimal shield outline (stroke 1.5px, color
#0A0F1C) with a small checkmark inside in #1A50E8. Subtle dotted ring
around the shield in very faint #E5E7EB suggesting layered defense.
Geometric, NOT cartoonish.
```

### 11. `og-squad-delivery.jpg`

```text
VARIANT = squad-delivery
EYEBROW TAG TEXT = SERVICE · SQUAD BASED DELIVERY
HEADLINE TEXT = The Speed of a Startup. The Reliability of an Enterprise.
RIGHT-SIDE VISUAL CONCEPT = Three small interconnected hexagons or circles
arranged in a triangle formation (representing a cross-functional squad).
Each in a slightly different shade: one #1A50E8, one #0A0F1C, one
#5C7CFA. Connecting thin lines between them in #E5E7EB.
```

### 12. `og-agent.jpg`

```text
VARIANT = agent
EYEBROW TAG TEXT = AI CONSULTANT · CAROLLA
HEADLINE TEXT = Meet Your Always-On Digital Consultant
RIGHT-SIDE VISUAL CONCEPT = A minimal abstract avatar — single circle in
#0A0F1C representing a head, with subtle wave lines emanating outward in
#1A50E8 suggesting voice / interaction. Very minimal, NOT a face.
```

### 13. `og-capability.jpg`

```text
VARIANT = capability
EYEBROW TAG TEXT = CAPABILITY · STACK & TALENT
HEADLINE TEXT = Every Stack. Every Role.
RIGHT-SIDE VISUAL CONCEPT = A minimal "tech mosaic" — a 6×4 grid of tiny
abstract logo silhouettes (small squares ~22px each, line-art only) in
#0A0F1C, arranged on a faint #F8F9FB grid. About 3-4 of the squares are
filled solid #1A50E8 (electric blue) instead of outline, creating a
diagonal accent pattern across the grid. The squares should suggest tech
logos without being any specific brand — abstract shapes only (circles,
hexagons, simple polygons inside the squares). Very modern, like a
capability matrix at Vercel or Stripe.
```

Untuk yang ingin alternative composition (variant B), bisa pakai prompt ini:

```text
VARIANT = capability (alt composition)
EYEBROW TAG TEXT = CAPABILITY · STACK & TALENT
HEADLINE TEXT = Every Stack. Every Role.
ALTERNATIVE LAYOUT = Instead of right-side visual, span the visual across
the full width as a faint background: 5 horizontal layered "stack" bands
across the image, each 100px tall, separated by thin #E5E7EB lines. Each
band has tiny dot markers in #1A50E8 at varying intervals, suggesting
"items in a stack". The headline + eyebrow + IDEA wordmark sit on top of
this layered background, anchored to the LEFT in a vertical column with
clean Inter typography. Bottom 5% of image: a thin horizontal blue gradient
line in #1A50E8 → transparent.
```

---

## After generating

1. **Format:** save as JPG (quality 85), exactly **1200×630 px**.
2. **Filename:** persis seperti di header tiap variant (mis. `og-home.jpg`).
3. **Lokasi:** `public/images/` di repo. Akan otomatis dipakai oleh meta tag karena route sudah set `ogImage: '/images/og-[slug].jpg'`.
4. **Optimize:** max ~120 KB per file. Pakai TinyPNG atau `cwebp` di VPS.
5. **Verify:** setelah deploy, paste URL ke
   - https://www.opengraph.xyz
   - https://cards-dev.twitter.com/validator
   - LinkedIn Post Inspector

## Catatan tambahan

- Kalau ChatGPT menghasilkan komposisi yang terlalu ramai, balas dengan **"strip 30% more elements, more whitespace"**.
- Kalau warna meleset, sebutkan **"strictly only use #FFFFFF, #0A0F1C, #1A50E8 as primary colors"**.
- Untuk konsistensi antar variant, generate semuanya dalam satu sesi chat — context-nya nyambung.
