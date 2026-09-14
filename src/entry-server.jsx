import React from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";

import { AppShell } from "./App";

// Build-time entry used by scripts/prerender.mjs to render each route to HTML.
// Effects do not run during renderToString, so anything a component normally
// resolves in useEffect (PDF sizing, for example) renders its initial state.
export function render(url) {
  // Declared inside render() so the reference is stable for the tree's
  // lifetime rather than being recreated on each call.
  const StaticRouterWrapper = ({ children }) => (
    <StaticRouter location={url}>{children}</StaticRouter>
  );

  return renderToString(<AppShell RouterComponent={StaticRouterWrapper} />);
}
