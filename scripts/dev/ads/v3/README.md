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

## The 15 s film: shot plan (not rendered; waits for Jason's nod on the stills)

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
  - The small wordmark is top left (y 262) from frame 0.
  - `This is what's under your boat.` fades and slides up 24 px at 0.3–0.8 s, block top 380, gradient on.

### Shot 2: 135°, 3.0–7.5 s (frames 90–224): the hero move

- **Pass `pano`:** same context as Shot 1, Panoramic, 80 ft, `adBeam {line .5, face .16}`, `noLogo`.
- **3.0–4.6 s, straight down:**
  - Camera `T` looks straight down (pitch about −88°) on the fan, about 125 m up, fov 48.
  - The fan sits in the lower half of the frame (its centre near y 1150), clear of the type block (340–760).
  - Starting value: `pos [27, 125, -4]`, look `[27, -10, -10]`. The first test frame fine-tunes it.
- **The fan opens:**
  - `fanOpen` runs 0.02 → 1 over 3.15–4.6 s, ease-out cubic.
  - The number is `round(135 × fanOpen)`, so `135°` lands on the exact frame the fan is widest (brief rule 4).
  - A brand-blue outline (#028CDF, 5 px, glow) is drawn on the water. Each frame it is projected through `window.__camera`
    from the apex, ±67.5° × `fanOpen`, out to the range (the projection of `../v2/v2bg3.mjs`, per frame).
  - The blue rule under the number draws out with it.
- **4.9–6.9 s, the pull-down:**
  - The camera swings from `T` down to the south side and lands on `s8`: `pos [22, 80, 92]`, look `[27, -10, 0]`, fov 48.
  - It is an orbit, not a straight line. The offset direction from the look point is slerped, the radius and the look point
    are lerped, with smootherstep easing (slow start, fast middle, soft landing).
  - The whole coverage block comes up out of the water and reads in the lake (Jason: "从上往下看作为起点，再挪下来到侧边").
  - The blue outline fades out over 4.9–5.3 s. From the side, the 3D wedge's own outline carries the coverage.
  - `__chase('largemouth')` at 5.6 s, so something moves inside the block as it lands.
- **6.9–7.5 s:** hold on `s8` (the board's 135° still).
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
- **Camera:** follows the boat with the still's offset, `pos [bx + 11, 38→38, 32→30]`, look `[bx + 11, −8, −47]`, fov 42.
  `bx` is the boat's x on that frame. The slight push-in settles on the board's frame at ~9.4 s.
- **Fish:** `__chase('laketrout')` at 9.6 s, so a trout moves in the beam and on the phone.
- **Type:** `Serious deep water ready.` fades in at 8.0–8.5 s (when the read-out passes ~80 ft), block top 380. No number.

### Shot 4: end card, 11.5–15.0 s (frames 345–449)

- **Background:** the `deep` pass keeps recording to 15 s, so the water still moves. It darkens to 25 % with a light blur
  over 11.5–12.0 s.
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

### Build (after the nod)

- **New files in this folder:**
  - `film3.mjs <pass> <out> [port]` records the passes `open`, `pano` and `deep` on the virtual clock. Per frame it also
    writes JSON with the projected fan and the depth read-out.
  - `overlay3.html` is `overlay2.html` with `setFrame(t, data)` for the animated type and the end card.
  - `comp3.mjs` grades each frame and puts the type on it.
- **First a 10 fps preview of each shot for HQ, then the 30 fps film:**
  - `reference/ads/2026-11-bf/v3/pinglive-916-en.mp4` (`frames2mp4`, ~10 Mbit/s).
  - `pinglive-45-en.mp4` from `../to45.py`. In 4:5 the type shrinks to 70 %: the number ~162 px, the line ~49 px.
  - A clean version without type, so the French version only needs a new type pass.
- **Record from one committed lake state:** the commit in `docs/versions.md` ("current lake"), today 1abeedf. Use a
  separate checkout of that commit, not the shared working copy. On 2026-10-27, the shared copy had uncommitted lake
  changes from "冰钓版本视觉效果" while the stills were re-rendered (they still matched).

### Not checked yet

- How Meta's Reels overlay sits on the phone read-out (~y 1480, just above the bottom 400 px).
- The top-down camera `T`: the starting value is computed, not rendered.
