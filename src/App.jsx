import { useCallback, useEffect, useMemo, useState } from "react";
import AppLink from "./components/AppLink.jsx";
import Directory from "./components/Directory.jsx";
import Footer from "./components/Footer.jsx";
import Hero from "./components/Hero.jsx";
import Icon from "./components/Icon.jsx";
import Nav from "./components/Nav.jsx";
import PathCard from "./components/PathCard.jsx";
import PathsView from "./components/PathsView.jsx";
import SavedView from "./components/SavedView.jsx";
import Spotlight from "./components/Spotlight.jsx";
import { PATH_BY_ID, PATHS } from "./data/paths.js";
import { RESOURCE_BY_ID } from "./data/resources/index.js";
import { setAppState, useAppState } from "./hooks/useAppState.js";
import { useSearchHotkeys } from "./hooks/useHotkeys.js";
import { useStoredState } from "./hooks/useStoredState.js";
import { resetPath, sanitizeProgress, sanitizeSaved, stepsDone, toggleStep } from "./lib/progress.js";
import { hasActiveFilters, parseState } from "./lib/url-state.js";
import { SITE, STORAGE_KEYS } from "./site.config.js";

const NO_SAVED = [];
const NO_PROGRESS = {};

function pageTitle(state) {
  if (state.view === "paths") {
    const path = PATH_BY_ID.get(state.path);
    return `${path ? `${path.title} · ` : ""}Learning paths · ${SITE.name}`;
  }
  if (state.view === "saved") return `Saved · ${SITE.name}`;
  return `${SITE.name} — Read what the best engineers are writing`;
}

function PathsTeaser({ progress }) {
  return (
    <section className="section" aria-labelledby="paths-title">
      <div className="container">
        <header className="section-head section-head--row">
          <div>
            <h2 id="paths-title" className="section-title">
              Learning paths
            </h2>
            <p className="section-sub">
              Step-by-step roadmaps through the best resources here. Check off steps as you go — progress stays in your browser.
            </p>
          </div>
          <AppLink to={{ view: "paths" }} className="link-arrow">
            All paths <Icon name="arrow-right" size={15} />
          </AppLink>
        </header>
        <div className="path-grid">
          {PATHS.map((path) => (
            <PathCard key={path.id} path={path} done={stepsDone(path, progress)} />
          ))}
          <AppLink to={{ view: "paths" }} className="path-card path-card--cta">
            <span className="path-card__title">
              All learning paths <Icon name="chevron-right" size={16} />
            </span>
            <span className="path-card__summary">See every roadmap side by side, with your progress on each.</span>
          </AppLink>
        </div>
      </div>
    </section>
  );
}

export default function App() {
  const state = useAppState();
  const [storedSaved, setSaved] = useStoredState(STORAGE_KEYS.saved, NO_SAVED);
  const [storedProgress, setProgress] = useStoredState(STORAGE_KEYS.progress, NO_PROGRESS);
  const [toast, setToast] = useState(null);

  // Ignore ids of resources that have since been removed from the catalog.
  const saved = useMemo(() => sanitizeSaved(storedSaved).filter((id) => RESOURCE_BY_ID.has(id)), [storedSaved]);
  const savedIds = useMemo(() => new Set(saved), [saved]);
  const progress = useMemo(() => sanitizeProgress(storedProgress), [storedProgress]);

  const toggleSave = useCallback(
    (id) =>
      setSaved((current) => {
        const ids = sanitizeSaved(current);
        return ids.includes(id) ? ids.filter((savedId) => savedId !== id) : [...ids, id];
      }),
    [setSaved],
  );
  const clearSaved = useCallback(() => setSaved([]), [setSaved]);
  const handleToggleStep = useCallback(
    (pathId, stepId) => setProgress((current) => toggleStep(sanitizeProgress(current), pathId, stepId)),
    [setProgress],
  );
  const handleResetPath = useCallback(
    (pathId) => setProgress((current) => resetPath(sanitizeProgress(current), pathId)),
    [setProgress],
  );
  const notify = useCallback((message) => setToast({ message, id: Date.now() }), []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    document.title = pageTitle(state);
  }, [state]);

  useEffect(() => {
    // Deep links are hidden by index.html until the URL's state has rendered.
    const frame = requestAnimationFrame(() => {
      const root = document.documentElement;
      if (!root.classList.contains("deeplink")) return;
      root.classList.remove("deeplink");
      const initial = parseState(window.location.search);
      if (initial.view === "explore" && hasActiveFilters(initial)) {
        document.getElementById("directory")?.scrollIntoView({ behavior: "instant" });
      }
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const focusSearch = useCallback(() => {
    if (state.view !== "explore") setAppState({ view: "explore" }, { history: "push" });
    requestAnimationFrame(() => {
      const input = document.getElementById("search");
      if (!input) return;
      const { top, bottom } = input.getBoundingClientRect();
      if (top < 0 || bottom > window.innerHeight) document.getElementById("directory")?.scrollIntoView();
      input.focus({ preventScroll: true });
      input.select();
    });
  }, [state.view]);
  useSearchHotkeys(focusSearch);

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Nav view={state.view} savedCount={saved.length} onSearch={focusSearch} />
      <main id="main" tabIndex={-1}>
        {state.view === "explore" && (
          <>
            <Hero />
            <Spotlight />
            <PathsTeaser progress={progress} />
            <Directory state={state} savedIds={savedIds} onToggleSave={toggleSave} />
          </>
        )}
        {state.view === "paths" && (
          <PathsView
            pathId={state.path}
            progress={progress}
            onToggleStep={handleToggleStep}
            onResetPath={handleResetPath}
            savedIds={savedIds}
            onToggleSave={toggleSave}
          />
        )}
        {state.view === "saved" && (
          <SavedView saved={saved} savedIds={savedIds} onToggleSave={toggleSave} onClear={clearSaved} notify={notify} />
        )}
      </main>
      <Footer />
      <div className="toast-region" role="status" aria-live="polite">
        {toast && (
          <div key={toast.id} className="toast">
            <Icon name="check" size={16} /> {toast.message}
          </div>
        )}
      </div>
    </>
  );
}
