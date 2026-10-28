# BF ad v3: PingLive, 15 s, 9:16 (2026-10-26/27)

The brief is the end of `docs/2026-10-26-ad-v2-pinglive-brief.md` ("第 3 版方向" and "Jason 10-27 定（#174）"). The board
is `docs/2026-10-27-ad-v3-stills-r3.jpg`. The type layer is `../v2/overlay2.html` (Creative Cloud Eurostile via `local()`).
Owner since 2026-10-27: the ad video chat "广告视频制作" (#179).

## Stills (the board)

- **`v3a.mjs <out> [port]`:**
  - The opening, camera `f5`: PL Forward at the timber flat (`?boat=16,11`), from high south-west.
  - The 135° landing, camera `s8`: Panoramic at 80 ft from the south, high.
  - Both use `noLogo` to keep the lakebed lockup out of frame.
  - Round 2 left the opening camera out of this file. `f5` was refitted on 2026-10-27 against the board's background. The
    boat and beam sit within ~2 % of the frame of the board.
- **`v3deep.mjs <out> [port] [frames]`:** (replaces `v3jig.mjs`; the lake jig was removed in #174)
  - PingLive Forward over the 110 ft hole, three lake trout at ~92–99 ft on the phone, the real depth read-out.
  - Phone layout (360×640 @3) with the page's own phone screen; the other page buttons hidden.
  - The still: `BOAT='-32,-47.2' TILE='Forward View' CAM='{"dx":11,"py":38,"ly":-8,"pz":30}'`, frame 1, read-out 101.5 ft.
- **`grade.py <in> <out>`:** the v3 grade, lake ×1.2 brighter and a little cooler (R ×1.164, G ×1.2, B ×1.236). It was an
  inline PIL step before; fitted on 2026-10-27 to the board's backgrounds (mean error < 1/255).
- **`stills3.mjs <dir> <out>`:** the type over the graded backgrounds. `<dir>` holds `overlay2.html`,
  `fonts/InstrumentSans-Variable.ttf` (from `public/brand/fonts/`), `logo.png` (= `public/brand/logo/White Accuphy Logo.png`)
  and the graded `v3-open.png`, `v3-pano.png`, `v3-deep-pl.png`.

## Toolchain (checked 2026-10-27)

- **`playwright-core@1.63.0`** in the scratchpad (`npm i playwright-core@1.63.0`). The newest version wants a Chromium build
  that is not in `~/Library/Caches/ms-playwright` (1243 is there). The scripts import `playwright-core` bare, so run copies of
  them from a folder whose parent has `node_modules` linked to that install.
- **Dev server:** the Browser preview's "lab" server. When another chat already holds 5173, it lands on 5174; pass the port.
- **Eurostile Heavy:** `local('Eurostile Heavy')` loads with Creative Cloud running (`document.fonts.check` true, metrics not
  the fallback's).
- **`frames2mp4`:** `swiftc -O ../frames2mp4.swift -o frames2mp4`. A test encode came out as 1080×1920 and 1080×1350
  (after `to45.py`), 30 fps, ~11.5 Mbit/s.
- **Re-render check:** the deep-water still re-rendered from `v3deep.mjs` + `grade.py` + `stills3.mjs` matches the board
  (mean difference 0.68/255, same 101.5 ft read-out). The 135° background from `v3a.mjs` matches too (4.9/255, water only).

## The 15 s film: shot plan (Jason nodded the stills 2026-10-27: "三张定格可以，做 15 秒成片")

15 s at 30 fps = 450 frames, 1080×1920, silent (brief rule 10). Hard cuts between shots. Each shot is its own recording
pass on the virtual clock of `../rec.mjs`. Frames from the passes are joined, graded with `grade.py`, and get the type layer
per frame.

The existing dev hooks are enough: `camOverride` is applied every frame without smoothing, the boat follows
`__sonarState.target`, and `fanOpen`, `adClean`, `adBeam`, `__chase` and `window.__camera` exist. **No new lake hook is
needed.**

Every boat move goes bow-first (+x): the hull does not turn (#166).

### Shot 1: opening, 0.0–3.0 s (frames 0–89)

- **Pass `open`:** desktop context 1080×1920 @1, frames from `__lakeSnap()`, `?boat=16,11`, PingLive Forward.
  `adClean`, `adBeam {line .55, face .2}`, `noLogo`.
- **Camera:** a slow, steady dolly that ends on the board's frame.
  - From `pos [-6, 25, 64]`, look `[26, -6, 8]`.
  - To `f5`: `pos [-2, 26, 60]`, look `[28, -6, 8]`, fov 48.
  - Linear with a soft start (0–0.4 s), so the move is still going at the cut.
- **Boat:** target x 16 → 18.5 over 0.2–3.0 s. The beam glides over the timber flat.
- **Fish:** `__chase('largemouth')` at 0.3 s, so a fish rises in the beam by ~0.8 s.
- **Type:**
  - The small wordmark is top left (y 280, inside the Reels top zone; HQ 10-27) from frame 0.
  - `This is what's under your boat.` fades and slides up 24 px at 0.3–0.8 s, block top 380, gradient on.

### Shot 2: 135°, 3.0–7.5 s (frames 90–224): the hero move

- **Pass `pano`:** same context as Shot 1, Panoramic, 80 ft, `adBeam {line .5, face .16}`, `noLogo`.
- **3.0–4.6 s, straight down:**
  - Camera `T` looks straight down (pitch about −88°) on the fan, about 125 m up, fov 48.
  - The fan sits in the lower half of the frame, clear of the type block (340–760).
  - `T` = `pos [31, 201, 11.4]`, look `[31, -10, 5.4]`: the open block fills x 412–671, y 780–1266. That is clear of all the
    type (it ends at 764) and of the Reels bottom zone but 18 px (HQ 10-27 asked for ~700–1240).
- **The fan opens:**
  - `fanOpen` runs 0.02 → 1 over 3.15–4.6 s, ease-out cubic.
  - The number is `round(135 × fanOpen)`, so `135°` lands on the exact frame the fan is widest (brief rule 4).
  - A brand-blue outline (#028CDF, 5 px, glow) traces the coverage block. The block is the 135° fan clipped to the
    phone's screen box, so it has a flat far end, not an arc. Each frame, `film3.mjs` builds the block with the lake's own
    `wedgeGeometry` (narrowed by `fanOpen` as Scene.jsx does; read-only), projects it through `window.__camera` and takes
    the hull. A round 135° arc was tried first and bulged past the block.
  - The blue rule under the number draws out with it.
- **4.9–7.1 s, the pull-down** (HQ 10-27: bigger and lower):
  - The camera swings from `T` down past `s8`'s height and lands on `s8`: `pos [22, 80, 92]`, look `[27, -10, 0]`, fov 48.
  - It moves in spherical coordinates about the look point, eased with smootherstep over the whole move.
    - The elevation falls to 26° at 60 % of the move (`LOW_EL`). At 16° the water mirrored the sky and hid the block.
    - The distance closes to 92 m at 50 % (`LOW_R`).
    - The azimuth drifts 30° west, behind the boat, and back (`SWING_AZ`).
    - The look point rises 15 m and back (`LOOK_LIFT`), so the block rides under the type.
  - In the low part, the block passes big across the frame, seen along the beam from behind the boat. It then rises into
    the board's frame. Its top edge touches y 681 for one frame (5.6 s); the board's own landing frame sits at 732.
  - The whole coverage block comes up out of the water and reads in the lake (Jason: "从上往下看作为起点，再挪下来到侧边").
  - The blue outline fades out over 4.9–5.3 s. From the side, the 3D wedge's own outline carries the coverage.
  - `__chase('largemouth')` at 5.6 s, so something moves inside the block as it lands.
- **7.1–7.5 s:** hold on `s8` (the board's 135° still).
- **Type:**
  - `135°` and the rule sit at block top 340 from 3.15 s.
  - `See the whole bay in one look.` fades in at 4.6–5.0 s, after the number lands.
  - All of it holds to 7.5 s.

### Shot 3: deep water, 7.5–11.5 s (frames 225–344)

- **Pass `deep`:** phone context 360×640 @3, frames from `page.screenshot`, `?boat=-40,-47.2`, tile "Forward View".
  The page buttons and the hint are hidden as in `v3deep.mjs`. `adClean`, `adBeam {line .55, face .16}`.
- **Boat:** target x −40 → −32 over 7.5–9.3 s, smootherstep.
  - The phone's read-out climbs as the boat crosses the drop-off into the 110 ft hole (probed: −40 → 58.8 ft,
    −36 → 75.7 ft, −32 → 101.5 ft).
  - The lake trout at 92–99 ft come onto the phone's sonar.
  - The depth is told only by the app's own read-out, with no big number (#174).
- **The phone, lifted (HQ 10-27):**
  - Injected CSS moves the phone frame 215 CSS px up, at its real size. It now fills y 748–1233, read-out at ~y 900,
    above the Reels bottom zone.
  - The page draws the sonar into the frame's on-screen rect every frame (`SonarScreen.jsx`), so the picture follows.
    No lake code is changed.
- **Camera `h`:** follows the boat, `pos [bx + 11, 52, 55→52]`, look `[bx + 11, −25, −47]`, fov 42. `bx` is the boat's x
  on that frame.
  - The boat sits just under the line (y ~503), and the block's top fills the band between the line and the phone.
  - The block's deep end and the trout are behind the phone; the phone shows them.
- **Fish:** the lake trout swim on their own. `__chase('laketrout')` at ~100 ft answers 'blocked'.
- **Type:** `Serious deep water ready.` fades in at 8.0–8.5 s (when the read-out passes ~80 ft), block top 380. No number.

### Shot 4: end card, 11.5–15.0 s (frames 345–449)

- **Background:** the `deep` pass keeps recording to 15 s, so the water still moves. It darkens to 20 % with a 9 px blur
  over 11.5–12.0 s. The lifted phone now sits behind the end card's type, hence darker than the 25 % first planned.
- **11.5–11.8 s:** the small wordmark fades out (no double logo).
- **11.8–12.3 s:** the big ACCUPHY wordmark (white, 720 px wide, centred, top ~640) fades in and scales 0.96 → 1.
- **12.1–12.6 s:** a brand-blue rule (6 px) draws out from the centre to 720 px, under the wordmark.
- **12.4 s:** `Play the free sonar demo` (Instrument Sans 600, 70 px) at y ~900.
- **12.6 s:** `Accuphy Lab` (Eurostile Heavy, ~120 px) at y ~1000.
- **Hold to 15.0 s.** All the type stays between y 250 and 1520 (safe zones, brief rule 9).

### Type timing at a glance

| s | Small wordmark | Big number | Line |
|---|---|---|---|
| 0–3 | on | none | `This is what's under your boat.` (in 0.3–0.8) |
| 3–7.5 | on | `135°` counts with the fan, lands 4.6 | `See the whole bay in one look.` (in 4.6–5.0) |
| 7.5–11.5 | on | none (the phone read-out) | `Serious deep water ready.` (in 8.0–8.5) |
| 11.5–15 | off at 11.8 | big wordmark + rule | `Play the free sonar demo` / `Accuphy Lab` |

- The first three lines are placeholders until Klaviyo HQ finals them. French goes to the website HQ.
- The end line is already final: Klaviyo HQ's BF caption, "Play the free sonar demo: Accuphy Lab" (#168).

### Build

Run copies of the scripts from the scratchpad (see Toolchain). The "ad-lake" preview server serves
`reference/ads/lake-checkout/` (git-ignored): `git archive 1abeedf | tar -x -C reference/ads/lake-checkout`, with
`node_modules` linked to the repo's. It runs on port 5190.

1. `node film3.mjs open|pano|deep <dir>/<pass> 5190 [fps]`: records the three passes. Frames are named by the 30 fps
   frame number, so a 10 fps preview and the final line up. Each pass writes `frames.json` (the block's outline,
   `fanOpen`, the read-out, the boat).
2. `python3 grade.py <dir>/<pass> <comp>/bg` for each pass. Put `overlay3.html`, `fonts/`, `logo.png` and the pano pass's
   `frames.json` as `pano.json` in `<comp>`.
3. `node comp3.mjs <comp> <final>`: the type, per frame. Add `clean` for the version without type. `LINES='{…}'` gives
   the French version.
4. `frames2mp4 <final> <out.mp4> [fps] [bitrate]`, and `../to45.py` for 4:5.
5. `python3 sheet3.py <final> <sheet.jpg> <frames> [--reels]`: a contact sheet, optionally with the Reels safe zones.

**10 fps preview (2026-10-27):** `reference/ads/2026-11-bf/v3/preview/preview10-{open,pano,deep,end,all}.mp4`. Sheets:
`docs/2026-10-27-ad-v3-film-preview-sheet.jpg` and `docs/2026-10-27-ad-v3-film-reels-zones.jpg`.

- The read-out climbs 58.8 → 101.5 ft over 7.5–9.5 s.
- `__chase('laketrout')` at ~100 ft answers 'blocked', so it is left out; the trout swim on their own.

**Reels safe zones** (14 % top, 35 % bottom, 6 % sides, as third-party checkers quote Meta's Reels ad specs; Meta's own
page was not reached): y 269 / 1248, x 65 / 1015.

- The 10 fps preview found three problems; HQ's fixes of 10-27 are in.
- All the type is inside, and the wordmark now starts at y 280.
- The deep-water phone, read-out included, is above y 1248.
- The 135° block from the top ends at y 1266.

**The film (2026-10-27, 30 fps, from lake 1abeedf, after HQ's preview check):** in `reference/ads/2026-11-bf/v3/`
(git-ignored; this computer has no backup).

- **Backup:** approved films go to the shared Google Drive, Accuphy Public Drive → Marketing (drafts),
  <https://drive.google.com/drive/folders/1qAXHSENYbUzx8SuMWsG_9Qa2xXxyb94h> (HQ 2026-10-28).
- IT & HR copied these four there. Put every later version in the same folder, and tell HQ when you do.

| File | Size | Format |
|---|---|---|
| `pinglive-916-en.mp4` | 14.5 MB | 1080×1920, 15.0 s, 30 fps, H.264 ~8 Mbit/s |
| `pinglive-916-clean.mp4` | 17.7 MB | the same, no type, no end card |
| `pinglive-45-en.mp4` | 13.9 MB | 1080×1350, `../to45.py` |
| `pinglive-45-clean.mp4` | 16.7 MB | 1080×1350, no type |

- Contact sheet with the Reels zones: `docs/2026-10-27-ad-v3-film-sheet.jpg`.
- The read-out climbs 58.8 → 101.5 ft (7.5–10 s).
- The English lines are placeholders until Klaviyo HQ finals them. The end line is final.
- For a new line, run `comp3.mjs` again on the kept frames, without recording again. The French version needs only `LINES`.

## Mini US: the 15 s film for the US (plan only, 2026-10-28; nothing recorded)

Why: 11-02 goes live in Canada and the US. PingLive is not sold in the US before February, so the US gets a PingLive Mini
film (`docs/2026-10-28-bf-scope-expanded-plan.md`). The PingLive v3 film is the template: the same four beats, the virtual
clock, the type layer, the grade, the Reels zones, the end card. **It waits for two things:** Jason's pending changes to
the v3 film (they will likely apply here too) and his go for this film, both relayed by HQ.

**True to the Mini:**
- **Beam:** 39° (live view) × 20° (`IT/accuphy-website/docs/specs.md`). No 135° and no beam number on screen.
- **Views:** Live Forward, Live Down and Live Combo; Live Ice belongs to the ice page.
  - Live Forward has no depth read-out (#181).
  - Live Down shows the depth top left, Live Combo top right.
- **Units:** imperial (the page defaults to feet: read-outs `96.3 ft`, range `140ft`). English. The US Reels safe zones are
  Meta's same Reels zones (14 % / 35 % / 6 %: y 269 / 1248).
- **The Mini's hero beat is Live Combo:** two curtains at once, Down under the hull and Forward reaching ahead into the
  timber. That is the Mini's own view, and the Lab already says it ("Combo shows Down and Forward side by side").

**Recording source:** a fresh clean checkout of the current lake commit (`docs/versions.md`; 1fc1678 or later, so that
#181 is in), built as the Mini-only page (`VITE_DEVICES=PLM`, like `/mini/`, which the US store page frames). It runs on a
second preview server, "ad-lake-mini" (port 5191), added to `.claude/launch.json` at recording time.

### Shots (probed on 2026-10-28 on 1abeedf; cameras to be fine-tuned in the 10 fps preview)

**1 · Opening, 0–3 s: Mini Live Forward at the timber flat**
- `?boat=16,11`, lake context, the same dolly as the v3 opening (`OPEN0` → `f5`).
- Probed: the Mini's Forward curtain is narrower than PingLive's and reads well running into the standing timber.
- Boat bow-first 16 → 18.5; `__chase('largemouth')` at 0.3 s.
- Line (placeholder): `See what's ahead of your boat.` (Forward looks ahead; the v3 line is about "under").

**2 · Hero, 3–7.5 s: Live Combo, the two curtains at once**
- Same place, Live Combo (Down curtain R ≈ 10 m to the AUTO depth, Forward curtain R ≈ 25 m; both are in `s.specs`, so
  `fanOpen` opens both at once).
- **3.0–4.3 s:**
  - Hard cut to camera `C1`: low behind the boat, looking along the beam (probe: `pos [4, 3, 13]`, look `[30, -6, 11]`,
    fov 50).
  - It needs pulling back (about `pos [-4, 6, 16]`), so the hull stays out of the type band.
  - `fanOpen` runs 0.05 → 1. Both curtains grow together, one straight down under the hull, one ahead into the trees.
- **4.6–6.9 s:**
  - The swing: the camera orbits about 90° out to the south side and rises, landing on `C2`.
  - `C2` is the probe's high side view, `pos [24, 22, 58]`, look `[24, -9, 11]`, fov 44: both curtains in the lake with
    the timber lit.
  - It is the same spherical swing as v3 (`swing()`), with its own low point and lift tuned in the preview.
  - `__chase('largemouth')` at 5.6 s.
- **6.9–7.5 s:** hold on `C2`.
- **Type:**
  - Instead of a counting number, a headline in Eurostile Heavy (~150 px): `AHEAD + BELOW`, with the `+` in brand blue.
  - It lands when both curtains are fully open (4.3 s), with the blue rule.
  - Line: `Live Forward and Live Down, at the same time.` Both are placeholders for Klaviyo HQ; Jason or HQ can pick another
    headline, e.g. `LIVE COMBO`.
- The brand-blue outline from the top is dropped: there is no top-down start here. The 3D curtains' own outlines carry it.

**3 · Deep water, 7.5–11.5 s: Mini Live Down over the 110 ft hole**
- Phone layout, tile "Live Down", the phone lifted out of the Reels zone exactly as in v3 (215 CSS px, real size).
- Boat bow-first −33 → −25 over 7.5–9.3 s. The read-out climbs 96.3 → 109.9 ft (probed).
- The three lake trout (~92–99 ft) show as marks just over the bottom on the phone (probed at −25).
- Camera: like v3's `h`, with `dx` re-fitted so the boat sits under the line and the top of the Down curtain shows between
  the line and the phone.
- Line (placeholder): `Serious deep water ready.`
- **Not Live Combo here:** over the hole, Combo's Forward panel paints the lakebed "ACCUPHY LAB" lettering. `noLogo` hides
  it only from the 3D camera, not from the sonar. Live Down at −25 is clean.

**4 · End card, 11.5–15 s:** as v3: the big wordmark, the blue rule, `Play the free sonar demo` / `Accuphy Lab` (final).

### What is needed from others

- **冰钓版本视觉效果 (#176): no new hook is needed.** `camOverride`, `fanOpen` (both Combo curtains), `adClean`, `adBeam`,
  `__chase` and `window.__camera` cover every shot. Two things to check, not hooks:
  - **Beam width:** the engine's Mini fan spans ±21.5° (43°) in `s.specs`; the spec is 39°. No number is shown, so the ad
    is not blocked, but the curtain is ~10 % wider than the spec.
  - **Lakebed lettering in the sonar:** if a later version wants Combo on the phone near the hole, a dev switch that keeps
    the lakebed lockup out of the sonar picture would be needed.
- **Klaviyo HQ:** the four English lines (US); the end line is final.
- **Website HQ:** the US store page frames `lab.accuphy.ca/mini/` (already on their list).

### Code changes (ad scripts only)

- `film3.mjs`: a `FILM=pl|mini` switch picks the shot table (cameras, views, boat paths, calls); the passes and the clock
  stay shared.
- `overlay3.html` / `comp3.mjs`: the hero beat takes either a counting number (v3) or a headline word (Mini). Lines come
  per film.
- Outputs: `reference/ads/2026-11-bf/mini-us/plm-916-en.mp4`, `plm-45-en.mp4` and the two clean versions. They are copied
  to the shared Drive folder above once approved.

### Time

- About half a day of work from the go, plus HQ's review loop:
  - checkout and server: 15 min;
  - script switch: 1 h;
  - camera fitting for C1 / C2 / the deep camera: 1–2 h;
  - 10 fps preview and contact sheet for HQ: 30 min.
- After HQ's check: the 30 fps 9:16, 4:5 and clean versions, about 1 h (the render runs ~25 min).
- If Jason's v3 changes are large (new beats or cameras), add their time once known.
