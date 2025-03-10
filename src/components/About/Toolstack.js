import React, { useEffect } from "react";
import Tooltip from 'react-tooltip';
import { Col, Row } from "react-bootstrap";
import {
  SiVisualstudiocode,
  SiPostman,
  SiWindows,
  SiGithub,
  SiGit,
  SiAmazonaws,
} from "react-icons/si";

function Toolstack() {
  useEffect(() => {
    // Initialize tooltips when component mounts
    window.ReactTooltip && window.ReactTooltip.rebuild();
  }, []);

  return (
    <>
      <Row style={{ justifyContent: "center", paddingBottom: "50px" }}>
        <Col xs={4} md={2} className="tech-icons">
          <SiWindows data-tip="Windows" data-for="tooltip-windows" />
        </Col>
        <Col xs={4} md={2} className="tech-icons">
          <SiVisualstudiocode data-tip="Visual Studio Code" data-for="tooltip-vscode" />
        </Col>
        <Col xs={4} md={2} className="tech-icons">
          <SiPostman data-tip="Postman" data-for="tooltip-postman" />
        </Col>
        <Col xs={4} md={2} className="tech-icons">
          <SiGithub data-tip="GitHub" data-for="tooltip-github" />
        </Col>
        <Col xs={4} md={2} className="tech-icons">
          <SiGit data-tip="Git" data-for="tooltip-git" />
        </Col>
        <Col xs={4} md={2} className="tech-icons">
          <SiAmazonaws data-tip="AWS" data-for="tooltip-aws" />
        </Col>
      </Row>
      {/* Add the Tooltip component once at the bottom */}
      <Tooltip place="top" type="dark" effect="solid" id="tooltip-windows" />
      <Tooltip place="top" type="dark" effect="solid" id="tooltip-vscode" />
      <Tooltip place="top" type="dark" effect="solid" id="tooltip-postman" />
      <Tooltip place="top" type="dark" effect="solid" id="tooltip-github" />
      <Tooltip place="top" type="dark" effect="solid" id="tooltip-git" />
      <Tooltip place="top" type="dark" effect="solid" id="tooltip-aws" />
    </>
  );
}

export default Toolstack;
