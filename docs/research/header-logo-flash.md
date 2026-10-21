# Header logo flash: local diagnosis

## Scope

Read-only application diagnosis against `http://localhost:3000/about-us`, Home, News, a real News detail and Products Brands. No application changes, dependencies, CMS writes or email submissions. Added only this research note. Existing worktree changes left intact.

## Confirmed observations

A fresh direct visit at the top of About, Home or News kept the white logo during the sampled window. The reported flash was reproduced after scrolling down, scrolling upward enough to reveal the solid header, then returning to the top or navigating to another hero page.

Frame samples on About with no network activity required:

| Time after return to top | Scroll Y | Header state | Logo            |
| ------------------------ | -------- | ------------ | --------------- |
| 8 ms                     | 0        | visible      | logo-color.webp |
| 25 ms                    | 0        | transparent  | logo-white.webp |
| 306 ms                   | 0        | transparent  | logo-white.webp |

All requests were blocked after the initial page loaded. The flash still occurred. Only a request for the white logo asset was attempted during that sample. This isolates a local UI state timing issue, not a WordPress fetch requirement. Fetch/navigation latency may make the transition more noticeable, but is not necessary to trigger it.

Other sampled transitions retained the colored logo at scroll Y zero for approximately 27–77 ms. The header background then faded from white to transparent for roughly 500 ms while the logo source had already switched to white. Reduced-motion testing removed the background fade, but still reproduced the first stale colored frame.

## Causes in current source

1. `src/hooks/use-sticky-header.ts:73–76` schedules scroll processing with `requestAnimationFrame`. The browser can already be at Y zero while React still renders `visible` from the prior scroll. `src/components/layout/site-header/index.tsx:42–48` uses that old state for the solid background and colored logo.
2. `src/components/layout/site-header/index.tsx:96–109` transitions background/color for 500 ms when becoming visible/transparent. Logo `src` switches immediately, independently of background completion.
3. Header route styling mixes `state.location.pathname` with `state.matches`. These can represent the destination URL and previously rendered matches during a pending navigation. A missing-page-to-About test retained the old not-found matches and colored logo briefly. News-detail-to-About instead switched the logo white while the old editorial body remained rendered. Route style should describe the currently rendered page, not mixed navigation phases.

Separate edge case: reloading About while the browser restores Y=700 left the hook in `transparent`. The effect initializes `previousScrollY` from the current value, then exits on `diff === 0` before deriving a non-top initial state (`use-sticky-header.ts:25,46–47`). This was observed separately, not presented as the main top-of-page flash.

## Recommended correction boundary

- Keep header visibility in the existing sticky-header hook; no duplicate scroll listener in the header.
- Synchronize the top-boundary state with actual scroll restoration/render timing; preserve hide-on-down, reveal-on-up, paused dropdown/search and mobile menu behavior.
- Coordinate hero transparency and logo tone instead of switching the logo over a lingering white background.
- Base route tone on one consistent rendered-route snapshot. Editorial detail/404 pages must still use the colored logo at the top; hero pages use white.
- Initialize restored-scroll states correctly. Do not reset every navigation to zero: Back navigation must retain Router scroll restoration.
- Before applying a fix, keep a runnable frame-sampling regression covering top return, scrolled navigation, editorial/404 navigation, restored reload and reduced motion.

The diagnosis above preceded implementation. The subsequent user-approved fix synchronizes the top scroll boundary with `flushSync`, initializes restored positions in a layout effect, derives header tone from rendered matches, and switches surface/logo together without a background-color fade. Border colors are scoped per edge so bottom-border utilities cannot override the 3px primary top line. Product sticky offsets now include all four vertical border pixels.

Regression: `python scripts/verify/verify-header-logo-transitions.py` failed before the fix and passed afterward. Existing site-header and product-sticky-nav checks also passed on development and a separately launched production build. Coverage includes desktop/mobile, reduced motion, dropdown pinning, mobile menu, top return, browser Back/reload restoration, editorial/not-found navigation and primary-line color. No dependencies or CMS writes were introduced.

## Evidence outside repo

Browser trace JSON files in `C:/Users/Minguri/AppData/Local/Temp/`:

- `ascentia-header-audit.json`: direct top visits and unscrolled navigation.
- `ascentia-header-scroll-audit.json`: scrolled navigation; assertion fails for colored logo at Y zero.
- `ascentia-header-top-flash.json`: minimized About top-return reproduction; assertion fails.
- `ascentia-header-motion-audit.json`: normal/reduced-motion comparison.
- `ascentia-header-route-audit.json`: route matches versus destination pathname.
- `ascentia-header-editorial-route-audit.json`: actual editorial body versus header tone.
- `ascentia-header-reload-audit.json`: browser-restored Y=700.

## Primary documentation

- React documents that effects and their state updates can occur after browser paint, causing visual flicker. `useLayoutEffect` is an option only where work must precede paint; it is not by itself a proven fix for this hook's separately scheduled animation frame: https://react.dev/reference/react/useEffect#my-effect-does-something-visual-and-i-see-a-flicker-before-it-runs
- TanStack Router documents scroll restoration after successful navigation and before paint, including restored browser history positions: https://tanstack.com/router/latest/docs/framework/react/guide/scroll-restoration

9router search was unavailable; official documentation was fetched directly. Repository behavior above comes from browser traces and source inspection, not from assuming the latest online documentation exactly matches installed runtime internals.
