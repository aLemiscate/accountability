#!/usr/bin/env node
// Validate the record and build the site data.
//
//   npm run build     validate, then write site/data.js and dist/said-did.html
//   npm run check     validate only (exit 1 on errors); used in CI
//
// Flags: --strict  treat warnings as errors
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { ROOT, loadAll, validate, derive, checkQuotes, checkPolicyQuotes, gitAddedDates } from './lib.mjs';
import { describe } from './cards.mjs';
import { recordHtml, sitemapXml, finePrintHtml } from './record.mjs';

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
await checkPolicyQuotes(data.policy);
const policyQuotes = data.policy.flatMap((pg) => (pg.changes ?? []).flatMap((c) => c.quotes.map((q) => ({ page: pg.page, date: c.date, ...q }))));
const policyMissing = policyQuotes.filter((q) => !q.first);
if (policyQuotes.length) {
  console.log(`${policyQuotes.length - policyMissing.length} of ${policyQuotes.length} phrases quoted in the policy page log were found in the page's saved texts.`);
  // The log's quotes are the page's own words, so each one has to be in a saved copy of the page.
  for (const q of policyMissing) console.error(`  ERROR data/policy-changes.yaml: ${q.page} (${q.date}) quotes "${q.text}", which no saved text of the page holds`);
}
if (failed || policyMissing.length) process.exit(1);
if (checkOnly) process.exit(0);

const built = derive(data);
// The commit the site was built from, so a citation or a download can name a fixed version.
try { built.commit = execFileSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: ROOT, encoding: 'utf8' }).trim(); } catch { built.commit = null; }
// When each entry entered the record (for the feed), from the repository history.
const added = gitAddedDates();
for (const e of built.entries) if (added.has(e.file)) e.added = added.get(e.file).slice(0, 10);
const json = JSON.stringify(built);
// A plain <script> (not fetch) so the site also works when opened from disk.
const js = `window.SAID_DID = ${json.replace(/</g, '\\u003c')};\n`;

const site = path.join(ROOT, 'site');
await writeFile(path.join(site, 'data.js'), js);

// One self-contained HTML file: easy to share, archive, or open offline.
const [html, css, app, sky] = await Promise.all(
  ['index.html', 'styles.css', 'app.js', 'sky.js'].map((f) => readFile(path.join(site, f), 'utf8')),
);
// The bundle carries its fonts inline, so it keeps them when opened from disk.
const fonts = new Map();
for (const m of css.matchAll(/url\("(fonts\/[^"]+\.woff2)"\)/g)) {
  fonts.set(m[1], `data:font/woff2;base64,${(await readFile(path.join(site, m[1]))).toString('base64')}`);
}
const bundledCss = css.replace(/url\("(fonts\/[^"]+\.woff2)"\)/g, (_, f) => `url("${fonts.get(f)}")`);
const bundle = html
  .replace(/<link rel="preload" href="fonts\/[^"]+"[^>]*>\n/g, '')
  .replace('<link rel="stylesheet" href="styles.css">', () => `<style>\n${bundledCss}\n</style>`)
  .replace('<script src="data.js"></script>', () => `<script>\n${js}</script>`)
  .replace('<script src="app.js"></script>', () => `<script>\n${app}\n</script>`)
  .replace('<script src="sky.js"></script>', () => `<script>\n${sky}\n</script>`);
await mkdir(path.join(ROOT, 'dist'), { recursive: true });
if (built.site.url) {
  await writeFile(path.join(site, 'feed.xml'), atomFeed(built));
  await writeFile(path.join(site, 'sitemap.xml'), sitemapXml(built));
}
await writeFile(path.join(site, 'record.html'), recordHtml(built));
await writeFile(path.join(site, 'fine-print.html'), finePrintHtml(built));
// The record as data, for anyone who wants to count, chart or check it.
await writeFile(path.join(site, 'said-did.json'), `${JSON.stringify(openData(built), null, 1)}\n`);
await writeFile(path.join(site, 'entries.csv'), entriesCsv(built));
await writeFile(path.join(site, 'fine-print.csv'), finePrintCsv(built));
await writeFile(path.join(ROOT, 'dist', 'said-did.html'), bundle);

const s = built.stats;
console.log(`built site/data.js, site/record.html, site/fine-print.html, the data downloads and dist/said-did.html — ${s.said} said, ${s.did} did, ${s.receipts} receipts, ${s.open} open promises`);

/** A link to an entry on the public site (or a relative one when the site has no address). */
function entryUrl(D, id) {
  return D.site.url ? `${D.site.url}e/${id}/` : `./#e-${id}`;
}

/**
 * The whole record as one JSON file: entries, receipts, commitments, the policy
 * page log, people and patterns. Build-only fields (display order, parsed times,
 * the passage around a matched quote) are left out; each entry gets its link
 * and, when its quote was found in a saved copy of the source, that copy's folder.
 */
function openData(D) {
  const plain = ({ time, precision, ...rest }) => rest;
  return {
    title: D.site.title,
    description: D.site.description,
    url: D.site.url,
    repository: D.site.repo,
    generated: D.generated,
    commit: D.commit,
    license: D.site.license ?? null,
    entries: D.entries.map(({ exhibit, time, precision, quote_check, file, added, outcome, ...e }) => ({
      ...e,
      ...(outcome ? { outcome: plain(outcome) } : {}),
      url: entryUrl(D, e.id),
      file,
      quote_found_in: quote_check?.status === 'matched' ? quote_check.snapshot : null,
    })),
    receipts: D.receipts,
    commitments: D.commitments,
    policy_pages: D.policy.map((pg) => ({ ...pg, changes: pg.changes.map(plain) })),
    actors: D.actors,
    patterns: D.patterns,
  };
}

/** Rows of fields as CSV (RFC 4180): every field quoted, lines ending in CRLF. The byte order mark tells spreadsheets it is UTF-8. */
function csv(rows) {
  return '\ufeff' + rows.map((r) => r.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\r\n') + '\r\n';
}

/** One row per entry. Lists are joined with " | ". */
function entriesCsv(D) {
  const actor = new Map(D.actors.map((a) => [a.id, a.name]));
  const join = (xs) => (xs || []).join(' | ');
  return csv([
    ['id', 'url', 'date', 'org', 'type', 'kind', 'title', 'people', 'venue', 'quote', 'quote_found_in_saved_source', 'summary', 'status', 'concreteness', 'breaks_if', 'due', 'outcome_date', 'outcome', 'contradicts', 'contradicted_by', 'related', 'patterns', 'response', 'note', 'updates', 'sources', 'file'],
    ...D.entries.map((e) => [
      e.id, entryUrl(D, e.id), e.date, e.org, e.type, e.kind, e.title, join(e.who.map((id) => actor.get(id) || id)), e.venue, e.quote,
      e.quote_check ? (e.quote_check.status === 'matched' ? 'yes' : 'no') : '', e.summary, e.status, e.concreteness, e.breaks_if, e.due,
      e.outcome?.date, e.outcome?.text, join(e.contradicts), join(e.contradicted_by), join(e.related), join(e.patterns), e.response, e.note,
      join((e.updates || []).map((u) => `${u.date}: ${u.text}`)), join(e.sources.map((s) => s.url)), e.file,
    ]),
  ]);
}

/** One row per change in the policy page log. */
function finePrintCsv(D) {
  return csv([
    ['page', 'org', 'page_title', 'page_url', 'date', 'when', 'change', 'notice', 'disclosure', 'cut_without_notice', 'quotes', 'quotes_found_in_archived_copies'],
    ...D.policy.flatMap((pg) => pg.changes.map((c) => [
      pg.page, pg.org, pg.title, pg.url, c.date, c.when, c.change, c.notice, c.disclosure, c.cut ? 'yes' : '',
      (c.quotes || []).length, (c.quotes || []).filter((q) => q.first).length,
    ])),
  ]);
}

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
  <author><name>${esc(D.site.title)}</name><uri>${esc(D.site.repo || base)}</uri></author>
${D.site.license ? `  <rights>${esc(D.site.license.name)}, ${esc(D.site.license.url)}</rights>\n` : ''}  <updated>${new Date(D.generated).toISOString()}</updated>
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
