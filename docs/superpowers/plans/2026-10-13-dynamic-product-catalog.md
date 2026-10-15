# Dynamic Product Catalog Implementation Plan

**Goal:** Connect existing Home and product UI to public WordPress/WooCommerce data without changing unrelated pages.

**Architecture:** Native fetch runs in Start server functions; feature mappers validate CMS responses and sanitize rich text. Shared Query options own resource keys and freshness; routes own URL/search/loaders and SSR hydration. Preserve existing presentation.

**Tech Stack:** TanStack Start/Router, Query 5.104.1, React 19, sanitize-html, native details, Python Playwright.

## Constraints

- Public Store API reads only; no privileged browser credentials.
- Server-only WORDPRESS_URL; local development origin http://ascentia-local.local.
- Categories grouped by parent slugs brands/types/applications, never deployment-specific IDs.
- Multiple type/application memberships; retain all selected terms.
- Listing 8 items/page, pagination/filter/search on server, no client slicing.
- Home/recommendations use up to 8 Featured newest products; shared query.
- Home logos follow CMS brand thumbnails; absent logo stays name-only in filters.
- Description uses Woo content; Specifications uses ACF specifications; no invented benefits.
- Short description enables native disclosure; absent summary shows full description.
- No new CMS fields, backend plugin, analytics, Redis, Axios or generic repository layer.
- Existing working-tree changes must remain intact.

## Files and ownership

- src/router.tsx, routes/__root.tsx: one request-isolated QueryClient and official SSR integration.
- features/products/types/product.ts: UI models and query input/results.
- features/products/api/product-mapper.ts: boundary validation, taxonomy mapping and HTML sanitization.
- features/products/api/product-source.server.ts: bounded public requests, taxonomy pagination, slug lookup and Store ID detail.
- features/products/api/product-api.ts: validated GET server-function wrappers.
- features/products/api/product-queries.ts: stable queryOptions reused by loaders and pages.
- Product routes: validateSearch, loaderDeps, pagination URLs, redirect /products to Brands.
- Home/products pages and components: replace fixtures; preserve UI, add scoped loading/error/disclosure states.
- One assert-based mapper/input test and one Python browser smoke script.

## Execution

- [ ] Add compatible official @tanstack/react-router-ssr-query adapter and sanitizer type definitions; configure SSR Query context.
- [ ] Write assert checks for malformed payloads, multi-membership, empty categories, pagination metadata, unsafe HTML and known internal links.
- [ ] Implement bounded HTTP reads with timeout, explicit _fields and status checks. Fetch independent taxonomy/Featured/list reads concurrently; slug lookup must precede ID detail.
- [ ] Build public UI models. Category pagination must not silently truncate at 100; missing count headers are not zero. Server input validation rejects invalid pages/operators/keywords and arbitrary upstream URLs.
- [ ] Wire URL category slugs/search/page to loaders and shared query definitions. Fetch category-filtered pages, eight items, date-desc order. Unknown filter is a distinct invalid-filter state, not an accidental all-products query.
- [ ] Connect Home brand logos and Featured carousel; empty optional sections hide; failures remain recoverable, never fallback to dummy.
- [ ] Connect product detail and same-brand related cards (up to four, excluding current). Render sanitized HTML in existing tabs; Specifications missing removes its tab and sticky navigation link.
- [ ] Keep complete product title visible in detail. Implement summary/full-description native details when a short description exists; no HTML height clipping. Scope rich text styles; keyboard tabs, long links/tables, responsive image sizes and reduced-motion behavior remain accessible.
- [ ] Remove unreferenced dummy catalog and local filter code only after all public consumers use CMS queries.
- [ ] Run mapper assertions, tsc, targeted lint/format, production build and route generation. Browser smoke: SSR content, hydration, Home Featured/logos, page two, XRF/Mining/empty-brand filters, search/back navigation, actual detail/specs, unknown product, mobile overflow, API failure recovery. Run existing header smoke when available.

## Freshness and deployment

Products fresh for 60 seconds; taxonomy/logo for 5 minutes. Freshness expiry alone is not a polling timer. Shared server/CDN caching is deferred until measured; per-request SSR Query cache is not a shared cache. No promise of instant update on publish. Production must configure a reachable HTTPS WordPress origin; local .local URLs cannot serve remote visitors.

## Verification evidence

Record executed checks and any remaining limitations after implementation; do not claim measured speed improvements without a baseline.
