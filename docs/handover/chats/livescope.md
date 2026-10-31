# Handover: LiveScope 研究 (LiveScope chat), 2026-10-31

Plan B of Lab HQ's tidy-up: this window is archived after this note. It was a research window; it changed no engine code.
Old-app session id `local_ce7fb092-4fb2-432f-b84f-0a40dcb566b5` (CLAUDE.md "Chats as of 2026-10-31"); its twin in the second app
(`b3b3cd08`, last turn 10-30 02:29) only re-read the docs and asked the same 7 questions.

## 1. Lane
- **Mine:** `docs/livescope-study.md` (real Garmin LiveScope pictures, rules with numbers), `reference/livescope/` (local frames),
  `scripts/dev/livescope/` (the measuring scripts). Also the independent like-for-like checks of the Lab's sonar picture against
  the app's recordings (10-24 after #143–#147, 10-31 on main 835b6b5).
- **Never:** the lake scene and the sonar imaging, ice included. Only "冰钓版本视觉效果" changes them (#176); findings go to it
  through HQ, never as edits. Never edit `docs/backlog.md` (HQ does). No publishing, no downloading videos (no yt-dlp).
- **No new research** unless Jason asks. No big agent fan-outs: ask first (Jason 2026-10-17).

## 2. State now
- **My commits on main:** `57644eb` (`docs/livescope-study.md`, 2026-10-23, also on origin as `64be5b1`) and this note and
  `scripts/dev/livescope/` (commit in the same push). Everything else I did was read-only.
- **Live / test links:** nothing of mine is on any page. `docs/livescope-fish-research.md` is not mine: a cloud sub-agent wrote
  it from search excerpts for #120 (no video watched); the app wins where it disagrees.
- **Local only, no backup:** `reference/livescope/` (gitignored, about 15 MB): 11 video folders `reference/livescope/<video-id>/NN-<what>.png`
  (44 frames, 800×450, plus 5 inset crops named `NNb-…`), each with a `notes.md` (URL, title, timestamp, transducer and mode,
  range, gain, palette, my reading of every frame), plus `candidates.md` (search list) and `rejected.md` (camera-filmed videos).
  Per-video use: `BvFt_usGjMc` brush piles (LVS42HD), `WG7PeaMoEmQ` pilings and Perspective shadows (LVS34 vs LVS44),
  `qUGwllFqNrQ` far timber and Perspective (LVS44), `OSVHiC-hzrY` fish schools (LVS42HD), `mv1AquYG5SA` ice at gain 76–78 %,
  `XLOlbsSFxY0` bottom layers in multi-hue, `KJzCOVwwAZc` LVS42HD vs LVS34 split, `fID61mzqcuY` timber (green),
  `Jvs-2EIQGcg` and `YMxJEZegQJU` small insets, `BUqEhdRG6QU` ActiveTarget 2 inset (comparison). Eight earlier LVS34 frames are in
  `reference/app-study/livescope-lvs34/` (Garmin's own settings video, palette measurement `docs/sonar-style.md` §7.7).
  **If Jason wants these kept, they must be copied to Drive or somewhere safe: the Mac's `ACCUPHY` folder has no backup.**
  The Market Research Drive folder takes dated, aggregates-only files (global CLAUDE.md).
- **Frame paths in the study** are relative to `reference/livescope/`; the ranked top-15 list is in the doc.

## 3. In flight
Nothing is running or half done. The one open thing is Jason's decision on the Lab gaps (section 4), owned by the ice window.
To repeat the measurement: `scripts/dev/livescope/README.md` (four commands, tested on 10-31 from the repo: band 26.1 in, ping
change 44 %, grain 87° vs app 89°).

## 4. Waiting on
- **The gap list, `docs/backlog.md` line 385 (10-24) with my 10-31 re-measure under it (line 386).** Owner: "冰钓版本视觉效果";
  Jason decides whether to act. Status on main 835b6b5 (app = vivo PL Down burst d00–d19, Lab = `?boat=-6,4&study=wreck&gain=0.4&contrast=0.47&noise=0.25&depth=80`):

  | Item | 10-24 | 10-31 | Verdict |
  |---|---|---|---|
  | Frame-to-frame life: hull \|ΔL\|/L, band class change, band edge move | app 0.46 / 64 % / 3.0 in; Lab 0.17 / 43 % / 0.9 in | Lab 0.17 / 45 % / 0.4 in | still true |
  | Edge 0–2 in too bright (L) | app 174, Lab 236 | Lab 268 (2–4 in: 323 vs 240) | still true, slightly worse |
  | Down band thickness, >40 % of peak | app 21.2 in, Lab 26.6 | Lab 26.0 (+22 %); 15 % width 34.2 vs 32.5; tail 20.4 vs 19.0 | partly true |
  | Down band colours | yellow 16.8 % vs 9.5 %, white 2.1 % vs 0 | yellow 18.2 %, white 0.7 % | yellow fixed, white still short |
  | Combo and phone Forward white (target 6–10 %) | 10–15 %, 11–12 % | PLM Combo 14.3 % and 10.9 %, phone PL Forward 11.9 % (desktop PL Forward 5.2 %, ice Forward 4.1 %) | still true |
  | Far ice Forward band frays into thin wavy threads | seen | thin hairlines and small dark holes beyond 20 m | still true (`ice-far.png` was in my scratchpad, gone) |
  | Down water column lit | app 0.79 % vs Lab 0.04 % | not reproducible: the #155 workboat's wheelhouse now sits in the old box, and the app's own box holds on-screen text; clean box above the wreck (x −8…2 ft, 5–20 ft): app 0.00 %, Lab 1.70 % with a few fish | drop or re-measure on a clean scene |
  | Panoramic dotted vertical bar at deep / lockup | seen | none; Panoramic became a sound picture (#171/#178); a short textured rectangle at the top edge of both frames is unidentified | obsolete; ice window may glance at it |
  | Grain direction (the 10-24 finding behind #148) | app 80–90° to the ray, Lab 0–5° | Lab 85–87° vs app 89°, 7.9 × 2.9 in vs 6.5 × 2.3 | fixed by #148 |

  The hull-box numbers (dark share 2.1 % vs 18.8 %, core CoV 0.22 vs 0.32) are no longer like for like since #155 changed the
  study wreck: do not use them as gaps.
- **The 7 open questions** (end of `docs/livescope-study.md`, asked since 10-30, backlog line 6 "② LiveScope 7 问"): HQ marked them
  mostly void on 10-31 on my advice. Questions 1–6 ask what objects in other people's YouTube videos are (bridge piling or
  marker, knot or fish on a piling, brush or rock pile, school species, jig line or hole edge, brush row or ledge): Jason cannot
  know. Question 7 (amber or copper) is overtaken by #137 (default colour `accuphy_mid`, midpoint of the app's orange and the
  LiveScope amber; #34 hid the colour choice). If one question is ever put to Jason, it is: "现在画面的颜色是 app 橙和
  LiveScope 琥珀的中间值，要不要更靠 app 的橙？" My advice: do not ask unless he says the colour is wrong. Raised to HQ 10-31, not to Jason.

## 5. Know-how not in the repo
- **Capturing LiveScope frames (what worked, desktop app's browser pane):** `mcp__Claude_Browser__*`. Open the video with
  `navigate`, emulate 1920×1080 (`resize_window`), press `t` for theatre mode, click the player to pause, seek with number keys
  (1–9 = 10–90 %), `j`/`l` = ±10 s, then `computer screenshot`. The tool result prints where the JPEG was saved
  (`…/tool-results/mcp-Claude_Browser-blob-….jpg`); `sips -s format png <src> --out <dest>` converts, `sips -c H W --cropOffset y x`
  crops an inset. **Screenshots are capped at 800 px wide**, so no single-pixel speckle statistics from these frames.
  Pre-roll ads: click the "Skip" element. `computer` clicks by coordinate need a prior screenshot in the same batch (max 25 actions per batch).
  Reset the viewport (`resize_window preset desktop`) when done.
- **No narration:** YouTube's transcript panel and captions do not load in the pane (`get_transcript` returns 400, the CC button says
  "unavailable"). What an object is came from the title, on-screen labels and my reading.
- **Camera-filmed screens are useless** (moiré, glare, hands): rejected on sight, list in `reference/livescope/rejected.md`.
- **Checking the 3D Lab needs a headless browser, not the pane:** a hidden pane does not animate the page. Playwright
  (`playwright-core@1.63.0`, cached Chromium and WebKit, `--use-angle=metal`) gives a real GPU render and a Safari-engine
  test; both gave the same picture (mean L 9.3 / 9.3). The 10-24 full sonar-qa grid (6 spots × 6 views via `__sonarState.boat/target`,
  `__sonarSnap(768,384)`, `__sonarHist(10)`; phone via the home tiles) is described in the `sonar-qa` skill; my grid script is
  gone with the scratchpad, `scripts/dev/livescope/` keeps the wreck, grain and white-share scripts.
- **Measuring like for like:** scale from the picture's own rulers; `__sonarFlat(2048,1024)` crop (532,0,1516,1024) → 2256×2220 equals
  the app crop; keep UI text out of the boxes; never judge from stills by eye (Jason rejected that in #128). Method also in
  `docs/lessons.md` ("Tune the engine against a real recording, like for like").
- **What failed:** WebFetch and the cloud container cannot reach YouTube; `yt-dlp` is forbidden by the brief; adb is at
  `~/android-sdk/platform-tools/adb`, the V10 tablet was not connected on 10-24 (not checked again on 10-31); real-device fps after #145 is only measured on the vivo fold (60 fps, backlog).
- **Never found:** screen recordings of LVS62 and LVS32, and of MEGA Live 2 (one MEGA Live video sampled was deck camera only);
  ActiveTarget 2 only as one small inset. No Perspective footage of the original LVS32. No own LiveScope recording from Jason.
  **Candidates never opened** (from the 2026-10-23 search results; the ones not in `reference/livescope/candidates.md` are marked *): Milliken "Live Screen Footage Catching Bass"
  (`TyZARN6Ian0`, 55 min)*, Austin Cranford "SCREEN FOOTAGE" (`u4bi1T_s1AM`)*, Joey Johnson timber (`I2jqPOjiLTA`)*, TJ Erickson
  Perspective (`JeH4XbJBeZM`)*, InDepth Sonar Perspective (`HC9UtCwsskE`), Bend It Fishing XR LVS62 vs LVS34 (`wMr-FiTp4fY`),
  Big Time Alaskan LVS62 ocean (`TeLif02o8pM`), 3 Pound Crappie Brushpiles (`aILjqFiVua0`)*.

## 6. Jason's preferences I learned
- "42 或 44 的画面" (2026-10-23, via the ice window): he means LiveScope 2 (LVS42HD, LVS44). Only screen-recorded footage, not a camera pointed at a screen.
- 2026-09-24 (`docs/sonar-style.md` §7.7): Garmin's is amber; learn from clear LVS34 videos, not from Garmin's marketing stills.
- 2026-10-24 (#148): "不是简单的横向短颗粒 … 看真机的颗粒 … 共性 … 规律", then "按这个规律重做纹理，实心和亮度保持" and "这版纹理做得非常的好"; #147 "边缘的纤维对了".
- Measure, don't eyeball: he rejected judging from stills (#128, 2026-10-23).
- 2026-10-17: ask before any workflow or parallel agents (token burn). 2026-10-25 "问我 问我 问我": when it gets complex, stop and ask.
  2026-10-30: every question to him goes in a clickable card. Always: Chinese, short, one question at a time; "我没说动不要动".

## 7. Read first
1. `CLAUDE.md` (Lab rules, #176, #183).
2. `docs/livescope-study.md` (rules, catalogue, ranked frames, "Not done").
3. `docs/sonar-style.md` §7.7 (LVS34 palette), §7.20 (measured), §10 (the app's wreck recording, the grain rule).
4. `docs/decisions.md` #148 (grain rule), #137 (colour default), #152 (band fill), #155 (the workboat).
5. `docs/backlog.md` lines 83 and 385–386 (status of this lane).
6. `scripts/dev/livescope/README.md`, then `reference/livescope/candidates.md` and the `notes.md` of the video you need.
7. `docs/lessons.md` "Tune the engine against a real recording, like for like".
