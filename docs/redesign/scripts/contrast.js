// WCAG contrast check for accent/canvas pairs used by the redesign plan.
const pairs = [
  ["#ff8f3a", "#0a0a0a", "accent (dark theme) on canvas"],
  ["#f48d2c", "#fafaf8", "accent (light theme) on canvas"],
  ["#da7400", "#fafaf8", "accent-strong (light) on canvas"],
  ["#dc690b", "#0a0a0a", "accent-strong (dark) on canvas"],
  ["#9a9a96", "#0a0a0a", "text-secondary dark"],
  ["#6b6b68", "#fafaf8", "text-secondary light"],
  ["#f5f5f3", "#0a0a0a", "text-primary dark"],
  ["#0f0f0f", "#fafaf8", "text-primary light"],
];
const lum = (hex) => {
  const c = hex.replace("#", "");
  const v = [0, 2, 4]
    .map((i) => parseInt(c.slice(i, i + 2), 16) / 255)
    .map((x) => (x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4)));
  return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
};
const ratio = (a, b) => {
  const l1 = lum(a), l2 = lum(b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
};
for (const [fg, bg, label] of pairs) {
  const r = ratio(fg, bg);
  console.log(label + ": " + fg + " on " + bg + " = " + r.toFixed(2) + ":1" + (r >= 4.5 ? "  [AA text OK]" : r >= 3 ? "  [large text / UI only]" : "  [decorative only]"));
}
