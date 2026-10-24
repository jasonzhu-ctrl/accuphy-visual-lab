# Garmin LiveScope reference study — how real structure, fish and bottom look on screen

Collected 2026-10-23 from YouTube screen recordings (no downloads; watched in the Claude desktop browser pane, frames = pane
screenshots). Purpose: a truth set for tuning the Lab's sonar engine (`src/experiments/2026-09-23-sonar-lake-3d/`, see
`docs/sonar-style.md` §7.7 for the earlier LVS34 palette measurement). The Accuphy app's own frames in `reference/app-study/`
remain the primary truth; this is the industry-reference look that anglers know.

**Frames:** 44 frames + 5 inset crops, 11 videos, local only (gitignored) in `reference/livescope/<video-id>/NN-<what>.png`,
each folder with a `notes.md` (per-frame readings), plus `reference/livescope/candidates.md` (the search list) and
`rejected.md` (videos that turned out to be camera-filmed screens).

## 中文摘要（给 Jason）

1. Jason 说的"42 或 44"就是 Garmin 2026 年夏天新出的 **LiveScope 2：LVS42HD 和 LVS44**。这次收了 LVS42HD、LVS44、LVS34 三代的真实录屏，共 11 条视频、44 帧，存在 `reference/livescope/`（本地，不进 git）。
2. 只收**录屏**（画面清晰、字体锐利），拍屏幕的都弃掉了（见 `reference/livescope/rejected.md`）。浏览器面板截图最宽 800 像素，所以帧是 800×450 的 JPEG 转 PNG，看结构和亮度够用，看单像素颗粒不够。
3. 旁白拿不到：面板里 YouTube 的字幕和文字稿都打不开，所以每帧的"是什么"是我自己读图加标题/屏幕文字判断的，不确定的列在最后"待 Jason 确认"。
4. **树堆（brush pile）**不是一团光，是一把"吸管"：几十条 0.2–0.6 m 的短亮线沿弧线排列，中间有黑缝，根部实、树冠散成点；2–5 m 距离上尺寸基本按真实大小画（2–2.5 m 宽、2 m 高）。
5. **桩柱 / 立木**是从水面到水底的连续竖柱，边缘毛糙、柱心有明暗斑；近处（5–8 m）宽度接近真实，远处（20–30 m）被波束拉宽到 1–1.5 m，变软变橙。
6. **阴影**：Forward 视图里平底后面几乎没有黑影，只有桩柱后面水底有一条 0.5–1 m 的暗槽；真正黑的阴影出现在 **Perspective（俯视）**里：每根桩/树后面一条黑楔子，3–20 m 内渐渐淡掉。
7. **水底带**：热白核心 0.25–0.4 m + 橙红尾巴 0.5–1.5 m（增益高、距离远尾巴越厚），尾巴里有放射状波束条纹；硬底/粗糙底上方多一层毛刺。
8. **鱼**：近处 0.3 m 短划、远处 0.8 m 长划，沿弧线倾斜；鱼群是带黑缝的点和短划，不是云。
9. **水体**：Auto 增益（60–65%）下水体纯黑（测得平均亮度 0）；增益 76–78% 或 120 ft 远距时水体变成 1 像素颗粒雾（平均亮度约 10–12%），换能器前方有 2–6 m 的近场亮锥。
10. 与我们现在"天真模拟"最大的三个差别：树堆要画成短线束而非实心块；Forward 视图阴影要弱、Perspective 阴影要强；水底要有厚厚的"尾巴"和放射条纹。最有用的 15 帧列在"Ranked frames"。

## Method and limitations

- Searches run in the built-in browser: "LiveScope LVS34 screen recording", "… brush pile", "… standing timber", "… dock pilings",
  "LiveScope 2 LVS42HD screen footage", "… perspective mode", "… ice fishing", "… LVS62", "MEGA Live 2 …", "ActiveTarget 2 …".
  Full list with ids in `reference/livescope/candidates.md`.
- **Screen recording test** applied on sight: pixel-sharp Garmin UI text and depth numbers, no moiré, glare, bezels or hands.
  Rejected (camera-filmed or no sonar on screen): `nlovyyxcYqs`, `nZp0v-YVAfI`, `lOxVlyUeHI4`, `dSYu--yOYTA` (menu demo on a
  render). Two kept videos only have the sonar as a small picture-in-picture inset (`Jvs-2EIQGcg`, `YMxJEZegQJU`, plus the
  ActiveTarget 2 one) — shape only, no measurements.
- **Resolution:** the pane screenshot is capped at 800 px wide, so every frame is 800×450 (JPEG from the pane, saved as PNG).
  The videos themselves are 1920×1080 to 2560×1440. Fine speckle, 1-px fish dots and edge gradients are therefore coarse; all
  widths below are read against the on-screen range/depth scale and rounded.
- **Narration unavailable.** YouTube's transcript panel and captions did not load in the pane (`get_transcript` 400, "captions
  unavailable"), so what each object is comes from the title, on-screen labels (Garmin's "LVS34 / LVS42 / LVS44", the gain and
  range readouts, the creators' chapter titles) and my reading. Uncertain identifications are listed under "Open questions".
- Jason's "42 或 44" = **LiveScope 2** (LVS42HD "HD" and LVS44), released about July 2026; LVS34 = LiveScope Plus (2021);
  LVS32 = original; LVS62 = XR. No usable LVS62 or LVS32-labelled screen recording was found in the time box.
- Units: Garmin screens here are all in feet; the rules below convert to metres (1 ft = 0.305 m).

## Catalogue

| id | title (channel) | transducer, mode, palette | frames kept | what it is good for |
|---|---|---|---|---|
| `KJzCOVwwAZc` | 🔥 Garmin LVS42HD First Look – LiveScope 2 HD vs LVS34 (Bass Boat Electronics) | split LVS34 (top) / LVS42HD (bottom), Forward, Amber, 85 ft range | 3 | same scene on both generations: far brush at 60–75 ft, near brush, a hump |
| `BvFt_usGjMc` | TARGETING Brush Pile Crappie with LVS42HD LiveScope 2 (Stan Stone Fishing) | LVS42HD, Forward, Amber, 25–30 ft range, gain 60–64 % | 5 | **brush-pile texture at 2–6 m**, bottom band + tail, no-shadow flat bottom |
| `WG7PeaMoEmQ` | Livescope 2 LVS44 VS LVS34 Saltwater Testing Footage (Southern Reels Fishing) | split LVS34 (left) / LVS44 (right), Forward + **Perspective**, copper/sand palette, gain 69 % | 10 | **dock and bridge pilings** 19–36 ft deep, piling shadows, Perspective shadows |
| `OSVHiC-hzrY` | LiveScope 2 LVS42HD On The Water! (Recordings Of Fish) (Josh Legacy Outdoors) | LVS42HD, Forward, Amber, 75 ft range, Auto gain 64–65 % | 5 | **fish schools and bait balls**, black water column, bottom at 21–33 ft |
| `qUGwllFqNrQ` | Garmin Livescope 2 LVS44 On The Water Footage and Settings (Patrick Zajdel) | LVS44, Forward + **Perspective**, Amber, 120–150 ft range, gain 57–65 % | 5 | far standing timber (70–100 ft), **Perspective tree shadows**, near-field cone, deep (87 ft) bottom |
| `mv1AquYG5SA` | How to Use Garmin Livescope for Ice Fishing (Cody S.) | LVS34 through an ice hole, Forward, Amber, 25–100 ft, **gain 76–78 %** | 6 | ice look: high-gain speckle, weeds, brush, Garmin settings (Noise/Ghost Reject Medium, TVG Off) |
| `XLOlbsSFxY0` | Mastering LiveScope #1 – A Complete Guide to Reading FFS (TJ Erickson) | LVS34, Forward, multi-hue (teal/yellow/red), gain 67 % | 3 | **bottom-band layers** as colour contours, grass, a far single fish |
| `fID61mzqcuY` | Crappie Fishing with LIVESCOPE 34 plus (Full Screen Footage) (4K Fishing) | LVS34, Forward, green palette, 40 ft | 2 | standing timber at 3–10 m with a bait cloud (intro only) |
| `Jvs-2EIQGcg` | Winter LIVESCOPE Jerkbait Fishing in STANDING TIMBER (Jake Keenom) | LVS34-era, Forward, Amber, 85 ft (inset) | 1 + crop | standing-timber silhouette (inset, shape only) |
| `YMxJEZegQJU` | Livescoping crappie under docks (Pure Living For Outdoors) | LVS34-era, Forward, Amber, 30 ft, gain ≈ 73 % (inset) | 2 + 2 crops | brush under a boat dock (inset, shape only) |
| `BUqEhdRG6QU` | Catching Bass Out Of TIMBER With Lowrance ACTIVE TARGET 2 (SonarFishing) | **Lowrance ActiveTarget 2** (comparison), Forward, gold (inset) | 2 + 2 crops | competitor grammar for timber |
| (earlier) `Vur91aVFXtQ` | Garmin Support – LiveScope Settings and Setup | LVS34, Amber | 8 in `reference/app-study/livescope-lvs34/` | palette reference already measured in `sonar-style.md` §7.7 |

MEGA Live 2: no screen-recorded footage found in the time box (the one small-channel video sampled was deck camera only).

## Visual rules (what the real picture does)

Scales used: Stan Stone frames ≈ 74 px/m, Southern Reels frames ≈ 33 px/m, Josh Legacy ≈ 26 px/m, TJ Erickson 100 ft frame
≈ 22 px/m. Luminance = 0.299 R + 0.587 G + 0.114 B on 0–255.

### 1. Trunks and pilings
- **Continuous vertical column from the bottom up to its real top** (pilings reach the surface). Never a row of blobs at
  short range; a far trunk (20–30 m) breaks into dashes along its length (`fID61mzqcuY/01`, leaning trunk).
- **Width:** measured on `WG7PeaMoEmQ/07` (LVS44, bridge piling at ≈ 7 m range, 36 ft deep): 26 px ≈ **0.8 m** across at
  50 % of peak; a second, dimmer piling 15 px ≈ 0.45 m. The LVS34 half of the same frame: 16–24 px ≈ 0.5–0.7 m, peak only
  51/255 vs 82/255 on LVS44. At 20–30 m (`qUGwllFqNrQ/03`) trunks are 1–1.5 m wide on screen, i.e. roughly 3× a real
  trunk → **widening grows with range** (beam smear ≈ range × 0.015–0.02 rad plus the object).
- **Brightness profile across the column:** flat-topped, not Gaussian. Rises from 10 % to 80 % of peak within 3–4 px
  (≈ 0.1 m) at the edge, holds 60–100 % across the core with a **dark notch** inside (mottled centre: 28/255 between two
  lobes of 70–80), then falls as fast on the far side. Edge position jitters 1–2 px per ping → "ragged".
- **Along the column:** brighter knots every 0.3–0.6 m (growth, cross-braces, bark), brighter near the bottom and where it
  faces the transducer; base widens into the bottom band (no gap).
- **Peak brightness:** a near piling or trunk reaches the top of the palette (yellow-white) only in knots; its body sits in
  the orange band. Standing timber at 20–30 m is orange with yellow cores.

### 2. Brush piles
- **Texture = a bundle of short straight dashes** (branches), each **0.2–0.6 m long**, 1–2 px thick, tilted along the
  range arc (perpendicular to the ray), with **black gaps between them**. You can see through a pile in places.
- **Density gradient:** solid, yellow-white at the base and on the side facing the transducer; orange mid; the **crown
  dissolves into isolated dots** (1–2 px = one beam cell) that change every ping.
- **Size:** 2–2.5 m wide × 2 m tall at 2–5 m range, drawn at about true size (`BvFt_usGjMc/01, 02, 05`). A pile 3–4 m further
  out is noticeably dimmer and more orange (fast brightness fall-off at gain 60).
- **Colour shares** inside a bright brush scene (`BvFt_usGjMc/05`, Amber, gain 60, lit pixels): dark red 13 %, red 31 %,
  orange 23 %, yellow 19 %, white 15 % — far hotter than the 2026-09-24 LVS34 reference (50/32/10/3/4) because the pile is
  close and fills the window. Brightness is scene-dependent; do not force one histogram.
- Under a pile the bottom tail is thickest (reverberation); high gain (76–78 %, ice video) fills the gaps and the pile reads
  as a packed yellow mass.

### 3. Acoustic shadows
- **Forward view, flat bottom: essentially no dark shadow behind brush.** The bottom line continues at full brightness
  beyond a 2 m pile (`BvFt_usGjMc/05`); the only dark zones are inside the pile where branches shade each other.
- **Behind a piling** the bottom shows a **soft dark notch 0.5–1 m wide**, grey not black, and the water column behind it is
  slightly darker/hazier (`WG7PeaMoEmQ/06, 07`). Stronger on LVS44 than LVS34.
- **Perspective (top-down) view: shadows are the main feature.** Every tree/piling casts a **dark wedge radiating away from
  the boat**, 1–3 m wide at the object, near-black for the first few metres, fading into the bottom haze over 3–6 m
  (pilings in 2 m of water, `WG7PeaMoEmQ/02`) to 10–20 m (timber in 6 m, `qUGwllFqNrQ/01`). Shadows move with the boat and
  flicker at their far end ping to ping. This matches the Lab's Panoramic mode.

### 4. The bottom band
- Measured profile (`BvFt_usGjMc/05`, gain 60, range ≈ 6 m): **hot core ≈ 18 px = 0.24 m** at ≥ 65 % of peak (peak 227/255),
  then an orange tail ≈ 30 px = **0.4 m** falling from 60 % to 20 %, then a faint second bump and black by 0.55 m. Above the
  line there is only a 1–2 px fringe → the band is **asymmetric: sharp top, long tail downward**.
- Tail grows with gain and range: 0.6 m at gain 60 / 6 m, ≈ 1 m at gain 64 (`BvFt/01, 02`), 1–1.5 m at 15–25 m range
  (`KJzCOVwwAZc/03`, `BvFt/04`), ≈ 2 m under heavy cover (`qUGwllFqNrQ/05`). Inside the tail: **radial striations** (beam
  rays) and speckle, not a smooth gradient.
- Multi-hue frames (`XLOlbsSFxY0/01–03`) show the layers as contours: red core 0.5 m, thin orange rim, yellow-green fringe
  ≈ 0.3 m above, green haze tail 1–1.5 m below growing with range; **rough/hard bottom has a taller speckled crown**, smooth
  bottom a thin line.
- Near the transducer (0–3 m) the line is thin and white; far (> 20 m) it is thicker, orange and broken; a deep bottom
  (87 ft, `qUGwllFqNrQ/04`) is a faint thin line with little tail.
- Grass/weeds: a comb of 1-beam-wide vertical lines 0.3–1 m tall on top of a thinner bottom line; blade tips yellow where
  thick (`XLOlbsSFxY0/02`, `mv1AquYG5SA/01`).

### 5. Fish
- A fish is a **short dash lying along the arc** (tilted perpendicular to its ray): ≈ 0.3 m at 5–8 m range, 0.4 m at 9 m,
  0.6–0.8 m at 14 m (`OSVHiC-hzrY/02, 03`); a single far crappie at 15 m is a 0.6 m dash with a soft fringe
  (`XLOlbsSFxY0/01`). Mark length ≈ 2–3 body lengths beyond 10 m — the beam, not the fish.
- A school = **dots and dashes with black gaps**, brighter and more separated near, merging into a texture far; a bait ball
  = a 2–3 m cloud of 1–3 px dots, denser in the middle, loose at the edge (`OSVHiC-hzrY/01, 05`). Never a smooth blob.
- Brightness: near fish reach yellow; far fish stay orange-red and flicker in and out between pings. Fish do not cast
  visible shadows on the bottom.

### 6. Near-field clutter and the water column
- **Auto gain (60–65 %) on LVS42/44 in clear water: the water column is pure black** (`OSVHiC-hzrY/02`: mean luminance 0.0,
  max 0 in a 200×80 px window). Only isolated 1–2 px specks.
- **Gain 62 % at 120 ft range** (`qUGwllFqNrQ/03`): a red-brown haze with radial beam streaks fills the fan, mean luminance
  26/255 (p95 63). **Gain 76–78 % at 25 ft under the ice** (`mv1AquYG5SA/03`): dense orange grain, mean 32/255 (p95 78,
  max 164). The haze is made of **1-px specks and radial streaks**, not a smooth fog.
- **Near-field cone:** a bright burst at the apex, ≈ 1 m at gain 60 / 25 ft, 2–3 m at gain 78 / 25 ft, 5–6 m at gain 65 /
  120 ft (`qUGwllFqNrQ/04`), with radial rays; the first 1–3 m of bottom under the transducer are fuzzier and brighter.
- A jig/line straight down from the hole draws as a dotted vertical line (`mv1AquYG5SA/03`).

### 7. Range and gain behaviour (summary)
- Everything widens across the ray with range (≈ 1.5–2 % of range) and fades; along the ray nothing widens.
- Range doubling (25 → 50 ft) roughly doubles the bottom tail and turns brush from dashes into a soft orange mass.
- Gain 60 → 78 %: black column → grainy haze, bottom tail ×2, brush gaps fill, near-field cone ×2–3. Garmin "Color Limit"
  default, Noise Reject Medium, Ghost Reject Medium, TVG Off were the settings shown in the ice video.
- Boat moving at 1.7–2.7 mph: the picture stays crisp (live sonar has no history axis); only the fish marks jump.

### 8. Palette
- Amber (most videos): black → dark red → red → orange → yellow → white, as measured in `sonar-style.md` §7.7. In close,
  bright structure scenes the picture spends far more time in orange/yellow/white (see §2 shares) than the 50 % blood-red of
  the open-water reference; the background stays black, never dark red, at gain ≤ 65.
- Copper/sand (Southern Reels): same ramp desaturated (tan instead of orange, cream instead of yellow) — a lower-contrast
  look where the shadows read more clearly.
- Green (4K Fishing) and multi-hue (TJ Erickson) exist but are minority choices; multi-hue is handy for us as an
  iso-intensity view.
- LVS34 vs LiveScope 2 in the same frame: LVS42/44 columns are thinner, edges cleaner, bottom line thinner and brighter,
  less haze between objects; LVS34 is softer, wider, hazier (`KJzCOVwwAZc/01–03`, `WG7PeaMoEmQ/01, 07`).

## Ranked frames for engine tuning (paths under `reference/livescope/`)

1. `BvFt_usGjMc/05-4m00s-forward-brushpile-straw-texture-25ft-gain60.png` — the brush-pile texture (dash bundle, gaps,
   crown dots) and the measured bottom profile; flat bottom with no shadow behind the pile.
2. `WG7PeaMoEmQ/07-10m16s-forward-split-bridge-pilings-36ft.png` — a tall piling on LVS34 and LVS44 side by side; measured
   width and flat-topped profile with the dark inner notch; soft bottom shadow.
3. `qUGwllFqNrQ/01-4m19s-perspective-timber-shadows-150ft-gain60.png` — Perspective: tree blobs with long dark shadow wedges
   fading over 10–20 m; the template for Panoramic shadows.
4. `WG7PeaMoEmQ/02-7m42s-perspective-split-7ft-piling-shadows-40ft.png` — Perspective in 2 m of water: short black
   shadows behind pilings, bottom texture, beam-group sectors.
5. `BvFt_usGjMc/01-1m30s-forward-brushpile-30ft-range-gain64.png` — two piles at different ranges in one frame (brightness
   fall-off), thick bottom tail with radial streaks.
6. `WG7PeaMoEmQ/06-6m45s-forward-split-pilings-19ft-still-20ft-range.png` — pilings at short range: internal knots, the
   0.5 m dark notch on the bottom behind each.
7. `qUGwllFqNrQ/03-6m03s-forward-standing-timber-70-100ft-range-120ft-gain62.png` — far standing timber widened to
   1–1.5 m, haze-filled fan: how structure degrades with range.
8. `OSVHiC-hzrY/02-1m06s-forward-fish-school-15-40ft-21ft-auto65.png` — a school as dashes with gaps; black water column.
9. `XLOlbsSFxY0/01-1m13s-forward-bottom-weeds-fish-100ft-gain67-multihue.png` — bottom-band layers as colour contours,
   weed spikes, a far single fish mark.
10. `KJzCOVwwAZc/02-220s-forward-brush-near-5-20ft-bottom-band.png` — near brush merging with the bottom, LVS34 vs LVS42
    bottom thickness in one frame.
11. `mv1AquYG5SA/03-7m30s-ice-forward-close-25ft-gain78-speckle-jig.png` — the high-gain ice look: speckle, near-field cone,
    jig line, weeds; what our ice page should feel like at high gain.
12. `OSVHiC-hzrY/01-0m22s-forward-baitball-35ft-range-21ft-auto64.png` — a bait ball as a dot cloud.
13. `fID61mzqcuY/01-0m00s-forward-standing-timber-green-40ft.png` — standing timber at 3–10 m with a bait cloud; a far trunk
    breaking into dashes.
14. `KJzCOVwwAZc/03-160s-forward-hump-45-55ft-bottom-rising.png` — a rising bottom: facing slope brighter, long warm tail.
15. `qUGwllFqNrQ/04-6m55s-forward-deep-87ft-bottom-nearfield-haze-120ft-gain65.png` — the near-field cone and a faint deep
    bottom.

## The three biggest differences from a naive simulation

1. **Structure is drawn as oriented line segments, not filled shapes.** Brush = a bundle of 0.2–0.6 m dashes along the arc
   with black gaps and a dotted crown; a trunk = one continuous ragged column with a mottled core; far structure breaks into
   dashes. A smooth ellipse or a solid textured block never appears.
2. **Shadows depend on the view.** Forward: almost none on a flat bottom, a soft 0.5–1 m grey notch behind a piling.
   Perspective/Panoramic: long near-black wedges behind every object, fading over 3–20 m. A simulator that darkens the
   Forward bottom behind brush, or leaves the Panoramic bottom unshadowed, looks wrong.
3. **The bottom is asymmetric and alive.** Sharp top edge, 0.25–0.4 m hot core, then a 0.5–2 m tail downward full of radial
   streaks and speckle that thickens with gain, range and cover; the water column above is black at auto gain and becomes
   1-px grain (mean ≈ 10 % luminance) only at high gain or long range.

## Open questions for Jason

1. `WG7PeaMoEmQ/07–10`: the "bridge pilings" at 36 ft — are they bridge pilings or channel markers/dock pilings? The
   measured 0.8 m width only means "about true size" if they are concrete bridge piles.
2. `WG7PeaMoEmQ/06`: the bright knot at 14 ft depth on the right piling — barnacle growth/cross-brace, or a fish holding on
   the piling?
3. `KJzCOVwwAZc/01`: the ragged objects at 60–75 ft range — standing brush/small trees, or a rock pile? (Title gives no clue.)
4. `OSVHiC-hzrY/02`: species of the school (white bass? crappie?) decides how big one dash should be for our fish sizes.
5. `mv1AquYG5SA/03`: the dotted vertical line at 0–3 ft range — the jig/line, or the edge of the ice hole?
6. `qUGwllFqNrQ/02`: the broad textured band at 40–90 ft in Perspective — brush rows, a weed line, or a rock ledge?
7. Which Garmin palette should the Lab's "LiveScope look" target: Amber (most anglers in these videos) or the desaturated
   copper/sand look of the saltwater video, which shows shadows better?

## Not done / next

- No LVS62 or LVS32-labelled screen recording found; no MEGA Live 2 screen recording found.
- Frames are 800 px wide; if finer speckle statistics are needed, the same videos can be re-captured at a larger pane
  width or from Jason's own LiveScope recordings.
- Narration could not be read; if Jason confirms the identifications above, add them to the per-video `notes.md`.
