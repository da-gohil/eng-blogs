/**
 * A tiny external store for the app's navigable state, mirrored into the URL.
 * The server snapshot is always the default state, so the prerendered HTML
 * hydrates cleanly; React then re-renders with the state from the URL.
 */
import { useSyncExternalStore } from "react";
import { DEFAULT_STATE, parseState, serializeState } from "../lib/url-state.js";

const isBrowser = typeof window !== "undefined";
const listeners = new Set();
let state = isBrowser ? parseState(window.location.search) : DEFAULT_STATE;
let pendingWrite;

function emit() {
  listeners.forEach((listener) => listener());
}

function writeUrl(method) {
  const search = serializeState(state);
  const hash = method === "pushState" ? "" : window.location.hash;
  const next = `${window.location.pathname}${search ? `?${search}` : ""}${hash}`;
  const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  if (next !== current) window.history[method](null, "", next);
}

if (isBrowser) {
  window.addEventListener("popstate", () => {
    clearTimeout(pendingWrite);
    state = parseState(window.location.search);
    emit();
  });
}

/**
 * Merges `patch` into the state and updates the URL. `history` is "push" for
 * navigation (views, categories), "replace" for filters, or "debounce" to
 * replace once typing pauses (browsers rate-limit history updates).
 */
export function setAppState(patch, { history = "replace" } = {}) {
  const next = { ...state, ...patch };
  if (Object.keys(next).every((key) => next[key] === state[key])) return;
  state = next;
  emit();
  clearTimeout(pendingWrite);
  if (history === "debounce") pendingWrite = setTimeout(() => writeUrl("replaceState"), 400);
  else writeUrl(history === "push" ? "pushState" : "replaceState");
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const getSnapshot = () => state;
const getServerSnapshot = () => DEFAULT_STATE;

export function useAppState() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** The URL for a given state, so in-app links also work in a new tab. */
export function hrefFor(target) {
  const search = serializeState({ ...DEFAULT_STATE, ...target });
  return `${__BASE__}${search ? `?${search}` : ""}`;
}
