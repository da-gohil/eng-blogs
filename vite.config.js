import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import { PATHS } from "./src/data/paths.js";
import { RESOURCES } from "./src/data/resources/index.js";

/**
 * Fills the {{placeholders}} in index.html and, when SITE_URL is known,
 * injects the canonical URL and absolute Open Graph image tags.
 */
function siteHtml({ siteUrl }) {
  const meta = siteUrl
    ? [
        `<link rel="canonical" href="${siteUrl}" />`,
        `<meta property="og:url" content="${siteUrl}" />`,
        `<meta property="og:image" content="${siteUrl}og-image.png" />`,
        `<meta property="og:image:width" content="1200" />`,
        `<meta property="og:image:height" content="630" />`,
        `<meta property="og:image:alt" content="Engineering Blogs — a curated library for engineers" />`,
        `<meta name="twitter:image" content="${siteUrl}og-image.png" />`,
        `<script type="application/ld+json">${JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Engineering Blogs",
          url: siteUrl,
          description: `A curated library of ${RESOURCES.length} engineering blogs, system design resources, papers, and courses.`,
        })}</script>`,
      ].join("\n    ")
    : "";

  return {
    name: "site-html",
    transformIndexHtml(html) {
      return html
        .replaceAll("{{resourceCount}}", String(RESOURCES.length))
        .replaceAll("{{pathCount}}", String(PATHS.length))
        .replace("<!--site-meta-->", meta);
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const siteUrl = env.SITE_URL ? env.SITE_URL.replace(/\/?$/, "/") : "";
  // A relative base works on any host or sub-path (GitHub project pages,
  // user pages, custom domains) because the app is a single page.
  const base = env.BASE_PATH || "./";

  return {
    base,
    plugins: [react(), siteHtml({ siteUrl })],
    define: {
      // import.meta.env.BASE_URL differs between the client and SSR builds
      // when the base is relative, so links and icons use this instead.
      __BASE__: JSON.stringify(base),
      __BUILD_DATE__: JSON.stringify(env.BUILD_DATE || new Date().toISOString().slice(0, 10)),
    },
    server: { port: 5173 },
    preview: { port: 4173 },
    build: {
      outDir: "dist",
      sourcemap: false,
    },
  };
});
