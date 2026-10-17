# Accuphy Lab — published versions

Jason 2026-10-16: "你管理好不同的 version 哦 … 做好 version 记录". Every public or private page build is listed here
with the source commit it was built from, so anyone can tell which version a link shows. Newest first.

## Pages

| Page | Who can open it | URL |
|---|---|---|
| **Both** — PingLive + PingLive Mini | anyone with the link, no login | https://jasonzhu-ctrl.github.io/accuphy-lab-test/ |
| **Mini** — PingLive Mini only | anyone with the link, no login | https://jasonzhu-ctrl.github.io/accuphy-lab-test/mini/ |
| Private preview | Jason only (claude.ai login) | https://claude.ai/artifact/RnCBYTexY5vcEqJy2hAsN7 |
| **Ice (private preview)** — the ice-fishing page, section camera | Jason only (claude.ai login) | https://claude.ai/artifact/G5uZM8imcgsQNzoKfPkiMa |

Both public pages are unlisted (`noindex`, `robots.txt` Disallow) and have no sign-up gate (#71).
How to rebuild and publish: the `lab-test-link` skill (`node scripts/build-share.mjs <out>`; `VITE_DEVICES=PLM` for
the Mini page; `VITE_SCENE=ice` for the ice page — private preview only, not on GitHub Pages).

## History

| Date | Page | Built from (Lab commit) | Public repo commit | What changed |
|---|---|---|---|---|
| 2026-10-16 | Ice (private preview) | f0a502b (#111) | — | Phones: more room under the lit bottom (ice line at 26 % of the band, bottom inside 80 %) after Jason still saw it hidden |
| 2026-10-16 | Ice (private preview) | 12216ea (#111) | — | The section camera frames itself on phones: the lit bottom no longer hides under the app frame; deep holes back the camera off |
| 2026-10-16 | Ice (private preview) | 3a194ff (#108–#109) | — | Black ice with thin snow confirmed, a spruce shore with cabin lights on the horizon, contact shadows under the props |
| 2026-10-16 | Ice (private preview) | af95159 (#106) | — | Real snow relief, the shelter lamp mirrored in the ice, thin wind-swept snow on black ice (research §七) |
| 2026-10-16 | Ice (private preview) | 2eee2df (#105) | — | The Mini on a sonar pole rig (tripod base, pole, handle, head that turns with the view) instead of a hanging cable |
| 2026-10-16 | Ice (private preview) | dc10a55 (#94–#103) | — | First preview of the ice-fishing page: the lake frozen, the Mini in an auger hole, section camera, hole-hopping, Live Ice / Ice Fishing views. Not public |
| 2026-10-16 | Both, Mini | 4430d08 (#93) | b65ebf3 | New boat, swimming fish with eyes/fins, perch and pike, gentler lake middle (#86–#92); the Mini-only page is new |
| 2026-10-03 | Both | b919bb3 | 5bff6f7 | Phone layout: zoomed-out lake, range −/+ in the app, View capsule, bigger app buttons (#77–#81) |
| 2026-09-29 | Both | fb3cec6 | c4acb14 | Near-field fish 40 % brighter (#75, #76) |
| 2026-09-26 | Both | 6e9f422 | afa4e06 | Fix: sonar picture black in Safari (#73) |
| 2026-09-26 | Both | 3150b66 | 8dad017 | First public test page (#72) |
| 2026-10-04 | Private preview | 340e98d | — | Private preview updated (#92) |
