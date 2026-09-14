import React from "react";
import Reveal from "../Reveal";
import Skills from "./Skills";
import Timeline from "../Timeline";

function About() {
  return (
    <main>
      <section className="page-head container-x">
        <Reveal>
          <p className="eyebrow">About</p>
          <h1 className="display-hero">
            Know who <span className="serif-accent">I am</span>
          </h1>
        </Reveal>
      </section>

      <section className="section-tight" style={{ paddingTop: 0 }}>
        <div className="container-x">
          <div className="about-body">
            <Reveal delay={80}>
              <p>
                Hello, I am <span className="hl">Fidel Jon Magat</span> from{" "}
                <span className="hl">Angeles City, Pampanga</span>. I hold a
                Bachelor&rsquo;s degree in Information Technology from the
                Pampanga State Agricultural University.
              </p>
              <p>
                Currently, I am a junior developer at a mid-level company
                specializing in Property Management System (PMS) solutions for
                the hospitality industry. I work collaboratively with my team,
                contributing to various projects, particularly in the{" "}
                <span className="hl">banquet system</span>.
              </p>
              <p>
                My core tech stack includes <span className="hl">HTML, CSS,
                JavaScript, PHP, jQuery, AJAX, and Bootstrap</span>. I&rsquo;ve
                also contributed to an online check-in project using a
                serverless architecture — leveraging{" "}
                <span className="hl">AWS Lambda, DynamoDB, Node.js, and React</span>.
              </p>
              <p>
                I am passionate about delivering clean, maintainable, and
                scalable code. I bring a strong foundation in software
                engineering, full-stack development, database design, and cloud
                computing.
              </p>
              <p>
                Beyond my career, personal growth has been shaped by real-life
                responsibilities. As the primary support for my mother,
                I&rsquo;ve learned to manage pressure and stay accountable.
                These experiences have instilled in me a sense of resilience and
                drive that I bring into my professional life.
              </p>
              <p>
                Outside of work, I enjoy playing basketball, gaming, watching
                movies, and going on spontaneous road adventures.
              </p>
            </Reveal>

            <Reveal delay={120}>
              <blockquote className="pull-quote">
                <p>
                  &ldquo;Quality is never an accident; it is always the result of
                  consistency, sincere effort, intelligent direction and skillful
                  execution.&rdquo;
                </p>
                <cite>Fideljon Magat</cite>
              </blockquote>
            </Reveal>

            <Reveal delay={140}>
              <Timeline />
            </Reveal>
          </div>
        </div>
      </section>

      <Skills />
    </main>
  );
}

export default About;
