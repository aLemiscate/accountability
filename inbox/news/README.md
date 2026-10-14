# Weekly news sweep

A scheduled Claude Code session runs every Monday at 06:46 UTC. It reads the
news and both companies' own channels for the week since the last sweep,
drafts entries and updates under the rules in
[METHODOLOGY.md](../../METHODOLOGY.md), and opens a pull request for review.
It never merges anything.

Each run writes one file here, `YYYY-MM-DD.md`, with:

- the window covered and the searches run (including at least one search in
  another language);
- what was added or changed, by entry id;
- open promises whose due date has passed, and what was found for each;
- whether a public S-1 has appeared on EDGAR for either company;
- leads not added, and why;
- sources that couldn't be reached from the session (left for the Capture
  workflow).

The weekly Twitter/X sweep (`inbox/YYYY-MM-DD-<account>.md`, from the Sweep
workflow) is read as one of the inputs.
