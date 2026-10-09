#!/usr/bin/env node
/**
 * Production build:
 *   1. Bundle the client with Vite (dist/).
 *   2. Bundle a server renderer (dist-ssr/, removed afterwards).
 *   3. Prerender <App /> into dist/index.html, so the page has real content
 *      before JavaScript loads (fast first paint, crawlable links).
 *   4. Write 404.html, robots.txt and — when SITE_URL is set — sitemap.xml.
 *
 * SITE_URL (e.g. https://you.github.io/eng-blogs/) enables absolute
 * canonical/Open Graph URLs and the sitemap; the deploy workflow sets it.
 */
import { readFile, rm, writeFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "vite";
import { PATHS } from "../src/data/paths.js";
import { CATEGORIES } from "../src/data/taxonomy.js";

const root = fileURLToPath(new URL("..", import.meta.url));
const dist = `${root}dist`;
const ssrOut = `${root}dist-ssr`;

// Both bundles must agree on the build date, or hydration would mismatch.
process.env.BUILD_DATE ||= new Date().toISOString().slice(0, 10);
const buildDate = process.env.BUILD_DATE;
const siteUrl = process.env.SITE_URL ? process.env.SITE_URL.replace(/\/?$/, "/") : "";

await build({ root });
await build({
  root,
  logLevel: "warn",
  build: { ssr: "src/entry-server.jsx", outDir: ssrOut, emptyOutDir: true, copyPublicDir: false },
});

const { render } = await import(pathToFileURL(`${ssrOut}/entry-server.js`).href);
const template = await readFile(`${dist}/index.html`, "utf8");
if (!template.includes("<!--app-html-->")) {
  throw new Error("index.html is missing the <!--app-html--> placeholder.");
}
await writeFile(`${dist}/index.html`, template.replace("<!--app-html-->", render()));
await rm(ssrOut, { recursive: true, force: true });

await writeFile(`${dist}/404.html`, notFoundPage(siteUrl || "/"));
await writeFile(`${dist}/robots.txt`, `User-agent: *\nAllow: /\n${siteUrl ? `\nSitemap: ${siteUrl}sitemap.xml\n` : ""}`);
if (siteUrl) await writeFile(`${dist}/sitemap.xml`, sitemap(siteUrl, buildDate));

console.log(`\n✓ Prerendered dist/index.html${siteUrl ? ` for ${siteUrl}` : " (set SITE_URL for canonical URLs and a sitemap)"}`);

function sitemap(base, lastmod) {
  const urls = [
    "",
    "?view=paths",
    ...PATHS.map((path) => `?view=paths&path=${path.id}`),
    "?cat=essentials",
    ...CATEGORIES.map((category) => `?cat=${category.id}`),
  ];
  const entries = urls
    .map((url) => `  <url><loc>${`${base}${url}`.replaceAll("&", "&amp;")}</loc><lastmod>${lastmod}</lastmod></url>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`;
}

function notFoundPage(home) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="noindex" />
    <title>Page not found · Engineering Blogs</title>
    <link rel="icon" type="image/svg+xml" href="${home}favicon.svg" />
    <style>
      :root { color-scheme: light dark; --bg: #f5f5f7; --text: #1d1d1f; --muted: #6e6e73; --card: #fff; --border: #e8e8ed; }
      @media (prefers-color-scheme: dark) { :root { --bg: #000; --text: #f5f5f7; --muted: #a1a1a6; --card: #1c1c1e; --border: #2c2c2e; } }
      * { box-sizing: border-box; }
      body { margin: 0; min-height: 100vh; display: grid; place-items: center; padding: 24px; background: var(--bg); color: var(--text);
        font: 17px/1.47 -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", "Helvetica Neue", Arial, sans-serif; }
      main { max-width: 440px; padding: 40px 32px; text-align: center; background: var(--card); border: 1px solid var(--border); border-radius: 18px; }
      .code { font-size: 64px; font-weight: 700; letter-spacing: -0.03em; line-height: 1;
        background: linear-gradient(90deg, #0090f7, #ba62fc 50%, #f2416b 82%, #f55600); -webkit-background-clip: text; background-clip: text; color: transparent; }
      h1 { margin: 12px 0 8px; font-size: 24px; font-weight: 600; letter-spacing: -0.015em; }
      p { margin: 0 0 24px; color: var(--muted); }
      a { display: inline-block; padding: 12px 22px; border-radius: 980px; background: #0071e3; color: #fff; font-weight: 500; text-decoration: none; }
      a:hover { background: #0077ed; }
    </style>
  </head>
  <body>
    <main>
      <div class="code">404</div>
      <h1>This page doesn't exist</h1>
      <p>The link may be old or mistyped. Everything lives on the home page — search, learning paths, and your saved list.</p>
      <a href="${home}">Go to Engineering Blogs</a>
    </main>
  </body>
</html>
`;
}
