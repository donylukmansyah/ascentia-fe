# Product Detail Design

## Scope

Add a responsive, fixture-backed product detail page for the existing product
catalog. The first complete fixture is xrFuse 2. The presentation must match
the supplied Figma references while keeping product data ready for later
WooCommerce Store API and REST-visible ACF mapping.

## Route and data

- Add `/products/$slug`.
- Make every product card link to its product slug.
- Keep all mock catalog data local to `features/products`.
- Add detail-only fields to the existing frontend product model: hero image,
  summary, sanitized-ready description HTML, benefits HTML, specifications
  HTML, tags, and related product slugs.
- Resolve the slug in the route, then select the feature page. Unknown slugs
  use the router's not-found path.

## Page

1. A dark hero reusing the About page visual language: breadcrumb and product
   H1 on the left, product hero image on the right under a dark overlay.
   There is no hero description.
2. A sticky-on-scroll section navigation links to `#product`,
   `#description`, `#specifications`, and `#related-products`. Links use
   native smooth scroll and preserve keyboard focus behavior.
3. The main product section uses a two-column desktop layout: product image,
   brand, and taxonomy tags beside the detail body. Description and
   specifications switch using accessible tabs.
4. Related products reuse the existing `ProductCard` and exclude the current
   product.

## Responsive and motion

- Desktop preserves the visual hierarchy from the references.
- Mobile stacks hero copy, gallery, and detail content; anchor navigation
  scrolls horizontally rather than wrapping.
- The hero image receives a restrained scroll-linked drift, respecting
  reduced-motion preferences.
- Cards keep their existing hover behavior. No carousel or new dependency.

## Future WordPress contract

The local detail model aligns with the approved product fields:
`hero_image`, `product_summary`, `product_description`, `key_benefits`,
`specifications`, taxonomies, gallery, and related product IDs. Later API
work replaces the fixture lookup with a mapper; page components continue to
receive the frontend model only.

## Verification

- Generate the route tree after adding the route.
- Run typecheck and lint/check.
- Run the Vite app and verify desktop and mobile product-detail navigation,
  tabs, anchor scrolling, and related-product links.
