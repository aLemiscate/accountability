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
    // `list.length && el` renders a literal "0" when the list is empty; no card or dialog may show one.
    const strayZero = () => page.evaluate(() => [...document.querySelectorAll('.tl-card, dialog .d-body')]
      .some((el) => [...el.childNodes].some((n) => n.nodeType === Node.TEXT_NODE && n.textContent.trim() === '0')));
    assert.equal(await strayZero(), false, 'no stray "0" in timeline cards');
    const bare = await page.evaluate(() => window.SAID_DID.entries.find((e) => !e.patterns.length && !e.updates?.length)?.id);
    if (bare) {
      await page.evaluate((id) => { location.hash = `e-${id}`; }, bare);
      await page.waitForSelector('dialog#entry[open]');
      assert.equal(await strayZero(), false, `no stray "0" in the dialog for ${bare}`);
      await page.keyboard.press('Escape');
    }
    await page.locator('.tl-card').first().click();
    assert.ok(await page.locator('dialog#entry[open]').count() === 1, 'entry dialog opens');
    const [scrollW, innerW] = await page.evaluate(() => [document.documentElement.scrollWidth, innerWidth]);
    assert.ok(scrollW <= innerW, 'no horizontal scroll at phone width');
    await page.keyboard.press('Escape');
    // Search reaches text that only appears in an entry's updates or source list.
    const updateWord = await page.evaluate(() => window.SAID_DID.entries.flatMap((e) => e.updates || [])[0]?.text.split(/\W+/).find((w) => w.length > 8));
    if (updateWord) {
      await page.fill('#q', updateWord);
      await page.waitForTimeout(300);
      assert.match(await page.locator('#count').innerText(), /[1-9]\d* of \d+ entries match/i, `search finds "${updateWord}"`);
    }
    assert.deepEqual(errors, []);
  } finally {
    await closeBrowser();
  }
});
