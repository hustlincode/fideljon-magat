import React, { useEffect, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { FiArrowLeft, FiArrowRight, FiX } from "react-icons/fi";

// Full-screen preview of a case-study screenshot.
//
// Rendered through a portal to <body>: the carousel lives inside a Reveal
// wrapper whose transform would otherwise become the containing block for
// `position: fixed`, and the overlay has to cover the whole viewport.
//
// Opening runs a FLIP zoom from the carousel frame's rect to the enlarged
// image, so the shot reads as the same photograph growing rather than a new
// panel appearing over it. The animation is skipped when the visitor asks for
// reduced motion, and when the browser cannot animate (jsdom).
//
// The dialog owns its keyboard contract: Escape dismisses, the arrow keys walk
// the shots, Tab is trapped inside the overlay, and focus lands on the close
// control as soon as it opens.

const FOCUSABLE = "button, [href], input, select, textarea, [tabindex]";

function ProjectLightbox({
  slides,
  index,
  title,
  originRect,
  onClose,
  onNavigate
}) {
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const imageRef = useRef(null);
  const touchStart = useRef(null);

  const count = slides.length;
  const active = slides[index];
  const hasMultiple = count > 1;

  // The key listener is installed once; reading the latest values through a
  // ref keeps it correct without re-running the effect (and re-focusing the
  // close button) on every shot change.
  const latest = useRef({ onClose, onNavigate, index, hasMultiple });
  latest.current = { onClose, onNavigate, index, hasMultiple };

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("lightbox-open");
    if (closeRef.current) closeRef.current.focus();

    const onKeyDown = (event) => {
      const current = latest.current;

      if (event.key === "Escape") {
        event.preventDefault();
        current.onClose();
        return;
      }

      if (current.hasMultiple && event.key === "ArrowLeft") {
        event.preventDefault();
        current.onNavigate(current.index - 1);
        return;
      }

      if (current.hasMultiple && event.key === "ArrowRight") {
        event.preventDefault();
        current.onNavigate(current.index + 1);
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) return;

      const items = Array.from(
        dialogRef.current.querySelectorAll(FOCUSABLE)
      ).filter((node) => !node.disabled);
      if (!items.length) return;

      const first = items[0];
      const last = items[items.length - 1];
      const focused = document.activeElement;

      if (event.shiftKey && (focused === first || !dialogRef.current.contains(focused))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (focused === last || !dialogRef.current.contains(focused))) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      root.classList.remove("lightbox-open");
    };
  }, []);

  // Zoom the image out of the frame it was clicked in.
  useLayoutEffect(() => {
    const image = imageRef.current;
    if (!image || !originRect) return undefined;
    if (typeof image.animate !== "function") return undefined;
    if (
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return undefined;
    }

    // A shot that is still decoding has no reliable rect to fly from.
    if (!image.complete || !image.naturalWidth) return undefined;

    const target = image.getBoundingClientRect();
    if (!target.width || !target.height) return undefined;

    const dx = originRect.left - target.left;
    const dy = originRect.top - target.top;
    const sx = originRect.width / target.width;
    const sy = originRect.height / target.height;

    image.style.transformOrigin = "top left";
    const animation = image.animate(
      [
        {
          transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`,
          borderRadius: "6px"
        },
        { transform: "none", borderRadius: "12px" }
      ],
      { duration: 440, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }
    );

    return () => animation.cancel();
  }, [originRect]);

  if (!active) return null;

  const handleTouchStart = (event) => {
    const touch = event.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (event) => {
    if (!touchStart.current) return;
    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - touchStart.current.x;
    const deltaY = touch.clientY - touchStart.current.y;
    touchStart.current = null;
    if (hasMultiple && Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY)) {
      onNavigate(deltaX < 0 ? index + 1 : index - 1);
    }
  };

  return createPortal(
    <div
      ref={dialogRef}
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={`${title} image preview`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <button
        ref={closeRef}
        type="button"
        className="lightbox-close"
        onClick={onClose}
        aria-label="Close preview"
        data-haptic="light"
      >
        <FiX size={17} aria-hidden="true" />
      </button>

      <figure className="lightbox-figure">
        <div className="lightbox-stage">
          <img
            ref={imageRef}
            src={active.src}
            alt={active.alt || `${title} screenshot ${index + 1}`}
            draggable="false"
          />
        </div>
        <figcaption className="lightbox-caption">
          <span className="lightbox-copy" aria-live="polite" aria-atomic="true">
            {hasMultiple ? (
              <span className="lightbox-count">
                {index + 1} / {count}
              </span>
            ) : null}
            <strong className="lightbox-title">{title}</strong>
            {active.caption ? (
              <span className="lightbox-caption-text">{active.caption}</span>
            ) : null}
          </span>

          {hasMultiple ? (
            <span className="lightbox-nav">
              <button
                type="button"
                className="lightbox-nav-btn"
                onClick={() => onNavigate(index - 1)}
                aria-label="Previous image"
                data-haptic="light"
              >
                <FiArrowLeft size={16} aria-hidden="true" />
              </button>
              <button
                type="button"
                className="lightbox-nav-btn"
                onClick={() => onNavigate(index + 1)}
                aria-label="Next image"
                data-haptic="light"
              >
                <FiArrowRight size={16} aria-hidden="true" />
              </button>
            </span>
          ) : null}
        </figcaption>
      </figure>
    </div>,
    document.body
  );
}

export default ProjectLightbox;
