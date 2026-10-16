# Products Brands Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `/products/brands` match the approved reference at desktop and mobile sizes.

**Architecture:** Keep the existing product page composition and filter state.
Refine only presentational classes and remove redundant hero/carousel content.
No routes, data models, fixtures, or dependencies change.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, TanStack Router, Motion.

## Global Constraints

- Change only product feature components and page composition.
- Preserve filtering, search, pagination, carousel scrolling, and fixtures.
- Keep `All products` above `Browse by brand.`.
- Keep the desktop thin blue active-brand rule.
- Do not add dependencies, routes, or generated-file edits.
- Use 44px minimum touch targets for mobile filters, search, pagination.
- Verify with `pnpm exec tsc --noEmit -p tsconfig.json`.

---

### Task 1: Simplify Hero And Catalog Hierarchy

**Files:**

- Modify: `src/features/products/components/products-hero-section.tsx`
- Modify: `src/features/products/components/product-search-panel.tsx`
- Modify: `src/features/products/components/product-grid.tsx`
- Modify: `src/features/products/pages/brands-page.tsx`

**Interfaces:**

- Consumes: Existing `BrandsPage` query, filter, pagination state.
- Produces: Same public page behavior with shorter vertical rhythm.

- [x] **Step 1: Remove the hero anchor CTA**

```tsx
<div className="hero-carousel__copy flex max-w-[min(100%,42rem)] flex-col items-start gap-5 text-left">
  <Breadcrumb
    items={[
      { label: brandsHeroContent.breadcrumbParent, to: '/' },
      { label: breadcrumbCurrent },
    ]}
  />
  <h1
    id="products-hero-heading"
    className="text-[clamp(1.875rem,3.4vw,3.375rem)] leading-[1.03] font-bold tracking-[-0.04em] text-white"
  >
    {title}
  </h1>
</div>
```

Remove `ArrowUpRight`, `anchorId`, and `exploreLabel` from
`ProductsHeroSection`; no caller depends on them.

- [x] **Step 2: Reduce hero and search-panel reserve space**

```tsx
className =
  'relative isolate flex min-h-[340px] w-full items-end overflow-hidden bg-foreground text-white sm:min-h-[400px] lg:min-h-[440px]'
```

```tsx
className =
  'mx-auto flex w-full max-w-7xl flex-1 flex-col justify-end px-5 pt-24 pb-16 sm:px-8 sm:pt-28 sm:pb-16 lg:px-12 lg:pt-32'
```

```tsx
className =
  'mx-auto w-full max-w-7xl px-5 pt-14 pb-4 sm:px-8 sm:pt-12 sm:pb-6 lg:px-12'
```

Keep the search panel floating over the hero boundary.

- [x] **Step 3: Keep the reference catalog hierarchy**

```tsx
<h2 className="text-[clamp(1.75rem,3vw,2.5rem)] leading-tight font-bold tracking-[-0.03em] text-foreground">
  {title}
</h2>
```

Keep the blue `All products` label, the title `Browse by brand.`, and the
product count because all three appear in the supplied reference.

- [x] **Step 4: Tighten the sidebar-to-grid separation**

```tsx
<div className="mx-auto grid w-full max-w-7xl gap-8 px-5 pb-16 sm:px-8 sm:pb-20 lg:grid-cols-[240px_minmax(0,1fr)] lg:px-12">
```

Replace `gap-10` with `gap-8`; retain
`lg:grid-cols-[240px_minmax(0,1fr)]`.

- [x] **Step 5: Typecheck**

Run: `pnpm exec tsc --noEmit -p tsconfig.json`

Expected: exit code `0`.

- [ ] **Step 6: Commit**

```bash
git add src/features/products/components/products-hero-section.tsx src/features/products/components/product-search-panel.tsx src/features/products/components/product-grid.tsx src/features/products/pages/brands-page.tsx
git commit -m "fix: tighten brands catalog hierarchy"
```

### Task 2: Match Filters, Cards, And Recommendations

**Files:**

- Modify: `src/features/products/components/brand-filter.tsx`
- Modify: `src/features/products/components/product-grid.tsx`
- Modify: `src/features/products/components/product-carousel-section.tsx`

**Interfaces:**

- Consumes: Existing `activeId`, `onSelect`, `products`, and carousel scroll
  state.
- Produces: Same filter and carousel API with touch-safe controls.

- [x] **Step 1: Give mobile filters a blue active rule and 44px targets**

```tsx
className={cn(
  'relative flex min-h-11 shrink-0 cursor-pointer items-center border-b-2 px-4 text-sm font-medium whitespace-nowrap transition-colors',
  brand.id === activeId
    ? 'border-primary text-primary'
    : 'border-transparent text-foreground/70',
)}
```

Use the horizontal scroll container. Remove the filled active pill treatment.
Keep the desktop `w-0.5 bg-primary` marker unchanged.

- [x] **Step 2: Tighten card density and preserve 44px pagination**

```tsx
<ul className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
```

```tsx
className = 'size-11 cursor-pointer rounded-md'
```

Use a 12px mobile card gap; preserve 16px at tablet and desktop. Update every
pagination icon button from `size-10` to `size-11`.

- [x] **Step 3: Strip redundant recommendations content**

```tsx
<ProductCarouselSection title="Explore our recommendations" />
```

```tsx
<h2
  id="featured-products-heading"
  className="text-[clamp(2rem,3.4vw,3rem)] leading-[1.04] font-bold tracking-[-0.04em] text-foreground"
>
  {title}
</h2>
<div
  className="flex shrink-0 items-center gap-3"
  role="group"
  aria-label="Product carousel controls"
>
  <Button type="button" variant="outline" size="icon" />
  <Button type="button" variant="default" size="icon" />
</div>
```

Delete carousel `kicker`, `description`, `ctaLabel`, `ctaTo`, `CtaLink`, and
`Reveal` wrappers. Keep the heading, controls, and product list visible by
default.

- [x] **Step 4: Align carousel scroll with its visual gap**

```tsx
const gap = 16
```

The flex list already uses `gap-4`, which is 16px. Keep that value in both
rendered layout and scroll calculations.

- [x] **Step 5: Make search touch-safe**

```tsx
className =
  'min-h-11 w-full rounded-full border border-border bg-white py-2.5 pr-4 pl-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
```

Add `min-h-11` to the search input without changing search state or labels.

- [x] **Step 6: Run static validation**

Run: `pnpm exec tsc --noEmit -p tsconfig.json`

Expected: exit code `0`.

- [ ] **Step 7: Commit**

```bash
git add src/features/products/components/brand-filter.tsx src/features/products/components/product-grid.tsx src/features/products/components/product-carousel-section.tsx src/features/products/components/product-search-panel.tsx
git commit -m "fix: refine brands mobile catalog UX"
```

### Task 3: Visual And Interaction Verification

**Files:**

- Modify: None.

**Interfaces:**

- Consumes: Completed Tasks 1 and 2.
- Produces: Evidence that desktop and mobile behavior remain usable.

- [x] **Step 1: Run the development server**

Run: `pnpm dev`

Expected: Vite serves `http://localhost:3000`.

- [x] **Step 2: Check desktop at 1440px**

Visit: `http://localhost:3000/products/brands`

Expected: short hero; no hero CTA; `Browse by brand.` starts close below the
search panel; desktop active brand has a thin blue left rule; recommendations
has title, controls, cards only.

- [x] **Step 3: Check mobile at 375px**

Visit: `http://localhost:3000/products/brands`

Expected: horizontal filters scroll; active filter has a blue rule; input and
pagination controls measure at least 44px; two product cards fit the viewport;
recommendation cards swipe horizontally.

- [x] **Step 4: Check retained interactions**

Expected: selecting a brand resets pagination; search filters products;
pagination scrolls catalog into view; both carousel arrow controls work; links
retain visible keyboard focus.

- [x] **Step 5: Run final static validation**

Run: `pnpm exec tsc --noEmit -p tsconfig.json`

Expected: exit code `0`.
