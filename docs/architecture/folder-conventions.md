# Folder Conventions

## Goal

Keep a WordPress-backed marketing site easy to navigate:

- Find a URL and page composition in `routes/`.
- Find a page's UI and page-specific content in `features/`.
- Find persistent shell UI in `components/layout/`.
- Find context-free primitives in `components/ui/`.
- Find cross-cutting helpers in `lib/`.

## Structure

```text
src/
  routes/
    __root.tsx
    index.tsx
    about-us.tsx
    products.tsx
    products/
      brands.tsx
      types.tsx
      applications.tsx

  features/
    home/
      hero-section.tsx
      hero-data.ts
      brand-marquee.tsx
      brand-partners.ts
      who-we-are-section.tsx
    products/
      product-card.tsx
      product-grid.tsx
      product-filter.tsx
      product-api.ts
      product-types.ts
    articles/
      article-card.tsx
      article-grid.tsx
      article-api.ts
      article-types.ts

  components/
    layout/
      site-header.tsx
      site-header/
      site-footer.tsx
    ui/
      button.tsx
      cta-link.tsx
      dropdown-menu.tsx

  hooks/
    use-sticky-header.ts
  lib/
    wordpress.ts
    utils.ts
  styles.css
```

The example is a target shape, not a list of folders to create now. Create a
feature only when work begins in that domain.

## Rules

### `routes/`

TanStack Router owns this directory. A route file maps to a URL, handles URL
parameters or search state, wires route loaders, and composes feature UI.

Do not put reusable UI or WordPress mapping code in a route.

Examples:

- `routes/index.tsx` → `/`
- `routes/products.tsx` → `/products`
- `routes/products/brands.tsx` → `/products/brands`

### `features/`

A feature owns related UI, local content, types, validation, and future
WordPress REST mapping for one page context or business domain.

- `features/home/` owns homepage-only sections such as hero, marquee, and
  who-we-are.
- `features/products/` owns product listing, detail, filter, and product data.
- `features/articles/` owns the shared news/blog domain. News and blogs should
  be separate queries or categories until WordPress proves they need distinct
  domains.

Start a feature flat. Add subdirectories only after several files form a
clear unit.

```text
features/products/
  product-card.tsx
  product-grid.tsx
  product-api.ts
  product-types.ts
```

For example, create `features/products/product-detail/` only when detail UI
needs multiple files.

### `components/layout/`

Persistent site shell only: `site-header`, `site-footer`, and their local
children. The header may use `hooks/use-sticky-header` because that hook is an
established shared project path.

### `components/ui/`

Context-free primitives reusable by any feature: buttons, form controls,
dropdowns, cards, carousel mechanics, pagination, and tabs. Do not put a
business-specific `ProductCard` or a page-specific hero here.

### `lib/`

Small cross-cutting helpers with no page or business context.

- `wordpress.ts` — configured WordPress REST request helpers, when integration
  starts.
- `utils.ts` — generic utilities such as `cn`.

Do not pre-create empty `api/`, `services/`, `stores/`, `schemas/`, or `hooks/`
directories.

## Reuse decisions

Keep components inside the first feature that needs them. Move to shared UI
only after a second concrete use exposes a stable, context-free API.

Examples:

- Homepage hero and who-we-are stay in `features/home/`.
- A brands marquee stays in `features/home/` while it is home-only.
- When customer and brand marquees need the same mechanics, extract only the
  generic mechanics to `components/ui/logo-marquee.tsx`; each feature keeps its
  own title and logo data.
- Product cards belong to `features/products/`, even when used on home and a
  product detail recommendation list.
- Article cards belong to `features/articles/`, shared by news and blog views.

## Dependency direction

```text
routes → features → components / hooks / lib
```

`components/`, `hooks/`, and `lib/` must not import from `features/` or
`routes/`. Features may use shared modules. Routes compose features.

## Naming

- Use lowercase kebab-case filenames: `product-card.tsx`.
- Name files by responsibility: `product-api.ts`, not `helpers.ts`.
- Prefer direct imports. Do not add barrel `index.ts` files solely to shorten
  import paths.
- Run `pnpm generate-routes` after route files change. Never edit
  `src/routeTree.gen.ts` directly.

## Growth rule

Use the smallest structure that keeps ownership obvious. Do not create feature
folders, WordPress clients, or API layers before their implementation exists.
