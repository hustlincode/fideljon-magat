import React, { useEffect, useState } from "react";
import Reveal from "../Reveal";
import Lightbox from "../Lightbox";
import salesportal from "../../Assets/Projects/Salesportal.png";
import onlinecheckin from "../../Assets/Projects/XOLF.png";
import slfreemed from "../../Assets/Projects/slfreemed.png";

const PROJECTS = [
  {
    img: salesportal,
    title: "Salesportal",
    context: "Banquet Sales Management",
    description:
      "A sales portal for Banquuet, a company that provides food and catering services. Built with Bootstrap, HTML, and JQuery, PHP, and MySQL. Features include user authentication, product management, order processing, and real-time updates.",
    tags: ["PHP", "jQuery", "Bootstrap", "MySQL"],
    year: "Web App"
  },
  {
    img: onlinecheckin,
    title: "XOLF",
    context: "Online Check-in System",
    description:
      "An online check-in system for XOLF, a company that provides online check-in services. Built with React, Node.js, AWS Lambda, and DynamoDB. Features include user authentication, booking management, and real-time updates.",
    tags: ["React", "Node.js", "AWS Lambda", "DynamoDB"],
    year: "Serverless"
  },
  {
    img: slfreemed,
    title: "SLFreemed",
    context: "Medicine Inventory",
    description:
      "A school capstone project: an inventory system to manage the stocks of medicines. Built with HTML, CSS, JavaScript, PHP, and MySQL (XAMPP). Features include stock management, record management, QR prescriptions, report generation.",
    tags: ["HTML/CSS/JS", "PHP", "MySQL", "QR Prescriptions"],
    year: "Capstone"
  }
];

function Projects() {
  const [activeIndex, setActiveIndex] = useState(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [lightboxIndex, setLightboxIndex] = useState(null);
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
              <h2 className="display-1">
                Recent <span className="serif-accent">works</span>
              </h2>
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
                  <h3 className="work-title">{project.title}</h3>
                  <p className="work-desc">{project.description}</p>
                  <p className="work-tags">
                    {project.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </p>
                </div>

                <button
                  type="button"
                  className="work-arrow"
                  aria-label={`Open ${project.title} screenshot`}
                  onClick={() => setLightboxIndex(index)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M7 17 17 7M8 7h9v9" />
                  </svg>
                </button>
              </article>
            </Reveal>
          ))}
        </div>
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          src={PROJECTS[lightboxIndex].img}
          title={PROJECTS[lightboxIndex].title}
          context={PROJECTS[lightboxIndex].context}
          onClose={() => setLightboxIndex(null)}
        />
      )}

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
