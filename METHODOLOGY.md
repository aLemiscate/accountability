# Methodology

This record is meant to be hard to dismiss. Everything below serves that goal.

## What goes in

- **Said**: a public principle, commitment, claim or denial made by OpenAI or
  Anthropic, or by someone speaking for them.
- **Did**: an action, reversal, policy rewrite, disclosure or outcome that
  bears on something said.

Claims are not limited to safety and ethics. Any notable public claim or
promise counts when it can be checked against what happened, including:

- capability and benchmark claims ("PhD-level", "solved open problems",
  launch-day charts);
- promised features and release dates ("in the coming weeks", "later this
  year");
- usage limits, pricing and what a plan includes, and changes to them;
- promises about how a product behaves ("we never degrade models", "no silent
  changes", "no ads like that");
- dated predictions by company leaders.

Promises that were kept go in as well as ones that were not. Minor product
churn (a button moved, a bug fixed in a day) does not.

A "did" entry links to the statements it contradicts (`contradicts`). That
link is the receipt. Actions that set up a pattern without contradicting a
specific statement (a defense partnership, a data-policy default) can stand on
their own with `patterns` or `related`.

## Who is in scope

- The two organizations.
- People speaking in a **public or official capacity**: executives, founders,
  board members, spokespeople, and staff who speak publicly about the
  company's mission, products, safety or policy.
- Former staff, when their public statements are the evidence (a resignation
  post, testimony).

Out of scope: private individuals, private or locked accounts, family members,
personal lives, and anything unrelated to the company's conduct. Each person
in `data/actors.yaml` has a `basis` field saying why they are in scope.

## Evidence

1. **Every entry has at least one source.** Prefer the primary source: the
   company's own post, the original social post, a transcript or filing.
   Reporting is labeled `reporting`, and interpretation is labeled `analysis`.
2. **Quotes are verbatim.** Use `…` for omissions. A paraphrase goes in
   `summary`, never in `quote`. When a source has a snapshot, the build checks
   the quote against the captured text and marks matches on the site.
3. **Capture at citation time.** Run `npm run capture -- <url> --entry <id>`
   so the page, a screenshot, hashes and a Wayback copy exist even if the
   original changes.
4. **Attribute allegations.** "Fortune reported that…", "Vox published
   documents showing…". Don't state a contested claim as settled fact.
5. **Dates carry their precision.** `2024-05` means "sometime in May 2024",
   and time gaps computed from it are shown as approximate (`~`).

## Fairness

- **Right of reply.** Record the company's or person's own account in
  `response` whenever one exists, even if it's unpersuasive.
- **Commentary is labeled.** Opinion goes in `note`, which the site shows
  under "Commentary", separate from the facts.
- **Same standard for both companies.** An entry about either one needs the
  same quality of sourcing.
- **Record kept promises.** When a commitment is tested and holds, mark it
  `kept`. A record that only counts failures is easier to dismiss.
- **Corrections are public.** Fix mistakes in a commit that says what
  changed. If an entry's status changes, add an `updates` item rather than
  rewriting history.

## Statuses (for "said" entries)

| Status | Use when |
| --- | --- |
| `open` | Still in force. Requires a `breaks_if` test. |
| `kept` | Tested under real pressure, and it held. |
| `broken` | A concrete commitment was not honored. |
| `reversed` | Explicitly withdrawn, replaced, or contradicted by a later public position. |
| `eroded` | Not formally withdrawn, but hollowed out in practice. |
| `contradicted` | A factual claim or denial that later evidence contradicts. |

## Concreteness

Vague promises can't be broken, which is often why they're written that way.
Each statement is graded on how testable it was **when it was made**:

| Grade | Meaning |
| --- | --- |
| `measurable` | Has a number, a date, or a test an outsider can check. |
| `conditional` | An if-then commitment; only as strong as whoever decides the "if". |
| `directional` | States a direction or value, with no mechanism. |
| `aspirational` | A mission-level aim that can't be failed as written. |

## Patterns and forecasts

Patterns (`data/patterns.yaml`) are analytical categories, not findings of
fact. Each pattern's "what to watch for" is a forecast based on repetition,
and the site labels it as analysis. When a forecast comes true, the new event
gets its own sourced entry. The forecast itself is never cited as evidence.
