import React from "react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

// The visitor badge is client-only and threshold-gated, so these tests pin both
// behaviours: it must never appear below the threshold, and a storage failure
// must leave it hidden rather than showing a zero or an error.
//
// The hook caches the count at module scope, so the module registry is reset
// before each test to give every case a clean slate.

const ORIGINAL_FETCH = globalThis.fetch;

const mockCountResponse = (payload, { ok = true, status = 200 } = {}) => {
  globalThis.fetch = vi.fn(async () => ({
    ok,
    status,
    json: async () => payload
  }));
};

const renderBadge = async () => {
  vi.resetModules();
  const { default: VisitorCount } = await import("../components/Home/VisitorCount");
  return render(<VisitorCount />);
};

beforeEach(() => {
  try {
    window.sessionStorage.clear();
  } catch {
    // Storage may be unavailable; not fatal for the component under test.
  }
});

afterEach(() => {
  globalThis.fetch = ORIGINAL_FETCH;
  vi.restoreAllMocks();
});

describe("VisitorCount badge", () => {
  test("renders nothing while the count is still loading", async () => {
    // A promise that never settles keeps the component in its initial state.
    globalThis.fetch = vi.fn(() => new Promise(() => {}));

    const { container } = await renderBadge();

    expect(container.textContent).toBe("");
  });

  test("stays hidden when the count is below the threshold", async () => {
    mockCountResponse({ count: 42, recorded: false });

    const { container } = await renderBadge();

    await waitFor(() => expect(globalThis.fetch).toHaveBeenCalled());
    expect(container.textContent).toBe("");
    expect(screen.queryByText(/visitor/i)).toBeNull();
  });

  test("stays hidden at one below the threshold boundary", async () => {
    mockCountResponse({ count: 99, recorded: false });

    const { container } = await renderBadge();

    await waitFor(() => expect(globalThis.fetch).toHaveBeenCalled());
    expect(container.textContent).toBe("");
  });

  test("appears exactly at the threshold boundary", async () => {
    mockCountResponse({ count: 100, recorded: true });

    await renderBadge();

    expect(await screen.findByText(/visitors/i)).toBeInTheDocument();
    expect(screen.getByText("100")).toBeInTheDocument();
  });

  test("formats a large count with a thousands separator", async () => {
    mockCountResponse({ count: 1240, recorded: false });

    await renderBadge();

    expect(await screen.findByText(/visitors/i)).toBeInTheDocument();
    expect(screen.getByText("1,240")).toBeInTheDocument();
  });

  test("stays hidden when storage is unavailable (503)", async () => {
    mockCountResponse({ count: null, reason: "storage-unavailable" }, { ok: false, status: 503 });

    const { container } = await renderBadge();

    await waitFor(() => expect(globalThis.fetch).toHaveBeenCalled());
    expect(container.textContent).toBe("");
  });

  test("stays hidden when the request throws", async () => {
    globalThis.fetch = vi.fn(async () => {
      throw new Error("offline");
    });

    const { container } = await renderBadge();

    await waitFor(() => expect(globalThis.fetch).toHaveBeenCalled());
    expect(container.textContent).toBe("");
  });

  test("records with POST and marks the session as recorded", async () => {
    mockCountResponse({ count: 150, recorded: true });

    await renderBadge();

    await waitFor(() => expect(globalThis.fetch).toHaveBeenCalled());
    expect(globalThis.fetch.mock.calls[0][1].method).toBe("POST");

    // The session flag is what stops a reload from counting the same visitor
    // again, so assert it was actually written.
    await waitFor(() => expect(window.sessionStorage.getItem("fjm_visits_recorded")).toBe("1"));
  });

  test("reads with GET instead of POST once the session is already recorded", async () => {
    window.sessionStorage.setItem("fjm_visits_recorded", "1");
    mockCountResponse({ count: 150, recorded: false });

    await renderBadge();

    await waitFor(() => expect(globalThis.fetch).toHaveBeenCalled());
    expect(globalThis.fetch.mock.calls[0][1].method).toBe("GET");
  });
});
