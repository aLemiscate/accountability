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

test('jumps land below the sticky bar, and a filter keeps the reader on their card', async (t) => {
  if (!existsSync(bundle)) return t.skip('run "npm run build" first');
  const browser = await getBrowser();
  if (!browser) return t.skip('Playwright browser not installed');
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 860 } });
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.route(/^https?:/, (route) => route.abort());
    await page.goto(pathToFileURL(bundle).href);
    await page.waitForSelector('.receipt');
    const bar = () => page.evaluate(() => document.querySelector('.controls').getBoundingClientRect().bottom);
    const top = (sel) => page.evaluate((s) => document.querySelector(s).getBoundingClientRect().top, sel);

    // A tab picked from deep in one view opens the next at its start, not part way down.
    await page.evaluate(() => scrollTo(0, 3000));
    await page.click('#tab-timeline');
    const h2 = await top('.view-head h2');
    assert.ok(h2 >= await bar() && h2 < 400, `the timeline opens at its heading (heading at ${h2})`);

    // A pattern picked from a card filters the timeline around that card, which stays where it was.
    await page.evaluate(() => scrollTo(0, 12000));
    const before = await page.evaluate(() => {
      const below = document.querySelector('.controls').getBoundingClientRect().bottom + 80;
      const card = [...document.querySelectorAll('.tl-card')].find((c) => c.getBoundingClientRect().top > below && c.querySelector('.tl-patterns .chip'));
      return { key: card.dataset.key, top: card.getBoundingClientRect().top, p: card.querySelector('.tl-patterns .chip').dataset.p };
    });
    const chip = `.tl-card[data-key="${before.key}"] .chip[data-p="${before.p}"]`;
    await page.click(chip);
    assert.match(await page.locator('#count').innerText(), /[1-9]\d* of \d+ entries match/i, 'the pattern filters the timeline');
    const kept = await top(`.tl-card[data-key="${before.key}"]`);
    assert.ok(Math.abs(kept - before.top) < 2, `the card stays in place (${before.top} then ${kept})`);
    assert.ok(await page.evaluate((s) => document.activeElement === document.querySelector(s), chip), 'focus stays on the pattern tag');
    // Following the same tag again lifts the filter, and the card still holds its place.
    await page.click(chip);
    const back = await top(`.tl-card[data-key="${before.key}"]`);
    assert.ok(Math.abs(back - before.top) < 2, `the card holds its place when the filter lifts (${before.top} then ${back})`);
    // So does the last card, with the page scrolled to its end.
    await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
    const end = await page.evaluate(() => {
      const card = [...document.querySelectorAll('.tl-card')].pop();
      return { key: card.dataset.key, top: card.getBoundingClientRect().top, p: card.querySelector('.tl-patterns .chip')?.dataset.p };
    });
    if (end.p) {
      const endChip = `.tl-card[data-key="${end.key}"] .chip[data-p="${end.p}"]`;
      for (const step of ['goes on', 'comes off']) {
        await page.click(endChip);
        const at = await top(`.tl-card[data-key="${end.key}"]`);
        assert.ok(Math.abs(at - end.top) < 2, `the last card holds its place when the filter ${step} (${end.top} then ${at})`);
      }
    }
    // Changing the order leaves the page where it was.
    await page.evaluate(() => {
      const order = document.querySelector('.seg.order');
      scrollTo(0, scrollY + order.getBoundingClientRect().top - document.querySelector('.controls').offsetHeight - 20);
    });
    const order = await top('.seg.order');
    await page.click('.seg.order button:nth-child(2)');
    assert.ok(Math.abs(await top('.seg.order') - order) < 1, 'the order buttons stay where they were');
    await page.click('.seg.order button:nth-child(1)');

    // "About this pattern" lands on the pattern, below the bar, with focus on its heading.
    const pid = await page.evaluate(() => window.SAID_DID.patterns[3].id);
    await page.evaluate((id) => { location.hash = `p-${id}`; }, pid);
    await page.waitForFunction((id) => document.activeElement === document.querySelector(`#p-${id} h3`), pid);
    const h3 = await top(`#p-${pid} h3`);
    assert.ok(h3 >= await bar() && h3 < 400, `the pattern lands below the bar (heading at ${h3})`);

    // Keyboard focus never sits hidden under the bar, and moving it into the bar leaves the page where it is.
    await page.click('#tab-receipts');
    await page.evaluate(() => scrollTo(0, 4000));
    await page.evaluate(() => document.getElementById('q').focus());
    assert.equal(await page.evaluate(() => scrollY), 4000, 'focusing the search box does not scroll the page');
    await page.evaluate(() => [...document.querySelectorAll('#view button')].find((b) => b.getBoundingClientRect().top > 700).focus({ preventScroll: true }));
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('Shift+Tab');
      const at = await page.evaluate(() => ({ inView: !!document.activeElement.closest('#view'), top: document.activeElement.getBoundingClientRect().top }));
      if (!at.inView) break;
      assert.ok(at.top >= await bar(), `focus stays below the bar (at ${Math.round(at.top)})`);
    }
    assert.deepEqual(errors, []);
  } finally {
    await closeBrowser();
  }
});

test('a figure can be undone with Back, and a kept card holds its place past the first page and within its section', async (t) => {
  if (!existsSync(bundle)) return t.skip('run "npm run build" first');
  const browser = await getBrowser();
  if (!browser) return t.skip('Playwright browser not installed');
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 860 } });
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.route(/^https?:/, (route) => route.abort());
    await page.goto('about:blank');
    await page.goto(`${pathToFileURL(bundle).href}#timeline.openai`);
    await page.waitForSelector('.tl-card');

    // A figure is a link: Back returns to the view and filters the reader had.
    await page.click('.stat:nth-child(2)'); // "Didn't hold up" opens Receipts
    assert.equal(await page.evaluate(() => location.hash), '#receipts');
    await page.goBack();
    await page.waitForFunction(() => location.hash === '#timeline.openai');
    assert.match(await page.locator('#count').innerText(), /of \d+ entries match/i, 'Back brings the filter back');
    await page.goForward();
    await page.waitForFunction(() => location.hash === '#receipts');

    // A receipt well past the first page holds its place when a company is picked.
    await page.click('.more-bar .clear'); // Show all
    const key = await page.evaluate(() => {
      const org = (id) => window.SAID_DID.entries.find((e) => e.id === id)?.org;
      const openai = [...document.querySelectorAll('#view .receipts > [data-key]')].filter((c) => org(c.dataset.key.slice(2).split('--')[0]) === 'openai');
      const card = openai[Math.floor(openai.length * 0.8)];
      scrollTo(0, scrollY + card.getBoundingClientRect().top - 160);
      return card.dataset.key;
    });
    const top = () => page.evaluate((k) => document.querySelector(`#view [data-key="${k}"]`).getBoundingClientRect().top, key);
    const before = await top();
    await page.click('#org button:nth-child(2)'); // OpenAI
    const after = await top();
    assert.ok(Math.abs(after - before) < 2, `the receipt stays in place (${before} then ${after})`);
    await page.click('#org button:nth-child(1)'); // Both

    // On the Watchlist, a company switch keeps the reader among the promises they were reading.
    await page.click('.stat:nth-child(3)'); // "Kept" lands on "Held under pressure"
    for (const o of [2, 3]) {
      await page.click(`#org button:nth-child(${o})`);
      const group = await page.evaluate(() => {
        const bar = document.querySelector('.controls').getBoundingClientRect().bottom;
        return [...document.querySelectorAll('#view [data-key]')].find((c) => c.getBoundingClientRect().bottom > bar + 24)?.closest('[data-group]')?.dataset.group;
      });
      assert.equal(group, 'kept', `still among the kept promises after picking company ${o - 1}`);
      await page.click('#org button:nth-child(1)');
    }
    assert.deepEqual(errors, []);
  } finally {
    await closeBrowser();
  }
});
