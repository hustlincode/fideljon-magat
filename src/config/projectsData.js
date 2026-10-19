import salesportal from "../Assets/Projects/Salesportal.png";
import onlinecheckin from "../Assets/Projects/XOLF.png";
import slfreemed from "../Assets/Projects/slfreemed.png";
import aetherDentalHome from "../Assets/Projects/Aether-dental-homepage.png";
import aetherDentalBooking from "../Assets/Projects/Aether-dental-booking.png";
import aetherDentalDashboard from "../Assets/Projects/Aether-dashboard.png";
import aetherDentalCalendar from "../Assets/Projects/Aether-dental-calendar.png";
import aetherDentalServices from "../Assets/Projects/Aether-dental-services.png";
import aetherDentalNotifications from "../Assets/Projects/Aether-dental-notifications.png";
import codeReviewAssistant from "../Assets/Projects/Aether-code-mini-project.png";

import { PROJECT_META, getProjectMeta, projectPath } from "./projectMeta.js";

// Screenshot for each project, keyed by slug. Kept separate from the metadata
// because these imports can only be resolved by the browser bundle, while
// projectMeta.js is also loaded directly by Node during prerendering.
//
// `gallery` is optional: extra product shots rendered on the detail page after
// the hero screenshot. Aether Dental has a full set; the other projects keep a
// single image until more shots exist.
const SCREENSHOTS = {
  salesportal: {
    img: salesportal,
    gallery: []
  },
  xolf: {
    img: onlinecheckin,
    gallery: []
  },
  "aether-dental": {
    img: aetherDentalHome,
    gallery: [
      {
        src: aetherDentalBooking,
        alt: "Aether Dental multi-step booking form with patient details and privacy consent",
        caption: "Multi-step public booking flow."
      },
      {
        src: aetherDentalDashboard,
        alt: "Aether Dental admin dashboard with appointment stats and analytics charts",
        caption: "Staff dashboard with appointment analytics."
      },
      {
        src: aetherDentalCalendar,
        alt: "Aether Dental monthly appointment calendar with scheduled patients",
        caption: "Monthly appointment calendar."
      },
      {
        src: aetherDentalServices,
        alt: "Aether Dental services table with pricing, duration, and status",
        caption: "Services, pricing, and availability management."
      },
      {
        src: aetherDentalNotifications,
        alt: "Aether Dental notifications panel with new appointment alerts",
        caption: "Notification center for new appointments."
      }
    ]
  },
  "code-review-assistant": {
    img: codeReviewAssistant,
    gallery: []
  },
  slfreemed: {
    img: slfreemed,
    gallery: []
  }
};

const withScreenshot = (project) => {
  const shots = SCREENSHOTS[project.slug] || { img: null, gallery: [] };
  return { ...project, img: shots.img, gallery: shots.gallery };
};

// Full project records for the UI: metadata plus its screenshot(s).
export const PROJECTS = PROJECT_META.map(withScreenshot);

// The two groups rendered by the Projects index. Kept here so the page, the
// stat row and the sidebar all read from the same source of truth.
export const WORK_PROJECTS = PROJECTS.filter((project) => project.category === "work");
export const PERSONAL_PROJECTS = PROJECTS.filter(
  (project) => project.category === "personal"
);

export const getProjectBySlug = (slug) => {
  const meta = getProjectMeta(slug);
  return meta ? withScreenshot(meta) : null;
};

export { projectPath };
