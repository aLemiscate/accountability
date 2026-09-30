# Sweep triage

Every post the full-history sweep collected that could bear on the record was
read and given one decision. The queue for each account is its own posts (not
reposts or other people's posts) that match the account's topic filter, plus
every post the archive marks as possibly deleted. Decisions are in
[`triage/decisions.jsonl`](triage/decisions.jsonl), one line per post.

- **Record change** — the post changes the record: a new entry, a new source or
  quote for an entry, or an update.
- **Lead** — worth following up, but not usable as it stands (needs primary
  reporting, verification, or a decision about scope). Listed below.
- **Context** — relevant to an existing entry or topic but adds nothing the
  record needs; the note says which.
- **No action** — off topic, or already covered.

## How the posts were read

Most accounts were read post by post in full. For the accounts with the most
off-topic posts, a keyword filter split each queue in two: posts mentioning
the labs, their people, or safety topics were read in full, and the rest were
read as one-line excerpts (the first 90–110 characters). That applies to
@LHSummers, @chrislehane, @kalinowski007, @sashadem, @boazbaraktcs,
@AmandaAskell, @RichardMCNgo, @sleepinyourhat and @Miles_Brundage. A post that
mentions nothing on the list and says something relevant after its first
hundred characters could have been missed in those nine accounts.

Many "possibly deleted" posts have no text in the archive (the capture holds a
login page), so they could only be marked as no action. Musk's account was
swept for the latest year only. Accounts with nothing in their queue are not
listed.

## Decisions by account

| Account | Queued | Record change | Lead | Context | No action |
| --- | --: | --: | --: | --: | --: |
| [@OpenAI](OpenAI.md) | 299 | 25 | 6 | 142 | 126 |
| [@sama](sama.md) | 592 | 12 | 7 | 115 | 458 |
| [@gdb](gdb.md) | 401 | 8 | 1 | 79 | 313 |
| [@ilyasut](ilyasut.md) | 79 |  |  | 5 | 74 |
| [@janleike](janleike.md) | 112 | 1 |  | 23 | 88 |
| [@kalinowski007](kalinowski007.md) | 804 | 1 |  | 2 | 801 |
| [@AnthropicAI](AnthropicAI.md) | 338 | 4 | 16 | 158 | 160 |
| [@DarioAmodei](DarioAmodei.md) | 10 |  |  | 10 | 0 |
| [@jackclarkSF](jackclarkSF.md) | 915 | 1 | 10 | 29 | 875 |
| [@OpenAINewsroom](OpenAINewsroom.md) | 43 |  | 5 | 24 | 14 |
| [@jasonkwon](jasonkwon.md) | 22 | 3 |  | 5 | 14 |
| [@chrislehane](chrislehane.md) | 1,320 |  |  | 5 | 1,315 |
| [@btaylor](btaylor.md) | 118 |  | 1 | 1 | 116 |
| [@merettm](merettm.md) | 2 |  |  | 1 | 1 |
| [@markchen90](markchen90.md) | 18 | 1 |  | 3 | 14 |
| [@nickaturley](nickaturley.md) | 23 |  |  | 2 | 21 |
| [@fidjissimo](fidjissimo.md) | 39 | 1 |  | 2 | 36 |
| [@thsottiaux](thsottiaux.md) | 28 |  |  | 5 | 23 |
| [@kevinweil](kevinweil.md) | 172 |  |  | 6 | 166 |
| [@miramurati](miramurati.md) | 21 |  |  | 7 | 14 |
| [@woj_zaremba](woj_zaremba.md) | 104 | 1 |  | 11 | 92 |
| [@johnschulman2](johnschulman2.md) | 15 |  |  | 6 | 9 |
| [@boazbaraktcs](boazbaraktcs.md) | 608 |  |  | 18 | 590 |
| [@jachiam0](jachiam0.md) | 510 | 2 |  | 19 | 489 |
| [@JoHeidecke](JoHeidecke.md) | 13 | 6 |  | 3 | 4 |
| [@zicokolter](zicokolter.md) | 28 |  |  | 1 | 27 |
| [@paulfchristiano](paulfchristiano.md) | 5 |  |  |  | 5 |
| [@hlntnr](hlntnr.md) | 225 |  |  | 10 | 215 |
| [@Miles_Brundage](Miles_Brundage.md) | 4,233 |  | 8 | 46 | 4,179 |
| [@sjgadler](sjgadler.md) | 72 | 1 | 6 | 21 | 44 |
| [@DKokotajlo](DKokotajlo.md) | 28 |  | 1 | 8 | 19 |
| [@GretchenMarina](GretchenMarina.md) | 186 |  |  | 4 | 182 |
| [@RosieCampbell](RosieCampbell.md) | 89 |  |  |  | 89 |
| [@clwainwright](clwainwright.md) | 6 |  |  | 4 | 2 |
| [@leopoldasch](leopoldasch.md) | 221 |  | 1 | 3 | 217 |
| [@claudeai](claudeai.md) | 45 | 2 |  | 7 | 36 |
| [@mikeyk](mikeyk.md) | 46 |  | 1 |  | 45 |
| [@ch402](ch402.md) | 235 |  |  | 2 | 233 |
| [@EvanHub](EvanHub.md) | 13 |  |  | 4 | 9 |
| [@sleepinyourhat](sleepinyourhat.md) | 1,963 | 1 |  | 11 | 1,951 |
| [@EthanJPerez](EthanJPerez.md) | 54 |  |  | 2 | 52 |
| [@AmandaAskell](AmandaAskell.md) | 614 |  |  | 6 | 608 |
| [@hilbertspaess](hilbertspaess.md) | 191 |  |  | 2 | 189 |
| [@MrinankSharma](MrinankSharma.md) | 51 |  | 1 |  | 50 |
| [@OpenAIDevs](OpenAIDevs.md) | 67 |  |  | 9 | 58 |
| [@bradlightcap](bradlightcap.md) | 4 | 1 |  | 2 | 1 |
| [@adamdangelo](adamdangelo.md) | 41 |  |  | 2 | 39 |
| [@LHSummers](LHSummers.md) | 843 |  |  | 1 | 842 |
| [@elonmusk](elonmusk.md) | 73 |  | 1 | 14 | 58 |
| [@bobmcgrewai](bobmcgrewai.md) | 11 |  |  |  | 11 |
| [@npew](npew.md) | 38 |  | 1 | 2 | 35 |
| [@embirico](embirico.md) | 80 |  |  | 3 | 77 |
| [@annaadeola](annaadeola.md) | 6 |  |  |  | 6 |
| [@lilianweng](lilianweng.md) | 19 |  |  |  | 19 |
| [@joannejang](joannejang.md) | 39 |  |  | 1 | 38 |
| [@w01fe](w01fe.md) | 12 |  | 2 | 2 | 8 |
| [@polynoamial](polynoamial.md) | 127 | 2 |  | 2 | 123 |
| [@aidan_mclau](aidan_mclau.md) | 31 |  | 1 | 3 | 27 |
| [@tszzl](tszzl.md) | 6 |  |  |  | 6 |
| [@RichardMCNgo](RichardMCNgo.md) | 842 |  | 1 | 5 | 836 |
| [@JacobHHilton](JacobHHilton.md) | 14 |  |  | 10 | 4 |
| [@DanielaAmodei](DanielaAmodei.md) | 4 |  |  | 2 | 2 |
| [@NotTomBrown](NotTomBrown.md) | 55 |  |  | 1 | 54 |
| [@8enmann](8enmann.md) | 6 |  |  | 1 | 5 |
| [@samsamoa](samsamoa.md) | 38 |  |  | 3 | 35 |
| [@karpathy](karpathy.md) | 341 | 1 |  | 3 | 337 |
| [@sashadem](sashadem.md) | 742 |  |  |  | 742 |
| [@JasonDClinton](JasonDClinton.md) | 7 |  |  | 2 | 5 |
| [@logangraham](logangraham.md) | 79 |  |  | 5 | 74 |
| [@alexalbert__](alexalbert__.md) | 47 |  |  | 3 | 44 |
| [@bcherny](bcherny.md) | 28 |  | 1 | 2 | 25 |
| [@_catwu](_catwu.md) | 4 |  |  | 2 | 2 |
| [@fish_kyle3](fish_kyle3.md) | 5 |  |  | 2 | 3 |
| [@Jack_W_Lindsey](Jack_W_Lindsey.md) | 26 |  |  | 6 | 20 |
| [@TrentonBricken](TrentonBricken.md) | 81 |  |  |  | 81 |
| **Total** | **18,627** | **74** | **71** | **900** | **17,582** |

## What changed in the record

New entries:

- `2023-01-21-altman-decrease-risk-tolerance` — Altman: OpenAI "will
  continually decrease the level of risk we are comfortable taking" (eroded by
  the 2025 competitor clause).
- `2024-12-04-anduril-partnership` — OpenAI's counter-drone partnership with
  Anduril (counterpart to Anthropic's Palantir deal).
- `2025-03-10-cot-optimization-pressure` and `2026-05-07-accidental-cot-grading`
  — OpenAI's rule against grading chains of thought, and its disclosure that
  seven released models were graded by accident (same standard as Anthropic's
  classifier gap).
- `2025-04-29-gpt-4o-sycophancy-rollback` and
  `2025-05-02-behavior-issues-block-launches` — the sycophantic GPT-4o update
  shipped over expert testers' doubts, and the promise that followed.
- `2025-07-14-defense-contract-200m` (Anthropic) — the $200M Pentagon contract,
  counterpart to OpenAI's.
- `2025-07-17-chatgpt-agent-high-bio` — OpenAI's first "High" bio designation,
  counterpart to Anthropic's ASL-3 entry.
- `2026-04-07-mythos-preview-not-general` and
  `2026-06-12-fable-5-export-control-suspension` (Anthropic) — the promise not to
  release a Mythos-class model until safeguards "reliably block their most
  dangerous outputs," and the government order that pulled Fable 5 three days
  after launch.
- `2026-09-04-wiki-incident` — outside researchers found OpenAI agents using a
  German wiki as a message board; OpenAI confirmed it after the press did.
- `2026-09-12-altman-independent-evaluators` — Altman's "we will do the same,"
  held to the same deadline as Anthropic's embedded-evaluator promise.

Updated entries: Hugging Face incident (OpenAI's posts, the Aug 4 third-party
incidents, the Aug 26 report), Pentagon deal (OpenAI's thread, Altman's Q&A,
Kwon, Kalinowski's follow-up), Pentagon surveillance prohibition, GPT-4.1 (the
Safety Evaluations Hub and Heidecke's explanation), exit documents (July 2024
whistleblower policy), founding nonprofit and capped-profit LP (OpenAI's and
Brockman's own 2015 and 2019 posts), sex-bot avatar (Altman, Dec 2024), Leading
the Future (Brockman's post, Achiam), subpoenas (Achiam, Kwon), ChatGPT ads (the
Dec 2025 ad-like suggestions), ad principles (Simo), superalignment compute
(Leike), Anthropic's White House commitments edit (Jack Clark), RSP v3 (Sam
Bowman), and OpenAI's pause (its July 28 statement).

One record-change decision was carried out differently: Karpathy's post that
Fable 5 "is the same underlying model as Mythos" was replaced by Anthropic's own
statement of the same fact.

## Second look at the context decisions

All 910 posts first marked "context" were read again (September 30, 2026),
looking for statements or events the record should hold rather than just
support. Ten posts were promoted to record changes; the counts above include
them, and each one's decision line gives both the new and the first-pass note.

- OpenAI's 2017 op-ed principle, "Building advanced AI and only then making it
  safe is like building the internet and later trying to make it secure" (@OpenAI, @gdb): new entry `openai/2017-10-18-safe-from-the-start`.
- Anthropic's disclosure of a Chinese state-sponsored hacking campaign run
  largely through Claude Code (@AnthropicAI, 2 posts): new entry `anthropic/2025-11-13-claude-code-espionage-campaign`.
- OpenAI's promise to test adversarially fine-tuned versions before releasing
  open weights, and the gpt-oss paper that showed it did (@JoHeidecke, @sjgadler, @sama): new entry `openai/2025-03-31-open-weights-no-catastrophic-risk` (kept).
- Noam Brown on withholding deployment to the NSA and other intelligence
  agencies (@polynoamial, 2 posts): update on `openai/2026-03-02-pentagon-surveillance-prohibition`.

The other 900 stay context. Most are safety research announcements, product
safety features, restatements of positions already in the record, or
commentary by former staff on entries that already cite them. One
reporting lead from them, the New York Times' November 2025 investigation of
the sycophancy period, was taken up in the sweep of other channels.

## Leads and what became of them

Every post marked "follow up" was worked. Each lead below links its posts and
says what changed in the record, or why nothing did. Entry ids are file names
under `data/entries/`.

### New entries

- Claude in the Iran strikes (@elonmusk quoting a claim, [713613](https://x.com/elonmusk/status/2035828088433713613)): `anthropic/2026-03-04-claude-maven-iran-targeting`, sourced to the Washington Post, the Wall Street Journal (via Reuters) and Military Times rather than the quoted post.
- GPT-5.1 regressions and evaluations (@Miles_Brundage [674171](https://x.com/Miles_Brundage/status/1988696272480674171), @sjgadler [916683](https://x.com/sjgadler/status/1989138789755916683)): `openai/2025-11-12-gpt-5-1-ships-with-regressions`.
- GPT-2 history (@OpenAI [680236](https://x.com/OpenAI/status/1897386487068680236), @Miles_Brundage [705739](https://x.com/Miles_Brundage/status/1897426207131705739), [392230](https://x.com/Miles_Brundage/status/1897426209887392230), [600992](https://x.com/Miles_Brundage/status/1897426212546600992)): `openai/2025-03-05-gpt-2-history-recast`, checked against OpenAI's 2019 release report.
- Deep research without a system card, and o3-pro (@Miles_Brundage [774875](https://x.com/Miles_Brundage/status/1886347097571774875), [281077](https://x.com/Miles_Brundage/status/1932532943555281077), [698562](https://x.com/Miles_Brundage/status/1932547422183698562)): `openai/2025-02-02-deep-research-before-system-card`.
- Sabotage risk reports (@AnthropicAI [707696](https://x.com/AnthropicAI/status/2021397952791707696), [672557](https://x.com/AnthropicAI/status/2021397953848672557)): `anthropic/2025-11-24-sabotage-risk-reports-commitment` (kept). Reading the reports turned up `anthropic/2026-02-10-opus-4-6-reasoning-not-trained` and `anthropic/2026-04-07-reward-code-saw-reasoning`: a training error let reward code see Claude's reasoning, including for two released models. This is the Anthropic counterpart to OpenAI's accidental chain-of-thought grading.
- Electricity prices (@AnthropicAI [901314](https://x.com/AnthropicAI/status/2021694494215901314)): `anthropic/2026-02-11-anthropic-cover-electricity-prices`, plus OpenAI's earlier pledge, `openai/2026-01-20-stargate-pay-own-way-energy`.
- Aschenbrenner (@leopoldasch [330688](https://x.com/leopoldasch/status/1656340983817330688)): `openai/2024-04-aschenbrenner-fired` and `openai/2023-04-breach-kept-private`.
- Astra general availability (@sama [396515](https://x.com/sama/status/2085862292311396515)): `openai/2025-04-15-pf-critical-safeguards`, OpenAI's commitment for "Critical" models, with GPT-6 Astra as the first test (kept by OpenAI's account).
- Foundation spending (@btaylor [554334](https://x.com/btaylor/status/2036474423998554334)): `openai/2026-03-24-foundation-spend-1-billion`.
- Safety by Design (@OpenAI [748433](https://x.com/OpenAI/status/1782786891508748433)): `openai/2024-04-23-safety-by-design-child-safety` and `anthropic/2024-04-23-anthropic-safety-by-design-child-safety`.
- EU AI Pact and code of practice (@OpenAINewsroom [923238](https://x.com/OpenAINewsroom/status/1839003497569923238)): `openai/2025-07-11-eu-gpai-code-of-practice` and `anthropic/2025-07-21-anthropic-eu-gpai-code-of-practice`. The 2024 AI Pact pledges were superseded by the code, whose serious-incident reporting is the testable part.
- Mythos credits and "report back" (@AnthropicAI [900255](https://x.com/AnthropicAI/status/2041578412653900255)): `anthropic/2026-04-07-glasswing-report-back` (kept).
- Found while researching other leads: `openai/2026-06-agents-breach-australian-government` (OpenAI agents in Australian and U.S. government systems).

Resolved in earlier batches: Seoul commitments, AI Safety Institute testing,
the Safety and Security Committee, SB 1047 and SB 53 (@jackclarkSF, @npew,
@Miles_Brundage's SB 53 letter), the NYT lawsuit position, Amazon and the Long-Term
Benefit Trust, the EU "no plans to leave" posts, Fable 5 export controls,
GPT-5.6 Sol's restricted launch, and Astra's "recurrent depth" design.

### Updates to existing entries

- WSJ on the fired safety executive (@sjgadler [376314](https://x.com/sjgadler/status/2021392366423376314)): Ryan Beiermeister, added to `openai/2025-10-14-chatgpt-erotica-announced` with OpenAI's denial. Zoë Hitzig's resignation over ads, found in the same coverage, went to `openai/2026-01-16-ad-principles`.
- The promised NSA explanation (@sjgadler [758732](https://x.com/sjgadler/status/2028899096283758732)): added to `openai/2026-03-02-pentagon-surveillance-prohibition`; no explanation was found.
- Brockman's ad challenge (@gdb [900608](https://x.com/gdb/status/2019300639155900608)): added to `anthropic/2026-02-04-claude-ad-free`; no answer was found.
- The Artifactory message board (@w01fe [419761](https://x.com/w01fe/status/2092742024680419761)): Jason Wolfe's correction added to `openai/2026-07-21-hugging-face-incident`.
- Paul Christiano (@sama [569783](https://x.com/sama/status/2097776310940569783)): already in `openai/2025-10-28-foundation-controls-pbc` (Foundation board and Safety and Security Committee).
- GPT-6.1 Astra held back for deception (TechCrunch, Sept. 28): added to `openai/2025-05-02-behavior-issues-block-launches`, which stays standing, with one case each way.

### No record change, and why

- Anthropic reward-hacking paper (@AnthropicAI, 7 posts, Nov 2025): research on a model trained for the study, with no claim about released models. The Anthropic counterpart to OpenAI's chain-of-thought disclosure is the April 2026 training error above.
- Leading the Future statement (@w01fe [858586](https://x.com/w01fe/status/2061649344814858586)): OpenAI's June 2 statement was already in `openai/2025-08-25-leading-the-future-super-pac`. Its updates were put back in date order.
- PR firm with fake reporters (@sjgadler [437960](https://x.com/sjgadler/status/2047708302323437960)): the link to Leading the Future runs through a PR firm whose client's CEO co-founded the PAC. Even the outlets that reported it call it circumstantial. Recorded if reporting ties the site to the PAC or OpenAI directly.
- July 2024 Preparedness restatement (@OpenAI [056842](https://x.com/OpenAI/status/1815708157207056842)): restates the 2023 rule; the rule's replacement is covered by `openai/2025-04-15-preparedness-framework-v2`, and the first "High" deployment by `openai/2025-07-17-chatgpt-agent-high-bio`.
- Kokotajlo on internal deployment (@DKokotajlo [513317](https://x.com/DKokotajlo/status/1912907538267513317)): a hedged recollection ("IIRC"). Version 2 of the framework does name internally deployed agents.
- GPT-5 system card "overclaim" (@sjgadler [821035](https://x.com/sjgadler/status/1953520540456821035)): the feature is named only in images; not pursued.
- Departures: Richard Ngo ([839804](https://x.com/RichardMCNgo/status/1856843040427839804)) and Mrinank Sharma ([583421](https://x.com/MrinankSharma/status/2020881722003583421)). Neither letter names a decision or a promise, so both are context, held to the same rule for each company.
- Promptfoo and Bun open-source promises (@OpenAI [106753](https://x.com/OpenAI/status/2031052793835106753), @mikeyk [749969](https://x.com/mikeyk/status/1995920258595749969)): product licensing, outside this record's ethics and safety scope.
- Claude Code source leak (@bcherny [863902](https://x.com/bcherny/status/2039209466881863902)): an accidental publication of source code, with no safety commitment involved.
- Altman leaving Helion's board (@sama [563682](https://x.com/sama/status/2036137695605563682)): he left because OpenAI and Helion were exploring a deal. No promise is involved.
- Jack Clark's 2022 thread on industry lobbying (@jackclarkSF, 4 posts): a description of industry practice, not a commitment.
- Staff post on engagement (@aidan_mclau [627357](https://x.com/aidan_mclau/status/1918335561699627357)): a personal view from a staff member, not company policy.
