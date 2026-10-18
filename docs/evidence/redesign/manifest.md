# Redesign evidence — after captures (2026-10-18)

Post-implementation captures of the "Restraint & Signals" pass, taken from the
local production build (`npm run build` output served by `vite preview` on
`http://localhost:4173/`) in headless Chrome, driven over the DevTools Protocol
with theme + motion emulation.

## Runs

| Label | Theme | Viewport | Screenshots |
|---|---|---|---|
| `after-light-1440` | light | 1440×900 | top, stats, work, cardB, contact |
| `after-dark-1440` | dark | 1440×900 | top, stats, work, cardB, contact |
| `after-light-375` | light | 375×812 | top, stats, work, cardB, contact |

Screenshot PNGs are **not committed** (`.gitignore` → `docs/evidence/**/*.png`).
Each PNG's sha256, plus the extracted DOM/computed-style text evidence, lives in
the matching `evidence-after-*.json`, so the images can be re-verified without
being stored in git.

## Assertions verified in all three runs

- `data-theme` applied as requested; `--accent-ink` = `#c2410c` (light) /
  `#ff8f3a` (dark); `--accent` unchanged (`#f48d2c` / `#ff8f3a`).
- Stats row: 3 items (`03 / 2+ / 13`), arrow glyphs present, values at 32.8px,
  links `#work` / `/resume` / `#skills`, reveal transitions fired.
- Message cards: 2 (`message-card--accent`, `message-card--green`), copy per
  plan §4.3, hrefs `/#contact` and `/resume`, 16px radius, tint background and
  border colors matching the plan §4.3 recipes.
- `canvas` element count = 0 (particle layer removed from both mounts).
- `.hero` computed `animation-name: none` (aurora is static).
- Work head: `View all (03) ↗` is a link to `/project` (plain count on the
  projects page itself).
- Scroll positions reached exactly (the smooth-scroll provider adopted the
  instant programmatic scrolls).

## Rerun recipe

1. `npm run build` then `npm run preview` (port 4173).
2. Launch Chrome headless with `--remote-debugging-port=9333` and a scratch
   `--user-data-dir`.
3. Run the capture script three times:

   ```
   node docs/redesign/scripts/cdp-redesign-shots.cjs 9333 http://localhost:4173/ docs/evidence/redesign after-light-1440 1440 900 light
   node docs/redesign/scripts/cdp-redesign-shots.cjs 9333 http://localhost:4173/ docs/evidence/redesign after-dark-1440 1440 900 dark
   node docs/redesign/scripts/cdp-redesign-shots.cjs 9333 http://localhost:4173/ docs/evidence/redesign after-light-375 375 812 light
   ```

4. Theme is forced via `localStorage.fjm-theme` plus `prefers-color-scheme`
   emulation; animations run with `prefers-reduced-motion: no-preference`.

The before-state for comparison is the deployed production site (audited
earlier); the marwieang inspiration dossier lives in
`docs/evidence/inspiration/marwieang/`.
