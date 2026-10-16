import React, { createContext, useContext, useEffect, useRef, useState } from "react";

import usePrefersReducedMotion from "../hooks/usePrefersReducedMotion";

const SmoothScrollContext = createContext(null);

// Provider for the optional Lenis smooth-scroll layer. It is a no-op (native
// scroll) for reduced-motion visitors and for touch-only devices, matching the
// Tier 1 accessibility rules.
function SmoothScrollProvider({ children }) {
  const reduced = usePrefersReducedMotion();
  const lenisRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (reduced) return undefined;
    if (typeof window === "undefined") return undefined;

    const hoverNone =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(hover: none)").matches;
    if (hoverNone) return undefined;

    let cancelled = false;
    let rafId = 0;
    let lenis = null;

    (async () => {
      try {
        const LenisModule = await import("lenis");
        const Lenis = LenisModule.default || LenisModule;
        if (cancelled) return;

        lenis = new Lenis({
          lerp: 0.09,
          smoothWheel: true,
          wheelMultiplier: 0.9,
          touchMultiplier: 1.2,
          syncTouch: false
        });
        lenisRef.current = lenis;
        setReady(true);

        const loop = (time) => {
          if (cancelled) return;
          lenis.raf(time);
          rafId = requestAnimationFrame(loop);
        };
        rafId = requestAnimationFrame(loop);
      } catch {
        // Fail silently: native scrolling remains available.
      }
    })();

    return () => {
      cancelled = true;
      if (rafId) cancelAnimationFrame(rafId);
      if (lenis) {
        try {
          lenis.destroy();
        } catch {
          // ignore
        }
      }
      lenisRef.current = null;
      setReady(false);
    };
  }, [reduced]);

  return (
    <SmoothScrollContext.Provider
      value={{ lenis: lenisRef.current, ready }}
    >
      {children}
    </SmoothScrollContext.Provider>
  );
}

export default SmoothScrollProvider;

export function useSmoothScroll() {
  return useContext(SmoothScrollContext);
}