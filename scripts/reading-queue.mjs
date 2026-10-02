#!/usr/bin/env node
// The reading queue: every post an in-scope account wrote that nobody has read
// yet. No topic filter. A post that never uses a "safety" word can still be the
// one that matters, so every post is read in full and given a decision.
//
// What counts as a claim widened in October 2026. Readings before then looked
// for safety, ethics and policy claims; since then a reading looks for every
// kind of claim the record covers (capabilities, features and dates, usage
// limits, plan terms, product promises, predictions). Decisions made under the
// wider scope carry "scope": "all" in the log. A post written while its author
// was at the company, or after (see `since` and `tenure` in
// data/accounts.yaml), needs a reading under the wider scope; any other post
// needs one reading of either kind.
//
//   npm run reading-queue
//       Writes inbox/sweep/QUEUE.md: each account's unread posts, oldest first,
//       one line per post, and a count per account of posts read so far only
//       for safety, ethics and policy claims. Posts come from the full-history
//       sweep (inbox/sweep/<account>/<year>.jsonl) and from the weekly watch
//       (inbox/<date>-<account>.json). A reading is a line in
//       inbox/sweep/triage/reading-log.jsonl, or a decision from the first
//       triage (inbox/sweep/triage/decisions.jsonl) for an account that triage
//       read in full. It read nine accounts partly as one-line excerpts, so
//       their first-triage decisions don't count.
//
//   npm run reading-queue -- --log <account> < decisions.txt
//       Records a decision for every unread post of <account> listed in the
//       queue: the lines on stdin are "<post id> <R|L|C> <note>", and every
//       queued post not listed is recorded as O (nothing for the record). Use
//       it only after reading every queued post of that account. Codes:
//         R  receipt candidate: a promise or claim about the company or its
//            products, a denial, or the action that breaks or keeps one
//         L  lead: might matter, needs checking
//         C  context for an existing entry or topic
//         O  nothing for the record
//
//   npm run reading-queue -- --rescope <account>
//       Prints the account's posts read so far only for safety, ethics and
//       policy claims, in the queue's line format, for a reading under the
//       wider scope. Add --log (as above) to record that reading.
//
// Only an account's own posts are queued (not other people's posts archived
// under its handle), from December 2015 (OpenAI's founding) on, with text.
import { appendFile, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { ROOT, readYaml } from './lib.mjs';

const SWEEP = path.join(ROOT, 'inbox', 'sweep');
const LOG = path.join(SWEEP, 'triage', 'reading-log.jsonl');
const FIRST_TRIAGE = path.join(SWEEP, 'triage', 'decisions.jsonl');
const SINCE = '2015-12';
const TODAY = new Date().toISOString().slice(0, 10);

const args = process.argv.slice(2);
const flag = (name) => (args.includes(name) ? args[args.indexOf(name) + 1]?.replace(/^@/, '') : null);
const rescopeFor = flag('--rescope');
const logFor = flag('--log') ?? (args.includes('--log') ? rescopeFor : null);

async function jsonl(file) {
  try {
    return (await readFile(file, 'utf8')).split('\n').filter(Boolean).map((l) => JSON.parse(l));
  } catch {
    return [];
  }
}

const accounts = (await readYaml(path.join(ROOT, 'data', 'accounts.yaml'))).filter((a) => a.x);
// The first triage read these accounts partly as one-line excerpts, and its log
// doesn't say which posts were read in full.
const EXCERPTED = new Set(['lhsummers', 'chrislehane', 'kalinowski007', 'sashadem', 'boazbaraktcs', 'amandaaskell', 'richardmcngo', 'sleepinyourhat', 'miles_brundage']);
const log = await jsonl(LOG);
const read = new Set([
  ...log,
  ...(await jsonl(FIRST_TRIAGE)).filter((d) => !EXCERPTED.has(String(d.account).toLowerCase())),
].map((d) => d.id));
const readForAll = new Set(log.filter((d) => d.scope === 'all').map((d) => d.id));

/** Whether a post was written while its author was at the company, or after. */
function inTenure(account, date) {
  if (account.speaks_for === false) return false;
  const month = date.slice(0, 7);
  if (account.tenure) {
    return account.tenure.some((r) => {
      const [from, to] = String(r).split('..');
      return month >= from && (!to || month <= to);
    });
  }
  return !account.since || month >= String(account.since);
}

// Weekly watch results: inbox/<YYYY-MM-DD>-<handle>.json.
const weekly = new Map();
for (const f of await readdir(path.join(ROOT, 'inbox'))) {
  const m = f.match(/^\d{4}-\d{2}-\d{2}-(.+)\.json$/);
  if (!m) continue;
  const { posts = [] } = JSON.parse(await readFile(path.join(ROOT, 'inbox', f), 'utf8'));
  const key = m[1].toLowerCase();
  weekly.set(key, [...(weekly.get(key) ?? []), ...posts]);
}

/**
 * An account's own posts that need a reading, oldest first: `unread` have
 * none; `rescope` were read only for safety, ethics and policy claims but
 * were written in the author's tenure, so they need a wider reading.
 */
async function queueOf(account) {
  const handle = account.x;
  const dir = path.join(SWEEP, handle);
  const files = (await readdir(dir).catch(() => [])).filter((f) => f.endsWith('.jsonl'));
  const stored = (await Promise.all(files.map((f) => jsonl(path.join(dir, f))))).flat();
  const posts = new Map();
  for (const p of [...stored, ...(weekly.get(handle.toLowerCase()) ?? [])]) {
    if (p.other_author || (p.author && p.author.toLowerCase() !== handle.toLowerCase())) continue;
    if (!p.text?.trim() || !p.date || p.date < SINCE || p.date > TODAY) continue;
    if (/<(link|meta|script)\b|abs\.twimg\.com|viewport-fit/.test(p.text)) continue; // a login page, not the post
    if (posts.has(p.id) || readForAll.has(p.id)) continue;
    if (read.has(p.id) && !inTenure(account, p.date)) continue;
    posts.set(p.id, p);
  }
  const all = [...posts.values()].sort((a, b) => a.date.localeCompare(b.date) || (BigInt(a.id) < BigInt(b.id) ? -1 : 1));
  return { unread: all.filter((p) => !read.has(p.id)), rescope: all.filter((p) => read.has(p.id)) };
}

const oneLine = (t) => t.replace(/https:\/\/t\.co\/\w+/g, '[link]').replace(/\s*\n\s*/g, ' ⏎ ').trim();
function line(p, handle) {
  const to = p.reply_to ? (p.reply_to.toLowerCase() === handle.toLowerCase() ? ' · thread' : ` · ↩@${p.reply_to}`) : '';
  const quoted = p.quoted?.text ? ` ⟨Q${p.quoted.url ? ` @${p.quoted.url.split('/')[3]}` : ''}: ${oneLine(p.quoted.text).slice(0, 300)}⟩` : '';
  const gone = p.deleted || p.possibly_deleted ? ' [DELETED]' : '';
  return `${p.id} · ${p.date}${to} · ${oneLine(p.text)}${quoted}${gone}`;
}

const findAccount = (h) => {
  const account = accounts.find((a) => a.x.toLowerCase() === h.toLowerCase());
  if (!account) throw new Error(`@${h} is not in data/accounts.yaml`);
  return account;
};

if (rescopeFor && !args.includes('--log')) {
  const account = findAccount(rescopeFor);
  const { rescope } = await queueOf(account);
  const text = rescope.map((p) => line(p, account.x)).join('\n') || `@${account.x}: nothing to re-read.`;
  await new Promise((resolve) => process.stdout.write(`${text}\n`, resolve)); // let a long list flush before exiting
  process.exit(0);
}

if (logFor) {
  const account = findAccount(logFor);
  const q = await queueOf(account);
  const queued = rescopeFor ? q.rescope : q.unread;
  if (!queued.length) {
    console.log(`@${account.x}: nothing queued.`);
    process.exit(0);
  }
  const ids = new Set(queued.map((p) => p.id));
  const flags = new Map();
  const input = await new Promise((resolve) => {
    let s = '';
    process.stdin.on('data', (d) => (s += d)).on('end', () => resolve(s));
  });
  for (const raw of input.split('\n').map((l) => l.trim()).filter(Boolean)) {
    const m = raw.match(/^(\d+)\s+([RLC])\s+(.+)$/);
    if (!m) throw new Error(`Can't read "${raw}": expected "<post id> <R|L|C> <note>"`);
    if (!ids.has(m[1])) throw new Error(`${m[1]} is not in @${account.x}'s queue`);
    flags.set(m[1], { code: m[2], note: m[3] });
  }
  const batch = `${rescopeFor ? 'rescope' : 'queue'}-${TODAY}-${account.x}`;
  const rows = queued.map((p) => ({ id: p.id, account: account.x, batch, scope: 'all', code: flags.get(p.id)?.code ?? 'O', ...(flags.has(p.id) ? { note: flags.get(p.id).note } : {}) }));
  await appendFile(LOG, rows.map((r) => JSON.stringify(r)).join('\n') + '\n');
  console.log(`@${account.x}: ${rows.length} post(s) recorded, ${flags.size} flagged.`);
  process.exit(0);
}

const sections = [];
const counts = [];
const backlog = [];
for (const a of accounts) {
  const { unread, rescope } = await queueOf(a);
  if (rescope.length) backlog.push(`| @${a.x} | ${rescope.length} | ${rescope[0].date} to ${rescope.at(-1).date} |`);
  if (!unread.length) continue;
  counts.push(`| [@${a.x}](#${a.x.toLowerCase()}) | ${unread.length} | ${unread[0].date} to ${unread.at(-1).date} |`);
  sections.push(`## @${a.x}`, '', ...unread.map((p) => `- ${line(p, a.x)}`), '');
}
const sum = (rows) => rows.reduce((n, r) => n + Number(r.split('|')[2]), 0);
const total = sum(counts);
const rescoped = sum(backlog);
await writeFile(path.join(SWEEP, 'QUEUE.md'), [
  '# Reading queue',
  '',
  `Built ${TODAY}. Every post an in-scope account wrote (from December 2015 on, with text) that has no decision yet. There is no topic filter: read each post in full, in context, and decide. Then record the decisions for an account with`,
  '',
  '```',
  'npm run reading-queue -- --log <account> < decisions.txt   # lines: "<post id> <R|L|C> <note>"; unlisted posts are recorded as O',
  '```',
  '',
  'R is a receipt candidate, L a lead to check, C context for an existing entry, O nothing for the record. A claim is any notable public claim or promise the record covers: safety, ethics and policy, and also capabilities and benchmarks, features and release dates, usage limits and plan terms, promises about how a product behaves, and dated predictions. See [TRIAGE.md](TRIAGE.md).',
  '',
  total ? `${total.toLocaleString('en-US')} post(s) to read.` : 'Nothing unread: every post collected so far has a decision.',
  '',
  ...(rescoped ? [
    '## Read so far only for safety, ethics and policy claims',
    '',
    `Until October 2026 the record covered safety, ethics and policy claims only, and posts were read with that in mind. ${rescoped.toLocaleString('en-US')} post(s) written while their author was at the company (or after) still need a reading for every kind of claim. Print an account's list with \`npm run reading-queue -- --rescope <account>\` and record the reading with \`--rescope <account> --log\`.`,
    '',
    '| Account | To re-read | Posted |',
    '| --- | --: | --- |',
    ...backlog,
    '',
  ] : []),
  ...(total ? ['## Unread', '', '| Account | Unread | Posted |', '| --- | --: | --- |', ...counts, '', ...sections] : []),
].join('\n'));
console.log(`Reading queue: ${total} unread, ${rescoped} to re-read for every kind of claim → inbox/sweep/QUEUE.md`);
