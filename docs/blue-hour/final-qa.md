# Blue Hour Lake — delivery status

Overall: **BLOCKED for final Shopify acceptance**. This is an implemented, runnable review build, not a declaration that all v7 requirements passed.

| Area | Status | Evidence |
|---|---|---|
| Reference + source baseline | PASS | Reference contract, source map, BASE_SHA and hashes |
| Single original sonar pipeline | PASS for tested Mini fixtures | 18 exact software-rendered comparisons; protected data modules unchanged |
| All-device original-route state | PASS | 36 state / fish GPU input comparisons |
| All-device hardware PNG equality | FAIL strict comparison | 31/36 three-way matches; baseline repeat differences retained |
| Real boat movement | PASS local fixture | Before/during/arrival world coordinates in six recorded viewport runs |
| Mini Panoramic disclosure | PASS | Step 3 keeps current mode/target; no fabricated Mini Panoramic |
| Landscape iPad sizing | PASS layout construction | Body and screen ratios separate; original sonar viewport letterboxed |
| Visual match to approved direction | NOT TESTED user acceptance | Dusk backdrop and composition implemented; original low-poly boat/terrain retained; not a pixel-perfect recreation |
| Native wheel scroll | PASS standalone Chrome | Canvas, Step, sonar display and control surfaces scroll normally |
| Touchscreen, Safari, browser pinch zoom | NOT TESTED | No real hardware session available |
| Pause, resize, resume, reduced motion | PASS local fixture | Frozen state equality and correct Step 2 target |
| Section load/unload | PASS synthetic host | Canvas 1 → 0 → 1; no page errors; real theme editor still NOT TESTED |
| Liquid package check | PASS | Shopify CLI theme check returned [] on generated Section/assets package |
| Context loss / no JavaScript | PASS isolated local retry | Error status, disabled Step, working product link and native scroll; static HTML remains without JS |
| Performance on real mobile / long-session leaks | NOT TESTED | Local timing evidence is not a mobile FPS claim |
| Latest complete brand manual | BLOCKED | Supplied Logo matches repo exactly; folder contains no manual |
| Private HTTPS publication | PASS tested fixtures | Owner-private deployment; six online viewport runs + refresh; deployed asset hashes match; no broken images/errors; see delivery.md |
| Shopify save | BLOCKED / deferred | User chose code + private preview first; CLI authentication missing; zero files uploaded |

One context-loss test attempted while software GPU replay was running found the canvas already removed before fault injection. It is retained as a failed attempt; isolated retry successfully verified the explicit fallback. Do not infer resilience under all memory-pressure conditions from the retry.

Six viewports: 1920×1080, 1440×900, 1024×768, 768×1024, 390×844, 375×812. Recorded results had no page errors and no horizontal overflow. These are desktop browser sizes, not six physical devices. Screenshots alone are not used as movement/scroll proof.

Read baseline-and-regression.md for tested input conditions and known differences. Read integration-and-deployment.md for the exact theme whitelist, backup and rollback procedure. The HTTPS preview and committed artifact identifiers are recorded in delivery.md. Final Shopify acceptance remains BLOCKED until the deferred upload and post-upload checks pass.

Performance diagnostic: local headless Chrome on RTX 5070 / ANGLE D3D11. Baseline Vite development route first contentful paint 556 ms, controls ready 18,178 ms; pre-delivery built Hero first contentful paint 204 ms, controls ready 18,112 ms. These are different packaging modes and a warm local network, not an apples-to-apples speed claim. Both sampled RAF medians were 8.3 ms and p95 8.4 ms; RAF scheduling is not GPU frame duration or proven FPS. Startup is still slow and remains an optimization item. Real mobile timing, long-session memory growth, and a defensible real-device FPS target are NOT TESTED. Raw evidence is under evidence/performance-*.json.

Delivery-only Logo repair: source commit 6976055 changes the build script to embed the exact tracked PNG instead of relying on `/brand/logo/` at the host root. It changes no renderer, sonar state or formulas. Asset SHA is now in the manifest. The earlier standalone could return HTML at that path; the final online image-completion check covers this packaging defect.
