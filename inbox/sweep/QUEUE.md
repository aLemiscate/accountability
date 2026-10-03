# Reading queue

Built 2026-10-03. Every post an in-scope account wrote (from December 2015 on, with text) that has no decision yet. There is no topic filter: read each post in full, in context, and decide. Then record the decisions for an account with

```
npm run reading-queue -- --log <account> < decisions.txt   # lines: "<post id> <R|L|C> <note>"; unlisted posts are recorded as O
```

R is a receipt candidate, L a lead to check, C context for an existing entry, O nothing for the record. A claim is any notable public claim or promise the record covers: safety, ethics and policy, and also capabilities and benchmarks, features and release dates, usage limits and plan terms, promises about how a product behaves, and dated predictions. See [TRIAGE.md](TRIAGE.md).

Nothing unread: every post collected so far has a decision.

## Read so far only for safety, ethics and policy claims

Until October 2026 the record covered safety, ethics and policy claims only, and posts were read with that in mind. 15,763 post(s) written while their author was at the company (or after) still need a reading for every kind of claim. Print an account's list with `npm run reading-queue -- --rescope <account>` and record the reading with `--rescope <account> --log`.

| Account | To re-read | Posted |
| --- | --: | --- |
| @paulfchristiano | 6 | 2017-01-11 to 2026-09-09 |
| @hlntnr | 343 | 2021-01-04 to 2026-07-30 |
| @Miles_Brundage | 10193 | 2018-01-01 to 2026-08-26 |
| @sjgadler | 267 | 2021-11-19 to 2026-09-02 |
| @DKokotajlo | 42 | 2024-06-04 to 2026-07-30 |
| @GretchenMarina | 493 | 2019-10-27 to 2024-09-29 |
| @RosieCampbell | 418 | 2021-01-22 to 2026-04-16 |
| @clwainwright | 7 | 2020-05-28 to 2024-09-30 |
| @leopoldasch | 59 | 2023-03-14 to 2024-10-11 |
| @EvanHub | 13 | 2023-05-31 to 2026-09-09 |
| @sleepinyourhat | 515 | 2022-01-06 to 2026-05-19 |
| @EthanJPerez | 100 | 2022-02-07 to 2026-02-10 |
| @hilbertspaess | 190 | 2021-11-22 to 2026-09-09 |
| @MrinankSharma | 6 | 2023-03-13 to 2026-02-09 |
| @annaadeola | 6 | 2022-03-15 to 2022-04-06 |
| @RichardMCNgo | 2755 | 2021-01-01 to 2026-04-14 |
| @JacobHHilton | 20 | 2021-12-16 to 2025-07-22 |
| @sashadem | 14 | 2023-03-15 to 2026-03-11 |
| @JasonDClinton | 24 | 2021-12-12 to 2025-11-13 |
| @logangraham | 43 | 2021-07-16 to 2026-05-13 |
| @fish_kyle3 | 11 | 2021-12-09 to 2026-04-07 |
| @Jack_W_Lindsey | 35 | 2022-06-14 to 2026-07-06 |
| @TrentonBricken | 203 | 2021-06-02 to 2026-04-07 |
