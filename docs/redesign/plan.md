# Redesign plan — FJM Portfolio v2 ("Restraint & Signals")

**Status:** proposal — no app code has been modified. Implementation awaits Fideljon's approval.
**Date:** 2026-10-18 · **Branch context:** `css_architecture` · **Inspiration dossier:** `docs/evidence/inspiration/marwieang/design-context.md`
**Decision log (raw jev output):** `docs/redesign/jev-decisions.json` · **Scripts:** `docs/redesign/scripts/`

---

## TL;DR

The live site already carries most of marwieang's DNA — dual theming with system default + `fjm-theme`, grain (`style.css:36`), an availability chip, Instrument Serif italic accents, project count badge, editorial eyebrows, a crafted boot overlay, and serious motion machinery (springs, view transitions, haptics).

So this is **not** a rebuild. Three moves, in order:

1. **Restraint pass** — the orange accent appears 34× in `style.css` (plus washes); make it rare and deliberate, and fix a real contrast bug in light mode.
2. **Signals layer** — add the two marwieang patterns the site lacks: a **stat row** and **1–2 message cards**.
3. **Quiet-down** — remove the floating particle layer and the endless aurora drift; keep every *signature* interaction.

---

## 1. Current system (measured, not guessed)

### Tokens (`src/theme/tokens.css`)

| Token | Dark | Light |
|---|---|---|
| `--bg-primary` | `#0a0a0a` | `#fafaf8` |
| `--bg-secondary` | `#121212` | `#f0f0ee` |
| `--bg-tertiary` | `#1a1a1a` | `#e7e7e4` |
| `--text-primary` | `#f5f5f3` | `#0f0f0f` |
| `--text-secondary` | `#9a9a96` | `#6b6b68` |
| `--border` | `#242424` | `#e2e2de` |
| `--accent` | `#ff8f3a` | `#f48d2c` |
| `--accent-strong` | `#dc690b` | `#da7400` |
| aurora / grain | `--aurora-a/b/c`, `--grain-opacity 0.05` | same tokens, grain `0.04` |

**Type:** Inter (400/500/600) + Instrument Serif italic accents · body `16px / 1.7` · `.display-hero` `clamp(3rem, 9vw, 7.75rem)` · `.display-1` `clamp(2rem, 4.5vw, 3.25rem)` · eyebrow `11px / 600 / 0.18em`.
**Layout:** `.container-x` max-width 1280 · `.section` padding `clamp(88px, 14vh, 160px)`.
**Motion:** spring presets (`gentle/snappy/bouncy/route`) + eased tokens; hero aurora drift `38s infinite`; particles layer; Lenis; split-text; magnetic hover; shared-element view transitions; tap haptics.

### Contrast audit (WCAG, computed)

| Pair | Ratio | Verdict |
|---|---|---|
| `#ff8f3a` on `#0a0a0a` (accent, dark) | **8.71:1** | AA text ✓ |
| `#f48d2c` on `#fafaf8` (accent, light) | **2.31:1** | ⚠️ decorative only |
| `#da7400` on `#fafaf8` (accent-strong, light) | 3.10:1 | large / UI only |
| `#dc690b` on `#0a0a0a` (accent-strong, dark) | 5.72:1 | AA text ✓ |
| `#9a9a96` on `#0a0a0a` (secondary, dark) | 7.01:1 | ✓ |
| `#6b6b68` on `#fafaf8` (secondary, light) | 5.12:1 | ✓ |
| `#f5f5f3` / `#0f0f0f` primaries | 18.1 / 18.3:1 | ✓ |

**Finding:** small accent-colored *text* is illegal in light mode today (`#f48d2c` = 2.31:1). Fix: introduce a text-safe accent token (below).

---

## 2. Gap analysis vs marwieang

**Already present (do not change):** dual theme w/ system default + `fjm-theme`; grain; availability chip (`.status-chip` + `.status-dot`); serif-italic accent words; count badge (`work-count "(NN)"`); editorial eyebrows (`01 — Intro`); hairline borders; pill radius; link-sweep hover; boot personality; GitHub calendar; motion craft.

**Missing / weak (this plan):**

- Stat row with arrow links — hero has meta labels, but no clickable proof numbers.
- Message cards — marwieang's best transferable pattern; absent here.
- Accent restraint — 34 `var(--accent*)` refs; big washes; orange competes with content.
- Calm under motion — particles + aurora drift + many simultaneous staggers.
- Light-mode accent text token — see contrast finding.
- "View all" affordance next to the project count (minor).

---

## 3. Decisions (jev-assisted)

Method: `jev_find` via `@jkudish/jev-mcp` (direct stdio) → provider `openrouter`, model **`typesafe/jev-1.14-20261014`**. Raw output: `docs/redesign/jev-decisions.json`. Runner: `docs/redesign/scripts/jev-find-run.js` (needs `OPENROUTER_API_KEY`; in this session the key was injected from the User registry because the long-running OpenCode service predates it).

| # | Decision | Result | Probabilities |
|---|---|---|---|
| D1 | Redesign scope | **targeted restraint + signals pass** | 1.00 (full-reskin 0, additive-only 0, sidebar-shell 0) |
| D2 | Motion policy | **quiet-down** | 0.98 (consolidate 0.02, full-keep 0, full-calm 0) |
| D3 | Message-card content | **availability** + **current-role** | 0.49 + 0.40 (journey 0.06, spotlight 0.05) |

D3 is a soft split — the two cards serve different jobs, so both are specced; final copy is Fideljon's call.

---

## 4. Specs

### 4.1 Restraint pass (P1)

**Accent budget — orange is allowed in:** wordmark dot · hero headline period · status dots (chip, card) · small hover/active affordances (link-sweep underline, arrow nudges, focus ring contexts) · max one CTA accent per region · boot overlay.
**Not allowed:** orange body copy (especially light theme) · multiple glows per viewport · aurora outside the hero.

**New token `--accent-ink`** (text-safe accent, in `tokens.css` both themes):

- dark: `#ff8f3a` (8.71:1 — unchanged, already safe)
- light: `#c2410c` (**4.96:1** on `#fafaf8` and **4.54:1** on `#f0f0ee` — validated)

Audit the 34 `var(--accent*)` references in `style.css` **and** `src/Chatbot.css`; any that render small text on light surfaces switch to `var(--accent-ink)`. Keep `--accent` for decorative/large uses.

**Aurora:** remove the drift — delete the `animation: hero-aurora …` declaration (`style.css` ≈ line 806); keep the three static radial gradients as a hero-only backdrop; keyframes become unused (delete or keep with a comment). No other aurora consumers exist in `style.css`.

**Grain:** already live (`style.css:36`). Verify only: opacity `0.05/0.04` per theme, layer sits above background and below content.

**Quiet-down (D2):** remove the particle layer in **both** mounts — `src/App.jsx` (`import` line 10 + `<Particle />` line 147) and `src/components/About/Skillset.jsx` (import line 3 + `<Particle />` line 11). Leave `src/components/Particle.jsx` on disk (unused) as a follow-up cleanup candidate. After this, the only endlessly-looping animation is the typewriter. No global duration changes — audit only over-eager staggers during QA.

### 4.2 Stat row (P2) — `src/components/Home/Stats.jsx` (new)

Placement: `Home.jsx`, directly after `<Hero />` (below the fold, like marwieang's stats under the hero bio).

Markup sketch (follows existing conventions — `container-x`, `Reveal`, `data-haptic`, inline arrow SVG `M7 17 17 7M8 7h9v9`, `link-sweep`):

```jsx
<section className="stats" aria-label="At a glance">
  <div className="container-x stats-grid">
    <a className="stat link-sweep" href="/#work" data-haptic="light">
      <span className="stat-value">03</span>
      <span className="stat-label">Projects shipped</span>
      <svg className="stat-arrow" aria-hidden="true" … />
    </a>
    <a className="stat link-sweep" href="/resume" data-haptic="light">… years building …</a>
    <a className="stat link-sweep" href="/#skills" data-haptic="light">… technologies …</a>
  </div>
</section>
```

CSS: 3-column grid (stacks on mobile), cardless numbers (marwieang style), `.stat-value` ~`clamp(1.6rem, 3vw, 2.2rem)/600` with tabular numerals, `.stat-label` eyebrow-style (11px, muted), arrow nudges on hover. Static; no new motion.

**Values — confirm with Fideljon:**

- Years: `2+` (professional since 2024) or `4+ / 5` (first code 2021) — pick the honest framing;
- Projects: `PROJECTS.length` (currently **3** — salesportal, xolf, slfreemed) — data-driven;
- Technologies: **13** (Stack 7 + Tools 6, from `Skills.jsx` GROUPS) — label wording TBD.

### 4.3 Message cards (P3) — `src/components/ui/MessageCard.jsx` (new)

Pattern: full-width inside `container-x`, radius 16px, tinted background + 1px tinted border, small icon left, bold title, muted support line, arrow ↗ right; the whole card is one link; hover: border sharpens, arrow nudges. Respects reduced-motion (static). `data-haptic="light"`.

**Card A — availability (primary, after `<Stats />`, before `<Intro />`):**

- Title: `Open to opportunities`
- Support: `Full-time or freelance — Angeles City, PH · remote-friendly · replies within a day.`
- CTA: `Start a conversation` → `/#contact`
- Tone: accent tint + green status dot (reuse `.status-dot`).

**Card B — current role (secondary, optional, between `<Projects />` and `<Skills />`):**

- Title: `Building hospitality systems at Servo IT Solutions OPC`
- Support: `Turning manual workflows into shipped platforms since 2024.`
- CTA: `View résumé` → `/resume`
- Tone: green tint.

Tint recipes (compatible with both themes, in the spirit of the existing `--aurora-*` tokens):

- accent: bg `rgba(255,143,58,.06)` / `rgba(244,141,44,.08)` (dark/light), border `rgba(255,143,58,.22)` / `rgba(244,141,44,.30)`
- green: bg `rgba(63,191,111,.06)` / `rgba(63,191,111,.09)`, border `rgba(63,191,111,.20)` / `rgba(63,191,111,.28)`

### 4.4 Micro-craft (P4, optional)

- `work-head`: make the count a link — `View all ↗` next to `(03)` → `/project`, reusing `link-sweep`.
- Nothing else. The personality budget is already spent well (typewriter + haptics + boot overlay).

---

## 5. Phases

| Phase | Tasks | Files | Done when |
|---|---|---|---|
| **P1 Restraint** | add `--accent-ink`; audit accent refs; aurora static; unmount particles (2 mounts) | `theme/tokens.css`, `style.css`, `App.jsx`, `About/Skillset.jsx`, audit `Chatbot.css` | both themes checked @375/1440; `contrast.js` shows every small-text accent ≥4.5:1; no endless loops besides the typewriter |
| **P2 Stats** | new component + placement + CSS | `Home/Stats.jsx` (new), `Home/Home.jsx`, `style.css` | 3 stats render; links route; mobile stacks; reduced-motion safe |
| **P3 Cards** | new component + up to 2 placements + CSS | `ui/MessageCard.jsx` (new), `Home/Home.jsx`, `style.css` | hover states; links route; text contrast on tints ok |
| **P4 Polish + QA** | view-all link; tests; build | `Projects/Projects.jsx`, `style.css` | `npm test` green (App/Navbar/VisitorCount/HapticToggle); `npm run build` (prerender) green; before/after evidence captured |

Each phase is shippable on its own. Order: P1 → P2 → P3 → P4.

---

## 6. Guardrails

- **Do not touch:** hero copy (parity evidence exists), `fjm-theme` key + boot script + `ThemeContext`, the boot overlay in `index.html`, motion token values & spring presets (single source of truth), view-transition logic, haptics install.
- New components must respect `usePrefersReducedMotion`.
- No new dependencies.
- Keep the existing test files green; verify nothing references `<Particle />` before unmounting (currently: only `App.jsx` + `Skillset.jsx` — no tests).
- Accent audit must include component-level CSS (`src/Chatbot.css`, any co-located styles).

## 7. Open questions (for Fideljon)

1. Stat values: years wording (`2+` professional vs `4+/5` since 2021), and the third stat's label.
2. Card copy approval — and do you want Card B (Servo role) at all?
3. OK to remove the floating particle layer? (jev quiet-down recommends; easily reversible)
4. Any achievement to feature (certifications, Dean's list, hackathon)? Could become a third card or join the stat row.
5. Implement P1–P4 on `css_architecture`; deploy when? (Note: `0a7d56b` — the `.opencode` untrack commit — is still unpushed.)

## 8. QA / evidence recipe

- **Before/after captures:** rea `capture_browser_scenario` at 1440×900 and 375×812 in **both themes** (light via Playwright default; dark via capture-time `Emulation.setEmulatedMedia` or a `fjm-theme` localStorage injection before navigation) → decode to `docs/evidence/redesign/`. Screenshots stay local per `.gitignore`; text DOM/a11y artifacts can be committed.
- **Scripts** (`docs/redesign/scripts/`): `contrast.js` (token pairs), `accent2.js` (accent-ink candidates), `style-peek.js` (rule dump), `jev-find-run.js` (decision runner).
- **jev reruns:** inject the key first in a fresh shell — `$env:OPENROUTER_API_KEY = [Environment]::GetEnvironmentVariable('OPENROUTER_API_KEY','User')`.

---

## 9. Implementation status — 2026-10-18

Answers to §7: (1) `2+` professional since 2024; (2) keep Card B; (3) yes, remove
particles; (4) no achievements; (5) ship in phase order — done.

Shipped on `css_architecture`:

- **P1 Restraint:** `--accent-ink` added (`#ff8f3a` dark / `#c2410c` light);
  the 16 `color: var(--accent)` text usages switched to `--accent-ink`; the
  `:focus-visible` outline switched too (2.31:1 → 4.96:1 in light); aurora
  drift removed — gradients stay, keyframes + theme duration blocks deleted;
  particle layer unmounted from `App.jsx` and `About/Skillset.jsx`
  (`Particle.jsx` kept on disk). `Chatbot.css` audit: **no change needed** —
  `.chat-window` re-declares its own dark glass palette including `--accent`.
- **P2 Stats:** `Home/Stats.jsx` + `.stats*` rules; values `03` (data-driven
  `PROJECTS.length`), `2+`, `13`; 3-column grid, stacks ≤560px; static.
- **P3 Cards:** `ui/MessageCard.jsx` + `.message-card*` rules; Card A
  (accent + green dot) after `<Stats />`; Card B (green, Servo role) between
  `<Projects />` and `<Skills />`; copy exactly per §4.3.
- **P4:** work-head count is now `View all (03) ↗` → `/project` on the home
  listing (plain count on `/project` itself); tests 7/7 files green; build +
  prerender 8/8 routes; after-captures in `docs/evidence/redesign/`
  (PNGs ignored; text evidence + sha256 committed).

Deviations from the §4.2 sketch: `.stat`/`.message-card` do **not** use
`link-sweep` (it forces `display: inline-block` and fights the flex layouts);
they use arrow-nudge + color-shift hover instead. Nothing else diverged.

Still open: pushing `0a7d56b` + the implementation commits; optional history
purge for `.opencode`; rotating the exposed OpenRouter key.

---

## 10. Theme revamp status — 2026-10-18 (branch `theme-revamp`)

Scope answers: everything including the shell; go full marwieang; implement
now and iterate against built previews. Supersedes the targeted-pass mandate
(jev D1 `targeted-pass` is overridden by the user, p=1.00).

Shipped on `theme-revamp` (from `3403b55`):

- **Tokens (`src/theme/tokens.css`):** marwieang palette both themes — paper
  light `#fcfcfb` / ink `#17171a` / dark `#0f0f11` / light ink `#ececee`;
  `--accent`/`--accent-ink`/`--accent-strong` intentionally **drained to ink**
  (no chromatic UI accent anywhere); new `--brand` / `--brand-ink` carry the
  only orange sparks (wordmark dot, hero period, typewriter caret, selection);
  new `--green`, `--sidebar-*` paper tokens, `--radius-shell`, `--sidebar-width`,
  `--shell-gap`; `--nav-height` reduced to 64px (mobile bar). Aurora tokens
  deleted.
- **Type:** Figtree (sans) + Newsreader (serif italic accents) replace Inter +
  Instrument Serif in `index.html` (fonts link, boot overlay recolor, dual
  `theme-color` metas).
- **Shell:** new `src/components/Sidebar.jsx` (replaces `Navbar.jsx` +
  `Navbar.test.jsx`; tests ported 1:1 to `Sidebar.test.jsx`, all green). Desktop
  ≥1024px: fixed 264px paper sidebar (stays light in both themes) with wordmark,
  collapse control (persisted in localStorage `fjm-shell`), Contact pill, three
  grouped nav sections with count badges (`Projects 03`, `Skills 13`),
  visitor counter (single instance, note below), live `GMT+8 · HH:MM` chip,
  theme + haptic toggles, GitHub/LinkedIn icon buttons. Collapsed state shows a
  floating expand button. `<1024px`: glass top bar (burger, name, mini status
  pill) + slide-in paper drawer with the same contents; drawer sits above the
  chat launcher (z-index 10000 > 9999).
- **Column:** `.container-x` is now a ~640px editorial column; all sections
  restyled quietly (eyebrows, `display-1`/`display-hero` sizes down to 1.3–2.3rem,
  hero is a profile intro — name + serif typewriter role + lead + status chip +
  "↓ More about me", no display/outline treatment, no aurora).
- **Components:** `MessageCard` reworked to marwieang banner anatomy
  (colored micro-label, title, support, arrow; tones `green`/`blue`; pastel
  cards stay light in BOTH themes by design). Stats: inline ↗ arrows, 3-across
  even on phones. Work rows, skills, contact, footer (icon-only social squares)
  all drained. GitHub calendar uses an ink scale. Chatbot keeps its dark glass
  but its local accent is neutralized.
- **Prerender marker:** `/` marker changed from `FIDEL JON` (uppercase display
  heading no longer exists) to `Professional since 2024`.

Verification: 50 tests green (incl. ported drawer a11y tests), build +
prerender 8/8 routes; CDP captures at 1440×900 and 375×812 in both themes
(`docs/evidence/redesign/revamp/`, PNGs ignored, text evidence committed).

Deviations from the marwieang reference: 6 nav links grouped 2/2/2 instead of
4 groups; no avatar (name carries the identity); visitor counter lives in the
desktop sidebar only — `useVisitorCount` increments once per session and must
not be mounted twice; brand spark kept for FJM identity (marwieang has none).

Still open: user review of the built result; pushing `css_architecture`
commits; optional `.opencode` history purge; rotating the exposed key.
