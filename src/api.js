// src/api.js

// ── Fetch real GitHub data via our proxy ─────────────────────────────────────
async function fetchGitHubData(username) {
  const res = await fetch(`/api/github?username=${encodeURIComponent(username)}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch GitHub profile.");
  return data;
}

// ── Format GitHub data as readable text for Claude ───────────────────────────
function formatGitHubForPrompt({ profile, repos }) {
  const lines = [];
  lines.push(`Name: ${profile.name || profile.login}`);
  if (profile.bio) lines.push(`Bio: ${profile.bio}`);
  if (profile.location) lines.push(`Location: ${profile.location}`);
  if (profile.blog) lines.push(`Website: ${profile.blog}`);
  lines.push(`GitHub: ${profile.html_url}`);
  lines.push(`Public Repos: ${profile.public_repos}, Followers: ${profile.followers}`);
  const ownRepos = repos.filter(r => !r.fork).slice(0, 30);
  if (ownRepos.length > 0) {
    lines.push("\nRepositories:");
    ownRepos.forEach(r => {
      lines.push(`- ${r.name}${r.language ? ` [${r.language}]` : ""}${r.stargazers_count ? ` ⭐${r.stargazers_count}` : ""}${r.description ? `: ${r.description}` : ""}${r.homepage ? ` → Live: ${r.homepage}` : ""}`);
    });
  }
  const languages = [...new Set(repos.map(r => r.language).filter(Boolean))];
  if (languages.length) lines.push(`\nLanguages used: ${languages.join(", ")}`);
  const liveProjects = repos.filter(r => r.homepage && r.homepage.trim());
  if (liveProjects.length) {
    lines.push("\nDeployed projects:");
    liveProjects.forEach(r => lines.push(`- ${r.name}: ${r.homepage}`));
  }
  return lines.join("\n");
}

// ── Call Claude via serverless proxy — supports up to 2 PDFs ─────────────────
async function callClaude({ messages, system, pdfBase64 = null, linkedinPdfBase64 = null }) {
  // Build content array: PDFs first (as document blocks), then text prompt
  let userContent;
  const docs = [];
  if (pdfBase64) {
    docs.push({ type: "document", source: { type: "base64", media_type: "application/pdf", data: pdfBase64 } });
  }
  if (linkedinPdfBase64) {
    docs.push({ type: "document", source: { type: "base64", media_type: "application/pdf", data: linkedinPdfBase64 } });
  }
  if (docs.length > 0) {
    userContent = [...docs, { type: "text", text: messages[0].content }];
  } else {
    userContent = messages[0].content;
  }

  const body = {
    model: "claude-sonnet-4-20250514",
    max_tokens: 4000,
    system,
    messages: [{ role: "user", content: userContent }],
  };

  const res = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e?.error || `Server error ${res.status}`);
  }

  const data = await res.json();
  return (data.content || []).filter(b => b.type === "text").map(b => b.text).join("");
}

// ── Parse JSON from Claude response ──────────────────────────────────────────
export function extractJSON(text) {
  const stripped = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  const start = stripped.indexOf("{");
  const end = stripped.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON found in AI response.");
  try {
    return JSON.parse(stripped.slice(start, end + 1));
  } catch {
    throw new Error("Could not parse AI response. Please try again.");
  }
}

// ── Main export: build portfolio from all sources ────────────────────────────
export async function buildPortfolio({ pdfBase64, linkedinText, linkedinPdfBase64, githubUsername }) {
  const sources = [];
  let githubText = "";

  if (githubUsername?.trim()) {
    try {
      const ghData = await fetchGitHubData(githubUsername.trim());
      githubText = formatGitHubForPrompt(ghData);
      sources.push("GitHub");
    } catch (err) {
      throw new Error(`GitHub: ${err.message}`);
    }
  }

  if (pdfBase64) sources.push("Resume PDF");
  if (linkedinText?.trim()) sources.push("LinkedIn Text");
  if (linkedinPdfBase64) sources.push("LinkedIn PDF");

  const prompt = `You are an expert career consultant and portfolio writer. Analyze ALL provided sources and synthesize the BEST possible professional portfolio.

Sources provided: ${sources.join(", ")}

${githubText ? `--- GITHUB PROFILE (real live data) ---\n${githubText}\n` : ""}
${linkedinText?.trim() ? `--- LINKEDIN PROFILE TEXT ---\n${linkedinText.trim()}\n` : ""}
${pdfBase64 ? "--- RESUME PDF ---\n(First attached PDF — extract contact info, experience, education, skills, projects)\n" : ""}
${linkedinPdfBase64 ? "--- LINKEDIN PDF ---\n(Second attached PDF — extract profile summary, experience, education, skills, certifications)\n" : ""}

Instructions:
1. Extract the best information from ALL sources
2. Where sources conflict, pick the most detailed and accurate version
3. Enhance bullet points: strong action verbs, quantify achievements where possible
4. Use GitHub repos to populate the Projects section with real repo names, descriptions, languages, and live URLs
5. Infer technical skills from GitHub languages and repo topics
6. Write a compelling 2-3 sentence professional summary in third person

Return ONLY a raw JSON object — no markdown, no fences, no explanation. Start with { and end with }.

{
  "name": "Full Name",
  "title": "Current Role / Professional Title",
  "summary": "Compelling 2-3 sentence summary in third person",
  "email": "email or null",
  "phone": "phone or null",
  "location": "City, Country or null",
  "website": "personal website url or null",
  "github": "full github profile url or null",
  "linkedin": "full linkedin profile url or null",
  "skills": ["skill1", "skill2"],
  "experience": [
    {
      "company": "Company Name",
      "role": "Job Title",
      "period": "Month Year – Month Year or Present",
      "highlights": ["Achievement with metrics", "Another achievement"]
    }
  ],
  "projects": [
    {
      "name": "Project Name",
      "description": "What it does and its impact",
      "tech": ["React", "Node.js"],
      "url": "live url or null",
      "github": "github repo url or null"
    }
  ],
  "education": [
    {
      "institution": "University Name",
      "degree": "Degree, Field",
      "year": "2020"
    }
  ],
  "certifications": ["Cert name"],
  "languages": ["English (Native)"],
  "sources_used": ${JSON.stringify(sources.map(s => s.toLowerCase()))}
}`;

  const system =
    "You are a JSON-only API for a career portfolio builder. Output nothing except a single valid JSON object. No markdown, no explanation, no code fences. Start with { and end with }.";

  const raw = await callClaude({
    messages: [{ role: "user", content: prompt }],
    system,
    pdfBase64: pdfBase64 || null,
    linkedinPdfBase64: linkedinPdfBase64 || null,
  });

  return extractJSON(raw);
}
