import React, { useEffect, useMemo, useRef, useState, Suspense, lazy } from "react";
import { useLocation } from "react-router-dom";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";

import Navbar from "./components/Navbar";
import Chatbot from "./components/Chatbot";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import Particle from "./components/Particle";
import { ThemeProvider } from "./theme/ThemeContext";
import { getMetaForPath, SITE_URL } from "./config/routeMeta";
import usePrefersReducedMotion from "./hooks/usePrefersReducedMotion";
import SmoothScrollProvider from "./providers/SmoothScrollProvider";
import "./style.css";

const Home = lazy(() => import("./components/Home/Home"));
const About = lazy(() => import("./components/About/About"));
const Projects = lazy(() => import("./components/Projects/Projects"));
const ProjectDetail = lazy(() => import("./components/Projects/ProjectDetail"));
const Resume = lazy(() => import("./components/Resume/ResumeNew"));
const NotFound = lazy(() => import("./components/NotFound"));

// Fallback for code-split routes while a lazy chunk downloads. Deliberately
// echoes the boot overlay in index.html (accent wash, segmented meter, plain
// status line) so a client-side navigation feels like the same page waking up
// rather than a generic spinner.
const LOADING_STATUSES = [
  "Loading",
  "Warming up the pixels",
  "Gathering the good stuff",
  "Almost there"
];

function Loading() {
  const [statusIndex, setStatusIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setStatusIndex((current) => (current + 1) % LOADING_STATUSES.length);
    }, 1400);
    return () => clearInterval(id);
  }, []);

  return (
    <main className="route-loading" role="status" aria-live="polite">
      <div className="route-loading-inner container-x">
        <span className="route-loading-meter" aria-hidden="true">
          <span className="route-loading-meter-fill"></span>
        </span>
        <p className="route-loading-status">{LOADING_STATUSES[statusIndex]}</p>
      </div>
    </main>
  );
}

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

// Animated route boundary. AnimatePresence only animates on actual navigation
// after the first client render, so prerendered/SSR HTML keeps its final
// state and reduced-motion visitors see an immediate swap.
function AnimatedRoutes() {
  const location = useLocation();
  const reduced = usePrefersReducedMotion();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={ready ? { opacity: 0, y: reduced ? 0 : 12 } : false}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: reduced ? 0 : -8 }}
        transition={{
          duration: reduced ? 0 : 0.24,
          ease: [0.22, 1, 0.36, 1]
        }}
        style={{ width: "100%" }}
      >
        <Routes location={location} key={location.pathname}>
          <Route exact path="/" element={<Home />} />
          <Route exact path="/project" element={<Projects asPage />} />
          <Route exact path="/project/:slug" element={<ProjectDetail />} />
          <Route exact path="/about" element={<About />} />
          <Route exact path="/resume" element={<Resume />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

// Shared application shell. `RouterComponent` lets the browser use
// BrowserRouter while the build-time prerender uses StaticRouter, without
// duplicating the route table.
export function AppShell({ RouterComponent = BrowserRouter }) {
  const tree = useMemo(
    () => (
      <RouterComponent basename="">
        <RouteMeta />
        <Navbar />
        <Particle />
        <ScrollToTop />
        <Suspense fallback={<Loading />}>
          <AnimatedRoutes />
        </Suspense>
        <Chatbot />
        <Footer />
      </RouterComponent>
    ),
    [RouterComponent]
  );

  return <ThemeProvider><SmoothScrollProvider>{tree}</SmoothScrollProvider></ThemeProvider>;
}

function App() {
  return <AppShell />;
}

export default App;
