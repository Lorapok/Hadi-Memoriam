// api/used-by.js
//
// Own backend, no third-party badge/counter service. Reads assets/used-by.json
// (bundled with the deployment) and either:
//   - returns a self-rendered SVG badge (default — embed straight in a README)
//   - returns JSON when called with ?format=json (used by index.html's live counter)

const fs = require('fs');
const path = require('path');
const { renderBadge } = require('../lib/badge');

module.exports = (req, res) => {
  let count = 0;

  try {
    const filePath = path.join(process.cwd(), 'assets', 'used-by.json');
    const raw = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(raw);
    count = Array.isArray(data.repos) ? data.repos.length : 0;
  } catch (err) {
    // fall back to 0 rather than failing the request — a missing/blank
    // list shouldn't take the badge down.
    count = 0;
  }

  const format = (req.query && req.query.format) || 'svg';

  if (format === 'json') {
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json({ count });
    return;
  }

  const message = `${count} repo${count === 1 ? '' : 's'}`;
  const svg = renderBadge({ label: 'used by', message, labelColor: '#161616', color: '#c81e1e' });

  res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300');
  res.status(200).send(svg);
};
