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
| [@OpenAI](OpenAI.md) | 299 | 24 | 6 | 143 | 126 |
| [@sama](sama.md) | 592 | 11 | 7 | 116 | 458 |
| [@gdb](gdb.md) | 401 | 7 | 1 | 80 | 313 |
| [@ilyasut](ilyasut.md) | 79 |  |  | 5 | 74 |
| [@janleike](janleike.md) | 112 | 1 |  | 23 | 88 |
| [@kalinowski007](kalinowski007.md) | 804 | 1 |  | 2 | 801 |
| [@AnthropicAI](AnthropicAI.md) | 338 | 2 | 16 | 160 | 160 |
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
| [@JoHeidecke](JoHeidecke.md) | 13 | 4 |  | 5 | 4 |
| [@zicokolter](zicokolter.md) | 28 |  |  | 1 | 27 |
| [@paulfchristiano](paulfchristiano.md) | 5 |  |  |  | 5 |
| [@hlntnr](hlntnr.md) | 225 |  |  | 10 | 215 |
| [@Miles_Brundage](Miles_Brundage.md) | 4,233 |  | 8 | 46 | 4,179 |
| [@sjgadler](sjgadler.md) | 72 |  | 6 | 22 | 44 |
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
| [@polynoamial](polynoamial.md) | 127 |  |  | 4 | 123 |
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
| **Total** | **18,627** | **64** | **71** | **910** | **17,582** |

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

## Open leads

- @OpenAI: Promptfoo "will remain open source under the current license" - small checkable promise. ([106753](https://x.com/OpenAI/status/2031052793835106753))
- @OpenAI: Mar 2025 "How we think about safety and alignment"; Brundage said it rewrote GPT-2 history. Check his posts. ([680236](https://x.com/OpenAI/status/1897386487068680236))
- @OpenAI: Jul 2024 restatement: "We won't release a new model if it crosses a medium risk threshold until..." Check against Preparedness v2 entry. ([056842](https://x.com/OpenAI/status/1815708157207056842))
- @OpenAI: Seoul Frontier AI Safety Commitments (May 2024); both labs signed. Candidate standing-promise entries for both. ([187679](https://x.com/OpenAI/status/1792917200464187679))
- @OpenAI: Apr 2024 commitment to Thorn/All Tech Is Human Safety by Design child-safety principles (check whether Anthropic signed too; standing promise candidate). ([748433](https://x.com/OpenAI/status/1782786891508748433))
- @OpenAI: Jan 2024 NYT lawsuit position ("training is fair use", "regurgitation is a rare bug we are driving to zero"). Parity with Anthropic Bartz entry; check case status. ([229424](https://x.com/OpenAI/status/1744419710635229424))
- @OpenAINewsroom: Sep 2024: OpenAI signed EU AI Pact core commitments. Check both labs (AI Pact, GPAI Code of Practice) for standing-promise entries. ([923238](https://x.com/OpenAINewsroom/status/1839003497569923238))
- @OpenAINewsroom: Sep 2024: Safety and Security Committee becomes an independent board committee overseeing safety criteria for major releases. Check record reflects it (foundation/SSC standing promise). ([796171](https://x.com/OpenAINewsroom/status/1835773864275796171), [240380](https://x.com/OpenAINewsroom/status/1835773863185240380), [050388](https://x.com/OpenAINewsroom/status/1835773862036050388), [069734](https://x.com/OpenAINewsroom/status/1835773859947069734))
- @AnthropicAI: Jun 2026: US export-control directive suspends foreign-national access to Fable 5/Mythos 5; lifted Jun 30; redeployed with classifiers blocking more cyber tasks. Research whether record-worthy (ties to Mythos promise). ([229756](https://x.com/AnthropicAI/status/2072163884430229756), [809341](https://x.com/AnthropicAI/status/2072106151890809341), [871779](https://x.com/AnthropicAI/status/2070665903440871779), [743999](https://x.com/AnthropicAI/status/2065597531644743999)) **Resolved:** new entry `2026-06-12-fable-5-export-control-suspension`.
- @AnthropicAI: $100M Mythos credits to critical-software maintainers; "Anthropic will report back what we learn" - checkable. ([900255](https://x.com/AnthropicAI/status/2041578412653900255))
- @AnthropicAI: Feb 2026 pledge: cover electricity price increases, pay 100% of grid upgrade costs. Standing-promise candidate; check OpenAI equivalents for parity. ([901314](https://x.com/AnthropicAI/status/2021694494215901314))
- @AnthropicAI: Feb 2026: commitment (at Opus 4.5) to sabotage risk reports for future frontier models, delivered for Opus 4.6; "preemptively meet the higher ASL-4 safety bar". Kept-promise candidate (parity with OpenAI High designation). ([672557](https://x.com/AnthropicAI/status/2021397953848672557), [707696](https://x.com/AnthropicAI/status/2021397952791707696))
- @AnthropicAI: Nov 2025: emergent misalignment from reward hacking in production RL environments. Parity check with OpenAI CoT-grading disclosure: were released models affected? ([243667](https://x.com/AnthropicAI/status/1991952436207243667), [290528](https://x.com/AnthropicAI/status/1991952432797290528), [204297](https://x.com/AnthropicAI/status/1991952423297204297), [548867](https://x.com/AnthropicAI/status/1991952417714548867), [054984](https://x.com/AnthropicAI/status/1991952413629054984), [256720](https://x.com/AnthropicAI/status/1991952410051256720), [559889](https://x.com/AnthropicAI/status/1991952400899559889))
- @AnthropicAI: Sep 2023 (Amazon stake): "Our corporate governance remains unchanged and we'll continue to be overseen by the Long Term Benefit Trust." Parity with OpenAI nonprofit-control entries: candidate standing promise on LTBT oversight. ([649658](https://x.com/AnthropicAI/status/1706202970755649658))
- @sama: Sep 2026: Paul Christiano joins/works with OpenAI again. Check role (independent evaluator?) for the evaluator promise. ([569783](https://x.com/sama/status/2097776310940569783))
- @sama: Aug 7 2026: Astra to be generally available; "we do not think it is a good strategy to keep powerful models to a chosen few". Astra launched Sep 3, after the Aug 18 RL-training pause. Check pause entry. ([396515](https://x.com/sama/status/2085862292311396515))
- @sama: Jun 26 2026: GPT-5.6 Sol launch restricted "at the request of the US government". Pair with Anthropic export-control lead. ([358364](https://x.com/sama/status/2070607488274358364)) **Resolved:** update on `2026-06-12-fable-5-export-control-suspension`.
- @sama: Mar 2026: Altman leaves Helion board as OpenAI and Helion explore working together at scale. Conflict-of-interest lead. ([563682](https://x.com/sama/status/2036137695605563682))
- @sama: Aug 2024: agreement with US AI Safety Institute for pre-release testing of future models (Anthropic signed too). Standing-promise candidate for both; check whether kept (CAISI). ([515676](https://x.com/sama/status/1829205847731515676))
- @sama: May 2023: after raising leaving the EU over the AI Act, "no plans to leave"; Jun 2023 "look forward to offering our technology in Europe under the AI Act". Regulate-us pattern candidate (check the original "cease operating" remark). ([193025](https://x.com/sama/status/1672460302712193025), [567297](https://x.com/sama/status/1661975237280567297))
- @gdb: Feb 5 2026: Brockman asks Anthropic to "commit to never selling claude's users' attention or data to advertisers", saying the blog post keeps "the option open". Check the exact wording of 2026-02-04-claude-ad-free and whether Anthropic answered. ([900608](https://x.com/gdb/status/2019300639155900608))
- @bcherny: "No one was fired? It was an honest mistake" - Claude Code source leak (Mar 31 2026); check whether record should cover the leak. ([863902](https://x.com/bcherny/status/2039209466881863902))
- @npew: SB 1047: no entry. OpenAI VP "Glad SB 1047 was vetoed" vs OpenAI calls for regulation; parity with Anthropic "benefits likely outweigh costs" letter. ([723349](https://x.com/npew/status/1840498486816723349))
- @mikeyk: Bun acquisition: "Bun will remain open source and MIT-licensed" (Dec 2025); parity with the Promptfoo open-source lead; check whether kept. ([749969](https://x.com/mikeyk/status/1995920258595749969))
- @elonmusk: Musk quoting claim that "Palantir AI + Claude" was used to strike 1,000+ targets (Mar 2026); check primary reporting on Claude in military operations vs anthropic-pentagon-red-lines. ([713613](https://x.com/elonmusk/status/2035828088433713613))
- @btaylor: OpenAI Foundation spending plan announced by board chair (Mar 24 2026); add as a promise to foundation-controls-pbc and track against spending. ([554334](https://x.com/btaylor/status/2036474423998554334))
- @jackclarkSF: SB 1047 (Aug-Sep 2024) and SB 53 (Sep-Oct 2025) positions; "much better left to the federal government"; for the SB 1047 parity lead (OpenAI opposed; npew "glad it was vetoed"). ([265862](https://x.com/jackclarkSF/status/1978173368307265862), [887044](https://x.com/jackclarkSF/status/1978160020391887044), [826232](https://x.com/jackclarkSF/status/1972773280877826232), [367847](https://x.com/jackclarkSF/status/1965048896784367847), [984550](https://x.com/jackclarkSF/status/1840509202352984550), [232083](https://x.com/jackclarkSF/status/1826743366652232083))
- @jackclarkSF: Aug 2022 "spicy takes" thread by the Anthropic co-founder: industry policy work moves "the overton window" with money, "follow the birdie" with government, "skeezy shit under the radar"; candidate said-side for public-first-action-donation (compare OpenAI side via Lehane). ([813376](https://x.com/jackclarkSF/status/1555994401347813376), [789632](https://x.com/jackclarkSF/status/1555989036958789632), [398656](https://x.com/jackclarkSF/status/1555986449811398656), [908096](https://x.com/jackclarkSF/status/1555980661499908096))
- @DKokotajlo: Former OpenAI governance researcher: "IIRC I tried to get the Preparedness Framework to cover internal deployment too, but was overruled" (Apr 2025); attributed claim for a PF entry. ([513317](https://x.com/DKokotajlo/status/1912907538267513317))
- @w01fe: OpenAI "Artifactory" breach (Aug 2026): alignment researcher corrects his post; "some people at OpenAI knew about the message board during the first Artifactory breach", contrary to his paraphrase of the CSO; not in record, find the report. ([419761](https://x.com/w01fe/status/2092742024680419761)) **Partly resolved:** the Artifactory route is now in the Hugging Face entry (Aug 26 official report); the claim that some staff knew of the message board earlier is still open.
- @w01fe: Jun 2 2026 OpenAI statement on its political advocacy after Leading the Future criticism; employee "donated ... to Bores"; update leading-the-future. ([858586](https://x.com/w01fe/status/2061649344814858586))
- @sjgadler: Sep 2 2026 (The Information via Calvin): OpenAI reportedly training in a way that violates "one of the few redlines" (likely optimizing on chain of thought); find the story; relates to the CoT-grading entry. ([908214](https://x.com/sjgadler/status/2094959837691908214)) **Resolved:** update on `2025-03-10-cot-optimization-pressure` (Astra "recurrent depth").
- @sjgadler: Apr 2026 Midas Project: PR firm with fake reporters writing hits on AI-safety advocates, also working for the Leading the Future leader; leading-the-future. ([437960](https://x.com/sjgadler/status/2047708302323437960))
- @sjgadler: Mar 3 2026: OpenAI "promised a clear and more comprehensive explanation shortly" of how the NSA is excluded from its DoW contract; check whether it was ever published (pentagon-surveillance-prohibition). ([758732](https://x.com/sjgadler/status/2028899096283758732))
- @sjgadler: Feb 2026 WSJ: OpenAI cut ties with a top safety executive, allegedly after opposing the erotica rollout; OpenAI denies; add to the erotica entry if sourced. ([376314](https://x.com/sjgadler/status/2021392366423376314))
- @sjgadler: Nov 2025: OpenAI apparently did not run CBRN evals on GPT-5.1, tested cyber/self-improvement only on pre-final checkpoints; PF compliance. ([916683](https://x.com/sjgadler/status/1989138789755916683))
- @sjgadler: Aug 2025: GPT-5 system card presents as new a safety feature OpenAI had since 2021 ("overclaim"); system-card accuracy. ([821035](https://x.com/sjgadler/status/1953520540456821035))
- @MrinankSharma: Anthropic safeguards researcher resigned Feb 9 2026 with a letter to colleagues; check its content and coverage for Anthropic parity with OpenAI safety departures. ([583421](https://x.com/MrinankSharma/status/2020881722003583421))
- @aidan_mclau: May 2025 OpenAI model-design staffer: sycophancy "isn't good for our business ... we're not facebook; we don't need users spending 14 hours a day doomchatting with our model to make ad revenue"; staff-level said-side for chatgpt-ads (low authority). ([627357](https://x.com/aidan_mclau/status/1918335561699627357))
- @leopoldasch: May 2023 superalignment member urges "nuclear secrets"-level infosec at OpenAI; he was fired Apr 2024 and later said (Dwarkesh, Jun 2024) it followed a security memo to the board; OpenAI disputes. Not in record; attributed-claim candidate. ([330688](https://x.com/leopoldasch/status/1656340983817330688))
- @RichardMCNgo: OpenAI governance researcher resigns Nov 13 2024; resignation message (image) reportedly cites "unanswered questions about the events of the last twelve months"; verify text; candidate context for 2024-10-23-agi-readiness-team-disbanded (safety/policy departures) ([839804](https://x.com/RichardMCNgo/status/1856843040427839804))
- @Miles_Brundage: GPT-5.1 shipped with known safety regressions vs October per system card addendum — pair with sjgadler 1989138789755916683 lead ([674171](https://x.com/Miles_Brundage/status/1988696272480674171))
- @Miles_Brundage: OpenAI letter to Gov. Newsom on SB 53 ("misleading") — add to SB 53 leads (Jack Clark, npew) ([521569](https://x.com/Miles_Brundage/status/1962629535813521569))
- @Miles_Brundage: o3-pro Jun 2025 — no statement of full Preparedness Framework assessment; "lax processes/corner-cutting" ([698562](https://x.com/Miles_Brundage/status/1932547422183698562), [281077](https://x.com/Miles_Brundage/status/1932532943555281077))
- @Miles_Brundage: NEW candidate — OpenAI Mar 5 2025 "How we think about safety and alignment" recasts GPT-2 caution as "disproportionate"/discontinuous-AGI thinking; former policy head who ran GPT-2 release: "rewrites the history of GPT-2". Pair with Feb 2019 GPT-2 announcement ([600992](https://x.com/Miles_Brundage/status/1897426212546600992), [392230](https://x.com/Miles_Brundage/status/1897426209887392230), [705739](https://x.com/Miles_Brundage/status/1897426207131705739))
- @Miles_Brundage: Deep Research launched Feb 2 2025 with no system card (card followed Feb 25) — candidate addition to gpt-4-1-no-system-card pattern ([774875](https://x.com/Miles_Brundage/status/1886347097571774875))
