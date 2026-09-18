import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

// This is where React attaches to the page. It grabs <div id="root"> from
// index.html and renders <App /> inside it.
// StrictMode adds extra dev-only checks (it intentionally runs some code twice
// in development to help you catch bugs — that's expected, not a mistake).
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
