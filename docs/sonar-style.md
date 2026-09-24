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
