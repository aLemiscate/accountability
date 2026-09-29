// Shared loading, validation and derivation for the Said/Did record.
import { readFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const DATA = path.join(ROOT, 'data');
export const ENTRIES = path.join(DATA, 'entries');

export const ORGS = ['openai', 'anthropic'];
export const TYPES = ['said', 'did'];
export const KINDS = {
  said: ['principle', 'commitment', 'claim', 'denial', 'policy'],
  did: ['action', 'reversal', 'revision', 'disclosure', 'outcome'],
};
export const STATUSES = ['open', 'kept', 'broken', 'reversed', 'eroded', 'contradicted'];
export const CONCRETENESS = ['measurable', 'conditional', 'directional', 'aspirational'];
export const SOURCE_TYPES = ['primary', 'reporting', 'analysis', 'archive'];

const ENTRY_KEYS = new Set([
  'title', 'date', 'org', 'type', 'kind', 'who', 'venue', 'quote', 'summary',
  'concreteness', 'status', 'breaks_if', 'contradicts', 'related', 'patterns',
  'sources', 'response', 'note', 'updates', 'revision',
]);
const SOURCE_KEYS = new Set(['title', 'publisher', 'url', 'date', 'type', 'archive', 'snapshot']);

const DATE_RE = /^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?$/;

/** Parse YYYY, YYYY-MM or YYYY-MM-DD into { iso, precision, time } or null. */
export function parseDate(value) {
  const m = DATE_RE.exec(String(value ?? ''));
  if (!m) return null;
  const [, y, mo = '01', d = '01'] = m;
  const time = Date.UTC(+y, +mo - 1, +d);
  const check = new Date(time);
  if (check.getUTCFullYear() !== +y || check.getUTCMonth() !== +mo - 1 || check.getUTCDate() !== +d) return null;
  const precision = m[3] ? 'day' : m[2] ? 'month' : 'year';
  return { iso: String(value), precision, time };
}

export async function readYaml(file) {
  const text = await readFile(file, 'utf8');
  const doc = YAML.parseDocument(text, { prettyErrors: true });
  if (doc.errors.length) throw new Error(`${path.relative(ROOT, file)}: ${doc.errors[0].message}`);
  return doc.toJS();
}

async function walk(dir) {
  const out = [];
  for (const dirent of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, dirent.name);
    if (dirent.isDirectory()) out.push(...(await walk(full)));
    else if (/\.ya?ml$/.test(dirent.name)) out.push(full);
  }
  return out.sort();
}

export async function loadAll() {
  const [site, patterns, actors] = await Promise.all([
    readYaml(path.join(DATA, 'site.yaml')),
    readYaml(path.join(DATA, 'patterns.yaml')),
    readYaml(path.join(DATA, 'actors.yaml')),
  ]);
  const files = await walk(ENTRIES);
  const entries = [];
  for (const file of files) {
    const data = (await readYaml(file)) ?? {};
    entries.push({ id: path.basename(file).replace(/\.ya?ml$/, ''), file: path.relative(ROOT, file), ...data });
  }
  return { site, patterns, actors, entries };
}

/**
 * Validate everything. Returns { errors, warnings, unarchived }, where
 * unarchived lists entries with no archived copy of any source yet.
 */
export function validate({ patterns, actors, entries }) {
  const errors = [];
  const warnings = [];
  const unarchived = [];
  const err = (e, msg) => errors.push(`${e.file ?? e.id}: ${msg}`);
  const warn = (e, msg) => warnings.push(`${e.file ?? e.id}: ${msg}`);

  const patternIds = new Set();
  for (const p of patterns) {
    if (!p.id || !p.name || !p.thesis) errors.push(`patterns.yaml: pattern ${p.id ?? '?'} needs id, name and thesis`);
    if (patternIds.has(p.id)) errors.push(`patterns.yaml: duplicate pattern id ${p.id}`);
    patternIds.add(p.id);
  }
  const actorIds = new Set();
  for (const a of actors) {
    if (!a.id || !a.name || !a.kind) errors.push(`actors.yaml: actor ${a.id ?? '?'} needs id, name and kind`);
    if (actorIds.has(a.id)) errors.push(`actors.yaml: duplicate actor id ${a.id}`);
    if (a.kind === 'person' && !a.basis) errors.push(`actors.yaml: ${a.id} needs a basis (why this person is in scope)`);
    actorIds.add(a.id);
  }

  const byId = new Map();
  for (const e of entries) {
    if (byId.has(e.id)) err(e, `duplicate id ${e.id} (also ${byId.get(e.id).file})`);
    byId.set(e.id, e);
  }

  const checkSource = (e, s, where) => {
    if (!s || typeof s !== 'object') return err(e, `${where}: source must be a mapping`);
    for (const k of Object.keys(s)) if (!SOURCE_KEYS.has(k)) warn(e, `${where}: unknown source field "${k}"`);
    if (!s.title) err(e, `${where}: source needs a title`);
    if (!/^https?:\/\//.test(s.url ?? '')) err(e, `${where}: source needs an http(s) url`);
    if (s.type && !SOURCE_TYPES.includes(s.type)) err(e, `${where}: source type must be one of ${SOURCE_TYPES.join(', ')}`);
    if (s.date && !parseDate(s.date)) err(e, `${where}: bad source date "${s.date}"`);
    if (s.archive && !/^https?:\/\//.test(s.archive)) err(e, `${where}: archive must be a URL`);
  };

  for (const e of entries) {
    for (const k of Object.keys(e)) if (!ENTRY_KEYS.has(k) && k !== 'id' && k !== 'file') warn(e, `unknown field "${k}"`);
    if (!e.title) err(e, 'missing title');
    const d = parseDate(e.date);
    if (!d) err(e, `date must be YYYY, YYYY-MM or YYYY-MM-DD (got "${e.date}")`);
    else if (!e.id.startsWith(String(e.date))) warn(e, `filename should start with the entry date (${e.date})`);
    if (!ORGS.includes(e.org)) err(e, `org must be one of ${ORGS.join(', ')}`);
    if (!TYPES.includes(e.type)) err(e, `type must be "said" or "did"`);
    else if (!KINDS[e.type].includes(e.kind)) err(e, `kind for a "${e.type}" entry must be one of ${KINDS[e.type].join(', ')}`);
    if (!e.quote && !e.summary) err(e, 'needs a quote or a summary');
    if (e.quote && typeof e.quote !== 'string') err(e, 'quote must be text');

    for (const who of e.who ?? []) if (!actorIds.has(who)) err(e, `unknown actor "${who}" (add it to data/actors.yaml)`);
    for (const p of e.patterns ?? []) if (!patternIds.has(p)) err(e, `unknown pattern "${p}" (see data/patterns.yaml)`);

    if (!Array.isArray(e.sources) || e.sources.length === 0) err(e, 'needs at least one source');
    else e.sources.forEach((s, i) => checkSource(e, s, `sources[${i}]`));
    if (Array.isArray(e.sources) && e.sources.length && !e.sources.some((s) => s.archive || s.snapshot)) {
      unarchived.push(e.id);
    }

    if (e.type === 'said') {
      if (!STATUSES.includes(e.status)) err(e, `status must be one of ${STATUSES.join(', ')}`);
      if (!CONCRETENESS.includes(e.concreteness)) err(e, `concreteness must be one of ${CONCRETENESS.join(', ')}`);
      if (e.status === 'open' && !e.breaks_if) warn(e, 'open promises should say what would count as breaking them (breaks_if)');
      if (e.contradicts?.length) err(e, '"contradicts" belongs on the "did" entry, pointing back at what was said');
    } else if (e.type === 'did') {
      if (e.status || e.concreteness) warn(e, 'status/concreteness only apply to "said" entries');
      for (const id of e.contradicts ?? []) {
        const target = byId.get(id);
        if (!target) err(e, `contradicts unknown entry "${id}"`);
        else if (target.type !== 'said') err(e, `contradicts "${id}", which is not a "said" entry`);
      }
      if (!e.contradicts?.length && !e.related?.length && !e.revision && !e.patterns?.length) {
        warn(e, 'does not connect to anything (add contradicts, related, revision or patterns)');
      }
    }
    for (const id of e.related ?? []) if (!byId.has(id)) err(e, `related to unknown entry "${id}"`);

    (e.updates ?? []).forEach((u, i) => {
      if (!parseDate(u.date)) err(e, `updates[${i}]: bad date "${u.date}"`);
      if (!u.text) err(e, `updates[${i}]: needs text`);
      (u.sources ?? []).forEach((s, j) => checkSource(e, s, `updates[${i}].sources[${j}]`));
    });
    if (e.revision && (!e.revision.before || !e.revision.after)) err(e, 'revision needs both before and after');
  }
  return { errors, warnings, unarchived };
}

const DAY = 86400000;

/** Turn validated data into the shape the site consumes. */
export function derive({ site, patterns, actors, entries }) {
  const sorted = [...entries].sort((a, b) => parseDate(a.date).time - parseDate(b.date).time || a.id.localeCompare(b.id));
  const out = sorted.map((e, i) => {
    const { file, ...rest } = e;
    const d = parseDate(e.date);
    return {
      ...rest,
      exhibit: i + 1,
      file,
      time: d.time,
      precision: d.precision,
      who: e.who ?? [],
      patterns: e.patterns ?? [],
      contradicts: e.contradicts ?? [],
      related: e.related ?? [],
      contradicted_by: [],
    };
  });
  const byId = new Map(out.map((e) => [e.id, e]));
  const receipts = [];
  for (const did of out.filter((e) => e.type === 'did')) {
    for (const saidId of did.contradicts) {
      const said = byId.get(saidId);
      said.contradicted_by.push(did.id);
      const approx = said.precision !== 'day' || did.precision !== 'day';
      receipts.push({ said: said.id, did: did.id, gap_days: Math.round((did.time - said.time) / DAY), approx, org: said.org });
    }
  }
  receipts.sort((a, b) => byId.get(a.did).time - byId.get(b.did).time);

  const said = out.filter((e) => e.type === 'said');
  const count = (pred) => said.filter(pred).length;
  const gaps = receipts.map((r) => r.gap_days).sort((a, b) => a - b);
  const median = gaps.length ? (gaps.length % 2 ? gaps[(gaps.length - 1) / 2] : Math.round((gaps[gaps.length / 2 - 1] + gaps[gaps.length / 2]) / 2)) : null;

  return {
    site,
    generated: new Date().toISOString(),
    patterns,
    actors,
    entries: out,
    receipts,
    stats: {
      entries: out.length,
      said: said.length,
      did: out.length - said.length,
      receipts: receipts.length,
      broken: count((e) => ['broken', 'reversed', 'eroded', 'contradicted'].includes(e.status)),
      open: count((e) => e.status === 'open'),
      kept: count((e) => e.status === 'kept'),
      median_gap_days: median,
    },
  };
}

/** Normalize text for quote matching: case, curly quotes, dashes, whitespace. */
export function normalizeForMatch(s) {
  return String(s)
    .toLowerCase()
    .replace(/[\u2018\u2019\u201b\u2032]/g, "'")
    .replace(/[\u201c\u201d\u201f\u2033]/g, '"')
    .replace(/[\u2010-\u2015\u2212]/g, '-')
    .replace(/[\u200b-\u200d\ufeff]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** The parts of a quote that must each appear verbatim ("…" marks an omission). */
export function quoteSegments(quote) {
  return String(quote)
    .split(/\u2026|\.\.\./)
    .map((part) => normalizeForMatch(part).replace(/^[\s.,;:]+|[\s,;:]+$/g, ''))
    .filter((part) => part.length >= 3);
}

const SNAPSHOT_TEXT_FILES = ['page.txt', 'rendered.txt', 'post.txt'];

/**
 * Check each entry's quote against the text of the snapshots attached to its
 * sources. Sets entry.quote_check = { status: 'matched' | 'not-found', snapshot }
 * when the entry has both a quote and at least one snapshot.
 */
export async function checkQuotes(entries) {
  const cache = new Map();
  const textOf = async (dir) => {
    if (!cache.has(dir)) {
      let text = '';
      for (const f of SNAPSHOT_TEXT_FILES) {
        const file = path.join(ROOT, dir, f);
        if (existsSync(file)) text += `\n${await readFile(file, 'utf8')}`;
      }
      cache.set(dir, normalizeForMatch(text));
    }
    return cache.get(dir);
  };
  for (const e of entries) {
    if (!e.quote) continue;
    const dirs = [...(e.sources ?? []), ...(e.updates ?? []).flatMap((u) => u.sources ?? [])]
      .map((s) => s.snapshot)
      .filter((d) => d && existsSync(path.join(ROOT, d)));
    if (!dirs.length) continue;
    const segments = quoteSegments(e.quote);
    let matched = null;
    for (const dir of dirs) {
      const text = await textOf(dir);
      if (segments.every((seg) => text.includes(seg))) { matched = dir; break; }
    }
    e.quote_check = matched ? { status: 'matched', snapshot: matched } : { status: 'not-found', snapshots: dirs };
  }
  return entries;
}
