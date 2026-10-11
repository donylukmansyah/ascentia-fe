# Scroll-Triggered Entrance Animation: Options for About Us

Date: 2026-10-09  
Context: React 19 + Vite (TanStack Router). Need in-view reveal only — no scroll-scrub, no pinning.

---

## Candidates Compared

### 1. Motion for React (`motion` package)

**Install:** `pnpm add motion`  
**React API:** Declarative props on a `motion.*` element. First-class React.  
**Simplest in-view reveal:**

```tsx
import { motion } from "motion/react";

<motion.section
  initial={{ opacity: 0, y: 24 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, amount: 0.2 }}
  transition={{ duration: 0.5 }}
>
  {children}
</motion.section>
```

**Bundle:** `motion` component is ~34 kB (minified+gzip) with all features pre-bundled. Tree-shakeable; `LazyMotion` + `m` component can reduce to 4.6 kB initial render + async `domAnimation` (+15 kB). Scroll-triggered path uses `IntersectionObserver` (pooled, low overhead).  
Source: [motion.dev/docs/react-reduce-bundle-size](https://motion.dev/docs/react-reduce-bundle-size), [motion.dev/docs/react-lazy-motion](https://motion.dev/docs/react-lazy-motion)

**Accessibility / reduced-motion:** Built-in. Wrap app in `<MotionConfig reducedMotion="user">` to automatically disable transforms and preserve opacity transitions sitewide. Alternatively `useReducedMotion()` hook for manual control.  
Source: [motion.dev/docs/react-accessibility](https://motion.dev/docs/react-accessibility)

**Cleanup/lifecycle:** Managed internally via `IntersectionObserver` pooling. No manual cleanup needed on the consumer side; standard React component mount/unmount.

**Maintenance:** MIT, 28 M+ weekly downloads (npm, Oct 2026), actively maintained (last publish Oct 2026). 33.8 K GitHub stars.

---

### 2. GSAP + ScrollTrigger

**Install:** `pnpm add gsap @gsap/react`  
**React API:** Imperative — wrap in `useGSAP({ scope: containerRef })` from `@gsap/react`. Cleanup is automatic via `gsap.context()` inside the hook.  
**Simplest in-view reveal:**

```tsx
import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function AnimatedSection() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.from(".card", {
        y: 40, opacity: 0, duration: 0.6, stagger: 0.1,
        scrollTrigger: { trigger: container.current, start: "top 85%", once: true },
      });
    },
    { scope: container }
  );

  return <div ref={container}>{/* ... */}</div>;
}
```

**Bundle:** `gsap` core ~30 kB gzipped + `ScrollTrigger` ~15 kB gzipped ≈ 45 kB total. Two packages required. Free on npm since GSAP 3.13 (previously Club GreenSock paywall). All plugins now public.  
Source: [prior research note](./2026-01-23-gsap-animation-library.md), [gsap.com/pricing](https://gsap.com/pricing/)

**Accessibility / reduced-motion:** Requires manual `gsap.matchMedia()` wrapper; not automatic.

**Cleanup/lifecycle:** `useGSAP` handles it — reverts all animations on unmount via `gsap.context()`. SSR-safe (isomorphic layout effect).

**Verdict for About Us:** Powerful but over-engineered for simple reveals. Justified only for staggered timelines, scroll-scrub, or pinned storytelling sections.

---

### 3. AOS (Animate On Scroll)

**Install:** `pnpm add aos`  
**React API:** Attribute-based (`data-aos="fade-up"`). Requires global `AOS.init()` call — typically in a `useEffect` on the root. No declarative React integration.  
**Simplest usage:**

```tsx
useEffect(() => {
  AOS.init({ once: true, duration: 600 });
  return () => AOS.refresh(); // no true cleanup/destroy
}, []);

<div data-aos="fade-up">...</div>
```

**Bundle:** ~6 kB JS + separate CSS file required. Last published to npm 8 years ago (v2.3.4). Last commit Mar 2024 (stale). 371 open issues on GitHub.  
Source: [npmjs.com/package/aos](https://www.npmjs.com/package/aos), [github.com/michalsnik/aos](https://github.com/michalsnik/aos)

**Accessibility / reduced-motion:** Not built-in. Must add `prefers-reduced-motion` CSS manually.

**Cleanup/lifecycle:** No React-native lifecycle. `AOS.init()` mutates DOM globally. No `destroy()` API — mutations persist on unmount.

**Verdict:** Effectively unmaintained. DOM-attribute API fights React's declarative model. Skip.

---

## Recommendation

**Use Motion (`motion` package).** Reasons:

| Criterion | Motion | GSAP + ScrollTrigger | AOS |
|---|---|---|---|
| React integration | Declarative, native | Imperative, 2 packages | DOM attributes, global init |
| In-view API | `whileInView` prop | `scrollTrigger` in `useGSAP` | `data-aos` attribute |
| Reduced-motion | Automatic via `MotionConfig` | Manual `matchMedia` | Manual CSS only |
| Bundle (reveal-only) | ~34 kB (or 4.6+15 kB lazy) | ~45 kB | ~6 kB + CSS |
| Maintenance | Active (Oct 2026) | Active | Stale (last release 8 yrs ago) |
| Cleanup | Internal | `useGSAP` handles | No true cleanup |

For an About Us page needing only in-view reveals:

```bash
pnpm add motion
```

```tsx
// Wrap app root (or layout) once:
import { MotionConfig } from "motion/react";
<MotionConfig reducedMotion="user">{children}</MotionConfig>

// Per section:
import { motion } from "motion/react";
<motion.section
  initial={{ opacity: 0, y: 24 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, amount: 0.2 }}
  transition={{ duration: 0.5 }}
>
  {children}
</motion.section>
```

GSAP becomes the better choice only if the About Us page gains scroll-scrubbed timelines, pinned storytelling panels, or complex stagger orchestration.

---

## Sources

- [motion.dev/docs/react-scroll-animations](https://motion.dev/docs/react-scroll-animations)
- [motion.dev/docs/react-reduce-bundle-size](https://motion.dev/docs/react-reduce-bundle-size)
- [motion.dev/docs/react-lazy-motion](https://motion.dev/docs/react-lazy-motion)
- [motion.dev/docs/react-accessibility](https://motion.dev/docs/react-accessibility)
- [npmjs.com/package/motion](https://www.npmjs.com/package/motion) — 28M+/week, MIT, v14.0.0
- [npmjs.com/package/aos](https://www.npmjs.com/package/aos) — v2.3.4, published 8 yrs ago
- [github.com/michalsnik/aos](https://github.com/michalsnik/aos) — last commit Mar 2024, 371 open issues
- [gsap.com/pricing](https://gsap.com/pricing/) — free since 3.13
- [Prior GSAP research](./2026-01-23-gsap-animation-library.md)
