import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import ProjectCard from "./ProjectCards";
import Particle from "../Particle";
import slfreemed from "../../Assets/Projects/slfreemed.png";
import salesportal from "../../Assets/Projects/Salesportal.png";
import onlinecheckin from "../../Assets/Projects/XOLF.png";
// import fjmPortfolio from "../../Assets/Projects/FJM.png";

function Projects() {
  return (
    <Container fluid className="project-section">
      <Particle />
      <Container>
        <h1 className="project-heading">
          My Recent <strong className="purple">Works</strong>
        </h1>
        <p style={{ color: "white" }}>
          Here are some of the recent projects I've worked on and ongoing developments.
        </p>
        <Row style={{ justifyContent: "center", paddingBottom: "10px" }}>
          <Col md={4} className="project-card">
            <ProjectCard
              imgPath={salesportal}
              isBlog={true}
              title="Salesportal | Banquet Sales Management"
              description="A sales portal for Banquuet, a company that provides food and catering services. Built with Bootstrap, HTML, and JQuery, PHP, and MySQL. Features include user authentication, product management, order processing, and real-time updates."
            />
          </Col>
          <Col md={4} className="project-card">
            <ProjectCard
              imgPath={onlinecheckin}
              isBlog={true}
              title="XOLF | Online Check-in System"
              description="An online check-in system for XOLF, a company that provides online check-in services. Built with React, Node.js, AWS Lambda, and DynamoDB. Features include user authentication, booking management, and real-time updates."
              // ghLink="https://github.com/hustlincode/Capstone_Arc2-main"
              // demoLink="https://diy.book-direct.us/19fdec76-68f7-11f0-b32c-088fc31ba6b5/7"
            />
          </Col>
          {/* <Col md={4} className="project-card">
            <ProjectCard
              imgPath={fjmPortfolio}
              isBlog={false}
              title="Portfolio | FJM"
              description="A personal portfolio website to showcase my skills, projects, and experience as a web front-end developer. Built with React, Bootstrap, and CSS, this portfolio highlights my proficiency in creating responsive and visually appealing web applications."
              ghLink="https://github.com/hustlincode/FideljonPortfolio"
              demoLink="https://hustlincode.github.io/FideljonPortfolio/"
            />
          </Col> */}
          <Col md={4} className="project-card">
            <ProjectCard
              imgPath={slfreemed}
              isBlog={true}
              title="SLFreemed | Medicine Inventory"
              description="A school capstone project: an inventory system to manage the stocks of medicines. Built with HTML, CSS, JavaScript, PHP, and MySQL (XAMPP). Features include stock management, record management, QR prescriptions, report generation."
              // ghLink="https://github.com/hustlincode/Capstone_Arc2-main"
              // demoLink="http://sllibrenggamot.free.nf/index.php"
            />
          </Col>
        </Row>
      </Container>
    </Container>
  );
}

export default Projects;
