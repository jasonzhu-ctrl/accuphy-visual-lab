# Baseline and regression

BASE_SHA: `48f15ccc990fdb69f9edd1a04d14257d100da610`. The remote main was rechecked and still matched. Original checkout HEAD `3ede56b01b6082f9a0a8797990fafc4f40e5e37c` was left intact; this branch is based on main, not that newer local experimental branch. The original baseline checkout is detached at BASE_SHA.

Before editing, the required repository guidance, current decision history, build setup, local QA skills and actual device/scene implementation were read. The reference registration and minimal-change contract were committed as `29af41f92c9b8ae0e3d3d3f8abd885d27b5902eb` before implementation. Historical ownership/handoff rules are noted; the user's current explicit scope authorizes this isolated presentation branch, not other team changes.

## Results and scope

| Check | Result | Evidence / limitations |
|---|---|---|
| Offline source configuration/geometry | PASS | 108 cases; no data differences; repeat deterministic; dependency lock identical |
| Mini browser lockstep, fixed SwiftShader | PASS | 6 spots × Forward/Down/Combo = 18; baseline A, baseline B and Hero all exactly equal for model state, fish GPU inputs and 832×400 PNG |
| Existing lake all-device grid, default Windows graphics backend | PASS state/GPU inputs; FAIL strict PNG comparison | 36/36 state and fish inputs equal; 31/36 three-way PNG matches; backend repeat noise remains, no tolerance applied |
| Original fish safety simulation | PASS | 15 simulated minutes; zero structure/bottom/surface violations; minimum belly gap 0.41 m |
| Pause / resize / resume / reduced motion | PASS local Chrome fixture | Frozen fish and instance attributes unchanged; time resumes without elapsed hidden interval; reduced-motion Step 2 reaches (22,8) |
| Six responsive viewports | PASS recorded interaction smoke tests | World position changes, current mode retained on Step 3, no horizontal overflow/pageerror; not real touchscreen QA |
| Ice history and long-running GPU memory stability | NOT TESTED | Existing implementation remains, not covered by the Hero fixture |
| Real iPad/Safari/midrange phone | NOT TESTED | Desktop automation does not replace hardware |

Offline data digest: `f0f0a0f286510c0425bbb07f628790d073eea089f8b579100bd46f07d49ce893`. Offline checks do not execute the browser echo pipeline; they are reported separately from GPU evidence.

## Reproduction

Run baseline Vite on port 5181 and candidate on 5180. Use the recorded dependency lock. Test scripts are under `scripts/dev/blue-hour-*.cjs` and `.mjs`.

```
node scripts/dev/blue-hour-source-baseline.mjs --base 48f15ccc990fdb69f9edd1a04d14257d100da610 --out <output>
node scripts/dev/blue-hour-lockstep.cjs <output> --all-views
```

For the exact Mini pixel fixture, set `BLUE_HOUR_GPU=swiftshader` then run the lockstep script without `--all-views`. This selects the same explicit Chrome ANGLE/SwiftShader backend for both versions; it does not change production graphics, shader logic, sampling or acceptance tolerances.

Browser inputs: 1440×900; `?depth=70` disables original AUTO via its existing dev input; range 80 ft until original mode rules apply; original transducer pose; boat/target set to each QA spot; 30 real R3F advances of 1/60 second per case, continuous clock through 9 seconds for Mini. Cases: default (-6,4), shelf (-40,-5), hump (22,8), deep (4,-40), lockup (-14,-52.5), dropoff (-3,-14). Test code calls the original renderer's `__sonarFlat`, does not draw a comparison sonar.

Population LCG is untouched. Runtime Math.random supplied to actual fish callbacks is seeded in the browser fixture, isolated from framework UUID allocation. The test waits for React/ResizeObserver commit before advancing the first simulation frame. Earlier bootstrapping pumped RAF during asset loading and produced a one-frame difference in behavior start times; those invalid-startup records are retained as diagnostics, not passing evidence.

No GPU tolerance was loosened. Initial 12-case runs had occasional 18-pixel differences (maximum channel delta 2) even between baseline repeats. The extended default-backend run also retained intermittent differences. All exposed scalar/vector sonar uniforms, fish state, matrices and swim attributes were checked when diagnosing them. Fixed software-backend Mini replay then passed all 18 cases exactly. Do not claim this proves pixel identity on every graphics driver.

The Combo adapter initially failed because offsetWidth/offsetHeight rounding changed when the display container changed. `NativeSonarViewport` now measures the original frame rule and supplies the same logical aspect to the original screenLayout function; the visible device letterboxes that image. The failed pre-adapter output is retained.

## Evidence retention

Raw local evidence root: `D:/shopify/output/blue-hour/`. `baseline/` has original desktop/mobile recordings; `source-final/` has complete CPU snapshots; `mini-software/` has all 54 PNGs and detailed model/uniform/GPU records; `all-views/` has the 108 original-route comparison frames; `interaction-final/` contains the six video runs. Smaller portable summaries and selected visual evidence are included under this document's `evidence/` directory.

Old directories (`grid`, `grid-r2`, `mini-final`, etc.) are not overwritten. They show test-startup problems, integer-aspect mismatch, or backend noise. They are not silently substituted for baseline expectations. Final source is identified by the clean build manifest and Git history.
