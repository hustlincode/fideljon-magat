import React, { useEffect, useRef } from "react";
import {
  SiAmazonaws,
  SiGit,
  SiGithub,
  SiJavascript,
  SiMysql,
  SiNextdotjs,
  SiNodedotjs,
  SiOpenai,
  SiPhp,
  SiPostman,
  SiPrisma,
  SiPostgresql,
  SiRadixui,
  SiReact,
  SiSupabase,
  SiTailwindcss,
  SiTypescript,
  SiVisualstudiocode,
  SiWindows,
  SiZod
} from "react-icons/si";
import {
  TbApi,
  TbChartBar,
  TbCode,
  TbComponents,
  TbLayoutDashboard,
  TbLockSquare,
  TbPalette,
  TbPlugConnected,
  TbRobot,
  TbServer2,
  TbSparkles,
  TbStack2,
  TbTable,
  TbTerminal2,
  TbTool
} from "react-icons/tb";
import Reveal from "../Reveal";
import Github from "./Github";
import usePrefersReducedMotion from "../../hooks/usePrefersReducedMotion";

// Curated high-level skills. Implementation-level libraries stay in the
// project case studies and chatbot knowledge base instead of this list.
const ICONS = {
  React: SiReact,
  TypeScript: SiTypescript,
  "Next.js": SiNextdotjs,
  PHP: SiPhp,
  JavaScript: SiJavascript,
  "Node.js": SiNodedotjs,
  MySQL: SiMysql,
  "Tailwind CSS v4": SiTailwindcss,
  "shadcn/ui": TbComponents,
  "Radix UI": SiRadixui,
  "Next.js Route Handlers": TbApi,
  Prisma: SiPrisma,
  PostgreSQL: SiPostgresql,
  Supabase: SiSupabase,
  "NextAuth / Auth.js": TbLockSquare,
  Zod: SiZod,
  "TanStack Table": TbTable,
  Recharts: TbChartBar,
  "Claude Code": TbSparkles,
  Codex: TbCode,
  ChatGPT: SiOpenai,
  OpenCode: TbTerminal2,
  "REA MCP": TbPlugConnected,
  "Jev MCP": TbRobot,
  Windows: SiWindows,
  "VS Code": SiVisualstudiocode,
  Postman: SiPostman,
  GitHub: SiGithub,
  Git: SiGit,
  AWS: SiAmazonaws
};

const GROUPS = [
  {
    label: "Stack",
    icon: TbStack2,
    items: ["React", "TypeScript", "Next.js", "PHP", "JavaScript", "Node.js", "MySQL"]
  },
  {
    label: "Styling & design",
    icon: TbPalette,
    items: ["Tailwind CSS v4", "shadcn/ui", "Radix UI"]
  },
  {
    label: "Backend & data",
    icon: TbServer2,
    items: [
      "Next.js Route Handlers",
      "Prisma",
      "PostgreSQL",
      "Supabase",
      "NextAuth / Auth.js",
      "Zod"
    ]
  },
  {
    label: "Client/UI",
    icon: TbLayoutDashboard,
    items: ["TanStack Table", "Recharts"]
  },
  {
    label: "AI & MCP",
    icon: TbSparkles,
    items: ["Claude Code", "Codex", "ChatGPT", "OpenCode", "REA MCP", "Jev MCP"]
  },
  {
    label: "Tools",
    icon: TbTool,
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
          // Same spring-feel curve as the split-text reveals: fast lead-in,
          // long settle. Groups lead, items follow with a tighter curve.
          gsap.from(".skill-group", {
            y: 24,
            opacity: 0,
            stagger: 0.14,
            duration: 0.7,
            ease: "expo.out",
            scrollTrigger: {
              trigger: container,
              start: "top 80%",
              toggleActions: "play none none none"
            }
          });

          gsap.from(".skill-items > span", {
            y: 10,
            opacity: 0,
            stagger: 0.03,
            duration: 0.45,
            delay: 0.15,
            ease: "power3.out",
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
          {GROUPS.map((group) => {
            const GroupIcon = group.icon;
            return (
              <div className="skill-group" key={group.label}>
                <span className="skill-label">
                  <GroupIcon className="skill-group-icon" aria-hidden="true" />
                  {group.label}
                </span>
                <p className="skill-items">
                  {group.items.map((item) => {
                    const ItemIcon = ICONS[item] || TbSparkles;
                    return (
                      <span key={item}>
                        <ItemIcon className="skill-icon" aria-hidden="true" />
                        <span className="skill-name">{item}</span>
                      </span>
                    );
                  })}
                </p>
              </div>
            );
          })}
        </div>

        <Reveal delay={120}>
          <Github />
        </Reveal>
      </div>
    </section>
  );
}

export default Skills;
