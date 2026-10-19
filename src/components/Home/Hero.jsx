import React, { useRef } from "react";
import Type from "./Type";
import useSplitTextReveal from "../../hooks/useSplitTextReveal";

function Hero() {
  const headingRef = useRef(null);

  useSplitTextReveal(headingRef, { type: "chars", stagger: 0.014 });

  return (
    <section className="hero" id="home">
      <div className="container-x">
        <h1 ref={headingRef} className="hero-name">
          Fidel Jon Magat<span className="hero-dot">.</span>
        </h1>

        <div className="hero-role-row rise rise-d2">
          <span className="text-secondary">&mdash;</span>
          <Type />
        </div>

        <p className="hero-desc body-copy rise rise-d3">
          Experienced in developing systems for hospitality industry, focusing
          on solving complex real-world challenges through continuous
          innovation and impactful technology.
        </p>

        <div className="hero-links rise rise-d4">
          <span className="status-chip">
            <span className="status-dot" aria-hidden="true"></span>
            Available for opportunities
          </span>
          <a href="#intro" className="hero-more link-sweep" data-haptic="light">
            &darr; More about me
          </a>
        </div>

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
        </div>
      </div>
    </section>
  );
}

export default Hero;
