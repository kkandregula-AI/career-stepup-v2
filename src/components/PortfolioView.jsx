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

export default function PortfolioView({ data, onReset }) {
  const [copied, setCopied] = useState(false);
  GlobalStyles();

  const handleCopy = () => {
    const el = document.getElementById("portfolio-content");
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${data.name || "Portfolio"} — Career StepUp</title>
  <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #0f0e0c; font-family: 'DM Sans', sans-serif; color: #f0ead8; }
    a { color: inherit; text-decoration: none; }
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-thumb { background: rgba(245,200,66,0.18); border-radius: 2px; }
  </style>
</head>
<body>${el.outerHTML}</body>
</html>`;
    navigator.clipboard.writeText(html).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
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

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: C.fontSans }}>

      {/* Sticky toolbar */}
      <div style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(15,14,12,0.96)", backdropFilter: "blur(14px)",
        borderBottom: `1px solid ${C.border}`,
        padding: "12px 28px", display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ fontFamily: C.fontSerif, fontSize: "17px", color: C.text }}>
          Career <span style={{ color: C.gold, fontStyle: "italic" }}>StepUp</span>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {data.sources_used?.map((src) => (
            <span key={src} style={{ fontSize: "10px", color: C.gold, background: C.goldDim, border: `1px solid ${C.goldBorder}`, borderRadius: "20px", padding: "2px 8px", letterSpacing: "0.05em" }}>
              {src}
            </span>
          ))}
          <button onClick={handleCopy} style={{
            padding: "7px 14px", borderRadius: "7px", fontSize: "12px", fontWeight: 500,
            fontFamily: C.fontSans, cursor: "pointer", transition: "all 0.2s",
            background: copied ? "rgba(111,207,138,0.1)" : C.goldDim,
            border: `1px solid ${copied ? "rgba(111,207,138,0.3)" : C.goldBorder}`,
            color: copied ? C.green : C.gold,
          }}>
            {copied ? "✓ Copied!" : "Copy HTML"}
          </button>
          <button onClick={onReset} style={{
            padding: "7px 14px", background: "transparent", border: `1px solid ${C.border}`,
            borderRadius: "7px", color: C.textMuted, fontSize: "12px",
            cursor: "pointer", fontFamily: C.fontSans,
          }}>
            ← New Portfolio
          </button>
        </div>
      </div>

      {/* Portfolio content */}
      <div id="portfolio-content" style={{ maxWidth: "860px", margin: "0 auto", padding: "64px 32px 100px" }}>

        {/* Hero */}
        <div style={{ marginBottom: "64px", animation: "fadeUp 0.5s ease" }}>
          <h1 style={{ fontFamily: C.fontSerif, fontSize: "clamp(36px, 5vw, 60px)", color: C.text, lineHeight: 1.08, letterSpacing: "-0.02em", marginBottom: "14px" }}>
            {data.name || "Your Name"}
          </h1>
          <div style={{ fontSize: "20px", color: C.gold, fontWeight: 300, marginBottom: "20px" }}>
            {data.title}
          </div>
          {data.summary && (
            <p style={{ fontSize: "15px", color: C.textMuted, lineHeight: 1.8, maxWidth: "640px", marginBottom: "28px" }}>
              {data.summary}
            </p>
          )}
          {/* Contact chips */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {[
              data.email && { label: data.email, href: `mailto:${data.email}` },
              data.phone && { label: data.phone, href: `tel:${data.phone}` },
              data.location && { label: "📍 " + data.location, href: null },
              isValidUrl(data.website) && { label: "Website", href: data.website },
              isValidUrl(data.github) && { label: "GitHub", href: data.github },
              isValidUrl(data.linkedin) && { label: "LinkedIn", href: data.linkedin },
            ].filter(Boolean).map((item, i) => (
              <a key={i}
                href={item.href || undefined}
                target={item.href?.startsWith("http") ? "_blank" : undefined}
                rel="noopener noreferrer"
                style={{
                  display: "flex", alignItems: "center", gap: "5px",
                  fontSize: "12px", borderRadius: "6px", padding: "5px 12px",
                  color: item.href ? C.gold : C.textMuted,
                  background: item.href ? C.goldDim : "rgba(255,255,255,0.03)",
                  border: `1px solid ${item.href ? C.goldBorder : C.border}`,
                  transition: "opacity 0.15s",
                }}>
                {item.href && <LinkIcon />}
                {item.label}
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
                  {proj.tech?.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                      {proj.tech.map((t, j) => <span key={j} style={sec.techTag}>{t}</span>)}
                    </div>
                  )}
                  <div style={{ display: "flex", gap: "7px", marginTop: "auto" }}>
                    {isValidUrl(proj.url) && (
                      <a href={proj.url} target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: "11px", color: C.green, background: "rgba(111,207,138,0.08)", border: "1px solid rgba(111,207,138,0.2)", borderRadius: "5px", padding: "3px 9px" }}>
                        🌐 Live
                      </a>
                    )}
                    {isValidUrl(proj.github) && (
                      <a href={proj.github} target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: "11px", color: C.textMuted, background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`, borderRadius: "5px", padding: "3px 9px" }}>
                        Code ↗
                      </a>
                    )}
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

        {/* Certs + Languages row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "40px", animation: "fadeUp 0.5s ease 0.25s both" }}>
          {data.certifications?.length > 0 && (
            <div>
              <div style={sec.title}>Certifications <span style={sec.line} /></div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {data.certifications.map((c, i) => (
                  <div key={i} style={{ fontSize: "13px", color: C.textMuted, display: "flex", gap: "8px", alignItems: "flex-start" }}>
                    <span style={{ color: C.gold, flexShrink: 0, marginTop: "2px" }}>◆</span> {c}
                  </div>
                ))}
              </div>
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
          <span style={{ fontSize: "11px", color: C.textDim, fontFamily: C.fontMono }}>
            Built with Career StepUp · AI-powered
          </span>
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
