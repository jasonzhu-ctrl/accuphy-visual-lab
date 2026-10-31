# Accuphy Lab — published versions

Jason 2026-10-16: "你管理好不同的 version 哦 … 做好 version 记录". Every public or private page build is listed here
with the source commit it was built from, so anyone can tell which version a link shows. Newest first.

## Before any lab.accuphy.ca release that includes #191 (Combo lock)

`KLAVIYO.listId` in `src/experiments/2026-09-23-sonar-lake-3d/signup.js` must be **W24Qdc** first. Left empty, the live card refuses every
sign-up and Combo stays shut for everyone (no fake success). Test links show "Test mode: nothing is sent." The consent wording
(`unlock_consent` in i18n.js) is Klaviyo HQ's draft and waits for Jason.

## 2026-10-31: test links at 5764b06 (test repo 7d52e0c)

Fish in the beam, test version (#193), with #192. lab.accuphy.ca stays at 5c2e69a.

## 2026-10-31: test links at d8b411c (test repo ba71f8a)

Selected view tile: small live sonar picture Jason approved; Paper Shaders removed (#192). lab.accuphy.ca stays at 5c2e69a. fx/, pr30/ and pr31/ stay in the test repo as reference.

## 2026-10-30: test links at 84a05f9 (test repo 476eb73)

Desktop view tiles icon only, new sonar shape, blue ping on the selected tile (#192). lab.accuphy.ca stays at 5c2e69a. pr30/ and pr31/ stay in the test repo as reference until Jason has looked.

## 2026-10-30: test links at 9869b3f (test repo 37b03b1)

#192 desktop panel, view tiles, fishing buddy share. Glass stays off unless `?glass=shu` or `?glass=rdev`. lab.accuphy.ca stays 5c2e69a. A #191 go-live before Jason decides on #192 must be built from c91bf7e.

## Where the Lab lives (inventory, Lab HQ 2026-10-27)

Newest code: **a1fd3ee**. Page types in the code: Both `/`, Mini `/mini/`, Ice `/ice/`, the store embed `/embed/`
(built only for Vercel); French is `?lang=fr` on any of them; the fish test page (`VITE_LAB=fish`) still exists in the code
but is published nowhere and is redundant since #170.

| Where | Who sees it | Pages | Version |
|---|---|---|---|
| shop.accuphy.com/pages/lab and /fr/pages/lab | customers | an iframe of lab.accuphy.ca/ (not `/embed/`) | **5c2e69a, newest** |
| lab.accuphy.ca = accuphy-lab.vercel.app (one deployment) | anyone with the link | `/`, `/mini/`, `/ice/`, `/embed/` | **5c2e69a, newest** |
| Friends' test link jasonzhu-ctrl.github.io/accuphy-lab-test | friends, Jason | `/`, `/mini/`, `/ice/`; `/jig/`, `/pano/` forward to `/` | **5764b06** (test repo 7d52e0c; #191–#193 on top of live) |
| claude.ai private previews | — | **none**: the four old ones (RnCB, VxxnV fish test, G5uZ ice, 4GdHH) were deleted 2026-10-27 at Jason's word ("如果是现在项目需要的话留一个就行了"; the test link does the job) | — |
| The v3 ad film | Meta, from 11/2 | recorded | lake 1abeedf (before #178; its shots show no Panoramic sonar) |
| Colleague branches (not merged): PR #30 `codex/lab-clarity-optics` (AJ-nb, 10-28), PR #31 `codex/blue-hour-lake` (Codex agent, 10-29; private preview on accuphy-blue-hour-lake-20261029.accuphy-1012.chatgpt.site, owner-only) | the colleague, Jason | their own builds | not in main, not on any Lab link |

## Current lake (one version, #176)

> **10-31:** lab.accuphy.ca = **5c2e69a**; test links = **5764b06**. The lines below this note are history from 10-27.

- **lab.accuphy.ca (+ `/embed/`) and the friends' test links** `/`, `/mini/`, `/ice/`: all built from **9ed9341** (2026-10-27; adds #180 load plan B and #181 to 283ecb9). Vercel deployment `dpl_55e9zvQmcqfEw3HhmKMK4UTaTAJN`, embed `lab-eddff42d53.js`; Jason said 动. Before that, both were built from **283ecb9**
  (2026-10-27). That build has the round wake rings (#175), fish round 3 (#173), no lake jig and three lake trout in the
  110 ft hole (#174), far fish held steady (#177) and the Panoramic sound picture as the only Panoramic (#178).
  `/jig/` and `/pano/` are retired and forward to `/`. Test-link repo b29fe54; Vercel deployment
  `dpl_KWPGDeTYyZE8u3PL1EmCebnn9Lhe`, the embed build `lab-e35c0a69c4.js`. Jason said 动 in Lab HQ.
- **Old private previews:** all deleted 2026-10-27 (Jason).
- **Page layout since #180 (2026-10-27, load plan B):** a share build is no longer one file — `pages/index.html` plus
  `pages/home/<name>-<hash>.jpg` (the 11 app Home thumbnails, fetched only when the Home shows). Upload the `pages/` folder
  whole. Only the private Artifact preview `accuphy-lab.html` still inlines everything. Fonts are woff2 subsets, the logo an SVG.

## Pages

| Page | Who can open it | URL |
|---|---|---|
| **Both** — PingLive + PingLive Mini | anyone with the link, no login | https://jasonzhu-ctrl.github.io/accuphy-lab-test/ |
| **Mini** — PingLive Mini only | anyone with the link, no login | https://jasonzhu-ctrl.github.io/accuphy-lab-test/mini/ |
| **Lab (ad landing, #102 / X-6L)** — Both `/`, Mini `/mini/`, Ice `/ice/`, theme loader `/embed/lab.js`; only the store may frame it | anyone with the link, no login; `noindex` | **https://lab.accuphy.ca/** (same as https://accuphy-lab.vercel.app/) |
| **Ice (trial)** — the ice-fishing page, section camera | anyone with the link, no login | https://jasonzhu-ctrl.github.io/accuphy-lab-test/ice/ |

Both public pages are unlisted (`noindex`, `robots.txt` Disallow) and have no sign-up gate (#71).
How to rebuild and publish: the `lab-test-link` skill (`node scripts/build-share.mjs <out>`; `VITE_DEVICES=PLM` for
the Mini page; `VITE_SCENE=ice` for the ice page → `/ice/` on GitHub Pages since 2026-10-20, Jason: "先给个试用的线上版本链接给我").

## History

| Date | Page | Built from (Lab commit) | Public repo commit | What changed |
|---|---|---|---|---|
| 2026-10-26 | **Both**, **Mini**, **Ice (trial)** (GitHub Pages, friends) | 8449845 (#169, #170) | 3700815 | The #153 round-3 fish on the lake and ice pages (Jason: “把第 3 轮这一版的鱼搬进正式页面”); share button + app badges only with `?extras=a` or `?extras=b` (options for Jason). Clean build of 8449845. lab.accuphy.ca NOT updated |
| 2026-10-26 | **Both**, **Mini**, **Ice (trial)** (GitHub Pages, friends) | afa047a (#166) | 19202b6 | Jason's iPhone findings fixed: the drag cue returns after a cancelled touch (iOS), the wake rebuilt after drone photos. Built from a clean checkout of afa047a (another chat had uncommitted work). lab.accuphy.ca NOT updated |
| 2026-10-26 | **Both**, **Mini**, **Ice (trial)** (GitHub Pages, friends) | de00e3e (#157–#165) | bd1e13e | For Jason's iPhone check before lab.accuphy.ca: French with `?lang=fr` (website-reviewed), Shop button B, the drag hint returns after the boat stops (#160), the lake with a real sky (#162) and FFT wind-sea waves after ABYSSAL (#165). lab.accuphy.ca NOT updated yet |
| 2026-10-25 | **Vercel** `accuphy-lab` `/`, `/mini/`, `/ice/`, `/embed/` | 50ad8ca (#153–#157) | — | Jason said 动 in Lab HQ ("上传新版本、接 lab.accuphy.ca"). Built from main: the Shop button (placement B, #157), events `accuphy:lab` with `product` (no `device`), the embed loader `/embed/lab.js`; also #154 far bottom, #155 workboat, #156 lake surface (#153 fish page stays off). GitHub Pages not updated. lab.accuphy.ca live the same evening: CNAME `lab` → `4d23262254a8e936.vercel-dns-016.com` (TTL 3600) added in Hostinger with Jason logged in (his Chrome); Vercel says configured correctly, HTTPS 200 on all four paths |
| 2026-10-25 | **Vercel** `accuphy-lab` (team accuphy) `/`, `/mini/`, `/ice/` | ac67cb4 (#152) | 50c49a3 | First Vercel deploy (Jason said 动 in Lab HQ): the same files as GitHub Pages plus `vercel.json` (frame-ancestors shop.accuphy.com, *.myshopify.com, admin.shopify.com; X-Robots-Tag noindex). Deployed with the Vercel CLI from a copy of the public repo; no `embed/` yet |
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
| 2026-10-26 | Public test page `/pano/` | 8b6bb50 | bb6d431 | Panoramic sound-picture test page with an old/new switch, for Jason's phone compare (#171) |
| 2026-10-26 | Public test page `/pano/` | 2d48393 | f18c7fb | Pano test page opens on PingLive Panoramic with the new picture on (#171) |
| 2026-10-26 | Public test page `/ice/` | e436506 | a972985 | Ice page rebuilt: the jig's sonar mark and the dial's lines are back (#170 had dropped them) |
| 2026-10-27 | Public test page `/jig/` | 218e483 | 0f4439e | Lake with the 110 ft hole and the jig drop from the boat (`?jig`, best with `?boat=-22.9,-47.2`) (#172) |
| 2026-10-27 | Public test page `/jig/` | 557f1b2 | 7191adc | Fish schools spread out (#173) on top of the hole and jig (#172) |
| 2026-10-27 | Public test page `/jig/` | 58ea10f | 2418a2d | Fish spread round 2 at Jason's screenshot spot and the phone start (#173) |
| 2026-10-30 | **All test links** `/`, `/mini/`, `/ice/` | c91bf7e | 4c59277 | Unlock design (view-led card, one sonar sweep, fine locks) + Home tabs Setting and Map greyed (#191). Test mode. HQ: looked at docs/2026-10-30-unlock-design.jpg, unit tests pass. lab.accuphy.ca still 5c2e69a |
| 2026-10-30 | **All test links** `/`, `/mini/`, `/ice/` | 881c8b2 | dec5b79 | Locked views behind the subscribe card, guide copy, Down Scan / Chirp notice, `lab_unlock=sub` (#191). Test mode: nothing sent (`listId` null). HQ: looked at docs/2026-10-30-combo-unlock.jpg, unit tests pass from a clean checkout. lab.accuphy.ca still 5c2e69a |
| 2026-10-30 | **Vercel** → **lab.accuphy.ca** `/`, `/mini/`, `/ice/`, `/embed/` | 5c2e69a | — | Jason said 动 in Lab HQ (the only live item waiting; #191 not included). US market in the store: PingLive Mini only (#190). Deployment `dpl_Dng6uRtYt8h3ZMZwGWAkhZyDUe3b`, embed `lab-d143de9435.js`. Checked: pages md5-identical to the test links (30df2bd), `/embed/` and robots 200, the loader points at the new build, CSP + noindex, embed CORS. Real US IP: website 03 next. Replaces a1fd3ee |
| 2026-10-30 | **All test links** `/`, `/mini/`, `/ice/` | 5c2e69a | 30df2bd | US market in the store: PingLive Mini only, iframe and theme-mounted (#190). The test links open on their own, so they look unchanged; the US view only shows inside the store (check image docs/2026-10-30-us-mini-only.jpg). Unit tests 26/26 + 15/15. lab.accuphy.ca still a1fd3ee |
| 2026-10-30 | **Vercel** → **lab.accuphy.ca** `/`, `/mini/`, `/ice/`, `/embed/` | a1fd3ee | — | Jason said 动 in Lab HQ (new app). #189 Mini Combo Forward/Down ranges + #188 share redo (QR + Copy link). Built from a clean checkout of a1fd3ee; deployment `dpl_2fipAjsmYu7XGFp2akfeoyN133nt`, embed `lab-2a273819b6.js`. Checked: `/`, `/mini/`, `/ice/` md5-identical to the test links (84e65df), thumbnails, `/embed/` and robots 200, CSP frame-ancestors + noindex, embed CORS, live /mini/: Combo shows Forward range 70 ft + Down range 25 ft, the share popover shows the QR + Copy link, 0 console errors. Replaces 8c15c20 |
| 2026-10-29 | **All test links** `/`, `/mini/`, `/ice/` | dfeef9f | f83f012 | Phone QR caption French as reviewed by the website ("Un ami peut scanner ce code…", #188). No other change. lab.accuphy.ca still 8c15c20 |
| 2026-10-29 | **All test links** `/`, `/mini/`, `/ice/` | a1fd3ee | 84e65df | Mini Combo: Forward range and Down range, each moved on its own (#189, replaces #125 AUTO); phones get −/+ under each panel. HQ headless check: EN + FR sliders move independently, PingLive page unchanged, 0 errors. lab.accuphy.ca still 8c15c20 |
| 2026-10-29 | **All test links** `/`, `/mini/`, `/ice/` | 7390d39 | 2a9f871 | Phones also get the QR + copy popover (Jason: "手机也用二维码和copy"); no native share sheet; phone caption "Let a friend scan this…" (#188). HQ headless check at 390×844 @3 (EN `?shop=/en-us&market=us`, FR `?lang=fr&shop=/fr`): popover centred 198–578 px, QR 172 px, US / FR-CA addresses and tags right, native share not called, 0 errors. lab.accuphy.ca still 8c15c20 |
| 2026-10-29 | **All test links** `/`, `/mini/`, `/ice/` | 2408b81 | ae476ba | "Send to a friend" redone (#188): desktop popover with a 168 px QR + Copy link; phones keep the native sheet with a fallback; share links by market (`utm_source=lab_share&utm_medium=referral&utm_content=<channel>&utm_campaign=bf2026_lab_<market>`), website-reviewed French. HQ headless check on the live test link: US → `/en-us/pages/lab` + bf2026_lab_us, FR → `/fr/pages/lab` + bf2026_lab_ca, default → `/pages/lab` + ca; copy = field, Esc closes, 0 errors. lab.accuphy.ca still 8c15c20 |
| 2026-10-29 | **Vercel** → **lab.accuphy.ca** `/`, `/mini/`, `/ice/`, `/embed/` | 8c15c20 | — | Jason said 动 in Lab HQ. shop_click carries `url`; the store page jumps on its receipt (#187, website #229). Deployment `dpl_27YqQfdxV3aeymx9Sa8vnJfLNa94`, embed `lab-9ccdf42625.js`. Checked: md5-identical to the test links, thumbnails and `/embed/` 200, CSP and noindex, embed stand-in mounts, headless standalone jump to `/de-de/products/pinglive-sonar`, 0 errors. Replaces 1e32b6b |
| 2026-10-29 | **All test links** `/`, `/mini/`, `/ice/` | 8c15c20 | 51ba917 | shop_click carries `url`; inside the store the Lab waits up to 400 ms for the store page's `shop_click_ack` and lets the store jump; without it, it jumps itself after 1 s (#187, website #229). HQ check on the live test link: one shop_click with the `/de-de/products/…` url for two clicks; headless jump to `/de-de/products/pinglive-sonar`, 0 errors (timing in software GL is ~10 s for both this and the live 1e32b6b, so the environment, not the change). lab.accuphy.ca still 1e32b6b |
| 2026-10-28 | **Vercel** → **lab.accuphy.ca** + **all test links** `/`, `/mini/`, `/ice/` (+ `/embed/`) | 1e32b6b | b7e486c | Jason said 动 in Lab HQ after the list: the Shop click waits 1 s with "Opening the store…" (#184) and the share link + store badges in the store's style (#186, website-reviewed French). Deployment `dpl_5NuYegBX5drzurJrhpQGVTY8QnV6`, embed `lab-a600b3eb01.js`. Checked: lab.accuphy.ca and the test links md5-identical, thumbnails and `/embed/` 200, CSP and noindex, embed stand-in mounts, both badges 40 px on the live desktop panel, 0 console errors. No lake or sonar change since 1fc1678 |
| 2026-10-28 | **All test links** `/`, `/mini/`, `/ice/` | 479ca21 | 0fd7281 | Shop click waits 1 s so GA4 keeps it; "Opening the store…" / "Ouverture de la boutique…"; repeat clicks ignored (#184, website #228). HQ check on the live test link (FR, 3 quick clicks): 1 shop_click, label switched, navigation to `/fr/products/pinglive-sonar` at 1002 ms. lab.accuphy.ca still 1fc1678 |
| 2026-10-28 | **Vercel** `accuphy-lab` → **lab.accuphy.ca** `/`, `/mini/`, `/ice/`, `/embed/` | 1fc1678 | — | Jason said 动 in Lab HQ ("动，更新"). The Shop link follows the store's market (#182, website #228). Deployment `dpl_6T7KQTqt1zSKNHNbeXovVjMvbuDH`, embed `lab-1401b14c6b.js`. Checked: pages md5-identical to the test links, thumbnails and `/embed/` 200, CSP and noindex, embed stand-in mounts, 0 console errors; on lab.accuphy.ca `?shop=/en-us` sends the button to `/en-us/products/pinglive-sonar` (the store then 301s to Mini). Replaces 9ed9341 |
| 2026-10-28 | **All test links** `/`, `/mini/`, `/ice/` | 1fc1678 | bb1aa31 | The Shop link follows the store's market (`?shop=`, #182, website #228). HQ check: with `?shop=/de-de` the button goes to `/de-de/products/pinglive-sonar` (navigation caught in the page). Test-link repo re-cloned into the HQ scratchpad (the old clone lost its `.git` core files at midnight). lab.accuphy.ca still 9ed9341 |
| 2026-10-27 | **Vercel** `accuphy-lab` → **lab.accuphy.ca** `/`, `/mini/`, `/ice/`, `/embed/` | 9ed9341 | — | Jason said 动 in Lab HQ ("动，lab.accuphy.ca 更新到最新版"). Each page folder carries its `home/` thumbnails (#180). Checked: pages md5-identical to the test links, thumbnails and `/embed/` 200, CSP and noindex, embed stand-in mounts, phone layout 11/11 thumbnails, the store page frames it, 0 console errors. Replaces 283ecb9 |
| 2026-10-27 | **All test links** `/`, `/mini/`, `/ice/` | 9ed9341 | ccac583 | Download halved (#180: woff2 subsets, SVG logo, Home thumbnails as files in `home/` beside each page); PingLive Mini Forward without the depth readout (#181). Each page folder now carries its own `home/`. All 11 thumbnails load on the phone layout; 0 errors. lab.accuphy.ca still 283ecb9 |
| 2026-10-27 | **Vercel** `accuphy-lab` → **lab.accuphy.ca** `/`, `/mini/`, `/ice/`, `/embed/` | 283ecb9 | — | Jason said 动 in Lab HQ. Built from a clean checkout of 283ecb9: the three share pages (byte-identical to the test links) + `build-embed.mjs` (`lab-e35c0a69c4.js`) + `vercel.json`; deployed with the Vercel CLI (`deploy --prod --scope accuphy`). Checked: all paths 200, md5 match, CSP frame-ancestors and noindex, `/embed/` CORS, the embed stand-in mounts, 0 console errors. Replaces 50ad8ca |
| 2026-10-27 | **All test links** `/`, `/mini/`, `/ice/` | 283ecb9 | b29fe54 | The sound picture is the only Panoramic (#178); `/pano/` retired, forwards to `/` |
| 2026-10-27 | **All test links** `/`, `/mini/`, `/ice/`, `/pano/` | e5a512c | 08d8f83 | Panoramic sound picture tuned against the app, round 1 (#178): rocks bright, no black lanes or rings, smooth fish dashes |
| 2026-10-27 | **All test links** `/`, `/mini/`, `/ice/`, `/pano/` | 1abeedf | b642a6d | Far fish steady and middle-sized at long range (#177); three deep lake trout in the hole (#174) |
| 2026-10-27 | **All test links** `/`, `/mini/`, `/ice/`, `/pano/` | c9f900b | f297eab | One build for every link (#176): round wake rings (#175), fish round 3, no lake jig; `/jig/` retired, forwards to `/` |
| 2026-10-27 | Public test page `/jig/` | a3abfc4 | 06630db | Fish round 3: density between rounds 1 and 2, bass drawn 1.5× (#173) |
