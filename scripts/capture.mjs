#!/usr/bin/env node
// Capture evidence before it disappears.
//
//   npm run capture -- <url> [--entry <entry-id>] [--title "…"] [--type primary|reporting|analysis]
//       Saves a snapshot of <url> under snapshots/: the raw HTML, the rendered
//       text, a full-page screenshot (when Playwright is installed), the post
//       text for X and Bluesky links, SHA-256 hashes, and a Wayback Machine
//       copy. With --entry, the archive link and snapshot path are written into
//       that entry's matching source (or added as a new source).
//
//   npm run capture -- --archive-missing [--limit 20] [--dry-run]
//       Walks every entry and asks the Wayback Machine to save each source
//       that has no archive link yet, then writes the links back into the YAML.
//
//   npm run capture -- --snapshot-missing [--limit 20] [--dry-run]
//       Takes a full snapshot (page, text, screenshot, post text, and a Wayback
//       copy if missing) of every source that has no snapshot yet, and writes
//       the snapshot path back into the YAML. The weekly GitHub Action runs this.
//
// Options: --no-archive  skip the Wayback Machine
//          --no-shot     skip the browser screenshot
//
// Set IA_ACCESS_KEY / IA_SECRET_KEY (free, from archive.org/account/s3.php)
// to use the authenticated Save Page Now API, which is far more reliable.
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import YAML from 'yaml';
import { ROOT, loadAll } from './lib.mjs';
import {
  closeBrowser, fetchBlueskyPost, fetchWithTimeout, fetchXPost, htmlToText, isBlueskyUrl, isXUrl,
  pageTitle, renderPage, sha256, sleep, waybackClosest, waybackSave,
} from './web.mjs';

const VALUE_OPTS = new Set(['entry', 'title', 'type', 'limit']);
const opts = {};
const positional = [];
for (let i = 2; i < process.argv.length; i++) {
  const a = process.argv[i];
  if (!a.startsWith('--')) positional.push(a);
  else if (VALUE_OPTS.has(a.slice(2))) opts[a.slice(2)] = process.argv[++i];
  else opts[a.slice(2)] = true;
}
const flag = (name) => opts[name] === true;
const opt = (name) => (typeof opts[name] === 'string' ? opts[name] : undefined);

const sameUrl = (a, b) => String(a).replace(/\/+$/, '').replace(/^http:/, 'https:') === String(b).replace(/\/+$/, '').replace(/^http:/, 'https:');
const today = () => new Date().toISOString().slice(0, 10);

async function archive(url) {
  try {
    const saved = await waybackSave(url, { log: console.log });
    console.log(`  archived  ${saved.url}`);
    return saved;
  } catch (err) {
    console.warn(`  archive failed: ${err.message}`);
    const existing = await waybackClosest(url).catch(() => null);
    if (existing) console.log(`  using existing Wayback copy ${existing.url}`);
    return existing;
  }
}

async function snapshot(url, { doArchive = true, doShot = true } = {}) {
  const host = new URL(url).hostname.replace(/^www\./, '');
  const dirName = `${today()}-${host}-${sha256(url).slice(0, 8)}`;
  const dir = path.join(ROOT, 'snapshots', dirName);
  await mkdir(dir, { recursive: true });
  const meta = { url, captured_at: new Date().toISOString(), tool: 'said-did capture', files: {} };
  const save = async (name, data) => {
    await writeFile(path.join(dir, name), data);
    meta.files[name] = sha256(typeof data === 'string' ? Buffer.from(data) : data);
  };
  console.log(`capturing ${url}`);

  try {
    const res = await fetchWithTimeout(url);
    meta.http_status = res.status;
    meta.final_url = res.url;
    meta.content_type = res.headers.get('content-type');
    const body = Buffer.from(await res.arrayBuffer());
    if (!res.ok) {
      // Error pages (blocked, not found, rate-limited) are not evidence of the content.
      console.warn(`  fetch returned HTTP ${res.status}; page not saved${res.status === 404 || res.status === 410 ? ' (it may have been deleted)' : ''}`);
    } else if (/html|xml|text/.test(meta.content_type || '')) {
      await save('page.html', body);
      meta.title = pageTitle(body.toString('utf8'));
      await save('page.txt', htmlToText(body.toString('utf8')));
    } else {
      const ext = (meta.content_type || '').includes('pdf') ? 'pdf' : 'bin';
      await save(`document.${ext}`, body);
    }
    if (res.ok) console.log(`  fetched   HTTP ${res.status}${meta.title ? ` — ${meta.title}` : ''}`);
  } catch (err) {
    meta.fetch_error = err.message;
    console.warn(`  fetch failed: ${err.message}`);
  }

  if (isXUrl(url) || isBlueskyUrl(url)) {
    try {
      const post = isXUrl(url) ? await fetchXPost(url) : await fetchBlueskyPost(url);
      meta.post = { ok: post.ok, status: post.status, author: post.author ?? null, date: post.date ?? null };
      if (post.ok) {
        await save('post.json', JSON.stringify(post.raw, null, 2));
        await save('post.txt', `${post.author ?? ''}\n${post.date ?? ''}\n\n${post.text ?? ''}\n`);
        meta.title ??= post.author ? `${post.author} on ${isXUrl(url) ? 'X' : 'Bluesky'}` : null;
        console.log(`  post      ${post.author ?? ''}: ${String(post.text ?? '').slice(0, 90)}`);
      } else {
        console.warn(`  post not available (HTTP ${post.status}); it may be deleted or protected`);
      }
    } catch (err) {
      meta.post = { ok: false, error: err.message };
      console.warn(`  post lookup failed: ${err.message}`);
    }
  }

  if (doShot) {
    const rendered = await renderPage(url).catch((err) => ({ error: err.message }));
    if (!rendered) {
      console.log('  (no screenshot: install Playwright with "npx playwright install chromium")');
    } else if (rendered.error) {
      console.warn(`  screenshot failed: ${rendered.error}`);
    } else if (!rendered.status || rendered.status >= 400) {
      meta.rendered_status = rendered.status;
      console.warn(`  browser got HTTP ${rendered.status}; screenshot not saved`);
    } else {
      meta.rendered_status = rendered.status;
      if (rendered.screenshot) await save('screenshot.jpg', rendered.screenshot);
      if (rendered.text) await save('rendered.txt', rendered.text);
      meta.title ??= rendered.title || null;
      const saved = [rendered.screenshot && 'screenshot', rendered.text && 'text'].filter(Boolean).join(' + ') || 'nothing (empty page)';
      console.log(`  rendered  HTTP ${rendered.status} — saved ${saved}`);
    }
  }

  if (doArchive) meta.archive = await archive(url);

  const rel = path.relative(ROOT, dir);
  if (!Object.keys(meta.files).length) {
    // Nothing readable was captured (blocked, offline, or deleted); don't leave an empty folder behind.
    await rm(dir, { recursive: true, force: true });
    console.warn('  nothing captured; no snapshot saved');
    return { dir: null, meta };
  }
  await writeFile(path.join(dir, 'meta.json'), `${JSON.stringify(meta, null, 2)}\n`);
  console.log(`  saved     ${rel}/`);
  return { dir: rel, meta };
}

/** Open an entry's YAML as an editable document (comments and layout kept). */
async function openEntryDoc(entryId) {
  const { entries } = await loadAll();
  const entry = entries.find((e) => e.id === entryId);
  if (!entry) throw new Error(`No entry with id "${entryId}". Ids are file names without .yaml.`);
  const file = path.join(ROOT, entry.file);
  const doc = YAML.parseDocument(await readFile(file, 'utf8'));
  return { file, doc };
}
const writeDoc = (file, doc) => writeFile(file, doc.toString({ lineWidth: 80, minContentWidth: 40 }));

async function attachToEntry(entryId, url, { dir, meta }) {
  const { file, doc } = await openEntryDoc(entryId);
  const sources = doc.get('sources');
  let idx = sources?.items.findIndex((s) => sameUrl(s.get('url'), url)) ?? -1;
  if (idx < 0) {
    const source = { title: opt('title') || meta.title || url, url, date: meta.post?.date ? String(meta.post.date).slice(0, 10) : undefined, type: opt('type') || (isXUrl(url) || isBlueskyUrl(url) ? 'primary' : 'reporting') };
    if (!source.date || !/^\d{4}-\d{2}-\d{2}$/.test(source.date)) delete source.date;
    if (!sources) doc.set('sources', doc.createNode([source]));
    else sources.add(doc.createNode(source));
    idx = doc.get('sources').items.length - 1;
    console.log(`  added a new source to ${entryId}`);
  }
  if (meta.archive?.url) doc.setIn(['sources', idx, 'archive'], meta.archive.url);
  if (dir) doc.setIn(['sources', idx, 'snapshot'], dir);
  await writeDoc(file, doc);
  console.log(`  updated   ${path.relative(ROOT, file)}`);
}

/**
 * Walk every source in every entry (including update sources) and fill in
 * what is missing: an archive link (mode "archive") or a full snapshot (mode "snapshot").
 */
async function fillMissing(mode) {
  const limit = Number(opt('limit') || Infinity);
  const dry = flag('dry-run');
  const field = mode === 'archive' ? 'archive' : 'snapshot';
  const { entries } = await loadAll();
  const done = new Map(); // url -> result, so a URL cited twice is captured once
  let processed = 0;
  let filled = 0;
  for (const entry of entries) {
    const file = path.join(ROOT, entry.file);
    const doc = YAML.parseDocument(await readFile(file, 'utf8'));
    let changed = false;
    const lists = [['sources']];
    (doc.get('updates')?.items ?? []).forEach((_, i) => lists.push(['updates', i, 'sources']));
    for (const listPath of lists) {
      const list = doc.getIn(listPath);
      for (let i = 0; i < (list?.items.length ?? 0); i++) {
        const src = list.items[i];
        if (src.get(field)) continue;
        const url = src.get('url');
        if (!done.has(url)) {
          if (processed >= limit) continue;
          processed++;
          console.log(`\n${entry.id}`);
          if (dry) { console.log(`  would ${mode} ${url}`); continue; }
          if (mode === 'archive') {
            done.set(url, { archive: await archive(url) });
          } else {
            const { dir, meta } = await snapshot(url, { doArchive: !src.get('archive') && !flag('no-archive'), doShot: !flag('no-shot') });
            done.set(url, { snapshot: dir, archive: meta.archive });
          }
          await sleep(process.env.IA_ACCESS_KEY ? 2000 : 8000); // stay under anonymous Wayback rate limits
        }
        const result = done.get(url);
        if (!result) continue;
        if (result.archive?.url && !src.get('archive')) { doc.setIn([...listPath, i, 'archive'], result.archive.url); changed = true; }
        if (result.snapshot) { doc.setIn([...listPath, i, 'snapshot'], result.snapshot); changed = true; }
        if (result.archive?.url || result.snapshot) filled++;
      }
    }
    if (changed) await writeDoc(file, doc);
  }
  console.log(`\n${processed} source URL(s) ${dry ? 'would be' : 'were'} processed${dry ? '' : `; ${filled} source field(s) filled`}.`);
}

try {
  if (flag('archive-missing')) {
    await fillMissing('archive');
  } else if (flag('snapshot-missing')) {
    await fillMissing('snapshot');
  } else {
    const url = positional[0];
    if (!url || !/^https?:\/\//.test(url)) {
      console.error('Usage: npm run capture -- <url> [--entry <entry-id>] [--title "…"]\n       npm run capture -- --archive-missing [--limit N] [--dry-run]\n       npm run capture -- --snapshot-missing [--limit N] [--dry-run]');
      process.exit(1);
    }
    const result = await snapshot(url, { doArchive: !flag('no-archive'), doShot: !flag('no-shot') });
    const entryId = opt('entry');
    if (entryId) await attachToEntry(entryId, url, result);
    else console.log('\nTip: add --entry <entry-id> to link this snapshot to an entry, or run "npm run new" to start one.');
  }
} finally {
  await closeBrowser();
}
