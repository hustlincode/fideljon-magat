// Precise token block extraction from marwieang CSS (v2).
const fs = require("fs");
(async () => {
  const css = await (await fetch("https://www.marwieang.com/_next/static/immutable/chunks/11k8o9ylu3lcd.css")).text();

  for (const m of css.matchAll(/--bg:/g)) {
    const a = Math.max(0, m.index - 260), b = Math.min(css.length, m.index + 300);
    console.log("BGCTX>> " + css.slice(a, b).replace(/\s+/g, " "));
    console.log("---");
  }
  for (const m of css.matchAll(/--sidebar:/g)) {
    const a = Math.max(0, m.index - 220), b = Math.min(css.length, m.index + 140);
    console.log("SBCTX>> " + css.slice(a, b).replace(/\s+/g, " "));
  }
  for (const m of css.matchAll(/--font-serif:|--font-sans:/g)) {
    const a = Math.max(0, m.index - 140), b = Math.min(css.length, m.index + 220);
    console.log("FONTCTX>> " + css.slice(a, b).replace(/\s+/g, " "));
  }
  const mq = css.indexOf("prefers-color-scheme");
  if (mq !== -1) console.log("DARKMQ>> " + css.slice(Math.max(0, mq - 30), mq + 1500).replace(/\s+/g, " "));
  console.log("var(--font-serif) refs:", [...css.matchAll(/var\(--font-serif\)/g)].length, "| var(--font-sans):", [...css.matchAll(/var\(--font-sans\)/g)].length);
  const s = [...css.matchAll(/[.\w[\]="'-]{0,60}[^{}]{0,40}\{[^{}]{0,200}var\(--font-serif\)[^}]{0,60}/g)].slice(0, 6);
  for (const m of s) console.log("SERIF>> " + m[0].replace(/\s+/g, " ").slice(0, 250));
  console.log("data-theme in css:", [...css.matchAll(/data-theme/g)].length);
})().catch((e) => { console.error("ERR " + e.message); process.exit(1); });
