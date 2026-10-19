import React from "react";
import { Link } from "react-router-dom";
import Reveal from "../Reveal";
import { PROJECTS } from "../../config/projectsData";

const ARROW = (
  <svg
    className="stat-arrow"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M7 17 17 7M8 7h9v9" />
  </svg>
);

const ITEMS = [
  {
    value: String(PROJECTS.length).padStart(2, "0"),
    label: "Projects shipped",
    href: "#work",
    kind: "hash"
  },
  {
    value: "2+",
    label: "Professional since 2024",
    href: "/resume",
    kind: "route"
  },
  {
    value: "30",
    label: "Tools & technologies",
    href: "#skills",
    kind: "hash"
  }
];

function Stats() {
  return (
    <section className="stats" aria-label="At a glance">
      <div className="container-x stats-grid">
        {ITEMS.map((item, index) => {
          const inner = (
            <>
              <span className="stat-top">
                <span className="stat-value">{item.value}</span>
                {ARROW}
              </span>
              <span className="stat-label">{item.label}</span>
            </>
          );

          return (
            <Reveal key={item.label} delay={index * 70}>
              {item.kind === "route" ? (
                <Link to={item.href} className="stat" data-haptic="light">
                  {inner}
                </Link>
              ) : (
                <a href={item.href} className="stat" data-haptic="light">
                  {inner}
                </a>
              )}
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

export default Stats;
