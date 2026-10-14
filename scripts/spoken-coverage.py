#!/usr/bin/env python3
"""Rebuild the coverage tables in inbox/spoken/README.md.

Reads inbox/spoken/appearances.jsonl (every appearance found) and
inbox/spoken/reading-log.jsonl (one row per appearance read) and rewrites the
text between the COVERAGE markers in the README. Run it after logging rows:

    python3 scripts/spoken-coverage.py
"""
import collections
import json
import os
import re

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
SPOKEN = os.path.join(ROOT, 'inbox', 'spoken')
START, END = '<!-- COVERAGE:START -->', '<!-- COVERAGE:END -->'

NAMES = {
    'dario-amodei': 'Dario Amodei', 'daniela-amodei': 'Daniela Amodei', 'jack-clark': 'Jack Clark',
    'jared-kaplan': 'Jared Kaplan', 'mike-krieger': 'Mike Krieger', 'sam-altman': 'Sam Altman',
    'greg-brockman': 'Greg Brockman', 'jason-kwon': 'Jason Kwon', 'fidji-simo': 'Fidji Simo',
    'nick-turley': 'Nick Turley',
}
ORG = {p: ('Anthropic' if p in ('dario-amodei', 'daniela-amodei', 'jack-clark', 'jared-kaplan', 'mike-krieger')
           else 'OpenAI') for p in NAMES}


def load(name):
    with open(os.path.join(SPOKEN, name)) as f:
        return [json.loads(line) for line in f if line.strip()]


def table(header, rows, numeric=True):
    # Right-align every column after the first when the table holds counts.
    align = ['---' if i == 0 or not numeric else '--:' for i in range(len(header))]
    out = ['| ' + ' | '.join(header) + ' |', '| ' + ' | '.join(align) + ' |']
    out += ['| ' + ' | '.join(str(c) for c in r) + ' |' for r in rows]
    return '\n'.join(out)


def main():
    found = load('appearances.jsonl')
    log = {r['id']: r for r in load('reading-log.jsonl')}
    missing = [r['id'] for r in log.values() if r['id'] not in {a['id'] for a in found}]
    if missing:
        raise SystemExit(f'log rows missing from appearances.jsonl: {missing}')

    def status(a):
        if a['id'] in log:
            return 'read'
        return 'pending' if a.get('transcript') == 'pending' else 'none'

    per = collections.defaultdict(collections.Counter)
    for a in found:
        for p in a['people']:
            per[p]['found'] += 1
            per[p][status(a)] += 1
    rows = []
    for p in NAMES:
        c = per[p]
        rows.append([f'{NAMES[p]} ({ORG[p]})', c['found'], c['read'], c['none'], c['pending']])
    tot = collections.Counter(status(a) for a in found)
    rows.append(['**All appearances**', len(found), tot['read'], tot['none'], tot['pending']])
    people = table(['Speaker', 'Found', 'Read in full', 'No transcript', 'Pending'], rows)

    kinds = collections.Counter()
    tkinds = collections.Counter()
    codes = collections.Counter()
    for a in found:
        if a['id'] in log:
            r = log[a['id']]
            kinds[a.get('kind', 'podcast')] += 1
            note = (r['transcript'].get('note') or '')
            k = r['transcript'].get('kind')
            if k == 'machine':
                k = 'machine, run locally' if 'locally' in note else 'machine, GitHub runners'
            tkinds[k] += 1
            for d in r['decisions']:
                codes[d['code']] += 1
    by_kind = table(['Kind of appearance read', 'Count'], sorted(kinds.items(), key=lambda kv: -kv[1]))
    by_transcript = table(['Transcript used', 'Count'], sorted(tkinds.items(), key=lambda kv: -kv[1]))
    labels = {'R': 'R, in the record', 'L': 'L, lead', 'C': 'C, context', 'O': 'O, left out'}
    by_code = table(['Decision', 'Count'], [[labels[c], codes[c]] for c in 'RLCO'])
    nones = [a for a in found if status(a) != 'read']
    no_rows = [[a['date'], NAMES[a['people'][0]], a['venue'], a.get('reason', '')] for a in sorted(nones, key=lambda a: a['date'])]
    no_table = table(['Date', 'Speaker', 'Venue', 'Why not read'], no_rows, numeric=False)

    block = '\n\n'.join([people, by_kind, by_transcript, by_code,
                         '**Found but not read**\n\n' + no_table])
    path = os.path.join(SPOKEN, 'README.md')
    text = open(path).read()
    new = re.sub(re.escape(START) + '.*?' + re.escape(END), START + '\n\n' + block + '\n\n' + END, text, flags=re.S)
    open(path, 'w').write(new)
    print(f'{len(found)} found, {tot["read"]} read, {tot["none"]} without a transcript, {tot["pending"]} pending')


if __name__ == '__main__':
    main()
