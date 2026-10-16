import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { flushSync } from "react-dom";
import Reveal from "../Reveal";
import { PROJECTS, projectPath } from "../../config/projectsData";
import usePrefersReducedMotion from "../../hooks/usePrefersReducedMotion";
import usePointerTracking from "../../hooks/usePointerTracking";
import Magnetic from "../ui/Magnetic";
import useSplitTextReveal from "../../hooks/useSplitTextReveal";

// How quickly the floating preview catches up to the cursor each frame. Low
// enough to feel physical, high enough that it never lags behind the pointer.
const PREVIEW_LERP = 0.18;

// `asPage` distinguishes the two places this renders:
//   - /project   -> this list IS the page, so its title is the h1
//   - / (home)   -> this list is one section, so the hero owns the h1 and this
//                   title must stay an h2 to keep one h1 per document
function Projects({ asPage = false }) {
  const Heading = asPage ? "h1" : "h2";

  const [activeIndex, setActiveIndex] = useState(null);
  const reducedMotion = usePrefersReducedMotion();
  const navigate = useNavigate();
  const canSharedTransition =
    typeof document !== "undefined" && typeof document.startViewTransition === "function";
  const titleRef = useRef(null);
  useSplitTextReveal(titleRef, { type: "chars", stagger: 0.012 });
  const canHover =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(hover: hover) and (min-width: 901px)").matches;
  const enablePreview = Boolean(canHover) && !reducedMotion;

  const previewRef = useRef(null);
  // Cursor target, updated without re-rendering. The rendered position is a
  // separate ref advanced toward it each frame; the frame loop writes straight
  // to the DOM node so tracking never touches React state.
  const pointer = usePointerTracking(enablePreview);
  const currentRef = useRef({ x: 0, y: 0 });
  const shownRef = useRef(false);

  const previewActive = enablePreview && activeIndex !== null;

  useEffect(() => {
    if (!previewActive) {
      shownRef.current = false;
      return undefined;
    }

    const apply = () => {
      const el = previewRef.current;
      if (!el) return;
      const { x, y } = currentRef.current;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };

    // On the first row of an interaction the preview should appear under the
    // cursor rather than glide in from wherever it last rested.
    if (!shownRef.current) {
      currentRef.current = { ...pointer.current };
      apply();
      shownRef.current = true;
    }

    let rafId = 0;
    const tick = () => {
      const cur = currentRef.current;
      cur.x += (pointer.current.x - cur.x) * PREVIEW_LERP;
      cur.y += (pointer.current.y - cur.y) * PREVIEW_LERP;
      apply();
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafId);
  }, [previewActive, pointer]);

  const rowProps = (index) =>
    enablePreview
      ? {
          onMouseEnter: (event) => {
            pointer.current.x = event.clientX;
            pointer.current.y = event.clientY;
            setActiveIndex(index);
          },
          onMouseLeave: () => setActiveIndex(null)
        }
      : {};

  const handleProjectOpen = (slug, event) => {
    if (!canSharedTransition || reducedMotion) return;
    const row =
      event.currentTarget && typeof event.currentTarget.closest === "function"
        ? event.currentTarget.closest(".work-row")
        : null;
    const image = row ? row.querySelector(".work-thumb img") : null;
    if (!image) return;

    image.style.viewTransitionName = "shared-project-image";

    const transition = document.startViewTransition(() => {
      flushSync(() => {
        navigate(projectPath(slug));
      });
    });

    transition.finished.finally(() => {
      image.style.viewTransitionName = "";
      const next = document.querySelector(".project-shot img");
      if (next) next.style.viewTransitionName = "";
    });

    event.preventDefault();
  };

  return (
    <section className="section" id="work">
      <div className="container-x">
        <Reveal>
          <div className="work-head">
            <div>
              <p className="eyebrow">02 &mdash; Selected work</p>
              <Heading ref={titleRef} className="display-1">
                Recent <span className="serif-accent">works</span>
              </Heading>
            </div>
            <span className="work-count">({String(PROJECTS.length).padStart(2, "0")})</span>
          </div>
        </Reveal>

        <div
          className="work-list"
          onMouseLeave={() => enablePreview && setActiveIndex(null)}
        >
          {PROJECTS.map((project, index) => (
            <Reveal key={project.title} delay={index * 60}>
              <article className="work-row has-thumb" {...rowProps(index)}>
                <div className="work-thumb" aria-hidden="true">
                  <img src={project.img} alt={project.title} loading="lazy" />
                </div>

                <span className="work-num">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <div className="work-body">
                  <p className="work-tags" style={{ marginBottom: 12 }}>
                    <span>{project.context}</span>
                    <span>{project.year}</span>
                  </p>
                  <h2 className="work-title">{project.title}</h2>
                  <p className="work-desc">{project.description}</p>
                  <p className="work-tags">
                    {project.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </p>
                </div>

                <Magnetic strength={0.18}>
                  <Link
                    to={projectPath(project.slug)}
                    className="work-arrow"
                    aria-label={`View details for ${project.title}`}
                    onClick={(event) => handleProjectOpen(project.slug, event)}
                    data-haptic="light"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M7 17 17 7M8 7h9v9" />
                    </svg>
                  </Link>
                </Magnetic>
              </article>
            </Reveal>
          ))}
        </div>
      </div>

      {enablePreview && (
        <div
          ref={previewRef}
          className={`work-preview${previewActive ? " active" : ""}`}
          aria-hidden="true"
        >
          {previewActive && (
            <>
              <img src={PROJECTS[activeIndex].img} alt="" />
              <span className="work-preview-caption">
                <strong>{PROJECTS[activeIndex].title}</strong>
                <em>View case study&nbsp;&#8599;</em>
              </span>
            </>
          )}
        </div>
      )}
    </section>
  );
}

export default Projects;
