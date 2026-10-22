import React, { useRef, useState } from "react";
import { FiArrowLeft, FiArrowRight, FiMaximize2 } from "react-icons/fi";

import ProjectLightbox from "./ProjectLightbox";

// Product screenshots for a case study. A single image renders as a plain
// figure; two or more turn the same frame into a carousel with a counter,
// caption, arrow controls, and touch swiping.
//
// The shot in the frame is also the way into the full-screen preview: clicking
// (or pressing Enter on) the image zooms it out of the frame into a lightbox.
function ProjectCarousel({ slides, title, canSharedTransition = false }) {
  const [index, setIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const touchStart = useRef(null);
  const railRefs = useRef([]);
  const zoomRefs = useRef([]);
  const originRect = useRef(null);
  const indexRef = useRef(index);
  indexRef.current = index;

  const count = slides.length;
  const hasMultiple = count > 1;
  const active = slides[index];

  if (!active) return null;

  const goTo = (next) => {
    const target = ((next % count) + count) % count;
    setIndex(target);
    return target;
  };

  const handleKeyDown = (event) => {
    let next = null;
    if (event.key === "ArrowLeft") next = index - 1;
    else if (event.key === "ArrowRight") next = index + 1;
    if (next === null) return;

    event.preventDefault();
    // Arrow keys move the frame, so carry keyboard focus to the slide that
    // comes into view instead of leaving it on a hidden one.
    const onZoomButton = document.activeElement === zoomRefs.current[index];
    const target = goTo(next);
    if (onZoomButton) {
      requestAnimationFrame(() => {
        if (zoomRefs.current[target]) zoomRefs.current[target].focus();
      });
    }
  };

  // Remember where the shot sat so the lightbox can grow out of that exact
  // rectangle, then hand the overlay its own copy of the current shot.
  const openLightbox = (slideIndex) => {
    const trigger = zoomRefs.current[slideIndex];
    const image = trigger ? trigger.querySelector("img") : null;
    const rect = image ? image.getBoundingClientRect() : null;
    originRect.current = rect
      ? {
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height
        }
      : null;
    setIndex(slideIndex);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    // Focus must not fall back to the top of the document.
    const restore = () => {
      const trigger = zoomRefs.current[indexRef.current];
      if (trigger) trigger.focus();
    };
    if (typeof requestAnimationFrame === "function") {
      requestAnimationFrame(restore);
    } else {
      restore();
    }
  };

  // The rail is one control, not a row of separate buttons: arrow keys move
  // between shots and carry focus with them, and only the current shot stays
  // in the tab order.
  const handleRailKeyDown = (event, railIndex) => {
    let next = null;
    if (event.key === "ArrowLeft") next = (railIndex - 1 + count) % count;
    else if (event.key === "ArrowRight") next = (railIndex + 1) % count;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = count - 1;
    if (next === null) return;

    event.preventDefault();
    event.stopPropagation();
    setIndex(next);
    if (railRefs.current[next]) railRefs.current[next].focus();
  };

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
    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY)) {
      goTo(index + (deltaX < 0 ? 1 : -1));
    }
  };

  const handleTouchCancel = () => {
    touchStart.current = null;
  };

  return (
    <div
      className="project-carousel"
      role={hasMultiple ? "region" : undefined}
      aria-roledescription={hasMultiple ? "carousel" : undefined}
      aria-label={hasMultiple ? `${title} screenshots` : undefined}
      tabIndex={hasMultiple ? 0 : undefined}
      onKeyDown={hasMultiple ? handleKeyDown : undefined}
      onTouchStart={hasMultiple ? handleTouchStart : undefined}
      onTouchEnd={hasMultiple ? handleTouchEnd : undefined}
      onTouchCancel={hasMultiple ? handleTouchCancel : undefined}
    >
      <div className="project-carousel-frame">
        <div
          className="project-carousel-track"
          style={
            hasMultiple
              ? { transform: `translateX(-${index * 100}%)` }
              : undefined
          }
        >
          {slides.map((slide, slideIndex) => (
            <figure
              className="project-carousel-slide"
              key={`${slide.src}-${slideIndex}`}
              aria-hidden={
                hasMultiple && slideIndex !== index ? "true" : undefined
              }
            >
              <button
                type="button"
                className="project-carousel-zoom"
                aria-label={`View full size: ${
                  slide.alt || `${title} screenshot ${slideIndex + 1}`
                }`}
                tabIndex={hasMultiple && slideIndex !== index ? -1 : 0}
                ref={(node) => {
                  zoomRefs.current[slideIndex] = node;
                }}
                onClick={() => openLightbox(slideIndex)}
                data-haptic="light"
              >
                <img
                  src={slide.src}
                  alt={slide.alt || `${title} screenshot ${slideIndex + 1}`}
                  loading={slideIndex === 0 ? "eager" : "lazy"}
                  draggable="false"
                  style={
                    canSharedTransition && slideIndex === 0
                      ? { viewTransitionName: "shared-project-image" }
                      : undefined
                  }
                />
                <span className="project-carousel-zoom-hint" aria-hidden="true">
                  <FiMaximize2 size={14} aria-hidden="true" />
                </span>
              </button>
            </figure>
          ))}
        </div>
      </div>

      {hasMultiple || active.caption ? (
        <div className="project-carousel-bar">
          <div className="project-carousel-copy">
            {hasMultiple ? (
              <span
                className="project-carousel-count"
                aria-live="polite"
                aria-atomic="true"
              >
                {index + 1} / {count}
              </span>
            ) : null}
            {active.caption ? (
              <p className="project-carousel-caption">{active.caption}</p>
            ) : null}
          </div>

          {hasMultiple ? (
            <div className="project-carousel-nav">
              <button
                type="button"
                className="project-carousel-btn"
                onClick={() => goTo(index - 1)}
                aria-label="Previous image"
                data-haptic="light"
              >
                <FiArrowLeft size={15} aria-hidden="true" />
              </button>
              <button
                type="button"
                className="project-carousel-btn"
                onClick={() => goTo(index + 1)}
                aria-label="Next image"
                data-haptic="light"
              >
                <FiArrowRight size={15} aria-hidden="true" />
              </button>
            </div>
          ) : null}
        </div>
      ) : null}

      {hasMultiple ? (
        <div
          className="project-carousel-rail"
          role="radiogroup"
          aria-label={`${title} screenshots`}
        >
          {slides.map((slide, slideIndex) => (
            <button
              key={`${slide.src}-${slideIndex}`}
              type="button"
              role="radio"
              aria-checked={slideIndex === index}
              aria-label={slide.alt || `${title} screenshot ${slideIndex + 1}`}
              title={slide.caption}
              tabIndex={slideIndex === index ? 0 : -1}
              className="project-carousel-rail-item"
              ref={(node) => {
                railRefs.current[slideIndex] = node;
              }}
              onClick={() => setIndex(slideIndex)}
              onKeyDown={(event) => handleRailKeyDown(event, slideIndex)}
            >
              <img src={slide.src} alt="" loading="lazy" draggable="false" />
            </button>
          ))}
        </div>
      ) : null}

      {lightboxOpen ? (
        <ProjectLightbox
          slides={slides}
          index={index}
          title={title}
          originRect={originRect.current}
          onClose={closeLightbox}
          onNavigate={goTo}
        />
      ) : null}
    </div>
  );
}

export default ProjectCarousel;
