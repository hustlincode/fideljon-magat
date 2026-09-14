import React, { useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./components/Home/Home";
import About from "./components/About/About";
import Projects from "./components/Projects/Projects";
import Footer from "./components/Footer";
import Resume from "./components/Resume/ResumeNew";
import Chatbot from "./components/Chatbot";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import Particle from "./components/Particle";
import { ThemeProvider } from "./theme/ThemeContext";
import { getMetaForPath, SITE_URL } from "./config/routeMeta";
import "./style.css";

// Keeps <title> and the meta tags correct during client-side navigation.
// Prerendered HTML already carries the right values on first load, so this
// only has to handle in-app route changes.
function RouteMeta() {
  const { pathname } = useLocation();

  useEffect(() => {
    const meta = getMetaForPath(pathname);
    document.title = meta.title;

    const setTag = (selector, attr, value) => {
      const el = document.head.querySelector(selector);
      if (el) el.setAttribute(attr, value);
    };

    setTag('meta[name="description"]', "content", meta.description);
    setTag('meta[property="og:title"]', "content", meta.title);
    setTag('meta[property="og:description"]', "content", meta.description);
    setTag('meta[property="og:url"]', "content", SITE_URL + pathname);
    setTag('meta[name="twitter:title"]', "content", meta.title);
    setTag('meta[name="twitter:description"]', "content", meta.description);
  }, [pathname]);

  return null;
}

// Shared application shell. `RouterComponent` lets the browser use
// BrowserRouter while the build-time prerender uses StaticRouter, without
// duplicating the route table.
export function AppShell({ RouterComponent = BrowserRouter }) {
  // Memoised on the router component only. Building the tree inline on every
  // render would hand React a new element identity each time; a module-scope
  // constant would instead cache elements across mounts and hold stale state.
  const tree = useMemo(
    () => (
      <RouterComponent basename="">
        <RouteMeta />
        <Navbar />
        <Particle />
        <ScrollToTop />
        <Routes>
          <Route exact path="/" element={<Home />} />
          <Route exact path="/project" element={<Projects />} />
          <Route exact path="/about" element={<About />} />
          <Route exact path="/resume" element={<Resume />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Chatbot />
        <Footer />
      </RouterComponent>
    ),
    [RouterComponent]
  );

  return <ThemeProvider>{tree}</ThemeProvider>;
}

function App() {
  return <AppShell />;
}

export default App;
