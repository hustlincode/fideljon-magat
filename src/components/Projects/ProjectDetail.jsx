import React from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiArrowUpRight } from "react-icons/fi";

import Reveal from "../Reveal";
import { getProjectBySlug, projectPath, PROJECTS } from "../../config/projectsData";

function ProjectDetail() {
  const { slug } = useParams();
  const project = getProjectBySlug(slug);

  // Unknown slug: send the visitor to the project index rather than a dead end.
  if (!project) return <Navigate to="/project" replace />;

  const others = PROJECTS.filter((item) => item.slug !== project.slug);

  return (
    <main>
      <section className="page-head container-x">
        <Reveal>
          <Link to="/project" className="project-back link-sweep">
            <FiArrowLeft size={14} />
            All projects
          </Link>

          <p className="eyebrow">{project.context}</p>
          <h1 className="display-hero">{project.title}</h1>
          <p className="project-lede">{project.summary}</p>

          <ul className="project-tags">
            {project.tags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
        </Reveal>
      </section>

      <section className="section-tight" style={{ paddingTop: 0 }}>
        <div className="container-x">
          <Reveal delay={80}>
            <figure className="project-shot">
              <img src={project.img} alt={`${project.title} — ${project.context}`} />
            </figure>
          </Reveal>

          <Reveal delay={120}>
            <div className="project-body">
              <h2>Overview</h2>
              <p>{project.description}</p>

              <h2>Key features</h2>
              <ul className="project-features">
                {project.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>

              <h2>My contribution</h2>
              <p>{project.contribution}</p>

              <h2>Details</h2>
              <dl className="project-facts">
                <div>
                  <dt>Role</dt>
                  <dd>{project.role}</dd>
                </div>
                <div>
                  <dt>Context</dt>
                  <dd>{project.employer}</dd>
                </div>
                <div>
                  <dt>Type</dt>
                  <dd>{project.kind}</dd>
                </div>
                <div>
                  <dt>Year</dt>
                  <dd>{project.year}</dd>
                </div>
                <div>
                  <dt>Stack</dt>
                  <dd>{project.tags.join(", ")}</dd>
                </div>
              </dl>
            </div>
          </Reveal>

          <Reveal delay={140}>
            <nav className="project-next" aria-label="Other projects">
              <p className="eyebrow">More work</p>
              <ul>
                {others.map((item) => (
                  <li key={item.slug}>
                    <Link to={projectPath(item.slug)} className="link-sweep">
                      <span>
                        {item.title}
                        <em>{item.context}</em>
                      </span>
                      <FiArrowUpRight size={16} />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </Reveal>
        </div>
      </section>
    </main>
  );
}

export default ProjectDetail;
