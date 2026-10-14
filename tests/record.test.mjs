// The plain record and the pages that don't depend on the site's JavaScript.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { ROOT, loadAll, derive } from '../scripts/lib.mjs';
import { entryArticle, recordHtml, sitemapXml } from '../scripts/record.mjs';

const D = derive(await loadAll());

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

test('the sitemap lists the home page and the plain record', () => {
  const xml = sitemapXml(D);
  assert.ok(xml.includes(`<loc>${D.site.url}</loc>`));
  assert.ok(xml.includes(`<loc>${D.site.url}record.html</loc>`));
});

test('the site loads no fonts from other hosts', async () => {
  for (const f of ['index.html', 'styles.css']) {
    const text = await readFile(path.join(ROOT, 'site', f), 'utf8');
    assert.ok(!/fonts\.(googleapis|gstatic)\.com/.test(text), `${f} has no Google Fonts link`);
  }
});
