# Products Brands Layout

## Scope

Refine `/products/brands` to match the supplied reference. Keep its existing
brand filtering, search, pagination, recommendations carousel, and product
fixtures. Do not change other routes or the current data contract.

## Desktop

- Reduce hero height and vertical padding.
- Keep only breadcrumb and `All Brands` in the hero; remove the anchor CTA.
- Retain the floating search panel, with less reserved space below it.
- Preserve the `All products` label above `Browse by brand.` because it exists
  in the reference.
- Keep the desktop sidebar and its thin blue active-brand rule.
- Tighten the product-grid gap.
- Recommendations keeps its title, cards, and arrow controls only. Remove its
  `Products` kicker, description, and CTA.

## Mobile

- Keep the product grid at two columns.
- Use horizontally scrollable brand filters with a visible blue active rule.
- Make filter controls, search input, and pagination controls at least 44px
  tall or wide.
- Keep recommendations horizontally swipeable. Its arrow controls remain
  optional enhancements, not the only navigation method.

## Implementation

Change only product feature components and page composition. Reuse current
components; do not add dependencies or routes. Align carousel scroll distance
with its rendered card gap.

## Verification

- Typecheck.
- Run the dev server, inspect `/products/brands` at desktop and mobile widths.
- Confirm filtering, search, pagination, carousel controls, and keyboard focus
  still work.
