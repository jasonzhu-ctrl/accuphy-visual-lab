# Sonar style reference (Phase 1 output — first draft 2026-09-23)

How the real Accuphy Sonar App draws things, measured from the reference
recordings (`reference/clips.md`). This is what the rendering engine must
imitate. Hex values are 16-level quantised samples from the extracted frames
(`reference/frames/`), good enough to build a colour ramp; refine later.

## 1. Two colour modes (app setting, same for both devices)

### Blue/red mode ("jet"-style ramp)
| Return strength | Colour | Sample |
|---|---|---|
| none — water inside the beam | deep navy | `#000070` (85 % of empty-water pixels), `#000080` |
| outside the beam | pure black | `#000000` |
| weak | blue → cyan `#2020a0`, `#00c0ff`-ish edge | halo around every target |
| medium | green → yellow | thin fringe between cyan and red |
| strong — fish, bottom | dark red `#600000`–`#800000`, hottest core toward `#c00000` | bottom band core, big-fish blob |
| grid | thin white lines, 1 px, ~30 % opacity | vertical every 1 m of range, horizontal every 1 m of depth |

Ramp (low → high): `#000070 → #0000ff → #00c0ff → #00ff80 → #ffff00 → #ff8000 → #ff0000 → #800000`.

### Yellow mode ("hot" ramp on black)
| Return strength | Colour |
|---|---|
| none (water, inside or outside beam) | black `#000000` — **the beam area is not tinted** |
| weak | very dark red `#200000` → `#601010` (speckle / soft "shadow tail") |
| medium | orange `#c06000` → `#d08000` |
| strong | yellow `#d0a000` → `#d0b000`, brightest spots near white |

Ramp: `#000000 → #300000 → #801000 → #c05000 → #e09000 → #f0c000 → #ffffe0`.

## 2. Beam geometry as drawn on screen

- **Down View (both devices):** symmetric triangle, apex at the top-centre
  (the transducer), widening downward. In blue/red mode the triangle is filled
  navy; outside it is black.
- **Forward View:** a wedge whose straight upper-left edge runs from the apex
  diagonally down-right; the wedge opens to the right. In blue/red mode the
  wedge is navy; there is a bright red/yellow/cyan **surface-clutter streak
  along the top edge** near the apex (Combo clip). In yellow mode nothing is
  tinted, only returns are drawn.
- **Mini Combo View:** Down triangle at the left + Forward wedge on the right,
  with a black gap between them; **depth is shared** on the vertical axis.
- **PLM split Down + Forward in yellow mode (RPReplay clips):** two panels
  separated by a thin grey diagonal line, each with its own range scale —
  the yellow-mode rendering of the same Down + Forward pairing.
- ⚠️ **The app stretches the picture**: horizontal px/m ≠ vertical px/m
  (e.g. Mini Down View 864×544 clip: ~68 px/m horizontal vs ~41 px/m vertical).
  Measured half-angle after correcting for the stretch ≈ 18–19°, i.e. the
  39° Mini beam. Our engine should work in metres and let the view choose
  aspect — do **not** copy pixel angles from the screen.
- Display ranges seen in the clips (clips whose depth readout shows `m`):
  PLM 8 / 14 / 16 m; PL 16–22 m. The two RPReplay split-view clips show bare
  numbers → the app was in **imperial**: 40 ft and 60 ft forward range.
  Max range/depth per device: **PL 240 ft, PLM 200 ft** (decision #5), user
  adjustable — keep as data, never hard-code.
- ⚠️ **Units:** the app switches metric/imperial in settings. Only trust a
  unit that is printed on screen; a bare number on an axis has no unit. The
  engine works in metres internally and formats to the user's unit on top.

## 3. How each thing looks

| Thing | Blue/red mode | Yellow mode |
|---|---|---|
| **Lakebed** | thick red band, yellow→cyan fringe on top, speckled cyan/blue "tail" below (multiple echoes) | bright yellow-orange band, soft orange→dark-red tail fading below; in Down View it is a nearly flat line |
| **Fish / bait** | small **horizontally elongated** red blobs with yellow/cyan rim; bait = smaller cyan/green flecks; many per screen in Forward View | small orange arcs/dots, faint |
| **Big fish, close range** | large irregular red blob (~1 m wide) with yellow/green rim | — (no clip) |
| **Wreck / structure** | — (no clip) | large bright structured mass with **dark interior gaps** and a bright leading edge; casts a shadow (black) behind/below it; bottom line continues after it |
| **Weeds** | — | vertical flame-like orange strands rising 1–2 m from the bottom line, feathery tips |
| **Tree trunks** (RPReplay 60 m) | — | tall thin bright columns standing on the bottom |
| **Surface clutter** | red/yellow streak hugging the top edge of the Forward wedge near the apex | dim speckle near the apex |
| **Noise** | sparse cyan/blue speckle inside the beam; grid lines visible | fine dark-red speckle everywhere returns are weak; horizontal smearing from the stretch |

## 3b. Panoramic View (PL) — from the three clips Jason sent 2026-09-24
- **Layout:** apex at the **bottom centre**, the 135° fan opens **upward**; black
  outside the fan; faint white grid with range numbers on both side axes and
  cross-range numbers along the top.
- **Look:** because the fan looks down at the bottom, the whole fan is filled
  with bottom texture (dark-red grain in yellow/red mode); brighter patches =
  hard bottom / structure, **black patches = acoustic shadows**; fish are
  bright **elongated streaks** (they cross the thin beam); **radial streaks**
  along the beam directions are a natural artefact.
- **Blue mode** exists too (navy → blue → cyan → white), seen at 62 m range
  with a ~35 m shipwreck.

## 4. UI chrome (only if we mimic the app frame)
Depth readout top-left (e.g. `13.4 m`), water temp, battery voltage, range −/+
control (`8m`…`22m`), gain % control, pause button centre-bottom, `…` menu,
ACCUPHY logo top-right, `1440p (QHD)` tag. Not needed for the marketing
visualiser — the "sonar flashlight" only needs the picture inside the beam.

## 5. Open questions for Jason
1. ~~Which device made the two RPReplay split-view clips?~~ PLM (answered).
2. For the website piece: one palette only, or a blue/red ↔ yellow toggle?
3. Max range per device and mode (needed for fan length).

## 6. Measured on the real app (tablet playback, 2026-09-24) — overrides §1–§3 where they differ

Source: app v2.0.0_beta.14 on the V10 tablet, orange colour map, recordings
listed in `reference/README.md`; frames in `reference/app-study/`. Chrome and
per-view layout are in `docs/app-chrome.md`.

### 6.1 Layout rule (the one thing the phone inset got wrong)
The picture **fills the screen**: the vertical axis is 0 → depth range, the
horizontal axis is the range, and **each axis is scaled independently** —
the fan is stretched, not kept 1:1. Measured px/m (tablet 1920×1200):

| View | horizontal | vertical | apex | what the axes show |
|---|---|---|---|---|
| PL Forward, 18 m range, 16 m depth range | 71 px/m | 60 px/m | x ≈ 20 % | top ruler −4.5 … 18 m, sides 0 … 16 m |
| PL Down, 12 m | 80 px/m | 80 px/m | top-centre | 1:1, the 135° fan runs off both sides |
| PL Panoramic, 12 m | — | — | bottom-centre | sides 2 → 10 upward, black corners |
| PLM Forward, 18 m range, 10 m depth | 89 px/m | 89 px/m | **top-left corner (x ≈ 0)** | upper beam edge ≈ 6° below horizontal, lower edge ≈ 32° |
| PLM Down, 8 m | 240 px/m | 118 px/m (**stretched ×2**) | top-centre | the 39° fan's bottom corners land on the screen's bottom corners |
| PLM Live Combo | — | — | one shared apex, top, x ≈ 20 % | Down panel lower-left, Forward panel upper-right, grey double diagonal between; each panel has its own scales |

Jason's phone screenshots (2000×920): Forward 23 px/ft × 15 px/ft, Down 1:1.
Rule for the engine: pick the screen box in metres from (range, depth range,
apex position) and let the quad stretch; do not preserve aspect.

### 6.2 What fills the fan
- **Noise floor:** the whole fan carries a dark-red haze (LUT index ≈ 0.10–0.25
  at 50–57 % gain); pure black only outside the fan. In the side views it is
  drawn as **radial streaks** from the apex (beam-by-beam gain differences and
  range smearing); in PLM Down it is a coarse **mottled speckle** (cells ≈
  0.1 m) rather than streaks. The floor fades a little with range.
- **Bottom:** a thick band — hard, white-yellow leading edge, then a long
  orange → dark-red tail below it (≈ 1–2 m at 8–18 m range) with a faint
  second echo further down. Never a thin line.
- **Near the apex:** bright rays fan out for the first 10–20 % of the range
  (surface / near-field clutter).
- **Structure (wreck, piling):** white-hot on the facing side, dark interior
  gaps, a black acoustic shadow behind it; the bottom line continues past it.
- **Gain:** 1 % per tap; 70 % blows the picture out to white (the app's own
  default for PL Forward), 57 % (Jason's reference) and 50 % (PLM recordings)
  give the balanced look above. TVG 25 %, Contrast 25 % everywhere.

### 6.3 Fish (the most important part — Jason)
- A fish is a **horizontal dash**: 3–5× wider than tall, in every view
  (Forward, Down). Size at 8–18 m range: ≈ 0.3–0.6 m wide, 0.1–0.15 m tall.
- Body: orange with a **brighter yellow-white core** at one end (the end
  facing the transducer), soft feathered edges, a faint darker tail behind.
- Bait / small fish: same shape, smaller and dimmer (dark orange, no core).
- Schools: dozens of dashes overlapping into a bright horizontal bar / cloud,
  brightest where they stack (PLM Down: a white-yellow bar 1.5 m wide at 2 m).
- Near a piling the dashes crowd around the structure (PLM Forward night
  recording, `plm-forward-fish-*.jpg`, crops `plm-forward-fish-crop-*.png`).
- No rim halo, no ring — just the dash with its soft edge.

### 6.4 Other
- Colour maps in the app list: classic, rainbow, coolwarm, red, orange,
  yellow, … (orange = the amber look in all Jason's screenshots).
- The app's PLM also offers **Live Panoramic** and **Live Combo**; Combo is a
  two-panel Down + Forward layout (see `docs/app-chrome.md`).
- A recording keeps its own range / gain; the depth readout, water temp and
  voltage are live from the file.

### 6.5 Jason's tuning strategy (2026-09-24, voice note) — how a clean demo picture is made
1. **Gain first** (the ⊖ % ⊕ on the screen; 50–70 % defaults): raise it until
   the targets are clearly bright, but never over-exposed — think of a camera
   that is blown out.
2. **Contrast** (⋯ → ☰): raise it until 70–90 % of the channel noise is gone.
   Contrast is the main tool: it does **not** shrink targets.
3. **Noise Reject** last, only for what is left. Used too hard it eats the
   edges of targets, so it is always the smaller of the two.
4. **TVG**: higher = a little more noise but crisper distant targets.
5. If a high contrast starts to look over-exposed (same feeling as too much
   gain), go back and lower the gain a step.
6. Target for the marketing piece: **90–95 % of the noise removed** — a clean
   picture with just a trace of noise left for authenticity. On the water a
   fisherman keeps more noise; for display, cleaner is better.

Engine mapping: gain = window offset (already), contrast = raise the window's
low end (cuts the floor before targets), noise reject = suppress isolated
speckle in the floor texture (never the bottom band or fish). Defaults for the
website follow step 6, not the app's factory values.

### 6.6 The ideal picture — CONFIRMED by Jason 2026-09-24
Made on the tablet from Reset Defaults, PLM Live Forward, the 2026-08-16
piling + fish-school recording, range 18 m (frames in
`reference/app-study/ideal-picture/`):

| Step | Setting | What changed |
|---|---|---|
| 0 | gain 50 · contrast 20 · noise 20 · TVG 20 (defaults) | dark-red floor everywhere, fish dim |
| 1 | gain 58 | fish bright but the piling and bottom band go white → too hot |
| 2 | gain 55 | bright, still readable |
| 3 | + contrast 40 | ~80 % of the floor gone, targets unchanged in size |
| 4 | + noise reject 30 | remaining speckle gone; a few flecks stay near the cable |
| **5** | **gain 52 · contrast 40 · noise 30 · TVG 20** | piling/bottom back off white, fish dashes crisp, black background with a trace of noise — my pick |
| 6 | gain 50 (same rest) | a touch dim on the small fish |

Jason's verdict on step 5: **"剩余部分的话我觉得可以了"** — this frame
(`5-FINAL-gain52-contrast40-noise30.jpg`) is the standard the engine is matched to.
His notes on what in it is signal and what is not:
- The thick diagonal line from the top-left is a **mounting artefact** of that
  recording (transducer not installed well) — ignore, never reproduce.
- The ripple that sweeps left→right under the piling now and then is
  **interference from another sonar** — ignore, never reproduce.
- The piling's brightness (near white) is **reasonable** for structure.
- Small speckle right next to a vertical structure must stay distinguishable
  from fish; on the water some speckle is fine, but **the website inset should be
  cleaner than real use** — so the engine's noise reject sits a step above the
  app's (engine defaults: gain 57 · contrast 40 · noise 30).
- TVG stays at 20 (not discussed further).

### 6.7 Ideal picture, case 2 — PL Forward View, wreck (2026-09-24, awaiting Jason)
Recording `PingLive_Forward View_20260906_162600.sonar`, range 14 m, depth
range 12 m. Reset Defaults for this view = gain 50 · contrast 25 · noise 25 ·
TVG 25 (a step higher than PLM's 20/20/20). Frames in
`reference/app-study/ideal-picture-2-pl-forward-wreck/`.

| Step | Setting | What changed |
|---|---|---|
| 0 | defaults | wreck already readable; faint haze in open water and near-field rays under the apex |
| 1 | + contrast 35 | open water goes black, wreck edges sharper, size unchanged |
| 2 | + noise reject 30 | remaining flecks gone; only near-field rays left |
| 3 | gain 47 | wreck goes dull orange, the hull's detail flattens → too dim |
| **4** | **gain 50 · contrast 35 · noise 30 · TVG 25** | hull, deck frames and shadow all readable; bottom band bright with tail; black water — my pick |

Compared with case 1 the PL view needs less contrast (35 vs 40) because it
starts cleaner; gain stays at the factory 50 — structure blows out faster than
fish. Near-field rays fanning from the apex are normal (see §6.2), kept.

### 6.8 Fish marks near vs far — the physics behind the look (Jason's question, 2026-09-24)
Crops in `reference/app-study/fish-near-vs-far/` (PLM Forward, apex top-left,
89 px/m: near = 3–8 m, far = 11–17 m, same frames as the ideal picture).

**What the crops show**
- Near (3–8 m): marks are small compact dots / short dashes ≈ 0.1–0.2 m,
  oriented every which way; a few are clearly longer than others.
- Far (11–17 m): marks are ≈ 0.3–0.5 m long, all elongated the same way —
  **along the arc, perpendicular to the ray from the transducer** (tangential),
  thin in the range direction; brightness varies a lot from mark to mark.

**Why (two resolutions, two regimes)**
1. *Range (radial) resolution* comes from the pulse length and is the same at
   every distance: a fish is always thin in the range direction (~0.1 m).
2. *Angular (tangential) resolution* is a fixed angle (the beam-formed width,
   ~1–2°), so its footprint grows with range: ≈ 0.05–0.1 m at 3 m, ≈ 0.3–0.5 m
   at 15 m.
3. **Near regime** (footprint smaller than the fish): the mark shows the fish's
   *own* length and heading. A fish broadside to the beam draws a dash the
   length of its body, along its body; a fish facing the transducer draws a dot
   (only the head/shoulder cross-section is in the beam).
4. **Far regime** (footprint larger than the fish): every fish is smeared to
   the footprint — a tangential dash of the *beam's* width, whatever the fish's
   heading. Heading now only changes **brightness and stability**: broadside
   presents the swim bladder and flank (strong, steady echo, bright core toward
   the transducer, faint tail behind it), head-on presents a small cross-section
   (weak, flickers between pings as the fish turns).
5. In Forward view the "horizontal dash" seen earlier is therefore the special
   case of a fish at mid-range on a ray that points mostly forward (tangential
   ≈ vertical-ish in screen terms only near the top edge; horizontal along the
   fan centre). Rule for the engine: **dash along the arc, never along screen x.**

**Engine mapping** (since #120 `sonarShader.js` fishDash, §7.19; before it fishAt/dash): angular blur = constant
beam angle (not screen metres) added to the fish mask's own angular extent;
radial thickness = constant pulse; brightness = angular fill of the beam
(broadside fills it, head-on does not) → near fish show body length and
heading, far fish become uniform tangential dashes that vary in brightness.

### 6.9 What the two range controls do to the picture (measured, PL Forward, 2026-09-24)
Frames in `reference/app-study/range-controls/` (wreck recording, gain 50 ·
contrast 35 · noise 30). Two independent controls, two independent axes:

| Control | Where | Steps seen | What changes | What does NOT change |
|---|---|---|---|---|
| **Range** ⊖ `14m` ⊕ | bottom-left | 6 · 8 · 10 · 12 · 14 · 16 · 18 · 20 · 22 m (2 m steps) | only the **horizontal** scale: the top ruler re-numbers, the apex stays at x ≈ 20 %; targets get **wider** (short range) or **narrower** (long range) | their depth position, their height, the side rulers, the depth readout |
| **Depth range** ⊖ `12m` ⊕ (PL Forward only) | right edge | 8 · 9 · 10 · 12 · 14 · 16 · 18 m (1 m steps below 10, 2 m above) | only the **vertical** scale: side rulers re-number, apex stays at the top; targets get **taller** (small depth range) or **flatter** (large); the bottom drops off the screen when the depth range is less than the water depth | the top ruler, target x positions |

So "nearer / farther" never happens — a target keeps its (x, depth) in
metres; only the metres-per-pixel of each axis change. Everything stretches
with the axes, including the near-field rays under the apex (they stay ≈ 2–2.5 m
in metres, so they look big at 6 m range and small at 22 m) and the fish
dashes (their tangential length is metres, so they look longer at short range).
Neither control follows the other: 6 m range with 12 m depth is allowed and
looks 2× stretched horizontally.

**The sound covers the whole picture box, not just the range.** The app draws
echoes below and beyond the range: 8 m range with 12 m depth range shows the
bottom at 10.5 m across the full width (slant ≈ 13.6 m), and 18 m / 16 m fills
the lower-right corner (slant ≈ 21 m). PL Down at 12 m also fills its lower
corners. Engine (PL Forward, decision #38): the cutoff is the box's far corner
`hypot(range, depth range)` (`uReach`), and the page runs the depth range on
**AUTO** the way the app does: it follows the depth readout (the water straight
below the transducer) and puts that bottom at ~80 % of the height, in the app's
steps, deeper at once and shallower only after 1.5 s. A deeper bottom ahead may
run off the screen, as in the app (decision #41). PingLive Mini Down and Forward use the same AUTO depth
range (one value for both, so the bottom lines up between the views); Mini Down's
range is that value, and Mini gets extra near-range gain 0.62 → 1 over 5–18 m
against the shallow-water glare (decision #60).

Engine: `screenLayout` takes range and depth range separately for PL Forward;
the near-field rays and every mark are sized in metres, never in fractions of
the range. Defaults after Reset: range 14 m · depth 12 m (PL Forward), i.e.
depth ≈ 0.85 × range.

### 6.10 Case 2 verdict (Jason): wreck slightly less bright — the orange-red look
is preferred in the inset; near-field rays stay. → engine: structure echoes
(wreck, timber, rocks) ×0.8 versus bottom and fish.

### 6.11 Brightness ↔ orange balance, made measurable (2026-09-24 — Jason: "找这个亮度和桔红色的平衡是核心能力")
Method: take the app's 256-entry colour maps (`colormaps.js`), map every lit
pixel of a frame to its nearest LUT entry, and histogram that **LUT index**
(10 bins from dark red to white) plus the black fraction. The same statistic is
computed inside the engine by `window.__sonarHist()` (DEV; renders the sonar
picture flat to an offscreen target), and `window.__sonarSnap()` returns that
render as a PNG for side-by-side files. Reference script: the raw-RGB +
numpy analysis in the session notes (ffmpeg → rgb24, nearest-LUT search).

**Finding 1 — the app's "orange" map is `Moreland_Black_Body`, not `amber`.**
Nearest-LUT error on the confirmed frames: Black Body 0.03, amber 0.12–0.17,
gist_heat 0.15. Black Body runs black → dark red → orange → yellow → **white**,
which is why the hottest returns go white on the tablet. Engine default switched.

**Finding 2 — target distributions (lit pixels, Black Body index bins 0.0–1.0):**

| Frame | black | 0–.1 | .1–.2 | .2–.3 | .3–.4 | .4–.5 | .5–.6 | .6–.7 | .7–.8 | .8–.9 | .9–1 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Case 1 PLM fish + piling (gain 52/c40/n30) | 0.79 | .116 | .138 | .146 | .130 | .125 | .104 | .076 | .055 | .054 | .066 |
| Case 2 PL wreck (gain 50/c35/n30), 2 frames avg | 0.80–0.83 | .057 | .061 | .075 | .074 | .104 | .112 | .129 | .133 | .118 | .140 |

Reading: ~80 % of the picture is black; of the rest, a fish/bottom scene is
weighted to the dark-red/orange half with a 6–7 % white tip; a structure scene
is weighted to the yellow/white half (13–14 % white). Both have a real
dark-red foot (5–12 % in the lowest bin) — the soft edges.

**Finding 3 — engine before/after.** At the same settings the engine was too
dark-red: PLM scene 58 % of lit pixels in the lowest three bins vs 40 % in the
reference. A tone gamma on the LUT index (`uGamma`) fixes the balance without
touching black or white: γ = 0.7 matched the PLM scene best (L1 0.19), γ = 1.0
the wreck scene (L1 0.25); **γ = 0.8** is the compromise now baked in. Keep
this check in the loop whenever gain/contrast/pulse/tail constants change:
run `__sonarHist(10)` on the two standard scenes (`?boat=-40,-5` PLM Forward
60 ft; `?boat=4,-26` PL Forward 120/100 ft) and compare with the table.

Engine after the balance loop (Black Body, gain 57 / contrast 40 / noise 30,
γ 0.75, bottom = 1.2·pulse integrated + 0.5·first-return peak, tail 0.5 over
1.2 m + 0.04·r), 2026-09-24:

| Scene | black | 0–.1 | .1–.2 | .2–.3 | .3–.4 | .4–.5 | .5–.6 | .6–.7 | .7–.8 | .8–.9 | .9–1 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PLM Forward 60 ft (bottom + timber) | 0.90 | .081 | .114 | .125 | .144 | .170 | .154 | .098 | .037 | .016 | .060 |
| PL Forward 120/100 ft (bottom band, wreck out of the fan) | 0.85 | .038 | .034 | .034 | .032 | .044 | .097 | .222 | .261 | .187 | .050 |

2026-09-25 (decision #64): the deep floor moved from 40 m to 24 m, so the second scene is not the
same picture any more. It now reads 76 ft over a flat bottom, with the small wreck in the fan:
black 0.89 · .038 .042 .044 .042 .051 .046 .059 .088 .146 .444. The flat bottom tops out white
across the beam, which is point (2) below. This is not a tuning change; pick a new second reference
scene before the next balance loop.

2026-09-25 (decision #66): the flat-bottom glare was fixed with a soft cap on the integrated bottom
echo past the near range, a thin first-return edge and a 15 % higher white point. White share:
PL bottom scenes 37–44 % → ~7 %, wreck 35 % → 8 %, PLM shelf 6 % → 2 %.

What the loop taught: (1) the bottom band must be a thin hot leading edge
(first return) over an orange body (integrated thickness) — a wide white slab
was the biggest mismatch; (2) the app's band tops at white only where the
bottom is flat across the beam, so the peak term is weighted 0.5, not 1;
(3) the black fraction is scene-dependent and not a target — compare the
lit-pixel histogram shape and the side-by-side, not the black %.

Side-by-side files: `reference/engine-compare/compare-*-app-vs-engine.png`
(left = app reference frame, right = engine, same colour map). Snapshots are
saved from the browser through the dev-only `POST /__snap` endpoint in
`vite.config.js`.

## 7. The photograph model (Jason's framing, 2026-09-24) — what each view "sees"

> Jason: 探头发射波束的方向对应模型湖里物体形状的关系，有一点像拍照片；不同 view
> 下不同深度对应的角度关系也很重要。

Treat the transducer as a **camera whose film is the beam plane**. The fan is a
thin slab (PL 20°, PLM 18° thick); only what cuts through that slab is imaged,
and it is imaged in **polar coordinates of the plane**: direction inside the
plane (angle) × distance from the transducer (range). Nothing outside the
slab exists; nothing behind an occluder exists (acoustic shadow).

**A target's mark = its silhouette cut by the plane, projected onto the plane,
then blurred:** tangentially by the beam angle (footprint grows with range —
§6.8) and radially by the pulse (constant). Brightness = how much of the beam
the cut fills × how hard the surface faces the transducer.

### 7.1 Per view: which plane, which angles, which depths
| View | Plane | Angles covered (from straight down) | Depth ↔ angle rule |
|---|---|---|---|
| **Down** (both) | vertical, across the screen; apex top-centre | PL ±67.5°, PLM ±19.5° (drawn ±21.5°) | a target at depth d, offset s sideways is at angle atan(s/d); at 8 m depth PLM sees ±2.8 m of bottom, PL sees ±19 m |
| **Forward** | vertical, fore-aft; apex left (PL 20 %, PLM corner) | PL −45°…90° (sees straight down and ahead), PLM 51.5°…90° (a wedge from 1.26·d ahead to the surface) | PLM Forward **cannot see anything closer than 1.26× its depth** — deep fish only appear far out; the bottom enters the fan at x = 1.26·depth and rises toward the right |
| **Panoramic** (PL) | tilted 5° down, 20° thick → 5°–25° below the surface | 135° wide in the horizontal | the fan **grazes** the bottom: at range r it touches depth r·sin(5°…25°) = 0.09r…0.42r, so the whole picture is bottom texture with shadows; mid-water fish are only caught in that thin depth band |

### 7.2 Fish, per view (from the recordings)
- **Down, near (1–3 m, `reference/app-study/fish-down-near/`):** a big fish
  swimming *along* the plane is drawn as its **whole body outline**, 0.6–0.8 m
  long, lumpy, red core with yellow → green → cyan soft rim (jet map);
  swimming *across* the plane it is a short cross-section blob that pops in
  and out as it passes the 18° slab. Two fish crossing at an angle → two
  diagonal streaks. Small fish at 4–5 m: dots ≈ 0.15 m with a cyan halo.
- **Forward, mid/far (§6.3, §6.8):** the level fish's body projected into the
  fore-aft plane → a horizontal dash, bright toward the transducer, feathered
  ends; at far range every fish is smeared to the beam footprint (tangential).
- **Panoramic:** fish are streaks along the plane where they cut the thin
  depth band; the bottom is a textured field with black shadows behind humps.

### 7.3 Bottom and structure, per view
- Down: bottom is a **flat-ish thick band** (the plane cuts it along a line);
  slope shows as tilt; the band has a hard top edge and a long speckled tail
  (multiple reflections), brightest where the bottom faces the transducer
  (directly below).
- Forward: the bottom is the line where the plane meets the bed, drawn as a
  band that **rises with range** in PLM (can only be seen ahead of 1.26·d);
  structure (piling, tree, wreck) shows the side facing the transducer, with
  a black shadow behind it and the bottom line continuing after it.
- Panoramic: bottom texture everywhere, structure = bright face + shadow tail.

### 7.4 Engine consequences (what still has to change)
1. The sonar pass must give the screen the **fish silhouette as cut by the
   slab**, at true scale — done (fish rendered into the depth strip, alpha
   mask); the display scale of fish in the 3D lake (×2.6) must **not** leak
   into the sonar pass (fish look 2.6× too big on the screen) → render the
   sonar pass at true fish size.
2. Mark rendering = silhouette ⊗ (tangential beam blur, radial pulse) with a
   **soft rim** (tone falloff), not a hard-edged dash: the app's fish have a
   bright core and a 2–3 pixel gradient edge in every view.
3. Colour: the inset's orange reads too yellow; the app's real look (and
   LiveScope's) spends more of the ramp in deep red. Build an "Accuphy red"
   map for the inset (black → deep red → red → orange → yellow → white) and
   calibrate it against the reference frames with the §6.11 histogram.
4. PLM Forward depth rule (nothing nearer than 1.26·d) already follows from
   the wedge geometry; make sure the guide copy explains it.

### 7.5 First engine check against the near-field frames (2026-09-24, `?fishtest`)
Fixed test fish (`fish.js`, `?fishtest`): a broadside bass, a head-on bass and a
broadside musky placed relative to the transducer (which sits ≈ 3 m ahead of
the `?boat` point, 0.9 m under the surface — a placement mistake at first put
the "fish under the boat" outside the fan). Result (`reference/engine-compare/
compare-down-fish-app-vs-engine.png`, app jet-mode blob left, engine right):
- **Shapes agree with the model:** the broadside musky is a body-long blob with
  a white core, the head-on bass is a small soft dot. The physics of §7 holds.
- **What differed:** the engine blob was a hard rectangle filled with
  salt-and-pepper (per-pixel row jitter through a binary mask) where the app
  shows a solid lumpy core with a smooth few-cm rim. Fixed by sampling the fish
  mask on fixed rows, a minimum 7 cm angular blur for the near field, a
  low-frequency lumpiness along the body, and no streak modulation on fish.
- **Colour:** `accuphy_red` (black → deep red → red → orange → yellow → white)
  reads far closer to the app/LiveScope look than `Moreland_Black_Body`, which
  goes orange too early. Not yet calibrated with the §6.11 histogram.

### 7.6 Texture, not just hue (Jason 2026-09-24: "你的太模糊了", "和我们的纹理完全不是一回事")
Pixel-level crops of the confirmed frames (`reference/app-study/texture/`, 3×
nearest-neighbour) show what "the app's texture" actually is:
- **Every echo is a bundle of thin filaments along the ray.** The formed beams
  are ~1° apart and each has its own gain and noise, so a piling, a wreck face
  or a fish body breaks into streaks 1–2 px wide running from the apex outward,
  with ragged, bitten edges across the beam direction. Nothing is a smooth
  blob or a smooth band.
- **Fish:** a cluster of 3–8 such filaments, orange body, a yellow core
  toward the transducer, no white; near-field blobs (Down view) are irregular
  with holes and bites, and change shape every ping.
- **Bottom:** a white-yellow leading edge that is itself broken into short
  dashes, then an orange body made of the same filaments, then a red tail.
- **The look is sharp, not soft:** the "softness" is only the 2–3 px colour
  gradient at each filament's edge; the overall silhouette is crisp.

Engine (`sonarShader.js`): a per-beam filament texture (`filament`, high
angular frequency × low radial frequency, slowly drifting) multiplies fish and
structure echoes; the fish silhouette gets two-scale lumpiness that cuts real
holes; the fish cap sits at 0.78 (no white); a short radial smear trails each
fish away from the transducer. Jason's verdict on the first round: brightness
and smoothness should land **between** the old smooth blob and the app's
raggedness — the current build is that middle.

### 7.7 Garmin LiveScope Plus (LVS34) as the palette reference
Jason: Garmin's is **amber**; learn from clear LVS34 videos rather than from
Garmin's marketing stills (those use the purple/green/blue palettes).
Frames pulled with yt-dlp are kept out of the repo (scratchpad only); notes
go here as they are studied.

**Measured 2026-09-24** from Garmin's own LiveScope settings video (LVS34, amber,
8 frames in `reference/app-study/livescope-lvs34/`, texture crops at 3×):

| Share of lit pixels | dark red (R<120) | red | orange | yellow | white |
|---|---|---|---|---|---|
| bottom arc + fish (f003) | 0.50 | 0.34 | 0.09 | 0.03 | 0.03 |
| brush pile 45 ft (f011) | 0.61 | 0.30 | 0.02 | 0.01 | 0.06 |
| tree + bottom (f021) | 0.42 | 0.31 | 0.17 | 0.06 | 0.04 |

Ramp by luminance (mean RGB): (71,14,6) → (98,20,10) → (128,30,17) →
(170,56,27) → (194,81,27) → (227,129,19) → (242,219,128). So the LiveScope
amber spends **half the picture in blood red**, a third in red, and reaches
orange only in the top ~15 %; yellow-white is the tip of the bottom band and
the core of a big fish. That is the "红" Jason means. Engine: new map
`garmin_amber` with these stops (now the default); `accuphy_red` kept but
demoted. Texture notes from the same frames: fish = short oblongs along the
ray (1–3 filaments wide, 3–6 long), sharp with a 1–2 px edge gradient; a
dark-red radial haze fills the fan with visible beam rays; the bottom band is
fibrous — filaments across it, a white tip only where it faces the transducer.

Engine check with the same metric (colour shares of lit pixels, `garmin_amber`,
gain 57 / contrast 40 / noise 30), 2026-09-24:

| Scene | dark red | red | orange | yellow | white |
|---|---|---|---|---|---|
| LiveScope reference (3 frames avg) | 0.50 | 0.32 | 0.10 | 0.03 | 0.04 |
| Engine PLM Forward, timber + 3 test fish, 60 ft | 0.55 | 0.29 | 0.11 | 0.02 | 0.02 |
| Engine PLM Down, near-field test fish, 25 ft | 0.30 | 0.31 | 0.24 | 0.06 | 0.09 |

The forward scene now sits on the LiveScope balance; the near-field Down scene
is still hotter (big fish 2–4 m away fill the beam), which is also what the
app's own near-field frames do (jet mode saturates red there).

Garmin colour schemes seen in the settings videos (for reference only):
Rusted Steel, Lava, Caribbean, Floodlight, Ice Blue, Aqua, Moss, Amber,
Copper, Black Emerald, Midnight Blue, Orange Crawfish, Red Shad, Blue.
Garmin's "Color Gain" (default 70–75 %) is their contrast; "Noise Reject"
Medium and "TVG" Off are the factory positions in the support video.

### 7.8 How long are the marks? (Jason 2026-09-24: "线条感太长了 … 规律是什么")
Measured on the confirmed frames: walk rays from the apex and arcs around
it, count runs of lit pixels (luminance > 60 of 255), convert to metres.

| Frame | radial run length p50 / p75 / p90 / p97 (m) | tangential p50 / p75 / p90 / p97 (m) |
|---|---|---|
| PLM Forward, piling + fish, 18 m | 0.07 / 0.12 / 0.20 / 0.48 | 0.10 / 0.22 / 0.37 / 0.56 |
| PL Forward, wreck, 14 m | 0.11 / 0.49 / 1.15 / 2.26 (the wreck's long faces) | 0.18 / 1.13 / 3.4 / 4.8 |
| Engine PLM Forward before this fix | 0.02 / 0.10 / 0.46 / 1.52 | 0.05 / 0.20 / 0.62 / 0.75 |
| Engine after | 0.05 / 0.14 / 0.33 / 0.57 | 0.05 / 0.09 / 0.29 / 0.51 |

**The rule:** in the app a single echo along the ray is 7–20 cm long — about
one pulse length — and only continuous surfaces (a wreck side, the bottom
band) run longer. Marks are slightly longer across the beam than along it.
There are no long radial streaks; what reads as "texture" is many short
dashes stacked along the ray, each with its own gain. The engine had every
radial texture and smear 3–10× too long (fish smear 0.3–0.4 m, bottom fibres
1.5 m, streak noise period 1 m). Fixed: fish smear 0.08 m + 0.004·r, bottom
tail 0.35 m + 0.015·r, filament period ≈ 0.1 m, streak period ≈ 0.2 m.
Fish cores stay solid (the rim-only bites replace the earlier holes — Jason:
中间空了); the filament comb fades out under ≈ 5 m where the beam footprint
is smaller than a pixel.

### 7.9 Near-field fish: brightness rises toward the centre (verified 2026-09-24)
Jason's principle "越靠近中心越亮, 有逐步亮的过程" checked on the Down-view
big-fish recording (jet map → LUT index, distance measured inward from the
blob edge at index 0.45):

| distance inside the edge | 0–1 cm | 1–3 cm | 3–4 cm | 4–6 cm | 6–8 cm | 8–10 cm |
|---|---|---|---|---|---|---|
| t = 2 s (1.5 m) | 0.81 | 0.90 | 0.94 | 0.97 | 0.98 | 0.99 |
| t = 8 s (2 m) | 0.88 | 0.94 | 0.98 | 1.00 | 1.00 | 1.00 |
| t = 14 s (3 m, two fish) | 0.78 | 0.83 | 0.88 | 0.91 | 0.92 | 0.93 |

Confirmed: monotonic climb over ≈ 5–8 cm from the rim to a saturated core,
preceded outside the edge by the cyan/green halo (index 0.2–0.45) a few cm
wide. Engine: fish brightness = 0.8·fill^1.4 (fill = beam-blurred silhouette
coverage, so it ramps over the blur width) + a faint outer halo from a 2.5×
wider blur. Structure (piling, trunk, wreck face) is drawn **solid and bright**
again, a touch under the bottom band, with only a light filament modulation —
Jason: the app's big piling is solid, bright and sharp, and that is the
better look.

### 7.10 Round 6 — "差的也太远了" (Jason, 2026-09-24)
Jason's side-by-side of the app's piling frame vs the engine: the engine was
thin, dim and sparse where the app is thick, hot and dense. Two causes:
(1) the engine averaged echoes over the 24 thickness rows, so a solid face
that fills few rows came out grey — the app draws a solid face at full
brightness no matter how much of the slab it fills → structure now uses its
own peak term (`spk`, weight 0.9) instead of the row average; (2) the bottom
band's first-return weight was 0.5 → 0.7 for a hot dense band. A `?fishtest`
dock piling (0.35 m, bottom to surface, 12 m ahead) with a 40-smelt bait
school now stands in for the app's reference scene so the comparison is like
for like. Remaining gaps after this round: the bait school reads much weaker
than the app's (small fish at true size are near the pixel limit at 18 m
range), and the app's fill texture is finer-grained than the engine's lumps.

### 7.12 Panoramic — the real lake look (2026-09-24, Jason: "差距也太大了, 特别是 panoramic")
The pool frame on the tablet was a special case. The lake recordings
(`reference/app-study/panoramic-lake/`, PL 14–28 m gain 77 %, PLM Live
Panoramic 14–20 m) show what Panoramic actually looks like on the water:
- **The whole fan is a continuous, even crimson field** — index ≈ 0.1–0.25,
  70 % of the fan in the 0.1–0.2 bin, mean 0.18, **0 % black inside the fan**.
  Brightness barely falls off with range. The texture is a soft low-frequency
  mottle with faint radial beam streaks, not per-pixel grain.
- **Bottom is found from the apex outward**, not only beyond depth/sin 25°:
  the nominal 5°–25° slab does not explain it, so the thickness sidelobes must
  reach the bottom at steep angles. Engine: the panoramic depth pass now
  samples 5°–65° below the surface.
- **Shadows** behind humps and channels are a darker crimson, never black;
  open water is the same floor.
- **Fish are the picture:** dozens of short bright yellow dashes with an
  orange halo, 0.3–0.8 m, mostly tangential (across the ray), scattered over
  the field. Engine: wider tangential beam blur in Panoramic (≈ 1.6°).
- PLM Live Panoramic draws the fan from a **left apex opening right** (like
  Forward), with the same crimson field, dark shadow holes and bright dashes.
Engine calibration (shelf scene, 50 ft): index histogram now 0.09 / 0.28 /
0.36 / 0.21 in the first four bins vs the app's 0.01 / 0.70 / 0.24 / 0.04 —
same shape, one bin brighter; black inside the fan 0. Shelf bait schools were
added to the lake so the Panoramic step shows dashes.

### 7.13 Panoramic rebuilt as a plan-view photograph (2026-09-24, Jason: "鱼和结构的形状包括沉船的 pano 和你做的完全不是一回事")
**Superseded (#171, #178, 2026-10-27):** Panoramic is drawn as a sound picture (the vertical views' pipeline with the fan
laid flat); the plan-view engine below is deleted. The app observations below still hold.
The earlier Panoramic was still built like a side view (depth strips along a
slab), so it could never produce what the app shows. Studied frame by frame:
`pinglive/6089.MP4` (lake, 14 m, 32 frames), `3257.MP4`, the sunk-boat clip
(62 m, blue mode) → `reference/app-study/panoramic-wreck/`, 3× streak crop in
`panoramic-lake/pl-panoramic-fish-streaks-3x.png`.

**What Panoramic is:** a picture taken from above. The fan lies nearly flat and
grazes the bottom, so every point of the lake floor in front of the boat is a
pixel, lit if the sound reaches it and dark if something between it and the
transducer blocks the ray.
- **Fish are streaks, 0.4–1 m long, all parallel within a school.** A fish is
  ~0.2–0.4 m, so the length is not the body: the app blends consecutive pings
  (persistence ≈ 0.7 s) and a moving fish paints the path it swam. Bright
  yellow-white middle, orange pointed ends. Hovering fish are short.
  **Corrected 2026-10-23 (#120, §7.19):** the streaks are the flat fan's beam width, not swim paths. In
  `pl-panoramic-lake-f005.jpg` the groups left of the boat run `/` and those right of it `\` — mirror images about
  the boat's axis, i.e. along the arc around the transducer. Random swim headings could not do that.
- **Every fish has a black blotch further out along its ray** — its acoustic
  shadow on the bottom (the ray through the fish continues down and hits the
  bottom later). The app's "random dark patches" are these.
- **Structure = its silhouette from above** with the edge facing the
  transducer brightest, and **a long black shadow behind it** away from the
  transducer (the wreck: bright hull, dark hatches, a shadow as long as the
  hull is tall × range / depth).
- The field is an even crimson with fine grain, soft patches and beam-to-beam
  bands (stronger at long range); near the transducer it is darker with
  clutter speckle and bright spokes along a few beams.
- **Framing:** 1:1, top edge = range, the apex just below the bottom edge; the
  data runs out to the screen corners — only the two straight fan edges are
  drawn, no arc.

**Engine (new, `sonarMarks.js` + Panoramic branch of `sonarShader.js`):**
bottom from a baked terrain texture, structure from a top-down depth map of
the scene rendered each frame (dilated to the beam footprint so thin branches
read as clumps), acoustic shadows by marching each ray back to the transducer,
field textures calibrated in echo units (field LUT index 0.1–0.3).
**Fish in all views are now analytic marks** computed on the CPU from each
fish's true position, heading and the last 0.7 s of its path (persistence),
not sampled from depth strips: Panoramic = swept body from above + shadow
blotch; Down/Forward = swept body projected into the vertical plane (fish swim
level → horizontal dashes, body depth = mark thickness, finer vertical-fan
beam), strength from the beam pattern across the slab and the aspect.
Fish in a school now share swim direction and phase (parallel streaks), and
the shelf got more bait for the Panoramic step (preset now 70 ft).
Comparisons: `reference/engine-compare/compare-pl-panoramic-app-vs-engine.png`,
`compare-pl-panoramic-wreck-app-vs-engine.png`.

### 7.14 Big fish bloom (2026-09-24, Jason: "下面有一条大鱼 … 声纳上面显示也要再大一点")
A strong echo spills into the neighbouring beams and range cells, so on a real
screen a big fish paints a mark larger than its body. The marks now use a
bloomed length `L × (1 + 0.9 · smoothstep(0.3 m, 1.1 m, L))` for the swept
body, the radial thickness and the Panoramic streak: bait and panfish stay true
size, bass ×1.1, chinook ×1.6, a 1.1 m+ musky ×1.9. Everything is still in
metres, so the range logic of §6.9 is untouched (marks shrink at long range).

### 7.15 A solid plate in the slice: the lakebed lockup (2026-09-24)
The ACCUPHY lockup stands in the boat's forward plane (`logo.js`). In the depth
strips a plate that lies almost in the slice is seen nearly edge-on: rays
across the 20° thickness hit it too sparsely and only its near edge would show.
So the side views draw it like the fish, from its exact plane: for each pixel,
the plate point with the same forward/depth position, kept if it lies inside
the slab (same flat-topped beam pattern as the fish), painted from a signed
distance to the brand outline (8-bit texture, one fetch per pixel) with bright
edges and a darker speckled face (a flat face returns less than its edges).
The Panoramic top-down map sees the mesh itself.

Two things learned placing it:
- **The bottom echo swallows the lowest ~1.5 m.** The integrated bottom band
  plus its tail is ~1.1–1.6 m thick at 20 m, so anything touching the bottom
  merges into it. The fan hangs 1.1 m below the letters' baseline: standing on
  the bed (or with the letters on silt ridges, tried first) the fan's outer band
  vanished. The lockup therefore stands on a stone plinth that lifts it 1.3 m;
  the plinth is ordinary structure, and its top shows as a bright line the
  letters stand on, stepping down into the notch under the fan.
- **The bottom must be flat across the boat's line.** On a sideways slope the
  20° slab sees a spread of bottom depths and the thick echo buries low parts
  (first logo try on the drop-off).

### 7.16 Near-range gain in shallow water (2026-09-24, Jason: "浅水的时候 … 过爆感太强了 可以折中一点")
In shallow water every ray across the 20° slab meets the bottom at almost the
same range, so the integrated bottom band adds up to a solid white slab; AUTO
depth then zooms the axis and the slab fills the picture. Real sonars damp near
returns with their time-varying gain. The side views now scale bottom and
structure echoes by `mix(0.32, 1.0, smoothstep(3 m, 11 m, r))` (≈ 0.43 at 5 m,
0.9 at 9 m, 1 beyond 11 m): the core just reaches white and keeps its streaks,
the fringe turns orange, and the calibrated ~10 m pictures barely change. Fish
marks are not scaled, so the approved near-field fish look stays.

### 7.17 Panoramic coverage = the curtain (2026-09-24, Jason: "没有照到的东西也出来了")
The flat fan covers 5°–25° below the transducer; only that slab shows. The
Panoramic shader and the fish marks share one coverage function
(`panoLobe`: smoothstep 2°–6° up, 23°–28° down), applied to the bottom field,
structure clumps and fish. The picture runs to its corners (forward ≤ range,
|sideways| ≤ 0.936 range); the 3D curtain and the lakebed highlight are clipped
to that box. Past a drop-off the deep bottom falls below the slab and only structure that
reaches up into it shows. Below the slab a sidelobe (≈ 0.8 of the main
response from 25°, gone by 60°) lets the bottom run on toward the boat a little
darker, as in the app's lake recordings; only the patch right under the
transducer stays dark. The 3D curtain draws the main slab only.

### 7.18 Panoramic bottom texture by range (2026-09-24, Jason: "背景太失真了")
- ≤ ~35 m (app lake frames, 14–29 m): smooth field; fine texture = soft value
  noise in (angle, range) with cells ≈ 1.6° across × 5 cm along the ray, two
  octaves, re-seeded every ping (the app's speckle is smeared ACROSS the beams,
  because a beam is much wider than a range cell); soft world-fixed patches;
  wide beam-group sectors (≈ 11°).
- ≥ ~55 m (app 62 m frame): radial streaks, grain and strong beam sectors.
- Structure clumps: 8 taps on a ring rotated at random per pixel and ping;
  blend `smoothstep(0.08, 0.9, coverage)` so sparse brush stays faint.
- Shadows: accumulated along the ray (`occluded steps / 5`), per-pixel jitter.
- Weeds are not in the top-down map (they return weak, diffuse echoes).

### 7.19 Fish marks rebuilt from the beam's point spread (2026-10-23, #120, Jason: "鱼在游动也好 … 转身也好 … 不动的时候 … 椭圆的球形")
**What was wrong:** every fish was the smooth capsule of the path it swam in the last 0.7 s (§7.13). Swimming
fish became glowing ovals along screen x, a hovering or turning fish shrank to a round blob, and nothing changed
from ping to ping. Research: `docs/livescope-fish-research.md` (LiveScope / ActiveTarget / MEGA Live, fisheries
acoustics); checked against the app's own frames (`reference/app-study/fish-near-vs-far/`, `fish-down-near/`,
`panoramic-lake/`).

**The model (`sonarMarks.js` computeMarks → `sonarShader.js` fishDash):**
- The mark is the fish's body **now** (tail → head), projected into the view. Along the ray the body is a head-on
  target, so only ≈ 0.6 of that part shows; across the ray, the whole flank.
- Each body point is smeared by the beam: **thin along the ray** (sr = 0.7 × pulse + 0.25 × half body depth) and a
  **fixed angle across it** (st = beam × range + half body depth; vertical fans 0.014 rad, Panoramic 0.03 rad). Far
  fish become needles along the arc (app: 0.3–0.5 m at 11–17 m, §6.8); near fish show their length and heading.
  The spindle narrows to points and trails 1.5× further behind the target than in front of it.
- Along the body: the swim bladder (≈ 90 % of the echo) is the bright kernel in the front half; head and tail are
  weaker peaks. Broadside the flank fills in between; head-on the peaks stand apart.
- **Aspect:** broadside returns ~17–20 dB more than head-on. Strength × (0.18 + 0.82 aspect²) in the vertical views
  (was 0.5 + 0.5 aspect); Panoramic × (0.45 + 0.55 of that).
- **Ping to ping:** speckle on the beam grid (angle × range, cells the size of the mark's own spread) changes 8× a
  second, with the last ping still showing a little. It bites the rim hard and the core only lightly (no holes:
  Jason's 中间空了, §7.8/§7.9). The whole echo flickers by 6–70 %: a calm fish is steady, a swimming or turning
  one, or one facing the beam, swings widely.
- Tail beat 2–3.5 Hz (a small wag of the rear half, ±10 % echo). The echo of 0.2 s ago glows at 0.22 behind a moving
  fish (the app's ping blending). Strong targets leak a faint ladder into the neighbouring beams (sidelobes).
- The ice page's jig keeps the old capsule (`legacyMark`): the dial and Live Ice were tuned on it.

**Reading the snapshots:** `__sonarSnap()` is 768×384, the same 2:1 as the phone's screen box. The two range
controls stretch the picture by different amounts (PL Forward at 25 ft range / 45 ft depth: ×3 wider than tall), so
a near fish under the boat is legitimately a long horizontal streak there.


## 8. The Mini's two ice views, as the real app 2.0.0 draws them (tablet, 2026-10-23)

Source: the app's built-in demo data on the V10 tablet, `reference/app-study/2026-10-23/` (12 m range, metric, Color
Map yellow). The Lab's ice page (#94–#116) was built before any real capture existed; this section overrides it.

**Ice Fishing View** (`21-…`, `23-icefishing-55s.jpg`)
- The 2D history fills the WHOLE screen, scrolling right → left, drawn in the **Color Map** (yellow/orange here, like
  Down Scan): brown water, a bright yellow bottom band, short yellow fish arcs, a thin yellow line along the very top.
  When the view opens the record starts at the right edge and grows leftward (empty black before it) — no prefill.
- The **flasher dial floats over the left third** of the history; it is not a separate panel.
- At the far right a narrow **vertical A-scope bar in jet** shows the current ping by depth (red at the fish and the
  bottom, cyan/blue water between).
- Depth rulers (0–12 m) on both the left and right edges; temperature and voltage top-centre-right; the ACCUPHY
  wordmark + resolution top-left; a "20°" cone icon bottom-left; bottom bar: ↶, − range +, pause, − gain % +, ⋯.
- The dial: outer **echo ring in jet**, fully coloured all round in this data (cyan/blue water, green noise, red at the
  surface 0–0.5 m, at fish and at the bottom); a white inner ring with ticks and labels 0, 2, 4 … 10 clockwise from the
  top (the full circle = the range, 12 m); a light-grey centre with the depth readout ("10.0 m", decimals smaller);
  a white marker at 0. The dial stays jet while the history follows the Color Map.

**Live Ice Fishing View** (`30-…`, `31-liveice-17s.jpg`)
- The **Live Down fan fills the screen behind the dial**, black background, echoes only, in the Color Map (yellow):
  the apex at the top, about three quarters across; a horizontal range ruler along the top (6 4 2 0 2); no drawn fan
  outline and no blue field.
- The same dial on the left; here the echo ring is **white where there is no return**, with red arcs at the surface
  (0–2 m clutter), the bottom (≈ 10–11 m) and short jet slivers for fish (≈ 4.3 m).

**What the Lab's ice page gets wrong** (to fix only with Jason's go):
1. Layout: the Lab splits the screen 42 % dial panel | 58 % picture with a black gap; the app lays the picture
   full-width and floats the dial over the left.
2. Colours: the Lab draws the fan and the history in jet on a blue field; the app draws them in the Color Map (black
   field for the fan, brown for the history in yellow) and keeps jet only for the dial ring and the A-scope bar.
3. The A-scope jet bar at the right edge of Ice Fishing is missing in the Lab.
4. The Lab's dial ring is white with one coloured wedge; the app's ring shows every depth's colour (white only where
   nothing returns in Live Ice) and a strong red surface-clutter arc at 0–2 m.
5. The Lab prefills the history (#116); the real view starts empty at the right and grows leftward.

## 9. Structure in the vertical views, after the 2026-10-23 round (decision in docs/decisions.md)

What the app does with a trunk or piling (Live Combo pilings, PL Forward wreck): a **solid column** the width of the
object plus the pulse, with a **white-yellow core** and ragged filament edges along the ray; a **black acoustic shadow**
behind it — the bottom band stops right behind the base and fades back in over a few metres; the bottom band itself
is thick with a long red tail. Crowns and brush are fuzzy orange clumps with bright specks, never hatched lines.
Engine: peaked main lobe across the slab, per-row shadowing with a 3.5 m fade, a 0.3 m pulse for timber/rock, steel
unchanged. Tune with `__sonarHist(10)` on the six scenes listed in the decision; structure scenes should land near
12–14 % white, bottom/fish scenes stay where they were.

### 7.20 Fish, structure and noise: what separates them (measured 2026-10-23, #129, Jason: "鱼啊、结构啊跟噪声如何区别 … 纹理 … 总结这种成像的规律")
Measured, not eyeballed. Every picture is turned back into echo strength through the `garmin_amber` LUT, which was
measured from LVS34 footage (#33) and matches the app's frames with no unmatched pixels. Every pixel is turned into
polar coordinates around the transducer, using the frame's own grid (ft, degrees).

Sources:
- the 8 LVS34 frames and 2 crops in `reference/app-study/livescope-lvs34/`. The cloud container could not reach any
  website this time, so there is no new footage;
- the app's `plm-forward-fish-a/c.jpg`;
- the engine's `__sonarSnap(w, h)` at 100 px/m in both directions.

Script: `scripts/dev/measure/meas.py`.

| | LiveScope (LVS34) | The app (PLM Forward, 18 m) | Engine |
|---|---|---|---|
| **Fish** (5–9 m) | 2.4° (0.33 m) across the ray × 0.13 m along it; peak 0.81, mean 0.60 | small marks 0.8° × 5 cm, peak 0.55; bigger fish 2–3° × 0.1–0.15 m, peak 0.75–0.89 | 0.22–0.30 m × 0.11–0.17 m at 5 m, peak 0.7–1.0: right since #120 |
| **Water noise** | specks 0.5° × 4–5 cm (one resolution cell), peak 0.43; 24–26 % of the water lit at high gain, ~7 % (fish only) with noise reject | ~4 % of the water lit, 1–2 marks per m², mostly in the upper few metres | was empty (0–1.6 % lit); specks since #129 |
| **Structure** | trunk at 4.6 m: 1.7 ft band, peak 0.89, mean 0.66 | piling at 14 m: a hot face line + fibrous tail, 4.5 ft band, peak 0.90, mean 0.72 | before #128: piling 3.5 ft, peak 0.77; **#128: 4.5 ft, 0.91, mean 0.68** |
| **Bottom** | lit median 0.67–0.69, top decile 0.89, 5–6 % white | — | median 0.73–0.76, top decile 0.87–0.89: no change needed |

**The rules:**
- **One beam draws everything.** Every echo is thin along the ray and smeared a fixed angle across it. Noise, fish,
  structure and bottom texture are all made of dashes along the arc; size, brightness and coherence tell them apart.
- **Noise:** one resolution cell (≈ 0.5° × 5 cm), dim (peak ≈ 0.4–0.55), scattered, different every ping.
- **A fish:**
  - several cells (2–3° × 0.1–0.15 m at 6–9 m), clearly brighter than the noise (+0.3–0.4 on the LUT);
  - a smooth spindle with one bright kernel, sometimes two parallel ridges (the front of the body and the swim
    bladder);
  - it holds its shape from ping to ping and moves as a whole.
- **Structure:** as bright as the bottom (peak ≈ 0.9), continuous and connected. A hot line on the face toward the
  transducer and a band behind it about 0.1 × range wide.
- **Bottom:** the brightest wide band, with a hot first return, fibrous, ~6 % white.

**Engine:** #128 had already brought structure to the app's numbers (above). #129 adds what was still missing:
- **Water specks** in the vertical views (`waterSpecks`):
  - at most one per 0.55 m cell of the fan plane, 7–35 % of cells occupied, denser in the top 3–9 m;
  - only above the bottom, ~70 % shown each ping;
  - amplitude 0.2–0.46, which lands at LUT 0.35–0.6;
  - fixed to the lake, so they stay put as the boat turns.
- **Fish:**
  - core speckle down to ±20 % (was ±35 %);
  - a weak second ridge just behind the first on bigger or nearer fish.
## 10. Measured on the app 2.0.0 PL Down recording of a wooden wreck (vivo phone, 2026-10-23)

Source: Jason's vivo (V2545A, 2504×2312) playing `PingLive Lite_Forward View_20260906_16xxxx.sonar` on the PingLive
**Down View**, 80 ft range, gain 40 %, contrast 47 %, noise reject 25 %, TVG 25 %, colour map **orange**; frames
`reference/app-study/2026-10-23-vivo/pl-down-d*.jpg` (bursts of 20 at 1 s in the local-only folder
`reference/vivo-bursts-2026-10-23/`). Jason: the wreck is **wooden**. Scale on screen: 28.2 px/ft horizontally,
27.75 px/ft vertically (full-resolution PNG); 0 ft at x 1252, 10 ft depth at y 403.

**The wreck.** Hull from ~2 ft to ~38 ft starboard (≈ 11 m long), deck line at 23–25 ft, bottom under it at 33–35 ft
(≈ 3 m tall). The whole section is **lit through** (85 % of the hull box is lit): planking, ribs, the far side — not a
face with a shadow behind it. Dark cavities inside are hatches / the cabin, not texture. Brightness classes of the lit
hull pixels: white 1.8 %, yellow 16 %, orange 39 %, red 25 %, dark red 19 % (mean RGB 171 / 104 / 51). The deck line
is the hottest part: a broken yellow-white dash line. A vertical luminance profile at 12 ft starboard: nothing above
22 ft, 85 at 22 ft (deck edge), 168 at 23, 190 at 25 (the deck), 105–160 through the hull (27–33 ft), 50 at 34 ft
(the gap under the hull), 200 at 35 ft (the bottom), 27–45 at 37–39 ft (the tail), 0 below 40 ft.

**Texture.** Inside the hull the grain's correlation length is ~25 in across the beam (horizontal) and ~10 in along
the range (vertical): the beam's width smears the grains sideways, the range cell keeps them short. Between two
frames 1.6 s apart the mean luminance change in the hull is 37 on a mean of 118, and 18 % of the pixels change
colour class — the picture is re-drawn every ping, but most grains stay.

**The bottom band** (25 ft port, no structure): peak luminance 200 (yellow, not white); the body above 40 % of the
peak is 1.6 ft thick, the tail above 15 % runs 1.9 ft; lit classes white 2.5 %, yellow 17 %, orange 32 %, red 22 %,
dark red 27 %. Below the band a faint speckled trail (the second echo) to ~40 ft.

**The colour map.** The displayed "orange" ramp, median RGB per luminance: 28 → 47/21/16, 52 → 96/35/28,
76 → 147/46/40, 100 → 177/72/43, 124 → 198/102/43, 148 → 212/135/48, 172 → 219/169/59, 196 → 225/205/70,
220 → 239/227/132, 244 → 252/246/216. It is now `COLORMAPS.accuphy_orange` (default), measured from these frames.

**The field.** 87 % of the picture is black at noise reject 25: no visible floor haze at this gain.

**What changed in the engine from this** (decision #130): the measured colour map; gain that brightens with +
(40 % = the app's look); coherent cells ~1.2° × 0.67 m that drift (no hairlines); structure faces built from grains
(0.6 m across × 0.25 m along the ray, a fifth re-drawn per ping); a `wood` sonar tag (0.6) whose mass is lit through
for ~2 m with the shadow starting 1.6 m behind, while timber/rock (0.5) smear 0.5 m and shadow at once; the bottom
band's pulse and tail lengthened (0.28 + 0.012 r / 0.45 + 0.02 r) and its soft cap raised (K 0.4 → 0.8) so the body
is orange; the noise floor halved. Like-for-like fit (`?study=wreck`, the wooden workboat ×1.25 beside the boat at
the same range / gain / depth): lit hull classes white 4 / yellow 16 / orange 33 / red 26 / dark 21 vs the
recording's 2 / 16 / 39 / 25 / 19; flicker 31 on 154, 15 % (recording 37 on 118, 18 %).

**Jason's reading of the frame (2026-10-23 evening, the seven marked regions of `pl-down-d00`):**
① the speck spray above the stern — faint **noise**, not fish. ② the cluster at the very top under the transducer — the
app's **"sonar working" icon**, drawn by the app at the top centre of the Down view whenever the sonar runs (partly hidden
by the 0 label), plus one small noise dot. ③ the sparse trail under the bottom band behind the hull — ignore; it may simply
**fade out downward**, darker the deeper. ④ the bright dense face at the bow — the **hull side lit by the sonar**: solid and
complete, "very beautiful": a horizontal line along its top (the deck edge), an emptier band under it, then the solid
lower face — two shapes a viewer tells apart at once. ⑤ the dot at the lower right of the box is **a fish**; the faint line
on the left is noise. ⑥ **small fish**. ⑦ the dark cavities with bright verticals inside the hull — **the hull's side
structure**: small vertical members (ribs), interrupted yet clearly part of the boat; the larger lit patch on the left is
where the side joins those members; below it, probably broken parts. Verdict on the Lab's render of that round: "效果其实
还是很糟糕" — the engine draws only the first surface plus random grain, so the hull comes out holey and blobby instead
of a solid, lit-through section with deck line, ribs and far side.

**Engine, second step (decision #135):** structure is no longer the first depth hit plus grain but an **echo splat** of
every structure surface into (angle, range) — see decisions.md #135. What to tune against the recording from here: the
grain's correlation across the beam (ours 34 in vs 25), the per-ping flicker (ours 21 vs 37 on a similar mean), the share
of yellow in a lit face (ours 5 % vs 16 %), and the hull's dark cavities (geometry: the study hull is a solid extrusion
with a box cabin, the real one an open shell with ribs).

**Bottom band, measured on the same burst (decision #140, 2026-10-23):** 20 frames of the flat bottom left of the wreck
(x −40…−5 ft): band above 40 % of its peak 1.44 ft and the same at 36 and 50 ft of range; peak LUT 0.62 at 0.5 ft under
the leading edge; 75 % width 1.1 ft, 15 % width 2.7 ft (a smooth tail, no second hot line); classes in the 2 ft under the
edge w2 y21 o49 r18 d9; the edge moves 2.5 in between pings (median per column), 6.9 in over the burst, ~4 bumps > 2 in per
10 ft; 44 % of the band's pixels change colour class from ping to ping. The texture is fibrous along the rays with a
feathered top edge and rare white points. Lab after #140: 1.40 ft, 1.3 / 2.2 / 2.8 ft, w1 y15 o58 r24 d2, 1.6–2.2 in, 49 %.
Lesson: any **max over the slab rows** (the old peak and edge lines) turns a fore-aft slope into a plateau — integrate the
rows, never take their max.

**Core to rim and the band's texture (decision #143, 2026-10-24):** inside a solid target on the burst the brightness
climbs over the outer ~9 in (L 157 → 390) and stays there, with yellow 22 % and white 4 % in the core; red only in the outer
4 in. The bottom band's edge is flat — the texture is soft fibres along the rays [wrong direction, see the grain rule below: they run across the rays] (~3 in × 10–16 in, low contrast) whose tips
feather the top edge; there are no bumps. Measure with `real/rim.py` and the `band-zoom` crops, never by edge-detector
"wobble" alone (it mistook the fibre tips for a moving edge in #140).

**Opacity, texture and outline of solid targets (decisions #145–#147, 2026-10-24, approved by Jason step by step):**
a solid target is **opaque** — the bottom band behind it does not show through (in the Lab it was added on top and read as
"transparent"). Its inside carries the **same fibres as the band**: in the band crop of `pl-down-d00` the brightness varies
with a coefficient of variation of **0.28** (L median 388, p10/p90 236/511, gaps below 0.6 × median 9 %); the Lab's approved
band 0.22; a "photo-smooth" target 0.12. The fibres run along the ray [wrong — the app's run across it; see the grain rule below], ~5–8 cm across and ~0.3–0.6 m long, brighter yellow
strokes on an orange body, never black gaps (black gaps read as see-through, dark-led texture as leopard spots). The
**outline is never a clean line**: thin tapering streaks [the ends of the across-ray grains, see below] stick out of every surface, ~10–20 cm on the side
facing the transducer and ~20–30 cm behind, each beam its own length, new every ping — on hulls, rocks, steel and branches
alike ("每个物体表面都会有纤维的").

**The grain rule — every return is a short arc across the beam (measured 2026-10-24; corrects #143, #146, #147).**
Jason: "不是简单的横向短颗粒 … 看真机的颗粒到底是什么, 在不同画面下有什么共性, 规律". Method (`scratchpad/grain/grain.py`):
the long axis of the >0.5 lobe of the 2-D autocorrelation of each lit 96 px patch, in physical units from the rulers,
and its angle to the ray from the transducer. Both vivo bursts (PL Down 80 ft, PL Forward 60 ft; 1,782 patches, every
4th frame):
- **Direction:** the grain's long axis is **across the ray in 100 % of the patches (median 87–89°)** at every range, on
  the hull, the bottom band and its tail alike, and with any high-pass scale (80–89°). On screen the arcs therefore tilt
  with the fan: "\\" on the left of a Down picture, flat under the transducer, "/" on its right, "/" in most of Forward. The
  same holds by eye in every other view we have: Mini Forward weeds and bottom, Mini Combo band and piling, PL Panoramic
  fish, Mini Down fish and band (`reference/frames/`), and LiveScope (fish as vertical needles in its Forward view =
  across its horizontal rays). The fish model (#120) already follows it; structure and the bottom did not.
- **Size:** fine grain ~6–7 in across × ~2 in along the ray (aspect ~3), grouped into clusters ~10 × 4 in. Across, it grows
  only slowly with range (6.3 → 7.3 in from 25 to 55 ft in Down; 4.3 → 7.0 in from 25 to 60 ft in Forward: 1.0° → 0.6°);
  along the ray it stays ~2 in (the pulse).
- **Composition:** a continuous reflector (the bottom, a deck line, a piling) is these arcs laid side by side and
  overlapping, so the texture inside a band crosses the band at the angle between the band and the rays — the diagonal
  "fibres" of the bottom close-up (strokes at 31–45° on screen where the ray runs at 122–135°) are across-ray arcs, not
  streaks along the ray. A target's ragged outline is made of the same arcs' ends sticking out (above the hull top only
  ~2.6 in); edges parallel to the rays fray the most, edges square to them stay lumpy but straight.
- **Life:** the arcs re-form every ping (hull |ΔL|/L 0.46 between frames 1 s apart, 64 % of band pixels change colour
  class; LiveScope-session check 2026-10-24).
- **The Lab after #147, same method:** long axis **along the ray (median 1°)**, aspect ~10 (8–14 × 1–1.5 in) — hair, not
  arcs; hull |ΔL|/L 0.17, band 43 %.
