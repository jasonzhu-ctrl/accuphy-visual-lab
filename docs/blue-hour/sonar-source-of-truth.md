# Sonar source of truth

Authority: `accuphy-marketing/accuphy-visual-lab` at BASE_SHA `48f15ccc990fdb69f9edd1a04d14257d100da610`. Public demo bundles are comparison references, never imported source. All paths below are repository relative; lake means `src/experiments/2026-09-23-sonar-lake-3d/`.

| Concern | Actual source / input | Treatment |
|---|---|---|
| Device limits, modes, foot conversion | `src/experiments/2026-09-23-sonar-beam/devices.js`, DEVICES / FT / fanSpans | Unchanged; 1 ft = 0.3048 m |
| Beam frames and geometry | `src/experiments/2026-09-23-beam-shapes-3d/wedge.js`, wedgeSpecs / wedgeGeometry | Unchanged |
| Final view box, AUTO depth, ranges | lake `index.jsx`, autoDepthFt / specs / screenLayout call | Original functions and defaults retained |
| Sonar display projection | lake `SonarScreen.jsx`, screenLayout | Same function; optional host-provided original logical display aspect and flat device pose only |
| Echo, strips, back faces, fish image | lake `SonarScreen.jsx`, `sonarShader.js`, `lakeMaterial.js` | Original passes, calibration, sampling and LUTs |
| Marks, terrain sampling | lake `sonarMarks.js`, bakeTerrain / computeMarks | Unchanged |
| Color | lake `colormaps.js` | Unchanged; no blue-hour grade on sonar |
| Terrain and obstacles | lake `terrain.js`, `obstacles.js`, `vegetation.js`, `rocks.js`, `wreck.js`, `logo.js` | Original world; no added sonar targets |
| Population and behavior | lake `fish.js`, makePopulation / fishPose / stepBehaviours | 272 fish in audited normal initialization; unchanged source |
| Fish bodies and echo size | lake `fishGeometry.js`; fish.js drawnLen; Scene FishGroup; lakeMaterial fish pass | Existing species scale compensation preserved |
| Boat / transducer | lake `boat.js` TRANSDUCER_OFFSET; Scene Boat interpolation | One state.ref boat/target; translation only; no new yaw claim |
| Water | lake `lakeFFT.js`, Scene Water | FFT unchanged; optional display-only reflection/reveal branch |
| UI readings | lake `SonarChrome.jsx` and existing parent props | 21.8 C and 12.6 V are example constants, explicitly disclosed; depth comes from original terrain |

Coordinates are metres, y upward, water surface y=0, depth positive downward in display. Boat state has world x/z; apex is the original fixed transducer offset plus the boat group's translation. No arbitrary heading transform is introduced.

Original defaults: Forward; range 80 ft; initial depth range 70 ft with AUTO enabled; gain .40, contrast .40 and noise .30. AUTO may subsequently change depth according to the original 200 ms check and 1.5 s shallowing hysteresis. The Hero chooses the original Mini-only configuration; it does not change its calibration. Query `?depth=70` in the regression fixture disables AUTO through the existing development input, and is not a production default.

Randomness: fish.js owns a seeded LCG starting at 11 for population construction; runtime behavior also uses Math.random. Production randomness is unchanged. Browser tests inject a deterministic random stream into the real fish callbacks and a separate stream for framework UUID allocation. This is a test input, not a replacement simulation.

Content classification: the lake and all displayed sonar output are **Interactive simulation**. No device connection or live measurement is present. Reference recordings informed the repository historically but are not replayed as if driven by the moving boat. No Connected state, map panel, new target symbols or generated echoes were added.

Fingerprints: build `manifest.json` records source commit, dirty flag, core baseline and SHA256 hashes of protected JS sources and output assets. Offline `source-final/before.json` and `after.json` record dependency lock, geometry, terrain texture, fish state and source hashes. See baseline-and-regression.md for evidence and limits.
