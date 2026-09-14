import React from "react";
import Reveal from "../Reveal";
import Github from "./Github";

const GROUPS = [
  {
    label: "Stack",
    items: ["React", "TypeScript", "Next.js", "PHP", "JavaScript", "Node.js", "MySQL"]
  },
  {
    label: "Tools",
    items: ["Windows", "VS Code", "Postman", "GitHub", "Git", "AWS"]
  }
];

function Skills() {
  return (
    <section className="section" id="skills">
      <div className="container-x">
        <Reveal>
          <div className="work-head skills-head">
            <div>
              <p className="eyebrow">03 &mdash; Skillset</p>
              <h2 className="display-1">
                Professional <span className="serif-accent">skillset</span>
              </h2>
            </div>
          </div>
        </Reveal>

        <Reveal delay={80}>
          <div className="skills-list">
            {GROUPS.map((group) => (
              <div className="skill-group" key={group.label}>
                <span className="skill-label">{group.label}</span>
                <p className="skill-items">
                  {group.items.map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </p>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={120}>
          <Github />
        </Reveal>
      </div>
    </section>
  );
}

export default Skills;
