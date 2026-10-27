# BF ad v2 (PingLive on the lake, 15 s, 9:16) — stills stage (2026-10-26)

Brief: `docs/2026-10-26-ad-v2-pinglive-brief.md`. Stills board: `docs/2026-10-26-ad-v2-stills.jpg`.

- `v2bg.mjs <out>`: renders the backgrounds from the dev server at 1080×1920. The 3D lake comes from `__lakeSnap()`
  with the dev hooks `__sonarState.camOverride` / `fanOpen` / `adClean` (Scene.jsx, dev only); the sonar comes flat
  from `__sonarFlat(2600, 1250)`.
- The backgrounds are then graded (lake ×1.2 brighter, a little cooler) and the sonar is cropped to portrait. This is a
  PIL step, kept inline in the session.
- `overlay2.html` + `stills.mjs <dir> <out>`: the type over a background. Eurostile Heavy number, brand-blue rule, one
  Instrument Sans line, the small wordmark top left at y 262. Run them with the fonts in `<dir>/fonts` and the logo as
  `<dir>/logo.png`.
