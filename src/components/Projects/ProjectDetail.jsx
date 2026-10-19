import React, { useRef } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiArrowUpRight } from "react-icons/fi";

import Reveal from "../Reveal";
import ProjectCarousel from "./ProjectCarousel";
import { getProjectBySlug } from "../../config/projectsData";
import useSplitTextReveal from "../../hooks/useSplitTextReveal";

const CATEGORY_LABELS = {
  work: "Work project",
  personal: "Personal project"
};

const getInitials = (name) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

function ProjectDetail() {
  const { slug } = useParams();
  const project = getProjectBySlug(slug);
  const titleRef = useRef(null);
  const canSharedTransition =
    typeof document !== "undefined" && typeof document.startViewTransition === "function";
  useSplitTextReveal(titleRef, { type: "chars", stagger: 0.012 });

  // Unknown slug: send the visitor to the project index rather than a dead end.
  if (!project) return <Navigate to="/project" replace />;

  const slides = [
    {
      src: project.img,
      alt: `${project.title} - ${project.context}`,
      caption: project.heroCaption
    },
    ...project.gallery
  ];

  const clientName = project.clientName || project.employer || project.title;
  const categoryLabel = CATEGORY_LABELS[project.category] || "Project";
  const clientNote = project.clientNote || project.context;
  const stack = project.stack?.length
    ? project.stack
    : [{ label: "Stack", items: project.tags }];

  return (
    <main className="project-page">
      <section className="page-head container-x project-page-head">
        <Reveal>
          <Link to="/project" className="project-back link-sweep" data-haptic="light">
            <FiArrowLeft size={14} />
            All projects
          </Link>

          <h1 ref={titleRef} className="display-hero">{project.title}</h1>
          <p className="project-lede">{project.tagline || project.summary}</p>
        </Reveal>
      </section>

      <section className="section-tight" style={{ paddingTop: 0 }}>
        <div className="container-x">
          <Reveal delay={60}>
            <div className="project-client-card">
              <span className="project-client-mark" aria-hidden="true">
                {getInitials(clientName)}
              </span>
              <div className="project-client-copy">
                <span className="project-client-name">{clientName}</span>
                <span className="project-client-note">
                  {categoryLabel} · {clientNote}
                </span>
              </div>
              <span className="project-client-actions">
                <span className="project-client-year">{project.year}</span>
                {project.liveUrl ? (
                  <a
                    className="project-client-visit link-sweep"
                    href={project.liveUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={`Visit ${project.title} live site`}
                    data-haptic="light"
                  >
                    Visit
                    <FiArrowUpRight size={13} aria-hidden="true" />
                  </a>
                ) : null}
              </span>
            </div>
          </Reveal>

          <Reveal delay={90}>
            <ProjectCarousel
              slides={slides}
              title={project.title}
              canSharedTransition={canSharedTransition}
            />
          </Reveal>

          <Reveal delay={120}>
            <article className="project-case">
              <section className="project-case-section">
                <h2>Overview</h2>
                <p>{project.description}</p>
                {project.contribution ? <p>{project.contribution}</p> : null}
              </section>

              <section className="project-case-section">
                <h2>Features</h2>
                <ul>
                  {project.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
              </section>

              {project.highlights?.length ? (
                <section className="project-case-section">
                  <h2>Highlights</h2>
                  <ul>
                    {project.highlights.map((highlight) => (
                      <li key={highlight}>{highlight}</li>
                    ))}
                  </ul>
                </section>
              ) : null}

              <section className="project-case-section">
                <h2>Built with</h2>
                <dl className="project-stack">
                  {project.category === "work" ? (
                    <div className="project-stack-row">
                      <dt>Role</dt>
                      <dd>{project.role}</dd>
                    </div>
                  ) : null}
                  <div className="project-stack-row">
                    <dt>Type</dt>
                    <dd>{project.kind}</dd>
                  </div>
                  {stack.map((group) => (
                    <div className="project-stack-row" key={group.label}>
                      <dt>{group.label}</dt>
                      <dd>{group.items.join(", ")}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            </article>
          </Reveal>
        </div>
      </section>
    </main>
  );
}

export default ProjectDetail;
