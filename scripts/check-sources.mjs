#!/usr/bin/env node
// Check that every cited source still resolves.
//
//   npm run check-sources [-- --fail-on-gone]
//
// A post or page that disappears is itself worth recording, so "gone" results
// are listed first. X/Twitter links are checked through the public oEmbed
// endpoint, where a 404 means the post was deleted or the account went private.
// Writes reports/source-health.md and reports/source-health.json.
import { mkdir, writeFile, appendFile } from 'node:fs/promises';
import path from 'node:path';
import { ROOT, loadAll } from './lib.mjs';
import { fetchWithTimeout, fetchXPost, isXUrl } from './web.mjs';

const failOnGone = process.argv.includes('--fail-on-gone');
const { entries } = await loadAll();

const sources = new Map(); // url -> { url, entries: Set, archive }
for (const e of entries) {
  const all = [...(e.sources ?? []), ...(e.updates ?? []).flatMap((u) => u.sources ?? [])];
  for (const s of all) {
    if (!s?.url) continue;
    if (!sources.has(s.url)) sources.set(s.url, { url: s.url, entries: new Set(), archive: s.archive ?? null });
    sources.get(s.url).entries.add(e.id);
    if (s.archive) sources.get(s.url).archive = s.archive;
  }
}

function classify(status) {
  if (status >= 200 && status < 400) return 'ok';
  if (status === 404 || status === 410) return 'gone';
  if ([401, 403, 429, 999].includes(status)) return 'blocked';
  return 'error';
}

async function check(src) {
  try {
    if (isXUrl(src.url)) {
      const post = await fetchXPost(src.url);
      return { ...src, status: post.status, result: post.ok ? 'ok' : classify(post.status), via: 'oembed' };
    }
    let res = await fetchWithTimeout(src.url, { method: 'HEAD', timeout: 20000 });
    if (res.status === 405 || res.status === 403 || res.status >= 500) res = await fetchWithTimeout(src.url, { timeout: 25000 });
    return { ...src, status: res.status, result: classify(res.status), via: 'http' };
  } catch (err) {
    return { ...src, status: null, result: 'error', error: err.name === 'AbortError' ? 'timeout' : err.message };
  }
}

const queue = [...sources.values()];
const results = [];
await Promise.all(Array.from({ length: 6 }, async () => {
  while (queue.length) results.push(await check(queue.shift()));
}));

const ORDER = { gone: 0, error: 1, blocked: 2, ok: 3 };
results.sort((a, b) => ORDER[a.result] - ORDER[b.result] || a.url.localeCompare(b.url));
const count = (r) => results.filter((x) => x.result === r).length;

const lines = [
  '# Source health',
  '',
  `Checked ${results.length} sources on ${new Date().toISOString().slice(0, 10)}: ${count('ok')} ok, ${count('gone')} gone, ${count('blocked')} blocked (bot protection or rate limit, usually fine), ${count('error')} errors.`,
  '',
  '| Result | HTTP | Source | Archived | Entries |',
  '| --- | --- | --- | --- | --- |',
  ...results.map((r) => `| ${r.result === 'gone' ? '**gone**' : r.result} | ${r.status ?? r.error ?? ''} | ${r.url} | ${r.archive ? `[yes](${r.archive})` : r.result === 'gone' ? '**no — recover from an archive**' : 'no'} | ${[...r.entries].join(', ')} |`),
  '',
];
await mkdir(path.join(ROOT, 'reports'), { recursive: true });
await writeFile(path.join(ROOT, 'reports', 'source-health.md'), lines.join('\n'));
await writeFile(path.join(ROOT, 'reports', 'source-health.json'), `${JSON.stringify(results.map((r) => ({ ...r, entries: [...r.entries] })), null, 2)}\n`);
if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY, `${lines.join('\n')}\n`);

console.log(lines[2]);
for (const r of results.filter((x) => x.result === 'gone')) console.log(`  GONE ${r.url}  (${[...r.entries].join(', ')})`);
console.log('Full report: reports/source-health.md');
if (failOnGone && count('gone')) process.exit(1);
