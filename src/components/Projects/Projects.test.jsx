import React from "react";
import { describe, expect, test } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import Projects from "./Projects";

const renderProjects = (props = {}) =>
  render(
    <MemoryRouter>
      <Projects {...props} />
    </MemoryRouter>
  );

describe("Projects index", () => {
  test("separates work projects from personal projects", () => {
    renderProjects({ asPage: true });

    expect(
      screen.getByRole("heading", { level: 2, name: "Work projects" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "Personal projects" })
    ).toBeInTheDocument();

    expect(screen.getByRole("link", { name: /View Salesportal/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /View XOLF/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /View Aether Dental/ })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /View Code Review Assistant/ })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /View SLFreemed/ })).toBeInTheDocument();
  });

  test("home keeps personal projects collapsed behind the more button", () => {
    renderProjects();

    expect(screen.queryByRole("link", { name: /View SLFreemed/ })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "+ 1 more" }));

    expect(screen.getByRole("link", { name: /View SLFreemed/ })).toBeInTheDocument();
  });
});
