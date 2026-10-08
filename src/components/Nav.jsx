import { SITE, STORAGE_KEYS, THEME_COLORS } from "../site.config.js";
import AppLink from "./AppLink.jsx";
import Icon from "./Icon.jsx";

const LINKS = [
  { view: "explore", label: "Explore" },
  { view: "paths", label: "Paths" },
  { view: "saved", label: "Saved" },
];

/** Flips between light and dark. Icons swap purely in CSS, so SSR output is stable. */
function ThemeToggle() {
  function toggle() {
    const root = document.documentElement;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const current = root.dataset.theme ?? (prefersDark ? "dark" : "light");
    const next = current === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try {
      window.localStorage.setItem(STORAGE_KEYS.theme, next);
    } catch {
      // The choice still applies for this visit.
    }
    for (const meta of document.querySelectorAll('meta[name="theme-color"]')) {
      meta.setAttribute("content", THEME_COLORS[next]);
    }
  }

  return (
    <button type="button" className="icon-btn theme-toggle" onClick={toggle} aria-label="Toggle dark mode" title="Toggle dark mode">
      <Icon name="moon" className="theme-toggle__moon" />
      <Icon name="sun" className="theme-toggle__sun" />
    </button>
  );
}

export default function Nav({ view, savedCount, onSearch }) {
  return (
    <header className="nav">
      <div className="container nav__inner">
        <AppLink to={{ view: "explore" }} className="brand" aria-label={`${SITE.name} — home`}>
          <span className="brand__mark">
            <Icon name="bolt" size={16} filled />
          </span>
          <span className="brand__name">{SITE.name}</span>
        </AppLink>

        <nav className="nav__links" aria-label="Primary">
          {LINKS.map((link) => (
            <AppLink
              key={link.view}
              to={{ view: link.view }}
              className="nav__link"
              aria-current={view === link.view ? "page" : undefined}
            >
              {link.label}
              {link.view === "saved" && savedCount > 0 && <span className="nav__count">{savedCount}</span>}
            </AppLink>
          ))}
        </nav>

        <div className="nav__actions">
          <button type="button" className="icon-btn search-trigger" onClick={onSearch} aria-label="Search resources" title="Search (press /)">
            <Icon name="search" />
            <kbd>/</kbd>
          </button>
          <ThemeToggle />
          {SITE.repoUrl && (
            <a className="icon-btn nav__github" href={SITE.repoUrl} target="_blank" rel="noopener noreferrer" aria-label="Source code on GitHub" title="Source on GitHub">
              <Icon name="github" />
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
