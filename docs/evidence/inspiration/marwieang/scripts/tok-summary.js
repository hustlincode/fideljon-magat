// Summarize the marwieang design-token dumps for report writing.
const t = require("D:/FideljonPortfolio/docs/evidence/inspiration/marwieang/design-tokens-1440.json");
const u = require("D:/FideljonPortfolio/docs/evidence/inspiration/marwieang/design-tokens-375.json");
const top = (arr, n) => arr.slice(0, n).map((x) => x[0] + "  [" + x[1] + "]").join("\n");

console.log("== META 1440 ==\n" + JSON.stringify(t.meta));
console.log("== FONTS 1440 ==\n" + top(t.fonts, 8));
console.log("== BG COLORS ==\n" + top(t.colors.backgrounds, 25));
console.log("== TEXT COLORS ==\n" + top(t.colors.text, 12));
console.log("== BORDER COLORS ==\n" + top(t.colors.borders, 12));
const keys = Object.keys(t.rootVars);
console.log("== ROOT VARS (" + keys.length + ") ==\n" + keys.map((k) => k + ": " + t.rootVars[k]).join("\n").slice(0, 3000));

console.log("== 375 META ==\n" + JSON.stringify(u.meta));
console.log("== 375 SAMPLES ==\n" + JSON.stringify({ p: u.samples.p, h2: u.samples.h2, button: u.samples.button, a: u.samples.a }, null, 1).slice(0, 2200));
console.log("== 375 FONTS ==\n" + top(u.fonts, 5));

console.log("== HEADINGS 1440 ==");
for (const h of t.headings) console.log(h.tag + ": " + h.text);
console.log("== SECTIONS 1440 ==");
for (const s of t.sections) console.log(JSON.stringify(s));
