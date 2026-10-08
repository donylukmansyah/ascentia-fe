# Reusable CTA Layout

Date: 2026-10-08

## Decision

Use one in-flow `inline-flex` CTA:

- `13px` / `500` for every label.
- Natural width: label length controls width.
- Fixed, non-shrinking icon orb at the right.
- `gap-2` controls text-to-icon space. No `min-w-*`, `justify-between`, or
  right-padding calculated from icon size.
- Hover changes colors and rotates the arrow only. No text/icon translation,
  side switching, or layout movement.

```tsx
<Link
  to={to}
  className={cn(
    'group/cta inline-flex min-h-[52px] cursor-pointer items-center gap-2 rounded-full bg-accent py-1 pr-1 pl-4 text-[13px] font-medium leading-none text-white transition-[background-color,color] duration-200 hover:bg-[var(--brand-dark)] focus-visible:bg-[var(--brand-dark)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary motion-reduce:transition-none',
    size === 'compact' && 'min-h-9 pl-3 sm:min-h-12 sm:pl-3.5',
  )}
>
  <span className="whitespace-nowrap">{children}</span>
  <span
    aria-hidden="true"
    className="grid size-11 shrink-0 place-items-center rounded-full bg-white text-foreground"
  >
    <ArrowUpRight className="size-4 transition-transform duration-200 group-hover/cta:rotate-45 group-focus-visible/cta:rotate-45 motion-reduce:transition-none" />
  </span>
</Link>
```

For a full-width submit CTA, use a separate `Button` composition with
`grid grid-cols-[minmax(0,1fr)_auto]`; it has a different width contract from
an intrinsically-sized navigation CTA.

## Comparison

| Pattern | Result | Decision |
| --- | --- | --- |
| Absolute icon | Icon is visually pinned, but removed from flow. The label needs manual right padding equal to icon width plus gap; long labels can overlap it. | Reject. |
| Flex: `label + fixed icon` | One horizontal dimension. `gap-2` is exact; `shrink-0` preserves orb size; natural content width works for arbitrary labels. | Use. |
| Grid: `minmax(0, 1fr) auto` | Best when the CTA must fill an assigned width; first column absorbs remaining width, icon occupies `auto`. | Submit-only. |

`position: absolute` removes the icon from normal flow, so other content does
not reserve space for it. Flexbox is designed for one-dimensional alignment;
`gap` creates the intentional space between its child items. [MDN: in flow and
out of flow](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Display/In_flow_and_out_of_flow)
[MDN: flexbox](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Flexbox)
[MDN: gap](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/gap)

Grid is valid where width is assigned by the parent, such as the contact form's
full-width submit button. `minmax()` lets the text track shrink while the icon
keeps its automatic track size. [MDN: grid layout](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Grids)

## Motion and accessibility

Tailwind named groups can apply hover and keyboard-focus states from the CTA to
the arrow. Limit the transition to color and arrow rotation; those visual
changes do not alter the label/icon geometry. Keep
`motion-reduce:transition-none` for users who request reduced non-essential
motion. [Tailwind: hover and focus states](https://tailwindcss.com/docs/hover-focus-and-other-states)
[Tailwind: transition property](https://tailwindcss.com/docs/transition-property)
[MDN: prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-reduced-motion)

## Verification

1. Render `Read More`, `Explore Products`, and a deliberately long label.
2. Confirm icon remains right of text, `gap-2` stays fixed, and no overlap at
   320px, 768px, and desktop widths.
3. Hover and keyboard-focus: only colors and arrow rotation change.
4. Enable OS reduced motion: transitions stop.
