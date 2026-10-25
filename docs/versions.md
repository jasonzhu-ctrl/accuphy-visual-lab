# Accuphy Lab — published versions

Jason 2026-10-16: "你管理好不同的 version 哦 … 做好 version 记录". Every public or private page build is listed here
with the source commit it was built from, so anyone can tell which version a link shows. Newest first.

## Pages

| Page | Who can open it | URL |
|---|---|---|
| **Both** — PingLive + PingLive Mini | anyone with the link, no login | https://jasonzhu-ctrl.github.io/accuphy-lab-test/ |
| **Mini** — PingLive Mini only | anyone with the link, no login | https://jasonzhu-ctrl.github.io/accuphy-lab-test/mini/ |
| Private preview | Jason only (claude.ai login) | https://claude.ai/artifact/RnCBYTexY5vcEqJy2hAsN7 |
| **Ice (trial)** — the ice-fishing page, section camera | anyone with the link, no login | https://jasonzhu-ctrl.github.io/accuphy-lab-test/ice/ |
| Ice (private preview) | Jason only (claude.ai login) | https://claude.ai/artifact/G5uZM8imcgsQNzoKfPkiMa |
| Fish echo test (private preview, #153; also the newest lake: #154–#156) | Jason only (claude.ai login) | https://claude.ai/artifact/VxxnVnZr8cxQLXw3iizMdD |

Both public pages are unlisted (`noindex`, `robots.txt` Disallow) and have no sign-up gate (#71).
How to rebuild and publish: the `lab-test-link` skill (`node scripts/build-share.mjs <out>`; `VITE_DEVICES=PLM` for
the Mini page; `VITE_SCENE=ice` for the ice page → `/ice/` on GitHub Pages since 2026-10-20, Jason: "先给个试用的线上版本链接给我").

## History

| Date | Page | Built from (Lab commit) | Public repo commit | What changed |
|---|---|---|---|---|
| 2026-10-25 | Fish echo test (private preview) | 1c0ba1c (#153 round 3, #154–#156) | — | Fish take the arc grain, crossfaded between pings; the far bottom stays on the screen in Forward past ~60 ft, softer and weaker with distance (#154); the small wreck is a real workboat with decks and a windowed wheelhouse (#155); the lake from above: water column tints the bottom, a wind-sea surface, no wood grain on the lakebed (#156). The public pages are not rebuilt yet |
| 2026-10-25 | Fish echo test (private preview) | round 2 (#153) | — | Near fish a soft body (no fins or tail), far fish slimmer needles like the old marks, true size by default |
| 2026-10-25 | Fish echo test (private preview) | 1fa89c1 + switches (#153) | — | First preview of the fish-echo test page: fish drawn from their 3D bodies as the transducer sees them; switches on the page for the current fish and a 1.6× size. `VITE_LAB=fish node scripts/build-share.mjs <out>` |
| 2026-10-24 | **Both**, **Mini**, **Ice (trial)** + both private previews | ac67cb4 (#152) | 9bb1f38 | Rough and side-sloping bottoms are one filled band again instead of a net of lines with holes (holes 9.5 % → 2.3 % at the rocky spot) |
| 2026-10-24 | **Both**, **Mini**, **Ice (trial)** + both private previews | 30672a7 (#151) | 90e5c12 | The fake phone a little smaller: 34 % of a laptop screen (≈ 103–117 mm), 560 px at most (24″ ≈ 155 mm, 27″ ≈ 131 mm); folds and iPads unchanged |
| 2026-10-24 | **Both**, **Mini**, **Ice (trial)** + both private previews | 32ed1df (#150) | adbe0fe | One phone size on every page (#84: min(42vw, 600px, 83.2vh)); on mid screens (an unfolded fold, a small tablet) the boat and the ice kit stand clear of the panel; the drag hint never covers the panel, cards or phone |
| 2026-10-24 | **Both**, **Mini**, **Ice (trial)** + both private previews | 42e630d (#143–#149) | 7560bf5 | The sonar picture tuned like for like against the app's recordings: bright cores with orange rims, one brightness for bottom and structure, solid targets that hide the bottom, whole smooth branches, the app's grain (short arcs across the beam) on the bottom, insides and ragged outlines, big hulls with bright middles; checked on a real phone (vivo fold, Chrome: 60 fps in every view) |
| 2026-10-23 | **Both**, **Mini**, **Ice (trial)** + both private previews | 84970c3 (#128) | a754b2b | Structure in the sonar drawn like the app: solid hot columns, black shadows behind them, fuzzy crowns |
| 2026-10-23 | **Both**, **Mini**, **Ice (trial)** + both private previews | 6545bdf (#125–#127) | 18173fe | Combo range AUTO like the app; ice: every tap counts (25 m hops), fish come to the jig and bite, a winter population round each hole |
| 2026-10-23 | **Both**, **Mini**, **Ice (trial)** + both private previews | 49c45f8 (#124) | 7e809c5 | PLM Combo at long range: the Forward panel's depth meets the water halfway, so the bottom stays in view |
| 2026-10-23 | **Both** `/` | 1b6cb18 (#104–#123) | 36abbba | All work since the last public build: app controls on phones (#114, #117–#118), fish marks rebuilt (#120), Home with only Live Forward / Live Down / Live Combo / Live Ice Fishing open (#121, Combo in the Mini row #123), Live Ice Fishing opens /ice/, the app's back arrow (#122), the whole Combo Down fan (#123) |
| 2026-10-23 | **Mini** `/mini/` | 1b6cb18 (#104–#123) | 36abbba | Same build, PingLive Mini only |
| 2026-10-23 | Private preview | 1b6cb18 (#104–#123) | — | Same as Both |
| 2026-10-23 | **Ice (trial)** `/ice/` | 765bde6 (#123) | b7e6a59 | Drill cue = a reticle on the ice + plain caption; the Combo Down fan whole; Live Combo in the Mini row of Home |
| 2026-10-23 | **Ice (trial)** `/ice/` | 14806a5 (#122) | f489616 | The app's solid back arrow; on phones the back button opens Home with the four Mini views |
| 2026-10-23 | **Ice (trial)** `/ice/` | fcf64a3 (#121) | bfcbc3a | Views Live Ice · Forward · Down · Combo (Ice Fishing no longer offered); includes #120 fish marks |
| 2026-10-20 | **Ice (trial)** `/ice/` | f09a3b6 | bc757c9 | First public trial link of the ice page (Jason asked for one); unlisted, noindex; same build as the private preview |
| 2026-10-18 | Private preview | 37c434f (#104–#118) | — | Phone version for Jason to try in the Claude app: camera zoomed out, app Home first (pick a view), frosted unavailable tiles, all controls inside the phone (gain, pause, range, depth), ⋯ settings greyed. Public pages not updated yet |
| 2026-10-17 | Ice (private preview) | 3ee96d8 (#113–#116) | — | Camera solves its framing; signal gate on hops; Ice Fishing history opens filled; drill hint off the rig; a jig on line, dial, fan and history; real lake ice in the section and a light shaft under the hole |
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
