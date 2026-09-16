import salesportal from "../Assets/Projects/Salesportal.png";
import onlinecheckin from "../Assets/Projects/XOLF.png";
import slfreemed from "../Assets/Projects/slfreemed.png";

import { PROJECT_META, getProjectMeta, projectPath } from "./projectMeta.js";

// Screenshot for each project, keyed by slug. Kept separate from the metadata
// because these imports can only be resolved by the browser bundle, while
// projectMeta.js is also loaded directly by Node during prerendering.
const SCREENSHOTS = {
  salesportal,
  xolf: onlinecheckin,
  slfreemed
};

// Full project records for the UI: metadata plus its screenshot.
export const PROJECTS = PROJECT_META.map((project) => ({
  ...project,
  img: SCREENSHOTS[project.slug]
}));

export const getProjectBySlug = (slug) => {
  const meta = getProjectMeta(slug);
  return meta ? { ...meta, img: SCREENSHOTS[meta.slug] } : null;
};

export { projectPath };
