# Folder Conventions

## Goal

Keep a WordPress-backed marketing site easy to navigate:

- Find a URL, route params/search, and loaders in `routes/`.
- Find each page's composition, UI, content, and future data access in
  `features/`.
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
      components/
        hero-section.tsx
        brand-marquee.tsx
        who-we-are-section.tsx
      constants/
        hero.ts
        brand-partners.ts
      pages/
        home-page.tsx
    about/
      components/
        hero-section.tsx
        company-section.tsx
        vision-mission-section.tsx
      constants/
        hero.ts
        company.ts
      pages/
        about-page.tsx
    contact/
      components/
        contact-form.tsx
        contact-panel.tsx
      pages/
        contact-page.tsx
    products/
      components/
        product-card.tsx
      constants/
        products.ts
      pages/
        products-page.tsx
      types/
        product.ts
    articles/
      api/
        get-articles.ts
      components/
        article-card.tsx
        article-grid.tsx
      pages/
        articles-page.tsx

  components/
    layout/
      site-header/
        index.tsx
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
parameters or search state, wires route loaders, and selects a feature page.

Do not put page markup, reusable UI, or WordPress mapping code in a route.

Examples:

- `routes/index.tsx` → `/`
- `routes/products.tsx` → `/products`
- `routes/products/brands.tsx` → `/products/brands`

### `features/`

A feature owns one page context or business domain. Its `pages/` modules
compose feature UI; its other folders keep related implementation local.

Use a folder only when it contains real implementation:

- `components/` — page/domain UI used inside that feature.
- `constants/` — static local content and configuration.
- `types/` — local frontend models shared within that feature.
- `api/` — feature-specific WordPress or WooCommerce reads and mapping.
- `hooks/` — feature-specific state or browser behavior.
- `forms/` — feature-specific validation and form definitions.
- `pages/` — page modules selected by `routes/`.

Not every feature needs every folder. Do not pre-create empty folders.

- `features/home/` owns homepage-only sections such as hero, marquee, and
  who-we-are.
- `features/products/` owns product listing, detail, filter, and product data.
- `features/articles/` owns the shared news/blog domain. News and blogs should
  be separate queries or categories until WordPress proves they need distinct
  domains.

```text
features/products/
  components/
    product-card.tsx
  constants/
    products.ts
  pages/
    products-page.tsx
  types/
    product.ts
```

Keep product-specific UI in `features/products/components/`, even when home
also renders it. Extract to `components/ui/` only after a second concrete,
context-free use.

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

## Future Fetches

When WordPress integration starts, keep endpoint behavior inside its owning
feature. Inspect the real public response first, then add only the needed
modules.

```text
features/products/
  api/
    get-products.ts
    get-product.ts
    product-mapper.ts
  types/
    product.ts
```

`api/` modules fetch and map Store API responses into `types/` models.
`components/` and `pages/` consume frontend models only; they never receive
raw WordPress responses or privileged credentials. If browser CORS blocks a
public read, add a server-side fetch path rather than exposing secrets.

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
`routes/`. Features may use shared modules. Routes select feature pages.

## Comments

- // one line only. No JSDoc, no block comments.
- Max one short line per spot. Explain why only when code cannot show it.
- Delete commented-out code. Example: // Pin header while dropdown open.

## Naming

- Use lowercase kebab-case filenames: `product-card.tsx`.
- Name files by responsibility: `product-api.ts`, not `helpers.ts`.
- Prefer direct imports. Do not add barrel `index.ts` files solely to shorten
  import paths.
- Run `pnpm generate-routes` after route files change. Never edit
  `src/routeTree.gen.ts` directly.

## Growth rule

Use feature-first folders for page/domain work. Add `api/`, `hooks/`, `forms/`,
`constants/`, or `types/` only when their first real file exists.
