import React, { useEffect, useRef } from "react";

function Particle() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext("2d");
    const reduceQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

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

    const renderFrame = (moving) => {
      ctx.clearRect(0, 0, width, height);
      const accent = getAccent();
      for (const p of particles) {
        if (moving) {
          p.x += p.vx;
          p.y += p.vy;
          p.phase += p.speed;
          if (p.x < -12) p.x = width + 12;
          else if (p.x > width + 12) p.x = -12;
          if (p.y < -12) p.y = height + 12;
          else if (p.y > height + 12) p.y = -12;
        }
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