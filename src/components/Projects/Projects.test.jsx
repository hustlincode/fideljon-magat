import React from "react";
import { afterEach, describe, expect, test } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import Projects from "./Projects";

const renderProjects = (props = {}) =>
  render(
    <MemoryRouter>
      <Projects {...props} />
    </MemoryRouter>
  );

// The hover preview only mounts where a pointer exists, so the pointer
// capability has to be faked before the list renders.
const originalMatchMedia = window.matchMedia;

const supportHover = () => {
  window.matchMedia = (media) => ({
    matches: media.includes("(hover: hover)"),
    media,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false
  });
};

afterEach(() => {
  window.matchMedia = originalMatchMedia;
});

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

describe("Projects hover preview", () => {
  test("parks a large screenshot beside the list when a row is hovered", () => {
    supportHover();
    renderProjects({ asPage: true });

    fireEvent.mouseEnter(screen.getByRole("link", { name: /View Aether Dental/ }));

    const plate = document.querySelector(".project-preview");
    expect(plate).not.toBeNull();
    expect(plate.getAttribute("aria-hidden")).toBe("true");
    expect(plate.querySelector(".project-preview-name").textContent).toBe(
      "Aether Dental"
    );
    expect(
      plate.querySelector(".project-preview-frame img").getAttribute("src")
    ).toContain("Aether-dental-homepage");
  });

  test("offers every extra screenshot of a project", () => {
    supportHover();
    renderProjects({ asPage: true });

    fireEvent.mouseEnter(screen.getByRole("link", { name: /View Aether Dental/ }));

    const plate = document.querySelector(".project-preview");
    // The hero shot plus the five gallery shots.
    expect(plate.querySelectorAll(".project-preview-thumb")).toHaveLength(6);
  });

  test("stays out of the way for a project with a single screenshot", () => {
    supportHover();
    renderProjects({ asPage: true });

    fireEvent.mouseEnter(screen.getByRole("link", { name: /View XOLF/ }));

    const plate = document.querySelector(".project-preview");
    expect(plate.querySelectorAll(".project-preview-thumb")).toHaveLength(0);
    expect(plate.querySelector(".project-preview-name").textContent).toBe("XOLF");
  });

  test("does not mount at all without a pointer", () => {
    renderProjects({ asPage: true });

    fireEvent.mouseEnter(screen.getByRole("link", { name: /View Aether Dental/ }));

    expect(document.querySelector(".project-preview")).toBeNull();
  });
});
