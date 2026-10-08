import { useDeferredValue, useMemo, useState } from "react";
import { RESOURCES } from "../data/resources/index.js";
import { CATEGORIES, CATEGORY_BY_ID, CATEGORY_GROUPS, TOPICS, TYPE_BY_ID, TYPES } from "../data/taxonomy.js";
import { setAppState } from "../hooks/useAppState.js";
import { buildIndex, countByCategory, filterResources, groupByCategory, sortResults, tokenize } from "../lib/search.js";
import { DEFAULT_STATE, hasActiveFilters } from "../lib/url-state.js";
import { SITE, suggestUrl } from "../site.config.js";
import AppLink from "./AppLink.jsx";
import Icon from "./Icon.jsx";
import ResourceCard from "./ResourceCard.jsx";

const INDEX = buildIndex(RESOURCES);
const PREVIEW_COUNT = 6;
const VISIBLE_TOPICS = 10;
const ESSENTIALS = {
  label: "Essentials",
  description: "The must-reads: the resources we would hand to any engineer who wants to get better, fast.",
};

/** If the page is scrolled past the results, bring their top back under the sticky toolbar. */
function scrollToResults() {
  const anchor = document.getElementById("results-top");
  const toolbar = document.querySelector(".toolbar");
  if (!anchor || !toolbar) return;
  const navHeight = document.querySelector(".nav")?.offsetHeight ?? 0;
  const top = anchor.getBoundingClientRect().top + window.scrollY - navHeight - toolbar.offsetHeight - 12;
  if (window.scrollY > top) window.scrollTo({ top });
}

function clearFilters() {
  setAppState({ q: "", category: DEFAULT_STATE.category, type: DEFAULT_STATE.type, topics: [] });
}

function Select({ label, value, options, onChange }) {
  return (
    <label className="select">
      <span className="sr-only">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <Icon name="chevron-down" size={16} className="select__chevron" />
    </label>
  );
}

function Toolbar({ state, results, hasQuery }) {
  function handleQuery(event) {
    setAppState({ q: event.target.value }, { history: "debounce" });
    scrollToResults();
  }

  function handleKeyDown(event) {
    if (event.key !== "Escape") return;
    if (state.q) {
      event.preventDefault();
      setAppState({ q: "" });
    } else {
      event.currentTarget.blur();
    }
  }

  function clearQuery() {
    setAppState({ q: "" });
    document.getElementById("search")?.focus();
  }

  function surpriseMe() {
    const { resource } = results[Math.floor(Math.random() * results.length)];
    window.open(resource.url, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="toolbar">
      <div className="toolbar__inner" role="search">
        <div className="search">
          <Icon name="search" className="search__icon" />
          <label htmlFor="search" className="sr-only">
            Search resources
          </label>
          <input
            id="search"
            className="search__input"
            type="search"
            value={state.q}
            onChange={handleQuery}
            onKeyDown={handleKeyDown}
            placeholder={`Search ${RESOURCES.length} resources — try “kafka” or “Alex Xu”`}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="search"
          />
          {state.q ? (
            <button type="button" className="search__clear" onClick={clearQuery} aria-label="Clear search">
              <Icon name="x" size={16} />
            </button>
          ) : (
            <kbd className="search__kbd" aria-hidden="true">
              /
            </kbd>
          )}
        </div>
        <div className="toolbar__controls">
          <Select
            label="Format"
            value={state.type}
            onChange={(type) => {
              setAppState({ type });
              scrollToResults();
            }}
            options={[{ value: "all", label: "All formats" }, ...TYPES.map((type) => ({ value: type.id, label: type.label }))]}
          />
          <Select
            label="Sort order"
            value={state.sort}
            onChange={(sort) => setAppState({ sort })}
            options={[
              { value: "curated", label: hasQuery ? "Best match" : "Curated" },
              { value: "az", label: "A → Z" },
            ]}
          />
          <button
            type="button"
            className="btn btn--ghost toolbar__random"
            onClick={surpriseMe}
            disabled={results.length === 0}
            title="Open a random resource from the current results"
          >
            <Icon name="shuffle" size={16} />
            <span>Surprise me</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function CategoryNav({ active, counts }) {
  const item = (id, label, count, icon) => (
    <li key={id}>
      <AppLink
        to={{ category: id }}
        className={`catnav__item${active === id ? " is-active" : ""}${count === 0 ? " is-empty" : ""}`}
        aria-current={active === id ? "true" : undefined}
        onNavigate={scrollToResults}
      >
        {icon && <Icon name={icon} size={14} filled />}
        <span className="catnav__label">{label}</span>
        <span className="catnav__count">{count}</span>
      </AppLink>
    </li>
  );

  return (
    <nav className="catnav" aria-label="Categories">
      <ul className="catnav__list">
        {item("all", "All resources", counts.all)}
        {item("essentials", "Essentials", counts.essentials, "star")}
      </ul>
      {CATEGORY_GROUPS.map((group) => (
        <div className="catnav__group" key={group.id}>
          <p className="catnav__heading">{group.label}</p>
          <ul className="catnav__list">
            {CATEGORIES.filter((category) => category.group === group.id).map((category) =>
              item(category.id, category.label, counts.byCategory.get(category.id) ?? 0),
            )}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function TopicFilter({ active }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? TOPICS : TOPICS.filter((topic, i) => i < VISIBLE_TOPICS || active.includes(topic.id));
  const hidden = TOPICS.length - visible.length;

  function toggle(id) {
    setAppState({ topics: active.includes(id) ? active.filter((topic) => topic !== id) : [...active, id] });
    scrollToResults();
  }

  return (
    <div className="topics" role="group" aria-label="Filter by topic">
      {visible.map((topic) => (
        <button
          key={topic.id}
          type="button"
          className="chip"
          aria-pressed={active.includes(topic.id)}
          onClick={() => toggle(topic.id)}
        >
          {topic.label}
        </button>
      ))}
      {hidden > 0 && (
        <button type="button" className="chip chip--more" onClick={() => setExpanded(true)}>
          +{hidden} more topics
        </button>
      )}
      {expanded && (
        <button type="button" className="chip chip--more" onClick={() => setExpanded(false)}>
          Show fewer
        </button>
      )}
    </div>
  );
}

function ResultsBar({ count, state, filtersActive }) {
  const context = [];
  if (state.q.trim()) context.push(`matching “${state.q.trim()}”`);
  if (state.type !== "all") context.push(`· ${TYPE_BY_ID.get(state.type).label} only`);
  if (state.topics.length) context.push(`· ${state.topics.length === 1 ? "1 topic" : `${state.topics.length} topics`}`);

  return (
    <div className="results-bar">
      <p className="results-bar__count" role="status">
        <strong>{count}</strong> {count === 1 ? "resource" : "resources"} {context.join(" ")}
      </p>
      {filtersActive && (
        <button type="button" className="link-btn" onClick={clearFilters}>
          <Icon name="x" size={14} /> Clear filters
        </button>
      )}
    </div>
  );
}

function CategoryHeader({ id }) {
  const category = id === "essentials" ? ESSENTIALS : CATEGORY_BY_ID.get(id);
  return (
    <div className="category-head">
      <h3 className="category-head__title">
        {id === "essentials" && <Icon name="star" filled size={18} />} {category.label}
      </h3>
      <p className="category-head__desc">{category.description}</p>
    </div>
  );
}

function EmptyState({ query }) {
  const suggest = suggestUrl(SITE.repoUrl);
  return (
    <div className="empty">
      <div className="empty__icon">
        <Icon name="search" size={22} />
      </div>
      <h3 className="empty__title">{query.trim() ? `Nothing matches “${query.trim()}”` : "No resources match these filters"}</h3>
      <p className="empty__text">
        Try a broader search or remove a filter.{suggest && " Know a great resource that's missing?"}
      </p>
      <div className="empty__actions">
        <button type="button" className="btn btn--secondary" onClick={clearFilters}>
          Clear filters
        </button>
        {suggest && (
          <a className="btn btn--ghost" href={suggest} target="_blank" rel="noopener noreferrer">
            Suggest a resource
          </a>
        )}
      </div>
    </div>
  );
}

export default function Directory({ state, savedIds, onToggleSave }) {
  const query = useDeferredValue(state.q);
  const tokens = useMemo(() => tokenize(query), [query]);
  const filters = useMemo(
    () => ({ q: query, category: state.category, type: state.type, topics: state.topics }),
    [query, state.category, state.type, state.topics],
  );
  const results = useMemo(() => filterResources(INDEX, filters), [filters]);
  const counts = useMemo(() => countByCategory(INDEX, filters), [filters]);

  const overview = state.category === "all" && state.sort === "curated" && tokens.length === 0;
  const groups = useMemo(() => (overview ? groupByCategory(results, CATEGORIES) : []), [overview, results]);
  const sorted = useMemo(
    () => (overview ? [] : sortResults(results, state.sort, tokens.length > 0)),
    [overview, results, state.sort, tokens.length],
  );

  const card = (result, heading) => (
    <ResourceCard
      key={result.resource.id}
      resource={result.resource}
      saved={savedIds.has(result.resource.id)}
      onToggleSave={onToggleSave}
      tokens={tokens}
      heading={heading}
    />
  );

  return (
    <section id="directory" className="directory" aria-labelledby="directory-title">
      <div className="container">
        <header className="section-head">
          <h2 id="directory-title" className="section-title">
            The directory
          </h2>
          <p className="section-sub">
            Filter by category, format, or topic. Filters live in the URL, so any view can be bookmarked or shared.
          </p>
        </header>

        <Toolbar state={state} results={results} hasQuery={tokens.length > 0} />

        <div className="directory__layout">
          <CategoryNav active={state.category} counts={counts} />

          <div className={`directory__results${query !== state.q ? " is-stale" : ""}`}>
            <span id="results-top" className="results-anchor" />
            <TopicFilter active={state.topics} />
            {state.category !== "all" && <CategoryHeader id={state.category} />}
            <ResultsBar count={results.length} state={state} filtersActive={hasActiveFilters(state)} />

            {results.length === 0 && <EmptyState query={state.q} />}

            {overview &&
              groups.map(({ category, results: groupResults }) => (
                <section key={category.id} className="group" aria-labelledby={`group-${category.id}`}>
                  <header className="group__head">
                    <div>
                      <h3 id={`group-${category.id}`} className="group__title">
                        {category.label}
                      </h3>
                      <p className="group__desc">{category.description}</p>
                    </div>
                    {groupResults.length > PREVIEW_COUNT && (
                      <AppLink to={{ category: category.id }} className="group__more" onNavigate={scrollToResults}>
                        View all {groupResults.length} <Icon name="arrow-right" size={15} />
                      </AppLink>
                    )}
                  </header>
                  <div className="grid">{groupResults.slice(0, PREVIEW_COUNT).map((result) => card(result, "h4"))}</div>
                </section>
              ))}

            {!overview && results.length > 0 && <div className="grid">{sorted.map((result) => card(result, "h3"))}</div>}
          </div>
        </div>
      </div>
    </section>
  );
}
