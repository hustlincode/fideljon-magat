// Contrast of candidate light-theme accent-ink (text-safe orange) colors on the light canvas.
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
const canvases = ["#fafaf8", "#f0f0ee"];
const candidates = ["#b45309", "#c2410c", "#9a3412", "#a8480a", "#ea580c"];
for (const c of candidates) {
  const out = canvases.map((bg) => {
    const r = ratio(c, bg);
    return bg + " " + r.toFixed(2) + ":1" + (r >= 4.5 ? " [AA text OK]" : r >= 3 ? " [large/UI only]" : " [too low]");
  });
  console.log(c + "  =>  " + out.join("  |  "));
}
