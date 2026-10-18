// Peek at current CSS values for the rules the redesign plan references.
const fs = require("fs");
const css = fs.readFileSync("D:/FideljonPortfolio/src/style.css", "utf8");
const clean = css.replace(/\/\*[\s\S]*?\*\//g, "");
console.log("style.css chars:", css.length, "| rules (approx):", [...clean.matchAll(/\}/g)].length);

const sels = ["body", ".body-copy", ".lede", ".container-x", ".section", ".hero", ".display-hero", ".display-1", ".eyebrow", ".status-chip", ".work-count", ".skill-label", ".skill-items", ".work-row", ".footer-cta", ".hl", ".serif-accent", ".nav", ".type-line", ".scroll-cue"];
for (const s of sels) {
  const esc = s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp("(^|[}\\]@,;\\s])" + esc + "\\s*(,[^{]*)?\\{([^}]*)\\}", "m");
  const m = clean.match(re);
  console.log("RULE " + s + " => " + (m ? ("{" + m[3] + "}").replace(/\s+/g, " ").slice(0, 230) : "(not found in simple scan)"));
}

const cnt = (re) => [...clean.matchAll(re)].length;
console.log("counts: var(--accent*) =>", cnt(/var\(--accent(-strong)?\)/g), "| aurora =>", cnt(/aurora/gi), "| grain =>", cnt(/grain/gi), "| particle =>", cnt(/particle/gi), "| spring =>", cnt(/spring/gi));
