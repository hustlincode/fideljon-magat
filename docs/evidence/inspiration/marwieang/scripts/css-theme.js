// Extract light/dark theme token blocks and the full hex palette from marwieang's CSS.
const fs = require("fs");
(async () => {
  const cssUrl = "https://www.marwieang.com/_next/static/immutable/chunks/11k8o9ylu3lcd.css";
  const css = await (await fetch(cssUrl)).text();
  console.log("bytes:", css.length, "| --bg defs:", [...css.matchAll(/--bg:/g)].length, "| --sidebar defs:", [...css.matchAll(/--sidebar:/g)].length);

  const blocks = [...css.matchAll(/([^{}]{1,200})\{([^{}]{0,1200}--bg:[^{}]{0,1200})\}/g)].slice(0, 6);
  for (const m of blocks) {
    console.log("== SELECTOR: " + m[1].replace(/\s+/g, " ").trim().slice(0, 150));
    console.log("   VARS: " + m[2].replace(/\s+/g, " ").trim().slice(0, 1000));
  }

  console.log("prefers-color-scheme values:", JSON.stringify([...new Set([...css.matchAll(/prefers-color-scheme\s*:\s*([a-z]+)/g)].map((m) => m[1]))]));
  const sels = [...new Set([...css.matchAll(/([^{}]{1,70})\{[^{}]*--bg:[^{}]*\}/g)].map((m) => m[1].replace(/\s+/g, " ").trim().slice(0, 90)))];
  console.log("selectors defining --bg:", JSON.stringify(sels));

  const hexes = {};
  for (const m of css.matchAll(/#[0-9a-fA-F]{6}\b/g)) { const k = m[0].toLowerCase(); hexes[k] = (hexes[k] || 0) + 1; }
  console.log("unique hex colors: " + Object.keys(hexes).length);
  for (const [h, c] of Object.entries(hexes).sort((a, b) => b[1] - a[1]).slice(0, 45)) console.log(h + " x" + c);

  const dom = fs.readFileSync("D:/FideljonPortfolio/docs/evidence/inspiration/marwieang/dom-1440.html", "utf8");
  const urls = [...new Set([...dom.matchAll(/\/_next\/[^"'\s]+\.css[^"'\s]*/g)].map((m) => m[0]))].slice(0, 12);
  console.log("css-like urls in dom:", JSON.stringify(urls));
  for (const pat of ["prefers-color-scheme", "data-theme", "localStorage"]) {
    console.log(pat + " in dom: " + [...dom.matchAll(new RegExp(pat, "g"))].length);
  }
  const tm = [...dom.matchAll(/.{60}(localStorage|data-theme).{60}/g)].slice(0, 5);
  for (const m of tm) console.log("THEME>> " + m[0].replace(/\s+/g, " "));
})().catch((e) => { console.error("ERR " + e.message); process.exit(1); });
