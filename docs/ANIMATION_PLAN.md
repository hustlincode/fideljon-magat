# Interactive Animation Roadmap — FJM Portfolio

**Status:** Draft (scope to lock before implementation)
**Created:** 2026-10-14
**Baseline build:** Vite production build (Oct 2026, before animation phase 2)
**Chosen direction (from scoping session):** GSAP + Motion (Framer Motion) + Lenis + subtle cursor
affordances only.

## 0. One-line summary

Keep the existing dependency-light Tier 1 layer intact, then add a **tiered motion
system**: Lenis + GSAP for narrative scroll/text motion, Motion for React UI, all
behind a stricter `prefers-reduced-motion` gate and a measurable performance
budget. No full custom cursor; magnetic hover on primary CTAs only.

## 1. Baseline inventory (what already ships)

Tier 1 (commit `ac9be8d1`) is already live and must remain the performance
floor:

| Piece | File | Notes |
|---|---|---|
| Ambient particle field w/ cursor repulsion + web | `src/components/Particle.jsx` | rAF, pointer tracking |
| Section reveals via IntersectionObserver | `src/components/Reveal.jsx` | 12% threshold, 48px rootMargin |
| Hero typo rise + aurora drift | `src/style.css` (`.rise`, `.hero`) | CSS keyframes, 38s aurora |
| Segmented nav scroll rail | `src/components/Navbar.jsx`, `useScrollProgress.js` | rAF CSS var `--scroll-progress` |
| Work-row hover preview (lerped) | `src/components/Projects/Projects.jsx` | ref-driven, no re-render |
| Submit morph (idle/sending/sent) | `src/components/Home/ContactForm.jsx` | self-drawing check |
| Hooks | `usePrefersReducedMotion.js`, `usePointerTracking.js` | hydration-safe, gated |
| Motion tokens | `src/theme/tokens.css` | `--ease-spring`, `--dur-slow` |

Baseline technical constraints carried forward:

- Prerender (SSR) routes generate static HTML in `scripts/prerender.mjs`; motion
  must be client-only.
- Dark/light theme via `data-theme` on `:root`; accent `--accent` is recomputed
  at runtime (canvas particle does this).
- No `motion`/`gsap`/`lenis` installed yet.
- Build result (before phase 2), gzipped:
  - `index-*.js` (app shell + main): **236.48 KB / gzip 81.53 KB**
  - `Home-*.js`: 42.64 KB / gzip 14.24 KB
  - `Skills-*.js`: 128.84 KB / gzip 32.73 KB
  - `index-*.css` (global): 38.77 KB / gzip 8.67 KB
  - `resume` chunk (PDF.js): 479 KB / gzip 129.55 KB (already lazy).

## 2. Research synthesis (2025–2026 trends applied)

Source synthesis: HTTP Archive Web Almanac 2024–25, State of JS 2025, Annnimate
State of Web Animation 2026, MDN scroll-driven animations, GSAP docs, portfolio award
roundups (Awwwards/Orpetron), css-scroll-driven.com reference.

### What the data says

- **91.7%** of mobile pages use a CSS transition, but **only 18.4%** load any JS
  animation library. Crafted motion is now a *differentiator*, not a default.
- CSS scroll-driven animations reached **~85%** browser support (Safari 26,
  Sep 2025) — use them as **progressive enhancement**, not as the only path.
- **prefers-reduced-motion** adoption jumped from 34% (2022) to **50%+ mobile**
  (2024) — the most-adopted user-preference query. Non-negotiable to honor it.
- Performance budget: only **48%** of mobile origins pass all Core Web Vitals;
  INP is good on 77% mobile vs 97% desktop. Animation threatens INP first.
- **40%** of mobile pages ship non-composited (jank-prone) animations — must
  stay on `transform`/`opacity`.
- GSAP went free incl. all plugins in April 2025 and is the standard for
  scroll-driven/timeline work (~2.2% of all sites).
- Motion (ex-Framer Motion, ~33.5M weekly npm downloads, partly transitive) is
  the React-idiomatic default for UI enter/exit/layout.
- Lenis is the smooth-scroll layer paired with GSAP ScrollTrigger in modern
  portfolios.
- Award-winning portfolio language in 2026: cinematic scroll storytelling,
  split-text reveals, magnetic cursor, shared-element route transitions, FLIP
  layout morphs, magnetic CTAs, subtle character on 3D WebGL. Restraint (Eszter
  Bial's portfolio pattern) remains the strongest "premium" signal — motion must
  earn its place.

### Trend → this portfolio mapping

| Trend | Fit for FJM portfolio | Tier |
|---|---|---|
| Native scroll-driven (CSS) progress/badges | Replace some rAF-driven progress | 2 |
| GSAP SplitText section/hero reveals | Upgrade `.rise` + `Reveal` headings | 2 |
| Lenis smooth scroll | Global foundation | 2 |
| Magnetic CTA hover | Theme toggle + Send button | 2 |
| Pin + scrub project shots | Project detail hero reveal | 3 |
| Shared-element route transition (FLIP/View Transitions) | Work row → detail image | 3 |
| Motion AnimatePresence route transitions | Page-level fade/slide | 3 |
| Custom cursor (spring follower + labels) | Rejected full; subtle magnetic only | — |
| 3D/WebGL hero | Optional stretch, not in this budget | 4 |
| Lottie vector accents | Optional delight | 4 |

## 3. Goals, non-goals, constraints

### Goals
- Raise the "craft" tier (scroll/text/route motion) without breaking SEO or
  prerender.
- Keep reduced-motion users on a fully static, identical-information layout.
- No regression in Lighthouse Performance (target: keep ≥ current, do not let
  mobile Performance drop below 85 after phase 2/3).
- Add at most **~25 KB gz total** to the *initial* (route 0) JavaScript bundle
  in the final phase; everything else route- or interaction-scoped.
- Motion must be testable on `prefers-reduced-motion: reduce` and on
  small/touch viewports (disabled or simplified).

### Non-goals (this plan)
- No 3D/WebGL scene, no Rive character, no video-frame scrubbing.
- No full custom cursor hiding native pointer.
- No motion for chatbot typing (DeepSeek responses stay instant).
- No DevOps changes beyond a `manualChunks` addition.

### Constraints carried through
- React 18.3, Vite 5, React Router 6, prerender via `entry-server.jsx`.
- React Router route-level code splitting already exists (lazy imports).
- Hosted on Vercel; function cold starts unaffected.
- Tailwind is **not** used; styling is custom CSS in `src/style.css`.
- Accessibility: existing `:focus-visible`, `aria-hidden` patterns must remain.

## 4. Load strategy (budget control)

1. **App shell (initial, always):** Lenis init + Motion `motion` only behind a
   dynamic `import("lenis")` resolved post-mount; Motion `AnimatePresence`
   imported in the app shell but tree-shaken to core + presence APIs.
2. **GSAP family:** lazy `import("gsap")` + `import("gsap/ScrollTrigger")` +
   `import("gsap/SplitText")` inside per-page `useEffect` (Home, About,
   Projects, ProjectDetail). Exposes one `useGsapContext(scopeRef)` helper that
   registers `gsap.context` for cleanup on unmount.
3. **@gsap/react `useGSAP`** for component-scoped clean restarts on route
   change.
4. **Motion components:** use `motion` only on components that actually animate
   (route transitions, magnetic CTA, shake). Avoid global `<AnimatePresence mode>`
   wrapping every modal; only route boundary.
5. **Payload guard:** add `rollupOptions.output.manualChunks` in Vite to keep
   `gsap`, `motion`, `lenis` in a dedicated `vendor-motion` chunk imported only
   where used; block CI if initial chunk gzip > budget.

## 5. Proposed tier structure

### Tier 2 — Foundation (ship first; low risk, visible quality)

| ID | Feature | Surfaces | Primary lib | Effort | Risk |
|---|---|---|---|---|---|
| 2.1 | Lenis smooth scroll provider (`SmoothScrollProvider`) | AppShell | Lenis | 0.5d | Low (iOS inertia) |
| 2.2 | CSS native scroll-driven progress rail upgrade | `Navbar` rail | CSS spec | 0.5d | Low (fallback present) |
| 2.3 | Section-heading split-text reveal (words/chars) | Home hero h1, page heads | GSAP SplitText | 1d | Med (hydration) |
| 2.4 | Copy `Reveal` enhancement: staggered children, scale/blur option | `Reveal.jsx` | CSS + small JS | 0.5d | Low |
| 2.5 | Magnetic primary CTA | Contact Send, Footer email, Hire me | Motion or pointer rAF | 1d | Low |
| 2.6 | Intersection-driven skill group stagger | About `Skills` | GSAP timeline | 0.5d | Low |
| 2.7 | Reduced-motion audit hook in all of T2 | all T2 | `usePrefersReducedMotion` | 0.5d | Low |

Exit criteria T2: Lighthouse desktop ≥ current, mobile Perf ≥ 85, no CLS > 0.1,
reduced-motion fully static, no console warnings.

### Tier 3 — Signature (requires GSAP/Motion discipline)

| ID | Feature | Surfaces | Primary lib | Effort | Risk |
|---|---|---|---|---|---|
| 3.1 | Motion route transitions (fade + slide, AnimatePresence) | `AppShell` | Motion | 2d | Med (router) |
| 3.2 | Shared-element transition (work row → detail shot) | Projects/ProjectDetail | View Transitions API + CSS, Motion fallback | 2d | Med/High |
| 3.3 | Pinned project-detail hero shot w/ scrubbed scale+parallax | `ProjectDetail` | GSAP ScrollTrigger pin | 1.5d | Med |
| 3.4 | Horizontal pinned scrub for project index (opt-in experiment) | `/project` | GSAP ScrollTrigger pin | 2d | High |
| 3.5 | Form validation shake + field focus spring borders | `ContactForm` | Motion | 1d | Low |
| 3.6 | Footer email magnetic trailing icon + subtle mass | `Footer` | pointer rAF | 0.5d | Low |
| 3.7 | Scroll-driven CV preview (zoom on resume page) | `Resume` | GSAP ScrollTrigger | 1d | Med (PDF perf) |
| 3.8 | Route change focus management (a11y) | `ScrollToTop` | React | 0.5d | Low |

Exit criteria T3: INP p75 ≤ 200ms on mobile emulator throttling; route transitions
≤ 300ms; reduced-motion instant swap; no lost history/back behavior.

### Tier 4 — Delight (optional, budget-gated)

| ID | Feature | Notes |
|---|---|---|
| 4.1 | Lottie accent (success check on form, empty states) | `lottie-web` already installed |
| 4.2 | Particle field deep-link (route-specific density/color variant) | Minor |
| 4.3 | Typography marquee (footer stack) | CSS-only infinite marquee |
| 4.4 | Theme toggle full-swap transition | View Transitions API |
| 4.5 | Optional WebGL hero accent | Only if all budgets met |

## 6. Implementation order and milestones

```
M0  Baseline + tooling                 0.5d
    - Install gsap, @gsap/react, motion, lenis (dev + prod deps)
    - Add vite.config `manualChunks`, record budgets in CI
M1  Tier 2 foundation                 2.5d  (2.1, 2.2, 2.4, 2.6, 2.7)
M2  Tier 2 hero/text + magnetic       1.5d  (2.3, 2.5)  + performance gate A
M3  Tier 3 core + route transitions   4d    (3.1, 3.3, 3.5, 3.6, 3.8)
M4  3.2 / 3.4 / 3.7 experiments      4d    (risk-gated, each behind a flag)
M5  Tier 4 optional                   1–3d  (only if budgets green)
M6  QA, a11y, perf, docs              2d
```

Total estimated: **~14–18 developer-days**. Recommend shipping T2 alone first
(Tier 1 → Tier 2 = +4d) and reviewing before unlocking T3.

## 7. New files / file map

```
src/
  providers/
    SmoothScrollProvider.jsx      (Lenis lifecycle + ScrollTrigger sync hook)
  hooks/
    useGsapContext.js            (gsap.context wrapper, cleanup)
    useMagnetic.js               (magnetic hover spring-ish, rAF)
    usePageTransition.js
  components/
    ui/
      Magnetic.jsx               (wrapper)
      MotionText.jsx             (SplitText-enhanced heading)
    PageTransition.jsx           (Motion AnimatePresence entry/exit)
  styles/
    motion.css                  (scroll-driven + view-transition rules)
docs/
  ANIMATION_PLAN.md              (this file)
  MOTION_DECISION_LOG.md         (append as choices land; to create)
```

Existing touched: `App.jsx`/`AppShell`, `Navbar.jsx`, `Hero.jsx`, `Intro.jsx`,
`Projects.jsx`, `ProjectDetail.jsx`, `ContactForm.jsx`, `Footer.jsx`, `Reveal.jsx`,
`style.css`, `vite.config.js`.

## 8. Accessibility requirements (apply to every feature)

- Every motion hook reads `usePrefersReducedMotion`; CSS animations guarded by
  the existing `@media (prefers-reduced-motion: reduce)` block in `style.css`.
- Lenis disabled entirely when reduced motion or touch-only is detected (use
  native scroll).
- Route transitions collapse to instant when reduced; `ScrollToTop` still runs.
- Text splitting must keep the semantic text intact (aria label or `aria-label`
  the original string) and not break screen-reader reading order.
- Pinned sections (`ScrollTrigger pin`) get focus moved to the pinned container's
  first focusable on entry, and `Tab` must escape the pinned region without
  invisible focus.
- No animation that autoplays for >5s (particle field already pauses hidden).
- Ensure no `outline` removal and keep `:focus-visible` overrides after Lenis
  (Lenis can sometimes absorb native focus scroll — test).

## 9. Performance & testing plan

### Budgets (to enforce in CI)
- Initial route-0 JS: **≤ 95 KB gz** after T2; **≤ 110 KB gz** final.
- Motion chunk (`vendor-motion`): may be **≤ 35 KB gz**, lazy-loaded per route.
- INP (mobile throttling, 4x CPU, Fast 3G): **≤ 200ms p75**.
- CLS: **≤ 0.1**, LCP: **≤ 2.5s** on mobile.
- Lighthouse Performance (mobile): **≥ 85**; Accessibility **≥ 95**.
- `npm run build` main chunk not growing >5% without a documented reason.

### Automated
- Keep `vitest run` (14 current tests + new hook tests:
  `useGsapContext`, `useMagnetic`, smooth-scroll disable under reduced motion).
- Add a small "motion budget" check script reading Vite manifest gzip sizes.
- Add Reduced-motion test component snapshot under jsdom (matchMedia mock).

### Manual checklist (required before each tier ships)
1. `prefers-reduced-motion: reduce` toggle in Chrome + Windows setting.
2. `@media (hover: none)` mobile emulation + real device.
3. Keyboard-only navigation across route changes.
4. Lighthouse (Perf/A11y/SEO) on throttled mobile.
5. DevTools Performance trace: no forced layout during scroll.
6. SSR output equality: prerendered HTML unchanged by animation (no hydration
   warning in console).

## 10. Risks and mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Hydration mismatch from motion initial state | High | Gate all JS animation behind `useEffect`/`useGSAP`; server HTML stays static |
| Bundle blow-up (~+50KB) | High | manualChunks, per-route lazy GSAP, budget gate |
| ScrollTrigger stale instances on route change | Med | `useGsapContext` cleanup + ScrollTrigger.refresh on route |
| Lenis conflicts with React Router scroll-to-top | Med | Centralize scroll in Lenis; update `ScrollToTop` to use `lenis.scrollTo(0)` |
| Pinning trapping keyboard focus | Med/A11y | Focus move + escape test in T3 |
| iOS smooth scroll rubber-band | Low | Lenis iOS-specific flags + disable flags on reduced/touch |
| SEO/perf regression | Med | Build size + Lighthouse gates before each ship |
| Over-animation (cheap/AI-looking) | Brand | Review each feature vs. "does visitor understand/do better?" |

## 11. Success metrics

- Perceived craft: Awwwards-style micro interactions land on hover and scroll
  without "animation for animation's sake".
- No measurable drop in mobile Performance (>5 points) vs baseline 85-ish
  Lighthouse.
- All sections remain legible and informative with motion disabled.
- Bundle initial gz still under 110 KB.
- Positive feedback from portfolio visitors / recruiters (qualitative).

## 12. Decision lock (locked 2026-10-14)

1. **Ship scope:** T2 + T3 in one implementation cycle (Motion/GSAP/Lenis foundation
   included).
2. **Projects index:** stay vertical; scrubbed clip-path reveals only (no
   horizontal pin).
3. **Shared-element transition:** View Transitions API first, with progressive
   enhancement fallback.
4. Optional Tier 4 only after Lighthouse ≥ 90 and bundle budget green.

See `docs/MOTION_DECISION_LOG.md` for per-feature approvals as work lands.

---

*This plan is code-free by design; no application code has been modified.*
