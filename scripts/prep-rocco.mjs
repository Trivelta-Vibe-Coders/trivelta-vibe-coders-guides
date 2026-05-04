#!/usr/bin/env node
// One-time chromakey: replace the baked-in white background of rocco.png
// with a true alpha channel, sampled by flood-fill from the four corners so
// white highlights inside the mascot survive. Run once; commit the result.
//
//   node scripts/prep-rocco.mjs

import sharp from 'sharp';
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC = join(__dirname, '..', 'src', 'assets', 'gallery', 'rocco', 'rocco.png');
const TMP = `${SRC}.tmp`;

// Permissive threshold so the flood-fill walks through the cream outer edge,
// the soft gray card border, and into the pure-white tile interior — without
// touching the dog's brown body. Highlights inside the mascot survive because
// they're surrounded by darker pixels and unreachable from the corners.
const NEAR_WHITE = 175;

const { data, info } = await sharp(SRC)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const W = info.width;
const H = info.height;
const px = Buffer.from(data);

const isWhitish = (i) => {
  const r = px[i], g = px[i + 1], b = px[i + 2];
  return r >= NEAR_WHITE && g >= NEAR_WHITE && b >= NEAR_WHITE;
};

// Flood-fill from each corner; only pixels reachable through whitish neighbors
// get knocked out — white highlights inside the mascot are unreachable.
const visited = new Uint8Array(W * H);
const stack = [];

const seeds = [
  [0, 0],
  [W - 1, 0],
  [0, H - 1],
  [W - 1, H - 1],
];

for (const [sx, sy] of seeds) {
  const idx = (sy * W + sx) * 4;
  if (isWhitish(idx)) stack.push(sy * W + sx);
}

while (stack.length) {
  const p = stack.pop();
  if (visited[p]) continue;
  visited[p] = 1;
  const x = p % W;
  const y = (p - x) / W;
  const i = p * 4;
  if (!isWhitish(i)) continue;
  px[i + 3] = 0; // fully transparent

  if (x > 0) stack.push(p - 1);
  if (x < W - 1) stack.push(p + 1);
  if (y > 0) stack.push(p - W);
  if (y < H - 1) stack.push(p + W);
}

// Soft 1px feather: any opaque pixel adjacent to a transparent one gets alpha 200
// so the silhouette doesn't have a hard jagged edge against the dark card.
const baseAlpha = Buffer.from(px); // snapshot before feathering
for (let y = 1; y < H - 1; y++) {
  for (let x = 1; x < W - 1; x++) {
    const i = (y * W + x) * 4;
    if (baseAlpha[i + 3] === 0) continue;
    const neighbors = [
      baseAlpha[((y - 1) * W + x) * 4 + 3],
      baseAlpha[((y + 1) * W + x) * 4 + 3],
      baseAlpha[(y * W + (x - 1)) * 4 + 3],
      baseAlpha[(y * W + (x + 1)) * 4 + 3],
    ];
    if (neighbors.some((a) => a === 0)) {
      px[i + 3] = Math.min(px[i + 3], 220);
    }
  }
}

const buf = await sharp(px, { raw: { width: W, height: H, channels: 4 } })
  .png({ compressionLevel: 9 })
  .toBuffer();

writeFileSync(TMP, buf);
const { renameSync } = await import('node:fs');
renameSync(TMP, SRC);

console.log(`rocco.png chromakeyed -> ${SRC} (${buf.length} bytes)`);
