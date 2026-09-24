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

**Engine mapping** (`sonarShader.js` fishAt/dash): angular blur = constant
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
