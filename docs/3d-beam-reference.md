# 3D beam reference — how the three modes are shown (2026-09-23)

Studied at Jason's request before Phase 3: Accuphy's own three PingLive mode
animations and Garmin's LiveScope Plus (LVS34) launch video. Both show the
**same idea**: an aerial 3/4 view of a lake, the device on the surface, and a
**translucent 3D beam volume under the water that reveals the bottom inside it**
("X-ray flashlight"). This is what Jason means by "3D".

## 1. Accuphy PingLive animations (`reference/animations/`, 640×480 GIFs)

Source: Jason's Drive links 2026-09-23 (labels are Jason's; Drive filenames
were mixed up, matched by byte size). Frames in `reference/frames/PL_*`.

| Mode | What the beam looks like | What lights up on the bottom |
|---|---|---|
| **Down View** (`PL_down-view_anim`) | A **thin vertical fan** (triangle plane) hanging straight down from the transducer, opening wide (135°) along the boat's axis; drawn as thin white edge lines | A **narrow strip** directly under the boat: sand, stumps, fish inside the strip are brighter |
| **Forward View** (`PL_forward-view_anim`) | The same fan **tilted forward** into a slab / frustum reaching out ahead of the boat and down to the bottom; white edge lines, translucent fill | A strip **ahead** of the boat |
| **Panoramic View** (`PL_panoramic-view_anim`) | A **wide horizontal sector** (flat fan, roughly a half-disc) spreading forward from the boat just under the surface, edges curving down to the bottom | A **broad area** of bottom ahead of the boat: rocks, dead trees, fish |

Common style: dark teal water rendered semi-transparent so the lakebed is
faintly visible *everywhere*; inside the beam it is clearly lit; the water
surface shows ripples; a small boat carries the transducer. Camera slowly
drifts (parallax). The bottom is a rich 3D scene (sand, stumps, fallen trees,
rocks, fish schools).

## 2. Garmin LiveScope Plus video (youtube NznEbu0V2Wc, 0:33–0:43)

Real drone footage of a bass boat on a clear lake; a **soft cyan translucent
volume** is composited under the water:
- **Forward mode (0:33–0:37):** a long slab from the boat forward-and-down,
  faint white edges, ~30 % opacity; drowned trees inside the slab show as a
  lighter "revealed" region.
- **Down mode (0:39):** a broad flat fan directly beneath the boat.
- **Perspective mode (0:42):** a wide horizontal fan sweeping forward,
  revealing a large patch of bottom with standing timber.
Style notes: the volume is brighter where it meets the bottom, the water
outside stays opaque and real, edges are thin white lines, everything is
calm and cinematic. No UI, no sonar screen in these shots.

## 3. What this means for the visualiser (proposal, pending Jason)

Jason's original brief was a **side-view** with the sonar picture drawn
inside the fan. Both references instead sell the product with a **3D beam over
a lake**. Proposal — do both, in layers:

1. **Main stage = 3D lake (three.js).** Aerial 3/4 camera like the GIFs, light
   parallax with the mouse / gyroscope-free tilt on phones. Lakebed = height-
   field terrain with stumps, rocks, fallen trees, fish. Water = translucent
   surface with ripples (the fluid/flow trick from `docs/research.md` for the
   drag wake). Device/boat on the surface, **draggable**.
2. **Beam volumes** per device & mode, from `devices.js` data:
   Down = vertical fan wedge; Forward = wedge tilted per decision #7 (leading
   edge on the surface); PLM Combo = both; PL Panoramic = horizontal sector.
   Rendered as translucent cyan with fresnel edges + thin white outline
   (Garmin look). **Inside the volume the bottom is lit** (shader test:
   surface point inside the beam volume → bright & saturated; outside → dim
   and foggy).
3. **Sonar-screen inset (the Phase-3 engine, unchanged):** a small app-style
   panel showing the yellow-mode 2D picture the device would display for the
   *current* beam — computed from the same 3D scene by sampling the beam
   plane. This is the "how each mode images" explanation Jason wants.
4. Mobile budget: 128×128 terrain, instanced stumps, no heavy post-processing;
   target 60 fps on a mid iPhone.

Revised phases if approved: **3 = 3D lake + beam volumes + reveal** (placeholder
terrain) → **4 = sonar-screen inset** (2D engine tuned to `sonar-style.md`) →
**5 = art & water polish, performance, Shopify embed**.

Open questions for Jason: (a) approve the 3D-main + 2D-inset plan; (b) is
PL Panoramic in scope now (it exists in the references) — the brief said v1
excludes it; (c) fixed camera angle vs. user-orbitable camera.
