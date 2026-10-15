import { useEffect } from "react";

import usePrefersReducedMotion from "./usePrefersReducedMotion";

// Reveals a heading character-by-character as it enters the viewport, using
// GSAP SplitText. No-op under reduced motion (text stays as authored).
function useSplitTextReveal(targetRef, {
  type = "chars",
  stagger = 0.018,
  duration = 0.75,
  yPercent = 110,
  start = "top 88%"
} = {}) {
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return undefined;
    const node = targetRef?.current;
    if (!node || typeof window === "undefined") return undefined;

    let ctx = null;
    let cancelled = false;

    (async () => {
      try {
        const gsapMod = await import("gsap");
        const stMod = await import("gsap/ScrollTrigger");
        const splitMod = await import("gsap/SplitText");
        if (cancelled) return;

        const gsap = gsapMod.gsap || gsapMod.default || gsapMod;
        const ScrollTrigger = stMod.ScrollTrigger || stMod.default;
        const SplitText = splitMod.SplitText || splitMod.default;

        gsap.registerPlugin(ScrollTrigger, SplitText);

        ctx = gsap.context(() => {
          const split = new SplitText(node, {
            type: type === "words" ? "words" : "words,chars",
            wordsClass: "split-word",
            charsClass: "split-char"
          });

          const targets =
            type === "words" ? split.words : split.chars || split.words;

          gsap.from(targets, {
            yPercent,
            opacity: 0,
            stagger,
            duration,
            ease: "power3.out",
            immediateRender: false,
            scrollTrigger: {
              trigger: node,
              start,
              toggleActions: "play none none none"
            }
          });
        }, node);
      } catch {
        // Leave the authored text visible if GSAP fails to load.
      }
    })();

    return () => {
      cancelled = true;
      if (ctx) {
        try {
          ctx.revert();
        } catch {
          // ignore
        }
      }
    };
  }, [targetRef, reduced, type, stagger, duration, yPercent, start]);
}

export default useSplitTextReveal;