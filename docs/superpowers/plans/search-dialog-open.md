# Immediate Search Dialog Opening

**Approved scope:** Open the existing search dialog immediately when clicked or opened with Ctrl/Cmd+K. Keep its design, translations, focus behavior and 200ms/reduced-motion transitions. Loading results after typing remains separate. No search index, results route, dependency install, CMS write or commit.

## Steps

- [x] Add `scripts/verify/verify-search-opening.py`: after hydration block any new JavaScript requests, then open Search by click/shortcut. Verify no loading-search banner, no network dependency on opening, input focus, Escape/focus restoration, desktop/mobile, EN/ID and reduced motion.
- [x] Run the check before the fix; the lazily downloaded dialog must fail while JavaScript is blocked.
- [x] Replace the click-time lazy import/Suspense fallback in `src/features/search/components/global-search.tsx` with a direct import of the existing dialog. Keep first-use mounting to avoid initializing result queries for visitors who never open Search. Static assets load with the app instead of on first click; no speculative CMS prefetch.
- [x] Run the regression on development and a fresh production build. Run scoped lint/format, typecheck and build; leave unrelated worktree changes intact.

## Verification

The regression failed before the fix when the first click attempted to fetch `search-dialog.tsx`. After the fix, all five desktop/mobile, EN/ID, click/Control+K/Meta+K and reduced-motion cases passed with new JavaScript requests blocked. Production dialog insertion measured 20–31ms, focus 29–39ms. No result requests occurred before typing. Simulated search-server failures remained inside the open dialog; Escape and focus restoration passed. Typecheck, scoped ESLint/Prettier and production build passed. Evidence: `C:/Users/Minguri/AppData/Local/Temp/ascentia-search-opening/`.
