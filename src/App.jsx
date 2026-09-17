import React, { useEffect, useMemo, Suspense, lazy } from "react";
import { useLocation } from "react-router-dom";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import Navbar from "./components/Navbar";
import Chatbot from "./components/Chatbot";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import Particle from "./components/Particle";
import { ThemeProvider } from "./theme/ThemeContext";
import { getMetaForPath, SITE_URL } from "./config/routeMeta";
import "./style.css";

const Home = lazy(() => import("./components/Home/Home"));
const About = lazy(() => import("./components/About/About"));
const Projects = lazy(() => import("./components/Projects/Projects"));
const ProjectDetail = lazy(() => import("./components/Projects/ProjectDetail"));
const Resume = lazy(() => import("./components/Resume/ResumeNew"));
const NotFound = lazy(() => import("./components/NotFound"));

function Loading() {
  return (
    <main style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p>Loading...</p>
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
          <Routes>
            <Route exact path="/" element={<Home />} />
            <Route exact path="/project" element={<Projects asPage />} />
            <Route exact path="/project/:slug" element={<ProjectDetail />} />
            <Route exact path="/about" element={<About />} />
            <Route exact path="/resume" element={<Resume />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
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
