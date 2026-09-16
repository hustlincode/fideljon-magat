// Rasterises scripts/og-image.svg into public/og.png, the social share card
// (1200x630 — the size Facebook, X/Twitter and LinkedIn expect).
//
//   node scripts/make-og-image.mjs
//
// The card is drawn as SVG so the typography matches the site (Inter), then
// rendered by a locally installed Chromium browser in headless mode. No image
// or canvas dependency is added to the project, and the SVG stays the editable
// source of truth.
//
// The generated PNG is committed, so this only needs re-running when the card
// design changes — it is deliberately NOT part of `npm run build`, so a build
// never depends on a browser being installed.

import { existsSync, statSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const svgPath = join(here, "og-image.svg");
const outPath = join(here, "..", "public", "og.png");

const BROWSERS = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
];

const browser = BROWSERS.find((candidate) => existsSync(candidate));

if (!browser) {
  console.error(
    "No Chromium-based browser found. Install Chrome or Edge, or rasterise\n" +
      `scripts/og-image.svg to ${outPath} manually at 1200x630.`
  );
  process.exit(1);
}

console.log(`Using ${browser}`);

execFileSync(
  browser,
  [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--force-device-scale-factor=1",
    "--window-size=1200,630",
    // Give the webfont time to load before the screenshot is taken.
    "--virtual-time-budget=8000",
    `--screenshot=${outPath}`,
    `file:///${svgPath.replace(/\\/g, "/")}`
  ],
  { stdio: "ignore" }
);

if (!existsSync(outPath)) {
  console.error("Screenshot was not produced.");
  process.exit(1);
}

console.log(`og.png written: ${(statSync(outPath).size / 1024).toFixed(1)} kB -> ${outPath}`);
