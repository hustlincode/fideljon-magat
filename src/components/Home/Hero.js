import React from "react";
import Type from "./Type";

function Hero() {
  return (
    <section className="hero" id="home">
      <div className="container-x">
        <span className="status-chip rise rise-d1">
          <span className="status-dot" aria-hidden="true"></span>
          Available for opportunities
        </span>

        <h1 className="display-hero hero-title">
          <span className="rise rise-d2" style={{ display: "block" }}>
            FIDEL JON
          </span>
          <span className="rise rise-d3 outline-word" style={{ display: "block" }}>
            MAGAT<span style={{ WebkitTextStroke: "0", color: "var(--accent)" }}>.</span>
          </span>
        </h1>

        <div className="hero-role-row rise rise-d4">
          <span className="text-secondary">&mdash;</span>
          <Type />
        </div>
          
         <p className="hero-desc body-copy rise rise-d5">
          Experienced in developing systems for hospitality industry, focusing on solving complex real-world challenges through continuous innovation and impactful technology.
        </p>

        <div className="hero-meta rise rise-d5">
          <div className="hero-meta-left">
            <div className="hero-meta-item">
              LOCATION<strong>Angeles City, PH</strong>
            </div>
            <div className="hero-meta-item">
              FOCUS<strong>Full-stack Web Development</strong>
            </div>
            <div className="hero-meta-item">
              CURRENTLY<strong>Servo IT Solutions OPC</strong>
            </div>
          </div>
          <a href="#intro" className="scroll-cue" aria-label="Scroll to introduction">
            SCROLL
            <span className="scroll-cue-line" aria-hidden="true"></span>
          </a>
        </div>
      </div>
    </section>
  );
}

export default Hero;
