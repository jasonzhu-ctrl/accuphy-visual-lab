# 冰钓版本 / The ice-fishing scene (decision #94, 2026-10-16)

## 给 Jason 的摘要

- **做了什么：** 同一个湖结冰了。半米厚的冰，雪被风吹成雪垄，露出黑冰、压力裂纹和气泡纹。PingLive Mini 吊在一个 10 寸冰洞里，
  旁边是水桶、冰钓竿、电动冰钻；几米外一个帐篷（门里透出暖光）和一个雪橇。天上飘雪。手机屏幕是 App 里 Mini 的两个冰钓画面：
  **Live Ice**（左边圆形 flasher 表盘 + 右边 Live Down 扇形）和 **Ice Fishing**（表盘 + 右边滚动的 2D 历史）。
- **玩法：** 点冰面任何地方 = 换洞。Mini 被提起来（屏幕变黑，像真机出水），人走过去，冰钻转着钻下去，洞开了，Mini 放下去，
  画面回来。旧洞留在冰上，慢慢冻住。
- **波束怎么显示（2026-10-16 晚改过，决策 #95）：** 你说第一版水里和冰面的关系 confusing。现在改成"剖面"：设备站在一个圆形冰台上，
  冰台外面一圈的冰被挖开（波束能照到多远就开多大），露出下面的水、锥形波束和被照亮的湖底，切口能看到冰的厚度；再往外才是雪面。
  另一个备选是 `?look=glass` 全黑冰：整片冰都透明，像夏天的水面，没有剖面。
- **本地打开：** 开发服务器 → `http://localhost:5173/#2026-10-16-sonar-ice-3d`（端口以当时为准）。**没有上线**，公开链接和
  `docs/versions.md` 都没动。
- **要你选的（一次问一个）：**
  1. 时间：黄昏 `?time=dusk`（默认）· 白天 `?time=day` · 夜晚 `?time=night`
  2. 雪盖：多雪 `?look=snow`（默认）· 一半一半 `?look=mixed` · 黑冰为主 `?look=glass`
  3. 冰钓画面的配色：App 原版蓝底彩虹（jet，默认）· 还是 Lab 的琥珀色 `?icelut=amber`

## What is built (English, for the next chat)

**Architecture.** `scene="ice"` on the sonar lake component. Shared: terrain, vegetation, wrecks, lockup, fish, beams,
the sonar engine, the phone chrome. Ice-only: `iceScene.js` (constants, time/look presets, `iceParams()`),
`iceSheet.js` (the surface shader + `setHoles`), `iceProps.js` (Mini, hole kit, auger, shelter, sled, aim ring),
`IceCamp.jsx` (IceSky, IceSheet, IceCamp with the drill state machine, Snowfall, IcePick), `snow.js`, `iceSky.js`.
`devices.js` has `ICE_MODES` and the two labels; `wedge.js` / `fanSpans` map `ice` and `liveice` to the Down fan;
`SonarScreen.screenLayout` returns `ice: 1|2, iceSplit: 0.42`; `sonarShader.js` draws the dial (`flasherPixel`), the
history pass (`uHistPass`) and the right panel; `SonarChrome.jsx` places the ring labels and the centre readout.
The gallery card is `src/experiments/2026-10-16-sonar-ice-3d/index.jsx`; `VITE_SCENE=ice` is the build variant.

**The surface shader** (`iceSheet.js`): drift height = 0.68 big fbm + 0.32 sastrugi fbm along the wind; snow where
height > threshold (from `cover`); normals from the drift gradient (×3.2); snow = albedo × (sky ambient + sun lambert),
blue in the troughs, facet glints; bare ice = water colour → sky reflection by Fresnel, two voronoi crack networks,
bubble veins, frost; alpha from `clear`. Holes: live (open water with the beam's glow, slush rim, shavings, a scooped
ring), old (frozen-over disc). The window: march the view ray 20 steps (per-pixel jitter) down to the bottom; max
`insideBeam` → the snow turns cyan-white and half-clear (`alpha` → ~0.46). The shelter lamp is a warm pool.
Output is converted linear → sRGB like the built-in materials (the lake materials stay raw; the ice scene lifts them
with `uRevealGain` 1.7 and `uOutGamma` 0.72).

**The hole-hopping sequence** (`IceCamp.jsx`): phases lift 0.55 s → move 0.9 s → drill 1.5 s (the hole opens at 62 %)
→ drop 0.7 s. `state.noSignal` is true throughout (SonarScreen renders no fans → black picture, empty dial).
`state.target` set by `IcePick` on release (≥ 1 m away) or by a step preset starts it. Holes: `state.holes`, max 8.

**The dial** (`sonarShader.js flasherPixel`): panel = left `uIceSplit` (0.42) of the display; centre at 53 % height;
outer radius 0.36, inner 0.235 of the display height; angle clockwise from the top = depth / range; echo =
`flasherEcho(depth)` = max of `fanEcho` over the Down fan at −7°…+7° (5 taps) through the same tone curve
(`toneIdx`); colours from `uLUT2` (jet); ticks every ruler step (`uTicks` = span / niceStep(span), fractional allowed).
The 2D history: two 384×256 render targets ping-ponged every 0.125 s; a column = `toneIdx(max(flasherEcho, floor
speckle))`; the right panel samples it, the last 3.5 % is the colour bar.

**Camera** (`iceScene.js`): target (−1.5, −5, 0), offset (−9, 28, 33), phones fit 30 m; far plane 1600 for the dome.
First hole (1, 1), 36 ft; camp at hole + (6.2, 3.8), door toward the hole.

**Checked 2026-10-16:** build passes; summer lake unchanged (screenshot); ice page: no console errors; hole-hopping,
Live Ice and Ice Fishing views watched; three time presets snapped to `reference/engine-compare/ice-{dusk,day,night}.png`
(gitignored). Open items: `docs/backlog.md` → "Ice scene".
