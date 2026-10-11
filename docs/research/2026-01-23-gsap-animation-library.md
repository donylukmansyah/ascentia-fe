# GSAP for Ascentia: Licensing, React Integration, and Usage

Date: 2026-01-23

## Conclusion

GSAP is 100% free (including all previously paid plugins), MIT-friendly for commercial use,
and is the recommended choice for imperative scroll-triggered section animations in Vite/React
projects. Two packages are needed: `gsap` and `@gsap/react`. Cleanup is handled automatically
by `useGSAP()`. Accessibility requires one `gsap.matchMedia()` call wrapping all animation
setup code. SSR is safe — the hook falls back to `useEffect` when `window` is undefined.

---

## 1. Licensing — Is GSAP Paid?

**No. As of 2024, GSAP is entirely free.**

> "GSAP has been at the forefront of web animation for over 15 years… thanks to Webflow's
> generous support, we're able to offer the entire GSAP library for free."
> — [gsap.com/pricing](https://gsap.com/pricing/)

Previously, plugins such as ScrollTrigger, SplitText, MorphSVG, and DrawSVG were
member-only ("Club GreenSock") benefits. **All plugins are now free on npm as of GSAP 3.13.**

> "The private NPM repository is no longer maintained as GSAP and all the plugins are now
> freely available on npm."
> — [gsap.com/docs/v3/Installation](https://gsap.com/docs/v3/Installation/)

**Packages** (both free, public npm):

| Package | Install |
|---|---|
| Core + all plugins | `npm install gsap` |
| React hook | `npm install @gsap/react` |

---

## 2. How Plugins Work

Plugins are separate JS files bundled inside the `gsap` npm package under named exports.
They must be **registered** before use so build-tool tree-shaking does not drop them.

```ts
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
```

Registration is idempotent — calling it multiple times is harmless.

A recommended pattern for larger projects: create a single `src/lib/gsap.ts` that re-exports
a pre-registered instance, then import from there everywhere else.

```ts
// src/lib/gsap.ts
export { gsap } from 'gsap';
export { ScrollTrigger } from 'gsap/ScrollTrigger';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);
```

---

## 3. React Integration — `useGSAP`

GSAP is framework-agnostic, but React 18 Strict Mode double-invokes effects. Without proper
cleanup, `gsap.from()` tweens fire twice and produce conflicting start values.

The official solution is `useGSAP()` from `@gsap/react`. It is a drop-in replacement for
`useEffect` / `useLayoutEffect` that wraps the callback in a `gsap.context()` and **reverts
all animations automatically on unmount**.

> "`useGSAP()` is a drop-in replacement for `useEffect()` or `useLayoutEffect()` that
> automatically handles cleanup using `gsap.context()`."
> — [gsap.com/resources/React](https://gsap.com/resources/React/)

### Minimal usage

```tsx
import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function AnimatedSection() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.from('.section-card', {
        y: 40,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: container.current,
          start: 'top 85%',
          once: true,
        },
      });
    },
    { scope: container },
  );

  return (
    <div ref={container}>
      <div className="section-card">…</div>
      <div className="section-card">…</div>
    </div>
  );
}
```

### `useGSAP` config options

| Option | Type | Default | Purpose |
|---|---|---|---|
| `scope` | React ref | — | Scopes all selector text to ref's subtree |
| `dependencies` | array | `[]` | Re-runs hook when deps change |
| `revertOnUpdate` | boolean | `false` | Reverts animations on each dep change (not only unmount) |

### Interaction handlers — `contextSafe`

Animations created *after* the hook executes (click handlers, timeouts) are not collected in
the cleanup context by default. Wrap them with `contextSafe`:

```tsx
const { contextSafe } = useGSAP({ scope: container });

const handleClick = contextSafe(() => {
  gsap.to('.item', { scale: 1.05, duration: 0.2, yoyo: true, repeat: 1 });
});
```

---

## 4. SSR Considerations (Vite / TanStack Start)

`@gsap/react` implements the **useIsomorphicLayoutEffect** pattern internally:

> "This hook is safe to use in Next or other server-side rendering environments, provided it
> is used in client-side components. It implements the useIsomorphicLayoutEffect technique,
> preferring React's useLayoutEffect() but falling back to useEffect() if window isn't
> defined."
> — [gsap.com/resources/React](https://gsap.com/resources/React/)

For TanStack Start (or any RSC-aware router), keep all GSAP code in client components — do
not call `gsap` in server-only modules. In TanStack Start this means route loaders and server
functions must not import gsap; animation components are rendered client-side only.

`ScrollTrigger` also requires `window` / `document`. If SSR hydration errors occur, guard
registration:

```ts
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}
```

---

## 5. Accessibility — `prefers-reduced-motion`

GSAP's `gsap.matchMedia()` (added in v3.11) is the canonical way to respect
`prefers-reduced-motion`. All animations and ScrollTriggers created inside the handler
function are **reverted automatically** when the media query stops matching.

```ts
const mm = gsap.matchMedia();

mm.add(
  {
    reduceMotion: '(prefers-reduced-motion: reduce)',
    noReduceMotion: '(prefers-reduced-motion: no-preference)',
  },
  (context) => {
    const { reduceMotion } = context.conditions!;

    gsap.from('.section-card', {
      y: reduceMotion ? 0 : 40,
      opacity: reduceMotion ? 1 : 0,
      duration: reduceMotion ? 0 : 0.6,
      scrollTrigger: { trigger: '.section', start: 'top 85%', once: true },
    });
  },
);
```

> "Responsive, accessible animations and ScrollTriggers, here you come! `gsap.matchMedia()`
> lets you tuck setup code into a function that only executes when a particular media query
> matches…"
> — [gsap.com/docs/v3/GSAP/gsap.matchMedia](https://gsap.com/docs/v3/GSAP/gsap.matchMedia/)

Alternatively, use Tailwind's `motion-reduce:` utilities for CSS-only transitions (already
used in this project's CTA component). Reserve GSAP for JS-driven orchestrated sequences
where CSS transitions are insufficient.

---

## 6. Is GSAP Appropriate for Subtle Section Animations?

**Yes, with caveats.**

| Factor | Assessment |
|---|---|
| Expressiveness | ScrollTrigger `once: true` + `stagger` is ideal for fade-in/slide-in on scroll |
| Bundle cost | `gsap` core ~30 kB gzipped; `ScrollTrigger` ~15 kB gzipped. Total ~45 kB. Justifiable if used across multiple sections |
| Alternative | Tailwind + CSS `@keyframes` + `IntersectionObserver` covers simple fade-ins with zero JS cost |
| When GSAP wins | Staggered children, timeline sequencing, scrub effects, complex easing |
| When CSS wins | Single-element fade/slide, hover state, CTA arrow rotation (already done with Tailwind) |

Recommendation: use GSAP if three or more sections need coordinated scroll animations.
For isolated single-element transitions, keep Tailwind `motion-reduce` patterns already in use.

---

## 7. Bundle / Dependency Tradeoff

- `gsap` is a single package — no plugin is a separate npm package.
- Only import the plugins actually registered; Vite's tree-shaking will drop the rest.
- Do not add `@gsap/react` unless React is the rendering environment (it is for Ascentia).
- ScrollSmoother (scroll-jacking smooth scroll) is free but adds complexity; avoid unless
  explicitly required.
- `SplitText`, `MorphSVG`, `DrawSVG` — free but large. Only install if the feature needs them.

---

## Sources

- [gsap.com/pricing](https://gsap.com/pricing/) — licensing and free-tier confirmation
- [gsap.com/docs/v3/Installation](https://gsap.com/docs/v3/Installation/) — package names, npm migration note
- [gsap.com/resources/React](https://gsap.com/resources/React/) — `useGSAP`, SSR, cleanup, `contextSafe`
- [gsap.com/docs/v3/Plugins/ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/) — ScrollTrigger API
- [gsap.com/docs/v3/GSAP/gsap.matchMedia](https://gsap.com/docs/v3/GSAP/gsap.matchMedia()/) — prefers-reduced-motion pattern
