# Lobbying and political money (workstream 6)

Every lobbying and political-contribution filing we could find for OpenAI and
Anthropic in public government data, tabulated by year and company. The goal
was to set what each company spends, and what it says it lobbies on, next to
what it says in public about regulation. Collected October 7, 2026.

Nothing here is an entry by itself. Findings that matter went into entries
(listed at the end).

## Sources

| Data | Where | What was read |
|---|---|---|
| Federal lobbying reports (LD-1, LD-2) | `lda.gov/api/v1/filings/`, client names containing OpenAI or Anthropic | 130 filings: 2 in-house registrants, 13 outside firms, 1 subcontractor (`federal-filings.json`) |
| Federal contribution reports (LD-203) | `lda.gov/api/v1/contributions/`, both registrants | 50 reports, every item (`federal-contributions.json`) |
| New York | NY Commission on Ethics and Lobbying in Government open data: client semi-annual reports (`data.ny.gov` dataset qym9-xzj6) and registrations (se5j-cmbb) | All rows naming either company as client |
| California | CAL-ACCESS bulk export (`campaignfinance.cdn.sos.ca.gov/dbwebexport.zip`), read table by table with HTTP range requests, because the Cal-Access website blocks this sandbox | Cover pages, summary totals, payments to firms, activity expenses, other payments and campaign contributions for filer IDs 1468792 (OpenAI OpCo), 1478037 and 1476544 (Anthropic PBC) |
| Washington | Public Disclosure Commission open data (`data.wa.gov` 9nnw-c693, xhn7-64im, biux-xiwe) | All rows naming either company |

All of this is free public data. No API key was used.

## Method

- **Federal totals.** An organization that lobbies for itself must include
  what it pays outside firms in its own reported expenses (LDA guidance,
  revised Feb. 28, 2025: payments to outside lobbying firms "must be included
  in the total expenses of an organization employing lobbyists on its own
  behalf"). So a year's total is the company's in-house expenses when it had
  an in-house registration, and the sum of its outside firms' income when it
  did not (Anthropic, 2023). Adding both would double count.
- **Subcontractors.** Tower 19 reported $20,000 a quarter from "Aquia Group on
  behalf of Anthropic, PBC". Under the guidance the prime firm pays the
  subcontractor, so that money is already inside Aquia's income and is not
  added. This is why our Anthropic 2023 figure is $200,000; TechCrunch,
  citing OpenSecrets, reported $280,000.
- **Rounding.** Federal amounts are reported rounded to the nearest $10,000.
- **Amendments.** Where a report was amended, the latest version replaces the
  original, in every jurisdiction.
- **"OPEN AI."** Mercury Public Affairs registered in 2025 for a client named
  "OPEN AI" (California, "artificial intelligence"). We count it as an OpenAI
  outside firm. It does not change any total, because outside-firm fees sit
  inside OpenAI's in-house figure.
- **New York** totals are compensation and reimbursement for each lobbyist,
  plus the client's expenses for non-lobbying employees and itemized expenses,
  per six-month period.
- **California** totals are the Form 635 total (in-house lobbyists, payments to
  lobbying firms, activity expenses, other payments to influence legislative
  or administrative action, and Public Utilities Commission payments), or the
  Form 645 total for Anthropic's first report (Q3 2024).
- **Filings record what a company lobbied on, not which side it took.** Where
  a position is stated below, it comes from the company's own public
  statements, already in the record.

## Tables

### Federal (Lobbying Disclosure Act), reported spending by year

| Year | OpenAI | Anthropic | Quarters filed (OpenAI / Anthropic) |
|---|--:|--:|---|
| 2023 | $260,000 | $200,000 | 1 / 4 |
| 2024 | $1,760,000 | $720,000 | 4 / 4 |
| 2025 | $2,990,000 | $3,130,000 | 4 / 4 |
| 2026 (Q1–Q2) | $2,220,000 | $3,530,000 | 2 / 2 |
| **Total** | **$7,230,000** | **$7,580,000** | |

### Federal, by quarter

| Quarter | OpenAI in-house | OpenAI outside firms | Anthropic in-house | Anthropic outside firms |
|---|--:|--:|--:|--:|
| 2023 Q1 | — | — | — | $50,000 |
| 2023 Q2 | — | — | — | $50,000 |
| 2023 Q3 | — | — | — | $50,000 |
| 2023 Q4 | $260,000 | $120,000 | — | $50,000 |
| 2024 Q1 | $340,000 | $190,000 | $100,000 | $60,000 |
| 2024 Q2 | $480,000 | $140,000 | $150,000 | $60,000 |
| 2024 Q3 | $430,000 | $140,000 | $220,000 | $60,000 |
| 2024 Q4 | $510,000 | $220,000 | $250,000 | $60,000 |
| 2025 Q1 | $560,000 | $290,000 | $360,000 | $60,000 |
| 2025 Q2 | $620,000 | $310,000 | $920,000 | $150,000 |
| 2025 Q3 | $920,000 | $340,000 | $1,010,000 | $150,000 |
| 2025 Q4 | $890,000 | $330,000 | $840,000 | $240,000 |
| 2026 Q1 | $1,020,000 | $330,000 | $1,560,000 | $600,000 |
| 2026 Q2 | $1,200,000 | $330,000 | $1,970,000 | $900,000 |

### Bills named in each company's own (in-house) federal reports

| Quarter | OpenAI | Anthropic |
|---|---|---|
| 2023 Q1 | — | — |
| 2023 Q2 | — | — |
| 2023 Q3 | — | — |
| 2023 Q4 | 3: H.R.6881, S.2770, S.3312 | — |
| 2024 Q1 | 3: H.R.6881, S.2770, S.3312 | 0 (issue areas only) |
| 2024 Q2 | 3: H.R.6881, S.2770, S.3312 | 0 (issue areas only) |
| 2024 Q3 | 4: H.R.9551, S.2770, S.3312, S.4875 | 4: H.R.5077, H.R.9497, S.2714, S.4178 |
| 2024 Q4 | 5: H.R.9497, S.2770, S.3312, S.4178, S.4875 | 4: H.R.5077, H.R.9497, S.2714, S.4178 |
| 2025 Q1 | 0 (issue areas only) | 0 (issue areas only) |
| 2025 Q2 | 0 (issue areas only) | 1: H.R.1 |
| 2025 Q3 | 0 (issue areas only) | 1: S.2296 |
| 2025 Q4 | 0 (issue areas only) | 2: H.R.4776, H.R.5885 |
| 2026 Q1 | 0 (issue areas only) | 3: H.R.6875, H.R.7757, S.4046 |
| 2026 Q2 | 0 (issue areas only) | 12: H.R.6875, H.R.7757, H.R.8170, S.1705, S.3062, S.3108, S.4046, S.4476, S.4615, S.4656, S.4707, S.4728 |

### New York (client semi-annual reports)

| Period | OpenAI | Anthropic |
|---|--:|--:|
| 2024 July/Dec | $14,713 | — |
| 2025 Jan/June | $78,842 | $4,284 |
| 2025 July/Dec | $71,214 | $48,872 |
| 2026 Jan/June | $78,365 | $77,738 |

### California (Form 635 / 645 totals)

| Quarter | OpenAI | Anthropic |
|---|--:|--:|
| 2024 Q2 | $34,154 | — |
| 2024 Q3 | $67,567 | $77,605 |
| 2024 Q4 | $38,154 | — |
| 2025 Q1 | $38,000 | $25,000 |
| 2025 Q2 | $38,624 | $60,927 |
| 2025 Q3 | $41,082 | $80,322 |
| 2025 Q4 | $38,123 | $37,500 |
| 2026 Q1 | $165,394 | $41,260 |
| 2026 Q2 | $1,169,395 | $47,747 |
| **2024** | **$139,875** | **$77,605** |
| **2025** | **$155,829** | **$203,749** |
| **2026 (Q1–Q2)** | **$1,334,790** | **$89,007** |

### Washington (monthly lobbyist reports)

| Month | OpenAI | Anthropic |
|---|--:|--:|
| 2026-03 | $673 | — |
| 2026-04 | $0 | — |
| 2026-05 | $0 | — |
| 2026-06 | $0 | — |
| 2026-07 | $0 | — |
| 2026-08 | $0 | — |
| 2026-09 | — | $7,000 |

### Federal contribution reports (LD-203), by year

| Company | Year | Kind | Items | Amount |
|---|---|---|--:|--:|
| Anthropic | 2025 | company: FECA contributions | 1 | $50,000.00 |
| Anthropic | 2025 | registered lobbyists, personal (FECA) | 4 | $3,250.00 |
| Anthropic | 2026 | company PAC (FECA) | 13 | $58,000.00 |
| Anthropic | 2026 | registered lobbyists, personal (FECA) | 3 | $2,500.00 |
| OpenAI | 2023 | registered lobbyists, personal (FECA) | 3 | $2,500.00 |
| OpenAI | 2024 | company: honorary and meeting expenses | 3 | $50,000.00 |
| OpenAI | 2024 | registered lobbyists, personal (FECA) | 6 | $2,450.00 |
| OpenAI | 2025 | company: honorary and meeting expenses | 1 | $15,000.00 |
| OpenAI | 2025 | registered lobbyists, personal (FECA) | 22 | $17,766.53 |
| OpenAI | 2026 | company: honorary and meeting expenses | 3 | $230,000.00 |
| OpenAI | 2026 | registered lobbyists, personal (FECA) | 23 | $15,550.00 |

50 reports read; where a report was amended, the amendment replaces the original.

## What the filings show next to what the companies said

**Spending.** Over the whole period, federal spending is close: $7.23 million
for OpenAI (from Q4 2023) and $7.58 million for Anthropic (from Q1 2023).
From Q4 2023, when OpenAI registered, through Q1 2025, OpenAI spent more every
quarter. Anthropic has spent more in four of the five quarters since, and in the first half of 2026 it spent $3.53 million to
OpenAI's $2.22 million. In the states the picture reverses: OpenAI's
California spending reached $1,169,395 in Q2 2026, against $47,747 for
Anthropic.

**OpenAI: specific in 2024, unspecific since.** In May 2023 Altman asked the
Senate for a licensing agency for powerful AI (entry
2023-05-16-altman-senate-licensing-agency). OpenAI registered to lobby for
itself in November 2023. Its reports for Q4 2023 through Q4 2024 named three
to five bills each, including the Future of Artificial Intelligence Innovation
Act and the AI Advancement and Reliability Act. Its six reports from Q1 2025
through Q2 2026, covering $5.21 million, name no bill. They list issue areas
only: "Artificial intelligence, cloud computing and infrastructure,
cybersecurity, privacy" and "Artificial intelligence, copyright." In that same
period OpenAI asked the White House for "preemption from state-based
regulations" (2025-03-13-ostp-preemption-request), and Altman told the Senate
that requiring approval before release would be "disastrous"
(2025-05-08-altman-senate-disastrous). The filings do not say what OpenAI
asked for, so the missing bill numbers show less disclosure, not a position.

**OpenAI in California and New York.** OpenAI listed SB 1047 on all three of
its 2024 California reports. It opposed the bill in public
(2024-08-21-opposes-sb-1047). It listed SB 53 on every 2025 report and urged
Newsom to treat federal or EU compliance as compliance. Of its $1,169,395 in
Q2 2026, $1,103,814 is on the "other payments to influence legislative or
administrative action" line. The bulk export carries no itemization for that
line, so what the money paid for cannot be seen in this data. In New York
OpenAI listed S6953 and A6453-B, the RAISE Act, in 2025. By 2026 it was
endorsing the Act (update on 2025-03-13-ostp-preemption-request).

**Anthropic: names its bills.** Anthropic's federal reports name specific bills
in 7 of 10 in-house quarters, rising to 12 bills in Q2 2026. These include the
Secure and Accountable Military AI Act and the Responsible Artificial
Intelligence Defense Act, in the quarter after its Pentagon dispute. In Q2
2025 its report lists "H.R.1 - One Big Beautiful Bill Act; provisions related
to artificial intelligence." The House-passed H.R. 1 contained a 10-year bar on
states enforcing AI laws (Sec. 43201(c), H.R. 1 Engrossed in House, govinfo.gov).
That quarter Amodei's New York Times op-ed called the moratorium "far too
blunt an instrument" (update on 2024-08-21-anthropic-sb-1047-sb-53). In
California it listed SB 1047 in 2024 and SB 53 in every report since 2025;
it endorsed SB 53 in public. In New York it listed the RAISE Act (S6953,
A6453) in 2025 and endorsed it.

**Political money.** The filings separate company money from personal money:

- OpenAI's company reports list no contributions to candidates, parties or
  PACs. They list $295,000 in honorary and meeting expenses for congressional
  caucus foundations and the Congressional Management Foundation, $230,000 of
  it in the first half of 2026. The large political money on OpenAI's side is
  personal: Greg and Anna Brockman's $25 million to Leading the Future and
  $25 million to MAGA Inc., and Altman's $1 million to Trump's inaugural fund
  (2025-08-25-leading-the-future-super-pac).
- Anthropic's company report lists $50,000 to the Trump Vance Inaugural
  Committee (Jan. 8, 2025). Its 2026 mid-year report lists a new
  employee-funded PAC, AnthroPAC, which gave $58,000 to 13 committees on June
  29, 2026: $32,000 to Republican and $26,000 to Democratic committees. On top
  of that are its $40 million to Public First Action, which Anthropic says
  cannot be used in elections (2026-02-12-public-first-action-donation).
- Neither company reported campaign contributions on its California lobbying
  reports.

## What could not be done

- **Positions.** No filing in any jurisdiction records support or opposition.
- **California's "other payments" line.** No itemization in the bulk export
  for OpenAI's $1.10 million in Q2 2026 or its $137,644 in Q1 2026.
- **Other states.** Only California, New York and Washington were checked:
  California and New York because the main frontier-AI bills moved there, and
  Washington because a search found both companies registered there in 2026. Other states with AI bills (Illinois, Texas, Colorado and
  others) were not searched; their lobbying databases are search-form only.
- **EU.** The EU Transparency Register was not part of this workstream. The
  record's 2023 EU AI Act lobbying entry rests on reporting.
- **Federal Election Commission data.** The FEC's API needs a key, which this
  project does not use. AnthroPAC's receipts and its own filings were
  therefore not read; its contributions come from Anthropic's LD-203.

## Record changes from this workstream

- `anthropic/2026-02-12-public-first-action-donation`: update with the
  inaugural donation and AnthroPAC.
- `openai/2025-08-25-leading-the-future-super-pac`: update with OpenAI's own
  LD-203 reports and Altman's inaugural gift.
- `anthropic/2024-08-21-anthropic-sb-1047-sb-53`: corrected the 2023 figure
  from $280,000 to $200,000 (see Method).
