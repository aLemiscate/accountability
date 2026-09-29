#!/usr/bin/env node
// Start a new entry from a template, and optionally capture its first source.
//
//   npm run new -- --org openai --type said --date 2026-09-29 --slug altman-podcast-safety [--url <source>]
//
// Writes data/entries/<org>/<date>-<slug>.yaml with every field stubbed and
// explained. Fill it in, then run "npm run build" to validate.
import { writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { ENTRIES, ORGS, TYPES, KINDS, STATUSES, CONCRETENESS, parseDate } from './lib.mjs';

const args = {};
for (let i = 2; i < process.argv.length; i += 2) args[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const { org, type = 'said', slug, url } = args;
const date = args.date || new Date().toISOString().slice(0, 10);

const problems = [];
if (!ORGS.includes(org)) problems.push(`--org must be one of: ${ORGS.join(', ')}`);
if (!TYPES.includes(type)) problems.push('--type must be "said" or "did"');
if (!parseDate(date)) problems.push('--date must be YYYY, YYYY-MM or YYYY-MM-DD');
if (!slug || !/^[a-z0-9-]+$/.test(slug)) problems.push('--slug is required: lowercase words joined by hyphens');
if (problems.length) {
  console.error(`${problems.join('\n')}\n\nExample: npm run new -- --org openai --type said --date 2026-09-29 --slug altman-podcast-safety --url https://x.com/...`);
  process.exit(1);
}

const id = `${date}-${slug}`;
const file = path.join(ENTRIES, org, `${id}.yaml`);
if (existsSync(file)) {
  console.error(`${path.relative(process.cwd(), file)} already exists.`);
  process.exit(1);
}

const said = type === 'said';
const template = `# ${said ? 'SAID: a statement, principle, commitment, claim or denial.' : 'DID: an action, reversal, policy revision, disclosure or outcome.'}
# Rules: quotes are verbatim (use … for omissions); paraphrase goes in summary.
# Every factual line should be supported by a source below.
title: TODO one-line headline
date: ${date}
org: ${org}
type: ${type}
kind: ${KINDS[type][0]}  # one of: ${KINDS[type].join(', ')}
who: [${org}]  # actor ids from data/actors.yaml (people must be in scope; see METHODOLOGY.md)
venue: TODO where it was said or done (e.g. "Post on X", "Senate testimony")
quote: >-
  TODO verbatim words, or delete this field
summary: >-
  TODO what happened, in plain factual sentences.
${said ? `concreteness: directional  # one of: ${CONCRETENESS.join(', ')}
status: open  # one of: ${STATUSES.join(', ')}
breaks_if: >-
  TODO what outcome would count as breaking this (required while status is open)
` : `contradicts: []  # ids of earlier "said" entries this action contradicts
# revision:        # for policy text changes
#   before: >-
#     old wording
#   after: >-
#     new wording
`}patterns: []  # ids from data/patterns.yaml
sources:
  - title: TODO
    publisher: TODO
    url: ${url || 'https://TODO'}
    date: ${date}
    type: ${url && /(x|twitter)\.com|bsky\.app/.test(url) ? 'primary' : 'reporting'}  # primary | reporting | analysis
# response: >-
#   The company's or person's own account, if they gave one.
# note: >-
#   Your commentary. It is shown labeled as commentary.
`;

await writeFile(file, template);
console.log(`created ${path.relative(process.cwd(), file)}`);
if (url) {
  console.log('capturing the first source…');
  spawnSync(process.execPath, [path.join(path.dirname(new URL(import.meta.url).pathname), 'capture.mjs'), url, '--entry', id], { stdio: 'inherit' });
}
console.log('\nNext: fill in the TODOs, then run "npm run build".');
