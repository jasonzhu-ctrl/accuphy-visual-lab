# Entry tour in the base version: design handover to Base (界面设计, 11-02)

Goes with the plan `docs/2026-11-02-entry-tour-into-base-plan.md` (Jason approved 11-02). Base writes the code; this file
says how it should look and move. Everything here is a design value, so change it only with 界面设计 or HQ.

**Files** (all in `docs/2026-11-02-tour-design/`):

| File | What it is |
|---|---|
| `tour-guide.css` | Reference CSS with every value below: colours, sizes, keyframes, timings. Copy the values; rename classes as you like. |
| `finger.svg` | Pointing hand, white with a dark edge. Its tip is at 39.6 % / 5.2 % of the box. |
| `arrow.svg` | Left arrow, white with a dark edge. The right arrow is the same file mirrored. |
| `demo.html` | Open in a browser to see the boat cue and the tile tap moving. |
| `../2026-11-02-entry-tour-design.jpg` | Before / after mock-ups: boat cue close-up, desktop tile spotlight, end of tour, three phone stops. |

Jason 11-02: make the guide obvious, like a game tutorial. The "no glow" rule (#186) does not apply to these guide marks.
Everything else on the page keeps the store style.

## What stays from the mock

The card (Eurostile Heavy title, one line, three dots), its place and its timing stay as in
`src/experiments/2026-11-01-tour-proto/` (`tour.css`, `TourProto.jsx`). The timing is: start 0.7 s after the lake is
ready, check mark and hold 0.7 s, fade out 0.3 s, next stop fades in 0.42 s. "Skip tour" while it runs, "Replay tour"
afterwards. While the tour runs the lake is dimmed (brightness 0.72) and the panel is locked except the one tile asked for.
The old thin white ring on the boat and the thin blue tile pulse are replaced by the marks below.

## 1. Boat cue (stop 1, "Drag the boat"), desktop and phone

Anchored on the boat every frame, the same anchor the mock's ring used (the lake's cue caption position + 10 px, + 36 px on
desktop; + 6 px, + 24 px on phone). Base can use the boat's screen position directly instead.

| Part | Look | Motion (all on one 1.2 s beat, together) |
|---|---|---|
| Ring | 64 px circle, 3 px #028CDF edge, fill #028CDF at 24 %, blue glow 18 px | Opacity 0.5 → 1 → 0.5 and scale 0.92 → 1.06 → 0.92, ease-in-out |
| Wave | A second 2 px blue circle | Grows from 1× to 2× and fades out, ease-out, every beat |
| Finger | `finger.svg`, 30 px wide, tip on the ring centre | Opacity flash with the ring |
| Arrows | `arrow.svg` 26 px, centres 58 px left and right of the ring centre, blue glow 6 px | Opacity flash with the ring; each swings 7 px outward and back |

Phone: everything × 1.25 (ring 80 px, finger 38 px, arrows 32 px at 72 px), so it is easy to press.

The cue fades out with the card when the drag is done.

## 2. The tile to tap (stops 2–3)

Four marks together, all fading in with the card (0.42 s):

1. **Spotlight.** Everything except the tile goes darker: a hole the size of the tile + 6 px, corner radius 12 px, and
   rgba(0, 10, 16, 0.6) everywhere else. That covers the lake, the panel and the phone screen. The tour title and text sit
   above the spotlight, so they stay bright.
2. **The tile.** Full opacity, a 3 px #028CDF edge, a blue glow of 22 px. Two 2.5 px blue rings spread 20 px out from the
   tile edge and fade, 1.6 s ease-out, the second 0.8 s after the first.
3. **Finger tap,** a 2.0 s loop:

   | Time | What happens |
   |---|---|
   | 0–0.8 s | The finger slides in from 64 px right, 72 px below; it fades in during the first 0.24 s. Easing cubic-bezier(0.25, 0.8, 0.3, 1). |
   | 0.8–0.96 s | Press: it shrinks to 0.86 around its tip. A white dot with a blue glow flashes at the tip and spreads to 2.4×. |
   | 0.96–1.16 s | It springs back to full size. |
   | 1.16–1.64 s | Hold. |
   | 1.64–2.0 s | Fade out, then start again. |

   The finger is 44 px wide on desktop and 52 px on phones. Its tip rests on the tile centre, 8 px below the middle, so
   the view icon stays visible.
4. **"TAP" bubble.** A #028CDF pill with white text, Instrument Sans 700 12.5 px, uppercase, letter-spacing 0.1em,
   padding 5 × 11 px, and a 6 px pointer. On desktop it sits centred above the tile with a 12 px gap and points down. On
   phones it sits right of the tile with a 14 px gap and points left, because the words are above. It bobs 4 px toward
   the tile, 1 s each way.

When the visitor taps the tile, the view switches, the card checks and fades out, and all four marks fade out with it.

## 3. After the tour

The three step cards in the top right do not come back (desktop and phone). Only "Replay tour" stays, bottom left on
desktop, top right on phones.

## 4. Phone layout (390 × 844 reference)

- **No App Home first.** The tour starts by itself 0.7 s after the lake is ready, on the stop's own view (Mini page:
  Combo). After Skip or the end, App Home works as now.
- **Card.** Under the safe area + 64 px, centred, 20 px side gutters. Title 30 px, text 14.5 px, at most 320 px wide.
  Skip sits top right.
- **Stop 1.** The words are "Drag the boat", the same as desktop (not "Tap the boat"). The boat cue is shown at × 1.25.
  Dragging the boat completes the stop. A plain tap on the boat may also count, Base's choice.
- **Stops 2 and 3.** One view tile centred 22 px under the dots, 120 px wide. It looks the same as the desktop panel tile
  (`.ac-view`: view art and name). The tile gets the spotlight, rings, finger (52 px) and the bubble on its right.
  Tapping it really switches the view, then the stop completes. There is no "Next" button.
- **Words.** Titles and text are the same strings as on desktop (one set of keys in `i18n.js`).

## 5. Things to keep

- **Reduced motion.** If the visitor's system asks for reduced motion, show the marks still, without animation (the last
  rule in `tour-guide.css`).
- **Clicks.** The marks never take clicks (`pointer-events: none`); only the tile does.
- **Ice page.** It keeps its current cards this round; check it is unchanged.

## How 界面设计 will check

When Base says it is done, 界面设计 takes the same frames as in the mock-up image from the dev page: desktop
1280 × 720 at stops 1–3 and the end, and phone 390 × 844 at stops 1–3. It compares them with this file and reports any
differences to HQ.
