# Said / Did

A living, sourced record of what OpenAI and Anthropic, and the people who lead
them, have said about ethics and safety, set against what they did next.

Each entry is either something **said** (a principle, commitment, claim or
denial) or something **done** (an action, reversal, policy rewrite, disclosure
or outcome). When an action contradicts an earlier statement, the two are
linked into a **receipt**, and the site shows how much time passed between the
words and the deed. Entries are tagged with recurring **patterns** (the race
clause, silent edits, mission-to-market, and so on), so repetition becomes
visible and each pattern's next occurrence can be anticipated.

The site has five views:

- **Receipts**: statement → contradicting action, with the elapsed time, plus before/after diffs of rewritten policies.
- **Timeline**: everything, in date order.
- **Patterns**: a pattern-by-year recurrence chart, with each pattern's tells and what to watch for next.
- **Watchlist**: promises still in force, each with a written "counts as broken if" test and a running age.
- **Method**: the standards the record follows.

Every entry links back to its file, so readers can check or correct it.

## Quick start

```sh
npm install
npm run build     # validate the record, write site/data.js and dist/said-did.html
npm run serve     # http://localhost:4173
```

`dist/said-did.html` is the whole site in one self-contained file, useful for
sharing or offline archiving. `npm test` runs the checks.

## Adding to the record

```sh
# 1. Start an entry (writes data/entries/<org>/<date>-<slug>.yaml with every field explained)
npm run new -- --org openai --type said --date 2026-09-29 --slug altman-podcast-safety \
               --url https://x.com/sama/status/...

# 2. Fill in the TODOs. Link actions to the statements they contradict with `contradicts:`.

# 3. Validate and rebuild
npm run build
```

Entries are plain YAML, one file per event. The fields:

| Field | For | Meaning |
| --- | --- | --- |
| `title`, `date`, `org`, `type`, `kind` | all | Headline; `YYYY`, `YYYY-MM` or `YYYY-MM-DD`; `openai` or `anthropic`; `said` or `did`; the kind of statement or action |
| `who`, `venue` | all | Actor ids from `data/actors.yaml`; where it happened |
| `quote` | all | Verbatim words only, with `…` for omissions |
| `summary` | all | Plain factual description |
| `status` | said | `open`, `kept`, `broken`, `reversed`, `eroded`, `contradicted` |
| `concreteness` | said | `measurable`, `conditional`, `directional`, `aspirational` |
| `breaks_if` | said | For open promises: what outcome would count as breaking it |
| `contradicts` | did | Ids of the earlier statements this action contradicts |
| `revision` | did | `before` / `after` text for a rewritten policy |
| `related`, `patterns` | all | Other entry ids; pattern ids from `data/patterns.yaml` |
| `sources` | all | `title`, `url`, `publisher`, `date`, `type` (`primary`/`reporting`/`analysis`), `archive`, `snapshot` |
| `response` | all | The company's or person's own account |
| `note` | all | Your commentary, shown labeled as commentary |
| `updates` | all | Later developments: `date`, `text`, `sources` |

`npm run build` refuses to publish a record with a broken link between entries,
an unknown pattern or person, a missing source, or a malformed date.

## Grabbing snapshots

Posts get deleted and policy pages get rewritten, so capture evidence when you
cite it:

```sh
npm run capture -- https://x.com/janleike/status/1791498184671605209 --entry 2024-05-17-superalignment-team-disbanded
```

This saves `snapshots/<date>-<site>-<hash>/` containing:

- `page.html` and `page.txt`: the raw page and its readable text
- `screenshot.jpg` and `rendered.txt`: a full-page screenshot and rendered text (needs `npx playwright install chromium`)
- `post.txt` and `post.json`: for X and Bluesky links, the post text from the public embed APIs, which work without logging in
- `meta.json`: HTTP status, capture time, and SHA-256 hashes of every file
- a Wayback Machine copy, whose link goes into the entry's `archive` field

With `--entry`, the archive link and snapshot path are written into the matching
source in that entry, or added as a new source. At build time, each quote is
checked word for word against the text of its snapshots, and matched quotes get
a "Matched to source snapshot" mark on the site.

To archive every source that doesn't have an archive link yet:

```sh
npm run capture -- --archive-missing          # add --dry-run to preview, --limit N to pace
```

Anonymous Wayback saves are rate-limited. Free archive.org keys
(<https://archive.org/account/s3.php>) set as `IA_ACCESS_KEY` and
`IA_SECRET_KEY` make saving faster and more reliable.

## Watching for silent edits

`data/watch.yaml` lists the pages where commitments live: charters, usage
policies, safety frameworks, privacy terms, and "we will never…" posts.

```sh
npm run watch-pages
```

The first run saves a baseline in `watch/<id>/latest.txt`. After that, any
change to the visible text is saved as `watch/<id>/<date>.txt` plus a unified
diff, `watch/<id>/<date>.diff`. Committed, these become a dated history of every
wording change.

`npm run check-sources` checks every cited link and flags anything **gone**. On
X, a 404 from the embed API means the post was deleted or the account went
private. Deleted posts are worth recording too. Results go to
`reports/source-health.md`.

## Automation (GitHub Actions)

- **Site** (`.github/workflows/site.yml`) runs on every push: it validates, builds and tests the record, then publishes to GitHub Pages from the default branch. One-time setup: *Settings → Pages → Source: GitHub Actions*.
- **Watch** (`.github/workflows/watch.yml`) runs every Monday and on demand. It re-reads watched pages, checks sources, archives unarchived sources (when the archive.org secrets are set), commits the results, and **opens an issue whenever a watched page changes**.

## Layout

```
data/
  entries/openai/*.yaml      one file per event
  entries/anthropic/*.yaml
  patterns.yaml              recurring patterns: thesis, tells, what to watch for
  actors.yaml                who is in scope, and why
  watch.yaml                 pages the watcher re-reads
  site.yaml                  name, tagline, repo and site URLs
site/                        the static site (index.html, styles.css, app.js)
scripts/                     build, capture, new-entry, check-sources, watch-pages, serve
snapshots/                   captured evidence
watch/                       page-text baselines and diffs
tests/                       node --test suites
```

## Standards

See [METHODOLOGY.md](METHODOLOGY.md): who is in scope, what counts as evidence,
how statuses are assigned, and how corrections work.
