# Reading queue

Built 2026-10-02. Every post an in-scope account wrote (from December 2015 on, with text) that has no decision yet. There is no topic filter: read each post in full, in context, and decide. Then record the decisions for an account with

```
npm run reading-queue -- --log <account> < decisions.txt   # lines: "<post id> <R|L|C> <note>"; unlisted posts are recorded as O
```

R is a receipt candidate, L a lead to check, C context for an existing entry, O nothing for the record. See [TRIAGE.md](TRIAGE.md).

Nothing to read: every post collected so far has a decision.
