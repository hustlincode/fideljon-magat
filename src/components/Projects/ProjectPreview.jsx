import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

// Floating preview of a project's screenshot.
//
// The project index is a narrow editorial column, so a large shot cannot live
// inline. Instead the preview parks itself in the outer margin beside the
// list: it measures the hovered row and starts just past the longest project
// description, which leaves every title and every word of copy readable.
//
// Placement is written straight to the DOM rather than React state. The panel
// has to re-place itself on every scroll tick, and a state update per tick
// would re-render the whole project list.
//
// The panel is decorative: the row link already names the project for screen
// readers, so the plate is hidden from assistive tech and its shot picker is
// kept out of the tab order.

const MAX_WIDTH = 480;
const MIN_WIDTH = 190;
const MARGIN = 28;
// The chat launcher sits in the bottom-right corner, so the plate keeps clear
// of it instead of landing underneath it.
const BOTTOM_MARGIN = 84;

// How far the longest project description reaches into the row. The plate may
// start just past it, which keeps every title and description readable while
// still leaving the plate as much margin as possible.
function measureTextLimit() {
  let right = 0;
  const lines = document.querySelectorAll(".project-row-line");
  for (const line of lines) {
    if (!line.firstChild) continue;
    const range = document.createRange();
    range.selectNodeContents(line);
    // Not every environment measures ranges (jsdom does not).
    if (typeof range.getBoundingClientRect !== "function") continue;
    const rect = range.getBoundingClientRect();
    if (rect.width) right = Math.max(right, rect.right);
  }
  return right;
}

function ProjectPreview({ project, anchorRef, open }) {
  const panelRef = useRef(null);
  const [slide, setSlide] = useState(0);
  // The text limit only changes with the viewport, so it is measured once per
  // width instead of on every scroll tick.
  const limitRef = useRef({ width: 0, value: 0 });

  // Every project starts on its own hero shot.
  useEffect(() => {
    setSlide(0);
  }, [project]);

  const slides = project
    ? [{ src: project.img }, ...project.gallery]
    : [];
  const active = slides[slide] || slides[0];

  const place = useCallback(() => {
    const panel = panelRef.current;
    const row = anchorRef.current;
    if (!panel || !row) return;

    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;

    const rowRect = row.getBoundingClientRect();
    const meta = row.querySelector(".project-row-meta");
    const metaRect = meta ? meta.getBoundingClientRect() : null;

    if (limitRef.current.width !== viewportW) {
      limitRef.current = { width: viewportW, value: measureTextLimit() };
    }

    // Two safe anchors: just right of the longest description, and just left
    // of the year column. The plate takes whichever sits further left, so it
    // covers the year column (repeated in its own caption) and never a word
    // of the project title or description.
    const anchors = [];
    if (metaRect) anchors.push(metaRect.left - 12);
    if (limitRef.current.value) anchors.push(limitRef.current.value + 14);
    let left = anchors.length ? Math.min(...anchors) : rowRect.right - 90;

    let width = viewportW - MARGIN - left;
    if (width > MAX_WIDTH) {
      width = MAX_WIDTH;
      left = viewportW - MARGIN - MAX_WIDTH;
    }

    // Capping the width pulls the left edge back towards the column, which
    // can land it in the middle of the year. Snap it clear of the year
    // instead of slicing through it.
    if (metaRect && left > metaRect.left && left < metaRect.right) {
      left = metaRect.left - 12;
      width = viewportW - MARGIN - left;
    }

    // Too tight a margin to show anything useful -- stay out of the way.
    if (width < MIN_WIDTH) {
      panel.dataset.visible = "false";
      return;
    }

    panel.style.width = `${Math.round(width)}px`;

    const height = panel.offsetHeight;
    const top = Math.max(
      MARGIN,
      Math.min(
        rowRect.top + rowRect.height / 2 - height / 2,
        viewportH - height - BOTTOM_MARGIN
      )
    );
    panel.style.top = `${Math.round(top)}px`;

    // The row left the viewport, so its preview has nothing to sit beside.
    const onScreen = rowRect.bottom > 0 && rowRect.top < viewportH;
    panel.dataset.visible = onScreen ? "true" : "false";
  }, [anchorRef]);

  // Re-place when the content changes (new project, new shot) and whenever
  // the page moves underneath the panel.
  useLayoutEffect(() => {
    if (!project) return undefined;

    // The text limit depends on the column width, so it is re-measured for
    // every project and whenever the window changes.
    limitRef.current = { width: 0, value: 0 };
    place();

    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(place);
    };
    const onResize = () => {
      limitRef.current = { width: 0, value: 0 };
      onScroll();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [project, slide, place]);

  if (!project) return null;

  return (
    <div
      ref={panelRef}
      className="project-preview"
      data-active={open ? "true" : "false"}
      aria-hidden="true"
    >
      <div className="project-preview-frame">
        <img src={active.src} alt="" />
      </div>

      <div className="project-preview-bar">
        <span className="project-preview-name">{project.title}</span>
        <span className="project-preview-meta">{project.year}</span>
      </div>

      {slides.length > 1 ? (
        <div className="project-preview-thumbs">
          {slides.map((item, index) => (
            <button
              key={item.src}
              type="button"
              className="project-preview-thumb"
              data-current={index === slide ? "true" : "false"}
              tabIndex={-1}
              onMouseEnter={() => setSlide(index)}
              onClick={() => setSlide(index)}
            >
              <img src={item.src} alt="" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default ProjectPreview;
