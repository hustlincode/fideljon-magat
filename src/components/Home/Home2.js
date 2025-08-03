import { Container, Row, Col } from "react-bootstrap";
import myImg from "../../Assets/avatar.svg";
import Tilt from "react-parallax-tilt";
import {
  AiFillGithub,
  AiFillInstagram,
  AiFillFacebook,
} from "react-icons/ai";
import { FaXTwitter } from "react-icons/fa6";
import { FaLinkedinIn } from "react-icons/fa";
import { 
  FaGraduationCap, 
  FaCode, 
  FaBuilding, 
} from "react-icons/fa";

// Timeline Component
const CareerTimeline = () => {
  const experiences = [
    {
      title: "Junior Software Developer",
      company: "Servo IT Solutions OPC",
      year: "2025",
      icon: <FaBuilding />,
      type: "work"
    },
    {
      title: "Associate Software Developer",
      company: "Servo IT Solutions OPC",
      year: "2024",
      icon: <FaBuilding />,
      type: "work"
    },
    {
      title: "BS Information Technology",
      company: "Pampanga State Agricultural University",
      year: "2024",
      icon: <FaGraduationCap />,
      type: "education"
    },
    {
      title: "Hello World! 👋",
      company: "Wrote my first line of code",
      year: "2021",
      icon: <FaCode />,
      type: "milestone"
    },
  ];

  return (
    <div className="career-timeline-container">
      <h1 style={{ fontSize: "2.6em", color: "#fff", textAlign: "center", marginBottom: "50px" }}>
        MY <span className="purple">CAREER</span> JOURNEY
      </h1>
      
      <div className="timeline-wrapper">
        <div className="timeline-line"></div>
        
        {experiences.map((exp, index) => (
          <div key={index} className={`timeline-item ${index % 2 === 0 ? 'left' : 'right'}`}>
            <div className="timeline-content">
              <div className="timeline-icon">
                {exp.icon}
              </div>
              <div className="timeline-card">
                <div className="timeline-year">{exp.year}</div>
                <h3 className="timeline-title">{exp.title}</h3>
                <p className="timeline-company">{exp.company}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

function Home2() {
  return (
    <Container fluid className="home-about-section" id="about">
      <Container>
        <Row>
          <Col md={8} className="home-about-description">
            <h1 style={{ fontSize: "2.6em" }}>
              LET ME <span className="purple"> INTRODUCE </span> MYSELF
            </h1>
            <p className="home-about-body">
              I fell in love with programming and have gained substantial experience in the field.
              <br />
              <br />I am proficient in
              <i>
                <b className="purple"> PHP, JavaScript, and MySQL. </b>
              </i>
              <br />
              <br />
              My interests include developing new &nbsp;
              <i>
                <b className="purple">Web Technologies and Products. </b>
              </i>
              <br />
              <br />
              I am passionate about building products using <b className="purple">Node.js</b> and
              <i>
                <b className="purple">
                  {" "}modern JavaScript libraries and frameworks
                </b>
              </i>
              &nbsp; such as
              <i>
                <b className="purple"> React.js and Next.js.</b>
              </i>
            </p>
          </Col>
          <Col md={4} className="myAvtar">
            <Tilt>
              <img src={myImg} className="img-fluid" alt="avatar" />
            </Tilt>
          </Col>
        </Row>
        <Row>
          <Col md={12} className="home-career-timeline">
            <CareerTimeline />
          </Col>
        </Row>
      </Container>
    </Container>
  );
}

export default Home2;