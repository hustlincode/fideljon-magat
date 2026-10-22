import React from "react";
import { describe, expect, test } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";

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

describe("ProjectCarousel shot rail", () => {
  test("lists every screenshot and jumps to the one that is picked", () => {
    render(<ProjectCarousel slides={SLIDES} title="Demo project" />);

    const rail = screen.getByRole("radiogroup", { name: "Demo project screenshots" });
    const options = within(rail).getAllByRole("radio");
    expect(options).toHaveLength(2);

    fireEvent.click(options[1]);

    expect(screen.getByText("2 / 2")).toBeInTheDocument();
    expect(screen.getByText("Second view")).toBeInTheDocument();
    expect(options[1]).toHaveAttribute("aria-checked", "true");
    expect(options[0]).toHaveAttribute("aria-checked", "false");
  });

  test("keeps only the current shot in the tab order", () => {
    render(<ProjectCarousel slides={SLIDES} title="Demo project" />);

    const options = within(screen.getByRole("radiogroup")).getAllByRole("radio");
    expect(options[0]).toHaveAttribute("tabindex", "0");
    expect(options[1]).toHaveAttribute("tabindex", "-1");
  });

  test("moves between shots with the arrow keys inside the rail", () => {
    render(<ProjectCarousel slides={SLIDES} title="Demo project" />);

    const options = within(screen.getByRole("radiogroup")).getAllByRole("radio");
    options[0].focus();

    fireEvent.keyDown(options[0], { key: "ArrowRight" });

    expect(screen.getByText("2 / 2")).toBeInTheDocument();
    expect(options[1]).toHaveFocus();
  });

  test("does not render a rail for a project with one screenshot", () => {
    render(<ProjectCarousel slides={[SLIDES[0]]} title="Demo project" />);

    expect(screen.queryByRole("radiogroup")).toBeNull();
  });
});

describe("ProjectCarousel full-screen preview", () => {
  const openPreview = (name = "View full size: First screenshot") =>
    fireEvent.click(screen.getByRole("button", { name }));

  test("opens the shot in a full-screen preview", () => {
    render(<ProjectCarousel slides={SLIDES} title="Demo project" />);

    openPreview();

    const dialog = screen.getByRole("dialog", { name: "Demo project image preview" });
    expect(within(dialog).getByText("1 / 2")).toBeInTheDocument();
    expect(within(dialog).getByText("First view")).toBeInTheDocument();
    expect(dialog.querySelector("figure img")).toHaveAttribute("src", "/one.png");
    expect(within(dialog).getByRole("button", { name: "Close preview" })).toHaveFocus();
  });

  test("closes on Escape and gives focus back to the shot", async () => {
    render(<ProjectCarousel slides={SLIDES} title="Demo project" />);
    const trigger = screen.getByRole("button", {
      name: "View full size: First screenshot"
    });

    fireEvent.click(trigger);
    fireEvent.keyDown(document, { key: "Escape" });

    expect(screen.queryByRole("dialog")).toBeNull();
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  test("walks the shots with the arrow keys while previewing", () => {
    render(<ProjectCarousel slides={SLIDES} title="Demo project" />);

    openPreview();
    fireEvent.keyDown(document, { key: "ArrowRight" });

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText("2 / 2")).toBeInTheDocument();
    expect(within(dialog).getByText("Second view")).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "ArrowLeft" });
    expect(within(dialog).getByText("1 / 2")).toBeInTheDocument();
  });

  test("dismisses on the backdrop but not on the photograph", () => {
    render(<ProjectCarousel slides={SLIDES} title="Demo project" />);

    openPreview();
    const dialog = screen.getByRole("dialog");

    fireEvent.click(dialog.querySelector("figure"));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    fireEvent.click(dialog);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  test("keeps Tab inside the preview", () => {
    render(<ProjectCarousel slides={SLIDES} title="Demo project" />);

    openPreview();
    const dialog = screen.getByRole("dialog");
    const next = within(dialog).getByRole("button", { name: "Next image" });

    next.focus();
    fireEvent.keyDown(document, { key: "Tab" });

    expect(within(dialog).getByRole("button", { name: "Close preview" })).toHaveFocus();
  });

  test("previews a single screenshot without shot controls", () => {
    render(<ProjectCarousel slides={[SLIDES[0]]} title="Demo project" />);

    openPreview();

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText("First view")).toBeInTheDocument();
    expect(within(dialog).queryByRole("button", { name: "Next image" })).toBeNull();
    expect(within(dialog).queryByText(/1 \/ 1/)).toBeNull();
  });
});
