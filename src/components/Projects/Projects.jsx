import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { flushSync } from "react-dom";
import Reveal from "../Reveal";
import ProjectPreview from "./ProjectPreview";
import {
  PERSONAL_PROJECTS,
  PROJECTS,
  WORK_PROJECTS,
  projectPath
} from "../../config/projectsData";
import usePrefersReducedMotion from "../../hooks/usePrefersReducedMotion";
import useSplitTextReveal from "../../hooks/useSplitTextReveal";

// Number of personal rows shown before the "+N more" reveal. Work is short
// enough to show in full; the home page keeps personal projects to the two
// strongest entries, while /project shows the complete archive.
const PERSONAL_PREVIEW_COUNT = 2;

// Hover preview only makes sense where a pointer exists to drive it. Touch
// devices keep the inline thumbnail instead.
const HOVER_QUERY = "(hover: hover) and (pointer: fine)";

const pad = (value) => String(value).padStart(2, "0");

function ProjectRow({ project, onOpen, onPreview }) {
  return (
    <Link
      to={projectPath(project.slug)}
      className="project-row"
      aria-label={`View ${project.title} case study`}
      onClick={(event) => onOpen(project.slug, event)}
      onMouseEnter={(event) => onPreview(project, event.currentTarget)}
      onFocus={(event) => onPreview(project, event.currentTarget)}
      data-haptic="light"
    >
      <span className="project-row-thumb" aria-hidden="true">
        <img src={project.img} alt="" loading="lazy" />
      </span>

      <span className="project-row-body">
        <span className="project-row-title">
          <span className="project-row-name">{project.title}</span>
          {project.badge ? (
            <span className="project-row-badge">{project.badge}</span>
          ) : null}
        </span>
        <span className="project-row-line">{project.tagline}</span>
      </span>

      <span className="project-row-meta">{project.year}</span>
    </Link>
  );
}

function ProjectGroup({
  id,
  label,
  projects,
  previewCount,
  headingLevel: GroupHeading,
  onOpen,
  onPreview
}) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? projects : projects.slice(0, previewCount);
  const remaining = projects.length - visible.length;

  return (
    <section className="project-group" id={id} aria-labelledby={`${id}-heading`}>
      <Reveal>
        <div className="project-group-head">
          <GroupHeading id={`${id}-heading`} className="project-group-label">
            {label}
          </GroupHeading>
          <span className="project-group-count">{pad(projects.length)}</span>
        </div>
      </Reveal>

      <ul className="project-list">
        {visible.map((project, index) => (
          <Reveal as="li" key={project.slug} delay={index * 55}>
            <ProjectRow
              project={project}
              onOpen={onOpen}
              onPreview={onPreview}
            />
          </Reveal>
        ))}
      </ul>

      {remaining > 0 ? (
        <div className="project-more-wrap">
          <button
            type="button"
            className="project-more"
            onClick={() => setExpanded(true)}
            data-haptic="light"
          >
            + {remaining} more
          </button>
        </div>
      ) : null}
    </section>
  );
}

// `asPage` distinguishes the two places this renders:
//   - /project   -> this list IS the page, so its title is the h1
//   - / (home)   -> this list is one section, so the hero owns the h1 and this
//                   title must stay an h2 to keep one h1 per document
function Projects({ asPage = false }) {
  const Heading = asPage ? "h1" : "h2";
  const GroupHeading = asPage ? "h2" : "h3";
  const reducedMotion = usePrefersReducedMotion();
  const navigate = useNavigate();
  const canSharedTransition =
    typeof document !== "undefined" && typeof document.startViewTransition === "function";
  const titleRef = useRef(null);
  useSplitTextReveal(titleRef, { type: "chars", stagger: 0.012 });

  // Hover preview state. The preview plate needs a pointer to drive it, so it
  // stays off on touch layouts where the inline thumbnail is the only preview.
  const [canPreview, setCanPreview] = useState(false);
  const [previewProject, setPreviewProject] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const previewAnchorRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return undefined;
    const query = window.matchMedia(HOVER_QUERY);
    const update = () => setCanPreview(query.matches);
    update();
    if (typeof query.addEventListener === "function") {
      query.addEventListener("change", update);
      return () => query.removeEventListener("change", update);
    }
    if (typeof query.addListener === "function") {
      query.addListener(update);
      return () => query.removeListener(update);
    }
    return undefined;
  }, []);

  const handlePreview = (project, element) => {
    if (!canPreview) return;
    previewAnchorRef.current = element;
    setPreviewProject(project);
    setPreviewOpen(true);
  };

  const closePreview = () => setPreviewOpen(false);

  // Keyboard focus can leave the section without a pointer ever entering it.
  const handleFocusOut = (event) => {
    if (event.relatedTarget && event.currentTarget.contains(event.relatedTarget)) {
      return;
    }
    closePreview();
  };

  const handleProjectOpen = (slug, event) => {
    // The preview plate is a floating layer; it must not travel into the
    // case study behind the shared-element transition.
    closePreview();

    if (!canSharedTransition || reducedMotion) return;

    const row =
      event.currentTarget && typeof event.currentTarget.closest === "function"
        ? event.currentTarget.closest(".project-row")
        : null;
    const image = row ? row.querySelector(".project-row-thumb img") : null;
    if (!image) return;

    image.style.viewTransitionName = "shared-project-image";

    const transition = document.startViewTransition(() => {
      flushSync(() => {
        navigate(projectPath(slug));
      });
    });

    transition.finished.finally(() => {
      image.style.viewTransitionName = "";
      const next = document.querySelector(".project-carousel-slide img");
      if (next) next.style.viewTransitionName = "";
    });

    event.preventDefault();
  };

  return (
    <section
      className="section"
      id="work"
      onMouseLeave={closePreview}
      onBlur={handleFocusOut}
    >
      <div className="container-x">
        <Reveal>
          <div className="work-head project-index-head">
            <div>
              <p className="eyebrow">{asPage ? "Portfolio" : "02 — Projects"}</p>
              <Heading ref={titleRef} className="display-1">
                {asPage ? (
                  <>
                    Work &amp; <span className="serif-accent">personal</span> projects
                  </>
                ) : (
                  <>
                    Selected <span className="serif-accent">work</span>
                  </>
                )}
              </Heading>
            </div>
            {asPage ? (
              <span className="work-count">({pad(PROJECTS.length)})</span>
            ) : (
              <Link
                to="/project"
                className="work-count work-count-link link-sweep"
                data-haptic="light"
              >
                All projects ({pad(PROJECTS.length)}){" "}
                <span aria-hidden="true">↗</span>
              </Link>
            )}
          </div>
        </Reveal>

        {asPage ? (
          <Reveal delay={60}>
            <p className="project-index-lede">
              Client systems built with teams, plus personal products I designed
              and shipped on my own. Every entry opens into the problem, the
              build, and what I owned.
            </p>
          </Reveal>
        ) : null}

        <div className="project-index">
          <ProjectGroup
            id="work-projects"
            label="Work projects"
            projects={WORK_PROJECTS}
            previewCount={WORK_PROJECTS.length}
            headingLevel={GroupHeading}
            onOpen={handleProjectOpen}
            onPreview={handlePreview}
          />

          <ProjectGroup
            id="personal-projects"
            label="Personal projects"
            projects={PERSONAL_PROJECTS}
            previewCount={asPage ? PERSONAL_PROJECTS.length : PERSONAL_PREVIEW_COUNT}
            headingLevel={GroupHeading}
            onOpen={handleProjectOpen}
            onPreview={handlePreview}
          />
        </div>
      </div>

      {canPreview ? (
        <ProjectPreview
          project={previewProject}
          anchorRef={previewAnchorRef}
          open={previewOpen}
        />
      ) : null}
    </section>
  );
}

export default Projects;
