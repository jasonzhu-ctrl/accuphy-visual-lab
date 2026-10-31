# LiveScope / app comparison scripts (LiveScope chat, 2026-10-24 and 2026-10-31)

Like-for-like measurement of the Lab's sonar picture against the app's own recording (and, for the Forward view,
against the LiveScope frames in `reference/livescope/`). Read-only: they open the page, never change it.
Background and the numbers they produced: `docs/handover/chats/livescope.md`, `docs/livescope-study.md`, `docs/sonar-style.md` §10.

| File | What it does |
|---|---|
| `burst.mjs` | Headless Chromium (Metal GPU) opens a URL, clicks view buttons, saves `n` frames of `window.__sonarFlat(2048, 1024)` at an interval. |
| `measure.py` | Wreck scene, app burst vs Lab burst, same boxes and colour classes: hull classes, core CoV, rim brightness by depth, bottom-band thickness, outline fibres, ping-to-ping change, water box. |
| `grain.py` | Which way the speckle's long axis runs relative to the ray (0° along, 90° across). The test behind decision #148. |
| `white.mjs` | White (top LUT decile) and black share of seven named scenes (PL Forward, PLM Combo ×2, PL Panoramic ×2, ice Forward, phone Forward) plus their flat PNGs. |

## Set up (scratch folder, nothing goes into the repo)
```
mkdir <scratch>/pw && cd <scratch>/pw && npm init -y && npm i playwright-core@1.63.0
export PW_DIR=<scratch>/pw          # the scripts find playwright-core there
```
Browsers are the cached ones in `~/Library/Caches/ms-playwright` (chromium-1243, webkit-2359). Python needs numpy, pillow, scipy
(present on this Mac for `python3`). Dev server: `npm run dev` (port 5173; if another chat holds it, the preview tool picks 5174).

## Re-measure the wreck against the app (the 10-31 run)
```
node scripts/dev/livescope/burst.mjs <out>/wreck "http://localhost:5173/?boat=-6,4&study=wreck&gain=0.4&contrast=0.47&noise=0.25&depth=80#2026-09-23-sonar-lake-3d" Down 20 1000
python3 -I scripts/dev/livescope/measure.py <out>/wreck
python3 -I scripts/dev/livescope/grain.py <out>/wreck
node scripts/dev/livescope/white.mjs <out>/white http://localhost:5173
```
The app side is `reference/vivo-bursts-2026-10-23/pl-down/d00–d19.png` (local only, gitignored). Settings in the URL are the
recording's: 80 ft, gain 40, contrast 47, noise reject 25. `__sonarFlat` is cropped (532,0,1516,1024) and resized to 2256×2220 to
match the app crop (124,125)+2256×2220, scale 28.2 px/ft across and 27.75 px/ft down, apex at x = 1128.

## Gotchas
- `window.__sonarTune` must be unset (every knob 1) in any run you compare.
- Since #155 the study wreck is the workboat with a wheelhouse: the hull box and the "water" box of 10-24 no longer compare
  like for like (see the note). Use a box with no UI text (the app prints 34.4 ft, 71.6 °F, 13.2 V top left) and no fish.
- `white.mjs` stores `accuphy_sonar_signup_v1=1` so the Combo picks are not stopped by the subscribe lock (#191).
- On the phone layout the view buttons are hidden: tap the home tiles ("Forward View" …) or click through the DOM.
- The browser pane must be showing for a 3D page to animate in it; headless Playwright has no such limit.
