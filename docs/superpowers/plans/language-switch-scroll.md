# Language Switch Scroll Implementation Plan

**Approved contract:** Follow `docs/research/language-switch-scroll.md`: switching language keeps the page and filters, clears the old fragment and starts at Y=0. Normal Back/Forward restoration remains enabled. Overlay follows navigation completion; repeated selections cannot race. Preserve existing visual design.

**Scope:** `src/lib/i18n/language-context.tsx`, locale output rewriting in `src/router.tsx`, and `src/components/layout/language-transition-overlay.tsx` only as needed. Add one Python Playwright regression. No new dependencies, CMS writes, emails, commits or manual generated-route changes.

## Steps

- [ ] Add `scripts/verify/verify-language-switch.py` driving the actual language menu. Reproduce ID/EN/ID/EN at different scroll positions and record URL, locale, history keys and scroll outside the repo.
- [ ] Run it against the existing implementation; require failure on restored old scroll.
- [ ] Replace native `history.replaceState({})` with awaited Router navigation using same page/search, explicit locale, empty hash and `resetScroll: true`. Derive language from the URL for reload and history navigation. Ignore concurrent/same-language requests; surface navigation errors.
- [ ] Let explicit English override current Indonesian URL during output rewrite. Ordinary links still inherit the active locale.
- [ ] Preserve the existing overlay appearance with cleaned-up fade lifecycle, reduced-motion handling and completion driven by actual navigation rather than fixed language-switch delays.
- [ ] Verify round trips at top/bottom, nested product/editorial pages, query/hash, reload, Back/Forward, duplicate actions, keyboard/focus, reduced motion, desktop and mobile where controls exist. Block all writable backend requests.
- [ ] Run regression on development and fresh production build; typecheck, scoped lint/format and existing header regression. Report unrelated failures without changing their assertions.
