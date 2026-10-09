import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { PATHS } from "../src/data/paths.js";
import { displayUrl, formatDate, iconDomain, initials, TINTS, tintFor } from "../src/lib/format.js";
import { resetPath, sanitizeProgress, sanitizeSaved, stepsDone, toggleStep } from "../src/lib/progress.js";
import { DEFAULT_STATE, hasActiveFilters, parseState, serializeState } from "../src/lib/url-state.js";

describe("URL state", () => {
  it("parses an empty query as the default state", () => {
    assert.deepEqual(parseState(""), { ...DEFAULT_STATE, topics: [] });
  });

  it("parses valid parameters", () => {
    const state = parseState("?q=kafka&cat=data&type=blog&topic=databases,performance&sort=az");
    assert.equal(state.q, "kafka");
    assert.equal(state.category, "data");
    assert.equal(state.type, "blog");
    assert.deepEqual(state.topics, ["databases", "performance"]);
    assert.equal(state.sort, "az");
  });

  it("ignores unknown or hostile values", () => {
    const state = parseState(`?view=admin&cat=<script>&type=zine&topic=nope,security,security&sort=random&path=nowhere&q=${"x".repeat(500)}`);
    assert.equal(state.view, "explore");
    assert.equal(state.category, "all");
    assert.equal(state.type, "all");
    assert.deepEqual(state.topics, ["security"]);
    assert.equal(state.sort, "curated");
    assert.equal(state.path, "");
    assert.equal(state.q.length, 100);
  });

  it("round-trips through serialize/parse", () => {
    const state = { ...DEFAULT_STATE, q: "raft", category: "papers", topics: ["distributed-systems"], sort: "az" };
    assert.deepEqual(parseState(serializeState(state)), state);
  });

  it("omits defaults and params irrelevant to the view", () => {
    assert.equal(serializeState(DEFAULT_STATE), "");
    assert.equal(serializeState({ ...DEFAULT_STATE, view: "paths", q: "ignored", path: PATHS[1].id }), `view=paths&path=${PATHS[1].id}`);
    assert.equal(serializeState({ ...DEFAULT_STATE, view: "saved", category: "data" }), "view=saved");
  });

  it("detects active filters", () => {
    assert.equal(hasActiveFilters(DEFAULT_STATE), false);
    assert.equal(hasActiveFilters({ ...DEFAULT_STATE, q: "  " }), false);
    assert.equal(hasActiveFilters({ ...DEFAULT_STATE, topics: ["security"] }), true);
  });
});

describe("learning-path progress", () => {
  const path = PATHS[0];

  it("toggles steps on and off, dropping empty paths", () => {
    let progress = toggleStep({}, path.id, path.steps[0].id);
    assert.deepEqual(progress, { [path.id]: [path.steps[0].id] });
    progress = toggleStep(progress, path.id, path.steps[1].id);
    assert.equal(stepsDone(path, progress), 2);
    progress = toggleStep(toggleStep(progress, path.id, path.steps[0].id), path.id, path.steps[1].id);
    assert.deepEqual(progress, {});
  });

  it("ignores unknown step ids when counting", () => {
    assert.equal(stepsDone(path, { [path.id]: ["not-a-step", path.steps[0].id] }), 1);
  });

  it("resets a single path", () => {
    assert.deepEqual(resetPath({ a: ["x"], b: ["y"] }, "a"), { b: ["y"] });
  });

  it("sanitizes stored data", () => {
    assert.deepEqual(sanitizeProgress(null), {});
    assert.deepEqual(sanitizeProgress([1, 2]), {});
    assert.deepEqual(sanitizeProgress({ a: ["x", 3], b: "nope" }), { a: ["x"] });
    assert.deepEqual(sanitizeSaved(["a", "a", 3, "b"]), ["a", "b"]);
    assert.deepEqual(sanitizeSaved({}), []);
  });
});

describe("format helpers", () => {
  it("shortens URLs, keeping the publication on platforms", () => {
    assert.equal(displayUrl("https://www.netflixtechblog.com/some/post"), "netflixtechblog.com");
    assert.equal(displayUrl("https://github.com/donnemartin/system-design-primer"), "github.com/donnemartin");
    assert.equal(displayUrl("https://medium.com/airbnb-engineering"), "medium.com/airbnb-engineering");
    assert.equal(displayUrl("https://www.reddit.com/r/RedditEng/"), "reddit.com/r/RedditEng");
    assert.equal(displayUrl("https://www.youtube.com/playlist?list=abc"), "youtube.com");
  });

  it("picks the icon domain", () => {
    assert.equal(iconDomain({ url: "https://blog.cloudflare.com/", type: "blog" }), "blog.cloudflare.com");
    assert.equal(iconDomain({ url: "https://medium.com/x", type: "blog", logo: "airbnb.com" }), "airbnb.com");
    assert.equal(iconDomain({ url: "https://example.com", type: "blog", logo: false }), null);
    assert.equal(iconDomain({ url: "https://www.amazon.com/dp/1", type: "book" }), null);
  });

  it("builds initials and stable Apple-color tints", () => {
    assert.equal(initials("Dan Luu"), "DL");
    assert.equal(initials("jOOQ Blog"), "JB");
    assert.equal(initials("Lil'Log (Lilian Weng)"), "L");
    assert.equal(tintFor("Dan Luu"), tintFor("Dan Luu"));
    assert.ok(TINTS.includes(tintFor("anything")));
  });

  it("formats dates in UTC", () => {
    assert.equal(formatDate("2026-10-08"), "Oct 8, 2026");
  });
});
