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

test('views share by link, search marks its matches, and quotes open in their source', async (t) => {
  if (!existsSync(bundle)) return t.skip('run "npm run build" first');
  const browser = await getBrowser();
  if (!browser) return t.skip('Playwright browser not installed');
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.route(/^https?:/, (route) => route.abort());
    const url = pathToFileURL(bundle).href;

    // A filtered view opens from its link, and changing a filter updates the link.
    await page.goto(`${url}#timeline.openai`);
    assert.equal(await page.getAttribute('#tab-timeline', 'aria-selected'), 'true', 'link opens the timeline');
    assert.match(await page.locator('#count').innerText(), /of \d+ entries match/i, 'link applies the company filter');
    await page.locator('#org button', { hasText: 'Anthropic' }).click();
    assert.equal(await page.evaluate(() => location.hash), '#timeline.anthropic', 'filter change updates the link');
    await page.locator('#org button', { hasText: 'Both' }).click();

    // Search reaches pattern names, marks the words, and says where it matched.
    const pattern = await page.evaluate(() => window.SAID_DID.patterns[0].name);
    await page.fill('#q', pattern);
    await page.waitForTimeout(300);
    assert.match(await page.locator('#count').innerText(), /[1-9]\d* of \d+ entries match/i, `search finds the pattern "${pattern}"`);
    assert.ok(await page.locator('.why').count() > 0, 'cards say where a search matched');
    assert.ok(await page.locator('mark.qhit').count() > 0, 'matched words are marked');

    // Search narrows the commitments documents and opens the matching lists.
    await page.click('#tab-commitments');
    await page.fill('#q', 'red-teaming');
    await page.waitForTimeout(300);
    assert.ok(await page.locator('.cdoc details[open] .citem').count() > 0, 'matching commitments are listed open');
    await page.fill('#q', '');
    await page.waitForTimeout(300);

    // A verified quote opens to the passage it was found in.
    await page.click('#tab-receipts');
    const panel = page.locator('details.insource').first();
    if (await panel.count()) {
      await panel.locator('summary').click();
      assert.ok(await panel.locator('.passage mark').count() > 0, 'the quote is marked in its source passage');
    }

    // With reduced motion, edit receipts start in their end state.
    assert.equal(await page.locator('.rev-armed').count(), 0, 'no edit animation under reduced motion');
    assert.deepEqual(errors, []);
  } finally {
    await closeBrowser();
  }
});
