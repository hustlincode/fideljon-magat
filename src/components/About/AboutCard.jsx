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
            <br /> Bachelor's degree in Information Technology from Pampanga State Agricultural University.
            <br />
            <br /> Currently, I am a junior developer at a mid-level company specializing in Property Management System (PMS) solutions for the hospitality industry. I work collaboratively with my team, contributing to various projects, particularly in the banquet system.
            <br />
            <br /> My core tech stack includes HTML, CSS, JavaScript, PHP, jQuery, AJAX, and Bootstrap. I’ve also contributed to an online check-in project using a serverless architecture—leveraging AWS Lambda, DynamoDB, Node.js, and React.
            <br />
            <br /> I am passionate about delivering clean, maintainable, and scalable code. I bring a strong foundation in software engineering, full-stack development, database design, and cloud computing.
            <br />
            <br /> Beyond my career, personal growth has been shaped by real-life responsibilities. As the primary support for my mother, I’ve learned to manage pressure and stay accountable. These experiences have instilled in me a sense of resilience and drive that I bring into my professional life.
            <br />
            <br /> Outside of work, I enjoy playing basketball, gaming, watching movies, and going on spontaneous road adventures.
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
