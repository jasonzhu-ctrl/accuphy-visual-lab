# Backlog — Sonar Beam Visualizer (kept current every round)

Jason 2026-09-24: "别把之前说过的任务丢了" — every promised task lives here until
it is done. ✅ done · 🔧 in progress · ⬜ open.

## Sonar screen (Phase 4)
- 🔧 Fish echoes as compact bright blobs (fish mask from the sonar pass) — tune against the recordings / LiveScope clips (Jason: fish are the most important thing)
- ✅ Surface clutter streak under the transducer (side views)
- ⬜ Combo (PLM): currently both fans share one apex in one frame (matches the blue/red Combo clip); the split two-panel layout of the yellow-mode clips can come with the app-chrome study
- ✅ Forward View screen: apex ~20 % from the left, like the recordings
- ⬜ Range/depth scale numbers and the rest of the app chrome — after studying
  the app's playback mode (Android APK in an emulator, decision #10)
- ⬜ More colour modes (blue/red first)

## 3D lake (Phase 3 polish)
- ✅ Bark striations on timber (procedural, in the lake shader)
- 🔧 Boat restyled to Ranger Z521R proportions (charcoal metal flake, red waterline stripe, rub rail, wraparound windshield, Power-Poles, jack plate) — next: metal-flake sparkle, decals
- ✅ Beam footprint rim on the bottom
- ✅ Wreck +30 % (≈10 m) with cabin/windows/mast after the app imaging
- ✅ PL Panoramic clips studied (`sonar-style.md` §3b); screen now opens upward from a bottom apex
- ⬜ Panoramic screen: bottom texture fill, radial streaks, elongated fish streaks
- ✅ Water: ripple rings spread from the boat while it moves (simple wake; the fluid-sim trick stays optional)
- ✅ Fish rim glow inside the beam (bright edge)

## Content
- ✅ Second, ~20 m, more complete wreck on the deep slope up-and-right
- ✅ Salmon / lake trout also up-and-right in the deep water
- ⬜ New APK for the emulator study: `AccuphySonar_20260901_2.0.0_beta_14.apk` — Dropbox link from Jason 2026-09-24 (see `reference/README.md`); download when the emulator is set up

## Brand / UI
- ✅ Control panel in Accuphy brand (white wordmark, Instrument Sans, Eurostile Heavy headline, brand blue #0d8fdb)
- ✅ Sonar screen inside an iPhone Pro Max frame (landscape, natural-titanium ring, dynamic island); the GL picture is drawn into the DOM display hole
- ⬜ The sonar picture's own chrome (scales, numbers) — untouched until the app playback study

## Experience (the three-step guide)
- ✅ Three-step guide strip with presets (device/mode/range/boat position) — copy is a first draft for Jason to edit
- ✅ Mobile portrait layout: phone above the control panel, guide strip hidden; fixed camera kept
- ⬜ Device side-view cutouts (or stylised silhouettes) — still owed by Jason

## Engineering
- 🔧 Mobile performance: dpr capped at 1.5, high-performance GL context; real-device fps check still to do
- ✅ React 19 + R3F `refCleanup` console error — gone since StrictMode was removed (no new occurrences in this session's checks)
- ⬜ Single-file build + Cloudflare Pages/Vercel hosting + Shopify Custom Liquid iframe
