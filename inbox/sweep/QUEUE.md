# Reading queue

Built 2026-10-03. Every post an in-scope account wrote (from December 2015 on, with text) that has no decision yet. There is no topic filter: read each post in full, in context, and decide. Then record the decisions for an account with

```
npm run reading-queue -- --log <account> < decisions.txt   # lines: "<post id> <R|L|C> <note>"; unlisted posts are recorded as O
```

R is a receipt candidate, L a lead to check, C context for an existing entry, O nothing for the record. A claim is any notable public claim or promise the record covers: safety, ethics and policy, and also capabilities and benchmarks, features and release dates, usage limits and plan terms, promises about how a product behaves, and dated predictions. See [TRIAGE.md](TRIAGE.md).

Nothing unread: every post collected so far has a decision.

## Read so far only for safety, ethics and policy claims

Until October 2026 the record covered safety, ethics and policy claims only, and posts were read with that in mind. 3,574 post(s) written while their author was at the company (or after) still need a reading for every kind of claim. Print an account's list with `npm run reading-queue -- --rescope <account>` and record the reading with `--rescope <account> --log`.

| Account | To re-read | Posted |
| --- | --: | --- |
| @sjgadler | 267 | 2021-11-19 to 2026-09-02 |
| @DKokotajlo | 42 | 2024-06-04 to 2026-07-30 |
| @RosieCampbell | 418 | 2021-01-22 to 2026-04-16 |
| @clwainwright | 7 | 2020-05-28 to 2024-09-30 |
| @leopoldasch | 59 | 2023-03-14 to 2024-10-11 |
| @annaadeola | 6 | 2022-03-15 to 2022-04-06 |
| @RichardMCNgo | 2755 | 2021-01-01 to 2026-04-14 |
| @JacobHHilton | 20 | 2021-12-16 to 2025-07-22 |
