/**
 * JSON state persisted in localStorage, shared across components and tabs.
 *
 * Storage can be unavailable (private browsing, blocked cookies), so values
 * live in an in-memory cache that is the source of truth for rendering, and
 * every storage access is wrapped in try/catch. The server snapshot is always
 * "nothing stored", which keeps hydration consistent.
 */
import { useCallback, useMemo, useSyncExternalStore } from "react";

const cache = new Map();
const listeners = new Map();

function readRaw(key) {
  if (!cache.has(key)) {
    let raw = null;
    try {
      raw = window.localStorage.getItem(key);
    } catch {
      // Storage unavailable: fall back to memory for this session.
    }
    cache.set(key, raw);
  }
  return cache.get(key);
}

function writeRaw(key, raw) {
  cache.set(key, raw);
  try {
    window.localStorage.setItem(key, raw);
  } catch {
    // Storage unavailable or full: the in-memory value still works.
  }
  listeners.get(key)?.forEach((listener) => listener());
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (!event.key || !cache.has(event.key)) return;
    cache.set(event.key, event.newValue);
    listeners.get(event.key)?.forEach((listener) => listener());
  });
}

function parse(raw, fallback) {
  if (raw == null) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

/** Like useState, but persisted. `fallback` must be a stable (module-level) value. */
export function useStoredState(key, fallback) {
  const subscribe = useCallback(
    (listener) => {
      if (!listeners.has(key)) listeners.set(key, new Set());
      listeners.get(key).add(listener);
      return () => listeners.get(key).delete(listener);
    },
    [key],
  );
  const raw = useSyncExternalStore(subscribe, () => readRaw(key), () => null);
  const value = useMemo(() => parse(raw, fallback), [raw, fallback]);

  const setValue = useCallback(
    (next) => {
      const current = parse(readRaw(key), fallback);
      const resolved = typeof next === "function" ? next(current) : next;
      writeRaw(key, JSON.stringify(resolved));
    },
    [key, fallback],
  );

  return [value, setValue];
}
