import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import App from "./App.jsx";

/** Renders the default view to HTML at build time (see scripts/build.mjs). */
export function render() {
  return renderToString(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
