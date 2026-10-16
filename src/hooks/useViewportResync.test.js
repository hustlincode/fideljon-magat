import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import useViewportResync from "./useViewportResync";

// Minimal stand-in for the Visual Viewport API: jsdom has none, and keyboard
// detection is the whole point of the hook. `innerHeight` in jsdom is 768.
function installVisualViewport(height) {
  const listeners = new Set();
  const vv = {
    height,
    offsetTop: 0,
    offsetLeft: 0,
    addEventListener: (type, fn) => {
      if (type === "resize") listeners.add(fn);
    },
    removeEventListener: (type, fn) => {
      if (type === "resize") listeners.delete(fn);
    },
    emitResize: (nextHeight) => {
      vv.height = nextHeight;
      listeners.forEach((fn) => fn());
    },
  };
  Object.defineProperty(window, "visualViewport", {
    configurable: true,
    value: vv,
  });
  return vv;
}

afterEach(() => {
  delete window.visualViewport;
  vi.restoreAllMocks();
});

describe("useViewportResync", () => {
  it("does nothing when the Visual Viewport API is unavailable", () => {
    delete window.visualViewport;
    const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    const { unmount } = renderHook(() => useViewportResync());
    expect(scrollTo).not.toHaveBeenCalled();
    unmount();
  });

  it("nudges the scroll one pixel and back after the keyboard collapses", async () => {
    const vv = installVisualViewport(768);
    const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    const { unmount } = renderHook(() => useViewportResync());

    vv.emitResize(420); // keyboard opens
    vv.emitResize(768); // keyboard dismissed

    await vi.waitFor(() => expect(scrollTo).toHaveBeenCalledTimes(2), {
      timeout: 2000,
    });
    // At scrollY 0 the nudge goes down a pixel, then straight back.
    expect(scrollTo.mock.calls[0]).toEqual([0, 1]);
    expect(scrollTo.mock.calls[1]).toEqual([0, 0]);
    unmount();
  });

  it("ignores viewport changes too small to be a keyboard", async () => {
    const vv = installVisualViewport(768);
    const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    const { unmount } = renderHook(() => useViewportResync());

    vv.emitResize(708); // toolbar collapses
    vv.emitResize(768); // toolbar expands again

    await new Promise((resolve) => setTimeout(resolve, 400));
    expect(scrollTo).not.toHaveBeenCalled();
    unmount();
  });

  it("does not nudge while the keyboard is still open", async () => {
    const vv = installVisualViewport(768);
    const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    const { unmount } = renderHook(() => useViewportResync());

    vv.emitResize(420); // keyboard opens and stays open

    await new Promise((resolve) => setTimeout(resolve, 400));
    expect(scrollTo).not.toHaveBeenCalled();
    unmount();
  });
});
