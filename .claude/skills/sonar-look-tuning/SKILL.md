---
name: sonar-look-tuning
description: Method for changing how the Accuphy Lab sonar picture looks (brightness, structure, wrecks, texture, Panoramic shading) so it matches the real Accuphy app — use whenever Jason says the sonar picture looks wrong, too bright, not like the app, or asks to tune a view.
---

# Tuning the sonar look

1. **Find the reference.** Real app frames: `reference/app-study/**` (tablet recordings, early Panoramic clips in
   `panoramic-structure/`). Note their gain/depth/range; compare only like for like.
2. **Reproduce at the same conditions.** Same depth scale and range (`?dev` sliders, `?wrecklift=` or a dev flag
   of the same kind). If the scene cannot match (e.g. 40 m vs 10 m), say how much of the gap is physics.
3. **Measure first.** `__sonarHist(10)` on the affected scene AND the calibrated ones (Mini shelf `?boat=-40,-5`,
   default view, a structure scene). Targets: bottom/fish ~6–7 % white, orange-weighted; structure ~13–14 % white.
4. **Find the mechanism, not a fudge.** Read the relevant shader branch (`sonarShader.js`: vertical slab loop or the
   Panoramic plan-view branch). Past root causes: narrow pulses drew wrecks as line drawings (#63), summed rows burnt
   flat bottoms white (#66), the footprint's highest tap lit rings round rocks (#67), per-pixel row sampling
   made dust (#62).
5. **Temporary knobs.** Add a uniform fed from `window.__…` (mark it `TEMP`), sweep 3–5 settings, snapshot each scene,
   tile with PIL (Chinese labels via `/System/Library/Fonts/Hiragino Sans GB.ttc` for Jason).
6. **Check side effects** on timber, bottom, fish, the Mini shelf and Panoramic before choosing; reject settings
   that break a calibrated scene (the 4–10 m soft-cap ramp was rejected this way).
7. **Bake and clean:** constants in code with a comment quoting Jason, remove every knob (`grep -rn TEMP`), rerun the
   `sonar-qa` skill, write the decision with the before/after numbers, send Jason an app-vs-before-vs-after image.
