import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite replaces react-scripts for this project. The previous webpack pipeline
// needed --openssl-legacy-provider on Node 17+ for MD4 hashing; esbuild/Rollup
// do not, so that flag is gone.
export default defineConfig({
  plugins: [
    react({
      // React 17 has no automatic JSX runtime, so keep the classic transform
      // and the explicit `import React` statements already in every component.
      jsxRuntime: "classic"
    })
  ],
  // Keeps the app working on Vercel and any host serving from the domain root.
  base: "/",
  server: {
    port: 3000,
    open: false
  },
  build: {
    outDir: "dist",
    sourcemap: false
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.js",
    css: false
  }
});
