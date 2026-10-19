import React, { useRef, useState } from "react";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";

// Product screenshots for a case study. A single image renders as a plain
// figure; two or more turn the same frame into a carousel with a counter,
// caption, arrow controls, and touch swiping.
function ProjectCarousel({ slides, title, canSharedTransition = false }) {
  const [index, setIndex] = useState(0);
  const touchStart = useRef(null);
  const count = slides.length;
  const hasMultiple = count > 1;
  const active = slides[index];

  if (!active) return null;

  const goTo = (next) => setIndex((next + count) % count);

  const handleKeyDown = (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goTo(index - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      goTo(index + 1);
    }
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
    </div>
  );
}

export default ProjectCarousel;
