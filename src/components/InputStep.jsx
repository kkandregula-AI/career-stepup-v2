import { useState, useRef } from "react";
import { buildPortfolio } from "../api.js";
import { C, GlobalStyles } from "../styles.js";

const Icon = {
  upload: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
    </svg>
  ),
  check: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  linkedin: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  ),
  github: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  ),
  type: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/>
    </svg>
  ),
  pdf: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
    </svg>
  ),
};

function deriveFilename(pdfName, portfolioName) {
  if (pdfName) return pdfName.replace(/\.pdf$/i, "").replace(/[^a-zA-Z0-9_\-]/g, "_");
  if (portfolioName) return portfolioName.trim().replace(/[^a-zA-Z0-9_\-]/g, "_");
  return "portfolio";
}

export default function InputStep({ onGenerate }) {
  // Resume PDF
  const [resumePdf, setResumePdf] = useState(null);
  const [resumePdfName, setResumePdfName] = useState("");

  // LinkedIn — tab: "text" | "pdf"
  const [linkedinTab, setLinkedinTab] = useState("text");
  const [linkedinText, setLinkedinText] = useState("");
  const [linkedinPdf, setLinkedinPdf] = useState(null);
  const [linkedinPdfName, setLinkedinPdfName] = useState("");

  // GitHub
  const [githubUsername, setGithubUsername] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [drag, setDrag] = useState(null); // "resume" | "linkedin" | null

  const resumeRef = useRef();
  const linkedinPdfRef = useRef();

  const hasAny = resumePdf || linkedinText.trim() || linkedinPdf || githubUsername.trim();
  const hasLinkedin = linkedinTab === "text" ? linkedinText.trim() : linkedinPdf;

  const handleResumeDrop = (e) => {
    e.preventDefault(); setDrag(null);
    handleResumeFile(e.dataTransfer.files[0]);
  };
  const handleResumeFile = (file) => {
    if (!file || file.type !== "application/pdf") { setError("Please upload a PDF file."); return; }
    if (file.size > 10 * 1024 * 1024) { setError("PDF must be under 10MB."); return; }
    const reader = new FileReader();
    reader.onload = () => { setResumePdf(reader.result.split(",")[1]); setResumePdfName(file.name); setError(""); };
    reader.readAsDataURL(file);
  };

  const handleLinkedinPdfDrop = (e) => {
    e.preventDefault(); setDrag(null);
    handleLinkedinPdfFile(e.dataTransfer.files[0]);
  };
  const handleLinkedinPdfFile = (file) => {
    if (!file || file.type !== "application/pdf") { setError("Please upload a PDF file."); return; }
    if (file.size > 10 * 1024 * 1024) { setError("LinkedIn PDF must be under 10MB."); return; }
    const reader = new FileReader();
    reader.onload = () => { setLinkedinPdf(reader.result.split(",")[1]); setLinkedinPdfName(file.name); setError(""); };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!hasAny) { setError("Please provide at least one input."); return; }
    setLoading(true); setError("");
    try {
      const data = await buildPortfolio({
        pdfBase64: resumePdf,
        linkedinText: linkedinTab === "text" ? linkedinText.trim() : "",
        linkedinPdfBase64: linkedinTab === "pdf" ? linkedinPdf : null,
        githubUsername: githubUsername.trim(),
      });
      const filename = deriveFilename(resumePdfName, data.name);
      onGenerate({ data, filename });
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Shared styles
  const card = (active) => ({
    background: C.surface,
    border: `1.5px solid ${active ? C.goldBorder : C.border}`,
    borderRadius: "14px", padding: "20px 24px",
    transition: "border-color 0.2s",
  });

  const tab = (active) => ({
    display: "flex", alignItems: "center", gap: "6px",
    padding: "6px 14px", borderRadius: "6px", fontSize: "12px",
    fontWeight: 500, cursor: "pointer", border: "none",
    fontFamily: C.fontSans, transition: "all 0.15s",
    background: active ? C.goldDim : "transparent",
    color: active ? C.gold : C.textMuted,
    outline: active ? `1px solid ${C.goldBorder}` : "none",
  });

  const sectionLabel = (active) => ({
    display: "flex", alignItems: "center", gap: "8px",
    fontSize: "12px", fontWeight: 600,
    color: active ? C.gold : C.textMuted,
    marginBottom: "12px", letterSpacing: "0.06em", textTransform: "uppercase",
  });

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", fontFamily: C.fontSans }}>
      <GlobalStyles />

      {/* Logo */}
      <div style={{ animation: "fadeUp 0.5s ease", textAlign: "center", marginBottom: "48px" }}>
        <div style={{ fontFamily: C.fontSerif, fontSize: "38px", color: C.text, letterSpacing: "-0.02em", marginBottom: "4px" }}>
          Career <span style={{ color: C.gold, fontStyle: "italic" }}>StepUp</span>
        </div>
        <div style={{ fontSize: "11px", color: C.gold, letterSpacing: "0.18em", textTransform: "uppercase", fontFamily: C.fontMono, marginBottom: "10px", opacity: 0.7 }}>
          Portfolio Builder
        </div>
        <p style={{ color: C.textMuted, fontSize: "14px", letterSpacing: "0.04em" }}>
          Drop in what you have. We'll build the rest.
        </p>
      </div>

      <div style={{ width: "100%", maxWidth: "680px", display: "flex", flexDirection: "column", gap: "16px", animation: "fadeUp 0.5s ease 0.1s both" }}>

        {/* ── Resume PDF ── */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDrag("resume"); }}
          onDragLeave={() => setDrag(null)}
          onDrop={handleResumeDrop}
          onClick={() => !resumePdf && resumeRef.current.click()}
          style={{
            ...card(!!resumePdf),
            border: `1.5px dashed ${drag === "resume" ? C.gold : resumePdf ? C.goldBorder : C.border}`,
            background: drag === "resume" ? "rgba(245,200,66,0.04)" : C.surface,
            cursor: resumePdf ? "default" : "pointer",
            display: "flex", alignItems: "center", gap: "16px",
          }}
        >
          <input ref={resumeRef} type="file" accept=".pdf" style={{ display: "none" }} onChange={(e) => handleResumeFile(e.target.files[0])} />
          <div style={{ width: 44, height: 44, borderRadius: "10px", background: resumePdf ? C.goldDim : "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center", color: resumePdf ? C.gold : C.textMuted, flexShrink: 0 }}>
            {resumePdf ? <Icon.check /> : <Icon.upload />}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "14px", fontWeight: 500, color: resumePdf ? C.gold : C.text, marginBottom: "3px" }}>
              {resumePdf ? resumePdfName : "Upload Resume (PDF)"}
            </div>
            <div style={{ fontSize: "12px", color: C.textDim }}>
              {resumePdf ? "Uploaded — click × to remove" : "Drag & drop or click — up to 10MB"}
            </div>
          </div>
          {resumePdf && (
            <button onClick={(e) => { e.stopPropagation(); setResumePdf(null); setResumePdfName(""); }}
              style={{ background: "none", border: "none", color: C.textMuted, cursor: "pointer", fontSize: "20px", padding: "4px" }}>×</button>
          )}
        </div>

        {/* ── LinkedIn — tab switcher ── */}
        <div style={card(hasLinkedin)}>
          {/* Tab bar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
            <label style={sectionLabel(hasLinkedin)}>
              <Icon.linkedin /> LinkedIn Profile
            </label>
            <div style={{ display: "flex", gap: "4px", background: "rgba(255,255,255,0.03)", borderRadius: "8px", padding: "3px" }}>
              <button style={tab(linkedinTab === "text")} onClick={() => setLinkedinTab("text")}>
                <Icon.type /> Paste Text
              </button>
              <button style={tab(linkedinTab === "pdf")} onClick={() => setLinkedinTab("pdf")}>
                <Icon.pdf /> Upload PDF
              </button>
            </div>
          </div>

          {/* Text tab */}
          {linkedinTab === "text" && (
            <>
              <textarea
                value={linkedinText}
                onChange={(e) => setLinkedinText(e.target.value)}
                placeholder={"Paste your LinkedIn profile text here.\n\nHow to get it: LinkedIn profile → More → Save to PDF, then copy-paste the text. Or manually copy your About, Experience, Education and Skills sections."}
                rows={5}
                style={{ width: "100%", background: "transparent", border: "none", outline: "none", color: C.text, fontSize: "13px", lineHeight: 1.7, fontFamily: C.fontSans, resize: "none" }}
              />
              {linkedinText && (
                <div style={{ fontSize: "11px", color: C.textDim, marginTop: "8px", textAlign: "right" }}>
                  {linkedinText.length.toLocaleString()} characters
                </div>
              )}
            </>
          )}

          {/* PDF tab */}
          {linkedinTab === "pdf" && (
            <div
              onDragOver={(e) => { e.preventDefault(); setDrag("linkedin"); }}
              onDragLeave={() => setDrag(null)}
              onDrop={handleLinkedinPdfDrop}
              onClick={() => !linkedinPdf && linkedinPdfRef.current.click()}
              style={{
                border: `1.5px dashed ${drag === "linkedin" ? C.gold : linkedinPdf ? C.goldBorder : C.border}`,
                borderRadius: "10px", padding: "20px",
                background: drag === "linkedin" ? "rgba(245,200,66,0.04)" : "rgba(255,255,255,0.02)",
                cursor: linkedinPdf ? "default" : "pointer",
                display: "flex", alignItems: "center", gap: "14px",
              }}
            >
              <input ref={linkedinPdfRef} type="file" accept=".pdf" style={{ display: "none" }} onChange={(e) => handleLinkedinPdfFile(e.target.files[0])} />
              <div style={{ width: 38, height: 38, borderRadius: "8px", background: linkedinPdf ? C.goldDim : "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center", color: linkedinPdf ? C.gold : C.textMuted, flexShrink: 0 }}>
                {linkedinPdf ? <Icon.check /> : <Icon.pdf />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "13px", fontWeight: 500, color: linkedinPdf ? C.gold : C.text, marginBottom: "2px" }}>
                  {linkedinPdf ? linkedinPdfName : "Upload LinkedIn PDF"}
                </div>
                <div style={{ fontSize: "11px", color: C.textDim }}>
                  {linkedinPdf ? "Uploaded" : "LinkedIn → Me → Save to PDF → upload here"}
                </div>
              </div>
              {linkedinPdf && (
                <button onClick={(e) => { e.stopPropagation(); setLinkedinPdf(null); setLinkedinPdfName(""); }}
                  style={{ background: "none", border: "none", color: C.textMuted, cursor: "pointer", fontSize: "20px", padding: "4px" }}>×</button>
              )}
            </div>
          )}
        </div>

        {/* ── GitHub ── */}
        <div style={card(!!githubUsername)}>
          <label style={sectionLabel(!!githubUsername)}>
            <Icon.github /> GitHub Username
          </label>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ color: C.textDim, fontSize: "13px", fontFamily: C.fontMono, whiteSpace: "nowrap" }}>github.com/</span>
            <input
              value={githubUsername}
              onChange={(e) => setGithubUsername(e.target.value.replace(/\s/g, ""))}
              placeholder="yourusername"
              style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: C.text, fontSize: "14px", fontFamily: C.fontMono }}
            />
          </div>
        </div>

        {/* Source badges */}
        {hasAny && (
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
            {resumePdf && <span style={{ fontSize: "11px", color: C.gold, background: C.goldDim, border: `1px solid ${C.goldBorder}`, borderRadius: "20px", padding: "3px 10px" }}>✓ Resume PDF</span>}
            {linkedinTab === "text" && linkedinText && <span style={{ fontSize: "11px", color: C.gold, background: C.goldDim, border: `1px solid ${C.goldBorder}`, borderRadius: "20px", padding: "3px 10px" }}>✓ LinkedIn Text</span>}
            {linkedinTab === "pdf" && linkedinPdf && <span style={{ fontSize: "11px", color: C.gold, background: C.goldDim, border: `1px solid ${C.goldBorder}`, borderRadius: "20px", padding: "3px 10px" }}>✓ LinkedIn PDF</span>}
            {githubUsername && <span style={{ fontSize: "11px", color: C.gold, background: C.goldDim, border: `1px solid ${C.goldBorder}`, borderRadius: "20px", padding: "3px 10px" }}>✓ GitHub</span>}
            <span style={{ fontSize: "11px", color: C.textDim }}>Claude merges all sources intelligently</span>
          </div>
        )}

        {error && (
          <div style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: "8px", padding: "12px 16px", color: "#f87171", fontSize: "13px", lineHeight: 1.5 }}>
            ⚠️ {error}
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={loading || !hasAny}
          style={{
            background: loading || !hasAny ? "rgba(245,200,66,0.06)" : C.gold,
            color: loading || !hasAny ? "rgba(245,200,66,0.25)" : "#0f0e0c",
            border: `1.5px solid ${loading || !hasAny ? "rgba(245,200,66,0.12)" : C.gold}`,
            borderRadius: "12px", padding: "16px",
            fontSize: "15px", fontWeight: 600, fontFamily: C.fontSans,
            cursor: loading || !hasAny ? "not-allowed" : "pointer",
            transition: "all 0.2s",
          }}
        >
          {loading ? (
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
              <span style={{ width: 16, height: 16, border: "2px solid rgba(245,200,66,0.15)", borderTopColor: C.gold, borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />
              Building your portfolio…
            </span>
          ) : "Generate Portfolio →"}
        </button>

        <p style={{ textAlign: "center", fontSize: "11px", color: C.textDim }}>
          Provide at least one source · More sources = richer portfolio
        </p>
      </div>
    </div>
  );
}
