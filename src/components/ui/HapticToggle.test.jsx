import React from "react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import HapticToggle from "./HapticToggle";
import { resetHaptics, setHapticsEnabled } from "../../lib/haptics";

// The toggle reads its state from lib/haptics and persists through it, so
// these tests stub navigator.vibrate to observe the unmute demo buzz exactly
// as the Android path behaves. CSS visibility gating (pointer: coarse) is
// not applied in jsdom, so the control is always rendered here.

let vibrate;

beforeEach(() => {
  vibrate = vi.fn();
  Object.defineProperty(window.navigator, "vibrate", {
    configurable: true,
    writable: true,
    value: vibrate
  });
  window.localStorage.clear();
  resetHaptics();
  setHapticsEnabled(true);
});

afterEach(() => {
  delete window.navigator.vibrate;
});

describe("HapticToggle", () => {
  test("renders pressed (feedback on) by default", () => {
    render(<HapticToggle />);

    const button = screen.getByRole("button", { name: /turn off haptic feedback/i });
    expect(button).toHaveAttribute("aria-pressed", "true");
  });

  test("tapping mutes feedback and persists the opt-out", () => {
    render(<HapticToggle />);

    fireEvent.click(screen.getByRole("button", { name: /turn off haptic feedback/i }));

    expect(
      screen.getByRole("button", { name: /turn on haptic feedback/i })
    ).toHaveAttribute("aria-pressed", "false");
    expect(window.localStorage.getItem("fjm-haptics")).toBe("off");
  });

  test("muting is silent -- no demo buzz on the way out", () => {
    render(<HapticToggle />);

    fireEvent.click(screen.getByRole("button", { name: /turn off haptic feedback/i }));

    expect(vibrate).not.toHaveBeenCalled();
  });

  test("unmuting buzzes once immediately so the visitor feels it", () => {
    render(<HapticToggle />);

    fireEvent.click(screen.getByRole("button", { name: /turn off haptic feedback/i }));
    fireEvent.click(screen.getByRole("button", { name: /turn on haptic feedback/i }));

    expect(vibrate).toHaveBeenCalledTimes(1);
    expect(vibrate).toHaveBeenCalledWith(18); // the "medium" confirmation
    expect(window.localStorage.getItem("fjm-haptics")).toBe("on");
  });
});
