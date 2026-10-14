# Inbox

Working material for the record. Nothing here is part of the record itself.

- `sweep/`: every archived Twitter/X post by the accounts in
  `data/accounts.yaml`, one file per account and year, with the reading log
  that gives each post a decision. The weekly Watch workflow adds new posts
  here; `sweep/QUEUE.md` lists the ones nobody has read yet. Read each one and
  record a decision with `npm run reading-queue -- --log <account>`. If a post
  belongs in the record, start an entry with `npm run new -- … --url <post url>`
  (which also snapshots it). How the posts were read is in `sweep/TRIAGE.md`.
- `history/`: every archived version of the policy, terms and pricing pages in
  `data/history.yaml`, and `history/CHANGES.md`, the log of what changed.
- `spoken/`, `lobbying/`: the inventories and reading logs behind the spoken
  claims and lobbying sections of `COVERAGE.md`.
- `news/`: the weekly news sweep's reports.
- `audit/`, `checks/`: the October 13 audit and the open-promise re-check.

A manual `npm run find-posts` run (without `--store`) writes its candidates to
`inbox/<date>-<account>.md` and `.json`. Delete those files once they're read.
