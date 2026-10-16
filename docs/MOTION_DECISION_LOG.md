# Motion decision log

Append entries as features ship. Template:

```
## YYYY-MM-DD — T{x.y} {short name}
- Decision: shipped / deferred / reverted
- Configuration: ...
- Measured: initial gz, INP, Lighthouse
- Notes: ...
```

## 2026-10-14 — Scope lock
- Decision: T2 + T3 in one cycle; vertical projects index; View Transitions first; Tier 4 gated.
- Status: approved; implementation not started.

## 2026-10-14 — Milestone 0
- Decision: tooling foundation committed (dependency + chunk baseline)
- Added: `gsap@3.15.0`, `@gsap/react@2.1.2`, `motion@14.2.0`, `lenis@1.3.26`
- Vite: `manualChunks.vendor-motion` added
- Measured (gz): initial main `228.70 KB / 79.21 KB`; vendor-motion `7.81 KB / 3.08 KB` (unused until features land); Home `42.67 / 14.26`; Skills `128.89 / 32.75`; global CSS `38.77 / 8.67`
- Status: build + prerender pass (`8/8` routes). Ready for Milestone 1.

## 2026-10-14 — Milestone 1 (uncommitted, awaiting local test)
- Implemented: SmoothScrollProvider (Lenis + context), native CSS scroll-driven rail fallback, Reveal variants/stagger, Magnetic CTAs (submit + footer email), useSplitTextReveal on hero/page titles, skills stagger.
- Reduced-motion and hover gating added to all T2 features.
- Build: initial main 231.36 KB / 80.10 KB gz; vendor-motion 98.84 KB / 36.41 KB gz; global CSS 39.75 / 8.90 KB gz.
- Tests: 25/25 pass; prerender 8/8.
## 2026-10-14 — Tier 3 layer (uncommitted, awaiting local test)
- Implemented:
  - Motion `AnimatePresence` route transitions in `AppShell` (first-load safe via `ready` gate)
  - `ScrollToTop` route-change focus management for the main content region
  - Shared-element transition hook on project cards via `document.startViewTransition` + `flushSync`, gated to supported browsers/reduced-motion
  - Pinned, scrubbed project-shot motion on `ProjectDetail`
  - Contact form validation shake when submission fails
  - Resume panel reveal animation via CSS `animation-timeline: view()` where supported
  - View-transition CSS polish + reduced-motion fallback
- Build: initial main `264.94 KB / 91.46 KB gz`; vendor-motion `207.50 KB / 72.84 KB gz`; global CSS `40.63 / 9.12 KB gz`
- Tests: `25/25` pass; prerender `8/8`
- Pending local QA: route transitions, pin spacing/scroll, shared-element behavior, form shake, view-transition availability, CV reveal, reduced motion.

## 2026-10-16 — Springs + haptics layer (uncommitted, awaiting local test)
- Decision: shipped in working tree. Spring-first motion tokens, press physics on every tappable, haptics on meaningful taps. No new dependencies.
- Configuration:
  - CSS tokens (`tokens.css`): `--ease-spring-soft` (critically damped settle) / `--ease-spring` (micro-interaction overshoot) / `--ease-spring-bounce` (reserved, playful) / `--ease-out-exit` (accelerating leave). Every interactive transform/hover (buttons, nav links, work rows, theme toggle, burger, footer, chat controls) now settles on a spring curve.
  - JS mirror (`src/theme/motion.js`): motion-library presets; route boundary enter = spring (`stiffness 560 / damping 42 / mass 0.9`), route exit = 0.18s accelerating.
  - GSAP: split-text + skills reveals `power2/3.out` → `expo.out` (fast lead-in, long settle — the GSAP stand-in for critical damping).
  - Exits faster than enters: mobile menu 320ms exit / 440ms spring enter; chat fade-out 0.18s (enter 0.3s); route exit ≈ 0.18s vs spring enter.
  - Press physics: 0.9–0.97 spring scale on `:active` for every tappable (`style.css` "Press physics" block; chat controls in `Chatbot.css`).
  - Haptics (`src/lib/haptics.js`): `navigator.vibrate` on Android/Chrome; ~45ms, 5%-gain synthesized Web Audio "tick" as the iOS fallback, gated to touch pointers so desktop stays silent. One delegated capture-phase `pointerdown` listener installed once in `AppShell` fans out every `[data-haptic="light|medium|success|error"]` element (covers the mobile menu and chat window, which render later). Contact form calls `haptic("success" | "error")` when the async outcome actually resolves. 40ms throttle, disabled controls ignored. Unmute control: `HapticToggle` in the navbar (next to the theme toggle) — visible only on `(pointer: coarse)` devices, swaps `LuVibrate`/`LuVibrateOff` with the theme toggle's icon-pop, fires one demo buzz on unmute so the visitor feels what they enabled, and persists through the same `fjm-haptics` key.
  - Tap latency: `touch-action: manipulation` on interactive elements (removes the ~300ms double-tap-zoom wait).
- Intentional linear (CONSTRAINT comments in place — do not "fix"): nav scroll rail (`railFillNative`, `useScrollProgress`), resume panel `view()` reveal, `ProjectDetail` scrub tween (`ease: "none"`), submit spinner (`btnSpin`), `visibility` toggles (`step-end`).
- Measured (gz): initial main `268.53 KB / 92.65 KB gz` (Δ +3.59 / +1.19 vs Tier 3); global CSS `44.69 / 9.70` (Δ +4.06 / +0.58); vendor-motion unchanged `207.50 / 72.84`; Home `43.00 / 14.37`.
- Tests: `46/46` pass, including `src/lib/haptics.test.js` (17 tests: pattern mapping, throttling, opt-out, preference subscription, delegated taps, disabled controls, no-throw fallbacks) and `src/components/ui/HapticToggle.test.jsx` (4 tests: default state, mute persistence, silent mute, unmute demo buzz). Prerender `8/8`.
- Notes: a cold `npm test` shows a lazy-chunk timing flake in `App.test.jsx` (65s cold transform vs ~1s warm); warm reruns pass — pre-existing behaviour, unrelated to motion. Reduced-motion behaviour unchanged (spring presets collapse to `instant`; the global RM block still zeroes durations).

## 2026-10-16 — iOS nav pinning (platform hardening, uncommitted)
- Trigger: visitor report — "the navbar is being scrolled up when in mobile view".
- Diagnosis: not reproducible in Chromium. Headless-Chrome sweep (mobile emulation with touch metrics, wheel + Lenis, menu open/close, native + gesture scroll) kept the bar pinned at `top: 0` in every path, with zero layer traps on the ancestor chain. The failure signature instead matches WebKit #297779 / Apple forums FB19889436: on iOS 26, dismissing the on-screen keyboard can leave the visual viewport desynced (`visualViewport.height` / `offsetTop` never fully reset) and fixed elements then drift with momentum scroll until Safari is restarted. Fixed in iOS 26.1 Safari; WebKit-based browsers on earlier 26.x still show it.
- Changes:
  - Fixed bars no longer carry their own glass. `.nav` is visually transparent and promoted (`transform: translateZ(0)`); background + `backdrop-filter` + border moved to `.nav::before` with opacity as the only animated property. Same treatment for the menu: `.mobile-menu::before`. Also stops iOS 26 "Liquid Glass" toolbar tinting from sampling the bar's own background/filter.
  - `.mobile-menu` gets `touch-action: none`: mobile Safari ignores `overflow: hidden` on `<html>` for touch pans, so the page could scroll behind the open menu and drag the fixed bar along. Taps (links, toggles) are unaffected by `touch-action`.
  - `useViewportResync` (mounted in `AppShell`): after a keyboard-sized shrink→grow of `visualViewport`, performs a 1px scroll round-trip (forcing `scroll-behavior: auto` for the trip) — the accepted web-side nudge that makes WebKit re-sync the viewport. Debounced 200ms, skipped while the keyboard is still open, no-op without the Visual Viewport API.
- Verified: headless-Chrome sweep re-run — nav pinned in all paths; `::before` glass confirmed live (`opacity 0 → 1` on scroll, `blur(14px)` compositing page content behind the bar in screenshots); menu pan lock intact; open/close cycle clean. Build + prerender `8/8`.
- Measured (gz): initial main `269.36 / 92.90` (Δ +0.83 / +0.25 vs the springs entry); global CSS `44.84 / 9.71` (Δ +0.15 / +0.01).
- Tests: `50/50` pass (adds `useViewportResync.test.js`, 4 tests: no Visual Viewport API, keyboard cycle nudges exactly once, sub-keyboard viewport changes ignored, no nudge while the keyboard is still open).
- CONSTRAINT comments added in `style.css` (three) so the layered glass and the menu pan lock are not "simplified" back onto the fixed elements.
- Device caveat: full confirmation still needs a real iPhone. iOS 26.0 Safari carries the platform bug regardless of page code; 26.1+ removes it. On affected versions the bar now at least keeps the bottom border/glass and no longer amplifies the drift via its own filter.
