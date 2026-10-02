#!/usr/bin/env node
// The reading queue: every post an in-scope account wrote that nobody has read
// yet. No topic filter. A post that never uses a "safety" word can still be the
// one that matters, so every post is read in full and given a decision.
//
//   npm run reading-queue
//       Writes inbox/sweep/QUEUE.md: each account's unread posts, oldest first,
//       one line per post. Posts come from the full-history sweep
//       (inbox/sweep/<account>/<year>.jsonl) and from the weekly watch
//       (inbox/<date>-<account>.json). A post counts as read once it has a line
//       in inbox/sweep/triage/reading-log.jsonl, or a decision from the first
//       triage (inbox/sweep/triage/decisions.jsonl) for an account that triage
//       read in full. It read nine accounts partly as one-line excerpts, so
//       their first-triage decisions don't count.
//
//   npm run reading-queue -- --log <account> < decisions.txt
//       Records a decision for every queued post of <account>: the lines on
//       stdin are "<post id> <R|L|C> <note>", and every queued post not listed
//       is recorded as O (nothing for the record). Use it only after reading
//       every queued post of that account. Codes:
//         R  receipt candidate: a promise, claim or denial about the company's own
//            conduct, or the action that breaks or keeps one
//         L  lead: might matter, needs checking
//         C  context for an existing entry or topic
//         O  nothing for the record
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
const logFor = args.includes('--log') ? args[args.indexOf('--log') + 1]?.replace(/^@/, '') : null;

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
const read = new Set([
  ...(await jsonl(LOG)),
  ...(await jsonl(FIRST_TRIAGE)).filter((d) => !EXCERPTED.has(String(d.account).toLowerCase())),
].map((d) => d.id));

// Weekly watch results: inbox/<YYYY-MM-DD>-<handle>.json.
const weekly = new Map();
for (const f of await readdir(path.join(ROOT, 'inbox'))) {
  const m = f.match(/^\d{4}-\d{2}-\d{2}-(.+)\.json$/);
  if (!m) continue;
  const { posts = [] } = JSON.parse(await readFile(path.join(ROOT, 'inbox', f), 'utf8'));
  const key = m[1].toLowerCase();
  weekly.set(key, [...(weekly.get(key) ?? []), ...posts]);
}

/** Every unread own post of an account, oldest first. */
async function queueOf(handle) {
  const dir = path.join(SWEEP, handle);
  const files = (await readdir(dir).catch(() => [])).filter((f) => f.endsWith('.jsonl'));
  const stored = (await Promise.all(files.map((f) => jsonl(path.join(dir, f))))).flat();
  const posts = new Map();
  for (const p of [...stored, ...(weekly.get(handle.toLowerCase()) ?? [])]) {
    if (p.other_author || (p.author && p.author.toLowerCase() !== handle.toLowerCase())) continue;
    if (!p.text?.trim() || !p.date || p.date < SINCE || p.date > TODAY) continue;
    if (/<(link|meta|script)\b|abs\.twimg\.com|viewport-fit/.test(p.text)) continue; // a login page, not the post
    if (read.has(p.id) || posts.has(p.id)) continue;
    posts.set(p.id, p);
  }
  return [...posts.values()].sort((a, b) => a.date.localeCompare(b.date) || (BigInt(a.id) < BigInt(b.id) ? -1 : 1));
}

const oneLine = (t) => t.replace(/https:\/\/t\.co\/\w+/g, '[link]').replace(/\s*\n\s*/g, ' ⏎ ').trim();
function line(p, handle) {
  const to = p.reply_to ? (p.reply_to.toLowerCase() === handle.toLowerCase() ? ' · thread' : ` · ↩@${p.reply_to}`) : '';
  const quoted = p.quoted?.text ? ` ⟨Q${p.quoted.url ? ` @${p.quoted.url.split('/')[3]}` : ''}: ${oneLine(p.quoted.text).slice(0, 300)}⟩` : '';
  const gone = p.deleted || p.possibly_deleted ? ' [DELETED]' : '';
  return `${p.id} · ${p.date}${to} · ${oneLine(p.text)}${quoted}${gone}`;
}

if (logFor) {
  const account = accounts.find((a) => a.x.toLowerCase() === logFor.toLowerCase());
  if (!account) throw new Error(`@${logFor} is not in data/accounts.yaml`);
  const queued = await queueOf(account.x);
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
  const batch = `queue-${TODAY}-${account.x}`;
  const rows = queued.map((p) => ({ id: p.id, account: account.x, batch, code: flags.get(p.id)?.code ?? 'O', ...(flags.has(p.id) ? { note: flags.get(p.id).note } : {}) }));
  await appendFile(LOG, rows.map((r) => JSON.stringify(r)).join('\n') + '\n');
  console.log(`@${account.x}: ${rows.length} post(s) recorded, ${flags.size} flagged.`);
  process.exit(0);
}

const sections = [];
const counts = [];
for (const a of accounts) {
  const q = await queueOf(a.x);
  if (!q.length) continue;
  counts.push(`| [@${a.x}](#${a.x.toLowerCase()}) | ${q.length} | ${q[0].date} to ${q.at(-1).date} |`);
  sections.push(`## @${a.x}`, '', ...q.map((p) => `- ${line(p, a.x)}`), '');
}
const total = counts.reduce((n, r) => n + Number(r.split('|')[2]), 0);
await writeFile(path.join(SWEEP, 'QUEUE.md'), [
  '# Reading queue',
  '',
  `Built ${TODAY}. Every post an in-scope account wrote (from December 2015 on, with text) that has no decision yet. There is no topic filter: read each post in full, in context, and decide. Then record the decisions for an account with`,
  '',
  '```',
  'npm run reading-queue -- --log <account> < decisions.txt   # lines: "<post id> <R|L|C> <note>"; unlisted posts are recorded as O',
  '```',
  '',
  'R is a receipt candidate, L a lead to check, C context for an existing entry, O nothing for the record. See [TRIAGE.md](TRIAGE.md).',
  '',
  total ? `${total.toLocaleString('en-US')} post(s) to read.` : 'Nothing to read: every post collected so far has a decision.',
  '',
  ...(total ? ['| Account | Unread | Posted |', '| --- | --: | --- |', ...counts, '', ...sections] : []),
].join('\n'));
console.log(`Reading queue: ${total} post(s) → inbox/sweep/QUEUE.md`);
