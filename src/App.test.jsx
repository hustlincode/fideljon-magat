import React from "react";
import { afterEach, expect, test, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import App from "./App";

const ORIGINAL_FETCH = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = ORIGINAL_FETCH;
  vi.restoreAllMocks();
});

test("renders the hero with the owner name", async () => {
  // The hero mounts the visitor badge, which requests /api/visits. jsdom does
  // not implement fetch, so without a stub that request never settles and the
  // render stalls. Answering 503 is the realistic "no storage configured" case
  // and keeps the badge hidden.
  globalThis.fetch = vi.fn(async () => ({
    ok: false,
    status: 503,
    json: async () => ({ count: null })
  }));

  render(<App />);

  // Routes are code-split behind Suspense, so wait for the lazy chunk rather
  // than sleeping for a fixed period.
  const heading = await screen.findByRole("heading", { level: 1, name: /FIDEL JON/i });
  expect(heading).toBeInTheDocument();

  // With no visitor count available the badge must not appear.
  await waitFor(() => expect(screen.queryByText(/visitors/i)).toBeNull());
});
