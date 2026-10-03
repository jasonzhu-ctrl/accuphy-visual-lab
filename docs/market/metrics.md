# Market metrics — baseline and refresh recipe

**What this is:** the numbers every market-learning round starts from. First pulled
**2026-09-25** by Claude, read-only, through the Shopify and Klaviyo connectors (plus Zoho CRM
and Google Drive for context). Each refresh adds a dated row or a dated section; never overwrite
old numbers, so the trend stays visible.

**Scope and caveats**

- Shopify DTC only (`shop.accuphy.com`, store currency **CAD**). Dealer, distributor and
  trade-show invoices outside Shopify are **not** in these numbers.
- "Orders" come from ShopifyQL `sales` (order date); the funnel comes from `sessions`
  (POS and draft orders have no session, so the two differ slightly).
- Sessions include bots and non-buyers (Russia 10k and China 4.4k sessions, 0 orders). Compare
  conversion **by country**, not the global rate.
- "direct" traffic also holds untagged ads, emails, dealer links, QR codes and the Linktree bio.
  Until links carry UTM tags, "direct" is partly unattributed marketing.
- Aug–Sep 2025 funnel counts are inconsistent (more completed checkouts than the cart step
  implies), probably the pre-order app (PreOrder Globo) bypassing the tracked cart. Treat
  those two months' funnel ratios as unreliable.
- No personal data is stored here: aggregates only.

## 1. Headline (Apr 2025 – 25 Sep 2026, ~17 selling months)

| Metric | Value |
|---|---|
| Orders | **460** |
| Gross sales | **CAD 578.5k** |
| Discounts | CAD 39.0k (6.7 % of gross) |
| Returns (sales reversals) | CAD 50.1k (**8.7 %** of gross) |
| Net sales | **CAD 489.4k** |
| Customers | 434, of whom 23 bought again (5.3 %) |
| Sessions | 182.8k (71 % mobile, 28 % desktop) |
| Add-to-cart rate | 3.15 % of sessions |
| Reached checkout | 2.76 % of sessions (88 % of carts) |
| **Checkout completion** | **9.0 %** of sessions that reached checkout — **Canada 19.0 %, US 4.8 %** |
| Conversion rate | 0.25 % (Canada 0.59 %, US 0.15 %) |
| Winter share | Nov 2025 – Feb 2026 = 200 orders = **43 %** of all orders |

## 2. Month by month

AOV = (gross − discounts) ÷ orders. Checkout completion = completed ÷ reached checkout.

| Month | Orders | Gross CAD | Net CAD | AOV | Sessions | Conv. | Checkout completion |
|---|---|---|---|---|---|---|---|
| 2025-04 | 2 | 20 | 20 | – | 5,780 | – | test orders |
| 2025-05 | 25 | 42,816 | 36,586 | 1,607 | 7,441 | 0.32 % | 8 % |
| 2025-06 | 12 | 18,015 | 17,708 | 1,488 | 6,008 | 0.20 % | 6 % |
| 2025-07 | 11 | 17,270 | 14,607 | 1,455 | 6,370 | 0.22 % | 12 % |
| 2025-08 | 23 | 31,674 | 24,837 | 1,231 | 9,070 | 0.28 % | (unreliable) |
| 2025-09 | 18 | 25,545 | 18,109 | 1,273 | 9,252 | 0.36 % | (unreliable) |
| 2025-10 | 8 | 13,917 | 9,554 | 1,625 | 7,791 | 0.22 % | 9 % |
| 2025-11 | 43 | 61,990 | 49,254 | 1,218 | 10,750 | 0.38 % | 8 % |
| 2025-12 | **78** | **85,242** | 72,400 | 1,029 | 13,899 | **0.53 %** | 10 % |
| 2026-01 | 42 | 47,515 | 44,341 | 1,078 | 14,955 | 0.25 % | 6 % |
| 2026-02 | 37 | 46,715 | 39,438 | 1,176 | 14,740 | 0.20 % | 6 % |
| 2026-03 | 19 | 25,194 | 22,426 | 1,277 | 11,024 | 0.16 % | 6 % |
| 2026-04 | 56 | 71,040 | 59,666 | 1,232 | 13,200 | 0.39 % | 12 % |
| 2026-05 | 9 | 8,948 | 8,895 | 988 | 8,983 | 0.10 % | 4 % |
| 2026-06 | 10 | 10,883 | 9,919 | 1,088 | 8,808 | 0.11 % | 6 % |
| 2026-07 | 23 | 22,838 | 18,986 | 907 | 10,691 | 0.19 % | 9 % |
| 2026-08 | 32 | 36,261 | 33,485 | 1,105 | 10,378 | 0.29 % | 12 % |
| 2026-09 (to 25th) | 12 | 12,589 | 9,173 | 880 | 7,986 | 0.09 % | 6 % |

Reading it: the business is **winter-shaped** (pre-ice, Black Friday, holidays, ice season) with a
second bump in **April** (open water; April 2026 also had the highest return value, CAD 9.3k).
May–June is the trough. September 2026 is running below September 2025 (12 vs 18 orders) while
sessions are similar: watch it.

## 3. Products

Prices on 2026-09-25 (Shopify contextual pricing):

| Product | CAD | USD | EUR (DE / FR) | Stock |
|---|---|---|---|---|
| PingLive (135°, Down / Forward / Panoramic) | 1,749 | 1,262 | 1,499 / 1,550 | **9** |
| PingLive Mini (39°, Forward / Down / Combo) | 887 | 699 | 699 / 750 | 65 |
| 0° Mount | 38 (was 48) | 35 | 30.43 / 36.30 | 19 |
| KingFisher 10 | draft, no price | | | 0 |

Since Apr 2025:

| Product | Orders | Gross CAD | Share | Returned value | Units returned |
|---|---|---|---|---|---|
| PingLive | 270 | 426,193 | 74 % | 5.7 % | 13 (4.8 %) |
| PingLive Mini | 169 | 142,608 | 25 % | **12.6 %** | **21 (12.4 %)** |
| 0° Mount | 29 | 1,312 | <1 % | | |

By quarter (orders): PingLive 39 → 39 → **72** → 49 → 51 → **20**; Mini – → 9 → **58** → 42 → 19 → **41**
(Q2 2025 → Q3 2026 to date). In Q3 2026 the Mini outsold PingLive for the first time; PingLive
stock is down to 9 units, so part of that may be supply, not demand.

## 4. Geography

**By billing country (orders):** Canada 338 (80 % of gross), United States 105 (16 %), Norway 2,
Ukraine 1, Netherlands 1, Hungary 1, blank (POS) 12.

**Canada by province (orders, per million people):**

| Province | Orders | Per million |
|---|---|---|
| Manitoba | 51 | **34** |
| Saskatchewan | 20 | **16** |
| Ontario | 156 | 9.7 |
| Alberta | 39 | 7.8 |
| Quebec | 53 | 5.8 |
| British Columbia | 18 | 3.2 |

Population denominators are rounded 2025 estimates. The Prairies' ice-fishing and walleye country
buys at 2–3× Ontario's rate.

**US by state (orders):** Minnesota 11, Texas 10, Michigan 7, Wisconsin 7, Florida 7,
Pennsylvania 6, North Dakota 5, then ≤ 4 each. The ice belt (MN, WI, MI, ND) plus the
southern crappie/bass states (TX, FL, TN).

**Sessions by country:** US 69.2k (38 %), Canada 57.1k (31 %), Russia 10.3k, China 4.4k,
Germany 4.0k, France 3.8k, Hungary 2.5k, Finland 2.5k, Poland 2.4k, Australia 2.3k, Sweden 1.7k,
Latvia 1.6k, Japan 1.4k, Lithuania 1.3k. Europe together ≈ 25k sessions and almost no orders:
that demand has to go to local dealers.

**Funnel by country:**

| | Sessions | Add-to-cart | Reached checkout | Completed | Checkout completion |
|---|---|---|---|---|---|
| Canada | 57,100 | 3.1 % | 1,778 | 337 | **19.0 %** |
| United States | 69,169 | 3.6 % | 2,124 | 102 | **4.8 %** |

US checkout completion by month: 2 % (May 2025) … 3–6 % through the 2025–26 winter … then
**~10 % in Jul–Sep 2026**. Something improved in July 2026, but US shoppers still abandon at
checkout far more than Canadians.

**Availability (Shopify `publishedInContext`, 2026-09-25):** in the **United States only the
PingLive Mini is published**; PingLive and the 0° mount are not offered to US visitors. Canada,
Germany and France see all three products. US orders are therefore almost all Minis (US average
order ≈ CAD 890).

**Market settings (Shopify Markets, 2026-09-25):** the **United States market prices in USD with
`ADD_DUTIES_AT_CHECKOUT` and `ADD_TAXES_AT_CHECKOUT`**: import duties are added on top of the
price at the last step. France and Germany (EUR) also add duties at checkout; Benelux includes
duties in the price; Canada is CAD; an "International" market (22 countries) is in draft.

## 5. Traffic sources (sessions since Jan 2025)

| Source | Sessions | Orders | Conv. |
|---|---|---|---|
| Direct / none | 93,685 | 259 | 0.28 % |
| Google | 62,313 | 166 | 0.27 % |
| Facebook | 11,409 | 7 | 0.06 % |
| YouTube | 3,896 | 0 | 0 % |
| Instagram | 2,329 | 2 | 0.09 % |
| Yandex | 2,233 | 0 | 0 % |
| accuphy.ca / .com | 1,641 | 1 | 0.06 % |
| Bing | 1,341 | 7 | 0.52 % |
| DuckDuckGo | 872 | 2 | 0.23 % |
| Linktree | 675 | 0 | 0 % |
| Email (Gmail + Klaviyo) | 371 | 2 | 0.54 % |
| ChatGPT | 72 | 2 | 2.8 % |
| Reddit | 46 | 1 | 2.2 % |
| Paid (tagged) | 6 | 0 | – |

Also seen: wired2fish, fishingworld, primepower, flybc, kisaka-direct (≈ 35 each).
Paid traffic is essentially **untracked** (6 tagged sessions in 17 months), and social traffic
converts at a fifth of search.

## 6. Landing pages (sessions since Jan 2025)

| Page | Sessions | Conv. |
|---|---|---|
| `/` | 56,776 | 0.17 % |
| `/products/pinglive-sonar` | 42,399 | 0.28 % |
| `/en-us` | 28,333 | 0.16 % |
| `/products/pinglive-mini` | 12,772 | 0.20 % |
| `/en-us/products/pinglive-mini` | 11,423 | 0.25 % |
| `/fr` (Quebec French) | 2,522 | 0.24 % |
| `/fr/products/pinglive-sonar` | 2,364 | **0.51 %** |
| `/blogs/news/setup-guide-for-pinglive-sonar` | 784 | |
| `/pages/retail-locations` | 777 | |
| `/blogs/news/android-compatibility-list` | 623 | |
| `/pages/faq` | 607 | |

Only two blog posts earn traffic, and both answer pre-purchase worries (setup, Android
compatibility). There is no page for "what is live sonar", ice fishing, kayaks, or comparisons.

## 7. Email (Klaviyo, last 365 days)

| Program | Recipients | Open | Click | Orders | Revenue CAD |
|---|---|---|---|---|---|
| Abandoned-cart flow (2 emails) | 1,095 | 69 % | 12 % | **34** | **48,807** (44.6 per recipient) |
| PingLive new-customer welcome flow | 728 | 69 % | 20 % | – | – |
| PingLive Mini new-customer welcome flow | 41 | 68 % | 20 % | – | – |
| All campaigns (16 sends, Nov 2025 – May 2026) | ~9.5k sends | 41–63 % | 2–17 % | 7 | ~6.6k |

- The biggest campaign audience was ~1,660 people: the marketing list is small.
- **No campaign since 1 May 2026.** No browse-abandonment, review-request, referral, win-back or
  pre-purchase education flows.
- Lists include PreLaunch Canada, iCAST (2025), NonUSA iCAST PingLive Mini, Dealer Application,
  B2B inquiries (accuphy.com), newsletter lists for CA, USA, Romania, France, Benelux, Germany.
- Meta lead ads were connected in Nov 2025 ("Filled Out Lead Ad" metric).
- Help Scout (support desk) is connected: support conversations exist as data.

## 8. Other context (Drive / CRM, 2026-09-25)

- CRM: 73 leads (19 from trade shows); accounts with distributors or resellers in Belgium,
  Germany, France, Poland, Latvia, Paraguay, Australia and the US, plus contacts in ~10 more
  countries. Distribution agreements for Germany and Ukraine were signed in Aug–Sep 2026.
- Marketing folder shows iCAST 2025 and 2026, a Shanghai show (Mar 2026), Wired2Fish content
  (Aug 2026), a boat wrap, a 6-name creator shortlist (Feb 2025), and a new
  "2026 Ice fishing hut" B2B folder (22 Sep 2026).
- The retailer FAQ (May 2026) answers exactly five questions: pole options for each device,
  mirroring to a TV, connecting more than one phone or tablet, Router One Wi-Fi range, and
  "do I need cell service / is there latency". Those are the questions buyers ask.

## 9. Refresh recipe

Run these read-only queries each round (monthly, and right after Black Friday and after the ice
season). The Shopify analytics API rate-limits after two or three quick queries: space them out
and interleave Klaviyo calls.

```
FROM sales SHOW orders, gross_sales, discounts, sales_reversals, net_sales, average_order_value TIMESERIES month SINCE 2025-01-01 UNTIL today
FROM sales SHOW orders, net_items_sold, gross_sales, discounts, sales_reversals, net_sales GROUP BY product_title SINCE 2025-01-01 UNTIL today
FROM sales SHOW orders, net_items_sold, gross_sales GROUP BY product_title TIMESERIES quarter SINCE 2025-04-01 UNTIL today
FROM sales SHOW orders, gross_sales, net_sales GROUP BY billing_country SINCE 2025-01-01 UNTIL today
FROM sales SHOW orders, gross_sales GROUP BY billing_region SINCE 2025-01-01 UNTIL today ORDER BY orders DESC LIMIT 25
FROM sales SHOW orders, gross_sales, net_sales GROUP BY sales_channel SINCE 2025-01-01 UNTIL today
FROM sales SHOW customers, new_customers, returning_customers, returning_customer_rate SINCE 2025-01-01 UNTIL today
FROM sessions SHOW sessions, online_store_visitors, sessions_with_cart_additions, sessions_that_reached_checkout, sessions_that_completed_checkout, conversion_rate TIMESERIES month SINCE 2025-01-01 UNTIL today
FROM sessions SHOW sessions, sessions_with_cart_additions, sessions_that_reached_checkout, sessions_that_completed_checkout, conversion_rate GROUP BY session_country SINCE 2025-01-01 UNTIL today ORDER BY sessions DESC LIMIT 15
FROM sessions SHOW sessions, sessions_with_cart_additions, sessions_that_reached_checkout, sessions_that_completed_checkout, conversion_rate WHERE session_country = 'United States' TIMESERIES month SINCE 2025-04-01 UNTIL today
FROM sessions SHOW sessions, sessions_with_cart_additions, sessions_that_reached_checkout, sessions_that_completed_checkout, conversion_rate GROUP BY referrer_name SINCE 2025-01-01 UNTIL today ORDER BY sessions DESC LIMIT 25
FROM sessions SHOW sessions, sessions_with_cart_additions, sessions_that_completed_checkout, conversion_rate GROUP BY landing_page_path SINCE 2025-01-01 UNTIL today ORDER BY sessions DESC LIMIT 20
FROM sessions SHOW sessions, sessions_with_cart_additions, sessions_that_reached_checkout, sessions_that_completed_checkout, conversion_rate GROUP BY session_device_type SINCE 2025-01-01 UNTIL today
```

Klaviyo: `get_flow_report` and `get_campaign_report` for the last 365 days with the
"Placed Order" metric as the conversion metric; `get_lists` for new lists.
Shopify GraphQL (read-only): `markets` (currency, duty and tax inclusion per market) and product
`contextualPricing` per country.

## 10. KPI watch-list (compare every refresh)

| KPI | Baseline (2026-09-25) | Why it matters |
|---|---|---|
| US checkout completion | 4.8 % (≈ 10 % Jul–Sep 2026) | biggest leak in the store |
| Canada checkout completion | 19.0 % | reference for the US fix |
| Conversion rate, Canada | 0.59 % | core market health |
| Mini return rate (units) | 12.4 % | expectation gap on the entry product |
| Email-attributed revenue share | ≈ 11 % of net (CAD 55k / 489k) | owned channel growth |
| Marketing list size (largest send) | ~1,660 | fuel for every launch and sale |
| Tagged paid sessions | 6 | you cannot learn from untagged ads |
| Orders Nov–Feb | 200 (2025–26) | the season that pays the year |
