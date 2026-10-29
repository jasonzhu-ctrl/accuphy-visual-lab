# Blue Hour change contract — 2026-10-29

BASE_SHA: 48f15ccc990fdb69f9edd1a04d14257d100da610. Branch: codex/blue-hour-lake.
User confirmed main baseline and Mini Panoramic limitation notice. This contract precedes implementation.

Protected: devices.js, wedge.js, terrain.js, obstacles.js, fish.js, fishGeometry.js, sonarShader.js, sonarMarks.js, colormaps.js, lakeMaterial.js and all calibration/default equations in index.jsx. No semantic changes authorized.

Minimal shared-file adaptations:
- index.jsx: optional presentation component receives existing state/control functions; ordinary lake/ice remain original. No copied engine, altered defaults or replacement state.
- Scene.jsx: optional display-camera/environment branches and pointer arbitration; same boat interpolation, transducer offset and fish callbacks. Scene additions use SONAR_HIDE_LAYER. No sonar camera changes.
- SonarScreen.jsx: optional flat device pose for DOM/GL alignment only. Original effective 2.08 display aspect retained, letterboxed inside iPad screen. Sampling, uniforms and intermediate RTs unchanged.

Compare exact state/configuration/hash first. GPU comparison uses identical browser/GPU, seeded Math.random, controlled clock and fixed output size. No tolerance established yet: until repeated baseline captures establish noise, GPU equivalence is NOT TESTED and deployment is gated. Never raise thresholds after seeing candidate differences.

Rollback: revert Blue Hour commits; normal lake/ice behavior uses default presentation. Theme rollback restores backed-up US template and prior referenced resources only. No main merge or production-domain deployment.

Known source limitations: Mini Panoramic unavailable (devices.js, decision 178); simulation != measured sonar. Reference folder is sparse-excluded locally. Historical reports are evidence pointers, not current test results. Latest external brand document not yet verified.

Pause redraw adaptation (before implementation): Scene.jsx's Fish/FishGroup callbacks will return only when the optional Blue Hour host is suspended. SceneLifecycle can then redraw a resized canvas with delta=0 using the existing sonar passes without consuming fish RNG or advancing swim attributes. Normal lake/ice and active Hero callbacks remain unchanged. Test: exact population, instance matrices and swim attributes before/after paused controls/resize, then monotonic resume time. Rollback: remove the two Hero-only guards and restore allowPausedDraw=false; do not change fish.js or expectations.

Native viewport adaptation (before implementation): SonarScreen currently derives the Combo display box from integer offsetWidth/offsetHeight, rather than its nominal 2.08 ratio. New bezel dimensions therefore changed Combo even with identical state. The host will measure an inert offscreen copy of the ORIGINAL frame size rule and 2.6% insets, and pass that original aspect as an optional layout input. New physical display letterboxes at that aspect. All ordinary routes keep their existing DOM-derived input; no sonar formula changes. Test both original repeatability and candidate PNGs with the same window size. Rollback removes the optional input and hidden measurement.
