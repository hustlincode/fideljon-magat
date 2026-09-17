import React from "react";
import { renderToPipeableStream } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import { Writable } from "stream";

import { AppShell } from "./App";

// Build-time entry used by scripts/prerender.mjs to render each route to HTML.
// React 18's renderToPipeableStream supports Suspense, enabling React.lazy
// components to be resolved during server-side rendering.
export function render(url) {
  return new Promise((resolve, reject) => {
    const StaticRouterWrapper = ({ children }) => (
      <StaticRouter location={url}>{children}</StaticRouter>
    );

    const { pipe } = renderToPipeableStream(
      <AppShell RouterComponent={StaticRouterWrapper} />,
      {
        bootstrapScripts: [],
        onShellReady() {
          let html = "";
          const writable = new Writable({
            write(chunk, _encoding, callback) {
              html += chunk.toString();
              callback();
            },
            final(callback) {
              resolve(html);
              callback();
            }
          });
          pipe(writable);
        },
        onError(err) {
          reject(err);
        }
      }
    );
  });
}
