// Tactile feedback ("haptics") for taps and confirmations.
//
// The web has two levers for this, and the portfolio uses both:
//
//   1. navigator.vibrate() -- real vibration on Android/Chrome. iOS Safari
//      has never shipped the Vibration API.
//   2. A ~45ms synthesized Web Audio tick -- an iOS-oriented fallback, gated
//      to touch pointers so desktop never makes noise. This "audio haptic"
//      is the standard technique for tactile feel on platforms without a
//      motor API; it is intentionally quiet, short, and throttled.
//
// Discipline follows Apple's HIG (the UX guidance used across this repo):
// haptics confirm meaningful actions, they do not machine-gun. Light for
// navigation and incidental taps; success/error only once an operation has
// actually resolved.
//
// Wiring: interactive elements opt in with `data-haptic="light|medium|
// success|error"`, and one delegated pointerdown listener installed by the
// app shell (installTapHaptics) fans out to all of them -- including UI
// rendered later, like the mobile menu and chat window. Async outcomes
// (form sent, request failed) call haptic(...) imperatively.
//
// A visible on/off control (HapticToggle, shown on touch devices) reads and
// writes the same persisted preference through subscribeHaptics().

const STORAGE_KEY = "fjm-haptics";

// 10ms is a "the tap registered" tick; every pattern stays under ~120ms
// total so it confirms instead of buzzing.
const PATTERNS = {
  light: 10,
  medium: 18,
  success: [14, 56, 22],
  error: [34, 48, 34]
};

// Collapse double-fired events and rapid machine-gun taps, which read as
// noise rather than feedback.
const MIN_GAP_MS = 40;

let enabled = null; // resolved lazily so SSR never touches localStorage
let audioContext = null;
let lastFiredAt = 0;

// Preference subscribers. The toggle UI (HapticToggle via the
// useHapticsEnabled hook) subscribes so a mute/unmute is reflected
// everywhere at once.
const listeners = new Set();

const canVibrate = () =>
  typeof navigator !== "undefined" && typeof navigator.vibrate === "function";

const isTouchDevice = () =>
  typeof navigator !== "undefined" && (navigator.maxTouchPoints || 0) > 0;

// Stable identity so useSyncExternalStore can depend on it directly.
export function subscribeHaptics(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const notify = () => {
  listeners.forEach((listener) => listener());
};

export function isHapticsEnabled() {
  if (enabled !== null) return enabled;
  try {
    enabled = window.localStorage.getItem(STORAGE_KEY) !== "off";
  } catch {
    enabled = true;
  }
  return enabled;
}

export function setHapticsEnabled(value) {
  enabled = Boolean(value);
  try {
    window.localStorage.setItem(STORAGE_KEY, enabled ? "on" : "off");
  } catch {
    // Private mode: the in-memory flag still works for this session.
  }
  notify();
}

// Restores the lazy initial state; used by tests and any future
// "reset preferences" affordance.
export function resetHaptics() {
  enabled = null;
  lastFiredAt = 0;
  notify();
}

// A soft "tok": a high sine dropping ~700Hz behind a 45ms decay. Kept at
// 5% gain so it registers as feel, not as sound.
const playTick = () => {
  if (typeof window === "undefined") return;
  try {
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return;

    if (!audioContext) audioContext = new Ctor();
    if (audioContext.state === "suspended") audioContext.resume();

    const t0 = audioContext.currentTime;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(1680, t0);
    osc.frequency.exponentialRampToValueAtTime(920, t0 + 0.02);

    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(0.05, t0 + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.045);

    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.start(t0);
    osc.stop(t0 + 0.05);
  } catch {
    // Audio is a bonus layer; it must never break the tap itself.
  }
};

// kind: "light" | "medium" | "success" | "error"
// options.touch: whether the gesture came from a touch pointer -- the audio
// fallback only makes sense there. Imperative calls (async outcomes) default
// to "this device has touch", pointer handlers pass the real pointer type.
export function haptic(kind = "light", { touch = isTouchDevice() } = {}) {
  if (!isHapticsEnabled()) return;

  const now = Date.now();
  if (now - lastFiredAt < MIN_GAP_MS) return;
  lastFiredAt = now;

  const pattern = PATTERNS[kind] || PATTERNS.light;

  if (canVibrate()) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // Some embedded webviews throw; feedback is optional.
    }
    return;
  }

  if (touch) playTick();
}

// One document-level listener covers every [data-haptic] surface. Call once
// from the app shell; returns the cleanup function for the effect.
export function installTapHaptics() {
  if (typeof document === "undefined") return () => {};

  const onPointerDown = (event) => {
    // Mouse taps get no feedback: desktops have no vibration motor, and the
    // audio fallback is deliberately touch-only.
    if (event.pointerType === "mouse") return;

    const target = event.target;
    const el =
      target && typeof target.closest === "function"
        ? target.closest("[data-haptic]")
        : null;
    if (!el) return;
    if (el.disabled || el.getAttribute("aria-disabled") === "true") return;

    haptic(el.getAttribute("data-haptic") || "light", {
      touch: event.pointerType === "touch"
    });
  };

  document.addEventListener("pointerdown", onPointerDown, {
    capture: true,
    passive: true
  });
  return () =>
    document.removeEventListener("pointerdown", onPointerDown, { capture: true });
}
