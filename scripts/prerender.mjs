import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { build } from "vite";

// Post-build prerender (SSG).
//
// The app is a React SPA: Vercel serves index.html for every route, so the
// HTML shell is identical everywhere and crawlers / link-preview bots (which
// do not execute JavaScript) see only the generic title and description. This
// step renders each route to static HTML at build time and writes real
// per-page <title> and meta tags, while the client keeps hydrating the same
// markup so behaviour is unchanged.
//
// Rendering happens in Node, where there is no DOM. Components that touch
// window/document must guard themselves; a route that fails to render is left
// as the plain SPA shell rather than failing the whole build.

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const distDir = join(root, "dist");
const ssrDir = join(root, "node_modules", ".prerender");

// Keep in sync with src/config/routeMeta.js. "/" must be written last-ish so it
// can be written as dist/index.html.
const ROUTES = ["/", "/about", "/resume", "/project"];

const { ROUTES: routeMeta, SITE_URL, SITE_NAME } = await import(
  new URL("../src/config/routeMeta.js", import.meta.url).href
);

const { buildStructuredData } = await import(
  new URL("../src/config/structuredData.js", import.meta.url).href
);

const escapeAttr = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const replaceTag = (html, pattern, replacement) => {
  if (!pattern.test(html)) {
    console.warn(`[prerender] pattern not found, skipping: ${pattern}`);
    return html;
  }
  return html.replace(pattern, replacement);
};

const applyMeta = (html, pathname) => {
  const meta = { ...(routeMeta[pathname] ?? routeMeta["/"]), path: pathname };
  const url = `${SITE_URL}${pathname === "/" ? "/" : pathname}`;
  let out = html;

  out = replaceTag(out, /<title>[\s\S]*?<\/title>/, `<title>${escapeAttr(meta.title)}</title>`);
  out = replaceTag(
    out,
    /<meta name="description" content="[^"]*"\s*\/?>/,
    `<meta name="description" content="${escapeAttr(meta.description)}" />`
  );
  out = replaceTag(
    out,
    /<meta itemprop="name" content="[^"]*">/,
    `<meta itemprop="name" content="${escapeAttr(meta.title)}">`
  );
  out = replaceTag(
    out,
    /<meta itemprop="description" content="[^"]*">/,
    `<meta itemprop="description" content="${escapeAttr(meta.description)}">`
  );
  out = replaceTag(
    out,
    /<meta property="og:url" content="[^"]*">/,
    `<meta property="og:url" content="${escapeAttr(url)}">`
  );
  out = replaceTag(
    out,
    /<meta property="og:title" content="[^"]*">/,
    `<meta property="og:title" content="${escapeAttr(meta.title)}">`
  );
  out = replaceTag(
    out,
    /<meta property="og:description" content="[^"]*">/,
    `<meta property="og:description" content="${escapeAttr(meta.description)}">`
  );
  out = replaceTag(
    out,
    /<meta name="twitter:title" content="[^"]*">/,
    `<meta name="twitter:title" content="${escapeAttr(meta.title)}">`
  );
  out = replaceTag(
    out,
    /<meta name="twitter:description" content="[^"]*">/,
    `<meta name="twitter:description" content="${escapeAttr(meta.description)}">`
  );

  // Every page gets its own canonical URL. Vercel serves this project on more
  // than one hostname, so without a canonical each page is reachable at
  // duplicate URLs and ranking signals split between them.
  const canonical = `<link rel="canonical" href="${escapeAttr(url)}" />`;
  if (/<link rel="canonical"[^>]*>/.test(out)) {
    out = out.replace(/<link rel="canonical"[^>]*>/, canonical);
  } else {
    out = out.replace("</head>", `  ${canonical}\n</head>`);
  }

  // Structured data, injected as raw HTML so crawlers that never execute
  // JavaScript still see the Person entity.
  const jsonLd = `<script type="application/ld+json">${JSON.stringify(
    buildStructuredData({ ...meta, SITE_URL, SITE_NAME })
  )}</script>`;
  out = out.replace("</head>", `  ${jsonLd}\n</head>`);

  return out;
};

const outputPathFor = (pathname) =>
  pathname === "/" ? join(distDir, "index.html") : join(distDir, pathname.slice(1), "index.html");

const main = async () => {
  if (!existsSync(distDir)) {
    console.error("[prerender] dist/ not found - run vite build first.");
    process.exit(1);
  }

  const templatePath = join(distDir, "index.html");
  const template = readFileSync(templatePath, "utf8");

  console.log("[prerender] building SSR bundle...");
  await build({
    root,
    logLevel: "warn",
    resolve: {
      alias: [
        // react-pdf only works in a browser (canvas + DOM) and drags in
        // pdfjs-dist, which needs the optional native "canvas" package. Swap in
        // a placeholder for prerendering; the real component takes over on
        // hydration. The browser build never sees this alias.
        {
          find: /^react-pdf$/,
          replacement: join(root, "scripts", "react-pdf-stub.jsx")
        }
      ]
    },
    ssr: {
      // Bundle dependencies rather than externalising them. Some packages
      // (react-icons, for one) use directory imports that Node's ESM resolver
      // rejects, and interop between CJS/ESM deps is smoother when Rollup
      // handles them. The bundle is temporary and deleted after prerendering.
      noExternal: true
    },
    build: {
      ssr: join(root, "src", "entry-server.jsx"),
      outDir: ssrDir,
      emptyOutDir: true,
      minify: false,
      rollupOptions: {
        // pdfjs-dist (pulled in by react-pdf) tries to require the optional
        // native "canvas" package when bundled. It is not installed and is not
        // needed here, so leave the import alone and let it fail harmlessly at
        // runtime instead of breaking the bundle.
        external: ["canvas"]
      }
    }
  });

  const { render } = await import(new URL(`file://${join(ssrDir, "entry-server.js")}`).href);

  let ok = 0;

  for (const pathname of ROUTES) {
    let markup = "";

    try {
      markup = render(pathname);
    } catch (err) {
      console.warn(
        `[prerender] ${pathname} failed to render, leaving the SPA shell in place: ${err.message}`
      );
    }

    let html = applyMeta(template, pathname);

    if (markup) {
      html = html.replace(
        /<div id="root">\s*<\/div>/,
        `<div id="root">${markup}</div>`
      );
      if (!html.includes(markup.slice(0, 40))) {
        console.warn(`[prerender] ${pathname}: could not inject markup into the root div`);
      }
    }

    const target = outputPathFor(pathname);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, html);

    console.log(
      `[prerender] ${pathname.padEnd(9)} -> ${target.replace(root + "\\", "").replace(root + "/", "")}` +
        ` (${markup ? `${markup.length} chars of markup` : "shell only"})`
    );
    ok += 1;
  }

  rmSync(ssrDir, { recursive: true, force: true });

  // Sitemap. Without one, discovery depends entirely on external links, which
  // for a personal portfolio may be very few.
  const lastmod = new Date().toISOString().slice(0, 10);
  const urls = ROUTES.map((pathname) => {
    const loc = `${SITE_URL}${pathname === "/" ? "/" : pathname}`;
    const priority = pathname === "/" ? "1.0" : "0.8";
    return [
      "  <url>",
      `    <loc>${loc}</loc>`,
      `    <lastmod>${lastmod}</lastmod>`,
      "    <changefreq>monthly</changefreq>",
      `    <priority>${priority}</priority>`,
      "  </url>"
    ].join("\n");
  }).join("\n");

  const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    "</urlset>",
    ""
  ].join("\n");

  writeFileSync(join(distDir, "sitemap.xml"), sitemap);
  console.log(`[prerender] sitemap.xml written with ${ROUTES.length} urls`);

  console.log(`[prerender] done: ${ok}/${ROUTES.length} routes`);
};

main().catch((err) => {
  console.error("[prerender] failed:", err);
  process.exit(1);
});
