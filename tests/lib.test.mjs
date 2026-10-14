import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseDate, periodEnd, validate, derive, loadAll, quoteSegments, normalizeForMatch, normalizeWithMap, quoteExcerpt, tallyCommitments } from '../scripts/lib.mjs';

test('parseDate accepts year, month and day precision and rejects impossible dates', () => {
  assert.equal(parseDate('2024').precision, 'year');
  assert.equal(parseDate('2024-05').precision, 'month');
  assert.equal(parseDate('2024-05-17').precision, 'day');
  assert.equal(parseDate('2024-02-30'), null);
  assert.equal(parseDate('May 2024'), null);
});

test('quote matching ignores curly quotes, case and whitespace, and splits on ellipses', () => {
  assert.equal(normalizeForMatch('We’re  “sorry”\n—really'), 'we\'re "sorry" -really');
  assert.deepEqual(quoteSegments('Claude will remain ad-free. … A conversation with Claude is not one of them.'), [
    'claude will remain ad-free.',
    'a conversation with claude is not one of them.',
  ]);
  assert.deepEqual(quoteSegments('…20% of the compute we\'ve secured…'), ['20% of the compute we\'ve secured']);
  // Some PDFs wrap every run of text in invisible bidi marks (U+202D … U+202C).
  assert.equal(normalizeForMatch('‭liability protections‬ ‭including‬'), 'liability protections including');
  // PDF text keeps typographic ligatures.
  assert.equal(normalizeForMatch('ﬁne-tuning ﬂows'), 'fine-tuning flows');
});

const base = () => ({
  site: { title: 't' },
  patterns: [{ id: 'race-clause', name: 'Race', thesis: 'x' }],
  actors: [{ id: 'openai', kind: 'org', name: 'OpenAI' }],
  entries: [
    { id: '2020-01-01-promise', file: 'a.yaml', title: 'P', date: '2020-01-01', org: 'openai', type: 'said', kind: 'commitment', quote: 'we will', status: 'broken', concreteness: 'measurable', who: ['openai'], patterns: ['race-clause'], sources: [{ title: 's', url: 'https://example.com' }] },
    { id: '2021-01-01-deed', file: 'b.yaml', title: 'D', date: '2021-01-01', org: 'openai', type: 'did', kind: 'reversal', summary: 'did not', contradicts: ['2020-01-01-promise'], sources: [{ title: 's', url: 'https://example.com/2' }] },
  ],
});

test('a well-formed record validates cleanly', () => {
  const { errors, warnings } = validate(base());
  assert.deepEqual(errors, []);
  assert.deepEqual(warnings, []);
});

test('validation catches the mistakes that matter', () => {
  const d = base();
  d.entries[0].org = 'meta';
  d.entries[0].patterns = ['nope'];
  d.entries[0].sources = [];
  d.entries[1].contradicts = ['2021-01-01-deed', 'missing'];
  const { errors } = validate(d);
  const joined = errors.join('\n');
  assert.match(joined, /org must be one of/);
  assert.match(joined, /unknown pattern "nope"/);
  assert.match(joined, /at least one source/);
  assert.match(joined, /not a "said" entry/);
  assert.match(joined, /contradicts unknown entry "missing"/);
});

test('warns when an action is dated before the statement it contradicts, and rejects self-links', () => {
  const d = base();
  d.entries[1].date = '2019-06-01';
  d.entries[1].id = '2019-06-01-deed';
  d.entries[1].related = ['2019-06-01-deed'];
  const { errors, warnings } = validate(d);
  assert.match(warnings.join('\n'), /dated before "2020-01-01-promise"/);
  assert.match(errors.join('\n'), /links to itself/);
});

test('every account belongs to a known actor and no handle is listed twice', () => {
  const d = base();
  d.accounts = [{ actor: 'openai', x: 'OpenAI' }, { actor: 'nobody', x: 'someone' }, { actor: 'openai', x: 'openai' }];
  const joined = validate(d).errors.join('\n');
  assert.match(joined, /unknown actor "nobody"/);
  assert.match(joined, /duplicate handle x:openai/);
});

test('derive pairs statements with the actions that contradict them', () => {
  const out = derive(base());
  assert.equal(out.receipts.length, 1);
  assert.equal(out.receipts[0].gap_days, 366);
  assert.deepEqual(out.entries.find((e) => e.type === 'said').contradicted_by, ['2021-01-01-deed']);
  assert.equal(out.stats.broken, 1);
});

test('a failed statement needs a receipt: a contradicting action or its own outcome', () => {
  const d = base();
  d.entries.pop();
  assert.match(validate(d).warnings.join('\n'), /is broken but has no receipt/);
  d.entries[0].outcome = { date: '2020-06', text: 'It did not happen.' };
  const { errors, warnings } = validate(d);
  assert.deepEqual(errors, []);
  assert.deepEqual(warnings, []);
  const out = derive(d);
  assert.equal(out.entries[0].outcome.precision, 'month');
  assert.equal(out.entries[0].outcome.time, Date.UTC(2020, 5, 1));
  d.entries[0].outcome = { date: 'soon', note: 'x' };
  const joined = validate(d).errors.join('\n');
  assert.match(joined, /outcome needs text/);
  assert.match(joined, /outcome.date must be/);
  assert.match(joined, /unknown field "note"/);
});

test('a due date is validated and flagged once it has passed on an open promise', () => {
  const d = base();
  d.entries.pop();
  Object.assign(d.entries[0], { status: 'open', last_checked: '2020-02-01', breaks_if: 'x', due: '2021-03' });
  assert.match(validate(d).warnings.join('\n'), /deadline \(2021-03\) has passed/);
  d.entries[0].due = '2999';
  assert.deepEqual(validate(d).warnings, []);
  d.entries[0].due = 'soon';
  assert.match(validate(d).errors.join('\n'), /due must be/);
  assert.equal(periodEnd('2027-03'), Date.UTC(2027, 3, 1) - 1);
  assert.equal(periodEnd('2027'), Date.UTC(2028, 0, 1) - 1);
});

const doc = () => ({
  id: 'pledge', file: 'c.yaml', title: 'Pledge', date: '2023-07-21', parties: ['openai'],
  sources: [{ title: 's', url: 'https://example.com/3' }],
  entries: ['2020-01-01-promise'],
  commitments: [
    { id: 'a', text: 'we will a', grades: { openai: { grade: 'kept', evidence: 'did a', entries: ['2021-01-01-deed'] } } },
    { id: 'b', text: 'we will b', grades: { openai: { grade: 'unknown', evidence: 'not public' } } },
    { id: 'c', text: 'we will c', grades: { openai: { grade: 'eroded', evidence: 'weakened', sources: [{ title: 's', url: 'https://example.com/4' }] } } },
  ],
});

test('a graded commitment document validates and tallies per company', () => {
  const d = base();
  d.commitments = [doc()];
  const { errors, warnings } = validate(d);
  assert.deepEqual(errors, []);
  assert.deepEqual(warnings, []);
  assert.deepEqual(tallyCommitments(d.commitments[0]), { openai: { total: 3, kept: 1, standing: 0, eroded: 1, broken: 0, unknown: 1 } });
  assert.equal(derive(d).commitments[0].tally.openai.kept, 1);
});

test('commitment validation catches missing grades, bad grades and unsupported verdicts', () => {
  const d = base();
  const c = doc();
  c.commitments[1].id = 'a';
  c.commitments[1].grades.openai.grade = 'mostly';
  c.commitments[2].grades = {};
  c.commitments.push({ id: 'd', text: 'we will d', grades: { openai: { grade: 'broken', evidence: 'said so' }, anthropic: { grade: 'kept', evidence: 'x' } } });
  d.commitments = [c];
  const { errors, warnings } = validate(d);
  const joined = errors.join('\n');
  assert.match(joined, /duplicate id/);
  assert.match(joined, /grade must be one of/);
  assert.match(joined, /no grade for openai/);
  assert.match(joined, /graded for anthropic, which is not a party/);
  assert.match(warnings.join('\n'), /grade "broken" cites no entry or source/);
});

test('the published record has no validation errors', async () => {
  const data = await loadAll();
  const { errors } = validate(data);
  assert.deepEqual(errors, []);
});

test('open promises carry a full last-checked date that is not before the promise', () => {
  const d = base();
  d.entries[0].status = 'open';
  d.entries[0].breaks_if = 'they stop';
  d.entries.pop();
  assert.match(validate(d).warnings.join('\n'), /last checked/);
  d.entries[0].last_checked = '2026-10';
  assert.match(validate(d).errors.join('\n'), /last_checked must be a full date/);
  d.entries[0].last_checked = '2019-12-31';
  assert.match(validate(d).errors.join('\n'), /earlier than the entry date/);
  d.entries[0].last_checked = '2026-10-13';
  const { errors, warnings } = validate(d);
  assert.deepEqual(errors, []);
  assert.deepEqual(warnings, []);
});

test('industry context on a pattern needs text and a dated, attributed source', () => {
  const ok = base();
  ok.patterns[0].industry = { text: 'Another lab did the same.', sources: [{ title: 's', publisher: 'p', url: 'https://example.com/i', date: '2025-01-02', type: 'reporting' }] };
  assert.deepEqual(validate(ok).errors, []);
  const bad = base();
  bad.patterns[0].industry = { text: '', sources: [{ title: 's', url: 'https://example.com/i' }] };
  const { errors } = validate(bad);
  assert.ok(errors.some((m) => /industry needs text/.test(m)));
  assert.ok(errors.some((m) => /source needs a date/.test(m)));
  assert.ok(errors.some((m) => /source needs a publisher/.test(m)));
  const none = base();
  none.patterns[0].industry = { text: 'x' };
  assert.ok(validate(none).errors.some((m) => /at least one source/.test(m)));
});

test('normalizeWithMap matches normalizeForMatch and points back to the original text', () => {
  const raw = '  Sam said:\n“We will never  run ﬁne ads” — really.';
  const { text, map } = normalizeWithMap(raw);
  assert.equal(text, normalizeForMatch(raw));
  assert.equal(map.length, text.length);
  const at = text.indexOf('we will');
  assert.equal(raw[map[at]], 'W');
});

test('quoteExcerpt returns the passage around a quote with each part marked', () => {
  const raw = 'Opening words. Sam said: “We will never\nrun ads like that.” Closing words come after the quote.';
  const parts = quoteExcerpt(raw, 'We will never run ads like that.', 400);
  assert.deepEqual(parts, ['Opening words. Sam said: “', 'We will never run ads like that.', '” Closing words come after the quote.']);
  const cut = quoteExcerpt(`${'lead '.repeat(100)}First part of it. Middle. Second part here. ${'tail '.repeat(100)}`, 'First part … Second part', 20);
  assert.equal(cut.length, 5);
  assert.equal(cut[1], 'First part');
  assert.equal(cut[3], 'Second part');
  assert.ok(cut[0].startsWith('…') && cut[4].endsWith('…'));
  assert.equal(quoteExcerpt(raw, 'words that are not there'), null);
});

test('link-preview cards pair a statement with what became of it, and use the site\'s logos', async () => {
  const { cardFor, describe, span, LOGO } = await import('../scripts/cards.mjs');
  const { readFile } = await import('node:fs/promises');
  const said = { id: 's', type: 'said', org: 'openai', date: '2020-01-01', time: Date.UTC(2020, 0, 1), title: 'S', quote: 'We will.', status: 'broken', contradicted_by: ['d'], contradicts: [] };
  const did = { id: 'd', type: 'did', org: 'openai', date: '2021-01-01', time: Date.UTC(2021, 0, 1), title: 'They did not.', contradicts: ['s'], contradicted_by: [] };
  const byId = new Map([[said.id, said], [did.id, did]]);
  for (const e of [said, did]) {
    const c = cardFor(e, byId);
    assert.equal(c.left.text, 'We will.');
    assert.equal(c.right.text, 'They did not.');
    assert.equal(c.gap, '12 months later');
  }
  assert.match(describe(said, byId), /^Broken\. Said Jan 1, 2020: We will\. Did Jan 1, 2021/);
  const edit = { id: 'r', type: 'did', org: 'anthropic', date: '2022-03-04', time: Date.UTC(2022, 2, 4), title: 'Edited', revision: { before: 'Old.', after: 'New.' }, contradicts: [], contradicted_by: [] };
  assert.equal(describe(edit, new Map([['r', edit]])), 'Before: Old. After (edited Mar 4, 2022): New.');
  assert.equal(span(10), '10 days');
  assert.equal(span(1400), '3.8 years');
  const app = await readFile(new URL('../site/app.js', import.meta.url), 'utf8');
  for (const [org, d] of Object.entries(LOGO)) assert.ok(app.includes(d), `site/app.js has the same ${org} logo`);
});
