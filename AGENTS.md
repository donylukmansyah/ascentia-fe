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

## Assets & Public Directory
- Static assets live in `public/` (e.g. `public/icons/flags/`, `public/brand/`).
- If running `.output/server/index.mjs`, rebuild (`pnpm build`) after adding new files to `public/` so Nitro copies them into `.output/public/`.

## Verification
- Header smoke test: `python scripts/verify-site-header.py` (requires server on `http://localhost:3000`).
