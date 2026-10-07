#!/usr/bin/env node
// Pull the archived history of the pages where policies live, so every version
// can be read and compared in order.
//
//   npm run page-history [-- --only <id>] [--minutes 300] [--no-live]
//
// Reads data/history.yaml. For each page it:
//   1. reads the live page (a plain fetch, then a headless browser) and saves
//      its text and title;
//   2. lists every Wayback Machine capture of each of the page's URLs (one per
//      day at most);
//   3. reads a spread of those captures, then keeps reading the capture halfway
//      between any two neighbours whose text differs, until each change is
//      pinned between two consecutive captures.
// Each distinct text is saved once under inbox/history/<id>/<sha>.txt, and
// inbox/history/<id>/index.json lists every capture read, in order, with the
// text it showed. Run it again and it resumes: captures already read are
// skipped. Pages with `discover:` list every archived URL under a prefix
// instead, so old addresses of a page can be found.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { ROOT, readYaml } from './lib.mjs';
import { closeBrowser, fetchWithTimeout, htmlToText, pageTitle, renderPage, sha256, sleep } from './web.mjs';

const args = process.argv.slice(2);
const val = (name) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : undefined; };
const only = val('only');
const minutes = Number(val('minutes') ?? 300);
const live = !args.includes('--no-live');
const deadline = Date.now() + minutes * 60_000;
const OUT = path.join(ROOT, 'inbox', 'history');

// Lines that change without the policy changing.
const NOISE = [/^updated (over |about |almost )?(a|an|\d+) .* ago$/i, /^updated (yesterday|today|this week)$/i, /^\d+ min(ute)?s? read$/i];
const clean = (text) => text.split('\n').map((l) => l.trim()).filter((l) => l && !NOISE.some((re) => re.test(l))).join('\n');

async function patiently(url, opts = {}, tries = 4) {
  for (let i = 0; ; i++) {
    try {
      const res = await fetchWithTimeout(url, { timeout: 90000, ...opts });
      if (res.status === 429 || res.status >= 500) throw new Error(`HTTP ${res.status}`);
      return res;
    } catch (err) {
      if (i >= tries - 1) throw err;
      await sleep(15000 * (i + 1));
    }
  }
}

async function cdx(params) {
  const res = await patiently(`https://web.archive.org/cdx/search/cdx?${new URLSearchParams({ output: 'json', ...params })}`, { headers: { accept: 'application/json' } });
  if (!res.ok) throw new Error(`CDX HTTP ${res.status}`);
  const text = await res.text();
  const rows = text.trim() ? JSON.parse(text) : [];
  return rows.slice(1);
}

/** Every 200 capture of the page's URLs, at most one per day per URL, oldest first. */
async function listCaptures(urls) {
  const all = [];
  for (const url of urls) {
    const rows = await cdx({ url, fl: 'timestamp,original,statuscode,digest', filter: 'statuscode:200', collapse: 'timestamp:8' });
    for (const [timestamp, original] of rows) all.push({ ts: timestamp, url: original });
    await sleep(1500);
  }
  return all.sort((a, b) => a.ts.localeCompare(b.ts));
}

async function readCapture(c) {
  const res = await patiently(`https://web.archive.org/web/${c.ts}id_/${c.url}`);
  if (!res.ok) return { error: `HTTP ${res.status}` };
  const html = await res.text();
  const text = clean(htmlToText(html));
  if (text.length < 200) return { error: 'no readable text' };
  return { text, title: pageTitle(html) };
}

async function readLive(url) {
  try {
    const res = await fetchWithTimeout(url);
    if (res.ok) {
      const html = await res.text();
      const text = clean(htmlToText(html));
      if (text.length >= 200) return { text, title: pageTitle(html), via: 'fetch' };
    }
  } catch {}
  const r = await renderPage(url, { screenshot: false }).catch(() => null);
  if (r?.text && r.status && r.status < 400) return { text: clean(r.text), title: r.title, via: 'browser' };
  return null;
}

async function loadJson(file, fallback) {
  return existsSync(file) ? JSON.parse(await readFile(file, 'utf8')) : fallback;
}

async function saveText(dir, text) {
  const sha = sha256(text).slice(0, 16);
  const file = path.join(dir, `${sha}.txt`);
  if (!existsSync(file)) await writeFile(file, text + '\n');
  return sha;
}

async function discover(page) {
  const dir = path.join(OUT, '_discover');
  await mkdir(dir, { recursive: true });
  const rows = await cdx({ url: page.discover, matchType: 'prefix', fl: 'original,timestamp', filter: 'statuscode:200', collapse: 'urlkey', limit: '20000' });
  const list = rows.map(([original, timestamp]) => ({ url: original, first: timestamp })).sort((a, b) => a.url.localeCompare(b.url));
  await writeFile(path.join(dir, `${page.id}.json`), JSON.stringify(list, null, 1) + '\n');
  console.log(`${page.id}: ${list.length} archived URLs under ${page.discover}`);
}

async function history(page) {
  const dir = path.join(OUT, page.id);
  await mkdir(dir, { recursive: true });
  const indexFile = path.join(dir, 'index.json');
  const index = await loadJson(indexFile, { id: page.id, org: page.org, urls: page.urls, live: [], captures: [] });
  index.urls = page.urls;
  const save = () => writeFile(indexFile, JSON.stringify(index, null, 1) + '\n');

  if (live) {
    const r = await readLive(page.urls[0]);
    if (r) {
      const sha = await saveText(dir, r.text);
      index.live.push({ date: new Date().toISOString().slice(0, 10), url: page.urls[0], title: r.title, via: r.via, sha, words: r.text.split(/\s+/).length });
      console.log(`${page.id}: live page read (${r.via}), text ${sha}`);
    } else {
      index.live.push({ date: new Date().toISOString().slice(0, 10), url: page.urls[0], error: 'could not read the live page' });
      console.log(`${page.id}: live page could not be read`);
    }
    await save();
  }

  const captures = await listCaptures(page.urls);
  const read = new Map(index.captures.map((c) => [`${c.ts} ${c.url}`, c]));
  const key = (c) => `${c.ts} ${c.url}`;
  console.log(`${page.id}: ${captures.length} daily captures in the Wayback Machine, ${read.size} already read`);

  async function visit(i) {
    const c = captures[i];
    if (read.has(key(c))) return;
    const r = await readCapture(c).catch((err) => ({ error: err.message }));
    const row = { ts: c.ts, url: c.url };
    if (r.error) row.error = r.error;
    else { row.sha = await saveText(dir, r.text); row.title = r.title; }
    read.set(key(c), row);
    index.captures = [...read.values()].sort((a, b) => a.ts.localeCompare(b.ts));
    await save();
    await sleep(1200);
  }

  // A spread first: the first and last capture and the first of each month.
  const want = new Set([0, captures.length - 1]);
  const months = new Set();
  captures.forEach((c, i) => { const m = c.ts.slice(0, 6); if (!months.has(m)) { months.add(m); want.add(i); } });
  for (const i of [...want].sort((a, b) => a - b)) {
    if (i < 0 || Date.now() > deadline) break;
    await visit(i);
  }

  // Then bisect between neighbours that differ until each change is pinned.
  let changed = true;
  while (changed && Date.now() < deadline) {
    changed = false;
    const done = captures.map((c, i) => [i, read.get(key(c))]).filter(([, r]) => r && r.sha);
    for (let k = 0; k + 1 < done.length && Date.now() < deadline; k++) {
      const [i, a] = done[k];
      const [j, b] = done[k + 1];
      if (a.sha === b.sha || j - i < 2) continue;
      // The unread capture nearest the middle (one that failed to load is skipped).
      const mid = (i + j) / 2;
      let pick = -1;
      for (let m = i + 1; m < j; m++) if (!read.has(key(captures[m])) && (pick < 0 || Math.abs(m - mid) < Math.abs(pick - mid))) pick = m;
      if (pick < 0) continue;
      await visit(pick);
      changed = true;
    }
  }

  const versions = [];
  for (const c of index.captures.filter((c) => c.sha)) {
    const last = versions[versions.length - 1];
    if (last && last.sha === c.sha) last.last = c.ts;
    else versions.push({ sha: c.sha, first: c.ts, last: c.ts, url: c.url });
  }
  index.versions = versions;
  index.complete = Date.now() < deadline;
  await save();
  console.log(`${page.id}: ${versions.length} text versions across ${index.captures.length} captures read${index.complete ? '' : ' (stopped at the time limit; run again to continue)'}`);
}

const pages = (await readYaml(path.join(ROOT, 'data', 'history.yaml'))).filter((p) => !only || only.split(/[ ,]+/).includes(p.id));
for (const page of pages) {
  if (Date.now() > deadline) { console.log(`time limit reached before ${page.id}`); continue; }
  try {
    if (page.discover) await discover(page);
    else await history(page);
  } catch (err) {
    console.log(`${page.id}: failed: ${err.message}`);
  }
}
await closeBrowser();
