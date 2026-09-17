## Connect GitHub → Vercel for auto-deploys

Your GitHub repo: **https://github.com/sireeshkurlapalli/equity-tracker**

### Step 1: Go to Vercel project settings
Open in browser:
```
https://vercel.com/sireeshkk-3651/equity-tracker/settings
```

### Step 2: Connect Git repository
1. Scroll to **"Git Repository"** section
2. Click **"Add Git Repository"** or **"Connect Git Repository"**
3. You'll see a list of your GitHub repos — find **`equity-tracker`** (under `sireeshkurlapalli`)
4. Click **"Connect"** next to it

> If you don't see the repo, make sure you're logged into Vercel with the same account that owns the GitHub repo.

### Step 3: Configure
- **Branch**: `main` (default — already selected)
- **Build Command**: `npm run build` (auto-detected)
- **Output Directory**: Next.js default (auto-detected)
- Leave everything as default, click **"Deploy"**

Vercel will install its GitHub App and enable auto-deploys. From now on, every `git push` to `main` triggers a new deployment.

---

## How to get a GitHub Personal Access Token (PAT)

You already have one (`ghp_X2NEE...`). Here's how to create/revoke more:

### Create a new PAT
1. Go to **https://github.com/settings/tokens**
2. Click **"Generate new token (classic)"**
3. Add a note: e.g. `EquityPulse Deploy`
4. Set expiration (e.g. 90 days)
5. Check scopes:
   - ✅ **repo** — full control of repositories (needed to push)
6. Click **"Generate token"**
7. **Copy the token immediately** (starts with `ghp_`) — it won't be shown again

### Revoke a token
1. Go to **https://github.com/settings/tokens**
2. Find the token (e.g. `EquityPulse Deploy`)
3. Click **"Revoke"**

### Use the token
- For `git push`: embed it in the URL (as I did):  
  `https://x-oauth-basic:TOKEN@github.com/username/repo.git`
- For API calls: `Authorization: Bearer TOKEN` header
- For GitHub CLI: `gh auth login --with-token < TOKEN`

---

## Verify auto-deploys work

Once connected, test it:

```bash
cd /c/Users/user/equity-tracker
git pull origin main          # sync local with what we pushed
# Make any small change, e.g. edit README.md
git add README.md
git commit -m "test auto-deploy"
git push origin main
```

Then check:
- **Vercel dashboard**: https://vercel.com/sireeshkk-3651/equity-tracker — a new deployment should appear within ~30 seconds
- **Live URL**: https://equity-tracker-cj14h0jy6-sireeshkk-3651.vercel.app — updated after deploy

---

## Your live app
**https://equity-tracker-cj14h0jy6-sireeshkk-3651.vercel.app**

---

## Optional: Add a custom domain
In Vercel project settings → **Domains** → add a domain like `equitypulse.app` or `portfolio.yourname.com`. Vercel gives free SSL (HTTPS) automatically. You'll need to configure DNS at your domain registrar.
