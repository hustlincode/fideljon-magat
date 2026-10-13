import { useEffect, useLayoutEffect, useState } from "react";

// Single source of truth for "the visitor asked for less motion".
//
// Several components (particles, hover preview) need this so they can skip
// pointer-driven movement entirely rather than merely shortening durations.
// It is initialised to `false` on purpose: during hydration the first client
// render must match the server output, and the server has no matchMedia. The
// layout effect then corrects it before the browser paints, so a reduced-motion
// visitor never sees a full-motion frame.
//
// useLayoutEffect warns during SSR, so fall back to useEffect when there is no
// window (the prerender build imports this module too).
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

const QUERY = "(prefers-reduced-motion: reduce)";

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useIsomorphicLayoutEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return undefined;
    }

    const query = window.matchMedia(QUERY);
    const update = () => setReduced(query.matches);

    update();

    // Safari < 14 only has the deprecated addListener/removeListener pair.
    if (typeof query.addEventListener === "function") {
      query.addEventListener("change", update);
      return () => query.removeEventListener("change", update);
    }

    if (typeof query.addListener === "function") {
      query.addListener(update);
      return () => query.removeListener(update);
    }

    return undefined;
  }, []);

  return reduced;
}

export default usePrefersReducedMotion;
