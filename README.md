<!-- CAPSULE RENDER TOP WAVE -->
<img src="https://capsule-render.vercel.app/api?type=waving&color=c81e1e&height=140&section=header&fontColor=ffffff&animation=fadeIn" width="100%"/>

<div align="center">

<!-- ASCII LOGO -->
```
             J U S T I C E   F O R

          ██╗  ██╗ █████╗ ██████╗ ██╗
          ██║  ██║██╔══██╗██╔══██╗██║
          ███████║███████║██║  ██║██║
          ██╔══██║██╔══██║██║  ██║██║
          ██║  ██║██║  ██║██████╔╝██║
          ╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝ ╚═╝

             1 9 9 3   –   2 0 2 5
```

<!-- TYPING SVG ANIMATION -->
[![Typing SVG](https://readme-typing-svg.demolab.com?font=Share+Tech+Mono&size=20&duration=3000&pause=1000&color=E6453F&center=true&vCenter=true&width=700&lines=In+memoriam+Sharif+Osman+Bin+Hadi.;Co-founder%2C+Inqilab+Moncho.;A+leading+voice+of+the+July+Revolution.;%23WeAreOsmanHadi)](https://hadi-memoriam.vercel.app/)

<br/>

<!-- BADGES ROW -->
[![Live Site](https://img.shields.io/badge/🌐_LIVE_SITE-hadi--memoriam.vercel.app-black?style=for-the-badge&labelColor=c81e1e&color=7a1212)](https://hadi-memoriam.vercel.app/)
&nbsp;
[![GitHub](https://img.shields.io/badge/GITHUB-Hadi--Memoriam-black?style=for-the-badge&logo=github&logoColor=ffffff&labelColor=238636&color=1a5228)](https://github.com/Lorapok/Hadi-Memoriam)
&nbsp;
![Status](https://img.shields.io/badge/STATUS-JUSTICE_PENDING-black?style=for-the-badge&labelColor=c81e1e&color=7a1212)
&nbsp;
[![Views](https://hadi-memoriam.vercel.app/api/views)](https://github.com/Lorapok/Hadi-Memoriam)
&nbsp;
[![Used By](https://hadi-memoriam.vercel.app/api/used-by)](#the-used-by-counter)

</div>

> The two badges above (**Views**, **Used By**) are served by this project's own backend in `/api` — not shields.io, not komarev, not any third-party counter. See [`DEPLOYMENT.md`](./DEPLOYMENT.md) for how that's wired up. Until the project is deployed and that placeholder domain is swapped for the real one, those two specific badges won't resolve — everything else on this page works regardless.

---

## `$ cat /etc/hadi/identity`

```
╔══════════════════════════════════════════════════════════════╗
║                                                                ║
║   NAME        : Sharif Osman Bin Hadi                         ║
║   ROLE        : Co-founder & Spokesperson, Inqilab Moncho     ║
║   BORN        : 30 June 1993 · Nalchity, Jhalokathi           ║
║   DIED        : 18 December 2025 · Singapore General Hospital ║
║   MOVEMENT    : July Revolution, 2024                         ║
║   STATUS      : [ JUSTICE PENDING ]                           ║
║                                                                ║
╚══════════════════════════════════════════════════════════════╝
```

> "The person can die. The idea cannot die." — Sharif Osman Bin Hadi

This repo is a small, independent tribute: a GitHub README banner and a hosted memorial page, built so the people who carry his name forward have something to point to, embed, and keep updating as the case develops.

---

## What's in this repo

```
.
├── index.html                  # the tribute page — served as a static file on Vercel
├── README.md
├── DEPLOYMENT.md                # ← full hosting / backend setup guide, start there
├── vercel.json                  # cache headers for /assets and /api
├── package.json
├── api/
│   ├── views.js                 # own backend — increments + persists the view counter
│   └── used-by.js                # own backend — serves the used-by counter
├── lib/
│   └── badge.js                  # self-made SVG badge renderer (no shields.io dependency)
├── assets/
│   ├── banner.svg                # self-contained README hero banner
│   ├── og-image.png              # static social-preview image
│   └── used-by.json              # human-edited list of repos using the banner
└── .github/workflows/
    └── deploy-vercel.yml         # optional: push-to-deploy via GitHub Actions + Secrets
```

`index.html` and `banner.svg` both embed their images as base64, so neither can go "broken image" from a missing asset folder.

## 1. Use the banner in any README

```md
<img src="https://raw.githubusercontent.com/Lorapok/Hadi-Memoriam/main/assets/banner.svg" alt="Justice for Hadi" width="100%">
```

A single SVG, portrait included — nothing else to copy alongside it. The red status dot pulses via native SVG `<animate>`; unsupported renderers just show it solid, nothing breaks.

## 2. Hosting

This is now hosted on **Vercel**, with a small self-built backend (`/api/views`, `/api/used-by`) instead of relying on a third-party counter service. Full setup — Vercel project, environment variables, the GitHub Actions deploy pipeline, and what each secret is for — is in **[`DEPLOYMENT.md`](./DEPLOYMENT.md)**. Short version:

```bash
git init && git add . && git commit -m "Justice for Hadi"
git branch -M main
git remote add origin https://github.com/Lorapok/Hadi-Memoriam.git
git push -u origin main
```
Then import the repo into Vercel and follow `DEPLOYMENT.md` from §2 onward for the environment variables the backend needs.

## 3. The used-by counter

It's a self-reported, community-maintained list — there's no reliable way to detect every README that embeds the banner, so rather than guess, it's an honest opt-in list read live by `/api/used-by`:

1. Open `assets/used-by.json`.
2. Add your repo:
   ```json
   { "name": "you/your-repo", "url": "https://github.com/you/your-repo", "added": "2026-01-20" }
   ```
3. Open a PR. Once merged (and redeployed), `/api/used-by` picks up the new count immediately — there's no separate generation step to run.

## 4. Sources

- [Wikipedia — Osman Hadi](https://en.wikipedia.org/wiki/Osman_Hadi)
- [Justice for Hadi — About](https://www.justiceforhadi.org/about)
- [Vikidia — Sharif Osman Bin Hadi](https://en.vikidia.org/wiki/Sharif_Osman_Bin_Hadi)
- [Shaheed Sharif Osman Bin Hadi — Memorial Archive](https://www.hadiarchive.com/)

## Attribution

Full art and design credits live in the **Art & design credits** table at the bottom of `index.html` (under *Sources & references*) rather than scattered across the page. Short version: portrait line-art is by **Kamrul Graphic** (credit as signed on the piece — no further verified profile found; open an issue if you can point us to one), the street-art tribute illustration's artist is unknown to us, and the page itself was built by Lorapok Labs.

---

<div align="center">
<sub>#WeAreOsmanHadi</sub>
</div>

<!-- CAPSULE RENDER BOTTOM WAVE -->
<img src="https://capsule-render.vercel.app/api?type=waving&color=c81e1e&height=100&section=footer" width="100%"/>
