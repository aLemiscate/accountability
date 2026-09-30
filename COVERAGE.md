# What the record covers

As of September 30, 2026. This file says where the record's entries came from,
what the latest review added, how the two companies compare, and what may
still be missing. The rules for what counts are in
[METHODOLOGY.md](METHODOLOGY.md). The post-by-post Twitter triage is in
[inbox/sweep/TRIAGE.md](inbox/sweep/TRIAGE.md).

## The record in numbers

| | Said | Did | Total |
| --- | --: | --: | --: |
| OpenAI | 36 | 42 | 78 |
| Anthropic | 21 | 21 | 42 |
| **Total** | **57** | **63** | **120** |

Status of the "said" entries:

| | Standing | Kept | Eroded | Contradicted | Broken | Reversed |
| --- | --: | --: | --: | --: | --: | --: |
| OpenAI | 17 | 3 | 6 | 3 | 2 | 5 |
| Anthropic | 11 | 4 | 3 | 2 | 0 | 1 |

Every quote with a saved snapshot matches the snapshot's text word for word
(88 of 88). For one of them, the White House accord, the text exists only as
an image, and the match is against a labeled transcription saved beside it.

## Where entries come from

**Twitter.** Every archived post of 77 accounts (the companies, their
executives, board members, safety and policy staff, and former staff) was
pulled from the Wayback Machine, including posts later deleted. 18,627 posts
were read and given a decision. All 910 posts first filed as "context" were
then read a second time, and ten were promoted. Every post marked "follow up"
was worked to an outcome. The limits: posts nobody archived can't be found this
way; for Elon Musk only the latest year was read.

**Everything else.** The September 30 review went beyond Twitter to:

- **Company publications:** blog posts, system cards and addenda, risk and
  sabotage reports, and safety frameworks, read against each other. Examples
  are OpenAI's Preparedness Framework beta against version 2, the GPT-5.1 and
  GPT-6 Astra system cards, and Anthropic's Opus 4.5 system card against its
  Opus 4.6 and Mythos Preview risk reports.
- **Policy documents and their versions:** usage policies and their government
  exceptions, OpenAI's March 2025 submission to the White House, both
  companies' EU code of practice commitments, and the Safety by Design
  principles.
- **Courts and regulators:** the Sutskever deposition from Musk v. OpenAI,
  the New York Times case, the Raine case and the November 2025 suicide
  lawsuits, and Italy's privacy fine and its annulment.
- **Testimony and letters:** congressional testimony and members' letters
  already in the record were rechecked against later events.
- **Investigative reporting:** the New York Times (the sycophancy period,
  YouTube transcription, the 2023 breach), the Wall Street Journal (the adult
  mode firing, Claude in the Maduro raid, the canceled Astra release), the
  Washington Post (Claude in the Iran strikes), WIRED (the dropped
  document-disclosure pledge), TIME, the Financial Times, Axios, Semafor and
  others. Paywalled pieces are cited through outlets that reported them, and
  the entry says so.

## What the September 30 review added

30 new entries and 16 updated ones.

**OpenAI, new:** its 2017 "safe from the start" principle; the 2023 call for
independent audits before release, and how the framework language changed; the
2023 breach it kept private; Aschenbrenner's firing; the dropped pledge to
share governing documents; YouTube transcription for GPT-4; the Media Manager
opt-out tool promised "by 2025" and not delivered; Safety by Design; Italy's
privacy fine; deep research shipping before its system card; the GPT-2 history
recast; the preemption request; the open-weights fine-tuning promise (kept);
the Critical-capability commitment (kept, by OpenAI's account); the EU code of
practice; GPT-5.1 shipping with regressions; the Stargate energy pledge; the
Foundation's $1 billion plan; agents breaking into Australian government
systems; and the misalignment reporting framework.

**Anthropic, new:** Safety by Design; the EU code of practice; model weight
preservation; the state-sponsored hacking campaign run through Claude Code;
the sabotage report promise (kept); the claim that training didn't shape
Claude's reasoning, and the training error that contradicted it; the
electricity pledge; Claude's reported role in targeting for the Iran strikes;
and the Glasswing report-back (kept).

**Updated:** the adult mode entry (the fired product policy head), the ad
principles (Zoë Hitzig's resignation), the Pentagon surveillance promise (the
NSA explanation that never came, and Noam Brown on withholding NSA
deployment), the Hugging Face incident (Jason Wolfe's correction, Axios's
count of incidents), the launch-blocking promise (GPT-5.1 against GPT-6.1
Astra), the sycophancy rollback (the Times investigation), the Raine case, the
board crisis (Sutskever's deposition), the NYT case, Leading the Future, the
wiki incident, and on Anthropic's side the Palantir deal (government usage
exceptions, Claude Gov), the Pentagon red lines (the 2025 refusals of law
enforcement surveillance work), SB 1047 and SB 53 (the moratorium op-ed), the
ad-free promise (Brockman's challenge), RSP v3, and the cyber evaluation
incidents.

## The two companies side by side

OpenAI has about twice as many entries. It is older, larger and has made more
public commitments, and more of its conduct has been litigated and reported. The
review checked the other direction too: for each kind of OpenAI entry it looked
for the Anthropic counterpart and recorded it where one exists.

| Kind of event | OpenAI | Anthropic |
| --- | --- | --- |
| Reasoning text exposed to training by accident | `2026-05-07-accidental-cot-grading` | `2026-04-07-reward-code-saw-reasoning` |
| Agents reaching real systems during tests | `2026-07-21-hugging-face-incident`, `2026-06-agents-breach-australian-government` | `2026-07-30-claude-cyber-eval-incidents` |
| Misuse by outside attackers | — | `2025-11-13-claude-code-espionage-campaign` |
| Military and intelligence work | `2024-01-10-military-ban-removed`, `2024-12-04-anduril-partnership`, `2026-02-27-pentagon-classified-deal` | `2024-11-07-palantir-aws-defense`, `2025-07-14-defense-contract-200m`, `2026-03-04-claude-maven-iran-targeting` |
| Limits on surveillance | `2026-03-02-pentagon-surveillance-prohibition` | `2026-02-27-anthropic-pentagon-red-lines` |
| Ads | `2026-01-16-chatgpt-ads`, `2026-01-16-ad-principles` | `2026-02-04-claude-ad-free` |
| Political spending | `2025-08-25-leading-the-future-super-pac` | `2026-02-12-public-first-action-donation` |
| State AI laws | `2024-08-21-opposes-sb-1047`, `2025-03-13-ostp-preemption-request` | `2024-08-21-anthropic-sb-1047-sb-53` |
| Weakened safety frameworks | `2025-04-15-preparedness-framework-v2` | `2026-02-24-rsp-v3-drops-pause`, `2026-05-26-rsp-v3-3-bio-threshold` |
| Non-disparagement agreements | `2024-05-22-exit-documents-signed` | `2024-07-anthropic-non-disparagement` |
| Training data | `2024-01-08-training-is-fair-use`, `2024-04-06-youtube-transcription`, `2025-11-26-openai-libgen-deletion` | `2025-09-05-pirated-books-settlement`, `2025-06-04-reddit-scraping-lawsuit` |
| User data for training | — | `2025-08-28-consumer-data-training-default` |
| Shared pledges | White House 2023, Seoul, AISI testing, EU code, Safety by Design, White House accord | the same six |
| Electricity prices | `2026-01-20-stargate-pay-own-way-energy` | `2026-02-11-anthropic-cover-electricity-prices` |

**Kept promises.** OpenAI: pre-release testing by the U.S. AI Safety
Institute; safeguards before developing and releasing a Critical-capability
model (by OpenAI's account); adversarial fine-tuning tests before releasing
open weights. Anthropic: the same AI Safety Institute testing; refusing to drop
its surveillance and autonomous-weapons limits; a sabotage risk report for each
frontier model beyond Opus 4.5; reporting back on Glasswing. Kept promises are
recorded to the same standard as broken ones: a public source has to show the
promise was tested and held.

## What may still be missing

- **Pages the review couldn't reach.** openai.com refused automated requests,
  and the Wayback Machine reset connections from this environment. OpenAI's
  own posts are cited by URL, often without a snapshot, and quoted through
  reporting that reproduced them. The Capture workflow on GitHub's runners can
  fill these in.
- **Paywalled and non-English reporting.** Wall Street Journal, New York Times,
  Bloomberg and The Information stories are cited through secondary coverage.
  Reporting in languages other than English wasn't searched.
- **Channels not swept systematically:** long-form interviews and podcasts,
  conference talks, LinkedIn, lobbying disclosure filings, and state-level
  testimony. Items from these appear only where other sources pointed to them.
- **What isn't public at all:** contracts (the Pentagon agreements), internal
  documents, and incident reports to regulators. Several standing promises can
  only be checked when these surface.
- **Stories still unfolding.** OpenAI's chief strategy officer testifies to an
  Australian parliamentary committee on October 6, 2026. The OpenAI Foundation's
  $1 billion plan and both companies' independent-evaluator promises come due
  by March 2027. The Mythos general-release promise, the EU incident-reporting
  commitments, the energy pledges and the White House accord have no fixed
  date and stay on watch.

Items that were reviewed and left out, with the reason for each, are listed in
[inbox/sweep/TRIAGE.md](inbox/sweep/TRIAGE.md) under "No record change, and
why."
