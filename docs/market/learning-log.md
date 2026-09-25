# Learning log — what we have learned about selling Accuphy

Numbered, dated, append-only (like `docs/decisions.md`). Each learning states the evidence and a
confidence level (see `README.md`). When a later learning overturns an earlier one, add a new
entry that says so; do not edit the old one. Re-read the last number before appending.

## Round 1 — 2026-09-25 (first deep research)

L1. **2026-09-25 — The web store is a Canadian winter business.** Canada is 80 % of gross;
November–February 2025–26 brought 43 % of all orders; December 2025 was the best month
(78 orders, 0.53 % conversion). *Evidence:* Shopify sales and sessions, `metrics.md` §1–2.
*Confidence:* high.

L2. **2026-09-25 — The Prairies buy far above their size.** Manitoba bought 34 orders per
million people and Saskatchewan 16, against Ontario 9.7 and British Columbia 3.2. The US states
that buy are the ice belt (MN, MI, WI, ND) plus crappie/bass states (TX, FL, TN).
*Evidence:* Shopify billing regions. *Confidence:* high (numbers); medium (that it is ice and
walleye fishing driving it: consistent with the Ontario 2020 survey where walleye leads on the
ice, not yet confirmed by a customer survey).

L3. **2026-09-25 — Americans want it but drop out at checkout.** US visitors add to cart as often
as Canadians (3.6 % vs 3.1 %) but complete only 4.8 % of checkouts (Canada 19.0 %). The US market
is priced in USD with import duties added at checkout, shipped from Canada. US completion improved
to ≈ 10 % in Jul–Sep 2026. *Evidence:* Shopify sessions by country; Shopify Markets settings.
*Confidence:* high for the gap; medium for the cause until a test checkout confirms it
(experiment E1).

L4. **2026-09-25 — Social media starts interest; it does not close sales.** Facebook visitors
convert at 0.06 %, YouTube visitors at 0 % (3.9k sessions), against 0.27 % for Google. Paid
traffic is untagged (6 tagged sessions in 17 months), so ad performance is unknown.
*Evidence:* Shopify sessions by referrer. *Confidence:* high.

L5. **2026-09-25 — Email works where it exists, and it barely exists.** The abandoned-cart flow
returned CAD 44.6 per recipient (34 orders, CAD 48.8k in 12 months); email visitors convert at
twice the site average. But the largest send reached ~1.7k people and no campaign has gone out
since 1 May 2026. *Evidence:* Klaviyo flow and campaign reports. *Confidence:* high.

L6. **2026-09-25 — The entry product is returned 2.6× as often.** PingLive Mini: 21 of 169 units
returned (12.4 %); PingLive: 13 of 270 (4.8 %). Mini now outsells PingLive (Q3 2026: 41 vs 20
orders), so this gap will matter more. *Evidence:* Shopify net items sold by product.
*Confidence:* high (numbers); cause unknown (experiment E11).

L7. **2026-09-25 — Europe is searching for PingLive and cannot buy it here.** About 25k European
sessions (DE, FR, HU, FI, PL, SE, LV, LT) brought almost no orders, while dealers or distributors
now exist in several of these countries. *Evidence:* Shopify sessions by country; CRM accounts;
Drive agreements (existence only). *Confidence:* high.

L8. **2026-09-25 — Buyers' questions are practical, not technical.** The retailer FAQ answers
five questions (pole mounts, mirroring to a TV, several phones at once, Wi-Fi range, cell
service and latency), and the two blog posts that earn traffic are the setup guide and the
Android compatibility list. *Evidence:* Drive retailer FAQ (May 2026); Shopify landing pages.
*Confidence:* medium.

L9. **2026-09-25 — AI assistants and Reddit already send buyers.** ChatGPT (72 sessions, 2
orders) and Reddit (46 sessions, 1 order) convert at 2–3 %, ten times the site average.
*Evidence:* Shopify referrers. *Confidence:* low (tiny sample); watch it.

L10. **2026-09-25 — The US angler base shrank in 2025, but beginners are a real slice.**
57.0M Americans fished in 2025 (57.9M in 2024), with a record 19M lapsed; 6.3M were first-timers
(11 %), 41 % of them women; fewer than 6 % fish weekly; about 9M anglers also kayak.
*Evidence:* ASA 2026 Special Report on Fishing, via search summaries (source PDF not opened).
*Confidence:* medium.

L11. **2026-09-25 — The category leader is growing and refreshing its live sonar.** Garmin's
marine segment grew 10 % in 2025 (US$1.18B) and 14 % in Q2 2026, and Garmin announced a
next-generation LiveScope 2 in Q2 2026. Johnson Outdoors (Humminbird) grew fishing revenue 7 %
in its fiscal Q3 2026, partly through price increases. *Evidence:* company results via search
summaries. *Confidence:* medium. *Implication:* expect clearance deals on older LiveScope units
and a lot of "live sonar" attention; position PingLive as the affordable way in.

L12. **2026-09-25 — Owners are happy; non-owners doubt the phone, not the sonar.** Owners and
testers praise the image, the two-wire install and the value ("best value for money I've spent
on a fish finder", Lake Winnipeg greenbacks). Non-owners on North American forums worry about a
phone or tablet in the cold, battery drain, app quality and the connection. *Evidence:*
`voice-of-customer.md` §1. *Confidence:* medium (search excerpts; owner reviews are
seller-hosted).

L13. **2026-09-25 — Two myths block first impressions: "needs cell service" and "uses
Bluetooth".** Both appear in first-reaction threads (Nodak Angler, Bass Boat Central). PingLive
brings its own Wi-Fi router. The retailer FAQ already answers the cell-service question, but not
on the first screen buyers see. *Confidence:* medium.

L14. **2026-09-25 — "From China" is the first thing some US anglers hear.** Thread and article
titles lead with it ("New Live Scope From China", "Panoptix from China!"), split between "good
innovation" and privacy fears. Accuphy's About page says it was founded in 2020 with teams in
Beijing, Hangzhou, Ontario and Australia; the app publisher is Accuphy Technologies Ltd.; the
Canadian office is in Oakville. Telling that story openly beats letting others frame it.
*Confidence:* medium.

L15. **2026-09-25 — Creators frame PingLive against LiveScope, always.** Titles: "LiveScope
Killer?", "No Black Box & 70% Cheaper Livescope!", "Cheaper Than Livescope! Works with iPhone &
iPad", "Does It Actually Work?". LiveScope is the category's everyday name ("scope"; in French
"livescope" is a common noun). *Confidence:* medium.

L16. **2026-09-25 — European dealers sell kits and publish their own tests.** Germany: a set
with case and battery (≈ €230 more); Poland: a set with a tablet; Echolotzentrum's own test
("Überraschend starke Performance!"). PingBeam (side/down scan, €389) and Router TWO (two
transducers on one phone, €368) are sold in Germany but not in the North American store.
*Confidence:* medium.

L17. **2026-09-25 — Our own public facts disagree with each other.** PingLive range 240 ft vs
300 ft / 91 m; Mini weight 1.4 lb vs 1 lb 5 oz and thickness 1.5 in vs 2.3 cm; voltage 10–18 V
vs 11–18 V; Wi-Fi range 70–80 ft vs about 21 m. In search, "Ping" collides with a crypto token,
PING golf, Blue Robotics' Ping echosounder and PingGPS, and "Accuphy" with Accuphase. The US
store root showed a French page title in search results. *Evidence:* search excerpts
(`report-2026-09.md` §7). *Confidence:* medium; verify in Search Console.

L18. **2026-09-25 — Some communities are hostile to forward-facing sonar.** Musky tournament
trails and the Touring Anglers Association ban it, B.A.S.S. restricts it, and on Eagle Lake
(northwestern Ontario) a conservation group asks anglers to stop using it for muskies. Sell
learning, enjoyment and seeing what's down there; never "cheat", "edge" or "sharpshoot
muskies". *Confidence:* medium.

L19. **2026-09-25 — "No black box" is no longer ours; "no display to buy" is.** Garmin
LiveScope 2 (7 Jul 2026) has no black box, like Humminbird MEGA Live 2 and Lowrance Eagle Eye.
Every incumbent still needs its own brand display; no major brand lets a phone or tablet be the
screen. The store's product copy still leads with "built-in processor / no black box".
*Evidence:* `competitors.md` §1–2. *Confidence:* medium-high.

L20. **2026-09-25 — PingLive sits alone in the price gap.** The cheapest brand-name live sonar
is Lowrance Eagle Eye 9 (≈ US$915–999 with a 9" screen, one narrow beam, usable to ~50–60 ft);
mainstream systems start around US$2,800 with a display. PingLive (US$1,262 complete, 135°,
three views, 240 ft) sits between; PingLive Mini (US$699) sits below Eagle Eye.
*Confidence:* medium (prices from search summaries).

L21. **2026-09-25 — Incumbents cost 1.40–1.70× more in Canada than their US list.** LiveScope 2
CAD 2,799.95 vs US$1,999.99; MEGA Live 2 CAD 2,239.99 vs US$1,599.99; ActiveTarget 2 kit
≈ CAD 2,380 vs US$1,399.99 (all before a display). PingLive's CAD/USD ratio is 1.39.
*Confidence:* medium.

L22. **2026-09-25 — Rivals launch ice bundles in mid-September and time launches to shows.**
Humminbird's ICE XPLORE + MEGA Live 2 bundles came out 2025-09-16 (US$2,749.99 / 3,299.99);
Lowrance launched ActiveTarget 2 XL in January, Garmin its 360° sonar at the March Bassmaster
Classic and LiveScope 2 in July. MLF restricts forward-facing sonar at all levels from 2026.
*Confidence:* medium.

L23. **2026-09-25 — US shoppers cannot buy PingLive online.** Only the Mini is published for
the US market; PingLive and the 0° mount are not (Shopify `publishedInContext`). This confirms
Round 0 ("the US store sells the Mini only") and explains the US average order of ≈ CAD 890.
Whether it is deliberate is an open question for Jason. *Confidence:* high.

L24. **2026-09-25 — Round 0 is the foundation; by units Accuphy is a B2B business.** Round 0
(`docs/users-and-market.md`, 2026-09-24) found from Zoho invoices that about 94 % of sonar units
(May–Sep 2026) went through distributors and dealers, Europe was 81 % of B2B value and the Mini
57 % of B2B units; it also found that slow warranty service hurts loyalty more than faults, and
that friends (58 %) and fellow anglers (71 % most trusted) drive discovery. Round 1's store data
agrees where the two overlap (Canada-heavy, winter-shaped, US checkout loss, Mini returns).
*Confidence:* high for Round 0's own-data figures; see that file for its sources.
