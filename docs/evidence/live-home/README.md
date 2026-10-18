# Live homepage evidence — https://fideljon-magat.vercel.app/

Captured 2026-10-18 from the deployed site for live-vs-source parity checks.
All browser captures were made with REA `capture_browser_scenario` (headless
Google Chrome 154.0.8037.98, owned temporary profile, one fresh page load per viewport).

## Capture method (REA)

- URL: https://fideljon-magat.vercel.app/
- Viewports: 375x812, 768x1024, 1440x900 (device scale factor 1)
- Environment: reduced_motion "no-preference", service workers blocked
- Actions: 3000 ms settle wait after load
- Captured at end: screenshot, DOM (serialized outerHTML), accessibility text, URL

REA web tools are passive by design: they never evaluate page JavaScript, so
computed styles cannot be captured through them. The `computed-styles-*.json`
files below are a supplementary dump taken directly over the Chrome DevTools
Protocol (Emulation.setDeviceMetricsOverride + getComputedStyle) at the same
viewports; treat them as a CDP supplement, not as REA evidence.

## Files

| File | Bytes | SHA-256 (first 16) | What it is |
|---|---|---|---|
| home-375.png | 237501 | d43a7efefeaeab40 | REA viewport screenshot, 375x812 |
| home-768.png | 448008 | df59a39259d7b74b | REA viewport screenshot, 768x1024 |
| home-1440.png | 652515 | ab4e2ec5ba171851 | REA viewport screenshot, 1440x900 |
| dom.html | 95306 | 3ac8abef0fcee309 | Desktop DOM dump (copy of dom-1440.html) |
| dom-375.html | 95252 | e247c1320044198d | Serialized DOM, 375px |
| dom-768.html | 95279 | fb61e70591a597f8 | Serialized DOM, 768px |
| dom-1440.html | 95306 | 3ac8abef0fcee309 | Serialized DOM, 1440px |
| accessibility-375.txt | 4983 | 4a7074be707d7fe6 | REA accessibility snapshot, 375px |
| accessibility-768.txt | 4983 | 4a7074be707d7fe6 | REA accessibility snapshot, 768px |
| accessibility-1440.txt | 5253 | a8946044a1391ed6 | REA accessibility snapshot, 1440px |
| hero-375.txt | 378 | 11b0bbadfe474d4a | Hero text extract from the DOM dump (typewriter mid-frame) |
| hero-768.txt | 379 | 24cf5c26bf3fc749 | Hero text extract from the DOM dump |
| hero-1440.txt | 379 | 24cf5c26bf3fc749 | Hero text extract from the DOM dump |
| nav-375.txt / nav-768.txt / nav-1440.txt | 32 | f178b78b150f8a44 | Nav text extract (identical at all widths) |
| footer-375.txt / footer-768.txt / footer-1440.txt | 184 | 12e1402ac104d52c | Footer text extract (identical at all widths) |
| computed-styles-375.json | 27520 | 8ab750253bacc746 | CDP supplement: computed styles, 375px |
| computed-styles-768.json | 27568 | 4a1f6e89ab621ecb | CDP supplement: computed styles, 768px |
| computed-styles-1440.json | 27577 | 0a35b61b2f507a50 | CDP supplement: computed styles, 1440px |

REA evidence ids:

- 375x812: ev_77c9a6b9376561baae9958f6a8c6d76bc44b04b7fbfca21bd815493adfb78a09
- 768x1024: ev_311dfc5e54c079cd6f6f8179d95bdb001621861aea934eec477c7d5d563d83c5
- 1440x900: ev_a7f9684534676f1c73c6371c7cba91f9272a69c650e0a1c5685944428fb6a79c

`computed-styles-*.json` contains per-element computed styles for nav / hero /
footer targets, element bounding rects, the page's CSS custom properties
(`--meta.rootVars`, 27 variables) and loaded font families.

## Hero copy parity (live vs local source)

Checked manually (exact string matches) against `src/components/Home/Hero.jsx`
and `src/components/Home/Type.jsx` (the task referenced `Home.js`; hero copy
actually lives in `Hero.jsx`, which `Home.jsx` composes):

- badge: "Available for opportunities" — exact
- headline: "FIDEL JON" + "MAGAT." (live aria-label "FIDEL JONMAGAT.") — exact
- subhead: "Experienced in developing systems for hospitality industry, …" — exact
- meta: LOCATION "Angeles City, PH", FOCUS "Full-stack Web Development", CURRENTLY "Servo IT Solutions OPC" — exact
- CTA: "SCROLL" with aria-label "Scroll to introduction" — exact

Result: no copy drift found. Machine-verified with `jev_compare`
(model `typesafe/jev-1.14-20261014` via the `openrouter` provider; run directly
against the jev MCP server over stdio on 2026-10-18):

- overall: same_fact (p=0.90, decision auto)
- headline: same_fact (p=1.00, decision auto)
- subhead: same_fact (p=1.00, decision auto)
- cta: same_fact (p=1.00, decision auto)
- badge: same_fact (p=1.00, decision auto)

Raw verdicts: `jev-compare-hero.json`. The OpenCode-integrated jev server
exposes the same call as `tools.jev.jev_compare` after an
`opencode service restart` (needed once so the server process picks up the
`OPENROUTER_API_KEY` user environment variable).

## Rerun recipe (in-session via `tools.jev.jev_compare`)

Live passage (normalize the char-split spacing so the headline reads "FIDEL JON MAGAT."):

```text
Badge: Available for opportunities
Headline: FIDEL JON MAGAT.
Role line: — React Developer
Subhead: Experienced in developing systems for hospitality industry, focusing on solving complex real-world challenges through continuous innovation and impactful technology.
Meta labels: LOCATION Angeles City, PH / FOCUS Full-stack Web Development / CURRENTLY Servo IT Solutions OPC
CTA: SCROLL (link aria-label "Scroll to introduction")
```

Local passage: same, but role line also lists the typewriter strings
(React Developer, TypeScript Developer, Next.js Developer, Web App Developer)
from `src/components/Home/Type.jsx`. Run:

```text
tools.jev.jev_compare({
  passage_a: <live>,
  passage_b: <local>,
  aspects: ["headline", "subhead", "cta", "badge"],
  purpose: "Detect copy drift between the live deployed hero section (captured DOM text) and the local Hero.jsx source."
})
```

## Known limitations

- Screenshots are viewport-only; REA does not do full-page capture.
- The 375px DOM snapshot caught the hero typewriter mid-animation ("React Develope" + caret); 768/1440 show "React Developer".
- No visitor chip in any capture: `VisitorCount` renders nothing below 100 visitors (client-only) — expected behavior, not drift.
- Computed styles captured in the default light theme only.
