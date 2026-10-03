# Market learning — how Accuphy keeps learning to sell better

Jason, 2026-09-25: "基于你对我们的全盘了解 做深入用户和市场研究 持续学习如何让accuphy卖得更好"
(do deep user and market research based on everything you know about us, and keep learning how
to make Accuphy sell better).

This folder is the shared memory for that work. Any Claude chat on this project reads it before
giving sales or marketing advice, and writes what it learns back here before its turn ends.

## Rounds so far

| Round | Date | Where | Sources that only that round had |
|---|---|---|---|
| 0 | 2026-09-24 | `docs/users-and-market.md` (canonical copy + Chinese summary: Google Drive `My Drive/Market Research/`) | ~150 customer email threads, Zoho invoices, local Sales files, customer-service and pro-staff files |
| 1 | 2026-09-25 | this folder (`report-2026-09.md` and the files below); Chinese summary page for Jason (private artifact): https://claude.ai/artifact/1ke4uhCspxV4UJVHwJM3N5 | Shopify market settings, Klaviyo reports, public forums / YouTube / competitor prices |

Round 0 is the foundation (personas P1–P4, "the screen is already in the angler's pocket", the
B2B share, the status-ladder study behind decision #53). Round 1 builds on it and adds the
learning system below. **Drive `My Drive/Market Research/` is Jason's long-term company copy;
this folder is the working memory every chat reads.** After each round, a Chinese summary goes to
the Drive folder (with Jason's OK).

## Files

| File | What it holds | How it changes |
|---|---|---|
| `report-2026-09.md` | The first deep research round: who buys, why, what stops them, competitors, channels, and the recommended plan | Frozen snapshot. The next big round gets a new dated report |
| `metrics.md` | Sales, funnel, traffic, email numbers from Shopify / Klaviyo, and the exact queries to rerun | Add a dated section each refresh; never overwrite old numbers |
| `competitors.md` | Live-sonar products, prices, strengths, weaknesses, and how they market | Update prices and launches with the date seen |
| `voice-of-customer.md` | What anglers say: motivations, objections, words they use, quotes with sources | Add quotes as found (anonymised) |
| `experiments.md` | Hypotheses and proposed tests, scored, with status and results | Every test moves proposed → approved → running → result |
| `learning-log.md` | Numbered, dated learnings (L1, L2 …), each with evidence and confidence | Append only, like `docs/decisions.md` |
| `klaviyo-changes.md` | Every change to live Klaviyo content: before → after, approval, check; plus how Klaviyo edits work from a chat | Append a numbered entry per change |
| `klaviyo-backups/` | Full template JSON taken before a Klaviyo change, for diffing and restoring | Add one file per template per change |

## The loop

1. **Measure.** Rerun the queries in `metrics.md` §9 and add the new numbers.
2. **Listen.** Support themes (Help Scout), return reasons, reviews, post-purchase survey answers,
   forum / Reddit / YouTube comments about PingLive and live sonar.
3. **Scan.** Competitor launches and prices, tournament rules on forward-facing sonar, tariffs,
   shows, creators.
4. **Decide.** Propose one to three experiments to Jason from `experiments.md`. Nothing is built
   or changed in the store, Klaviyo or ads until he says go (CLAUDE.md: "我没说动不要动").
5. **Test and record.** Result into `experiments.md`, the lesson into `learning-log.md`, any
   decision into `docs/decisions.md`.

**Cadence:** a light refresh in the first week of every month; deeper reviews
**after Black Friday / Cyber Monday (≈ 10 Dec)**, **after ice-out (≈ 1 Apr)** and **before the
season plan (≈ 1 Aug)**.

## Rules

- Date every fact and give its source. Mark confidence: **high** (our own data, or a primary
  source read directly), **medium** (reputable secondary source or a search summary),
  **low** (vendor market reports, single anecdotes, background knowledge not re-checked).
- Aggregates only. No customer names, emails or order numbers in this repo (it is private, but
  still shared by several chats). Quote anglers anonymously ("a Reddit user in r/IceFishing").
- Keep the RMA portal and the Distributor Portal out of here (CLAUDE.md). Market facts such as
  "a distributor exists in Germany" are fine; contract terms and partner prices are not.
- Research is not approval. Plans, proposals and options are offered to Jason, then wait.
- English is the source language for these files; Jason's own words are quoted in Chinese.

## Access notes for cloud sessions (learned 2026-09-25)

- The Shopify, Klaviyo, Zoho CRM and Google Drive connectors work for read-only analysis.
  The Shopify analytics API rate-limits after two or three quick queries; space them out.
- **WebFetch is blocked** by the sandbox proxy for most sites, including `shop.accuphy.com`,
  retailer sites, `asafishing.org`, `garmin.com`, `sec.gov` and Wikipedia. Use WebSearch results
  and the Shopify connector (product copy, prices, markets) instead.
- **WebSearch is capped at 200 searches per session**, shared with sub-agents. The first round
  used it all. Run each research round in a fresh session and split searches between agents
  deliberately (about 40–50 each).
- **Klaviyo is read-only for flow emails.** The connector reads flows and templates, but saving a
  flow email fails (404), so Jason makes flow-email edits in the Klaviyo editor and a chat checks
  them against a backup. Details: `klaviyo-changes.md`.
