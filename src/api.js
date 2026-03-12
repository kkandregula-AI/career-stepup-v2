// src/api.js
// All Claude API calls go through here.
// The API key is read from the VITE_ANTHROPIC_API_KEY environment variable.
// Set this in your Vercel project settings → Environment Variables.

const MODEL = "claude-sonnet-4-20250514";

export async function callClaude({ messages, system, pdfBase64 = null }) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("VITE_ANTHROPIC_API_KEY is not set. Add it in Vercel Environment Variables.");

  const userContent = pdfBase64
    ? [
        { type: "document", source: { type: "base64", media_type: "application/pdf", data: pdfBase64 } },
        { type: "text", text: messages[0].content },
      ]
    : messages[0].content;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-allow-browser": "true",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 4000,
      system,
      messages: [{ role: "user", content: userContent }],
    }),
  });

  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e?.error?.message || `Anthropic API error ${res.status}`);
  }

  const data = await res.json();
  return (data.content || [])
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("");
}

export function extractJSON(text) {
  // Strip markdown fences if present
  const stripped = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  const start = stripped.indexOf("{");
  const end = stripped.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON found in AI response.");
  try {
    return JSON.parse(stripped.slice(start, end + 1));
  } catch {
    throw new Error("Could not parse AI response as JSON. Please try again.");
  }
}

export async function buildPortfolio({ pdfBase64, linkedinText, githubUsername }) {
  const sources = [];
  if (pdfBase64) sources.push("resume PDF");
  if (linkedinText) sources.push("LinkedIn profile text");
  if (githubUsername) sources.push(`GitHub (${githubUsername})`);

  const prompt = `You are an expert career consultant and portfolio writer. Analyze ALL provided sources and synthesize the BEST possible professional portfolio.

Sources provided: ${sources.join(", ")}

${linkedinText ? `--- LINKEDIN PROFILE TEXT ---\n${linkedinText}\n` : ""}
${githubUsername ? `--- GITHUB USERNAME ---\n${githubUsername}\nUse your knowledge of this GitHub user to infer their technical skills, notable projects, languages, and contributions.\n` : ""}
${pdfBase64 ? "--- RESUME ---\n(Attached as PDF — extract all information from it including contact details, experience, education, skills, and projects)\n" : ""}

Instructions:
1. Extract the best information from ALL sources provided
2. Where sources conflict, pick the most detailed / impressive accurate version  
3. Enhance bullet points to be recruiter-optimized: use strong action verbs, quantify achievements where possible
4. Infer tech stack and skills from GitHub repos if provided
5. Write a compelling 2-3 sentence professional summary in third person
6. List as many real skills as you can find across all sources

Return ONLY a raw JSON object — no markdown, no fences, no explanation. Start with { and end with }.

JSON structure:
{
  "name": "Full Name",
  "title": "Current Role / Professional Title",
  "summary": "Compelling 2-3 sentence professional summary in third person",
  "email": "email or null",
  "phone": "phone number or null",
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
      "highlights": ["Strong action-verb achievement with metrics", "Another achievement"]
    }
  ],
  "projects": [
    {
      "name": "Project Name",
      "description": "What it does, tech used, and its impact",
      "tech": ["React", "Node.js"],
      "url": "live url or null",
      "github": "github repo url or null"
    }
  ],
  "education": [
    {
      "institution": "University or Institution Name",
      "degree": "Degree Type, Field of Study",
      "year": "Graduation year"
    }
  ],
  "certifications": ["Certification name and issuer"],
  "languages": ["English (Native)", "Hindi (Fluent)"],
  "sources_used": ["resume", "linkedin", "github"]
}`;

  const system =
    "You are a JSON-only API for a career portfolio builder. Output nothing except a single valid JSON object. No markdown, no explanation, no code fences. Your entire response must start with { and end with }.";

  const raw = await callClaude({
    messages: [{ role: "user", content: prompt }],
    system,
    pdfBase64: pdfBase64 || null,
  });

  return extractJSON(raw);
}
