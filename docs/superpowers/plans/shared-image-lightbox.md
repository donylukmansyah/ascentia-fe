# Shared Image Lightbox Implementation Plan

**Approved scope:** Clean product thumbnail strip, automatic centering of selected thumbnails including the last item, clickable large preview, shared responsive lightbox for products and About Us. No video, autoplay, package installation, or commit.

**Architecture:** Add `src/components/ui/image-lightbox.tsx` with a context-free image model and controlled selected ID. Base UI Dialog owns modality, Escape, focus trapping, scroll lock, focus restoration. Products retain their thumbnail selection; About Us retains its masonry layout but uses native keyboard-accessible buttons. Remove the old feature-specific modal/context instead of retaining duplicate behavior.

**References:** [Base UI Dialog](https://base-ui.com/react/components/dialog), [WAI modal dialog](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/), [MDN scroll snap](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll_snap/Basic_concepts). Existing `components/ui/dialog.tsx` is styled for search; use installed Base UI primitives directly for the fullscreen lightbox rather than overriding every search-dialog style.

## Tasks

- [ ] Add browser assertions for no product thumbnail arrows/counter, selected last thumbnail centered, preview opening/closing, shared About Us behavior, keyboard/focus, mobile layout. Run before implementation; expect missing preview trigger.
- [ ] Implement shared `ImageLightbox` and `LightboxImage`: validated frontend image data only, selected ID, selection/close callback, trigger ref. Dark backdrop, contained full-size image, visible close/previous/next controls, Left/Right keyboard navigation, loading/error fallback, reduced-motion CSS. Native zoom/pinch remains available; no custom gesture or zoom library.
- [ ] Simplify product gallery: delete overflow-arrow state/ResizeObserver/buttons/visible counter; retain a screen-reader status. Horizontal native scrolling, hidden decorative scrollbar, centered selected thumbnail with edge padding so first/last can also center. Use the shared lightbox; keep selection synced when navigating enlarged photos. Resize centering must not scroll the page vertically.
- [ ] Replace About Us feature modal/context with shared lightbox and native button thumbnails. Preserve masonry/photo data/Reveal. Delete obsolete `gallery.tsx`; no feature imports from shared UI.
- [ ] Update current gallery verification for the new interaction. Check 360/390/768/1440, landscape, first/last, empty/single/broken photos, modal Escape/Tab/focus return, About/product reuse, Applications regression, reduced motion. Run mapper tests, ESLint/Prettier for touched files, typecheck, build; inspect screenshots.

## Constraints

- Preserve unrelated working-tree changes, existing WP/API contracts, Applications, product metadata.
- Controls have accessible names and visible focus; no clickable figures.
- Shared UI never imports feature types; feature-specific data passed structurally.
- Focus restoration must target the actual clicked image button, not the last navigation arrow.
- Do not hide images merely to make the strip shorter or load every full-size image eagerly.
