import React from "react";
import Card from "react-bootstrap/Card";

function AboutCard() {
  return (
    <Card className="quote-card-view">
      <Card.Body>
        <blockquote className="blockquote mb-0">
          <p style={{ textAlign: "justify" }}>
            Hello, I am <span className="purple">Fidel Jon Magat</span> from <span className="purple">Angeles City, Pampanga</span>.
            <br />
            <br /> I have a Bachelor's degree in Information Technology from Pampanga State Agriculture University.
            <br />
            <br /> I have a strong foundation in software engineering principles and full-stack development, with a focus on delivering high-quality software solutions in a timely manner.
            <br />
            <br />With a strong foundation in software engineering principles, I specialize in full-stack development, database management, and cloud computing.
            <br />
            <br />
            <br />
          </p>
          <p style={{ color: "rgb(155 126 172)" }}>
            "Quality is never an accident; it is always the result of consistency, sincere effort, intelligent direction and skillful execution."{" "}
          </p>
          <footer className="blockquote-footer">Fideljon Magat</footer>
        </blockquote>
      </Card.Body>
    </Card>
  );
}

export default AboutCard;
