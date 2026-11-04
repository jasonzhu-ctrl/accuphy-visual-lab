# Store-frame test harness (mobile-web chat, rebuilt 2026-10-31)

Runs the BUILT Lab page inside a fake store page (same origin, so `storeOrigin()` = the page's origin), in headless Chrome
driven over CDP. No dependencies; Node 22+ and Google Chrome (macOS path below).

```
node scripts/build-share.mjs                       # writes dist-share/pages
node scripts/dev/store-frame/run.mjs               # all scenarios against dist-share/pages
node scripts/dev/store-frame/run.mjs dist-share/pages shop-ack share-phone
```

Scenarios: `shop-ack` (parent answers the receipt → the Lab must NOT navigate), `shop-none` (nobody answers → the Lab navigates
at ~1 s), `shop-wrong-source` (a sibling frame sends the receipt → ignored), `shop-badtype` (another message type → ignored),
`share-desktop` (QR ≥ 168 px, Copy → "Copied ✓", Esc closes, events qr_shown + copy), `share-phone` (390×844, same popover,
clear of the Shop pill; the pill reads "Learn More" and there are no store badges, #200), `app-badges-desktop` (#200: two
badges, each opens its store's QR ≥ 160 px with "Scan to download Accuphy Sonar App", one `app_badge` { store } per click,
the share popover closes the QR). `no-lock-desktop` (#202: the live base has no subscribe lock — Mini → Combo opens with no lock icon and no card, a `view` event, no `signup`; a `VITE_COMBO_LOCK=1` build fails it on purpose).

**Three versions (#233, 2026-11-03):** Base `2026-09-23-sonar-lake-3d` (the source, the default here), the website-embed copy
`2026-11-03-sonar-lake-web` (lab.accuphy.ca `/`, `/mini/`, `/ice/`, no lock) and the MKT copy `2026-11-03-sonar-lake-bf`
(`/mktbf2026/`, locked). The unit tests take any of them with `LAB_DIR=<folder>`; run the store frame against each built page
(`LAB_LOCKED=1` only for MKT).

**BF locked version (#213):** `LAB_LOCKED=1 node scripts/dev/store-frame/run.mjs <its dist>/pages` runs `lock-desktop` instead of
`no-lock-desktop`: Mini → Combo is locked and opens the subscribe card; a test email (fetch stubbed inside the frame, so nothing
ever reaches Klaviyo, whatever list id the build carries) opens Combo and sends one `signup` { source unlock, product, view } with
no email in it; then `?lab_unlock=sub` (passed through the fake store page as `extra=`) opens Combo with no card and no `signup`.
The unit tests take the folder too: `LAB_DIR=2026-11-03-sonar-lake-bf node scripts/dev/signup-guard-test.mjs` (also
`shop-url-test.mjs`, `app-qr-test.mjs`). signup-guard checks the list id comes only from the build's `VITE_BF_LIST_ID` (base: never).

**MKT list by market (§6.5, 2026-11-04):** `LAB_SHOP=/` (or `/en-us`, `/en-au`) makes the fake store page North American; the
default `/de-de` is European. lock-desktop prints the success line (`done=`) and, in a build with list ids, the list it sent to. Routing unit test:
`node scripts/dev/mkt-list-route-test.mjs`.
`LAB_SHOP=/en-us` runs `lock-us` instead of `lock-desktop` (#241: the US page's Live Combo is free, Panoramic still locked); the
lock rule by market: `node scripts/dev/mkt-lock-rule-test.mjs`.

**(Resolved 2026-11-04, c442045: #212 is in the copy and these pass.)** Expected failures on the copy, until #212 moves in (#216, Jason 2026-11-03: the languages move into the locked version once they are done):** the BF copy stays at 86bf80e (#213) and does not have #212's
languages. So on `LAB_DIR=2026-11-03-sonar-lake-bf`, `share-url-test.mjs` fails its 4 de/nl/pl/lv cases, and in a locked run
`share-de` fails. Do not change the tests or sync the copy before then; once #212 is moved in, these must pass. They cover #184 / #187 (shop click, receipt), #188 / #192 (share popover) #200 (A8) and #202 (lock off). `share-de` (#212: on a German store page the copied share link ends with `&lang=de` and the Shop click stays on `/de-de/products/`).
The fake store page passes `?shop=/de-de` like the real bridge, plus `tour=off`: the entry tour (#199) dims the Shop,
badge and share buttons while it runs. A wrong-ORIGIN receipt cannot be staged (the parent's origin is what the Lab trusts).
Software WebGL is slow: allow ~15 s per scenario. Unit tests are separate: `shop-url-test.mjs`, `share-url-test.mjs`,
`signup-guard-test.mjs`, `app-qr-test.mjs` (the store links and their QR codes) in the folder above (plain `node`, a few seconds).
