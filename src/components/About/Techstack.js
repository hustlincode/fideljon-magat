import React from "react";
import Tooltip from 'react-tooltip';
import { Col, Row } from "react-bootstrap";
import {
  DiJavascript1,
  DiReact,
  DiNodejs,
  // DiMongodb,
  DiMysql,
  DiPhp,
} from "react-icons/di";
import {
  // SiAmazonaws,
  SiAzuredevops,
} from "react-icons/si";

function Techstack() {
  return (
    <>
      <Row style={{ justifyContent: "center", paddingBottom: "50px" }}>
        <Col xs={4} md={2} className="tech-icons">
          <DiPhp data-tip="PHP" data-for="tooltip-php" />
        </Col>
        <Col xs={4} md={2} className="tech-icons">
          <DiJavascript1 data-tip="JavaScript" data-for="tooltip-javascript" />
        </Col>
        <Col xs={4} md={2} className="tech-icons">
          <DiNodejs data-tip="Node.js" data-for="tooltip-nodejs" />
        </Col>
        <Col xs={4} md={2} className="tech-icons">
          <DiReact data-tip="React" data-for="tooltip-react" />
        </Col>
        <Col xs={4} md={2} className="tech-icons">
          <DiMysql data-tip="MySQL" data-for="tooltip-mysql" />
        </Col>
        <Col xs={4} md={2} className="tech-icons">
          <SiAzuredevops data-tip="Azure DevOps" data-for="tooltip-azuredevops" />
        </Col>
      </Row>

      {/* Tooltips for each icon */}
      <Tooltip id="tooltip-php" place="top" type="dark" effect="solid" />
      <Tooltip id="tooltip-javascript" place="top" type="dark" effect="solid" />
      <Tooltip id="tooltip-nodejs" place="top" type="dark" effect="solid" />
      <Tooltip id="tooltip-react" place="top" type="dark" effect="solid" />
      <Tooltip id="tooltip-mysql" place="top" type="dark" effect="solid" />
      <Tooltip id="tooltip-azuredevops" place="top" type="dark" effect="solid" />
    </>
  );
}

export default Techstack;
