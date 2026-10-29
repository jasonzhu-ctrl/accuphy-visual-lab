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
