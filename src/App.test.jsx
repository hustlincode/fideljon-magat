import React from "react";
import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "./App";

describe("App", () => {
  test("renders the hero with the owner name", () => {
    render(<App />);

    // The name appears in more than one element (hero heading and footer),
    // so assert on the heading specifically.
    const heading = screen.getByRole("heading", { level: 1, name: /FIDEL JON/i });

    expect(heading).toBeInTheDocument();
  });
});
