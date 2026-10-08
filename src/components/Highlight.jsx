import { highlight } from "../lib/search.js";

/** Renders text with the search tokens wrapped in <mark>. */
export default function Highlight({ text, tokens }) {
  return highlight(text, tokens).map((part, i) => (part.match ? <mark key={i}>{part.text}</mark> : part.text));
}
