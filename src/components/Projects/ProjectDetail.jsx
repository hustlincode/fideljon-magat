import React, { useEffect, useRef } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiArrowUpRight } from "react-icons/fi";

import Reveal from "../Reveal";
import BuildBreakdown from "./BuildBreakdown";
import usePrefersReducedMotion from "../../hooks/usePrefersReducedMotion";
import { getProjectBySlug, projectPath, PROJECTS } from "../../config/projectsData";
import useSplitTextReveal from "../../hooks/useSplitTextReveal";

function ProjectDetail() {
  const { slug } = useParams();
  const project = getProjectBySlug(slug);
  const titleRef = useRef(null);
  const reduced = usePrefersReducedMotion();
  const shotRef = useRef(null);
  const canSharedTransition =
    typeof document !== "undefined" && typeof document.startViewTransition === "function";
  useSplitTextReveal(titleRef, { type: "chars", stagger: 0.012 });

  useEffect(() => {
    if (reduced) return undefined;
    if (typeof window === "undefined") return undefined;
    if (!window.matchMedia("(min-width: 901px)").matches) return undefined;
    const shot = shotRef.current;
    if (!shot) return undefined;
    const img = shot.querySelector("img");
    if (!img) return undefined;

    let ctx = null;
    let cancelled = false;

    (async () => {
      try {
        const gsapMod = await import("gsap");
        const stMod = await import("gsap/ScrollTrigger");
        if (cancelled) return;
        const gsap = gsapMod.gsap || gsapMod.default || gsapMod;
        const ScrollTrigger = stMod.ScrollTrigger || stMod.default;
        gsap.registerPlugin(ScrollTrigger);

        ctx = gsap.context(() => {
          // CONSTRAINT: `ease: "none"` is correct here. This tween is
          // scrub-linked -- it must map 1:1 to scroll position, and any
          // easing curve would make the image lag the scrollbar.
          const animation = gsap.fromTo(
            img,
            { scale: 1.1, yPercent: -6 },
            { scale: 1, yPercent: 0, ease: "none" }
          );
          ScrollTrigger.create({
            trigger: shot,
            start: "top 82%",
            end: "+=360",
            scrub: 0.6,
            pin: true,
            anticipatePin: 1,
            animation,
            invalidateOnRefresh: true
          });
        }, shot);
      } catch {
        // Leave the static shot intact.
      }
    })();

    return () => {
      cancelled = true;
      if (ctx) {
        try {
          ctx.revert();
        } catch {
          // ignore
        }
      }
    };
  }, [reduced]);

  // Unknown slug: send the visitor to the project index rather than a dead end.
  if (!project) return <Navigate to="/project" replace />;

  const others = PROJECTS.filter((item) => item.slug !== project.slug);

  return (
    <main>
      <section className="page-head container-x">
        <Reveal>
          <Link to="/project" className="project-back link-sweep" data-haptic="light">
            <FiArrowLeft size={14} />
            All projects
          </Link>

          <p className="eyebrow">{project.context}</p>
          <h1 ref={titleRef} className="display-hero">{project.title}</h1>
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
            <figure ref={shotRef} className="project-shot">
              <img
                src={project.img}
                alt={`${project.title} - ${project.context}`}
                style={
                  canSharedTransition
                    ? { viewTransitionName: "shared-project-image" }
                    : undefined
                }
              />
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

          <Reveal delay={130}>
            <BuildBreakdown project={project} />
          </Reveal>

          <Reveal delay={140}>
            <nav className="project-next" aria-label="Other projects">
              <p className="eyebrow">More work</p>
              <ul>
                {others.map((item) => (
                  <li key={item.slug}>
                    <Link to={projectPath(item.slug)} className="link-sweep" data-haptic="light">
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
