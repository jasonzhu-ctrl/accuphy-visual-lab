# Fish-in-the-beam test scripts (#193), copied from a scratchpad on 2026-10-31

They were written by the 冰钓 chat's twin and used for the #193 test version (5764b06). Not polished; they work as they are.

- `matrix.mjs <outDir> '<cases json>'`: drives the real desktop page (1400×900, dev server on port 5173, signup gate pre-skipped). Per case it opens the view, then moves the boat to each spot and counts fish inside the beam(s) every second. Output line per case: `at, first0 (fish at start), first (s to first fish), toMin (s to the minimum), end (count at the end), visit (distinct fish seen), range, mode`. `a.json` and `b.json` are the case lists used (spots: opening 12 s, then (6,-6), (18,18), (-24,-45), (30,-6), (42,-6) at 30 s each). Run `a` and `b` one after the other, not together (two browsers at once made some cases fail). `fmt.py <log>` prints the lines compactly.
- `beam-sim.mjs`: Node only, no browser. Simulates the beam rules over many positions (the "60 s to minimum" percentages in #193).
- `combo-survey.mjs`: Node, which spots have fish in the Combo beams.
- `grid.mjs <outDir>`: sonar-qa style grid, fish rules on and off, screenshots and console errors.
- `open.mjs`, `ph.mjs`: opening-spot and phone checks.
- `rerun-2026-10-31/`: logs of the full desktop rerun after the last tightening (7 of 7 views; three views were rerun alone). Numbers are in `docs/handover/chats/ice-lake.md`.

How they find playwright: `createRequire('/Users/jason_zhujishuaihotmail.com/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/package.json')` and Google Chrome at `/Applications/Google Chrome.app`. If that npx cache is gone, run `npx playwright --version` once to refill it, or change the path to your own `playwright-core`.

Added 2026-10-31 for the 10 s round (#198):
- `matrix2.mjs`: `matrix.mjs` with `PORT=` (serve a scratch copy of a commit, so another chat's file edits cannot reload the page mid-run) and the view re-selected at every spot. That re-selection fixes the Combo column: in the old run the page had reloaded (a Vite full reload from a file edit in this shared folder), which brought it back to Forward at 80 ft. `all.json` = the 7 lake views plus ice Live Ice and ice Forward.
- `grid2.mjs`: `grid.mjs` with `PORT=`.
- `beam-sim.mjs` now prints the share within 10 / 15 / 30 s; `SPOTS='[[x,z],…]'` and `VIEWS=PLM-down,…` narrow it.
- `rerun-2026-10-31-10s/`: browser and Node results before (main 8637499) and after, and the sonar-qa grid logs.
