#!/usr/bin/env node
// Summarize the full-history sweep: for every account in data/accounts.yaml,
// how many posts it has made, how many of them the Wayback Machine archived,
// and how many of those were read. Writes inbox/sweep/COVERAGE.md.
//
// Post totals come from each sweep, or from inbox/sweep/profiles.json
// ({ "<handle>": { "name", "posts", "checked" } }) when X wouldn't say during
// the sweep: its profile endpoint rate-limits hard.
//
//   npm run sweep-coverage
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { ROOT, readYaml } from './lib.mjs';

const dir = path.join(ROOT, 'inbox', 'sweep');
const accounts = await readYaml(path.join(ROOT, 'data', 'accounts.yaml'));
const files = (await readdir(dir).catch(() => [])).filter((f) => f.endsWith('.coverage.json'));
const profiles = JSON.parse(await readFile(path.join(dir, 'profiles.json'), 'utf8').catch(() => '{}'));
const profileOf = (h) => Object.entries(profiles).find(([k]) => k.toLowerCase() === h.toLowerCase())?.[1];
const byHandle = new Map();
for (const f of files) {
  const c = JSON.parse(await readFile(path.join(dir, f), 'utf8'));
  byHandle.set(c.account.toLowerCase(), c);
}

const n = (v) => (v == null ? '?' : v.toLocaleString('en-US'));
const pct = (a, b) => (a != null && b ? `${Math.round((100 * a) / b)}%` : '');
const rows = [];
const totals = { posts_on_x: 0, known: 0, read: 0, with_text: 0, deleted: 0, unread: 0, matched: 0 };
let archivedWithTotal = 0; // archived posts of accounts whose post total is known, for the overall share
let withTotal = 0;
let postsWithTotal = 0;
const missing = [];
for (const a of accounts.filter((x) => x.x)) {
  const c = byHandle.get(a.x.toLowerCase());
  if (c && c.posts_on_x == null) c.posts_on_x = profileOf(a.x)?.posts ?? null;
  if (!c) {
    missing.push(`@${a.x}`);
    continue;
  }
  for (const k of Object.keys(totals)) totals[k] += c[k] ?? 0;
  // Until every post is read, unread links haven't had their author checked
  // (reposts and others' posts are only found on reading), so no share yet.
  const complete = !c.unread && !c.stopped;
  if (c.posts_on_x && complete) {
    archivedWithTotal += c.known ?? 0;
    postsWithTotal += c.posts_on_x;
    withTotal++;
  }
  const notes = [
    c.stopped ?? '',
    c.not_theirs ? `${c.not_theirs} reposts or others' posts left out` : '',
    ...(c.problems ?? []),
  ].filter(Boolean).join('; ').replace(/\|/g, '/');
  const posted = `${c.undated ? 'before 2010-11' : c.oldest ?? ''} – ${c.newest ?? ''}`;
  rows.push(`| [@${c.account}](${c.account}.md) | ${n(c.posts_on_x)} | ${n(c.known)} | ${complete ? pct(c.known, c.posts_on_x) : c.stopped ? 'partial' : 'pending'} | ${n(c.read)} | ${n(c.unread)} | ${n(c.deleted)} | ${n(c.matched)} | ${posted} | ${c.swept_at.slice(0, 10)}${notes ? ` · ${notes}` : ''} |`);
}

const md = [
  '# Full-history sweep: coverage',
  '',
  'Every X account in `data/accounts.yaml`, swept through the Wayback Machine\'s',
  'index of archived posts (and the X API when a token is set). "Archived" is',
  'every post of the account the archive holds under any URL form; posts nobody',
  'archived can\'t be seen this way. "Posts on X" counts everything the account',
  'has posted, reposts included, so the share archived is a floor.',
  '',
  '| Account | Posts on X | Archived | Share | Read | Not read yet | Possibly deleted | Topic matches | Posted | Swept |',
  '| --- | --: | --: | --: | --: | --: | --: | --: | --- | --- |',
  ...rows,
  `| **All ${rows.length} swept** | | ${n(totals.known)} | | ${n(totals.read)} | ${n(totals.unread)} | ${n(totals.deleted)} | ${n(totals.matched)} | | |`,
  '',
  withTotal
    ? `For the ${withTotal} fully read account(s) whose post total is known, the archive holds ${pct(archivedWithTotal, postsWithTotal)} of their ${n(postsWithTotal)} posts. X wouldn't give the total for the rest ("?"); "pending" means some posts are still unread.`
    : 'No fully read account has a known post total yet ("?" or "pending").',
  '',
  '- Archived links under a handle that X says another account wrote are left',
  '  out of the counts. Most are reposts of other accounts\' posts; some are',
  '  mistyped links or a handle\'s earlier owner.',
  '- "Possibly deleted": X returns nothing or a tombstone for the post. The post',
  '  was deleted, or the whole account was deleted, suspended or made private.',
  '  When nearly all of an account\'s posts show this, look at the account first.',
  '- X\'s post total counts only posts still up, so an account that deleted many',
  '  archived posts can show a share over 100%.',
  '',
  missing.length ? `Not swept yet: ${missing.join(', ')}.` : 'Every account has been swept.',
  '',
  'Each account\'s full list of posts is in `<account>/<year>.jsonl`; `<account>.md` lists the',
  'posts that match the topic filter and the ones that look deleted, for triage.',
  'Re-running the Sweep workflow reads only posts not read before, so "Not read',
  'yet" shrinks with each run.',
  '',
].join('\n');
await writeFile(path.join(dir, 'COVERAGE.md'), md);
console.log(`inbox/sweep/COVERAGE.md: ${rows.length} swept, ${missing.length} not yet`);
