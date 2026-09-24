# Backlog — Sonar Beam Visualizer (kept current every round)

Jason 2026-09-24: "别把之前说过的任务丢了" — every promised task lives here until
it is done. ✅ done · 🔧 in progress · ⬜ open.

## Sonar screen (Phase 4)
- ⬜ Fish echoes should look like the app: arcs / bright blobs, not dots
- ⬜ Surface clutter streak near the apex (see `docs/sonar-style.md`)
- ⬜ Combo (PLM) as two panels like the app
- ✅ Forward View screen: apex ~20 % from the left, like the recordings
- ⬜ Range/depth scale numbers and the rest of the app chrome — after studying
  the app's playback mode (Android APK in an emulator, decision #10)
- ⬜ More colour modes (blue/red first)

## 3D lake (Phase 3 polish)
- ⬜ Tree bark / timber texture quality (currently flat vertex colour + speckle)
- ⬜ Boat hull / deck material quality (metal flake, carpet), outboard decals
- ✅ Beam footprint rim on the bottom
- ✅ Wreck +30 % (≈10 m) with cabin/windows/mast after the app imaging
- ✅ PL Panoramic clips studied (`sonar-style.md` §3b); screen now opens upward from a bottom apex
- ⬜ Panoramic screen: bottom texture fill, radial streaks, elongated fish streaks
- ⬜ Water: wake / ripple from the dragged boat (fluid trick from `docs/research.md`)
- ⬜ Fish glow inside the beam: tune so "fish enters beam → lights up" is obvious

## Experience (the three-step guide)
- ⬜ Step 1 "this is the beam" / Step 2 "this is the screen" / Step 3 "which mode when"
- ⬜ Fixed-camera framing per mode; mobile portrait layout
- ⬜ Device side-view cutouts (or stylised silhouettes) — still owed by Jason

## Engineering
- ⬜ Mobile performance pass (target 60 fps mid iPhone); dpr cap, instancing check
- 🔧 React 19 + R3F `refCleanup` console error on unmount (benign) — StrictMode removed 2026-09-24 (its double mount duplicated GL resources); watch whether the error persists
- ⬜ Single-file build + Cloudflare Pages/Vercel hosting + Shopify Custom Liquid iframe
