# Product Detail Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a responsive static product-detail route that matches the approved Figma reference and can later consume mapped WooCommerce data.

**Architecture:** Keep fixture data and detail-only types inside
`features/products`. A dynamic product route passes the slug to the product
page. Feature components compose the hero, section navigation, detail body,
and related products without introducing a general-purpose data layer.

**Tech Stack:** React 19, TypeScript, TanStack Router, Tailwind CSS v4,
Motion, lucide-react.

## Global Constraints

- Product route is `/products/$slug`.
- Use lowercase kebab-case files and direct imports.
- Keep route files limited to URL identity and feature-page selection.
- Reuse `ProductCard`; do not add dependencies.
- Use project tokens; primary is `#288AC6`, accent is `#F28B3B`.
- Interactive elements include `cursor-pointer`.
- Respect `prefers-reduced-motion`.
- Regenerate `src/routeTree.gen.ts`; never edit it manually.
- Do not expose CMS credentials or render untrusted CMS HTML.

---

### Task 1: Add fixture-ready product detail data

**Files:**

- Modify: `src/features/products/types/product.ts`
- Modify: `src/features/products/constants/products.ts`

**Interfaces:**

- Produces: `ProductDetailData`, `getProductDetail(slug: string)`.
- Consumes: existing `ProductCardData` catalog records.

- [ ] **Step 1: Extend the product model**

```ts
export interface ProductDetailData extends ProductCardData {
  heroImage?: string | null
  tags: string[]
  description: string[]
  benefits: Array<{ title: string; description: string }>
  specifications: Array<{ label: string; value: string }>
  relatedProductSlugs: string[]
}
```

- [ ] **Step 2: Add the xrFuse 2 fixture and a safe catalog fallback**

```ts
export function getProductDetail(slug: string): ProductDetailData | undefined {
  const product = allProducts.find((item) => item.slug === slug)
  if (!product) return undefined

  return product.slug === 'xrfuse-2' ? xrfuse2Detail : toCatalogDetail(product)
}
```

`xrfuse2Detail` contains the supplied product copy, four benefits,
specification rows, taxonomy tags, hero image, and related slugs. The
fallback derives neutral, non-claiming content from the fixture card so every
current catalog card reaches a usable page.

- [ ] **Step 3: Run static validation**

Run: `pnpm exec tsc --noEmit -p tsconfig.json`

Expected: exits `0`.

### Task 2: Compose reusable product-detail sections

**Files:**

- Create: `src/features/products/components/product-detail-hero.tsx`
- Create: `src/features/products/components/product-detail-nav.tsx`
- Create: `src/features/products/components/product-detail-content.tsx`
- Create: `src/features/products/components/related-products-section.tsx`
- Create: `src/features/products/pages/product-detail-page.tsx`

**Interfaces:**

- Consumes: `ProductDetailData` and `ProductCardData`.
- Produces: `ProductDetailPage({ slug: string })`.

- [ ] **Step 1: Build the detail hero**

```tsx
export function ProductDetailHero({ product }: { product: ProductDetailData }) {
  return (
    <section className="relative isolate overflow-hidden bg-foreground text-white"></section>
  )
}
```

Match the About hero's full-bleed image, dark overlay, container widths,
breadcrumb treatment, and reduced-motion scroll drift. Do not render a hero
description. Place the faded product image toward the right on desktop and
behind the copy on mobile.

- [ ] **Step 2: Build semantic anchor navigation**

```tsx
const sections = [
  ['product', 'Products'],
  ['description', 'Descriptions'],
  ['specifications', 'Specifications'],
  ['related-products', 'Related products'],
] as const
```

Use native `href="#..."`, `scroll-smooth`, `scroll-mt-28`, visible focus
styles, and an overflow-x auto strip on small screens. Keep the bar sticky
below the fixed header while content scrolls. No scroll-spy state.

- [ ] **Step 3: Build the image and tabbed content block**

Render desktop as image/meta left and content right; stack below `lg`. Use
buttons with `aria-selected`, `role="tab"`, and `aria-controls` to switch the
visible Description and Specifications panels. Description renders the
fixture paragraphs and benefits list as React nodes; specifications renders a
definition list. Avoid `dangerouslySetInnerHTML` until a WordPress mapper
sanitizes REST HTML with the installed `sanitize-html` package.

- [ ] **Step 4: Build related products**

```tsx
const related = product.relatedProductSlugs
  .map((slug) => allProducts.find((item) => item.slug === slug))
  .filter((item): item is ProductCardData => Boolean(item))
```

Render the first four matches in a responsive grid with a `/products` link.
Reuse `ProductCard`.

- [ ] **Step 5: Compose success and missing-product states**

`ProductDetailPage` resolves `slug` via `getProductDetail`. Render a concise
accessible fallback with a link to `/products` when no fixture exists. The
route remains free of page markup.

- [ ] **Step 6: Run static validation**

Run: `pnpm exec tsc --noEmit -p tsconfig.json`

Expected: exits `0`.

### Task 3: Wire catalog cards and dynamic route

**Files:**

- Modify: `src/features/products/components/product-card.tsx`
- Create: `src/routes/products/$slug.tsx`
- Generated: `src/routeTree.gen.ts`

**Interfaces:**

- Consumes: `ProductCardData.slug`.
- Produces: `/products/$slug` navigation and `ProductDetailPage({ slug })`.

- [ ] **Step 1: Make every product card link to its slug**

```tsx
<Link
  to="/products/$slug"
  params={{ slug: product.slug }}
  className="before:absolute before:inset-0 focus-visible:outline-none"
>
  {product.name}
</Link>
```

Remove the optional `to` prop. Product cards always represent a product.

- [ ] **Step 2: Add the thin route selector**

```tsx
export const Route = createFileRoute('/products/$slug')({
  component: ProductDetailRoute,
})

function ProductDetailRoute() {
  const { slug } = Route.useParams()
  return <ProductDetailPage slug={slug} />
}
```

- [ ] **Step 3: Generate the route tree**

Run: `pnpm generate-routes`

Expected: `src/routeTree.gen.ts` contains `/products/$slug`.

- [ ] **Step 4: Run static validation**

Run: `pnpm exec tsc --noEmit -p tsconfig.json`

Expected: exits `0`.

### Task 4: Verify responsive behavior and repository checks

**Files:**

- Verify: `/products/xrfuse-2`

**Interfaces:**

- Verifies: route navigation, anchor navigation, tabs, responsive layout, and
  related product links.

- [ ] **Step 1: Run repository checks**

Run:

```bash
pnpm check
pnpm lint
pnpm build
```

Expected: all commands exit `0`.

- [ ] **Step 2: Perform browser smoke checks**

Run: `pnpm dev`

Verify at desktop and 390px viewport:

```text
/products/xrfuse-2
```

Expected: hero image remains legible under its overlay; all four section links
scroll to correct IDs; both tabs switch with keyboard; related cards navigate
to a detail URL; mobile navigation stays one row and scrolls horizontally.

- [ ] **Step 3: Review the final diff**

Run:

```bash
git diff --check
git diff -- src/features/products src/routes/products
```

Expected: no whitespace errors and no unrelated-file edits.
