import React from "react";
import { renderToPipeableStream } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import { Writable } from "stream";

import { AppShell } from "./App";

// Build-time entry used by scripts/prerender.mjs to render each route to HTML.
// React 18's renderToPipeableStream supports Suspense, which is what allows the
// React.lazy route components to resolve during server-side rendering.
//
// Capture happens on `onAllReady`, NOT `onShellReady`. `onShellReady` fires as
// soon as the shell is ready, which is while the lazy route chunk is still
// pending -- so the Suspense fallback ("Loading...") was what got written into
// the prerendered HTML, and the real page content never appeared. Because
// bootstrapScripts is empty, React also does not emit the scripts that would
// complete those boundaries, leaving orphaned "<!--$?-->" markers that broke
// hydration. `onAllReady` fires once every boundary has resolved, so the markup
// is complete and self-consistent.
//
// A hard timeout guards the build: a component that never settles would
// otherwise hang the prerender indefinitely.
const RENDER_TIMEOUT_MS = 30000;

export function render(url) {
  return new Promise((resolve, reject) => {
    const StaticRouterWrapper = ({ children }) => (
      <StaticRouter location={url}>{children}</StaticRouter>
    );

    let settled = false;
    let timer = null;

    const finish = (fn, value) => {
      if (settled) return;
      settled = true;
      if (timer) clearTimeout(timer);
      fn(value);
    };

    let stream;

    const capture = () => {
      let html = "";
      const writable = new Writable({
        write(chunk, _encoding, callback) {
          html += chunk.toString();
          callback();
        },
        final(callback) {
          finish(resolve, html);
          callback();
        }
      });

      stream.pipe(writable);
    };

    try {
      stream = renderToPipeableStream(<AppShell RouterComponent={StaticRouterWrapper} />, {
        // No bootstrap scripts: this markup is injected into a pre-built
        // index.html that already loads the client bundle.
        bootstrapScripts: [],
        onAllReady: capture,
        onError(err) {
          // Recoverable errors are surfaced, not swallowed, because a silent
          // failure here is exactly what produced empty prerendered pages.
          console.error("[prerender] render error:", err?.message || err);
        }
      });
    } catch (err) {
      finish(reject, err);
      return;
    }

    timer = setTimeout(() => {
      if (settled) return;
      if (typeof stream.abort === "function") {
        try {
          stream.abort();
        } catch {
          // Ignore: we are already failing this render.
        }
      }
      finish(reject, new Error(`render timed out after ${RENDER_TIMEOUT_MS}ms`));
    }, RENDER_TIMEOUT_MS);
  });
}
