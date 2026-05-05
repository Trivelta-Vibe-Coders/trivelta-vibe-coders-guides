#!/usr/bin/env node
// One-shot capture of the trivelta-ai-reviews TV view for the gallery card.
//
//   GUEST_EMAIL=guest@trivelta.com GUEST_PASSWORD=... node scripts/capture-tv-screenshot.mjs
//
// Logs in, navigates to ?view=tv, waits for the dashboard to render,
// and writes src/assets/gallery/trivelta-ai-reviews/tv.png.

import { chromium } from '@playwright/test';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '..', 'src', 'assets', 'gallery', 'trivelta-ai-reviews', 'tv.png');

const BASE = 'https://dashboard-production-f589.up.railway.app';
const EMAIL = process.env.GUEST_EMAIL;
const PASSWORD = process.env.GUEST_PASSWORD;

if (!EMAIL || !PASSWORD) {
  console.error('Set GUEST_EMAIL and GUEST_PASSWORD env vars.');
  process.exit(1);
}

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1920, height: 1200 } });
const page = await context.newPage();

await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });

await page.locator('#email').waitFor({ state: 'visible' });
await page.locator('#email').fill(EMAIL);
await page.locator('#password').fill(PASSWORD);
await page.getByRole('button', { name: /sign in/i }).click();
// Auth happens client-side via Supabase; the LoginPage component unmounts
// once the session is set. Wait for the email input to detach.
await page.locator('#email').waitFor({ state: 'detached', timeout: 20_000 });

await page.goto(`${BASE}/?view=tv`, { waitUntil: 'networkidle' });
await page.waitForTimeout(5000); // let trees + counters settle

await page.screenshot({ path: OUT, fullPage: false });
await browser.close();

console.log(`tv.png saved -> ${OUT}`);
