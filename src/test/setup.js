import "@testing-library/jest-dom";

// jsdom does not implement matchMedia, ResizeObserver or canvas, and several
// components (theme toggle, project hover preview, PDF preview) rely on them.
if (!window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false
  });
}

if (!window.ResizeObserver) {
  window.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

// ScrollToTop calls window.scrollTo on every route change; jsdom logs a
// "Not implemented" error for it.
window.scrollTo = () => {};

// jsdom's getContext() returns null, which breaks the particle canvas. Hand
// back a no-op 2D context: every property access resolves to a callable, so
// whichever drawing methods the canvas code reaches for are safe to call.
Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
  configurable: true,
  writable: true,
  value: () => {
    const context = new Proxy(
      {},
      {
        get: (target, prop) => {
          if (prop in target) return target[prop];
          return () => {};
        },
        set: (target, prop, value) => {
          target[prop] = value;
          return true;
        }
      }
    );

    return context;
  }
});
