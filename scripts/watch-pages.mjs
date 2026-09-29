#!/usr/bin/env node
// Watch the pages where commitments live, and record every change.
//
//   npm run watch-pages [-- --only anthropic-rsp]
//   npm run watch-pages -- --rebaseline "why"   accept the current text as the new
//       baseline without recording an edit (after a change to the text extractor)
//
// For each page in data/watch.yaml, reads the visible text (a plain fetch,
// falling back to a headless browser for script-rendered pages) and compares
// it with the last saved copy in watch/<id>/latest.txt. When the text
// changes, it saves:
//   watch/<id>/<date>.txt    the new text
//   watch/<id>/<date>.diff   a unified diff against the previous version
// and appends to watch/<id>/history.json. Commit these files: the git history
// then shows exactly when a policy changed and what the old wording was.
import { mkdir, readFile, writeFile, appendFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { createTwoFilesPatch } from 'diff';
import { ROOT, readYaml } from './lib.mjs';
import { closeBrowser, fetchWithTimeout, htmlToText, renderPage, sha256 } from './web.mjs';

const onlyIdx = process.argv.indexOf('--only');
const only = onlyIdx > 0 ? process.argv[onlyIdx + 1] : null;
const rebaselineIdx = process.argv.indexOf('--rebaseline');
const rebaselineNote = rebaselineIdx > 0 ? (process.argv[rebaselineIdx + 1] || 'manual re-baseline') : null;
const pages = (await readYaml(path.join(ROOT, 'data', 'watch.yaml'))).filter((p) => !only || p.id === only);
const stamp = new Date().toISOString().slice(0, 10);
const summary = [];

// Fetch first: server HTML is stable between runs. The browser is only for
// pages that render their text with scripts or block plain requests.
async function readText(url) {
  let fetchError;
  try {
    const res = await fetchWithTimeout(url);
    if (res.ok) {
      const text = htmlToText(await res.text());
      if (text.length >= 200) return { text, via: 'fetch' };
    } else {
      fetchError = `HTTP ${res.status}`;
    }
  } catch (err) {
    fetchError = err.message;
  }
  const rendered = await renderPage(url, { screenshot: false }).catch(() => null);
  if (rendered?.text && rendered.status && rendered.status < 400) return { text: rendered.text, via: 'browser' };
  throw new Error(fetchError || 'no readable text');
}

try {
  for (const page of pages) {
    const dir = path.join(ROOT, 'watch', page.id);
    await mkdir(dir, { recursive: true });
    const latestFile = path.join(dir, 'latest.txt');
    const historyFile = path.join(dir, 'history.json');
    const history = existsSync(historyFile) ? JSON.parse(await readFile(historyFile, 'utf8')) : [];
    let text;
    let via;
    try {
      ({ text, via } = await readText(page.url));
    } catch (err) {
      summary.push(`| ${page.id} | could not read (${err.message}) | |`);
      console.warn(`${page.id}: could not read ${page.url} (${err.message})`);
      continue;
    }
    if (text.length < 200) {
      summary.push(`| ${page.id} | skipped: only ${text.length} characters (likely a bot wall) | |`);
      console.warn(`${page.id}: only ${text.length} characters of text; not saving (likely a bot wall)`);
      continue;
    }
    const hash = sha256(text);
    const previous = existsSync(latestFile) ? await readFile(latestFile, 'utf8') : null;
    const lastVia = history.at(-1)?.via;
    const mechanical = previous !== null && lastVia && lastVia !== via ? `read via ${via} instead of ${lastVia}` : rebaselineNote;
    if (previous !== null && mechanical && sha256(previous.trimEnd()) !== hash) {
      // The text differs for mechanical reasons (extraction method or extractor fix), so re-baseline instead of reporting an edit.
      await writeFile(path.join(dir, `${stamp}.txt`), `${text}\n`);
      await writeFile(latestFile, `${text}\n`);
      history.push({ date: stamp, sha256: hash, via, event: 'rebaseline', note: mechanical });
      summary.push(`| ${page.id} | re-baselined (${mechanical}) | |`);
      console.log(`${page.id}: re-baselined (${mechanical})`);
    } else if (previous === null) {
      await writeFile(latestFile, `${text}\n`);
      history.push({ date: stamp, sha256: hash, via, event: 'baseline' });
      summary.push(`| ${page.id} | baseline saved | |`);
      console.log(`${page.id}: baseline saved (${text.length} chars via ${via})`);
    } else if (sha256(previous.trimEnd()) !== hash) {
      const patch = createTwoFilesPatch(`${page.id} (before)`, `${page.id} (${stamp})`, previous, `${text}\n`, '', '', { context: 2 });
      await writeFile(path.join(dir, `${stamp}.diff`), patch);
      await writeFile(path.join(dir, `${stamp}.txt`), `${text}\n`);
      await writeFile(latestFile, `${text}\n`);
      const added = patch.split('\n').filter((l) => l.startsWith('+') && !l.startsWith('+++')).length;
      const removed = patch.split('\n').filter((l) => l.startsWith('-') && !l.startsWith('---')).length;
      history.push({ date: stamp, sha256: hash, via, event: 'changed', added, removed });
      summary.push(`| ${page.id} | **changed** (+${added} / −${removed} lines) | watch/${page.id}/${stamp}.diff |`);
      console.log(`${page.id}: CHANGED (+${added} / -${removed} lines) → watch/${page.id}/${stamp}.diff`);
    } else {
      summary.push(`| ${page.id} | unchanged | |`);
      console.log(`${page.id}: unchanged`);
    }
    await writeFile(historyFile, `${JSON.stringify(history, null, 2)}\n`);
  }
} finally {
  await closeBrowser();
}

const changed = summary.filter((row) => row.includes('**changed**')).map((row) => row.split('|')[1].trim());
if (process.env.GITHUB_OUTPUT) await appendFile(process.env.GITHUB_OUTPUT, `changed=${changed.join(',')}\n`);
if (process.env.GITHUB_STEP_SUMMARY) {
  await appendFile(process.env.GITHUB_STEP_SUMMARY, ['## Watched pages', '', '| Page | Result | Diff |', '| --- | --- | --- |', ...summary, ''].join('\n'));
}
