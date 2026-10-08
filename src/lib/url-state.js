/**
 * The app's navigable state lives in the URL query string, so every view and
 * filter combination can be bookmarked and shared:
 *
 *   ?view=paths&path=distributed-systems
 *   ?q=kafka&cat=data&type=blog&topic=databases,performance&sort=az
 */
import { PATH_BY_ID } from "../data/paths.js";
import { CATEGORY_BY_ID, TOPIC_BY_ID, TYPE_BY_ID } from "../data/taxonomy.js";

export const VIEWS = ["explore", "paths", "saved"];
export const SORTS = ["curated", "az"];

export const DEFAULT_STATE = Object.freeze({
  view: "explore",
  q: "",
  category: "all",
  type: "all",
  topics: Object.freeze([]),
  sort: "curated",
  path: "",
});

const isCategory = (value) => value === "essentials" || CATEGORY_BY_ID.has(value);

/** Parses a query string, ignoring unknown or invalid values. */
export function parseState(search) {
  const params = new URLSearchParams(search);
  const view = params.get("view");
  const category = params.get("cat");
  const type = params.get("type");
  const sort = params.get("sort");
  const path = params.get("path");
  const topics = (params.get("topic") ?? "").split(",").filter((topic) => TOPIC_BY_ID.has(topic));

  return {
    view: VIEWS.includes(view) ? view : DEFAULT_STATE.view,
    q: (params.get("q") ?? "").slice(0, 100),
    category: isCategory(category) ? category : DEFAULT_STATE.category,
    type: TYPE_BY_ID.has(type) ? type : DEFAULT_STATE.type,
    topics: [...new Set(topics)],
    sort: SORTS.includes(sort) ? sort : DEFAULT_STATE.sort,
    path: PATH_BY_ID.has(path) ? path : DEFAULT_STATE.path,
  };
}

/** Serializes only what differs from the defaults and matters for the view. */
export function serializeState(state) {
  const params = new URLSearchParams();
  if (state.view !== DEFAULT_STATE.view) params.set("view", state.view);
  if (state.view === "explore") {
    if (state.q.trim()) params.set("q", state.q.trim());
    if (state.category !== DEFAULT_STATE.category) params.set("cat", state.category);
    if (state.type !== DEFAULT_STATE.type) params.set("type", state.type);
    if (state.topics.length) params.set("topic", state.topics.join(","));
    if (state.sort !== DEFAULT_STATE.sort) params.set("sort", state.sort);
  }
  if (state.view === "paths" && state.path) params.set("path", state.path);
  return params.toString().replaceAll("%2C", ",");
}

/** True when any directory filter differs from the default. */
export function hasActiveFilters(state) {
  return Boolean(
    state.q.trim() ||
      state.category !== DEFAULT_STATE.category ||
      state.type !== DEFAULT_STATE.type ||
      state.topics.length,
  );
}
