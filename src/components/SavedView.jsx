import { RESOURCE_BY_ID } from "../data/resources/index.js";
import { SITE } from "../site.config.js";
import AppLink from "./AppLink.jsx";
import Icon from "./Icon.jsx";
import ResourceCard from "./ResourceCard.jsx";

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Older browsers or insecure contexts: fall back to a hidden textarea.
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.append(textarea);
    textarea.select();
    const ok = document.execCommand("copy");
    textarea.remove();
    return ok;
  }
}

export default function SavedView({ saved, savedIds, onToggleSave, onClear, notify }) {
  const resources = saved.map((id) => RESOURCE_BY_ID.get(id)).filter(Boolean);

  async function copyMarkdown() {
    const lines = resources.map((r) => `- [${r.name}](${r.url}) — ${r.description}`);
    const ok = await copyText(`# My ${SITE.name} reading list\n\n${lines.join("\n")}\n`);
    notify(ok ? `Copied ${resources.length} links as Markdown` : "Couldn't copy — your browser blocked clipboard access");
  }

  function clearAll() {
    if (window.confirm(`Remove all ${resources.length} saved resources?`)) {
      onClear();
      notify("Cleared your saved list");
    }
  }

  return (
    <div className="container page">
      <header className="page-head page-head--row">
        <div>
          <p className="eyebrow">
            <Icon name="bookmark" size={14} /> Saved
          </p>
          <h1 className="page-title">Your reading list</h1>
          <p className="page-sub">
            {resources.length
              ? `${resources.length} saved ${resources.length === 1 ? "resource" : "resources"}, stored privately in this browser.`
              : "Save resources from the directory or a learning path and they will show up here."}
          </p>
        </div>
        {resources.length > 0 && (
          <div className="page-actions">
            <button type="button" className="btn btn--secondary" onClick={copyMarkdown}>
              <Icon name="copy" size={16} /> Copy as Markdown
            </button>
            <button type="button" className="btn btn--ghost" onClick={clearAll}>
              <Icon name="trash" size={16} /> Clear
            </button>
          </div>
        )}
      </header>

      {resources.length ? (
        <div className="grid grid--wide">
          {resources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} saved={savedIds.has(resource.id)} onToggleSave={onToggleSave} />
          ))}
        </div>
      ) : (
        <div className="empty empty--saved">
          <div className="empty__icon">
            <Icon name="bookmark" size={22} />
          </div>
          <h2 className="empty__title">Nothing saved yet</h2>
          <p className="empty__text">
            Tap the bookmark on any card to build a reading list. Start with the essentials if you're not sure where to begin.
          </p>
          <div className="empty__actions">
            <AppLink className="btn btn--primary" to={{ view: "explore", category: "essentials" }} scroll="directory">
              <Icon name="star" filled size={15} /> Browse the essentials
            </AppLink>
          </div>
        </div>
      )}
    </div>
  );
}
