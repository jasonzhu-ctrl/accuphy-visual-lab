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
