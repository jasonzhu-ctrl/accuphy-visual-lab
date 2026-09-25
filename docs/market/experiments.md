# Experiments — what to try next, and what we learned

Every idea to sell more lives here as a testable hypothesis. **All items are proposals until
Jason says go** (CLAUDE.md: "我没说动不要动"). Status: `proposed` → `approved` → `running` →
`done` (with result) or `dropped` (with reason).

Scoring (1–10 each): **Impact** on net sales, **Confidence** that it works (from evidence),
**Ease** (10 = an afternoon, 1 = months). Priority = I × C × E ÷ 100. Baselines come from
`metrics.md` (2026-09-25). "Q4" below means the 2026 pre-ice / Black Friday / holiday window.

## Summary (highest priority first)

| # | Experiment | I | C | E | Priority | Status |
|---|---|---|---|---|---|---|
| E1 | US landed-cost checkout (no duties surprise) | 9 | 7 | 7 | **4.4** | proposed |
| E15 | Product-page first screen: "no display to buy" + myth line | 7 | 7 | 8 | **3.9** | proposed |
| E4 | Checkout-abandon email v2 (3 emails, objection handling) | 6 | 8 | 8 | **3.8** | proposed |
| E5 | Q4 ice-season campaign built on the Prairie + ice-belt data | 9 | 7 | 5 | **3.2** | proposed |
| E19 | Cold-weather guide for phones and tablets on the ice | 6 | 7 | 7 | **2.9** | proposed |
| E3 | Reviews + post-purchase review request | 7 | 8 | 5 | **2.8** | proposed |
| E9 | Tracking hygiene: UTMs, pixel, "how did you hear about us?" | 5 | 9 | 6 | **2.7** | proposed |
| E2 | Pay over time (Shop Pay Installments / PayPal Pay Later) | 6 | 6 | 7 | **2.5** | proposed |
| E17 | Ice / Kayak / Boat kits | 6 | 7 | 6 | **2.5** | proposed |
| E20 | Pre- and post-purchase survey | 4 | 9 | 7 | **2.5** | proposed |
| E8 | Send European visitors to their local dealer | 5 | 7 | 7 | **2.5** | proposed |
| E16 | One official spec sheet + search hygiene | 4 | 8 | 7 | **2.2** | proposed |
| E7 | Email program: monthly send, browse abandonment, win-back, referral | 6 | 7 | 5 | **2.1** | proposed |
| E11 | Mini returns deep-dive (12.4 % of units) | 6 | 6 | 5 | **1.8** | proposed |
| E10 | Answer pages: comparison, ice, kayak, phone compatibility | 6 | 6 | 4 | **1.4** | proposed |
| E6 | Accuphy Lab → email → 5-part education series | 7 | 5 | 4 | **1.4** | proposed |
| E18 | PingBeam + Router TWO in North America (owner add-on) | 5 | 5 | 5 | **1.3** | proposed |
| E12 | Ice-hut operator pilot (try it in a rented hut) | 6 | 5 | 4 | **1.2** | proposed |
| E13 | Creator seeding in walleye / ice / kayak niches, with codes | 6 | 5 | 4 | **1.2** | proposed |
| E14 | Dealer demo days in Manitoba, Saskatchewan, Ontario | 5 | 5 | 4 | **1.0** | proposed |

Reading the table: E1, E15, E4, E5 and E19 are the pre-ice priorities; E3, E9, E17 and E20 run
alongside them.

## Details

### E1 — US availability and landed-cost checkout
- **Evidence:** US checkout completion 4.8 % vs Canada 19.0 %; US add-to-cart is *higher* than
  Canada's (3.6 % vs 3.1 %), so interest is there and the loss happens at the last step. The US
  market is set to `ADD_DUTIES_AT_CHECKOUT` (duties appear only at checkout) and ships from Canada.
  Only the Mini is published for the US; PingLive and the 0° mount are not offered there.
- **Question for Jason first:** is keeping PingLive out of the US store deliberate (territory,
  legal, supply)? If not, offering it (or pointing US visitors to a US dealer) is part of E1.
- **First step (15 min, no change to the store):** place a test checkout to a US address for
  each product and record item price, shipping, duties and tax. If duties or brokerage are large,
  the hypothesis holds.
- **Test:** switch the US market to duties-included pricing (or ship US orders from US stock),
  state "Price includes all import duties. No surprise fees." on the product page and in the cart,
  show delivery time. Keep the USD price the same and absorb part of the duty, or reprice to a
  clean USD point.
- **Metric:** US checkout completion (baseline 4.8 %; ≈ 10 % Jul–Sep 2026). **Target ≥ 12 %.**
- **Size of the prize:** if the US had matched Canada's completion rate since Apr 2025, about
  **300 more US orders** would have come from the same traffic (2,124 US checkouts × 19 % ≈ 404
  vs 102 actual) — roughly CAD 250–300k gross at US order values. Even half of that is the
  largest single lever found.

### E2 — Pay over time
- **Evidence:** AOV CAD 880–1,600; a CAD 1,749 item is a considered purchase. Canada still loses
  81 % of checkouts.
- **Test:** enable Shop Pay Installments (CA / US) and PayPal Pay Later; show
  "or 4 × CAD 437" under the price.
- **Metric:** checkout completion by country; share of orders using installments.

### E3 — Reviews and proof
- **Evidence:** product pages carry no review metafields (no visible star ratings); social proof
  comes only from YouTube and forums. An unknown brand at CAD 887–1,749 needs proof.
- **Test:** add a reviews app; a Klaviyo review request 21 days after delivery (after a first
  trip), asking for a photo or screen recording; show stars on product and collection pages.
- **Metric:** product-page conversion; number of reviews with media.

### E4 — Checkout-abandon email v2
- **Evidence:** the current 2-email flow earned CAD 48.8k from 1,095 recipients in 12 months
  (CAD 44.6 per recipient, 3.1 % conversion).
- **Test:** three emails per product: (1) 1 h: "your PingLive is waiting" + the five retailer-FAQ
  answers; (2) 24 h: unedited screen recording, warranty, returns, Canadian support; (3) 72 h:
  pay over time (E2), a reply-to-a-human line. No discount by default; test a small ice-season
  accessory gift instead of money off.
- **Metric:** revenue per recipient (baseline CAD 44.6).

### E5 — Q4 ice-season campaign
- **Evidence:** Nov 2025 – Feb 2026 = 43 % of all orders; December 2025 was the best month
  (78 orders, 0.53 % conversion). Manitoba buys at 34 orders per million people vs Ontario 9.7;
  the US states that buy are Minnesota, Michigan, Wisconsin, North Dakota.
- **Test:** an ice bundle for each device (PingLive Mini + 0° mount + ice pole guidance + battery
  advice), early access for the email list in October, Black Friday week, holiday gifting in
  December; ads geo-weighted to MB, SK, northern ON, QC, MN, WI, MI, ND. Content: "first ice with
  live sonar".
- **Metric:** Nov–Dec orders (baseline 121 in 2025), bundle take rate.

### E6 — Accuphy Lab as the top of an education funnel
- **Evidence:** social traffic converts at 0.06 % (Facebook) and 0 % (YouTube): people who meet
  PingLive on social are not ready to buy. The Lab exists to make live sonar understood by
  playing (decision #9) and its sign-up is planned (decision #45).
- **Test:** Lab → email → five emails over two weeks: what live sonar is; which PingLive fits
  (boat / kayak / ice); real screen footage; setup in ten minutes; the offer.
- **Metric:** lead → order rate within 60 days; compare with Meta lead ads.
- Depends on the mobile / lite-section decisions still open in `docs/backlog.md`.

### E7 — Email program basics
- **Evidence:** no campaign since 1 May 2026; ~1.7k reachable people; email-driven sessions
  convert at 0.54 %, twice the site average.
- **Test:** one useful email a month (a technique, a real catch on screen, an app update), browse
  abandonment, a win-back for old subscribers, a referral offer for owners (fishing buddies buy
  what their friend shows them on the water).
- **Metric:** email-attributed revenue share (baseline ≈ 11 % of net).

### E8 — European visitors to local dealers
- **Evidence:** ≈ 25k European sessions, almost no orders; France and Germany reach checkout
  (51 and 67 sessions) and complete none. Dealers or distributors exist in DE, FR, BE, PL, LV, HU,
  FI and UA.
- **Test:** a country banner "Buy PingLive from [dealer] in [country]" and a dealer map for
  European visitors.
- **Metric:** clicks to dealers; dealer-reported sell-through.

### E9 — Tracking hygiene
- **Evidence:** 51 % of sessions are "direct"; only 6 tagged paid sessions in 17 months; Meta
  lead ads ran without store attribution.
- **Test:** UTM tags on every link we control (bio, ads, emails, dealer sites, show QR codes),
  Meta pixel + Conversions API, a one-question post-purchase survey ("How did you first hear
  about PingLive?").
- **Metric:** share of orders with a known source.

### E10 — Answer pages for search and AI assistants
- **Evidence:** only two blog posts get traffic (setup guide, Android compatibility); ChatGPT
  and Reddit visitors convert at 2–3 %.
- **Test:** pages that answer real questions with numbers: "PingLive vs LiveScope: the whole
  system cost", "Live sonar for ice fishing", "Kayak live sonar setup", "Which phones and tablets
  work", "PingLive or PingLive Mini?".
- **Metric:** organic sessions to these pages; AI-assistant referrals.

### E11 — Mini returns deep-dive
- **Evidence:** Mini: 21 of 169 units returned (12.4 %) vs PingLive 13 of 270 (4.8 %).
- **Test:** tag the return reason on every Mini return and support thread for 30 days (Help Scout);
  fix the top two expectation gaps on the product page and in the welcome flow (for example a
  39° beam is a narrow slice, not a wide view; what a phone screen shows in sunlight).
- **Metric:** Mini return rate.

### E12 — Ice-hut operator pilot
- **Evidence:** a "2026 Ice fishing hut" B2B folder exists (22 Sep 2026); Ontario ice anglers
  concentrate on a few lakes (Lake Simcoe, Rainy Lake lead ice days per angler, Ontario 2020
  survey).
- **Test:** 3–5 hut operators get a PingLive Mini per hut; each hut shows a QR code to an offer
  page.
- **Metric:** offer redemptions per hut; operator willingness to renew.

### E13 — Creator seeding
- **Evidence:** the Feb 2025 creator shortlist had six names, two tied to Garmin. YouTube sends
  traffic that does not buy directly, so creators must carry codes to be measurable.
- **Test:** ten mid-size creators (10k–100k subscribers) in walleye, ice, kayak and crappie
  niches in MB, SK, ON, QC, MN, WI; a unit plus an affiliate code each.
- **Metric:** orders per code; cost per order.

### E14 — Dealer demo days
- **Test:** a live demo tank or on-ice demo at two Prairie dealers and one Ontario dealer during
  the ice season; show-only offer code.
- **Metric:** units sold per demo day.

### E15 — Product-page first screen
- **Evidence:** LiveScope 2 removed the black box (Jul 2026), so the current lead claim
  ("built-in processor, no black box, 50 % fewer wires") is matched. No major brand uses a phone
  or tablet as the screen. Myths ("needs cell service", "Bluetooth") appear in first-reaction
  threads.
- **Test:** above the fold on both product pages: "Live sonar on the phone or tablet you already
  own: no display to buy"; the whole-system price next to rivals' transducer-only prices; one
  myth line ("its own Wi-Fi: no cell service, no internet, not Bluetooth; up to 3 devices");
  2-year warranty, Ontario support, delivery time. Unedited screen loop as the hero media.
- **Metric:** product-page conversion and add-to-cart rate (baseline 0.28 % / 0.20–0.25 %).

### E16 — One official spec sheet + search hygiene
- **Evidence:** public specs disagree (range 240 vs 300 ft; Mini weight 1.4 lb vs 1 lb 5 oz and
  thickness; voltage 10–18 vs 11–18 V; Wi-Fi range 70–80 ft vs ~21 m). The US store root showed a
  French title in search results; "Ping" collides with crypto, golf and Blue Robotics.
- **Test:** one spec sheet (store, FAQ, manuals, dealer feeds); fix page titles and duplicate
  pages (hreflang / canonical, hide "us-homepage" and "frontpage"); always "Accuphy PingLive Live
  Sonar".
- **Metric:** branded search click-through (Search Console); dealer copy matches.

### E17 — Kits by use
- **Evidence:** European dealers already sell sets (case + battery ≈ €230 more; tablet sets in
  Poland); rival ice bundles cost US$2,750–3,300 complete; strict power rule (11–18 V, 6 A; no
  M18 packs).
- **Test:** Ice Kit (0° mount, pole, compliant battery, case), Kayak Kit (mount, battery), Boat
  Kit (shaft / barrel mounts), each priced as a complete answer.
- **Metric:** kit take rate, AOV, setup-related support tickets.

### E18 — PingBeam + Router TWO in North America
- **Evidence:** sold in Germany (PingBeam €389, Router TWO €368), absent from the North American
  store; 434 owners already have the app.
- **Test:** an owner-only pre-order for side scan on the same phone.
- **Metric:** pre-orders per 100 owners emailed.

### E19 — Cold-weather guide
- **Evidence:** the top ice objection is the phone or tablet in the cold and battery drain
  (Nodak Angler); rivals now advertise freeze-resistant cables.
- **Test:** measure drain per hour for a phone and a tablet at −10 °C and −20 °C, inside and
  outside a shack; publish a one-page guide and a 60-second video; link it from the product page
  and the ice emails.
- **Metric:** ice-season conversion; "cold" mentions in support.

### E20 — Surveys
- **Test:** one question at checkout ("How did you first hear about PingLive?"), a 10-question
  survey at day 30 and after the ice season, and a 5-question pre-purchase survey on the Lab and
  abandoned-cart emails (question bank in `voice-of-customer.md` §7).
- **Metric:** response count; the persona mix in `report-2026-09.md` §2 confirmed or corrected.
