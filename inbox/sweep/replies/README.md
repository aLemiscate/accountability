# Reply context (workstream 4)

Every reply by a company account or executive in the Twitter reading log was
re-read next to the post it answered, and given a decision. Finished
October 13, 2026.

## Files

- `parents.jsonl`: one row per reply (9,021), with the reply's text and,
  where it could be retrieved, the post it answered (`parent_text`,
  `parent_author`, `parent_date`) and any quoted post.
- `decisions.jsonl`: one row per reply, with `code` and, for anything other
  than O, a `note`. `parent_read` says whether the parent was available.
  Leads that were later resolved carry a `resolution`.

Codes are the ones used in the Twitter reading:
**R** led to a record change, **L** is a lead to check, **C** is context
worth keeping (used in notes or as background for an entry), **O** is
nothing for the record.

## Counts

| | Replies | Parent not retrievable | C | R | L open |
| --- | --: | --: | --: | --: | --: |
| OpenAI accounts (17) | 5,318 | 774 | 213 | 0 | 0 |
| Anthropic accounts (9) | 3,703 | 802 | 185 | 5 | 0 |
| **Total (26 accounts)** | **9,021** | **1,576** | **398** | **5** | **0** |

Jack Clark's 2,866 replies are counted under Anthropic, but 1,268 of them date
from before 2021, when he was OpenAI's policy director, and 840 from 2021, the
year Anthropic was founded. Largest accounts: jackclarkSF 2,866, gdb 2,282,
sama 1,608, OpenAI 652, AnthropicAI 548, kevinweil 214, OpenAIDevs 203, npew
201, claudeai 136, bcherny 114. The other 16 accounts have 52 replies or
fewer each.

For the 1,576 replies whose parent could not be retrieved (deleted,
protected, or never archived), the decision rests on the reply and the
surrounding thread.

## What changed in the record

- **New entry:** `anthropic/2022-12-19-cai-interface-data-release`.
  Anthropic said in December 2022 it would release the data from its
  Constitutional AI testing experiment, as it had for red teaming. No release
  was found; graded broken.
- **Updates:**
  - `anthropic/2025-11-04-model-weight-preservation`: Opus 3 kept available
    after retirement (kept). This also corrected
    `anthropic/2025-08-model-retirement-notice-cut`.
  - `openai/2019-05-03-gpt-2-staged-release`: Jack Clark's 2022 remark that
    his GPT-2 disinformation worry was "way too early".
  - `anthropic/2025-03-06-anthropic-powerful-ai-late-2026`: Clark's March
    2026 breakdown of the timeline ("Smarter than a nobel prize winner" at
    "huge error bars? 20%?").
  - `anthropic/2026-04-23-claude-code-quality-postmortem`: two Claude Code
    changelog fixes for a one-hour prompt cache falling back to five minutes,
    which the postmortem didn't mention.
- **Notes:** Clark's August 2022 description of industry policy work
  ("follow the birdie", "move the overton window") was added to the
  statements-versus-filings section of `inbox/lobbying/README.md`, next to
  Anthropic's lobbying growth.

Most C notes are regulation statements, early standards set by people who
later ran these companies (for example Clark in 2021 on companies that
answered criticism "by misdirecting, spinning, or gaslighting", or on dataset
disclosure), and company replies
that are already the said side of existing entries.

## Leads and how they were resolved

| Lead | Resolution |
| --- | --- |
| Brockman, July 2019: Microsoft's $1 billion is "a cash investment" and "not Azure credits" | MIT Technology Review (2020) reported it was "split between cash and credits to Azure". Neither company confirmed the terms. One report with unnamed sources on a low-stakes detail: no entry. |
| Anthropic, Dec 2022: will release the Constitutional AI experiment data | Not released. New entry. |
| Pachocki, Feb 2026: OpenAI will "publish more information next week" on First Proof | Kept: OpenAI posted an updated report on Feb. 20 (five proofs likely correct, problem 2 withdrawn, an appendix of prompt patterns). The earlier triage had already ruled out an entry, since he corrected the claim within a day. |
| Cherny, Apr 2026: Claude Code prompt cache said to drop from one hour to five minutes | Partly borne out by two changelog fixes (Apr. 14 and May 5). Added as an update. |

## Errors found and fixed during the reading

The first pass mapped notes to ids by hand. A check of every note against the
text of the post it is attached to found 49 notes on the wrong post: in
self-threads, the quote from the parent had been written onto the reply's id.
They were moved to the post that contains the quoted text, and the posts left
behind were re-coded. From batch r030 on, notes were attached by matching a
fragment of the reply text, not by hand. Seventeen notes still don't match
their own post's text. They are intentional: each quotes the parent, or
quotes across line breaks.
