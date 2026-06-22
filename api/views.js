// api/views.js
//
// A view counter we actually own: every call increments a number persisted
// straight into this GitHub repo (a dedicated `data` branch holding
// stats.json), using the GitHub REST API with a token supplied via an
// environment variable. No komarev.com, no shields.io endpoint badge —
// the GitHub repo IS the database.
//
// Required Vercel environment variables (see DEPLOYMENT.md):
//   GH_TOKEN          - GitHub token with Contents read/write on this repo
//   GH_OWNER          - defaults to "Lorapok"
//   GH_REPO           - defaults to "Hadi-Memoriam"
//   GH_DATA_BRANCH    - defaults to "data"
//
// Storage technique: each update writes a brand-new orphan commit (no
// parent) and force-updates the branch ref to point at it. That keeps the
// `data` branch sitting at a single visible commit forever instead of
// growing one commit per page view.

const { renderBadge } = require('../lib/badge');

const GH_API = 'https://api.github.com';
const FILE_PATH = 'stats.json';

function ghHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'hadi-memoriam-views-counter',
  };
}

async function readCount(owner, repo, branch, headers) {
  const url = `${GH_API}/repos/${owner}/${repo}/contents/${FILE_PATH}?ref=${branch}`;
  const r = await fetch(url, { headers });
  if (r.status === 404) return 0;
  if (!r.ok) throw new Error(`read failed: ${r.status} ${await r.text()}`);
  const json = await r.json();
  const content = Buffer.from(json.content, 'base64').toString('utf-8');
  try {
    return JSON.parse(content).count || 0;
  } catch {
    return 0;
  }
}

async function writeCount(owner, repo, branch, headers, newCount) {
  const content = Buffer.from(JSON.stringify({ count: newCount, updated: new Date().toISOString() })).toString('base64');

  // 1. blob
  const blob = await (await fetch(`${GH_API}/repos/${owner}/${repo}/git/blobs`, {
    method: 'POST', headers, body: JSON.stringify({ content, encoding: 'base64' }),
  })).json();

  // 2. tree (single file, no base tree -> orphan)
  const tree = await (await fetch(`${GH_API}/repos/${owner}/${repo}/git/trees`, {
    method: 'POST', headers,
    body: JSON.stringify({ tree: [{ path: FILE_PATH, mode: '100644', type: 'blob', sha: blob.sha }] }),
  })).json();

  // 3. orphan commit (no parents -> branch history never grows)
  const commit = await (await fetch(`${GH_API}/repos/${owner}/${repo}/git/commits`, {
    method: 'POST', headers,
    body: JSON.stringify({ message: `chore: views -> ${newCount}`, tree: tree.sha, parents: [] }),
  })).json();

  // 4. point the branch at the new commit, creating the ref the first time
  const refUrl = `${GH_API}/repos/${owner}/${repo}/git/refs/heads/${branch}`;
  const patchResp = await fetch(refUrl, {
    method: 'PATCH', headers, body: JSON.stringify({ sha: commit.sha, force: true }),
  });
  if (patchResp.status === 404) {
    await fetch(`${GH_API}/repos/${owner}/${repo}/git/refs`, {
      method: 'POST', headers,
      body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: commit.sha }),
    });
  }
}

module.exports = async (req, res) => {
  const {
    GH_TOKEN,
    GH_OWNER = 'Lorapok',
    GH_REPO = 'Hadi-Memoriam',
    GH_DATA_BRANCH = 'data',
  } = process.env;

  const format = (req.query && req.query.format) || 'svg';

  if (!GH_TOKEN) {
    // Backend isn't configured yet — degrade gracefully instead of a hard 500,
    // so the badge/page still render while someone sets GH_TOKEN.
    if (format === 'json') {
      res.status(200).json({ count: null, configured: false });
      return;
    }
    res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
    res.status(200).send(renderBadge({ label: 'views', message: 'not configured', labelColor: '#161616', color: '#5b5852' }));
    return;
  }

  const headers = ghHeaders(GH_TOKEN);

  try {
    const current = await readCount(GH_OWNER, GH_REPO, GH_DATA_BRANCH, headers);
    const next = current + 1;
    await writeCount(GH_OWNER, GH_REPO, GH_DATA_BRANCH, headers, next);

    if (format === 'json') {
      res.setHeader('Cache-Control', 'no-store');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.status(200).json({ count: next });
      return;
    }

    const svg = renderBadge({ label: 'views', message: String(next), labelColor: '#161616', color: '#c81e1e' });
    res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).send(svg);
  } catch (err) {
    if (format === 'json') {
      res.status(200).json({ count: null, error: String(err) });
      return;
    }
    res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
    res.status(200).send(renderBadge({ label: 'views', message: 'error', labelColor: '#161616', color: '#5b5852' }));
  }
};
