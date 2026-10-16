# Product detail sticky navigation implementation plan

**Goal:** Keep Product / Description attached to the visible site header edge during scroll in both directions; preserve header hide-on-down/show-on-up behavior.

**Architecture:** The site header remains the owner of visibility. Expose its rendered state as a data attribute. CSS sibling selectors make the detail navigation use that state rather than a second scroll listener. Match existing 500ms ease-out reveal, 250ms ease-in hide, immediate first hide; include the header's 3px border. No new dependency or changes to section-click behavior.

## Task: Synchronize sticky navigation

Files:

- Modify `src/components/layout/site-header/index.tsx`: expose `data-header-state`, including visible mobile menu.
- Modify `src/features/products/components/product-detail-nav.tsx`: remove independent header hook; use `product-detail-nav` CSS class.
- Modify `src/styles.css`: desktop/mobile sticky offsets and transitions driven by header state; disable transitions for reduced motion.
- Create `scripts/verify/verify-product-sticky-nav.py`: browser geometry regression.

Steps:

- [ ] Write a Playwright check measuring `nav.top - max(0, header.bottom)` on each animation frame after scroll direction changes. Assert absolute difference <= 2px while sticky.
- [ ] Run against current code; confirm failure (observed overlap ~34px, settled overlap 3px).
- [ ] Implement CSS synchronization using `header[data-header-state] ~ main .product-detail-nav`. Default offset 0 for transparent/hidden header; visible offset `calc(5rem + 3px)`, desktop `calc(6rem + 3px)`.
- [ ] Test desktop/mobile, initial hash, scroll down/up, rapid reversals, reduced motion, section button navigation, pinned desktop dropdown.
- [ ] Run `python scripts/verify/verify-product-sticky-nav.py`, `python scripts/verify/verify-site-header.py`, TypeScript, targeted ESLint, production build.

Constraints: preserve unrelated work; no new scroll observers, runtime DOM measurements, libraries, or changes to article sharing. No commit requested.
