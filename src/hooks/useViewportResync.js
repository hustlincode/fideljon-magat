import { useEffect } from "react";

// iOS 26 WebKit regression (WebKit #297779): dismissing the on-screen
// keyboard can leave the visual viewport desynced -- `visualViewport.height`
// or `.offsetTop` never fully reset -- and from then on every fixed-position
// element (this app's nav) visibly drifts with the page while scrolling, as
// if the bar itself had been scrolled up and away. It is a platform bug:
// Apple fixed it in iOS 26.1 Safari, but WebKit-based browsers on earlier
// 26.x point releases still show it, and the chat's text input is all it
// takes to trigger.
//
// The accepted web-side mitigation is a one-pixel scroll round-trip, which
// forces WebKit to re-sync the visual viewport. The nudge is invisible and
// animates nothing, and it only runs after a keyboard-sized shrink-then-grow
// of the viewport -- ordinary scrolling, pinch-zoom or toolbar collapse can
// never fire it. A no-op everywhere the Visual Viewport API is missing.
export default function useViewportResync() {
  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const vv = window.visualViewport;
    if (!vv || typeof vv.addEventListener !== "function") return undefined;

    let lastHeight = vv.height;
    let seenKeyboard = false;
    let timer = 0;
    let rafId = 0;

    const resync = () => {
      const x = window.scrollX;
      const y = window.scrollY;
      const root = document.documentElement;
      const previousBehavior = root.style.scrollBehavior;
      // The nudge must not animate: the page requests `scroll-behavior:
      // smooth`, and the round-trip has to be instant to stay invisible.
      root.style.scrollBehavior = "auto";
      // One pixel, towards whichever direction is not clamped at the edge.
      window.scrollTo(x, y > 0 ? y - 1 : y + 1);
      const settle = () => {
        rafId = 0;
        window.scrollTo(x, y);
        root.style.scrollBehavior = previousBehavior;
      };
      if (typeof window.requestAnimationFrame === "function") {
        rafId = window.requestAnimationFrame(settle);
      } else {
        settle();
      }
    };

    const onResize = () => {
      const height = vv.height;
      if (lastHeight - height > 120) seenKeyboard = true;
      lastHeight = height;
      if (!seenKeyboard) return;

      // Debounce until the keyboard animation has settled, then only nudge
      // if the viewport is back at (roughly) full height -- i.e. the
      // keyboard is actually gone and not reopening.
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        if (vv.height < window.innerHeight - 120) return;
        seenKeyboard = false;
        resync();
      }, 200);
    };

    vv.addEventListener("resize", onResize);
    return () => {
      window.clearTimeout(timer);
      if (rafId && typeof window.cancelAnimationFrame === "function") {
        window.cancelAnimationFrame(rafId);
      }
      vv.removeEventListener("resize", onResize);
    };
  }, []);
}
