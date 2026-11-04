import React from "react";
import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ProjectDetail from "./ProjectDetail";
import { PROJECT_META } from "../../config/projectMeta.js";
import { ROUTES } from "../../config/routeMeta.js";
import clientKnowledge from "../../config/chatbotConfig.json";
import serverKnowledge from "../../../api/config/chatbotConfig.json";

const RESTRICTED = /salesportal|xolf|banquet|check[- ]in|xenia|halo protocol|invoic|journal entries|BIR-compliant/i;

const renderDetail = (slug) => render(
  <MemoryRouter initialEntries={[`/project/${slug}`]}>
    <Routes>
      <Route path="/project/:slug" element={<ProjectDetail />} />
    </Routes>
  </MemoryRouter>
);

describe("Confidential work projects", () => {
  test.each(["confidential-work-01", "confidential-work-02"])(
    "%s shows contributions and a static sanitized image",
    (slug) => {
      renderDetail(slug);
      expect(screen.getByRole("heading", { name: "My contributions" })).toBeInTheDocument();
      expect(screen.getByText("Full-stack developer")).toBeInTheDocument();
      expect(screen.getByText("NDA")).toBeInTheDocument();
      expect(screen.queryByRole("heading", { name: "Features" })).toBeNull();
      expect(screen.queryByRole("heading", { name: "Highlights" })).toBeNull();
      const image = screen.getByAltText("Permanently blurred confidential project preview");
      expect(image.getAttribute("src")).toContain(slug);
      expect(image.closest("button, a")).toBeNull();
      expect(document.querySelector(".project-carousel")).toBeNull();
      expect(document.body.textContent).not.toMatch(RESTRICTED);
    }
  );

  test("public work records, metadata, and assistant knowledge contain no restricted descriptions", () => {
    const work = PROJECT_META.filter((project) => project.category === "work");
    expect(work).toHaveLength(2);
    expect(work.map((project) => project.year)).toEqual(["2024", "2025"]);
    expect(work[0].tags).toEqual(["PHP", "jQuery", "Bootstrap", "MySQL"]);
    expect(work[1].tags).toEqual(["React", "Node.js", "AWS Lambda", "DynamoDB"]);
    expect(JSON.stringify(work)).not.toMatch(RESTRICTED);
    expect(JSON.stringify(ROUTES)).not.toMatch(RESTRICTED);
    for (const knowledge of [clientKnowledge, serverKnowledge]) {
      expect(JSON.stringify(knowledge)).not.toMatch(RESTRICTED);
      expect(knowledge.system_instruction_template).toMatch(/NDA/);
    }
  });

  test("personal case studies retain features and screenshot zoom", () => {
    renderDetail("aether-dental");
    expect(screen.getByRole("heading", { name: "Features" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Highlights" })).toBeInTheDocument();
    expect(document.querySelector(".project-carousel")).not.toBeNull();
    expect(document.querySelector(".project-confidential-figure")).toBeNull();
  });
});
