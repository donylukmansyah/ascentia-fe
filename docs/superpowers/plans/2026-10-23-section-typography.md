# Section Typography Implementation Plan

> **For agentic workers:** Execute the checks and minimal styling changes inline; preserve unrelated working-tree changes.

**Goal:** Match light-surface section labels, headings, and descriptions to Featured products across the site.

**Architecture:** Reuse three Tailwind CSS utilities in `src/styles.css`, not a React wrapper. Preserve markup, content, widths, section spacing, hero typography, dark-surface text, and data behavior.

**Tech Stack:** React 19, Tailwind CSS v4, Python Playwright.

## Global Constraints

- Labels use `text-primary`, matching Brands we represent per the user's color correction; existing sizes and spacing remain. This brand blue measures 3.98:1 on white, below the 4.5:1 small-text threshold; the browser check reports the warning.
- Section headings use `clamp(1.75rem,2.9vw,2.5rem)`, line-height 1.04, weight 700, tracking -0.04em, `text-foreground`.
- Descriptions use 14px mobile / 16px from 640px, line-height 1.625, weight 400, `text-description-text`.
- Keep 8px label-to-title and 16px stacked title-to-description spacing. Preserve intentionally side-by-side descriptions and compact office-card heading size.
- No new dependencies, API changes, hero/dark-surface restyling, commit, push, or deployment.

## Task 1: Consistent section typography

**Files:** `src/styles.css`; light-surface section text in `src/features/products/components/{product-carousel-section,product-grid,product-detail-content,related-products-section}.tsx`, `src/features/contact/{components/contact-panel,pages/contact-page}.tsx`, `src/features/about/components/{company-section,customers-section,gallery/gallery-section,locations/locations-section,partners/partners-section}.tsx`, `src/features/articles/{components/blogs-content-section,components/news-content-section,pages/article-detail-page}.tsx`.

**Test:** `scripts/verify/verify-section-typography.py`.

- [x] Add a runnable browser check comparing computed label, heading, description styles across Home, About, Products Brands/Types/Applications, News, Blogs, Contact at 390px, 768px, 1440px; check label contrast and no horizontal overflow.
- [x] Run it before styling; confirm current Contact/title or label-color mismatch.
- [x] Add `section-kicker`, `section-title`, `section-description` utilities; replace duplicated section text classes only. Preserve card/body/hero styles.
- [x] Run browser check, changed-file Prettier/ESLint, TypeScript, production build. Record unrelated failures separately; inspect final diff for scope.

## Verification

- Before: browser check rejected Featured products label `oklch(0.59 0.14 238)` instead of accessible `#176a9b`.
- After: production build exit 0; TypeScript and changed-file ESLint/Prettier passed; `git diff --check` passed.
- Production browser: 33 passing page/viewport checks, including product/news/blog detail related sections, using local WordPress at `http://ascentia-local.local`.
- Initial production smoke used an unsuitable CMS configuration and lost News headings to the API error state. Repeated on a verified fresh port with the local CMS; all checks passed.
- No commit, push, deployment, CMS writes, or unrelated file edits.
