#!/usr/bin/env node
// Find posts by in-scope accounts and write them to an inbox for triage.
//
//   npm run find-posts -- --account sama --from 2023 --to 2024 --match "safety|regulat|nonprofit"
//   npm run find-posts -- --all --from 2026-01 --match "safety|ads|military"
//   npm run find-posts -- --account sama --corpus --limit all --budget-minutes 320 --match "…"   (full history)
//
// Sources, per account in data/accounts.yaml:
//   wayback  every X post URL the Wayback Machine has archived for the
//            account (free; includes posts deleted since). Post dates come
//            from the post id; text comes from the live post or the archived copy.
//   x-api    the account's recent timeline via the X API (set X_BEARER_TOKEN).
//   bluesky  posts on Bluesky (set BSKY_HANDLE and BSKY_APP_PASSWORD for search).
// Choose with --via wayback,x-api,bluesky (default: every source that is configured).
// --keep-deleted keeps posts that look deleted (live lookup 404s, archived copy
// exists) even when they don't match --match: a deleted post is worth a look.
// --limit caps how many posts per account get their text read, newest first
// (default 300; "all" or 0 for no cap).
//
// Output: inbox/<date>-<account>.md and .json. Nothing is added to the record
// automatically: read the candidates, then `npm run new -- … --url <post>` for
// the ones that belong.
//
// --corpus keeps every post, not only the ones that match: it reads and
// updates inbox/sweep/<account>/<year>.jsonl (one post per line, newest first), so a
// later run only reads posts it hasn't read yet. It also writes
// inbox/sweep/<account>.md (posts matching --match, plus deleted ones, for
// triage) and inbox/sweep/<account>.coverage.json (how many posts the account
// has made, how many are archived, how many were read). --budget-minutes stops
// reading when time runs out; unread posts stay listed as unread.
// --concurrency sets how many posts are read at once (default 4). An account in
// data/accounts.yaml can set its own `match` for the triage list.
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { ROOT, loadAll, readYaml } from './lib.mjs';
import { sleep } from './web.mjs';
import { blueskyPosts, fetchXProfile, hydrateXCandidate, newestFirst, plausiblePostId, snowflakeDate, waybackPosts, xApiPosts, xStatusId } from './social.mjs';

const VALUE_OPTS = new Set(['account', 'from', 'to', 'match', 'limit', 'via', 'budget-minutes', 'concurrency']);
const opts = {};
for (let i = 2; i < process.argv.length; i++) {
  const a = process.argv[i].replace(/^--/, '');
  opts[a] = VALUE_OPTS.has(a) ? process.argv[++i] : true;
}

const pad = (d, end) => {
  if (!d) return undefined;
  if (/^\d{4}$/.test(d)) return end ? `${d}-12-31` : `${d}-01-01`;
  if (/^\d{4}-\d{2}$/.test(d)) {
    if (!end) return `${d}-01`;
    // Last real day of the month: the X and Bluesky APIs reject dates like 2024-02-31.
    const [y, m] = d.split('-').map(Number);
    return new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10);
  }
  return d;
};
const from = pad(opts.from, false);
const to = pad(opts.to, true);
const limit = ['all', '0'].includes(String(opts.limit)) ? Infinity : Number(opts.limit || 300);
const deadline = opts['budget-minutes'] ? Date.now() + Number(opts['budget-minutes']) * 60000 : Infinity;
const concurrency = Math.max(1, Number(opts.concurrency || 4));
const match = opts.match ? new RegExp(opts.match, 'i') : null;
const terms = opts.match ? String(opts.match).split('|').map((t) => t.replace(/[^\w\s-]/g, '').trim()).filter(Boolean) : [];

const accounts = await readYaml(path.join(ROOT, 'data', 'accounts.yaml'));
const wanted = typeof opts.account === 'string' ? opts.account.replace(/^@/, '').toLowerCase() : null;
const chosen = opts.all ? accounts : wanted ? accounts.filter((a) => [a.x, a.bluesky, a.actor].some((v) => v && v.toLowerCase() === wanted)) : [];
if (!chosen.length) {
  console.error(`Usage: npm run find-posts -- --account <x handle|actor id> [--from YYYY[-MM[-DD]]] [--to …] [--match "regex"] [--limit N] [--via wayback,x-api,bluesky]
       npm run find-posts -- --all …
Accounts are listed in data/accounts.yaml.`);
  process.exit(1);
}
const via = new Set((opts.via || ['wayback', process.env.X_BEARER_TOKEN && 'x-api', 'bluesky'].filter(Boolean).join(',')).split(','));

// Posts already cited in the record, so they can be flagged.
const { entries } = await loadAll();
const cited = new Set();
for (const e of entries) {
  for (const s of [...(e.sources ?? []), ...(e.updates ?? []).flatMap((u) => u.sources ?? [])]) {
    cited.add(xStatusId(s.url) || s.url);
  }
}

const stamp = new Date().toISOString().slice(0, 10);
await mkdir(path.join(ROOT, 'inbox'), { recursive: true });

/** Run fn over items, a few at a time, pausing between requests; stops starting new ones after the deadline. */
async function readPosts(items, fn) {
  let next = 0;
  let done = 0;
  const worker = async () => {
    while (next < items.length && Date.now() < deadline) {
      const item = items[next++];
      await fn(item);
      done++;
      await sleep(400);
    }
  };
  await Promise.all(Array.from({ length: concurrency }, worker));
  return done;
}

if (opts.corpus) {
  for (const account of chosen) await sweepAccount(account);
  process.exit(0);
}

for (const account of chosen) {
  const name = account.x || account.bluesky;
  console.log(`\n@${name} (${account.actor})`);
  const applicable = [account.x && 'wayback', account.x && 'x-api', account.bluesky && 'bluesky'].filter((s) => s && via.has(s));
  if (!applicable.length) {
    console.log(`  skipped: no ${[...via].join('/')} source applies to this account`);
    continue;
  }
  let found = [];
  const problems = [];

  if (account.x && via.has('wayback')) {
    try {
      const list = await waybackPosts(account.x, { from, to });
      console.log(`  wayback: ${list.length} archived posts${from || to ? ` in ${from ?? '…'} – ${to ?? '…'}` : ''}`);
      // Newest first, and only as many as --limit, since each needs a text lookup.
      const picked = list.slice(0, limit);
      let n = 0;
      await readPosts(picked, async (c) => {
        await hydrateXCandidate(c);
        c.via = 'wayback';
        if (++n % 25 === 0) console.log(`  … ${n}/${picked.length} read`);
      });
      found.push(...picked);
    } catch (err) {
      problems.push(`wayback: ${err.message}`);
    }
  }
  if (account.x && via.has('x-api')) {
    try {
      const list = await xApiPosts(account.x, { from, to, max: Number.isFinite(limit) ? limit : 3200 });
      console.log(`  x-api: ${list.length} posts`);
      found.push(...list);
    } catch (err) {
      problems.push(`x-api: ${err.message}`);
    }
  }
  if (account.bluesky && via.has('bluesky')) {
    try {
      const list = await blueskyPosts(account.bluesky, { terms, from, to, max: limit });
      console.log(`  bluesky: ${list.length} posts`);
      found.push(...list);
    } catch (err) {
      problems.push(`bluesky: ${err.message}`);
    }
  }
  for (const p of problems) console.warn(`  ${p}`);
  if (!found.length && problems.length) {
    console.warn('  every source failed; no inbox file written');
    continue;
  }

  // Merge duplicates (same post from several sources), then filter.
  const merged = new Map();
  for (const c of found) {
    const key = c.id;
    const prev = merged.get(key);
    merged.set(key, prev ? { ...prev, ...Object.fromEntries(Object.entries(c).filter(([, v]) => v != null)), via: `${prev.via}+${c.via}` } : c);
  }
  let posts = [...merged.values()];
  if (match) posts = posts.filter((c) => (c.text && match.test(c.text)) || (opts['keep-deleted'] && c.possibly_deleted));
  posts.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  for (const c of posts) c.already_cited = cited.has(c.id) || cited.has(c.url);

  const base = path.join(ROOT, 'inbox', `${stamp}-${name}`);
  await writeFile(`${base}.json`, `${JSON.stringify({ account, from, to, match: opts.match ?? null, problems, posts }, null, 2)}\n`);
  const md = [
    `# @${name}: candidate posts`,
    '',
    `Found ${stamp}${from || to ? ` · posted ${from ?? '…'} to ${to ?? '…'}` : ''}${opts.match ? ` · matching \`${opts.match}\`` : ''} · ${posts.length} post(s).`,
    problems.length ? `\nProblems: ${problems.join('; ')}` : '',
    '',
    'Triage: for each post that belongs in the record, run',
    '`npm run new -- --org <org> --type said --date <date> --slug <slug> --url <post url>`.',
    '',
    ...posts.flatMap((c) => [
      `## ${c.date ?? 'undated'}${c.possibly_deleted ? ' · possibly deleted' : ''}${c.already_cited ? ' · already cited' : ''}`,
      '',
      c.text ? `> ${c.text.replace(/\n/g, '\n> ')}` : '_(text not available)_',
      '',
      `${c.url}${c.archive ? ` · [archived](${c.archive})` : ''} · via ${c.via}`,
      '',
    ]),
  ].join('\n');
  await writeFile(`${base}.md`, md);
  console.log(`  ${posts.length} candidate(s) → inbox/${stamp}-${name}.md`);
}

// ── Corpus mode ──────────────────────────────────────────────────────────
async function readJsonl(file) {
  try {
    return (await readFile(file, 'utf8')).split('\n').filter(Boolean).map((l) => JSON.parse(l));
  } catch {
    return [];
  }
}

/** The fields kept for each post in the corpus files. */
function slim(c) {
  // The post's URL is left out: it's https://x.com/<account>/status/<id>.
  const fields = ['id', 'date', 'author', 'other_author', 'text', 'reply_to', 'quoted', 'deleted', 'live_status', 'archived_at', 'archive', 'via', 'read_at'];
  return Object.fromEntries(fields.filter((k) => c[k] != null).map((k) => [k, c[k]]));
}

// Posts are stored one file per year, so no file grows too big for git and a
// run rewrites only the years it touched. Posts from before November 2010
// carry no date in their id.
function shardOf(c) {
  return c.date?.slice(0, 4) ?? 'before-2010-11';
}

async function sweepAccount(account) {
  const name = account.x;
  if (!name) return;
  console.log(`\n@${name} (${account.actor})`);
  const dir = path.join(ROOT, 'inbox', 'sweep');
  const shardDir = path.join(dir, name);
  await mkdir(shardDir, { recursive: true });
  const base = path.join(dir, name);
  const problems = [];
  // An account can narrow the triage list (e.g. to posts about OpenAI).
  const topics = account.match ? new RegExp(account.match, 'i') : match;

  const profile = await fetchXProfile(name).catch(() => null);
  console.log(`  profile: ${profile ? `${profile.name}, ${profile.posts ?? '?'} posts on X` : 'not available'}`);

  // Earlier runs: keep what was read, so this run only reads what's new. Read
  // the year files, and the single-file layout of the first sweep.
  const stored = [
    ...(await readJsonl(`${base}.jsonl`)),
    ...(await Promise.all((await readdir(shardDir)).filter((f) => f.endsWith('.jsonl')).map((f) => readJsonl(path.join(shardDir, f))))).flat(),
  ];
  const corpus = new Map();
  let dropped = 0;
  let recheck = 0;
  for (const c of stored) {
    if (!plausiblePostId(c.id)) { dropped++; continue; } // made-up ids from archived URLs
    c.handle = name;
    c.url = `https://x.com/${name}/status/${c.id}`;
    c.date = snowflakeDate(c.id)?.toISOString().slice(0, 10) ?? null;
    // Read before posts were checked for their author: read again once.
    if (c.read_at && !c.author && !c.deleted && !c.other_author && !String(c.via).includes('x-api')) {
      delete c.read_at;
      recheck++;
    }
    corpus.set(c.id, c);
  }
  if (dropped || recheck) console.log(`  stored posts: dropped ${dropped} with impossible ids; re-reading ${recheck} to confirm their author`);
  const before = corpus.size;
  const add = (c, source) => {
    const prev = corpus.get(c.id);
    const merged = { ...c, ...(prev ?? {}), handle: name };
    merged.via = [...new Set([...(prev?.via ?? '').split('+'), source].filter(Boolean))].join('+');
    // A fresh listing may carry a better archive link than the stored one.
    for (const k of ['archived_at', 'archive', 'archive_raw']) if (c[k] && !prev?.text) merged[k] = c[k];
    corpus.set(c.id, merged);
  };

  let archived = null;
  if (via.has('wayback')) {
    try {
      const list = await waybackPosts(name, {
        from, to,
        onPage: ({ prefix, pages, rows }) => console.log(`  wayback: ${prefix} page ${pages}, ${rows} rows so far`),
      });
      archived = list.length;
      console.log(`  wayback: ${list.length} archived posts`);
      for (const c of list) add(c, 'wayback');
    } catch (err) {
      problems.push(`wayback: ${err.message}`);
    }
  }
  if (via.has('x-api')) {
    try {
      const list = await xApiPosts(name, { from, to, max: 3200 });
      console.log(`  x-api: ${list.length} posts`);
      for (const c of list) add({ ...c, read_at: stamp }, 'x-api');
    } catch (err) {
      problems.push(`x-api: ${err.message}`);
    }
  }
  for (const p of problems) console.warn(`  ${p}`);

  const posts = () => [...corpus.values()].sort(newestFirst);
  const inRange = (c) => (!from || (c.date && c.date >= from)) && (!to || (c.date && c.date <= to));
  const unread = posts().filter((c) => !c.read_at && inRange(c)).slice(0, limit);
  console.log(`  ${corpus.size} posts known (${corpus.size - before} new); reading ${unread.length}`);

  const theirs = (c) => !c.other_author;
  const save = async () => {
    const all = posts();
    const shards = new Map();
    for (const c of all) shards.set(shardOf(c), [...(shards.get(shardOf(c)) ?? []), c]);
    for (const [shard, list] of shards) {
      await writeFile(path.join(shardDir, `${shard}.jsonl`), list.map((c) => JSON.stringify(slim(c))).join('\n') + '\n');
    }
    await rm(`${base}.jsonl`, { force: true });
    const inScope = all.filter(inRange);
    const own = inScope.filter(theirs);
    const coverage = {
      account: name,
      actor: account.actor,
      swept_at: new Date().toISOString(),
      range: { from: from ?? null, to: to ?? null },
      profile_name: profile?.name ?? null,
      posts_on_x: profile?.posts ?? null,
      archived_listed: archived,
      known: own.length,
      read: own.filter((c) => c.read_at).length,
      with_text: own.filter((c) => c.text).length,
      deleted: own.filter((c) => c.deleted).length,
      unread: own.filter((c) => !c.read_at).length,
      matched: own.filter((c) => topics && c.text && topics.test(c.text)).length,
      not_theirs: inScope.length - own.length,
      undated: own.filter((c) => !c.date).length,
      oldest: own.filter((c) => c.date).at(-1)?.date ?? null,
      newest: own.find((c) => c.date)?.date ?? null,
      topics: account.match ?? opts.match ?? null,
      problems,
    };
    await writeFile(`${base}.coverage.json`, `${JSON.stringify(coverage, null, 2)}\n`);
    return { all: own, coverage };
  };

  let n = 0;
  await readPosts(unread, async (c) => {
    await hydrateXCandidate(c);
    c.deleted = c.possibly_deleted || undefined;
    if (c.other_author) c.text = undefined;
    c.read_at = stamp;
    if (++n % 100 === 0) {
      console.log(`  … ${n}/${unread.length} read`);
      if (n % 500 === 0) await save();
    }
  });
  if (n < unread.length) console.warn(`  stopped at the time budget: ${unread.length - n} post(s) left unread for the next run`);

  const { all, coverage } = await save();
  const picked = all.filter((c) => (topics && c.text && topics.test(c.text)) || c.deleted);
  const pct = (a, b) => (b ? `${Math.round((100 * a) / b)}%` : 'n/a');
  const md = [
    `# @${name}: swept posts`,
    '',
    `Swept ${stamp}${from || to ? ` · posted ${from ?? '…'} to ${to ?? '…'}` : ''}.`,
    '',
    `- Posts on X, including reposts: ${coverage.posts_on_x ?? 'unknown'}`,
    `- Archived posts found: ${coverage.known} (${coverage.undated ? `${coverage.undated} from before November 2010, ` : ''}${coverage.oldest ?? '…'} to ${coverage.newest ?? '…'})`,
    coverage.not_theirs ? `- Left out: ${coverage.not_theirs} archived link(s) under this handle that X says another account wrote` : null,
    `- Read so far: ${coverage.read} (${pct(coverage.read, coverage.known)}); text found for ${coverage.with_text}; ${coverage.unread} not read yet`,
    `- Possibly deleted: ${coverage.deleted}`,
    `- Matching the topic filter: ${coverage.matched}`,
    problems.length ? `- Problems: ${problems.join('; ')}` : '',
    '',
    `Every post is in \`${name}/<year>.jsonl\`. Listed below: posts matching the topic filter${coverage.topics ? ` (\`${coverage.topics}\`)` : ''}, and posts that look deleted.`,
    '',
    ...picked.flatMap((c) => [
      `## ${c.date ?? 'undated'}${c.deleted ? ' · possibly deleted' : ''}${cited.has(c.id) ? ' · already cited' : ''}${c.reply_to ? ` · reply to @${c.reply_to}` : ''}`,
      '',
      c.text ? `> ${c.text.replace(/\n/g, '\n> ')}` : '_(text not available)_',
      ...(c.quoted?.text ? ['', `Quoting ${c.quoted.url}:`, `> ${c.quoted.text.replace(/\n/g, '\n> ')}`] : []),
      '',
      `${c.url}${c.archive ? ` · [archived](${c.archive})` : ''}`,
      '',
    ]),
  ].filter((l) => l !== null).join('\n');
  await writeFile(`${base}.md`, md);
  console.log(`  ${coverage.read}/${coverage.known} read, ${coverage.matched} matching, ${coverage.deleted} possibly deleted → inbox/sweep/${name}.md`);
}
