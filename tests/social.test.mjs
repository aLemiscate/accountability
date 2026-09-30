import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { ROOT, readYaml } from '../scripts/lib.mjs';
import { bskyPostUrl, cdxPrefixes, newestFirst, parseCdxRows, snowflakeDate, splitCdxResume, textFromArchivedPost, xStatusId } from '../scripts/social.mjs';

test('an X post id encodes when it was posted', () => {
  // Jan Leike's resignation thread, posted May 17, 2024.
  assert.equal(snowflakeDate('1791498184671605209').toISOString().slice(0, 10), '2024-05-17');
  assert.equal(snowflakeDate('20'), null); // pre-2010 ids carry no timestamp
  assert.equal(xStatusId('https://twitter.com/sama/status/1791940668992172051?lang=en'), '1791940668992172051');
  assert.equal(xStatusId('https://x.com/sama'), null);
});

test('Wayback CDX rows become one dated candidate per post, keeping the earliest capture', () => {
  const rows = [
    ['timestamp', 'original', 'statuscode'],
    ['20240519000000', 'https://twitter.com/janleike/status/1791498184671605209', '200'],
    ['20240517200000', 'https://x.com/janleike/status/1791498184671605209?s=20', '200'],
    ['20240601000000', 'https://twitter.com/janleike/status/1791498184671605209/photo/1', '200'],
    ['20240601000000', 'https://twitter.com/janleike/with_replies', '200'],
  ];
  const out = parseCdxRows(rows, 'janleike');
  assert.equal(out.length, 1);
  assert.equal(out[0].date, '2024-05-17');
  assert.equal(out[0].archived_at, '20240517200000');
  assert.equal(out[0].url, 'https://x.com/janleike/status/1791498184671605209');
  assert.match(out[0].archive_raw, /\/web\/20240517200000id_\//);
});

test('prefers a capture that loaded over an earlier redirect', () => {
  const rows = [
    ['timestamp', 'original', 'statuscode'],
    ['20240517190000', 'https://twitter.com/janleike/status/1791498184671605209', '301'],
    ['20240518000000', 'https://twitter.com/janleike/status/1791498184671605209', '200'],
  ];
  const [c] = parseCdxRows(rows, 'janleike');
  assert.equal(c.archived_at, '20240518000000');
  assert.equal(c.archived_status, '200');
});

test('orders posts newest first across id lengths and URL forms', () => {
  // 2013, 2017, 2024 and 2026 posts: as strings, "9…" (2017) would sort above "2…" (2026).
  const rows = [
    ['timestamp', 'original', 'statuscode'],
    ['20130101000000', 'https://twitter.com/sama/status/349700000000000000', '200'],
    ['20170101000000', 'https://twitter.com/sama/status/915000000000000000', '200'],
    ['20260901000000', 'https://x.com/sama/status/2095128559736226013', '200'],
    ['20240601000000', 'https://mobile.twitter.com/sama/statuses/1791940668992172051', '200'],
  ];
  const years = parseCdxRows(rows, 'sama').map((c) => c.date.slice(0, 4));
  assert.deepEqual(years, ['2026', '2024', '2017', '2013']);
  assert.deepEqual([{ id: '9' }, { id: '10' }].sort(newestFirst).map((c) => c.id), ['10', '9']);
});

test('pages through the CDX index with resume keys', () => {
  const page = [['timestamp', 'original', 'statuscode'], ['20240101000000', 'https://x.com/a/status/1', '200'], [], ['com,x)/a/status/1+20240101000000']];
  assert.deepEqual(splitCdxResume(page), { rows: page.slice(0, 2), resumeKey: 'com,x)/a/status/1+20240101000000' });
  assert.deepEqual(splitCdxResume(page.slice(0, 2)), { rows: page.slice(0, 2), resumeKey: null });
  assert.deepEqual(splitCdxResume([]), { rows: [], resumeKey: null });
});

test('looks for archived posts under every URL form X has used', () => {
  assert.deepEqual(cdxPrefixes('sama'), ['twitter.com/sama/status/', 'twitter.com/sama/statuses/', 'mobile.twitter.com/sama/status/', 'x.com/sama/status/']);
});

test('reads post text from an archived Twitter page', () => {
  const html = '<html><head><meta property="og:description" content="“we have never clawed back anyone&#39;s vested equity”"></head></html>';
  assert.equal(textFromArchivedPost(html), 'we have never clawed back anyone\'s vested equity');
  assert.equal(textFromArchivedPost('<html></html>'), null);
});

test('builds Bluesky post links from AT URIs', () => {
  assert.equal(bskyPostUrl({ uri: 'at://did:plc:abc/app.bsky.feed.post/3kxyz', author: { handle: 'someone.bsky.social' } }), 'https://bsky.app/profile/someone.bsky.social/post/3kxyz');
});

test('every watched social account belongs to an in-scope actor', async () => {
  const [accounts, actors] = await Promise.all([
    readYaml(path.join(ROOT, 'data', 'accounts.yaml')),
    readYaml(path.join(ROOT, 'data', 'actors.yaml')),
  ]);
  const ids = new Set(actors.map((a) => a.id));
  for (const a of accounts) {
    assert.ok(ids.has(a.actor), `accounts.yaml: unknown actor ${a.actor}`);
    assert.ok(a.x || a.bluesky, `accounts.yaml: ${a.actor} needs an x or bluesky handle`);
  }
});
