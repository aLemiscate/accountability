// Loads the built single-file site in Chromium, when Playwright is available.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { ROOT } from '../scripts/lib.mjs';
import { getBrowser, closeBrowser } from '../scripts/web.mjs';

const bundle = path.join(ROOT, 'dist', 'said-did.html');

test('the built site renders every view without script errors', async (t) => {
  if (!existsSync(bundle)) return t.skip('run "npm run build" first');
  const browser = await getBrowser();
  if (!browser) return t.skip('Playwright browser not installed');
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 900 } });
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.route(/^https?:/, (route) => route.abort()); // no network needed
    await page.goto(pathToFileURL(bundle).href);
    assert.ok(await page.locator('.receipt').count() > 0, 'receipts render');
    for (const view of ['timeline', 'patterns', 'watchlist', 'method']) {
      await page.click(`#tab-${view}`);
      assert.ok((await page.locator('main#view').innerText()).length > 100, `${view} renders`);
    }
    await page.click('#tab-timeline');
    await page.locator('.tl-card').first().click();
    assert.ok(await page.locator('dialog#entry[open]').count() === 1, 'entry dialog opens');
    const [scrollW, innerW] = await page.evaluate(() => [document.documentElement.scrollWidth, innerWidth]);
    assert.ok(scrollW <= innerW, 'no horizontal scroll at phone width');
    assert.deepEqual(errors, []);
  } finally {
    await closeBrowser();
  }
});
