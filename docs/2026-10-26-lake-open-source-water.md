# Lake water — open-source water code on GitHub (2026-10-26)

Jason, 2026-10-26, in this chat, after round 3 (#164): "你要不还是去网上找找模型吧，也不要仅限于那种买模型的网站，可以看看
GitHub 什么的，或者是这种大家做 AI 做出来的这种，开源的、commercial 使用不需要付钱的这种。" Research only. Nothing has been
wired into the Lab.

**Conditions:**
- The licence allows free commercial use: MIT, BSD, Apache or CC0. No licence = not usable.
- It runs on our stack: WebGL2 + three.js + GLSL. WebGPU/TSL-only code would mean rebuilding the sonar engine, so it is
  out.

Picture: `docs/2026-10-26-lake-open-source-water.jpg` shows three panels: ABYSSAL looking down, our round 3, and
ABYSSAL's own camera.

## What turned up (GitHub, sorted by fit)

| Project | Licence | Stack | What it is | Fit for us |
|---|---|---|---|---|
| **ABYSSAL — squall01337/abyssal-ocean** ([demo](https://squall01337.github.io/abyssal-ocean/)) | MIT | WebGL2 + three.js, one HTML file | Spectral FFT ocean: JONSWAP spectrum, 3 cascades (768/121/19 m), 512² FFT each, every frame. Physical foam, Preetham sky, screen-space reflections. | **Best look, same stack.** Looking down in its "Glass morning" preset (3.2 m/s breeze) it is deep blue-teal with fine random ripples and no repeat at all. It is what Jason described. It is heavy as shipped: 3 × 512² FFT per frame. A lake needs much less: 1–2 cascades at 128–256² and no swell. |
| Token-Gremlin/natural-disasters ([demo](https://token-gremlin.github.io/natural-disasters/)) | MIT | WebGL2 + three.js r169 | Procedural FFT ocean + storms, quality presets down to FFT 128 ("potato") | Same technique, bundled with clouds, rain and TAA. More to strip out than ABYSSAL. |
| Nugget8/Three.js-Ocean-Scene | MIT | WebGL + three.js | Light procedural ocean for phones | Fast but plain (a flat-looking sea); no better than ours. |
| jbouny/ocean, jbouny/fft-ocean | MIT | three.js (2015–17) | The classic mirror water / an early FFT ocean | Already looked at. The mirror renders the scene twice. From our camera, three.js `Water.js` looks like grey stone (`docs/2026-10-26-lake-dark-water-refs.jpg`). |
| evanw/webgl-water, martinRenou/threejs-water | MIT* / BSD-3 | WebGL | Interactive pool ripples | For touch ripples later, not for the lake's look. *Licence in the file headers. |
| VictorZakharov/beautiful-water | MIT | WebGPU first (WebGL2 fallback) | Shallow ocean, AI-built in two days | Its WebGL2 fallback did not render headless here. WebGPU-first → not for us. |
| kanaworksai-hue/minamo | MIT | WebGPU / WGSL only | Above/below/half-in water, AI project | Out: WebGPU only. |
| owenyuwono/poseidon | MIT | WebGPU / TSL | FFT ocean | Out: WebGPU only. |
| nhtoby311/WaterSurface (R3F) | none | R3F | Interactive surface | Out: no licence. |
| Shadertoy water | CC BY-NC-SA by default | GLSL | — | Out: no commercial use. |

**Not done:** running ABYSSAL's code on this computer to place it exactly at our camera. That was blocked by the
safety check (code downloaded from outside). Its public demo page was used instead, with its own controls.

## Why it looks right where ours does not

Our water adds up a handful of hand-tuned waves and noises. However they are tuned, the eye finds the few shapes
repeating. A spectral ocean adds up thousands of waves whose sizes and directions follow measured wind-sea statistics,
so nothing repeats and every scale is present. That is the "natural" Jason is after.

## What it would take (if Jason says go)

1. **Port only ABYSSAL's spectrum + FFT passes into our Water.**
   - Settings: 1 cascade of ~40 m for the near ripples, plus 1 of ~250 m for the long waves. 128² or 256².
   - Lake wind of 3–5 m/s, a fetch of a few km, no swell.
   - It runs in render targets, like our wake map today. The water reads the slope texture instead of our wave sums.
   - Keep: our sky photo, glitter, wake, foam, fog, and the see-through water over the lakebed.
2. **Phones:** 128², 1 cascade, the FFT updated every other frame. Measure on the V10 before anything ships (#50).
3. **Credit:** the MIT notice goes into `assets/LICENSES.md`.

**Rough cost:** a 128² FFT is 14 small passes over 16k texels, about the same order as our wake map.
Estimate only; not measured.

## 中文摘要（给 Jason）

- 在 GitHub 上找了十几个开源水面。能免费商用、又和我们技术一样（WebGL2 + three.js）的，效果最好的是 **ABYSSAL**（MIT 许可）。
  它用真实的风浪统计算出成千上万个小波浪叠在一起，所以怎么看都**不会重复**。往下看是深蓝绿色、细碎自然的波纹，正是你说的那种。
- 其他几个要么只能用新的 WebGPU（要重做声纳，不行），要么没有许可证，要么效果不如它。
- 它原版很吃显卡（给海洋用的）。湖面只需要它的一小部分，可以做成手机也能跑的轻量版。真机速度要测了才知道。
- 还没接进代码，等你说"动"。
