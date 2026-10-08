import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { RESOURCES } from "../src/data/resources/index.js";
import { CATEGORIES } from "../src/data/taxonomy.js";
import {
  buildIndex,
  countByCategory,
  filterResources,
  groupByCategory,
  highlight,
  normalize,
  sortResults,
  tokenize,
} from "../src/lib/search.js";

const index = buildIndex(RESOURCES);
const names = (results) => results.map((result) => result.resource.name);

describe("normalize & tokenize", () => {
  it("lowercases and strips diacritics", () => {
    assert.equal(normalize("Luiz André Barroso"), "luiz andre barroso");
  });

  it("splits on whitespace and drops empties", () => {
    assert.deepEqual(tokenize("  Alex   XU "), ["alex", "xu"]);
    assert.deepEqual(tokenize(""), []);
  });
});

describe("filterResources", () => {
  it("returns everything with no filters", () => {
    assert.equal(filterResources(index, {}).length, RESOURCES.length);
  });

  it("requires every query token to match", () => {
    const results = filterResources(index, { q: "alex xu" });
    assert.ok(results.length > 0);
    for (const { resource } of results) {
      const haystack = normalize(JSON.stringify(resource));
      assert.ok(haystack.includes("alex") && haystack.includes("xu"), resource.id);
    }
  });

  it("ranks name matches above description matches", () => {
    const top = names(sortResults(filterResources(index, { q: "system design interview" }), "curated", true)).slice(0, 3);
    assert.ok(top.every((name) => normalize(name).includes("system design interview")), top.join(" | "));
  });

  it("matches authors, topics, and domains", () => {
    assert.ok(names(filterResources(index, { q: "kleppmann" })).some((name) => name.includes("Designing Data-Intensive")));
    assert.ok(filterResources(index, { q: "netflixtechblog" }).length >= 1);
    assert.ok(filterResources(index, { q: "reliability" }).length > 10);
  });

  it("filters by category and essentials", () => {
    const fintech = filterResources(index, { category: "fintech" });
    assert.ok(fintech.length > 0 && fintech.every(({ resource }) => resource.category === "fintech"));
    const essentials = filterResources(index, { category: "essentials" });
    assert.ok(essentials.length > 0 && essentials.every(({ resource }) => resource.featured));
  });

  it("filters by type, and by topics with OR semantics", () => {
    const books = filterResources(index, { type: "book" });
    assert.ok(books.every(({ resource }) => resource.type === "book"));
    const either = filterResources(index, { topics: ["security", "mobile"] });
    assert.ok(either.every(({ resource }) => resource.topics.includes("security") || resource.topics.includes("mobile")));
    assert.ok(either.length > filterResources(index, { topics: ["mobile"] }).length);
  });

  it("returns nothing for gibberish", () => {
    assert.equal(filterResources(index, { q: "zzqqxx-nothing" }).length, 0);
  });
});

describe("faceting, grouping, sorting", () => {
  it("counts per category ignoring the category filter", () => {
    const counts = countByCategory(index, { q: "database", category: "fintech" });
    const sum = [...counts.byCategory.values()].reduce((a, b) => a + b, 0);
    assert.equal(sum, counts.all);
    assert.equal(counts.all, filterResources(index, { q: "database" }).length);
  });

  it("groups in taxonomy order with essentials first", () => {
    const groups = groupByCategory(filterResources(index, {}), CATEGORIES);
    assert.deepEqual(
      groups.map((group) => group.category.id),
      CATEGORIES.map((category) => category.id),
    );
    for (const { results } of groups) {
      const firstPlain = results.findIndex(({ resource }) => !resource.featured);
      if (firstPlain >= 0) assert.ok(results.slice(firstPlain).every(({ resource }) => !resource.featured));
    }
  });

  it("sorts A → Z", () => {
    const sorted = names(sortResults(filterResources(index, { category: "data" }), "az", false));
    assert.deepEqual(sorted, [...sorted].sort((a, b) => a.localeCompare(b, "en", { sensitivity: "base" })));
  });
});

describe("highlight", () => {
  it("returns the text untouched without tokens", () => {
    assert.deepEqual(highlight("Netflix TechBlog", []), [{ text: "Netflix TechBlog", match: false }]);
  });

  it("marks case-insensitive matches and merges overlaps", () => {
    assert.deepEqual(highlight("Data-Intensive Data", ["data", "ata-in"]), [
      { text: "Data-In", match: true },
      { text: "tensive ", match: false },
      { text: "Data", match: true },
    ]);
  });

  it("matches accented text", () => {
    assert.deepEqual(highlight("André", ["andre"]), [{ text: "André", match: true }]);
  });
});
