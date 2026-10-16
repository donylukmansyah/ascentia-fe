# Global Search Implementation Plan

> **For agentic workers:** Execute tasks in order; verify each deliverable before completion.

**Goal:** Header search with OS-aware shortcuts, accessible Ascentia dialog, grouped live product/news/blog results and thumbnails.

**Architecture:** Root composes the search feature and header trigger. Base UI Dialog/Autocomplete handles focus and keyboard behavior. Existing server product reads and a scoped WordPress post search supply public results; independent query keys isolate group failures and stale requests.

**Tech Stack:** React, TanStack Start/Query/Router, installed Base UI, Tailwind tokens, Lucide. No new package.

## Global Constraints

- Desktop Search + Ctrl K or ⌘ K; mobile icon with accessible label.
- Search independent from catalog filters; no fake trending or local partial-catalog index.
- Layout cannot import feature modules; root wires header and feature together.
- Validate query/group at the server boundary; public CMS reads only.
- No unrelated changes, dependency installs, automatic commits, generated route edits.

## Task 1 — Public search data

- [ ] Create `src/features/search/api/search-input.ts`, `search-api.ts`, `search-source.server.ts` and `src/features/search/types/search.ts`.
- [ ] Add `readSearchArticles(query, category, signal)` to article source. Use existing request/mapper; return at most four public posts per scoped category, relevance order, cached by query/category.
- [ ] Product search reuses `readProducts({search: query, perPage: 4, page: 1})`; map only title/slug/image/meta into results. Existing product order stays truthful; no unified relevance claim.
- [ ] Validate query string length 2–200 and group products/news/blogs. Map frontend routes explicitly; do not follow CMS permalinks.
- [ ] Leave runnable Node assert checks for input validation/mapping.

## Task 2 — Header and accessible dialog

- [ ] Add shared `src/components/ui/dialog.tsx` wrapper over installed Base UI.
- [ ] Create `src/features/search/components/global-search.tsx`; pass header through render callback so layout has no feature import.
- [ ] Modify `SiteHeader` props for open callback/platform shortcut; root composes provider/feature. Search closes other header menus.
- [ ] Shortcut Ctrl K on Windows/Linux, Meta K on Mac. Ignore editable targets, composition/repeats/extra modifiers. Restore focus after close; retain visible icon access.
- [ ] Render controlled inline Autocomplete inside Dialog, grouped results, OS shortcut hint, keyboard footer, safe thumbnails. Server results must not be filtered twice.
- [ ] Query each group independently after 300 ms debounce and two characters; enabled only while open. Skeleton for missing results, same-query refresh indicator, empty/error/retry per group, stale different-query rows removed.
- [ ] Use white surface, primary focus, muted selection, no orange selection. Fixed thumbnail dimensions; contain product, cover editorial. Reduced-motion alternatives.

## Task 3 — Verification

- [ ] Run Node assert checks, TypeScript, scoped lint/format, production build.
- [ ] Add `scripts/verify/verify-global-search.py` using existing Playwright setup. Verify desktop click/Ctrl K, Mac badge/Meta K, input guard, Escape/focus, keyboard navigation, mobile icon/layout, thumbnails, loading/error/empty and stale-query isolation using deterministic server-function response interception.
- [ ] Run live WordPress search smoke where available; report unavailable API/runtime evidence honestly.
- [ ] Inspect desktop/mobile screenshots, correct overflow/contrast/focus issues, rerun affected checks.
