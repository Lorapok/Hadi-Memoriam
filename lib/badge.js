// lib/badge.js
//
// A tiny, dependency-free SVG badge renderer — built in-house so the project
// doesn't lean on shields.io or any other badge-as-a-service for its live
// counters. Visually similar to a "for-the-badge" style flat badge.

function escapeXml(s) {
  return String(s).replace(/[<>&"']/g, (c) => ({
    '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;',
  }[c]));
}

// Rough average glyph width for a bold ~11px uppercase sans-serif label.
const CHAR_W = 7.1;
const PAD = 14;
const HEIGHT = 28;

function renderBadge({ label, message, labelColor = '#161616', color = '#c81e1e' }) {
  const labelText = String(label).toUpperCase();
  const messageText = String(message).toUpperCase();

  const labelW = Math.round(labelText.length * CHAR_W + PAD * 2);
  const msgW = Math.round(messageText.length * CHAR_W + PAD * 2);
  const totalW = labelW + msgW;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalW}" height="${HEIGHT}" role="img" aria-label="${escapeXml(label)}: ${escapeXml(message)}">
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#fff" stop-opacity=".06"/>
    <stop offset="1" stop-opacity=".06"/>
  </linearGradient>
  <rect width="${totalW}" height="${HEIGHT}" fill="${labelColor}"/>
  <rect x="${labelW}" width="${msgW}" height="${HEIGHT}" fill="${color}"/>
  <rect width="${totalW}" height="${HEIGHT}" fill="url(#s)"/>
  <g fill="#fff" font-family="Verdana,DejaVu Sans,Geneva,sans-serif" font-size="11" font-weight="700" text-anchor="middle">
    <text x="${labelW / 2}" y="${HEIGHT / 2 + 4}" letter-spacing="0.6">${escapeXml(labelText)}</text>
    <text x="${labelW + msgW / 2}" y="${HEIGHT / 2 + 4}" letter-spacing="0.6">${escapeXml(messageText)}</text>
  </g>
</svg>`;
}

module.exports = { renderBadge };
