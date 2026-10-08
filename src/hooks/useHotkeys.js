import { useEffect } from "react";

function isTyping(target) {
  return target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));
}

/** Calls `onSearch` for "/" (outside text fields) and for ⌘K / Ctrl+K. */
export function useSearchHotkeys(onSearch) {
  useEffect(() => {
    function handleKeyDown(event) {
      const commandK = event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey);
      const slash = event.key === "/" && !event.metaKey && !event.ctrlKey && !event.altKey && !isTyping(event.target);
      if (commandK || slash) {
        event.preventDefault();
        onSearch();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onSearch]);
}
