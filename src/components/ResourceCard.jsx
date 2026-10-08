import { memo } from "react";
import { COSTS, TOPIC_BY_ID, TYPE_BY_ID } from "../data/taxonomy.js";
import { displayUrl } from "../lib/format.js";
import Highlight from "./Highlight.jsx";
import Icon from "./Icon.jsx";
import ResourceIcon from "./ResourceIcon.jsx";

const NO_TOKENS = [];
const READ_FIRST_TYPES = new Set(["blog", "newsletter", "guide"]);

/** Keeps the external-link arrow on the same line as the title's last word. */
function TitleWithArrow({ text }) {
  const split = text.lastIndexOf(" ") + 1;
  return (
    <>
      {text.slice(0, split)}
      <span className="nowrap">
        {text.slice(split)}
        <Icon name="arrow-up-right" size={13} />
      </span>
    </>
  );
}

export function SaveButton({ saved, name, onToggle, compact = false }) {
  return (
    <button
      type="button"
      className={`save-btn${saved ? " is-saved" : ""}${compact ? " save-btn--compact" : ""}`}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${name} from saved` : `Save ${name}`}
      title={saved ? "Saved — click to remove" : "Save for later"}
      onClick={onToggle}
    >
      <Icon name="bookmark" filled={saved} size={compact ? 16 : 17} />
    </button>
  );
}

function ResourceCard({ resource, saved, onToggleSave, tokens = NO_TOKENS, heading = "h3" }) {
  const Heading = heading;
  const type = TYPE_BY_ID.get(resource.type);
  // With an author, the person is more useful than the domain (e.g. "Book · Alex Xu").
  const meta = (resource.author ? [type.label, resource.author] : [displayUrl(resource.url), type.label]).join(" · ");
  const extraLinks = [
    ...(resource.picks ?? []).map((pick) => ({ ...pick, kind: "pick" })),
    ...(resource.links ?? []).map((link) => ({ title: link.label, url: link.url, kind: "link" })),
  ];
  const picksLabel = READ_FIRST_TYPES.has(resource.type) ? "Start with" : "Also";

  return (
    <article className={`card${resource.featured ? " card--featured" : ""}`}>
      <div className="card__head">
        <ResourceIcon resource={resource} />
        <div className="card__titles">
          <Heading className="card__name">
            <a className="card__link" href={resource.url} target="_blank" rel="noopener noreferrer">
              <Highlight text={resource.name} tokens={tokens} />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </Heading>
          <p className="card__meta" title={meta}>
            {meta}
          </p>
        </div>
        <SaveButton saved={saved} name={resource.name} onToggle={() => onToggleSave(resource.id)} />
      </div>

      <p className="card__desc">
        <Highlight text={resource.description} tokens={tokens} />
      </p>

      {extraLinks.length > 0 && (
        <ul className="card__extras" aria-label={`More links for ${resource.name}`}>
          {extraLinks.map((link) => (
            <li key={`${link.kind}:${link.url}`}>
              <a href={link.url} target="_blank" rel="noopener noreferrer" className={`extra extra--${link.kind}`}>
                {link.kind === "pick" && <span className="extra__label">{picksLabel}</span>}
                <span className="extra__title">
                  <TitleWithArrow text={link.title} />
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}

      <div className="card__foot">
        {resource.featured && (
          <span className="badge badge--essential">
            <Icon name="star" filled size={12} /> Essential
          </span>
        )}
        {resource.cost && <span className={`badge badge--${resource.cost}`}>{COSTS[resource.cost]}</span>}
        {resource.topics.slice(0, 2).map((topic) => (
          <span key={topic} className="tag">
            {TOPIC_BY_ID.get(topic).label}
          </span>
        ))}
      </div>
    </article>
  );
}

export default memo(ResourceCard);

/** A one-line resource row, used inside learning paths. */
export function CompactResource({ resource, saved, onToggleSave }) {
  const type = TYPE_BY_ID.get(resource.type);
  return (
    <div className="compact">
      <ResourceIcon resource={resource} size="sm" />
      <div className="compact__body">
        <a className="compact__link" href={resource.url} target="_blank" rel="noopener noreferrer">
          {resource.name}
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
        <span className="compact__meta">
          {type.label}
          {resource.author ? ` · ${resource.author}` : ` · ${displayUrl(resource.url)}`}
          {resource.cost && resource.cost !== "free" ? ` · ${COSTS[resource.cost]}` : ""}
        </span>
      </div>
      <SaveButton compact saved={saved} name={resource.name} onToggle={() => onToggleSave(resource.id)} />
    </div>
  );
}
