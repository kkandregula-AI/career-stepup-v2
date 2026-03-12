import { useState } from "react";
import { C, GlobalStyles } from "../styles.js";

function isValidUrl(s) {
  if (!s || typeof s !== "string") return false;
  const t = s.trim().toLowerCase();
  return t.length > 4 && !["null", "undefined", "n/a", "none"].includes(t) &&
    (t.startsWith("http") || t.startsWith("www."));
}

const LinkIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
  </svg>
);

// ── Build a clean print-ready HTML document ───────────────────────────────────
function buildPrintHTML(data, filename) {
  const safe = (v) => (v && v !== "null" && v !== "undefined" ? v : null);

  const experienceHTML = (data.experience || []).map(exp => `
    <div class="card avoid-break">
      <div class="card-header">
        <div>
          <div class="card-title">${exp.role || ""}</div>
          <div class="card-sub">${exp.company || ""}</div>
        </div>
        <div class="period">${exp.period || ""}</div>
      </div>
      <ul class="highlights">
        ${(exp.highlights || []).map(h => `<li>${h}</li>`).join("")}
      </ul>
    </div>`).join("");

  const projectsHTML = (data.projects || []).map(proj => `
    <div class="proj-card avoid-break">
      <div class="proj-title">${proj.name || ""}</div>
      <div class="proj-desc">${proj.description || ""}</div>
      ${(proj.tech || []).length ? `<div class="tags">${proj.tech.map(t => `<span class="tag">${t}</span>`).join("")}</div>` : ""}
      <div class="proj-links">
        ${isValidUrl(proj.url) ? `<a href="${proj.url}" class="link-live">🌐 Live</a>` : ""}
        ${isValidUrl(proj.github) ? `<a href="${proj.github}" class="link-code">Code ↗</a>` : ""}
      </div>
    </div>`).join("");

  const educationHTML = (data.education || []).map(edu => `
    <div class="card avoid-break" style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:6px;">
      <div>
        <div class="card-title">${edu.degree || ""}</div>
        <div class="card-sub">${edu.institution || ""}</div>
      </div>
      <div class="period">${edu.year || ""}</div>
    </div>`).join("");

  const skillsHTML = (data.skills || []).map(s => `<span class="pill">${s}</span>`).join("");
  const certsHTML = (data.certifications || []).map(c => `<div class="cert-item"><span class="diamond">◆</span>${c}</div>`).join("");
  const langsHTML = (data.languages || []).map(l => `<span class="pill">${l}</span>`).join("");

  const contactHTML = [
    safe(data.email) ? `<a href="mailto:${data.email}" class="chip chip-gold">${data.email}</a>` : "",
    safe(data.phone) ? `<span class="chip">${data.phone}</span>` : "",
    safe(data.location) ? `<span class="chip">📍 ${data.location}</span>` : "",
    isValidUrl(data.website) ? `<a href="${data.website}" class="chip chip-gold">Website ↗</a>` : "",
    isValidUrl(data.github) ? `<a href="${data.github}" class="chip chip-gold">GitHub ↗</a>` : "",
    isValidUrl(data.linkedin) ? `<a href="${data.linkedin}" class="chip chip-gold">LinkedIn ↗</a>` : "",
  ].filter(Boolean).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>${filename}</title>
  <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet"/>
  <style>
    /* ── Reset ── */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    a { text-decoration: none; color: inherit; }

    /* ── Screen styles ── */
    body {
      background: #0f0e0c;
      color: #f0ead8;
      font-family: 'DM Sans', sans-serif;
      font-size: 13px;
      line-height: 1.6;
      padding: 48px 0 80px;
    }
    .container { max-width: 820px; margin: 0 auto; padding: 0 36px; }

    /* Hero */
    .hero { margin-bottom: 52px; }
    .hero h1 {
      font-family: 'DM Serif Display', serif;
      font-size: 52px;
      color: #f0ead8;
      line-height: 1.05;
      letter-spacing: -0.02em;
      margin-bottom: 10px;
    }
    .hero .title { font-size: 19px; color: #f5c842; font-weight: 300; margin-bottom: 16px; }
    .hero .summary { font-size: 14px; color: rgba(240,234,216,0.55); line-height: 1.8; max-width: 620px; margin-bottom: 22px; }
    .chips { display: flex; flex-wrap: wrap; gap: 7px; }
    .chip { font-size: 11px; border-radius: 6px; padding: 4px 11px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,235,180,0.1); color: rgba(240,234,216,0.5); }
    .chip-gold { background: rgba(245,200,66,0.12); border-color: rgba(245,200,66,0.28); color: #f5c842; }

    /* Section */
    .section { margin-bottom: 44px; }
    .section-title {
      display: flex; align-items: center; gap: 12px;
      font-family: 'DM Mono', monospace;
      font-size: 10px; color: #f5c842;
      letter-spacing: 0.14em; text-transform: uppercase;
      margin-bottom: 18px;
    }
    .section-line { flex: 1; height: 1px; background: rgba(245,200,66,0.15); }

    /* Cards */
    .card {
      background: #1a1916;
      border: 1px solid rgba(255,235,180,0.08);
      border-radius: 10px;
      padding: 18px 22px;
      margin-bottom: 10px;
    }
    .card-header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }
    .card-title { font-size: 14px; font-weight: 600; color: #f0ead8; }
    .card-sub { font-size: 12px; color: #f5c842; margin-top: 2px; }
    .period { font-size: 11px; color: rgba(240,234,216,0.3); font-family: 'DM Mono', monospace; white-space: nowrap; }
    .highlights { list-style: none; display: flex; flex-direction: column; gap: 7px; }
    .highlights li {
      font-size: 12px; color: rgba(240,234,216,0.55);
      line-height: 1.65; padding-left: 14px; position: relative;
    }
    .highlights li::before {
      content: ""; position: absolute; left: 0; top: 7px;
      width: 5px; height: 5px; border-radius: 50%;
      background: #f5c842; opacity: 0.45;
    }

    /* Skills pills */
    .pills { display: flex; flex-wrap: wrap; gap: 7px; }
    .pill { font-size: 11px; color: rgba(240,234,216,0.55); background: rgba(255,255,255,0.04); border: 1px solid rgba(255,235,180,0.08); border-radius: 6px; padding: 4px 10px; }

    /* Projects grid */
    .projects-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 11px; }
    .proj-card { background: #1a1916; border: 1px solid rgba(255,235,180,0.08); border-radius: 10px; padding: 16px 18px; display: flex; flex-direction: column; gap: 9px; }
    .proj-title { font-size: 13px; font-weight: 600; color: #f0ead8; }
    .proj-desc { font-size: 11px; color: rgba(240,234,216,0.5); line-height: 1.6; }
    .tags { display: flex; flex-wrap: wrap; gap: 4px; }
    .tag { font-size: 10px; color: #f5c842; background: rgba(245,200,66,0.1); border: 1px solid rgba(245,200,66,0.25); border-radius: 4px; padding: 1px 7px; }
    .proj-links { display: flex; gap: 6px; margin-top: auto; }
    .link-live { font-size: 10px; color: #6fcf8a; background: rgba(111,207,138,0.08); border: 1px solid rgba(111,207,138,0.2); border-radius: 4px; padding: 2px 8px; }
    .link-code { font-size: 10px; color: rgba(240,234,216,0.45); background: rgba(255,255,255,0.04); border: 1px solid rgba(255,235,180,0.08); border-radius: 4px; padding: 2px 8px; }

    /* Certs */
    .cert-item { display: flex; gap: 8px; align-items: flex-start; font-size: 12px; color: rgba(240,234,216,0.55); margin-bottom: 7px; }
    .diamond { color: #f5c842; flex-shrink: 0; margin-top: 1px; }

    /* Bottom grid */
    .bottom-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px,1fr)); gap: 36px; }

    /* Footer */
    .footer { margin-top: 52px; padding-top: 20px; border-top: 1px solid rgba(255,235,180,0.08); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; }
    .footer-text { font-size: 10px; color: rgba(240,234,216,0.22); font-family: 'DM Mono', monospace; }
    .source-badge { font-size: 10px; color: rgba(240,234,216,0.22); background: rgba(255,255,255,0.03); border: 1px solid rgba(255,235,180,0.06); border-radius: 4px; padding: 2px 6px; }

    /* Print button */
    .print-bar {
      position: fixed; bottom: 0; left: 0; right: 0;
      background: rgba(15,14,12,0.97);
      border-top: 1px solid rgba(245,200,66,0.15);
      padding: 14px 36px;
      display: flex; align-items: center; justify-content: space-between;
      gap: 12px; flex-wrap: wrap;
      font-family: 'DM Sans', sans-serif;
    }
    .print-bar span { font-size: 12px; color: rgba(240,234,216,0.4); font-family: 'DM Mono', monospace; }
    .btn-print {
      background: #f5c842; color: #0f0e0c;
      border: none; border-radius: 8px; padding: 10px 22px;
      font-size: 13px; font-weight: 600; font-family: 'DM Sans', sans-serif;
      cursor: pointer;
    }
    .btn-close {
      background: transparent; color: rgba(240,234,216,0.45);
      border: 1px solid rgba(255,235,180,0.12); border-radius: 8px; padding: 10px 16px;
      font-size: 13px; font-family: 'DM Sans', sans-serif; cursor: pointer;
    }

    /* ── Print styles ── */
    @media print {
      @page {
        size: A4;
        margin: 16mm 14mm 16mm 14mm;
      }

      /* Keep dark theme in print */
      html, body {
        background: #0f0e0c !important;
        color: #f0ead8 !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
      }

      body { padding: 0 !important; font-size: 11px !important; }
      .container { padding: 0 !important; max-width: 100% !important; }
      .print-bar { display: none !important; }

      /* Hero adjustments */
      .hero { margin-bottom: 32px !important; }
      .hero h1 { font-size: 34px !important; margin-bottom: 6px !important; }
      .hero .title { font-size: 15px !important; margin-bottom: 10px !important; }
      .hero .summary { font-size: 11px !important; margin-bottom: 14px !important; }

      /* Sections */
      .section { margin-bottom: 28px !important; }
      .section-title { margin-bottom: 12px !important; }

      /* Cards */
      .card { padding: 12px 16px !important; margin-bottom: 7px !important; border-radius: 7px !important; }
      .card-title { font-size: 12px !important; }
      .card-sub { font-size: 11px !important; }
      .highlights li { font-size: 10px !important; line-height: 1.5 !important; }
      .pill { font-size: 10px !important; padding: 2px 8px !important; }

      /* Projects */
      .projects-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 8px !important; }
      .proj-card { padding: 11px 14px !important; border-radius: 7px !important; }
      .proj-title { font-size: 11px !important; }
      .proj-desc { font-size: 10px !important; }

      /* Pagination — keep sections together, break between them */
      .avoid-break { page-break-inside: avoid !important; break-inside: avoid !important; }
      .section { page-break-inside: avoid !important; break-inside: avoid !important; }
      .hero { page-break-after: avoid !important; break-after: avoid !important; }
      .proj-card { page-break-inside: avoid !important; break-inside: avoid !important; }

      /* Force page break before Experience if it starts on a new page */
      .section-experience { page-break-before: auto !important; }

      /* Bottom grid */
      .bottom-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 20px !important; }

      /* Footer */
      .footer { margin-top: 28px !important; padding-top: 12px !important; }
      .footer-text, .source-badge { font-size: 9px !important; }
    }
  </style>
</head>
<body>
  <div class="container">

    <!-- Hero -->
    <div class="hero">
      <h1>${safe(data.name) || "Your Name"}</h1>
      <div class="title">${safe(data.title) || ""}</div>
      ${safe(data.summary) ? `<p class="summary">${data.summary}</p>` : ""}
      <div class="chips">${contactHTML}</div>
    </div>

    ${(data.skills || []).length ? `
    <!-- Skills -->
    <div class="section">
      <div class="section-title">Skills <span class="section-line"></span></div>
      <div class="pills">${skillsHTML}</div>
    </div>` : ""}

    ${(data.experience || []).length ? `
    <!-- Experience -->
    <div class="section section-experience">
      <div class="section-title">Experience <span class="section-line"></span></div>
      ${experienceHTML}
    </div>` : ""}

    ${(data.projects || []).length ? `
    <!-- Projects -->
    <div class="section">
      <div class="section-title">Projects <span class="section-line"></span></div>
      <div class="projects-grid">${projectsHTML}</div>
    </div>` : ""}

    ${(data.education || []).length ? `
    <!-- Education -->
    <div class="section">
      <div class="section-title">Education <span class="section-line"></span></div>
      ${educationHTML}
    </div>` : ""}

    ${(data.certifications || []).length || (data.languages || []).length ? `
    <!-- Certs + Languages -->
    <div class="bottom-grid section">
      ${(data.certifications || []).length ? `
      <div>
        <div class="section-title">Certifications <span class="section-line"></span></div>
        ${certsHTML}
      </div>` : ""}
      ${(data.languages || []).length ? `
      <div>
        <div class="section-title">Languages <span class="section-line"></span></div>
        <div class="pills">${langsHTML}</div>
      </div>` : ""}
    </div>` : ""}

    <!-- Footer -->
    <div class="footer">
      <span class="footer-text">Built with Career StepUp · AI-powered</span>
      <div style="display:flex;gap:6px;">
        ${(data.sources_used || []).map(s => `<span class="source-badge">${s}</span>`).join("")}
      </div>
    </div>
  </div>

  <!-- Print bar (hidden in print) -->
  <div class="print-bar">
    <span>${filename}</span>
    <div style="display:flex;gap:8px;">
      <button class="btn-close" onclick="window.close()">Close</button>
      <button class="btn-print" onclick="window.print()">Save as PDF →</button>
    </div>
  </div>

  <script>
    // Auto-focus so user can immediately hit print
    window.onload = () => document.querySelector('.btn-print').focus();
  </script>
</body>
</html>`;
}

// ── Build standalone HTML export (same as print but without print bar) ────────
function buildHTMLExport(data, filename) {
  // Reuse print HTML but strip the print-bar div
  return buildPrintHTML(data, filename).replace(
    /<!-- Print bar[\s\S]*?<\/div>\s*\n/,
    ""
  );
}

// ── Main component ────────────────────────────────────────────────────────────
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
    if (!win) alert("Please allow popups for this site to export PDF.");
    setTimeout(() => {
      URL.revokeObjectURL(url);
      setExportStatus("");
    }, 5000);
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
          {data.sources_used?.map(src => (
            <span key={src} style={{ fontSize: "10px", color: C.gold, background: C.goldDim, border: `1px solid ${C.goldBorder}`, borderRadius: "20px", padding: "2px 8px" }}>
              {src}
            </span>
          ))}
          <span style={{ fontSize: "10px", color: C.textDim, fontFamily: C.fontMono }}>{filename}</span>

          {/* HTML download */}
          <button onClick={handleExportHTML} disabled={exportStatus === "html"} style={{
            ...btnBase,
            background: exportStatus === "html" ? C.goldDim : "rgba(255,255,255,0.04)",
            border: `1px solid ${exportStatus === "html" ? C.goldBorder : C.border}`,
            color: exportStatus === "html" ? C.gold : C.textMuted,
          }}>
            {exportStatus === "html" ? "✓ Downloaded!" : <>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
              HTML
            </>}
          </button>

          {/* PDF export */}
          <button onClick={handleExportPDF} disabled={exportStatus === "pdf"} style={{
            ...btnBase,
            background: exportStatus === "pdf" ? "rgba(245,200,66,0.2)" : C.gold,
            color: exportStatus === "pdf" ? C.gold : "#0f0e0c",
            border: `1px solid ${C.gold}`,
          }}>
            {exportStatus === "pdf" ? "Opening…" : <>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
              Export PDF
            </>}
          </button>

          <button onClick={onReset} style={{ ...btnBase, background: "transparent", border: `1px solid ${C.border}`, color: C.textMuted }}>
            ← New Portfolio
          </button>
        </div>
      </div>

      {/* Live preview */}
      <div id="portfolio-content" style={{ maxWidth: "860px", margin: "0 auto", padding: "64px 32px 100px" }}>

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

        {/* Skills */}
        {data.skills?.length > 0 && (
          <div style={{ ...sec.wrap, animation: "fadeUp 0.5s ease 0.05s both" }}>
            <div style={sec.title}>Skills <span style={sec.line} /></div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {data.skills.map((sk, i) => <span key={i} style={sec.pill}>{sk}</span>)}
            </div>
          </div>
        )}

        {/* Experience */}
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

        {/* Projects */}
        {data.projects?.length > 0 && (
          <div style={{ ...sec.wrap, animation: "fadeUp 0.5s ease 0.15s both" }}>
            <div style={sec.title}>Projects <span style={sec.line} /></div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(255px, 1fr))", gap: "12px" }}>
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

        {/* Education */}
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

        {/* Certs + Languages */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px,1fr))", gap: "40px", animation: "fadeUp 0.5s ease 0.25s both" }}>
          {data.certifications?.length > 0 && (
            <div>
              <div style={sec.title}>Certifications <span style={sec.line} /></div>
              {data.certifications.map((c, i) => (
                <div key={i} style={{ fontSize: "13px", color: C.textMuted, display: "flex", gap: "8px", alignItems: "flex-start", marginBottom: "8px" }}>
                  <span style={{ color: C.gold, flexShrink: 0 }}>◆</span> {c}
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

        {/* Footer */}
        <div style={{ marginTop: "64px", paddingTop: "24px", borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
          <span style={{ fontSize: "11px", color: C.textDim, fontFamily: C.fontMono }}>Built with Career StepUp · AI-powered</span>
          <div style={{ display: "flex", gap: "6px" }}>
            {data.sources_used?.map(s => (
              <span key={s} style={{ fontSize: "10px", color: C.textDim, background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}`, borderRadius: "4px", padding: "2px 7px" }}>{s}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
