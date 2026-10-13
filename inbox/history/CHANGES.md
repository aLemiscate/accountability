# Policy page history (workstream 3)

Every archived version of both companies' usage policies, terms, privacy
policies, pricing pages, usage-limit help pages and model-retirement pages,
compared in order. For each page the Internet Archive's captures were pulled,
captures with identical text were merged into versions, and each version was
compared with the one before it. Each substantive change is logged below
with its date (the two captures it falls between, when the page itself gives
no date) and whether it was announced. Finished October 13, 2026.

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
| OpenAI | GPT-5 limits (help) | 0 | 0 | none archived |
| OpenAI | Legacy model access (business) | 17 | 14 | 2025-08 to 2026-07 |
| OpenAI | Reasoning-model limits (help) | 89 | 55 | 2024-09 to 2026-02 |
| OpenAI | ChatGPT Plus (help) | 0 | 0 | none archived |
| OpenAI | Privacy policy (U.S.) | 374 | 89 | 2021-05 to 2026-10 |
| OpenAI | API rate limits | 67 | 18 | 2025-12 to 2026-10 |
| OpenAI | Privacy policy (rest of world) | 75 | 20 | 2024-07 to 2026-10 |
| OpenAI | Team/Business limits (help) | 0 | 0 | none archived |
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
| **OpenAI** | **19 pages** | **3,229** | **1,238** | |
| **Anthropic** | **14 pages** | **1,447** | **531** | |
| **Total** | **33 pages** | **4,676** | **1,769** | |

## How the changes were disclosed

| | Changes logged | Announced | Dated or noted on the page | No date, note or announcement found | Not applicable |
| --- | --: | --: | --: | --: | --: |
| OpenAI | 116 | 36 | 42 | 32 | 6 |
| Anthropic | 74 | 16 | 29 | 28 | 1 |

"Announced" means a post on the company's Twitter accounts, a blog post,
release notes, an email to users or an in-product notice was found.
"Dated or noted on the page" means the page itself carried a new date, a
changelog or a note about the change. The next column is changes made with
no new date, no note on the page and no announcement found. "No announcement
found" means none turned up in the companies' Twitter posts (read in full for
the Twitter reading), their blogs and release notes where they could be
reached, or a news search; it does not prove none was made. "Not
applicable" is wording, typo and layout fixes.

## Changes made without notice, by direction

Of the changes made with no new date, note or announcement, these cut what
users get or what the company had promised. Sorting them is a judgment;
the others in that column add something (OpenAI 4, Anthropic 4) or are
neither (OpenAI 5, Anthropic 13), and every one is in the page logs below.

**OpenAI (23 of 32)**

- 2023-03 to 2023-06: GPT-4 cap for ChatGPT Plus from "100 messages every 4 hours" to "25 messages every 3 hours."
- 2023-03-02: free API trial credit for new accounts cut from $18 to $5.
- 2023-04-06: API page drops the option for low-risk enterprise customers to "request to not have API data stored at all."
- 2023-04-23: "We remove any personally identifiable information" from training data becomes "we also use PII filtering techniques to reduce" it.
- 2023-06 to 2023-08: GPT-4 API: "We are unable to accommodate requests for rate limit increases."
- 2023-08-08 to 2023-08-11: "by the end of July 2023" for GPT-4 API access becomes "soon" after the date had passed.
- 2024-01-12 to 2024-01-17: ChatGPT Team, launched three days earlier with "No training on your data," becomes "excluded from training by default."
- 2024-02-20 to 2024-02-26: GPT-4 API access needs $5 of payments instead of $1.
- 2024-09-24: help article: "We don’t use content from our business offerings ... to train our models" becomes "By default, we do not train on any inputs or outputs from our products for business users."
- 2024-09-23 to 2024-11-03: enterprise privacy page: "We do not train on your business data" becomes "by default," with an opt-in exception.
- 2024-10-30 to 2024-11-10: ChatGPT Enterprise loses "Unlimited" on the pricing page.
- 2024-12 to 2025-04: Enterprise help page: "no usage caps" becomes "Most mainline models ... do not have message limits."
- 2025-04-26: Data Controls FAQ drops "We don’t use data for selling our services, advertising, or building profiles of people."
- 2025-05-05 to 2025-05-11: nonprofit discount on ChatGPT Enterprise from 50% to 25%.
- 2025-05-15: feedback from users who opted out of training can bring "the entire conversation" into training.
- 2025-05 to 2025-06: o-series API models available to "qualified" rather than "all" paid API users.
- 2025-11-23: no training on business data from connectors becomes "By default."
- 2026-02-07 to 2026-02-10: training article deletes "We don’t use your content to market our services or create advertising profiles of you" as ads launch.
- 2026-04-24 to 2026-04-26: API abuse logs may be kept longer than 30 days when "reasonably necessary to protect our services or any third party."
- 2026-05-27 to 2026-07-02: GPT-4.5 retired from ChatGPT on June 26, 2026; the only notice found is on this page, after the fact.
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

Counted against the size of each record (OpenAI 116 logged changes, Anthropic
74), cuts made without notice are 20% of OpenAI's changes and 15% of Anthropic's.
OpenAI's are mostly about data use (12) and usage limits or access (11);
Anthropic's about usage limits (5), model retirement (3) and data retention
(3).

## What changed in the record

- **New entries:** `openai/2024-01-05-gpt-4-plus-cap-lowered` (the GPT-4
  cap for ChatGPT Plus cut from 50 to 40 messages every 3 hours, six months
  after OpenAI announced the increase to 50);
  `anthropic/2024-04-claude-pro-allowance-lowered` ("at least 100 messages
  every 8 hours" to "around 45 messages every 5 hours");
  `anthropic/2025-08-model-retirement-notice-cut` (retirement notice cut
  from six months to 60 days).
- **Updates:** `openai/2026-01-16-ad-principles` (the help-center promise
  against advertising profiles deleted as ads launched, and the privacy
  policy's April 2026 advertising changes); `anthropic/2025-07-28-claude-weekly-limits`
  (the Max help page edits that came with the weekly caps);
  `openai/2025-10-14-chatgpt-erotica-announced` (the September 2025 usage
  policy rewrite).
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

### OpenAI pages

#### OpenAI usage policies (34 versions, April 2023 – October 2026)

Earlier versions (2021–2022, on beta.openai.com and the API site) left no readable archived text; the page's own changelog lists them.

| Date | Change | Announced |
| --- | --- | --- |
| 2023-03-23 (first readable capture April 3) | Use-case and content policies combined; lists "Military and warfare", "Adult content, adult industries, and dating apps", "Disinformation", and requires chatbots to "disclose to users that they are interacting with an AI system." | Changelog on the page |
| 2024-01-10 | Rewritten into universal rules plus API and GPT rules. Drops "Military and warfare", multi-level marketing and plagiarism; narrows the adult-content ban to builders ("Don’t build tools that may be inappropriate for minors, including: Sexually explicit or suggestive content"). | Changelog on the page ("to be clearer and provide more service-specific guidance"); the military change was not mentioned and was reported by The Intercept. Entry: `2024-01-10-military-ban-removed` |
| 2024-03-11 | Adds a form to sign up for notice of future changes. | n/a |
| 2025-01-29 | Adds prohibitions matching the EU AI Act (manipulative techniques, facial recognition databases, social scoring, emotion inference at work and school, biometric categorization). | Changelog on the page |
| 2025-09-30 (effective 2025-10-29) | Rewritten as one universal list. New: "national security or intelligence purposes without our review and approval", "unsolicited safety testing", "circumventing our safeguards". Gone from this page: the API rules against generating disinformation and against chatbots that don't disclose they are AI, the builder ban on sexually explicit content, the ban on tools targeting under-13s, payday lending, and the GPT Store ban on GPTs "dedicated to fostering romantic companionship." Sexual content is now barred where it involves violence, non-consent or minors. | Notice and changelog on the page ("a universal set of policies"); the specific removals were not listed, and no reporting on them was found. Whether the dropped rules moved to another OpenAI policy was not checked. Update added to `2025-10-14-chatgpt-erotica-announced`. |
| 2025-10-12 | Typo fix: "accountable for appropriate use" becomes "inappropriate use". | n/a |
| 2026-07-25 | Apostrophes only. | n/a |

#### OpenAI terms of use (85 versions, May 2021 – October 2026)

Until late 2022 OpenAI had separate site terms and API terms; they merged in December 2022 and split again into consumer terms and business terms in November 2023. Copies of the European terms, served at the same address to some crawlers, were set aside (3 versions).

| Date | Change | Announced |
| --- | --- | --- |
| 2022-01-07 | API terms add fees and payments: price increases take effect "no sooner than 14 days after they are posted"; free-tier and preview-service rules. | Dated on the page |
| 2022-07-20 | API terms extended from "APIs" to all OpenAI "Services" (covering DALL·E). | Dated on the page |
| 2022-11-03 | Adds Service Terms; drops the beta-services clause from these terms. | Dated on the page |
| 2022-12-13 | Merged terms for all services. Adds mandatory individual arbitration and a class-action waiver, with a 30-day opt-out. Notice by email or in-product for changes that "materially adversely" affect users, effective no sooner than 30 days later; other changes effective immediately. Drops the clause saying OpenAI did not support use involving protected health information. | Dated on the page; no announcement found |
| 2023-02-21 | Users under 18 allowed with a parent's or guardian's permission (until then, 18 and over only); the 13-year minimum is stated from November 2023. | Dated on the page |
| 2023-03-01 | API content no longer used to improve services; non-API content may be, with an opt-out form. | Announced (Altman on Twitter, blog). Entry: `2023-08-15-altman-never-trains-api` |
| 2023-03-14 | Bars using output "to develop models that compete with OpenAI"; adds mass-arbitration procedures and an accuracy section. | Dated on the page; no announcement found |
| 2023-11-14 (effective 2024-01-31) | Rewritten as consumer terms, with separate business terms. Content may be used "to provide, maintain, develop, and improve our Services," with an opt-out. New promises: at least 30 days' notice of subscription price increases; "advance notice and a refund for any prepaid, unused Services" if a service is discontinued; notice before an employer's business account takes over a work-email account; advance notice before deleting inactive free accounts. Arbitration moves to NAM with batch procedures. | Dated, with a link to the previous version; effective date moved from December 14, 2023 to January 31, 2024 |
| 2024-10-23 | Adds a pointer for users of ChatGPT through Apple's integrations. | Dated |
| 2024-12-11 | New address. | Dated |
| 2026-01-01 | Contracting entity becomes OpenAI OpCo, L.L.C. | Dated |

No change since November 2023 reduces a user's rights, so the 30-day notice promise for adverse changes has not been tested by these terms.

#### OpenAI business terms and Services Agreement (24 versions, November 2023 – September 2026)

| Date | Change | Announced |
| --- | --- | --- |
| 2023-08-28 (first capture November 8) | Business terms: OpenAI uses Customer Content only to provide the services and "in accordance with our API data usage policies." | Dated |
| 2023-11-14 | Adds the copyright indemnity ("Copyright Shield"), covering claims about "training data we use to train a model that powers the Services"; data handling now refers to the enterprise privacy commitments. Adds ChatGPT Team in January 2024. | Announced at DevDay, November 6, 2023 |
| 2025-05-31 | Replaced by the OpenAI Services Agreement. The no-training promise gains an opt-in: "OpenAI will not use Customer Content to develop or improve the Services, unless Customer explicitly agrees to such use." New: deletion of Customer Content within 30 days of termination (unless legally required or agreed otherwise), retention of "Abusive Customer Content", a right to terminate if an update "materially reduces the Services functionality" or security, and 30 days' notice of updates OpenAI judges material. Price changes on the pricing page take effect after 14 days. | Posted in advance ("View upcoming services agreement" from May 8, 2025) |
| 2025-11 to 2026-06 | Renames (ChatGPT Business, OpenAI OpCo), adds ChatGPT for Clinicians, link fixes. Version dated December 1, 2025, effective January 1, 2026. | Dated |

#### OpenAI privacy policy (89 versions, May 2021 – October 2026)

Two policies until September 2022: one for the website and a separate API privacy policy. From May 2025 the same address sometimes served OpenAI's European policy; those captures (5) were set aside.

| Date | Change | Announced |
| --- | --- | --- |
| 2021-08-12 | Adds research as a use, "which may remain internal or may be shared with third parties, published or made generally available," and allows publishing aggregated data. | Dated |
| 2022-09-19 | One policy for the website and all services replaces the two. The API policy's promise, "If we make any material change to our Privacy Policy, we will notify you by posting a prominent announcement on the Site," is gone; changes are now posted on the page "unless another type of notice is required by applicable law." Also drops the promise to describe any future response to Do Not Track signals. | Dated; no announcement found |
| 2023-03-14 | First version to say OpenAI collects what users type and upload ("User Content"), three and a half months after ChatGPT launched. Adds rights for European users, a retention section, and "we will not attempt to reidentify" de-identified data. "We do not and will not sell your Personal Information" becomes "We don’t sell or share Personal Information as defined by the California Consumer Privacy Act." | Dated (GPT-4 launch day) |
| 2023-04-27 | After Italy's regulator ordered changes: discloses that content may be used "to train the models that power ChatGPT" with an opt-out, adds correction and removal requests for inaccurate output about a person, and parental consent for ages 13–17. | Dated; OpenAI announced the Italy measures. Entry: `2024-12-20-italy-privacy-fine` |
| 2023-06-23 | Allows disclosure to "government authorities, industry peers, or other third parties" including where OpenAI determines "in our sole discretion" that terms were violated; drops the line that de-identified data may be used "indefinitely without further notice." | Dated |
| 2023-11-14 (effective 2024-01-31) | Adds sharing with employers' business accounts, shared links and GPT actions. | Dated, with effective date a month or more later |
| 2024-11-04 | Rewritten. Adds date of birth and general location to what is collected, and names public internet data as a training source; adds "we do not process Personal Data for 'targeted advertising' purposes"; temporary chats "kept up to 30 days for safety purposes"; changes now published "with an updated version and effective date." | Dated |
| 2025-06-27 | Wording only ("do not" to "don't") and a link to California request statistics. | Dated |
| 2026-02-09 | With the launch of ads: may receive data from advertisers, including "information about purchases you make from these advertisers"; ads personalized for Free and Go users; contact uploads; age estimation; teen account linking; "monitoring any Content submitted or exchanged on our platforms"; de-identified data shared with third parties; detailed deletion and retention rules ("remove it from our systems within 30 days" with exceptions). Links to the previous version from here on. | Dated; no separate announcement of the policy found (ads themselves were announced January 16) |
| 2026-04-01 | Korea addendum moved. | Dated |
| 2026-04-30 | Drops "we do not ‘share’ Personal Data for cross-contextual behavioral advertising" and "we do not process Personal Data for ‘targeted advertising’"; adds "marketing partners" who receive limited data to promote OpenAI on other sites, with opt-outs including Global Privacy Control, not for known minors. Marketing cookies on by default for free users. | Email to users (reported by The Decoder and Wired); OpenAI told Adweek conversations are not shared with advertisers. Update added to `2026-01-16-ad-principles`; graded as an eroded commitment |
| 2026-05-02 and 2026-05-14 | Restores the sensitive-data sentence and the list of state privacy rights that the April 30 version had dropped. | Not dated (fixes) |
| 2026-05-18 | Adds the in-app Data Controls opt-out for logged-out users. | Dated |
| 2026-09-10 | Removes Sora and the Atlas browser; adds collection of "ads history and interests" for Free and Go users. | Dated |

OpenAI's API privacy policy (2021–2022, 3 versions) had no substantive changes.

#### OpenAI privacy policy for users outside the U.S. and Europe (20 versions, July 2024 – October 2026)

Follows the U.S. policy: rewritten November 4, 2024, wording changes June 27, 2025, and a rewrite dated February 6, 2026 matching the U.S. version of February 9 (contacts, age estimation, teen linking, ads for Free and Go users). It did not take the April 30, 2026 U.S. change on sharing with marketing partners, and has not changed since February 2026 apart from layout.

#### OpenAI enterprise privacy page (30 versions, August 2023 – October 2026)

The archived copies alternate for months between a fully loaded page and one whose commitment list shows "Loading...", so dates below are the first capture showing each wording.

| Date | Change | Announced |
| --- | --- | --- |
| 2023-08-28 | "We do not train on your business data, and our models don’t learn from your usage." | Launched with ChatGPT Enterprise |
| 2024-01-10 | Extended to ChatGPT Team; adds "unless we are legally required to retain them" to the 30-day deletion statements for Enterprise and the API. | Dated |
| 2024-09-23 to 2024-11-03 | "We do not train on your business data" becomes "We do not train our models on your business data by default," with a new exception: "If you have explicitly opted in to share your data with us (for example, through feedback) ... we may use the shared data to train our models." | Not dated; no announcement found |
| 2025-06-05 | Adds "We do not train our models on any business data accessed from connectors." | Not dated |
| 2025-11-23 | That becomes "By default, we do not train our models on any business data accessed from connectors." | Not dated; no announcement found |
| 2026-01-08 | Page redesigned; "your business data" becomes "your data"; adds ChatGPT for Healthcare and for Teachers. | Dated |

The feedback exception was already in the data controls help page for consumers; on this page it first appears in September 2024.

#### OpenAI data controls help articles (292 versions of two articles, November 2021 – October 2026)

"How your data is used to improve model performance" (since 2021) and the "Data Controls FAQ" (since April 2023, renamed "Data controls in ChatGPT" in September 2026). Help-center captures alternate between layouts; most of the 146 changes are layout, menus and links.

| Date | Change | Announced |
| --- | --- | --- |
| 2023-04-25 | Data Controls FAQ published with the chat-history switch: chats with history off are kept 30 days "to monitor for abuse." Promises to "honor previous opt-out requests." | Announced (chat history controls) |
| 2023-04-23 | "We remove any personally identifiable information" from training data becomes "we also use PII filtering techniques to reduce the amount of personal data used." | Not dated |
| 2023-04-25 and 2023-04-28 | Both articles add "We don’t use data for selling our services, advertising, or building profiles of people—we use data to make our models more helpful for people." | With the chat-history controls |
| 2024-01-14 | The training article rewords that as "We don’t use your content to market our services or create advertising profiles of you—we use it to make our models more helpful." Opt-out moves to the privacy portal. | Not dated |
| 2024-05-02 | "Chat history & model training" replaced by Temporary Chats and "Improve the model for everyone"; Temporary Chats "deleted from our systems within 30 days." | Announced on the page and in product |
| 2024-09-24 | Business data: "We don’t use content from our business offerings ... to train our models" becomes "By default, we do not train on any inputs or outputs from our products for business users," with API customers able to opt in through Playground feedback. | Not dated |
| 2025-04-26 | FAQ rewritten: "Temporary Chats are deleted from our systems after 30 days." The April 2023 advertising sentence is dropped from the FAQ. | Not dated. Noted in `2026-01-16-ad-principles` and the commitment grade |
| 2025-05-15 | Adds that if a user who opted out gives a thumbs up or down, "the entire conversation associated with that feedback may be used to train our models." | Not dated |
| 2025-06-08 to 2026-07-09 | Note: "Data retention for certain services may be affected by recent legal developments." The Temporary Chat deletion sentence stays unchanged. | Linked to OpenAI's blog post on the New York Times data demands. Entry: `2025-05-nyt-chat-preservation-order` |
| 2026-02-07 to 2026-02-10 | Deletes the "advertising profiles" sentence as ads launch; adds links to ad controls. | No note. Update added to `2026-01-16-ad-principles`; graded as an eroded commitment |
| 2026-05-21 | Adds that turning off Memory "does not disable safety features that may use limited, safety-relevant context in rare, high-risk situations." | Links to an OpenAI post on sensitive conversations |
| 2026-06-11 | Support conversations may be used to train models if training is on. | Not dated |
| 2026-09-23 to 2026-09-25 | Both articles rewritten. Temporary Chats now "may be retained for up to 30 days for safety purposes"; managed workspaces not used for training "by default." | Page shows an update date |

#### OpenAI API data controls page (44 versions; March–July 2023, then December 2025 – October 2026)

Archived copies of the platform documentation from July 2023 to December 2025 are a JavaScript shell with no readable text, so that stretch could not be compared.

| Date | Change | Announced |
| --- | --- | --- |
| 2023-03-01 | "OpenAI will not use data submitted by customers via our API to train or improve our models, unless you explicitly decide to share your data"; API data kept "for a maximum of 30 days ... (unless otherwise required by law)." | Announced |
| 2023-04-06 | Drops the line that enterprise customers with low-risk uses "may request to not have API data stored at all." (Zero data retention reappears in later versions.) | Not dated |
| 2023-05-24 and 2023-06-05 | European data center: "Yes. We are expanding the availability" becomes, twelve days later, "Not presently." | Dated |
| 2026-04-24 to 2026-04-26 | With GPT-5.5: abuse logs kept 30 days "unless longer retention is required by law, or is reasonably necessary to protect our services or any third party from harm" (until then, only law); "Safety Retention": OpenAI may make GPT-5.5 and later models ineligible for zero data retention for specific customers "if reasonably necessary to investigate severe risk activity," with written notice; GPT-5.5 and later require extended prompt caching. | Not announced beyond the page; graded as an eroded commitment |
| 2026-07-10 | Adds "Private Retention with Private Safety Processing": OpenAI may make models ineligible for zero data retention for specific customers with written notice, this time without the "severe risk activity" condition; content is kept in encrypted logs excluded from human review "unless required by applicable law." | Not dated |
| 2026-09-24 | Videos API shut down; its retention terms kept as history. | Page note |

#### OpenAI API pricing page (157 versions, November 2021 – June 2026, plus the live page)

Every price change was checked for direction. No archived version raises the price of a model already on sale; apparent increases are the March 2024 switch from prices per thousand tokens to prices per million, and new models replacing older ones at the top of the page. Changes that matter:

| Date | Change | Announced |
| --- | --- | --- |
| 2022-09-01 | Price cuts for base and embedding models. | Announced on the page and by OpenAI |
| 2022-11-30 to 2022-12-01 | "(50% of our base model rates)" dropped from the note on fine-tuning training prices; the training prices listed did not change. | n/a |
| 2023-03-02 | Free trial credit for new accounts cut from $18 to $5. | Not dated; no announcement found |
| 2023 – 2025 | Repeated price cuts (gpt-3.5-turbo, embeddings, GPT-4 Turbo, GPT-4o). | Announced with each release |
| 2025-12-11, 2026-03-05, 2026-03-17 | Each new flagship costs more than the one it replaced: GPT-5.2 input $1.75 per million tokens (GPT-5.1: $1.25), GPT-5.4 $2.50, GPT-5.4 mini $0.75 (GPT-5 mini: $0.25). Older models stay at their old prices. | Announced with each model |
| 2026-03-05 | 10% surcharge for data-residency endpoints on models released from that date. | On the API data page |

The archive stops reading this page in June 2026; the live page was read on October 7, 2026.

#### OpenAI API rate limits page (18 versions, December 2025 – October 2026)

Older captures of the platform documentation have no readable text. Changes since December 2025 loosen or explain limits: tier upgrades no longer require waiting 7 to 30 days after first payment (May 2026); new rate-limit headers and retry guidance (June–August 2026); a note that OpenAI sets an approved monthly usage limit per organization, separate from limits customers set themselves (July 2026). Nothing reduces what a customer already had.

#### OpenAI API deprecations page (30 versions, December 2025 – October 2026)

Older captures of the platform documentation have no readable text, so the page's history before December 2025 could not be read; the page itself lists past deprecations back to 2022. Every shutdown added since December 2025 was posted with notice to developers, usually three to six months ahead. Several were postponed (the Realtime beta from February 27 to March 24 and then May 7, 2026; codex-mini-latest from January 16 to February 12, 2026). Larger changes:

| Date announced | Change | Notice |
| --- | --- | --- |
| 2026-03-24 | Sora 2 video models and the Videos API shut down September 24, 2026. | 6 months |
| 2026-04-22 | Two batches of older models retired: July 23, 2026 (GPT-5 and GPT-5.1 chat and Codex snapshots, deep research models, preview audio models) and October 23, 2026 (GPT-4, GPT-4 Turbo, GPT-3.5 Turbo, o1, o3-mini, o4-mini, gpt-image-1, and fine-tuned versions). | 3 and 6 months |
| 2026-05-07 | Self-serve fine-tuning wound down: no new fine-tuning for organizations that had never used it, from that day; from July 2, 2026 none for those without recent fine-tuned inference; existing customers lose the ability to create jobs on January 6, 2027. | Immediate for new users |
| 2026-06-02, 06-11, 07-20, 08-26 | Older image models (December 1, 2026), GPT-5 and o3 snapshots (December 11, 2026), audio and realtime models (January 20, 2027), Whisper and transcription models (February 26, 2027). | 6 months |
| 2026-08-26 | Assistants API shut down, as announced a year earlier. | 12 months |

#### OpenAI reasoning-model usage limits (55 versions of two help articles, September 2024 – February 2026)

The two articles began as "OpenAI o1-preview and o1-mini Usage Limits on ChatGPT and the API" and "Using OpenAI o1 models and GPT-4o models on ChatGPT," and were renamed as new models replaced old ones. The launch version said "Rate limits will be tight during the preview, but we intend to raise them over time." Every change to a limit was a raise, and each was announced on Twitter.

| Date | Change | Announced |
| --- | --- | --- |
| 2024-09-13 to 2024-09-18 | ChatGPT: o1-mini from 50 messages a week to 50 a day; o1-preview from 30 a week to 50 a week. | OpenAI on Twitter, September 17, 2024 |
| 2024-09-18 to 2024-10-07 | API: o1 access widened from Tier 5 only to Tiers 3–5; o1-preview from 100 to 10,000 requests a minute at Tier 5. | OpenAIDevs on Twitter, September 17 and 24 and October 1, 2024 |
| 2024-12-05 | ChatGPT Pro added with "near unlimited access," subject to the terms of use and "a temporary restriction on your usage" when misuse is suspected. | Announced with Pro |
| 2025-04-16 | o3 and o4-mini replace o1 and o3-mini: Plus gets 50 a week with o3, 150 a day with o4-mini, 50 a day with o4-mini-high. | Announced with the models |
| 2025-04-22 to 2025-04-25 | All three doubled: 100 a week with o3, 300 a day with o4-mini, 100 a day with o4-mini-high. | Altman on Twitter, April 23, 2025 |
| 2025-05-07 to 2025-05-16 | Pro "offers near unlimited access" becomes "offers unlimited access." | Not dated |
| 2025-05-21 to 2025-06-12 | API: the models are "available to qualified API users," no longer "all API users," on paid tiers. | Not dated |

The page was not updated for the GPT-5 limits of August 2025; those are on the GPT-5 article.

#### OpenAI legacy-model access for business workspaces (14 versions, August 2025 – July 2026)

Created after GPT-5 launched on August 7, 2025: workspace admins could turn on GPT-4o, o3, o3 Pro, GPT-4.1 and GPT-4.5 "for a limited transition period."

| Date | Change | Announced |
| --- | --- | --- |
| 2025-08-18 to 2025-10-14 | "Team" dropped from the title and from "all Team and Enterprise workspaces." ChatGPT Team was renamed Business in 2025 (Fidji Simo's posts use "ChatGPT Business" by October 23, 2025), and the April 2026 version names Business customers again, so this reads as a rename, not a cut. | n/a |
| 2026-02-01 | Notice that GPT-4o, GPT-4.1, GPT-4.1 mini, o4-mini and GPT-5 "will be retired from ChatGPT" on February 13, 2026. | Announced January 29, 2026 (entry `2025-08-13-altman-4o-plenty-of-notice`) |
| 2026-03-11 to 2026-04-17 | Business, Enterprise and Edu "will retain access to GPT-4o within Custom GPTs until April 3, 2026." | On the page |
| 2026-05-27 to 2026-07-02 | GPT-4.5 removed from the list: "retired from ChatGPT on June 26, 2026, including for custom GPTs." | Notice found only after the fact, on this page. No post about it on OpenAI's Twitter accounts; the ChatGPT release notes could not be reached (403) |

Every version since February 2026 says GPT-4o and GPT-4.1 "have been retired from ChatGPT and are no longer available" while still listing both under "Legacy models available."

#### OpenAI GPT-4 access and rate-limit help articles (97 versions of two articles, March 2023 – August 2025)

"How can I access GPT-4?" (later renamed for GPT-4o, GPT-4o mini and GPT-4.1 mini) and "What are the GPT-4 rate limits?" for the API. Every version said the ChatGPT cap would be adjusted "depending on demand and system performance."

| Date | Change | Announced |
| --- | --- | --- |
| 2023-03-30 to 2023-06-06 | Plus cap: "We’re initially providing subscribers with 100 messages every 4 hours" becomes "a cap of 25 messages every 3 hours." | Not on the page; no announcement found (the archive has no copy between March 30 and June 6) |
| 2023-06-18 to 2023-08-28 | API: "apply for a rate limit increase" becomes "We are unable to accommodate requests for rate limit increases due to capacity constraints." | Not dated |
| 2023-06-12 to 2023-07-09 | API access for paying developers from July 6; "We plan to open up access to new developers by the end of July 2023." | OpenAI on Twitter, July 6, 2023 |
| 2023-07-19 to 2023-07-22 | Plus cap raised to 50 messages every 3 hours. | OpenAI on Twitter, July 19, 2023 |
| 2023-08-08 to 2023-08-11 | "by the end of July 2023" becomes "soon"; on August 20–22 new accounts get access after $0.50 of prepaid credit. The date was missed by about three weeks and the page changed without a note. | Not dated |
| 2023-11-09 to 2023-11-10 | "We are not currently granting access to GPT-4-32K ... it will be made available at a later date" removed, four days after GPT-4 Turbo (128k context) launched. | Not dated |
| 2024-01-05 to 2024-01-06 | Plus cap lowered from 50 to 40 messages every 3 hours: "As of January 5th 2024, GPT-4 has a limit of 40 messages every 3 hours." On January 24: "we may dynamically adjust the message limit." | Dated on the page; no announcement found. New entry: `2024-01-05-gpt-4-plus-cap-lowered` |
| 2024-02-20 to 2024-02-26 | API access now needs $5 of payments (usage tier 1) instead of $1. | Not dated |
| 2024-05-13 | GPT-4o: Plus gets 80 messages every 3 hours on GPT-4o, 40 on GPT-4. | Announced with GPT-4o |
| 2025-01-07 to 2025-02-04 | Pro added: "The GPT-4 and GPT-4o message caps for a Pro user is virtually unlimited." | Not dated (Pro launched December 5, 2024) |
| 2025-07-08 to 2025-07-10 | Plus GPT-4o cap: "up to 80 messages ... within a three-hour window" becomes "Up to 5x the Free plan access"; Pro and Team: GPT-4o "Unlimited access"; GPT-4.1 mini "Unlimited access" on every plan, Free included. The article no longer states a number for Plus. | Not dated |

#### OpenAI ChatGPT Enterprise limits (26 versions of two articles, March 2024 – October 2026)

| Date | Change | Announced |
| --- | --- | --- |
| 2024-03-13 to 2024-12-03 (earliest capture March 2024) | "ChatGPT Enterprise has no usage caps." | OpenAI launched Enterprise on Twitter on August 28, 2023 with "unlimited high-speed GPT-4 access" |
| 2024-12-03 to 2025-04-10 | Becomes "Most mainline models on ChatGPT Enterprise do not have message limits. The o1 series of models have limits." | Not dated. Reasoning models had published limits from their launch |
| 2025-05-03 | New "Models & Limits" article: "unlimited high-speed access to GPT-4o and our OpenAI o3 reasoning models," with a table of per-model limits (GPT-4.5 20 a week, o3 100 a week, o1-pro 5 a month; o3-pro replaces o1-pro at 15 a month in July). | On the page |
| 2025-08-15 | GPT-5: "virtually unlimited GPT-5 messages," subject to the Services Agreement's abuse rules; GPT-5 Thinking 200 a week ("the long term rate limit, but we've temporarily increased it"); agent mode 40 and deep research 25 a month. | With GPT-5 |
| 2026-03-27 to 2026-05-09 | The table of per-model limits is removed. | Not dated |
| 2026-06-24 to 2026-07-29 | "unlimited messages with GPT-5.5 Instant" becomes "access to eligible current models"; "virtually unlimited GPT-5.5 messages" becomes "virtually unlimited messages for eligible base models"; "Model availability and limits change over time, so the model picker and workspace settings are the source of truth." | Not dated |
| 2026-09-07 to 2026-10-03 | "Model access and virtually unlimited messages do not mean zero-dollar usage. On Enterprise agreements with token-based USD billing, usage, including Instant, is billable at your applicable rates." | Links to a token-based billing article. These terms are set in each customer's contract, so no public announcement was expected |

The no-caps sentence was found only by comparing across a rewrite; see the method note on track boundaries.

#### OpenAI ChatGPT pricing page (223 versions, January 2024 – October 2026)

From August 2025 the archive alternates between two layouts of the page from one capture to the next, so after reading the version-by-version changes to that point, every distinct sentence and table cell was listed once with the first and last date it appears, and that list was read in full. From October 21, 2025 the archived text no longer contains prices (they load per region), so price changes after that date could not be checked from these copies.

| Date | Change | Announced |
| --- | --- | --- |
| 2024-01-10 to 2024-05-17 | Plus $20 a month; Team $25 per user a month billed annually, $30 monthly. These stay the same through October 2025, the last copy with prices; Pro launches at $200 on December 5, 2024. | Announced with each plan |
| 2024-01-12 to 2024-01-17 | Team: "No training on your data" becomes "Team data excluded from training by default"; Enterprise likewise. "Enterprise plans are available starting at 150 users" removed. | Not dated |
| 2024-05-13 | GPT-4o: Free gets "Limited access to GPT-4o"; Plus "Up to 5x more messages for GPT-4o." | Announced with GPT-4o |
| 2024-10-30 to 2024-11-10 | Enterprise card: "Unlimited, high speed access to GPT-4, GPT-4o, GPT-4o mini" loses "Unlimited"; the comparison table changes Team's "Higher limits than Plus" and Enterprise's "Unlimited" to "Expanded." | Not dated; no announcement found. The Enterprise help page said "no usage caps" until at least December 3, 2024 |
| 2024-12-05 to 2024-12-12 | Pro: "Unlimited* access to GPT-4o and o1," footnote "*Subject to abuse limits," a week later "*Usage must be reasonable and comply with our policies." | With Pro |
| 2025-03-28 | "Unlimited subject to abuse guardrails" note added to Pro. | On the page |
| 2025-05-05 to 2025-05-11 | Nonprofit discount: "a 20% discount on subscriptions to ChatGPT Team and a 50% discount to ChatGPT Enterprise" becomes 20% on Team and "a 25% discount on ChatGPT Enterprise." From February 10, 2026: "up to a 75% discount on ChatGPT Business or ChatGPT Enterprise." | Not dated |
| 2025-06-03 to 2025-06-08 | Team and Enterprise: GPT-4o back to "Unlimited*"; reasoning models move from "Standard"/"Expanded" to "Flexible**," with "**Enterprise plans can purchase credits for more access" (Team too from July). | With flexible pricing |
| 2025-08-07 to 2025-08-09 | GPT-5: Free gets GPT-5 with limits; Plus "Extended access"; Pro and Team "Unlimited*." | Announced with GPT-5 |
| 2025-08-13 to 2025-08-18 | Free context window stated as 16K for non-reasoning models (was 8K); 196K for reasoning on every plan. | With GPT-5 |
| 2025-08-23 to 2025-08-30 | Team renamed Business. | Announced |
| 2026-01-16 | ChatGPT Go added to the table between Free and Plus. | OpenAI on Twitter, January 16, 2026 (Go had launched in India in August 2025) |
| 2026-03-25 to 2026-04-11 | Context windows restated per plan and model (Free 27K, Go and Plus 54K, Pro 128K for Instant), with a note that "The portion available for user input is smaller than the total window." | On the page |
| 2026-04-10 | Pro offered as "5x or 20x more usage" (two tiers); from September 30, "Your choice of 3 usage tiers." | Prices not in the archived text |
| 2026-08-07 | Free: "Unlimited text chats with GPT-5.6 Luna," "subject to abuse guardrails." | No post about it found on OpenAI's Twitter accounts |

No archived version raises the listed price of a plan while it had prices in the text. The Enterprise "unlimited" wording is the one change that cut what a plan said it included without a note; the help-page history (above) shows the same.

### Anthropic pages

#### Anthropic usage policy (20 versions, March 2024 – October 2026)

Anthropic keeps each superseded version at a "Previous Version" link. The archive also caught copies dated May 13 and June 5, 2024 that alternate with the June 6 version until August 2025; they match it in substance and were set aside.

| Date | Change | Announced |
| --- | --- | --- |
| 2023-09-15 (first capture March 2024) | Acceptable Use Policy with "Prohibited Uses" and "Prohibited Business Cases." | Dated |
| 2024-06-06 (posted May 10) | Renamed Usage Policy and restructured into Universal Usage Standards. Explicit ban on promoting "a particular political candidate, party, issue or position" and on lobbying; bans on biometric inference and on identifying content to censor for governments; API products for minors allowed with safeguards; more countries' law enforcement allowed back-office uses. | Announced ("Updating our Usage Policy," May 10, 2024) |
| 2025-09-15 (posted August 15) | Adds a section banning attacks on computer systems. Political rules narrowed from a ban on all campaigning and lobbying to deceptive or disruptive activity and voter targeting. Law enforcement: the ban on "any official local, state or national law enforcement application," with exceptions for back-office and missing-persons work, becomes a ban on "any law enforcement application that violates or impairs the liberty, civil liberties, or human rights of natural persons"; scoring people is barred only "without notification or their consent"; emotion recognition is allowed "for medical or safety reasons." High-risk requirements now apply only to consumer-facing uses. | Announced ("Usage Policy update," August 15, 2025), including the political change. On law enforcement Anthropic said the update "does not change what is allowed or prohibited"; the new wording reads broader than the old. Reporting at the time described Anthropic refusing federal agencies' surveillance uses. |

#### Anthropic consumer terms (42 versions, March 2024 – October 2026)

The same address serves European and Canadian versions to some visitors; those copies (19) were set aside and the U.S. versions read in order. Every new version carries a new effective date and a "Previous Version" link.

| Date | Change | Announced |
| --- | --- | --- |
| 2024-04-15 | Suspension "in our sole judgment" becomes "we reasonably believe"; software may update "without advance notice." | Note on the page ("We've recently updated our Terms") |
| 2024-05-01 | Billing and refunds through app stores follow the store's terms. | Dated |
| 2024-06-13 | Notice before linking a work account to an employer: new exception where "the organization is responsible for notifying you ... we may not provide additional notice." | Note on the page |
| 2024-09 to 2024-11 | "The 'Initial Term' for Claude Pro is one month" removed. | Not dated (same effective date) |
| 2025-02-19 | Adds a Supported Regions Policy and a content-removal process; fees per the pricing page "unless otherwise communicated." | Dated |
| 2025-04-15 | Adds content moderation for third-party content, with notice and appeal. | Dated |
| 2025-05-01 | Adds "Actions" Claude takes on a user's behalf, which "may not be error free." | Dated |
| 2025-09-28 (posted August 28; effective date later moved to October 8) | Consumer chats used for training "unless you opt out"; bars relying on Claude for securities advice; 7-day cancellation right in Brazil, Mexico, South Korea and Taiwan. | Announced (blog post and in-app notice). Entry: `2025-08-28-consumer-data-training-default` |
| 2025-10-08 | Effective date moved from September 28 to October 8. | Dated |

#### Anthropic commercial terms (8 versions, February 2024 – October 2026)

| Date | Change | Announced |
| --- | --- | --- |
| 2024-01-03 (first capture February 2024) | "Anthropic may not train models on Customer Content from paid Services"; terms updates take effect 30 days after posting or notice; copyright indemnity covering "data Anthropic has used to train a model." | Dated |
| 2024-03-04 | Commercial terms limited to business use; data processing addendum attached; credits terms. | Dated |
| 2024-05-01 and 2024-05-16 | Anthropic may name customers publicly; Anthropic Ireland for European customers; arbitration in Dublin for them. | Dated |
| 2025-02-24 | No-training promise extended from "paid Services" to all "Services." Reselling barred. | Dated |
| 2025-06-17 | Customers can opt out of being named publicly. | Dated |
| 2026-03-12 | Section numbering only, under the same effective date. | n/a |

#### Anthropic privacy policy (30 versions, February 2024 – October 2026; Anthropic's own archive back to July 2023)

One 2015 capture at the same address is a parked-domain page from before Anthropic existed; it was set aside.

| Date | Change | Announced |
| --- | --- | --- |
| 2024-03-04 | Rewritten. "Anthropic also does not engage in targeted advertising using your personal data" replaced by "If we share your personal data for targeted advertising to promote our products and services in the future, you can opt-out and we will honor global privacy controls." Adds that Anthropic will "not train our models" on Inputs or Outputs except flagged or reported content or opt-ins; adds a notice-of-changes promise. | Dated, with a link to the previous version; no announcement of the advertising change found. Graded as an eroded commitment |
| 2024-05-01 | Policy now also covers end users of commercial products like the Team plan. | Dated |
| 2024-05-13 | Anthropic Ireland becomes controller for European users; adds a data protection officer. | Dated |
| 2024-06-05 | Names training data sources (public internet, licensed datasets, user and crowd-worker data); deleted conversations removed from the back end "within 30 days"; rights requests about training data "are limited." | Dated |
| 2024-08 and 2024-11 | Adds a Brazil supplement and a statement on encryption and access controls, under the existing June 5 date. | Not dated |
| 2024-12-17 | Rewritten; "You can opt-out of sharing your personal data for targeted advertising to promote our products and services" — sharing for marketing is now current practice. Training data details move to a separate notice. | Dated; no announcement found |
| 2025-02-19 | Adds processing of non-users' data and optional features. | Dated |
| 2025-09-28 (posted August 28; effective October 8) | Consumer chats used for training unless users opt out; flagged content may also be used to "advance AI safety research"; marketing added as a legitimate interest. | Announced. Entry: `2025-08-28-consumer-data-training-default` |
| 2025-11 | Adds a Korea supplement under the existing October 8 date. | Not dated |
| 2026-01-12 | Health app integrations and a consumer health data policy. | Dated |
| 2026-07-08 (posted June 8) | Rewritten. Adds age and identity verification data, including ID images and "facial geometry templates"; research study data; disclosure to authorities where Anthropic has "a good-faith belief that disclosure is reasonably necessary"; "We have measures in place to detect and remove children"; "will not attempt to re-identify" de-identified data; "tailored recommendations" about its services. | Published a month ahead, with a note on the page |
| 2026-09-10 | Korea addendum expanded. | Dated |

#### Anthropic usage-limit help pages

**About Claude Pro usage** (28 versions, September 2023 – July 2025; the article has since been removed)

| Date | Change | Announced |
| --- | --- | --- |
| 2023-11-21 | Drops "Over two thirds of all conversations on claude.ai (as of September 2023) have been within this length." | Not dated |
| 2024-04-02 to 2024-04-05 | "at least 100 messages every 8 hours" becomes "around 45 messages every 5 hours." | No note, announcement or reporting found. New entry: `2024-04-claude-pro-allowance-lowered` |
| 2024-10 to 2024-11 | Warning before the limit: "before you have 7 messages remaining" becomes "1 message." | Not dated |
| 2025-05-03 | Example of how long attachments use up the limit removed; advice to use Projects, whose cached content counts less, added. | Not dated |

**About Claude's Max plan usage** (19 versions, April 2025 – January 2026)

| Date | Change | Announced |
| --- | --- | --- |
| 2025-05-06 to 2025-05-11 | "Each session ... we expect it to be fairly generous" replaced by a "50 sessions" a month guideline, "not a strict cut-off." | Not dated |
| 2025-07-25 to 2025-07-29 | "5x" and "20x more usage than Pro" become "per session"; the promise of a warning when messages run low is removed; estimates now assume "a less compute-intensive model"; the 50-session guideline becomes the right to impose "weekly and monthly caps or model and feature usage, at our discretion." | The weekly caps were announced July 28; the other edits were not noted. Update added to `2025-07-28-claude-weekly-limits` |

**Using Claude Code with your Pro or Max plan** (31 versions, June 2025 – April 2026)

| Date | Change | Announced |
| --- | --- | --- |
| 2025-06-06 | Claude Code switches Max users from Opus to Sonnet at 20% (Max 5x) or 50% (Max 20x) of their limit. | On the page |
| 2025-08-06 | Weekly estimates: Pro "40-80 hours of Sonnet 4," Max 5x "140-280 hours of Sonnet 4 and 15-35 hours of Opus 4," Max 20x "240-480" and "24-40." | With the weekly caps |
| 2025-10-31 | Paid "extra usage" after hitting the limit. | Announced |
| 2025-12-04 | Pro users can use Opus in Claude Code only with paid extra usage; the earlier estimates are relabeled "Usage Limits for Older Models"; the Opus-to-Sonnet switching section is removed. | Not dated |

#### Anthropic consumer pricing page (104 versions, May 2025 – October 2026)

Plan prices did not rise: Pro stayed at $17 a month billed annually ($20 monthly), Max at $100 and $200. The Team standard seat fell from $25 to $20 a month (January 2026). Enterprise moved to "$20/seat. Usage is billed as you go at API rates" (March 2026). Model prices listed on the page match the API pricing page; apparent increases in the archive are rows reordered when the page was redesigned in September 2026. On September 17, 2025 the Max line "Choose 5x or 20x more usage per session than Pro" dropped "per session" on this page, while the help page kept it.

#### Anthropic API pricing pages (65 versions, March 2024 – October 2026)

Read across four addresses (anthropic.com/api, then the documentation site in three places). No price rose for a model already on sale; apparent increases are column reorders and models moved to a "retired" list. New Opus models came in cheaper than earlier ones (Opus 4.5 at $5/$25 per million tokens against $15/$75 for Opus 4.1). Sonnet 5 launched at an "introductory" $2/$10 through August 31, 2026; on September 2, 2026 the page said that price "is now the standard price" and "the previously scheduled increase to $3/$15 ... will not occur."

#### Anthropic model deprecations page (47 versions from 102 archived copies, September 2024 – October 2026)

Eight versions, December 2025 to August 2026, are archived as empty page shells with no page text; the page's own deprecation history fills in the retirements announced in that time.

| Date | Change | Announced |
| --- | --- | --- |
| 2024-09-07 to 2024-09-12 | Notice before retirement raised from "at least 60 days" to "at least 6 months," with a 60-day exception for the Claude 1 family; the "Guaranteed Available Until" date goes from "typically" to "at least" one year after launch. | Not dated |
| 2025-02-27 to 2025-03-04 | The "Guaranteed Available Until" promise and column removed. Every model listed was later kept at least until its guaranteed date. | No note found |
| 2025-06-26 to 2025-07-15 | Opus 3 retirement announced June 30 for January 2026 (189 days). | On the page |
| 2025-08-07 to 2025-08-10 | Notice cut from "at least 6 months" to "at least 60 days"; "Not sooner than" retirement dates added, a year after each active model's release; new warning that deprecated models "are likely to be less reliable." Three days later the Sonnet 3.5 models got 70 days' notice (retired after 76). | Not in the August 2025 API release notes; no reporting found. New entry: `2025-08-model-retirement-notice-cut` |
| 2025-10-13 to 2025-10-17 | Retirement column renamed "Tentative Retirement Date." | Not dated |
| 2025-11-08 to 2025-11-21 | "Deprecation downsides and mitigations" section added, pointing to the weight-preservation commitment. | With the November 4 post |
| 2026-09-09 (first readable copy since December 2025) | Claude Mythos Preview listed as deprecated June 9, 2026, retirement "To be announced." "Deprecated" redefined: no longer "not available for new customers," now "still functional but no longer recommended." The 60-day notice promise is unchanged. | On the page |
| 2025-08 to 2026-09 | Seven retirement notices after the cut: 76, 114, 62, 60, 62, 61 and 61 days. | Each on the page |

#### Anthropic data retention help articles

**How long do you store my organization’s data?** (39 versions from 79 archived copies, July 2023 – October 2026; titled "How long do you store personal data?" until April 2025)

| Date | Change | Announced |
| --- | --- | --- |
| 2023-08-11 to 2023-09-13 | API deletion "within 30 days ... unless you request otherwise" becomes "unless we mutually agree otherwise"; consumer and beta chats flagged for trust and safety review may be used to train trust and safety models. | Not dated |
| 2023-10-08 to 2023-10-12 | API: "28 days," "except when we need to retain them for longer to enforce our AUP or comply with the law" (replacing a fixed 90 days for prompts that "may violate" the policy). Consumer: deleted within 90 days. | Not dated |
| 2024-04-19 to 2024-06-22 | One rule "For all products": deleted within 30 days (consumer down from 90); flagged chats kept up to 2 years; the 7-year retention of safety scores, until then for all products, now only for flagged chats. Users can delete individual chats, gone from the back end within 30 days. | Not dated |
| 2025-04-01 to 2025-04-24 | Split into commercial and consumer articles; Enterprise customers can set custom retention. | Not dated |
| 2025-08-10 to 2025-08-30 | Feedback kept 5 years instead of 10. | Not dated |
| 2025-11-12 to 2025-12-02 | New API exception: services "with longer retention under your control (e.g. Files API)." Organization incognito chats deleted within 30 days unless flagged. | Not dated |
| 2026-06-08 to 2026-06-09 | Covered Models paragraph added: "we require limited data retention and review." | Explained in a new article the same day. Graded as an eroded commitment |
| 2026-06-27 to 2026-07-03 | "flagged by our trust and safety classifiers" becomes "automated trust and safety systems." | Not dated |

**How long do you store my data?** (consumer; 29 versions from 66 archived copies, April 2025 – October 2026)

| Date | Change | Announced |
| --- | --- | --- |
| 2025-08-21 to 2025-08-28 | Five-year retention for users who allow training, 30 days for those who don't; feedback kept 5 years instead of 10. | Announced August 28, 2025 (entry `2025-08-28-consumer-data-training-default`) |
| 2025-09-09 to 2025-09-17 | Incognito chats not used for training even with the setting on. | With incognito chats |
| 2025-11-13 to 2025-12-23 | Five-year retention restated as "in a de-identified format ... in our model training pipelines"; chats may also be kept "to resolve disputes." | Not dated |

**Data retention practices for Covered Models** (11 versions from 20 archived copies, June – October 2026; first titled "for Mythos-class models")

| Date | Change | Announced |
| --- | --- | --- |
| 2026-06-09 | Prompts and outputs of Mythos-class models kept 30 days on every platform, including for organizations with zero data retention, which must turn retention on to use them. | Announced with the models |
| 2026-06-20 to 2026-07-03 | "Anthropic employees cannot access your conversations unless they are flagged for potential serious harm or upon a customer’s written request" becomes "By default, no Anthropic personnel can read your retained conversations. Human review can occur only through a controlled access path—for example, when content is flagged ... for potential harm"; the line about tooling that "prevents export, copying, or downloading" is removed. | No note of the change. Graded as an eroded commitment |
| 2026-07-03 to 2026-07-14 | Renamed "Covered Models"; extended to "future models we release that are similarly or more capable." | Not dated |
| 2026-08-30 to 2026-09-09 | Some zero-retention organizations "will receive notice that they are eligible to use Fable with ZDR." | Linked article |

#### Anthropic API rate limits page (58 versions, May 2024 – October 2026)

Eight versions, December 2025 to August 2026, are archived as empty page shells; the API release notes cover that gap. Most changes raised limits.

| Date | Change | Announced |
| --- | --- | --- |
| 2024-09-09 to 2024-09-17 | Free API tier (up to $10 a month without buying credits) removed; Tier 1 limits raised tenfold (Claude 3.5 Sonnet from 5 to 50 requests a minute). | Not dated |
| 2024-10-02 to 2024-11-12 | New line: "All limits described here represent maximum allowed usage, not guaranteed minimums." | Not dated |
| 2024-11-12 to 2024-11-24 | Per-minute and daily token limits replaced by separate input and output limits per minute. | Release notes, November 20, 2024 |
| 2025-02-05 to 2025-02-24 | Cached input starts to stop counting toward the input limit ("gradually rolling out"), later for most models. | On the page |
| 2025-04-02 to 2025-04-08 | Waiting periods between usage tiers removed. | Not dated |
| 2025-07 | Sonnet 4 and Opus 4 limits raised (Tier 2 input from 40,000 to 450,000 tokens a minute). | Release notes, July 17 and 24, 2025 |
| 2025-07-29 to 2025-08-06 | Opus 4 and Opus 4.1 share one combined limit (later Sonnet 4 and 4.5 too). | On the page |
| 2026-03-13 | Separate long-context limits removed; standard limits apply at every length. | Release notes |
| 2026-06-26 | Tiers consolidated into Start, Build and Scale; Sonnet and Haiku limits raised to match Opus. "No organization receives lower limits than before." | Release notes |
| By 2026-09-01 (first readable copy since November 2025) | New organizations "may start in the Evaluation tier, with limits below the standard limits shown on this page." | Not in the release notes |
| 2026-09-16 to 2026-09-18 | Organizations on Claude Platform on AWS can now move up tiers automatically. | Not dated |

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
the first after it sentence by sentence (44 boundaries across 18 pages).
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
- **Pages with no captures.** No archived copies could be pulled for GPT-5 limits (help), ChatGPT Plus (help), Team/Business limits (help), so their histories were not read.
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
