import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import {
  haptic,
  installTapHaptics,
  isHapticsEnabled,
  resetHaptics,
  setHapticsEnabled,
  subscribeHaptics
} from "./haptics";

// jsdom has no vibration motor and no Web Audio, so the module is exercised
// with a stubbed navigator.vibrate plus the real guards in place for the
// audio fallback. The contract under test: pattern mapping, the opt-out
// switch, throttling, and the delegated [data-haptic] tap listener.

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

describe("haptic() pattern mapping", () => {
  test("light tap buzzes a 10ms tick", () => {
    haptic("light");
    expect(vibrate).toHaveBeenCalledWith(10);
  });

  test("medium press buzzes 18ms", () => {
    haptic("medium");
    expect(vibrate).toHaveBeenCalledWith(18);
  });

  test("success is a two-beat confirmation", () => {
    haptic("success");
    expect(vibrate).toHaveBeenCalledWith([14, 56, 22]);
  });

  test("error is a firmer two-beat", () => {
    haptic("error");
    expect(vibrate).toHaveBeenCalledWith([34, 48, 34]);
  });

  test("unknown kinds fall back to light", () => {
    haptic("nonsense");
    expect(vibrate).toHaveBeenCalledWith(10);
  });
});

describe("haptic() discipline", () => {
  test("rapid repeated taps collapse into one buzz", () => {
    vi.useFakeTimers();
    try {
      haptic("light");
      haptic("light");
      haptic("light");
      expect(vibrate).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });

  test("the next tap fires again once the gap has passed", () => {
    vi.useFakeTimers();
    try {
      haptic("light");
      vi.advanceTimersByTime(120);
      haptic("light");
      expect(vibrate).toHaveBeenCalledTimes(2);
    } finally {
      vi.useRealTimers();
    }
  });

  test("the opt-out switch silences everything", () => {
    setHapticsEnabled(false);
    haptic("medium");
    expect(vibrate).not.toHaveBeenCalled();
  });

  test("never throws when the platform has neither vibration nor audio", () => {
    delete window.navigator.vibrate;
    expect(() => haptic("light", { touch: true })).not.toThrow();
  });
});

describe("installTapHaptics() delegated taps", () => {
  const pointerDown = (target, pointerType = "touch") => {
    const event = new Event("pointerdown", { bubbles: true });
    Object.assign(event, { pointerType, button: 0 });
    target.dispatchEvent(event);
  };

  test("[data-haptic] elements fire their declared kind on press", () => {
    const dispose = installTapHaptics();
    const button = document.createElement("button");
    button.setAttribute("data-haptic", "medium");
    document.body.appendChild(button);

    try {
      pointerDown(button);
      expect(vibrate).toHaveBeenCalledWith(18);
    } finally {
      dispose();
      button.remove();
    }
  });

  test("elements without the attribute stay silent", () => {
    const dispose = installTapHaptics();
    const plain = document.createElement("button");
    document.body.appendChild(plain);

    try {
      pointerDown(plain);
      expect(vibrate).not.toHaveBeenCalled();
    } finally {
      dispose();
      plain.remove();
    }
  });

  test("mouse presses are ignored -- feedback is touch-only", () => {
    const dispose = installTapHaptics();
    const button = document.createElement("button");
    button.setAttribute("data-haptic", "light");
    document.body.appendChild(button);

    try {
      pointerDown(button, "mouse");
      expect(vibrate).not.toHaveBeenCalled();
    } finally {
      dispose();
      button.remove();
    }
  });

  test("disabled controls do not buzz", () => {
    const dispose = installTapHaptics();
    const button = document.createElement("button");
    button.setAttribute("data-haptic", "light");
    button.disabled = true;
    document.body.appendChild(button);

    try {
      pointerDown(button);
      expect(vibrate).not.toHaveBeenCalled();
    } finally {
      dispose();
      button.remove();
    }
  });

  test("the returned cleanup detaches the listener", () => {
    const dispose = installTapHaptics();
    const button = document.createElement("button");
    button.setAttribute("data-haptic", "light");
    document.body.appendChild(button);

    dispose();
    try {
      pointerDown(button);
      expect(vibrate).not.toHaveBeenCalled();
    } finally {
      button.remove();
    }
  });
});

describe("haptic() preference subscription", () => {
  test("setHapticsEnabled notifies subscribers", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeHaptics(listener);

    setHapticsEnabled(false);
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
  });

  test("unsubscribed listeners stop receiving updates", () => {
    const listener = vi.fn();
    subscribeHaptics(listener)();

    setHapticsEnabled(false);
    expect(listener).not.toHaveBeenCalled();
  });

  test("the opt-out is persisted and survives an in-memory reset", () => {
    setHapticsEnabled(false);
    resetHaptics(); // drop the cached flag; re-reads localStorage
    expect(isHapticsEnabled()).toBe(false);
  });
});
