#!/usr/bin/env node
// Snap 3 screenshots of the running site (desktop top, gallery, mobile) and
// post them as a comment on a GitHub PR.
//
//   # 1. dev server (or any server) running on http://localhost:4321
//   # 2. invoke
//   node scripts/pr-screenshots.mjs --pr 3
//   node scripts/pr-screenshots.mjs --pr 3 --base-url https://my.preview.app
//
// Images are pushed to an orphan branch `pr-screenshots` in this repo (created
// on first run) at `pr-<N>/<shortSha>/<name>.png`. The PR comment references
// them via raw.githubusercontent.com URLs — no third-party image host.

import { chromium } from '@playwright/test';
import { execSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, cpSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const ARGS = process.argv.slice(2);
const arg = (name) => {
  const i = ARGS.indexOf(name);
  return i >= 0 ? ARGS[i + 1] : undefined;
};

const PR = arg('--pr');
const BASE_URL = arg('--base-url') ?? 'http://localhost:4321';
const SCREENSHOT_BRANCH = 'pr-screenshots';

if (!PR) {
  console.error('Usage: node scripts/pr-screenshots.mjs --pr <number> [--base-url <url>]');
  process.exit(1);
}

function sh(cmd, opts = {}) {
  return execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], ...opts }).trim();
}

// --- gather repo / commit context ---------------------------------------
const remote = sh('git config --get remote.origin.url');
const m = remote.match(/github\.com[:/]([^/]+)\/([^/]+?)(?:\.git)?$/);
if (!m) throw new Error(`Cannot parse owner/repo from remote: ${remote}`);
const [, OWNER, REPO] = m;

const sha = sh('git rev-parse HEAD');
const shortSha = sha.slice(0, 7);

// --- snap screenshots to /tmp -------------------------------------------
const shotDir = mkdtempSync(join(tmpdir(), 'pr-shots-'));
console.log(`shooting → ${shotDir}`);

const browser = await chromium.launch();

async function snap(name, viewport, fullPage = false, scrollTo = null) {
  const ctx = await browser.newContext({ viewport });
  const page = await ctx.newPage();
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200); // let the staggered hero land + fonts settle
  if (scrollTo) {
    await page.locator(scrollTo).scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
  }
  const path = join(shotDir, `${name}.png`);
  await page.screenshot({ path, fullPage });
  await ctx.close();
  console.log(`  ${name}.png`);
}

await snap('desktop-top', { width: 1400, height: 1000 });
await snap('desktop-gallery', { width: 1400, height: 1000 }, false, '[data-section="gallery"]');
await snap('mobile', { width: 375, height: 800 }, true);
await browser.close();

// --- push screenshots to the pr-screenshots branch ----------------------
const wt = mkdtempSync(join(tmpdir(), 'pr-shots-wt-'));
const subdir = `pr-${PR}/${shortSha}`;
const localBranch = `pr-screenshots-${PR}-${shortSha}`;

// Make sure we have the latest remote ref (or know that the branch is missing).
try {
  sh(`git fetch origin ${SCREENSHOT_BRANCH}`);
} catch {
  // branch doesn't exist yet — we'll create it as orphan
}

const branchExists = (() => {
  try {
    sh(`git rev-parse --verify origin/${SCREENSHOT_BRANCH}`);
    return true;
  } catch {
    return false;
  }
})();

if (branchExists) {
  sh(`git worktree add -B ${localBranch} ${wt} origin/${SCREENSHOT_BRANCH}`);
} else {
  // Create an orphan branch with a single empty commit so we can push it.
  sh(`git worktree add --detach ${wt} HEAD`);
  sh(`git -C ${wt} checkout --orphan ${localBranch}`);
  sh(`git -C ${wt} rm -rf .`, { stdio: ['ignore', 'pipe', 'ignore'] });
}

const dest = join(wt, subdir);
mkdirSync(dest, { recursive: true });
cpSync(shotDir, dest, { recursive: true });

sh(`git -C ${wt} add ${subdir}`);
sh(
  `git -C ${wt} -c commit.gpgsign=false commit -m "screenshots: PR #${PR} @ ${shortSha}"`,
  { stdio: ['ignore', 'pipe', 'pipe'] },
);
sh(`git -C ${wt} push origin ${localBranch}:${SCREENSHOT_BRANCH}`);

// Clean up the worktree (branch ref stays, screenshots are now on remote).
sh(`git worktree remove --force ${wt}`);
sh(`git branch -D ${localBranch}`, { stdio: ['ignore', 'pipe', 'ignore'] });
rmSync(shotDir, { recursive: true, force: true });

// --- post PR comment ----------------------------------------------------
const rawBase = `https://raw.githubusercontent.com/${OWNER}/${REPO}/${SCREENSHOT_BRANCH}/${subdir}`;
const body = [
  `### 📸 Screenshots @ \`${shortSha}\``,
  '',
  '| desktop top | desktop gallery | mobile |',
  '| --- | --- | --- |',
  `| <img src="${rawBase}/desktop-top.png" width="280"> | <img src="${rawBase}/desktop-gallery.png" width="280"> | <img src="${rawBase}/mobile.png" width="180"> |`,
  '',
  `<sub>Captured from \`${BASE_URL}\` · [browse all](https://github.com/${OWNER}/${REPO}/tree/${SCREENSHOT_BRANCH}/pr-${PR})</sub>`,
].join('\n');

const bodyFile = join(tmpdir(), `pr-${PR}-comment-${shortSha}.md`);
writeFileSync(bodyFile, body);
sh(`gh pr comment ${PR} --repo ${OWNER}/${REPO} --body-file ${bodyFile}`);
rmSync(bodyFile, { force: true });

console.log(`\n✓ Posted comment on PR #${PR}`);
console.log(`  ${rawBase}/desktop-top.png`);
