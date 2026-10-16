// Shared spring presets for the `motion` (Framer Motion) layer.
//
// Values are tuned so the damping ratio lands at or just under critical:
// quick response, one soft settle, no wobble. They mirror the --ease-spring*
// family in tokens.css so the CSS and JS engines share one feel.
//
//   gentle  ζ ≈ 0.98  entrances and page-level transitions (almost no bounce)
//   snappy  ζ ≈ 0.93  interactive elements that should feel immediate
//   bouncy  ζ ≈ 0.53  small, rare delight moments
//   route   ζ ≈ 0.94  route boundary: settles fast so navigation stays brisk

export const springs = {
  gentle: { type: "spring", stiffness: 340, damping: 36, mass: 1 },
  snappy: { type: "spring", stiffness: 520, damping: 38, mass: 0.8 },
  bouncy: { type: "spring", stiffness: 460, damping: 22, mass: 0.9 },
  route: { type: "spring", stiffness: 560, damping: 42, mass: 0.9 }
};

// Exits run at ~60–70% of the enter feel and accelerate out, so leaving
// never feels slower than arriving (Material motion guidance).
export const exitQuick = { duration: 0.18, ease: [0.45, 0, 1, 1] };

// Reduced-motion renders: settle instantly while keeping the final state.
export const instant = { duration: 0 };
