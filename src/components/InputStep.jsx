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
};

// Derive a clean filename from the PDF name or person's name
function deriveFilename(pdfName, portfolioName) {
  if (pdfName) {
    return pdfName.replace(/\.pdf$/i, "").replace(/[^a-zA-Z0-9_\-]/g, "_");
  }
  if (portfolioName) {
    return portfolioName.trim().replace(/[^a-zA-Z0-9_\-]/g, "_");
  }
  return "portfolio";
}

export default function InputStep({ onGenerate }) {
  const [pdf, setPdf] = useState(null);
  const [pdfName, setPdfName] = useState("");
  const [linkedinText, setLinkedinText] = useState("");
  const [githubUsername, setGithubUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [drag, setDrag] = useState(false);
  const fileRef = useRef();

  const hasAny = pdf || linkedinText.trim() || githubUsername.trim();

  const handleFile = (file) => {
    if (!file || file.type !== "application/pdf") {
      setError("Please upload a PDF file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("PDF must be under 10MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setPdf(reader.result.split(",")[1]);
      setPdfName(file.name);
      setError("");
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDrag(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleGenerate = async () => {
    if (!hasAny) { setError("Please provide at least one input."); return; }
    setLoading(true);
    setError("");
    try {
      const data = await buildPortfolio({
        pdfBase64: pdf,
        linkedinText: linkedinText.trim(),
        githubUsername: githubUsername.trim(),
      });
      // Derive filename from PDF name first, then from the person's name in the portfolio
      const filename = deriveFilename(pdfName, data.name);
      onGenerate({ data, filename });
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", fontFamily: C.fontSans }}>
      <GlobalStyles />

      {/* Logo */}
      <div style={{ animation: "fadeUp 0.5s ease", textAlign: "center", marginBottom: "48px" }}>
        <div style={{ fontFamily: C.fontSerif, fontSize: "38px", color: C.text, letterSpacing: "-0.02em", marginBottom: "8px" }}>
          Career <span style={{ color: C.gold, fontStyle: "italic" }}>StepUp</span>
        </div>
        <p style={{ color: C.textMuted, fontSize: "14px", letterSpacing: "0.04em" }}>
          Drop in what you have. We'll build the rest.
        </p>
      </div>

      <div style={{ width: "100%", maxWidth: "680px", display: "flex", flexDirection: "column", gap: "16px", animation: "fadeUp 0.5s ease 0.1s both" }}>

        {/* PDF Upload */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={handleDrop}
          onClick={() => !pdf && fileRef.current.click()}
          style={{
            background: drag ? "rgba(245,200,66,0.05)" : C.surface,
            border: `1.5px dashed ${drag ? C.gold : pdf ? C.goldBorder : C.border}`,
            borderRadius: "14px", padding: "28px",
            cursor: pdf ? "default" : "pointer",
            transition: "all 0.2s ease",
            display: "flex", alignItems: "center", gap: "16px",
          }}
        >
          <input ref={fileRef} type="file" accept=".pdf" style={{ display: "none" }} onChange={(e) => handleFile(e.target.files[0])} />
          <div style={{ width: 44, height: 44, borderRadius: "10px", background: pdf ? C.goldDim : "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center", color: pdf ? C.gold : C.textMuted, flexShrink: 0, transition: "all 0.2s" }}>
            {pdf ? <Icon.check /> : <Icon.upload />}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "14px", fontWeight: 500, color: pdf ? C.gold : C.text, marginBottom: "3px" }}>
              {pdf ? pdfName : "Upload Resume (PDF)"}
            </div>
            <div style={{ fontSize: "12px", color: C.textDim }}>
              {pdf ? "Click × to remove" : "Drag & drop or click — up to 10MB"}
            </div>
          </div>
          {pdf && (
            <button onClick={(e) => { e.stopPropagation(); setPdf(null); setPdfName(""); }}
              style={{ background: "none", border: "none", color: C.textMuted, cursor: "pointer", fontSize: "20px", lineHeight: 1, padding: "4px" }}>
              ×
            </button>
          )}
        </div>

        {/* LinkedIn */}
        <div style={{ background: C.surface, border: `1.5px solid ${linkedinText ? C.goldBorder : C.border}`, borderRadius: "14px", padding: "20px 24px", transition: "border-color 0.2s" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", fontWeight: 600, color: linkedinText ? C.gold : C.textMuted, marginBottom: "12px", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            <Icon.linkedin /> LinkedIn Profile
          </label>
          <textarea
            value={linkedinText}
            onChange={(e) => setLinkedinText(e.target.value)}
            placeholder="Paste your LinkedIn profile text here. Go to your LinkedIn profile → More → Save to PDF, or manually copy your About, Experience, Education and Skills sections."
            rows={5}
            style={{ width: "100%", background: "transparent", border: "none", outline: "none", color: C.text, fontSize: "13px", lineHeight: 1.7, fontFamily: C.fontSans, resize: "none" }}
          />
          {linkedinText && (
            <div style={{ fontSize: "11px", color: C.textDim, marginTop: "8px", textAlign: "right" }}>
              {linkedinText.length.toLocaleString()} characters
            </div>
          )}
        </div>

        {/* GitHub */}
        <div style={{ background: C.surface, border: `1.5px solid ${githubUsername ? C.goldBorder : C.border}`, borderRadius: "14px", padding: "20px 24px", transition: "border-color 0.2s" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", fontWeight: 600, color: githubUsername ? C.gold : C.textMuted, marginBottom: "12px", letterSpacing: "0.06em", textTransform: "uppercase" }}>
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
            {pdf && <span style={{ fontSize: "11px", color: C.gold, background: C.goldDim, border: `1px solid ${C.goldBorder}`, borderRadius: "20px", padding: "3px 10px" }}>✓ Resume PDF</span>}
            {linkedinText && <span style={{ fontSize: "11px", color: C.gold, background: C.goldDim, border: `1px solid ${C.goldBorder}`, borderRadius: "20px", padding: "3px 10px" }}>✓ LinkedIn</span>}
            {githubUsername && <span style={{ fontSize: "11px", color: C.gold, background: C.goldDim, border: `1px solid ${C.goldBorder}`, borderRadius: "20px", padding: "3px 10px" }}>✓ GitHub</span>}
            <span style={{ fontSize: "11px", color: C.textDim }}>Claude will intelligently merge all sources</span>
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
