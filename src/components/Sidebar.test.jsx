import React from "react";
import { describe, expect, test } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";

import Sidebar from "./Sidebar";
import { ThemeProvider } from "../theme/ThemeContext";

// Regression guard for the browser warning:
//   "Blocked aria-hidden on an element because its descendant retained focus."
//
// Two separate problems had to be fixed:
//   1. the drawer is hidden with visibility only, so its links stayed in the
//      tab order while the container was aria-hidden -> `inert`.
//   2. `inert` prevents focus but does NOT blur an element that already has it.
//      Following a drawer link left focus on that link while the menu closed,
//      so focus had to be moved out explicitly.

const renderSidebar = () =>
  render(
    <ThemeProvider>
      <BrowserRouter>
        <Sidebar />
      </BrowserRouter>
    </ThemeProvider>
  );

describe("Sidebar mobile drawer accessibility", () => {
  test("closed drawer is inert, so its links cannot take focus while aria-hidden", () => {
    const { container } = renderSidebar();
    const menu = container.querySelector("#mobile-menu");

    expect(menu).not.toBeNull();
    expect(menu.hasAttribute("inert")).toBe(true);
    expect(menu.getAttribute("aria-hidden")).toBe("true");
  });

  test("opening the drawer clears inert so the links become usable", () => {
    const { container } = renderSidebar();
    const menu = container.querySelector("#mobile-menu");

    fireEvent.click(screen.getByLabelText("Open menu"));

    expect(menu.hasAttribute("inert")).toBe(false);
    expect(menu.getAttribute("aria-hidden")).toBe("false");
    expect(menu.querySelectorAll("a").length).toBeGreaterThan(0);
  });

  test("closing the drawer restores inert", () => {
    const { container } = renderSidebar();
    const menu = container.querySelector("#mobile-menu");

    fireEvent.click(screen.getByLabelText("Open menu"));
    fireEvent.click(screen.getByLabelText("Close menu"));

    expect(menu.hasAttribute("inert")).toBe(true);
  });

  // The exact reported case: focus was on <a.nav-link.mobile-menu-link.active>
  // while its ancestor carried aria-hidden.
  test("following a drawer link moves focus out before the drawer goes aria-hidden", () => {
    const { container } = renderSidebar();
    const menu = container.querySelector("#mobile-menu");

    fireEvent.click(screen.getByLabelText("Open menu"));

    const link = menu.querySelector("a.nav-link.mobile-menu-link");
    expect(link).not.toBeNull();

    // Put focus on the link, then activate it, which closes the drawer.
    link.focus();
    expect(document.activeElement).toBe(link);

    fireEvent.click(link);

    // Drawer is hidden again, and focus must no longer live inside it.
    expect(menu.getAttribute("aria-hidden")).toBe("true");
    expect(menu.contains(document.activeElement)).toBe(false);
  });

  test("focus returns to the drawer toggle after closing", () => {
    const { container } = renderSidebar();
    const menu = container.querySelector("#mobile-menu");

    fireEvent.click(screen.getByLabelText("Open menu"));

    const link = menu.querySelector("a.nav-link.mobile-menu-link");
    link.focus();
    fireEvent.click(link);

    const toggle = screen.getByLabelText(/^(Open|Close) menu$/);
    expect(document.activeElement).toBe(toggle);
  });

  test("closing with a drawer link focused leaves no focused element inside the drawer", () => {
    const { container } = renderSidebar();
    const menu = container.querySelector("#mobile-menu");

    fireEvent.click(screen.getByLabelText("Open menu"));

    const link = menu.querySelector("a.nav-link.mobile-menu-link");
    link.focus();
    fireEvent.click(screen.getByLabelText("Close menu"));

    expect(menu.contains(document.activeElement)).toBe(false);
  });
});
