# Reading queue

Built 2026-10-02. Every post an in-scope account wrote (from December 2015 on, with text) that has no decision yet. There is no topic filter: read each post in full, in context, and decide. Then record the decisions for an account with

```
npm run reading-queue -- --log <account> < decisions.txt   # lines: "<post id> <R|L|C> <note>"; unlisted posts are recorded as O
```

R is a receipt candidate, L a lead to check, C context for an existing entry, O nothing for the record. A claim is any notable public claim or promise the record covers: safety, ethics and policy, and also capabilities and benchmarks, features and release dates, usage limits and plan terms, promises about how a product behaves, and dated predictions. See [TRIAGE.md](TRIAGE.md).

Nothing unread: every post collected so far has a decision.

## Read so far only for safety, ethics and policy claims

Until October 2026 the record covered safety, ethics and policy claims only, and posts were read with that in mind. 41,679 post(s) written while their author was at the company (or after) still need a reading for every kind of claim. Print an account's list with `npm run reading-queue -- --rescope <account>` and record the reading with `--rescope <account> --log`.

| Account | To re-read | Posted |
| --- | --: | --- |
| @OpenAI | 1534 | 2015-12-11 to 2026-09-08 |
| @sama | 3529 | 2015-12-02 to 2026-09-12 |
| @gdb | 2861 | 2015-12-11 to 2026-08-17 |
| @ilyasut | 492 | 2016-07-28 to 2026-02-27 |
| @janleike | 213 | 2021-01-22 to 2026-05-07 |
| @kalinowski007 | 17 | 2024-11-04 to 2026-05-17 |
| @AnthropicAI | 928 | 2021-05-28 to 2026-09-10 |
| @DarioAmodei | 15 | 2024-10-11 to 2026-09-12 |
| @jackclarkSF | 3848 | 2016-03-04 to 2026-05-19 |
| @OpenAINewsroom | 85 | 2024-09-04 to 2026-05-07 |
| @FoundationOAI | 1 | 2026-04-08 to 2026-04-08 |
| @jasonkwon | 48 | 2020-03-27 to 2026-05-17 |
| @btaylor | 16 | 2023-11-22 to 2026-05-04 |
| @merettm | 7 | 2023-11-22 to 2026-02-15 |
| @markchen90 | 94 | 2020-06-17 to 2026-09-08 |
| @nickaturley | 59 | 2022-01-21 to 2026-04-21 |
| @fidjissimo | 42 | 2024-03-19 to 2026-05-15 |
| @thsottiaux | 132 | 2025-08-17 to 2026-09-11 |
| @kevinweil | 175 | 2024-06-10 to 2026-04-17 |
| @miramurati | 88 | 2020-06-11 to 2026-05-11 |
| @woj_zaremba | 397 | 2018-05-17 to 2026-04-08 |
| @johnschulman2 | 67 | 2021-05-03 to 2026-05-11 |
| @boazbaraktcs | 104 | 2023-07-19 to 2026-05-17 |
| @jachiam0 | 2289 | 2018-11-08 to 2026-09-12 |
| @JoHeidecke | 17 | 2022-04-20 to 2025-10-27 |
| @zicokolter | 2 | 2024-08-08 to 2025-11-10 |
| @paulfchristiano | 6 | 2017-01-11 to 2026-09-09 |
| @hlntnr | 343 | 2021-01-04 to 2026-07-30 |
| @Miles_Brundage | 10193 | 2018-01-01 to 2026-08-26 |
| @sjgadler | 267 | 2021-11-19 to 2026-09-02 |
| @DKokotajlo | 42 | 2024-06-04 to 2026-07-30 |
| @GretchenMarina | 493 | 2019-10-27 to 2024-09-29 |
| @RosieCampbell | 418 | 2021-01-22 to 2026-04-16 |
| @clwainwright | 7 | 2020-05-28 to 2024-09-30 |
| @leopoldasch | 59 | 2023-03-14 to 2024-10-11 |
| @claudeai | 269 | 2025-07-30 to 2026-09-01 |
| @mikeyk | 46 | 2024-05-15 to 2026-04-16 |
| @ch402 | 2053 | 2018-01-04 to 2026-05-18 |
| @EvanHub | 13 | 2023-05-31 to 2026-09-09 |
| @sleepinyourhat | 515 | 2022-01-06 to 2026-05-19 |
| @EthanJPerez | 100 | 2022-02-07 to 2026-02-10 |
| @AmandaAskell | 2731 | 2018-04-04 to 2026-05-09 |
| @hilbertspaess | 190 | 2021-11-22 to 2026-09-09 |
| @MrinankSharma | 6 | 2023-03-13 to 2026-02-09 |
| @OpenAIDevs | 507 | 2023-12-14 to 2026-09-22 |
| @bradlightcap | 41 | 2016-06-08 to 2026-05-11 |
| @adamdangelo | 186 | 2018-04-24 to 2025-11-06 |
| @LHSummers | 202 | 2023-11-15 to 2025-11-10 |
| @bobmcgrewai | 41 | 2019-05-23 to 2025-12-02 |
| @npew | 422 | 2019-09-18 to 2026-05-15 |
| @embirico | 39 | 2024-06-24 to 2026-05-01 |
| @annaadeola | 6 | 2022-03-15 to 2022-04-06 |
| @lilianweng | 106 | 2018-08-22 to 2026-05-18 |
| @joannejang | 136 | 2019-09-08 to 2026-04-21 |
| @w01fe | 23 | 2019-09-27 to 2026-08-26 |
| @polynoamial | 193 | 2023-06-16 to 2026-08-01 |
| @aidan_mclau | 134 | 2024-06-19 to 2026-09-12 |
| @tszzl | 58 | 2021-02-01 to 2023-03-23 |
| @RichardMCNgo | 2755 | 2021-01-01 to 2026-04-14 |
| @JacobHHilton | 20 | 2021-12-16 to 2025-07-22 |
| @DanielaAmodei | 10 | 2021-05-28 to 2022-04-29 |
| @NotTomBrown | 189 | 2018-03-30 to 2026-05-19 |
| @8enmann | 31 | 2020-02-29 to 2022-08-14 |
| @samsamoa | 38 | 2020-03-01 to 2022-05-28 |
| @karpathy | 815 | 2015-12-03 to 2026-09-12 |
| @sashadem | 14 | 2023-03-15 to 2026-03-11 |
| @JasonDClinton | 24 | 2021-12-12 to 2025-11-13 |
| @logangraham | 43 | 2021-07-16 to 2026-05-13 |
| @alexalbert__ | 356 | 2023-01-02 to 2026-05-19 |
| @bcherny | 172 | 2025-11-13 to 2026-09-11 |
| @_catwu | 58 | 2024-04-12 to 2026-05-12 |
| @fish_kyle3 | 11 | 2021-12-09 to 2026-04-07 |
| @Jack_W_Lindsey | 35 | 2022-06-14 to 2026-07-06 |
| @TrentonBricken | 203 | 2021-06-02 to 2026-04-07 |
