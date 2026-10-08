/**
 * Catalog integrity: catches typos, broken references, and duplicates before
 * they reach the site. Run with `npm test`.
 */
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { ICONS } from "../src/data/icons.generated.js";
import { PATHS } from "../src/data/paths.js";
import { RESOURCE_BY_ID, RESOURCES } from "../src/data/resources/index.js";
import { SPOTLIGHT } from "../src/data/spotlight.js";
import { CATEGORIES, CATEGORY_BY_ID, COSTS, TOPIC_BY_ID, TYPE_BY_ID } from "../src/data/taxonomy.js";

const ALLOWED_KEYS = new Set([
  "id",
  "name",
  "url",
  "category",
  "type",
  "topics",
  "description",
  "author",
  "cost",
  "featured",
  "logo",
  "picks",
  "links",
]);
const ICON_DIR = fileURLToPath(new URL("../public/icons/", import.meta.url));

function assertHttpsUrl(value, where) {
  let url;
  assert.doesNotThrow(() => (url = new URL(value)), `${where}: invalid URL ${value}`);
  assert.equal(url.protocol, "https:", `${where}: use https (${value})`);
}

describe("resources", () => {
  it("has a healthy number of entries", () => {
    assert.ok(RESOURCES.length >= 300, `only ${RESOURCES.length} resources`);
  });

  it("uses unique, kebab-case ids", () => {
    const seen = new Set();
    for (const { id } of RESOURCES) {
      assert.match(id, /^[a-z0-9]+(-[a-z0-9]+)*$/, `bad id "${id}"`);
      assert.ok(!seen.has(id), `duplicate id "${id}"`);
      seen.add(id);
    }
  });

  it("never lists the same URL twice", () => {
    const seen = new Map();
    for (const { id, url } of RESOURCES) {
      const key = url.replace(/\/$/, "").toLowerCase();
      assert.ok(!seen.has(key), `"${id}" and "${seen.get(key)}" share ${url}`);
      seen.set(key, id);
    }
  });

  for (const resource of RESOURCES) {
    it(`"${resource.id}" is well-formed`, () => {
      const where = resource.id;
      for (const key of Object.keys(resource)) assert.ok(ALLOWED_KEYS.has(key), `${where}: unknown field "${key}"`);

      assert.ok(resource.name?.trim(), `${where}: missing name`);
      assert.ok(resource.name.length <= 110, `${where}: name too long`);
      assertHttpsUrl(resource.url, where);
      assert.ok(CATEGORY_BY_ID.has(resource.category), `${where}: unknown category ${resource.category}`);
      assert.ok(TYPE_BY_ID.has(resource.type), `${where}: unknown type ${resource.type}`);

      assert.ok(Array.isArray(resource.topics) && resource.topics.length > 0, `${where}: needs at least one topic`);
      assert.equal(new Set(resource.topics).size, resource.topics.length, `${where}: duplicate topics`);
      for (const topic of resource.topics) assert.ok(TOPIC_BY_ID.has(topic), `${where}: unknown topic "${topic}"`);

      const { description } = resource;
      assert.ok(description.length >= 40 && description.length <= 200, `${where}: description should be 40–200 chars (${description.length})`);
      assert.match(description, /[.)”]$/, `${where}: description should end with punctuation`);

      if ("cost" in resource) assert.ok(resource.cost in COSTS, `${where}: unknown cost "${resource.cost}"`);
      if ("featured" in resource) assert.equal(resource.featured, true, `${where}: featured should be true or omitted`);
      if ("author" in resource) assert.ok(resource.author.trim(), `${where}: empty author`);
      if ("logo" in resource) {
        assert.ok(resource.logo === false || /^[a-z0-9.-]+\.[a-z]{2,}$/.test(resource.logo), `${where}: logo must be a domain or false`);
      }

      for (const pick of resource.picks ?? []) {
        assert.ok(pick.title?.trim(), `${where}: pick without a title`);
        assertHttpsUrl(pick.url, `${where} pick`);
        assert.notEqual(pick.url, resource.url, `${where}: pick duplicates the main URL`);
      }
      for (const link of resource.links ?? []) {
        assert.ok(link.label?.trim(), `${where}: link without a label`);
        assertHttpsUrl(link.url, `${where} link`);
      }
    });
  }

  it("fills every category", () => {
    for (const category of CATEGORIES) {
      assert.ok(
        RESOURCES.some((resource) => resource.category === category.id),
        `category "${category.id}" is empty`,
      );
    }
  });

  it("only references icon files that exist", () => {
    for (const [domain, file] of Object.entries(ICONS)) {
      assert.ok(existsSync(`${ICON_DIR}${file}`), `missing public/icons/${file} for ${domain}`);
    }
  });
});

describe("learning paths", () => {
  it("have unique ids", () => {
    assert.equal(new Set(PATHS.map((path) => path.id)).size, PATHS.length);
  });

  for (const path of PATHS) {
    it(`"${path.id}" references real resources`, () => {
      assert.ok(path.title && path.summary && path.level && path.duration && path.icon, `${path.id}: missing fields`);
      assert.ok(path.steps.length >= 3, `${path.id}: too few steps`);
      assert.equal(new Set(path.steps.map((step) => step.id)).size, path.steps.length, `${path.id}: duplicate step ids`);
      for (const step of path.steps) {
        assert.ok(step.title && step.body && step.duration, `${path.id}/${step.id}: missing fields`);
        assert.ok(step.resources.length > 0, `${path.id}/${step.id}: no resources`);
        for (const id of step.resources) assert.ok(RESOURCE_BY_ID.has(id), `${path.id}/${step.id}: unknown resource "${id}"`);
        for (const link of step.links ?? []) assertHttpsUrl(link.url, `${path.id}/${step.id}`);
      }
    });
  }
});

describe("spotlight", () => {
  it("references real resources", () => {
    const ids = [SPOTLIGHT.platform, ...SPOTLIGHT.books.map((book) => book.id), ...SPOTLIGHT.free];
    for (const id of ids) assert.ok(RESOURCE_BY_ID.has(id), `spotlight references unknown resource "${id}"`);
    assert.ok(PATHS.some((path) => path.id === SPOTLIGHT.path), "spotlight path does not exist");
  });
});
