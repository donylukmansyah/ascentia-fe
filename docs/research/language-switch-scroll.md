# Language switch scroll jump

## Scope and confirmed reproduction

Investigated the running frontend at `http://localhost:3000/id` and the requested reference `https://www.pertamina.com/en`. No application source edits, dependency installs, CMS writes, email submissions or production configuration changes.

Ascentia reproduction, after waiting for each language switch to settle:

| Action                                  | URL   | Scroll Y |
| --------------------------------------- | ----- | -------- |
| Open ID, select English                 | `/`   | 0        |
| Scroll EN to 1700, select Indonesian    | `/id` | 0        |
| Scroll ID to 2300, select English again | `/`   | 1700     |

The third step restores an older English position, not the current Indonesian position or the top. Repeated using programmatic activation of the real dropdown controls to eliminate Playwright's automatic scrolling into view: the same 1700 result occurred.

## Root cause

`src/lib/i18n/language-context.tsx` updates language after a 160ms timeout and calls `window.history.replaceState({}, '', nextUrl)`. The empty object overwrites the Router-managed history state, including its per-entry scroll restoration key. `src/router.tsx` enables `scrollRestoration: true`.

Instrumented browser evidence:

- Before and after switching, `history.state` is `{}`.
- On the final switch, the Router calls `window.scrollTo({top: 1368, left: 0, behavior: undefined})` in a mouse-driven run.
- The call stack originates in the installed `@tanstack/router-core` scroll-restoration module, following Router navigation handling.
- Installed Router source `scroll-restoration.ts` uses `location.state.__TSR_key || location.href` as its default cache key. With the entry key removed, returning to the same language URL can reuse its cached position.

The overlay fades out based on fixed timers (160ms language update, 220ms settling, 280ms overlay unmount), not actual navigation/scroll completion. It masks the problem briefly rather than coordinating it.

Pointer focus and content height are secondary factors: the initial mouse-driven run showed a dropdown-related scroll movement and an EN/ID document-height difference. Neither is necessary for the old-English-position restoration, which remains when those automatic pointer-scroll effects are bypassed. WordPress fetch latency is not established as the cause.

## Pertamina reference: observed, not assumed

Read-only browser test with its `WebCulture=en` cookie matching `/en`:

| Action            | URL   | Scroll Y |
| ----------------- | ----- | -------- |
| Initial EN        | `/en` | 0        |
| Scroll EN         | `/en` | 2060     |
| Switch to ID      | `/id` | 0        |
| Scroll ID         | `/id` | 3460     |
| Switch back to EN | `/en` | 0        |

This sampled run confirms reset-to-top on explicit language change; it does not establish behavior on every Pertamina page or device. Its frontend uses Blazor assets, not this app's TanStack Router. Its publicly shipped `culture.js` stores a `WebCulture` cookie and can derive language from the URL. Do not copy its framework or cookie implementation as a supposed fix for this app.

## Recommended behavior for approval

- Explicit language switch keeps the same page identity and applicable search/filter state, but starts at the top consistently, matching the observed reference.
- Use Router-managed navigation/history state instead of `window.history.replaceState({})`.
- Keep normal Back/Forward scroll restoration enabled. Do not globally disable `scrollRestoration` or repeatedly force `scrollTo(0, 0)` with timeouts.
- Coordinate the existing language overlay with completed navigation; prevent rapid duplicate switches, clean up timers, handle failures without claiming the new language completed.
- Decide fragment behavior explicitly: a reset-to-top language action should not simultaneously carry an old section hash that requests scrolling to an anchor.
- Alternative: keep the corresponding content section across languages. That needs a defined anchor/section mapping because translated text can change height; retaining raw pixel Y is not equivalent content preservation. Not recommended for the user's Pertamina-like flow.

## Regression boundary

Use the actual language menu. Cover EN/ID/EN after distinct scroll positions, repeated toggles, top and bottom, same-language selection, nested product/article routes, query filters, hash handling, reload, Back/Forward, reduced motion, desktop/mobile where the switcher is available, keyboard focus, absence of page errors and no writable backend requests.

## Evidence

Files under `C:/Users/Minguri/AppData/Local/Temp/`:

- `ascentia-language-scroll.json`: first local failing sequence.
- `ascentia-language-instrumented.json`: history, focus and Router scrollTo call stack.
- `ascentia-language-scroll-no-autoscroll.json`: minimized failing sequence without pointer auto-scroll.
- `pertamina-language-scroll.json`: successful read-only reference sequence.

## Primary sources

- TanStack Router scroll restoration and `resetScroll`: https://tanstack.com/router/latest/docs/framework/react/guide/scroll-restoration
- Requested reference, verified in a real browser: https://www.pertamina.com/en
- Reference's publicly shipped culture helper: https://www.pertamina.com/_content/Oktaf.UI.Components/js/culture.js
- Installed Router source: `node_modules/.pnpm/@tanstack+router-core@1.171.34/node_modules/@tanstack/router-core/src/scroll-restoration.ts`.

9router search was unavailable. Official Router docs and the culture script were fetched directly. Initial readable fetch of Pertamina returned HTTP 500; later Chromium access returned HTTP 200. Only the successful browser test is used for the reference behavior above.
