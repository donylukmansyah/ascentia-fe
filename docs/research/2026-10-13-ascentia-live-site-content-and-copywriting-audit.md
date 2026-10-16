# Comprehensive Audit: Live Site Architecture, Routing, and Copywriting (`ascentia.co.id`)

**Date:** 2026-10-13  
**Target:** [https://ascentia.co.id/](https://ascentia.co.id/) (and `/en/` localization mirror)  
**Methodology:** Full REST API schema probe (`wp/v2`, `wc/store/v1`), live HTML DOM inspection, multi-language routing crawl, and line-by-line editorial audit.

---

## Executive Summary

PT Ascentia Arsya Analitika is a specialized B2B distributor of analytical instrumentation and laboratory equipment (fusion machines, thermogravimetric analyzers, certified reference materials / CRMs, sample preparation tools) serving mining, metallurgy, cement, petrochemicals, and research institutions in Indonesia. Established in 2022 under the PT Dynatech International Group, it operates out of Jakarta and Kendari (strategic proximity to the Sulawesi nickel mining corridor).

However, the current live website (`ascentia.co.id`) is in an incomplete, hybrid WordPress + Divi + WooCommerce state that actively undermines the company's credibility with high-ticket enterprise buyers:

1. **Routing & Architectural Fragmentation:** Brand pages have broken slug suffixes (`/fritsch-2/`, `/oreas-2/`), News and Articles return 404/empty query states, and e-commerce cart/checkout routes are exposed despite the company operating an offline B2B quotation model.
2. **Language Dissonance:** Heavy mixture of English headlines, Indonesian product copy, English About Us text, Indonesian WooCommerce status strings, and English/Indonesian form labels without coherent translation synchronization.
3. **Copywriting & Quality Defects:** The site contains unremoved Divi template dummy text (_"Divi Lead VB"_, _"Things To Do on Your Trip To San Francisco"_, _"Pellentesque in ipsum..."_), typos (_"expand the use o X-ray"_, _"applications trough seminar"_), and passive corporate clichés.
4. **Missed B2B Value Proposition:** High-ticket laboratory buyers make purchasing decisions based on accuracy, sample throughput, compliance/traceability, calibration services, and local technician SLA. The current copy treats products like consumer catalog items priced at `$0.00` rather than mission-critical analytical systems.

---

## 1. Information Architecture & URL Routing Map

### 1.1 Primary Navigation Hierarchy

```text
Header Navigation
├── Home                      → / (or /en/)
├── About Us                  → /about-us/ (or /en/about-us/)
├── Products                  → /products/ (or /en/products/)
│   ├── Filter: All Products
│   ├── Filter: XRF Scientific → /product-category/xrf-scientific/
│   ├── Static: Fritsch       → (unlinked <span>)
│   ├── Static: Oreas         → (unlinked <span>)
│   └── Static: Brammer Standard → (unlinked <span>)
├── News                      → /news/ (or /en/news/) [EMPTY / NO POSTS]
├── Articles                  → /articles/ (or /en/articles/) [EMPTY / NO POSTS]
├── Contact Us                → /contact-us/ (or /en/contact-us/)
└── Language Switcher         → ID (/) | EN (/en/) [TranslatePress]
```

### 1.2 Full Route & Slug Inventory

| Route / Slug          | Type             | Template / Engine       | Live Status & Issues                                                |
| --------------------- | ---------------- | ----------------------- | ------------------------------------------------------------------- |
| `/`                   | Page (ID 86)     | Divi Front Page         | Active, but contains Divi filler blocks and dummy blog feeds.       |
| `/en/`                | Page (ID 86)     | TranslatePress Mirror   | Identical structure, partially localized system text.               |
| `/about-us/`          | Page (ID 65)     | Divi Theme Builder      | Hardcoded English copy; empty REST `content.rendered`.              |
| `/products/`          | Page (ID 137)    | WooCommerce Shop + Divi | Shows only 3 of 9 products by default; lists prices as `$0.00`.     |
| `/news/`              | Page (ID 71)     | Divi Blog Module        | Returns _"Tak Ditemukan Hasil"_ (Category 20 has 0 posts).          |
| `/articles/`          | Page (ID 73)     | Divi Blog Module        | Returns _"Tak Ditemukan Hasil"_ (Category 20 has 0 posts).          |
| `/contact-us/`        | Page (ID 67)     | Divi Page Builder       | Active form with math captcha; generic placeholder FAQ copy.        |
| `/brammer-standard/`  | Page (ID 1396)   | Default WP Blog Archive | Default blog template with search and "Halo dunia!". No brand copy. |
| `/oreas-2/`           | Page (ID 1393)   | Default WP Blog Archive | Suffix `-2`; default archive template with "Halo dunia!".           |
| `/fritsch-2/`         | Page (ID 1390)   | Default WP Blog Archive | Suffix `-2`; default archive template with "Halo dunia!".           |
| `/xrf-scientific/`    | Page (ID 1387)   | Custom Page             | Blank body, only global footer rendered.                            |
| `/kebijakan-privasi/` | Page (ID 3)      | WP Core Default         | Standard auto-generated Indonesian WordPress privacy boilerplate.   |
| `/cart/`              | WC Core (ID 138) | WooCommerce Cart        | Inappropriate for B2B industrial machinery; unconfigured.           |
| `/checkout/`          | WC Core (ID 139) | WooCommerce Checkout    | Inappropriate for B2B industrial machinery; unconfigured.           |
| `/my-account/`        | WC Core (ID 140) | WooCommerce Account     | Unused consumer login portal.                                       |

### 1.3 WooCommerce Dynamic Catalog Routes

All 9 live WooCommerce products belong to **XRF Scientific** (brand taxonomies are currently modeled as product categories, not separate brand entities):

| Product Slug                                                       | Canonical Title                                          | Primary Categories                                                  | Live Description Status                                                  |
| ------------------------------------------------------------------ | -------------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `/product/xrtga-range-thermogravimetric-analyser/`                 | TGA 1100 Thermogravimetric Analyser                      | Electric Fusion, Fusion Equipment, Thermal Analysis, XRF Scientific | Detailed Indonesian technical copy translated from Australian principal. |
| `/product/phoenix-ii-gas-fusion-machine-3-or-6-positions/`         | Phoenix II Gas Fusion Machine – 3 or 6 Positions         | Fusion Equipment, Gas Fusion Machines, XRF Scientific               | Detailed Indonesian technical copy; highlights 1000 global installs.     |
| `/product/phoenix-vfd-automatic-gas-fusion-machine/`               | Phoenix VFD Automatic Gas Fusion Machine                 | Fusion Equipment, Gas Fusion Machines, XRF Scientific               | Detailed Indonesian copy on cold-surface operation & optical monitoring. |
| `/product/phoenix-go-s-gas-fusion-machine-1-position/`             | Phoenix GO S Gas Fusion Machine – 1 Position             | Fusion Equipment, Gas Fusion Machines, XRF Scientific               | Highlights gas-only operation without external compressed oxygen.        |
| `/product/phoenix-go-4-gas-fusion-machine-4-positions/`            | Phoenix GO 4 Gas Fusion Machine – 4 Positions            | XRF Scientific                                                      | Highlights compact 4-station high-throughput lab setup.                  |
| `/product/xrfuse-6-automatic-electric-fusion-machine-6-positions/` | xrFuse 6 Automatic Electric Fusion Machine – 6 Positions | Electric Fusion, Fusion Equipment, XRF Scientific                   | Thermal imaging integration, 25+ years technology pedigree.              |
| `/product/xrfuse-2-automatic-electric-fusion-machine-2-positions/` | xrFuse 2 Automatic Electric Fusion Machine – 2 Positions | Electric Fusion, Fusion Equipment, XRF Scientific                   | Dual-position electric fusion unit for mid-scale laboratories.           |
| `/product/xrfuse-1-automatic-electric-fusion-machine-1-position/`  | xrFuse 1 Automatic Electric Fusion Machine – 1 Position  | Electric Fusion, Fusion Equipment, XRF Scientific                   | Single-position electric bead preparation for XRF and ICP.               |
| `/product/modutemp-shaking-fusion-furnace-6-positions/`            | Modutemp Shaking Electric Fusion Machine – 6 Positions   | Electric Fusion, Fusion Equipment, XRF Scientific                   | 30 fused beads/hour high-throughput furnace.                             |

---

## 2. Page-by-Page Deep Dive & Copywriting Audit

### 2.1 Homepage (`/`)

#### Structure & Intent

Hero introduction → Partner brands marquee → Value proposition ("Our Strength") → Lead generation contact form → Office locations.

#### Exact Live Copy

- **Hero Title:** `Laboratory and Equipment Distributor`
- **Hero Subtitle:** `To be the best partner in distribution and utilization of analytical instrumentation & laboratory equipment.`
- **Hero CTA:** `Get Started`
- **Strengths Section:**
  - `Our Strength`
  - Item 1: `Best Quality Instruments`
  - Item 2: `Experienced Support Team`
  - Item 3: `Trusted Technical Team`
- **Divi Artifacts (rendered in DOM):**
  - Title: `Divi Lead VB`
  - Body: _"Your content goes here. Edit or remove this text inline or in the module Content settings..."_
  - Card: `Monarch Sport` / `Nexus Passenger`
  - Blog Module: _"Things To Do on Your Trip To San Francisco"_, _"Drive Across the Golden Gate Bridge"_, _"Drive Down the Windiest Street in the City"_.

#### Editorial & UX Critique

1. **Broken Value Proposition:** _"Laboratory and Equipment Distributor"_ is grammatically clipped (should be _"Laboratory Equipment & Analytical Instrumentation Distributor"_). It describes a trade classification, not a customer outcome.
2. **Weak Vision Statement:** _"To be the best partner in distribution and utilization..."_ is an inward-facing corporate aspiration. Customers do not care about a company's goal to "be the best partner"; they care about precision, uptime, and test validity.
3. **Vague CTAs:** _"Get Started"_ is standard SaaS template copy. In B2B instrumentation, visitors do not "get started" on a website. Meaningful actions are _"Request Consultation"_, _"Explore Equipment"_, or _"Talk to an Application Specialist"_.
4. **Superficial Strengths:** Listing _"Best Quality Instruments"_, _"Experienced Support Team"_, and _"Trusted Technical Team"_ without supporting evidence, numbers, or principal accreditations reads as empty claims.

---

### 2.2 About Us (`/about-us/`)

#### Structure & Intent

Company narrative → Corporate history (Dynatech parentage) → Focus areas → Vision & Mission → Partner Brand Overviews → Contact form.

#### Exact Live Copy

- **Intro:** _"Welcome to Ascentia Arsya Analitika, where customers’ needs are met through the use of innovative technologies and first-rate customer service."_
- **History:**
  - _"PT Ascentia Arsya Analytica was established in 2022 which is part of PT Dynatech International Group."_
  - _"As a laboratory equipment distributor with nearly two decades of experience, is the Dynatech International Group’s development branch in the field of Analytical Instruments and Laboratory Equipment."_
- **Focus:**
  - _"Further expand the use o X-ray, Magnetic Resonance, Sample Preparation, Certified Reference Materials (CRMs), and other analytical products in Indonesia through coverage distribution and application expansion."_
  - _"Strengthen user experience in many applications trough seminar and training. To be a problem solver and a good partnership for our customers"_
  - _"Our primary customers are in the fields of research and higher education, mineral mining, cement and building materials, and petrochemicals."_
- **Vision:** _"Being the finest partner in the use of analytical instrumentation and laboratory equipment."_
- **Mission:**
  - _"To effectively meet the needs of our clients by providing the best solutions and continuous support."_
  - _"To be a company where skilled and qualified people may build their enthusiasm via extensive and professional training."_
  - _"To become a business where skilled and competent individuals pursue their passions through in-depth training and professional development."_
  - _"To improve user experience in several applications through seminars and expert training."_
- **Brand Summaries:**
  - **XRF Scientific:** _"XRF Scientific Limited is an Australian Listed Company. Experts in the manufacture and distribution of high-quality equipment, chemicals, and analytical solutions..."_
  - **Fritsch:** _"Renowned globally as a premier manufacturer, known for creating application-specific laboratory instruments for sample preparation and particle sizing..."_
  - **OREAS:** _"OREAS® brand is now recognised as the world leader in certified reference materials for the global mining industries..."_
  - **Brammer Standard:** _"Brammer Standard provides a wide selection of Certified Reference Materials (CRMs) for precise calibration, quality control, and method validation in spectrometric analysis..."_
  - **Specac:** _"Specac Ltd is a global leader in innovative, high-quality sample preparation and spectroscopy accessories..."_
  - **Mettler Toledo:** _"From weighing and analytical measurements to process and quality control, Mettler Toledo’s products are designed to enhance accuracy, efficiency, and compliance..."_
  - **Yosion Lab:** _"Yosion Lab is specializing in sample preparation, testing, and analytical instruments..."_
  - **Spectral Evolution:** _"Spectral Evolution offers portable, rugged, and accurate instruments for geology, mining, remote sensing, and plant research..."_

#### Editorial & UX Critique

1. **Critical Typos & Awkward Phrasing:**
   - _"use o X-ray"_ (missing 'f').
   - _"applications trough seminar"_ (spelled 'trough' instead of 'through').
   - _"Spectral Evolutions’s"_ (double possessive typo).
   - _"To be a problem solver and a good partnership for our customers"_ (ungrammatical).
2. **Redundant Mission Statements:** The 2nd and 3rd mission bullet points are almost identical restatements of internal HR training (_"skilled and qualified people may build their enthusiasm..."_ vs _"skilled and competent individuals pursue their passions..."_).
3. **Generic CTA Buttons:** Every brand card concludes with a plain button labeled _"Klik"_ (Indonesian for "Click"), which violates basic accessible CTA design and offers zero context.
4. **Strong Underlying Narrative (Buried):** The company's strongest asset—being the dedicated analytical instruments arm of Dynatech International with 20 years of technical heritage and direct representation of world-class principals—is buried beneath passive phrasing.

---

### 2.3 Products & Product Details (`/products/` & `/product/:slug`)

#### Structure & Intent

Catalog listing → WooCommerce product grid → Product detail view (specifications, application notes, compliance standards).

#### Exact Live Copy (Catalog)

- **Header:** `All Products`
- **Subheader:** `Get Best Products`
- **Featured Hero Card:**
  - Title: `xrFuse 6 Automatic Electric Fusion Machine – 6 Positions`
  - Badge: `Best Product`
  - Heading: `Get This Product Now`
  - Body: _"Based on more than 25 years of experience with fusion technology and applications, the xrFuse family of automated electric fusion machines has been developed. With the most up-to-date thermal imaging technology and consumer testing in the largest XRF labs in the world, xrFuse is created with the user in mind."_
  - CTA: `See Product`

#### Sample Technical Product Copy (TGA 1100)

- **Title:** `TGA 1100 Thermogravimetric Analyser`
- **Opening:** _"Automated macro thermogravimetric XRF Scientific (TGA) adalah solusi high-throughput untuk berbagai aplikasi analisis termal. Dirancang dengan pengguna industri dan fasilitas ilmiah berskala besar sebagai pertimbangan utama."_
- **Key Sections:**
  - _Termogravimetri sebagai standar industri evaluasi dekomposisi termal (abu, kelembapan, bahan mudah menguap/loss-on-ignition)._
  - _Interface layar sentuh terintegrasi dengan diagnostic real-time._
  - _Suhu operasi hingga 1100°C dengan kontrol atmosfer fleksibel._
  - _Kepatuhan standar industri (ASTM, ISO)._

#### Editorial & UX Critique

1. **Strongest Technical Copy on the Site:** The product detail descriptions (translated from XRF Scientific's engineering manuals) are technically accurate, informative, and relevant to chemists and lab managers.
2. **Catalog Misalignment:**
   - Listing machines at `$0.00` suggests either a broken price or free software, which is inappropriate for capital equipment costing $20,000–$100,000+.
   - WooCommerce e-commerce sorting (_"Urutkan berdasar tren"_, _"Urutkan dari termurah"_) makes no sense for custom-configured laboratory systems.
   - Non-XRF Scientific brands (Fritsch, OREAS, Brammer) appear as inactive labels with zero catalog inventory.

---

### 2.4 News & Articles (`/news/` & `/articles/`)

#### Structure & Intent

Thought leadership, application notes, industry case studies, event coverage (seminars/exhibitions).

#### Exact Live Copy

- **News Heading:** `Our News`
- **Articles Heading:** `Our Blog`
- **Body Content:**
  - `Tak Ditemukan Hasil`
  - _"Laman yang Anda rikues tak dapat ditemukan. Cobalah mengganti pencarian Anda, atau gunakan navigasi di atas untuk mencari postingan."_

#### Editorial & UX Critique

1. **Broken Content Contract:** In B2B technical equipment, an empty news/blog section that outputs WordPress default 404 text sends a signal that the company is either defunct or inactive.
2. **Divergent Taxonomy:** The site divides editorial content into "News" and "Articles", but has zero published posts in either category.

---

### 2.5 Contact Us (`/contact-us/`)

#### Structure & Intent

Inquiry intake → Direct telephone/email channels → Geographic presence (Jakarta Head Office + Kendari Branch Office).

#### Exact Live Copy

- **Header:** `Contact Us`
- **Subtitle:** _"We’re here to help! Our dedicated support team is ready to assist with any inquiries you may have. Feel free to reach out to us using the contact information below."_
- **Form Heading:** `Fill in The Column`
- **Sub-headline:** `Let’s Connected!`
- **Office Locations:**
  - **Head Office:** `Business Park Kebon Jeruk D2-12, Jl. Meruya Ilir No. 88, Meruya, Jakarta Barat 11620` | `(021) 2932-5739` | `+62 851-8606-1000` | `sales@ascentia.co.id`
  - **Kendari Office:** `Jl. Malaka Kawasan Citraland Kendari, Blok A01/015, Kendari, Sulawesi Tenggara` | `sales@ascentia.co.id` | `+62 851-8606-1000`
- **FAQ Section (DOM Template):**
  - Title: `Frequently Asked Questions`
  - Body: 10 repeated blocks of lorem ipsum: _"Praesent sapien massa, convallis a pellentesque nec, egestas non nisi..."_

#### Editorial & UX Critique

1. **Awkward Headline Copy:**
   - _"Fill in The Column"_ is unnatural English (should be _"Send Us an Inquiry"_ or _"Request Technical Information"_).
   - _"Let’s Connected!"_ is ungrammatical (should be _"Let's Connect"_ or _"Get in Touch with Our Team"_).
2. **Dummy Content in Production:** The FAQ section renders 10 blocks of raw Latin Lorem Ipsum.
3. **Underleveraged Geographic Advantage:** Kendari is the hub for Indonesia's nickel processing and smelting plants. A regional branch there is a massive competitive differentiator for rapid field support and calibration, but the copy treats it as just an address line.

---

## 3. Copywriting Strategy & Best Practices for Ascentia

To convert laboratory directors, QC managers, and mining procurement heads, Ascentia’s copywriting must shift from **passive generic corporate speak** to **authoritative, outcome-oriented B2B technical communication**.

### 3.1 Target Buyer Personas & Core Decision Drivers

| Target Persona                                                | Key Pain Points                                                                                                                | What the Copy Must Communicate                                                                                                                                           |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Mining & Smelter QC Manager** (Nickel, Coal, Gold, Bauxite) | Sample preparation bottlenecks; bead cracking during XRF analysis; equipment downtime in remote sites (e.g. Kolaka, Morowali). | High-throughput automation (up to 30 beads/hr), rugged reliability, direct technical support from Kendari branch, genuine certified reference materials (OREAS/Brammer). |
| **Cement & Building Materials Lab Head**                      | Strict ISO/ASTM compliance; variability in raw material mineralogy; operator safety with high-temperature gas/electric fusion. | Adaptive burner controls, cool-touch touchscreens, thermal imaging safety, exact recipe repeatability, compliance with ASTM/ISO standards.                               |
| **University & Research Scientist**                           | Budget justification; multi-application flexibility; precision at trace levels; analytical reproducibility.                    | Traceability of CRMs, high-temperature precision (up to 1100°C), application consulting, seminars, and certified training.                                               |
| **Procurement & Supply Chain Director**                       | Vendor stability; warranty coverage; import delays for consumables (crucibles, fluxes, CRMs); after-sales responsiveness.      | Part of Dynatech Group (20+ years track record), authorized Indonesian principal representative, local consumable buffer stock, rapid Jakarta & Kendari dispatch.        |

---

### 3.2 Strategic Copywriting Frameworks

#### A. Homepage Hero Section

- **Current:**
  > _Laboratory and Equipment Distributor_  
  > _To be the best partner in distribution and utilization of analytical instrumentation & laboratory equipment._  
  > `[Get Started]`
- **Recommended (B2B Precision & Authority):**
  > **Eyebrow:** `AUTHORIZED ANALYTICAL & LABORATORY INSTRUMENTATION DISTRIBUTOR`  
  > **Headline:** Precision Analytical Instruments & Sample Preparation for Industrial Laboratories  
  > **Subheadline:** Partnering with global leaders—XRF Scientific, OREAS, and Brammer Standard—to deliver certified accuracy, high-throughput sample fusion, and dedicated on-site engineering support across Indonesia.  
  > **Primary CTA:** `[Request a Product Consultation]`  
  > **Secondary CTA:** `[Explore Catalog by Application]`  
  > **Trust Bar:** _Trusted by mining operations, cement plants, and research laboratories across Indonesia. Strategic support offices in Jakarta & Kendari._

#### B. Value Proposition ("Our Strength" → "Why Laboratories Choose Ascentia")

- **Current:**
  > _Best Quality Instruments | Experienced Support Team | Trusted Technical Team_
- **Recommended (Feature → Advantage → Benefit / FAB):**
  1. **Direct Principal Partnerships:** Authorized distributor for global leaders including XRF Scientific, OREAS, and Brammer Standard. Guarantee of 100% genuine instruments, traceable reference materials, and authentic replacement parts.
  2. **Application & Method Development:** Our specialized technical chemists don't just deliver boxes—we optimize fusion recipes, configure calibration curves, and train your laboratory technicians on-site.
  3. **Strategic Regional Support (Jakarta & Kendari):** Fast engineer dispatch, routine preventative maintenance, and buffer inventory for consumables situated close to Indonesia's primary mining and industrial hubs.

#### C. Product Page Architecture & Microcopy

- **Current:**
  > `Get Best Products` | `$0.00` | `See Product` | `Deskripsi / Ulasan (0)`
- **Recommended:**
  - **Price Representation:** Remove `$0.00`. Replace with `Enterprise Quotation & Specification Request`.
  - **Technical Specs First:** Group content into clear technical tabs:
    1. _Overview & Application Scope_
    2. _Technical Specifications (Thermal range, throughput, power requirements)_
    3. _Compliance & Standards (ASTM, ISO, DIN)_
    4. _Compatible Consumables & Labware (Platinum crucibles, fluxes, CRMs)_
  - **Primary CTAs:**
    - `[Request Specification Sheet (PDF)]`
    - `[Request Quotation & Application Consultation]`

#### D. About Us Narrative ("The Ascentia Story")

- **Current:**
  > _Welcome to Ascentia Arsya Analitika, where customers’ needs are met through the use of innovative technologies..._
- **Recommended (Heritage + Mission):**
  > **Headline:** Two Decades of Analytical Expertise, Built for Indonesia’s Toughest Industrial Laboratories.  
  > **Body:** Established in 2022 as the specialized analytical instrumentation division of PT Dynatech International Group, PT Ascentia Arsya Analitika was founded to solve a critical challenge: providing Indonesian industrial and scientific laboratories with direct access to world-leading sample preparation, X-ray spectroscopy, and certified reference standards.  
  > Supported by nearly 20 years of parent group engineering heritage, our Jakarta headquarters and Kendari branch ensure that laboratory teams in mining, metallurgy, cement, and chemical research achieve uncompromising analytical repeatability with zero operational downtime.

#### E. Contact Us & Conversion Microcopy

- **Current:**
  > `Fill in The Column` | `Let’s Connected!`
- **Recommended:**
  > **Headline:** Speak Directly with an Analytical Application Specialist  
  > **Subheadline:** Whether you are establishing a new laboratory facility, optimizing mineral sample fusion, or replenishing certified reference standards, our engineering team is ready to assist.  
  > **Form Header:** `Submit an Inquiry for Equipment, Consumables, or Service`  
  > **Button:** `[Submit Technical Inquiry]`

---

## 4. Technical & Frontend Remediation Checklist

To align the new frontend implementation (`ascentia-fe`) with these research findings:

1. [x] **Eliminate Divi Artifacts:** Ensure no shortcodes or legacy page builder dummy strings pollute the new headless frontend.
2. [ ] **Clean URL Architecture:**
   - Map brand taxonomy routes cleanly (e.g. `/products/brands/xrf-scientific`, `/products/brands/oreas`, `/products/brands/fritsch`, `/products/brands/brammer-standard`).
   - Remove legacy slug suffixes (`-2`).
   - Eliminate public consumer routes (`/cart/`, `/checkout/`, `/my-account/`) in favor of a B2B RFQ (Request for Quote) flow.
3. [ ] **Implement Bilingual Language Parity:**
   - If maintaining dual-language support (ID/EN), ensure complete translation of technical body copy, metadata, and microcopy, not just framework UI strings.
4. [ ] **Enforce Professional B2B Copywriting Standards:**
   - Apply the recommended headlines, value propositions, and CTA labels documented in Section 3 across all feature modules.
   - Fix all documented grammatical errors and typos from the legacy site.
5. [ ] **Leverage Regional Advantage in Copy & Layout:**
   - Explicitly highlight the **Kendari Branch Office** alongside Jakarta on the homepage, about page, and contact page as a dedicated support corridor for Sulawesi's mining and smelting sector.
