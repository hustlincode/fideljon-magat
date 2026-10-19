# Design context — www.marwieang.com ("Mar Wie Ang · Software Developer")

Captured 2026-10-18 with rea (headless Chrome 154) + a CDP computed-style supplement, for portfolio inspiration.
Study the *approach* — don't copy assets or content.

## Evidence manifest

| Artifact | Content | sha256 (full) | bytes |
|---|---|---|---|
| `home-1440.png` | Desktop screenshot 1440×900 (light) | `6bb5cbaddfbe409b94ba4cd10bcaf69fc4b77687d27bac062de876907ccdec17` | 554,070 |
| `dom-1440.html` | Serialized DOM 1440 | `05295d10ed61c0aa82090deb0b1283daf50564d585e44b988f5be38c1651b136` | 138,602 |
| `artifact-1440-1-cb94218e.txt` | Accessibility tree 1440 | `cb94218e81116f7b87a5f7809f36a49aa65974afb50fa5f6296faaec6fd80d5f` | 6,388 |
| `home-375.png` | Mobile screenshot 375×812 (light) | `8cdeee7a1fdd7ea15586e9ce5d37053fdab60c6cd9344e0602bfb90f4ea968da` | 197,820 |
| `dom-375.html` | Serialized DOM 375 | `1eb5f17890932d805bd31254f07250e343ebc4d20e09da1d83963a5443a2e068` | 138,601 |
| `artifact-375-1-9778cf94.txt` | Accessibility tree 375 | `9778cf94537cfb123caf2e64a8b4bd26d60d255828086f6d7fab98a3d943966e` | 6,489 |
| `design-tokens-1440.json` / `design-tokens-375.json` | Computed-style dumps (captured in **dark** scheme — see Theme) | — | ~9.6 KB each |

- rea evidence ids: desktop `ev_9ef64cf46f99c76d51d6dcc3affce6ac05d57fa500e0cfcab558a3c434149ee0`, mobile `ev_0f0220ccff7e231002a9e2c92de64e00a4c2aa7cfc60c78a6abe917f3972ddd0`.
- Scripts used: `scripts/cdp-design-tokens.js` (token dump), `scripts/css-theme.js`, `scripts/css-theme2.js` (CSS variable extraction).
- Source: all component CSS bundles into one 48 KB Next.js immutable chunk (`/_next/static/immutable/chunks/11k8o9ylu3lcd.css`).

## Design thesis (one paragraph)

Editorial-minimal **"personal dashboard"**: a floating light "paper" sidebar card (264 px — the app-shell of a docs tool) sits on a grain-textured off-white canvas; one variable sans (Figtree) does nearly all the talking in muted grays; a reserved italic serif (Newsreader) exists as an accent voice. All color is drained except pastel "message" cards (soft blue gradient event card, pale green award card) that use pixel-art mascots and counts. Personality doesn't come from decoration — it comes from **micro-interactions** (custom SVG cursor, pixel-dither theme transition), **playful widgets** (Poke counter, GMT+8 chip, count badges on nav) and **honest copy** ("+ 3 more", "04", "Currently open to new work").

## Theme system (worth knowing before touching colors)

- Tokens are authored with CSS `light-dark()` and compiled by lightningcss: `:root{ color-scheme: light dark; --bg: var(--lightningcss-light,#fcfcfb) var(--lightningcss-dark,#0f0f11); ... }`
- Default theme follows the OS via `@media (prefers-color-scheme: dark)`; explicit overrides via `:root[data-theme=light] / :root[data-theme=dark]`, set by an inline script from `localStorage("theme")`.
- The toggle plays a **pixel-dither view transition** (`.dither-cover`, `image-rendering: pixelated`, disabled under `prefers-reduced-motion`).
- The screenshots are the light theme; the token dumps rendered dark (headless inherited the system dark preference).

## Palette

| Token | Light | Dark | Use |
|---|---|---|---|
| `--bg` | `#fcfcfb` | `#0f0f11` | canvas (with grain layer on top) |
| `--sidebar` | `#f8f8f7` | `#f8f8f7` | sidebar card — stays light in both themes ("paper" motif) |
| `--surface` | — | `#19191c` | raised surfaces (dark) |
| `--tile` | — | `#1c1c20` | chips / small fills |
| `--hover` | — | `#212125` | hover fills |
| `--ink` | `#111113` | `#ececee` | primary text |
| `--ink-2` | `#3a3a3f` | `#c6c6cb` | strong secondary |
| `--ink-body` | `#4a4a4f` | `#adadb3` | body text |
| `--subtle` | — | `#66666c` | tertiary |
| `--muted` | `#6e6e73` | `#8b8b91` | labels ("Experience") |
| `--faint` | `#8a8a8f` | `#737379` | faintest text |
| `--line` | `#ebebea` | `#232327` | borders |
| `--line-strong` | `#dcdcda` | `#34343a` | stronger borders |
| `--highlight` | — | `#ffffff0a` | subtle white overlay |
| `--green` / `--green-ink` | `#2f9e5b` / `#5fd08a` | same | status/success accents |

Accent surfaces: event card = `linear-gradient(#cfe6fa 0%, #e2f0fc 45%, #edf5fd 100%)` (with light tokens forced inside, `color-scheme: light`); award card = pale green `#e6f4eb` with dark-green ink (`#16271d`, `#1e6b3a`).

## Typography

- **Figtree** variable, weights 300–900 (`--font-sans`) — everything on the home page (all 768 sampled elements). Body `17px / 1.65` (`#4a4a4f` light / `#adadb3` dark).
- **Newsreader italic 400** (`--font-serif`, exposed as a `.serif` utility) — a reserved editorial accent; *not used on the home page*, likely for long-form/blog.
- Small "label" headings: `14px / 500`, muted (`rgb(139,139,145)`), sentence case — e.g. "Experience", "Client projects".
- Nav items ≈ 14–15 px; count badges ≈ 12 px; stat numbers are large (~32–40 px, weight 500–600).
- Both fonts wired through `next/font` with size-adjusted fallbacks.

## Layout & shell

- `.shell{display:flex}` — sidebar **264 px** (`--sidebar-w`) + main column, max **640 px** (`--col`); utilities `stack-v`, `gap-16 / gap-40 / gap-56` handle vertical rhythm.
- Sidebar (desktop): name + collapse button → full-width **Contact** pill button → nav groups with section labels (Explore / Work with me / Portfolio) and **count badges** (Links 11, Gear 12, Projects 10, Stack 45) → bottom strip: "Pokes this month 1,272,008" + Poke button, then GMT+8 chip, theme toggle, mail, LinkedIn.
- Mobile: top bar (hamburger / name / `● Available` pill), same content stacked. Page height 3283 px @1440, 3896 px @375.
- Home section order: hero (circular B&W portrait + name/role + résumé icon-button + lead paragraph + "↓ More about me") → stat row (7,000+ / 1,400+ / 2+ yrs, each an ↗ link) → event banner → award banner → `#work` Experience timeline (3 roles, `+ 3 more` expanders) → Client projects (`04`, `+ 2 more`) → Personal projects (`06`, `+ 4 more`) → Stack (grouped, "View all") → GitHub (8,249-contribution graph) → Contact (compact) → footer.

## Components & craft details

- Cards: rounded ≈18–20 px on a `--radius: 10px` base, 1 px `--line` borders, very soft shadows, generous padding.
- Banner cards: full-content-width, tinted (blue event / green award), pixel-art mascot or logo right-aligned with an arrow affordance.
- Stat row: number + muted label + small ↗ (external link affordance).
- Progressive disclosure everywhere — the page stays ~3.5 viewports tall despite very rich content.
- Global grain: `body{background: var(--grain-soft), var(--bg)}` — SVG turbulence data-URI at 3–5% opacity, layered over the canvas.
- **Custom SVG cursor** (white arrow, `#111113` stroke, hotspot 3,3); `:focus-visible` ring 2 px `--ink` offset 2 px.
- Count badges + status pills as "content volume" signals ("Upcoming" green-dot badge on Webinars).

## A11y / quality notes

- Sidebar is a `<complementary>` landmark; socials are a nav landmark; reduced-motion respected (dither disabled).
- Nitpick: **no `<h1>`** on the home page — heading outline starts at `<h2>` ("Experience").
- Copy voice is outcome-first: meta description reads "I integrate custom systems where a business needs them most…"

## What's worth borrowing (adapted to Fideljon's portfolio)

1. **Sidebar app-shell / status strip** — availability pill, local-time chip, count badges; makes a portfolio feel like a dashboard.
2. **Stat row with ↗ links** — numbers that are clickable proof (years, projects, certifications).
3. **Colored banner cards for one-off notices** — e.g. "open for work" or a certificate/award, with a small illustration.
4. **Progressive disclosure** (`+ N more`) to keep other pages long but the home page light.
5. **The grain + muted palette + single accent per message** recipe — cheap, high-end feel.
6. **One playful signature** (their Poke counter; could be a small game or easter-egg) — personality without noise.
7. **Dual theme with a memorable transition** — implementable with View Transitions; a dither/pixel motif echoes pixel art without being childish.
8. **GitHub contribution graph as social proof.**

## Rerun recipe

- Re-capture: rea `capture_browser_scenario` (headless Chrome, wait ~4 s, capture screenshot + dom + accessibility), decode with `decode-capture.js`.
- Tokens: launch `chrome --headless --remote-debugging-port=9344 --user-data-dir=<fresh>`, then `node scripts/cdp-design-tokens.js <port> <url> <outDir> <label> <w> <h>`; to force a theme add `Emulation.setEmulatedMedia` (`prefers-color-scheme: light|dark`) before navigating.
- CSS audit: `node scripts/css-theme.js` / `css-theme2.js` (fetches the CSS chunk, prints token blocks, palette census, `--font-serif` usage).
