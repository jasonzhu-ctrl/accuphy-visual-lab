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

49. **2026-09-24** — **Big wreck turned 35° counter-clockwise** (Jason:
    能不能把这个船 逆时针转35度), as seen from above / in the default view: yaw
    −0.9 → −0.289 rad, so it now lies almost level across the screen, stern
    house to the left. The debris ring turns with it; fish still route around
    it (no loop touches structure).


50. **2026-09-24** — **The lite section is judged on its look first: premium and
    technical is a hard requirement** (Jason, on the #48 plan: 视觉的高级感科技感非常
    非常重要!!!!!). Light never means plain: the section's weight targets are met by
    computing the picture, not by simplifying it. `docs/lite-section-plan.md` §3b now
    spells out where the feel comes from at zero download cost — water lit from the
    surface with light shafts, caustics and depth fog in a dusk palette so the amber
    picture glows; the beam as a translucent volume with fresnel edges, thin white
    edge lines, a lit footprint, a travelling ping and a thickness outline (2.5D);
    parallax layers and drifting particles; lit silhouettes instead of clip-art;
    bloom on the hot sonar pixels and the app's own readouts; eased motion
    everywhere; the approved frosted-glass UI with brand typography inherited from
    the theme. Phones get the same look with fewer samples, never a plainer one.
    Gate: Jason's look review against the LVS34 frames, Accuphy's animations and the
    3D Lab before anything is packaged; if it does not reach the 3D Lab's level it
    does not ship. Open question: dark cinematic water (recommended) or the daytime
    look of the 3D Lab. Still planning only.

51. **2026-09-24** — **Lite section mood: dark cinematic water** (Jason: 深色电影感).
    Closes the open question of #50: the section's water is the dusk palette of
    `docs/lite-section-plan.md` §3b (deep teal → navy → near black, lit from the
    surface, light shafts and depth fog) so the amber sonar picture glows — the
    look of Garmin's LVS34 film and Accuphy's own mode animations, not the daytime
    sky of the 3D Lab. The section is a dark block inside the light shop page.
    Still planning only; nothing built.

52. **2026-09-24** — **Panoramic gets a faint sidelobe near the boat; Down view gets AUTO
    range** (Jason, answering the open questions: 1. 要的 但是要好 2. 不是 就是往屏幕上面移动
    一些 3. 哦 4. 要的).
    - **Panoramic sidelobe:** below the 5°–25° slab the response now continues at
      ≈ 0.8 of the main lobe from 25° and fades out by 60°, so the bottom runs on
      toward the boat a little darker (like the app's lake recordings) and only
      the patch right under the transducer stays dark. Fish and structure use the
      same response. The 3D curtain still draws the main slab.
    - **Down view AUTO range:** in Down the depth axis is the range, so deep water
      pushed the bottom off the screen. The range in use is now the larger of the
      visitor's own setting and the next range step that puts the bottom (the
      readout) at ~80 % of the height; it rises at once and comes back after
      1.5 s. The slider shows the range in use; the phone marks a raised range
      with a blue AUTO over it.
    - **Wreck "往上":** confirmed as up the screen (decision #44 stands).
    - **16:10 framing:** Jason noted it ("哦"); no change asked.


53. **2026-09-24** — **The Lab offers three ways to fish: Boat, Kayak, Ice**
    (Jason: "船 kayak和冰钓好了", answering the status-ladder proposal in
    `docs/users-and-market.md` §7 and the Drive study "Status ladder and the Lab
    scene"). Visitors choose "How do you fish? Boat · Kayak · Ice", so no single
    vehicle carries the brand. The hero becomes "one sonar, every way you fish",
    and ads can deep-link to the matching scene.
    Working assumptions, to confirm with Jason when building:
    - the default scene follows the season (Ice in winter, Boat in open water);
    - the kayak is always offered but is never the default image;
    - the Boat scene becomes a 16–18 ft aluminium deep-V instead of the Ranger
      tournament boat (decision #20). This is not yet asked.

    Planning only: nothing is built until Jason says go.

54. **2026-09-25** — **Look picks: groups A and B; the guiding concept is "a dark
    lakebed lit up", like a swinging lamp** (Jason: "A B 都喜欢的 我们不说技术因为技术和最后
    的呈现效果最有关系 我继续给你我想说的暗色湖底被点亮的概念吧 有一个我的录屏参考概念 但不要被
    限制了 继续学习"). From `docs/look-references.md`: he likes A (dark cinematic product
    pages: DJI, Apple, Hasselblad, GoPro) and B (interactive WebGL: Hubtown's glowing
    object over dark water, Iventions' spotlight atmosphere, IVRESS). His own reference
    is the "HTML Light Demo" (github.com/jinruozai/HTML-Light-Demo, a recreation of
    @kaolti's piece; live at jinruozai.github.io/HTML-Light-Demo): a near-black room, one
    hanging lamp on a physical pendulum, and a warm soft-edged cone that is the only
    light — whatever it sweeps over is revealed, the rest stays dark; the lamp has
    weight (swing, inertia, settle). Mapping for the section: the beam is the lamp, the
    lakebed and its timber, rocks and fish are the wall, the amber sonar picture is
    what the light reveals, the water is the dark room; the beam should carry physical
    weight when the boat is dragged (lag, sway, settle). He asked not to be limited by
    the clip and to keep learning. Judge by the final look, not the technique.
    Still planning only.

55. **2026-09-25** — **The concept, in Jason's words** ("就是湖归湖的画面 他是半暗的或者是
    有逻辑的暗和半暗 然后鼠标是声纳探头的缩小版本 但是真实图形 然后探头到了哪里 对应的声纳波束
    能触达的地方就亮了"). Three rules for the lite section, replacing any looser reading
    of #54: (1) **the lake stays a lake picture** — realistic, half-dark, with a logic
    to what is dark and what is half-lit (surface light, depth), not a black void;
    (2) **the cursor is the transducer itself** — a small but real image of the device
    (PingLive / PingLive Mini), not a boat silhouette or an abstract marker; the
    side-view device cutouts are therefore needed (backlog); (3) **wherever the device
    goes, everything its beam can reach lights up** — the lit region is the beam's true
    coverage, the rest stays as it was. Jason is open on tools and on how we
    collaborate; he has more reference videos to share from a web platform.
    Still planning only.

56. **2026-09-25** — **Boat scene = a 16–18 ft aluminium deep-V; on phones the scene
    choice adds no step** (Jason: "移动端会不会太重了还要选择 A我觉得不错").
    - The Boat scene uses a 16–18 ft aluminium deep-V, the everyday walleye boat of
      Canada and the Upper Midwest, instead of the Ranger tournament boat
      (revises #20 for the Lab's scenes).
    - Jason's worry was that a choice makes mobile too heavy. The answer is that the
      choice is never a gate:
      - the page opens straight into one scene: the ad's scene when a link carries
        one, otherwise the season's default;
      - switching is a small chip on phones (or sits in the "More" sheet), not a new
        row of buttons;
      - only the scene in use is loaded, and the others download when tapped;
      - one scene renders at a time, so the per-frame cost does not grow.
    Planning only: nothing is built until Jason says go.

57. **2026-09-25** — **US = PingLive Mini (PLM) is fine for ads** (Jason: "我赞成 美国做PLM是可以的哦").
    The US market does not wait for the full-size PingLive.
    - US ads lead with the Mini at US$699. That is the strongest price story (against
      the Lowrance Eagle Eye 9 at $999) and fits the kayak and ice scenes.
    - A Lab link from a US ad opens with the Mini selected.
    - The remaining US check before spending: the store's checkout completion. The
      2026-09-24 data showed ~5% of US checkouts completing, possibly inflated by
      express-pay buttons.

    This revises condition 3 of the Meta feasibility note in Google Drive's
    `Market Research`. The rest of the order stands: tracking first, then our own
    list, then Canada before the ice season.
    Planning only.

58. **2026-09-25** — **Wordmark look mock made — a still, not the build** (Jason, on a
    giant PINGLIVE word in the section: "可以试试呀看看好了反正没事"). Two stills of the same
    scene, with and without the word (`reference/look/mock/`, gitignored; generator
    `gen.py`, an SVG drawing rendered with headless Chrome): dark lake per #51/#55,
    PingLive Down beam (135°) as the only light, reaching as far as the range; inside it
    the lake lights up — the bottom, timber, wreck and fish, with amber sonar-style edges;
    outside it the lake stays half-dark. The cursor is the real transducer head cut from
    the shaft-mount product photo. Variant A: "PINGLIVE" in Eurostile Heavy straddling the
    surface — top half in the sky, bottom half refracted under water and lit where the
    beam reaches. Variant B: a headline instead. Waiting for Jason's verdict. The section
    itself is still not started.

59. **2026-09-25** — **No giant product wordmark in the section** (Jason, on the #58
    mocks: "我感觉网站首页大字的不合适 毕竟还有mini呢"). A "PINGLIVE" word would favour one
    product while the section also shows PingLive Mini. The section uses the plain
    variant: a short headline plus the device toggle. If a big type moment is ever
    wanted, it must be product-neutral (e.g. the ACCUPHY brand, or a line like "See under
    your boat"), and it is not planned now.

60. **2026-09-25** — **PingLive Mini: AUTO depth in Down and Forward, bottoms aligned,
    shallow water toned down** (Jason: "PingLive mini是不是在浅水太亮了 和之前pl一样的问题 还有
    PLM的down和forward需要auto depth 他们的底能不能尽量align一点呢").
    - PLM Down and PLM Forward share ONE AUTO depth range, the same rule as PL Forward
      (#41): the depth readout / 0.8, in the app's depth steps, deeper at once, shallower
      after 1.5 s. The bottom under the boat therefore sits at the same height (~80 %) in
      both views and stays put when the view changes (checked at 17.6 ft: both at ~14 ft
      on the ruler).
    - PLM Down: the depth axis is the range, so its range IS that AUTO value; the page's
      Range slider is greyed out there and the phone shows AUTO over the range.
    - PLM Forward: range ahead × AUTO depth down, the sound reaching the box's far corner
      like PL Forward. Physics still applies: the Mini cannot see closer than ~1.2 × the
      depth, so in deep water with a short range the bottom is out of reach.
    - Combo is unchanged: the app gives its two panels their own scales (~5 m Down vs
      ~12 m Forward), and one shared depth axis would hide the Forward bottom behind the
      Down panel.
    - Shallow water: the Mini's narrow fan meets a shallow bottom at one range across
      the whole fan, so AUTO zoom made a yellow-white slab. PLM gets extra near-range gain
      in the side views, 0.62 at ≤ 5 m back to full by 18 m (`uBedGain`), so the
      calibrated deep pictures do not change. Fish marks are untouched.

61. **2026-09-25** — **The lakebed lockup reads ACCUPHY LAB and moved to the middle of
    the view** (Jason, with a screenshot of the default view: "Accuphy现在的logo移动到截屏
    这个区域好像更合理 然后我要你做成Accuphy Lab也就是在现在的后面加上Lab").
    - **Where:** centre (15, −62), on the flat 40 m floor behind the drop-off. In the
      default camera it sits at the top-middle of the screen on every window shape (the
      old spot, x 57, was cut off at the right on 16:10 screens). Dead level along and
      across its line.
    - **LAB:** the brand font Eurostile Heavy (`public/brand/fonts`), traced once at high
      resolution and stored as outlines in `logo.js`, at the wordmark's cap height, with
      the wordmark's letter gap (~30 SVG units) and a word space after the Y. Uppercase,
      as the page header writes the name (#43). Same white, same extrusion and plinth.
    - Letters keep their size, so the monument grew from 22 m to 31.4 m.
    - **Sonar:** PL Forward from `?boat=-14,-62.5` at 140 ft range images the whole
      "ACCUPHY LAB" (checked). At 40 m the depth range runs on 180 ft AUTO, so the
      letters are smaller on the phone than at the old 19.5 m spot.
    - In the 3D view the monument is fainter than before, because it sits under 40 m of
      water instead of 19.5 m.

62. **2026-09-25** — **Big wreck moved a third of a length ahead; wreck faces drawn
    solid** (Jason: "船再往前挪一点1/3个船位"; and, comparing with the PL Forward wreck
    recording on the tablet: "目前这个船的画面和那个相差好远 结构和感觉完全不对 你核实 优化").
    - **Move:** 9.3 m (a third of its 28 m) toward its bow, to (57.95, −46.84), clear of
      the ACCUPHY LAB lockup behind its stern. Still on the flat 40 m floor.
    - **Checked against `reference/app-study/pl-forward-wreck-*.jpg` and
      `ideal-picture-2-pl-forward-wreck/`:** the app draws the wreck as a solid bright
      mass (deck lines, dark hatches, a bright end face) with streaks along the beams.
      The engine drew it as salt-and-pepper dust, because every pixel sampled a fresh
      random set of the 24 rows across the slab thickness.
    - **Fix (side views, every device):** pixels along a short run of the same ray
      (0.08° × 0.67 m) now sample the same rows. Big steel faces come out as solid,
      streaky masses, and far structure faces get a wider pulse (up to 2.5× by 30 m).
      Timber, the bottom band and fish barely change (checked on the shelf scene).
      Comparison: `reference/engine-compare/wreck-compare-2026-09-25.png`.
    - **Still different, by physics:** the recording's wreck lies in ~10 m with a 12 m
      depth scale, so it fills half the screen. Ours lies in 40 m, with AUTO depth at
      180 ft (~55 m), so on the phone it is a low shape on the bottom. Moving it to
      shallower water is Jason's call.

63. **2026-09-25** — **Wrecks image as steel: thick glowing bands, not a line drawing**
    (Jason, after #62: "差距还是很大 和之前的问题一样 结构物的成像不对劲").
    - **Checked like for like:** a dev option `?wrecklift=29` raises the big wreck so its
      deck sits at ~7.5 m, like the recording's wreck. With `?dev`, range 45 ft and depth
      40 ft (the recording's 14 m / 12 m), the engine drew the ship as a thin crisp outline
      of its side (every structure face used a ~0.1 m pulse). The app draws thick bright
      bands with long tails and streaks along the beams.
    - **Why:** steel is by far the strongest reflector. After the log compression its pulse
      skirts and the ringing inside the hull stay above the window, so the bands are
      as wide as the bottom's, with longer tails.
    - **Fix:** a new sonar tag, steel (0.75), for both wrecks and the debris (their own
      `steel` material). Steel faces take the bottom's pulse width, a tail twice as
      strong and 1.5× longer, and ×1.3 peak. Timber and rocks keep their sharp thin look
      (checked on the shelf scene), and the bottom and fish are unchanged.
    - Comparison: `reference/engine-compare/wreck-compare-2-2026-09-25.png` (app ·
      before · after at the same depth · after at the real 40 m spot).

64. **2026-09-25** — **Deep floor 40 → 24 m; fish off the bottom; fish that chase**
    (Jason, on `docs/deep-water-plan.md`: "我赞成 你做的时候仔细一点 做完验证一下bug啥的
    另外鱼不能完全贴住底部 还有鱼的动作 … LK沉底的可以在船靠近的时候从底部自然但是比较快的
    往上追饵 … 鲈鱼可以自然的偶尔有追吃饵鱼的感觉 三文速度也可以偶尔快一点 船靠近可以作为一种
    触发 随机的可以顺着声纳扫的方向往上追"). Supersedes the 40 m of #14–#16.
    - **Terrain:** `DEEP_M = 24` (rim 26). The edge line, shelf, plateau, hump and
      basin do not move, so the deep share of the lake is unchanged.
    - **Layout frozen:** timber, bushes, stumps, logs, weeds and rocks are placed
      against `layoutDepth` (the 40 m profile), so all 1,207 keep their exact x/z and
      size (checked item by item). Their heights follow the new bottom. All 298 fish
      keep their x/z except 6, which path clearing re-routed (0.9–8 m).
    - **Off the bottom:** a fish's lowest point (centre − bob − half the drawn body)
      stays ≥ 0.4 m above the highest bottom under its whole swim loop, including
      loops re-routed around structure. Measured minimum over every loop: 0.37 m.
    - **Behaviours** (`fish.js` `stepBehaviours`, once per frame before any pose is
      read; the 3D fish and the sonar marks share the pose, so they always agree):
      - boat nearby (the transducer within 16 m lake trout, 14 m salmon, 12 m bass,
        with the fish within 7 m of the sonar's vertical plane): lake trout often
        (75 % on approach), salmon and bass sometimes, rise toward the boat into the
        plane, the way fish come up to a jig. Up to 10 / 8 / 5 m at 3–4 m/s, nose up.
        They hold 1–2 s in the plane with a small hover, so the whole chase stays
        on the phone, then sink back to their loop over 5–9 s;
      - bass: now and then (30–80 s apart) a dart at bait within 8 m, at ~4–5 m/s;
        up to 8 smelt or crappie near the strike scatter;
      - salmon: a speed burst every 20–50 s (×2.2–3 for 3–5 s).
      Every run is sampled before it starts (86 points: structure, bottom, surface);
      if anything is in the way, a smaller version is tried, else nothing happens.
    - **Checked:**
      - a 30-minute simulated boat run, every fish every frame: 0 structure hits,
        0 bottom, 0 surface;
      - behaviour cost: 0.036 ms a frame on average, worst 2.5 ms when a run starts;
      - on the phone: the lockup (140 ft) and the wreck (110 ft) are clearly bigger;
        Panoramic now shows the deep floor, the lockup and the wrecks; Mini Forward
        sees the deep floor at 120 ft; the default view's phone picture is unchanged;
      - no console errors.
    - The calibration scene `?boat=4,-26` changed with the terrain: it now reads 76 ft
      over a flat bottom, with the small wreck in the fan. Its old numbers no longer
      apply (`sonar-style.md` §6.11).
    - Dev: `window.__chase('laketrout' | 'salmon' | 'largemouth' | 'smallmouth')`
      makes the nearest fish of that species rise now.

65. **2026-09-25** — **Down view fully AUTO on both devices; PL Down fills its box**
    (Jason, PL Down at 145 ft range over 61 ft of water, the bottom in the top half and the
    rest empty: "像这种情况 auto depth就好像没用一样 自动调整了以后有效画面应该在屏幕上会更大").
    Replaces #52, whose AUTO only raised the range when the bottom would leave the screen,
    so a visitor's long range left half the screen empty.
    - Down's range IS the AUTO depth range (readout / 0.8 in the app's steps, deeper at once,
      shallower after 1.5 s), for PL as for PingLive Mini (#60). Down and Forward share it, so
      the bottom sits at the same height in both, on both devices.
    - The page's Range slider is greyed out in Down, and the phone shows AUTO over the range.
    - PL Down: the app draws echoes over the whole 1:1 box, its lower corners too
      (`sonar-style.md` §6.9), so the sound reaches the box corners and the bottom runs across
      the full width. The 3D curtain is that box too.
    - Checked: 35 ft over the hump (145 ft before → AUTO 45 ft, the hump and its timber fill
      the screen), 76 ft in the deep (AUTO 100 ft, bottom at ~75 % across the width),
      Forward at the same spot with its bottom at the same height, no console errors. Over
      uneven bottom a deeper side can still run off the screen, as in the app.

66. **2026-09-25** — **Bottom toned down (orange body, thin hot edge); lockup moved into the
    boat's reach** (Jason: "1. Accuphy那个logo貌似太靠上了 只能扫到一半 2.画面特别是底部貌似还是
    太亮 深水也是 … 说白了就是高亮的部分和桔红色的关系 我感觉降低亮度的方式是对比度").
    - **Measured first** (`__sonarHist`, share of lit pixels in the white bin): PLM shelf scene
      6 %, which matched the app's 6.6 %. PL Forward and PL Down over the 17–24 m bottom were
      at 37–44 %, and the wreck at 35 % (app: 14 %). Cause: over a flat bottom every row
      across the slab lands at one range, and the summed echo burnt the whole band white.
    - **Fix (side views):** past the near range the integrated bottom echo saturates softly
      (K 0.4, fading in over 6–14 m, where TVG stops), so the band's body stays orange. A thin
      first-return line (a narrow pulse, weight 0.3, with the filament texture) gives the
      app's hot leading edge. The tone curve's white point is 15 % higher.
    - **After:** PL bottom scenes 7 % white (app 6–7 %), wreck 8 %, PLM shelf 2 % (it looks
      the same). Tried and rejected: white point alone (H 1.4) made the Mini and the wreck dull
      (0.1 % and 4 % white), and a heavier leading edge put the white back to 45 %.
    - **Lockup:** at z −62 its line lay outside the boat's drag area (±58 m), so a visitor
      could only sweep its edge. It is now at (15, −52): reachable, lower in the default view,
      still level (±2 cm along, 9 cm across). Checked by driving the boat there the normal way
      (`?boat` not used): the whole ACCUPHY LAB images at 140 ft.
    - Fish re-checked with the moved obstacle: 15 simulated minutes, 0 structure, bottom or
      surface hits.

67. **2026-09-25** — **Panoramic structure: lit near faces and real shadows, no more rock
    "bubbles"** (Jason, PL Panoramic over the rock hump: "这些石头感觉画面不正常". His references:
    four early app Panoramic clips with structure (2025-03, `RPReplay_Final1741714*`, Desktop and
    Downloads). Frames are in `reference/app-study/panoramic-structure/`.)
    - **What the app shows:** the side of an object facing the boat is bright (branches as thin
      bright lines, the near edge of a log or dock). Behind it a dark acoustic shadow trails
      away along the beams (a post's shadow is a clear dark tongue).
    - **What was wrong:** the facing was measured from the footprint's highest tap, so every rock
      lit a ring all round, far side included, around a dim centre. Shadows needed ~5 blocked
      samples of 40 to count, so a rock (1–2 samples) cast a faint dotted one, and they only
      darkened 35 %.
    - **Fix:** facing from the height right under the pixel vs a little toward the boat
      (look-back max(0.35 m, 3 % of range)), weight 0.8. Shadows are full at 2 blocked
      samples and darken 85 %. Result: rocks show a bright near half and a dark tail; trunks
      and branches are bright with dark radial shadows.
    - Tried and rejected for shadow edges: ray-coherent march offsets (parallel streak lines)
      and fixed offsets (stair-stepped texels). Per-pixel offsets stay; edges are still grainy.
    - The #66 white point is now side views only; the Panoramic field keeps its calibration
      (LUT index 0.1–0.2 over the shelf).
    - Still different from those clips: they were recorded at 72–78 % gain in 1–5 m of water,
      so their whole fan is a bright orange field. Ours is calibrated to the newer 57 % frames
      (§7.13).

68. **2026-09-25** — **QA pass; Combo's Down panel on AUTO depth** (Jason: "你整体再跑一遍看看
    有没有bug要修复之类的 接着干"; also "不用" to moving the wreck shallower).
    - **Checked:**
      - production build: OK;
      - 6 spots (default, shelf, hump, deep, lockup, drop-off) × 6 views (PL Down / Forward /
        Panoramic, PLM Down / Forward / Combo): snapshot and LUT histogram of each, no console
        errors, every fish position finite;
      - ft ↔ m toggle: Down 70 ft ↔ 22 m, readout 16.6 m;
      - the sign-up gate: opens, email focused, page inert;
      - the mobile viewport (375 × 812).
    - **Bug fixed:** Combo's Down panel was R / 3 deep. That matched the one app frame by
      chance (4.1 m of water, 18 m range). In 54 ft of water at 80 ft range the bottom was off
      the panel, and the phone was 98 % black. Now that panel uses the AUTO depth range; the
      app frame confirms it (4.1 m of water, panel 0–5.5 m). The Forward panel keeps 0.7 × range.
      Each fan reaches its panel's far corner, and the 3D curtains match.
    - **Tried and reverted:** starting the bottom soft cap at 4–10 m instead of 6–14 m. An 8 m
      hump went from 20 % to 15 % white, but the Mini's calibrated shelf lost its hot edge
      (0.3 % white).
    - **By physics, not a bug:** PLM Forward over 24 m water at 80 ft range shows no bottom.
      The Mini only sees the bottom from ~1.2 × the depth ahead, so a longer range shows it.


69. **2026-09-25** — **Project boundary with `accuphy-website`** (Jason approved the
    three-project layout: accuphy-website = Shopify landing platform, accuphy-visual-lab =
    design and prototypes, Partner Portal; stale folders archived under `IT/_archive`).
    The lab never touches Shopify: a final design is handed over through
    `accuphy-website/handoffs/`, and that project owns the theme, translations, speed
    measurement and publishing. Site facts and specs are read from the website project,
    never copied here. Items already on the website side's backlog: the Lab page's home
    (lab.accuphy.ca vs a store page), the lite section's Shopify test page, the Klaviyo
    list and keys, Meta Pixel + UTM + "Shop PingLive" button, the US phone-checkout walk
    (decision #57). Written into `CLAUDE.md` ("Boundary with the website project").

70. **2026-09-26** — **A friends test build, published as a private claude.ai Artifact**
    (Jason: "可以暂时把他变成在一个网页里可以使用的版本吗 我想给我的朋友测试" and "是不是
    artifacts就行 合适吗"). The tooling commit 3150b66 says "decision #69" by mistake: #69 is
    the accuphy-website boundary, written by another chat at the same time.
    - **What:** the 3D sonar lake alone, without the Lab gallery or its back link, as ONE
      self-contained HTML file (2.25 MB): code, styles, the three brand fonts and the white logo
      are all inlined, and nothing is loaded from other hosts.
      Link: https://claude.ai/artifact/RnCBYTexY5vcEqJy2hAsN7 (private until Jason shares it
      from the page's Share menu).
    - **How to rebuild:** `node scripts/build-share.mjs <outDir>` (entry `share/`, config
      `vite.share.config.js`), then republish the same file to that URL. The script refuses
      to finish if any file reference is left un-inlined. It caught the minifier's backtick
      strings and Vite's `../brand/fonts/` paths on the first runs.
    - **Checked:** a local copy in a browser. Fonts and logo load from inside the page, there
      are no requests to other files, and Down, Forward, Panoramic, Combo and Mini Forward
      all render with no errors. The live link could not be opened from Claude's test browser,
      which is not signed in to claude.ai.
    - **Limits** (fine for a test, not for launch): the address is claude.ai's. The page
      frame blocks calls to other hosts, so the sign-up gate works as UI but no email is
      sent anywhere (Klaviyo was off anyway). The public launch still needs our own host.

71. **2026-09-26** — **The friends test build has no sign-up gate** (Jason: "我要直接给链接给他
    他能直接看 不要邮箱什么的"). In the share build (`vite.share.config.js` defines
    `VITE_NO_GATE`), a tap on the phone's buttons only shows the hint ("These are the app's own
    controls — use the panel to change the view."): no email form and no frozen page. The main
    Lab page keeps its gate (#38). Republished to the same link as version 2. Checked locally:
    no email field, no inert page, the hint shows.
    For a friend to open the link without a claude.ai login, Jason turns on public sharing in the
    page's Share menu. Claude cannot change sharing.

72. **2026-09-26** — **A public test link without any login: GitHub Pages** (Jason, after the
    Artifact link asked his friend to sign in: "怎么还要sign in到claude?我要那种任何人点击link就能
    打开的", then "可以" to a public repo on his GitHub).
    - A claude.ai Artifact link is tied to Claude accounts, so it is the wrong tool for friends.
    - New public repository `jasonzhu-ctrl/accuphy-lab-test` holding only the built page (the
      same single file, as a full document with `noindex`, plus `robots.txt` Disallow and
      `.nojekyll`). The Lab source stays private. `scripts/build-share.mjs` now also writes
      `<outDir>/pages/`.
    - The link will be https://jasonzhu-ctrl.github.io/accuphy-lab-test/ once GitHub Pages is on.
      Claude's switch-on call was refused by the session's safety check ("create public
      surface"), so Jason turns it on himself: repository Settings → Pages → Deploy from a
      branch → main, / (root) → Save.
    - To update: rebuild, copy `<outDir>/pages/*` into a clone of that repository, commit, push.
      The link stays the same.

73. **2026-09-26** — **Fix: the sonar picture was black in Safari** (Jason: a friend opened the public
    test link on an iPad, in Safari: "小窗里的声纳画面是全黑的").
    - **Cause:** the colour table (LUT) that turns echo strength into the orange palette was a
      FloatType texture sampled with LinearFilter. Safari (iPad, iPhone and Mac) has no
      OES_texture_float_linear, so the texture was incomplete and every lookup returned black.
      Chrome filters float textures, which is why every desktop and Android check passed.
    - **Fix:** the LUT is 8-bit RGBA (`colormaps.js`), which filters everywhere. The colour maps
      are 8-bit colours anyway: the picture is identical in Chrome (same LUT histogram, white
      7.9 %, black 88 %). The dev `__sonarHist` reads the 8-bit table.
    - **Audit of the other textures:** the terrain is half-float with linear filtering (filterable
      in WebGL2 everywhere), the marks are float with nearest filtering, and the depth textures
      use nearest filtering. All are fine in Safari.
    - The public test page (GitHub Pages) and the Artifact were rebuilt with the fix.
    - **Lesson:** test Safari/WebKit before sharing. No Safari was drivable from this session,
      because Xcode is not installed for the iOS simulator and Safari is read-only for Claude.

74. **2026-09-26** — **Retrospective: lessons and project skills** (Jason: "你们一起去回顾一下项目做下对之后有帮助的
    技能总结吧"). `docs/lessons.md` sums up decisions #1–#73 and every Lab chat's notes, with a Chinese summary for
    Jason. Three project skills in `.claude/skills/` (`sonar-qa`, `sonar-look-tuning`, `lab-test-link`) turn the
    repeatable procedures into steps a new chat loads automatically. The node checks that were in the scratchpad are
    now `scripts/dev/fish-sim.mjs` and `scripts/dev/layout-dump.mjs` (plus the import hook). `CLAUDE.md` points to
    all of it.

75. **2026-09-27** — **Near-field fish 40 % brighter** (Jason, on a PL Forward frame in ~18 ft with dim marks near
    the boat: "进场[近场]的鱼要亮40%"). In the side views the fish echo is ×1.4 up to 8 m from the transducer, fading
    back to ×1.0 by 16 m (`sonarShader.js`). Bottom, structure and Panoramic are unchanged. Quick check only
    (small change): renders, no console errors.


76. **2026-09-29** — **Public test link updated to the latest Lab (includes #75); phones use the same link**
    (Jason: "手机版本的能不能也暂时上线一下", then "a" = update the existing link now rather than build the
    planned mobile version).
    - The public link https://jasonzhu-ctrl.github.io/accuphy-lab-test/ already worked on phones with the
      current simple portrait layout. It is now rebuilt from fb3cec6, so it includes the near-field fish
      ×1.4 (#75). Public repo commit c4acb14; the live page's md5 matched the build ~30 s after the push.
    - Checks before sharing (a small change, so a scaled pass):
      - production build OK;
      - Safari texture audit OK: the linear-filtered textures are 8-bit (LUT, logo SDF) or half-float
        (terrain), and the float textures are nearest-filtered;
      - PL Down with near test fish renders bright, not black, with no console errors;
      - the share build served locally: fonts inlined, zero network requests, no sign-up gate, title
        and panel read "Accuphy Lab", Down / Panoramic / Mini Combo render, no console errors.
    - Not done: the private claude.ai Artifact (#70) was not republished, so it is one version behind.
      Friends use the GitHub link.
    - The planned mobile version (`docs/mobile-marketing-plan.md`) is still planning only. The phone
      layout on the link has known weak spots:
      - the "Drag the boat" hint is cut at the left edge;
      - the top half is mostly empty water;
      - landscape phones are broken;
      - budget Android runs at 10–24 fps.

77. **2026-10-03** — **Phones: the camera zooms out so the boat is small and the whole beam footprint shows**
    (Jason: "整个界面的比例有问题 … 应该是 zoom out … 这个船应该更小一点", then "开始吧，开搞" on the plan in
    `docs/mobile-phone-layout-plan.md`, phase 1).
    - `Rig` in `Scene.jsx` keeps the desktop view direction. When the screen is narrow it pulls the camera back
      until ~70 m of lake fit across the screen. The factor is k = max(1, 70 / (2·tan(fov/2)·aspect·|D|)), so
      it is 2.4× on a 390×844 phone and 1 on desktop.
    - A view offset centres the lake in the part of the screen above the phone frame.
    - Fog density and the scene fog are divided by k, and the far plane is multiplied by k, so the lake stays
      as clear as on desktop.
    - On phones a step preset re-centres the view on its boat (`frameX`), and there is no pointer parallax.
    - The drag hint stays inside the screen.
    - Desktop framing is unchanged (k = 1).
    - Checked at 390×844 (PL Forward, Down, Panoramic: boat and full footprint visible, no console errors)
      and at 1440×900 (same framing as before). The build passes.
    - Phases 2–4 (layout with the phone frame on top, touch drag, landscape and quality tiers) follow.

78. **2026-10-03** — **Phone layout: the big panel goes, the controls move onto the phone, and the water gets the space**
    (Jason: "船好像有一点太小了 可以取一个稍微中间一点的值"; "range … 直接做到手机 APP 里面去 … view … 胶囊 … 贴到手机框的
    上面去 … 空间给更多的水面"). This applies below 640 px only; desktop is unchanged.
    - The phone zoom is LAKE_W 50 m, between today's 29 m and #77's 70 m.
    - The big Lab panel is hidden on phones.
    - The phone frame sits at the bottom, full width with a 12 px gutter and a safe-area inset, in a near-flat
      pose (rotY −4°, rotX 2°). `phonePose()` in `SonarScreen.jsx` keeps the GL picture's perspective
      matching the frame.
    - **Range is set with the app's own −/+ on the phone screen.** `LiveCtl` in `SonarChrome.jsx` gives full
      brightness and a ~36 px hit area. The steps are 20 · 30 · 40 · 50 · 60 · 70 · 80 · 100 · 120 · 150 · 180 ·
      200 · 240 ft, up to the device's maximum. The buttons are greyed out in Down (AUTO). The other app
      buttons stay display-only.
    - **The View capsule sits on the frame's top edge**, about 44 px tall. The device switch is a small
      capsule at the top right, next to "← Lab".
    - About 70 % of the screen is now lake. The camera frames the lake above the capsule.
    - `viewport-fit=cover` was added to `index.html` and `share/index.html`.
    - **Checked:**
      - 390×844: PL Forward with the boat and the full footprint visible; range +/+ goes 80 → 100 → 120 ft;
        no sign-up gate; no console errors.
      - 360×740: PingLive Mini, no overlap.
      - 1440×900: the panel and the locked app buttons are as before.
      - The build passes.
    - **Known:** at long ranges (≥ 120 ft) the Forward fan runs past the right screen edge on a phone. Still
      to do: touch drag (phase 3), landscape and quality tiers (phase 4).

79. **2026-10-03** — **Phone app controls bigger and easier to tap, in the app's own style** (Jason: "range 的按键…稍微
    大一点…加号跟减号能不能稍微分开一点…不要破坏原本 APP 的界面的协调性…图标…视觉上更容易分辨…点击起来更容易").
    - On phones the whole app control set scales by 1.55× together: range, gain, pause, back, ⋯ and the depth
      control. This keeps the proportions of the real app's bottom bar (`reference/app-study/pl-forward-empty-chrome.jpg`:
      ring buttons ≈ 5 % of the screen height, thick white outlines).
    - The range − and + are now 62 px apart, centre to centre (18 px rings with ~42 px hit areas, so they never
      overlap).
    - − and + are drawn as SVG (a thick circle outline plus round-capped bars), the same glyphs as the app. Before,
      they were text characters, which sat off-centre.
    - Working controls (range) are full white. Display-only controls keep the dimmed look, so the two are easy to
      tell apart.
    - Desktop keeps its sizes; it only gets the crisper SVG − / + glyphs.
    - Checked at 390×844 and 1440×900, with no console errors; the build passes.

80. **2026-10-03** — **Phone drag stays as it is: the boat runs to the finger and follows it** (Jason: "就是手，它会跑到这个
    手指，就跟着这个下面，我觉得很好"). Phase 3's relative "swipe to move" drag (`docs/mobile-phone-layout-plan.md`) is
    dropped. Its other point, keeping the drag hint inside the screen, was already done in #77.

81. **2026-10-03** — **Public test link updated with the new phone layout** (Jason: "好啊，你把它公开出来").
    https://jasonzhu-ctrl.github.io/accuphy-lab-test/ is rebuilt from b919bb3 and covers #77–#80. Public repo
    commit 5bff6f7; the live md5 matched about 30 s after the push.
    - **Checked before publishing:**
      - the Safari texture audit is unchanged and OK;
      - the share build was served locally at 390×844: phone layout, the panel hidden, the range + steps
        80 → 100 ft;
      - zero network requests, no sign-up gate, no console errors.
    - The private Artifact (#70) is still not republished.

82. **2026-09-25** — **Market learning gets a shared home: `docs/market/`** (Jason:
    "基于你对我们的全盘了解 做深入用户和市场研究 持续学习如何让accuphy卖得更好").
    Research round 1 builds on round 0 (`docs/users-and-market.md`, 2026-09-24) and sets up
    the loop for continuous learning:
    - `docs/market/` holds the working memory every chat reads before giving sales or
      marketing advice: the round-1 report, a metrics baseline with the exact read-only
      Shopify / Klaviyo queries to rerun, competitors, voice of the customer, a scored
      experiments backlog (E1–E20) and an append-only learning log (L1–L24). Drive
      `My Drive/Market Research/` stays Jason's long-term company copy.
    - Cadence proposed: a light refresh in the first week of each month; deeper reviews after
      Black Friday (≈ 10 Dec), after ice-out (≈ 1 Apr) and before the season plan (≈ 1 Aug).
    - Round 1's headline findings: US shoppers can only buy the Mini online and lose most
      checkouts at the last step (US market adds duties at checkout); "no black box" stopped
      being unique when LiveScope 2 launched, "no display to buy" is the claim no rival has;
      the ice season (Nov–Feb = 43 % of store orders) starts now.
    All recommendations are proposals: nothing in the store, Klaviyo, ads or the Lab changes
    until Jason says go.
    (Written as #54, then #60, #77 and #79 on the research branch `claude/modest-keller-ccfnhq`; renumbered #82
    when merged with main on 2026-10-03, where #79–#81 had been taken by the phone work.)

83. **2026-10-03** — **The Lab's boat: a low-key bass boat, kept simple** (Jason, on `docs/boat-fish-plan.md`: "我觉得
    bass boat 是 OK 的船型 … 船头上翘，我觉得不需要 … 两根 power pole 太麻烦了。传统的电动马达也先暂时不用动。船身的话做的稍微
    低调一点 … 不用太抢眼了，这个不是重点").
    - **Boat type:** a bass boat stays the Lab's boat. The #56 aluminium deep-V is not part of this work.
    - **No raised bow.** Jason read "船头上翘" as the nose lifting while planing; that is not in the plan and stays out.
      The hull's own deck line (sheer) is drawn almost flat, and Jason judges it on the first look.
    - **No Power-Poles.**
    - **The trolling motor and the PingLive transducer stay as they are** for now. Phase 2 therefore no longer needs
      the product photo.
    - **Low-key finish:** a muted hull (charcoal / dark grey), at most a subtle side line, no bold metalflake or
      graphics. The boat is not the focus.
    Planning only: the rebuild waits for Jason's go (`docs/boat-fish-plan.md` §5, phase 2).

84. **2026-10-03** — **Desktop: the range moves onto the phone, and the phone gets a little bigger (plan B)** (Jason, on
    `docs/desktop-phone-controls-plan.md`: "B 方案吧，然后本地的对话做好了").
    - The desktop counterpart of #78/#79. The panel's Range row goes; the app's own range −/+ on the phone set the range on
      every layout.
    - The phone frame becomes `min(42vw, 600px, 83.2vh)`: about 74 % of a real iPhone 16 Pro Max on a laptop and about
      real size on a 24″ monitor (true size would cover 57 % of a laptop screen).
    - The whole app control set scales 1.3× on desktop (range ring ≈ 16 → 23 px), so the app keeps its proportions; − and
      + sit further apart and get a hover state.
    - Unchanged: the other app buttons stay display-only and open the sign-up gate; Down greys the range buttons (AUTO);
      Combo shows none, as in the real app.
    - **Built by the local phone-layout chat**, which owns `index.jsx` and `SonarChrome.jsx` (#77–#81). Build steps and
      checks: the plan's "Build" section.

85. **2026-10-03** — **Fish: phase 1 starts; the species stay; display size per species** (Jason, on
    `docs/boat-fish-plan.md`: "鱼的第一步可以开始。鱼的品种还是保留吧。黄鲈鱼 OK 的可以放，就是你新的这些。二点六倍的话，要不稍微小一点？
    呃，我觉得可能是要根据鱼种来了。就像 musky 的话，就保持现在的大小，就不要动了，甚至可能再小一点。但是剩下的鱼的话，我觉得现在的大小是
    OK 的").
    - **Phase 1 is a go** (plan §3a): the body bends with a travelling wave on the GPU, the tail beats faster when the fish
      swims faster, the body curves in turns, the wrong-axis "wag" (a nose-up/down rock) goes, and bait fish get cheaper
      geometry. The cloud chat builds it.
    - **Species:** every species in the lake today stays. Yellow perch and northern pike are added in phase 3, with their
      own body shapes (plan §3b–c). The new counts (more walleye, fewer smelt) are shown then for Jason's look.
    - **Display size per species.** Fish are drawn larger than life so they read from the boat:
      - the musky stays at today's size (2.6×, 3.4 m drawn) or a little smaller; Jason picks from a side-by-side;
      - every other species keeps today's 2.6×.
      The sonar is not affected: its fish marks use the true length.
    - Still open: where the boat comes from (code, recommended, or a model). Phase 2 waits for Jason's go.

86. **2026-10-03** — **Fish phase 1 built: the bodies swim with a travelling wave** (go: #85; plan:
    `docs/boat-fish-plan.md` §3a).
    - **What changed:**
      - Each body bends sideways with a wave that runs from head to tail, drawn on the GPU (`lakeMaterial.js`). The
        amplitude is a little head recoil growing to 0.1 of the length at the tail tip (the carangiform envelope),
        times an activity that follows the fish's own speed: a gentle sway when it cruises slowly, a full beat from
        about 1 body length per second.
      - The tail beats at 1.5 × body lengths per second, with a cruising minimum that is slower for big fish
        (musky ≈ 0.6 Hz, bass ≈ 0.95 Hz, smelt ≈ 1.6 Hz).
      - The body curves into quick turns. When a fish slows hard (the end of a dart, a salmon burst), it straightens and
        glides.
      - The old "tail wag" is gone. It turned about the wrong axis, so every fish rocked its nose up and down at the
        same ~1 Hz. Pitch now comes only from rising or sinking.
      - The fish geometry stays indexed, so a shared vertex is computed once. The 205 smelt use a lighter body
        (174 triangles instead of 742).
      - Markings stay on the body when it bends. The sonar is untouched: its fish marks are computed separately.
      - Per-species display size (#85): one helper, `drawnLen`, now sizes and clears every drawn fish, and a species
        may set its own `scale`. All species still use 2.6×; the musky waits for Jason's pick from a side-by-side
        (2.6× / 2.2× / 1.9×).
    - **Tuned against the plan**, after simulating speed, beat and bend for every fish:
      - The turn bend follows the turn rate, not the path's curvature. The curvature version held 30–50 % of the fish
        in a permanent C, because the swim loops are tight for fish drawn 2.6× long.
      - The activity starts at 0.35 instead of 0.15, and the beat has a minimum of 1/√(drawn length) Hz. Otherwise
        most big fish (0.1–0.4 body lengths per second) drifted almost rigid.
    - **Checks:**
      - default desktop view: 95 draw calls (unchanged); 875,617 → 759,177 triangles per frame (−13 %);
      - `fish-sim.mjs` for 15 simulated minutes: 0 structure, bottom or surface hits; lowest gap 0.37 m;
      - the sonar screen is pixel-identical before and after (same virtual time, 3 frames);
      - the build passes; no console errors on desktop or at 390×844; no new textures (Safari rule);
      - before/after clips on a fixed virtual clock: seen from above, the bass is rigid before and shows an S-wave
        about once a second after.
    - **Known / next:**
      - In the default overview the fish are small, so the change shows mostly up close.
      - Not yet built: random glides for trout, and a pectoral flutter for hovering fish (phase 3, with the fins).
      - From straight above, the dorsal fin (a flat card) shows as a thin dark line when the body bends. Phase 3 makes
        the fins thinner and semi-transparent.
    - **Dev aid:** `?cam=fish:<species>[:<index>][:top|:side|:tq]` now follows the fish on the scene's own clock (the old
      camera used another clock and lost the fish). It can look from above, from the side, or three-quarter.

87. **2026-10-03** — **Boat phase 2 starts, built in code** (Jason, after the phase 1 report and the question "第 2 步（做新船）可以开始吗？
    船用代码自己做（我推荐），可以吗？": "好的，确认一下，你这个现有的这个 task 跑完之后就可以开干了啊").
    - Phase 2 of `docs/boat-fish-plan.md` (§5) is a go, with approach A: the hull and topsides are built in code (no
      model licence, small, the transducer placed exactly).
    - #83 still applies: a low-key bass boat, a nearly flat sheer, no raised bow, no Power-Poles, the trolling motor and
      the PingLive transducer as they are (only re-seated on the new deck), a muted charcoal hull.
    - The beam apex (`TRANSDUCER_OFFSET`) does not move, so the sonar picture stays the same.
    - Still open: the musky's display size (it stays at 2.6× until Jason picks); no change to the swimming was asked for.
    - Built by the cloud chat. Files taken: `boat.js` and, in `Scene.jsx`, the `Boat` and `Water` components and the dev
      boat camera in `Rig` (backlog).

88. **2026-10-03** — **Boat phase 2 built: a low-key bass boat in code** (go: #87; spec: #83 and `docs/boat-fish-plan.md` §5).
    - **Hull** (`boat.js`): lofted with three.js `LoftGeometry` through 33 V sections, 6.63 × 2.44 m.
      - About 19° deadrise at the transom, sharpening to about 32° forward. A pad keel aft, two lifting strakes and a
        chine flat per side.
      - The sheer is almost flat (+4 cm toward the bow). The bow is pointed and lightly flared, and the forefoot lifts
        clear of the water about 1 m behind the tip. The transom is squared.
      - A rub rail runs round the sheer. One thin, muted side line; a charcoal gelcoat with a soft clearcoat (low
        metalness, so it is no longer pitch black); no logos.
    - **Topsides:** bow and rear casting decks in grey carpet with hatch seams, and a sunken cockpit between them.
      Rounded driver (starboard) and passenger consoles with wraparound tinted windshields and a wheel. A three-seat
      bench, and bow and rear pedestal seats. A plain black 250-class outboard on a jack plate (no badges).
    - **Unchanged (#83):** no Power-Poles. The trolling motor and the PingLive on its shaft are the old parts, only
      lifted 23 cm onto the higher deck. The beam apex (`TRANSDUCER_OFFSET`) does not move.
    - **No bow display:** real bass boats carry one, but a dedicated screen would contradict "no display to buy" (the
      phone is the display).
    - **Water contact** (`Scene.jsx`):
      - a gentle visual bob (heave ±4 cm, roll ±0.9°, pitch ±0.6°); the beam apex stays put, so the sonar does not
        jitter;
      - a foam ribbon along the waterline, wider at the bow, which shows when the boat moves;
      - a soft dark patch under the hull;
      - a V wake at the Kelvin angle plus a churned centre while the boat is dragged, fading within about 10 m.
    - **Found on the way:** the water's wave shader moves its vertices within the plane, so the drawn surface is flat,
      and the old ripple-ring "wake" was never visible. The new wake is drawn as foam in the water's fragment shader
      instead; the wave quirk itself is left as it is (backlog).
    - **Two levels of detail:** about 9.4 k triangles up close; about 4.4 k from the overview or the phone camera (no
      seams, rail, glass, wheel or pedestal seats). Default desktop view: draw calls 95 → 74 (the boat's parts are
      merged by material); triangles 759 k → 756 k.
    - **Checks:**
      - before/after stills from six angles, and the desktop and phone views at rest and while dragging;
      - the sonar screen is unchanged: identical on the phone layout; on the desktop, identical apart from 125 pixels
        of anti-aliasing round the page's logo overlay;
      - the build passes; no console errors; the only new texture is an 8-bit carpet noise (Safari-safe).
    - **Dev aid:** `?cam=boat[:side|:bow|:stern|:top|:under]` views the boat from several angles. Without a suffix, it
      is the old stern-quarter view.

89. **2026-10-04** — **The new boat is approved; the musky is drawn 2.2×; fish phase 3 starts** (Jason, on the #88 report:
    "1. 可以 2. musky 2.2倍 3.可以").
    - **Boat (#88):** approved as built.
    - **Musky display size:** 2.2× its true length (was 2.6×), so the biggest musky (1.28 m) is drawn 2.8 m long instead
      of 3.3 m. Set through the per-species `scale` in `fish.js` (#85). Every other species stays at 2.6×, and the
      sonar keeps the true length. `fish-sim.mjs`: 0 hits.
    - **Phase 3 is a go** (`docs/boat-fish-plan.md` §3b–c):
      - eyes; a two-part dorsal fin for bass and percids; truer tails (walleye's white lower tip); fins with rays;
      - a `percid` body for walleye and the new yellow perch, and northern pike on the pike body;
      - the new counts (more walleye, fewer smelt) are shown to Jason when it is built.
      Built by the cloud chat. Files taken: `fishGeometry.js`, `fish.js`, `lakeMaterial.js` (the `FISH` blocks) and, in
      `Scene.jsx`, `FishGroup` and `Fish` (backlog).

90. **2026-10-04** — **Fish phase 3 built: eyes, real fins, walleye's own body, yellow perch and northern pike** (go: #89;
    plan: `docs/boat-fish-plan.md` §3b–c).
    - **Anatomy** (`fishGeometry.js`, shaded in `lakeMaterial.js`):
      - every fish has eyes: a black pupil, a gold iris (silver for smelt) and a catch-light; the walleye's eye is
        milky-silver and glows a little in the beam;
      - bass, walleye and perch get a spiny dorsal (a row of spines) plus a soft dorsal: joined by a notch on bass,
        separate on the percids. Trout and salmon get the small adipose fin, and every fish gets paired pelvic fins;
      - tails: bass slightly forked (was round); the walleye's lower lobe has its white tip;
      - fins are see-through (tinted toward the water) with darker rays;
      - smoother bodies on the big fish (16 sides instead of 14);
      - round spots instead of square ones (crappie mottling, lake-trout and chinook spots); softer bass blotches and
        walleye saddles.
    - **New bodies and species:**
      - walleye moves off the trout body onto a slender percid body;
      - yellow perch: a deeper percid body, olive back, 6–8 dark bars tapering down yellow sides, orange lower fins;
      - northern pike: on the pike body, green with rows of pale bean-shaped spots. Pike strike at bait now and then,
        like bass (48 strikes in 15 simulated minutes); perch scatter like the other bait.
    - **Counts** (Jason sees them now, #85):
      - walleye 6 → 16, along the drop-off;
      - yellow perch 25, in schools on the weedy shelf and the timber edge;
      - northern pike 4, on the weed edges;
      - smelt 205 → 137 (every third one removed after placement).
      Total 298 → 269. The 229 fish that stayed are exactly where they were; only the musky moved slightly, from its
      2.2× size (#89).
    - **Cost:** fish triangles ≈ 105 k → ≈ 140 k. The default desktop view is 76 draw calls (two more body groups) and
      791 k triangles: still below the 876 k before phase 1.
    - **Checks:**
      - `fish-sim.mjs` for 15 minutes: 0 structure, bottom or surface hits; lowest gap 0.37 m;
      - close-ups of every species before and after;
      - the shelf in Panoramic: fish marks look as before, with the new mix and no white blow-out;
      - the build passes; no console errors on desktop or phone; no new textures.
    - **Bug found and fixed while testing:** a body type missing from the swim wavelength table turned the fish
      invisible (NaN). The table now falls back to 0.9.

91. **2026-10-04** — **The middle of the lake becomes a gentle valley, at most 30 ft deep; the boat's three wake streaks
    are gone** (Jason, with a screenshot of the lake and the sonar at 55 ft: "这块区域左边是浅水 右边是岛屿
    我想把中间的部分做自然过渡 最深的地方做30ft深 然后船的那个浪像射线一样的三条 去掉吧").
    - **Terrain** (`terrain.js`):
      - the middle, between the west shelf and the island, was a 17 m (55 ft) plateau with steep walls. It is now a
        shallow valley. From the 5–6 m (16–21 ft) shelf the bottom eases down to about 9 m (28–29 ft) along a line
        between the shelf and the island, then climbs the island;
      - the deepest point in the middle is 29 ft (capped at 30 ft). 90 % of the middle slopes less than 10°; the
        steepest slope is 20°, on the island's flank (it was 63°);
      - the island now tops out at about 4.6 m (15 ft; it was about 8 m, 27 ft), so it still stands out above the
        shallower middle. East of the island the bottom settles at about 7 m (23 ft);
      - the deep floor past the drop-off is unchanged (24 m: lake trout, the wrecks, the lockup). The drop-off now runs
        from 28 ft down to 80 ft, a longer and gentler slope. The wrecks and the lockup still sit on the bottom;
      - at the default spot the depth goes from 54 ft to 28 ft (AUTO depth range 70 → 40 ft).
    - **No structure moved:**
      - the timber, bushes, rocks and weeds keep their places. Placement still uses the frozen depths of the lake
        before #91 (`layoutDepth`, #64); `layout-dump.mjs` shows 0 of 1,207 objects moved;
      - 44 of the 70 drowned trees are shorter, by 2.9 m on average, so every top stays at least 1.2 m under water.
        Before this change, 7 trees already stuck out of the water;
      - 40 of the 269 fish shift a few metres at load, by the existing step that keeps swim paths clear of structure.
        The rest keep their places. A new `keepUnderSurface` (`fish.js`) keeps every fish under the surface;
      - `fish-sim.mjs`, 15 simulated minutes: 0 structure, bottom or surface hits; lowest gap 0.43 m.
    - **Sonar brightness** (`sonarShader.js`, `SonarScreen.jsx`):
      - the problem: PingLive's wide fan met the new 8–9 m bottom inside the 6–14 m range where the bottom's soft cap
        ramps in, and AUTO depth zoomed it in. White pixels in the default view went from 6 % / 8 % (Down / Forward)
        to 19 % / 20 %;
      - the fix: for PingLive, the cap now also follows the depth below the transducer, ramping in from 5.5 m to 7.5 m
        (about 21–28 ft of water). The default view is back to 4 % / 9 %;
      - unchanged by the fix: the shelf, the island, the deep floor and every PingLive Mini view;
      - rejected: a range-only ramp (6–9 m), which dimmed the shelf (4.4 → 2.6 %) and the Mini at 28 ft (4.6 → 0.4 %);
      - full grid (6 spots × 6 views, plus the valley, the middle and the new drop-off): PingLive bottom scenes 3–15 %
        white. The Mini's range is as before: 0 % on its shelf, 9–21 % in Combo.
    - **Side effects for Jason to look at:**
      - over the island (now 15 ft deep), the Down view is a calmer orange. The shallow-water toning already used on
        the shelf now applies to its rocks: PL Down 12 → 1 % white; PL Forward 21 → 7 %;
      - Panoramic now meets the bottom over most of the screen, because the shallow middle is within its reach. At the
        default spot the lit area goes from 27 % to 59 %, with the same even crimson field.
    - **Wake:** the V wake (#88) is removed from the water shader. Its two Kelvin arms and the churned centre were the
      "three rays". The foam line along the hull, the bob and the contact shade stay.
    - **QA spots:** the sonar-qa "drop-off" spot (−20, 6) is now the gentle shelf edge (21 ft). The drop-off spot
      becomes (−3, −14): 37 ft, sloping to 70 ft (`.claude/skills/sonar-qa`).
    - **Checks:** the build passes; no console errors on desktop or phone; no new textures.

92. **2026-10-04** — **The middle slopes gently into the deep water instead of staying at 20–29 ft** (Jason, on #91, with
    a screenshot marking the area between the deep floor and the near middle: "刚刚的调整太不自然了 中间一下子变得只有20ft左右
    我要的是附件标记的大致的区域是相对缓慢得向深水过度 你懂吗").
    - **What was wrong with #91:** the whole middle sat at 20–29 ft, then dropped late and steeply to the deep floor
      (30–50° slopes across z ≈ −6…−24). Dragging the boat out of the deep water, the depth fell from 75 ft to about
      28 ft within 25 m and then stayed flat. Inside the marked area: 23–29 ft, median slope 5°.
    - **Where the marked area is:** his outline was projected through the desktop camera onto the lakebed. It is the
      corridor between the valley line and the island, from the deep floor's edge south to z ≈ +23 (x ≈ −7…17).
    - **Terrain** (`terrain.js`):
      - one long ramp from the #91 valley down to the 24 m floor across the middle. Along his drag path the depth is
        29 ft (z +22), 32 (z +10), 35 (z +4), 41 (z −4), 51 (z −12), 59 (z −20), 68 (z −30) and 75 (z −40);
      - inside the marked area the depth now runs from 23 to 61 ft, with a median slope of 13° (90 % under 23°);
      - the ramp eases in from the shelf edge and keeps clear of the island, so neither gets a wall. The shelf (x < −30)
        and the deep floor past the old edge (along ≥ 40) are exactly as before; the island top stays at 15 ft;
      - the old basin at (15, −28) is no longer needed, because the ramp reaches the floor there;
      - default spot: 36 ft (54 ft before #91, 28 ft in #91);
      - the small workboat wreck now lies on the slope (65 ft), so it is tilted to the bed's normal; without that, one
        end floated about 1 m off the bottom.
    - **Nothing moved:** placement still uses the depths from before #91 (`layoutDepth`). `layout-dump.mjs`: 0 of 1,207
      objects moved; 41 drowned trees are shorter than before #91 so that none breaks the surface. `fish-sim.mjs`,
      15 simulated minutes: 0 structure, bottom or surface hits; lowest gap 0.43 m.
    - **Sonar brightness** (`sonarShader.js`, `SonarScreen.jsx`; the #91 cap extended):
      - PingLive keeps its depth cap (5.5–7.5 m below the transducer). New: bottoms past that depth are toned no nearer
        than 80 % of the range window. In Forward (the visitor's fixed range), the nearer 30–40 ft bottom drew
        11–22 % white; now 7–11 %. Down's AUTO range already puts the bottom at about 80 %, so Down barely changes.
        At 0.9, Down in deep water started to dim (8 → 5 %);
      - the Mini gets its own cap: 7.5–9.5 m below the transducer at 80 % strength. Its 36 ft default had gone to 18–26 %
        (Down / Combo); now 8 % / 15 %. A full cap took it to 0 %, because its own near gain already dims it there;
      - final grid (15 spots × 6 views, including the drag path): PingLive bottom scenes 4–10 % white in Down and
        2–13 % in Forward. The Mini stays in its old ranges: 0 % on its shelf, 9–21 % in Combo. The shelf, the island,
        the deep floor and the wrecks look as before. No console errors.
    - **Checks:** build passes; desktop and phone show no errors; no new textures.

93. **2026-10-16** — **Two public test pages: PingLive + Mini, and Mini only; a version record** (Jason: "做两个不同的
    版本 一个是 PingLive 和 PingLive Mini 的 还有一个是只有 PingLive Mini 的 做好 version 记录 … 上线到两个没有常规入口的网页里").
    - A build variant: `VITE_DEVICES=PLM` (read by `vite.share.config.js`, used in `index.jsx`) makes the Mini-only
      page: no device switch on desktop or phone, the Mini is the device, the three step presets use Down / Forward /
      Combo with a Combo text for step 3. The page title is "Accuphy Lab · PingLive Mini". Unset, the page is the usual
      Lab with both devices.
    - Published on the existing GitHub Pages repository, both unlisted (noindex + robots Disallow), no sign-up gate:
      - https://jasonzhu-ctrl.github.io/accuphy-lab-test/ — PingLive + PingLive Mini
      - https://jasonzhu-ctrl.github.io/accuphy-lab-test/mini/ — PingLive Mini only
    - Built from main at 340e98d + this commit, so both pages carry #86–#92 (new boat, swimming fish, perch and pike,
      gentler lake middle) for the first time in public.
    - **Checked before publishing** (share builds served locally): both pages at 390×844 and 1440×900; the Mini page
      has no device switch and step 3 goes to Combo; the both page switches PingLive ↔ Mini; range + steps work; zero
      network requests; no sign-up gate; no console errors; the Safari texture audit is unchanged; both live md5s
      matched the builds.
    - `docs/versions.md` is the version record from now on: page, who can open it, URL, and a history of every build
      with the Lab commit and the public repo commit.
    - Where the pages should live long-term (Shopify, GitHub Pages with a custom domain, or another host) is being
      researched; nothing changes until Jason decides.

94. **2026-10-16** — **The ice-fishing version: the same lake frozen over, built locally, not published** (Jason: "基于你现在
    全部对我们设备的理解 利用网络上可以用的素材特效啥的做一个冰钓的版本 先不上线 先本地做了 视觉效果要好有问题要随时问我
    有需要我来选的视觉效果可以propose给我先"). The Ice scene of decision #53, as a third page beside Both and Mini.
    - **Where it lives:** inside the sonar lake experiment as `scene="ice"` (the lakebed, structure, fish, beams and the
      sonar engine are shared; only the surface, the vehicle and the picking change), with its own gallery card and URL,
      `src/experiments/2026-10-16-sonar-ice-3d` (`#2026-10-16-sonar-ice-3d`), and a build variant `VITE_SCENE=ice` for a
      later `/ice/` page. New files in the lake folder: `iceScene.js` (constants, presets), `iceSheet.js` (the frozen
      surface shader), `iceProps.js` (the Mini, the hole kit, shelter, sled, auger), `IceCamp.jsx` (the scene parts and the
      hole-hopping sequence), `snow.js` (falling snow), `iceSky.js` (the dome).
    - **The device is the PingLive Mini**, no device switch: the app's two ice views are the Mini's (home tiles "Ice
      Fishing" and "Live Ice Fishing", `reference/app-study/home-plm-row.jpg`), the ice persona buys the Mini (#57,
      `docs/market/report-2026-09.md` P1), and it fits a 10" hole.
    - **The scene:** half a metre of ice over the summer lake; wind-blown snow drifts over black ice with pressure cracks,
      bubble veins and frost where the wind scoured it; a 10" auger hole with a slush rim and shavings, the snow scooped
      away round it; the Mini on its cable from a transducer arm; a bucket, an ice rod on its holder with the line down
      the hole, a power auger standing in the snow; a pop-up hub shelter with a lit door and a sled a few metres away.
      Falling snow drifts with the wind; a sky dome (gradient, afterglow, stars, an aurora in the night preset) stands
      ready for the day the camera tilts up. Everything is procedural or built in code — no downloaded models or textures
      (nothing to license, nothing to load; Safari-safe like #73). Free CC0 sources were checked (Poly Haven HDRIs,
      ambientCG Snow/Ice) and can still be used if the look needs them.
    - **Hole-hopping is the interaction** (the hole-hopper persona): tap or drag on the ice → a blue ring marks the spot;
      on release the Mini is pulled up (the picture goes dark, like the app with the transducer out of the water), the kit
      walks over, the auger spins down and breaks through, the hole opens, the Mini drops in and the picture returns. Old
      holes stay as frozen-over discs (the ice remembers eight). The step presets (3 cards) use the same sequence.
    - **The beam through the ice** (#55 applied to snow): along the line of sight through each bit of ice, if the eye
      meets the beam the snow glows cyan-white and goes half-clear, so the cone and the lit bottom show through; the
      rest stays snow. (A straight-down test cut the window in the wrong place: from this camera the lit bottom lies well
      behind the hole.) Under the ice the lake materials get a stronger reveal and a lighter output curve
      (`uRevealGain`, `uOutGamma`, both 1 = unchanged for the summer lake).
    - **Display scales, like the fish (×2.6):** the hole ×2.4 (a real 10" hole is a 2 px dot), the Mini ×2.6, the hole
      kit ×1.5; the shelter and sled are life size. The camera is closer than the boat scene's (≈ 44 m) and on phones
      fits ~30 m of ice across.
    - **The app's ice views on the phone:** `liveice` = Live Ice (the flasher dial + the Live Down fan), `ice` = Ice
      Fishing (the dial + a scrolling 2D history, 8 pings a second, with the colour bar at the edge). The dial: depth
      clockwise from the top round a white ring, one tick and label per ruler step, the depth readout in the centre,
      returns from the Down fan's middle ±7° (fish included) painted in the app's **jet** map; both ice views draw in
      jet, as the app's tiles do (`?icelut=amber` keeps the Lab's amber for comparison). View pills on the ice: Live Ice ·
      Ice Fishing · Forward · Combo (Down is inside Live Ice). The range is AUTO in both ice views, like Down.
    - **For Jason to choose** (asked 2026-10-16, with screenshots): time of day `?time=dusk|day|night` (dusk is the
      default: blue-hour snow, the last warm light, the shelter lamp; day is a white-out where the glass UI loses
      contrast; night is dark blue — the aurora only shows once the camera tilts up), snow cover `?look=snow|mixed|glass`,
      and jet vs amber in the ice views.
    - **Checks:** `vite build` passes; the summer lake page renders as before (PL Forward default view, no console
      errors); the ice page runs with no console errors; hole-hopping, the flasher and the 2D history were watched in the
      browser. Not yet checked: phones in detail, the sonar-qa grid for the ice views, the hidden-pane first-frame rule.
    - **Not published**: no share build, `docs/versions.md` unchanged. A fourth public page would be
      `VITE_SCENE=ice node scripts/build-share.mjs <out>` into `/ice/` when Jason says so.

95. **2026-10-16** — **The ice is cut away round the hole: an ice island, a pool, the slab's edge** (Jason, on the first
    ice version: "我感觉有点奇怪 水里的画面和冰面的关系 有点confusing"). The first version let the beam glow through
    half-clear snow; with the snow opaque around it, the cone read as a glass pyramid standing on the surface.
    - **Now:** the kit stands on a round ice island (1.9 m) with the hole; round it the ice is opened as far as the
      beam reaches (a 7 m circle stretched by each fan's footprint — Forward opens a strip ahead), so the water, the
      cone and the lit bottom are seen as in the summer lake; the cut shows the slab's thickness as pale ice walls
      (`IceWalls`, rebuilt as the pool moves) with a bright lip on top. The Mini hangs under the island in plain view.
      The pool follows the kit when the visitor hole-hops. The glow window is off (`window: 0`).
    - The **black-ice look** (`?look=glass`) has no cut: the whole surface is see-through like the summer water, with
      sparse drifts and a calmer crack network (fading with distance). Kept as the alternative if Jason prefers no
      diorama; the snow-and-cutaway look is the default.
    - Under the ice the lake materials are lifted a little more (`uRevealGain` 1.9, `uOutGamma` 0.62), the dusk water
      is `#0e3240`, the beam curtain is a touch more solid on the ice page (0.2, edges 0.75). The summer lake is unchanged.
    - Shown to Jason with screenshots the same evening; his verdict decides between the two looks.

96. **2026-10-16** — **Black ice is the look; the surface rebuilt from real photographs** (Jason, on #95's two options:
    "图像关系我偏好最后一个 但是冰面的感觉有点太不真实了 你仔细想想调研一下").
    - **The picture relationship:** the whole frozen surface is see-through, like the summer water — the lakebed, the
      fish, the cone and the lit bottom show through it everywhere; no cutaway, no glow window. `?look=glass` is the
      default; `?look=snow` keeps the snow-and-cutaway version of #95.
    - **What looked fake and why:** the first black ice drew a honeycomb of equal voronoi cells over the whole lake,
      grey, the same everywhere; its snow was grey smears; the surface had no sky in it.
    - **Research (same evening):** reference photographs — Unsplash "frozen lake ice cracks" (dark ice with white
      cracks), Jan Erik Waider's Norwegian frozen-lake series (northlandscapes.com), Abraham Lake / Baikal bubble ice.
      Real clear lake ice: long, nearly straight refrozen cracks tens of metres long, a few bright and wide with a
      frosty halo, many hairlines, each with its own brightness and breaks, crossing at varied angles (not cells of one
      size); white bubbles frozen in; feathery frost patches; blown snow as crisp white brush strokes along the wind;
      and the surface is a mirror of the sky toward the horizon while it is a window straight down (Fresnel).
    - **The shader now** (`iceSheet.js`): Fresnel on a faintly undulating surface mirrors the same sky gradient the
      dome draws (horizon, zenith, afterglow — `uGlow`, `uGlowDir` from the time preset) plus a broad sun highlight;
      four crack families (two long bright ones, two hairline families in patches, fading with distance), each line
      with its own width, brightness, wander, breaks and a ±14° tilt so a family is a loose fan; bubbles; frost;
      specks; blown-snow strokes (anisotropic noise along the wind) with crisp feathered edges; the dark water shows
      through at ~80 % straight down. The same code shades the scoured patches of the snow look.
    - Checked in the browser at dusk: the cracks read as photographs do; the far ice takes the lavender sky; the
      smelt school, the lockup and the lit strip show through. Open: Jason's verdict on the realism, the time of day,
      jet vs amber. The summer lake is untouched (the ice code only runs with `scene="ice"`).

97. **2026-10-16** — **The black ice is shaded for the distance it is seen from** (Jason, on #96: "你的照片好像是黑冰的近景
    但是实际的是远景 这种很长的线条在远景不太可能"). Right: the #96 references were 1–3 m close-ups; the Lab's camera
    stands 45 m off with 40 m of lake across the screen. At that scale a thermal crack is a hairline a millimetre wide
    — invisible — and what the eye reads from the air is tone, the sky's sheen and the snow.
    - **Now** (`iceSheet.js`): a patchwork of clear black ice and milky refrozen "snow ice" plates (low-frequency
      noise, pale grey-blue, half opaque); faint wind polish along the wind; blown snow as the main pattern — broad
      patches and long strokes shaped by the wind, an opaque core with a thin dusting feathering out round it (cover
      0.27); at most two long faint lines (spacing 36 and 52 m, a soft white line of snow in the groove, not a bright
      crack); bubbles and specks only within ~30 m of the camera. The Fresnel sky mirror stays. The hairline families
      and the bright crack cores of #96 are gone.
    - The summer lake is untouched. Shown to Jason the same evening; his verdict pending.

98. **2026-10-16** — **The snow thins out over the beam, so the sonar coverage always shows** (Jason, on #97: "水里的声纳
    coverage的渲染被白色的雪挡住了"). The blown-snow patches and the milky plates were opaque, and where one lay over the
    cone the lit bottom disappeared. Now the view ray from each bit of ice is marched down through the water (the #94
    window test); where it meets the beam, the snow and the milky ice are reduced to 6 % with a faint breath of the
    beam's cyan, and the bare ice is left as it is. Decision #55 applied once more: whatever the beam reaches lights up.
    `LOOKS.glass.window = 1`. The snow look keeps its cutaway instead.

99. **2026-10-16** — **Dark water under a skin of ice; the beam is the only lamp** (Jason, on #98: "感觉水里的部分和冰的关系
    还是很奇怪"). Three causes, fixed together instead of patched one by one:
    - The lakebed under the ice had been lifted (#94's `uOutGamma`, `uRevealGain`) until it was as bright as the ice,
      so the two layers merged. Now the water is dark: the lake materials' fog is 2.4× denser under the ice, the fog
      colour `#061a24`, the output curve back to 0.8, and the reveal inside the beam stronger (2.4) — the bottom fades to
      black except where the beam lights it (decision #54's lamp in a dark room).
    - The sheet had no presence of its own: a faint constant skin of sky (Fresnel floor 0.045) now lies over the dark
      water everywhere, with the snow whiter against it (×1.35), so the eye reads a glassy surface over black depth.
    - The hole and the Mini were too small to tell the story "the device hangs through the ice": the hole is drawn
      ×3.4, the Mini ×3.8 and 0.9 m below the sheet, the hole shows its own wall (half a metre of pale ice, a bright
      rim) and a small cyan light at the Mini lights the wall and the device from below.
    - The cone-shaped thinning of #98 looked like a hole cut in the snow. Replaced: the snow stays clear within ~14 m of
      the hole (a soft, noisy edge — the angler set up on open ice) and thins only by half over the beam further out.
    - Shown to Jason the same evening; his verdict pending. The summer lake is unchanged.

100. **2026-10-16** — **Both cameras from the study are built as a switch: Top · Under the ice · Section** (Jason, on
     `docs/ice-relationship-study.md`: "a 和 b都做一下看看"). The ice page's panel has a Camera row; `?view=under|section`
     opens one directly; the aerial view stays the default until he chooses.
     - **A, under the ice** (`UNDER_CAM`): the camera sits in the water a few metres under the sheet, to one side and
       behind the hole, following it. The sheet is drawn from below as a lit ceiling (`iceSheet.js`, the back-facing
       branch): bright where the ice is clear (the sky through it, with the kit on the ice as silhouettes), dark under the
       snow and the milky plates, cracks and bubbles as light leaks, the hole a disc of daylight with a soft light shaft
       to the bottom (`LightShaft`), slow marine snow in the water (`MarineSnow`). The Mini hangs from the ceiling on
       its cable, the cone opens below it, the lit strip and the fish are the summer world. The auger now reaches 0.9 m
       down, so it breaks through the ceiling when the visitor hole-hops; the aim ring sits on the underside.
     - **B, section** (`SECTION_CAM`): the camera near ice level in front of the hole; everything beyond a wall 6.5 m in
       front of the hole is cut away — the lake materials and the ice discard it (`uClip`, never in the sonar passes), the
       beam curtain and the snow are clipped — and the cut shows its faces (`SectionFaces`): the ice slab's pale edge, a
       translucent water column darkening with depth, and the soil under the lakebed following the terrain profile. The
       camp stands beside the hole inside the cut. The sky dome shows above the ice.
     - The summer lake is unchanged (the new code runs only with `scene="ice"`; the cut uniforms default to off).
     - Shown to Jason as two screenshots; his pick decides which becomes the ice page's camera (or whether both stay).

101. **2026-10-16** — **The section is the ice page's camera; hole-hopping is made for it** (Jason, on #100's two
     screenshots: "我觉得是b 你要考虑冰上的移动操作哦").
     - `?view=section` is the default (`iceParams`); Top and Under the ice stay in the Camera row for comparison.
     - **Moving on the ice in the section view:** only the ice that is visible — behind the cut wall — takes a tap or a
       drag. A ray that meets the sheet's plane in front of the wall came through the water column or the empty cut, so
       it is ignored and the aim ring hides. After a tap the kit walks there, the auger drills, the Mini drops; the
       camera and the wall follow the hole, so the new hole is again framed with its section (the cut faces rebuild as
       the wall moves). The step presets use the same path.
     - The camp stands to the right of the hole (the panel covers the left), inside the cut; the hint sits on the ice
       above the hole (below it would hang in the water column).
     - The slab's cut face is drawn 0.8 m tall (0.5 m real) with a bright waterline under it, so the layer reads from
       25 m away; the water column face is more transparent near the top (0.28) so the Mini, the cone and the fish show.
       The camera is a little closer (26 m) and lower.
     - Still open for this view: phones; the slab edge should show the holes' cuts when a hole is near the wall; snow on
       the slab top; tuning of the water column's tint; the "Under the ice" view's future.

102. **2026-10-16** — **Where the Lab pages will live for ads: the existing Vercel team, upgraded to Pro** (Jason: "我担心
    Cloudflare 啥的再加平台我管不过来", then "升级吧", then "好了").
    - Research (Drive, Market Research: "2026-10-16 Hosting for the Accuphy Lab pages"): Shopify cannot hold a 2.3 MB
      WebGL page (256 KB Liquid cap, theme interference, subdomains redirect only); GitHub Pages forbids commercial
      sites, so it stays for friends testing only; Jason wants no new platform, so Cloudflare is out.
    - Vercel team "Accuphy" (slug `accuphy`, 1 member, hosts partner.accuphy.ca) was on Hobby (non-commercial).
      Jason upgraded it in the dashboard; verified by API: plan **pro**, active, period 2026-10-16 → 2026-11-16.
      Side effect: the partner portal is now within Vercel's terms too.
    - Not yet done: deploying the two Lab pages to Vercel (new project, `lab.accuphy.com` via one CNAME at Alibaba
      Cloud / 万网, Meta Pixel). Jason: "到时再放" — deploy at the ad launch, not before. Friends keep the GitHub
      Pages links until then.

102. **2026-10-16** — **The section view, first tuning round** (Jason: "换洞操作这样可以，继续把剖面版细调").
     - **Lens:** the section camera uses a 46° lens (the lake keeps 38°) and looks a touch higher, so a sliver of sky with
       the falling snow sits above the far ice, and the lit bottom still fits below. The lens goes back to 38° when
       another camera is chosen.
     - **The slab's cut face** is ice in section (`SectionFaces`, its own shader): white-blue and frosty at the top,
       clearer and bluer below, thin horizontal layers from the freeze-up, a few bubbles caught in it; first too white,
       then toned to blue ice. The waterline under it stays.
     - **The soil** under the lakebed has a dark sediment band under the surface, then brown, then dark.
     - **Marine snow** drifts in the water column in the section view too (cut at the wall).
     - **Layout on the ice page:** the three step cards stack under the control panel on the left, measured from the
       panel's height, so the whole ice band across the top is free for taps (it was under the cards). The camp stands
       behind-right of the hole with the door toward it, the sled beside it.
     - Checked at desktop and 375×812: the phone shows the ice band with the kit and the lit shelter, the slab edge and
       the section with the cone above the app frame. No console errors.
     - Left for later rounds: the slab edge opening where a hole is near the wall; snow lying on the slab top; the
       water column's tint; the camp's details; whether Top and Under the ice stay in the Camera row.

103. **2026-10-16** — **Section view, tuning round 2** (Jason: "好的" to round 1 — continue).
     - **The far ice closes up:** toward the horizon the sheet's alpha rises with the grazing angle, so the sky's mirror
       wins over what lies under it; the lakebed and the lockup no longer show through the far ice band (they did at
       60 m). Straight down the ice stays a window.
     - **Snow on the slab's edge:** the slab face re-evaluates the sheet's own snow mask (the same GLSL, fed the wind,
       the cover and the hole) at the wall, so a white cap sits on the cut edge exactly where snow lies on the surface
       behind it, and the open stretch round the hole stays bare.
     - **Phones:** a second section camera (`SECTION_CAM_PHONE`, closer, looking further down, 50°) frames the ice
       band, the slab and the cone with the lit bottom in the band above the app frame; the desktop camera is unchanged.
     - Checked at desktop and 375×812; no console errors. Noted: on phones the lockup still shows faintly through the
       ice band's lower part (a steeper angle); the shelter sits at the right edge there.

104. **2026-10-16** — **Phones open on the standing-timber flat** (Jason: "手机版本这块地方没什么结构和鱼怎么办", then
    "只是改手机"). The 50 m-wide phone view around the old start (−6, 4; 35 ft of open water) showed no structure, and
    the Forward picture was a bare bottom line, although ~90 fish live within 25 m of either spot. On phones the boat
    now starts at (16, 11), the 18 ft flat with standing timber and bass, walleye and pike 8–15 m ahead (the same spot
    as guide step 2), and the view is framed with the boat left and the timber right (`frameX` 30). Desktop keeps
    (−6, 4); the ice scene keeps its own start; `?boat=` still overrides. The lake itself is untouched.
    Checked: 390×844 boat (16, 11), trunks and fish on the sonar, hint on screen, no console errors; 1440×900 start
    unchanged; the build passes. Public pages not yet rebuilt.
    Same day, Jason: "我想正好把 Accuphy lab 露出来" — the opening view cut the ACCUPHY LAB lockup (x −1…31 at
    z −52). `frameX` moved from 30 to 15: the lockup is fully in view, the boat sits left of centre, the timber
    and the Forward beam stay on the right. Checked at 390×844, no console errors, build passes.

105. **2026-10-16** — **The Mini sits on a sonar pole, not on a dangling cable** (Jason: "声呐pole的使用方式你了解一下 他是固定
     在杆子下方的头上的").
     - **How an ice sonar pole works** (Garmin's Panoptix ice pole mount, Patriot IceFix 360, Summit / Brew City poles,
       Accuphy's own 0° Mount, sold as compatible with PingLive and PingLive Mini): the transducer is clamped to a head
       (a 0° bracket) at the bottom of a rigid pole; the pole stands in a three-leg base with a sleeve hub over the hole,
       a collar sets how deep the head sits, a handle at the top turns the pole to aim the beam, an arrow on the handle
       shows where it points; the cable runs up the pole to the shuttle or bag. Live sonar on ice is used exactly this
       way; nobody hangs the puck on its cable.
     - **Built** (`iceProps.js makePoleRig`): the three-leg base with rubber feet, the hub sleeve and depth collar, the
       pole (handle 1.25 m × kit scale above the ice), a cane handle with a brand-blue grip and the direction arrow, the
       head bracket at the foot with the Mini hanging from it, the cable up the pole and in a sag down to a router bag on
       the ice. The Mini is back at the fishes' display scale (×2.6, it had been pushed to ×3.8 to be seen on the cable),
       the hole drawn ×3.0.
     - **The head turns with the view** (`IceCamp.jsx`): the Mini's face forward for Forward and Combo, down for Down,
       Live Ice and Ice Fishing, with a short ease — as the angler would turn the 0° bracket.
     - **Hole-hopping lifts the whole rig** out of the hole and sets it down over the new one.
     - Dev aid: `?rigcam` looks at the hole kit from 4 m.

106. **2026-10-16** — **The ice surface, rebuilt for a professional look: real snow relief, the lamp mirrored in the ice,
     and the right amount of snow** (Jason: "效果要有大厂专业的感觉 现在既然画面关系变了我感觉冰面可以再逼真一点", then
     "雪堆不正常吧 冰钓一般不会选雪很厚的地方 理想的是黑冰？你调研一下再propose").
     - **Research** (`docs/ice-relationship-study.md` §七): clear black ice is the strongest and safest; snow insulates
       the ice, hides weak spots and makes slush and white ice, which guides and anglers avoid; on Lake Winnipeg (the
       core buyer's lake) strong winds keep the snow thin and even, slush only where it piles up at pressure ridges;
       deep snow belongs to small sheltered lakes; the first-ice black-ice window in early December is the prime time.
       Jason's instinct was right: the real surface is black ice with wind-thinned snow, not drifts.
     - **Snow relief** (`iceSheet.js`, `IceCamp.jsx IceSheet`): the sheet is now two meshes — a 240 m square at 0.5 m
       that follows the hole and is raised by the snow's depth in the vertex stage, and a far flat plane with a hole for
       it; the noise is in world space, so the near mesh moves without the snow moving. The snow mask and depth are one
       GLSL function shared by both stages; the fragment shades the snow with the true slopes (lit faces toward the sun,
       lee faces blue), so at the section camera's low angle the dustings and low drifts have edges and shadow instead
       of being decals. Depths: drift cores 6–9 cm, dusting 1 cm, strokes 2–3 cm, a 1 cm wind crust; nothing in the
       scooped ring round the hole; cover 0.2. The deeper drifts of the first attempt (25 cm) are gone with the research.
     - **The lamp in the ice:** the shelter's lit door is mirrored in the black ice — a tight glint plus a broad warm
       sheen toward the camera, like a lamp in a wet street — and raises the sheet's opacity where it shines.
     - **Options left for Jason** (§七): 1 Lake-Winnipeg black ice with thin snow (built, recommended); 2 first-ice
       season, 10–15 cm clear ice and no snow at all; 3 the deep-snow small lake (not recommended). 1 and 2 differ only
       in parameters.
     - Also this evening: decision numbers clashed with the phone chat (both #104); the pole rig became #105.

107. **2026-10-16** — **Phones: the app's Home (view-selection) page inside the phone** (Jason: "不同的 view option
    可以模拟在手机上的 app 的官方版本的选择页面进入吗", with "先接着优化 … 你自己再看看").
    - `home/AppHome.jsx` redraws the real app's Home from `reference/app-study/home*.jpg`: a dark page with one
      section per device — "PingLive" (Panoramic / Forward / Down, fan thumbnails), "PingLive Mini" (Live Forward /
      Live Down) and "Combo" (Live Combo) — rounded dark panels, labels under the tiles, and the Setting · Home · Map
      tab bar. The thumbnails are crops of the app's own tiles (`home/*.jpg`, 8–17 KB each). The page scrolls like
      the app. Sizes are in cqh of the display, like SonarChrome.
    - **Flow:** on phones the app's ↶ button (bottom-left of the sonar screen) is live and opens Home; tapping a tile
      enters that device + view and closes Home. The View capsule and the device capsule still work as shortcuts.
      The Mini-only build shows only the Mini and Combo sections. Desktop is unchanged (↶ stays display-only).
    - The share build inlines the thumbnails (`assetsInlineLimit` in `vite.share.config.js`), so the public page
      stays one file (2.45 MB; 6 data-URI JPEGs, no stray asset paths).
    - **Checked** at 390×844: Home opens with all six tiles loaded, "Down View" → PL Down, "Live Combo" → Mini Combo,
      Home closes after a pick, the page scrolls; production and share builds pass.
    - **Open for Jason:** should phones open ON the Home page (pick a view first, like the real app) or, as now, open
      straight on the sonar view with Home behind the ↶ button?

108. **2026-10-16** — **The ice is Lake-Winnipeg black ice with thin, wind-swept snow** (Jason, on the three options of
     #106 / `docs/ice-relationship-study.md` §七: "1吧"). Option 1 stands as built: 0.5 m of mid-January ice, black and
     wind-polished, dustings and strokes of a few centimetres with low drifts, the scooped ring of bare ice round the
     hole. Option 2 (first-ice season, no snow at all) and option 3 (deep snow) are not pursued. The snow look of #95
     stays reachable as `?look=snow` for comparison only.

109. **2026-10-16** — **The far shore and contact shadows** (the "大厂" pass, continued).
     - **The far shore** (`iceSky.js`): a dark spruce line sits just above the horizon all round, its tops uneven, hazed
       toward the horizon colour, with a few warm cabin lights among the trees. The section camera sees it in its sliver
       of sky; the summer lake never sees the dome.
     - **Contact shadows** (`iceProps.js shadow()`): a soft dark disc on the ice under the pole rig's base and the bag,
       the bucket, the rod holder, the auger (it travels with it when drilling), the shelter and the sled — things on a
       plane float without one.
     - Checked at desktop; no console errors of our own. Phone check with the next republish.

110. **2026-10-16** — **Phones open on the app's Home page; the view must be picked before anything starts; the Mini row
    shows all seven app views, unavailable ones under a frosted layer** (Jason: "我觉得是显示首页选视图 而且应该必须先选
    才能开始" and, with his screenshot of the Mini row: "可以只给 live down live forward combo ice fishing 其他的用那种我们也
    有的雾蒙蒙的一层的 点了就弹窗一下 available with Accuphy PingLive Mini").
    - **Home first (lake page, phones only):** the page opens with the lake and the boat alive but no beam and no sonar
      picture, the phone showing Home, and no View / device capsules. Picking a tile starts everything at once; ↶ reopens
      Home later. Implementation: `started` state in `index.jsx`; until the first pick `state.specs` is empty, so Beams,
      the sonar passes and the lakebed glow are off. Desktop and the ice page are untouched (they start as before).
    - **Mini row = the app's seven tiles** in the app's order and wording: Live Panoramic · Live Forward · Live Down ·
      Down Scan · Chirp Sonar · Ice Fishing · Live Ice Fishing, plus the "Combo" section with Live Combo (the app lists
      Live Combo under Combo, not in the Mini row — which is why Jason's screenshot had none). Thumbnails are crops of the
      app's own tiles (`home/*.jpg`, 11 files).
    - **Live:** Live Forward, Live Down, Live Combo (and the three PingLive views). **Frosted** (`.ph-frost`, the Lab's
      glass look, dimmed label): Live Panoramic, Down Scan, Chirp Sonar — a tap shows the toast "Available with Accuphy
      PingLive Mini" for ~2 s. **Ice Fishing / Live Ice Fishing** open the ice page where it has an address (dev: the
      gallery entry; public: `VITE_ICE_URL` once the ice page is published) and are frosted otherwise — so on today's
      public pages they are frosted too.
    - Same evening, Jason: "留一个 live ice fishing 吧" — the "Ice Fishing" (2D flasher) tile is dropped; the Mini row shows
      six tiles and Live Ice Fishing is the one ice entry.
    - Share build: 10 data-URI thumbnails, ~2.5 MB, no stray asset paths, no ice URL baked in.
    - **Checked** at 390×844: Home at start, no beam, 3 frosted tiles, toast text, Live Forward starts the view with
      beam + capsules, ↶ returns to Home; 1440×900 unchanged (no Home, panel, locked ↶); production build passes; no
      console errors. Public pages not yet rebuilt.

111. **2026-10-16** — **The section camera frames itself: the ice line and the lake bottom always fit** (Jason: "手机版水下的
     画面会挡住 是不是应该拉远一点还是我担心多了" — he was right; the section showed only ~11 m of water, and the default hole is
     11.5 m deep, so the lit bottom sat under the app frame on phones and would vanish at deeper holes).
     - On phones the band above the app frame is centred in the camera (a view offset, as the top view does for the lake).
     - Each frame the camera measures where the ice line at the hole and the bottom under it land in the band, then nudges
       two things: the pitch (the look point rises or sinks) until the ice line sits a third down the band on phones (45 %
       on desktop, where the sky and the camp matter), and the distance (1× to 2.6× along the line of sight) until the
       bottom sits inside 86 % of the band. Both ease, so hole-hopping to deep water backs the camera off smoothly and
       shallow water brings it in again.
     - Checked at 375×812: the kit and the shelter in the top third, the slab, the cone with its lit bottom well above the
       View capsule (zoom 1.25, pitch +2.6 m). Desktop behaviour at the default spot is unchanged.
     - Same night, Jason: "还是看不见" — phones now aim the ice line at 26 % of the band and keep the bottom inside 80 %
       (was 30 % / 86 %), so the lit bottom sits about a third of the band above the View capsule (f0a502b). Still to
       confirm on his own phone (he may have reopened the first .html file instead of the updated preview).

112. **2026-10-16** — **Fix: the Home-first gate is tied to the current layout, not only to the first pick.**
    Found while snapshotting the sonar for the realism review: a page that MOUNTS narrow (phone → Home first, `started`
    false) and then becomes wide (a phone rotated to landscape, a resized window, a browser pane that grows) switched to
    the desktop layout, where there is no Home page to pick from, but `started` stayed false — so `state.specs` stayed
    empty and the sonar picture was black for good. `index.jsx` now gates on `live = started || !phone`: desktop width
    always runs; the phone keeps "pick a view first". Verified: a 1440×900 tab that had mounted narrow renders the fans
    again (specs 1, uFanCount 1). The build passes.

113. **2026-10-16** — **The section camera solves its framing outright** (follow-up to #111; Jason: "你继续优化").
     - The per-frame nudging controller (#111) converged slowly, jumped on the first long frames (scene build), and
       settled at different zooms per browser (Chromium 1.0 vs WebKit 1.51 at the same 390×844) because its dead
       zones left many equilibria; 9 s after load the desktop picture was still mostly sky (shot D1).
     - Now `Rig` bisects on a probe camera that carries the live projection (fov + phone view offset): the look height
       `secDy` so the ice line at the hole sits at 26 % of the band on phones / 45 % on desktop, then the smallest
       zoom ≥ 1 that keeps the bottom under the hole inside 80 % / 90 % (16 + 14×16 placements, cached while the hole,
       the depth, the viewport and the band are unchanged; re-solved every frame only while the kit walks).
     - Result: identical framing at 4 s and at 12 s and in both engines (desktop zoom 1.00 / dy 1.33; 390×844
       zoom 1.06 / dy 1.90; 375×667 zoom 1.17; 430×932 zoom 1.05). The camera still eases toward the solved target, so
       hole-hopping keeps its smooth follow. Tooling: headless GPU screenshots (Playwright 1.63 browsers already on
       this Mac, `playwright-core` in the session scratchpad) now give pixel-exact desktop, phone and WebKit shots.

114. **2026-10-17** — **Phones: every control is the real app's own control** (Jason: "这些控制我想都做在手机上控制的那一头
    模拟真实的 accuphy sonar app 里面的功能 我记得你以前是用过看过的"). The Lab's View and device capsules are gone on phones;
    the phone's chrome does everything, modelled on `docs/app-chrome.md`:
    - Home (↶) picks device + view (#107, #110); range −/+ (#78); **gain −/+ live, 1 % a tap**; **pause/resume** (freezes the
      lake and the picture, the ring shows ▶ while paused); **depth-range −/+ on PL Forward live** (the app's steps, AUTO goes
      off on the first tap); **⋯ opens the image-settings panel** like the app's right-hand menu (three tabs down the left,
      image tab live): Contrast −/+ (5 %), Noise Reject −/+ (5 %), TVG (display 25 %), Color Map ▸ list of the 13 maps with
      app-style names (orange = garmin_amber, classic = jet …), × closes. Desktop keeps its panel; its app buttons stay
      display-only.
    - `SonarChrome` takes an `app` object (`index.jsx` builds it on phones only); `AppMenu` lives in SonarChrome.jsx.
    - `touch-action: manipulation` on the live controls, tiles and buttons (no iOS double-tap zoom on repeated taps —
      the one phone-review finding that survived before the review was cut off by the session limit).
    - Checked at 390×844: no capsules; gain 57→59 %, depth 70→80 ft manual, pause/resume, menu: contrast 40→45 %, noise
      30→25 %, map → classic; no console errors; build passes.

115. **2026-10-17** — **Ice: one signal gate for everything the sonar lights** (ice polish round, Jason: "你继续优化").
     - Hole-hopping showed cause and effect apart: the cone and lit bottom kept shining and slid with the kit while the
       Mini hung in the air, the destination lit before the auger broke through, the readout kept counting, and the
       screen snapped back in one frame.
     - Now one scalar `s.signal` (0..1), set in IceCamp from the geometry (transducer below the ice's underside, ±5 cm
       hysteresis; falls at 10/s, recovers at 3/s), drives the lit footprint (`uBeamGain`), the ice window and hole glow
       (`uBeamOn`), the cyan light, the wedge opacities, the phone's echo (`uSignal`), fish marks (from 0.6) and the
       depth readout ('-- ft' below 0.5). `s.noSignal` stays the hop state machine's boolean.
     - During a hop the phone reads "app on, no echo" (white dial ring, '-- ft', navy fan, a dark gap in the Ice Fishing
       history) and comes back bottom first. Whether the real app does exactly this out of the water is unverified —
       show Jason. Every new knob is 1 on the summer lake (regression shots: no change beyond run-to-run noise).

116. **2026-10-17** — **Ice polish, narrowed round: four improvements** (Jason, after a token-heavy review round he paused:
     "要不要把范围稍微缩小一点点" → "可以啊 … 你觉得必要的就做嘛"). Picked from the ranked critique (35 items, 15 packages,
     kept in the session scratchpad); the rest waits, including every taste choice.
     1. **Ice Fishing history opens filled**: a one-shot prefill writes a plausible recent record (same bottom, per-ping
        speckle, a hair of wobble) the first time the view opens with a live signal; it used to be empty for 48 s.
     2. **The drill hint** sits on open ice left of the kit (not on the pole rig), clear of the desktop panel, with a tap
        icon instead of the drag arrow.
     3. **A jig**: a 1-px line from the rod tip straight down the hole to a small gold spoon held 1.6 m above the bottom
        and worked like an angler (three quick pops, a dead stick with a tremble; reeled up during a hop, sinks back after).
        It is one small mark in sonarMarks (`s.jig`), so the dial, the Live Down fan and the 2D history all show it —
        cyan-yellow, far fainter than the red bottom (`?jigs=` tunes it, default 0.6). Fish rising to it: not yet.
     4. **The section**: the cut face is lake ice as photographed — a thin white crust over dark glassy black ice with
        vertical candles and bubble strings, a sky-lit edge and a rough underside (no more horizontal stripes); the water
        face shows a soft daylight shaft under the hole and a lit ice underside around it (faint at night).
     - Summer page unchanged (regression shots within run-to-run noise). Lesson about cost: see memory
       `no-big-agent-fanouts` — ask Jason before any multi-agent run.

117. **Phone app menu: Color Map only** (Jason 2026-10-17: "noise reject这些功能不要加进去"). The ⋯ image-settings panel
     inside the phone (#114) no longer has the Contrast, Noise Reject and TVG rows or the greyed "Image Stabilization ·
     Interference Rejection · Fishing Mode" line; only Color Map ▸ and its list stay. Gain −/+, pause, depth −/+ and the
     back-to-Home button are unchanged. Contrast and noise reject keep their tuned demo values (dev sliders only).

118. **Phone ⋯ settings: greyed and closed** (Jason 2026-10-18: "不对 把color map也去掉 这三个点的设置灰色按钮不让进";
     replaces #117). The image-settings panel is gone entirely, Color Map included. On phones the app's ⋯ button is drawn
     greyed like the other display-only controls and a tap does nothing. The live phone controls are now Home ↶, range −/+,
     pause, gain −/+ and depth −/+ (PL Forward). Colour map stays a dev-only slider (?dev).

119. **2026-10-18** — **Check-up after the parallel chats: no conflict; answers on the open points** (Jason asked whether the
    lake work (#91–#92) and the phone / ice work (#93–#118) conflict: "先调研一下有没有冲突 有没有问题").
    - **Checked on main `37c434f`:** the build passes; the desktop sonar grid (6 spots × 6 views) matches the #92 commit
      (largest difference 0.8 % white, fish positions); `fish-sim.mjs` 0 hits; no console errors at 390×844, 844×390,
      820×1180 and 1180×820.
    - **Found:** phone landscape is broken (the desktop panel and step cards cover the screen); iPads get the desktop
      controls; the public pages and the private preview predate the phone app UI (#107–#118); the ice page shares the
      lake folder (#94); #102 was used twice.
    - **Jason's answers:**
      - phone landscape: putting a phone frame inside a sideways phone is hard to use. The plan's "real device mode"
        (`docs/mobile-phone-layout-plan.md` Phase 4) is proposed: the sonar full-screen with the app's controls, the
        lake as a small inset. Waiting for his go;
      - iPad: not decided yet, because it depends on the final phone layout;
      - public pages and the private preview: leave them for now;
      - lake and ice sharing code: "这个确实要非常注意". Now a rule in `CLAUDE.md`;
      - decision numbers: avoid duplicates from now on (`CLAUDE.md` rule tightened). #102 stays as it is.
120. **2026-10-23** — **Fish marks rebuilt from the beam's point spread** (Jason: "声纳的画面的部分 … 无论是 PinLife 还是
    PinLife Mini 都还是不太行，特别是鱼的那个部分，鱼在游动也好啊，它转身也好啊，甚至它不动的时候，有时候是一种椭圆的球形的
    … 去大量的看 Garmin LiveScope 的视频，去优化你的画面引擎").
    - **Cause:** since #36 every fish was the smooth capsule of the path it swam in the last 0.7 s, so a swimming fish
      was a glowing oval along screen x, a hovering or turning one a round blob, and nothing changed ping to ping.
    - **Research:** `docs/livescope-fish-research.md` (LiveScope / ActiveTarget / MEGA Live specs, fisheries acoustics,
      angler reports; search excerpts only — the cloud container blocks YouTube, so no video was watched), checked
      against the app's own frames. The app wins where they differ.
    - **New model** (`sonar-style.md` §7.19; `sonarMarks.js` computeMarks → `sonarShader.js` fishDash):
      - the mark is the body now (tail → head), not the swept path; thin along the ray, a fixed angle across it
        (vertical fans 0.014 rad, Panoramic 0.03 rad): far fish are needles along the arc, near fish show length and
        heading;
      - swim-bladder kernel in the front half, weaker head and tail peaks; aspect swing 0.18–1 (was 0.5–1);
      - speckle on the beam grid that changes every ping (rim hard, core ±35 %, no holes); whole-echo flicker by
        activity and aspect (calm fish steady); tail beat 2–3.5 Hz; the echo of 0.2 s ago at 0.22 behind a moving
        fish; a faint sidelobe ladder on strong targets;
      - the ice page's jig keeps the old capsule (`legacyMark`), so the dial and Live Ice look as tuned.
    - **Panoramic:** §7.13 read the app's streaks as swim paths. The app's lake frame shows them mirrored left and right
      of the boat (`/` left, `\` right): they lie along the arc. Panoramic now uses the same model with wider beams.
    - **Dev aid:** `?fishlab` (dev builds only) puts scripted fish in front of and under the default boat: crossing,
      turning in place, hovering, toward/away, a musky, two under the boat, a crappie school.
    - **Checked:** the 6-spot × 6-view grid against the old engine on a second port: every tile within 0.4 points of
      white except PingLive Mini Forward at the deep spot (3.1 → 1.2 %: an almost black frame whose two fish carry the
      white share; they are now arc dashes, one facing the beam); bottoms, structure and the lockup unchanged;
      `fish-sim.mjs` 0 violations (lowest gap 0.43 m); build passes; the ice page in real time (headless crashes the
      ice page under the virtual clock in this container, old code too): jig and Ice Fishing history unchanged, an
      ice fish draws as a thin streak. Not yet: fps on a real phone (backlog).

121. **2026-10-23** — **The Mini offers four views only; every other view is frosted** (Jason: "我明确一下 Mini只保留Live ice
     fishing view, combo view, Live Forward, Live Down 别的全部blur不给access").
     - Open: **Live Forward, Live Down, Live Combo, Live Ice Fishing.** Frosted with no access: Live Panoramic, Down Scan,
       Chirp Sonar and **Ice Fishing** (the 2D-history view; the phone Home shows its tile again, frosted, with the app
       2.0.0 thumbnail, so the Mini row matches the app's seven tiles).
     - Ice page: the View row is now Live Ice · Forward · Down · Combo (`ICE_MODES`); step 02 opens Live Ice. The engine
       keeps the 'ice' view, it is just not offered.
     - Phone Home on the lake pages: Live Ice Fishing opens the public ice page — share builds now set `VITE_ICE_URL` to
       https://jasonzhu-ctrl.github.io/accuphy-lab-test/ice/ (it was frosted on public builds because no address existed).
       Takes effect on / and /mini/ only when those pages are rebuilt.

122. **2026-10-23** — **Fix: the app's back button** (Jason: "声纳界面上的返回按钮好像是有错的，你看一看").
     - It was the text glyph ↶, which fell back to a thin system arrow; the real app draws a solid white "reply" arrow
       (head left, tail curving down-right; `reference/app-study/2026-10-23/21-icefishing-12s.jpg`). Now an inline SVG of
       that shape, same size on every page (live on phones, dimmed/locked on desktop as before).
     - On the ice page on phones the button did nothing (Home was excluded there since #107/#114). It now opens the app
       Home like on the lake pages; Live Ice Fishing, Live Forward, Live Down and Live Combo switch the ice page's view,
       the other Mini tiles stay frosted (#121).

123. **2026-10-23** — **Three fixes from Jason: Combo in the Mini row, the whole Combo Down fan, a designed drill cue**
     - **Home:** Live Combo sits in the PingLive Mini row (after Live Down); the separate "Combo" section is gone ("不要单独
       再放一栏了 这样人家搞不懂"). The row: Live Panoramic · Live Forward · Live Down · Live Combo · Down Scan · Chirp
       Sonar · Ice Fishing · Live Ice Fishing, with only Forward, Down, Combo and Live Ice open (#121).
     - **Combo:** the Down fan's 3D beam and lit footprint were cropped to the phone panel (`box.xMin = -0.2·wd`), so the
       lake showed a triangle missing its lower-left corner ("下面的 coverage 左边缺了一个角"). The Down fan in Combo is now
       drawn whole in the water (both pages); the phone's Combo panel still crops its left side like the app does.
     - **Drill cue (ice page):** the glass pill with a glowing blue dot read as generic AI UI ("看着太 AI 了"). It is now a thin
       white reticle lying on the open ice left of the kit — four arcs and a ring that slowly spreads out of it every 2.6 s —
       with one plain caption under it, "Tap the ice to drill a hole" (sentence case, 13 px, no background). Precedent: the
       ground reticle of AR placement (Apple AR Quick Look / ARKit, Google Scene Viewer), which marks a spot on a surface
       instead of floating a button. Hidden after the first tap. The summer page's "Drag the boat" pill is unchanged.

124. **2026-10-23** — **PLM Combo at long range: the Forward panel's depth meets the water halfway** (Jason: "Range 拉到很高的
     时候 画面只剩下顶部那一点点"; on option A: "方案 A 会更好一点 但是抬高的再少一点 曲度跟原来保持相近").
     - The Forward panel's depth axis was always 0.7 × range (the app's proportion), so at 200 ft in 36 ft of water the
       bottom sat in the top quarter. Now it is `min(0.7·R, √(0.7·R × 1.3·D))` (`comboFwdDepth`, SonarScreen.jsx), the
       geometric mean of the app's proportion and the water: unchanged up to ~70 ft range in 36 ft of water, and at long
       range the bottom line rises about half as far as option A did. The 3D curtain (index.jsx) uses the same depth.
     - Option A (depth = 1.3 × water) and B (cap the range) are in docs/backlog.md for reference.

125. **2026-10-23** — **PLM Combo: the range is AUTO, like the app** (Jason's ask 1 of 4: the Forward part's bottom-vs-range
     relationship must be easy for a beginner).
     - The real app's Live Combo has no range control (`reference/app-study/2026-10-23/40-live-combo.jpg`), and the squeeze
       Jason hit (#124) only ever came from the Lab's desktop slider. Now Combo's range follows the water like Down does:
       about 3 × the AUTO depth on the range steps, 40–160 ft (`comboAutoRangeFt`); 120 ft at the default spot, 150 ft
       at the ice hole. The slider is dimmed and the panel says "AUTO · follows the water" (phones never had a Combo range).
       The Forward panel's depth keeps #124's rule, so the bottom sits mid-panel at every spot.
     - The beginner's model: Forward = you choose how far ahead; Down and Combo = automatic.

126. **2026-10-23** — **Ice page: every tap on the ice counts; a hop is at most 25 m** (Jason's ask 3: "往冰面的上面再去点
     它是过不太过去的 … 找哪一个区域最合适").
     - Cause: a tap near the horizon lands 60–300 m away, past the modelled lake (±58 m); it was clamped to the lake's
       corner (one 80 m walk in 0.9 s), and the next far tap resolved to the same corner and was dropped as "too close".
     - Now the destination is capped at `HOP_MAX` 25 m from the current hole in the tapped direction (and ±56 m of the
       lake); the aim ring shows that real destination while the finger is down; the walk lasts 0.9–2.1 s by distance.
       The tap area itself is unchanged and right for a new user: any ice behind the cut wall, which is all the ice in
       view; taps on the water section and the sky do nothing.
     - Checked: desktop far tap → 25 m hop; phone taps at four heights of the band → 8–16 m hops.

127. **2026-10-23** — **Ice page: fish come to the jig** (Jason's ask 4: "附近的鱼都比较自然 但是很快的能够到这个边上 又自然又快
     跟鱼饵能够有一些自然的互动").
     - fish.js: under the ice the jig replaces the boat as the attraction. A fish within its species' reach (perch 9 m,
       walleye 12 m, lake trout 16 m) may come: on entering, now and then while it stays, and above all when the jig is
       lifted (a pop calls fish in). It swims straight in (perch 1.6 m/s, walleye 2.4, trout 3.2 — a fish 8 m away is
       there in 2.5–5 s), stops a body length short, nose to the lure, hovers with the usual jitter, then drifts back —
       or, with a species chance (walleye 40 %, trout 35 %, perch 25 %), darts the last bit, touches the lure and
       bolts. Arrivals are paced 3–9 s apart, at most two fish at the jig. The dial, the Live Down fan and the history
       show the same visits.
     - A winter population: when a hole opens (the picture is black during the hop) six perch, two walleye, two crappie
       and a lake trout that live far from the hole are brought to 5–13 m from it, 1–3 m off the bottom, clear of
       structure (`winterCamp`) — so every hole has fish, as a good spot has. The summer lake is untouched (no jig).
     - Watched 64 s at the first hole: perch hover, a walleye bite, a lake trout visit; dev hook `window.__jig()`.

128. **2026-10-23** — **Sonar engine: structure drawn as the app draws it — solid columns, hot cores, black shadows**
     (Jason's ask 2 of 4: "结构物的画面跟真实的声纳的画面差距还是比较远"). References: the PL Forward wreck frames
     (`reference/app-study/ideal-picture-2-pl-forward-wreck/`) and the 2.0.0 Live Combo pilings
     (`reference/app-study/2026-10-23/40-live-combo.jpg`): a piling or trunk is a thick column with a white-yellow core,
     and the bottom band breaks off black behind it and comes back a few metres on.
     - The Lab drew timber as thin dark-orange strokes (pulse 0.08 m, 22 % dimmer than the bottom) with hatched crowns
       and no shadow — the bottom ran on brightly behind every trunk.
     - `sonarShader.js fanEcho` (vertical views): (1) the beam's main lobe across the slab is peaked, not a triangle
       (`wgt = 0.33 + 1.87·lobe^1.8`, same mean), so what stands on the centreline dominates; (2) rows that met
       structure in front of a pixel cast a shadow on it — the blocked weight share, fading over ~3.5 m, squared
       (`shade`), applied to the bottom's integrated echo, first return and edge but not to the structure itself;
       (3) timber and rock get a 0.3 m pulse (was 0.08), almost full brightness and a little orange smear behind the
       face; their peak gain 1.15 (was 0.9); steel keeps its #63 calibration (its own `spkS` at 0.9 × 1.3).
     - Measured (`__sonarHist`, % white, before → after): default PL Forward 11.6 → 11.1; Mini shelf Down 4.4 → 3.3;
       timber PL Forward 7.7 → 11.9 (target for structure 13–14); timber Mini Forward 1.5 → 3.0; small wreck
       10.1 → 8.4; big wreck 3.3 → 5.1. The approved bottom/fish scenes are unchanged within noise; the ice views too.
     - Not done: the app's near-apex clutter rays and its thicker bottom tail (a bottom calibration Jason approved earlier).

129. **2026-10-23** — **Sonar picture measured against LiveScope and the app: fish vs structure vs noise; water specks;
     smoother fish** (Jason: "重新去网页上面去看那种 Garmin LiveScope 的录屏的图像 … 理解它的这个成像这些鱼啊、结构啊跟噪声
     如何区别 … 纹理 … 总结这种成像的规律，然后去优化你的画面引擎").
     - The cloud container reached no website this time: every host except GitHub and the package registries is denied
       by the environment's network policy (Jason asked why: it is the environment's "Network access" setting, not a
       site blocking us). So the study used the 8 LVS34 frames already in `reference/app-study/livescope-lvs34/` and the
       app's own frames, measured instead of eyeballed: `scripts/dev/measure/meas.py` (LUT index through garmin_amber,
       polar ft/deg from each frame's grid). The numbers and the rules: `sonar-style.md` §7.20.
     - Found: fish were already right (#120); structure was dim and thin — fixed meanwhile by #128 (another chat), which
       the measurement confirms (piling at 14 m: 4.5 ft wide, peak 0.91; the app's 4.5 ft, 0.90); the water column was
       empty where the app's and LiveScope's carry small dim dashes (~4 % of the water in the app's frames).
     - Engine: `waterSpecks` in the vertical views (sparse, dim, fixed to the lake, blinking per ping, only above the
       bottom); fish core speckle ±20 % (was ±35 %) with a weak second ridge behind near or big fish; `__sonarSnap(w, h)`
       takes a size for even-scale measurement snapshots.
     - Checked: the 6 × 6 grid against main (#128): all 36 tiles within 0.3 points of white; the ice page in real time:
       jig and Ice Fishing history unchanged, a few faint cyan specks in the Live Ice water; build passes. Panoramic
       untouched.
130. **2026-10-23** — **The sonar engine is tuned against a real recording, like for like** (Jason: "我要你改的是去看现实的，就是
     真正的声纳画面，然后基于它去优化我们现在的画面引擎 … 你刚刚做的对不对？" — #128 had tuned structure from two app stills of
     other objects, by eye; this round follows the method he meant).
     - **Method.** Jason's vivo phone over adb playing the app 2.0.0's own recording of a wooden wreck on the PingLive
       Down View (80 ft, gain 40, contrast 47, noise reject 25, orange map); 20-frame bursts; the picture measured on the
       screen's own scale (28.2 px/ft): hull size, brightness classes, texture correlation, ping-to-ping flicker, the
       bottom band's thickness, the colour ramp (docs/sonar-style.md §10). Then the Lab renders the SAME scene —
       `?study=wreck` puts a wooden copy of the workboat (×1.25 ≈ 12 m) beside the boat, `?gain= &contrast= &noise=
       &depth=` set the knobs, `window.__sonarFlat(w,h)` returns the picture flat as a PNG — and the two pictures are
       compared pixel-for-pixel on the same boxes until the numbers meet.
     - **Engine changes.** (1) The app's displayed **orange colour map**, measured from the frames, is the default
       (`accuphy_orange`; the LiveScope amber stays as an option). (2) **Gain brightens with +** (it dimmed before) and
       the default label is 40 % like the app's recordings; the look at 40 is the one 57 gave. (3) **Grain, not
       filaments**: coherent row sets per ~1.2° × 0.67 m that drift smoothly (was 0.08° — hairlines); structure faces are
       built from grains ~0.6 m across the beam × 0.25 m along it with finer speckle cutting gaps, a fifth re-drawn per
       ping. (4) A **wood** sonar tag (0.6): a wooden hull is lit right through for ~2 m, its shadow starts 1.6 m behind;
       timber and rock (0.5) smear 0.5 m and shadow at once; steel (0.75) as #63. The workboat is wood (Jason).
       (5) The **bottom band**: pulse 0.28 + 0.012 r, tail 0.45 + 0.02 r (was 0.22 + 0.010 r / 0.35 + 0.015 r), soft cap
       K 0.8 (was 0.4) so the body is orange with a yellow edge as recorded; the noise floor halved.
     - **Fit** (lit-pixel classes white / yellow / orange / red / dark): recording's hull 2 / 16 / 39 / 25 / 19, ours
       5 / 19 / 31 / 26 / 20; flicker 29 on 152 vs 37 on 118; grain correlation 34 × 12 in vs 25 × 10 in. Our hull box is
       55 % lit vs 85 % because the study wreck has less superstructure than the real one — geometry, not engine.
     - **Open** (Jason to identify on the frame): the speck spray above the stern, the specks above the bow, the bright
       bow face, the dark cavities, the faint diagonal left of the hull, the trail under the bottom. Public pages not
       rebuilt: the colour map and gain scale change every picture, Jason sees it first.

131. **2026-10-24** — **Rocks rebuilt: Shield boulders in code, six shapes** (Jason: "场景里面的石头像爆米花一样 … 去网上找实际的
     模型 … 要符合北美的淡水湖里面石头的质地跟形状").
     - **Cause:** `makeRock` was a `DodecahedronGeometry(0.5, 1)` — non-indexed in three r186, so each corner exists ~6
       times — and moved every copy by its own random amount: the skin tore into loose flat-shaded shards (gaps up to
       22 cm on a 1 m rock). Its colour (0.46) was also the lightest thing in the lake, so the beam lifted it to white.
     - **Models from the web:** every model site (Poly Haven, Sketchfab, Quaternius, Kenney, ambientCG, Smithsonian…) is
       denied by the environment's network policy; the one reachable mirror (GitHub) has four cartoon Kenney rocks only.
       Jason chose the code route and asked for polish ("用代码做的这版，继续打磨"); the alternative (allow the Poly Haven
       domains, use scanned shapes with our material) stays open if he wants scans.
     - **`rocks.js`:** a welded icosahedron (`mergeVertices`) shaped by an ellipsoid, low-frequency bumps, a lean, 2–7 soft
       planar joint cuts with rounded shoulders, fine grain and a flattened base; six kinds (rounded pink granite,
       jointed grey block, gneiss slab, long loaf, dark broken shard, algae-green cobble) with silt-dark bases and
       lighter/darker patches in the vertex colour, albedo 0.24–0.36. Small rocks at 320 triangles (12 geometries),
       the few with s ≥ 1.2 at 1280 (6). The unit rock keeps the old envelope (half-extent 0.62, base at −0.4), so
       `obstacles.js` is unchanged; placement is unchanged except smaller tilts (≤ 0.35 rad, boulders ≤ 0.18; the
       random sequence is untouched).
     - **Checked:** layout dump: 0 of 1,207 structures and 0 of 269 fish moved; `fish-sim` 0 violations; the 6 × 6 sonar
       grid against main (after #130's engine): every tile within 0.5 points of white except the hump (PL Forward 4.5 → 5.9, Mini Forward 1.8 → 3.5, PL Down 0.9 → 1.3: solid rocks echo more); the ice page in real time: jig, bottom and water specks as before; build passes. Dev aid `?cam=rocks[:hump]`
       circles the island pile (or the first rock hump) under water.
     - Found, not fixed: in `lakeMaterial.js` the fine speckle and the bark grooves multiply `albedo` after `base` has
       been computed from it, so no surface texture reaches any structure or the bed (backlog).

132. **2026-10-24** — **The drag cue is a reticle on the water, not a glass pill** (Jason: "drag the boat 这个图标是不是能够去
     换更加优秀的图标"; he picked option C of four mock-ups).
     - The lake's "DRAG THE BOAT" pill (glass, blue double arrow, all caps) is replaced by the ice page's language (#123):
       a thin white reticle lying on the water round the hull — four arcs of an ellipse (4.6 × 2.3 m) with gaps fore,
       aft and abeam, a chevron off the bow and the stern, a ripple spreading out of it every 2.6 s, a slow breath — and
       one plain caption above it, "Drag the boat to move it" (sentence case, 13 px, no background). It fades after the
       first drag. Both pages now share one caption element (`index.jsx`); the reticle lives with the boat (`Scene.jsx
       Boat`, `ellipseArc`), on the sonar-hidden layer so no sonar camera sees it.
     - Checked: desktop and 390 × 844: the caption clears the top; the reticle rides with the boat; no console errors.

133. **2026-10-23** — **Feasibility: the phone Lab as a page of the Shopify store** (Jason: "调研一下我们现在的手机版放到我们
     网站的 Shopify 网站的网页里面 … 可行性如何", then "全部" — all four aspects). Research only, nothing built:
     `docs/shopify-embed-feasibility.md` (EN + 中文摘要).
     - **Finding.** #102 (Vercel at `lab.accuphy.com`) rejected a Shopify page because the 2.3 MB WebGL page cannot live
       inside theme files. It did not weigh the other way: a store page `shop.accuphy.com/pages/lab` with its own
       header-less template whose body is a full-screen iframe of the Vercel-hosted Lab. That is feasible, keeps #102's
       hosting, and gives the ads a store address with the store's pixels, analytics and Klaviyo already in place; the
       theme is touched once and the Lab keeps its own release cycle.
     - **Numbers.** Lab public page 1.04 MB compressed; an ordinary store page carries 20 external scripts; the store
       shell on a header-less layout adds an estimated 0.3–0.6 MB. Phone fps is unchanged by the host.
     - **Pending Jason** (not decided): adopt the store page as the front door beside #102; first market; embed source
       `lab.accuphy.com` vs the plain Vercel address. Then a handoff to `accuphy-website/handoffs/`.
     - Also this session: the Three.js case-study review (Perego water diorama, Sael's internet explainer, Majid's
       procedural animals) stays in the chat only — Jason wanted to discuss the diorama idea first; no document yet.

134. **2026-10-23** — **The store page is the Lab's front door; tracking done the proper Shopify way; Globo is out**
     (Jason, on #133: "Globo Mega Menu 我们后面是肯定不会用了的，就是你按照最合理的、最有帮助的，包括像 tracking 啊、统计啊 …
     广告转化啊这些的，都按照我们最好的这个方式去做吧").
     - **Adopted:** `shop.accuphy.com/pages/lab` (header-less template, full-screen iframe) as the public address; the
       Lab itself stays on Vercel per #102. Canada first, then `/en-us/pages/lab`. Embed source: the Vercel address at
       first, `lab.accuphy.com` once the CNAME exists (one setting in the section).
     - **Tracking design:** the Lab posts `ready`, `first_drag`, `view`, `found_sign`, `signup`, `shop_click` to the
       parent (`postMessage`, no personal data); the section publishes them as the Shopify customer event
       `accuphy_lab`; a Custom Pixel forwards to Meta (`signup` → standard `Lead`, the rest `trackCustom`). Sign-up
       goes to Klaviyo from the Lab's own card (client API, public key); UTMs pass through the iframe URL. Shop links
       navigate the top window to the market's product page.
     - **Handoff written:** `accuphy-website/handoffs/2026-10-23-lab-store-page.md` (Shopify side, incl. the note that
       Globo Mega Menu will no longer be used — the website project records that in its own log).
     - **Lab side, next:** an embed build (events module, `100dvh`, Klaviyo keys, `window.top` shop links, Vercel headers
       `frame-ancestors` + `noindex`), then the Vercel deployment when the website project is ready to test.
135. **2026-10-23** — **The sonar engine draws structure from an echo splat of every surface** (Jason, on the like-for-like
     round #130: "你现在的效果其实还是很糟糕", and his reading of the recording: the wooden hull is a lit-through whole —
     side face solid, deck line on top, ribs and cavities inside, far side visible).
     - The old model drew only the FIRST surface each row met (a depth strip) and faked the rest with random grain, so a
       hull came out as a line drawing or a holey blob. Now a third sonar pass per fan — `uSonarPass = 3` in
       `lakeMaterial.js` — renders every structure surface at its sonar place, (angle across the fan, range) instead of
       perspective, both faces, additive blending, no depth test, into an echo texture (`SonarScreen.jsx echoRTs`,
       1024 × 256 per fan). Each surface adds its amplitude (wood 0.12, timber/rock 0.14, steel 0.22) × how squarely it
       faces the sound × a grain fixed to the object × the beam's main lobe across the slab. Triangles touching the
       camera plane are discarded (one such vertex stretched across the whole fan). The scene background is cleared
       for that pass (it would fill the additive target).
     - `sonarShader.js fanEcho` samples the echo texture at (u, r) with a ±0.16 m pulse, a soft knee (one plank reads
       orange, the deck line of several coincident faces yellow-white) and the per-ping grain; rows now paint only the
       bottom, and keep the far-face strip (`uDepthB`, pass 2) for the shadow, which starts behind the far face — a
       wooden hull shades the bottom under it only 30 %.
     - Fix found on the way: `mats.wood` was not in `lakeMats`, so the workboat rendered into every sonar pass untagged
       (alpha 1 = steel/fish) since #130 — now included.
     - Like-for-like fit (recording → ours, lit-pixel classes white / yellow / orange / red / dark): hull 2 / 16 / 39 / 25 / 19
       → 0.6 / 5.5 / 44 / 32 / 18; lit share of the hull box 85 % → 71 %; picture black 87 % → 89 %; grain correlation
       25 × 10 in → 34 × 11 in; flicker 37 → 21. The nine calibrated scenes still read right (the steel cargo wreck now
       shows its whole profile). Public pages not rebuilt yet — Jason sees the comparison first.

136. **2026-10-24** — **Lake material: the surface texture finally shows** (Jason, on the bug found in #131: "要修的").
     - `lakeMaterial.js` multiplied `albedo` by the fine speckle and the bark grooves AFTER `base` had been computed from
       it, so since 2026-09-24 no surface texture ever reached the bed, the timber or the rocks. The block now runs
       before `base` (fish excluded, as before).
     - Look: close up, sand grain on the bed and the rocks, bark grooves on the trunks; from the normal camera the
       change is subtle. The sonar picture reads only the material tags (alpha), so it is untouched; the ice page's
       section view and Live Ice are as before.
     - Lesson: the shader is a JS template string — a backtick inside a GLSL comment ends it (`vite build` failed once).

137. **2026-10-23** — **Jason's verdict on the echo-splat round, and the fixes** (on the before/after sheets: "新的结构比以前更漂亮"; trees
     "一棱一棱有断层的感觉 … 清晰度再提升一点点"; fish "更真实一点"; noise "星星点点的噪声稍微减掉一点点"; colour "新的黄色跟老的橘黄色中间
     取折中").
     - **Trees:** the stepped look came from the per-ping range grain (0.22 m bands along a trunk) and from low-poly crown
       facets lit by the facing term. The speckle now lives on the object (12 cm cubes in world space, the same in every
       direction, `lakeMaterial.js` splat), the facing term is weak (0.78 + 0.22), the per-ping grain is only a shimmer
       (0.55 + 0.6), and the range pulse is ±0.12 m with sharper taps — trunks are continuous columns with speckle.
     - **Noise:** the #129 water scatterers at 60 % density and 80 % amplitude.
     - **Colour:** `accuphy_mid`, the midpoint of the measured app orange and the LiveScope amber, is the default.
     - Checked on the six comparison scenes (default, shelf fish, bait school, workboat, steel ship, timber) against the
       public build (#128); public pages still not rebuilt.

138. **2026-10-24** — **Research: alternatives to the iframe, and the phone-mode rules audited** (Jason: "iframe 啊，乱七八糟这些
     东西，能不能找别的 option … 落地性更好的", and his rules for the phone "real device mode": PingLive Home → pick a view →
     back; the Mini offers a few modes, the rest blurred; ⋯ cannot be entered; range on the phone's −/+). Research only.
     - **Embed options** (`docs/embed-options.md`, from search excerpts — shopify.dev is blocked here, so test before relying):
       the recommended replacement for the iframe is a **theme-mounted Lab**: the same `/pages/lab` and header-less layout
       as #134, but the section holds a `<div>` and one `<script type="module">` from Vercel (a stable loader that imports
       the latest hashed bundle). One document, one origin: Shopify analytics, Web Pixels, Meta and Klaviyo are native,
       no postMessage, one scroller to lock on iOS, real page text for SEO. Second choice: a custom app's theme app
       extension (bundle on Shopify's CDN; size limits unverified). The iframe stays as the fallback. App Proxy (raw HTML
       under `/apps/lab`) loses every store tracker; standalone `lab.accuphy.com` loses Shopify sessions; Hydrogen no.
       Every option: no Fullscreen API on iPhone or in in-app browsers — only "fill the visible viewport".
     - **Phone rules** (`docs/phone-mode-audit.md`): all four rules are already built on the lake page in portrait
       (#107, #110, #114, #118, #121, #122, #125). Gaps: the ice page on phones (no Home first; gain, pause and ⋯ locked
       or opening the gate); sideways phones (desktop layout takes over — the "real device mode" of #119 is not built);
       the Live Ice Fishing tile's link is broken in public builds; the embed `view` event fires for the default view
       before any pick and not for the first real pick. Confirm with Jason whether the 2D "Ice Fishing" view should open.
     - **Pending Jason:** switch to the theme-mounted embed (iframe as fallback)? go-ahead for the Lab mount build and
       for the sideways mode? the Taiga-less lean layout? Nothing built; the website project's handoff is unchanged
       until he decides.

139. **2026-10-24** — **Phone flow: Jason's answers on the #138 audit** (Jason: 2D Ice Fishing "不开"; the sign-up gate "你这个
     层级不要有 … 这个事的安排在 klaviyo 营销漏斗那边的 agent 的决定"; the Live Ice Fishing link "去掉?"; the `view` event "优化").
     - **2D Ice Fishing stays frosted** (#121 stands).
     - **No sign-up gate from the phone's controls:** on phones a tap on a display-only app button now does nothing at all
       (`index.jsx`: `onLocked` is not passed on phones), on the lake and the ice page alike. The desktop gate (#38) is
       untouched; whether a gate exists at all is the Klaviyo funnel chat's decision, not this chat's.
     - **The Live Ice Fishing tile on the lake page is frosted** like the other unavailable Mini tiles; the link that wrote
       a full URL into the hash (`AppHome.jsx`) is gone. On the ice page the tile still opens Live Ice. `VITE_ICE_URL`
       is no longer read.
     - **`view` event on real picks only** (`pickView` in `index.jsx`): the Home tile (`source: home`), the desktop panel
       (`panel`) and a guide step (`step`) send `{ view, device, source }`; nothing is sent for the default view on load.
       Checked at 390 × 844: load → `ready` only; first pick → `view forward/PL/home`; Home → Live Down → `view down/PLM/home`;
       ⋯ tap → no dialog; no console errors. The phone hint now reads "Home, range, gain and pause work".
     - Still pending Jason: the embed switch to a theme-mounted Lab, the sideways real-device mode (#138), the ice page's
       Home-first / live gain and pause on phones (left to the ice chat).

140. **Bottom like the burst; solid bodies (2026-10-23).** Jason on the #137 sheet: the bottom has missing parts and is a
    straight, too-regular line; the real one has texture and **ping-to-ping movement** (特别的重要); the mirror echo should be
    smaller and fainter; rocks, trees and hulls are transparent, a rock should be brightest in the middle and fade out.
    Measured on the 2.0.0 PL Down burst (20 frames, flat bottom, `reference/vivo-bursts-2026-10-23/pl-down`, scripts in the
    session scratchpad `real/edge2.py`, `real/prof.py`): band above 40 % of peak **1.44 ft** and constant with range, peak
    LUT 0.62 (yellow-orange) 0.5 ft under the edge, 75 % width 1.1 ft, 15 % width 2.7 ft; the leading edge moves **2.5 in**
    between pings (median), spans 7 in over the burst, ~4 bumps > 2 in per 10 ft; inside the band 44 % of pixels change
    colour class per ping; the 2 ft under the edge are w2 y21 o49 r18 d9. Ours before: 3.9 ft thick, a 2.4 ft plateau,
    0.8 in wobble, y59 o32 (no red tail), no ping change at the edge. Engine changes in `sonarShader.js`:
    - **pulse and tail fixed in range** (`sigma 0.15 + 0.003 r`, `tailLen 0.28 + 0.008 r`, were 0.28 + 0.012 r / 0.45 + 0.02 r)
      with a sharp onset (gaussian 0.2× on the near side) — the pulse is a fixed length in time, the band does not thicken
      with range; the **per-row peak line and the edge line were removed** (`0.4 * peak`, `0.2 * edge` → `0.1 * edge`): both
      were a *max over the 24 rows*, which spread any bottom that slopes fore-aft into a flat plateau; switching them off
      reproduced the measured profile at once. Body cap `K` 0.8 → 2.5 under the depth cap, pulse 1.3, tail 0.55.
    - **irregular, breathing edge:** the bottom hit gets a static roughness (±8 cm, 1.4 m across) and two per-ping terms
      (±13 cm at 0.4 m, ±10 cm at 0.11 m, new every ping); the band's texture is fibres along the ray (2 in × 0.4 m) with
      `grain³` sparkles instead of 0.2 m streaks. Result: wobble 1.6–2.2 in, span 6–8 in, flicker 49 % class changes, band
      1.40 ft, profile 1.3 / 2.2 / 2.8 ft, classes w1 y15 o58 r24 d2 — all within reach of the burst.
    - **second echo** 0.10 → 0.045 and narrower; **shadow** behind structure a notch, not a hole (`0.95 → 0.7`, exponent 2.2 → 1.6,
      0.9 m → 0.6 m, fade 3.5 → 1.8 m): the bottom no longer breaks off under trees.
    - **solid bodies:** a new `solidAcc` term fills the space between the near face (`uDepth`) and the far face (`uDepthB`),
      brightest just inside the near face and fading toward the far one (wood 0.6×), fed into the splat knee as
      `0.25 * body`; the splat's own amplitude is unchanged. Rocks, trunks and hulls read as filled masses.
    - dev knob `window.__sonarTune.k = [pulse, tail, peak/edge, body]` (uniform `uTune`, all 1 in production) for the
      like-for-like loop; `__sonarTune` is DEV-only as before.
    Checked: six comparison scenes (`对比-v3-v5.jpg` sent to Jason), the ice page (desktop + phone) still draws its band
    and dial, `vite build` clean. Not published: the three public pages stay at the #128 build until Jason says so.

141. **2026-10-24** — **A sideways phone is the app itself (real device mode)** (Jason: "横屏不要做真机模式了 … 一个小小的手机摁不到的",
     then "手机横屏还是用以前的方案好了 在屏幕上有磨砂块点击选" — the #119 / Phase 4 plan, not a phone frame inside the phone).
     - **When:** the window is wider than tall and under 500 px high (`isLandscapePhone`, SonarScreen.jsx), lake page only. The
       ice page keeps its own layout (its phone work is the ice chat's); desktop, tablets and portrait phones are unchanged.
     - **What:** no drawn phone, no desktop panel, no step cards. The display fills the screen inside the safe areas and opens
       on the app's Home with the frosted tiles (#139 rules: PingLive views, the Mini's four live tiles, the rest frosted);
       a pick starts the sonar full-screen with the app's controls at the app's own size (back → Home, range, depth range,
       gain, pause live; ⋯ greyed). The lake is a 21 %-wide 16:9 inset top-right (top-left in Combo, where the readout is),
       drawn by SonarScreen.jsx from closer in round the boat; the wordmark under it is hidden. A tap on the inset swaps:
       the lake full-screen with the drag cue, the sonar a 34 %-wide box top-right that taps back. A drag on the full-screen
       sonar never moves the boat behind it. While the sonar is full-screen the full-screen lake is not rendered at all.
     - **Checked** (headless, 844 × 390 and 932 × 430): Home → Forward View → sonar + inset; gain + works; inset tap → lake big
       → boat drag moves it → sonar box tap → back; back → Home → Live Combo puts the inset top-left; no console errors.
       Lake 390 × 844 and 1440 × 900, ice 1440 × 900 and 844 × 390 look as before. The gallery's "← Lab" link is hidden
       while sideways (dev only; the public build has none).
     - **Not done:** Phase 4's quality tiers; a device test on a real iPhone (safe areas, the home indicator).

142. **2026-10-24** — **The Lab mounts into the store page itself; the iframe is the fallback** (Jason, on the #138 research:
     "主题挂载用什么？我不知道 … 你按照最适合的" — Option 3 of `docs/embed-options.md`).
     - **Lab side, built:** `share/embed.jsx` exports `mount(el)`; `scripts/build-embed.mjs` (+ `vite.embed.config.js`)
       writes `embed/lab.js` (a stable loader, cached 5 min) and `embed/lab-<hash>.js` (the minified build with its CSS,
       fonts and logo inside, cached for good) beside the standalone page in `dist-share/pages/`, plus `embed/test.html`;
       `build-share.mjs`'s `vercel.json` adds CORS and caching for `/embed/`. Same size as the standalone page (2.6 MB).
     - **Events:** `labEvent` calls `Shopify.analytics.publish('accuphy_lab', { event, ...data })` when the page has it;
       inside a frame it still posts to the parent (#134's path kept as the fallback).
     - **No sign-up gate** in the embed build (like the share build; #139: the Klaviyo chat decides the funnel).
     - **Checked** from a second origin (a stand-in store page loading the loader cross-origin): mounts at 1440×900,
       390×844 and 844×390; fonts and logo load; `ready` and `view` published; no console errors.
     - **Handoff draft:** `docs/handoffs/2026-10-24-lab-theme-mount.md` — the section is a `<div>` + module script, the
       lean layout without the theme's CSS, events published by the Lab. A Mac chat carries it to `accuphy-website`.
     - **Not done:** the Vercel deployment (#102) and the theme-copy test; nothing published.

143. **2026-10-24** — **Bright cores, orange rims; a flat bottom with fine fibres** (Jason on the #140 sheets: "实心改善的完全不够"
     — targets are brightest in the middle and only the outermost rim turns orange, as he said on 2026-09-24 in the first
     Lab chat: "越靠近中心越亮 有这个逐步亮的过程 … 这种实心结构亮的 清晰的 是更好的"; then on the bottom: "你的那种坑坑洼洼是一高一低
     … 它是一种平整，但是上面有细腻的纹理 … 不行你就抄也可以"). Engine (`sonarShader.js`):
     - **Core to rim for structure:** after the echo splat, 16 taps on two rings (0.12 m and 0.25 m in the picture's metres,
       rotated per pixel and ping) tell how deep inside the silhouette a pixel lies; the structure echo is scaled from a
       rim level (0.82) to a core level (2.1). Measured with `real/rim.py` (brightness and colour class vs inches inside the
       silhouette) on the burst's wreck: L 157/253/317/360/390/395 from the edge to 18 in, yellow 22 %, white 4 % in the
       core. Lab study wreck after: 138/233/318/367/395/411, yellow 34–41 %. Before: flat ~265, no yellow, 63 % red.
     - **Bottom edge flat:** the per-ping and static displacement of the bottom hit from #140 is removed — what #140 read as
       a 2.5 in "edge wobble" in the burst is the fibres' tips, not the edge moving. The pulse onset is a little softer
       (near-side gaussian 0.36×) so bright fibres poke a few cm above the edge, like the burst's feathered top.
     - **Fibres copied from the burst at 4×** (`band-zoom` crops): soft streaks along the ray ~3 in across, 10–16 in long,
       low contrast (`tex 0.55 + 0.9 · smoothstep(streak)`), drifting every ping; the hashed `grain` (which drew a dotted
       grid at 4× and the white sparkles) is gone from the streak branch. Band: peak 501/765 at +0.76 ft (real 473 at
       +0.58), 2 ft under the edge w0 y29 o57 r13 (real w2 y21 o49 r18), 36 % class change per ping (real 44 %).
     - dev knob `window.__sonarTune.k2 = [rim, core, ring radius, inside threshold]` (uniform `uTune2`, all 1 in production).
     Not done: the study hull still reads hollow in its lower half when zoomed (a lobe floor in the splat was tried and
     stopped by Jason before it ran); steel keeps the same core level as wood (a steel channel in the splat was tried in the same stopped step and taken out again). Checked: six scenes + the ice page (desktop,
     phone), `vite build` clean. Not published: the public pages stay at the #128 build.

144. **2026-10-24** — **One brightness for bottom and structure; thicker Forward bottoms; steel even; fuller branches**
     (Jason on the #143 sheet: the bottom close-up's colour is right; under the workboat the bottom is too dim and the boat
     too bright — wood and the bottom are about as dense, so about as bright; in the timber scene the rocks are bright
     enough but see-through and the bottom "消失了一样"; branches break; the steel wreck is far too bright, it should be even,
     like the close-up; the Mini Forward bottom is too faint and thin). Measured per scene with three renders (all,
     bottom only via `k2=[0,0]`, structure only via `k=[0,0,0,0]`; p90 of lit R+G+B): before, the workboat's bottom 325 vs
     boat 612, steel 653 (white 17 %), timber rocks 694 (white 34 %), Mini Forward bottom 372. After: bottom 420–530 and
     structure 380–480 in every scene, steel ~380 and even. Engine (`sonarShader.js`, `lakeMaterial.js`, `SonarScreen.jsx`):
     - **Bottom spread compensation:** the rows' hits on the bottom are tracked across the slab; when they spread over a
       range (deep or grazing bottoms) the band is scaled back by `sqrt(1 + spread²/pulse²)` (×0.8, at most 3×).
     - **In-plane beam width ±0.6°:** each row samples the strips a little to either side in the fan plane, so a grazing
       bottom (Forward, plateaus) is as thick as the beam at its range instead of a hairline; a bottom square to the
       rays barely changes (close-up band 1.7 ft, peak 509 — was 1.45 ft, 484–501).
     - **Near gain:** TVG floor 0.32 → 0.55; the Mini's `uBedGain` 0.62 → 0.95 (both were set when the band was a
       saturating slab; the thin band no longer burns white in shallow water).
     - **Shadow** behind structure 0.7 → 0.45 (the bottom stays visible behind rocks and trees).
     - **Structure:** calmer grain inside (`0.72 + 0.4·grainS`, was `0.55 + 0.6·grainS`) so rocks read solid; a soft
       ceiling `Ks 2.2` after the core level so cores stay yellow, not white; steel gets a lower core level (1.3 vs 2.1)
       via the steel share the splat now writes to its green channel; the splat's speckle floor 0.3 → 0.55 and a lobe
       floor 0.3 across the slab (the step stopped on 2026-10-24 before the #143 sheet, now asked for: "树枝结构更完整").
     - dev knob `window.__sonarTune.k3 = [spread comp, near-gain floor, ceiling, steel core]` (uniform `uTune3`, all 1).
     Checked: six scenes + the approved close-up + the study hull (core L ~380, yellow 11 %) + the ice page (desktop,
     phone); `vite build` clean. Still open: branches in the crowns are fuller but still dashed in places (low-poly
     branch geometry). Not published: the public pages stay at the #128 build.

145. **2026-10-24** — **Solid targets hide the bottom; smooth branches; the boat halfway back**
     (Jason on the #144 sheet: "船这一轮亮度降低的有点过多了, 找上一轮跟这一轮在折中"; the rocks are still see-through —
     "石头的密度是高的, 所以它的透明度应该更低 … 实心不光有亮度的, 还有它的透明度"; their brightness dropped too much; branches
     look "像马赛克一样 … 这是不对的", they should be smooth). Causes found: the bottom band was ADDED on top of a rock (a bright
     line ran through every rock sitting on the bottom); a thin branch covers part of an echo-splat cell and each cell came
     out all or nothing (256 rows, no anti-aliasing, a hashed 12 cm speckle with hard cell edges). Engine:
     - **Occlusion:** where structure fully covers a pixel (the core-to-rim coverage `cov`), the bottom band behind it is
       hidden (×(1 − 0.92·occ)) instead of added.
     - **Inside fill:** deep inside the silhouette the gaps between the summed surfaces fill from the mean of the 16 ring
       taps (never darker) and the grain is calmer there (`0.86 + 0.2·grainS`).
     - **Smooth splat:** echo targets 1024×512 (was 256 rows) with 4× MSAA; fanEcho samples half a cell either side across
       the fan; the splat's speckle is smooth 3D value noise instead of hashed cells. Trees now read as whole trunks and
       branches; rock edges no longer stair-step.
     - **Per-material core:** the splat writes a wood share to its blue channel; core levels rock/timber 2.1, wooden hull
       1.95, steel 1.15 (was 1.3), soft ceiling `Ks` 2.2 → 4.0. Measured (p90 of lit R+G+B, structure only): wooden hull
       512 (v9 612, v10 417 — the midpoint asked for), timber/rocks 595 (v10 446, white 6 %), steel 386 (v10 365),
       bottoms unchanged; the approved close-up band unchanged (peak 505 vs 509).
     - **Fix from #144:** the in-plane beam offset used `fract()` of a noise and drew fingerprint loops in the bottom band;
       now a sine of the row phase (smooth).
     - dev knob `window.__sonarTune.k4 = [occlusion, inside fill, wood core, rock core]` (uniform `uTune4`, all 1).
     Checked: six scenes + close-up + the ice page (desktop, phone); `vite build` clean. Not published: the public pages
     stay at the #128 build.

146. **2026-10-24** — **Fibres inside hulls and rocks, like the bottom close-up; opacity kept**
     (Jason on the #145 sheet: the transparency is solved well, but "船还有石头他们的纹理你还是得去参考最顶上的这个底部的特写图 …
     现在你的船跟石头变得很光滑, 简直像拍照片一样, 这个就很不真实" — keep the opacity, fix the texture; everything else is
     good). Measured texture (coefficient of variation of L deep inside a target): the recording's band 0.28, the approved
     Lab band 0.22, our rock and hull 0.12, steel 0.07. Engine (`sonarShader.js`):
     - Inside the structure echo, before the soft ceiling: bright yellow streaks along the ray on the orange body,
       ~5–8 cm across (angular frequency `clamp(11·range, 150, 400)`, so Forward at 80 ft gets the close-up's strokes, not
       blobs) and ~0.6 m long, re-drawn every ping; centred so the average level stays; full strength deep inside, half
       on the rim (branches stay whole); never below 0.35 (gaps stay orange, the target stays solid). Now rock 0.19, hull
       0.16, steel 0.15.
     - Tried and dropped: the band's own `tex` (blobs at Forward ranges), dark-gap-led fibres (leopard spots), a
       metric width (`aWorld·r`: the streaks turned vertical), longer strokes (combed hair).
     - Levels re-fitted with the fibres: core rock/timber 2.45, wooden hull 2.1, steel 1.08; `Ks` back to 2.2 so the
       bright fibres stay yellow. Structure p90: hull 517, rocks 585 (white 12 % of the top third), steel 404; bottoms
       and the approved close-up band unchanged (peak 505). Mini shelf trees 438 (was 474).
     - dev knob `window.__sonarTune.k5 = [fibre contrast, bright share, fibre length, —]` (uniform `uTune5`, all 1).
     Checked: six scenes + close-up + the ice page (desktop, phone); `vite build` clean. Not published: the public pages
     stay at the #128 build.

147. **2026-10-24** — **Ragged, fibrous outlines on every object, like the bottom band's edges**
     (Jason on the #146 sheet: the inside texture is right, but "船的还有石头的外边缘太光滑了, 那个纹理它是一个不规则的, 所以…
     表面都应该像河的底部一样, 不是光滑的", then "每个物体表面都会有纤维的"). The recording's band has no clean edge: thin
     tapering streaks along the ray stick out of it, ~10–20 cm above and ~20–30 cm below. Engine (`sonarShader.js`):
     each thin beam (~4 cm across, two noise octaves multiplied so neighbours differ) lets the structure echo run on past
     the surface along the ray by its own length, new every ping, tapering (5 taps behind, up to ~0.3 m typical 0.25;
     3 in front, ~0.1 m), at 0.75 of the echo. Every surface grows them, branches included (only echoes below 0.004 do
     not). Tried and dropped: one noise octave (a saw-tooth of evenly growing spikes on trunks), fibres on solid returns
     only (Jason wants them on every object). Levels unchanged (hull p90 513, steel 403; rocks/trees 558 — the extra dim
     fibre pixels lower the percentile, the cores are as before); interior opacity unchanged. dev knob
     `window.__sonarTune.k5[3]` = outline fibre length. Checked: six scenes + the ice page (desktop, phone); `vite build`
     clean. Not published: the public pages stay at the #128 build.

148. **2026-10-24** — **Every return is a short arc across the beam (the grain rule); replaces the along-ray fibres**
     (LiveScope session's independent check after #147: the app's grain runs across the ray, the Lab's along it; Jason:
     "不是简单的横向短颗粒 … 看真机的颗粒 … 共性 … 规律", then "按这个规律重做纹理，实心和亮度保持"). Measured rule
     (`sonar-style.md` §10, the grain rule, 1,782 patches of both vivo bursts plus every other view by eye): long axis
     across the ray in 100 % of patches (87–89°), fine arcs ~6 in × 2 in (aspect ~3) in ~10 × 4 in clusters, almost the
     same at every range; continuous reflectors are these arcs side by side; ragged outlines are their ends. Engine
     (`sonarShader.js`): one `arcGrain(aWorld, r, ping)` — value noise in metres along the arc × metres along the ray,
     two octaves, re-drawn every ping — now drives the bottom band's texture (was angular streaks along the ray, #143),
     the inside of hulls, rocks and trees (#146) and the outline: each ~2 in slice along the ray runs on SIDEWAYS by its
     own length (~9 cm typical, ≤ 20 cm) instead of along the ray (#147). Measured after, same method: Lab long axis
     78–86° to the ray (was 1°), 6.4 × 2.2 in (app 6–7 × 2), aspect 3; the close-up band's strokes 39–60° on screen
     (app 31–45°, Lab before 137–141°). Kept: opacity (interior gaps 0.3–0.9 %), levels (structure p90 hull 517, rocks
     575, steel 401; bottoms unchanged; close-up band peak 489 vs 505). Checked: six scenes + the ice page (desktop,
     phone); `vite build` clean. Not done here: ping-to-ping life (app hull |ΔL|/L 0.46), rim brightness, band
     thickness and white/yellow share from the same check. Not published: the public pages stay at the #128 build.

149. **2026-10-24** — **Big hulls get bright middles; the steel wreck no longer dark and even**
     (Jason on the #148 sheet: the texture is "非常的好"; but the steel wreck in PingLive Forward, before and now, is bad in
     brightness — a large object's middle must have bright parts, it cannot be that even, and it is much too dark; look
     at the wreck recordings). Measured (`scratchpad/grain/big.py`: core > 9 in inside the silhouette): the recording's
     Forward wreck p50 ~410, p90 555–656, p99 705–765, yellow 28–33 %, white 1–7 %, large-scale CoV (6 in low-pass)
     0.25–0.30, bright regions (> 1.25 × median) 5–18 %; its Down hull similar (p90 ~490, large CoV 0.28–0.33). Lab steel
     before: p50 341, p90 405, p99 443, yellow 1 %, white 0, large CoV 0.15, no bright regions. Why: many hull surfaces
     summed at a pixel saturate fanEcho's knee, so any variation inside the splat was flattened. Engine:
     - `lakeMaterial.js` splat: a ~2 m value noise fixed to the object (`uSplatBig`: steel 1, wood 0.7, timber/rock 0) is
       written as a factor into the echo target's alpha (now plain ONE/ONE sums in all four channels, cleared to 0);
       steel also gets a stronger facing term (plates square to the sonar return more).
     - `sonarShader.js` fanEcho: that factor multiplies the structure echo after the knee, deep inside only; steel's soft
       ceiling 1.7× and its core level 1.08 → 1.73.
     - Result: steel p50 403, p90 602, p99 765, yellow 33 %, white 4.6 %, large CoV 0.24, bright regions 21 %, the level
       rising toward the middle (406 → 422). Wooden hull: same median, large CoV 0.13 → 0.18, p90 517 → 547. Rocks,
       trees, bottoms and the approved close-up band unchanged; opacity unchanged (core dark ≤ 2.3 %).
     - dev knobs `window.__sonarTune.k6 = [steel ceiling, —, —, —]`, `window.__sonarTune.kb` = `uSplatBig`.
     Checked: six scenes + the ice page (desktop, phone); `vite build` clean. Not published (#128 build public).

150. **2026-10-24** — **One phone size for the lake and the ice page (#84 applied); the boat clear of the panel on mid screens**
     (Jason: "电脑这种宽屏的大的屏幕的状态下 … 手机 … 它的大小比例应该是什么样的？之前还有聊过 … 冰钓版跟船钓版标准化一点", and
     "一起修" for the boat under the panel on the unfolded vivo fold). `index.jsx`, `Scene.jsx`:
     - **Phone frame `min(42vw, 600px, 83.2vh)`** on both pages (they share the frame): the size Jason approved in #84 on
       2026-10-03 but never built (the code still had `min(38vw, 560px)`). Measured: 42 % of the width up to 1440 px
       (600 × 288 at 1440×900), 600 px from there on (31 % at 1920, 23 % at 2560 — about real size on a 24″ monitor);
       portrait phones unchanged (full width). The rest of plan B (range on the phone, controls 1.3×) stays with the
       SonarChrome owner.
     - **Mid screens:** where the glass panel would cover the boat (or, on the ice page, the kit at the hole), the view
       shifts right just enough — measured from where the boat projects without the shift, at most 0.6 × the panel's
       width, eased — in the lake view and the ice section / under-ice views. Wide screens keep their framing exactly
       (1280–2560 px: hint positions unchanged).
     - **The drag hint** slides clear of anything marked `data-hint-avoid` (panel, step cards, phone).
     Checked: both pages at 711×584, 1024×768, 1280×800, 1440×900, 1920×1080, 2560×1440 and 390×844: no hint overlap,
     boat and kit visible; `vite build` clean.

151. **2026-10-24** — **The fake phone a little smaller: ~34 % of a laptop screen, 560 px at most** (Jason, on the real-size
     table in `docs/ui-screen-rules.md` §3: on a MacBook Air 13″, a Windows 15.6″ or a MacBook Pro 14″ the phone felt close
     to real size and too big — "折中一点"; on 24″ and 27″ monitors a little smaller, "不要占的空间太大 … 但也不要太小").
     - Rule (both pages, `index.jsx`): `min(42vw, clamp(440px, 34vw, 560px), 83.2vh)` (was #150's `min(42vw, 600px,
       83.2vh)`). Folds and iPads (≤ 1024 px) keep 42 %; from 1280 px the phone is 34 % of the width; it stops at 560 px.
     - Measured (CSS px → mm at the screen's density, real iPhone 16 ≈ 148 mm sideways): MacBook Air 13″ 600 → 500 px
       (136 → 113 mm, 41 → 34 %); MacBook Pro 14″ 600 → 514 (120 → 103 mm); Windows 15.6″ @125 % 600 → 522 (135 → 117 mm);
       24″ 600 → 560 (166 → 155 mm, 31 → 29 %); 27″ 600 → 560 (140 → 131 mm, 23 → 22 %); 1280 px 538 → 440; 711 and 1024
       unchanged (299, 430).
     Checked: lake 711–2560 px and ice 711 / 1470 / 1920; `vite build` clean. Self-review on Jason's request ("你自己再确认
     一下合理不合理"): sizes change smoothly (430 → 440 px at 1048 px, cap at ~1650 px), nothing overlaps; the in-phone
     ruler text is 6.4–8.2 px at 440–560 px — small, as in the real app; the fix for that is plan B's 1.3× app controls
     (#84, SonarChrome owner), not a bigger frame. Published 2026-10-24 (versions.md).

152. **2026-10-24** — **Rough and side-sloping bottoms are one filled band again, not a net of lines** (Jason: "底部在某些区域
     很虚", logged in the backlog by another chat as "thick bottom bands go net-like since #148"; then "你来修"). Cause, found
     by toggling every #145–#148 piece at his spots (boat 15, −2.2 at 30 ft among rocks; −5.4, −8.2 at 46 ft): not the
     occlusion, fill or outline arcs, and already there at #147 — the slab is sampled by 24 rows, and since the thin band of
     #140 each row draws its own thin line; where neighbouring rows meet the bottom further apart than the pulse they
     separate into crossing lines with dark holes, which #148's arcs made more visible. `sonarShader.js` fanEcho: each
     bottom row spreads its pulse over the stretch to the previous row's hit (centre halfway, width half the gap, same
     energy) and its tail is averaged over that stretch (no hard onset line per row); a row on a rock keeps the last
     bottom hit so the band is filled across it; gaps under 2 cm keep the plain pulse (a flat bottom is unchanged).
     Measured in the band's core: at the rocky spot black holes 9.5 % → 2.3 %, dark (< ½ median) 16 % → 8 %, CoV 0.50 →
     0.39; the deep slope 0.2 % → 0.1 % (it had few). Bottom brightness per scene unchanged (p90 within ±5 %); the approved
     close-up band peak 517 (was 489–517). dev knob `window.__sonarTune.k6[1]` = the gap fill (1; 0 = the old rows).
     Checked: both spots, six scenes, the ice page (desktop, phone); `vite build` clean. Published 2026-10-24 on Jason's
     go (versions.md).

153. **2026-10-24** — **A test page where the fish are drawn as the transducer sees them** (Jason: "鱼还有不停的颤抖", "有一部分
     的鱼 … 近的时候还是像一团"; on the cause: "你把这个探头 … 有点类似于像一个相机一样 … 远的时候能照到的就是鱼背 … 越来越近的
     时候 … 照到它的身体就相对更完整"; then "上面那些都可以尝试，但是弄到本地来开个版本，然后本地先尝试吧").
     - **Diagnosis (marks, since #120):** a mark is the fish's body projected into the screen plane plus a fixed blur, so its
       shape depends on the heading, not the distance: a fish crossing the Forward slice collapses to a blob near or far,
       and the ones swimming toward the boat are dimmed and shortened (×0.6). Every 1/8 s the speckle, the ragged rim and a
       ±6–70 % flicker are re-drawn: at his spot the outline swings 2–3× and the centre jumps up to 10 px (same on #128).
     - **The test page** `src/experiments/2026-10-24-sonar-fish-echo` (gallery; `<SonarLake3D lab="fish" />`, like the ice
       page's wrapper). In the vertical views the 3D fish bodies are drawn from the transducer like a camera
       (`lakeMaterial.js` pass 4: only the surfaces facing the sound, strongest square-on, the swim-bladder part of the
       body brightest, fins and eyes weak; true size — the lake draws fish ×2.6 — with the marks' bloom for big fish and a
       0.22 m floor for bait; MAX-blended into one (angle × range) image, 256 rows per fan, 4× MSAA). `sonarShader.js`
       fishImg images it: the beam pattern across the ray (0.6 × 0.014 rad), a pulse and short tail along it, a speckle
       that crossfades from one ping into the next. Far fish come out as smooth arcs across the beam, near and under the
       boat as fish shapes (a musky at ~60 ft shows its body and tail); a fish turning toward the boat goes compact for a
       moment. `?fish=marks` shows today's marks for A/B, `?fishsize=1.6` larger sonar fish. Panoramic keeps the marks.
     - **Measured** at his spot over 45 frames (biggest fish): pixels changing per frame 24 % → 10 %, centre jump ≤ 10.4 →
       ≤ 0.8 px, brightness swing ±25 % → ±10 %. Cost per frame (PLM Forward): draw calls 188 → 195, triangles 1.45 M →
       1.59 M (+10 %; Combo twice that), no new download (the fish are built in code).
     - **Kept off the other pages:** the lake and ice pages run the same code paths with the switch off — byte-identical
       sonar snapshots against main (PL Down, PLM Forward, PLM Combo); the fish target is allocated only on the test page;
       the picture shader stays at 16 textures (the fish image borrows `uTop`, idle outside Panoramic — see lessons §4).
       The ice page loads without errors (desktop, phone).
     - **The thick-bottom fill** tried here first was dropped: #152 (the other chat, published) fixed the net on main the
       same way; this page uses it.
     - **Open:** bait specks draw as two or three short strokes instead of one; far fish a little wider along the ray than
       the marks' needles; Jason to judge the look (true size vs `?fishsize=1.6`) locally before anything moves to the main
       page. Not published; a private preview for Jason (claude.ai login) at https://claude.ai/artifact/VxxnVnZr8cxQLXw3iizMdD
       with two switches on the page (鱼：现在 / 新画法 · 真实大小 / 放大 1.6 倍), built by `VITE_LAB=fish scripts/build-share.mjs`.
     - **Round 2 (Jason 2026-10-25, on the preview: 真实大小; 新画法跟老画法要折中 — near fish "鱼鳍、鱼尾巴都看得出来 … 不可能那么
       清晰"，大概一个模糊的形状; the trembling fix OK; far fish a mix of old and new; past 20–30 ft no fish shape, no tail):**
       fins return almost nothing (0.04); the beam blur never goes below ~5.5 cm across, so a near fish is a soft body
       without fins or tail; the body apart from the swim bladder fades out between 6 and 9 m, so past ~20–30 ft only the
       bladder's compact spot is left and the beam draws it as the old marks' needle, a little hotter (peak-weighted,
       ×1.2) than round 1. True size stays the default.
     - **Round 3 (Jason 2026-10-25: 纹理的画法 … 更新到这上面来 … 基本上可以作为一个死的规则):** the fish's texture is now the grain
       rule of #148 — the same `arcGrain` and centred contrast as the bottom, trees, hulls and rocks — crossfaded from ping
       to ping (a moving target, no trembling). At his spot: pixels changing per frame 16 % (marks 24 %, round 2 10 %), the
       largest jump ~1 px (marks 10 px). **Standing rule:** every echo in the picture takes its texture from `arcGrain`
       (short arcs across the beam); a new kind of target adds its level and shape, never its own texture.

154. **2026-10-25** — **The far bottom stays on the screen: softer and weaker with distance, never gone** (Jason, on the fake
     phone: "超过100 feet 120 feet 还是到200 feet 那个底都看不见了 … 实际的情况不是这样的，底基本上还是看得见的，就是慢慢会有点虚，
     慢慢会变弱，特别是超过了120 feet 以后，在 forward view 下面 … 现在基本上消失了，变成一大群鱼"). Cause, reproduced at both start
     spots (desktop −6, 4 and phone 16, 11, PL and PLM Forward, 80–200 ft): both look east across the island. Past ~90 ft the
     beam grazes its top at 6–9°, the rays hit the rock pile and the weed beds before the bottom, so the traced band broke
     into a row of bright blobs with almost nothing under them ("一大群鱼"); behind the crest the bottom falls into the
     island's shadow and the picture stopped. Ruled out: the spread compensation's 3× cap (raised to 30×: no change) and
     the 2 m lakebed mesh (0.5 m: no change). `sonarShader.js` fanEcho: from ~60 ft (r 18 → 32 m ramp) a band is laid
     along the real bottom under each pixel, read from the baked terrain (every vertical fan lies in the world x-y plane,
     +x ahead, so it costs one texture read; no new sampler), max'd with the traced band so it only shows where that one
     is weak: onset soft 0.04 + 0.008 r, body 0.15 + 0.012 r deep (thicker and softer with range — the beam's width),
     level 0.55 fading to 0.36 by ~200 ft, × 0.7 where the centre ray stops on nearer terrain (a hump's shadow is a
     weaker bottom, not a missing one — as #146 said for structure), × the structure shade and occlusion, the band's own
     arc grain and slow patches fixed to the bottom. Now the island top reads as a bottom with rocks and weed on it and
     the back slope runs on, dimmer, to the edge of the screen. Inside ~60 ft nothing changes: the 6 spots × 6 views grid
     is identical to the last commit at the default ranges (only PLM Combo at 100–120 ft moves, its far panel); the ice
     page loads clean on desktop and phone. dev knobs `window.__sonarTune.k6[2]` = level (1), `k6[3]` = the shadow factor
     (1 → 0.7). **Open for Jason:** at the phone start the water under the boat is ~20 ft, so AUTO depth (#41: it follows
     the depth readout) shows 25 ft and the deeper bottom behind the island leaves the screen at ~95 ft — like the app,
     as decided; a Forward AUTO that also keeps the bottom ahead on screen would be a new decision.

155. **2026-10-25** — **The small wreck is a real workboat: decks at three levels, a wheelhouse with windows** (Jason: "那一艘
     小的沉船的模型太简单了，结构过于简单，尺寸我觉得 OK 的，你去把它的结构像窗户啊那些东西都做的完善一点，这样照起来。还有如果说
     船上面应该是有 … 层不同的层级 … 你去完善"). Same size and place as before (9.8 m × 3.2 m, the wheelhouse roof ~3.6 m above
     the keel, at 16, −26, tilted as before), now `wreck.js` makeWorkboat() instead of the extruded block in Scene.jsx: a V hull
     lofted through 41 stations with a rising sheer and rub rails; level 1 the working deck aft inside 0.6 m bulwarks with
     freeing ports and a transom gate, the fish-hold hatch with its cover knocked half off, a winch drum, a stern gantry
     with its block; level 2 a raised foredeck with a bow rail, bollards and the anchor winch; the wheelhouse built from
     wall panels with real openings (three front windows, two or three per side, a side door and a back door), a floor,
     the helm console and a bench inside; level 3 the roof as an upper deck with an overhang, a rail round it, an upper
     helm, a ladder up the back, the mast leaning aft with a crosstree and radar dome; skeg, rudder and propeller below.
     ~3,400 triangles. In the sonar (PL Forward 60 ft, PL Down over it) the block became a boat: the step up to the bow,
     the wheelhouse, the roof rail, the radar on its mast and the gantry read, with the shadow behind. The window openings
     themselves do not show at that range — the 20° slab sees through the whole beam at once — the levels do. The vertex
     colours now use their own seeded random numbers (the old ones drew on Math.random, which shifted everything after
     them in seeded captures). dev aid `?cam=workboat[:deg]` — the wreck up close from that bearing. Checked: three 3D
     angles, PL Forward, PL Down, Panoramic, the ice page (desktop, phone), `vite build`.

156. **2026-10-25** — **A more real lake from above: the water column tints the bottom, a wind-sea surface reflects the sky**
     (Jason: "现在水面的效果不够逼真，看着是挺奇怪的，可能跟底部的纹理有关。我需要你把 … 水面 … 去做高级一点的优化"). He was right
     about the bottom: the bark-groove texture meant for timber (lakeMaterial, "brown surfaces") also matched the sandy
     lakebed and drew long curved wood-grain stripes over the whole floor, seen through the water; it is now structure
     only, and the bed gets soft patches a few metres across instead. `lakeMaterial.js` (uAirView, on for the summer lake
     only): seen from above, a point is dimmed by the water over it — down from the surface and back up toward the eye
     (0.022/m, a little haze by distance, red absorbed first) — instead of by its distance from the camera, which gave the
     shallows and the deep basin one even veil: the island and the shelf now read clear and green-gold with their rocks and
     timber, the slope darkens, the deep floor sinks into the water's colour; the ACCUPHY LAB lockup keeps its old
     legibility (fog ≤ 0.55) and the wrecks an outline (≤ 0.62); slow light patterns (caustics, ~2 m cells) play on the
     floor down to ~6 m. `Scene.jsx` Water rewritten: per-pixel waves (one wind, seven directional components 0.4–7 m
     with deep-water speeds, ~5° rms slope, wandering phases, a little noise), roughness in drifting patches of gust and
     calm tens of metres across, the sky reflected by Fresnel from a horizon-to-zenith gradient (little near the boat,
     most toward the far water), sparse sun glints, a thin scattering veil that the ripples modulate near the camera;
     short waves fade with each pixel's footprint so a phone does not shimmer; the old wake rings kept; the plane is one
     quad (the vertex waves only slid it within itself). The ice page keeps its look (uAirView 0; the bed lost its
     stripes there too); the sonar is untouched (colour only, sonar passes skip it). Checked: desktop and phone, the ice
     page (0 errors), `vite build`.

157. **2026-10-25** — **X-6L worker round: event name `accuphy:lab`, the Shop button, the embed build checked** (Lab HQ's
     work order from CHIEF's X-6L; Jason's D1–D5 of 2026-10-25). Local only — nothing uploaded, nothing on Shopify.
     - **Event name:** the Shopify customer event is `accuphy:lab` (was `accuphy_lab`; the website project's prefix
       convention). The iframe message is unchanged: `{ source: 'accuphy-lab', event, data }`. Actions: `ready`,
       `first_drag`, `view` (`{ view, product, source }`), `signup` (card still closed) and the new `shop_click`
       (`{ product, placement }`). No `device` field in any event: the website uses that name for phone/desktop.
     - **Shop button** (`ShopButton.jsx`, `embed.js` `shopUrl` / `openShop`): links per #134 — PingLive
       `/products/pinglive-sonar`, Mini `/products/pinglive-mini`, by the device on screen. No market prefix (Lab HQ's
       interface note with the website, same day): theme-mounted the store origin is the page's own origin; in the
       iframe it comes from `ancestorOrigins[0]`, else the referrer, else `https://shop.accuphy.com`, so the visitor's
       own market and a myshopify preview both work.
       `shop_click` carries `{ product, placement }`, is sent first, and the navigation waits 150 ms so the
       store page and its pixel get it (verified: without the wait the iframe message was lost). utm_* / fbclid on
       the Lab's own URL are ignored (only passed along when the Lab is opened on its own).
       **UTM rule (HQ):** inside the store (iframe or theme-mounted) the link carries no utm_* — the ad's tags are
       already on the store visit; opened on its own (lab.accuphy.ca) the visitor's own utm_* pass through, none →
       `utm_source=accuphy_lab&utm_medium=referral&utm_campaign=bf2026_lab_ca`.
     - **Placement — Jason chose B** (2026-10-25 in the Lab HQ chat: "用方案 B 吧"): desktop a full-width button at the
       foot of the control panel, phones a pill docked on the phone frame's top edge. Option A (a blue pill on the
       lake, desktop bottom-left / phones top-right) and the `?shopbtn` switch were removed the same day. The two
       options as shown to him: `docs/2026-10-25-shop-button-options.jpg`; the final look:
       `docs/2026-10-25-shop-button-final.jpg`.
     - **Checked:** share build (`accuphy-lab.html` 2.64 MB) and embed build (`embed/lab.js` → `lab-<hash>.js`);
       `embed/test.html` mounts, `Shopify.analytics.publish` received `ready`, `view`, `shop_click` under `accuphy:lab`;
       an iframe stand-in received the same three by postMessage; the summer lake and the ice page both show the
       button at desktop and phone size with no console errors (#94 rule).
     - **Not done here (HQ / Jason):** the domain lab.accuphy.ca (needs Jason's 动), uploading to Vercel, the Shopify side.

158. **2026-10-25** — **The ice environment as a standalone package for other projects** (Jason: "冰钓版本的整体环境但是不带声纳啊打洞啊探照啊的部分的 能不能给我一个包裹 我要给其他ai做别的项目用"; format chosen: a runnable small project).
     - `exports/ice-environment/` (and `exports/ice-environment.zip`, 96 kB, no node_modules): Vite + React 19 + three r186
       + R3F 9, `npm install && npm run dev` → port 5180 (`.claude/launch.json` entry `ice-environment`). One component,
       `<IceEnvironment time look cutaway focus lift background />`, plus a demo with an orbit camera and a preset panel.
     - Kept: sky dome, ice sheet with snow relief, snowfall and marine snow, shelter + sled + lamp, lakebed, timber,
       weeds, rocks, both wrecks, swimming fish (gathered near the camp), the cutaway faces; the three times and looks.
     - Removed: sonar engine and screen, the Mini and pole rig, auger and drilling, hole hopping, beams and the beam
       window, holes and their light shaft, the cut-away pool, the lakebed logo. `lakeMaterial.js` and `iceMaterial.js`
       are cleaned copies (no sonar passes, no beam uniforms); `fish.js` without the dev test fish.
     - It is a copy: changes to the Lab's ice page do not flow into it. README (English + Chinese) is the brief for the
       other AI. Checked: no console errors, all presets, cutaway on/off, orbit above and under the ice, ~55 fps on the
       laptop, and a clean build from the unzipped copy.

159. **2026-10-25** — **The Lab in French (`?lang=fr`)** (Lab HQ's work order X-6L-fr; Jason 2026-10-17: 做法语版，魁北克也投;
     the store's /fr/pages/lab is live with the English Lab in its frame). Local only, nothing uploaded.
     - **Switch:** only `?lang=fr` on the Lab's own URL (the store's French page adds it to the iframe address); the
       parent page and the browser language are never read. Default English.
     - **Strings:** every visitor-visible string moved to `i18n.js` (`t(key, vars)`) — the panel labels and view pills,
       the description line, the drag / drill cues, the toast, the step cards (lake and ice, incl. the Mini-only
       combo text), the Shop button ("Acheter PingLive", after the store's "Achetez maintenant →"), the app Home page's PingLive tiles, tab bar and
       "available with" toast. Numbers, units, AUTO, 1440p (QHD) stay. The Mini row's own tile names (Live Forward,
       Down Scan, …) stay as the app prints them: the website glossary marks the app view names "pending T-066".
       Wording already live on shop.accuphy.com/fr is copied (Vue vers le bas, Vue avant, Vue panoramique, Affichage
       combiné, Faisceau, Portée, Accueil); the rest follows `accuphy-website/docs/glossary.csv`. The website HQ
       reviews the French (website #198); the full en / fr table with a confidence column for the website's French reviewer:
       `docs/2026-10-25-lab-fr-strings.md`.
     - **Shop link in French:** `/fr/products/…` when `lang=fr` (in the store and standalone); `shop_click` carries
       `lang`. UTM rules unchanged (#157).
     - **Checked:** desktop 1280×800 and phone 375×812, summer lake and ice page, French and the English default —
       nothing overflows (panel 400 px wide, step cards 181 px with the longest French text, the phone pill 216 px),
       no console errors; the desktop's bottom-left 380×230 is free of the panel (it ends at y = 341 of 800) for the
       Klaviyo form. Screenshots: `docs/2026-10-25-lab-fr-screens.jpg`.
     - **2026-10-26, the website's review applied** (`accuphy-website/handoffs/2026-10-26-lab-fr-strings-review.md`,
       Lab HQ's X-6L-fr round 2): outside the phone the store's wording (Vue avant, vue vers le bas, Faites glisser le
       bateau, flasheur, arbres immergés, Combinée, "Achetez le PingLive →" after the store's "Achetez maintenant");
       inside the phone the real app's French (Vue panoramique / Vue avant / Vue inférieure, the Mini row as
       Panoramique en direct … Pêche sur glace en direct, Paramètres / Accueil / Map, "Disponible avec le PingLive
       Mini"). Three English fixes against specs.md: the panel's "max 240 ft" hint removed in both languages (specs say
       230 ft; the app's steps still reach 240, untouched), the ice description reads 39° × 20° (text only, the
       engine's 18° stays), the ice step 3 drops "60 ft". Checked again at 1280×800 and 375×812 on both pages: the
       longest tile name "Pêche sur glace en direct" wraps to two lines inside its tile, nothing overflows.
       Screenshots: `docs/2026-10-26-lab-fr-screens.jpg`.

160. **2026-10-26** — **The boat's drag cue comes back once the boat has stopped** (Jason via Lab HQ: "船的那个 drag 的这个标签，好像动过之后就不行了，它就消失了 … 船停下来之后，这个东西就可以出现").
     - Summer lake: the reticle round the hull and the caption "Drag the boat to move it" hide while the boat is dragged
       or still moving (> 0.25 m/s) and fade back in ~1.2 s after it has settled (about 2.5–3 s after release); the next
       drag hides them again. `s.cueHide` (Boat in Scene.jsx) drives both. `first_drag` still fires once.
     - Ice page unchanged: its reticle and caption stay gone after the first tap (`s.cueHide` is unset there, the caption
       falls back to `hasDragged`).
     - Checked locally: desktop 800×600 and phone 375×812 — caption opacity 1 → 0 within 0.5 s of the drag, back to 1 at
       ~2.8 s; ice page hint still gone after a tap; no console errors. Not uploaded.

161. **2026-10-26** — **The summer lake gets clouds in the water, a sun glitter path and a real wake** (Jason in Lab HQ, on
     `docs/2026-10-26-lake-surface-options.md`: "b的湖面和c结合").
     - **B:** fair-weather clouds drift across the reflected sky (a cloud deck 160 m up, seen along the mirror ray); the
       sun stands low ahead of the camera, so a path of small soft sparkles blinks up the far water. Where a pixel covers
       a whole 40 cm sparkle cell (far water, phones) the points thin out and dim, so phones do not get a field of white
       dots. The high sun's own glints stay.
     - **C:** the boat's path is kept (16 points, one every 1.2 m, 8 s). Behind it: two Kelvin arms at ±19.5° made of short
       oblique crests with white tops, not evenly spaced and broken up by noise, so they never read as straight dark
       lines (#91); transverse waves behind the stern; a churned foam trail down the middle. Everything fades in ~5–8 s.
       The old round rings are gone. Comparison: `docs/2026-10-26-lake-bc-result.jpg` (live rings / the option-C
       prototype's two dark lines / the final feathers).
     - **Cost (#50, fewer samples, never a plainer look):** the clouds are sampled per vertex on a 3.5 m grid (the
       water plane is now 256 × 256), not per pixel. The wake is worked out once per frame into a 256² half-float map
       over the path (≤ 0.3 m a texel), only while a wake is alive; the water just looks it up and adds the foam's fine
       grain. Laptop GPU, headless Chromium, vsync off, 2 runs each: at rest 4.8 → 5.1 ms (1920×1200) and
       7.5 → 7.9 ms (2560×1600); during a wake 4.9 → 5.4–5.9 ms and 7.6 → 8.3–8.8 ms. That is +4–8 % at rest and
       +10–15 % for the ~8 s after a drag. On the V10 baseline (~15 fps, GPU-bound) that is ≈ −1 fps at rest and
       ≈ −1.5–2 fps during a wake (scaled, not measured: the tablet was not available).
     - Ice page untouched (it has no Water mesh); checked on desktop and phone. Sonar untouched (Water is on the
       sonar-hidden layer). 0 console errors. Local only; not uploaded.

162. **2026-10-26** — **The summer lake reflects a real photographed sky and gets real fine ripples** (Jason in Lab HQ:
     "湖面用免费的 1 和 2", picks 1 and 2 of `docs/2026-10-26-lake-water-resources.md`; the paid options were declined).
     - **1, the sky:** a Poly Haven pure-sky photo (CC0). Upper half only, tone-mapped, 1536 × 384 JPEG, 52 kB,
       sampled equirectangularly along the reflected ray. It replaces #161's noise clouds; the per-vertex cloud pass and
       the 256² water grid are gone. The sky is turned so its sun stands 0.25 rad right of the default view and drifts
       ±7° over minutes. The glitter path is drawn from a sun 25° high on that bearing, so it runs up the far water as
       in option B, whatever the photo's own sun height. The sky sheen was raised (F·1.9 + 0.06) so the clouds read.
       Default: `kloofendal_48d_partly_cloudy_puresky` (fair-weather cumulus). Alternatives:
       `evening_road_01_puresky` (golden hour) and `kloofendal_38d_partly_cloudy_puresky` (hazy). Comparison
       (desktop 1440×900 + phone 390×844): `docs/2026-10-26-lake-sky-options.jpg`. Files: `docs/lake-skies/`.
       **Open for Jason:** pick the sky.
     - **2, the ripples:** three.js / jbouny `waternormals.jpg` (MIT, notice kept). 512², 66 kB, two copies drifting at
       13 m and 4.7 m, calmer where a pixel spans many ripples. It replaces #156's two value-noise ripple layers; the
       first, stronger try drew diagonal streaks on phones. Glints toned down (sharp ones only up close).
     - **Licences and sources:** `src/experiments/2026-09-23-sonar-lake-3d/assets/LICENSES.md`.
     - **Size:** both images are imported with `?inline`. The share build grows 2,652,588 → 2,809,836 bytes
       (+154 kB, base64 of 118 kB). The ice share build grows the same, because it is the same bundle.
       `build-share.mjs` now also fails on any image left as a file under `assets/`.
     - **Frame time:** measured, laptop GPU, headless, vsync off, 2 interleaved runs. It went down: 1920×1200 at rest
       6.5–6.8 → 6.1–6.2 ms, during a wake 6.9–7.0 → 6.4 ms; 2560×1600 9.2–9.4 → 8.9 ms. Texture reads replaced
       the noise and the vertex clouds. On the V10 (estimate, not measured): no loss against #161, about −1 fps
       against #156.
     - Ice page untouched (no Water mesh; checked desktop + phone). Sonar untouched. 0 console errors. The share build
       runs. Local only; not uploaded.

163. **2026-10-26** — **The summer lake's ripples follow drone photos of real lakes** (Jason in Lab HQ, after the sky
     comparison: "差别不大 但是水面波纹还是很糟糕"; sky A of #162 stays). Write-up, references and their credits:
     `docs/2026-10-26-lake-ripples.md`. Comparison now / after / real: `docs/2026-10-26-lake-ripples-desktop.jpg`,
     `docs/2026-10-26-lake-ripples-phone.jpg`.
     - **References:** five free-licence photos from Wikimedia Commons (four Ontario lakes: Rice Lake ×2, Lake 239
       IISD-ELA, Huntsville; plus Ritzensee). They show a mostly glassy lake with wind lanes and cat's paws, breeze
       ripples of 0.5–1.5 m as scattered crescents, and far water as a smooth sheen.
     - **What #162 got wrong:** one even fine diagonal grain over the whole lake ("scratches / cloth"); the ripple map
       visibly tiling (4.7 m, 13 m); the 0.4–1 m members of the wind sea drawing ruled hatching (a render with the
       water hidden proved it was the water, not the lakebed); no scale to the boat; far water still grainy.
     - **Now:**
       - Roughness in patches. Calm slicks are ~6 %, almost a mirror. Wind lanes (40–80 m) are ~⅓. Cat's paws (8–25 m)
         run downwind at ~1 m/s and change shape; inside a lane they reach full roughness.
       - Breeze ripples are drawn as short crests, 0.6–1.6 m (about ⅕ of the boat). Four wavelengths, ±37° round the
         wind, gravity + surface-tension speeds. A warp bends them into crescents, and each lives only in small groups.
       - Every ripple fades with the pixel's footprint, so far water turns to a sheen. Beyond ~0.9 m a pixel the crest
         code is skipped.
       - The wind sea keeps only 7 → 1.7 m at slope 0.03, spread ±69°.
       - `waternormals.jpg` stays only as a faint 22 m undulation, read 1.5 mip levels blurred (its grit read as stone)
         through the same warp; the 4.7 m copy is gone.
       - The facet-to-eye shading is raised: sheen 6 → 9, scattered light 2.2 → 3.0. The wake is scaled by 0.67, so it
         looks as before.
     - **Frame time (#50):** laptop GPU, headless, vsync off, two interleaved runs against #162.
       - The first version cost +0.6–0.9 ms at 1920×1200 (+10–15 %). It now shares the warp and the group noises, so
         it costs nothing measurable:
         - 1920×1200: 6.1–6.7 → 6.1–6.2 ms at rest; 6.5 → 6.5 ms during a wake.
         - 2560×1600: 8.7–9.4 → 8.7–9.6 ms.
         - 390×844 @3×: 1.93–1.98 → 1.94 ms.
       - Estimate for the V10 (not measured; the tablet was not here): no change against #162.
     - **Share build:** 2,809,836 → 2,812,245 bytes (shader text only).
     - **Ice page (#94):** untouched. It has no Water mesh; checked on desktop + phone.
     - **Other checks:** the wake after a drag is checked; 0 console errors.
     - Local only; not uploaded.

164. **2026-10-26** — **Lake ripples round 3: dark deep-water references, a softer 3D look** (Jason in Lab HQ, on #163:
     the references should be dark deep lakes like ours. "#162 looks like a pattern copied", and #163 is fine for real
     life "但是可能在我们这个3D 出来的这个场景里面可能还是不太自然").
     - **Reference board:** `docs/2026-10-26-lake-dark-water-refs.jpg`, 10 images.
       - Six free-licence aerials of dark deep lakes from Wikimedia Commons: Ahmasjärvi ×2 (CC0), Viljamaanjärvi,
         Bisajärvi, Moose Cove Lake NS, Fiskträsk.
       - Accuphy's own PingLive Forward/Down animations.
       - The three.js ocean example (MIT).
       - three.js `Water.js` at our camera, as a counter-example (it reads as grey stone).
       - Common traits: deep blue-teal, the surface read mostly through a smooth near-dark/far-bright Fresnel sheen,
         few and small highlights, ripples barely resolved from this height, far water merging into the haze.
     - **Version 3:**
       - Roughness evened out (0.35 + 0.3·lane + 0.4·paw instead of near-mirror slicks), so it never mottles.
       - Breeze crests lower (0.11 → 0.07) and their groups softer.
       - Ripple shading lowered: sheen 9 → 5, scattered light 3.0 → 1.6.
       - Stronger Fresnel gradient (F·2.6 + 0.03).
       - A slightly bluer veil (0.07, 0.29, 0.40).
       - New: thin sparse sky glints on the ripples' backs (`glint`, up to 0.13 of the sky).
       - Wake rescaled 1.2, so it looks as before.
     - **Comparison #162 / #163 / v3 / references:** `docs/2026-10-26-lake-ripples-r3-desktop.jpg`, `-phone.jpg`.
       An honest read: v3 is bluer and calmer than #163, but at full-screen size the step is modest.
     - **Frame time (#50):** headless laptop GPU, vsync off, interleaved against #163; no measurable change.
       - 390×844 @3×: 1.95 → 1.96–2.01 ms.
       - 1920×1200: 6.14–6.34 → 6.19 ms.
       - V10 estimate: unchanged.
     - **Ice page (#94):** untouched (checked desktop + phone).
     - **Other checks:** the wake after a drag is checked; 0 console errors.
     - **Then Jason (in this chat):** look on GitHub for open-source water, free for commercial use.
       `docs/2026-10-26-lake-open-source-water.md` + `.jpg`: the best fit is **ABYSSAL** (squall01337/abyssal-ocean,
       MIT, WebGL2 + three.js spectral FFT ocean). It does not repeat at any scale. **Open for Jason:** whether to
       port its spectrum + FFT (lake settings, 128–256², phone-light) into our Water.
     - Local only; not uploaded.

165. **2026-10-26** — **The lake's waves come from a real wind-sea spectrum (FFT), after ABYSSAL** (Jason in this chat:
     "动，把 ABYSSAL 的做法接进湖面，先在本地做手机也能跑的轻量版").
     - **What:** `lakeFFT.js`, adapted from ABYSSAL (squall01337/abyssal-ocean, MIT; the notice is in
       `assets/LICENSES.md`).
       - The spectrum is JONSWAP + TMA + Donelan–Banner spreading, Tessendorf h0 and its time evolution, butterfly FFT,
         for a lake: wind 4.2 m/s, fetch 3 km, depth 18 m.
       - Only the slopes are kept (∂h/∂x + i·∂h/∂z as one complex field), so one RGBA FFT carries two cascades.
       - Three cascades with unrelated tiles (131 / 23.7 / 5.3 m), so nothing repeats at any scale.
       - Each cascade fades once its texels shrink below a few pixels; mipmaps do the rest. The water reads the slopes
         instead of #156–#164's hand-made wave sums, crests and ripple map.
       - Gust lanes and cat's paws still modulate them softly (0.6–1.4).
       - Gain 0.7 (1.0 read choppy from 60 m; dev aid `?fftgain=`).
       - Kept unchanged: the sky photo, Fresnel, glints, glitter path and fog. The wake is lowered to 0.8, so its
         regular bars do not stand out.
       - `waternormals.jpg` was deleted.
     - **Desktop / phone:**
       - Desktop: 256², all three cascades, every frame.
       - Phones (coarse pointer or ≤ 820 px): 128², only cascades A + B, every other frame.
       - Dev aid: `?fftn=64|128|256|512`.
       - Float render targets if `EXT_color_buffer_float` is there, else half float.
     - **Frame time (#50):** headless laptop GPU, vsync off, interleaved against #164.
       - 390×844 @3× (phone path): 1.98 → 2.12 ms at rest (+7 %), 2.20 → 2.24 ms during a wake.
       - 1920×1200: 6.04–6.08 → 6.78–7.22 ms (+12–18 %).
       - 2560×1600: 8.6 → 9.5–9.7 ms (+11 %).
       - The FFT is a fixed cost, not tied to the screen size. On the V10 expect roughly −0.5 fps, an estimate only.
         **Measure on the V10 before this ships.**
     - **Comparison:** #163 / #164 / #165 / references (ABYSSAL looking down, a dark lake, Accuphy's animation,
       Viljamaanjärvi) in `docs/2026-10-26-lake-fft-desktop.jpg` and `-phone.jpg`.
     - **Share build:** 2,812,245 → 2,729,144 bytes (the ripple map is gone). It runs with 0 console errors on desktop
       and phone.
     - **Ice page (#94):** untouched; it has no Water mesh, so no FFT runs there (checked desktop + phone).
     - **Other checks:** the wake is checked; 0 console errors.
     - Local only; not uploaded.

166. **2026-10-26** — **iPhone fixes: the drag cue survives a cancelled touch; a real-looking wake** (Jason on his iPhone,
     via Lab HQ's LAB-iphone-fix: "船划过的地方的波纹看着还是非常奇怪。还有就是 drag the boat 那个标签 … 在船动过一次以后，它就不出现了").
     Details, frames, frame times and credits: `docs/2026-10-26-lake-wake.md`.
     - **Drag cue (#160 did not work on touch):**
       - React Three Fiber never passes a `pointercancel` on to a mesh, and iOS cancels touches readily. After a
         cancel, `dragging` stayed `true` for good.
       - `PickPlane` now ends a drag on any window pointerup / pointercancel / touchend / touchcancel, on blur and on a
         hidden page. The ice page's `IcePick` drops its aim on a cancel.
       - Reproduced and fixed with real touch input in Chromium; checked in WebKit with pointer events.
       - A real-iPhone check is still owed.
     - **Wake:**
       - The ladder of bars, the white beads and the transverse bars are gone.
       - It now follows drone photos of small boats (`docs/2026-10-26-lake-wake-refs.jpg`): a calm slick lane; thin
         arms of fine curved crests (~0.9 m) with a sharp outer edge at 19.5°; ragged white water only at the stern.
       - Everything scales with the speed of the path and is short: the arms about 10 m, gone about 2 s after a stop.
       - The wake map is 384² over the newest 26 m of path (≤ 0.12 m a texel).
       - Comparison: `docs/2026-10-26-lake-wake.jpg`.
     - **Frame time (#50):** no measurable change on the phone path or on desktop (laptop GPU, headless).
     - **Ice page (#94):** a tap still drills; it has no wake.
     - **Hull heading — decided, not to be raised again:** the hull never turns, because the beams are fixed to its
       heading, so it is often dragged backwards or sideways. Jason 2026-10-26, via Lab HQ: "不做". The bow and the beams
       keep their fixed direction.
     - Local only; not uploaded.

167. **2026-10-26** — **In-app browsers: a static cover first, a lost-WebGL card, the page height from innerHeight** (Klaviyo HQ's
     BF funnel handoff `handoffs/2026-10-26-bf-funnel-lab-extras.md` item 3, dispatched by Lab HQ; follows the load study
     `docs/2026-10-26-lab-load-time.md`). Local only.
     - **Cover:** the share build writes a pure HTML/CSS cover into the page (`#lab-cover`: lake-blue, the brand SVG logo,
       "Loading the lake…" / "Loading the ice…", a sliding bar). It paints as soon as the file lands (first paint 0.64 s on
       the 4G simulation, before the 2.7 MB has finished) and fades 0.3 s after the lake's first frame. The 3D now mounts one
       frame after the page (a 120 ms timeout as fallback for background tabs); the fade waits for the `ready` event plus
       two frames, because frames cannot run during the scene-build task. `labEvent` also dispatches a window event
       `accuphy-lab` for this. The first 3D frame itself is unchanged (≈3.7 s on 4G; the real fix is proposal C of the study).
     - **Lost WebGL context** (Meta's browser drops it under memory pressure): `webglcontextlost` is caught, a card
       "The 3D view stopped — tap to reload the lake" (fr too) replaces the frozen canvas; `webglcontextrestored` remounts
       the scene. Verified with `WEBGL_lose_context`: card shown, canvas back after restore.
     - **Height:** `<main>` is `height: var(--lab-h)` from `window.innerHeight` (resize / orientationchange /
       visualViewport), not only the viewport units that collapse inside Facebook's browser. The desktop and both pages
       are unchanged at 1280×800 / 390×844.
     - **Not done here:** the cheap-phone resolution tier (`dpr` lives in Scene.jsx's `<Canvas>`, the ice chat's file) and
       "fish within 10 s" (depends on the start spot and the Home-first pick) — both noted for the ice chat / HQ.

168. **2026-10-26** — **Black Friday ad clips recorded from the Lab** (Lab HQ's order: item 4 of
     `handoffs/2026-10-26-bf-funnel-lab-extras.md`).
     - **What:** 3 clips × 15 s (ice Mini drilling and seeing fish, boat PingLive Panoramic, Mini Live Forward).
       - Each comes in 9:16 (1080×1920) and 4:5 (1080×1350), clean, English and French, as H.264 MP4: 18 files.
       - Each also has `.srt` files and the caption source `captions.json`.
     - **Where:** `reference/ads/2026-11-bf/`, not in git, about 280 MB.
     - **How:**
       - The tools are in `scripts/dev/ads/`.
       - Recording runs on a virtual clock (1/30 s per frame), with real touch events and a finger dot.
       - The 4:5 frames are made from the 9:16 ones, the picture centred with blurred sides. Recording at 4:5 directly
         failed, because the page lays out wide there.
       - Captions are burned in with Instrument Sans; the encoder is AVFoundation, since there is no ffmpeg.
     - **Open:**
       - The captions are drafts: EN to Klaviyo HQ, FR to the website HQ.
       - The fish are small in the ice clip and the Mini Forward clip.
     - Details and the caption table: `docs/2026-10-26-bf-ad-clips.md`. Not uploaded anywhere.

169. **2026-10-26** — **"Send to a friend" and the App badges — two placements for Jason, off until he picks** (BF funnel
     handoff items 1–2, dispatched by Lab HQ: 先出 2 个样子给 Jason 看，不直接定). Local only; nothing shows without
     `?extras=a|b`.
     - **Share** (`ShareButton.jsx`): the system share sheet where it exists (`navigator.share`); otherwise a small menu
       with WhatsApp, text message and "Copy link" (Facebook's Android browser). What goes out is the store page
       `shop.accuphy.com/pages/lab?ref=share` (`/fr/…` in French) with a short line, never the Lab's own address;
       each send reports `share` with `{ channel }` (system / whatsapp / sms / copy). No reward wording.
     - **Badges** (`AppBadges.jsx`, `badges/`): the official black App Store (en, fr-CA SVG) and Google Play (en, fr-CA PNG)
       badges, linking to the store's own app pages (App Store id6743123048, Play com.accuphy.sonar). Google Play carries
       `referrer=utm_source=accuphy-lab&utm_medium=referral`; the App Store link is plain until the provider token
       arrives. A tap reports `app_badge` with `{ store }`.
     - **Placements:** **A** desktop: a row under the Shop button in the panel (share + badges); phones: the share icon beside
       the Shop pill on the frame's top edge, the badges top-left. **B** desktop: a glass strip under the step cards' row,
       right; phones: a strip across the top (share icon + badges). Both checked at 1280×800 and 375×812, the fallback
       menu too; no console errors. Screenshots: `docs/2026-10-26-share-badges-options.jpg`. The loser is removed once
       Jason picks; the strings are in `i18n.js` (en / fr, the French still to be reviewed by the website HQ).

170. **2026-10-26** — **The #153 round-3 fish on the live lake and ice pages** (Jason in Lab HQ: "对，把第 3 轮这一版的鱼搬进正式页面").
     - **What:**
       - Every page now draws the fish as the transducer sees them: `fishMode = 'echo'`, true size `fishSize = 1`, the
         `arcGrain` texture crossfaded between pings (#153 round 3, 86e565c).
       - The #120 marks are gone from the vertical views. Panoramic keeps the marks, as in #153 (`flat` in SonarScreen).
       - The ice page's flasher and Live Ice views are checked and fine.
       - Dev only: `?fish=marks` (A/B against the old marks), `?fishsize=1.6`, and the test page's two switches. In a
         production build there are no switches and no flags.
     - **Bookkeeping:** the code change went into the other chat's commit 0d5385b, because we share one working copy;
       its comments said #169. This commit relabels them #170.
     - **Trembling at Jason's spot** (PLM Forward 90 ft, boat −12.3, 20.4; 45 consecutive frames at exactly 1/30 s,
       virtual clock; fish region of the flat picture):
       - Pixels changing per frame: marks 24 % (the same as #153's marks figure) → echo 4 %. #153 round 3 reported 16 %
         with its own method; this method gives lower numbers.
       - One fish followed through all 44 steps: the centre moves 1.6 px median, 2.4 px max per frame (its own swimming
         included; marks 1.4 / 2.7 px). Its brightness swings ±5 % median, ±10 % max (marks up to ±192 %).
       - Nothing from #154–#166 (far lakebed, FFT surface, wake) interferes.
     - **Comparison:** `docs/2026-10-26-fish-old-new.jpg` (desktop, phone, and the fish up close).
     - **Cost (#50):**
       - Phone 390×844 @3, dev server, interleaved, 2 runs each:
         - PLM Live Forward 3.94–4.24 → 3.98–4.22 ms.
         - Live Combo 4.44–4.84 → 4.55–4.85 ms.
         - PL Forward 3.91–4.15 → 4.25–4.36 ms (+0.2–0.3 ms).
       - #153's counts still hold: triangles about +10 % in a vertical view and twice that in Combo; no download.
       - Not measured on the V10.
     - **sonar-qa:**
       - Build passes. The float textures are Nearest-filtered (sonarMarks, the FFT butterfly) or half float + Linear.
       - fish-sim over 15 min: 0 violations, lowest gap 0.43 m.
       - Grid against `?fish=marks`: lake 6 spots × 6 views, ice 3 spots × Live Ice / Forward / Down / Combo.
         - Old and new differ only in the fish.
         - Mini Forward at the deep spot is black in both, as physics says.
       - 0 console errors on desktop and phone.
     - Local; not uploaded.

171. **2026-10-26** — **Panoramic as a sound picture, on a test page** (Jason in this chat: "panoramic view 在手机上面的显示效果非常的
     糟糕 … 我觉得是画面逻辑的根源问题"; research `docs/2026-10-26-panoramic-rethink.md`; then, via Lab HQ: "全景用方案 A：重做成
     声音的图，先做测试页我手机上对比").
     - **The root:**
       - Panoramic was a plan-view photograph of the 3D models (§7.13): a top-down depth map, geometric shadows, analytic
         fish marks. That gave the circles, balls, hard black spokes and grain Jason saw on the phone.
       - The vertical views were already drawn as what the transducer hears.
     - **Now (test page only):** Panoramic runs through the vertical views' pipeline with the fan laid flat.
       - The strip camera looks 35° below the horizon and covers ±30°, i.e. 5°–65°: the 5°–25° slab plus the sidelobe
         that finds the bottom from the boat outward (§7.12).
       - The rows are weighted by depression (`rowWeight`, `panoLobe`), and so are the #153 fish (lakeMaterial
         `uPanoLobe`).
       - The bottom is continuous between rows, a flat-topped stretch per row, because a grazing fan meets the bottom
         metres apart from row to row.
       - The field is calm: the arcs much softer, over slow patches. Structure is toned to a soft patch (×0.35) and fish
         are brighter (×2.4). The data runs to the screen corners (1.45 × range).
       - Shadows and coverage come out of the rays themselves: soft lanes behind rocks, darker near the boat until the
         beam reaches the bottom.
       - The lakebed lockup is seen as structure by the strips.
     - **Where:**
       - Test page `src/experiments/2026-10-26-sonar-pano-echo` (`lab="pano"`), with a switch on the page (全景：现在 /
         全景：声音的图); `?pano=old` opens on today's.
       - Share build: `VITE_LAB=pano node scripts/build-share.mjs`.
       - The lake and ice pages are unchanged (`uPano` = 0, `uPanoLobe.x` = 0: the same arithmetic as before).
     - **Comparison:** `docs/2026-10-26-panoramic-sound-picture.jpg`: timber flat, shelf, phone, and the app's lake frame.
       Field index histogram at the timber flat: 0.16 / 0.38 / 0.24 / 0.08 in the first four bins (the app: 0.01 / 0.70 /
       0.24 / 0.04; today's: 0.22 / 0.58 / 0.13 / 0.01).
     - **Cost (#50):**
       - Phone 390×844 @3, dev server, interleaved, 3 runs: 3.10–3.52 → 3.86–4.27 ms (+0.75 ms, about +21 %), the same
         as Forward, which it now is.
       - Not measured on the V10.
     - **Open for Jason's look:**
       - Fewer fish dashes than today's enlarged marks.
       - The timber flat's rocks read as soft orange patches.
       - The near field is black inside depth/sin 65°.
     - Local; not uploaded. HQ puts the test page on the friends' test link for Jason's phone.
     - **Fix (2026-10-26, found while checking the lure question for ad v3):**
       - #170 had dropped the ice page's jig from the sonar. The jig is an analytic mark, and with the fish drawn from
         their bodies the marks were not drawn at all, so the Live Down fan lost the jig and the flasher dial lost its
         jig and fish lines.
       - With the new fish, the marks now carry only the jig (`computeMarks` gets no fish), and `fanEcho` draws them on
         top of the fish image.
       - Checked on the ice page, Live Ice: the jig mark and the dial's lines are back, matching `?fish=marks`.

172. **2026-10-26** — **A 110 ft hole in the lake, and a jig dropped from the boat** (Lab HQ's LAB-ad-v3, Jason: "做，深水那一拍
     jig 从船上掉到 100 ft"; brief at the end of `docs/2026-10-26-ad-v2-pinglive-brief.md`).
     - **The hole (`terrain.js` `DEEP_HOLE`):**
       - A bowl to 33.5 m (110 ft) at (−22, −45), north-west of the deep floor (~70 ft there).
       - Its floor is ~8 m across; the walls are ~25° and rise to the floor around by r ≈ 16 m, with a wandering outline.
       - It is clear of the lockup (x −1…31 at z −52), both wrecks and the ice camp. The ice start stays at 37.6 ft and the
         camp at 32.7 ft.
       - Before it, the lake's deepest point was 79 ft.
     - **The lake's jig (`Scene.jsx` `LakeJig`):**
       - A rod over the starboard side, a line, and a chartreuse 1–1.5 oz jig head with a pearl soft plastic, drawn ~3×
         life size.
       - It sinks at 0.42 m/s (≈1.4 ft/s), is worked in small hops 0.8 m off the bottom, and is reeled up (3 m/s) as soon as
         the boat moves.
       - It reaches the sonar like the ice jig: `s.jig` → the jig mark in Down and Forward.
       - The fish ignore it on the lake unless `s.jigFish` is set (no exaggerated strikes, as asked).
       - Deep, its mark widens to about a beam's width (~1° each side) and is brighter, so at 90–100 ft it reads as a dash.
         The ice page's jig (10–15 m) is unchanged.
       - Triggers: `s.jigDrop` for recordings, or `?jig` on the page (the jig goes down whenever the boat has rested
         ~1.5 s).
       - **Open, Jason's call:** what visitors get to drop it (a button, auto when the boat stops over deep water, or
         nothing).
     - **Ad v3 stills** (`docs/2026-10-26-ad-v3-stills.jpg`; originals in `reference/ads/2026-11-bf/v3/stills/`):
       - The opening: a low side view, with the beam glowing in the water and fish in it.
       - The 135° landing: the whole coverage block in the lake from the side.
       - The jig at 100 ft, in two versions:
         - PingLive Down: the hole as a U on the phone, 109.9 ft read-out, the jig a small dash.
         - Mini Live Down: the narrower fan, so the jig reads ~4× larger.
       - Dev-only recording knobs: `camOverride.noLogo` hides the lakebed lockup.
     - **QA (#94):**
       - Lake grid (6 spots × 6 views) and ice grid (3 × 4) against this morning's run.
         - Only the lockup spot changed (the hole now shows west of the lockup, which still reads), plus a little at the
           deep spot.
         - Ice unchanged (≤ 2.3 mean difference, noise).
       - 0 console errors.
     - Not uploaded. HQ puts the lake page on the friends' link (with `?jig` to see the drop) for Jason.

173. **2026-10-27** — **The crappie and perch schools spread out** (Jason via Lab HQ, LAB-fish-spread: "截图的位置鱼太多了，需要现实得
     分散一些").
     - **Why the clump:** not the deep hole and not the jig. Around the hole there are only 1 lake trout and 4 chinook
       within 30 m; one chinook now and then rises to the resting boat.
       - The dense spots were the crappie schools: 12–14 fish placed within 5 m, suspended near the timber.
       - At (−20, −4), a yellow perch school sat on top of one of them.
       - Busiest 8 m cell: 13 fish. A wide beam (Panoramic) lights a whole school at once, so it reads as a clump.
     - **Change (`fish.js`):**
       - Crappie spread 5 → 13 m (5 → 11 m for the 8-fish school); yellow perch 6–7 → 12 m; the shelf bass 6 → 10 m.
       - The perch school at (−24, −8) moved to (−31, −13) on the shelf.
       - Same counts and the same random draws, so every other fish is exactly where it was. Busiest cell now 8.
     - **Checked:**
       - fish-sim over 15 min: 0 violations, lowest gap 0.43 m.
       - Ice grid (3 × 4) unchanged against the last run; 0 errors.
       - Before and after in Panoramic: `docs/2026-10-27-fish-spread.jpg`.
     - Local; not uploaded. HQ puts it on the test link for Jason.
     - **Round 2 (Jason's own screenshot, `docs/2026-10-27-jason-fish-crowd.jpg`):** a Forward beam from the shelf edge
       (about −24, −2) into the middle still crossed a whole crappie school, with walleye and largemouth on the same line
       (the dark ones); the phone start (16, 11) also had 7–9 fish within 14 m.
       - Each crappie school is now two loose groups apart.
       - Spreads widened: the largemouth at (−16, 4) to 16 m, walleye at (−14, 2) to 18 m, the bass at the phone start to
         16 m.
       - Moved off shared lines: one walleye group to (10, 24), one perch group to (−30, 28), the west crappie to (−52, −8).
       - The draws stay in the same order.
       - Busiest 8 m cell: 13 → 5. Jason's view: 5–6 fish in the beam → 2.
       - At the phone start, 4–6 fish within 14 m instead of 7–9.
       - A 24 m Forward line through the fish-rich west half still meets up to ~12, spread along its length.
       - fish-sim: 0 violations. Ice grid unchanged, 0 errors.
       - Before and after: `docs/2026-10-27-fish-spread.jpg`.
     - **Round 3** (Jason in Lab HQ on /jig/: "这样又太少了 另外鲈鱼的体型可以大1.5倍吗"):
       - **Density lands between round 1 and round 2.**
         - Crappie groups and perch schools spread 12 → 9 m; the first crappie group moved from (−14, −9) back to (−14, −4).
         - Shelf largemouth 16 → 12 m, walleye at (−14, 2) 18 → 14 m, the bass at the phone start 16 → 12 m.
         - Same counts and the same draws.
       - **Measured over 60 s of swimming, smelt not counted:**
         - Jason's Forward line: 2.7 (round 1) / 1.1 (round 2) → 1.8 on average, 0–4.
           - The 3D view shows about twice that: the snapshot has 3 in the beam.
         - Phone start within 14 m: 7.6 / 5.5 → 6.2.
         - Busiest 8 m cell: 12 / 7 → 8.
       - **Bass drawn 1.5× bigger** (largemouth and smallmouth): `scale: 1.5 × FISH_DISPLAY_SCALE`, like the musky.
         - The true `len` is unchanged.
         - The sonar echo comes from the drawn bodies (#153), so it grows with them. The test bass in Down and Forward
           (`?fishtest`) show longer arcs.
         - Bottom clearance and structure clearance follow `drawnLen`.
       - **Checked:**
         - fish-sim over 15 min: 0 violations, lowest gap 0.41 m.
         - Ice grid (3 × 4) against round 2: only fish-sized differences.
         - Lake grid (6 × 6): clean.
         - Phone look at the lake and /ice/.
         - 0 errors.
       - Before and after: `docs/2026-10-27-fish-round3.jpg`.
174. **2026-10-27** — **Ad v3: PingLive first, the 110 ft hole stays, no jig drop** (Jason in Lab HQ, answering the three
     open questions from #172: "both, but we're making just pinglive for now to be very good and as an strategic example
     for the rest after it. keep it, let's remove the drop a jig part on video and live page").
     - **Product:** both PingLive and Mini get the ad in the end. Only the PingLive version is made now, and it is made
       very well, because it is the template for the Mini, ice, 4:5 and French versions that follow.
     - **The hole:** the 110 ft hole (`DEEP_HOLE`, #172) stays in the lake.
     - **The jig drop is removed:**
       - From the ad: the deep-water beat shows deep water and fish at ~100 ft on the phone, with the real depth
         read-out and no jig. Caption stays "Serious deep water ready."
       - From the lake page: the summer-lake jig (`LakeJig`, the `?jig` trigger, `s.jigDrop`) comes out, so visitors
         never get a drop and there is no question of a button.
       - The ice page's jig (#127) is not touched.
     - The "how do visitors drop a jig" question from #172 is closed by this.
     - **Done (lake jig):** `LakeJig`, `?jig`, `s.jigDrop` and `s.jigFish` are out of `Scene.jsx`. The fish now react to a
       jig only on the ice page.
       - The deep-range widening of the jig mark (#172, `sonarMarks.js` / `legacyMark`) stays: it only acts past 13 m of
         range, so on the ice page it changes nothing.
       - Checked: the lake grid (6 × 6) and the ice grid (3 × 4) against the commit before show only swimming-fish
         differences; 0 errors.
     - **Done (the deep-water still, PingLive only):** `docs/2026-10-27-ad-v3-deep-still.jpg`.
       - PingLive **Forward**: it reads better than Down here.
         - The phone shows the whole bowl of the hole (the floor dropping in, timber on the near wall, rising again) and
           three fish holding inside at ~90 ft.
         - The read-out says 101.5 ft; range 80 ft.
         - In Down at 140 ft depth range, the fish were two small dots.
       - The boat sits 10 m west of the hole's centre (−32, −47.2). The camera is m4 moved back and right, so the whole
         beam shows above the phone and the boat sits under the caption, not behind it.
       - Caption "Serious deep water ready.", no big number.
       - **Fish added (no deep fish were near the hole; the deepest was a chinook at 51 ft):** three lake trout in the
         hole at 92, 97 and 99 ft (`fish.js`, appended last, so no other fish moves).
         - They swim on small loops (≤ 2.5 m), so they stay over the flat floor instead of being lifted off the bowl's
           walls.
         - They may rise to a resting boat like the other trout.
       - Checked:
         - fish-sim over 15 min: 0 violations, lowest gap 0.41 m.
         - Lake 6 × 6 and ice 3 × 4 grids: 0 errors.
       - Tools: `scripts/dev/ads/v3/v3deep.mjs` replaces `v3jig.mjs`; `stills3.mjs` drops the jig and Mini entries.
175. **2026-10-27** — **The boat's wake: the round rings (#156) replace the Kelvin wake (#166)** (Jason in Lab HQ: "开始前我再次确认下
     船四周的水波纹我要环形的哪个版本 我觉得更好"; he first said it in the cloud chat 电脑端完整版 on preview VxxnVnZr8cxQLXw3iizMdD).
     - **Chosen:** the rings that spread out from the hull while the boat moves (#156, `Scene.jsx` Water shader at 7ae1edd:
       `g += uWake * 0.35 * cos(dB * 2.0 - t * 5.0) * exp(-dB / 6.0) * rb / dB;`). They fade about 1/3 s after the boat stops.
     - **Dropped:** the #166 Kelvin wake (V arms and slick lane, and the wake map that drives it).
     - **Unchanged:** the sky photo, FFT wind sea, glitter path and ABYSSAL look (#161–#165). The rings bend the normals, so
       they sit on top of all of that.
     - The drag cue's ripple every 2.6 s is in both versions and stays.
     - Of the three picks the one-version plan waits on (`docs/2026-10-27-lake-one-version.md`), two are now made: the wake
       (this) and the 110 ft hole (#174). Panoramic still waits for Jason's phone compare.
     - Not built yet: it goes in as part of the one-version work, after Jason says to start.
     - **Built (#176's start):** `Scene.jsx` Water.
       - The #156 rings are back, the same formula, now added on top of the FFT sea after its gain.
       - `uWake` follows the boat's distance to its target as in 1c0ba1c, so the rings run while it moves and fade ~1/3 s
         after it stops.
       - The Kelvin wake is gone entirely: the wake map, its path trail, the slick lane and the stern foam (−105 lines,
         and one render pass less per frame).
       - The drag cue's ripple (Boat) is unchanged.
       - Checked: desktop and a 390 × 844 phone while the boat runs and after it stops
         (`docs/2026-10-27-wake-rings.jpg`); the ice page has no Water (ice grid 3 × 4, 0 errors); 0 errors on the lake.
176. **2026-10-27** — **One version of the lake: started** (Jason in Lab HQ: "开始做，湖景统一成一个版本，圆形水纹一起换上"; plan in
     `docs/2026-10-27-lake-one-version.md`).
     - **Owner:** only "冰钓版本视觉效果" changes the lake scene and the sonar imaging (ice included, #94). Rule added to
       `CLAUDE.md`.
     - **Canon:** `docs/lake-canon.md`, drafted by Lab HQ from the decisions. The owner corrects it and keeps it current.
     - **Build order for the owner:** fish round 3 (#173), then remove the lake jig (#174), then the round wake rings
       (#175), then the ad's deep-water still. After that, Lab HQ rebuilds every test link from one commit.
     - **Links:** `/`, `/mini/` and `/ice/` are rebuilt from that commit. `/jig/` is retired. `/pano/` stays, rebuilt from
       the same commit, until Jason's Panoramic pick. The three old private previews get the same build.
       lab.accuphy.ca only on 动.
     - **Housekeeping done:** the five 10-17 agent worktrees and `wip/ice-camera` are removed. Their commits and
       uncommitted work are saved first as tags `archive/2026-10-1*-*` on GitHub. The case-study worktree stays.
     - **Built (2026-10-27):** every friends' test link (`/`, `/mini/`, `/ice/`, `/pano/`) rebuilt from c9f900b. That build
       has the round rings, fish round 3 and no lake jig. Test-link repo f297eab. `/jig/` now forwards to `/`. All four pages
       open with 0 console errors. The three old private previews were not updated, because overwriting them needs the
       whole page loaded into a chat. Jason decides whether to delete them. lab.accuphy.ca is still 50ad8ca until 动.
177. **2026-10-27** — **Far fish in the sonar: steady, and a middle size** (Jason via Lab HQ, after the deep-water still:
     "中距离的鱼在我的range开的很高的情况下会变得很闪也变小 我觉得闪不对 大小应该折中一点"; his screenshot was PingLive Forward at
     160 ft in a landscape phone).
     - **Cause:** the fish image (#153, `SonarScreen` pass 4) has 256 rows over the fan's reach.
       - At 160–230 ft a row is 0.2–0.3 m.
       - A far fish seen side-on is only a few cm deep along the ray, and only its side facing the sound returns.
       - So it landed on a row in one frame and between rows in the next. Read back from the fish image: far fish were
         1 row high.
     - **Change (`lakeMaterial.js`, the fish pass):** along the ray each body is stretched about its centre to at least
       5 rows deep. About 2.5 rows show: ≈ 0.5 m at 160 ft.
       - A head-on fish (already long along the ray) is not stretched.
       - It fades in from 30 to 45 m of reach (~100–150 ft), so 80 ft and nearer keep their picture exactly.
       - Across the beam nothing changes: the beam pattern already spreads a far fish over ~1.1° (FWHM), the angular
         resolution HQ asked for.
     - **Measured** (fish tracked frame by frame in the fish image, Forward 180 ft): the per-fish swing went from 65 % to
       34 %, and frames where a fish blinked out from 6 to 1.
     - **Checked** (`docs/2026-10-27-far-fish-flicker.jpg`, before | after):
       - Phone landscape Forward at 80, 150 and 200 ft; Down over the hole (AUTO 140 ft); desktop Forward at 160 and 230 ft.
       - 80 ft is unchanged; at 150–230 ft far fish show as small steady marks instead of flickering specks.
       - Lake 6 × 6 and ice 3 × 4 grids: 0 errors. The ice ranges are below 30 m of reach, so its picture does not change
         (#94).
     - Panoramic is untouched: the stretch is off in the flat fan (`uPanoLobe.x`), which waits for Jason's pick (#176).
178. **2026-10-27** — **Panoramic: the sound picture wins; next, tune it against the app's recordings** (Jason in Lab HQ, on his
     iPhone with `/pano/` at 1abeedf, screenshot `docs/2026-10-27-jason-pano-iphone.jpg`: "逻辑对了 但是要继续优化画面 石头的部分应该
     更亮 因为石头的echosound反射比较强 画面还是有不少黑掉的地方 去学习做完学习的真机录屏的画面").
     - **Logic chosen:** Panoramic is drawn as a sound picture (#171), not the plan-view photo. The plan view goes. This
       closes the Panoramic pick from the one-version plan (#176).
     - **Tuning asked for:**
       - Rocks brighter: hard rock returns a strong echo, so a boulder reads as a bright patch, not a dull orange blob.
       - Fewer black areas: the fan still has large dark patches and wedges where the app's fan is filled.
       - The reference is the real app: `reference/recordings/pinglive/6089.MP4` and `3257.MP4` (14–16 m lake), the blue
         62 m wreck `86789ab9-….MP4`, frames in `reference/frames/pinglive_pano_*`, and `docs/2026-10-26-panoramic-refs.jpg`.
     - **Order:** tune on `/pano/` first. Once Jason OKs the look, the sound picture becomes the only Panoramic on every
       page and the plan-view code is deleted in the same change.
     - Owner: 冰钓版本视觉效果 (#176).
     - **Tuned, round 1 (2026-10-27, `/pano/` only):** sheet `docs/2026-10-27-pano-tune-r1.jpg` (phone before / after,
       the same spot flat, the shelf, and the app's 14 m lake and 62 m wreck frames).
       - **What differed from the app** (frames `reference/frames/pinglive_pano_*`, sonar-style §7.12):
         - The app's fan is one even crimson field with soft mottle and radial streaks; black only outside the fan and
           close in where the sound has not reached the bottom. Ours had hard black lanes behind every rock and stump:
           at the island the rocks block the whole 5°–65° slab, so no row reached the bottom behind them.
         - Ours had wavy rings across the field (the bottom's contours): each row added a hot edge line, a second
           echo, and its stretch edges overlapped into a bright line at every row's hit. The app has none.
         - Hard targets in the app are the brightest thing in the fan (yellow to white). Ours toned all structure to
           ×0.35 (#171), so rocks were dull orange discs.
         - Fish in the app are smooth yellow dashes with an orange halo. Ours had stripes through every dash: the
           across-beam blur's taps were ~3 texels apart, so a thin fish was copied into a comb.
       - **Changed (all behind `uPano`, the Panoramic sound picture only):**
         - A floor under the traced picture wherever the slant range reaches the bottom (the baked terrain along the
           bearing): shadows fall to a darker crimson and fade back, never black. Under the boat, where the slant range
           is shorter than the water, it stays dark. Steep under the boat the floor is 75 % of the field, and only half
           the near-range gain cut applies.
         - The rows tile one field: matching stretch edges, no per-row edge line, no second echo.
         - The flat fan's beam is ±1.5° across (was ±0.6°), so shadow sides are soft.
         - Rocks have their own sonar tag (0.45; lakeMaterial `ROCK`, Scene `mats.rock`). Everywhere else it reads
           exactly like timber's 0.5. In Panoramic, rock and steel are drawn at ×0.75 with a higher ceiling (×1.3),
           yellow-white. Timber stays the soft patch.
         - Fish: 25 taps at 0.2 σ, one row each, in place of 13 × 3 reads. Smooth dashes, and fewer reads.
         - Knobs: `uPanoK` = (0.75 hard level, 0.15 floor, 1.3 hard ceiling, 0.75 steep floor). Dev:
           `window.__sonarTune.kp`.
       - **Checks:**
         - Black share of the flat picture (outside the fan and the water column included): timber flat 35 → 24 %,
           hump 31 → 23 %, shelf 23 → 22 %, start (−6, 4) 53 → 46 %.
         - Lake 6×6 grid and ice grid against 689a258 (#94): the same picture. Lit shares are equal and the
           differences are only moving fish and per-ping grain. 0 errors.
         - Phone 390×844 @3: 2.07–2.08 → 2.07–2.14 ms per frame (the same).
         - Desktop 1440×900 checked. Not measured on the V10.
       - **Next:** HQ checks the sheet, then Jason looks on `/pano/`. After his OK (step 5 of the dispatch): the sound
         picture becomes the only Panoramic and the plan-view code is deleted.
     - **Jason's OK (2026-10-27, Lab HQ):** "全景可以了，新画法替换所有页面，旧的删掉". Round 1 (e5a512c) is the look. Step 5
       goes ahead: the sound picture becomes the only Panoramic, and the plan-view code and the `/pano/` test page are removed.
     - **Done (2026-10-27, step 5; Jason in Lab HQ: "全景可以了，新画法替换所有页面，旧的删掉"):** the tuned sound picture
       (e5a512c) is the only Panoramic on every page and in the share builds. The Mini has no Panoramic of its own (Live
       Panoramic is frosted).
       - **Deleted:** the plan-view branch of `sonarShader.js` (`topDepth`, `fishShadow`), `topRT` / `topCam` / `TOP_N`
         and the `uTop*` uniforms (the fish image now has its own `uFishTex`), `panoMode`, `uPano` (Panoramic is simply
         `uFlat`), the plan-view marks and `terrainCPU` in `sonarMarks.js`, the page's 全景：现在 / 声音的图 switch and
         `?pano=old`, the test page `2026-10-26-sonar-pano-echo`, and `VITE_LAB=pano` in `scripts/build-share.mjs`.
       - **Checks against e5a512c:**
         - Lake 6×6 grid: Down, Forward and the Mini views match the lake page; the PingLive Panoramic tiles match
           `/pano/` (equal lit shares at all six spots). One first run had the view switched mid-run; the rerun matched.
         - Ice grid (#94): the same picture. 0 errors everywhere.
         - Phone 390×844 @3, Panoramic: 2.18–2.21 ms per frame. `/pano/` at e5a512c was 2.15–2.21 ms; the lake page's
           old plan view was 1.60–1.67 ms, so the live Panoramic costs about +0.55 ms. Not measured on the V10.
         - Share build `[both]` 2.79 MB.
179. **2026-10-27** — **A chat of its own for ad videos** (Jason in Lab HQ: "做广告视频你来开个新的挂着的窗口 单独制作视频 把配置
     skill 等等好的资源都配置上 视频制作专门让他做").
     - **New chat "广告视频制作"**, started from Lab HQ as its side session. It makes the ad stills and films only.
     - **Skill:** `.claude/skills/ad-video/SKILL.md` covers its scope, the approval chain (stills → HQ → Jason → film), the
       claims and brand rules (Creative Cloud Eurostile only), the recording and encoding pipeline in
       `scripts/dev/ads/`, the formats and where v3 stands.
     - **Boundary:** it never changes the lake or the sonar (#176). New hooks, cameras or fish go through
       "冰钓版本视觉效果". From now on 冰钓 no longer makes ad stills or films.
     - Rule added to `CLAUDE.md` (chat list, skills line).
180. **2026-10-27** — **Load plan B done: the page's download halved** (Jason in Lab HQ: "没问题" to doing it before 11/2;
     plan `docs/2026-10-26-lab-load-time.md` 三 改法 B, items 1–3; item 4, splitting the ice code, is the lake's and stays open).
     - **Fonts:** Instrument Sans and Eurostile Heavy subset to woff2 (`public/brand/fonts/*.woff2`, 36 + 18 KB; were 193 + 201 + 44 KB
       of ttf/otf): Latin, Latin-1, Œ, – — ‘ ’ “ ” • … ← ↑ → ↓ − ≈ ≥ ⋯; the weight axis 400–700 kept, the width axis pinned
       at 100. The italic face is dropped — the rulers' italic numbers are synthesised. `src/index.css` points at the subsets;
       the full fonts stay for the ad scripts (`scripts/dev/ads/`).
     - **Logo:** `public/brand/logo/accuphy-white.svg` (2 KB; the white lockup from `Untitled-1.svg`, cropped) replaces the 147 KB
       PNG in both builds (`__acLogo`) and on the cover. The source files still name the PNG, so the dev server shows it; the
       lake's files were not touched (#176).
     - **Home thumbnails:** the 11 tiles are files in `pages/home/<name>-<hash>.jpg`, fetched only when the Home shows (never on
       desktop), `loading="lazy"`; `vite.share.config.js` inlines every other image as before. `scripts/build-share.mjs` rewrites
       Vite's `new URL(…, import.meta.url)` to `./home/…`, copies the files, caches them for good in `vercel.json`, and throws if
       any other file reference is left. The one-file `accuphy-lab.html` (private Artifact preview) still inlines them.
     - **Measured** (headless Chrome 156, 390×844, 4G 9 Mbps / 60 ms + 4× CPU, gzip, 3 runs each, medians; before = 9a222aa):
       download 1122 → 624 KB; page received 1.17 → 0.63 s; cover painted 0.46 → 0.14 s; Home shown 1.47 → 0.90 s; lake's first
       frame 4.34 → 3.67 s. The 2.6–2.9 s freeze before the first frame is unchanged (plan C). Share build `[both]`: pages
       1.88 MB + 151 KB thumbnails (was 2.79 MB); ice `[ice]` and the embed build pass; embed `lab-4a3ed08481.js` 2.08 MB.
     - **Checked:** dev and built pages, lake and ice, English and `?lang=fr` — accents, ° × − →, the synthesised italic rulers; all
       11 thumbnails load, 0 broken images, 0 console errors. Not yet on any link: HQ rebuilds (`docs/versions.md`).
181. **2026-10-27** — **PingLive Mini Forward shows no depth readout** (Jason in Lab HQ: "PingLive Mini的forward是不显示深度的").
     - **The app** (`reference/app-study/plm-forward-fish-a.jpg`, `docs/app-chrome.md` §6): Live Forward shows only the water
       temperature and the voltage top-left, where the big depth would be. Live Down shows depth, temperature and voltage
       top-left; Live Combo shows them top-right; Live Ice and Ice Fishing put the depth in the dial, with temperature and
       voltage top-right (`reference/app-study/2026-10-23/`).
     - **Changed** (`SonarChrome.jsx` `miniFwd`): in Mini Forward the big readout is gone and the temperature and voltage
       move up into its place. This applies on the lake page and the ice page, desktop and phone. Down, Combo, Live Ice and
       PingLive's own views are unchanged. Ours already matched the app in those views.
     - **Still different, not built (noted for HQ):**
       - Mini Forward has no `1.0x` zoom control with ˄ ˅ on the right edge.
       - In Combo the app keeps the ACCUPHY wordmark above the readout at top right; ours drops the wordmark there.
     - **Checks:** before/after sheet `docs/2026-10-27-plm-forward-no-depth.jpg` (lake desktop, ice desktop, phone 390×844,
       the app frame). 0 console errors on both pages.
182. **2026-10-28** — **The Shop link follows the store's market** (website #228, `handoffs/2026-10-28-lab-shop-prefix-from-website.md`;
     Jason to the website HQ: "修复"; live on Jason's "动，更新" in Lab HQ).
     - `embed.js` `shopUrl` takes the market root `shop` that the store passes (`?shop=` on the iframe URL, or `data-shop` on the
       theme mount). It builds `<shop>/products/<product>` when the value matches `^/([a-z]{2}(-[a-z]{2,})?)?$`. Otherwise it
       keeps the old rule (fr → `/fr`, the rest without a prefix). No utm inside the store, as before.
     - Made by 手机网页端 (1fc1678, 16-case test `scripts/dev/shop-url-test.mjs`); written here by Lab HQ, which the commit had
       named but not logged.
     - Live on lab.accuphy.ca 2026-10-28 (`dpl_6T7KQTqt1zSKNHNbeXovVjMvbuDH`). HQ check: `?shop=/en-us` → `/en-us/products/pinglive-sonar`.
     - Not done: `market=us` → Mini by default; the de/nl/pl/lv interface.
183. **2026-10-28** — **The Lab's ad films go to the colleague 孙英杰** (Jason in Lab HQ: "PinLab 的广告片是交给那个，你要清楚一下，现在
     GitHub 上面已经有一个公司的……organization 的一个账户了，然后他是我的同事孙英杰在管，他会拿过去去做优化").
     - The GitHub organization `accuphy-marketing` holds the Lab repo. Its members are Jason (Owner) and AJ-nb (Member,
       Write on the repo). HQ takes AJ-nb to be 孙英杰, since the org has no one else.
     - 孙英杰 takes the ad film over to optimize it. Lab HQ stops asking Jason for his v3 changes.
     - The ad video chat (#179) pauses: no new renders until the scope below is clear.
     - **Scope, Jason in Lab HQ the same day:** "广告片的单一语言版本是所有的，然后基于这个我还会跟他讨论要修改什么，然后最终是你这里把它
       制作成不同语言版本的。" So 孙英杰 owns every ad film's single-language master (PingLive v3, the US Mini film, the 16:9 /
       1:1 formats). Jason agrees the changes with him. **The Lab makes the language versions** from the approved masters.
     - **His brief:** Jason's email of 2026-10-28 (01:16 Toronto) to customerservice@accuphy.ca, "Accuphy Lab 项目：GitHub、视频和
       最新进展". He answered "好的 收到". It says to work on his own branch and open a pull request, which Jason reviews before
       merging into main. He may change and optimize the lake scene, and pick scenes and sonar pictures for videos himself. He
       must not touch the sonar imaging engine or its logic. Jason decides what goes live.
     - Where his material is: the scripts and plans in `scripts/dev/ads/` (README v3: shots, Mini US, Google/YouTube formats),
       the films in the shared Drive Marketing folder (#179 note), the `ad-video` skill.
184. **2026-10-28** — **Shop click: wait 1 s, "Opening the store…", no repeat clicks** (website #228 second part; Jason to the
     website HQ: "修复"; dispatched by Lab HQ). GA4's `lab_shop_click` was lost: gtag queues events for ~5 s and flushes on
     unload, and the Lab left the page 150 ms after the click, before the event was queued. The website's 00 measured that
     1000 ms delivers both GA4 and Meta (`accuphy-website/backups/2026-10-28-d228b-shopclick-events/README.md`).
     - `embed.js`: `SHOP_DELAY_MS = 1000`; `openShop` ignores further calls while the jump is pending (`isOpeningShop`,
       `onOpeningShop`), and `pageshow` with `persisted` (back from the store through the bfcache) resets it.
     - `ShopButton.jsx`: both placements (desktop panel, phone pill) share that state — label `shop_opening` ("Opening the
       store…" / "Ouverture de la boutique…", the FR drafted from the glossary, **for the website HQ's review**), no arrow,
       `aria-busy`, `.is-opening` (progress cursor, slightly dimmed).
     - **Checked** on the built page in headless Chrome, EN and FR: after one click the label changes, three clicks send one
       `shop_click`, the document request to `/de-de/products/pinglive-sonar` (and `/fr/…`) leaves 1006–1030 ms after the
       click. In the browser pane on the phone pill: the jump reached the real store; the back button returned to a fresh
       button (`back_forward`; whether that was the bfcache or a reload is not proven).
     - Noticed, for the website: in the pane a click with `?lang=fr` requested `/fr/products/pinglive-sonar`, but the store
       answered with the English page `/products/pinglive-sonar` (a store-side language redirect for a browser without French);
       `curl` gets 200 on `/fr/…`, 200 on `/de-de/…`, and the 301 to the Mini on `/en-us/…`.
     - Not now: the bridge receipt before jumping (website: after 11-02).
185. **2026-10-28** — **No more ad video versions; at most one short film to test the funnel** (Jason to the ad video chat:
     "广告我们目前为止先不做了，孙英杰那边在优化……这种小视频不做了。做的话，你也就做一个就可以了……只是为了跑通项目为主嘛，跑通那漏斗啊，跟投放那些测试走嘛，但不要花精力继续做各种版本的……横版竖版为了去跑通是没问题的，那多语言版本完全没必要").
     - **Stopped:** the ad video chat makes no more language versions (French, DE, NL, PL, LV), and no Mini US or 16:9 / 1:1
       versions on its own. 孙英杰 is optimizing the ad films (#183).
     - **Allowed:** if a film is needed, **one** film, only to run the funnel and the ad-delivery tests through. Its
       vertical and horizontal formats are fine for that.
     - **Already made, kept but not pushed further:** the French v3 (`reference/ads/2026-11-bf/v3/pinglive-*-fr.mp4`, final
       lines). It is not copied to the Drive unless HQ or Jason asks. The shot plans in `scripts/dev/ads/v3/README.md` stay
       as reference.
     - Which film is that one: **the PingLive Mini film** (Jason in Lab HQ, 10-28: "用 Mini 的片子"). It works for Canada and the
       US, and is made from the "Mini US" shot plan, in English, 9:16 + 16:9 only.
186. **2026-10-28** — **Share link and store badges: store style, on by default** (Jason, this chat: "要的，但是按钮徽章设计做的太
     ai了" about the #169 looks, then "方案一" = the store's style, and "看看大公司怎么干的，是不是旁边要写个小字…download app now").
     Replaces both #169 placements and the `?extras=a|b` switch.
     - **What the research said:** Apple's badge rules — at least 40 px high onscreen, clear space a quarter of the height,
       "legible but not dominant", never altered (developer.apple.com/app-store/marketing/guidelines). Brands put one short
       caption near the badges rather than "download now", because the badges already say "Download on the App Store" /
       "Get it on Google Play" (Strava: a one-line sentence, badges side by side; the store's own footer: the text link
       "Download Accuphy Sonar App").
     - **Desktop:** in the control panel under the Shop button — the caption "GET THE ACCUPHY SONAR APP" (small caps, muted),
       the two official badges at 40 px, 10 px apart, no rounding or glass of ours; below, "Send to a friend" as a plain
       underlined text link with a small share glyph. **Phone:** badges with the caption at the top right over the lake (the
       top left is the back button), 40 px; "Share" / "Partager" as a text link beside the Shop pill on the phone frame.
       The share behaviour (system sheet, WhatsApp / SMS / copy fallback, `share` event) and the badge links are #169's.
     - Strings: `get_app` ("Get the Accuphy Sonar app" / "Téléchargez l’application Accuphy Sonar") and `share_short` ("Share" /
       "Partager") — the FR for the website HQ's review, with `share_opening` (#184).
     - Checked on the dev server, desktop and phone, EN and FR, lake and ice: no overlap, no console errors. Sheet
       `docs/2026-10-28-share-badges-store-style.jpg` sent to Jason; waiting for his look before HQ rebuilds.
     - `index.jsx` was touched for the placement lines only (buttons are the phone chat's, #176 note from HQ); the ice chat told.
     - HQ's check (2026-10-28): Google's PNG carries its own transparent margin, so at the same box height its badge looked
       smaller than Apple's. The two PNGs are cropped to their visible shape (en 564×168, fr 646×192), so at 40 px both badges
       are the same height; Google asks for equal size side by side. Sheet redone.
     - The website's French review (#198, 2026-10-28): the caption is "Télécharger l’application Accuphy Sonar" (the infinitive,
       as the store's /fr footer); "Partager" passes and is the French for every share spot, "Send to a friend" included.
187. **2026-10-29** — **Shop click: the store page does the jump; the Lab only when nobody answers** (website #229,
     `handoffs/2026-10-29-lab-shop-nav-by-store.md`; Jason 2026-10-29 to the website HQ: "好的"; dispatched by Lab HQ). A jump
     made by the Lab from inside the iframe counted as a visit from lab.accuphy.ca: French visitors with an English browser
     were 302'd to the English product page and GA4's landing source was wrong (website backup 2026-10-28-d228c).
     - `shop_click` now carries `url` = the full `shopUrl()` address, in the postMessage data and the Shopify publish payload.
     - In an iframe `openShop` listens up to `SHOP_ACK_MS` = 400 ms for `{ type: 'shop_click_ack' }` and accepts it only from
       `window.parent` at `storeOrigin()`. With a receipt the Lab never navigates (label and repeat-click block as #184);
       without one it navigates itself after `SHOP_DELAY_MS` = 1 s as before. Theme-mounted (no parent) and standalone:
       unchanged, the Lab navigates itself. The bfcache reset is unchanged.
     - **Checked** with a fake store page framing the built Lab (same origin, headless Chrome), one click each:
       | page answers | label | page got | Lab navigated |
       | the receipt | Opening the store… | shop_click {product, placement, lang, url} | no (still on the Lab after 2 s) |
       | nothing | same | same | yes, 1020 ms after the click |
       | a receipt from a sibling frame (wrong source) | same | same | yes, 1018 ms |
       | a message of another type | same | same | yes, 1020 ms |
       `scripts/dev/shop-url-test.mjs` still 16/16. A wrong-origin receipt could not be staged from a real parent (a parent's
       origin is what `storeOrigin()` resolves); the source check covers the sibling case.
     - Release order (handoff): the website's bridge first (an old Lab without `url` gets no receipt and no jump), then the Lab.
188. **2026-10-29** — **"Send to a friend" redone: a QR code and a link to copy on desktop, the native sheet on phones, the link
     by market** (Jason in Lab HQ: "开搞 要做到丝滑 顺畅 无误 的"; on a Mac the #169 button opened the macOS share sheet — AirDrop,
     Notes — which felt wrong on a computer; his idea: a QR code plus a link to copy).
     - **Desktop** (the panel's link): a click opens a popover in the #186 store style — the QR of the share link as an SVG
       (crisp at any DPR, made in the page by `qrcode-generator` 1.5.2, MIT, `assets/LICENSES.md`, no network), the caption
       "Scan with your phone camera to open the Lab on your phone", the link in a read-only field that selects itself, "Copy
       link" → "Copied ✓" for 1.5 s, the hint "Paste it into a message to a friend." Closes on ×, Esc, a click outside and a
       second click; focus goes to × and comes back to the link; `role=dialog`, labels. Framer Motion fade (already in the
       bundle). `navigator.share` is never called on desktop.
     - **Phones** (the "Share" beside the Shop pill): the native sheet (iMessage, Messenger, WhatsApp…). Missing or refused
       (NotAllowedError in the store's iframe without `web-share`): the same popover without the QR — link + Copy + WhatsApp +
       SMS — rendered through a portal to `<body>` (inside the transformed dock `position: fixed` was relative to the dock).
     - **The link** (`embed.js shareUrl(medium)`): `https://shop.accuphy.com<root>/pages/lab` with root = `shopRoot()` else the
       ?lang rule (before, everyone shared the Canadian page); `ref=share&utm_source=lab_share&utm_medium=referral&utm_content=<qr|copy|
       native|whatsapp|sms>&utm_campaign=bf2026_lab_<market>` (website HQ 2026-10-29: GA4 files unknown mediums as
       "Unassigned", so the channel goes in utm_content); market = the `market` param, else the country code from the root as
       the bridge uses it (`/` and `/fr` → ca, `/en-us` → us, `/fr-benelux` → be, `/de-de` → de…), default ca. Klaviyo's D5 scheme.
     - **Events** `share { channel, market }`: qr_shown / fallback_shown when the popover opens, copy, native, whatsapp, sms.
     - **Copy** in the store's iframe: `clipboard.writeText` → `execCommand('copy')` on the selected field → the text left
       selected with "Press ⌘C / Ctrl+C to copy". Never `window.prompt`. HQ asks the website for `allow="clipboard-write;
       web-share"` on the iframe.
     - **Strings** (FR drafted, for the website's review #198): share_qr_caption, share_link_label, share_copy_hint,
       share_copied_check, share_press_copy, share_close; "Partager" reused.
     - **Checked:** `scripts/dev/share-url-test.mjs` 9/9 — the link for /, /fr, /en-us, /de-de, /fr-benelux, /en-pl (+market),
       no shop with and without ?lang=fr, the copy medium; each QR decoded with jsQR to exactly that link. Dev server, Chrome:
       desktop EN and FR popover opens once, one `qr_shown` event, Copy writes the exact link and shows "Copied ✓" (+ `copy`),
       Esc and an outside click close it, focus returns to the link, a second open does not duplicate, 0 console errors;
       the ice page the same (#94). Phone 390×844: native path hands `url …utm_medium=native` to the sheet (+ `native`, no
       popover); NotAllowedError → the fallback popover centred, WhatsApp / SMS links carry their media, outside tap closes.
       Built page in a store-like iframe (headless Chrome, trusted clicks): popover + QR, Copy → "Copied ✓" with and without
       `allow=clipboard-write` (same-origin frame, so the permission case is not a strict proof; the JS-click run without a
       gesture exercised the last fallback, "Press ⌘C"). **Not run:** Safari and Firefox (no Playwright here); a real phone.
       Share build 1.92 MB, gzip 654.6 KB (+17.7 KB for the encoder and the popover). Sheet `docs/2026-10-29-share-popover.jpg`.
     - **HQ's check (2026-10-29), second cut:** the QR is 168 CSS px in a 208 px white box (a 4-module quiet zone at ≈3.5–3.7
       px/module), ECC M; `ref=share` dropped (nothing reads it; Klaviyo's draft only named it — HQ tells Klaviyo); the link
       field keeps the start of the address in view when selected (scrollLeft reset) and the popover focuses × on open; the
       test decodes every market's QR at 3, 2 and 1 px per module. Tags per the website / Klaviyo HQ: utm_medium=referral,
       utm_content = channel, market = the bridge's country code. 15/15. Sheet redone.
     - The website's French review (#198, 2026-10-29): `share_qr_caption` = "Scannez avec l’appareil photo de votre téléphone pour
       ouvrir le Lab."; the other five pass as drafted (Collez-le dans un message à un ami. / Copié ✓ / Appuyez sur {keys} pour
       copier / Lien / Fermer). Marks removed.
     - **Phones too (Jason in Lab HQ, 2026-10-29: "手机也用二维码和copy"):** the "Share" beside the Shop pill opens the same popover —
       QR + link + Copy — centred through the portal (top 46 %, clear of the Shop pill and the phone frame below and the
       badges above), opacity-only fade so the CSS centring holds. No native share sheet any more, no WhatsApp / SMS buttons;
       `navigator.share` is never called; the native / whatsapp / sms channels are gone. Phone caption `share_qr_caption_phone`
       "Let a friend scan this with their phone camera" / FR draft "Faites scanner ce code par un ami avec l’appareil photo de
       son téléphone" → reviewed by the website 2026-10-29: "Un ami peut scanner ce code avec l’appareil photo de son téléphone."; the desktop caption unchanged. `shop_opening`'s review mark dropped
       (approved 10-28). Checked: dev server 390×844 EN and FR (caption, /fr link, 0 errors), outside tap and Esc close;
       built page in a store-like iframe at 390×844 with trusted taps, without and with `allow=clipboard-write`: popover
       207–570 px (pill at 598), QR 172 px, Copy → "Copied ✓" + `copy`, outside tap and Esc close (the iframe test page
       does not pass `?lang`, so FR was checked on the dev server only); desktop and the ice page unchanged, 0 errors.
       Sheet `docs/2026-10-29-share-popover-phone.jpg`. Share build gzip 654.4 KB.
189. **2026-10-29** — **PingLive Mini Combo: two ranges, each moved on its own; replaces #125's AUTO** (Jason in Lab HQ:
     "在 mini 的 combo view 下面，我发现 range 是动不了的。实际的情况是forward 的 range 跟 down 的 range 可以分别的调，因为 combo
     view 本来就是forward view 加那个 down view"). In the app the two ranges are set in the ⋯ menu's Live Forward / Live Down
     tabs (`plm-combo-menu.jpg`); the screen shows neither (`40-live-combo.jpg`).
     - **Built** (`index.jsx`, `SonarScreen.jsx`, `SonarChrome.jsx`, `i18n.js`):
       - **Forward range:** horizontal, on Live Forward's steps and limits (20 ft to the Mini's maximum).
       - **Down range:** the Down panel's depth, on Live Down's depth steps in the visitor's unit.
       - Until the visitor moves one, each follows the water as before: Forward the old AUTO range (#125), Down the AUTO
         depth. Entering Combo, or changing device, starts on AUTO again.
       - **Desktop panel:** "Forward range" and "Down range" sliders (FR "Portée avant", "Portée vers le bas") in place of
         the greyed one with "AUTO · follows the water".
       - **Phones:** a −/+ under each panel: Down lower-left, Forward lower-right, each with a small caption (DOWN /
         FORWARD, BAS / AVANT).
       - The 3D curtains follow both. Each panel's rulers follow its own range.
     - **Moving one never moves the other.** The Forward panel's depth (#124) now follows the water's AUTO depth, not the Down
       range. It also has a floor: never shallower than that AUTO depth. Without the floor, a short Forward range in deep
       water (40 ft in 36 ft of water) put the bottom below the panel and left an empty picture. Under the old AUTO range
       (≥ 3 × depth) the floor never bites, so the pictures on entering Combo are unchanged.
     - **Checks:**
       - Panel boxes read back on the lake and ice pages after each slider move: Forward 120 → 40 ft leaves the Down box
         as it was; Down 45 → 60 → 30 ft leaves the Forward box as it was.
       - Lake 6×6 grid and ice grid against 904e4ee: the same picture, Combo included (entering Combo is on AUTO). The
         only differences are moving fish and grain. 0 errors.
       - Phone 390×844 steppers checked. FR panel checked.
       - Sheet `docs/2026-10-29-plm-combo-two-ranges.jpg`: desktop and phone, two range pairs each, and the ice page.
     - **Not built:** the Forward panel's `1.0x` zoom (#181 note). On a phone the FORWARD −/+ sits where the panels' diagonal
       meets the bottom bar; the line runs past its − ring.
190. **2026-10-30** — **The store's US market sees the PingLive Mini only** (`handoffs/2026-10-30-us-mini-only.md`; Jason 2026-10-30 to the
     website HQ: "美国只能给只有PingLive Mini的版本", and "可以" in Lab HQ). The big PingLive is not sold in the US until 2027-02 (website #226).
     - `embed.js miniOnly()` = in the store (iframe or theme-mounted) and `shareMarket()` is `us`. `index.jsx` sets the existing
       `ONLY` to the Mini then, the same switch as the ice page and the `/mini/` build: one device, the Mini's views, its Home section
       only, step 3 on Combo. So no other component changed. Both paths work, since `market` arrives on the iframe URL or as
       `data-market`; without `market`, the root `/en-us` counts.
     - Opened on its own lab.accuphy.ca never changes, even with `?market=us`. All other markets unchanged.
     - The share link and QR needed no change: they already point to `/en-us/pages/lab`, and the store's bridge passes `market=us` there.
     - Left as it is: the Mini's Home keeps its frosted "Live Panoramic" tile (the app's own tile, tapping says "Available with
       Accuphy PingLive Mini"); the sign-up gate's "PingLive tips" cannot appear (off in public builds); `/ice/` was Mini only already.
     - **Checked** on the built pages (share + embed) in Chromium behind a stand-in store page, market=us against market=ca, desktop
       1280×800 and phone 390×844: US shows only "PingLive Mini" (device row, Home, description), 0 mentions of the big PingLive,
       button "Shop PingLive Mini", `shop_click` product pinglive-mini with `/en-us/products/pinglive-mini`, share link
       `/en-us/pages/lab…bf2026_lab_us`, pill fits (182 px). Canada, Germany and /fr keep both devices and pinglive-sonar. Theme-mounted
       us / ca the same. Standalone with and without `?market=us` unchanged. 0 console errors. `shop-url-test.mjs` 26/26 (10 new),
       `share-url-test.mjs` 15/15. Sheet `docs/2026-10-30-us-mini-only.jpg`. **Not run:** a real US IP (the website's 03 does that),
       Safari, a real phone.
191. **2026-10-30** — **Live Combo locked until the visitor subscribes; Down Scan and Chirp explain why they are off; guide copy** (Jason in
     Lab HQ: "把live combo给blur了吧 电脑手机各个版本你要想一想 订阅以后可以全部给看 Down scan和chirp可以弹出来说需要船慢慢开 模拟环境暂时不available"; research
     `docs/2026-10-30-unlock-with-subscribe.md`, way 1: the Lab's own card). This changes #139 (no sign-up in the Lab) by Jason's own word.
     - **Lock:** `pickView` in `index.jsx` is the one door: a Combo pick before subscribing opens `UnlockCard.jsx` (the old
       `SignupGate.jsx` reworked) and nothing else changes. So every page is covered: `/`, `/mini/`, `/ice/`, embed, the store's
       iframe, US Mini (#190), French, sideways phones. Panel: Combo with a padlock on a blue tint. Home: the Live Combo tile frosted
       with a blue lock badge. Screen and Combo picture untouched.
     - **Card:** closes by ×, Esc, a tap outside; the visitor stays where they were. The lake keeps running (it no longer freezes).
       Success opens Combo at once and `signup.js` remembers it on this device. It works without Klaviyo's form, so also on
       lab.accuphy.ca alone. Emits `signup` { source: 'combo', product, view } and never the email (the iframe message targets `*`; the website counts it as Meta Lead / GA4 generate_lead and changes its bridge itself). The old display-only gate path is gone (`onLocked` only hints).
     - **No fake success:** `KLAVIYO.listId` stays null this round. With it empty, on accuphy.ca / accuphy.com / vercel.app /
       myshopify.com the card refuses ("Subscribing isn't open yet") and Combo stays shut; on test links and localhost it unlocks
       and prints "Test mode: nothing is sent." **W24Qdc must be filled before lab.accuphy.ca carries this** (`docs/versions.md`).
       `CONSENT` at the top of `signup.js` is where the hard-coded SUBSCRIBED changes.
     - **Step 3 on Mini pages:** locked, it stays on Forward and says "Combo shows both side by side: subscribe to unlock it."; unlocked,
       it goes to Combo as before. The big PingLive's step 3 (Panoramic) is unchanged.
     - **Down Scan, Chirp Sonar:** a tap shows a large notice in the middle of the phone screen ("… needs the boat moving slowly, so it
       isn't available in this simulation yet."), a tap closes it; the same before and after subscribing. Those tiles exist only on the
       phone's Home, so the desktop has nothing to show. Live Panoramic, Ice Fishing, Live Ice Fishing keep the short hint with
       neutral words: "Not available in this simulation yet."
     - **Guide:** step 1 "The {device} sonar beam" / "Drag the boat — anything inside the beam appears on your phone."; step 2 "This is what
       {device} sees, live on your phone in the Accuphy Sonar app: the bottom, timber and fish.", the name follows the device on screen. The ice
       page's steps had no "curtain".
     - **Placeholders:** French of the card, s1, s2, s3_text_locked, not_available and na_moving are
       drafts for the website's review. The card avoids the word "PingLive" alone, for the US (#190).
     - **Ads:** no URL goes straight into Combo. `scripts/dev/ads/v3/film3.mjs` clicks the Combo button on the frozen checkout
       `lake-mini-479ca21`, so it is unaffected; a new checkout would need localStorage `accuphy_sonar_signup_v1=1`.
     - **For the website:** in the store, Klaviyo's 20 s form can come up over the card.
     - **Widened the same day** (Jason in Lab HQ: "订阅就打开"): Live Panoramic, Ice Fishing and Live Ice Fishing also sit behind the card (`isLocked` in `home/AppHome.jsx`). Their
       names follow the view on the card and in "You're in. {view} is unlocked." (shown 1.1 s). `signup` now carries `source: 'unlock'` and `view` = the view unlocked.
       - **Ice tiles:** the lake's two tiles go to the ice page (`embed.js iceUrl`: same address parameters, inside the iframe too, a test link's sub-path kept;
         theme-mounted, the page reloads with `scene=ice`), with `from=lake`, which shows "← Back to the lake" (history back). `view=ice` opens the 2D Ice Fishing view
         (it was in the engine, not offered, #94 note), now also a locked panel pill and a locked tile on the ice page; subscribing is the same localStorage on the same
         origin, so the ice page knows. Opened directly, the ice page's Live Ice view stays free. Live Panoramic on the ice page keeps "Not available in this simulation yet."
         The desktop has no ice tiles on the lake, so only phones reach the ice page this way.
       - **Mini Panoramic:** a locked fourth pill and the Home tile; it uses the existing flat fan at the Mini's own 39°, no change to imaging or the lake. It is a 39° slice,
         not a wide scan like the big PingLive's; whether that is the app's Live Panoramic is for Jason to look at.
     - **Klaviyo (HQ's draft; Jason has not seen it):** consent text with Accuphy Trading Ltd., link to shop.accuphy.com/policies/privacy-policy, nothing pre-ticked. Sent as
       `custom_source` Accuphy Lab, `properties` signup_channel=lab_unlock and signup_language. Checked against Klaviyo's Create Client Subscription reference (revision 2026-10-15):
       the placement matches, and SUBSCRIBED is the only allowed consent value. W24Qdc is single opt-in. A real send has not run: `listId` stays null.
     - **Existing subscribers (Jason via Klaviyo HQ):** `?lab_unlock=sub` on the address (the bridge passes it into the iframe) unlocks and remembers, with no card and **no `signup`**, which
       would inflate Meta Leads. Only that exact value counts. `isSignedUp` in `signup.js`. Share links are built fresh and never carry it (test); `iceUrl` keeps it.
     - **Klaviyo properties added:** signup_market (`shareMarket()`), lab_scene (the view), lab_product. The Lab's email never passes the store page, so the bridge's `klaviyo.identify` cannot record them.
       Checked: `signup-guard-test.mjs` (body and email link), `share-url-test.mjs` 16/16, and on built pages frame / `/ice/` / alone / theme-mounted: no locks, no card, no `signup`, remembered once the parameter is gone; another value stays locked.
     - **Design pass (Jason in Lab HQ 2026-10-30: "可以高级一点设计再"; #50):** looks and motion only; no wording, logic, sonar or lake change. The card is the panel's glass, darker, with a 150 px head: the
       view's own Home thumbnail under light frost and a faint grid (`VIEW_IMG`), a small lock chip, the title in Eurostile Heavy capitals, 6 px field and button. **The unlock moment:** the frost clears, the
       lock's shackle lifts, the chip turns blue, one sonar sweep crosses the picture, the form folds away, then the card fades (`DONE_MS` 1500). Locks: a small line lock on muted pills (blue tint only on
       hover); on Home tiles a corner glass chip and a water-coloured frost, so "locked" differs from the white "not in this simulation" frost. Down Scan / Chirp notice: dark glass, 6 px, a blue top
       line. Sideways phones: picture left, form right, so the card fits. `prefers-reduced-motion`: no sweep, no transitions (MotionConfig + CSS). Mini's four pills: tighter, so "View" stays on their row.
       - **Fonts kept as they are, not as the brand file says:** the Lab's own Eurostile Heavy woff2 and Instrument Sans, because the Adobe kit needs the Lab's domain added and Inter would add a font
         for one card. Moving the whole Lab to the kit and Inter stays open (the old .otf's web licence is unverified). Downloads: page +~4 KB, gzip ~660 KB; the thumbnail loads only when the card opens.
       - **Home tab bar (Jason 2026-10-30: "map不用打开吧 setting那就灰掉"):** Setting and Map greyed, the red dot gone, a tap does nothing; Home stays blue. Checked on a phone upright and sideways.
       - Sheet `docs/2026-10-30-unlock-design.jpg`, before and after, desktop and phone.
     - **Checked** on built pages in Chromium behind a stand-in store page, 0 failures of 144, 0 console errors: ice tiles in both directions at market=us (card, line, /ice/ with
       params, ice page knows, Combo opens there, back, direct when subscribed), a second device with fresh storage (locked again, same email opens); desktop 1280×800 for us, ca,
       /mini/, fr (lock, card, Esc, ×, outside, bad email, step 3, subscribe → Combo, remembered after reload); phone 390×844 for us, ca,
       /mini/, /ice/ and sideways 844×390 (tile lock, card, close back to Home, both notices last past 2 s and close on a tap, neutral
       hint, subscribe → Combo); /ice/ desktop; theme-mounted US. `signup-guard-test.mjs` 7/7, `shop-url-test.mjs` 26/26,
       `share-url-test.mjs` 15/15. Sheet `docs/2026-10-30-combo-unlock.jpg`. Sideways, the card is taller than the screen and scrolls. The theme-mounted `scene=ice` jump was not run.
       **Not run:** the device list in the research doc (Facebook / Instagram browsers, Safari, real phones), a real Klaviyo send.
192. **2026-10-30** — **Desktop panel redone for testing: title, buttons, view tiles, a glass trial on the step cards** (Jason, brief `docs/2026-10-30-panel-redesign-brief.md`). Test only: nothing live, phones unchanged, lake and sonar imaging untouched.
     - **Title:** the logo at 21 px with "LAB" beside it, Eurostile Heavy 24 px, capitals, 0.04em, like the Pro Staff title. The Lab's own woff2, not the Adobe kit.
     - **Buttons:** 6 px corners, flat #028CDF Shop button in Eurostile capitals, no glows, no white iOS thumb; the selected secondary control has a blue underline. The panel and step cards go to 12 px corners.
     - **View tiles** (`index.jsx`, `ViewIcon.jsx`): real thumbnail, boat-and-beam icon, name; 3 for PingLive, 4 for Mini, 5 in one row on the ice page. Side views for Down, Forward, Combo, a top view for Panoramic, drawn by us; the beam's angle comes from `devices.js` (135°, 39°, specs.md), the forward tilt is a drawing choice. It fills blue when selected. Locked tiles keep the lock and the card; `pickView`, `aria-pressed`, aria labels kept. The thumbnails now load on desktop too (about 40 KB).
     - **Glass trial** (`GlassLayer.jsx`, `?glass=shu` or `?glass=rdev`, off by default): both MIT, licence files checked, notices in `assets/LICENSES.md`; the filter idea is adapted and no package is installed. dashersw/liquid-glass-js (MIT) is out: it snapshots the page with html2canvas, which cannot see the live WebGL lake. Sheet `docs/2026-10-30-glass-trials.jpg`. fps: 60.2 for off, shu and rdev in headless Chromium on this Mac, capped by vsync, so it shows no drop and not the true cost; a weak laptop is unmeasured. Playwright WebKit with `?glass=rdev`: 0 glass cards, the frost stays, 0 errors. Firefox not run.
     - **Checked:** the #191 run on built pages (desktop us, ca, /mini/, fr; phones us, ca, /mini/, /ice/, sideways; embed; ice round trip; second device; reduced motion), 0 failures, 0 errors; ice panel fits 1280×720 in French; `signup-guard-test`, `share-url-test` 16/16, `shop-url-test` 26/26. Sheet `docs/2026-10-30-panel-redesign.jpg`.
     - **Known:** on the ice page the step cards stack under the panel (kept, so the ice band stays open for taps). The taller panel pushes them about 50 px lower, so on a desktop under about 860 px high the last card runs off the screen; it already did under about 810 px.
     - **Release:** this is on main, so a #191 go-live before Jason decides on this panel must be built from c91bf7e.
