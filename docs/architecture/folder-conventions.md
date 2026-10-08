# Folder Conventions

## Goal

Keep files easy to find as Ascentia grows:

- Find a URL in `routes/`.
- Find shared UI in `components/`.
- Find business-specific code in `features/`.
- Find cross-cutting helpers in `lib/`.

## Structure

```text
src/
  routes/
    __root.tsx
    index.tsx
    products/
      index.tsx
      $slug.tsx

  components/
    layout/
      site-header.tsx
      site-footer.tsx
    ui/
      button.tsx
      dialog.tsx

  features/
    home/
      home-hero.tsx
    products/
      product-card.tsx
      product-grid.tsx
      product-api.ts
      product-types.ts

  lib/
    wordpress.ts
    utils.ts

  styles.css
```

The example shows the intended shape, not files that must exist now.

## Rules

### `routes/`

TanStack Router owns this directory. A route file maps to a URL, loads data,
and composes page sections. Do not put reusable UI here.

Examples:

- `routes/index.tsx` → `/`
- `routes/products/index.tsx` → `/products`
- `routes/products/$slug.tsx` → `/products/:slug`

### `components/`

Contains UI shared by multiple routes or features.

- `components/layout/` — persistent site structure: header and footer.
- `components/ui/` — context-free primitives, including local shadcn
  components such as `Button` and `Dialog`.

`site-header.tsx` means the header for the whole site. A page-specific title
area belongs to its feature, not `components/layout/`.

### `features/`

Contains code with business or page context. Keep related code near each
other: UI, types, data access, and validation for the same feature.

Start flat:

```text
features/products/
  product-card.tsx
  product-api.ts
  product-types.ts
```

Add subdirectories only once a feature has enough files to make the flat
directory hard to scan:

```text
features/products/
  components/
    product-card.tsx
    product-grid.tsx
    product-filters.tsx
  product-api.ts
  product-types.ts
```

### `lib/`

Contains small shared helpers without page or business context.

- `wordpress.ts` — configured WordPress request helpers.
- `utils.ts` — generic utilities such as `cn`.

Do not create an empty `utils/`, `services/`, `stores/`, `hooks/`, `schemas/`,
or `server/` directory. Add a folder only when real code needs it.

## Dependency direction

```text
routes → features → components / lib
```

`components/` and `lib/` must not import from `features/` or `routes/`.
Feature code may import shared components and helpers. Route code may compose
features.

## Naming

- Use lowercase kebab-case filenames: `site-header.tsx`, `product-card.tsx`.
- Name files by their role: `product-api.ts`, not `helpers.ts`.
- Keep one primary export per file when practical.
- Prefer direct imports. Do not add barrel `index.ts` files only to shorten
  import paths.

## Growth rule

Use the smallest structure that keeps code local and obvious. Split a file or
add a directory when it becomes hard to scan, its responsibility is unclear,
or several files belong to the same feature—not in anticipation of future
complexity.
