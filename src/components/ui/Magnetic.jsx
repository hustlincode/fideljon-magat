import React, { useEffect, useRef } from "react";

import usePrefersReducedMotion from "../../hooks/usePrefersReducedMotion";

// Subtle magnetic hover: the element drifts a fraction toward the pointer and
// settles back when the pointer leaves. Disabled for reduced-motion and
// touch-only devices.
function Magnetic({ children, strength = 0.22, className = "", as: Tag = "span" }) {
  const ref = useRef(null);
  const reduced = usePrefersReducedMotion();
  const enabled =
    !reduced &&
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  useEffect(() => {
    if (!enabled) return undefined;
    const node = ref.current;
    if (!node) return undefined;

    let rafId = 0;
    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    let running = true;

    const onMove = (event) => {
      const rect = node.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      target.x = (event.clientX - cx) * strength;
      target.y = (event.clientY - cy) * strength;
    };

    const onLeave = () => {
      target.x = 0;
      target.y = 0;
    };

    const tick = () => {
      if (!running) return;
      current.x += (target.x - current.x) * 0.18;
      current.y += (target.y - current.y) * 0.18;
      node.style.transform = `translate3d(${current.x.toFixed(2)}px, ${current.y.toFixed(2)}px, 0)`;
      rafId = requestAnimationFrame(tick);
    };

    node.addEventListener("pointermove", onMove, { passive: true });
    node.addEventListener("pointerleave", onLeave);
    rafId = requestAnimationFrame(tick);

    return () => {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
      node.removeEventListener("pointermove", onMove);
      node.removeEventListener("pointerleave", onLeave);
      node.style.transform = "";
    };
  }, [enabled, strength]);

  return (
    <Tag
      ref={ref}
      className={className}
      style={{ display: "inline-block", willChange: enabled ? "transform" : undefined }}
    >
      {children}
    </Tag>
  );
}

export default Magnetic;