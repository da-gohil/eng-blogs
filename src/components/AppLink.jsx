import { hrefFor, setAppState, useAppState } from "../hooks/useAppState.js";

/**
 * An in-app link: a real <a href> (so it can be opened in a new tab or
 * crawled) that updates state without a page load on a plain click.
 *
 * `scroll` decides where the page ends up: "auto" jumps to the top when the
 * view changes, "directory" lands on the directory (for category links from
 * other pages), and "none" leaves the scroll position alone.
 */
export default function AppLink({ to, history = "push", scroll = "auto", onNavigate, children, ...props }) {
  const state = useAppState();

  function handleClick(event) {
    props.onClick?.(event);
    const modified = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
    if (event.defaultPrevented || modified) return;
    event.preventDefault();
    const changesView = Boolean(to.view) && to.view !== state.view;
    setAppState(to, { history });
    if (scroll === "directory") {
      requestAnimationFrame(() => document.getElementById("directory")?.scrollIntoView({ behavior: "instant" }));
    } else if (scroll === "auto" && changesView) {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
    onNavigate?.();
  }

  return (
    <a {...props} href={hrefFor({ ...state, ...to })} onClick={handleClick}>
      {children}
    </a>
  );
}
