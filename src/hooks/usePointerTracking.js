import { useEffect, useRef } from "react";

// Tracks the pointer in a ref (not state) so consumers can read the latest
// position inside their own animation frame without a re-render on every
// pointermove.
//
// Only attaches listeners when `enabled` is true -- callers gate that on
// "(hover: hover)" and reduced-motion so touch devices and reduced-motion
// visitors pay nothing.
//
// The returned ref has the shape { x, y, active }.
function usePointerTracking(enabled = true) {
  const pointer = useRef({ x: 0, y: 0, active: false });

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return undefined;

    const onMove = (event) => {
      pointer.current.x = event.clientX;
      pointer.current.y = event.clientY;
      pointer.current.active = true;
    };

    // A pointer that leaves the window (or the tab is blurred) should stop
    // influencing the scene, otherwise it stays "stuck" at its last position.
    const onLeave = () => {
      pointer.current.active = false;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    window.addEventListener("blur", onLeave);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onLeave);
    };
  }, [enabled]);

  return pointer;
}

export default usePointerTracking;
