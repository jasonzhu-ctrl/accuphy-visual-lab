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
