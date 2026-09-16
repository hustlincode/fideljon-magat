// Per-route SEO metadata.
//
// This is the single source of truth for page titles and descriptions. It is
// used twice:
//   - at build time by scripts/prerender.mjs, to write real <title>/<meta>
//     tags into each prerendered HTML file, so crawlers and link-preview bots
//     (which do not run JavaScript) see per-page metadata;
//   - at runtime by RouteMeta, so the metadata stays correct when a visitor
//     navigates client-side.

// Canonical site origin.
//
// This MUST be the domain the site is primarily reachable on. Vercel serves
// the project on more than one hostname (both fideljon.vercel.app and
// fideljon-magat.vercel.app returned the site), which makes every page
// reachable at duplicate URLs. Canonical tags and the sitemap both point here
// so search engines consolidate on one host instead of splitting signals.
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

// The shell values in index.html, used whenever a path has no specific entry.
export const DEFAULT_META = ROUTES["/"];

export const getMetaForPath = (pathname) => {
  if (ROUTES[pathname]) return ROUTES[pathname];

  // Tolerate trailing slashes: /about/ behaves like /about.
  const normalized = pathname.replace(/\/+$/, "") || "/";
  return ROUTES[normalized] ?? DEFAULT_META;
};
