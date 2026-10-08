# Feature-Based Foldering: Research and Recommendation

## Scope and evidence

This note applies official TanStack Router guidance and Feature-Sliced Design (FSD)'s primary architecture reference to Ascentia's current `src/` tree. **Source facts** are cited to those references; the repository-specific guidance below is a recommendation, not a universal framework requirement. TanStack supports file-based and code-based route configuration, and describes file-based routing as its preferred/recommended option. Its routing documentation does not prescribe a feature-folder tree; FSD is one separately documented architecture, not a TanStack requirement. [TanStack file-based routing](https://tanstack.com/router/latest/docs/framework/react/routing/file-based-routing)

## What the sources establish

- **URLs belong to the router's route structure.** TanStack file-based routing maps files and directories to the route hierarchy, with route files corresponding to URL paths. [File-based routing](https://tanstack.com/router/latest/docs/framework/react/routing/file-based-routing)
- **Routes are a valid place to coordinate route data loading.** TanStack describes the router as the place to coordinate async requirements for a destination and provides per-route `loader` functions; loader data is consumed through route APIs. [Data loading](https://tanstack.com/router/latest/docs/framework/react/guide/data-loading)
- **Feature-oriented organization is one architecture, not the only mandated structure.** FSD groups code into standardized layers, business-oriented slices, and technical segments; slices are intended to keep related code cohesive and independent. It does not require all layers, and recommends considering migration when an existing architecture is causing problems. [FSD overview](https://feature-sliced.design/docs) · [Slices and segments](https://feature-sliced.design/docs/reference/slices-segments)

## Ascentia-specific recommendation

The homepage is now the first implemented feature: `src/features/home/` owns its hero and brand marquee. Product, blog, and news route components remain placeholders, so no empty domain directories are needed yet. The root layout uses the site header, and `components/ui/` contains local UI wrappers. See [`src/routes/`](../../src/routes/), [`src/features/`](../../src/features/), [`src/components/`](../../src/components/), and [`src/lib/`](../../src/lib/). **No broad migration is proposed:** add a domain folder when active implementation makes ownership clearer, not merely to populate a tree.

For future implementation, keep the existing responsibilities clear:

- **`routes/` — URL and route lifecycle.** Keep TanStack file-route definitions here: route identity, URL/search/param handling, route-level loader wiring, and page composition. A loader may call a feature-owned operation when domain-specific fetching or transformation becomes substantial; TanStack's ability to load data from routes does not require domain logic to live in route files.
- **`features/` — cohesive product or page-context code.** Add a feature only when real implementation exists and related UI, types, data access, or behavior are easier to understand together than scattered across route files and shared folders. Keep it flat initially; introduce subfolders only when the number or kinds of files make that useful.
- **`components/` — genuinely shared UI.** Keep site-wide layout and context-free UI reusable across features/routes. Keep one-route UI local until it has a concrete reason to be shared or belongs with an emerging feature; do not classify page-context code as globally shared merely because it is a component.
- **`lib/` — cross-cutting helpers.** Keep small utilities without product/page context here; feature-specific behavior should stay with its feature.

A plausible future shape, only as those domains gain real implementation, is:

```text
src/
  routes/
    index.tsx
    products.tsx
    products/
      applications.tsx
      types.tsx
      brands.tsx
    blogs.tsx
    news.tsx
  features/
    home/           # hero section/data if home-specific code grows or is refactored
    products/       # catalog UI, types, or domain data operations when needed
    editorial/      # blog/news behavior only if it forms a cohesive shared domain
  components/
    layout/         # site-wide header/navigation
    ui/             # reusable context-free primitives
  lib/              # cross-cutting helpers
```

This is illustrative, not a list of directories to create now. `features/home/` is the current page-specific feature. Blogs and news can remain simple route files while their bodies are placeholders.

Prefer the existing policy's simple dependency direction: **`routes → features → components / lib`**. Routes compose features; feature modules can use shared UI and helpers; shared components and helpers should not import route- or feature-specific code. This direction is a local maintainability recommendation aligned with FSD's general lower-layer dependency principle, not a requirement imposed by TanStack or a claim that Ascentia adopts the complete FSD taxonomy. A full FSD arrangement introduces named layers such as `pages`, `widgets`, `features`, `entities`, and `shared`, with rules between them; Ascentia's existing `routes` / `components` / `lib` convention is intentionally more pragmatic and should not be expanded into that taxonomy without a concrete organizational problem. [FSD layers and import rule](https://feature-sliced.design/docs/reference/layers)

For the existing folder placement, growth rules, naming, and dependency policy, see [Folder Conventions](./folder-conventions.md); this research note supplements that policy with source context rather than replacing or duplicating it.
