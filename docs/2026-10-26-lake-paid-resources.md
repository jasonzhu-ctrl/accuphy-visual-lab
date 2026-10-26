# Lake water — paid resources, compared with the free picks (2026-10-26)

Jason in Lab HQ, 2026-10-26: "价格合适可以买，你要给我挑一个好的。" This is research only. **Nothing has been bought,
no account was created, payment stays with Jason.** It follows `docs/2026-10-26-lake-water-resources.md`, whose free
picks are:
1. a CC0 Poly Haven photo sky in the reflection;
2. the MIT `waternormals.jpg` ripple map.

**Hard conditions (from Lab HQ):**
- Fits our stack: WebGL2, three.js 0.186, React Three Fiber, our GLSL `ShaderMaterial`s.
- No move to WebGPU/TSL, no rewrite of the sonar engine.
- A licence that allows a commercial website; one-off and perpetual preferred.
- Budget ≈ US$200.

**Demo screenshots:** not taken. The in-app browser was refused for these external sites (gumroad.com,
gettidewater.com). I did not go around that refusal. Demo links are given instead.

## What the paid market for *web* water looks like

### A. Complete web water systems (the shader itself)

Both serious products are built on three.js's WebGPU/TSL path. Neither runs on our `WebGLRenderer` + GLSL setup.

| Product | Price | What you get | Licence | Fits us? |
|---|---|---|---|---|
| **Tidewater** — gettidewater.com (demo: gettidewater.com/demo/) | US$75, one-off, per developer, 1.x updates | Cascaded FFT ocean + Gerstner swells; **Lake** preset (0.4 m, with shoreline); hull wakes written into a world-locked field with foam; Preetham sky; caustics; underwater; R3F components (`tidewater/r3f`); four quality tiers, phones get Low/Med automatically | Commercial use incl. client work and sites; no source redistribution; seats and attribution not stated | **No.** Its WebGL2 fallback is the WebGPU renderer's own fallback (`three/webgpu` + `three/tsl`), not our `WebGLRenderer`. Using it means moving the Lab to `WebGPURenderer` and rewriting every GLSL shader, the sonar engine included. No bundle size or phone fps published. |
| **Three.js Water Pro** — threejswaterpro.com (sold at threejsroadmap.com) | US$239 in the "Water + Sky Bundle" (list US$278); no standalone price shown | FFT ocean, three foam layers, boat-wake generators, screen-space reflections, presets from calm shallows to storms; 37 MB download | One-off, lifetime access, commercial allowed; "Commercial Software License Agreement v2.2, All Rights Reserved"; seats not stated | **No.** Its docs require "Three.js r181.0 or later (WebGPU build)" and TSL. Same rewrite problem as Tidewater, at three times the price. |

Gumroad and itch.io have no maintained, commercially licensed GLSL water for three.js; what turned up were prototypes
with no licence statement. Everything else credible in GLSL is free and open source (jbouny/ocean MIT, Evan Wallace's
WebGL Water MIT, the three.js examples MIT).

**Worth knowing:** Tidewater has the one feature we would want most from a paid kit, a Lake preset with shoreline
and hull wakes. If the Lab ever moves to WebGPU (a large separate project), it becomes the obvious buy at US$75.

### B. Paid data that feeds our own water (skies, normal maps)

This is the only paid category that fits without a rewrite. Our water would read the image exactly as it would
read the free Poly Haven sky.

| Pack | Price (USD) | Contents | Licence notes |
|---|---|---|---|
| **Ethereal Skies — Pack 01** (Tinquify; Superhive/Blender Market, also Gumroad) | Tiered by company revenue: Indie $19 (≤ $25k/yr), **Pro $59 (≤ $250k/yr, 10 seats)**, Company $759 (≤ $1M/yr, 20 seats), Enterprise $3,990. The page's own data also shows $79, so check at checkout. | 30 real photographed **pure skies** (no ground), sun in frame at correct intensity, no flares; 2K (2,500 × 1,250) and 14K .hdr | Commercial, royalty-free, no time limits, free updates. Websites/real-time apps and redistribution are **not addressed**; written confirmation needed before shipping it in a web page. |
| **CGAxis HDRI Skies Bundle** (Gumroad) | US$39 (search listing) | 300+ sky HDRIs | "100% royalty-free for commercial projects". Full terms not readable without the browser. |
| **ArtStation "50 HDRI – Sky and Night" Vol 3** | ~US$10–70 by licence tier | 50 skies incl. night | Standard vs extended commercial tier; web use not stated. |
| **Poliigon** HDRIs / textures | Subscription | High-end skies and materials | Royalty-free, kept after cancelling, **but** its help centre bars use "where the users have direct or indirect access to the assets". A web page always ships its image files to the visitor, so this is a likely no for us without written permission. |
| **Textures.com** (CG Skies moved here) | Credits / subscription | The former CG Skies library | Licence page not readable here; secondary sources do not settle web use. Same open question as Poliigon. |

**The catch with paid stock on the web:** every image a web page uses is downloadable by the visitor. Many stock
licences forbid exactly that, or at least don't cover it. CC0 (Poly Haven) and MIT (`waternormals.jpg`) have no
such problem. For us the licence is a bigger difference between free and paid than picture quality.

## Free 1 + 2 vs the best paid option

| | Free 1 + 2 (Poly Haven sky + MIT normals) | Paid: Ethereal Skies Pro, US$59 |
|---|---|---|
| Look | Real photographed sky, 59 pure skies to choose from (Poly Haven API, 2026-10-26), real ripple detail | Real photographed sky, 30 pure skies shot as one set, the sun in frame at correct intensity, no flares |
| Fit | Direct (one texture read in the water shader) | Identical |
| Download | ~150–250 kB (a 1024 × 512 sky JPG + a 512² normal map) | Same: we would ship a downscaled 1024 × 512 JPG either way |
| Phone fps | ≈ 0 | ≈ 0 (same work) |
| Licence | CC0 / MIT: anything goes, no attribution | Commercial OK, 10 seats; web delivery not explicitly covered: ask the seller first |
| Cost | 0 | US$59 one-off (Pro tier, assuming Accuphy revenue ≤ US$250k/yr; else Company US$759) |

The picture difference is small. In the reflection the sky is shrunk to a 1024 × 512 image and seen through ripples,
so a 14K source adds nothing over Poly Haven's. Poly Haven even has more pure skies (59 vs 30). What the money buys is
one photographer's consistent set with the sun always in frame and calibrated, and different skies from the free
ones everybody uses. The same pack would also serve the ice page's sky (#94) if Jason wants a
photo sky there later.

## Recommendation

**Do not buy a water system.** Both good ones (Tidewater US$75, Water Pro US$239) only run on WebGPU/TSL and would
mean rebuilding the Lab and the sonar.

If Jason wants to spend for the look, **the one purchase worth making is "Ethereal Skies – Pack 01", Pro licence,
US$59 one-off, on Superhive (Blender Market): superhivemarket.com/products/ethereal-skies-hq-sky-hdris-mix-collection-pack-01.**
Before paying, ask the seller in writing that a downscaled sky image may be shipped inside a public website. It
beats the free option only in being a consistent, less common set of photo skies with the sun calibrated in frame,
not in technical quality, and Poly Haven offers more skies. Honest view: the free sky is as good for this page; buy
only if Jason wants skies other sites don't already use. Free 1 + 2 still remain the base either way (the ripple map has no paid equivalent that fits).

## 中文摘要（给 Jason）

- **专门做网页水面的付费产品**只有两个靠谱的：Tidewater（75 美元）和 Three.js Water Pro（239 美元套装）。效果都很好，
  Tidewater 还有"湖面"预设和船尾浪。但两个都**只能用新的 WebGPU 渲染方式**，要接进来就得重做整个 Lab 和声纳，所以
  现在**不建议买**。
- **能直接用的付费资源**只有高清天空照片包（让水面倒映真实的天空）。好的天空包 19–79 美元。但网页上的图片访客都能
  下载，很多付费素材的许可证不允许或没写清楚这种用法。免费的 Poly Haven（CC0）完全没有这个问题。
- **画面差别不大**：倒映在水里的天空会被缩小、被波纹打散，付费的高清图看不出比免费的好多少。免费的 Poly Haven 反而有 59 张纯天空，比付费包（30 张）还多。
  付费包的好处是同一位摄影师拍的一整套、太阳都在画面里且亮度准确，别的网站用得少。
- **如果要买一个：** Superhive（Blender Market）上的 **"Ethereal Skies – Pack 01"，Pro 版 59 美元，一次买断，10 个人可用**。
  付款前先写信问卖家能不能用在公开网页上。不管买不买，免费的 1 + 2 都照常做。

**推荐：** 买 "Ethereal Skies – Pack 01" Pro 版，59 美元，在 superhivemarket.com 买（先确认网页使用许可）。它比免费 1 + 2
好在一整套风格统一、太阳亮度准确、别人用得少的天空，画质本身差别不大（老实说免费的已经够好）；水面系统类的付费产品都要求
WebGPU，现在不买。
