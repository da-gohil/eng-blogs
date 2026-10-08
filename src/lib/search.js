/**
 * Search, filtering, faceting, and grouping for the directory. Pure functions
 * over plain data, so they run identically in the browser, during prerender,
 * and in tests.
 */
import { CATEGORY_BY_ID, TOPIC_BY_ID, TYPE_BY_ID } from "../data/taxonomy.js";
import { displayUrl } from "./format.js";

/** Lowercases and strips diacritics so "André" matches "andre". */
export function normalize(text) {
  return text.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export function tokenize(query) {
  return normalize(query).split(/\s+/).filter(Boolean);
}

/** Precomputes searchable text for each resource. Build it once and reuse it. */
export function buildIndex(resources) {
  return resources.map((resource) => ({
    resource,
    name: normalize(resource.name),
    text: normalize(
      [
        resource.description,
        resource.author ?? "",
        displayUrl(resource.url),
        CATEGORY_BY_ID.get(resource.category)?.label ?? "",
        TYPE_BY_ID.get(resource.type)?.label ?? "",
        ...resource.topics.map((topic) => TOPIC_BY_ID.get(topic)?.label ?? topic),
        ...(resource.picks ?? []).map((pick) => pick.title),
      ].join(" | "),
    ),
  }));
}

/**
 * Relevance of one index entry for the query tokens. Every token must match
 * somewhere; matches in the name count far more than matches elsewhere.
 * Returns 0 when the entry does not match.
 */
export function score(entry, tokens) {
  let total = 0;
  for (const token of tokens) {
    if (entry.name.startsWith(token)) total += 10;
    else if (entry.name.includes(` ${token}`)) total += 7;
    else if (entry.name.includes(token)) total += 4;
    else if (entry.text.includes(token)) total += 1;
    else return 0;
  }
  return total + (entry.resource.featured ? 0.5 : 0);
}

/**
 * Applies the directory filters. `category` may be "all", "essentials", or a
 * category id; `topics` match if a resource has any of them.
 *
 * @returns {{ resource: object, score: number }[]} in catalog order
 */
export function filterResources(index, filters, { ignoreCategory = false } = {}) {
  const { q = "", category = "all", type = "all", topics = [] } = filters;
  const tokens = tokenize(q);
  const results = [];
  for (const entry of index) {
    const { resource } = entry;
    if (!ignoreCategory) {
      if (category === "essentials" && !resource.featured) continue;
      if (category !== "all" && category !== "essentials" && resource.category !== category) continue;
    }
    if (type !== "all" && resource.type !== type) continue;
    if (topics.length && !topics.some((topic) => resource.topics.includes(topic))) continue;
    const relevance = tokens.length ? score(entry, tokens) : 0;
    if (tokens.length && relevance === 0) continue;
    results.push({ resource, score: relevance });
  }
  return results;
}

/** Essentials first, then catalog order. Array#sort is stable, so ties keep their order. */
export function curatedOrder(results) {
  return [...results].sort((a, b) => Number(Boolean(b.resource.featured)) - Number(Boolean(a.resource.featured)));
}

export function sortResults(results, sort, hasQuery) {
  if (sort === "az") {
    return [...results].sort((a, b) => a.resource.name.localeCompare(b.resource.name, "en", { sensitivity: "base" }));
  }
  if (hasQuery) return [...results].sort((a, b) => b.score - a.score);
  return curatedOrder(results);
}

/** Result counts per category for the current filters, ignoring the category itself. */
export function countByCategory(index, filters) {
  const byCategory = new Map();
  let all = 0;
  let essentials = 0;
  for (const { resource } of filterResources(index, filters, { ignoreCategory: true })) {
    byCategory.set(resource.category, (byCategory.get(resource.category) ?? 0) + 1);
    all += 1;
    if (resource.featured) essentials += 1;
  }
  return { all, essentials, byCategory };
}

/** Groups results by category in taxonomy order, dropping empty groups. */
export function groupByCategory(results, categories) {
  const groups = new Map(categories.map((category) => [category.id, []]));
  for (const result of results) groups.get(result.resource.category)?.push(result);
  return categories
    .map((category) => ({ category, results: curatedOrder(groups.get(category.id)) }))
    .filter((group) => group.results.length > 0);
}

/**
 * Splits text into parts for highlighting the query tokens.
 * @returns {{ text: string, match: boolean }[]}
 */
export function highlight(text, tokens) {
  const haystack = normalize(text);
  // Normalization can change length for a few exotic characters; skip highlighting then.
  if (!tokens.length || haystack.length !== text.length) return [{ text, match: false }];

  const ranges = [];
  for (const token of tokens) {
    for (let at = haystack.indexOf(token); at !== -1; at = haystack.indexOf(token, at + token.length)) {
      ranges.push([at, at + token.length]);
    }
  }
  if (!ranges.length) return [{ text, match: false }];

  ranges.sort((a, b) => a[0] - b[0]);
  const merged = [];
  for (const [start, end] of ranges) {
    const last = merged.at(-1);
    if (last && start <= last[1]) last[1] = Math.max(last[1], end);
    else merged.push([start, end]);
  }

  const parts = [];
  let cursor = 0;
  for (const [start, end] of merged) {
    if (start > cursor) parts.push({ text: text.slice(cursor, start), match: false });
    parts.push({ text: text.slice(start, end), match: true });
    cursor = end;
  }
  if (cursor < text.length) parts.push({ text: text.slice(cursor), match: false });
  return parts;
}
