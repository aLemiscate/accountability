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
- `post.txt` and `post.json`: for X and Bluesky links, the post text from the public embed APIs, which work without logging in. For X, `syndication.json` adds the full text of long posts and the text of any quoted post, and attached photos are saved as `media-1.jpg`, `quoted-media-1.jpg` and so on, because some statements (a signed letter, a memo screenshot) exist only as an image
- `document.pdf` and `document.txt`: for PDFs, the file and its text (the text needs `pdftotext` from poppler-utils). Files over 10 MB are not stored; `meta.json` keeps their size and SHA-256 under `omitted`, so a copy fetched later can still be checked
- `meta.json`: HTTP status, capture time, SHA-256 hashes of every file, and for posts the exact time of posting (read from the X post id)
- a Wayback Machine copy, whose link goes into the entry's `archive` field

With `--entry`, the archive link and snapshot path are written into the matching
source in that entry, or added as a new source. At build time, each quote is
checked word for word against the text of its snapshots, and matched quotes get
a "Matched to source snapshot" mark on the site.

To fill gaps across the whole record:

```sh
npm run capture -- --snapshot-missing   # full snapshot of every source without one
npm run capture -- --archive-missing    # Wayback copy of every source without one
# both accept --dry-run to preview, --limit N to pace, and --match <regex> to
# take only sources whose URL matches, e.g. --match '^https://(x\.com|www\.anthropic\.com)/'
```

A URL cited by several entries is captured once and linked from all of them,
including sources cited inside `updates`.

Error pages (blocked, not found, rate-limited) are never saved as evidence. A
capture that gets nothing readable leaves no snapshot behind.

**Where to run captures.** A snapshot can only be taken from a machine that can
reach the source. Your own computer works, and so do GitHub's runners: the
**Capture** workflow (*Actions → Capture → Run workflow*) snapshots every
missing source and commits the results. Claude Code cloud sessions only reach
the hosts their environment's network policy allows; see
[Working in Claude Code cloud sessions](#working-in-claude-code-cloud-sessions).

Anonymous Wayback saves are rate-limited. Free archive.org keys
(<https://archive.org/account/s3.php>) set as `IA_ACCESS_KEY` and
`IA_SECRET_KEY` make saving faster and more reliable.

## Finding posts

`data/accounts.yaml` lists the public X and Bluesky accounts of in-scope people
and organizations. `find-posts` collects their posts into `inbox/` for you to
triage:

```sh
npm run find-posts -- --account sama --from 2023 --to 2024 --match "safety|regulat|nonprofit"
npm run find-posts -- --all --from 2026-09 --match "ads|military|pause"
```

It combines three sources:

- **Wayback Machine (free, no key).** It lists every X post URL the archive has captured for the account, under every URL form X has used (twitter.com, mobile.twitter.com, `/statuses/`, x.com), **including posts that have since been deleted**. The post date comes from the post's id, so dates are exact even without the text. Text comes from X's embed data (the full text of long posts, the post it quotes, who it replies to), or from the archived copy when the live post is gone. A post that is archived but returns 404 live is flagged *possibly deleted*. Posts nobody archived can't be found this way.
- **X API** (set `X_BEARER_TOKEN`). The account's recent timeline, up to about the last 3,200 posts. What a token can read depends on its X API access tier.
- **Bluesky** (for accounts with a `bluesky` handle). The public API, which searches without logging in; set `BSKY_HANDLE` and `BSKY_APP_PASSWORD` (an app password, not your main password) for higher limits.

For a full-history pass, `--corpus --limit all` reads every archived post of
the account and keeps all of them, not just the ones that match:

```sh
npm run find-posts -- --account sama --corpus --via wayback --limit all --budget-minutes 320 --match "safety|nonprofit"
npm run sweep-coverage
```

- `inbox/sweep/<account>.jsonl`: every post found, one per line, newest first.
  A later run reads only posts it hasn't read, so it's safe to stop and resume.
- `inbox/sweep/<account>.md`: the posts matching `--match`, plus every post
  that looks deleted, for triage.
- `inbox/sweep/<account>.coverage.json` and `inbox/sweep/COVERAGE.md`: how
  many posts each account has made on X, how many are archived, and how many
  of those have been read.

`--budget-minutes` stops reading when time runs out and leaves the rest marked
unread. `--concurrency` sets how many posts are read at once (default 3). The
Wayback Machine blocks many cloud IP ranges, so run this from the **Sweep**
workflow below or from your own machine.

Posts already cited in the record are marked, so the inbox shows only what's
new. Nothing is added to the record automatically. When a post belongs,
`npm run new -- … --url <post>` starts the entry and snapshots the post.

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

If the text changes for a mechanical reason, such as a fix to the text
extractor, accept the new text without recording an edit:
`npm run watch-pages -- --rebaseline "why"`. The reason goes into
`watch/<id>/history.json`.

`npm run check-sources` checks every cited link and flags anything **gone**. On
X, a 404 from the embed API means the post was deleted or the account went
private. Deleted posts are worth recording too. Results go to
`reports/source-health.md`.

## Automation (GitHub Actions)

- **Site** (`.github/workflows/site.yml`) runs on every push: it validates, builds and tests the record, then publishes to GitHub Pages from the default branch. One-time setup: *Settings → Pages → Source: GitHub Actions*.
- **Watch** (`.github/workflows/watch.yml`) runs every Monday and on demand. It re-reads watched pages, checks sources, collects the last two weeks of posts from watched accounts into `inbox/`, snapshots up to 20 sources that don't have a snapshot yet, archives unarchived sources (when the archive.org secrets are set), commits the results, and **opens an issue whenever a watched page changes**.
- **Capture** (`.github/workflows/capture.yml`) runs on demand. It snapshots every source that doesn't have a snapshot yet. Run it once to backfill the whole record.
- **Sweep** (`.github/workflows/sweep.yml`) runs on demand. It reads the full archived history of every X account in `data/accounts.yaml` (and the X API timeline when an `X_BEARER_TOKEN` secret is set), one job per account, keeps every post in `inbox/sweep/`, lists topic matches and deleted posts for triage, and writes `inbox/sweep/COVERAGE.md`. Each account reads for up to the run's time budget and saves its place; run it again to continue where it stopped. Nothing is added to the record automatically.

Optional repository secrets (*Settings → Secrets and variables → Actions*):
`IA_ACCESS_KEY` and `IA_SECRET_KEY` (archive.org), `X_BEARER_TOKEN` (X API),
`BSKY_HANDLE` and `BSKY_APP_PASSWORD` (Bluesky).

## Working in Claude Code cloud sessions

`.claude/hooks/session-start.sh` runs at the start of each cloud session. It
installs dependencies and makes the headless browser trust the session's
network proxy, so screenshots work there.

Which sites a cloud session can reach is set by its environment's network
access (*environment menu in the session title bar → Edit → Network access*).
To let Claude capture, archive and search posts directly, choose full access,
or allow at least these hosts:

| Purpose | Hosts |
| --- | --- |
| Archiving and deleted-post search | `web.archive.org`, `archive.org` |
| X posts | `x.com`, `twitter.com`, `publish.twitter.com`, `api.x.com` |
| Bluesky | `bsky.app`, `public.api.bsky.app`, `api.bsky.app`, `bsky.social` |
| Company pages | `openai.com`, `cdn.openai.com`, `model-spec.openai.com`, `darioamodei.com` |
| Reporting cited in the record | the news sites in `reports/source-health.md` |

Even with full network access, some sites refuse cloud IP addresses. In
September 2026, `web.archive.org` reset connections from cloud sessions,
`openai.com` returned 403 to both plain requests and the headless browser, and
`x.com` pages returned 403 to the browser (the X embed APIs still worked). Use
the Capture and Watch workflows on GitHub's runners for those sources.


## Layout

```
data/
  entries/openai/*.yaml      one file per event
  entries/anthropic/*.yaml
  patterns.yaml              recurring patterns: thesis, tells, what to watch for
  actors.yaml                who is in scope, and why
  watch.yaml                 pages the watcher re-reads
  accounts.yaml              X / Bluesky accounts that find-posts reads
  site.yaml                  name, tagline, repo and site URLs
site/                        the static site (index.html, styles.css, app.js)
scripts/                     build, capture, new-entry, find-posts, check-sources, watch-pages, serve
snapshots/                   captured evidence
inbox/                       candidate posts waiting for triage
watch/                       page-text baselines and diffs
tests/                       node --test suites
```

## Standards

See [METHODOLOGY.md](METHODOLOGY.md): who is in scope, what counts as evidence,
how statuses are assigned, and how corrections work.
