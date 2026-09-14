import React from "react";

// Server-side stub for react-pdf.
//
// The real package pulls in pdfjs-dist, which requires a canvas/DOM and tries
// to load the optional native "canvas" package, so it cannot run during the
// build-time prerender. Nothing here renders to HTML anyway: the PDF preview
// only appears after the client mounts and sizes the panel.
//
// Aliased in via scripts/prerender.mjs (resolve.alias), so the browser build
// is unaffected. Rendered output is a stable placeholder that the client
// replaces on hydration.

export const pdfjs = { GlobalWorkerOptions: { workerSrc: "" }, version: "stub" };

export function Document({ children, loading = null }) {
  return <div className="react-pdf__Document">{children ?? loading}</div>;
}

export function Page() {
  return <div className="react-pdf__Page" style={{ minHeight: 200 }} />;
}

export default { Document, Page, pdfjs };
