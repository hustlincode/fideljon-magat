import React, { useEffect, useRef } from "react";
import Reveal from "../Reveal";
import Github from "./Github";
import usePrefersReducedMotion from "../../hooks/usePrefersReducedMotion";

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
  const reduced = usePrefersReducedMotion();
  const listRef = useRef(null);

  useEffect(() => {
    if (reduced) return undefined;
    const container = listRef.current;
    if (!container || typeof window === "undefined") return undefined;

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
          gsap.from(".skill-group", {
            y: 24,
            opacity: 0,
            stagger: 0.14,
            duration: 0.7,
            ease: "power3.out",
            scrollTrigger: {
              trigger: container,
              start: "top 80%",
              toggleActions: "play none none none"
            }
          });

          gsap.from(".skill-items span", {
            y: 10,
            opacity: 0,
            stagger: 0.03,
            duration: 0.45,
            delay: 0.15,
            ease: "power2.out",
            scrollTrigger: {
              trigger: container,
              start: "top 80%",
              toggleActions: "play none none none"
            }
          });
        }, container);
      } catch {
        // Fall through: skill groups remain visible as authored.
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

        <div ref={listRef} className="skills-list">
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

        <Reveal delay={120}>
          <Github />
        </Reveal>
      </div>
    </section>
  );
}

export default Skills;
