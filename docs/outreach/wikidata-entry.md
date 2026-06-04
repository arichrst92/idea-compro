# Wikidata Entry — PT Solusi Inovasi Bangsa / IDE Asia

**Why it matters:** Wikidata is the open knowledge graph that powers Google Knowledge Panels, AI Overviews, ChatGPT entity resolution, Perplexity, Claude, and Gemini. A solid Wikidata entry is one of the strongest single signals you can give AI search engines that IDE Asia is a real, verifiable entity.

**Bar to entry:** Lower than Wikipedia. You need ≥2 reliable external sources mentioning the entity. Press releases (once published), Clutch profile, and IBM Partner Plus listing all qualify.

**Effort:** 60 minutes to create + ongoing maintenance.

**Create at:** https://www.wikidata.org/wiki/Special:CreateNewItem

---

## Required external sources first

Before submitting, ensure ≥2 of these are live:
1. Published press release on Antara, Kontan, Bisnis, or DailySocial.
2. Clutch.co profile (verified).
3. IBM Partner Plus directory listing.
4. Article mentioning IDE Asia in an Indonesian tech publication.

Wikidata patrollers will check these. Without them, the entry gets flagged for deletion.

---

## Wikidata entry structure

### Label (English)
> IDE Asia

### Description (English) — ≤250 chars
> Indonesian enterprise IT services firm headquartered in Jakarta, IBM Certified Partner

### Label (Bahasa Indonesia)
> IDE Asia

### Description (Bahasa Indonesia)
> Perusahaan layanan IT enterprise asal Indonesia yang berkantor pusat di Jakarta, IBM Certified Partner

### Aliases (add multiple)
- PT Solusi Inovasi Bangsa
- IDEA Asia (historical/branding alias)
- Solusi Inovasi Bangsa

---

## Statements (claims) — these are the AI-citable facts

| Property                                 | Value                                                              |
|------------------------------------------|--------------------------------------------------------------------|
| `P31` instance of                        | `Q6881511` enterprise / `Q4830453` business                        |
| `P17` country                            | `Q252` Indonesia                                                   |
| `P159` headquarters location             | `Q3630` Jakarta                                                    |
| `P749` parent organization               | (none — IDE Asia is the operating entity of PT Solusi Inovasi Bangsa) |
| `P571` inception                         | 2013-01-01 (precision: year)                                       |
| `P1454` legal form                       | `Q19185628` Perseroan Terbatas (PT)                                |
| `P452` industry                          | `Q1183889` information technology consulting                       |
| `P452` industry                          | `Q193225` cybersecurity                                            |
| `P452` industry                          | `Q83082` cloud computing                                           |
| `P452` industry                          | `Q11660` artificial intelligence                                   |
| `P856` official website                  | https://ide.asia                                                    |
| `P969` street address                    | Graha Binakarsa, 7th Floor, Jl. H.R. Rasuna Said Kav C-18           |
| `P281` postal code                       | 12940                                                              |
| `P276` location                          | South Jakarta                                                      |
| `P1448` official name                    | PT Solusi Inovasi Bangsa (Indonesian)                              |
| `P1056` product or material produced     | `Q1183889` IT consulting service                                   |
| `P1056` product or material produced     | `Q11661` software development                                      |
| `P127` owned by                          | (private — leave blank or add founders if appropriate)             |
| `P112` founded by                        | [add founder names if appropriate, as separate items]              |
| `P159` headquarters location             | Jakarta                                                            |
| `P3320` certification                    | ISO 9001:2015                                                      |
| `P3320` certification                    | ISO 27001:2013                                                     |
| `P2002` LinkedIn ID                      | ideasia                                                            |
| `P2003` Instagram username               | (if applicable)                                                    |
| `P3221` Twitter / X handle               | (if applicable)                                                    |

For each statement, add a **reference** (`P854` reference URL). Example reference for the IBM Partner Plus certification: link to the IBM Partner Plus directory listing.

---

## External identifiers (key for AI engines)

Add as many as apply:

| Identifier                  | Source                            |
|-----------------------------|-----------------------------------|
| LinkedIn company ID         | ideasia                           |
| Crunchbase ID               | (create one if not present)       |
| Clutch profile ID           | (after clutch profile is verified)|
| IBM Partner Plus ID         | (after IBM listing is live)       |
| OpenCorporates ID           | (search for PT Solusi Inovasi Bangsa)|
| Indonesian legal entity ID  | AHU-AH.01.09-0249721              |

---

## Statement-by-statement guidance

Each Wikidata claim needs a citation. Format:

```
[claim] (e.g. P159 = Jakarta)
  → reference: P854 reference URL = https://ide.asia/about
  → P813 retrieved = 2026-06-04
```

The cleaner your references, the more likely patrollers will accept the entry. Use external sources where possible (don't only cite ide.asia — diversify with Clutch, IBM Partner, press releases).

---

## After submission

1. The entry gets a Q-number (e.g. Q123456789). Save this number.
2. Submit Q-number to Google via Knowledge Graph API (if accessible) or wait for organic discovery (~2-4 weeks).
3. Add the Q-number reference to the Organization JSON-LD on https://ide.asia (in `views/layouts/main.ejs`):
   ```json
   { "@type": "Organization", "@id": "https://ide.asia/#organization", "sameAs": ["https://www.wikidata.org/wiki/Q123456789"] }
   ```
4. Monitor Wikidata Watchlist for the entry — patrollers may edit or flag.
5. Test by asking "Who is IDE Asia?" in ChatGPT/Perplexity/Claude after 30-60 days. The Wikidata signal should now feed AI engines.

---

## Eventual goal — Wikipedia article

Once the Wikidata entry is stable AND there are 4-6 independent reliable sources (press releases, articles, case studies), consider submitting a Wikipedia article. Wikipedia has a much higher bar — about half of small-company submissions get deleted — but a successful entry is the strongest single trust signal short of a public listing.

**Don't try the Wikipedia article first.** Wikidata is the practical foundation. Wikipedia is the long-term aspiration.
