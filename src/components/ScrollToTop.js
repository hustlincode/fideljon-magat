import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useSmoothScroll } from "../providers/SmoothScrollProvider";

function ScrollToTop() {
  const { pathname } = useLocation();
  const { lenis } = useSmoothScroll();
  const firstRun = useRef(true);

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }

    if (lenis && typeof lenis.scrollTo === "function") {
      lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }

    const main = document.querySelector("main");
    if (main) {
      if (!main.hasAttribute("tabindex")) main.setAttribute("tabindex", "-1");
      if (typeof main.focus === "function") {
        try {
          main.focus({ preventScroll: true });
        } catch {
          main.focus();
        }
      }
    }
  }, [pathname, lenis]);

  return null;
}

export default ScrollToTop;
