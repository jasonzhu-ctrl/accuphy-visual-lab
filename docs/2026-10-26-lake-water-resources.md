# Lake water — ready-made resources worth borrowing (2026-10-26)

Jason in Lab HQ, 2026-10-26: "湖面继续找市面上的好资源去优化". This is research only. Nothing has been brought into
the Lab. He picks; we wire nothing in before that.

**Where we stand:** #161 is built locally. The water is our own GLSL `ShaderMaterial` (`Scene.jsx` Water) on
three.js r186 + React Three Fiber, rendered by `WebGLRenderer`. It has:
- per-pixel wind waves;
- clouds sampled per vertex;
- a sun glitter path;
- a wake map;
- the lakebed tinted by its water column (`lakeMaterial.js`).

**What makes a resource useful here:** it slots into that shader, or its data does. It must not double the scene's
render cost on phones (#50: fewer samples, never a plainer look). It must not need a different renderer: the sonar
engine is all GLSL on `WebGLRenderer`.

## The three worth doing

### 1. A real photographed sky in the reflection — Poly Haven "pure sky" HDRIs (recommended first)

- **What:** replace our noise clouds with a real sky photo, mirrored in the water. Real cumulus, real colour
  gradients, a real sun. Examples:
  - `kloofendal_48d_partly_cloudy_puresky` (partly cloudy, mid sun);
  - `evening_road_01_puresky` (sunset);
  - `hilly_terrain_01_puresky`;
  - `aristea_wreck_puresky` (midday).
  Browse: https://polyhaven.com/hdris/skies
- **Licence:** CC0. Commercial use allowed; no attribution required; may be redistributed
  (https://polyhaven.com/license).
- **Size:** the 1k `.hdr` is 1.4 MB (kloofendal). The reflection needs no HDR range, so we would ship one
  1024 × 512 JPG of the sky (≈ 100–200 kB) or a 512 × 256 one (≈ 40 kB).
- **Phone impact:** about nil. One texture read per water pixel replaces the cloud noise (the noise runs per
  vertex today).
- **Fit:** direct. Take the reflected ray R → equirectangular UV → sky colour. The clouds still drift: rotate the
  UV slowly. The sun's direction comes from the photo, so the glitter path lines up with the real sun.
- **Risk:** the share build grows by the JPG (the single-file build is 2.64 MB today). Choose a sky whose sun sits
  ahead of the default camera, or rotate it there.

### 2. A real ripple normal map — `waternormals.jpg` from three.js's Water example (cheap detail)

- **What:** the tiling water normal map used by three.js `Water.js` and the ocean example
  (https://threejs.org/examples/webgl_shaders_ocean.html). It was imported in 2014 from jbouny's Ocean shader. Two
  scrolling copies at different scales give fine, natural-looking ripples. Our procedural noise ripples are the
  part that still looks "CG" up close.
- **Licence:** three.js is MIT. The texture came from https://github.com/jbouny/ocean, which is also MIT. Neither
  carries a separate image licence. Keep the MIT notice with it.
- **Size:** 249 kB at 1024² (https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/waternormals.jpg).
  At 512² it would be ≈ 70 kB.
- **Phone impact:** about nil, or slightly cheaper. Two texture reads replace the two noise layers near the camera.
- **Fit:** direct. We take only the texture and the scrolling idea. **Not** the `Water` class itself: it renders the
  whole scene a second time into a mirror target every frame (the lakebed, fish and beams twice). On phones that
  would cost far more than the 2–3 fps budget, and from our 42° camera the mirror would mostly show sky anyway.

### 3. Interactive ripples — Evan Wallace's WebGL Water simulation (most "alive", more work)

- **What:** the classic GPU water simulation (http://madebyevan.com/webgl-water/, https://github.com/evanw/webgl-water).
  A height-field in a small texture (height, velocity, normal) is stepped a few times per frame, so ripples
  spread, reflect and interfere. Here it would add real rings where the boat stops or turns, and ripples where a
  finger drags. It would complement the #161 Kelvin wake, which is shaped rather than simulated.
- **Licence:** MIT (stated in the source file headers; "Copyright 2011 Evan Wallace").
- **Size:** about 0. It is shader code, no assets.
- **Phone impact:** small. 2–3 passes over a 256² texture per frame, the same order as the #161 wake map. The water
  reads it like the wake map.
- **Fit:** medium. The 2011 code is plain WebGL1 with its own helper library, so it would be ported into a three.js
  render target, as the wake map already is. Its caustics and pool refraction are for a swimming pool; we already
  have our own caustics.

## Looked at, not recommended

| Resource | Why not (for now) |
|---|---|
| **Tidewater** (gettidewater.com, a 2026 three.js ocean kit, $75, commercial use OK for one developer, no redistribution) | The richest of all: FFT ocean, a 512² boat-wake field, foam, a Preetham sky, caustics, underwater. But it is built on three.js's node/TSL path for WebGPU (WebGL2 only as that renderer's fallback). Using it means moving the Lab to `WebGPURenderer` and rewriting every GLSL shader, the sonar engine included. No phone figures published. Worth revisiting only if the Lab ever moves to WebGPU. |
| **three.js `Water2`** (MIT, in our node_modules) | A reflection and a refraction render every frame: two extra scene renders. Too heavy for phones; our lake is already see-through. |
| **drei `MeshReflectorMaterial`** (MIT) | A planar mirror, again an extra scene render (blurred). Same cost problem as `Water`. |
| **jbouny/fft-ocean** (MIT, last updated 2015, three r71 era) | An open-ocean swell look on a screen-space grid. It is not a lake, and it is old code. |
| **Shadertoy "Seascape" and similar** | Shadertoy's default licence is CC BY-NC-SA: **no commercial use**. Fine to study, not to copy. |
| **three.js `Sky.js`** (Preetham model, MIT, zero bytes) | Not rejected, just smaller: it could drive the sky colours from a sun angle. Option 1 gives a real sky instead, so use this only if a photo sky is turned down. |
| **ambientCG** (CC0) | Its "water" search returns leaks and HDRIs, not lake-surface normal maps; Poly Haven covers the sky better. |

## Recommendation

Do **1 + 2** first. Together they replace both remaining "procedural" parts (the clouds and the near ripples) with
real captured data. The cost is ~150–250 kB of download and essentially no phone fps. **3** comes after, if Jason
wants the water to react more to touch. If 1 is chosen, Jason should pick the sky (sunny, partly cloudy or
sunset), because it sets the whole lake's mood.

## 中文摘要（给 Jason）

找了市面上做水面的成熟资源，挑出 3 个最值得用的，都能免费商用：

1. **真实天空照片倒映在水里**（Poly Haven，CC0，完全免费、不用署名）：用真实拍摄的云和天空替换现在电脑算出来的云。
   只多下载约 100–200 KB，手机几乎不变慢。**推荐先做**，天空要你来挑（晴天、多云或黄昏）。
2. **真实的水波纹理**（three.js 官方水面例子里的贴图，MIT 许可，可商用）：让近处的细小波纹更像真的水。约 70–250 KB，
   手机不变慢。
3. **会互动的水波模拟**（Evan Wallace 的 WebGL Water，MIT）：船停下或转弯时会荡出真实的水圈。工作量中等，手机略慢一点。

不推荐的：Tidewater（75 美元的商用水面套件，效果最好，但要换整个渲染引擎、重写声纳，代价太大）；three.js 自带的
Water / Water2 和镜面反射（每帧要把整个场景多画一两遍，手机扛不住）；Shadertoy 上的海面（不允许商用）。

推荐：先做 1 + 2，3 以后再说。你选之前不会接进代码。
