#!/usr/bin/env node
/**
 * Checks every URL in the catalog: resources, their picks and extra links,
 * and the extra links inside learning paths.
 *
 *   npm run check:links
 *   npm run check:links -- --only=fintech          # one category
 *   npm run check:links -- --moved                 # also list redirects to other hosts
 *   npm run check:links -- --report=link-report.md # write a Markdown report
 *
 * Exits with code 1 only when a link is definitely broken (404/410, DNS
 * failure, ...). Sites that block automated requests (401/403/429/999) are
 * reported as "blocked" and server errors or timeouts as "unreachable"; both
 * are warnings, because they are usually transient or bot protection.
 */
import { writeFile } from "node:fs/promises";
import { PATHS } from "../src/data/paths.js";
import { RESOURCES } from "../src/data/resources/index.js";

const args = Object.fromEntries(
  process.argv.slice(2).map((arg) => {
    const [key, value = "true"] = arg.replace(/^--/, "").split("=");
    return [key, value];
  }),
);

const CONCURRENCY = Number(args.concurrency ?? 10);
const TIMEOUT_MS = Number(args.timeout ?? 20_000);
const HEADERS = {
  "user-agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "accept-language": "en-US,en;q=0.9",
};
const BLOCKED_STATUSES = new Set([401, 403, 405, 406, 429, 999]);
// Hosts that work in browsers but reject or drop automated requests outright.
const BOT_WALL_HOSTS = new Set(["ai.meta.com", "rachelbythebay.com"]);

function collectLinks() {
  /** @type {Map<string, string[]>} url -> where it is used */
  const links = new Map();
  const add = (url, source) => links.set(url, [...(links.get(url) ?? []), source]);

  for (const resource of RESOURCES) {
    if (args.only && resource.category !== args.only) continue;
    add(resource.url, resource.id);
    resource.picks?.forEach((pick) => add(pick.url, `${resource.id} › pick`));
    resource.links?.forEach((link) => add(link.url, `${resource.id} › ${link.label}`));
  }
  if (!args.only) {
    for (const path of PATHS) {
      for (const step of path.steps) {
        step.links?.forEach((link) => add(link.url, `path ${path.id} › ${step.id}`));
      }
    }
  }
  return links;
}

async function request(url) {
  const response = await fetch(url, {
    headers: HEADERS,
    redirect: "follow",
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  await response.body?.cancel();
  return { status: response.status, finalUrl: response.url };
}

async function check(url) {
  let result;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      result = await request(url);
      if (result.status < 500) return result;
    } catch (error) {
      result = { status: 0, error: error.cause?.code ?? error.name ?? "Error" };
      if (result.error === "ENOTFOUND") return result;
    }
  }
  return result;
}

function classify({ url, status, error }) {
  if (status >= 200 && status < 400) return "ok";
  if (BLOCKED_STATUSES.has(status) || BOT_WALL_HOSTS.has(host(url))) return "blocked";
  if (status >= 500 || (status === 0 && error !== "ENOTFOUND")) return "unreachable";
  return "broken";
}

const host = (url) => new URL(url).hostname.replace(/^www\./, "");

async function main() {
  const links = collectLinks();
  const urls = [...links.keys()];
  const results = [];
  const startedAt = Date.now();
  let next = 0;

  async function worker() {
    while (next < urls.length) {
      const url = urls[next++];
      const result = await check(url);
      results.push({ url, sources: links.get(url), ...result, verdict: classify({ url, ...result }) });
      process.stdout.write(".");
    }
  }
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, urls.length) }, worker));
  process.stdout.write("\n");

  const byVerdict = (verdict) => results.filter((r) => r.verdict === verdict);
  const moved = results.filter((r) => r.verdict === "ok" && r.finalUrl && host(r.finalUrl) !== host(r.url));
  const seconds = ((Date.now() - startedAt) / 1000).toFixed(1);

  const line = (r) => {
    const status = r.status ? String(r.status) : r.error;
    const target = r.finalUrl && r.finalUrl !== r.url ? ` → ${r.finalUrl}` : "";
    return `  ${status.padEnd(12)} ${r.url}${target}  (${r.sources.join(", ")})`;
  };

  console.log(`Checked ${results.length} links in ${seconds}s`);
  console.log(
    `  ok ${byVerdict("ok").length} · blocked ${byVerdict("blocked").length} · ` +
      `unreachable ${byVerdict("unreachable").length} · broken ${byVerdict("broken").length}`,
  );
  for (const verdict of ["broken", "unreachable", "blocked"]) {
    const list = byVerdict(verdict);
    if (list.length) console.log(`\n${verdict.toUpperCase()}\n${list.map(line).join("\n")}`);
  }
  if (args.moved && moved.length) console.log(`\nMOVED TO ANOTHER HOST\n${moved.map(line).join("\n")}`);

  if (args.report) {
    const table = (list) =>
      ["| Status | URL | Used by |", "| --- | --- | --- |"]
        .concat(list.map((r) => `| ${r.status || r.error} | ${r.url} | ${r.sources.join(", ")} |`))
        .join("\n");
    const sections = [
      `# Link check report`,
      `Checked ${results.length} links on ${new Date().toISOString().slice(0, 10)}.`,
    ];
    if (byVerdict("broken").length) sections.push(`## Broken\n\n${table(byVerdict("broken"))}`);
    if (byVerdict("unreachable").length) sections.push(`## Unreachable (may be transient)\n\n${table(byVerdict("unreachable"))}`);
    if (byVerdict("blocked").length) sections.push(`## Blocked automated requests (check manually)\n\n${table(byVerdict("blocked"))}`);
    await writeFile(args.report, `${sections.join("\n\n")}\n`);
    console.log(`\nReport written to ${args.report}`);
  }

  process.exitCode = byVerdict("broken").length ? 1 : 0;
}

await main();
