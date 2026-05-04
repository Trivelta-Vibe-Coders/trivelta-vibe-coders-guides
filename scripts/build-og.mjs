#!/usr/bin/env node
// Generates public/og.png — 1200x630 social card.
// Run once via `node scripts/build-og.mjs`. Output is committed.

import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '..', 'public', 'og.png');

const W = 1200;
const H = 630;

// Tokens (mirror src/styles/tokens.css)
const BG = '#0a0c10';
const BG_ELEV = '#11141b';
const BG_CODE = '#0d1017';
const BORDER = '#1f2530';
const ACCENT = '#3b82f6';
const TEXT = '#e6e9ef';
const TEXT_DIM = '#9aa3b2';
const TEXT_FAINT = '#6b7383';

const svg = `
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="glow" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${ACCENT}" stop-opacity="0.10" />
      <stop offset="60%" stop-color="${ACCENT}" stop-opacity="0.00" />
    </linearGradient>
    <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="1" />
    </filter>
  </defs>

  <rect width="${W}" height="${H}" fill="${BG}" />
  <rect width="${W}" height="${H}" fill="url(#glow)" />

  <!-- Brand row -->
  <g transform="translate(80, 88)">
    <rect width="14" height="14" rx="3" fill="${ACCENT}" />
    <text x="28" y="13" font-family="-apple-system, Inter, system-ui, sans-serif"
          font-size="18" font-weight="600" fill="${TEXT}" letter-spacing="0.4">
      Trivelta Vibe Coders
    </text>
  </g>

  <!-- Headline -->
  <g transform="translate(80, 200)">
    <text font-family="-apple-system, Inter, system-ui, sans-serif"
          font-size="72" font-weight="600" fill="${TEXT}" letter-spacing="-1.5">
      <tspan x="0" y="0">Vibe Coding</tspan>
      <tspan x="0" y="86">at Trivelta.</tspan>
    </text>
  </g>

  <!-- Subhead -->
  <g transform="translate(80, 412)">
    <text font-family="-apple-system, Inter, system-ui, sans-serif"
          font-size="22" font-weight="400" fill="${TEXT_DIM}">
      Idea to live URL in under 10 minutes.
    </text>
  </g>

  <!-- Card silhouettes (lower-right) -->
  <g transform="translate(720, 200)">
    <rect width="180" height="240" rx="14" fill="${BG_ELEV}" stroke="${BORDER}" stroke-width="1" />
    <rect x="14" y="14" width="152" height="100" rx="6" fill="${BG_CODE}" />
    <rect x="14" y="130" width="100" height="8" rx="2" fill="${TEXT_FAINT}" opacity="0.55" />
    <rect x="14" y="148" width="140" height="6" rx="2" fill="${TEXT_FAINT}" opacity="0.30" />
    <rect x="14" y="162" width="120" height="6" rx="2" fill="${TEXT_FAINT}" opacity="0.30" />
    <rect x="14" y="200" width="40" height="14" rx="3" fill="${ACCENT}" opacity="0.85" />
  </g>
  <g transform="translate(920, 250)">
    <rect width="180" height="240" rx="14" fill="${BG_ELEV}" stroke="${BORDER}" stroke-width="1" />
    <rect x="14" y="14" width="152" height="100" rx="6" fill="${BG_CODE}" />
    <rect x="14" y="130" width="110" height="8" rx="2" fill="${TEXT_FAINT}" opacity="0.55" />
    <rect x="14" y="148" width="140" height="6" rx="2" fill="${TEXT_FAINT}" opacity="0.30" />
    <rect x="14" y="162" width="120" height="6" rx="2" fill="${TEXT_FAINT}" opacity="0.30" />
    <rect x="14" y="200" width="40" height="14" rx="3" fill="${ACCENT}" opacity="0.55" />
  </g>
  <!-- Dashed contribution slot -->
  <g transform="translate(820, 320)">
    <rect width="180" height="240" rx="14" fill="none"
          stroke="${BORDER}" stroke-width="1.5" stroke-dasharray="6 6" />
    <text x="90" y="130" text-anchor="middle"
          font-family="-apple-system, Inter, system-ui, sans-serif"
          font-size="14" font-weight="500" fill="${TEXT_FAINT}">Yours next →</text>
  </g>

  <!-- Bottom rule -->
  <rect x="80" y="540" width="${W - 160}" height="1" fill="${BORDER}" />
  <text x="80" y="572" font-family="ui-monospace, SF Mono, Menlo, monospace"
        font-size="13" fill="${TEXT_FAINT}" letter-spacing="0.6">
    vibe-coders-guides-production.up.railway.app
  </text>
</svg>
`;

await sharp(Buffer.from(svg))
  .png({ compressionLevel: 9, quality: 90 })
  .toFile(OUT);

console.log(`og.png -> ${OUT}`);
