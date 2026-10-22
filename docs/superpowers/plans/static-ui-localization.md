# Static UI Localization Plan

**Approved scope:** Translate frontend-owned static UI on every public page when Indonesian is selected; keep English available. Preserve CMS product/brand names, article content and existing localized CMS fields. No automatic third-party translation or CMS writes.

## Work

- [ ] Complete the language navigation regression and reuse `RouteLoading` for switching. Preserve page/query, remove hash, reset top and retain Back/Forward behavior.
- [ ] Extend existing EN/ID dictionaries with matching static keys. Correct the malformed blog-subtitle key; use normal Indonesian copy, not literal translations of incorrect English.
- [ ] Wire dictionaries into catalog/search/filter/pagination, desktop/mobile product menus, News/Blogs and detail pages, shared loading/error/gallery controls and remaining shell copy. Keep dynamic CMS content untouched.
- [ ] Add a browser check for ID catalog, menus, search, news/blogs and detail controls; verify English round trip and no write requests. Add dictionary parity checks.
- [ ] Run locale navigation and UI regressions, scoped lint/format, typecheck, production build and production browser verification. Preserve unrelated dirty worktree changes; no commits.
