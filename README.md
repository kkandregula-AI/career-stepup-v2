# Career StepUp v2 — AI Portfolio Builder

Drop in your resume, LinkedIn profile, or GitHub username. Claude AI merges everything into a stunning portfolio.

## Deploy to Vercel in 5 minutes

### Step 1 — Push to GitHub
```bash
git init
git add .
git commit -m "Initial Career StepUp v2"
git remote add origin https://github.com/YOUR_USERNAME/career-stepup-v2.git
git push -u origin main
```

### Step 2 — Import to Vercel
1. Go to [vercel.com](https://vercel.com) → New Project
2. Import your GitHub repo
3. Framework: **Vite** (auto-detected)
4. Click **Deploy**

### Step 3 — Add your API key
1. Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add: `VITE_ANTHROPIC_API_KEY` = your Anthropic API key
3. Get your key at: https://console.anthropic.com/settings/api-keys
4. **Redeploy** the project (Deployments → Redeploy)

Done! Your app is live.

---

## Local Development

```bash
npm install
cp .env.example .env.local
# Add your Anthropic API key to .env.local
npm run dev
```

## How it works

- **Resume PDF** — Claude reads and extracts all content
- **LinkedIn text** — paste your profile text, Claude parses it
- **GitHub username** — Claude uses its knowledge of your public repos
- **AI merge** — Claude picks the best from all sources, enhances descriptions, quantifies achievements
- **Export** — Copy the generated HTML to host anywhere
