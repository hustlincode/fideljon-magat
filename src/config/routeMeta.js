// Per-route SEO metadata.
//
// This is the single source of truth for page titles and descriptions. It is
// used twice:
//   - at build time by scripts/prerender.mjs, to write real <title>/<meta>
//     tags into each prerendered HTML file, so crawlers and link-preview bots
//     (which do not run JavaScript) see per-page metadata;
//   - at runtime by RouteMeta, so the metadata stays correct when a visitor
//     navigates client-side.

// Note: this specifier carries a .js extension because Node loads this module
// directly during prerendering, and Node's ESM resolver does not fill in
// extensions the way Vite does. projectMeta (not projectsData) is used here
// because it is free of image imports that Node cannot parse.
import { PROJECT_META, projectPath } from "./projectMeta.js";

// Canonical site origin.
//
// This MUST be the domain the site is primarily reachable on. Vercel serves
// the project on more than one hostname (both fideljon.vercel.app and
// fideljon-magat.vercel.app served the site), which makes every page reachable
// at duplicate URLs. Canonical tags and the sitemap both point here so search
// engines consolidate on one host instead of splitting signals.
export const SITE_URL = "https://fideljon-magat.vercel.app";
export const SITE_NAME = "Fidel Jon Magat";

export const ROUTES = {
  "/": {
    title: "Fidel Jon Magat — Full-stack Web Developer",
    description:
      "Portfolio of Fidel Jon Magat, a full-stack web developer from Angeles City, Pampanga building clean, scalable web applications with React, Node.js and PHP."
  },
  "/about": {
    title: "About — Fidel Jon Magat",
    description:
      "Background, skills and engineering approach of Fidel Jon Magat: how he designs systems, the stack he works in, and how he uses AI in day-to-day development."
  },
  "/resume": {
    title: "Resume — Fidel Jon Magat",
    description:
      "Curriculum vitae of Fidel Jon Magat: experience as a software developer, technical skills, education, and a downloadable PDF copy."
  },
  "/project": {
    title: "Projects — Fidel Jon Magat",
    description:
      "Selected work by Fidel Jon Magat, including a banquet sales portal, a serverless online check-in system, and a medicine inventory capstone project."
  }
};

// Project detail pages derive their metadata from the project data, so the
// title and description can never drift from the page content.
for (const project of PROJECT_META) {
  ROUTES[projectPath(project.slug)] = {
    title: `${project.title} — ${project.context} | ${SITE_NAME}`,
    description: `${project.summary} Built with ${project.tags.join(", ")}.`
  };
}

// Every path that gets its own prerendered file and sitemap entry.
//
// Exposed as a function rather than a module-level constant: deriving it at
// module scope made the prerender build order-sensitive (the bundler could
// evaluate this before ROUTES was populated, throwing a temporal-dead-zone
// error). Computing on call is order-independent.
export const getPrerenderPaths = () => Object.keys(ROUTES);

export const getDefaultMeta = () => ROUTES["/"];

export const getMetaForPath = (pathname) => {
  if (ROUTES[pathname]) return ROUTES[pathname];

  // Tolerate trailing slashes: /about/ behaves like /about.
  const normalized = pathname.replace(/\/+$/, "") || "/";
  return ROUTES[normalized] ?? ROUTES["/"];
};
