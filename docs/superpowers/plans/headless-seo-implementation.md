# Headless SEO Implementation Plan

**Goal:** Implement the approved frontend SEO baseline without changing WordPress, DNS, hosting, or unrelated user work.
**Architecture:** Yoast JSON supplies editorial metadata. Routes own public URL identity; shared SEO helpers render metadata/schema. Feature-owned server reads feed a bounded cached sitemap. Existing server entry preserves compression and handles legacy redirects/media continuity.
**Stack:** Existing TanStack Start/Router/Query, native fetch, sanitize-html, Node assert; no new packages.

## Constraints

- Preserve dirty work; no commits, resets, or database changes.
- Keep `/products/:slug` URLs; permanent redirects from legacy product URLs.
- Brand/category query landing pages get their own canonical/title; pagination preserves category/page; arbitrary search results noindex.
- No fabricated prices, reviews, or CMS-host canonical/schema.
- CMS noindex is host-only configuration; do not enable global WordPress search discouragement when consuming Yoast robots.

## Steps

1. Extend existing SEO helper/tests: optional editorial metadata, accurate image metadata, robots, safe JSON-LD serialization; map untrusted Yoast JSON server-side. Node assert verifies fallbacks and injection boundaries.
2. Wire product/article detail models and loaders to Yoast. Emit breadcrumb/product/article schema with actual data only, homepage Organization/WebSite schema.
3. Make listing metadata search-aware; preserve error/retry behavior. Add crawlable pagination URLs through existing generic pagination without feature imports in shared UI.
4. Add feature-owned paginated sitemap reads, cached XML endpoint, legacy sitemap redirect and robots reference. Exclude unpublished/noindex/duplicate editorial URLs; error on upstream failure rather than serve incomplete success.
5. Add safe legacy product/brand/articles redirects and configured CMS media redirects at the existing server entry. Preserve compression; no arbitrary redirect origin.
6. Verify Node assert tests, TypeScript, targeted lint, production build, isolated production HTTP smoke checks. Record preexisting failures and external release gates separately.

## Verification results

- Node SEO helper/content/redirect/XML tests pass.
- Production build and TypeScript check pass.
- Isolated production HTTP smoke test passes with local CMS fixture.
- Isolated production server against read-only live WordPress: product Yoast SSR and all nine product sitemap URLs pass; staging noindex header verified.
- Browser pagination/category navigation and canonical/title updates pass.
- Full existing Node test sweep: 8/9 pass. Existing taxonomy-cache test expects upstream rejection, but dirty user code now serves stale data. That unrelated behavior/test was preserved.
- Build emits dependency module-directive warnings; no build failure.

## Deferred external release gates

WordPress final taxonomy/ACF migration, production content approval, CMS domain/SSL/noindex configuration, Search Console access, hosting cutover, monitoring and rollback. Do not silently infer missing category equivalences or alter live database content.
