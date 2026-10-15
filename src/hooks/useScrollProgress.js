import { useEffect } from "react";

// Publishes page scroll progress (0..1) as a `--scroll-progress` custom property
// on the target element, so the fill can be driven purely in CSS with a
// transform. Written from a rAF callback rather than React state to avoid a
// re-render on every scroll tick.
function useScrollProgress(targetRef) {
  useEffect(() => {
    const node = targetRef.current;
    if (!node || typeof window === "undefined") return undefined;

    const reduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return undefined;

    let supportsScrollTimeline = false;
    try {
      supportsScrollTimeline =
        typeof CSS !== "undefined" &&
        typeof CSS.supports === "function" &&
        CSS.supports("animation-timeline", "scroll()");
    } catch {
      supportsScrollTimeline = false;
    }
    if (supportsScrollTimeline) return undefined;

    let rafId = 0;

    const apply = () => {
      rafId = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const ratio = max > 0 ? window.scrollY / max : 0;
      const value = Math.min(1, Math.max(0, ratio));
      node.style.setProperty("--scroll-progress", value.toFixed(4));
    };

    const schedule = () => {
      if (rafId) return;
      if (typeof window.requestAnimationFrame === "function") {
        rafId = window.requestAnimationFrame(apply);
      } else {
        apply();
      }
    };

    apply();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });

    return () => {
      if (rafId && typeof window.cancelAnimationFrame === "function") {
        window.cancelAnimationFrame(rafId);
      }
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [targetRef]);
}

export default useScrollProgress;
