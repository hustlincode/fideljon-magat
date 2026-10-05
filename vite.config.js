import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite replaces react-scripts for this project. The previous webpack pipeline
// needed --openssl-legacy-provider on Node 17+ for MD4 hashing; esbuild/Rollup
// do not, so that flag is gone.
//
// Serves the serverless functions in api/ during local development, so
// `npm start` and production share one code path. Vercel provides these in
// production; here they are mounted as Vite middleware.
//
// Each handler is written against Vercel's express-flavoured req/res, which is
// shimmed below.
const apiFunctions = (routes) => ({
  name: "api-functions",
  configureServer(server) {
    const loadHandler = (file) =>
      server
        .ssrLoadModule(file)
        .then((mod) => mod.default)
        .catch(async () => null);

    const shimResponse = (res) => {
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
    };

    const readBody = (req) =>
      new Promise((resolve, reject) => {
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

    // The API routes only ever handle these verbs, so anything else is passed
    // through to the rest of the Vite middleware chain.
    const ALLOWED = ["GET", "POST", "OPTIONS"];

    for (const route of routes) {
      const file = `${route}.js`;

      server.middlewares.use(route, async (req, res, next) => {
        if (!ALLOWED.includes(req.method)) return next();

        try {
          const handler = await loadHandler(file);
          if (!handler) return next();

          shimResponse(res);
          if (!req.body && req.method === "POST") req.body = await readBody(req);

          await handler(req, res);
        } catch (err) {
          server.config.logger.error(`[${route}] ${err?.message || err}`);
          if (!res.writableEnded) {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json; charset=utf-8");
            res.end(JSON.stringify({ error: "Malformed request body." }));
          }
        }
      });
    }
  }
});

export default defineConfig({
  plugins: [
    react({
      // React 17 has no automatic JSX runtime, so keep the classic transform
      // and the explicit `import React` statements already in every component.
      jsxRuntime: "classic"
    }),
    apiFunctions(["/api/chat", "/api/visits"])
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
    css: false,
    optimizeDeps: {
      include: [
        "src/components/Home/Home",
        "src/components/About/About",
        "src/components/Projects/Projects",
        "src/components/Projects/ProjectDetail",
        "src/components/Resume/ResumeNew",
        "src/components/NotFound"
      ]
    }
  }
});
