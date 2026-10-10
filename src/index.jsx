import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

const container = document.getElementById("root");

// Prerendered routes ship real markup in index.html, so hydrate to keep it and
// avoid re-creating the whole tree. Anything without markup (a dev server
// request, or the SPA fallback rewriting to index.html) falls back to a normal
// client render.
const hasPrerenderedMarkup = container.hasChildNodes();

const tree = (
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

if (hasPrerenderedMarkup) {
  ReactDOM.hydrate(tree, container);
} else {
  ReactDOM.render(tree, container);
}

// Let the inline boot overlay in index.html know the app has mounted so it can
// lift the curtain. Wrapped in rAF so the reveal happens after the first paint,
// never exposing a half-rendered frame.
if (typeof window !== "undefined") {
  requestAnimationFrame(() => {
    window.dispatchEvent(new Event("app:ready"));
  });
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
