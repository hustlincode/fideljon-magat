// JSON-LD structured data.
//
// Search engines use this to understand that the site is *about a person* and
// to connect that person to their profiles and work. For a name query like
// "Fidel Jon Magat" this is the main entity signal available on-page: it
// states the name, role, location, skills and sameAs links explicitly instead
// of leaving a crawler to infer them from prose.
//
// Injected at build time by scripts/prerender.mjs, so it is present in the
// raw HTML where crawlers that do not run JavaScript can still read it.
//
// Note: imports here must carry a file extension. This module is loaded
// directly by Node during prerendering, which does not resolve extensionless
// specifiers the way Vite does.

// Profiles that verify the same identity. These are the entity signals a search
// engine uses to confirm the site and the person are the same individual, so
// every URL here must resolve to a real profile. Kept in sync with the footer.
const socialProfiles = [
  "https://github.com/hustlincode",
  "https://www.linkedin.com/in/fidel-jon-magat",
  "https://twitter.com/fideljon_",
  "https://www.instagram.com/fideljon",
  "https://www.facebook.com/maginoo21"
];

export const buildStructuredData = (routeMeta) => {
  const { SITE_URL, SITE_NAME } = routeMeta;
  const personId = `${SITE_URL}/#person`;
  const websiteId = `${SITE_URL}/#website`;
  const pageUrl = `${SITE_URL}${routeMeta.path === "/" ? "/" : routeMeta.path}`;

  const person = {
    "@type": "Person",
    "@id": personId,
    name: SITE_NAME,
    alternateName: ["Fideljon Magat", "Fideljon", "FJM"],
    url: `${SITE_URL}/`,
    jobTitle: "Full-stack Web Developer",
    description:
      "Full-stack web developer from Angeles City, Pampanga, Philippines, building web applications with React, Node.js, PHP and MySQL.",
    email: "mailto:fideljonmagat25@gmail.com",
    knowsAbout: [
      "Web Development",
      "Full-stack Development",
      "React",
      "TypeScript",
      "Next.js",
      "Node.js",
      "PHP",
      "MySQL",
      "AWS Lambda",
      "DynamoDB",
      "Serverless Architecture",
      "Artificial Intelligence Integration"
    ],
    address: {
      "@type": "PostalAddress",
      addressLocality: "Angeles City",
      addressRegion: "Pampanga",
      addressCountry: "PH"
    },
    worksFor: {
      "@type": "Organization",
      name: "Servo IT Solutions OPC"
    },
    alumniOf: {
      "@type": "CollegeOrUniversity",
      name: "Pampanga State Agricultural University"
    },
    sameAs: socialProfiles
  };

  const website = {
    "@type": "WebSite",
    "@id": websiteId,
    url: `${SITE_URL}/`,
    name: `${SITE_NAME} — Portfolio`,
    description: routeMeta.description,
    inLanguage: "en",
    publisher: { "@id": personId }
  };

  const webPage = {
    "@type": "WebPage",
    "@id": `${pageUrl}#webpage`,
    url: pageUrl,
    name: routeMeta.title,
    description: routeMeta.description,
    isPartOf: { "@id": websiteId },
    about: { "@id": personId },
    inLanguage: "en"
  };

  const profilePage = {
    "@type": "ProfilePage",
    "@id": `${pageUrl}#profile`,
    url: pageUrl,
    name: routeMeta.title,
    mainEntity: { "@id": personId }
  };

  return {
    "@context": "https://schema.org",
    "@graph": [person, website, webPage, profilePage]
  };
};
