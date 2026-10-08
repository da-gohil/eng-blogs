/**
 * Learning-path progress is stored as { [pathId]: stepId[] }. Stored data can
 * be stale or hand-edited, so every reader tolerates malformed values.
 */

export function sanitizeProgress(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value)
      .filter(([, steps]) => Array.isArray(steps))
      .map(([pathId, steps]) => [pathId, steps.filter((step) => typeof step === "string")]),
  );
}

export function sanitizeSaved(value) {
  return Array.isArray(value) ? [...new Set(value.filter((id) => typeof id === "string"))] : [];
}

export function stepsDone(path, progress) {
  const done = new Set(progress[path.id] ?? []);
  return path.steps.filter((step) => done.has(step.id)).length;
}

export function toggleStep(progress, pathId, stepId) {
  const current = progress[pathId] ?? [];
  const next = current.includes(stepId) ? current.filter((id) => id !== stepId) : [...current, stepId];
  const { [pathId]: _previous, ...rest } = progress;
  return next.length ? { ...rest, [pathId]: next } : rest;
}

export function resetPath(progress, pathId) {
  const { [pathId]: _removed, ...rest } = progress;
  return rest;
}
