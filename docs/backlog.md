# Backlog — Sonar Beam Visualizer (kept current every round)

Jason 2026-09-24: "别把之前说过的任务丢了" — every promised task lives here until
it is done. ✅ done · 🔧 in progress · ⬜ open.

## Sonar screen (Phase 4)
- 🔧 **Sonar screen rework** (queued by Jason 2026-09-24 until the data was chosen; parked patch `docs/wip/sonar-screen-rework.patch`): fill the screen per axis (range × depth range, apex position per view), dark-red noise floor inside the fan, radial streaks, thick bottom band with tail, near-apex rays — all per `sonar-style.md` §6
- 🔧 Fish echoes: measured on the real app 2026-09-24 (`sonar-style.md` §6.3): a fish is a **horizontal dash** 3–5× wider than tall, orange with a yellow-white core at the transducer-facing end, soft edges; schools stack into bright bars. Next: rebuild the mark this way (Jason: fish are the most important thing)
- ✅ Surface clutter streak under the transducer (side views)
- ⬜ Combo (PLM): rebuild as the app's two-panel layout — Down panel lower-left, Forward upper-right, shared apex at x≈20 %, grey double diagonal (`app-chrome.md` §6)
- ✅ Forward View screen: apex ~20 % from the left, like the recordings
- ⬜ Range/depth scale numbers and the rest of the app chrome — spec now complete in `app-chrome.md`; build it on the phone inset
- ✅ App tone curve adopted (log compression + gain/dynamic-range window → LUT)
- ✅ All 11 app colour maps available on the phone screen (amber default); gain slider

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
- ✅ App playback study done on the real V10 tablet (emulator route stays blocked by GLES 3.2): all PL and PLM views captured, findings in `sonar-style.md` §6 + `app-chrome.md`
- ⬜ App study leftovers: every colour map on one frame, range stepping, imperial units (tablet route, cheap)

## Brand / UI
- ✅ Control panel + guide cards: dark premium tech style (DJI / Insta360 / Anker reference) — near-black glass, hairline borders, grey caps labels, one blue accent, sliding segmented control (Jason 2026-09-24: white did not fit, pills looked "AI")
- ✅ Animated "Drag the boat" hint that follows the boat until the first drag
- ✅ Phone frame turned in 3D (perspective + rotateY/rotateX); the GL picture uses the same maths with per-vertex w, so it stays perspective-correct inside the display
- 🔧 Phone realism (Jason: keep improving): now true Pro Max proportions, thin uniform bezel, brushed titanium band, side/action/power buttons, glass reflection, Dynamic Island — next: antenna lines, camera-side depth, screen-off reflections
- ✅ Control panel in Accuphy brand (white wordmark, Instrument Sans, Eurostile Heavy headline, brand blue #0d8fdb)
- ✅ Sonar screen inside an iPhone Pro Max frame (landscape, natural-titanium ring, dynamic island); the GL picture is drawn into the DOM display hole
- ⬜ The sonar picture's own chrome (scales, numbers, depth readout, buttons) — build from `app-chrome.md`

## Experience (the three-step guide)
- ✅ Three-step guide strip with presets (device/mode/range/boat position) — copy is a first draft for Jason to edit
- ✅ Mobile portrait layout: phone above the control panel, guide strip hidden; fixed camera kept
- ⬜ Device side-view cutouts (or stylised silhouettes) — still owed by Jason

## Engineering
- 🔧 Mobile performance: dpr capped at 1.5, high-performance GL context; real-device fps check still to do
- ✅ React 19 + R3F `refCleanup` console error — gone since StrictMode was removed (no new occurrences in this session's checks)
- ⬜ **Local for now** (Jason 2026-09-24): `npm run build` + `npm run preview` on this Mac. Public hosting + Shopify embed stay in the plan for later, unchanged
