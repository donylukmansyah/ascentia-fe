# Production audit fixes

Scope approved: compression, deferred maps, cache/contact correctness, deterministic product links, search readiness, accessible colors; test production locally. No hosting changes, database migration, new dependencies, or unrelated refactor.

1. Enable native Nitro asset compression; verify gzip/Brotli negotiation and decoded content. Keep short cache policy for unversioned public images.
2. Keep `map.tsx` compound API. Import MapLibre/CSS/worker only near viewport; retain stable map container, address/directions, cleanup, retry/fallback, named popups.
3. Isolate shared cache load from caller cancellation. Validate contact success response before clearing input. Existing boundary script must become green; correct stale-cache test contract.
4. Derive WhatsApp URL from canonical origin and product slug. Disable search until hydrated; show loading feedback for lazy dialog. Test first usable click under throttling.
5. Fix actual text contrast without redesigning brand colors: dark foreground on orange; darker semantic link text and muted metadata. Match desktop accessible labels. Update obsolete quality selectors/contrast threshold.
6. Build, typecheck, lint, formatting, boundary/unit/fault/browser tests; compare three mobile Lighthouse runs and desktop, contact/product/news. Save measured outcomes in follow-up audit documentation. Public HTTPS results remain unverified without deployment URL.

Checks: `node scripts/verify/verify-audit-boundaries.mjs`; `python scripts/verify/verify-production-audit.py`; `python scripts/verify/verify-product-upstream-errors.py`; `pnpm build`; `pnpm exec tsc --noEmit -p tsconfig.json`; `pnpm lint`; `pnpm check`.
