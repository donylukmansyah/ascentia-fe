# Contact Map Fixes Implementation Plan

**Goal:** Resolve clipped office popups, inconsistent CTAs and dark scroll overlays; match the approved Jakarta map reference.

**Approved design:** Keep MapLibre, map clipping and cooperative gestures. Fit open popups by moving the map through public `panBy`, not by raising z-index. Reuse the existing CTA with white, 500-weight text and the existing `--accent` background, as explicitly requested by the user. White small text on this orange does not meet WCAG AA contrast; do not silently change the brand color. Float the Jakarta address card on desktop; stack it above the map on small screens. Use a blue marker and a compact business popup.

**Architecture:** Shared map behavior stays in `src/components/ui/map.tsx`; shared appearance stays in `src/styles.css` and `src/components/ui/cta-link.tsx`. Contact composition stays in its feature page. No new dependency, route changes, privileged credentials or unrelated edits.

**Tech Stack:** React 19, TypeScript, MapLibre GL 6, Tailwind 4, Python Playwright.

## Steps

- [ ] Extend `scripts/verify/verify-contact-us.py`: assert both office cards fit inside their maps at 1440, 768, 390 and 320px; verify white CTA text, homepage typography parity, `--accent` background parity, lightweight gesture hints, keyboard close and the floating/stacked address layout. Run `BASE_URL=http://localhost:3001 python scripts/verify/verify-contact-us.py` before implementation; expect a clipped-popup failure.
- [ ] In `src/components/ui/map.tsx`, use a stable bottom popup anchor. Constrain popup height to the map, measure overflow and call `map.panBy([x, y], { duration: 0 })` only when necessary. Recheck after content resize and map resize, disconnect observers on unmount, preserve click/Escape closing. Support the compact popup's native close button and the blue marker's bottom anchor.
- [ ] Scope the existing transparent gesture hint CSS to every shared map instead of the About section; respect reduced motion. Leave cooperative gestures enabled and preserve map attribution.
- [ ] Make `CtaLink` white by default, remove redundant tone arguments, keep `bg-accent` for the contact form and popup; do not add another CTA color token. Replace the popup's duplicated link animation with `CtaLink`.
- [ ] In `src/features/contact/pages/contact-page.tsx`, reuse the address and directions link in a desktop floating card/mobile stacked block. Replace the detailed map's large office card with a small closeable business popup and an accessible blue pin.
- [ ] Run the updated smoke check, targeted formatting/lint, TypeScript and production build. Inspect desktop/mobile screenshots and About/Home regressions. Report unrelated pre-existing failures without modifying them.

## Limits

Popup height scrolling is reserved for content taller than its map; no document-level portal, fixed anchor override in feature code, new generic component or basemap-provider change. Existing user edits remain untouched. Production CARTO usage approval remains outside this UI fix.
