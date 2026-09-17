import React from "react";
import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "./App";

describe("App", () => {
  test("renders the hero with the owner name", async () => {
    render(<App />);

    // Suspense wraps routes; wait for lazy-loaded content to appear.
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const heading = screen.getByRole("heading", { level: 1, name: /FIDEL JON/i });
    expect(heading).toBeInTheDocument();
  });
});
