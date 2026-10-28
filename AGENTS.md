# Ascentia Frontend (`ascentia-fe`)

## Toolchain & Commands

- pnpm 10 (CI pins 10.32.1); Node >=22.12.0 — `@tanstack/react-start` requires it, so Node 20 is too old. CI uses Node 22.
- `pnpm dev` runs Vite on port 3000.
- `pnpm build` creates the Nitro `.output` bundle; `pnpm start` runs it and loads `.env`. cPanel/Passenger uses the `app.js` bridge.
- Typecheck: `pnpm exec tsc --noEmit -p tsconfig.json`. Production CI runs typecheck + build only; lint/format are not CI gates.
- `pnpm lint` = ESLint; `pnpm format` = repo-wide Prettier + ESLint fix; `pnpm check` = Prettier only and can flag untouched files. Do not reformat unrelated files.
- `pnpm generate-routes` regenerates `src/routeTree.gen.ts`; never edit that file by hand.

## Tests & Verification

- No Vitest/Jest and no `test` script. Tests are plain Node scripts using `node:assert`: `node --test <file>` (e.g. `node --test src/features/search/search.test.ts`).
- Some suites are not directly runnable: app code uses extensionless `#/` imports, which Node ESM cannot resolve (SEO and visitor-policy tests currently fail).
- Fast boundary gate: `node scripts/verify/verify-audit-boundaries.mjs`.
- Browser checks are Python Playwright scripts in `scripts/verify/`, run against a live server via `SITE_URL` or `--url`; Python/Playwright are installed separately, not by pnpm. Example: `python scripts/verify/verify-site-header.py`.
- Full release gates: `docs/deployment/production-release-runbook.md`.

## Routing, i18n & SEO

- File-based routes live in `src/routes/`; files prefixed `-` are ignored by the router (`products/-listing.ts` holds shared listing config). `$.tsx` is the catch-all 404.
- `/products` 301s to `/products/brands`; product listing tabs are `/products/{brands,types,applications}`.
- Indonesian is the unprefixed default; English lives under `/en` via the router `rewrite` in `src/router.tsx` (internal `__locale` param). Add UI keys to both `src/locales/id/translation.json` and `src/locales/en/translation.json`; read via `useLanguage().t()`.
- Add `head` metadata with `createSeoMeta` from `#/lib/seo`; canonical production origin is `https://ascentia.co.id`. Legacy redirects and media rewrites live in `features/seo/api/legacy-redirects.ts` (applied by `src/server.ts`).

## Architecture & Data Flow

- Read `docs/architecture/folder-conventions.md` before adding or moving source files.
- Direction: `routes -> features -> components / hooks / lib`. Routes own URL/search/loaders and select feature pages; no page markup in routes.
- Keep feature UI in `features/`; `components/ui/` is context-free primitives and `components/layout/` is the persistent shell. Use lowercase kebab-case filenames and no barrels just to shorten imports.
- Feature data pattern: `api/*-api.ts` exports `createServerFn` wrappers that lazy-import `api/*-source.server.ts`; `api/*-queries.ts` holds React Query options; routes call `ensureQueryData`. `.server.ts` files are server-only; never import them from client components.
- All WordPress/WooCommerce reads happen server-side. The CSP in `vite.config.ts` allows browser connections only to self and CARTO tiles; update it if adding a browser-side API/script. Never put credentials in `VITE_*`.
- Server env (read via `process.env`): `WORDPRESS_URL`, `SITE_INDEXABLE`, `ASCENTIA_ANALYTICS_KEY`, `CONTACT_TIMEOUT_MS`. Dev falls back to `http://ascentia-local.local` when `WORDPRESS_URL` is unset.
- `features/articles/` is shared by news and blogs; select categories by slug constants, not IDs.

## WordPress & WooCommerce

- Read `docs/architecture/wordpress-content-model.md` before WordPress, product, article, news, blog, or ACF work.
- WordPress/WooCommerce is the content source of truth; never parse legacy Divi page-builder output.
- Brand, Type, and Application are taxonomies; Application is multi-select. Gallery images come from WooCommerce, not ACF.
- Product detail merges Store API data with `wp/v2/product` ACF; English fields prefer `ascentia_i18n`, then `*_en` ACF. Sanitize CMS HTML with the installed `sanitize-html` allowlist before rendering.
- ACF Free is the contract: do not assume repeater, flexible-content, or gallery fields.
- `ascentia-inquiries/` is the WordPress plugin behind contact/RFQ and the page-view counter. It is PHP with no build step, deployed by zip; frontend endpoint changes usually require matching plugin changes. The counter is implemented server-side and counts every page view (bots, cross-site, and rate-limited requests are filtered).
- Contact/RFQ retries reuse a `submission_id`; the plugin deduplicates. Preserve that behavior.

## Components & Styling

- Import alias `#/*` -> `src/*` (tsconfig also maps `@/*` for the shadcn CLI; source uses `#/`).
- shadcn wrappers over `@base-ui/react` live in `src/components/ui/`; use them instead of raw Base UI. Icons: `lucide-react`.
- Tokens live in `src/styles.css`: primary blue `#288AC6`, accent orange CTA `#F28B3B`. Do not use `bg-accent` for neutral hover/selection; use `hover:bg-muted` / `bg-muted`. Interactive elements and menu triggers need `cursor-pointer`.
- Tailwind v4 is CSS-first (`tailwind.config.js` is absent). `translate-*` uses the CSS `translate` property, so header transitions must list `translate` in `transition-[...]`.
- Sticky header state is `#/hooks/use-sticky-header` (transparent over hero, solid on scroll-up, hidden on scroll-down; supports pause/disable-hide).

## Deploy

- Pushing `master`, `main`, or `feat/products` auto-deploys production over FTP; pushing `staging` deploys to `/staging/`. Do not push unless a deploy is intended.
- `.output/` is gitignored build output. Production must set `WORDPRESS_URL`; `SITE_INDEXABLE=false` adds `X-Robots-Tag: noindex` (use on staging, true on production).
- Static assets live in `public/`; rebuild after adding files so Nitro copies them into `.output/public/`.

## Comments

- `//` one line only, max 60 chars. No JSDoc or `/* */`.
- Why-only when code cannot show it; never restate obvious animation/layout. One note per spot, no duplicates.
- Delete commented-out code, TODOs, and dead aliases.
