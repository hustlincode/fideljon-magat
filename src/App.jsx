import React from "react";
import Navbar from "./components/Navbar";
import Home from "./components/Home/Home";
import About from "./components/About/About";
import Projects from "./components/Projects/Projects";
import Footer from "./components/Footer";
import Resume from "./components/Resume/ResumeNew";
import Chatbot from "./components/Chatbot";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import Particle from "./components/Particle";
import { ThemeProvider } from "./theme/ThemeContext";
import "./style.css";

function App() {
  return (
    <ThemeProvider>
      <Router basename="">
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
      </Router>
    </ThemeProvider>
  );
}

export default App;
