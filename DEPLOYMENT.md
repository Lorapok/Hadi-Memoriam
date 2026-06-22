# Deployment guide

How to host this on Vercel with the page-view and used-by counters running on
their own backend — no GitHub Pages, no third-party counter service.

## Architecture, in short

```
GitHub repo (Lorapok/Hadi-Memoriam)
   │
   │  git push → GitHub Action (uses GitHub Secrets)
   ▼
Vercel project
   ├── index.html, assets/*        →  served as a static site
   └── api/views.js, api/used-by.js → Vercel serverless functions (our own backend)
            │
            │  reads/writes via the GitHub API (uses GH_TOKEN, a Vercel env var)
            ▼
   GitHub repo's `data` branch (stats.json)  ← the counter's actual database
```

Two different kinds of secret are involved and they live in two different
places — this trips people up, so to be explicit:

| Secret | Where it lives | Who uses it |
|---|---|---|
| `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` | **GitHub** → repo → Settings → Secrets and variables → Actions | The GitHub Action, to deploy this repo to Vercel |
| `GH_TOKEN` (+ optional `GH_OWNER`/`GH_REPO`/`GH_DATA_BRANCH`) | **Vercel** → project → Settings → Environment Variables | The `/api/views` function, to write the view count back into this repo |

---

## 1. Create the GitHub token the backend will use

This is the credential `/api/views` uses to persist the counter — it needs
write access to *this* repo only.

1. GitHub → Settings → Developer settings → **Fine-grained tokens** → Generate new token.
2. Resource owner: `Lorapok`. Repository access: **Only select repositories** → `Hadi-Memoriam`.
3. Permissions → Repository permissions → **Contents: Read and write**. Nothing else is needed.
4. Generate, copy the token (`github_pat_...`) — you won't see it again.

## 2. Create the Vercel project

1. [vercel.com](https://vercel.com) → **Add New → Project** → import `Lorapok/Hadi-Memoriam` from GitHub.
2. Framework preset: **Other** (it's a static `index.html` + `/api` functions — no build step needed).
3. Before the first deploy, open **Environment Variables** on the import screen (or Project → Settings → Environment Variables afterward) and add:

   | Key | Value |
   |---|---|
   | `GH_TOKEN` | the token from step 1 |
   | `GH_OWNER` | `Lorapok` *(optional — this is already the default)* |
   | `GH_REPO` | `Hadi-Memoriam` *(optional — already the default)* |
   | `GH_DATA_BRANCH` | `data` *(optional — already the default)* |

4. Deploy. Note the project's name shown in the dashboard — your live URL will be `https://<project-name>.vercel.app`. If it doesn't end up being `hadi-memoriam.vercel.app`, update the two `og:url`/`og:image` lines near the top of `index.html` to match.

This single import is actually enough on its own — Vercel will auto-redeploy on every push to `main` with zero extra config. The GitHub Action below is only needed if you specifically want the deploy to run *through* GitHub Actions (e.g. to gate it behind other CI steps, or because that's your team's standard). Both can coexist; if you don't want the Action, skip §3 and delete `.github/workflows/deploy-vercel.yml`.

## 3. (Optional) Wire up the GitHub Action

If you do want GitHub Actions driving the deploy:

1. Vercel → Account Settings → **Tokens** → Create token → copy it. This is `VERCEL_TOKEN`.
2. Get the other two IDs — easiest way, from your machine:
   ```bash
   npm install --global vercel
   vercel link        # follow the prompts, select the Hadi-Memoriam project
   cat .vercel/project.json
   ```
   That file has `orgId` and `projectId`.
3. GitHub → repo → **Settings → Secrets and variables → Actions → New repository secret**, add all three:
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`
4. Push to `main` — `.github/workflows/deploy-vercel.yml` picks it up automatically.

If you used Vercel's own GitHub integration (step 2) *and* keep this Action, you'll get two deploys per push (harmless, just slightly redundant) — most people pick one or the other.

## 4. Verify it's working

Once deployed:

- Visit `https://<your-project>.vercel.app/` — the page should load, "DAYS SINCE HE WAS TAKEN" should tick over correctly, and "REPOS USING THIS BANNER" should show `1`.
- `https://<your-project>.vercel.app/api/used-by` should return an SVG badge reading `1 repo`.
- `https://<your-project>.vercel.app/api/views` should return an SVG badge reading `1`, and reload again → `2`. If it instead shows `not configured`, `GH_TOKEN` isn't set in Vercel's environment variables yet (re-check step 2.3, then redeploy).
- After a successful `/api/views` call, check the repo on GitHub: a `data` branch should now exist with a single `stats.json` commit.

## 5. Update the README badges/links

Once you know the real `https://<project>.vercel.app` domain, update it in `README.md`:

- the **Live Site** badge URL and link
- the og-image references aren't in the README itself (those are in `index.html`, already pointed at `hadi-memoriam.vercel.app` — fix only if your project name differs)

The `/api/views` and `/api/used-by` badges in the README should use the **absolute** Vercel URL (e.g. `https://hadi-memoriam.vercel.app/api/views`), since GitHub renders the README on github.com, not on your Vercel domain — relative paths won't resolve there. Inside `index.html` itself, relative paths (`/api/views`) are correct and already in place, since the page is served from the same origin as the API.

## Known limitations (read before relying on this for serious traffic)

- **The view counter isn't perfectly race-safe.** Two requests arriving at the same instant can both read the same starting count and each write `count + 1`, undercounting by one. For a memorial tribute page this is a non-issue; it's not built for high-concurrency accuracy.
- **GitHub API rate limits.** A fine-grained token gets ~5,000 requests/hour; each view costs about 4–5 API calls (read, blob, tree, commit, ref update), so the realistic ceiling is roughly 1,000 views/hour. Comfortably enough for this project; not built for a viral spike.
- **The `data` branch is intentionally "fake history."** Every update force-pushes a fresh orphan commit so the branch never accumulates one commit per view. Don't branch off of `data` or expect normal git history there — it holds exactly one file, one commit, forever overwritten.

## Rolling back to GitHub Pages

If Vercel ever stops being the right fit, the project still works as a plain
static site — `index.html` and `assets/banner.svg` have no hard dependency on
the API existing (everything degrades to the build-time fallback numbers).
Just re-enable **Settings → Pages** on the repo and swap the API badge URLs
back to the GitHub-hosted ones; nothing else needs to change.
