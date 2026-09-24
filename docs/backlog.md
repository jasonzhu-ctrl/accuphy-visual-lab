# Backlog — Sonar Beam Visualizer (kept current every round)

Jason 2026-09-24: "别把之前说过的任务丢了" — every promised task lives here until
it is done. ✅ done · 🔧 in progress · ⬜ open.

## Sonar screen (Phase 4)
- ✅ Range vs depth-range behaviour measured on the app (§6.9) and mirrored: PL Forward has its own Depth slider (vertical scale only), near-field rays sized in metres, structure echoes ×0.8 (case-2 verdict)
- ✅ Contrast + Noise Reject controls (Tune row) mapped to the app's tone curve per Jason's tuning strategy (`sonar-style.md` §6.5); defaults gain 57 / contrast 40 / noise 30 after the confirmed ideal picture (decision #28)
- ⬜ Side-by-side check of the engine's PLM Forward against the confirmed frame (`ideal-picture/5-FINAL-*.jpg`): bottom band ✓, black background ✓; still to compare fish-dash size/brightness and how standing timber reads next to the piling reference
- ⬜ TVG control (range-dependent gain) — Jason: higher = crisper far targets, a little more noise
- ✅ **Sonar screen rework** (2026-09-24, after the tablet study): screen box per view fills the display with independent axes (`screenLayout` in `SonarScreen.jsx`), dark-red noise floor with radial streaks (mottled for PLM Down), thick bottom band with tail + faint second echo, near-apex rays, PLM Forward apex top-left, PLM Down stretched to the screen corners, Combo two-panel with the grey diagonal. Root cause of the old "small fan in black" picture: the screen-box code had been dropped by mistake in commit 4952966 (phone restyle)
- 🔧 Fish echoes: physics model per `sonar-style.md` §6.8 — constant beam-angle blur along the arc (far fish = tangential dash of beam width), constant pulse radially, brightness from angular fill (head-on dim, broadside full); near fish show their own length/heading (sonar-pass body kept at 0.9). Next: compare against `reference/app-study/fish-near-vs-far/`; flicker for head-on fish; school stacking
- ✅ Surface clutter streak under the transducer (side views)
- ✅ Combo (PLM): two-panel layout — Down panel lower-left (R/3, stretched ×2), Forward upper-right, shared apex at x≈20 %, grey double diagonal to x≈0.8 at the bottom
- ✅ Forward View screen: apex ~20 % from the left, like the recordings
- ✅ App chrome on the phone inset (`SonarChrome.jsx`, 2026-09-24): italic rulers on three edges from the live screen box, live depth readout (water depth under the transducer), temp/voltage, wordmark + `1440p (QHD)` tag, range −/+, pause, gain −/+, back, ⋯, PL-Forward depth-range control, Combo variant. Decorative buttons (the left panel is the control) — making them work is a later nicety
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
- ✅ The sonar picture's own chrome — done (see Sonar screen section)

## Experience (the three-step guide)
- ✅ Three-step guide strip with presets (device/mode/range/boat position) — copy is a first draft for Jason to edit
- ✅ Mobile portrait layout: phone above the control panel, guide strip hidden; fixed camera kept
- ⬜ Device side-view cutouts (or stylised silhouettes) — still owed by Jason

## Engineering
- ✅ Dev helper `?bigphone` (DEV only): the phone frame fills the viewport so the sonar picture can be inspected in screenshots
- 🔧 Mobile performance: dpr capped at 1.5, high-performance GL context; real-device fps check still to do
- ✅ React 19 + R3F `refCleanup` console error — gone since StrictMode was removed (no new occurrences in this session's checks)
- ⬜ **Local for now** (Jason 2026-09-24): `npm run build` + `npm run preview` on this Mac. Public hosting + Shopify embed stay in the plan for later, unchanged
