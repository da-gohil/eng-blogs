import { ICONS } from "../data/icons.generated.js";
import { iconDomain, initials, tintFor } from "../lib/format.js";
import Icon from "./Icon.jsx";

const GLYPH_TYPES = new Set(["book", "paper", "article"]);

/** A resource's logo: its favicon, a type glyph (books, papers), or a monogram. */
export default function ResourceIcon({ resource, size = "md" }) {
  const domain = iconDomain(resource);
  const file = domain ? ICONS[domain] : null;

  if (file) {
    return (
      <span className={`res-icon res-icon--${size}`}>
        <img
          src={`${__BASE__}icons/${file}`}
          alt=""
          width="32"
          height="32"
          loading="lazy"
          decoding="async"
        />
      </span>
    );
  }

  const tinted = `res-icon res-icon--${size} res-icon--tinted res-icon--tint-${tintFor(resource.name)}`;
  if (GLYPH_TYPES.has(resource.type)) {
    return (
      <span className={`${tinted} res-icon--glyph`}>
        <Icon name={resource.type} size={size === "sm" ? 15 : 19} />
      </span>
    );
  }
  return (
    <span className={`${tinted} res-icon--mono`} aria-hidden="true">
      {initials(resource.name)}
    </span>
  );
}
