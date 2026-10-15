# Contact Us Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement `/contact-us` using the approved hero, contact panel, contained office overview and Google Maps embed.

**Architecture:** Extract About's existing hero into a context-free page hero with two concrete consumers. Reuse the contact and locations modules with narrow presentation props; the contact page owns composition and the detailed Google iframe.

**Tech Stack:** React 19, TanStack Router, Tailwind v4, existing Motion/MapLibre, native Google Maps iframe, Python Playwright.

## Global Constraints

- No new dependency, SDK, API key, invented map URL or privileged browser credentials.
- No generated route edits; `/contact-us` already exists.
- Existing Home/About appearance remains unchanged.
- Hero image: `/images/contact-us/contact-us.webp`.
- Preserve Google/CARTO attribution and controls; no whole-iframe grayscale.
- Forms must not claim delivery; no email backend in scope.
- Preserve native validation, accessible labels, entered form data and reduced motion.
- Respect feature-first ownership and existing dirty worktree.

### Task 1: Shared hero and contact composition

**Files:** Create `src/components/ui/page-hero.tsx`; modify `src/features/about/components/hero-section.tsx`, `src/features/contact/components/contact-panel.tsx`, `src/features/contact/components/contact-form.tsx`, `src/features/contact/pages/contact-page.tsx`; create `scripts/verify/verify-contact-us.py`.

**Interfaces:** `PageHero` accepts `headingId`, `title`, `description`, `image`, `contentHref`, optional `imagePosition` and `parallaxRange`. `ContactPanel` accepts optional `id`, `officeHref` and `showPageLink`, with existing Home defaults.

- [ ] Add a runnable Playwright check for one Contact Us h1, local image, matching About hero height, panel overlap, contact fields, native email validation, submission status and no horizontal overflow at 1440/768/390px.
- [ ] Run `python scripts/verify/verify-contact-us.py`; expect missing Contact hero failure.
- [ ] Extract existing hero rendering without changing About defaults. About becomes its content wrapper; Contact supplies the approved title/image/copy and `#contact-content` anchor.
- [ ] Reuse contact panel with `id="contact-content"`, `officeHref="#jakarta-map"`, `showPageLink={false}` and negative top margin. Retain homepage defaults. Submission uses `event.preventDefault()` plus an accessible visible status: message not sent, email contact; no reset.

### Task 2: Office overview and detailed Google map

**Files:** Modify `src/features/about/components/locations/locations-section.tsx`, `src/features/about/constants/locations.ts`, `src/features/contact/pages/contact-page.tsx`; extend `scripts/verify/verify-contact-us.py`.

**Interfaces:** `AboutLocationsSection` gains optional `className`, default unchanged, for the actual Contact container reuse. Existing map and popup APIs stay unchanged.

- [ ] Place the existing locations section inside the same `max-w-7xl px-5 sm:px-8 lg:px-12` geometry as the contact panel. Heading: `Closer to where the work happens.` Adjust its inner heading padding only for the contained presentation.
- [ ] Update Jakarta to longitude `106.7614046`, latitude `-6.1972135` from the company-linked listing; do not change Kendari or address No.88.
- [ ] Add `#jakarta-map`, focusable anchor target, accessible address/CTA outside the iframe. Directions URL uses `https://www.google.com/maps/dir/?api=1&destination=PT+Ascentia+Arsya+Analitika&destination_place_id=ChIJAfPlzjL3aS4RJgkrqoECgtU`.
- [ ] Embed the exact company URL from `docs/research/contact-us-map.md`; `title="Ascentia Jakarta head office on Google Maps"`, `loading="lazy"`, `referrerPolicy="strict-origin-when-cross-origin"`, `allowFullScreen`, `className="block h-[360px] w-full border-0 sm:h-[450px] lg:h-[520px]"`.
- [ ] Extend browser checks for contained overview width, both pins, full-width iframe, title/lazy/referrer attributes, exact business embed URL, non-overlaid readable address/directions, valid anchor targets, reduced-motion parallax and unchanged Home/About.

### Task 3: Verification

- [ ] Run `pnpm exec tsc --noEmit -p tsconfig.json`.
- [ ] Run `pnpm lint` and a targeted `pnpm exec prettier --check` on all edited TSX/TS files and these docs. Report unrelated baseline failures distinctly.
- [ ] Run `pnpm build`; use `python scripts/verify/verify-contact-us.py` against the rebuilt server if the current server is a production build.
- [ ] Inspect desktop/mobile screenshots with the image tool; fix overlaps, overflow, unreadable copy or blocked map controls.
- [ ] Review the scoped diff; mark only evidence-backed steps complete. No staging or committing unrelated changes.
