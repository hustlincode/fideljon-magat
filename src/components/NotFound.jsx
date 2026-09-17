import React from "react";

export default function NotFound() {
  return (
    <main style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
      <h1 style={{ fontSize: "4rem", fontWeight: 800 }}>404</h1>
      <p style={{ fontSize: "1.25rem", opacity: 0.8 }}>Page not found</p>
      <a href="/" style={{ marginTop: "1rem" }}>Go home</a>
    </main>
  );
}
