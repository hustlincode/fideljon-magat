import React from "react";
import { describe, expect, test } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";

import Navbar from "./Navbar";
import { ThemeProvider } from "../theme/ThemeContext";

// Regression guard for the browser warning:
//   "Blocked aria-hidden on an element because its descendant retained focus."
//
// Two separate problems had to be fixed:
//   1. the menu is hidden with opacity/visibility only, so its links stayed in
//      the tab order while the container was aria-hidden -> `inert`.
//   2. `inert` prevents focus but does NOT blur an element that already has it.
//      Following a menu link left focus on that link while the menu closed, so
//      focus had to be moved out explicitly.

const renderNavbar = () =>
  render(
    <ThemeProvider>
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    </ThemeProvider>
  );

describe("Navbar mobile menu accessibility", () => {
  test("closed menu is inert, so its links cannot take focus while aria-hidden", () => {
    const { container } = renderNavbar();
    const menu = container.querySelector("#mobile-menu");

    expect(menu).not.toBeNull();
    expect(menu.hasAttribute("inert")).toBe(true);
    expect(menu.getAttribute("aria-hidden")).toBe("true");
  });

  test("opening the menu clears inert so the links become usable", () => {
    const { container } = renderNavbar();
    const menu = container.querySelector("#mobile-menu");

    fireEvent.click(screen.getByLabelText("Open menu"));

    expect(menu.hasAttribute("inert")).toBe(false);
    expect(menu.getAttribute("aria-hidden")).toBe("false");
    expect(menu.querySelectorAll("a").length).toBeGreaterThan(0);
  });

  test("closing the menu restores inert", () => {
    const { container } = renderNavbar();
    const menu = container.querySelector("#mobile-menu");

    fireEvent.click(screen.getByLabelText("Open menu"));
    fireEvent.click(screen.getByLabelText("Close menu"));

    expect(menu.hasAttribute("inert")).toBe(true);
  });

  // The exact reported case: focus was on <a.nav-link.mobile-menu-link.active>
  // while its ancestor carried aria-hidden.
  test("following a menu link moves focus out before the menu goes aria-hidden", () => {
    const { container } = renderNavbar();
    const menu = container.querySelector("#mobile-menu");

    fireEvent.click(screen.getByLabelText("Open menu"));

    const link = menu.querySelector("a.nav-link.mobile-menu-link");
    expect(link).not.toBeNull();

    // Put focus on the link, then activate it, which closes the menu.
    link.focus();
    expect(document.activeElement).toBe(link);

    fireEvent.click(link);

    // Menu is hidden again, and focus must no longer live inside it.
    expect(menu.getAttribute("aria-hidden")).toBe("true");
    expect(menu.contains(document.activeElement)).toBe(false);
  });

  test("focus returns to the menu toggle after closing", () => {
    const { container } = renderNavbar();
    const menu = container.querySelector("#mobile-menu");

    fireEvent.click(screen.getByLabelText("Open menu"));

    const link = menu.querySelector("a.nav-link.mobile-menu-link");
    link.focus();
    fireEvent.click(link);

    const toggle = screen.getByLabelText(/^(Open|Close) menu$/);
    expect(document.activeElement).toBe(toggle);
  });

  test("closing with a menu link focused leaves no focused element inside the menu", () => {
    const { container } = renderNavbar();
    const menu = container.querySelector("#mobile-menu");

    fireEvent.click(screen.getByLabelText("Open menu"));

    const link = menu.querySelector("a.nav-link.mobile-menu-link");
    link.focus();
    fireEvent.click(screen.getByLabelText("Close menu"));

    expect(menu.contains(document.activeElement)).toBe(false);
  });
});
