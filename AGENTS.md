# Ascentia Frontend (`ascentia-fe`)

## Toolchain & Commands

- Package manager: `pnpm` (Node 20+).
- Dev server: `pnpm dev` (Vite on port 3000).
- Build: `pnpm build`.
- Production server: `node .output/server/index.mjs`.
- Typecheck: `pnpm exec tsc --noEmit -p tsconfig.json`.
- Lint & format: `pnpm lint`, `pnpm check`, `pnpm format`.
- Route tree generation: `pnpm generate-routes`.

## Routing & Generated Files

- File-based routes live in `src/routes/`.
- Never manually edit `src/routeTree.gen.ts`. Run `pnpm generate-routes` after adding or changing route files.

## Components & Styling

- Path alias: `#/` maps to `src/` (e.g. `#/components/...`, `#/lib/utils`).
- Component library: shadcn wrappers over `@base-ui/react` located in `src/components/ui/`.
- Icons: use `lucide-react`.
- Design tokens live in `src/styles.css`.
  - `--primary`: blue (`#288AC6`)
  - `--accent`: orange CTA (`#F28B3B`) — do not use `bg-accent` for neutral list item hover/selection states. Use `hover:bg-muted` / `bg-muted`.
  - Interactive elements and menu triggers must include `cursor-pointer`.
- Sticky header behavior lives in `#/hooks/use-sticky-header` (absolute over hero, fixed white on scroll-up, hidden on scroll-down past `hideOffset`).
  - Tailwind v4 `translate-*` uses the CSS `translate` property — header transitions must list `translate`, not `transform`, in `transition-[...]` or the slide won't animate.

## Architecture & Ownership

- Read `docs/architecture/folder-conventions.md` before adding or moving source files.
- `src/routes/` owns URL identity, route params/search, and loaders. It selects feature page modules; do not put page markup there.
- `src/features/` is feature-first: use `pages/` for page composition, `components/` for feature UI, `constants/` for local static content, and `types/` for feature models. Add `api/`, `hooks/`, or `forms/` only when implemented. The homepage belongs in `src/features/home/`.
- `src/components/layout/` owns persistent site shell; `src/components/ui/` owns context-free primitives only.
- Dependency direction: `routes → features → components / hooks / lib`. Shared modules must not import from routes or features; routes select feature pages.
- Use lowercase kebab-case names. Prefer direct imports; do not add a barrel solely to shorten imports.

## Headless WordPress & WooCommerce

- Read `docs/architecture/wordpress-content-model.md` before WordPress, WooCommerce, product, article, news, blog, or ACF work.
- WordPress/WooCommerce is the content source of truth; this frontend owns public UI and presentation. Do not parse legacy Divi page-builder output as the new content contract.
- Product Brand, Type, and Application are taxonomies. Applications are multi-select: one product can appear in several application listings.
- Product detail extensions use REST-visible ACF fields: summary, WYSIWYG description, WYSIWYG benefits, WYSIWYG specifications, optional video URL, optional brochure file, and optional hero image.
- ACF Free supports the initial model. Do not assume repeater, flexible content, or gallery ACF fields; use WooCommerce product gallery and controlled WYSIWYG for specs until ACF Pro is approved.
- REST rich text is HTML. Sanitize it with the installed `sanitize-html` package and an explicit allowlist before rendering. Never let CMS HTML control layout or execute scripts.
- Public product reads use WooCommerce Store API. Never place consumer keys, WordPress passwords, or privileged tokens in `VITE_*` values. Confirm CORS on the actual deployed frontend origin; use a server-side fetch path if needed.
- Treat News and Blogs as views of shared editorial content until the WordPress publishing model proves separate post types are required.
- Visitor counting/analytics is deferred. It must be server-side and define bot filtering, repeat-visit policy, consent, and storage before implementation.

## Assets & Public Directory

- Static assets live in `public/` (e.g. `public/icons/flags/`, `public/brand/`).
- If running `.output/server/index.mjs`, rebuild (`pnpm build`) after adding new files to `public/` so Nitro copies them into `.output/public/`.

## Verification

- Header smoke test: `python scripts/verify-site-header.py` (requires server on `http://localhost:3000`).
