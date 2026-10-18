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
  // The sidebar mounts the visitor badge, which requests /api/visits. jsdom
  // does not implement fetch, so without a stub that request never settles and
  // the render stalls. Answering 503 is the realistic "no storage configured"
  // case and keeps the badge hidden.
  globalThis.fetch = vi.fn(async () => ({
    ok: false,
    status: 503,
    json: async () => ({ count: null })
  }));

  render(<App />);

  // Routes are code-split behind Suspense, so wait for the lazy chunk rather
  // than sleeping for a fixed period. The explicit timeout is deliberate: on a
  // cold first run (vite still transforming the Home chunk) the default 1000ms
  // can expire mid-resolution, which made this test flake under load.
  const heading = await screen.findByRole(
    "heading",
    { level: 1, name: /FIDEL JON/i },
    { timeout: 6000 }
  );
  expect(heading).toBeInTheDocument();

  // With no visitor count available the badge must not appear.
  await waitFor(() => expect(screen.queryByText(/visitors/i)).toBeNull());
});
