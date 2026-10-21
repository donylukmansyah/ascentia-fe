# Header Logo Transitions Implementation Plan

**Approved behavior:** Hero pages use a white logo over a transparent header at the top. Editorial detail and not-found pages use the colored logo on white. Preserve the 3px primary top line, hide-on-down, reveal-on-up, mobile menu, dropdown pinning and Router history restoration.

**Scope:** Existing sticky-header hook and site-header component only, plus one browser regression script. No dependencies, CMS writes, route generation, unrelated edits or commits.

## Steps

- [x] Add `scripts/verify/verify-header-logo-transitions.py` sampling actual rendered header/logo/background at animation frames. Assert hero top return has no stale colored frame; retain screenshots/JSON outside repo. Include route transitions, restored scroll, desktop/mobile/reduced motion and top-border color.
- [x] Run against current app and capture failing output.
- [x] Synchronize top-boundary scroll state before paint in `src/hooks/use-sticky-header.ts`; initialize restored scroll positions without breaking pause/resume.
- [x] In `src/components/layout/site-header/index.tsx`, derive route tone from rendered matches, coordinate instant transparent appearance with logo switching, and apply primary color specifically to the top border.
- [x] Run new regression, existing header and product sticky-nav checks, typecheck, targeted ESLint/Prettier and production build. Report any unrelated baseline failure without changing its contract.
