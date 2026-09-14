import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite replaces react-scripts for this project. The previous webpack pipeline
// needed --openssl-legacy-provider on Node 17+ for MD4 hashing; esbuild/Rollup
// do not, so that flag is gone.
//
// The dev server also has to serve the Gemini proxy that Vercel provides in
// production as a serverless function (api/chat.js). Mounting that same handler
// here keeps `npm start` and production on one code path, so the API key stays
// server-side in both.
const geminiProxy = () => ({
  name: "gemini-proxy",
  configureServer(server) {
    server.middlewares.use("/api/chat", async (req, res, next) => {
      if (req.method !== "POST" && req.method !== "OPTIONS") return next();

      try {
        const { default: handler } = await server.ssrLoadModule("/api/chat.js");

        // Mirror Vercel's express-flavoured req/res that the handler expects.
        if (typeof res.status !== "function") {
          res.status = (code) => {
            res.statusCode = code;
            return res;
          };
        }
        if (typeof res.json !== "function") {
          res.json = (body) => {
            if (!res.getHeader("Content-Type")) {
              res.setHeader("Content-Type", "application/json; charset=utf-8");
            }
            res.end(JSON.stringify(body));
            return res;
          };
        }

        if (!req.body) {
          req.body = await new Promise((resolve, reject) => {
            const chunks = [];
            let size = 0;

            req.on("data", (chunk) => {
              size += chunk.length;
              if (size > 64 * 1024) {
                reject(new Error("Request body too large"));
                req.destroy();
                return;
              }
              chunks.push(chunk);
            });
            req.on("end", () => {
              const raw = Buffer.concat(chunks).toString("utf8");
              if (!raw) return resolve({});
              try {
                resolve(JSON.parse(raw));
              } catch (err) {
                reject(err);
              }
            });
            req.on("error", reject);
          });
        }

        await handler(req, res);
      } catch (err) {
        server.config.logger.error(`[gemini-proxy] ${err?.message || err}`);
        if (!res.writableEnded) {
          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json; charset=utf-8");
          res.end(JSON.stringify({ error: "Malformed request body." }));
        }
      }
    });
  }
});

export default defineConfig({
  plugins: [
    react({
      // React 17 has no automatic JSX runtime, so keep the classic transform
      // and the explicit `import React` statements already in every component.
      jsxRuntime: "classic"
    }),
    geminiProxy()
  ],
  // Keeps the app working on Vercel and any host serving from the domain root.
  base: "/",
  server: {
    port: 3000,
    open: false,
    watch: {
      // Loading api/chat.js through ssrLoadModule makes Node's ESM loader write
      // a sibling ".chat.js.<pid>.<uuid>.tmpdir/" while compiling. Vite then
      // tries to watch it, and on Windows that races with the cleanup and kills
      // the dev server with EBUSY. These paths are transient, so ignore them.
      ignored: ["**/.*.tmpdir/**", "**/*.tmp"]
    }
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
