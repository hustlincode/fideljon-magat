import React from "react";
import { describe, expect, test } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import ProjectCarousel from "./ProjectCarousel";

const SLIDES = [
  { src: "/one.png", alt: "First screenshot", caption: "First view" },
  { src: "/two.png", alt: "Second screenshot", caption: "Second view" }
];

describe("ProjectCarousel", () => {
  test("renders controls for multiple screenshots and advances", () => {
    render(<ProjectCarousel slides={SLIDES} title="Demo project" />);

    expect(screen.getByText("1 / 2")).toBeInTheDocument();
    expect(screen.getByText("First view")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Next image" }));

    expect(screen.getByText("2 / 2")).toBeInTheDocument();
    expect(screen.getByText("Second view")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Previous image" })).toBeInTheDocument();
  });

  test("wraps to the last screenshot from the first", () => {
    render(<ProjectCarousel slides={SLIDES} title="Demo project" />);

    fireEvent.click(screen.getByRole("button", { name: "Previous image" }));

    expect(screen.getByText("2 / 2")).toBeInTheDocument();
    expect(screen.getByText("Second view")).toBeInTheDocument();
  });

  test("keeps a single screenshot static", () => {
    render(<ProjectCarousel slides={[SLIDES[0]]} title="Demo project" />);

    expect(screen.getByAltText("First screenshot")).toBeInTheDocument();
    expect(screen.getByText("First view")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Next image" })).toBeNull();
    expect(screen.queryByText("1 / 1")).toBeNull();
  });
});
