import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Reveal from "../Reveal";
import { PROJECTS, projectPath } from "../../config/projectsData";

// `asPage` distinguishes the two places this renders:
//   - /project   -> this list IS the page, so its title is the h1
//   - / (home)   -> this list is one section, so the hero owns the h1 and this
//                   title must stay an h2 to keep one h1 per document
function Projects({ asPage = false }) {
  const Heading = asPage ? "h1" : "h2";

  const [activeIndex, setActiveIndex] = useState(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const canHover =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(hover: hover) and (min-width: 901px)").matches;

  useEffect(() => {
    if (!canHover || activeIndex === null) return undefined;
    const onMove = (event) => setPos({ x: event.clientX, y: event.clientY });
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [activeIndex, canHover]);

  const rowProps = (index) =>
    canHover
      ? {
          onMouseEnter: (event) => {
            setActiveIndex(index);
            setPos({ x: event.clientX, y: event.clientY });
          },
          onMouseLeave: () => setActiveIndex(null)
        }
      : {};

  return (
    <section className="section" id="work">
      <div className="container-x">
        <Reveal>
          <div className="work-head">
            <div>
              <p className="eyebrow">02 &mdash; Selected work</p>
              <Heading className="display-1">
                Recent <span className="serif-accent">works</span>
              </Heading>
            </div>
            <span className="work-count">({String(PROJECTS.length).padStart(2, "0")})</span>
          </div>
        </Reveal>

        <div
          className="work-list"
          onMouseLeave={() => canHover && setActiveIndex(null)}
        >
          {PROJECTS.map((project, index) => (
            <Reveal key={project.title} delay={index * 60}>
              <article className="work-row has-thumb" {...rowProps(index)}>
                <div className="work-thumb" aria-hidden="true">
                  <img src={project.img} alt="" loading="lazy" />
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

                <Link
                  to={projectPath(project.slug)}
                  className="work-arrow"
                  aria-label={`View details for ${project.title}`}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M7 17 17 7M8 7h9v9" />
                  </svg>
                </Link>
              </article>
            </Reveal>
          ))}
        </div>
      </div>

      {canHover && (
        <div
          className={`work-preview${activeIndex !== null ? " active" : ""}`}
          style={{
            transform: `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%) translateX(clamp(140px, 18vw, 260px))`
          }}
          aria-hidden="true"
        >
          {activeIndex !== null && (
            <img src={PROJECTS[activeIndex].img} alt="" />
          )}
        </div>
      )}
    </section>
  );
}

export default Projects;
