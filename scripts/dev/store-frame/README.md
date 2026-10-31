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
clear of the Shop pill). They cover #184 / #187 (shop click, receipt) and #188 / #192 (share popover). The fake store page
passes `?shop=/de-de` like the real bridge. A wrong-ORIGIN receipt cannot be staged (the parent's origin is what the Lab trusts).
Software WebGL is slow: allow ~15 s per scenario. Unit tests are separate: `shop-url-test.mjs`, `share-url-test.mjs`,
`signup-guard-test.mjs` in the folder above (plain `node`, a few seconds).
