#!/usr/bin/env node
// Find posts by in-scope accounts and write them to an inbox for triage.
//
//   npm run find-posts -- --account sama --from 2023 --to 2024 --match "safety|regulat|nonprofit"
//   npm run find-posts -- --all --from 2026-01 --match "safety|ads|military"
//
// Sources, per account in data/accounts.yaml:
//   wayback  every X post URL the Wayback Machine has archived for the
//            account (free; includes posts deleted since). Post dates come
//            from the post id; text comes from the live post or the archived copy.
//   x-api    the account's recent timeline via the X API (set X_BEARER_TOKEN).
//   bluesky  posts on Bluesky (set BSKY_HANDLE and BSKY_APP_PASSWORD for search).
// Choose with --via wayback,x-api,bluesky (default: every source that is configured).
//
// Output: inbox/<date>-<account>.md and .json. Nothing is added to the record
// automatically: read the candidates, then `npm run new -- … --url <post>` for
// the ones that belong.
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { ROOT, loadAll, readYaml } from './lib.mjs';
import { sleep } from './web.mjs';
import { blueskyPosts, hydrateXCandidate, waybackPosts, xApiPosts, xStatusId } from './social.mjs';

const VALUE_OPTS = new Set(['account', 'from', 'to', 'match', 'limit', 'via']);
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
const limit = Number(opts.limit || 300);
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
      const picked = list.reverse().slice(0, limit);
      for (const [i, c] of picked.entries()) {
        await hydrateXCandidate(c);
        c.via = 'wayback';
        if ((i + 1) % 25 === 0) console.log(`  … ${i + 1}/${picked.length} read`);
        await sleep(700);
      }
      found.push(...picked);
    } catch (err) {
      problems.push(`wayback: ${err.message}`);
    }
  }
  if (account.x && via.has('x-api')) {
    try {
      const list = await xApiPosts(account.x, { from, to, max: limit });
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
  if (match) posts = posts.filter((c) => c.text && match.test(c.text));
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
