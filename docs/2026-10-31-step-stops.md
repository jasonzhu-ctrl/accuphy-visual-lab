# Step-card stops: proposal (Base, 2026-10-31)

For the three-stop tour (Jason picked A, `docs/2026-10-31-step-cards-review.md` §5). Points only, no code. Sheet:
`docs/2026-10-31-step-stops.jpg` (3D view and phone 10 s after arrival).

Measured on the dev page at main 893c7ca, headless Chrome 1440×900. Each stop is reached from the previous one, like a
visitor clicking the cards in order. Fish = fish inside the beam (smelt not counted), per beam for Combo (Down/Forward).
Minimum from #193: PingLive 4, PingLive Panoramic 6, Mini 3.

| Page | Stop | Boat x,z | Device / view | Range | Fish at arrival | 5 s | 10 s | 20 s | Minimum met at arrival |
|---|---|---|---|---|---|---|---|---|---|
| / | 1 | −20, 6 (today's) | PL Down | AUTO (35–45 ft) | 1 | 2 | 6 | 8 | no (from ~10 s) |
| / | 2 | 16, 11 (today's, timber) | PL Forward | 60 ft | 0 | 0 | 0 | 2 | no, not even at 20 s |
| / | 2 alt | −18, −6 | PL Forward | 60 ft | 2 | 4 | 4 | 4 | no (from ~5 s); no timber |
| / | 3 | −24, 6 (new) | PL Panoramic | 70 ft | 14 | 18 | 15 | 11 | **yes** |
| /mini/ | 1 | −20, 6 (today's) | Mini Down | AUTO | 0 | 0 | 6 | 6 | no (from ~10 s) |
| /mini/ | 2 | −24, 12 (new) | Mini Forward | 60 ft | 2 | 8 | 8 | 8 | no (from ~5 s) |
| /mini/ | 3 subscribed | −24, −48 (the 110 ft hole) | Mini Combo | Forward 90 ft, Down AUTO | 2 / 2 | 1 / 1 | 4 / 3 | 4 / 3 | no (from ~10 s) |
| /mini/ | 3 not subscribed | −30, 12 | Mini Forward | 60 ft | 1 | 3 | 7 | 7 | no (from ~5 s) |
| /ice/ | 1 | 1, 1 (today's camp hole) | Live Ice | AUTO | 0 | 0 | 2 | 3 | no (from ~20 s) |
| /ice/ | 2 | 6, −48 (new, 78 ft) | Live Ice | AUTO | 3 | 3 | 4 | 5 | **yes** |
| /ice/ | 3 | −18, 12 (new) | Forward | 60 ft | 1 | 5 | 4 | 7 | no (from ~5 s) |

Findings:
- **Without help from code, the minimum at arrival is met only where the lake is naturally full of fish** (Panoramic,
  the deep floor). A whole-lake scan (6 m grid, every view) found almost no spot where Mini Down or Mini Forward holds 3 fish
  at any moment. #193 fills a beam only after the boat has been still for a while (fish swim in at ≤ 1 m/s, 5–20 s).
- **To meet the minimum at arrival at every stop:** a step click places fish the way the opening spot already does
  (`seedBeamFish` in `fishBeam.js`, called from `Scene.jsx`). This is Base code, plus one signal from `goStep` in
  `index.jsx` (shared file). It needs Jason's go. With it, the stops can be picked for picture and screen position alone.
- Summer stop 3 moved from (−50, 8) to (−24, 6): the boat and fan are now right of the panel and clear of the card box
  (892–1252 px, top 200 px).
- Ice stop 3 (16, 11): in my run the phone showed the timber and the bottom, not black, but 0 fish after 20 s. Moved to (−18, 12).
- Mini Combo stop: both Combo beams reach 3 only over deep water (the 110 ft hole and the deep floor). There the boat sits at
  the top of the 3D view and the Combo fans run into the card box. At Forward AUTO (150 ft) the phone also shows a cut-off
  "ACCUPHY L" echo from the lakebed lockup; 90 ft keeps it off. With seeding (above), a Combo stop in the middle of the
  screen would work.
