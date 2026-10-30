# Desktop panel redesign: brief (Jason 2026-10-30)

Scope: the desktop page only (left panel, top-right step cards). Test links only; nothing goes to lab.accuphy.ca without
Jason's 动. Do not touch the lake or the sonar imaging. Phone layout stays as it is this round.

Jason's words: the first font must improve; the buttons look very AI; try popular commercial-licence glass from GitHub or
the community for the three cards, fitting our background; redo the view option as icon + picture + name on desktop, after
studying Garmin, Lowrance and Humminbird, different from theirs and better.

## 1. Title font
Match the "PRO STAFF" title at prostaff.accuphy.ca/apply and the website: Eurostile 800, uppercase, letter spacing 0.04em.
Today `.ac-title` is 11 px with 0.2em spacing, which is why it reads thin and scattered. Make ACCUPHY LAB a real title
(about 22 px). Pro Staff and the website load Adobe kit tgt1pkw; the Lab keeps its own Eurostile Heavy woff2 for this test
(moving to the kit needs the Lab's domains added, still open from #191).

## 2. Buttons
Remove what reads as AI: full pills, coloured glow shadows, inner highlights. Use the website's language: 6 px corners,
flat #028CDF for the one Shop button, Eurostile 800 uppercase on it, no glow. Secondary controls are quiet, without white
iOS thumbs. Applies to `.ac-primary`, `ShopButton`, `.ac-seg` / `.ac-btn` on desktop.

## 3. The three glass cards
Real refraction, all MIT (commercial use allowed, keep the licence notice):
| Project | Stars | Last push | Note |
| rdev/liquid-glass-react | 6565 | 2025-06 | Most popular, React, not maintained lately |
| dashersw/liquid-glass-js | 1620 | not checked | Plain JS |
| shuding/liquid-glass | 1220 | 2026-03 | Copy-paste SVG shader, no dependency |
Try at least two on the real lake and show them side by side with today's card. Check licence files before use. SVG
refraction is reported Chromium-only, so Safari and Firefox must fall back to today's frost cleanly. Desktop only. Text must
stay readable on bright water. Measure fps with and without; report the cost to HQ.

## 4. View option: icon + picture + name
Replace the small Down / Forward / Panoramic / Combo pills on desktop with tiles: real sonar thumbnail (`home/*.jpg`), a line
icon, the name. 3 tiles for PingLive, 4 for Mini. Locked views keep the lock and still open the subscribe card.

What the others do: Humminbird MEGA Live 2 uses tiny outlines of the beam footprint in its top bar, with no boat, down /
forward / landscape (Operations Guide 532771-3EN_B p.24). Garmin (Forward, Down, Perspective) and Lowrance (Forward, Down,
Scout): the same three ideas; their on-screen icons were NOT confirmed from a source.

Ours, drawn by us, copied from no one: a small boat plus the beam, so a beginner sees where the sonar looks.
Down: side view, beam straight below. Forward: side view, beam ahead. Panoramic: top view, wide sweep ahead of the boat.
Combo: side view, forward and down beams together. One stroke weight; the beam fills Accuphy blue when selected. Beam
widths follow `accuphy-website/docs/specs.md`, nothing invented.

## Keep working
Tile click events, `pickView`, lock logic, aria labels, French lengths, the ice page, sideways. Run the existing guard tests.
Write the decision into `docs/decisions.md`. Report to HQ with a screenshot before anything is published.
