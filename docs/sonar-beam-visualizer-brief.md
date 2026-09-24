# Sonar Beam Visualizer — Project Brief

> Source: Jason's Chat discussion "视觉设计项目讨论", pasted into Code on
> 2026-09-23. This is the first real experiment of the visual lab.

Interactive web page for Accuphy (accuphy.com) that shows the sonar beam coverage of
PingLive and PingLive Mini over a side-view lake scene. Marketing piece for the Shopify
site / landing pages; must work on desktop (mouse) and mobile (touch drag).

## The concept

- Side-view lake scene: roughly 1/3 above water (sky, shoreline), 2/3 below.
- The cursor becomes the device (PingLive or PingLive Mini) floating on the water surface.
  It only moves along the surface line (left/right).
- A fan-shaped beam extends from the device into the water. Inside the fan, the
  realistic underwater scene is replaced by what the sonar would show ("sonar flashlight").
- User can switch device and view mode with UI buttons.

## Beam geometry (confirmed by Jason)

| Device        | Mode         | Coverage | Shape in side view                                   |
|---------------|--------------|----------|------------------------------------------------------|
| PingLive      | Down View    | 135°     | Fan centered straight down, ±67.5°                   |
| PingLive      | Forward View | 135°     | Same fan, tilted forward                             |
| PingLive Mini | Down View    | 39°      | Fan centered straight down, ±19.5°                   |
| PingLive Mini | Forward View | 39°      | Fan tilted forward                                   |
| PingLive Mini | Combo View   | 78°      | Down 39° + Forward 39° joined into one contiguous fan |

PingLive also has a Panoramic (top-down) view — out of scope for v1.

## Sonar rendering approach (decided)

Hybrid: procedural real-time rendering, styled to match the real app.

- Scene is data: bottom contour, structure (wreck, rocks, stumps), weeds, fish (moving).
- Render the sonar image like real live sonar does: cast many thin rays from the fan apex,
  accumulate return strength along each ray, so objects cast acoustic shadows behind them.
- Two layers must stay pixel-aligned: realistic underwater art + "reflectivity map" that
  tells the engine what is hard bottom, structure, weeds, water.
- Add speckle/noise and range attenuation tuned against the reference recordings.
- Tech: single HTML page, WebGL (PixiJS or three.js), embeddable in Shopify.

## App color modes (from reference recordings in `reference/recordings/`)

> **Decision 2026-09-23:** build **yellow mode first**. The app offers many more
> colour modes; add them one by one later as extra colour ramps.

> **Correction 2026-09-23:** palette is an app-wide setting, not per device — the
> Mini forward-view weeds clip is in yellow mode. Measured palettes and
> per-element looks are in `docs/sonar-style.md`; clip catalog in
> `reference/clips.md`.

**Blue/red mode** (PingLive Mini clips): blue = water background; flat red band near the
bottom = lakebed; small red granules = fish and bait; very large red blob = big fish at
close range; tall vertical strands = weeds.

**Yellow mode** (PingLive clips): yellow bottom line = lakebed; wreck shows as structure;
small marks = fish and floating debris.

In the Mini Combo View clip the downward-pointing blue triangle is the Down View portion.

## Phases

1. Reference analysis: extract frames from recordings (ffmpeg), measure palettes, noise
   texture, how fish / bottom / structure / shadows look. Output: `docs/sonar-style.md`.
2. Geometry prototype with placeholder art: fans, device switching, cursor = device,
   touch drag.
3. Sonar rendering engine, tuned against the reference frames.
4. Final art (AI-generated, in layers: sky+shore, surface, underwater far, bottom,
   structure) plus matching reflectivity map.
5. Performance, mobile, Shopify embed.

## Still to provide (updated 2026-09-23)

- **Recordings: DONE.** 15 clips copied from Jason's Drive into
  `reference/recordings/` (see `reference/README.md` for the manifest).
- **Product images: partial.** `reference/product-images/` has transparent
  PNGs, but neither is a clean *side-view* cutout: the PingLive Mini one is a
  3/4 front view bundled with Router One; the PingLive one is a photo on its
  shaft mount. A clean side-view cutout of each device (or a decision to just
  use a stylised silhouette) is still needed for the cursor.
- **Max range / depth: answered 2026-09-23.** *Range* = horizontal distance,
  *depth range* = vertical. **PL (PingLive): 240 ft range and 240 ft depth.**
  **PLM (PingLive Mini): 200 ft.** Both are user-adjustable in the app to suit
  the lake/river, so the visualiser gets a display-range control (like the
  app's −/+), with the max clamped per device. Store these as data, not
  constants in shaders.

## How it maps onto this lab

- Lives as `src/experiments/<date>-sonar-beam/` (React + Vite). WebGL library
  (PixiJS or three.js) is added per decision #3.
- Final deliverable must still be a single embeddable HTML page for Shopify —
  `npm run build` output is what gets embedded.
