import React, { useEffect, useRef } from "react";

import usePointerTracking from "../hooks/usePointerTracking";

// Interaction tuning. Kept small so the effect reads as ambience rather than a
// toy: the cursor gently pushes particles aside and strings a faint web between
// nearby ones.
const INTERACT_RADIUS = 150; // how far the cursor disturbs a particle
const POINTER_LINK = 180; // longest line drawn from the cursor to a particle
const LINK_DISTANCE = 120; // longest line drawn between two particles
const POINTER_LINK_ALPHA = 0.32;
const LINK_ALPHA = 0.12;
const MAX_IMPULSE = 4; // caps cursor-induced speed so nothing is flung away

function Particle() {
  const canvasRef = useRef(null);

  // Latest cursor position, read from the animation loop. Lives in a ref (not
  // state) so pointermove never triggers a re-render.
  const pointer = usePointerTracking();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext("2d");
    const reduceQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const hoverQuery =
      typeof window.matchMedia === "function"
        ? window.matchMedia("(hover: hover) and (pointer: fine)")
        : null;

    let width = 0;
    let height = 0;
    let particles = [];
    let rafId = 0;
    let running = false;

    const getAccent = () =>
      getComputedStyle(document.documentElement)
        .getPropertyValue("--accent")
        .trim() || "#ff8f3a";

    const seed = () => {
      const count = Math.min(24, Math.max(8, Math.floor((width * height) / 60000)));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        // Cursor impulse, kept separate from the drift velocity so it can decay
        // back to nothing without the base drift ever dying out.
        ix: 0,
        iy: 0,
        r: Math.random() * 1.5 + 0.7,
        base: Math.random() * 0.26 + 0.06,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.02 + 0.004
      }));
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };

    // Pointer influence is only meaningful on a hover-capable device with no
    // reduced-motion preference. Touch input and reduced motion get the plain
    // drifting field.
    const interactive = () =>
      Boolean(hoverQuery && hoverQuery.matches) && !reduceQuery.matches;

    const drawWeb = (accent) => {
      ctx.lineWidth = 1;
      ctx.strokeStyle = accent;

      // Spokes from the cursor outward: the "constellation" that follows the
      // pointer. This is what makes the field feel responsive.
      if (pointer.current.active) {
        for (const p of particles) {
          const dist = Math.hypot(p.x - pointer.current.x, p.y - pointer.current.y);
          if (dist > 0.5 && dist < POINTER_LINK) {
            ctx.globalAlpha = (1 - dist / POINTER_LINK) * POINTER_LINK_ALPHA;
            ctx.beginPath();
            ctx.moveTo(pointer.current.x, pointer.current.y);
            ctx.lineTo(p.x, p.y);
            ctx.stroke();
          }
        }
      }

      // Faint web between neighbours so the field has structure even at rest.
      for (let i = 0; i < particles.length; i += 1) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j += 1) {
          const b = particles[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < LINK_DISTANCE) {
            ctx.globalAlpha = (1 - dist / LINK_DISTANCE) * LINK_ALPHA;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
    };

    const renderFrame = (moving) => {
      ctx.clearRect(0, 0, width, height);
      const accent = getAccent();
      const canInteract = moving && interactive();

      // 1. Advance positions (or leave them untouched for a static frame).
      for (const p of particles) {
        if (!moving) continue;

        if (canInteract && pointer.current.active) {
          const dx = p.x - pointer.current.x;
          const dy = p.y - pointer.current.y;
          const dist = Math.hypot(dx, dy);
          if (dist > 0.5 && dist < INTERACT_RADIUS) {
            const force = (1 - dist / INTERACT_RADIUS) * 0.5;
            p.ix += (dx / dist) * force;
            p.iy += (dy / dist) * force;
          }
        }

        const impulse = Math.hypot(p.ix, p.iy);
        if (impulse > MAX_IMPULSE) {
          p.ix = (p.ix / impulse) * MAX_IMPULSE;
          p.iy = (p.iy / impulse) * MAX_IMPULSE;
        }

        p.x += p.vx + p.ix;
        p.y += p.vy + p.iy;
        p.ix *= 0.9;
        p.iy *= 0.9;
        p.phase += p.speed;

        if (p.x < -12) p.x = width + 12;
        else if (p.x > width + 12) p.x = -12;
        if (p.y < -12) p.y = height + 12;
        else if (p.y > height + 12) p.y = -12;
      }

      // 2. Web behind the dots.
      if (canInteract) drawWeb(accent);

      // 3. Dots on top.
      for (const p of particles) {
        const alpha = p.base * (0.55 + 0.45 * Math.sin(p.phase));
        ctx.globalAlpha = Math.max(0.03, alpha);
        ctx.fillStyle = accent;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const loop = () => {
      renderFrame(true);
      rafId = requestAnimationFrame(loop);
    };

    const start = () => {
      if (running) return;
      running = true;
      rafId = requestAnimationFrame(loop);
    };

    const stop = () => {
      running = false;
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
    };

    const onReduceChange = () => {
      if (reduceQuery.matches) {
        stop();
        renderFrame(false);
      } else if (!document.hidden) {
        start();
      }
    };

    const onVisibility = () => {
      if (document.hidden || reduceQuery.matches) {
        stop();
      } else {
        start();
      }
    };

    resize();
    renderFrame(false);

    window.addEventListener("resize", resize, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    reduceQuery.addEventListener?.("change", onReduceChange);

    if (!reduceQuery.matches && !document.hidden) {
      start();
    }

    return () => {
      stop();
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
      reduceQuery.removeEventListener?.("change", onReduceChange);
    };
  }, []);

  return (
    <div className="bg-decor" aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}

export default Particle;
