/**
 * The catalog. Each category lives in its own file (named after the category
 * id) so contributions stay small and reviewable.
 *
 * @typedef {Object} Link
 * @property {string} title Article title (for `picks`) — or `label` for `links`.
 * @property {string} url
 *
 * @typedef {Object} Resource
 * @property {string} id            Stable kebab-case id (used for bookmarks).
 * @property {string} name
 * @property {string} url
 * @property {string} category      Assigned from the file the entry lives in.
 * @property {string} type          One of TYPES.
 * @property {string[]} topics      One or more of TOPICS.
 * @property {string} description   One or two sentences, under 200 characters.
 * @property {string} [author]
 * @property {"free"|"freemium"|"paid"} [cost]
 * @property {boolean} [featured]   Marks an “Essential” resource.
 * @property {string|false} [logo]  Domain to use for the icon, or false for a monogram.
 * @property {{title: string, url: string}[]} [picks]  Recommended first reads.
 * @property {{label: string, url: string}[]} [links]  Alternate links (e.g. read online).
 */
import { CATEGORIES } from "../taxonomy.js";
import ai from "./ai.js";
import bigTech from "./big-tech.js";
import career from "./career.js";
import consumer from "./consumer.js";
import data from "./data.js";
import engineers from "./engineers.js";
import fintech from "./fintech.js";
import fundamentals from "./fundamentals.js";
import infra from "./infra.js";
import interviews from "./interviews.js";
import languages from "./languages.js";
import lld from "./lld.js";
import marketplaces from "./marketplaces.js";
import media from "./media.js";
import papers from "./papers.js";
import saas from "./saas.js";
import security from "./security.js";
import systemDesign from "./system-design.js";

export const RESOURCES_BY_CATEGORY = {
  "system-design": systemDesign,
  lld,
  interviews,
  fundamentals,
  papers,
  engineers,
  career,
  ai,
  security,
  languages,
  media,
  "big-tech": bigTech,
  consumer,
  marketplaces,
  saas,
  fintech,
  infra,
  data,
};

/** @type {Resource[]} */
export const RESOURCES = CATEGORIES.flatMap((category) =>
  (RESOURCES_BY_CATEGORY[category.id] ?? []).map((item) => ({ ...item, category: category.id })),
);

export const RESOURCE_BY_ID = new Map(RESOURCES.map((resource) => [resource.id, resource]));
