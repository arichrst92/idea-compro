// src/routes/landing.js
// High-intent landing pages — single template, multiple data entries.
// Each landing page targets a specific commercial-intent query so paid
// (Google Ads) and organic traffic funnels into a focused conversion path.

const express = require('express');
const router = express.Router();

// ──────────────────────────────────────────────────────────────────
// Landing page content. Each `body.sections` is rendered in order.
// Sections may be: { type: 'lead' | 'h2' | 'p' | 'bullets' | 'stats' | 'cta' }
// ──────────────────────────────────────────────────────────────────
const LANDINGS = [
  // ── 1. IT Consulting Jakarta ──────────────────────────────────
  {
    slug: 'it-consulting-jakarta',
    metaTitle: 'IT Consulting Jakarta — Strategy, Architecture & Roadmap | IDE Asia',
    metaDescription: 'Enterprise IT consulting firm in Jakarta. Digital transformation strategy, IT architecture review, vendor selection, IBM Partner. ISO 27001 certified. Free initial consultation.',
    eyebrow: 'IT CONSULTING · JAKARTA',
    h1: 'Enterprise IT Consulting in Jakarta',
    subhead: 'Strategy, architecture, and vendor selection for Indonesian enterprises — delivered by IBM-certified consultants with banking, telco, and government experience.',
    primaryService: 'it-consulting',
    ogImage: '/images/og-services.jpg',
    sections: [
      { type: 'lead', text: 'Choosing the right Information Technology consulting partner in Jakarta is a high-stakes decision. The wrong roadmap costs 12 months and millions of rupiah; the right one reduces business-IT misalignment by ~35% and unlocks competitive advantage. IDE Asia (PT Solusi Inovasi Bangsa) has delivered consulting engagements for Bank Jakarta, BRI, UOB Indonesia, Telkomsel, Pertamina, and Semen Indonesia Group across digital transformation, cloud strategy, cybersecurity, and IBM platform implementation.' },
      { type: 'h2', text: 'Why companies in Jakarta choose IDE Asia for IT consulting' },
      { type: 'bullets', items: [
        '<strong>IBM Certified Partner</strong> — implementation-grade expertise on watsonx, IBM Cloud, Db2, QRadar, and IBM Z, not just generic advice.',
        '<strong>ISO 9001:2015 + ISO 27001:2013 certified</strong> — process maturity that regulated industries demand.',
        '<strong>OJK and Bank Indonesia compliance experience</strong> — engineers who have worked inside regulated banking environments.',
        '<strong>South Jakarta office</strong> at Graha Binakarsa, Rasuna Said C-18 — direct, in-person engagement when you need it.',
        '<strong>6–8 week typical delivery</strong> for discovery + roadmap engagements, with a single accountable Partner-level lead.',
        '<strong>Deloitte Independent Contractor</strong> — engaged as delivery partner on Deloitte client projects.',
      ]},
      { type: 'h2', text: 'IT consulting services we deliver from Jakarta' },
      { type: 'p', text: 'Our Jakarta-based consulting practice covers the full enterprise stack — from board-level digital strategy down to architecture review of a specific microservices migration. Engagement models range from 4-week fixed-scope advisory to long-running embedded squads.' },
      { type: 'bullets', items: [
        '<strong>Digital Transformation Strategy</strong> — multi-year roadmap aligning IT investments to business OKRs.',
        '<strong>IT Architecture Review</strong> — independent review of your current stack, integration points, and tech debt.',
        '<strong>Technology Roadmap</strong> — 18-36 month capability and platform plan with prioritized initiatives.',
        '<strong>Vendor Selection</strong> — RFP design, scoring, negotiation support for ERP, core banking, cloud, and security vendors.',
        '<strong>IT Governance Framework</strong> — COBIT/ITIL-aligned governance, including IT steering committee design and KPI cascade.',
        '<strong>IBM Platform Advisory</strong> — when watsonx, IBM Cloud, Db2, or QRadar fits your roadmap, we design the implementation plan with vendor-grade depth.',
      ]},
      { type: 'h2', text: 'Industries we serve in Jakarta and beyond' },
      { type: 'p', text: 'Our consulting practice is sector-specialized — generic advice rarely survives contact with industry regulation. We focus on banking and financial services (OJK + BI experience, ISO 27001 internal compliance), telecommunications (BSS/OSS, network ops), insurance (policy admin, claims), energy and oil & gas (asset management, SCADA security), manufacturing (MES, supply chain), and government (e-gov platforms, data classification).' },
      { type: 'h2', text: 'How an IDE Asia IT consulting engagement typically runs' },
      { type: 'bullets', items: [
        '<strong>Week 0 — Discovery call</strong>. Free initial consultation at our Jakarta office or virtually. Scope alignment, stakeholder mapping, deliverable definition.',
        '<strong>Weeks 1–2 — Current-state assessment</strong>. Interviews, architecture review, tech debt audit, vendor landscape mapping.',
        '<strong>Weeks 3–5 — Roadmap design</strong>. Target architecture, sequenced initiative backlog, business case, risk register.',
        '<strong>Weeks 6–8 — Delivery and handover</strong>. Steering committee presentation, executive readout, transition to implementation (often delivered by IDE Asia squad teams or by your internal team with our coaching).',
      ]},
    ],
    faqs: [
      ['How much does IT consulting in Jakarta cost?', 'For a defined-scope discovery + roadmap engagement, expect Rp 250jt–800jt depending on enterprise size and coverage. For ongoing advisory, time-and-materials rates start at Rp 4-6jt per consultant-day with senior practice leads at Rp 8-12jt per day. We provide a free initial consultation to scope your specific engagement at https://ide.asia/contact.'],
      ['Do you serve only Jakarta, or also other cities?', 'We are headquartered in Jakarta (Graha Binakarsa, Rasuna Said C-18) with offices in Bandung, Hanoi, and Sydney. We serve clients across Southeast Asia. For Jakarta-based engagements we default to in-person workshops; for elsewhere we run hybrid delivery with on-site visits at key milestones.'],
      ['Is IDE Asia an IBM partner?', 'Yes. IDE Asia is an IBM Certified Partner authorized to consult on, implement, and support the full IBM portfolio. This means we deliver IBM platform advice with implementation-grade depth — not generic recommendations.'],
      ['What makes IDE Asia different from a Big Four consulting firm in Jakarta?', 'Three things: (1) we ship implementation, not just slide decks — our consulting team works hand-in-hand with our IBM-certified implementation engineers; (2) Indonesian regulatory fluency, particularly OJK and BI; (3) lower cost structure than Big Four for similar quality, with more senior consultant attention per engagement.'],
      ['Can IDE Asia help us choose between AWS, Azure, GCP, and IBM Cloud?', 'Yes. Cloud platform selection is one of our most common consulting engagements. We run a structured assessment covering workload fit, regulatory data-residency requirements, cost modeling, and skill availability. As an IBM Partner we are familiar with the IBM Cloud strengths, but our advisory is platform-neutral.'],
    ],
  },

  // ── 2. IT Outsourcing for Banking ─────────────────────────────
  {
    slug: 'it-outsourcing-banking',
    metaTitle: 'IT Outsourcing for Indonesian Banks — OJK Compliant | IDE Asia',
    metaDescription: 'IT outsourcing and managed services for Indonesian banks. OJK and BI compliant. ISO 27001 certified. 24/7 SOC, core banking ops, application management. 30% cost reduction typical.',
    eyebrow: 'IT OUTSOURCING · BANKING',
    h1: 'IT Outsourcing for Indonesian Banks',
    subhead: 'OJK and BI compliant managed IT services for retail banks, BPRs, and digital banks. Core banking ops, 24/7 SOC, application management, and infrastructure support — under ISO 27001:2013 controls.',
    primaryService: 'it-outsourcing',
    ogImage: '/images/og-services.jpg',
    sections: [
      { type: 'lead', text: 'IT outsourcing for an Indonesian bank is not the same as IT outsourcing for any other industry. Vendor risk management under OJK regulation, data residency, audit trail integrity, and 24/7 incident response are non-negotiable. IDE Asia (PT Solusi Inovasi Bangsa) is ISO 27001:2013 certified and has delivered IT outsourcing to Indonesian banking institutions including Bank Jakarta, Bank Rakyat Indonesia (BRI), and UOB. Our outsourcing model typically delivers 30% cost reduction versus in-house operations while raising service quality through 99.5% uptime SLAs.' },
      { type: 'h2', text: 'Why Indonesian banks outsource IT to IDE Asia' },
      { type: 'bullets', items: [
        '<strong>OJK and Bank Indonesia compliance</strong> — engineers who have operated inside regulated banking environments and understand the audit, data residency, and vendor risk requirements.',
        '<strong>ISO 27001:2013 certified</strong> — externally audited Information Security Management System covering our delivery operations.',
        '<strong>IBM Certified Partner</strong> — full-stack support for IBM Z mainframes, Db2 core systems, QRadar SIEM, Guardium, and the IBM watsonx + Cloud Paks portfolio that many banks already run.',
        '<strong>24/7 follow-the-sun coverage</strong> — Jakarta, Bandung, Hanoi, and Sydney offices enable shift handovers without offshore latency.',
        '<strong>Tier-based SLAs</strong> — 99.5%, 99.9%, and 99.99% availability tiers depending on workload criticality, with documented response and resolution times by priority.',
        '<strong>Indonesian-language and English support</strong> — for branch users, contact center systems, and SWIFT operations.',
      ]},
      { type: 'h2', text: 'Outsourced banking IT services we deliver' },
      { type: 'p', text: 'Our banking outsourcing portfolio covers the full operational stack — from core banking application management to network and SOC operations. We do not run a single delivery model; engagements are designed around your existing organization, regulator expectations, and risk appetite.' },
      { type: 'bullets', items: [
        '<strong>Core banking application management</strong> — patching, performance tuning, batch operations, dispute and incident management.',
        '<strong>Digital banking platform ops</strong> — mobile banking, internet banking, API gateway, BI-FAST and open banking integration.',
        '<strong>Mainframe operations</strong> — IBM Z and Db2 admin, capacity planning, DR drills, COBOL/Java application support.',
        '<strong>24/7 Security Operations Center (SOC)</strong> — IBM QRadar SIEM, MITRE ATT&CK-aligned playbooks, fraud detection integration.',
        '<strong>Helpdesk and end-user support</strong> — Bahasa Indonesia and English, branch and HQ.',
        '<strong>Infrastructure operations</strong> — datacenter, hybrid cloud (IBM Cloud, AWS, Azure), backup and DR, network and firewall.',
        '<strong>Application portfolio management</strong> — for the long tail of business applications across HR, finance, and risk.',
      ]},
      { type: 'h2', text: 'The IDE Asia banking outsourcing engagement model' },
      { type: 'bullets', items: [
        '<strong>Transition phase (60–120 days)</strong> — knowledge transfer, runbook capture, shadow operations, regulatory documentation handover, OJK reporting cadence alignment.',
        '<strong>Steady-state operations</strong> — monthly steering, weekly SLA review, quarterly business review with executive sponsor.',
        '<strong>Continuous improvement</strong> — productivity targets baked into the contract (cost reduction, automation, MTTR improvement) with shared savings model optional.',
        '<strong>Exit clause</strong> — documented reverse-transition plan from day one; we don\'t lock you in.',
      ]},
    ],
    faqs: [
      ['Is IDE Asia OJK and Bank Indonesia compliant?', 'IDE Asia delivers IT outsourcing under controls aligned to OJK regulations on vendor risk management, data residency, and audit trail. We are ISO 27001:2013 certified, which covers the information security baseline that banking regulators require from outsourcing partners. Specific compliance posture is documented per contract.'],
      ['Can IDE Asia manage IBM Z mainframes for our core banking?', 'Yes. As an IBM Certified Partner with IBM Z experienced engineers, IDE Asia provides mainframe operations, Db2 admin, batch operations, COBOL/Java application support, capacity planning, and DR drills. We also support adjacent products in the IBM Z ecosystem including QRadar, Guardium, and Cloud Pak for AIOps.'],
      ['What SLAs do you guarantee for banking outsourcing?', 'Standard tiers: 99.5% (basic managed service), 99.9% (high-availability workloads), 99.99% (mission-critical core systems). Response and resolution times are tiered by priority with explicit credits for breaches.'],
      ['How does the transition from our incumbent vendor work?', 'A typical transition runs 60–120 days depending on portfolio size. Phases: (1) due diligence + runbook capture, (2) shadow operations, (3) parallel run, (4) cutover, (5) hyper-care. We have done multi-vendor transitions with no production incidents.'],
      ['What\'s the typical cost saving versus in-house IT operations?', 'Approximately 30% on like-for-like service scope, driven by economies of scale (shared SOC, shared on-call), automation (we have our own internal tooling and playbooks), and labor arbitrage across our Jakarta, Bandung, and Hanoi offices. Net savings depend heavily on your current operating model.'],
      ['Can we keep some functions in-house and outsource the rest?', 'Yes. We commonly run hybrid models — IDE Asia handles SOC, infrastructure, and the long-tail application portfolio while the bank retains core banking development and strategic projects.'],
    ],
  },

  // ── 3. Cloud Migration AWS to IBM ─────────────────────────────
  {
    slug: 'cloud-migration-aws-to-ibm',
    metaTitle: 'AWS to IBM Cloud Migration — Indonesia | IDE Asia',
    metaDescription: 'AWS to IBM Cloud migration services for Indonesian enterprises. IBM Certified Partner. Zero-downtime methodology. Data residency, financial-services-grade compliance. Free assessment.',
    eyebrow: 'CLOUD MIGRATION · AWS → IBM CLOUD',
    h1: 'AWS to IBM Cloud Migration for Indonesian Enterprises',
    subhead: 'Move regulated workloads from AWS to IBM Cloud with zero downtime. Designed for Indonesian banking, government, and enterprise clients who need data sovereignty, financial-services-grade compliance, and IBM software stack continuity.',
    primaryService: 'cloud-infrastructure',
    ogImage: '/images/og-cloud-infrastructure.jpg',
    sections: [
      { type: 'lead', text: 'Migrating from AWS to IBM Cloud is increasingly common for Indonesian enterprises facing three specific drivers: data residency requirements under OJK and the personal data protection law (UU PDP), the need for financial-services-validated cloud infrastructure, and economic pressure from licensing of IBM software (Db2, MQ, watsonx, WebSphere) that runs cheaper on IBM Cloud. IDE Asia is an IBM Certified Partner with cross-cloud migration experience. Our methodology delivers zero-downtime cutover for stateful workloads including databases, message queues, and core banking systems.' },
      { type: 'h2', text: 'Why move from AWS to IBM Cloud?' },
      { type: 'bullets', items: [
        '<strong>Data sovereignty</strong> — IBM Cloud offers Singapore region for ASEAN-resident workloads, plus IBM Cloud Satellite extends services to on-prem datacenters for true in-country residency under OJK and UU PDP.',
        '<strong>Financial-services-validated infrastructure</strong> — IBM Cloud is the first major cloud purpose-built for regulated financial services. Many compliance controls are baked into the platform.',
        '<strong>Confidential computing</strong> — IBM Secure Execution and Hyper Protect services use IBM Z-class hardware for data-in-use protection that AWS cannot match.',
        '<strong>IBM software licensing economics</strong> — Db2, MQ, WebSphere, watsonx, and the Cloud Paks portfolio run more cost-effectively on IBM Cloud than as BYOL on AWS.',
        '<strong>VMware lift-and-shift</strong> — VMware on IBM Cloud provides single-tenant bare metal hosts with vSphere, NSX, vSAN, and HCX, which simplifies migration of VMware-heavy on-prem estates.',
      ]},
      { type: 'h2', text: 'Our zero-downtime AWS to IBM Cloud migration methodology' },
      { type: 'p', text: 'Migrating regulated workloads cannot afford a Saturday-night cutover that overruns into Monday. IDE Asia\'s six-stage methodology is designed for zero-downtime migration of stateful systems including production databases, message queues, identity providers, and core banking applications.' },
      { type: 'bullets', items: [
        '<strong>Stage 1 — Assessment (2–4 weeks)</strong>. Workload discovery, dependency mapping, cost model, risk register, target architecture on IBM Cloud.',
        '<strong>Stage 2 — Landing zone build (3–5 weeks)</strong>. IBM Cloud account structure, VPC design, IAM, network connectivity (Direct Link to your DC, peering to AWS during transition), guardrails, FinOps tagging.',
        '<strong>Stage 3 — Re-platform and refactor (varies)</strong>. EKS → ROKS / Kubernetes, RDS → IBM Cloud Databases, S3 → IBM Cloud Object Storage. For Db2/MQ workloads, native lift.',
        '<strong>Stage 4 — Data sync (continuous)</strong>. Change Data Capture, log shipping, and dual-write patterns for zero-RPO cutover on databases.',
        '<strong>Stage 5 — Cutover (planned window)</strong>. DNS-based or load-balancer-based traffic shift. Rollback plan tested before cutover. Hyper-care monitoring for 14 days.',
        '<strong>Stage 6 — Decommission and FinOps tune (4–6 weeks)</strong>. AWS deprovisioning, IBM Cloud rightsizing using Turbonomic, cost-optimization sprint.',
      ]},
      { type: 'h2', text: 'Indonesian regulatory context we handle by default' },
      { type: 'bullets', items: [
        'OJK regulation on cloud computing — IBM Cloud financial services validation maps to most controls.',
        'Bank Indonesia regulation on payment systems — including data-in-Indonesia requirements.',
        'UU PDP (Personal Data Protection Law) — data classification, processing record, breach notification.',
        'BSSN (Cyber and Crypto Agency) guidelines for sensitive workloads.',
      ]},
    ],
    faqs: [
      ['How long does an AWS to IBM Cloud migration take?', 'For a typical mid-size enterprise (50–200 workloads), end-to-end is 6–9 months. Critical regulated workloads take longest due to validation; non-critical apps move in waves of 2–4 weeks each.'],
      ['Can you do zero-downtime database migration?', 'Yes. For Db2 we use native HADR + log shipping. For RDS Postgres/MySQL we use Database Migration Service-style continuous replication, then a planned cutover window. For NoSQL we use dual-write patterns. RPO can be near-zero; RTO measured in minutes.'],
      ['What about cost — will IBM Cloud actually be cheaper than AWS for my workloads?', 'It depends heavily on workload mix. Common patterns where IBM Cloud is cheaper: workloads heavy on IBM software (Db2, MQ, WebSphere) running BYOL on AWS — savings of 30-50% are typical when re-licensed under IBM Cloud subscription. Workloads requiring dedicated bare metal or confidential compute. Workloads needing in-country Indonesia residency. For commodity compute, AWS may remain cost-competitive. We model this honestly in Stage 1.'],
      ['Do we need to retrain our team for IBM Cloud?', 'Some training is needed but the gap is smaller than people fear. The IBM Cloud console is similar to AWS, Kubernetes (ROKS) is identical to EKS in operation, and Terraform/Ansible/CI-CD pipelines port directly. IDE Asia provides team training during transition as part of the migration engagement.'],
      ['Can we keep some workloads on AWS in a multi-cloud setup?', 'Yes — multi-cloud is common. We design networking (Direct Link, peering, transit), identity federation, and observability so the two clouds operate as a single fabric. IBM Cloud Satellite is particularly useful here.'],
      ['What\'s included in the free assessment?', 'A 4–6 hour engagement covering current AWS footprint review, top 10 workload migration complexity scoring, indicative cost model, and a one-page recommendation. No commitment to a paid engagement after.'],
    ],
  },

  // ── 4. Cybersecurity Audit Jakarta ────────────────────────────
  {
    slug: 'cybersecurity-audit-jakarta',
    metaTitle: 'Cybersecurity Audit in Jakarta — ISO 27001 & OJK | IDE Asia',
    metaDescription: 'Cybersecurity audit and assessment in Jakarta. Penetration testing, ISO 27001 gap assessment, OJK compliance audit. CEH and OSCP certified engineers. IBM QRadar partner.',
    eyebrow: 'CYBERSECURITY AUDIT · JAKARTA',
    h1: 'Cybersecurity Audit and Assessment in Jakarta',
    subhead: 'Independent security audit, penetration testing, and ISO 27001 / OJK gap assessment for Jakarta-headquartered enterprises. Delivered by CEH and OSCP certified engineers from an ISO 27001:2013 certified firm.',
    primaryService: 'it-security',
    ogImage: '/images/og-it-security.jpg',
    sections: [
      { type: 'lead', text: 'A cybersecurity audit is only as valuable as the auditor. In Jakarta, most enterprise security audits are delivered either by Big Four firms (expensive, slide-deck heavy) or by inexperienced local consultancies that lack the technical depth to find real issues. IDE Asia sits in the middle: a senior team of CEH and OSCP certified engineers who do both compliance audit (ISO 27001, OJK, BI, PCI DSS) and offensive penetration testing — and produce findings detailed enough for your CTO and remediation team to act on immediately.' },
      { type: 'h2', text: 'Types of cybersecurity audit we deliver in Jakarta' },
      { type: 'bullets', items: [
        '<strong>ISO 27001:2013 gap assessment</strong> — readiness audit for certification or surveillance audit preparation, mapped to the 114 controls in Annex A.',
        '<strong>OJK and Bank Indonesia compliance audit</strong> — for banking, multi-finance, fintech, and payment institutions.',
        '<strong>Penetration testing</strong> — black-box external, grey-box internal, web application, mobile application, API, and cloud (AWS, Azure, GCP, IBM Cloud).',
        '<strong>Red team exercises</strong> — full-scope adversary simulation with social engineering, physical, and network components.',
        '<strong>PCI DSS gap assessment</strong> — for merchants and acquirers processing card payments.',
        '<strong>UU PDP (Personal Data Protection Law) readiness audit</strong> — Indonesia\'s GDPR equivalent, in force since 2022.',
        '<strong>Cloud security posture assessment</strong> — CIS Benchmark and CSA CCM aligned, covering IAM, network, data, and logging across your cloud estate.',
        '<strong>Architecture security review</strong> — threat modeling for new applications before they go to production.',
      ]},
      { type: 'h2', text: 'Why an audit from IDE Asia is different' },
      { type: 'bullets', items: [
        '<strong>Findings are technical, reproducible, and actionable</strong> — not generic. Every finding includes proof, severity rating (CVSS), business impact, and remediation steps.',
        '<strong>Engineers who can fix what they find</strong> — IDE Asia\'s security practice also handles remediation engineering, so we don\'t hand you a 100-page PDF and walk away.',
        '<strong>ISO 27001:2013 certified ourselves</strong> — we live by the standard we audit you against.',
        '<strong>IBM QRadar and Guardium partner</strong> — when the audit reveals SIEM or DAM gaps, we can implement and operate the solution.',
        '<strong>Indonesian regulatory fluency</strong> — OJK, BI, BSSN, Kominfo. We speak the language of your regulator.',
        '<strong>Discrete and confidential</strong> — engagements are run under strict NDA with chain-of-custody for findings.',
      ]},
      { type: 'h2', text: 'A typical Jakarta cybersecurity audit engagement' },
      { type: 'bullets', items: [
        '<strong>Scoping (1 week)</strong> — define scope, rules of engagement, target list, success criteria.',
        '<strong>Reconnaissance and assessment (2–4 weeks)</strong> — fieldwork. Penetration testing, document review, control verification, evidence collection.',
        '<strong>Reporting (1 week)</strong> — draft findings report, executive summary, remediation roadmap.',
        '<strong>Readout (½ day)</strong> — presentation to executive sponsor and remediation team. Q&A and prioritization workshop.',
        '<strong>Optional re-test (1 week)</strong> — verify remediation after your team has fixed the high/critical findings, typically 60–90 days later.',
      ]},
      { type: 'h2', text: 'After the audit — remediation engineering' },
      { type: 'p', text: 'Audit findings without remediation are paperwork. IDE Asia offers end-to-end remediation engineering as a follow-on: SIEM rollout (IBM QRadar), database security (IBM Guardium), IAM modernization (IBM Verify), endpoint and mobile security (IBM MaaS360), Zero Trust architecture, and SOC operationalization. For ongoing operations we provide 24/7 SOC as a managed service.' },
    ],
    faqs: [
      ['How much does a cybersecurity audit in Jakarta cost?', 'A typical ISO 27001 gap assessment for a mid-size enterprise is Rp 200jt–500jt. External penetration test of a public-facing application is Rp 80jt–250jt. Full red team is Rp 400jt–1.2 mlr. Pricing depends on scope, target count, and depth. We provide free scoping and a fixed-fee proposal.'],
      ['How long does a penetration test take?', 'External pentest of a single web application: 5–10 working days. Internal pentest of a typical corporate network (1,000 endpoints): 15–20 working days. Red team exercise: 4–8 weeks.'],
      ['Will you give us a clean opinion on our ISO 27001 readiness?', 'We give you an honest opinion, not a clean one. Our value is finding real gaps before your certifying body or regulator does. If you are ready, we will say so; if you are not, we will tell you which controls need work and how long remediation will take.'],
      ['Do you do remote audit or only on-site in Jakarta?', 'Both. We default to on-site for sensitive engagements (with IDE Asia staff working from your premises) and remote for cloud-native audits. Hybrid is common.'],
      ['Can you do the audit and then implement the fixes?', 'Yes, but with disclosure. We separate audit and remediation engineering into different engagement contracts to avoid conflict of interest, and we recommend a third-party re-test before any certification body audit.'],
      ['Do we get a Letter of Attestation we can show our regulator?', 'For ISO 27001 readiness we provide a formal findings report you can submit as evidence of due diligence. The certification itself comes from an accredited certification body (SUCOFINDO, TUV Rheinland, BSI, etc.) — we prepare you for their audit.'],
    ],
  },

  // ── 5. IBM watsonx Implementation ─────────────────────────────
  {
    slug: 'ibm-watsonx-implementation',
    metaTitle: 'IBM watsonx Implementation Services — Indonesia | IDE Asia',
    metaDescription: 'IBM watsonx.ai, watsonx.data, and watsonx.governance implementation in Indonesia. IBM Certified Partner. 4–8 week typical delivery. Banking, government, and enterprise use cases.',
    eyebrow: 'IBM WATSONX · IMPLEMENTATION',
    h1: 'IBM watsonx Implementation in Indonesia',
    subhead: 'IBM Certified Partner delivering watsonx.ai, watsonx.data, and watsonx.governance for Indonesian enterprises. Customer service copilots, document extraction, code generation, and AI governance — implemented in 4–8 weeks.',
    primaryService: 'it-consulting',
    ogImage: '/images/og-products.jpg',
    sections: [
      { type: 'lead', text: 'IBM watsonx is the enterprise AI platform for organizations that need to deploy foundation models with governance, data privacy, and on-prem flexibility — not just consumer chatbots. Indonesian banks, government agencies, and regulated enterprises are adopting watsonx for use cases ranging from BI-FAST fraud detection copilots to document extraction for KYC and credit underwriting. IDE Asia is an IBM Certified Partner authorized to implement the watsonx portfolio. Most engagements deliver a production-ready first use case in 4–8 weeks.' },
      { type: 'h2', text: 'The IBM watsonx portfolio' },
      { type: 'bullets', items: [
        '<strong>watsonx.ai</strong> — enterprise studio for building, validating, tuning, and deploying foundation models. Supports IBM Granite, Llama, and Mistral. Runs on IBM Cloud or on-prem (Cloud Pak for Data).',
        '<strong>watsonx.data</strong> — open lakehouse on Apache Iceberg + Presto + Spark. Query data across S3, HDFS, Db2, and Snowflake without copying. 50% cost reduction versus traditional warehouse for AI workloads.',
        '<strong>watsonx.governance</strong> — AI governance, risk, and compliance. EU AI Act, NIST AI RMF, and ISO 42001 ready. Tracks model lifecycle, drift, bias, and quality.',
        '<strong>watsonx Assistant</strong> — conversational AI with RAG for customer service automation.',
        '<strong>watsonx Orchestrate</strong> — AI agent platform with skills for 100+ apps (Workday, Salesforce, SAP, ServiceNow).',
        '<strong>watsonx Code Assistant</strong> — AI pair-programmer for Java, COBOL, and Ansible.',
      ]},
      { type: 'h2', text: 'High-ROI watsonx use cases for Indonesian enterprises' },
      { type: 'bullets', items: [
        '<strong>Customer service copilot for banks and telcos</strong> — RAG over product documentation, account terms, and historical tickets. Typical impact: 35–55% deflection at L1 + 30% AHT reduction at L2.',
        '<strong>Document extraction for credit underwriting and KYC</strong> — extract structured data from KTP, NPWP, payslips, statements. Reduces manual data entry by 70–85%.',
        '<strong>Fraud-detection analyst copilot</strong> — surface relevant case history and patterns to fraud analysts in real time, integrated with Trusteer and QRadar.',
        '<strong>Internal knowledge search</strong> — for policy, SOP, and engineering documentation. Replaces clunky SharePoint search.',
        '<strong>Code modernization assistant</strong> — for COBOL-to-Java mainframe modernization, AIX-to-Linux migration, and Ansible playbook generation.',
        '<strong>Regulatory monitoring</strong> — summarize OJK, BI, and Kominfo regulatory updates against your existing policies; flag impact.',
      ]},
      { type: 'h2', text: 'A typical IDE Asia watsonx implementation' },
      { type: 'bullets', items: [
        '<strong>Week 0 — Use case definition workshop</strong>. Prioritize one or two use cases that have clear ROI, data availability, and executive sponsorship. Avoid 10 simultaneous pilots — focus wins.',
        '<strong>Weeks 1–2 — Environment provisioning</strong>. watsonx.ai instance, data integration (often watsonx.data), RAG pipeline, vector store, IAM, audit logging.',
        '<strong>Weeks 3–5 — Build and tune</strong>. Prompt engineering, fine-tuning if needed (Granite supports LoRA), evaluation harness, red-team for safety.',
        '<strong>Weeks 6–7 — Pilot</strong>. Controlled rollout to a single business unit. Production observability via Instana.',
        '<strong>Week 8 — Go-live and governance</strong>. Production launch, watsonx.governance configured for ongoing drift and bias monitoring, handover to your team.',
      ]},
      { type: 'h2', text: 'Why an IBM Certified Partner matters for watsonx' },
      { type: 'p', text: 'watsonx is enterprise-grade software with non-trivial deployment patterns: data integration, RAG architecture, prompt engineering at scale, model governance, and integration with existing identity and observability. IBM Certified Partners have access to IBM technical resources, escalation paths, and licensing structures that independent consultants do not. For regulated workloads — banking, government, healthcare — that partnership matters when you hit edge cases or need to certify the deployment.' },
    ],
    faqs: [
      ['How much does a watsonx implementation cost?', 'Software: watsonx.ai SaaS pricing is consumption-based, typically USD 5k–50k/month for production workloads depending on tokens and seats. Implementation services from IDE Asia for a first use case: Rp 600jt–2 mlr depending on complexity. Discovery + scoping is free at https://ide.asia/contact.'],
      ['What\'s the difference between watsonx and just using ChatGPT or Gemini API?', 'Three things. First, governance — watsonx.governance gives you the audit trail, drift monitoring, and policy enforcement that regulated industries need. Second, deployment flexibility — on-prem (Cloud Pak for Data), private cloud, IBM Cloud, or hybrid. Third, IP indemnification — IBM contractually backs Granite models against third-party IP claims.'],
      ['Can watsonx run on-prem for data sovereignty?', 'Yes. Cloud Pak for Data, which includes watsonx.ai and watsonx.data, runs on OpenShift on your own infrastructure. This is the deployment model for banks and government agencies that cannot send data to public cloud.'],
      ['Which models does watsonx support besides IBM Granite?', 'Llama 3 family (Meta), Mistral, Mixtral, and other open-source models curated by IBM. You can also bring your own fine-tuned model. The platform is model-agnostic; what IBM provides is the enterprise wrapper around the models.'],
      ['How long until we see ROI from a watsonx pilot?', 'For high-volume use cases (customer service, document extraction), payback is typically 6–9 months from go-live. For lower-volume but high-value cases (regulatory monitoring, fraud copilot), payback can be faster due to risk avoidance even at lower transaction volume.'],
      ['Can IDE Asia help us with watsonx + existing IBM stack (Db2, MQ, QRadar)?', 'Yes — this is a sweet spot for us. We commonly integrate watsonx with Db2 (data source), MQ (event-driven AI inference), QRadar (security AI use cases), and the IBM Cloud Paks portfolio. Integration is faster when your existing IBM environment is already production-grade.'],
    ],
  },
];

function getLanding(slug) {
  return LANDINGS.find(l => l.slug === slug);
}

function buildJsonLd(siteUrl, landing) {
  const url = `${siteUrl}/landing/${landing.slug}`;
  return `<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${url}#page`,
        url,
        name: landing.metaTitle,
        description: landing.metaDescription,
        inLanguage: 'en',
        isPartOf: { '@id': `${siteUrl}#website` },
        about: { '@id': `${siteUrl}#organization` },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl + '/' },
          { '@type': 'ListItem', position: 2, name: landing.h1, item: url },
        ],
      },
      {
        '@type': 'FAQPage',
        '@id': `${url}#faq`,
        mainEntity: landing.faqs.map(([q, a]) => ({
          '@type': 'Question',
          name: q,
          acceptedAnswer: { '@type': 'Answer', text: a },
        })),
      },
    ],
  })}</script>`;
}

router.get('/:slug', (req, res, next) => {
  const landing = getLanding(req.params.slug);
  if (!landing) return next();
  const siteUrl = res.locals.siteUrl || 'https://ide.asia';
  res.render('pages/landing', {
    title: landing.metaTitle,
    description: landing.metaDescription,
    ogImage: landing.ogImage,
    currentPage: '',
    landing,
    jsonLd: buildJsonLd(siteUrl, landing),
  });
});

module.exports = router;
module.exports.LANDINGS = LANDINGS;
