# Blogs Hero Implementation Plan

> **For agentic workers:** Execute this single scoped task inline; approval is recorded in the conversation. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the `/blogs` placeholder with the approved Our Blogs hero only.

**Architecture:** Follow the existing News hero and feature-page pattern without refactoring other pages. Reuse existing breadcrumb, overlay, motion, header, and footer styles.

**Tech Stack:** React 19, TanStack Router/Start, Tailwind v4, motion/react, Python Playwright.

## Approved Design and Global Constraints

- Heading: `Our Blogs`; breadcrumb: `Home / Blogs`.
- Image: `/images/blogs/assets-our-blogs.webp`.
- Description from reference: `Analytical instruments, trusted materials, and technical support for the work behind reliable results.`
- Keep News hero height, typography, spacing, dark overlay, parallax, orange arrow CTA, and responsive behavior unchanged.
- CTA links to the focusable `#blogs-content` anchor immediately below the hero, matching News.
- No article listing, dummy article data, detail page, WordPress API, new dependency, or shared-hero refactor.
- Keep page composition in `src/features/articles/pages/`; routes select pages only.
- Preserve existing uncommitted work. Do not manually edit `src/routeTree.gen.ts`.

## Task 1: Blogs hero and route

**Files:**

- Create: `src/features/articles/components/blogs-hero-section.tsx`
- Create: `src/features/articles/pages/blogs-page.tsx`
- Modify: `src/routes/blogs.tsx`
- Test: `scripts/verify/verify-blogs-hero.py`

**Interfaces:**

- `BlogsHeroSection()` follows `NewsHeroSection()` with optional `imagePosition` and `parallaxRange` props.
- `BlogsPage()` renders the hero and focusable content anchor.
- `/blogs` selects `BlogsPage` using `createFileRoute`.

- [x] Add an assert-based Playwright check for the approved copy, breadcrumb, loaded image, CTA target, News-matched dimensions, mobile overflow, and reduced motion.
- [x] Run `python scripts/verify/verify-blogs-hero.py`; confirm the current placeholder fails.
- [x] Copy the existing News hero into `blogs-hero-section.tsx`; replace News-specific component names, IDs, group names, labels, image, heading, and description only.
- [x] Create `BlogsPage` using the existing `NewsPage` composition pattern; select it from `/blogs`.
- [x] Run `pnpm generate-routes`.
- [x] Run the browser check, `pnpm exec tsc --noEmit -p tsconfig.json`, targeted ESLint and Prettier checks, and `pnpm build`.
- [x] Inspect desktop/mobile screenshots against the supplied reference. Review the scoped diff for unrelated changes.
