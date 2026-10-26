# Lake surface — options for the next round (2026-10-26)

Jason in the Lab HQ chat, 2026-10-26: "还有湖面，我觉得应该是可以继续优化的。" Starting point is #156 (live on
lab.accuphy.ca): wind-sea waves drawn per pixel, the sky reflected by Fresnel, the water column tinting the bottom.
**Nothing has changed in the Lab.** These are three prototypes, built in a separate copy only so they could be
photographed. Jason picks one, several, or none. No code changes until then.

Pictures: `docs/2026-10-26-lake-options-sheet.jpg` (each option on desktop 1440×900 and phone 390×844, from the same
camera) and `docs/2026-10-26-lake-option-c-wake.jpg` (C close up). Prototype code: `docs/2026-10-26-lake-options-prototype.patch`
(adds `?water=a|b|c` to the summer lake).

What the live lake looks like from above, honestly: dark, murky teal-green. The surface hardly reads as a surface;
the island and its timber read well. The product's own animations (`reference/animations/PL_*.gif`) show a brighter
teal-blue lake with clear wave texture. A can go alongside B or C. B and C are independent of each other.

## A — Brand teal, clearer water (colour only)

**What changes:** the water's colour moves from green-teal toward the blue-teal of the PingLive animations. The
light scattered out of the water becomes bluer and a little brighter, and the reflected sky brighter. The water column
over the bottom is clearer (absorption 0.022 → 0.014 /m), so the slope and the timber show further down. The light
patterns on the shallows are stronger (0.55 → 0.85).

**Files:** `Scene.jsx` Water (four colour constants) and `lakeMaterial.js` (three numbers, summer only).

**Phone frame rate:** no cost (same work, different numbers). Measured on the laptop, 1920×1200: 211 fps now,
207 fps with A, the same within noise.

**Risk:** small. It moves the summer lake's mood. The sonar picture and the ice page are not touched.

## B — Clouds in the water and a sun glitter path

**What changes:** fair-weather clouds drift slowly across the reflected sky, as a cloud deck 160 m up seen in the
water. The sun stands low ahead of the camera, so a glitter path of small blinking sparkles runs up the far water
(top of the screen). The overall sky sheen is a little stronger. This makes the surface read as water at a glance,
and it moves.

**Files:** `Scene.jsx` Water only.

**Phone frame rate:** the most expensive option, because it runs four layers of noise on every water pixel.
Laptop 1920×1200: 211 → 163 fps, about +1.4 ms per frame (+30 % for the water pass). On a weak phone (the V10
baseline: 10–24 fps, limited by the graphics chip) expect roughly −2 to −4 fps. Ways to make it cheaper if chosen:
two noise layers instead of four, and no clouds below a "low performance" level (backlog: performance tiers).

**Risk:** taste. Too many sparkles look cheap. The first prototype had square, blocky sparkles; they are now small
soft points. The path sits behind the step cards on desktop, so its exact place should be tuned with Jason.

## C — A real wake behind the boat

**What changes:** when the boat is dragged, it leaves its real path on the water: two Kelvin wake arms opening at
±19.5° behind the hull with short oblique crests, transverse waves behind the stern, and a churned foam trail down
the middle. Everything fades over ~5–9 s. This replaces today's round rings, which spread the same way whatever the
boat does. It makes dragging the boat (the page's main action) feel physical.

**Files:** `Scene.jsx` Water. The boat's path is kept as 32 points, one every 0.6 m, for 9 s.

**Phone frame rate:** a small cost. Each water pixel tests 31 path segments. Laptop 1920×1200: 211 → 192 fps
(+0.5 ms). Weak phone: roughly −1 fps. It could be limited to pixels near the boat if needed.

**Risk:** in the prototype the wake arms read a little like two straight dark lines from the desktop camera. Final
tuning should give them broken crests and fade them faster. Foam must never cover the beam's lit footprint.

## Not proposed, and why

- **A shoreline with trees and its reflection** — the strongest "real lake" cue, but it is new 3D content and
  changes the framing of the whole page. That is a bigger project than "continue optimising".
- **Real geometric waves (moving vertices)** — from this camera height they add almost nothing over the per-pixel
  waves, cost vertices on phones, and would make the boat and the beam apex bob against the sonar.

## Checks done

- Desktop 1440×900 and phone 390×844 (3× pixels) screenshots, headless Chromium, same camera for each option. C was
  shot 0.7 s after a 1.5 s drag.
- Frame rate: headless Chromium on the laptop GPU, uncapped (vsync off), 3 × 2.5 s each. Phone-size numbers
  (650–700 fps for all) are too fast to show a difference on this machine; the phone estimates above are scaled from
  the desktop cost.
- Ice page (#94): none of the options touches it. The ice page has no Water mesh, and A's colour change applies to
  the summer lake only.

## For Jason (中文)

湖面三个方向，任选其一、可以组合，也可以都不要。截图见 `docs/2026-10-26-lake-options-sheet.jpg`。

- **A 品牌蓝绿、更通透：** 只改颜色，和官方 PingLive 动画的蓝绿色一致，湖底看得更清楚。手机不变慢。
- **B 水里倒映云和阳光闪烁带：** 云在水面缓慢飘过，远处有一条闪闪的阳光带，一眼就看出是水面。最费性能，便宜手机大约
  慢 2–4 帧。
- **C 船后面真正的尾浪：** 拖船时船尾留下 V 字形尾浪和白色泡沫，几秒后慢慢散开。手机几乎不变慢（约 1 帧）。

推荐：**A + C**。A 不花性能、整体更好看；C 让"拖船"这个主要动作更真实。B 好看，但最费手机性能，也最容易显得廉价。
