# Research notes — Sonar Beam Visualizer (2026-09-23)

What was looked at, what it taught us, and what we will use. Sources at the end.

## 1. The inspiration site (shuyan-visual-portfolio.pages.dev)

Jason's reference for the "mouse moves like water" feel. Pulled its scripts
apart — **no libraries at all**, three hand-written canvases:

| Canvas | Tech | What it does |
|---|---|---|
| `depth-canvas` | WebGL 1, one fragment shader | The water effect. A **96×64 CPU velocity field** (two Float32 arrays, ~6 k cells) is stirred by the pointer (gaussian splat along the pointer path, with a curl term so the wake swirls), advected + damped every frame, packed into an RG texture, and the shader **refracts the hero image by that field** and adds a faint blue highlight where the flow is strong. Cheap, works on phones, ~150 lines. |
| `seq-canvas` | 2D canvas | Scroll-driven **image sequence** (30 webp frames per scene) — scroll position picks the frame. |
| `flow-bg-canvas` | WebGL 2 | Procedural gradient background: domain-warped noise, grain, three colours, lots of tunable uniforms. |

Takeaways for us:
- The "water" feel is a **flow/velocity field that displaces the picture**, not a
  real water simulation. Same idea we want for the water-surface line the
  device floats on, and possibly for the whole underwater picture when the
  device is dragged.
- Pointer path is **sub-sampled into steps** so fast swipes still leave a
  continuous wake — important for touch drag.
- Everything is `pointermove`, which covers mouse + touch in one handler.
- Hosted on Cloudflare Pages (free static hosting) — a good home for our
  embed too.

## 2. Ready-made fluid / cursor libraries

| Library | Fit | Notes |
|---|---|---|
| **three-fluid-fx** (MIT, ~13 KB gz) | ★ best | 2D Stable-Fluids solver for three.js ≥ 0.183, WebGL2 + WebGPU/TSL pipelines, distortion + overlay passes, `attachPointerSplats()` handles mouse **and touch**. Drop-in with React Three Fiber. Gives the shuyan-style refraction with far richer motion. |
| fluid-cursor (scxr-dev) | fallback | Zero-dependency vanilla plugin, full-screen fluid cursor. Fine for a page-wide ambient effect, less controllable inside our scene. |
| react-fluid-distortion | alt | R3F post-processing fluid distortion; overlaps three-fluid-fx. |
| PavelDoGreat WebGL-Fluid-Simulation | reference | The classic everyone copies; not packaged for React. |

## 3. Rendering the sonar picture ("sonar flashlight")

Literature (rasterised ray-tracer sonar simulators; Lacuna's 2D FLS
simulation with ground-echo mirroring; Douglas Orr's Bresenham echolocation
in JS) all reduces to the same pipeline, which maps cleanly onto the GPU:

1. **Scene as data**: a *reflectivity map* texture (R = hardness/return
   strength, G = material class: water / soft bottom / hard bottom / weed /
   structure / fish) pixel-aligned with the underwater art, in **metres**.
2. **Polar shadow map** (the "1D shadow map for 2D lights" trick from games):
   one pass marches N angles (e.g. 512) from the apex outward through the
   reflectivity map and records the **first-hit range** per angle → a 1-D
   texture. Cheap: 512 × ~512 steps.
3. **Shade pass**: for every pixel inside the fan, compute (angle, range) from
   the apex; if range > first-hit(angle) + ε it is in **acoustic shadow**
   (black); otherwise return = reflectivity × grazing-angle term ×
   `exp(-α·range)` (attenuation) + speckle noise (hash of angle/range/time).
   Soft edges by sampling neighbouring angles (penumbra).
4. **Colour ramp** lookup (yellow first; blue/red and the other app palettes
   are just other 1-D ramp textures).
5. Optional realism from the recordings: horizontal smear (the app's
   non-uniform px/m), bottom "tail" (second echo below the bottom line),
   surface-clutter streak near the apex, moving fish = moving blobs in the
   reflectivity map (rendered from a small fish list each frame).

Ground-echo / multipath (Lacuna) is out of scope: the real Accuphy picture is
what we imitate, not physics.

## 4. Engine choice

| Option | Verdict |
|---|---|
| **three.js + React Three Fiber + custom GLSL** | ★ chosen. Render targets, shader materials and texture plumbing are first-class; three-fluid-fx plugs in; leaves the door open for a 3D product shot later; Three r171+ has TSL if we ever want WebGPU. |
| PixiJS v8 | Excellent 2D sprite engine, but multi-pass shader pipelines (shadow map → shade) are clumsier; no fluid lib. |
| OGL / raw WebGL | Smallest bundles, most hand-written code; only worth it if bundle size becomes the blocker. |
| Canvas 2D only | Too slow for per-pixel ray/shadow work at 60 fps on phones. |

Supporting tools: **leva** (tweak panel while tuning noise/attenuation against
the reference frames — dev only), **r3f-perf** (fps on phones), Framer Motion
(UI buttons), `vite-plugin-singlefile` (one-file build for embedding).

## 5. Assets

- Layered underwater art (sky+shore / surface / far water / bottom /
  structure) generated with AI (Jason already uses Nano Banana; Adobe Firefly
  is also available through the Adobe MCP in Claude) → Photoshop/GIMP for
  layer clean-up. The **reflectivity map is painted from the same layers**
  (flat colours per material) so the two stay pixel-aligned.
- Device cursor: side-view cutouts still needed (see brief). Adobe MCP has
  `image_remove_background` if Jason supplies a side photo.

## 6. Shopify embedding

- Build to a single static HTML (+ JS/CSS) and host it on **Cloudflare Pages or
  Vercel** (both free for this). In Shopify (Online Store 2.0 theme) add a
  **Custom Liquid** section containing an `<iframe>` to that URL with a fixed
  aspect-ratio wrapper. WebGL inside an iframe is fine; pointer/touch events
  reach the iframe when the user is over it.
- Alternative: paste the built JS/CSS as theme assets and a `<canvas>` in a
  section — tighter integration but fights the theme's CSS/JS; only if the
  iframe's scroll/touch hand-off feels wrong on mobile.

## 7. No competitor web demos found

Garmin LiveScope / Lowrance ActiveTarget / Humminbird MEGA Live product pages
use video and static beam diagrams; no interactive beam explorer was found.
That is an opportunity — ours would be a first.

## Sources
- Inspiration site scripts: https://shuyan-visual-portfolio.pages.dev/script-v103.js
- three-fluid-fx: https://github.com/artcodev/three-fluid-fx
- fluid-cursor: https://github.com/scxr-dev/fluid-cursor
- react-fluid-distortion: https://github.com/whatisjery/react-fluid-distortion
- Rasterised ray tracing of sound in JS: https://douglasorr.github.io/2021-12-echolocation/article.html
- 2D forward-looking sonar simulation (Lacuna): https://lacuna.tiptreesystems.com/work/2d-forward-looking-sonar-simulation-with-ground-echo-modeling/wrk_b4d4b5fc5901f42a9e5837a67a31a20b
- Rasterized ray-tracer sonar pipeline (arXiv): https://arxiv.org/html/2001.03539
- PixiJS vs three.js 2026: https://appscale.blog/en/blog/pixijs-vs-threejs-web-graphics-engine-comparison-2026
- three.js 2026 / TSL: https://www.utsubo.com/blog/threejs-2026-what-changed
- Shopify embed guide: https://www.embeddy.ai/docs/embedding-guide/shopify
