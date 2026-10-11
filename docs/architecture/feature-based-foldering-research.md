# Feature-Based Foldering: Research and Recommendation

## Scope and evidence

This note applies official TanStack Router guidance and Feature-Sliced Design (FSD)'s primary architecture reference to Ascentia's current `src/` tree. **Source facts** are cited to those references; the repository-specific guidance below is a recommendation, not a universal framework requirement. TanStack supports file-based and code-based route configuration, and describes file-based routing as its preferred/recommended option. Its routing documentation does not prescribe a feature-folder tree; FSD is one separately documented architecture, not a TanStack requirement. [TanStack file-based routing](https://tanstack.com/router/latest/docs/framework/react/routing/file-based-routing)

## What the sources establish

- **URLs belong to the router's route structure.** TanStack file-based routing maps files and directories to the route hierarchy, with route files corresponding to URL paths. [File-based routing](https://tanstack.com/router/latest/docs/framework/react/routing/file-based-routing)
- **Routes are a valid place to coordinate route data loading.** TanStack describes the router as the place to coordinate async requirements for a destination and provides per-route `loader` functions; loader data is consumed through route APIs. [Data loading](https://tanstack.com/router/latest/docs/framework/react/guide/data-loading)
- **Feature-oriented organization is one architecture, not the only mandated structure.** FSD groups code into standardized layers, business-oriented slices, and technical segments; slices are intended to keep related code cohesive and independent. It does not require all layers, and recommends considering migration when an existing architecture is causing problems. [FSD overview](https://feature-sliced.design/docs) · [Slices and segments](https://feature-sliced.design/docs/reference/slices-segments)

## Ascentia-specific recommendation

Active feature domains are `home`, `about`, `contact`, and `products`. The
root layout owns persistent shell UI, while `components/ui/` contains only
context-free primitives. Blog and news routes remain placeholders, so no empty
editorial feature exists. See [`src/routes/`](../../src/routes/),
[`src/features/`](../../src/features/), [`src/components/`](../../src/components/),
and [`src/lib/`](../../src/lib/).

For future implementation, keep the existing responsibilities clear:

- **`routes/` — URL and route lifecycle.** Keep TanStack file-route definitions here: route identity, URL/search/param handling, and route-level loader wiring. A route selects a feature `pages/` module; domain logic stays in the feature.
- **`features/` — cohesive product or page-context code.** Feature pages compose UI. Group implementation by role: `components/`, `constants/`, `types/`, plus `api/`, `hooks/`, or `forms/` only after their first real file exists.
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
    home/
      components/
      constants/
      pages/
    about/
      components/
      constants/
      pages/
    contact/
      components/
      pages/
    products/
      components/
      constants/
      pages/
      types/
  components/
    layout/         # site-wide header/navigation
    ui/             # reusable context-free primitives
  lib/              # cross-cutting helpers
```

This reflects active feature domains. Blogs and news remain simple route files
while their bodies are placeholders. Future WordPress reads belong in the
owning feature's `api/` directory after real Store API or REST responses are
inspected.

Prefer the existing policy's simple dependency direction:
**`routes → features → components / hooks / lib`**. Routes select feature
pages; feature modules can use shared UI and helpers; shared modules must not
import route- or feature-specific code. This direction is a local
maintainability recommendation aligned with FSD's general lower-layer
dependency principle, not a requirement imposed by TanStack or a claim that
Ascentia adopts the complete FSD taxonomy. [FSD layers and import rule](https://feature-sliced.design/docs/reference/layers)

For the existing folder placement, growth rules, naming, and dependency policy, see [Folder Conventions](./folder-conventions.md); this research note supplements that policy with source context rather than replacing or duplicating it.
