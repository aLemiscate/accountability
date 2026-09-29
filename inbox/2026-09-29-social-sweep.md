# Social-media sweep, 2026-09-29

A full pass over the in-scope accounts, run from a Claude Code cloud session
with full network access. Nothing here is part of the record. Posts that made
it into the record are marked with their entry. The rest are either leads
for triage or reviewed and left out, with the reason.

## How the search was done

| Source | Result from this environment |
| --- | --- |
| Wayback CDX (`find-posts` default) | **Blocked.** `web.archive.org` reset every connection, and the CDX API returned 403 to Node. Run `find-posts` from the weekly Watch workflow on GitHub's runners for the deleted-post listing. |
| X timeline (syndication) | Rate-limited (HTTP 429) on every try. |
| X post lookup (oEmbed + syndication `tweet-result`) | **Worked.** Every post below was fetched from X directly, with text, author and exact posting time. Long posts come back truncated. |
| X pages in a browser | 403. The server-rendered page title still carries most of a long post, and capture saves it. |
| Web search for `site:x.com <handle>` plus topic terms | Worked. This is how posts were found; each was then verified through X's own API. |
| Bluesky | Worked after a fix: anonymous search only works on `api.bsky.app`. |

Accounts covered: @sama, @gdb, @OpenAI, @ilyasut, @janleike, @kalinowski007,
@AnthropicAI, @DarioAmodei, @jackclarkSF on X, and the Bluesky handles of
the same people. The two new X handles (@DarioAmodei, @kalinowski007) and
the two Bluesky handles (anthropic.com, jackclarksf.bsky.social) were added to
`data/accounts.yaml`. Other Bluesky profiles searched (Altman, Brockman, Kwon,
Lehane, Leike, Amodei, Askell, Krieger, Weil, Adler, Karnofsky) are empty,
unverified or impersonations, so none were added.

## Verified posts now cited in the record

| Posted (UTC) | Post | Entry |
| --- | --- | --- |
| 2024-05-13 | [@sama: "her"](https://x.com/sama/status/1790075827666796666) | 2024-05-13-her-sky-voice |
| 2024-05-17 | [@janleike: "…a backseat to shiny products."](https://x.com/janleike/status/1791498184671605209) | 2024-05-17-superalignment-team-disbanded |
| 2024-05-18 | [@sama: "…i did not know this was happening"](https://x.com/sama/status/1791936857594581428) | 2024-05-18-altman-did-not-know |
| 2025-10-14 | [@sama: relaxing ChatGPT restrictions](https://x.com/sama/status/1978129344598827128) | 2025-10-14-chatgpt-erotica-announced |
| 2025-11-06 | [@sama: "we do not have or want government guarantees"](https://x.com/sama/status/1986514377470845007) | 2025-11-06-altman-no-government-guarantees (new) |
| 2026-01-02 | [@AlexBores on Brockman's giving](https://x.com/AlexBores/status/2007101480395047014) | 2025-08-25-leading-the-future-super-pac |
| 2026-02-04 | [@sama: "we would obviously never run ads in the way Anthropic depicts"](https://x.com/sama/status/2019139174339928189) | 2026-02-04-altman-never-run-ads-like-that (new) |
| 2026-02-26 | [@AnthropicAI: Amodei statement on the Department of War](https://x.com/AnthropicAI/status/2027150818575528261) | 2026-02-27-anthropic-pentagon-red-lines |
| 2026-02-28 | [@sama: agreement with the Department of War](https://x.com/sama/status/2027578652477821175) | 2026-02-27-pentagon-classified-deal |
| 2026-03-03 | [@sama: re-post of internal memo on amendments](https://x.com/sama/status/2028640354912923739) | 2026-02-27-pentagon-classified-deal, 2026-03-02-pentagon-surveillance-prohibition |
| 2026-03-07 | [@kalinowski007: "I resigned from OpenAI."](https://x.com/kalinowski007/status/2030320074121478618) | 2026-02-27-pentagon-classified-deal |
| 2026-08-18 | [@sama: "We have paused some frontier RL training…"](https://x.com/sama/status/2089787807611195475) | 2026-08-18-altman-pause-act-unilaterally (new) |
| 2026-09-12 | [@DarioAmodei: "We Must Pace the Frontier"](https://x.com/DarioAmodei/status/2098773920774074715) | 2026-09-12-pace-the-frontier-embedded-evaluators (new) |
| 2026-09-14 | [@sama: "We welcome a federal framework…"](https://x.com/sama/status/2099348812305473766) | 2026-08-18-altman-pause-act-unilaterally |

## Leads for triage (verified, not yet in the record)

- **Jacob Coxon's resignation**, [@hilbertspaess, 2026-09-09](https://x.com/hilbertspaess/status/2097476196791709843):
  "Neither company is acting responsibly. They are racing straight to
  self-improving superintelligence and gambling with our lives." A former
  pretraining researcher at both labs, so a former-staff witness under
  METHODOLOGY.md. Coverage: [TechCrunch](https://techcrunch.com/2026/09/09/gambling-with-our-lives-anthropic-researcher-quits-warns-against-self-improving-ai/),
  [CNBC](https://www.cnbc.com/2026/09/09/anthropic-researcher-quits-ai-safety.html),
  which also quotes Anthropic alignment lead Evan Hubinger: "we do not yet
  have a plan to solve alignment for superintelligence and are not clearly on
  track to."
- **Jakub Pachocki, OpenAI chief scientist, "An Alien Mind"** (2026-09-06):
  "no lab has solved alignment and monitoring to a sufficient degree to
  continue responsibly scaling at maximum speed for much longer," and "I
  expect and hope for voluntary slowdowns to become commonplace until shared
  safety bars are established." A candidate standing promise. Pachocki would
  need an actors.yaml entry. [OpenAI](https://openai.com/index/an-alien-mind/),
  [Fortune](https://fortune.com/2026/09/08/openai-rsi-progress-jakub-pachoki-warns-dangers-slowdown-safety-rules/).
- **Dario Amodei, "Policy on the AI Exponential"** ([@DarioAmodei, 2026-06-10](https://x.com/DarioAmodei/status/2064781775247950326);
  [essay](https://darioamodei.com/post/policy-on-the-ai-exponential)): lays
  out Anthropic's Advanced AI Framework. Anthropic's own summary is that
  governments should be able to verify safety claims, impose civil penalties
  and "slow or block the deployment" of dangerous models. A candidate
  "said" entry, testable against what Anthropic lobbies for.
- **OpenAI's Preparedness Framework "Critical" cyber designation for Astra**
  (summer 2026). Critical requires safeguards during development. Check whether
  training continued before the Aug. 18 pause, since that decides whether
  the pause kept the framework or came late.
- **State actions over ChatGPT and violence**: Florida's criminal
  investigation (2026-04-21) and lawsuit against OpenAI and Altman
  (2026-06-01, "profits over public safety"; [NPR](https://www.npr.org/2026/06/01/nx-s1-5843132/openai-florida-lawsuit-safety-chatgpt)),
  and British Columbia's suit (2026-09-21). These are allegations. If they're
  added, attribute them and pair them with a specific OpenAI safety claim, for
  example the October 2025 statement that it had mitigated serious
  mental-health issues.
- **The White House Accord on Superintelligence** (2026-09-29), signed by
  Brockman and Amodei. It's recorded as updates for now. Its text hadn't been
  published; when it is, it may deserve a standing-promise entry per company.

## Reviewed and left out

- @jackclarkSF on Bluesky (2024-11-16 on "machine welfare", 2024-12-27 on
  social-media fragmentation): not a promise or an action about ethics or
  safety.
- @janleike, 2026-02-27 ("Respect to Anthropic for not backing down") and
  2026-05-08 (new research project): commentary, not evidence.
- @sama, 2025-10-29 (goal of an automated AI research intern by September
  2026): a capability forecast, not an ethics or safety promise.
- @sama, 2026-09-08 (the Navier–Stokes result): capability news.
- @AnthropicAI, 2026-06-02 (praising the AI executive order), 2026-07-15
  (agentic misalignment research), 2026-09-10 (threat intelligence report):
  context only.
- OpenAI's Mission Alignment team disbanding (2026-02-11): a communications
  function, not a safety team. It's noted as an update on the AGI Readiness
  entry.
