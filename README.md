# Ascentia Frontend

Headless WordPress frontend for the Ascentia product catalog.

## Stack

- React 19
- TanStack Start and TanStack Router
- Nitro Node server adapter
- Tailwind CSS v4
- shadcn/ui with Base UI
- TypeScript
- ESLint and Prettier

## Requirements

- Node.js 20+
- pnpm

## Development

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

## Environment

Create `.env` from `.env.example`:

```env
WORDPRESS_URL="http://ascentia-local.local"
SITE_INDEXABLE="false"
ASCENTIA_ANALYTICS_KEY=""
```

`WORDPRESS_URL` is the server-only WordPress origin. Set `SITE_INDEXABLE=false` on staging. `ASCENTIA_ANALYTICS_KEY` is optional and must match the Analytics Key in the WordPress plugin; leave it empty locally. These variables are read by the Node process, not by Vite.

The WordPress Store API is public. Never expose WooCommerce consumer secrets in `VITE_*` variables.

## Visitor counter

The footer counts every page view. Opening 10 pages produces 10 kunjungan, even for the same visitor. Client-side route changes count too. Bots, cross-site requests, and abusive bursts are ignored. The counter is stored atomically in WordPress and increments only through the server-side page-view endpoint.

## Contact submissions

Contact and quote requests are stored in WordPress first. The notification email is queued through WP-Cron, so the visitor does not wait for SMTP. The admin list shows the email status (`Terkirim`, `Menunggu`, or `Gagal`). Each form sends a submission id, so retrying after a slow response returns the saved inquiry instead of creating a duplicate.

Configure a real server cron every minute on the WordPress host:

```bash
* * * * * cd /path/to/wordpress && wp cron event run --due-now >/dev/null 2>&1
```

Without server cron, WordPress sends queued email on the next WordPress request, which may delay notifications on low-traffic sites. Keep the `ascentia-inquiries` plugin active; contact, RFQ, inbox, and the visitor counter depend on it.

## Commands

```bash
pnpm dev             # Start development server
pnpm build           # Build the Nitro production server
pnpm preview         # Preview the production build
pnpm lint            # Run ESLint
pnpm format          # Format files and apply ESLint fixes
pnpm check           # Check Prettier formatting
pnpm generate-routes # Regenerate TanStack Router route tree
```

## Production build

```bash
pnpm build
node .output/server/index.mjs
```

The build creates:

- `.output/server/` — Nitro Node server
- `.output/public/` — browser assets

Do not commit `.output/`; it is generated for each build.

Nitro generates precompressed Brotli/gzip assets. Upload the entire `.output/`, including `.br` and `.gz` files. Hashed assets keep immutable caching; unversioned brand/images/icons use a one-day cache. If cPanel/CDN serves files before Node, enable compression there too and verify `Content-Encoding` on the deployed CSS/JS. Configure `WORDPRESS_URL` on the Node process; legacy `VITE_WP_API_BASE_URL` / `VITE_WC_API_BASE_URL` are not production configuration. WordPress and media URLs must use the deployed HTTPS origin.

## cPanel deployment

This project uses Nitro's generic Node server adapter and can run on cPanel Node.js hosting.

1. Build locally with `pnpm build`.
2. Upload `.output/`, `package.json`, and the lockfile to the cPanel Node application root.
3. Configure Node.js 20 or newer in cPanel.
4. Set the startup file to `.output/server/index.mjs`.
5. Install production dependencies on the server.
6. Add the environment variables from `.env` in the cPanel application settings.
7. Restart the Node.js application.

Keep WordPress and its database in the existing cPanel installation. The frontend consumes WordPress through the REST and WooCommerce Store APIs.

## Project structure

```text
src/
  components/   Shared UI components
  routes/       File-based TanStack routes
  styles.css    Tailwind and design tokens
public/         Static assets
```

TanStack Router generates the route tree from files in `src/routes/`. Add a route by creating a file there, then run `pnpm generate-routes` if needed.

## Design system

Brand tokens live in `src/styles.css`:

- Primary: `#288AC6`
- Dark/navigation: `#255DA2`
- Secondary: `#533489`
- CTA: `#F28B3B`
- Highlight: `#FBBE1B`
- Background: `#FFFFFF`
- Alternate section: `#F7F7F5`
- Body text: `#252525`

Use the local shadcn components from `src/components/ui/` instead of importing Base UI primitives directly.

## Content source

WordPress remains the CMS for products, media, pages, and blog content. Product data is read from:

```text
/wp-json/wc/store/v1/products
```

Use WordPress media URLs and responsive image data from the API. Keep secrets server-side.
