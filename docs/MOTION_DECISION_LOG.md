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
