# Accuphy Sonar App — screen chrome (measured on a real tablet, 2026-09-24)

App v2.0.0_beta.14 on the V10 tablet (Android 13, 1920×1200 landscape), Playback
mode, orange colour map. Screenshots in `reference/app-study/`. This is what the
phone inset copies. Positions are given as fractions of the screen so they
transfer to the iPhone frame.

## 1. Sonar view — common chrome (all PingLive views)

| Element | Where | Look |
|---|---|---|
| Depth readout | top-left, x ≈ 4 %, y ≈ 16 % | huge white number + unit, e.g. `9.7 m` (≈ 9 % of screen height tall). Two short white dashes `— —` instead while no bottom is found |
| Water temp / voltage | under the depth, two lines | white, ≈ 3 % tall, e.g. `22.2 °C` / `12.9 V` |
| ACCUPHY wordmark | top-right, x ≈ 91–97 %, y ≈ 8 % | small grey-blue wordmark with the blue “ripple” U; under it an *italic* grey resolution tag `1440p (QHD)` / `720p (HD)` |
| Range −/+ | bottom-left, y ≈ 95 % | ⊖ `18m` ⊕ — white circle-outline buttons, white value. **Horizontal range** (distance) |
| Pause | bottom-centre | ⏸ in a white circle |
| Gain −/+ | bottom-right of centre | ⊖ `57%` ⊕ — 1 % per tap |
| Back | bottom-left corner | ↶ bent-arrow icon |
| ⋯ menu | bottom-right corner | three dots |
| Depth range −/+ | right edge, mid-height (PL Forward View only) | ⊖ / `12m` / ⊕ stacked vertically — **vertical range** (depth); steps 8·9·10·12·14·16·18 m. Range steps 6…22 m by 2 m. Each control scales ONE axis only (`sonar-style.md` §6.9) |
| Rulers | top edge and both side edges | thin white italic numbers, no lines; **no grid** in orange mode |

Everything is white text on the picture, no boxes; the picture runs edge to
edge (the status bar is the only thing above it).

## 2. Layout per view (this is the key rule — the picture is stretched per axis)

| View | Apex | Horizontal axis | Vertical axis | Notes |
|---|---|---|---|---|
| **Forward** | left, x ≈ 20 % (top edge) | top ruler: 0 at the apex, **range** at the right edge; negative numbers to the left of the apex (≈ −4.5 m of 18 m shown) | side rulers 0 → **depth range** (16 m) top to bottom | axes scale **independently** (tablet: 71 px/m horizontal vs 60 px/m vertical; phone screenshot from Jason: 23 px/ft vs 15 px/ft) |
| **Down** | top-centre | top ruler ±range/2 … the 135° fan runs off both sides of the screen | side rulers 0 → range (12 m) | **1:1** scale (80 px/m both ways); no depth-range control |
| **Panoramic** | bottom-centre | top ruler ± | side rulers **2 → 10 upward** (range 12 m at the top edge) | fan opens upward, black wedges bottom-left/right outside the fan; no depth-range control |

Ranges seen: Forward 18 m + depth 16 m (default after opening), Down 12 m,
Panoramic 12 m. Gains: Forward 70 % default, Down 50 %, Panoramic 70 %
(per-view settings; playback keeps the recording's own settings).

## 3. ⋯ menu (right-hand panel, three tabs down the left)

Tab ☰ **image settings** (per view):
- Contrast 25 % · Noise Reject 5 % (Down view: 25 %, Panoramic: 0 %) · TVG 25 % — sliders with − / +
- Color Map ▸ list: **classic, rainbow, coolwarm, red, orange ✓, yellow, …** (more below the fold)
- Image Stabilization Off ▸ (Forward/Down only)
- Interference Rejection Off ▸ (Off / Low / High)
- Fishing Mode Static (Smart) ▸
- Overlay ▸ (also where the record button is enabled) · Waypoints

Tab ⚙ **device settings**: Reset Defaults · Install Depth 0 cm · Install Angle 0° · Tx Power Low…High (4 steps)

Tab ⟲ **Demo Record**: list of `.sonar` files for THIS view type (name, Saved
time, File size); the selected one is highlighted blue and plays in a loop.

## 4. Settings tab (app level)
Sonar Settings: Playback On/Off · Sonar Sharing · Water Type Freshwater · Image
Resolution 720p/1080p/1440p · Keep Screen at Max Brightness · Sonar Information.
System Settings: Units Metric/Imperial · Language · Map Management · About.
Playback page: **Grant Data Access** (Android folder permission) is required
once before externally copied `.sonar` files show up; the folder is
`/Download/Accuphy Sonar/Sonar Data`.

## 5. Home
Sections PingBeam (Side / Down / Traditional), PingLive (Panoramic / Forward /
Down), PingLive Mini (Live Panoramic / Live Forward / Live Down / Down Scan /
Chirp Sonar / Ice Fishing / Live Ice Fishing), Combo. A ⬇ badge on a tile means
its simulation pack / recording is not on the device yet.

## 6. PingLive Mini views (measured the same day)

| View | Apex | Axes | Controls |
|---|---|---|---|
| **Live Forward** | **top-left corner** (x ≈ 0) | top ruler 0 → range (18 m); side rulers 0 → 10 m depth (1:1 here) | range −/+ · gain −/+ · **zoom `1.0x` with ˄ ˅** on the right edge (no depth-range control) |
| **Live Down** | top-centre | top ruler ±3 (fan corners meet the screen corners); side rulers 1 → 7 (range 8 m) | range −/+ · gain −/+; the 39° fan is **stretched ×2 horizontally** to fill the width |
| **Live Combo** | one shared apex at the top, x ≈ 20 % | **Down panel lower-left** (its own scales: 0 1 2 along the bottom, 1…5 down the left), **Forward panel upper-right** (0 → 18 along the top, 2…12 down the right); a thin grey **double diagonal line** from the apex to the bottom-right separates them; black gap between | only ⏸ and back/⋯ on screen; the **Forward and Down ranges are set separately** (the ⋯ menu's Live Forward / Live Down tabs; Jason 2026-10-29). Depth readout + temp + voltage move to the **top-right** (x ≈ 78 %). *Lab (#189):* two sliders on the desktop panel, and on phones a −/+ under each panel |

Combo's ⋯ menu has three tabs: 🐟→ Live Forward settings, 🐟↓ Live Down
settings (Contrast / Noise Reject / TVG at 20 %, Color Map, Image
Stabilization, Interference Rejection), ⟲ Demo Record. The two panels are the
full Forward and Down pictures, each clipped by the diagonal.

## On the Beam Explorer page (decision #38)
The chrome's buttons (back, range −/+, pause, gain −/+, ⋯, depth −/+) are
**display-only** on the page: drawn at 42 % opacity like a disabled iOS
control, with the values between them at full white. A tap opens the sign-up
gate (`docs/signup-klaviyo-plan.md`). The PL Forward depth control shows a small
blue **AUTO** above its value, because the page runs the depth range on auto.
Both devices (decisions #60, #65): Down and Forward share one AUTO depth range, so
the bottom sits at the same height in both. In Down the range is that AUTO value: the
page's Range slider is greyed out and the phone shows AUTO over the range. Combo keeps
two panel scales: its Down panel on the same AUTO depth range, its Forward panel at
0.7 × range (decision #68).
