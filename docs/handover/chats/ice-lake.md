# Chat handover note: 冰钓版本视觉效果 (slug ice-lake), 2026-10-31

Written by the old-app chat of that name (the "twin" did the 10-29 to 10-31 work in the new app; I read its transcript `18b64069-afb6-4a22-a04e-1803cc956c09.jsonl` to the end, 10-31 13:26, 5764b06). A fresh replacement chat starts from this note alone. Facts here were checked on main `6d4c9f8`/`5e3d706` on 10-31.

## 1. Lane

You own **the lake scene and the sonar imaging, ice page included** (#176, Jason 10-27: "湖景统一成一个版本"). Nobody else changes `src/experiments/2026-09-23-sonar-lake-3d/` sonar, lake, fish, terrain, or the ice scene files. Others ask you; HQ forwards.
- Files: `sonarShader.js`, `SonarScreen.jsx`, `lakeMaterial.js`, `Scene.jsx`, `fish.js`, `fishBeam.js`, `fishGeometry.js`, `terrain.js`, `rocks.js`, `vegetation.js`, `wreck.js`, `sonarMarks.js`, `colormaps.js`, `lakeFFT.js`, `iceScene.js`, `iceSheet.js`, `IceCamp.jsx`, `iceProps.js`, `snow.js`, `iceSky.js`, and the Combo/Forward range logic in `index.jsx` and `SonarChrome.jsx`.
- Not yours: the phone page, share, badges, i18n copy, embed, load speed (手机网页端 owns those; before editing `index.jsx`, `i18n.js`, `SonarChrome.jsx` ask it or check `git status`); ad films (#179/#183/#185: 孙英杰 and the ad chat; you only provide hooks or cameras when asked); anything on shop.accuphy.com (handoff files to `accuphy-website/handoffs/`).
- The colleague 孙英杰 (GitHub AJ-nb, #183) may tune the lake scene on his own branches/PRs and choose scenes for videos, but not the sonar imaging engine. PR #30 and #31 are reference only (Jason 10-30). HQ tells you before any merge; both conflict with main.
- **Lake and ice share code (#94):** check any lake change on the ice page and the reverse (sonar-qa grid against the last commit, desktop and phone). Jason 10-18: "这个确实要非常注意".
- Never deploy lab.accuphy.ca or change the test links: HQ does that, and live changes need Jason's "动" said in Lab HQ. An approval relayed by another chat does not count.
- Decision log rule: `docs/decisions.md`, re-read the last number (now #194) right before appending and again after `git fetch`.

## 2. State now

- main `6d4c9f8` (plus HQ's later `5e3d706`), local = origin; `git push` goes to both GitHub copies (#194: `personal` = jasonzhu-ctrl, `company` = accuphy-marketing).
- **Live lab.accuphy.ca: `5c2e69a`** (10-30). **Test links: `5764b06`** (HQ, test-link repo `7d52e0c`). Live has everything below up to #190. Test links add #191, #192, #193.
- My commits in the old-app window since 10-27 (all pushed, all on live except where noted):
  - `a3abfc4` fish round 3 (#173): density between rounds 1 and 2, bass drawn 1.5×.
  - `d227262` lake jig removed (#174). `9829174` three deep lake trout in the 110 ft hole + deep still. `c9f900b` round wake rings back, Kelvin wake removed (#175).
  - `26cb429` + `1abeedf` far fish steady and a middle size (#177).
  - `e5a512c` Panoramic tuned against the app (#178); `283ecb9` the sound picture is the only Panoramic, plan view and /pano/ deleted.
  - `9ed9341` Mini Forward shows no depth readout (#181). `a1fd3ee` Mini Combo has two ranges, each moved on its own (#189).
- The twin's work (10-30/31): #190 US Mini only (`5c2e69a` live), #191 subscribe-to-unlock (`c91bf7e`, test only), #192 desktop panel (`d8b411c`, test only), #193 fish in the beam (`5764b06`, test only).
- Local only, uncommitted: `docs/HANDOVER-FOR-ANOTHER-AI.md` (HQ removes it after this note is checked). Do not commit it.

## 3. In flight

- Nothing half-written in code. #193 is committed (`5764b06`, `fishBeam.js`, canon updated). Its desktop rerun after the last tightening is done and sent to HQ (numbers below).
- **#193 desktop rerun (10-31 14:00–14:30, main 6d4c9f8):** seconds to reach the minimum fish count after the boat stops, 30 s per spot (— = not reached; count at 30 s in brackets). Opening spot: every view started at or above its minimum.

  | spot | PL Fwd | PL Down | PL Pano | Mini Pano | Mini Down | Mini Fwd | Mini Combo* |
  |---|---|---|---|---|---|---|---|
  | (6,-6) | 24 | 19 | 23 | — (2) | 17 | 29 | 18 |
  | (18,18) | 11 | 23 | 0 | 17 | 26 | 15 | 7 |
  | (-24,-45) | 5 | 0 | 25 | 24 | 0 | 8 | 0 |
  | (30,-6) | — (1) | — (1) | 27 | — (2) | — (2) | — (0) | — (2) |
  | (42,-6) | — (0) | — (1) | — (0) | — (0) | — (0) | — (0) | — (0) |

  Minimums: PL Forward 4, PL Down 4, PL Pano 6, Mini Pano 4, Mini Down 3, Mini Forward 3, Mini Combo 3 per beam. *Combo: after the opening spot the page read as Forward, so only the opening spot is valid for Combo (cause unchecked: maybe Combo is behind the #191 gate in the harness). Headless desktop; no fps claim. Raw logs: `scripts/dev/qa/fish-beam/rerun-2026-10-31/`.
- To rerun: `npm run dev`, then `cd scripts/dev/qa/fish-beam` and see its README (`matrix.mjs`).

## 4. Waiting on

| Item | Waits for | Since | Where raised |
|---|---|---|---|
| Which of #191, #192, #193 go live before 11/2 (live needs Jason's "动"; #191 without #192 must be built from `c91bf7e`) | Jason | 10-30 | Lab HQ, backlog status bar |
| Is the #193 shortfall acceptable (the "about 10 s" holds only for fish within ~8 m; the two sparse spots stay at 0–2 fish for the Mini) and does the swim look natural by eye | Jason, on the test link `/mini/` | 10-31 | Lab HQ, `docs/decisions.md` #193, `docs/2026-10-31-fish-in-beam-sheet.jpg` |
| Should the phone in Combo lie flat? "Forward looks tilted": HQ reproduced it, the lake bottom really rises about 41 to 23 ft there and the tilted phone frame exaggerates the slope; level on flat ground | Jason (HQ asked him; do not ask him yourself) | 10-31 | the new-app Lab HQ chat |
| Fish group at the Mini Combo's default spot (so Jason's first view has fish) | Jason decides; unbuilt | 10-31 | `handoffs/2026-10-31-mini-combo-few-fish.md` (answered, not built) |
| Forward `1.0x` zoom control in the Mini (the app has it) | HQ/Jason ask; unbuilt | 10-27 | #181 note |
| Glass effect choice, tracking choices, version management, deleting `pr30/` `pr31/` pages, LiveScope questions | Jason | 10-30 | `docs/backlog.md` |

## 5. Know-how not in the repo

Dev aids (the sonar page): `?boat=x,z` start spot; `?cam=boat|wreck|logo|rocks[:hump]|workboat[:deg]|fish:<name>`; `?time=dusk|day|night`, `?look=snow|mixed|glass`, `?icelut=amber` (ice); `?frame=375x812` fake phone box; `?bigphone`; `?debug`; `?fish=marks` (old marks, dev only); `?lang=fr`. In the console of the dev page: `__sonarState` (boat/target/apex/specs…), `__sonarFlat(w,h)` (the sonar picture flat as a PNG data URL), `__sonarHist(bins)` (brightness histogram), `__sonar.mat.uniforms`, `__sonarTune` (`{k..k6, kp, kb}` tone knobs; `kp` = Panoramic's `uPanoK`: hard-target level, field floor, hard ceiling, steep floor).

Working method that worked:
- **A/B against a baseline commit:** `git archive <commit> | tar -x -C <dir>`, symlink `node_modules`, `npx vite --port 5175 --strictPort`, run the same Playwright grid on 5173 (changed) and 5175 (baseline), diff tile means and the share of lit pixels (> 20 luma). Differences below about 3 mean luma or 0.5 % lit are moving fish and grain. (My grid script `grid5.mjs` died with its scratchpad; `scripts/dev/qa/fish-beam/grid.mjs` and the `sonar-qa` skill describe the same grid: 6 spots default (−6,4), shelf (−40,−5), hump (22,8), deep (4,−40), lockup (−14,−52.5), dropoff (−3,−14) × PL Down/Forward/Panoramic + Mini Down/Forward/Combo; ice: camp, east [8,4], north [−4,−10] × 4 views.)
- **Phone timing:** Chromium with `--use-angle=metal --disable-gpu-vsync --disable-frame-rate-limit`, 390×844 @3 isMobile, count rAF for 2.5 s, three repeats, interleave builds. Panoramic phone frame: 2.2 ms (old plan view 1.6 ms). Not measured on the V10 tablet.
- **Fish pipeline (#153):** SonarScreen pass 4 draws the fish bodies into `fishRT` (angle × range, MAX blend, 4× MSAA; rows 256 per fan). Fish blur is σ = max(0.6·uBeamHalf, 0.055/r). For the flat fan (Panoramic) the blur uses 25 taps at 0.2 σ, one row each; with 0.4 σ spacing thin fish came out as combs of stripes. Far fish get a minimum radial thickness of 5 rows at long range or they flicker (#177).
- **Panoramic = the vertical pipeline with the fan laid flat** (`uFlat`; strip camera 35° down, ±30°). Black lanes came from rocks blocking the whole slab; a dark-crimson floor of the same grain fills them (`uPanoK.y`). Rocks have their own sonar tag 0.45 (`ROCK` in `lakeMaterial.js`); the rest of the engine reads it like timber (0.5). Row stretches must tile with matching edges and no per-row edge line or second echo, or contour rings appear.
- **Combo (#189):** two ranges, `comboFwdFt` and `comboDownFt` in `index.jsx`, null = AUTO (Forward the old `comboAutoRangeFt`, Down the AUTO depth). Moving one never moves the other. The Forward panel's depth follows the water's AUTO depth with a floor at it (`comboFwdDepth`).
- Gotchas: R3F copies plain-object uniforms: update through `mat.uniforms.x.value`. Safari: FloatType textures with LinearFilter read black (use HalfFloat or Nearest). The sonar shader already uses 16 textures, the maximum on iPhone. The page's guide cards can switch the view by themselves during a test: re-select the view before each capture, or the grid compares the wrong view (cost me a false alarm). Two browsers at once make Playwright cases flake. Dev servers: start with `preview_start` name `lab` (Claude app) or `npm run dev`; port 5173.
- Scratchpad paths die at midnight and after cleanup: all my Playwright scripts from the 10-27 window are gone except what is in `scripts/dev/`.
- GitHub: `git push` to both copies; a plain push once printed "repository moved" (harmless). Pushing a new file with the auto-mode classifier may be blocked (it blocked a handover file once); if so, stop and tell the user.

## 6. Jason's preferences I learned

- "我没说动不要动" (2026-09-24): plans are not go-ahead. 
- "问我 问我 问我" (10-25): when it gets complex, stop and ask; one question at a time; questions now go as clickable cards (10-30).
- Look first, not bytes: "高级感/科技感" (#50).
- Fish and picture must match the app: "鱼的形状…跟 app 差得远" style feedback leads to a reference-frames study first, always (10-23, 10-24).
- Rocks "石头的echosound反射比较强": hard targets must be the brightest thing (10-27).
- "中距离的鱼…变得很闪也变小 我觉得闪不对 大小应该折中一点" (10-27): no flicker, a middle size.
- "Mini 的 combo 下面 range 是动不了的…forward 的 range 跟 down 的 range 可以分别的调" (10-29).
- "PingLive Mini的forward是不显示深度的" (10-27).
- No big agent fan-outs without asking (10-17). No ad language versions (#185).

## 7. Read first, in order

1. `CLAUDE.md` (project rules and the chat list).
2. This note.
3. `docs/backlog.md` (status bar, then the Sonar section).
4. `docs/lake-canon.md`.
5. `docs/decisions.md` #173–#194 (especially #178, #181, #189, #193).
6. `docs/handover/2026-10-31-recovery/00-verified-status.md`.
7. `docs/sonar-style.md` §6–§7 and `docs/app-chrome.md` §6 (how the real app draws; Mini views).
8. `.claude/skills/sonar-qa/SKILL.md` and `sonar-look-tuning/SKILL.md`.
9. `scripts/dev/qa/fish-beam/README.md`.
10. `docs/lessons.md` only for big work on the sonar picture, terrain, fish or sharing.
