#!/usr/bin/env node
// Validate the record and build the site data.
//
//   npm run build     validate, then write site/data.js and dist/said-did.html
//   npm run check     validate only (exit 1 on errors); used in CI
//
// Flags: --strict  treat warnings as errors
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { ROOT, loadAll, validate, derive, checkQuotes, gitAddedDates } from './lib.mjs';
import { describe } from './cards.mjs';

const args = new Set(process.argv.slice(2));
const checkOnly = args.has('--check');
const strict = args.has('--strict');

const data = await loadAll();
const { errors, warnings, unarchived } = validate(data);

for (const w of warnings) console.warn(`  warn  ${w}`);
for (const e of errors) console.error(`  ERROR ${e}`);
const failed = errors.length > 0 || (strict && warnings.length > 0);
console.log(`\n${data.entries.length} entries · ${errors.length} error(s) · ${warnings.length} warning(s)`);
if (unarchived.length) {
  console.log(`${unarchived.length} entries have no archived copy of any source yet. Run: npm run capture -- --archive-missing`);
}
await checkQuotes(data.entries);
const checked = data.entries.filter((e) => e.quote_check);
const unmatched = checked.filter((e) => e.quote_check.status !== 'matched');
if (checked.length) {
  console.log(`${checked.length - unmatched.length} of ${checked.length} quotes with snapshots were found verbatim in them.`);
  for (const e of unmatched) console.log(`  quote not found in its snapshots: ${e.id} (fine if the quote comes from a source that has no snapshot yet)`);
}
if (failed) process.exit(1);
if (checkOnly) process.exit(0);

const built = derive(data);
// When each entry entered the record (for the feed), from the repository history.
const added = gitAddedDates();
for (const e of built.entries) if (added.has(e.file)) e.added = added.get(e.file).slice(0, 10);
const json = JSON.stringify(built);
// A plain <script> (not fetch) so the site also works when opened from disk.
const js = `window.SAID_DID = ${json.replace(/</g, '\\u003c')};\n`;

const site = path.join(ROOT, 'site');
await writeFile(path.join(site, 'data.js'), js);

// One self-contained HTML file: easy to share, archive, or open offline.
const [html, css, app] = await Promise.all(
  ['index.html', 'styles.css', 'app.js'].map((f) => readFile(path.join(site, f), 'utf8')),
);
const bundle = html
  .replace('<link rel="stylesheet" href="styles.css">', () => `<style>\n${css}\n</style>`)
  .replace('<script src="data.js"></script>', () => `<script>\n${js}</script>`)
  .replace('<script src="app.js"></script>', () => `<script>\n${app}\n</script>`);
await mkdir(path.join(ROOT, 'dist'), { recursive: true });
if (built.site.url) await writeFile(path.join(site, 'feed.xml'), atomFeed(built));
await writeFile(path.join(ROOT, 'dist', 'said-did.html'), bundle);

const s = built.stats;
console.log(`built site/data.js and dist/said-did.html — ${s.said} said, ${s.did} did, ${s.receipts} receipts, ${s.open} open promises`);

/**
 * An Atom feed of what's new: entries by the day they entered the record (or
 * their own date when the history isn't available), and updates to entries by
 * the date of the development. Newest 80.
 */
function atomFeed(D) {
  const base = D.site.url;
  const esc = (t) => String(t ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const iso = (d) => new Date(`${String(d).length === 4 ? `${d}-01-01` : String(d).length === 7 ? `${d}-01` : d}T12:00:00Z`).toISOString();
  const byId = new Map(D.entries.map((e) => [e.id, e]));
  const org = { openai: 'OpenAI', anthropic: 'Anthropic' };
  const items = [];
  for (const e of D.entries) {
    const link = `${base}e/${e.id}/`;
    items.push({ id: link, link, when: e.added || e.date, title: `${org[e.org] || e.org}: ${e.title}`, text: describe(e, byId) });
    (e.updates || []).forEach((u, i) => items.push({ id: `${link}#update-${i + 1}`, link, when: u.date, title: `Update · ${org[e.org] || e.org}: ${e.title}`, text: u.text }));
  }
  items.sort((a, b) => iso(b.when).localeCompare(iso(a.when)));
  const top = items.slice(0, 80);
  return `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Said / Did</title>
  <subtitle>New entries and updates to the record of what OpenAI and Anthropic said, and what they did next.</subtitle>
  <link href="${esc(base)}"/>
  <link rel="self" href="${esc(base)}feed.xml"/>
  <id>${esc(base)}</id>
  <updated>${new Date(D.generated).toISOString()}</updated>
${top.map((x) => `  <entry>
    <title>${esc(x.title)}</title>
    <link href="${esc(x.link)}"/>
    <id>${esc(x.id)}</id>
    <updated>${iso(x.when)}</updated>
    <summary>${esc(x.text)}</summary>
  </entry>`).join('\n')}
</feed>
`;
}
