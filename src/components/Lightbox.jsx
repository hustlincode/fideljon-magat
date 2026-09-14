import React, { useEffect, useRef } from "react";

function Lightbox({ src, title, context, onClose }) {
  const closeRef = useRef(null);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    document.documentElement.classList.add("lightbox-open");
    if (closeRef.current) closeRef.current.focus();
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.documentElement.classList.remove("lightbox-open");
    };
  }, [onClose]);

  return (
    <div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={`${title} preview`}
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
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>

      <figure className="lightbox-figure">
        <img src={src} alt={`${title} — ${context}`} />
        <figcaption className="lightbox-caption">
          <strong>{title}</strong>
          <span>{context}</span>
        </figcaption>
      </figure>
    </div>
  );
}

export default Lightbox;
