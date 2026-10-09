/**
 * On narrow screens some lists become horizontal scrollers (categories,
 * learning paths). Scroll the current item into view without moving the page.
 */
export function revealActive(container, selector = '[aria-current="true"]') {
  if (!container || container.scrollWidth <= container.clientWidth) return;
  const item = container.querySelector(selector);
  if (!item) return;
  const offset = item.getBoundingClientRect().left - container.getBoundingClientRect().left;
  container.scrollTo({ left: container.scrollLeft + offset - 16 });
}
