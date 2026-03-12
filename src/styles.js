// src/styles.js — shared design tokens

export const C = {
  bg: "#0f0e0c",
  surface: "#1a1916",
  surfaceHover: "#222018",
  border: "rgba(255,235,180,0.08)",
  borderHover: "rgba(255,215,100,0.25)",
  gold: "#f5c842",
  goldDim: "rgba(245,200,66,0.12)",
  goldBorder: "rgba(245,200,66,0.28)",
  text: "#f0ead8",
  textMuted: "rgba(240,234,216,0.5)",
  textDim: "rgba(240,234,216,0.25)",
  green: "#6fcf8a",
  greenDim: "rgba(111,207,138,0.1)",
  red: "#f87171",
  fontSerif: "'DM Serif Display', Georgia, serif",
  fontSans: "'DM Sans', system-ui, sans-serif",
  fontMono: "'DM Mono', 'Courier New', monospace",
};

// Inject global CSS once
let injected = false;
export function GlobalStyles() {
  if (!injected) {
    injected = true;
    const style = document.createElement("style");
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      body { background: ${C.bg}; }
      @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes spin { to { transform: rotate(360deg); } }
      textarea, input { font-family: inherit; }
      textarea { resize: none; }
      textarea::placeholder, input::placeholder { color: ${C.textDim}; }
      ::-webkit-scrollbar { width: 4px; }
      ::-webkit-scrollbar-thumb { background: rgba(245,200,66,0.18); border-radius: 2px; }
      a { color: inherit; text-decoration: none; }
    `;
    document.head.appendChild(style);
  }
  return null;
}
