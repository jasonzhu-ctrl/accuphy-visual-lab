# Backlog — Sonar Beam Visualizer (kept current every round)

Jason 2026-09-24: "别把之前说过的任务丢了" — every promised task lives here until
it is done. ✅ done · 🔧 in progress · ⬜ open.

## Sonar screen (Phase 4)
- 🔧 Fish echoes: now marks elongated ALONG the beam with a bright core (from the PLM Combo clip); fish compressed along their body in the sonar pass so marks are narrow in angle. Still to tune against the recordings / good LiveScope clips (Jason: fish are the most important thing)
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
- 🔧 Emulator study: Jason OK'd the downloads 2026-09-24 — JDK 17 installed, APK downloaded (`~/android-sdk/dl/`), Android SDK + arm64 system image installing
- ⬜ App playback procedure (Jason 2026-09-24): after installing the APK, copy the `.sonar` files from `reference/sonar-data/` into the device's `Files/Accuphy Sonar App/Sonar Data`, open **Playback** in the app, then in a view use the **⋯ settings** to find the data and change settings while watching how the picture reacts

## Brand / UI
- ✅ Control panel + guide cards: dark premium tech style (DJI / Insta360 / Anker reference) — near-black glass, hairline borders, grey caps labels, one blue accent, sliding segmented control (Jason 2026-09-24: white did not fit, pills looked "AI")
- ✅ Animated "Drag the boat" hint that follows the boat until the first drag
- ✅ Phone frame turned in 3D (perspective + rotateY/rotateX); the GL picture uses the same maths with per-vertex w, so it stays perspective-correct inside the display
- 🔧 Phone realism (Jason: keep improving): now true Pro Max proportions, thin uniform bezel, brushed titanium band, side/action/power buttons, glass reflection, Dynamic Island — next: antenna lines, camera-side depth, screen-off reflections
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
- ⬜ **Local for now** (Jason 2026-09-24): `npm run build` + `npm run preview` on this Mac. Public hosting + Shopify embed stay in the plan for later, unchanged
