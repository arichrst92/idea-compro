# LinkedIn Thought Leadership — Starter Pack

**Why it matters:** LinkedIn posts from a credible CEO/Practice Lead with 1k+ first-degree connections regularly drive 5,000-50,000 impressions per post. Even a few signed clients hold their LinkedIn profile up as proof they vetted you. AI search engines also weight LinkedIn presence for authority.

**Cadence target:** 1 post per week from CEO + 1 post per week from a Practice Lead. Publish Tuesday-Thursday, 9-11 AM Jakarta time.

---

## Post 1 — Manifesto / brand intro

**Format:** Text-only post (LinkedIn favours pure text > links for reach).

> Most "digital transformation" projects in Indonesia fail in the same place: they're sold by people who never have to operate what they design.
>
> When I built IDE Asia, I made one rule we still keep: every consultant who recommends an architecture has to be willing to support it on day 91. No exceptions, no escape hatches.
>
> Some consequences of that rule:
>
> → Our consulting practice is smaller than it could be. We turn down work where we couldn't credibly take operational ownership.
>
> → Our recommendations are boring. Boring patterns scale.
>
> → We chose to become an IBM Certified Partner not because IBM was cool, but because Indonesian banks need the level of vendor backing that only a true partner relationship provides.
>
> → Our cybersecurity team holds CEH and OSCP not for the certificate, but because we needed people who'd already been on the offensive side before we put them on the defensive side.
>
> If you're a CIO/CTO whose last consultant disappeared the moment the cutover plan was due — let's talk. We're at https://ide.asia.

**Hashtags:** #ITConsulting #Indonesia #DigitalTransformation #EnterpriseIT

---

## Post 2 — IBM watsonx use case

**Format:** Carousel (3-4 slide PDF) or text + 1 image.

> An Indonesian retail bank asked us a question last quarter:
>
> "We have 14 million customers. Our call center deflection rate is 22%. McKinsey told us GenAI could push it to 45%. Is that real?"
>
> Here's the honest answer:
>
> 45% is achievable. But not the way most consultants will quote you.
>
> What works for Indonesian banking deflection:
>
> 1. RAG over your actual product documentation + account terms + 18 months of resolved tickets. Not a general LLM. Not ChatGPT with a prompt.
>
> 2. Foundation model that won't hallucinate amounts, dates, or fees. We use IBM Granite for this. Smaller, deterministic, indemnified.
>
> 3. Bilingual handoff. Bahasa Indonesia 80% of the time, English 15%, code-switching 5%. The model has to handle all three.
>
> 4. Live agent handoff that carries context. The hardest part isn't the AI — it's the choreography.
>
> 5. Governance from day one. watsonx.governance tracks drift on PII handling. OJK will ask.
>
> Realistic timeline: 8 weeks to pilot, 4 more weeks to first business unit GA.
>
> Realistic cost reduction in year 1: 22% of L1 cost, not 45%. The bigger number comes in year 2 when you have the data to fine-tune properly.
>
> If you're scoping a watsonx pilot and want a second opinion before signing the SOW — DM is open.

**Hashtags:** #watsonx #BankingTechnology #AIinBanking #Indonesia

---

## Post 3 — Cybersecurity / OJK angle

**Format:** Text only.

> OJK now expects every Indonesian bank to be able to answer this question by next quarter:
>
> "Can you produce evidence that your cloud workloads have not been exfiltrated in the last 30 days?"
>
> Most banks I've reviewed cannot. Here's why:
>
> ❌ Their SIEM ingests cloud logs but doesn't correlate cross-cloud.
> ❌ Their DAM (database activity monitoring) covers on-prem Oracle but not the new RDS instance.
> ❌ Their identity logs and network logs live in different tools that never get joined.
> ❌ The SOC was never trained to run that specific query under regulatory pressure.
>
> Fixing this isn't a tool purchase. It's an architecture problem.
>
> Three steps that actually move the needle:
>
> 1. Pick one SIEM as the source of truth (we use IBM QRadar for OJK-context). Stop trying to federate three.
>
> 2. Cover the data plane with DAM (IBM Guardium) including cloud databases. The on-prem-only coverage is a regulatory time bomb.
>
> 3. Run a quarterly tabletop exercise where the question above is the only thing being tested. If you can't answer in 30 minutes, you fail. Iterate.
>
> Indonesian banks: this is going to get worse before it gets better. Plan now.

**Hashtags:** #Cybersecurity #OJK #BankingCompliance #SIEM #Indonesia

---

## Post 4 — Cloud migration honest take

**Format:** Text only.

> Three honest things about cloud migration in Indonesia that vendors won't tell you:
>
> 1. AWS, Azure, and GCP all have "Singapore-region-counts-as-Indonesia" pitches. Read your OJK letter again. It does not say that.
>
> 2. The "lift-and-shift" path is more expensive than the "refactor as you migrate" path 60% of the time. The shift to consumption-based pricing punishes oversized VMs.
>
> 3. Year-1 cloud bills are 90% of forecast. Year-2 cloud bills are 140%. Without FinOps discipline (Apptio, Turbonomic, or hand-rolled), you will overshoot.
>
> What works instead:
>
> → Run a 4-week pre-migration FinOps assessment. Find the workloads that are 40% oversized today.
>
> → Pick a primary cloud (we are platform-neutral; for OJK-heavy workloads, IBM Cloud often wins). Use secondary clouds only when there's a specific reason.
>
> → Set the budget for year 2, not year 1. Year 1 is always under because you haven't found the corners yet.
>
> → Train your operations team during migration, not after. Knowledge transfer in parallel with cutover beats knowledge transfer as a separate workstream every time.
>
> Cloud migrations done right pay back in 14-18 months. Done wrong, they never pay back at all.

**Hashtags:** #CloudMigration #FinOps #Indonesia #IBMCloud #AWS

---

## Post 5 — Hiring the right partner

**Format:** Text only.

> How to choose an IT consulting partner in Indonesia without getting burned. After 12 years, here's the checklist I'd give my own CFO if she had to find someone for our internal IT:
>
> □ Do they actually have the certifications they claim? Ask for the PDF. Check the issuing body.
>
> □ Will they put their senior consultant on the project, or someone two years out of college? Look at LinkedIn — see who is named on the proposal.
>
> □ Do they have a published case study where a named client (not "a major bank") is quoted? Anonymous case studies are usually fake.
>
> □ Will they sign an NDA that allows you to talk to their references? If not, the references are likely scripted.
>
> □ What's their exit clause? If they fight on a clean exit, they're planning to lock you in.
>
> □ Are they ISO 27001 certified — actually certified, not "aligned" or "implementing"? Vendor risk needs the certificate.
>
> □ What happens if their lead consultant leaves mid-project? Get the answer in writing.
>
> Boring questions, but the answers separate real firms from sales-led ones.

**Hashtags:** #ITConsulting #VendorRiskManagement #Indonesia #CIO

---

## Publishing tactics

- **Hook in line 1**: LinkedIn truncates after ~210 chars. The first line decides whether readers click "see more". Make it provocative, specific, or counter-intuitive.
- **No external links in the body**: LinkedIn algorithm down-ranks posts with links. Put them in the first comment after publishing.
- **Reply to every comment in the first 60 minutes**: doubles the post's reach.
- **Tag 1-3 people who'd genuinely care**: increases reach into their networks. Don't spam-tag.
- **Image vs text**: text-only posts often out-perform image posts in 2026. Test both.

## Cadence template (weekly)

| Day | Post type | Author |
|-----|-----------|--------|
| Tue | Long-form opinion / hot-take | CEO |
| Thu | Use case / case study angle | Practice Lead (rotating) |
| Sat | Light — culture, team, milestone | Anyone |

## What to avoid

- Don't post about Indonesian politics. Stay technical.
- Don't share unsubstantiated stats ("90% of CIOs say…"). Cite or skip.
- Don't bash competitors by name. Indonesian IT services market is small; reputation compounds.
- Don't auto-publish. Engagement quality drops 50% for scheduled-and-forgotten posts.
