// api/github.js
// Fetches real GitHub profile + repos server-side (no CORS issues, optional token for higher rate limits)

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const { username } = req.query;
  if (!username) return res.status(400).json({ error: "username query param required" });

  const headers = {
    "Accept": "application/vnd.github.v3+json",
    "User-Agent": "career-stepup-app",
  };

  // Optional: add GITHUB_TOKEN in Vercel env vars to raise rate limit from 60 to 5000/hr
  if (process.env.GITHUB_TOKEN) {
    headers["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  try {
    const [profileRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${username}`, { headers }),
      fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`, { headers }),
    ]);

    if (profileRes.status === 404) {
      return res.status(404).json({ error: `GitHub user "${username}" not found.` });
    }
    if (profileRes.status === 403) {
      return res.status(429).json({ error: "GitHub API rate limit hit. Add a GITHUB_TOKEN env var in Vercel to fix." });
    }
    if (!profileRes.ok) {
      return res.status(profileRes.status).json({ error: `GitHub API error: ${profileRes.status}` });
    }

    const profile = await profileRes.json();
    const repos = reposRes.ok ? await reposRes.json() : [];

    return res.status(200).json({
      profile: {
        login: profile.login,
        name: profile.name,
        bio: profile.bio,
        avatar_url: profile.avatar_url,
        html_url: profile.html_url,
        blog: profile.blog,
        location: profile.location,
        public_repos: profile.public_repos,
        followers: profile.followers,
        following: profile.following,
      },
      repos: repos.map(r => ({
        name: r.name,
        description: r.description,
        html_url: r.html_url,
        homepage: r.homepage,
        language: r.language,
        stargazers_count: r.stargazers_count,
        forks_count: r.forks_count,
        topics: r.topics || [],
        fork: r.fork,
        updated_at: r.updated_at,
      })),
    });

  } catch (err) {
    console.error("GitHub proxy error:", err);
    return res.status(500).json({ error: "Failed to fetch GitHub data: " + err.message });
  }
}
