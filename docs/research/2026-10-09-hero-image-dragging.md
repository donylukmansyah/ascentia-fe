# In-DOM Hero Image: No Drag Ghost

Date: 2026-10-09

## Decision

Keep the hero as an in-DOM `<img>`. Use `object-cover` plus a per-image
`objectPosition`; do not replace it with a CSS background.

```tsx
<img
  src={slide.image}
  alt=""
  width={1920}
  height={1080}
  draggable={false}
  decoding="async"
  fetchPriority="high"
  className="pointer-events-none size-full select-none object-cover"
  style={{ objectPosition: slide.imagePosition }}
/>
```

Use `fetchPriority="high"` only for the initially visible, above-the-fold
slide. Subsequent carousel images must not all receive high priority.

## Why

- `object-fit: cover` fills the hero while preserving the image aspect ratio;
  overflow is clipped. `object-position` controls which image area remains
  visible. [MDN: object-fit](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/object-fit)
- `draggable={false}` is the direct fix for the browser drag ghost. Images are
  draggable by default when `draggable` is `auto`; `false` disables dragging.
  Do not write bare `draggable`, because the HTML attribute is enumerated, not
  Boolean. [MDN: draggable](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/draggable)
- `pointer-events-none` is optional defense for a purely visual background
  image. It makes the image transparent to pointer targeting, so the parent or
  overlay receives the interaction. Do not use it if the image itself later
  needs pointer interaction. [MDN: pointer-events](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/pointer-events)
- `select-none` is optional polish only. It prevents selectable text in the
  element subtree; an `<img>` has no selectable text, so it is not the drag
  fix. Never put it on a wrapper containing selectable hero copy. [MDN:
  user-select](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/user-select)

## Accessibility And Performance

- Use `alt=""` only when the hero photo is decorative and the nearby heading
  already carries the meaning. Otherwise provide concise, non-duplicative alt
  text. [React: img](https://react.dev/reference/react-dom/components/img)
- Keep intrinsic `width` and `height`; browsers can reserve the aspect ratio
  before the image arrives, reducing layout shift. [MDN: img](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/img)
- `decoding="async"` lets presentation continue before image decoding finishes.
  `fetchPriority="high"` hints that the first visible hero should fetch ahead
  of lower-priority images. [MDN: img](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/img)

## Not Needed

- No `onDragStart={(event) => event.preventDefault()}`: `draggable={false}`
  expresses the same intent declaratively.
- No CSS `background-image`: it does not improve accessibility or responsive
  image handling over the current `<img>` approach.
- No `user-select-none` on hero text: readers should retain normal text
  selection.

## Verify

1. Drag the desktop hero image: no ghost image appears.
2. Click CTA, carousel controls, and links over the image.
3. Tab through controls: focus behavior remains unchanged.
4. Resize desktop and mobile: subject stays visible at each configured
   `imagePosition`.
