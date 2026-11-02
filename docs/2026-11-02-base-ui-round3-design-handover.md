# Round 3: A8 app download + the tour's drag progress ring, design handover to Base (界面设计, 11-02)

Goes with the plan `docs/2026-11-02-tour-round3-and-base-ui-plan.md` (Jason approved 11-02, items A and C). Base writes the
code; this file says how it looks. Everything here is a design value, so change it only with 界面设计 or HQ.

| File | What it is |
|---|---|
| `docs/2026-11-02-tour-design/a8-look.css` | Reference CSS for A8: the desktop badge group and QR popover, the phone's two buttons |
| `docs/2026-11-02-tour-design/progress-ring.css` | Reference CSS for the drag progress ring, with its markup and states in the header comment |
| `docs/2026-11-02-tour-progress-ring.jpg` | The progress ring on Base's real tour: before the drag, dragging, released, done (desktop and phone) |
| `docs/2026-11-01-app-badges-desktop-1280.jpg` | A8 desktop as Jason picked it 11-01 (lake, Mini, ice; badges only, and with the popover open) |
| `docs/2026-11-01-app-qr-phone-v4.jpg` | A8 phone as Jason picked it 11-01 (lake, Mini, ice; with the share popover open) |

Words and links belong to 对接: the i18n keys (`learn_more`, `share_buddy_phone`, `app_qr_caption`, `app_qr_open`), the
French and the two store links are in `docs/2026-11-01-app-qr-plan.md`, last section. This file only uses them.

## 1. A8 on desktop

**The panel.** The two badges and the "GET THE ACCUPHY SONAR APP" caption come out of the panel. The panel keeps
"Shop …" and "Send to a fishing buddy" exactly as now.

**The badge group above the phone.**

| What | Value |
|---|---|
| Place | Right edge on the phone frame's right edge; the group's bottom 12 px above the frame's top edge |
| Caption | One line above the badges, right-aligned: "Get Accuphy Sonar App". Instrument Sans 600 11.5 px, sentence case, white at 60 %, gap 6 px to the badges |
| Badges | The official artwork as shipped, 40 px high, 10 px apart. App Store left, Google Play right |
| Hover | The artwork 12 % brighter. Focus: a 2 px #028CDF outline, 2 px out |
| Open | The badge whose code is showing gets a 2 px white outline at 85 %, 2 px out |

The caption needs a text key. `get_app` today says "Get the Accuphy Sonar app"; the image says "Get Accuphy Sonar App",
the same name as in the QR line. 对接 owns the words.

**The QR popover** (a click on a badge opens that store's code):

| Part | Value |
|---|---|
| Box | 244 px wide, padding 14 / 14 / 12, radius 10 px, rgba(14, 28, 36, 0.96), 1 px border white at 14 %, the share popover's shadow |
| Place | Left of the badge group: its right edge 14 px left of the group, its bottom 6 px below the badges' bottom. A 12 px pointer on its right edge, 22 px up from the bottom, points at the badges |
| Top row | The store's glyph 13 px + "APP STORE" or "GOOGLE PLAY": Instrument Sans 600 11 px, uppercase, letter-spacing 0.06em, white at 65 %. Centred, 10 px above the code |
| Close | The share popover's × (`.ac-share-x`), top right |
| Code | A 200 px white tile, radius 6 px: 168 px of code and a 16 px quiet zone. See the note below |
| Line | "Scan to download Accuphy Sonar App": Eurostile Heavy 800 13 px, uppercase, letter-spacing 0.03em, centred, 10 px under the code |
| Motion | Opens with a 0.18 s fade-up (6 px). No motion on close |

Behaviour of the popover, so it feels right:
- It closes on ×, a click outside, Esc, or a second click on the same badge.
- A click on the other badge swaps the store in place.
- It never shows together with the share popover: opening one closes the other.

The code is 168 px, not the 148 px drawn on 11-01. That is the share popover's rule (HQ 10-29: scannable off a screen),
and the Google Play link with its referrer makes a dense code. The popover is 52 px taller than in the image. At
1280 × 720 it still clears the panel and the top of the screen, because the step cards are gone.

**During the tour** the badge group is dimmed and not clickable, like Shop and Share today (Base 58543a1), in its new place.

**Ice page.** The same group and popover above its phone, as in the 11-01 image.

## 2. A8 on phones (390 × 844)

- **No badges** on phones, top right or anywhere.
- **Two buttons,** same height, centred in one row, 12 px above the phone frame, 10 px apart:

  | | Left: "Learn More →" (primary) | Right: "Share to a Fishing Buddy" (secondary) |
  |---|---|---|
  | Size | 46 px high, about 128 px wide (as wide as its words) | 46 px high, about 204 px wide (as wide as its words) |
  | Look | Solid #028CDF, radius 10 px, shadow 0 6 px 18 px rgba(0, 25, 40, 0.35) | Dark glass rgba(8, 22, 30, 0.55) with a 14 px blur, a 1.5 px white border at 55 %, radius 10 px |
  | Text | Instrument Sans 600 14 px, white; the → icon after the words | Instrument Sans 600 14 px, white, no underline; the paper-plane icon before the words |
  | Padding | 18 px left, 16 px right | 12 px each side |

- **Narrow phones.** Below 370 px wide the pair would not fit, so the right button drops to 13 px text and 10 px padding,
  and the left one to 14 / 12 px padding. Both stay on one line.
- **French.** "En savoir plus" and "Partager" are shorter than the English, so no change is needed. If the website picks
  "Partager avec un ami pêcheur", tell me and I'll check the fit.
- **The share popover** on phones moves to 40 % from the top, so it clears the taller buttons.

## 3. The drag progress ring (tour stop 1, 4 s of dragging)

Jason: stop 1 completes after 4 s of dragging, in total (stopping and starting is fine). The visitor should see how much
is left. A restrained mark: one thin white arc around the blue ring, no numbers.

| Part | Desktop | Phone (× 1.25) |
|---|---|---|
| Track | Circle radius 39 px around the ring centre, 2.5 px, white at 22 % | radius 49 px |
| Arc | Same circle, 3 px, white, round ends, a 3 px blue glow; grows clockwise from 12 o'clock | Same circle, 3.75 px |

The arc follows the drag time every frame (`p` = drag time / 4 s), with no easing of its own.

**States** (classes on `.ac-tour-cue`):

| State | What shows |
|---|---|
| Before the first drag | Exactly round 2: ring, wave, finger and arrows flashing. No track or arc yet. |
| Dragging (`.is-dragging`) | Finger, arrows and wave fade out in 0.2 s. The blue ring holds still at full strength. Track and arc fade in. |
| Released early (`.has-progress`) | Finger, arrows and wave come back. Track and arc stay where they got to, with no draining back. |
| Done (`.is-complete`) | The arc closes. The ring fills bluer (#028CDF at 50 %) and pops once, 1 → 1.14 → 1 in 0.36 s. After 0.6 s the whole cue fades out in 0.5 s. The card ticks and holds 3.5 s over the open lake. |

Markup and every value are in `progress-ring.css`; the image shows all four states on the real page.

## How 界面设计 will check

When Base says it is done, I will take these frames from a clean build of HEAD and compare them with this file and the
11-01 images, then report differences to HQ:

- Desktop 1280 × 720 on the lake, Mini and ice pages: the badge group, each store's popover, and a check that the panel
  no longer has the badges.
- Phone 390 × 844 on the same three pages: the two buttons, and the share popover open.
- The tour's stop 1 at each state: before the drag, mid-drag, released and done.
