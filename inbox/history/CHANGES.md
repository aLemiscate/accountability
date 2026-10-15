# Policy page history (workstream 3)

Every archived version of both companies' usage policies, terms, privacy
policies, pricing pages, usage-limit help pages and model-retirement pages,
compared in order. For each page the Internet Archive's captures were pulled,
captures with identical text were merged into versions, and each version was
compared with the one before it. Each substantive change is logged with its
date (the two captures it falls between, when the page itself gives no date)
and whether it was announced. Finished October 13, 2026.

Since October 15, 2026 the page-by-page log is kept in
[`data/policy-changes.yaml`](../../data/policy-changes.yaml), where the build
checks every quoted phrase against the archived texts, and the site shows it
under Policy changes. This file keeps the summary, the method and what
couldn't be done.

The archived texts are in `inbox/history/<page>/`: `index.json` lists every
capture and version, and each version's text is `<sha>.txt`.

## Pages and versions

| Company | Page | Archived copies | Distinct versions | Span |
| --- | --- | --: | --: | --- |
| OpenAI | API pricing | 448 | 157 | 2021-11 to 2026-06 |
| OpenAI | API data controls | 210 | 44 | 2023-03 to 2026-10 |
| OpenAI | Business terms / Services Agreement | 72 | 24 | 2023-11 to 2026-09 |
| OpenAI | ChatGPT pricing | 361 | 223 | 2024-01 to 2026-10 |
| OpenAI | Data controls help articles | 497 | 292 | 2021-11 to 2026-10 |
| OpenAI | API deprecations | 87 | 30 | 2025-12 to 2026-10 |
| OpenAI | Enterprise limits (help) | 31 | 26 | 2024-03 to 2026-10 |
| OpenAI | Enterprise privacy | 103 | 30 | 2023-08 to 2026-10 |
| OpenAI | GPT-4 access and limits (help) | 213 | 97 | 2023-03 to 2025-08 |
| OpenAI | GPT-5 limits (help) | 65 | 57 | 2025-08 to 2026-07 |
| OpenAI | Legacy model access (business) | 17 | 14 | 2025-08 to 2026-07 |
| OpenAI | Reasoning-model limits (help) | 89 | 55 | 2024-09 to 2026-02 |
| OpenAI | ChatGPT Plus (help) | 133 | 80 | 2023-02 to 2026-10 |
| OpenAI | Privacy policy (U.S.) | 374 | 89 | 2021-05 to 2026-10 |
| OpenAI | API rate limits | 67 | 18 | 2025-12 to 2026-10 |
| OpenAI | Privacy policy (rest of world) | 75 | 20 | 2024-07 to 2026-10 |
| OpenAI | Team/Business limits (help) | 34 | 26 | 2024-03 to 2026-10 |
| OpenAI | Terms of use | 333 | 85 | 2021-05 to 2026-10 |
| OpenAI | Usage policies | 252 | 34 | 2023-04 to 2026-10 |
| Anthropic | API pricing | 183 | 65 | 2024-03 to 2026-10 |
| Anthropic | Data retention, organizations (help) | 79 | 39 | 2023-07 to 2026-10 |
| Anthropic | Claude Code with Pro/Max (help) | 60 | 31 | 2025-06 to 2026-04 |
| Anthropic | Commercial terms | 54 | 8 | 2024-02 to 2026-10 |
| Anthropic | Data retention, consumer (help) | 66 | 29 | 2025-04 to 2026-10 |
| Anthropic | Consumer terms | 148 | 42 | 2024-03 to 2026-10 |
| Anthropic | Data retention, covered models (help) | 20 | 11 | 2026-06 to 2026-10 |
| Anthropic | Model deprecations | 102 | 47 | 2024-09 to 2026-10 |
| Anthropic | Max plan usage (help) | 45 | 19 | 2025-04 to 2026-01 |
| Anthropic | Consumer pricing | 281 | 104 | 2025-05 to 2026-10 |
| Anthropic | Privacy policy | 151 | 30 | 2024-02 to 2026-10 |
| Anthropic | Claude Pro usage (help) | 62 | 28 | 2023-09 to 2025-07 |
| Anthropic | API rate limits | 114 | 58 | 2024-05 to 2026-10 |
| Anthropic | Usage policy | 82 | 20 | 2024-03 to 2026-10 |
| **OpenAI** | **19 pages** | **3,461** | **1,401** | |
| **Anthropic** | **14 pages** | **1,447** | **531** | |
| **Total** | **33 pages** | **4,908** | **1,932** | |

## How the changes were disclosed

| | Changes logged | Announced | Dated or noted on the page | No date, note or announcement found | Not applicable |
| --- | --: | --: | --: | --: | --: |
| OpenAI | 135 | 42 | 43 | 44 | 6 |
| Anthropic | 75 | 17 | 29 | 28 | 1 |

"Announced" means a post on the company's Twitter accounts, a blog post,
release notes, an email to users or an in-product notice was found.
"Dated or noted on the page" means the page itself carried a new date, a
changelog or a note about the change. The next column is changes made with
no new date, no note on the page and no announcement found. "No announcement
found" means none turned up in the companies' Twitter posts (read in full for
the Twitter reading), their blogs and release notes where they could be
reached, or a news search; it does not prove none was made. "Not
applicable" is wording, typo and layout fixes. One more OpenAI change is in
the log but not in these counts: the April 2026 Pro usage tiers on the
ChatGPT pricing page, whose prices aren't in the archived text, so how it was
made known wasn't checked.

## Changes made without notice, by direction

Of the changes made with no new date, note or announcement, these cut what
users get or what the company had promised. Sorting them is a judgment;
the others in that column add something (OpenAI 7, Anthropic 4) or are
neither (OpenAI 12, Anthropic 13), and every one is in the page logs below.

**OpenAI (25 of 44)**

- 2023-03 to 2023-06: GPT-4 cap for ChatGPT Plus from "100 messages every 4 hours" to "25 messages every 3 hours."
- 2023-03-02: free API trial credit for new accounts cut from $18 to $5.
- 2023-04-06: API page drops the option for low-risk enterprise customers to "request to not have API data stored at all."
- 2023-04-23: "We remove any personally identifiable information" from training data becomes "we also use PII filtering techniques to reduce" it.
- 2023-06 to 2023-08: GPT-4 API: "We are unable to accommodate requests for rate limit increases."
- 2023-08-08 to 2023-08-11: "by the end of July 2023" for GPT-4 API access becomes "soon" after the date had passed.
- 2024-01-12 to 2024-01-17: ChatGPT Team, launched three days earlier with "No training on your data," becomes "excluded from training by default."
- 2024-02-20 to 2024-02-26: GPT-4 API access needs $5 of payments instead of $1.
- 2024-09-23 to 2024-11-03: enterprise privacy page: "We do not train on your business data" becomes "by default," with an opt-in exception.
- 2024-09-24: help article: "We don’t use content from our business offerings ... to train our models" becomes "By default, we do not train on any inputs or outputs from our products for business users."
- 2024-10-30 to 2024-11-10: ChatGPT Enterprise loses "Unlimited" on the pricing page.
- 2024-12 to 2025-04: Enterprise help page: "no usage caps" becomes "Most mainline models ... do not have message limits."
- 2025-04-26: Data Controls FAQ drops "We don’t use data for selling our services, advertising, or building profiles of people."
- 2025-05 to 2025-06: o-series API models available to "qualified" rather than "all" paid API users.
- 2025-05-05 to 2025-05-11: nonprofit discount on ChatGPT Enterprise from 50% to 25%.
- 2025-05-15: feedback from users who opted out of training can bring "the entire conversation" into training.
- 2025-08-17 to 2025-08-30: ChatGPT Team's GPT-5 Thinking limit from "200 requests / day" to "200 requests / week" (Plus had 3,000 a week).
- 2025-11-23: no training on business data from connectors becomes "By default."
- 2026-02-07 to 2026-02-10: training article deletes "We do not use your content to market our services or create advertising profiles of you" as ads launch.
- 2026-04-24 to 2026-04-26: API abuse logs may be kept longer than 30 days when "reasonably necessary to protect our services or any third party."
- 2026-05-27 to 2026-07-02: GPT-4.5 retired from ChatGPT on June 26, 2026; the only notice found is on this page, after the fact.
- 2026-06-10 to 2026-06-23: Pro's "unlimited access to our GPT-5 models" becomes "some models have separate usage allowances."
- 2026-06-11: support conversations may be used for training.
- 2026-06-24 to 2026-07-29: Enterprise "unlimited messages with GPT-5.5 Instant" becomes "access to eligible current models."
- 2026-07-10: models can be made ineligible for zero data retention for specific customers.

**Anthropic (11 of 28)**

- 2023-08 to 2023-09: API deletion within 30 days "unless you request otherwise" becomes "unless we mutually agree otherwise."
- 2024-04-02 to 2024-04-05: Claude Pro "at least 100 messages every 8 hours" becomes "around 45 messages every 5 hours."
- 2024-10 to 2024-11: warning before the Pro limit from 7 messages left to 1.
- 2025-02-27 to 2025-03-04: the "Guaranteed Available Until" date for each model removed (every model was later kept until its date).
- 2025-05-06 to 2025-05-11: Max sessions "fairly generous" becomes a "50 sessions" a month guideline.
- 2025-08-07 to 2025-08-10: retirement notice cut from six months to 60 days.
- 2025-10-13 to 2025-10-17: retirement dates relabeled "Tentative."
- 2025-12-04: Pro users can use Opus in Claude Code only with paid extra usage.
- 2026-06-20 to 2026-07-03: "Anthropic employees cannot access your conversations unless they are flagged for potential serious harm" loosened, and the no-export tooling line removed.
- 2026-07-03 to 2026-07-14: the 30-day retention for covered models extended to "future models we release that are similarly or more capable."
- By 2026-09-01: new API organizations "may start in the Evaluation tier, with limits below the standard limits."

Counted against the size of each record (OpenAI 135 logged changes, Anthropic
75), cuts made without notice are 19% of OpenAI's changes and 15% of Anthropic's.
OpenAI's are mostly about data use (12) and usage limits or access (13);
Anthropic's about usage limits (5), model retirement (3) and data retention
(3).

## What changed in the record

- **New entries:** `openai/2024-01-05-gpt-4-plus-cap-lowered` (the GPT-4
  cap for ChatGPT Plus cut from 50 to 40 messages every 3 hours, six months
  after OpenAI announced the increase to 50);
  `anthropic/2024-04-claude-pro-allowance-lowered` ("at least 100 messages
  every 8 hours" to "around 45 messages every 5 hours");
  `anthropic/2025-08-model-retirement-notice-cut` (retirement notice cut
  from six months to 60 days); `openai/2026-06-chatgpt-pro-unlimited-allowances`
  (ChatGPT Pro, launched as "$200/month. unlimited usage," moved to per-model
  allowances in June 2026, then a halved allowance in September);
  `openai/2026-09-29-sottiaux-pro-subscription-guarantee` (the promise made
  with that cut, tracked as open).
- **Updates:** `openai/2026-01-16-ad-principles` (the help-center promise
  against advertising profiles deleted as ads launched, and the privacy
  policy's April 2026 advertising changes); `anthropic/2025-07-28-claude-weekly-limits`
  (the Max help page edits that came with the weekly caps);
  `openai/2025-10-14-chatgpt-erotica-announced` (the September 2025 usage
  policy rewrite); `anthropic/2026-02-27-anthropic-pentagon-red-lines`
  (Anthropic's October 2026 usage policy writes out its limits on autonomous
  weapons, law enforcement decisions and tracking).
- **Commitment grades** (workstream 2) set to eroded from page history:
  OpenAI's promises against advertising profiles, against targeted
  advertising, and to keep API abuse logs only 30 days unless the law
  requires longer; Anthropic's promise against targeted advertising (March
  2024), its 30-day API deletion promise (June 2026, covered models), and
  its limits on staff access to retained conversations (June–July 2026).
- **Pattern:** `openai/2025-08-13-altman-4o-plenty-of-notice` now carries
  the Shrinking Plan pattern, which until now was shown only on Anthropic
  entries although the pattern's own description ("A model removed from a
  paid plan at a new launch, then restored after complaints") is the GPT-4o
  episode.
- **Correction:** OpenAI's promise not to build advertising profiles was
  first posted in April 2023, not January 2024 as the commitment inventory
  and the ad-principles update had said; the earlier wording was dropped
  from the Data Controls FAQ in April 2025, also without a note.

## Page by page

Moved to [`data/policy-changes.yaml`](../../data/policy-changes.yaml) on
October 15, 2026. When it moved, the quote check found nine quoted phrases
that weren't word for word as the page has them, and they were corrected
there:

- OpenAI usage policies, January 2024: the builder rule on content for
  minors quoted a list item without marking the omitted list marker (now
  "including: … Sexually explicit").
- OpenAI business terms, November 2023: "Copyright Shield" is the name
  OpenAI announced, not the terms' wording, so it is no longer in quote marks.
- OpenAI privacy policy, November 2024: the page says changes are published
  with "an updated version and effective date"; "with" was inside the quote.
- OpenAI privacy policy, April 2026: the dropped sentence read "we do not
  'sell' Personal Data or 'share' Personal Data for cross-contextual
  behavioral advertising"; the log had left out "'sell' Personal Data or".
- OpenAI enterprise privacy page, September to November 2024: the opt-in
  exception's parenthetical is now marked as omitted rather than
  paraphrased.
- Anthropic usage policy, September 2023: the section is "Prohibited Business
  Use Cases", not "Prohibited Business Cases".
- Anthropic privacy policy, March 2024: the page says "We will not use your
  Inputs or Outputs to train our models," which the log had shortened to
  "not train our models".
- Anthropic model deprecations, September 2026: the old definition of
  "Deprecated" read "no longer available for new customers", not "not
  available for new customers".
- Anthropic API rate limits, June 2026: "no organization receives lower
  limits than before" is from the API release notes, not the rate limits
  page, so it moved to how the change was announced.

None of these changes what a log row says happened.

## Method

`walk.py` (in the session tools, not the repo) compared consecutive versions
word by word. It splits a page's versions into separate tracks when a
version differs from the previous one by more than about two thirds, so that
regional copies served at the same address (European terms, for example)
are not read as edits. Those copies were set aside, and the page notes say
how many.

That split had a flaw found late in the work: a real rewrite also starts a
new track, and the change across the rewrite was not shown. Every page was
re-checked at each such boundary, comparing the last version before it with
the first after it sentence by sentence (48 boundaries across 20 pages).
Most were already in the log, because the rewrites had been read in full.
Two were not: ChatGPT Enterprise's help page saying "ChatGPT Enterprise has
no usage caps," and the April 2023 wording of OpenAI's advertising promise.
Both are now logged.

The ChatGPT pricing page and some help articles alternate between two
layouts from one capture to the next. For those, every distinct sentence and
table cell was listed once with the first and last date it appears, and that
list was read in full.

## What could not be done

- **Platform documentation as empty shells.** OpenAI's platform
  documentation was archived from July 2023 to December 2025 as a JavaScript
  shell with no page text, so the API data controls, rate limits and
  deprecations pages could not be compared in that stretch. Anthropic's
  documentation site was archived the same way from December 2025 to August
  2026 (API pricing, rate limits, model deprecations). Where the company
  keeps its own history (Anthropic's API release notes, the deprecation
  tables on both companies' pages), that was used to fill the gap.
- **Prices missing from the text.** The ChatGPT pricing page stopped
  carrying prices in its archived text in October 2025; they load per
  region. Price changes after that could not be checked from these copies.
- **Gaps in the archive.** The Internet Archive has no copy of some pages
  for weeks or months at a time (OpenAI's GPT-4 access page between March 30
  and June 6, 2023, for example), so some changes can only be dated to a
  range. Its servers also refused or dropped connections for long stretches
  of this work; pulls were run from GitHub's runners, which reached it.
- **Changes after the last archived copy.** The archive's latest copies
  are from early October 2026. Anthropic's usage policy published October 8
  was read from the live page; OpenAI's pages could not be read live (403),
  so any OpenAI change after its last archived copy is not in this log.
- **Announcements behind a block.** OpenAI's website, help-center release
  notes and blog return 403 to this environment, so for OpenAI the check for
  an announcement relied on its Twitter accounts, news coverage and archived
  copies. A change marked "no announcement found" may have been announced
  somewhere that could not be read.
- **Regional and variant copies set aside.** Copies of European, Canadian
  or other regional versions served at the same address were set aside, not
  compared. Their own histories were not read.
- **Pages not covered.** The goal named usage policies, terms, privacy
  policies, pricing, usage-limit help pages and model-retirement pages. Other
  pages that carry commitments (OpenAI's sharing and publication policy,
  Anthropic's supported-regions policy, service-specific terms, the system
  cards) were not pulled.
