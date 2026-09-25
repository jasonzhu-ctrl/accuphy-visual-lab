# Decisions — Accuphy Visual Lab

Numbered log. Newest at the bottom.

1. **2026-09-24** — Repo created as a standalone project separate from
   `accuphy-rma-portal`; plain HTML/CSS first, framework to be decided.

2. **2026-09-23** — Stack chosen for interactive design work: **Vite + React +
   Tailwind CSS 4 + Framer Motion** (plain JS, no backend). Replaces the
   "plain HTML first" placeholder from #1. Rationale: fast hot-reload for
   trying ideas, real interactivity/animation, and same React+Tailwind basis
   as the Partner Portal so approved designs can be ported without rewriting.
   Experiments now live at `src/experiments/<date>-<slug>/index.jsx` and are
   auto-listed on a gallery page. GSAP / Three.js can be added per experiment;
   migrating to Next.js/Astro is a later decision if the lab becomes the real
   site.

3. **2026-09-23** — First real experiment: **Sonar Beam Visualizer** for
   PingLive / PingLive Mini (marketing page for accuphy.com / Shopify).
   Full brief in `docs/sonar-beam-visualizer-brief.md` (carried over from
   Jason's Chat discussion). Key locked-in facts: beam angles (PingLive 135°,
   Mini 39°, Mini Combo 78°), hybrid procedural sonar rendering with ray-cast
   acoustic shadows, WebGL (PixiJS or three.js — pick at Phase 2/3), single
   embeddable HTML output, desktop + touch. Reference recordings and product
   images go under `reference/` (gitignored if large).

4. **2026-09-23** — Phase 1 started: reference clips catalogued with Jason's
   annotations (`reference/clips.md`), frames extracted with a project-local
   `ffmpeg-static` (no system ffmpeg on the Mac), first draft of
   `docs/sonar-style.md`. Findings: (a) colour mode is app-wide, both
   palettes apply to both devices; (b) the app draws with non-uniform px/m
   (horizontal stretch) — engine works in metres, never copies screen angles;
   (c) yellow mode does not tint the beam area, blue/red mode fills it navy.
   *Correction (Jason, same day):* the RPReplay clips' 40/60 axis numbers are
   **feet** — the app was in imperial; only a printed unit counts.

5. **2026-09-23** — Jason: (a) **yellow colour mode first**; more app palettes
   later. (b) Abbreviations **PL = PingLive, PLM = PingLive Mini**. (c) Max
   *range* (horizontal) and *depth range* (vertical): PL 240 ft / 240 ft,
   PLM 200 ft — user-adjustable in the app, so the visualiser exposes a
   display-range control clamped per device. (d) After research
   (`docs/research.md`): render with **three.js + React Three Fiber + custom
   GLSL** using a polar shadow-map + shade pass; water-surface / drag feel via
   **three-fluid-fx** (or the inspiration site's tiny CPU flow-field trick);
   host the built page on Cloudflare Pages/Vercel and embed in Shopify via a
   Custom Liquid iframe section.

6. **2026-09-23** — Phase 2 geometry prototype shipped as
   `src/experiments/2026-09-23-sonar-beam/` (three.js + R3F full-screen shader,
   placeholder lake drawn procedurally). Working assumptions, all tunable in
   the on-screen debug controls and **to be confirmed by Jason**:
   (a) **Forward View = Down fan rotated forward by one full beam width**, so
   Down + Forward are contiguous (PLM 39°+39° = 78° Combo, as in the clips);
   clamped so the leading edge never rises above the surface (PL: 22.5° tilt →
   leading edge horizontal). (b) Scene is a 60 m-wide side view, surface at
   1/3 height. (c) Display range slider in ft (tap to toggle m), clamped to the
   device max from decision #5; engine uses metres. (d) Mouse hover moves the
   device; touch requires a drag. Device cursor is a placeholder shape until
   side-view PNGs exist.

7. **2026-09-23** — Jason confirmed on the prototype: (a) **PLM Combo looks
   right with the forward fan tilted 71°**, i.e. the forward fan's leading edge
   lies on the water surface. Rule adopted for both devices: forward fan =
   [90° − beam, 90°] from straight-down (PLM [51.5°, 90°], PL [−45°, 90°]);
   supersedes the "contiguous 78°" assumption in #6. (b) **Visible water depth
   50 m** (sky 15 m above). (c) Before Phase 3, Jason will supply a PingLive
   three-viewing-mode animation and Garmin LVS34 real footage to study how
   each mode images the bottom; he wants the final piece to feel **3D**.

8. **2026-09-23** — Reference study done (`docs/3d-beam-reference.md`):
   Accuphy's own PingLive Down/Forward/Panoramic animations and Garmin's
   LiveScope Plus video both present the beam as a **translucent 3D volume
   under an aerial view of the lake that reveals the bottom inside it**.
   Proposed (awaiting Jason): 3D lake + beam volumes as the main stage, 2D
   yellow-mode sonar picture as an app-style inset; phases 3–5 re-planned.

9. **2026-09-23** — Jason: the beam is a **3D wedge, not a plane**: PL =
   **135° × 20°**, PLM = **39° (78° Combo) × ~18°**. Stored as
   `beamDeg` × `thickDeg` in `devices.js`. Consequence: the coverage is a
   thin "curtain" (wide in the viewing plane, ~20° across), and the three
   modes are the same curtain aimed three ways — down, forward, or laid flat
   (Panoramic). Project goal restated by Jason: *let people who don't know
   live sonar understand what it is and how to use it, quickly, by playing
   with the piece.*

10. **2026-09-23** — Jason: the Accuphy Sonar App is developed in-house and
    using the **Android APK** (`ACCUPHY/IT/Accuhy Sonar App APK versions/`) is
    fine. Plan for the sonar-screen inset phase: run the APK in an Android
    emulator on this Mac, open the `.sonar` recordings in playback mode, and
    capture every colour mode / range / unit setting frame-by-frame as the
    reference for the 2D engine. iOS Simulator would need a simulator build
    from the dev team (App Store apps cannot be installed in it). Not started
    yet — the 3D stage does not need it.

11. **2026-09-23** — Jason reviewed the 3D beam shapes: correct except (a)
    Panoramic's lower face must be **flat**, (b) Down View's footprint edges
    must be **straight** from above → wedges now use flat thickness planes
    hinged at the apex (`wedge.js`), not a cone; (c) **PLM drawn at 43°**
    instead of the true 39° for visual effect (`displayBeamDeg`; Combo is
    therefore drawn as 2 × 43°). True values stay in `beamDeg`. PLM Forward =
    39° and Combo = 78° reconfirmed.

12. **2026-09-23** — Jason approved Phase 3 (3D lake) with two content
    standards: (1) underwater look = Garmin LVS34 video as the reference,
    improved with Claude's judgement; (2) **real, in-proportion content**:
    fish = North American largemouth & smallmouth bass, walleye, smelt,
    crappie (true sizes, schooling where real); structures = standing dead
    timber / stumps, a small wreck, rock piles; everything scaled to a real
    bass boat and real distances; and always feasible on the web (mobile).
    Sizes used are recorded in `src/experiments/2026-09-23-sonar-lake-3d/fish.js`.

13. **2026-09-24** — Jason's direction for the 3D lake, applied: deep-water
    share +10 % (`terrain.js`); natural structure via clumped rejection
    sampling (`vegetation.js`): 4 tall drowned-tree variants along the
    drop-off, 5 fine multi-fork submerged bush-tree variants on the shelf and
    hump flanks, stumps in loose groups, fallen logs, weed beds on the shallow
    shelf, rock pile with size gradient + scattered boulders; boat = 20 ft+
    **Ranger-style** bass boat (6.3 m × 2.4 m) with a **Mercury V8 Pro XS**
    style outboard and bow trolling motor carrying the transducer (`boat.js`).
    Beam contrast raised (outside 0.72×, inside up to 3×).

14. **2026-09-24** — Jason: (a) a natural **slope down to 40 m** up-and-right
    of the boat (world +x/−z) — added in `terrain.js`; (b) fish are
    **drawn at 2.6× true length** (`FISH_DISPLAY_SCALE`) so they are visible at
    the fixed camera distance, and they glow warm inside the beam; true sizes
    stay in `fish.js`; (c) outboard restyled to the **current-generation
    Mercury V8 Pro XS** look (rounded sculpted cowl, side vents, white/red
    band). Water made clearer (alpha 0.36 + fresnel). Dev aid `?cam=boat`.

15. **2026-09-24** — Jason's second review of the 3D lake, applied: drop-off
    to 40 m now runs across the **middle of the screen** (edge near z ≈ −4);
    periphery flicker was z-fighting between the sunk lakebed rim and the
    backstop floor → floor lowered; **3 musky** (0.78 / 1.02 / 1.28 m) cruise
    the weed/timber edges; **lake trout ×4 and chinook salmon ×4** live in the
    deep water; fish now have body types (bass / salmonid / pike / panfish /
    bait), back→belly colour gradient and species markings (bars, spots,
    lateral stripe) in the fish shader; **3–5 big boulders (2–4 m)** and
    **3 small rock humps** (with 1.5 m terrain mounds) added; outboard
    restyled to **Mercury 250 Pro XS** proportions (tall boxy cowl, forward-
    sloping top, front hood intake, graphite side panels, white/red band).

16. **2026-09-24** — Jason: deep share trimmed ~10 % (drop-off edge moved
    6 m north, basin narrowed); lake trout / chinook moved to the 38–40 m
    water. Fish colours **researched per species** so none repeat
    (`fish.js`): largemouth green + black lateral band; smallmouth bronze-
    brown + vertical bars; walleye golden-brass + dark saddles; crappie
    silver + dark mottling; smelt olive back + silver lateral stripe; musky
    pale green-silver + dark bars; lake trout dark grey-green + light spots;
    chinook steel-blue back, silver sides, black spots on the upper half.
    Shader now blends back → side → belly. Dev aid `?cam=fish:<species>`.

17. **2026-09-24** — **Phase 4 MVP shipped: the sonar-screen inset is computed
    from the 3D scene, not faked.** For each fan a "sonar camera" sits at the
    transducer, looks along the fan centre with FOV = beam × thickness and
    renders a 1024×32 **depth strip** (water, beams and boat are on a hidden
    layer). The screen shader converts every screen pixel (angle, range) into
    "how many thickness rows hit at that range" → echo strength → the yellow
    ramp from `docs/sonar-style.md`, plus range attenuation, speckle, a short
    echo tail and faint range rings. Screen box is fitted like the app (apex at
    top, Forward wedge from the left). Files: `SonarScreen.jsx`,
    `sonarShader.js`. Known: Panoramic shows little in deep water because the
    flat fan (0–20° below horizontal) only reaches the bottom within
    range·sin(20°) — physically right, but the real tilt of Panoramic mode
    needs Jason's confirmation.

18. **2026-09-24** — Jason: (a) **Panoramic is installed 5° below horizontal**,
    the 20° thickness then sweeps down to 25° — applied in `wedge.js`
    (`PANO_TILT`) and the 2D experiment; (b) **no invented range rings /
    noise floor on the sonar screen** — black water and echoes only; the real
    app chrome will be learned from the app's playback mode later, the
    reference recordings remain the baseline; (c) fish bodies rebuilt from
    species profiles (`fishGeometry.js`): smooth tube nose→peduncle with
    per-type height/width curves, forked or rounded caudal fin, dorsal, anal
    and pectoral fins — no more abrupt body/tail step.

19. **2026-09-24** — Panoramic sonar screen verified: black at short range in
    deep water is **physics** (5–25° fan reaches only range·sin 25° deep); at
    240 ft it images the rock hump with the app's dark-red bottom fill, bright
    structure and radial streaks. Panoramic gain ×2.4 to match the app's ~70 %
    gain look. Dev aids: `?debug` (live sonar numbers), `?sonardebug` (raw
    depth strip). React StrictMode removed from `main.jsx` — its dev double
    mount created duplicate render targets / frame loops.

20. **2026-09-24** — Jason's 8-point review applied: second ~20 m wreck on
    the deep slope; fish echoes on the sonar screen rebuilt as **compact bright
    blobs** using a fish mask (materials write alpha = fish during the sonar
    pass; the screen shader takes max over rows, no smear, slight angular
    widening) — Jason: *fish are the most important element*; sonar bottom
    bands smoothed with 16 jittered rows and range-dependent pulse width;
    salmon/lake trout also up-and-right; fish get a **rim glow** when inside
    the beam; boat restyled to **Ranger Z521R** (21'9" × 96") with Mercury
    250 Pro XS; UI in **Accuphy brand** (fonts + white wordmark from
    `WORK/ACCUPHY/branding`, copied to `public/brand/`); the sonar screen now
    sits inside an **iPhone Pro Max** landscape frame. The sonar picture's own
    chrome is left for the app-playback study.

21. **2026-09-24 (overnight, Jason asleep)** — Autonomous pass through the
    backlog: musky recoloured (olive-brown back, silver-green/golden sides,
    cream belly, broken dark bars — pattern 8); bark striations on timber;
    water wake rings from the moving boat; surface-clutter streak on the sonar
    screen; three-step guide strip with presets (top-right, desktop only);
    mobile portrait layout (phone above the panel); dpr capped at 1.5;
    production build verified (`npm run build` ok). Fish cam accepts an index:
    `?cam=fish:musky:1`.

22. **2026-09-24** — Jason: (a) tilt the phone so it reads as an iPhone → CSS
    `perspective(1400px) rotateY(-16°) rotateX(6°)` on the frame; the sonar
    quad is placed in clip space with the same rotateX→rotateY→perspective
    maths and per-vertex w (`SonarScreen.jsx` `PHONE_POSE`), so the picture
    is perspective-correct inside the display; (b) the control panel looked
    "very AI" → restyled after **shop.accuphy.com** (measured: Eurostile 800
    uppercase headings, Roboto/Instrument body, square corners, blue
    `#028cdf` 1 px outline buttons that fill blue when active, white cards);
    (c) animated **Drag the boat** hint following the boat until the first
    drag. Brand blue corrected to `#028cdf` (site value).

23. **2026-09-24** — Jason: (a) UI must feel like premium consumer tech
    (DJI / Insta360 / Anker), not a white card → dark glass panel, hairline
    borders, one accent; (b) keep making the iPhone frame more real (now true
    Pro Max proportions, buttons, brushed band, glass reflection); (c) the
    app study procedure: install APK → copy `.sonar` files to
    `Files/Accuphy Sonar App/Sonar Data` → Playback → per-view ⋯ settings;
    (d) **deployment is local only for now** — no public hosting.

24. **2026-09-24 (overnight)** — Emulator study: SDK + Pixel 6 AVD + APK
    installed; app launches, Playback found (Setting → Playback, data folder
    `/Download/Accuphy Sonar/Sonar Data`), but **every sonar view crashes on
    the macOS emulator** (`#version 320 es` shaders vs. emulator max GLES 3.1).
    Not worked around by re-signing a patched APK. Needs a `310 es` dev build
    from the app team or a real Android device over USB. Meanwhile the APK's
    own assets gave the two things that matter most: **the 11 real colour
    maps** (`assets/colormap/*.csv` → `colormaps.js`; amber = yellow mode,
    jet = blue/red, ice = blue) and **the tone curve** (`aio_shader.glsl`: log
    compression → gain/dynamic-range window → 256-entry LUT). The phone screen
    now uses both, with a colour-map selector and a gain slider (default 70 %).

25. **2026-09-24** — **App study done on Jason's real V10 tablet** (adb over
    USB). Jason caught that my phone inset had "核心问题" against his two app
    screenshots, then paused the rework until newer data was chosen; he
    supplied `PingLive_Forward View_20260906_162600.sonar` and `2.0.13.zip`
    (PL Down / Panoramic, Aug 3) from `~/Downloads`; PLM files came from
    `My Drive/Maiky/` (Aug 16) and the Sept 23 down-scan. Measured rules now
    in `docs/sonar-style.md` §6 and `docs/app-chrome.md`: (a) the picture
    **fills the screen, each axis scaled independently** (horizontal = range,
    vertical = depth range; PLM Down stretched ×2); apex Forward x≈20 % (PL) /
    top-left corner (PLM), Down top-centre, Panoramic bottom-centre, Combo =
    two panels with a grey diagonal; (b) the fan is never black inside: dark-red
    noise floor with radial streaks (side views) or mottled speckle (PLM
    Down); thick bottom band with a long tail; (c) **a fish is a horizontal
    dash 3–5× wider than tall with a yellow-white core at the transducer end**;
    (d) gain 1 %/tap, 57 % (Jason) / 50 % (PLM files) is the balanced look,
    70 % blows out. The half-done shader rewrite is parked in
    `docs/wip/sonar-screen-rework.patch` and is the next task. Screenshots are
    committed under `reference/app-study/` (JPEG, ≈ 17 MB) as the design
    reference; the `.sonar` files stay on the tablet / Drive.

26. **2026-09-24** — **Sonar screen rebuilt from the tablet measurements**
    (decision #25). (a) The old inset showed a small fan in a black box because
    the fan-fitting screen-box code had been dropped by accident in commit
    `4952966` (the phone restyle) — `uScreenMin/uScreenSize` were never set
    again. Replaced by `screenLayout()` in `SonarScreen.jsx`: a screen box in
    metres per (device, view) that fills the display with independent axis
    scales, exactly like the app (PL Forward apex 20 %, depth range = range;
    PLM Forward apex top-left 1:1; PL Down 1:1; PLM Down stretched so the fan
    corners meet the screen corners; Panoramic apex bottom-centre; Combo =
    Forward panel upper-right + Down panel lower-left (R/3) split by the grey
    diagonal). (b) Shader look: dark-red noise floor inside the fan (radial
    streaks; mottled speckle for PLM Down), thick bottom band with tail and a
    faint second echo, near-apex rays, **fish as horizontal dashes** with a
    bright core. Default gain 57 % (Jason's screenshots). (c) New
    `SonarChrome.jsx`: the app's chrome over the picture in container-query
    units (rulers, live depth readout via `depthAt`, temp/voltage, wordmark +
    resolution tag, range/gain/pause/back/⋯, PL-Forward depth-range control).
    Buttons are decorative for now. (d) Dev helper `?bigphone`.

27. **2026-09-24** — **Jason's tuning strategy adopted as the engine's model
    and defaults** (voice note, written up in `docs/sonar-style.md` §6.5):
    gain first until targets are bright but not blown out; then **Contrast**
    up until 70–90 % of the noise is gone (it never shrinks targets); then a
    little **Noise Reject** for the rest (used too hard it eats target edges,
    so always the smaller of the two); if contrast starts to over-expose, drop
    the gain a step; for the website aim for 90–95 % of the noise removed with
    a trace left for authenticity. Verified on the tablet (PLM Forward
    recording: factory 20/20 → 28/20 → 40/30, frames in
    `reference/app-study/plm-forward-tune-*.jpg`) — Contrast 40 + Noise 30
    leaves a nearly black floor with the fish, cable and piling intact.
    Engine: the noise floor is now a weak raw echo (so gain/contrast act on it
    like on targets), Contrast raises the tone window's low end and steepens
    it, Noise Reject thins the floor speckle only. New Tune row in the panel;
    defaults gain 57 % / contrast 40 % / noise 20 %. The tablet's view
    settings were put back to 20/20 afterwards.

28. **2026-09-24** — **Ideal sonar picture confirmed.** From Reset Defaults on
    the tablet (PLM Live Forward, 2026-08-16 piling + fish recording, 18 m):
    gain 52 · contrast 40 · noise reject 30 · TVG 20 — Jason: "剩余部分的话我觉得
    可以了". Frame `reference/app-study/ideal-picture/5-FINAL-*.jpg`; the
    sequence and his notes on artefacts (mounting line, other-sonar ripple:
    ignore) are in `docs/sonar-style.md` §6.6. Rule for the inset: cleaner than
    real use — small speckle next to structure must not be mistaken for fish.
    Engine defaults set to gain 57 · contrast 40 · noise 30 to match.

29. **2026-09-24** — **Fish mark model from first principles** (Jason asked to
    compare near vs far fish in Forward view). Range resolution is the pulse
    (constant); angular resolution is a constant beam angle whose footprint
    grows with range. So near fish show their own body length and heading
    (broadside = dash along the body, head-on = dot); far fish are all smeared
    to a tangential dash the width of the beam, and heading only changes
    brightness/stability. Verified on the tablet crops
    (`reference/app-study/fish-near-vs-far/`). Engine changed accordingly
    (`sonarShader.js` fishAt + beam-angle blur, average fill instead of max;
    `lakeMaterial.js` sonar-pass body no longer compressed to 0.6). Write-up in
    `docs/sonar-style.md` §6.8.

30. **2026-09-24** — **Range controls understood and mirrored** (Jason asked
    how targets change when range is adjusted). Measured on PL Forward: the
    bottom-left Range ⊖⊕ scales only the horizontal axis (apex stays at 20 %),
    the right-edge Depth-range ⊖⊕ scales only the vertical axis; a target
    keeps its (x, depth) in metres and only gets wider/narrower or
    taller/flatter — never nearer or farther. Everything scales with the axes,
    including the near-field rays (≈ 2–2.5 m fixed). Steps: range 6–22 m by 2,
    depth 8·9·10·12·14·16·18. Engine: PL Forward gets a Depth slider
    (`screenLayout` box height = depth range), near rays are 2.4 m in metres
    instead of 18 % of range, and structure echoes are tagged in the sonar pass
    (alpha 0.5) and drawn ×0.8 — Jason's case-2 verdict: wreck a touch less
    hot, orange-red preferred; rays stay. Frames in
    `reference/app-study/range-controls/`; write-up `sonar-style.md` §6.9–6.10.

31. **2026-09-24** — **The brightness/orange balance is measured, not
    eyeballed** (Jason: 找这个亮度和桔红色的平衡是核心能力). The app's "orange"
    colour map turned out to be `Moreland_Black_Body` (nearest-LUT error 0.03
    vs 0.12 for amber) — engine default switched. The LUT-index histogram of
    the two confirmed frames is the target (`sonar-style.md` §6.11); the engine
    reports the same statistic via `window.__sonarHist()` and exports its
    picture via `window.__sonarSnap()`. A tone gamma `uGamma = 0.8` on the LUT
    index closes most of the gap (the engine was too dark-red in the mids).

32. **2026-09-24** — **The photograph model** (Jason: 探头发射波束的方向对应物体
    形状的关系，像拍照片; 不同 view 下不同深度对应的角度关系). Written up as
    `docs/sonar-style.md` §7: the beam plane is the film; a mark is the target's
    silhouette cut by the 18–20° slab, projected into the plane's polar
    coordinates, blurred tangentially by the beam angle and radially by the
    pulse; per view the plane, the angle range and the depth↔angle rule differ
    (PLM Forward sees nothing nearer than 1.26 × depth; Panoramic grazes the
    bottom). Verified against Jason's Down-view near-field recording (`PLM big
    fish.mp4`, crops in `reference/app-study/fish-down-near/`): a broadside
    fish is a body-long lumpy blob with a soft rim, a head-on fish a dot.
    Engine changes: the sonar pass renders fish at **true size** (the ×2.6
    display scale no longer leaks into the screen), fish marks are solid,
    lumpy and soft-rimmed (fixed-row mask sampling, ≥ 7 cm near-field blur,
    no speckle), thin structure renders as grain instead of a block mosaic
    (per-pixel row jitter, 24 rows), and a new `accuphy_red` colour map
    (deep red → orange → white, after the LiveScope look — Jason: 现在的
    orange 不够红) is the inset's candidate default, pending his verdict.
    `?fishtest` places fixed test fish relative to the transducer for
    side-by-side checks (`reference/engine-compare/compare-down-fish-*.png`).

33. **2026-09-24** — **Texture and palette from real LVS34 footage.** Jason's
    round-2 verdict: fish too bright and too smooth (取两者中间), `accuphy_red`
    wrong (纹理完全不是一回事, 太模糊), learn Garmin amber from clear LVS34
    videos. Done: yt-dlp pulled Garmin's own LiveScope settings video; 8 amber
    frames + 3× texture crops in `reference/app-study/livescope-lvs34/`;
    palette measured (half the lit picture is blood red, orange only in the
    top ~15 %) → new default map `garmin_amber`; texture = per-beam filaments
    along the ray with ragged edges, fish = short oblongs 1–3 filaments wide,
    bottom = fibrous band with a white tip only where it faces the transducer
    (`sonar-style.md` §7.6–7.7). Engine: filament texture on fish and
    structure, radial smear behind fish, two-scale lumpiness cutting holes,
    fish cap 0.78; the PLM Forward scene now matches LiveScope's colour shares
    within a few percent. Composites: `reference/engine-compare/
    compare-livescope-vs-engine-forward.png`, `compare-down-fish-*.png`.

34. **2026-09-24** — **Keep the page simple.** Jason: TVG / contrast / noise
    reject etc. were for my understanding of the app, not features for the
    page — the page exists so people who have never used live sonar can start
    quickly, no complex testing or tuning. Public controls are Device, View
    and Range only. Colour map, gain, contrast, noise reject and the PL
    Forward depth-range slider stay in the code as calibration tools behind
    `?dev` (DEV builds only). The engine's defaults (gain 57 / contrast 40 /
    noise 30 / garmin_amber) are the picture everyone sees.

35. **2026-09-24** — Round 7 (Jason: 剩下没干的干了, 持续优化). Small and far
    fish now render at full brightness as beam-width dashes (a point target
    still returns a strong echo — the image is the point-spread function), and
    the sonar depth strip went from 32 to 128 rows so a 5 cm bait fish lands
    on a row instead of dotting; narrow/head-on fish flicker ping to ping.
    Panoramic screen rebuilt: even bottom texture with acoustic shadows, dark
    near the apex, the old near-field burnout removed. Step-2 preset moved to
    the timber flat so "this is what your phone shows" shows timber and fish.
    Antenna lines on the phone band. Later the same day: bait fish get a
    minimum apparent size in the sonar pass (point-target PSF) and the mask is
    sampled as coverage, so bait no longer dots or checkers; the beam comb is
    removed from fish altogether (the app's fish are solid oblongs with a soft
    rim — the comb belongs to structure faces). Still open: school stacking,
    finer fill texture inside solid structure, bottom white tip width.

36. **2026-09-24** — **Panoramic is a plan-view photograph; fish are persistence
    streaks** (Jason: 鱼和结构的形状 … 完全不是一回事). Panoramic rebuilt from a
    top-down model (baked terrain + per-frame structure height map + acoustic
    shadow marching) instead of side-view depth strips. Fish in every view are
    drawn analytically from their real pose and the last 0.7 s of their path —
    the app's ping persistence — which explains the app's 0.4–1 m parallel
    fish streaks in Panoramic and the horizontal dashes in Forward/Down; each
    fish also casts a shadow blotch on the bottom in Panoramic. Schools swim
    together. Panoramic framing matches the app (1:1, apex below the bottom
    edge, no range arc). Details `sonar-style.md` §7.13.

37. **2026-09-24** — **UI in Apple-style frosted glass** (Jason: 控制 panel 和右上角
    三个卡片按苹果的磨砂玻璃风格做, 背景太黑, 需要透明度, 保持高级感). Replaces the
    near-black DJI-style panels of decision #23: translucent white glass over a
    faint cool tint, 28 px backdrop blur + 175 % saturation, a gradient hairline
    edge (bright top-left, faint bottom-right), inner top highlight, long soft
    shadow, 18–22 px corner radii. iOS controls: pill segmented control with a
    white thumb, 4 px slider with brand-blue fill and a white thumb,
    sentence-case labels. Step numbers are round badges, the active one brand
    blue with a glow ring. The drag hint and the "← Lab" link are glass pills.
    Styles in `src/index.css` (`.ac-panel`, `.ac-card`, `.ac-seg`, `.ac-btn`,
    `.ac-range`, `.ac-hint`, `.ac-back`, `.glass`). Note: that CSS is unlayered,
    so it must not set `position` (it would beat Tailwind's absolute/fixed).

38. **2026-09-24** — **AUTO depth, display-only app buttons with a sign-up
    gate, a 40 m wreck, fish spread through the water column** (Jason: 实际app
    里是有auto depth功能的 … 到深水了底部还能看得见; 小窗里的功能应该不能点击 …
    弹出 sign up form … 不sign up不能关掉 … 画面卡住不动; 大的沉船再大一倍;
    鲈鱼 musky 三文鱼水层分散一点).
    - **AUTO depth (PL Forward):** the depth axis follows the deepest bottom
      inside the picture and puts it at ~80 % of the screen height, in the
      app's depth-range steps (ft: 20…240; m: 6…70). It deepens at once and
      shrinks only after 1.5 s, so it does not pump over uneven bottom. The
      depth control on the phone shows a small blue **AUTO** over the value.
      The dev Depth slider (`?dev`) turns AUTO off; its `auto` pill turns it
      back on.
    - **The sound reaches the whole picture box** (measured on the app: an 8 m
      range shows the bottom at 10.5 m; 18 m range / 16 m depth fills the
      lower-right corner). The PL Forward cutoff is now the box's far corner
      (hypot(range, depth range)) instead of the range. The 3D curtain and the
      lit lakebed use the same box, so the curtain is a slab reaching ahead and
      down to the bottom (like Accuphy's own Forward animation) and touches
      exactly what the phone shows. Down / PLM keep the range as their cutoff
      for now (backlog).
    - **App buttons on the phone are display-only:** 42 % opacity, no hover,
      default cursor (the iOS "disabled" treatment); values stay bright. A tap
      opens a frosted-glass sign-up card that cannot be dismissed (no close
      button, Escape and outside clicks do nothing, page `inert`) while the
      render loop is stopped (`frameloop="never"`). After sign-up the browser
      remembers it; later taps show a short hint instead. Klaviyo is wired but
      off until the public key + list ID are filled in; plan, copy and the
      CASL/GDPR note in `docs/signup-klaviyo-plan.md`.
    - **Big wreck:** a 40 m cargo ship (`wreck.js`) replaces the old big hull:
      three holds (one hatch shut, one open, one knocked off), forecastle and
      poop deck, bulwarks with a torn stretch, railings, a three-level stern
      house with bridge wings and funnel, masts with derricks, crane, winches,
      windlass and anchor, davits and lifeboats, rudder and propeller, exposed
      ribs, and 16 pieces of debris around it. It lies in ~36 m of water, so
      Down View needs ≥ 130 ft range to show the hull.
    - **Fish depths:** bass 2–17 m (40 % stay near the bottom, the rest
      suspend mid-water or shallow), musky 5–13 m, salmon 4–33 m.

39. **2026-09-24** — **Fish never swim through structure; big fish bloom on the
    sonar; the Accuphy logo stands on the lakebed** (Jason: 鱼好像穿过木头是个
    bug … 验证下是不是鱼在木头附近会看不见 … 如果特别复杂或者网页加载很慢就不要做;
    下面有一条大鱼 声纳上面显示也要再大一点; 湖的右上部分 … 放一个Accuphy的logo的
    模型 … 船过去的时候 … 小窗里成像出logo的形状).
    - **Fish paths:** every fish swims a fixed loop, so clashes are fixed once
      at load (`obstacles.js` + `clearPaths` in `fish.js`): trunks, limb
      crowns, brush, stumps, rocks, logs, both wrecks and the logo as simple
      envelopes; a clashing loop gets smaller, else moves a few metres, else
      lifts over low structure. Result: 149 fish untouched, 55 smaller loops,
      94 moved (all but one within 6 m), no loop touches structure. Cost
      ≈ 30 ms once at load, nothing per frame.
    - **Visibility check:** sonar marks come from each fish's true position and
      ignore structure, so a fish next to (or even inside) wood was never
      missing from the sonar; where it overlaps a trunk's echo the two merge,
      as on the real screen. What Jason saw was the 3D view: a fish inside a
      trunk vanished into it — that was the bug, now gone.
    - **Big fish bloom** (`sonarMarks.js`, `sonar-style.md` §7.14): bigger
      marks for big fish only (musky ×1.9, chinook ×1.6, bass ×1.1, bait 1×).
    - **Logo** (`logo.js`, §7.15): the brand icon measured from Jason's PNG
      (47.3° half-angle, three bands), extruded 0.6 m, 7.5 m tall × 11 m wide,
      standing in the boat's forward plane with its width along the heading,
      leaning 11° and settled 0.45 m into the silt, on the flattest open patch
      on the right of the lake (19 m deep). It stands rather than lies flat
      because Forward and Down are vertical slices: a flat logo would be a thin
      line there. Driving the boat along its line in Forward (or over it in
      Down) images the whole mark; Panoramic shows it from above as a strip
      with a shadow. Own material so it stays Accuphy blue inside the beam.
      Dev aids: `?cam=logo` (close-up), `window.__lakeSnap()` (3D view PNG).

40. **2026-09-24** — **The lakebed logo is the full ACCUPHY lockup, on a
    stone plinth** (Jason: 我给你的是png 淡色的地方你好像没有看见 accuphy不见了 …
    他是白色的; then 可以继续了). The PNG's white letters sat on transparency and
    were invisible on a white preview, so decision #39 built only the fan.
    - **Brand-exact outlines:** the vector lockup already in the repo
      (`public/brand/logo/Untitled-1.svg`, top copy) — white A C C U P H Y with
      the blue fan inside the U (its middle band is the U's bowl). Extruded with
      three's SVG loader; the same paths are rasterised into the sonar's
      signed-distance texture, so the side views need one texture fetch per
      pixel (budget phones are GPU-bound).
    - **Size and place:** 22 m wide (letters ≈ 3 m tall), so Forward at the
      default 80 ft range shows the whole word; Down with the boat over the
      middle shows it centred. On the flat 19.5 m patch on the right of the
      lake, following its 2.5° trend, upright in the boat's forward plane.
    - **Plinth:** the fan hangs 1.1 m below the letters' baseline and the
      sonar's bottom echo swallows ~1.5 m, so on the bed the fan's outer band
      disappeared (silt ridges under the letters were tried first and failed
      the same way). A dark stone plinth, set into the silt, lifts the whole
      mark 1.3 m; its top follows the baseline with a notch for the fan. The
      stone is dark because the beam lifts structure ×3.
    - **Fish** still route around it (the plinth is in the obstacle box); no
      loop touches structure.
    - **Screens:** the whole word shows in the default view on 16:9 and wider;
      on 16:10 its right end is cut (backlog).

41. **2026-09-24** — **AUTO depth follows the depth readout, like the app**
    (Jason: 这里在浅水 声纳是根据他垂直往下的深度来判断深度的 然后auto depth是根据这个
    数字去调节画面depth range的). The app judges depth from the water straight
    below the transducer — the big readout — and sets the depth range from that
    number. Decision #38 had taken the deepest bottom anywhere in the picture
    instead; on the shelf that counted the deep water past the drop-off, which
    the shelf edge hides from the sonar anyway, so 18 ft of water got an 80 ft
    axis. Now the axis is the next app step at readout ÷ 0.8 (18 ft → 25 ft,
    129 ft → 180 ft); a deeper bottom ahead runs off the screen, as in the app.

42. **2026-09-24** — **Near-range gain (TVG) tames the shallow-water bottom**
    (Jason: 浅水的时候 声纳画面好像太亮了过爆感太强了 可以折中一点). With AUTO depth
    zooming in over shallow water, the bottom band was a solid white slab. Bottom
    and structure echoes now get less gain close to the transducer (≈ 0.43 at
    5 m, full again from 11 m), like a sonar's time-varying gain; fish marks and
    the deeper calibrated pictures are unchanged. `sonar-style.md` §7.16.


43. **2026-09-24** — **Public name: Accuphy Lab** (Jason: PC和移动端都把这个项目叫做
    Accuphy Lab吧). Desktop and mobile both call the page "Accuphy Lab":
    - the browser tab title and the gallery heading;
    - the panel header: the ACCUPHY wordmark followed by "Lab" instead of
      "Beam explorer";
    - the sign-up source ("Accuphy Lab", `signup_page = accuphy-lab`) and the
      proposed Klaviyo list ("Accuphy Lab sign-ups").

    The sign-up card's "Sonar app" tag stays, because it names the real app.
    Internal names stay too: the repo and folder `accuphy-visual-lab` and the
    experiment folders. A future public address could match the name (for
    example `lab.accuphy.com`); that is Jason's call.

44. **2026-09-24** — **Panoramic shows only what its beam covers; the big
    wreck moved 20 m up the view and shrank 30 %** (Jason: Pano view … coverage
    好像有错位 没有照到的东西也出来了 特别是那艘船 … 没有在探测的coverage里的东西是不会
    显示的; 那艘大的船往上20米 尺寸缩小30%).
    - **Coverage:** the flat fan is installed 5° down and 20° thick, so it covers
      5°–25° below the transducer. The Panoramic picture now weights the bottom,
      structures and fish by that slab (soft edges 2°–6° and 23°–28°); the old
      response kept ~50 % out to 60°, so deep things the curtain never reaches —
      the wreck at 36 m — showed anyway. The picture runs to its screen corners
      (range ahead × half-width sideways), and the 3D curtain and the lit
      lakebed are now clipped to the same box, so what the curtain touches is
      exactly what the phone shows. Consequences: the bottom right under the
      boat (steeper than 25°) and a bottom deeper than the slab reaches (e.g.
      past a drop-off, or 40 m water) stay dark, which the app's own lake
      recordings do not show as strongly (they have some sidelobe return near
      the apex) — a faint sidelobe can be added back if wanted.
    - **Wreck:** "up" read as up the default view (away from the camera): moved
      from (44, −30) to (49, −49.5) on the flat 40 m basin floor, drawn at 70 %
      (28 m). It no longer sits behind the ACCUPHY monument. At 40 m it is out
      of Panoramic's reach within 240 ft; Forward (AUTO depth) and Down with
      ≥ 140 ft range show it.


45. **2026-09-24** — **The ad page's main action is an email sign-up for an offer;
    the mobile plan is planning only** (Jason: "a 但是这个事目前只是规划我没说动不要动
    后面后面可以提醒提醒我以防万一我忘记 你多出一个移动端的方案吧").
    - Main action: A, an email sign-up (Klaviyo) for an offer. "Shop PingLive"
      is the secondary action.
    - Nothing from `docs/mobile-marketing-plan.md` gets built until Jason says go.
      Claude reminds him of the pending plan choice when he returns to this
      project, and before any launch or ad work.
    - A second option was added as Plan B ("story first, play second": scroll
      story with video loops, the live 3D as an opt-in "try it" section).
      Claude recommends B first, with A's game inside it. The choice between
      the plans is Jason's.

46. **2026-09-24** — **Panoramic background looks like sonar again** (Jason:
    可以保留这个形式 但是我觉得背景太失真了 完全不像是声纳画面). The coverage rule of
    #44 stays. The bottom texture now follows the app by range: up to ~35 m it
    is a smooth field of soft speckle smeared across the beams (≈ 1.6° × 5 cm
    cells, re-drawn every ping) over soft patches and a few wide sectors, as in
    the app's 14–29 m lake recordings; from ~55 m the old radial streaks and
    strong sectors of the app's 62 m frame take over. Weeds are left out of the
    top-down structure map (every tuft had become a bright clump); structure
    clumps are sampled with a randomly rotated ring (no texel grid), sparse
    brush reads faint and solid things bright; shadows build up with how much of
    the ray is blocked (no dotted black rays); fish shadows are softer. The
    field stays at its calibrated brightness; the app recording looks brighter
    mainly because it uses the crimson "red" map (backlog).


47. **2026-09-24** — **No deadline for mobile; plan for the best experience, not the
    fastest launch** (Jason: "我不着急 时间不是问题 我们只是规划 思考 如何把移动端做得更
    合理"). This revises the recommendation in #45: the interactive experience is
    the core of the page (the visitor drives it); Plan B's video story is only the
    fallback for phones that cannot run the 3D, and its loops become the ad
    creative. Current thinking is written as "Principles for mobile" in
    `docs/mobile-marketing-plan.md`: the visitor's phone is the sonar screen (no
    drawn iPhone frame on phones), the sonar picture re-laid for portrait rather
    than shrunk, screen up / water down, drag anywhere in the water, hints
    instead of teleports, quality tiers done properly, landscape as "real device
    mode", email after the "aha". Still planning only — nothing is built until
    Jason says go.

48. **2026-09-24** — **Lite section: the original side-view idea, rethought with
    everything learned — planning only** (Jason: 现在这个项目基本都是3D的 你学习了非常多的
    东西 我们现在重新利用你学习了解到的 重新思考最早的事如何坐在一个网页的section里 是不是
    更加轻量化一点比较好 包括网页加载速度这些都很重要 他应该是一个一眼明了的东西 直接有互动
    不要那么多选项的 … 我们只是做计划不要动哦). Plan in `docs/lite-section-plan.md`:
    - a side-view lake as a web component `<accuphy-sonar>` for accuphy.ca page
      sections; the boat follows the pointer along the surface; inside the fan the
      scene becomes the sonar picture at the approved look. Down / Forward are
      vertical slices, so the fan *is* the screen — no phone inset needed;
    - two controls (view pills + device toggle; device can be preset per page); no
      range slider, tuning, guide cards, phone frame or sign-up gate;
    - no three.js / React / framer-motion: one 2D shader + a polar shadow map,
      ≤ 90 KB first visit (vs ~976 KB), a poster on the first paint, ≥ 50 fps target
      on the V10, vertical swipes keep scrolling the page;
    - Panoramic out of v1 (a side view cannot show a flat fan); option later as a
      top-down panel;
    - the full 3D Lab stays a separate page linked from the section; on phones that
      cannot run the 3D, the section's 2D engine is a better fallback than video
      (decision #47 keeps the interactive experience as the core).
    Nothing built. Jason decides go / no-go and the four smaller questions in the
    plan's §9.
