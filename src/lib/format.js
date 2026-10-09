/** Small, pure helpers shared by the UI, the build scripts, and the tests. */

/** Platforms where the first path segment identifies the publication. */
const PLATFORM_HOSTS = new Set(["github.com", "medium.com", "youtube.com", "reddit.com"]);

/** Resource types that show a type glyph instead of the site's favicon. */
const GLYPH_TYPES = new Set(["book", "paper", "article"]);

export function hostname(url) {
  return new URL(url).hostname.replace(/^www\./, "");
}

/** A short, readable form of a URL: "netflixtechblog.com", "github.com/ossu". */
export function displayUrl(url) {
  const { hostname: rawHost, pathname } = new URL(url);
  const host = rawHost.replace(/^www\./, "");
  const segments = pathname.split("/").filter(Boolean);
  if (!PLATFORM_HOSTS.has(host) || !segments.length || segments[0] === "playlist") return host;
  const depth = segments[0] === "r" ? 2 : 1; // reddit.com/r/<community>
  return [host, ...segments.slice(0, depth)].join("/");
}

/** The domain whose favicon represents a resource, or null for a glyph/monogram. */
export function iconDomain(resource) {
  if (resource.logo === false) return null;
  if (resource.logo) return resource.logo;
  if (GLYPH_TYPES.has(resource.type)) return null;
  return hostname(resource.url);
}

/** Up to two initials for monogram avatars: "Dan Luu" → "DL", "jOOQ Blog" → "JB". */
export function initials(name) {
  const words = name
    .replace(/\(.*?\)/g, "")
    .split(/[\s\-–:]+/)
    .filter((word) => /^[\p{L}\p{N}]/u.test(word));
  const letters = words.slice(0, 2).map((word) => word[0].toUpperCase());
  return letters.join("") || "?";
}

/** Apple system colors used for monogram and glyph tiles (see .res-icon--tint-*). */
export const TINTS = ["blue", "indigo", "purple", "pink", "red", "orange", "green", "teal", "cyan"];

/** A stable tint for a string, so a resource always gets the same tile color. */
export function tintFor(text) {
  let hash = 0;
  for (const char of text) hash = (hash * 31 + char.codePointAt(0)) | 0;
  return TINTS[Math.abs(hash) % TINTS.length];
}

export function pluralize(count, singular, plural = `${singular}s`) {
  return `${count.toLocaleString("en-US")} ${count === 1 ? singular : plural}`;
}

/** Formats an ISO date (YYYY-MM-DD) in UTC so server and client agree. */
export function formatDate(isoDate) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${isoDate}T00:00:00Z`));
}
