# Product Gallery and Applications Implementation Plan

> **For agentic workers:** Execute inline, verify each task before proceeding. Approved scope: existing photos and Applications only.

**Goal:** Display all WooCommerce product photos in a reusable manual gallery and existing ACF Applications as an optional detail tab.

**Architecture:** Keep WordPress reads and validation in product API modules. Add a feature-local gallery consuming normalized images. Derive information tabs once in the detail page; pass the same list to content and sticky navigation.

**Tech Stack:** Existing React 19, TypeScript, Tailwind v4, native scrolling, sanitize-html, Python Playwright.

## Global Constraints

- Follow `docs/architecture/folder-conventions.md` and `wordpress-content-model.md`.
- No video, autoplay, lightbox, new package, new WP field, route-tree edits, or commit.
- Preserve listing images, taxonomy filtering, SEO image, existing user changes.
- Official references: [ACF REST](https://www.advancedcustomfields.com/resources/wp-rest-api-integration/), [APG tabs](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/), [native scroll snap](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll_snap/Basic_concepts), [React state](https://react.dev/learn/choosing-the-state-structure).

## Tasks

- [x] **1. Data contract:** Extend `types/product.ts` with normalized `ProductImage`, detail `images`, `applicationsHtml`, and information-tab union. Add assertions to `api/product-mapper.test.ts` for ordered/deduplicated images, invalid URLs, blank HTML, unsafe HTML. Run `node --experimental-strip-types src/features/products/api/product-mapper.test.ts` before implementation and confirm failure. Implement `mapProductImages(value: unknown): ProductImage[]`, reuse first mapped image for cards, map the collection and sanitized Applications in `product-source.server.ts`. Strip empty editor-only HTML without removing legitimate image content. Repeat mapper test.
- [x] **2. Gallery:** Add only `components/product-image-gallery.tsx`. Interface: `images: ProductImage[]`, `productName: string`. One selected image ID, stable preview, native thumbnail buttons and single horizontal scroll-snap rail, visible overflow controls, small thumbnail sources, alt fallback, broken-image placeholder, zero/one-image handling. No CMS fetching, global state, or information-tab state. Replace the single preview in `product-detail-content.tsx`; preserve brand/tags.
- [x] **3. Applications:** Derive available Description/Specifications/Applications tabs in `pages/product-detail-page.tsx`; pass them to nav/content. Preserve roving tab focus, keyboard navigation, panel relationships, hash selection/fallback, reduced-motion scrolling. Render optional panels through the same existing rich-text styling. Mobile tab/nav overflow stays local, not page-wide.
- [x] **4. Regression checks:** Add `scripts/verify/verify-product-gallery.py`, using live product plus an isolated browser-rendered gallery fixture to check 0/1/5 photos, invalid/empty Applications, hash loads, gallery independence, keyboard selection, broken images, 360/390/768/1440 widths, no wrapped thumbnails/page overflow. Update stale Specifications link selector in existing detail smoke script. Reuse current tests, no new framework.
- [x] **5. Verify:** Run mapper assertions, gallery browser script, sticky-nav smoke script, changed-file lint/format, `pnpm exec tsc --noEmit -p tsconfig.json`, and `pnpm build`. Inspect actual screenshots. Report existing unrelated failures separately; never claim unexecuted tests passed.

## Verification results

- Mapper assertions: red before `mapProductImages` existed; green afterward.
- Gallery browser checks: PASS at 360/390/768/1440; 0/1/many, broken image, hash/keyboard/fallback cases PASS. Mobile emulation and horizontal wheel input checked; hardware touch not verified.
- Product detail and sticky-nav smoke checks: PASS. Production build browser smoke: PASS at 390/1440, including reduced-motion hydration and direct Applications hash.
- Changed-file ESLint/Prettier, project typecheck, production build: PASS. Build emits dependency `use client` bundler warnings.
- Fixed existing related-products streaming hydration mismatch in the touched page; matched server/first-client loading state using Router `useHydrated`. Hero reduced-motion first render now also matches SSR.
- No new dependencies, WordPress writes, video, autoplay, lightbox, or commit.

Research reference: `C:/Users/Minguri/AppData/Local/Temp/ascentia-product-gallery-applications-research.md`.
