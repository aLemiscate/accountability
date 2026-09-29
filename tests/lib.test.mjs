import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseDate, validate, derive, loadAll, quoteSegments, normalizeForMatch } from '../scripts/lib.mjs';

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

test('the published record has no validation errors', async () => {
  const data = await loadAll();
  const { errors } = validate(data);
  assert.deepEqual(errors, []);
});
