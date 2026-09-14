import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext({ theme: "dark", toggleTheme: () => {} });

function getInitialTheme() {
  // The app is prerendered in Node at build time, where there is no window.
  // Fall back to the default theme there; index.html's inline boot script sets
  // the real attribute before paint in the browser.
  if (typeof window === "undefined") return "dark";
  try {
    const saved = window.localStorage.getItem("fjm-theme");
    if (saved === "dark" || saved === "light") return saved;
  } catch (err) {}
  if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
    return "light";
  }
  return "dark";
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.setAttribute("data-theme", theme);
    try {
      window.localStorage.setItem("fjm-theme", theme);
    } catch (err) {}
  }, [theme]);

  const toggleTheme = () =>
    setTheme((current) => (current === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
