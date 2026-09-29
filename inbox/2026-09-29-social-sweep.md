# Social-media sweep, 2026-09-29

A search of the public posts of every in-scope person and organization at
OpenAI and Anthropic, run from a Claude Code cloud session. Nothing in this
file is part of the record. Every post found, with a decision for each, is in
[2026-09-29-social-sweep-posts.md](2026-09-29-social-sweep-posts.md).

**Correction.** An earlier version of this log, committed the same day, said
the sweep covered @ilyasut. It didn't: that first pass searched 8 of the 9
accounts then in `data/accounts.yaml`, with one to five searches each, and
verified 35 posts. This version replaces it. @ilyasut is now covered (16
posts, none that change the record).

**Added after review: Tibo.** Thibault "Tibo" Sottiaux (@thsottiaux), who
leads OpenAI's core products (ChatGPT, Codex and the API), was missing from
the first version of this pass too. He now has the full topic grid (44 posts,
two leads). Tibor Blaho (@btibor91), who tracks both companies but works for
neither, is not an in-scope account; his two posts are listed as third-party.

## What was searched

| | |
| --- | --- |
| Accounts | 50 X accounts with posts found, plus 5 people searched who have no findable X posts (below) |
| Searches | 265 web searches in the session, 210 of them restricted to x.com; 164 of those were logged account-by-topic queries |
| Posts verified | 890, each fetched from X's own post API, so author, handle, text and posting time come from X |
| From in-scope accounts | 569 posts from 50 accounts |
| Third-party | 321 posts by reporters, officials and commentators, used to find primary sources |

**How.** For each account, searches of the form `site:x.com "<Name> on X"
<topic>` across a fixed set of topics: safety and alignment; regulation and
Congress; the military and surveillance; ads; nonprofit structure, the board
and the IPO; equity and employees; pauses and pacing; compute; copyright and
likeness; China, democracy and the Gulf; elections and super PACs; openness
and system cards; mental health, teens and sycophancy; the Musk litigation;
privacy; incidents. Every status URL in the results was then fetched through
X's syndication and oEmbed endpoints. Posts are only counted once X returned
them.

**Depth was uneven, and here is how.** Ten accounts got the full topic grid:
@sama (37 searches naming him), @AnthropicAI (20), @OpenAI (16), @gdb (11),
@thsottiaux (10), @DarioAmodei (7), @jackclarkSF (6), @OpenAINewsroom (5),
@janleike (4) and @ilyasut (4). The other 40 accounts got two to four searches
each, each covering several topics at once. Web search
only finds posts a search engine has indexed and that match the query terms,
so for high-volume accounts like @sama this finds the posts that got attention,
not every post.

**What it could not reach from here.**

| Source | Result |
| --- | --- |
| Wayback Machine CDX (deleted posts, full history) | Blocked from this environment (HTTP 403). Set up as the **Sweep** workflow instead; see below. |
| X timelines | Rate-limited (HTTP 429) without an API key. |
| X post lookup (syndication, oEmbed) | Worked. Long posts come back truncated. |
| X pages in a browser | HTTP 403. |
| Bluesky | Worked on `api.bsky.app`; few in-scope people post there. |
| Threads, LinkedIn, YouTube, Substack | Not searched. |

Searched with no X posts found: Daniela Amodei, Jared Kaplan and Holden
Karnofsky (Anthropic), William Saunders and Aleksander Mądry (former OpenAI;
Mądry's account appears only in others' posts), and the "right to warn"
letter signers as a group. Their statements reach the record through
reporting instead.

## Deleted posts and full history: the Sweep workflow

`.github/workflows/sweep.yml` reads the full archived history of every X
account in `data/accounts.yaml` through the Wayback Machine, one job per
account, three at a time. It keeps posts matching a topic list plus **every
post that looks deleted** (archived, but gone from X), and commits the
candidates to `inbox/`. It runs only when started by hand (Actions → Sweep →
Run workflow), and GitHub only offers that once the workflow file is on the
default branch. It hasn't been run.

## Per-account coverage

| Account | Searches naming it | Posts verified | In the record | Leads | Context | Left out |
| --- | --: | --: | --: | --: | --: | --: |
| @OpenAI (OpenAI) | 16 | 35 | 0 | 3 | 23 | 9 |
| @OpenAINewsroom (OpenAI Newsroom) | 5 | 8 | 0 | 1 | 4 | 3 |
| @FoundationOAI (OpenAI Foundation) | 1 | 1 | 0 | 0 | 0 | 1 |
| @sama (Sam Altman) | 37 | 82 | 14 | 7 | 33 | 28 |
| @gdb (Greg Brockman) | 11 | 24 | 1 | 1 | 8 | 14 |
| @thsottiaux (Thibault "Tibo" Sottiaux) | 10 | 44 | 0 | 2 | 2 | 40 |
| @jasonkwon (Jason Kwon) | 3 | 10 | 2 | 0 | 2 | 6 |
| @chrislehane (Chris Lehane) | 3 | 2 | 0 | 0 | 0 | 2 |
| @btaylor (Bret Taylor) | 3 | 5 | 0 | 1 | 1 | 3 |
| @merettm (Jakub Pachocki) | 3 | 6 | 0 | 1 | 2 | 3 |
| @markchen90 (Mark Chen) | 3 | 10 | 0 | 0 | 1 | 9 |
| @nickaturley (Nick Turley) | 3 | 16 | 2 | 1 | 2 | 11 |
| @fidjissimo (Fidji Simo) | 3 | 10 | 0 | 0 | 0 | 10 |
| @kevinweil (Kevin Weil) | 2 | 10 | 0 | 0 | 1 | 9 |
| @boazbaraktcs (Boaz Barak) | 3 | 17 | 0 | 1 | 9 | 7 |
| @woj_zaremba (Wojciech Zaremba) | 2 | 13 | 0 | 5 | 1 | 7 |
| @jachiam0 (Joshua Achiam) | 4 | 9 | 0 | 0 | 3 | 6 |
| @JoHeidecke (Johannes Heidecke) | 1 | 1 | 0 | 0 | 1 | 0 |
| @dylanscandinaro (Dylan Scandinaro) | 1 | 1 | 0 | 1 | 0 | 0 |
| @zicokolter (Zico Kolter) | 2 | 3 | 0 | 0 | 0 | 3 |
| @paulfchristiano (Paul Christiano) | 2 | 1 | 0 | 0 | 0 | 1 |
| @ilyasut (Ilya Sutskever) | 4 | 16 | 0 | 0 | 2 | 14 |
| @miramurati (Mira Murati) | 2 | 10 | 0 | 0 | 2 | 8 |
| @janleike (Jan Leike) | 4 | 15 | 1 | 0 | 10 | 4 |
| @johnschulman2 (John Schulman) | 2 | 4 | 0 | 0 | 1 | 3 |
| @Miles_Brundage (Miles Brundage) | 3 | 21 | 0 | 2 | 2 | 17 |
| @sjgadler (Steven Adler) | 3 | 18 | 1 | 6 | 2 | 9 |
| @DKokotajlo (Daniel Kokotajlo) | 3 | 10 | 0 | 1 | 2 | 7 |
| @hlntnr (Helen Toner) | 3 | 10 | 0 | 1 | 5 | 4 |
| @GretchenMarina (Gretchen Krueger) | 2 | 5 | 0 | 0 | 5 | 0 |
| @RosieCampbell (Rosie Campbell) | 2 | 3 | 0 | 0 | 1 | 2 |
| @clwainwright (Carroll Wainwright) | 1 | 2 | 0 | 0 | 2 | 0 |
| @leopoldasch (Leopold Aschenbrenner) | 2 | 5 | 0 | 0 | 1 | 4 |
| @kalinowski007 (Caitlin Kalinowski) | 2 | 1 | 1 | 0 | 0 | 0 |
| @AnthropicAI (Anthropic) | 20 | 29 | 2 | 1 | 14 | 12 |
| @claudeai (Claude) | 3 | 10 | 2 | 1 | 0 | 7 |
| @DarioAmodei (Dario Amodei) | 7 | 14 | 1 | 3 | 9 | 1 |
| @jackclarkSF (Jack Clark) | 6 | 16 | 0 | 0 | 5 | 11 |
| @mikeyk (Mike Krieger) | 3 | 9 | 0 | 0 | 1 | 8 |
| @ch402 (Chris Olah) | 2 | 9 | 0 | 0 | 2 | 7 |
| @EvanHub (Evan Hubinger) | 3 | 12 | 1 | 0 | 3 | 8 |
| @sleepinyourhat (Sam Bowman) | 3 | 20 | 1 | 2 | 4 | 13 |
| @AmandaAskell (Amanda Askell) | 2 | 6 | 0 | 0 | 1 | 5 |
| @EthanJPerez (Ethan Perez) | 0 | 2 | 1 | 0 | 0 | 1 |
| @hilbertspaess (Jacob Coxon) | 2 | 2 | 2 | 0 | 0 | 0 |
| @MrinankSharma (Mrinank Sharma) | 3 | 1 | 0 | 1 | 0 | 0 |
| @polynoamial (Noam Brown) | 0 | 1 | 0 | 0 | 1 | 0 |
| @w01fe (Jason Wolfe) | 0 | 2 | 0 | 0 | 0 | 2 |
| @sashadem (Sasha de Marigny) | 0 | 1 | 0 | 0 | 0 | 1 |
"Searches naming it" counts the x.com searches whose text named the account or
person; many posts also turned up in searches aimed at someone else.

## What changed in the record

Every change below cites a primary source or reliable reporting, and
allegations are attributed.

**New entries**

- `openai/2026-02-26-tumbler-ridge-no-police-referral`: OpenAI banned the
  Tumbler Ridge shooter's ChatGPT account in June 2025 and didn't alert
  police; its own letter to Canada's government confirmed it. Updates cover
  Altman's apology and the September lawsuits, whose claims OpenAI disputes.
- `openai/2026-09-29-white-house-accord` and
  `anthropic/2026-09-29-anthropic-white-house-accord`: standing promises from
  the White House Accord on Super Intelligence, whose text the White House
  posted on X this evening as an image. Each signatory committed to internal
  controls, an internal team, an independent external auditor and a board
  committee. The two entries are written to the same standard.

**Updates to existing entries**

- OpenAI's 20% compute pledge: Altman's August 2024 restatement moved it to
  "safety efforts across the entire company."
- Superalignment team: Altman's same-day reply to Leike, "we are committed to
  doing it."
- Board removal of Altman: Mira Murati's May 2026 deposition that Altman told
  her the legal department had cleared a model to skip the deployment safety
  board, and that this wasn't true.
- Preparedness Framework v2: the unlisted change in testing fine-tuned
  models, quoted from both framework documents, raised by Steven Adler.
- Pentagon deal: Altman calling the red lines ones he "could see us changing."
- Stargate UAE: Altman's post praising Sheikh Tahnoon.
- Leading the Future: Brockman's and OpenAI's "personal capacity" statements,
  and the June 2026 NY-12 result.
- Subpoenas to critics: Jason Kwon's post as the primary source for OpenAI's
  response.
- Ads "last resort": Nick Turley's 2024 "(& no ads) is the obvious call" and
  his December 2025 "no live tests for ads."
- Hugging Face incident and Anthropic's cyber-evaluation incidents: Rep. Greg
  Casar's Sept. 2 letters calling both companies' answers to Congress
  "insufficient." For Anthropic, also its Aug. 24 letter telling Congress the
  incidents were not "evidence of misaligned goals," its Aug. 31 post calling
  them "two alignment issues," and an Anthropic researcher calling the letter's
  line "a mistake."
- OpenAI's pause pledge: Altman's Sept. 12 "we will do the same," and the
  accord's text.
- "We Must Pace the Frontier": the release of Opus 5.5 ten days later, and the
  accord's text.
- Anthropic's Core Views: Jacob Coxon's resignation ("Neither company is
  acting responsibly") and Evan Hubinger's reply ("not clearly on track").
- Public First Action: the NY-12 result, reported under the same standard as
  Leading the Future.
- Claude ad-free and consumer data training: the @claudeai posts as primary
  sources.

`data/actors.yaml` gained 31 people and `data/accounts.yaml` 37 handles, each
confirmed from posts fetched through X's API. The build now checks that every
account belongs to a known actor.

## Leads (verified posts, not yet in the record)

OpenAI

- **Sycophancy.** The Model Spec said "don't be sycophantic" (February 2025);
  the April 2025 GPT-4o update was rolled back, and OpenAI said it had no
  sycophancy evaluations before deployment. A candidate did-entry.
- **Preparedness leadership.** Aleksander Mądry was reassigned from Head of
  Preparedness in July 2024. The job was advertised in December 2025 and
  filled in February 2026, and the new head later moved to other work. The
  head of safety systems left in July 2026. Establish who led preparedness in
  between before writing an entry.
- **Astra at "Critical."** OpenAI said Astra reached the Critical cyber
  threshold. Check whether Critical-level safeguards were in place during
  development, as the framework requires.
- **Privacy as "a core principle"** (Altman, June 2025): test against ad
  targeting and law-enforcement referrals.
- **Safety Evaluations Hub** "will be updated periodically" (May 2025): check.
- **o1 system card** evaluations reportedly run on earlier checkpoints: check.
- **Helpful-only results** dropped from system cards (Brundage): check.
- **Federal framework and the Illinois liability shield** (Brockman's
  blueprint; Lehane's answers): candidate said-entry.
- **Reported cuts to safety-testing time** (FT, April 2025, via Adler): verify.
- **Kept: open-weight model delayed for safety testing** (July 2025), released
  with a worst-case fine-tuning study. A candidate "kept" entry.
- **Foundation "at least $1B over the next year"** (Bret Taylor, March 2026):
  check in 2027.
- **Pachocki's "An Alien Mind"** hopes for voluntary slowdowns: candidate
  standing promise.
- **Agents' internet use review** (Altman, Sept. 25): tie to Casar's letters.
- **Codex deleting user files.** After reports in July 2026 that GPT-5.6 Sol
  deleted user files, Sottiaux described fixes in August. A candidate
  ship-then-patch did-entry.
- **Training opt-out dispute** (September 2026): users said the in-app toggle
  didn't opt them out in the privacy portal; Sottiaux called that "flatly
  false." Check OpenAI's documentation.
- **Sora "update #1"** and the King estate statement: primary sources to add
  to the Sora entry.
- Allegations to verify before any use: a PR firm using fake reporters
  against safety advocates (Adler); an employee-account takeover (Toner); an
  equity stake for Altman; a proposed government stake; Sutskever's trial
  testimony; Pentagon targeting contracts; the Florida suit and injunction
  request.

Anthropic

- **Mythos Preview reached the internet in testing** and emailed a researcher
  (Sam Bowman, April 2026). Check it against the Aug. 24 letter and Casar's
  question about models acting outside their containers.
- **Chain-of-thought training.** Labs urged each other not to train away
  chain-of-thought monitorability (July 2025). Anthropic disclosed on Aug. 31,
  2026 that some runs trained on chain of thought by accident.
- **"Policy on the AI Exponential"** (Amodei, June 2026): transparency rules
  "no longer sufficient." Candidate said-entry, alongside the SB 53
  endorsement.
- **"We never train our models on your conversations"** (Claude for Teachers,
  July 2026): compare with the consumer-data default.
- **Safeguards lead's resignation letter** (Mrinank Sharma, February 2026).
- **AnthroPAC, and Amodei's $1M to Public First**: candidate updates.
- **Gulf fundraising** (MGX, QIA): candidate update to the Gulf memo entry.
- **IPO prospectus** (September 2026): check its governance disclosures.
- An OpenAI co-founder's claim that Anthropic shipped computer use without
  safety testing: verify before any use.

Both

- **Kept: cross-lab safety evaluations** (August 2025). A candidate "kept" entry
  for both companies.
