import { useState } from "react";
import { C, GlobalStyles } from "../styles.js";

function isValidUrl(s) {
  if (!s || typeof s !== "string") return false;
  const t = s.trim().toLowerCase();
  return (
    t.length > 4 &&
    !["null", "undefined", "n/a", "none", ""].includes(t) &&
    (t.startsWith("http") || t.startsWith("www."))
  );
}

const LinkIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// Build a dedicated, self-contained print/PDF HTML page
// Uses a LIGHT theme so it prints cleanly on paper / PDF
// ─────────────────────────────────────────────────────────────────────────────
function buildPrintHTML(data, filename) {
  const safe = (v) =>
    v && v !== "null" && v !== "undefined" && v !== "none" ? v : null;

  const esc = (s) =>
    String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const experienceHTML = (data.experience || [])
    .map(
      (exp) => `
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">${esc(exp.role)}</div>
          <div class="card-company">${esc(exp.company)}</div>
        </div>
        <div class="period">${esc(exp.period)}</div>
      </div>
      <ul class="bullets">
        ${(exp.highlights || []).map((h) => `<li>${esc(h)}</li>`).join("")}
      </ul>
    </div>`
    )
    .join("");

  const projectsHTML = (data.projects || [])
    .map(
      (proj) => `
    <div class="proj-card">
      <div class="proj-title">${esc(proj.name)}</div>
      <div class="proj-desc">${esc(proj.description)}</div>
      ${
        (proj.tech || []).length
          ? `<div class="tags">${proj.tech.map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</div>`
          : ""
      }
      <div class="proj-links">
        ${isValidUrl(proj.url) ? `<a href="${esc(proj.url)}" class="link-live">🌐 Live</a>` : ""}
        ${isValidUrl(proj.github) ? `<a href="${esc(proj.github)}" class="link-code">Code ↗</a>` : ""}
      </div>
    </div>`
    )
    .join("");

  const educationHTML = (data.education || [])
    .map(
      (edu) => `
    <div class="card edu-card">
      <div><div class="card-title">${esc(edu.degree)}</div><div class="card-company">${esc(edu.institution)}</div></div>
      <div class="period">${esc(edu.year)}</div>
    </div>`
    )
    .join("");

  const skillsHTML = (data.skills || [])
    .map((s) => `<span class="pill">${esc(s)}</span>`)
    .join("");

  const certsHTML = (data.certifications || [])
    .map((c) => `<div class="cert-row"><span class="dot">●</span><span>${esc(c)}</span></div>`)
    .join("");

  const langsHTML = (data.languages || [])
    .map((l) => `<span class="pill">${esc(l)}</span>`)
    .join("");

  const contactHTML = [
    safe(data.email)
      ? `<a href="mailto:${esc(data.email)}" class="chip">${esc(data.email)}</a>`
      : "",
    safe(data.phone) ? `<span class="chip">${esc(data.phone)}</span>` : "",
    safe(data.location) ? `<span class="chip">📍 ${esc(data.location)}</span>` : "",
    isValidUrl(data.website)
      ? `<a href="${esc(data.website)}" class="chip">Website ↗</a>`
      : "",
    isValidUrl(data.github)
      ? `<a href="${esc(data.github)}" class="chip">GitHub ↗</a>`
      : "",
    isValidUrl(data.linkedin)
      ? `<a href="${esc(data.linkedin)}" class="chip">LinkedIn ↗</a>`
      : "",
  ]
    .filter(Boolean)
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>${esc(filename)}</title>
  <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet"/>
  <style>
    /* ── Base reset ── */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { font-size: 13px; }
    body {
      font-family: 'DM Sans', system-ui, sans-serif;
      background: #ffffff;
      color: #1a1a1a;
      line-height: 1.55;
      padding: 40px 0 120px;
    }
    a { color: #b8860b; text-decoration: none; }
    a:hover { text-decoration: underline; }

    /* ── Layout ── */
    .page { max-width: 780px; margin: 0 auto; padding: 0 40px; }

    /* ── Hero ── */
    .hero { margin-bottom: 36px; padding-bottom: 24px; border-bottom: 2px solid #1a1a1a; }
    .hero h1 {
      font-family: 'DM Serif Display', serif;
      font-size: 40px; font-weight: 400;
      color: #1a1a1a; line-height: 1.1;
      letter-spacing: -0.02em; margin-bottom: 6px;
    }
    .hero .role { font-size: 16px; color: #b8860b; font-weight: 500; margin-bottom: 12px; }
    .hero .summary { font-size: 12.5px; color: #444; line-height: 1.75; max-width: 680px; margin-bottom: 16px; }
    .chips { display: flex; flex-wrap: wrap; gap: 6px; }
    .chip {
      font-size: 11px; padding: 3px 10px; border-radius: 4px;
      background: #f5f0e8; border: 1px solid #d4b896; color: #6b4c1e;
    }

    /* ── Section heading ── */
    .section { margin-bottom: 28px; }
    .sec-title {
      font-family: 'DM Mono', monospace;
      font-size: 9px; color: #b8860b;
      letter-spacing: 0.18em; text-transform: uppercase;
      margin-bottom: 12px;
      display: flex; align-items: center; gap: 10px;
    }
    .sec-line { flex: 1; height: 1px; background: #e8d5b0; }

    /* ── Experience cards ── */
    .card {
      border: 1px solid #e8e0d0;
      border-left: 3px solid #b8860b;
      border-radius: 0 6px 6px 0;
      padding: 12px 16px;
      margin-bottom: 8px;
      background: #fdfaf5;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .card-header {
      display: flex; justify-content: space-between;
      align-items: flex-start; flex-wrap: wrap; gap: 4px;
      margin-bottom: 8px;
    }
    .card-title { font-size: 13px; font-weight: 600; color: #1a1a1a; }
    .card-company { font-size: 11.5px; color: #b8860b; margin-top: 1px; font-weight: 500; }
    .period { font-size: 10.5px; color: #888; font-family: 'DM Mono', monospace; white-space: nowrap; }
    .bullets { list-style: none; display: flex; flex-direction: column; gap: 5px; }
    .bullets li {
      font-size: 11.5px; color: #444; line-height: 1.6;
      padding-left: 14px; position: relative;
    }
    .bullets li::before {
      content: ""; position: absolute; left: 0; top: 7px;
      width: 4px; height: 4px; border-radius: 50%; background: #b8860b;
    }

    /* ── Skills pills ── */
    .pills { display: flex; flex-wrap: wrap; gap: 6px; }
    .pill {
      font-size: 11px; padding: 3px 9px; border-radius: 4px;
      background: #f5f0e8; border: 1px solid #ddd0b8; color: #4a3520;
    }

    /* ── Projects grid ── */
    .projects-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
    }
    .proj-card {
      border: 1px solid #e8e0d0; border-radius: 6px;
      padding: 12px 14px; background: #fdfaf5;
      display: flex; flex-direction: column; gap: 7px;
      page-break-inside: avoid; break-inside: avoid;
    }
    .proj-title { font-size: 12px; font-weight: 600; color: #1a1a1a; }
    .proj-desc { font-size: 11px; color: #555; line-height: 1.55; }
    .tags { display: flex; flex-wrap: wrap; gap: 4px; }
    .tag {
      font-size: 9.5px; color: #7a5a20; background: #f5e8c8;
      border: 1px solid #d4b896; border-radius: 3px; padding: 1px 6px;
    }
    .proj-links { display: flex; gap: 6px; margin-top: auto; }
    .link-live {
      font-size: 10px; color: #2a7a45;
      background: #eaf5ee; border: 1px solid #b0d8bc;
      border-radius: 3px; padding: 2px 7px;
    }
    .link-code {
      font-size: 10px; color: #666;
      background: #f0f0f0; border: 1px solid #ccc;
      border-radius: 3px; padding: 2px 7px;
    }

    /* ── Education ── */
    .edu-card { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 6px; }

    /* ── Certs ── */
    .cert-row { display: flex; gap: 8px; align-items: flex-start; font-size: 11.5px; color: #444; margin-bottom: 6px; }
    .dot { color: #b8860b; flex-shrink: 0; }

    /* ── Bottom 2-col ── */
    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }

    /* ── Footer ── */
    .footer {
      margin-top: 36px; padding-top: 14px;
      border-top: 1px solid #e0d0b8;
      display: flex; justify-content: space-between;
      align-items: center; flex-wrap: wrap; gap: 8px;
    }
    .footer-text { font-size: 9px; color: #aaa; font-family: 'DM Mono', monospace; }
    .src-badge {
      font-size: 9px; color: #999; background: #f5f5f5;
      border: 1px solid #e0e0e0; border-radius: 3px; padding: 1px 6px;
    }

    /* ── Floating print bar (screen only) ── */
    .print-bar {
      position: fixed; bottom: 0; left: 0; right: 0;
      background: #fff; border-top: 2px solid #b8860b;
      padding: 14px 40px;
      display: flex; align-items: center; justify-content: space-between; gap: 12px;
      box-shadow: 0 -4px 20px rgba(0,0,0,0.1);
    }
    .print-bar-filename { font-size: 12px; color: #888; font-family: 'DM Mono', monospace; }
    .btn-print {
      background: #b8860b; color: #fff; border: none;
      border-radius: 7px; padding: 10px 24px;
      font-size: 13px; font-weight: 600; cursor: pointer;
      font-family: 'DM Sans', sans-serif;
    }
    .btn-print:hover { background: #9a7009; }
    .btn-close {
      background: transparent; color: #888;
      border: 1px solid #ddd; border-radius: 7px; padding: 10px 16px;
      font-size: 13px; cursor: pointer; font-family: 'DM Sans', sans-serif;
    }

    /* ── PRINT MEDIA ── */
    @media print {
      @page {
        size: A4 portrait;
        margin: 14mm 12mm 14mm 12mm;
      }

      /* Force white background — no dark pages */
      html, body {
        background: #ffffff !important;
        color: #1a1a1a !important;
      }

      body { padding: 0 !important; }
      .page { padding: 0 !important; max-width: 100% !important; }

      /* Hide the floating bar — this was causing blank pages */
      .print-bar { display: none !important; }

      /* Tighten spacing for print */
      .hero { margin-bottom: 22px !important; padding-bottom: 16px !important; }
      .hero h1 { font-size: 28px !important; }
      .hero .role { font-size: 13px !important; margin-bottom: 8px !important; }
      .hero .summary { font-size: 11px !important; margin-bottom: 12px !important; }
      .section { margin-bottom: 18px !important; }
      .sec-title { margin-bottom: 8px !important; }
      .card { padding: 9px 12px !important; margin-bottom: 6px !important; }
      .card-title { font-size: 12px !important; }
      .card-company { font-size: 11px !important; }
      .bullets li { font-size: 10.5px !important; }
      .pill { font-size: 10px !important; padding: 2px 7px !important; }
      .projects-grid { gap: 7px !important; }
      .proj-card { padding: 9px 11px !important; }
      .proj-title { font-size: 11px !important; }
      .proj-desc { font-size: 10px !important; }
      .footer { margin-top: 20px !important; padding-top: 10px !important; }

      /* Pagination control */
      .card { page-break-inside: avoid !important; break-inside: avoid !important; }
      .proj-card { page-break-inside: avoid !important; break-inside: avoid !important; }
      .hero { page-break-after: avoid !important; break-after: avoid !important; }
      .section { page-break-inside: avoid !important; break-inside: avoid !important; }
      /* Allow page break between sections, not within */
      .section + .section { page-break-before: auto !important; }
    }
  </style>
</head>
<body>
<div class="page">

  <!-- Hero -->
  <div class="hero">
    <h1>${esc(safe(data.name) || "Your Name")}</h1>
    <div class="role">${esc(safe(data.title) || "")}</div>
    ${safe(data.summary) ? `<p class="summary">${esc(data.summary)}</p>` : ""}
    <div class="chips">${contactHTML}</div>
  </div>

  ${
    (data.skills || []).length
      ? `<div class="section">
      <div class="sec-title">Skills <span class="sec-line"></span></div>
      <div class="pills">${skillsHTML}</div>
    </div>`
      : ""
  }

  ${
    (data.experience || []).length
      ? `<div class="section">
      <div class="sec-title">Experience <span class="sec-line"></span></div>
      ${experienceHTML}
    </div>`
      : ""
  }

  ${
    (data.projects || []).length
      ? `<div class="section">
      <div class="sec-title">Projects <span class="sec-line"></span></div>
      <div class="projects-grid">${projectsHTML}</div>
    </div>`
      : ""
  }

  ${
    (data.education || []).length
      ? `<div class="section">
      <div class="sec-title">Education <span class="sec-line"></span></div>
      ${educationHTML}
    </div>`
      : ""
  }

  ${
    (data.certifications || []).length || (data.languages || []).length
      ? `<div class="two-col section">
      ${
        (data.certifications || []).length
          ? `<div>
          <div class="sec-title">Certifications <span class="sec-line"></span></div>
          ${certsHTML}
        </div>`
          : "<div></div>"
      }
      ${
        (data.languages || []).length
          ? `<div>
          <div class="sec-title">Languages <span class="sec-line"></span></div>
          <div class="pills">${langsHTML}</div>
        </div>`
          : ""
      }
    </div>`
      : ""
  }

  <div class="footer">
    <span class="footer-text">Built with Career StepUp · AI-powered</span>
    <div style="display:flex;gap:5px;">
      ${(data.sources_used || []).map((s) => `<span class="src-badge">${esc(s)}</span>`).join("")}
    </div>
  </div>
</div>

<!-- Floating bar — hidden in print via CSS -->
<div class="print-bar">
  <span class="print-bar-filename">${esc(filename)}.pdf</span>
  <div style="display:flex;gap:8px;">
    <button class="btn-close" onclick="window.close()">Close</button>
    <button class="btn-print" onclick="window.print()">Save as PDF →</button>
  </div>
</div>

<script>
  // Set focus so user can see the page before printing
  window.addEventListener('load', () => {
    document.querySelector('.btn-print').focus();
  });
</script>
</body>
</html>`;
}

// HTML export reuses the same template (print bar hidden in print, visible on screen)
function buildHTMLExport(data, filename) {
  return buildPrintHTML(data, filename);
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────
export default function PortfolioView({ data, filename, onReset }) {
  const [exportStatus, setExportStatus] = useState("");
  GlobalStyles();

  const handleExportHTML = () => {
    setExportStatus("html");
    try {
      const html = buildHTMLExport(data, filename);
      const blob = new Blob([html], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${filename}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setTimeout(() => setExportStatus(""), 2000);
    }
  };

  const handleExportPDF = () => {
    setExportStatus("pdf");
    const html = buildPrintHTML(data, filename);
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, "_blank");
    if (!win) alert("Allow popups for this site to export PDF.");
    setTimeout(() => {
      URL.revokeObjectURL(url);
      setExportStatus("");
    }, 8000);
  };

  const sec = {
    wrap: { marginBottom: "52px" },
    title: {
      display: "flex", alignItems: "center", gap: "12px",
      fontFamily: C.fontMono, fontSize: "10px", color: C.gold,
      letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "20px",
    },
    line: { flex: 1, height: "1px", background: "rgba(245,200,66,0.12)" },
    card: {
      background: C.surface, border: `1px solid ${C.border}`,
      borderRadius: "12px", padding: "20px 24px", marginBottom: "10px",
      transition: "border-color 0.2s, background 0.2s",
    },
    pill: {
      fontSize: "12px", color: C.textMuted,
      background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`,
      borderRadius: "6px", padding: "4px 10px",
    },
    techTag: {
      fontSize: "10px", color: C.gold, background: C.goldDim,
      border: `1px solid ${C.goldBorder}`, borderRadius: "4px", padding: "2px 7px",
    },
  };

  const btnBase = {
    padding: "7px 14px", borderRadius: "7px", fontSize: "12px",
    fontWeight: 500, fontFamily: C.fontSans, cursor: "pointer",
    transition: "all 0.2s", display: "flex", alignItems: "center", gap: "6px", border: "none",
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: C.fontSans }}>

      {/* Toolbar */}
      <div style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(15,14,12,0.97)", backdropFilter: "blur(14px)",
        borderBottom: `1px solid ${C.border}`,
        padding: "12px 28px", display: "flex", alignItems: "center",
        justifyContent: "space-between", flexWrap: "wrap", gap: "10px",
      }}>
        <div>
          <div style={{ fontFamily: C.fontSerif, fontSize: "17px", color: C.text }}>
            Career <span style={{ color: C.gold, fontStyle: "italic" }}>StepUp</span>
          </div>
          <div style={{ fontSize: "10px", color: C.textDim, letterSpacing: "0.08em", marginTop: "1px" }}>
            Portfolio Builder
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
          {data.sources_used?.map((src) => (
            <span key={src} style={{ fontSize: "10px", color: C.gold, background: C.goldDim, border: `1px solid ${C.goldBorder}`, borderRadius: "20px", padding: "2px 8px" }}>
              {src}
            </span>
          ))}
          <span style={{ fontSize: "10px", color: C.textDim, fontFamily: C.fontMono }}>{filename}</span>

          <button onClick={handleExportHTML} disabled={exportStatus === "html"} style={{
            ...btnBase,
            background: exportStatus === "html" ? C.goldDim : "rgba(255,255,255,0.04)",
            border: `1px solid ${exportStatus === "html" ? C.goldBorder : C.border}`,
            color: exportStatus === "html" ? C.gold : C.textMuted,
          }}>
            {exportStatus === "html" ? "✓ Downloaded!" : <>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>
              HTML
            </>}
          </button>

          <button onClick={handleExportPDF} disabled={exportStatus === "pdf"} style={{
            ...btnBase,
            background: exportStatus === "pdf" ? "rgba(245,200,66,0.2)" : C.gold,
            color: exportStatus === "pdf" ? C.gold : "#0f0e0c",
            border: `1px solid ${C.gold}`,
          }}>
            {exportStatus === "pdf" ? "Opening…" : <>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></svg>
              Export PDF
            </>}
          </button>

          <button onClick={onReset} style={{ ...btnBase, background: "transparent", border: `1px solid ${C.border}`, color: C.textMuted }}>
            ← New Portfolio
          </button>
        </div>
      </div>

      {/* Dark-theme live preview */}
      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "64px 32px 100px" }}>

        {/* Hero */}
        <div style={{ marginBottom: "64px", animation: "fadeUp 0.5s ease" }}>
          <h1 style={{ fontFamily: C.fontSerif, fontSize: "clamp(36px,5vw,58px)", color: C.text, lineHeight: 1.08, letterSpacing: "-0.02em", marginBottom: "12px" }}>
            {data.name || "Your Name"}
          </h1>
          <div style={{ fontSize: "20px", color: C.gold, fontWeight: 300, marginBottom: "18px" }}>{data.title}</div>
          {data.summary && <p style={{ fontSize: "15px", color: C.textMuted, lineHeight: 1.8, maxWidth: "640px", marginBottom: "24px" }}>{data.summary}</p>}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {[
              data.email && { label: data.email, href: `mailto:${data.email}` },
              data.phone && { label: data.phone, href: null },
              data.location && { label: "📍 " + data.location, href: null },
              isValidUrl(data.website) && { label: "Website", href: data.website },
              isValidUrl(data.github) && { label: "GitHub", href: data.github },
              isValidUrl(data.linkedin) && { label: "LinkedIn", href: data.linkedin },
            ].filter(Boolean).map((item, i) => (
              <a key={i} href={item.href || undefined} target={item.href?.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer"
                style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", borderRadius: "6px", padding: "5px 12px", color: item.href ? C.gold : C.textMuted, background: item.href ? C.goldDim : "rgba(255,255,255,0.03)", border: `1px solid ${item.href ? C.goldBorder : C.border}` }}>
                {item.href && <LinkIcon />}{item.label}
              </a>
            ))}
          </div>
        </div>

        {data.skills?.length > 0 && (
          <div style={{ ...sec.wrap, animation: "fadeUp 0.5s ease 0.05s both" }}>
            <div style={sec.title}>Skills <span style={sec.line} /></div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {data.skills.map((sk, i) => <span key={i} style={sec.pill}>{sk}</span>)}
            </div>
          </div>
        )}

        {data.experience?.length > 0 && (
          <div style={{ ...sec.wrap, animation: "fadeUp 0.5s ease 0.1s both" }}>
            <div style={sec.title}>Experience <span style={sec.line} /></div>
            {data.experience.map((exp, i) => (
              <div key={i} style={sec.card}
                onMouseEnter={e => { e.currentTarget.style.borderColor = C.goldBorder; e.currentTarget.style.background = C.surfaceHover; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.surface; }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "8px", marginBottom: "14px" }}>
                  <div>
                    <div style={{ fontSize: "15px", fontWeight: 600, color: C.text }}>{exp.role}</div>
                    <div style={{ fontSize: "13px", color: C.gold, marginTop: "3px" }}>{exp.company}</div>
                  </div>
                  <span style={{ fontSize: "11px", color: C.textDim, fontFamily: C.fontMono }}>{exp.period}</span>
                </div>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "8px" }}>
                  {exp.highlights?.map((h, j) => (
                    <li key={j} style={{ fontSize: "13px", color: C.textMuted, lineHeight: 1.65, paddingLeft: "16px", position: "relative" }}>
                      <span style={{ position: "absolute", left: 0, top: "8px", width: "5px", height: "5px", borderRadius: "50%", background: C.gold, opacity: 0.45 }} />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {data.projects?.length > 0 && (
          <div style={{ ...sec.wrap, animation: "fadeUp 0.5s ease 0.15s both" }}>
            <div style={sec.title}>Projects <span style={sec.line} /></div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(255px,1fr))", gap: "12px" }}>
              {data.projects.map((proj, i) => (
                <div key={i} style={{ ...sec.card, marginBottom: 0, display: "flex", flexDirection: "column", gap: "10px" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = C.goldBorder; e.currentTarget.style.background = C.surfaceHover; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.surface; }}>
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: 600, color: C.text, marginBottom: "6px" }}>{proj.name}</div>
                    <p style={{ fontSize: "12px", color: C.textMuted, lineHeight: 1.65 }}>{proj.description}</p>
                  </div>
                  {proj.tech?.length > 0 && <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>{proj.tech.map((t, j) => <span key={j} style={sec.techTag}>{t}</span>)}</div>}
                  <div style={{ display: "flex", gap: "7px", marginTop: "auto" }}>
                    {isValidUrl(proj.url) && <a href={proj.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: "11px", color: C.green, background: "rgba(111,207,138,0.08)", border: "1px solid rgba(111,207,138,0.2)", borderRadius: "5px", padding: "3px 9px" }}>🌐 Live</a>}
                    {isValidUrl(proj.github) && <a href={proj.github} target="_blank" rel="noopener noreferrer" style={{ fontSize: "11px", color: C.textMuted, background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`, borderRadius: "5px", padding: "3px 9px" }}>Code ↗</a>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.education?.length > 0 && (
          <div style={{ ...sec.wrap, animation: "fadeUp 0.5s ease 0.2s both" }}>
            <div style={sec.title}>Education <span style={sec.line} /></div>
            {data.education.map((edu, i) => (
              <div key={i} style={{ ...sec.card, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "8px" }}>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: C.text }}>{edu.degree}</div>
                  <div style={{ fontSize: "13px", color: C.gold, marginTop: "3px" }}>{edu.institution}</div>
                </div>
                <span style={{ fontSize: "11px", color: C.textDim, fontFamily: C.fontMono }}>{edu.year}</span>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px,1fr))", gap: "40px", animation: "fadeUp 0.5s ease 0.25s both" }}>
          {data.certifications?.length > 0 && (
            <div>
              <div style={sec.title}>Certifications <span style={sec.line} /></div>
              {data.certifications.map((c, i) => (
                <div key={i} style={{ fontSize: "13px", color: C.textMuted, display: "flex", gap: "8px", alignItems: "flex-start", marginBottom: "8px" }}>
                  <span style={{ color: C.gold, flexShrink: 0 }}>◆</span>{c}
                </div>
              ))}
            </div>
          )}
          {data.languages?.length > 0 && (
            <div>
              <div style={sec.title}>Languages <span style={sec.line} /></div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {data.languages.map((l, i) => <span key={i} style={sec.pill}>{l}</span>)}
              </div>
            </div>
          )}
        </div>

        <div style={{ marginTop: "64px", paddingTop: "24px", borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
          <span style={{ fontSize: "11px", color: C.textDim, fontFamily: C.fontMono }}>Built with Career StepUp · AI-powered</span>
          <div style={{ display: "flex", gap: "6px" }}>
            {data.sources_used?.map((s) => (
              <span key={s} style={{ fontSize: "10px", color: C.textDim, background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}`, borderRadius: "4px", padding: "2px 7px" }}>{s}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
