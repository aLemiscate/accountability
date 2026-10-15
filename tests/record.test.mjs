// The plain record and the pages that don't depend on the site's JavaScript.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { ROOT, loadAll, derive, checkPolicyQuotes } from '../scripts/lib.mjs';
import { entryArticle, recordHtml, sitemapXml, finePrintHtml } from '../scripts/record.mjs';

const data = await loadAll();
await checkPolicyQuotes(data.policy);
const D = derive(data);

test('the plain record has every entry, with its sources', () => {
  const html = recordHtml(D);
  for (const e of D.entries) assert.ok(html.includes(`id="e-${e.id}"`), `${e.id} is in record.html`);
  const e = D.entries.find((x) => x.sources?.length);
  assert.ok(html.includes(e.sources[0].url.replace(/&/g, '&amp;')), 'sources are linked');
});

test('entry text is escaped', () => {
  const e = { ...D.entries[0], title: '<b>x</b> & "y"', quote: '<script>' };
  const html = entryArticle(e, D);
  assert.ok(!html.includes('<b>x</b>') && !html.includes('<script>'));
  assert.ok(html.includes('&lt;b&gt;x&lt;/b&gt; &amp; &quot;y&quot;'));
});

test('the sitemap lists the home page and the plain pages', () => {
  const xml = sitemapXml(D);
  assert.ok(xml.includes(`<loc>${D.site.url}</loc>`));
  assert.ok(xml.includes(`<loc>${D.site.url}record.html</loc>`));
  assert.ok(xml.includes(`<loc>${D.site.url}fine-print.html</loc>`));
});

test('the plain fine print page has every page and every change, with the copies that hold its quotes', () => {
  const html = finePrintHtml(D);
  for (const pg of D.policy) assert.ok(html.includes(`id="${pg.page}"`), `${pg.page} has a section`);
  const changes = D.policy.reduce((n, pg) => n + pg.changes.length, 0);
  assert.equal(html.split('<article class="r-entry">').length - 1, changes, 'one article per change');
  assert.ok(html.includes('https://web.archive.org/web/2024'), 'quotes link to archived copies');
  assert.ok(!/`[a-z0-9-]+`/.test(html), 'entry ids in notices become links');
});

test('the site loads no fonts from other hosts', async () => {
  for (const f of ['index.html', 'styles.css']) {
    const text = await readFile(path.join(ROOT, 'site', f), 'utf8');
    assert.ok(!/fonts\.(googleapis|gstatic)\.com/.test(text), `${f} has no Google Fonts link`);
  }
});
