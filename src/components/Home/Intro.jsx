import React from "react";
import Reveal from "../Reveal";
import Timeline from "../Timeline";

function Intro() {
  return (
    <section className="section" id="intro">
      <div className="container-x intro-grid">
        <div className="intro-sticky">
          <Reveal>
            <p className="eyebrow">01 &mdash; Intro</p>
            <h2 className="display-1">
              Let me <span className="serif-accent">introduce</span> myself
            </h2>
          </Reveal>
        </div>

        <div>
          <Reveal className="intro-body" delay={80}>
            <p className="lede">
              I fell in love with programming and have gained substantial
              experience in the field ever since.
            </p>
            <p className="body-copy">
              I am proficient in <span className="hl">PHP, JavaScript, and MySQL</span>,
              and my interests include developing new{" "}
              <span className="hl">web technologies and products</span>.
            </p>
            <p className="body-copy">
              I am passionate about building products using{" "}
              <span className="hl">Node.js</span> and modern JavaScript libraries
              and frameworks such as <span className="hl">React.js and Next.js</span> —
              always aiming for clean, maintainable, and scalable code.
            </p>
          </Reveal>

          <Reveal delay={120}>
            <Timeline />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export default Intro;
