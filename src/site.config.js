/**
 * Site-wide settings. The repository URL is injected at build time by the
 * GitHub Actions workflow (VITE_REPO_URL); set it in a .env.local file to see
 * the GitHub links locally.
 */
export const SITE = {
  name: "Engineering Blogs",
  owner: "Darshan",
  repoUrl: (import.meta.env.VITE_REPO_URL ?? "").replace(/\/$/, ""),
};

export const STORAGE_KEYS = {
  saved: "engblogs:saved",
  progress: "engblogs:progress",
  theme: "engblogs:theme",
};

/** Matches --bg in styles/global.css; used for the browser's theme-color. */
export const THEME_COLORS = { light: "#f7f7f9", dark: "#0b0b0f" };

export function suggestUrl(repoUrl) {
  return repoUrl ? `${repoUrl}/issues/new?template=suggest-resource.yml` : "";
}
