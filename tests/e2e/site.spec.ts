import { test, expect, type Page } from '@playwright/test';

test.describe('vibe-coders-guides one-pager', () => {
  test('renders, six sections in order, no console errors, low CLS', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(`pageerror: ${String(e)}`));
    page.on('console', (m) => {
      if (m.type() === 'error') errors.push(`console.error: ${m.text()}`);
    });

    await page.addInitScript(() => {
      (window as unknown as { __cls: number }).__cls = 0;
      new PerformanceObserver((list) => {
        for (const e of list.getEntries() as PerformanceEntry[] & { value?: number; hadRecentInput?: boolean }[]) {
          if (!(e as { hadRecentInput?: boolean }).hadRecentInput) {
            (window as unknown as { __cls: number }).__cls += (e as { value: number }).value;
          }
        }
      }).observe({ type: 'layout-shift', buffered: true });
    });

    await page.goto('/');
    await expect(page).toHaveTitle(/Vibe Coding at Trivelta/);

    const order = await page.$$eval('[data-section]', (els) =>
      els.map((e) => e.getAttribute('data-section')),
    );
    expect(order).toEqual(['hero', 'routes', 'gallery', 'trouble', 'cta', 'footer']);

    const cards = page.locator('[data-section="gallery"] .gcard, [data-section="gallery"] .gcard-empty');
    await expect(cards).toHaveCount(3);

    for (const slug of ['trivelta-ai-reviews', 'rocco']) {
      const repo = page.locator(`.gcard[data-slug="${slug}"] a[href*="github.com"]`).first();
      await expect(repo).toHaveAttribute('href', /github\.com\/sam-trivelta\//);
    }

    const cls = await page.evaluate(() => (window as unknown as { __cls: number }).__cls);
    expect(cls).toBeLessThan(0.1);
    expect(errors, errors.join('\n')).toEqual([]);
  });

  test('mobile (375px): gallery collapses to one column', async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 375, height: 800 } });
    const page = await ctx.newPage();
    await page.goto('/');

    const grid = page.locator('[data-section="gallery"] .gallery-grid');
    const cols = await grid.evaluate(
      (el) => getComputedStyle(el as HTMLElement).gridTemplateColumns.split(' ').length,
    );
    expect(cols).toBe(1);

    await ctx.close();
  });

  test('gallery image bytes on initial load <= 500 KB', async ({ page }) => {
    let bytes = 0;
    page.on('response', async (r) => {
      const url = r.url();
      if (/\/_astro\/(tv|rocco)\..*\.(avif|webp|png)$/.test(url)) {
        try {
          const buf = await r.body();
          bytes += buf.length;
        } catch {
          /* response body not available — fine */
        }
      }
    });

    await page.goto('/', { waitUntil: 'networkidle' });
    expect(bytes).toBeLessThanOrEqual(500 * 1024);
  });

  test('contribute anchor: clicking "Yours next" jumps to #contribute', async ({ page }) => {
    await page.goto('/');
    await page.locator('.gcard-empty').click();
    await expect(page).toHaveURL(/#contribute$/);
    await expect(page.locator('#contribute')).toBeInViewport();
  });

  test('healthz endpoint returns ok', async ({ request }) => {
    const res = await request.get('/healthz');
    expect(res.status()).toBe(200);
    expect((await res.text()).trim()).toBe('ok');
  });
});
