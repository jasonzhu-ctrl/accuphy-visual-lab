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
