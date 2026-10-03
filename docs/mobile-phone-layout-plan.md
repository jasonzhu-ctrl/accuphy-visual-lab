# 手机版 Accuphy Lab 优化方案（2026-10-03，方案已认可；Jason 说开始后才动手）

## 中文摘要（给 Jason）

**问题出在哪：** 3D 湖面的镜头是固定的，按电脑宽屏设计。手机竖屏又窄又高，镜头横向只看得到约 29 米宽的湖面，电脑上能看到约 112 米。所以船显得很大（占屏幕宽度约四分之一），又偏在左边；声呐波束扫到的范围（往前 24 米以上）超出屏幕，只露出一半；"拖动小船"的提示也被切掉。下半屏又被声呐小屏和控制面板占满，真正能看的水面很小。

**优化分四步，按顺序做，每一步做完都先给你看截图：**
1. **镜头按屏幕形状自动调（最关键，解决你说的比例问题）：** 手机上自动拉远镜头，保证横向至少看到约 70 米的湖面。船缩到现在的三分之一左右，整个波束覆盖面完整落在屏幕里，船放在画面偏左、波束朝右展开。电脑上的画面不变。
2. **重新排版（保留手机边框，屏在上，水在下）：**
   - 横放的 iPhone 边框保留，放在屏幕最上面，左右只留很窄的边，尽量做大。
   - 手机上把倾斜角度放平一点，省下空间，画面也更大。真机横着用的样子和现在一致。
   - 以 iPhone 14/15（390 宽）为例，竖屏空间大致这样分：
     - 上面约 25%：手机边框和声呐画面，比现在大约 15%
     - 中间约 8%：一排大的视图按钮（Down / Forward / Panoramic），加一个"更多"按钮，里面放设备和量程
     - 下面约 65%：湖面，拖船就在这里，拇指够得着
   - 原来那块占了下半屏的大控制面板没有了，所以湖面能多出一大块。
   - 顺便修掉 360 宽屏幕上面板和手机边框叠在一起的问题。
3. **拖船更顺手：** 在水面任何地方用手指滑动，船就跟着同样移动，手指不会挡住船，也不用先点准那条小船。提示气泡始终留在屏幕里面。
4. **横屏和流畅度（第二阶段）：** 手机横过来，就是"真机模式"：声呐全屏，像真的 app，湖面变成角落里的小窗。便宜手机自动降画质，目标每秒 30 帧。

**不变的：** 电脑版布局、声呐画面的算法、所有已经调好的画面效果。三种钓法场景（船、皮划艇、冰钓）以后做，这次的排版会给它留好位置。

---

## Context (for Claude)

Jason (2026-10-03), on the public test link on a phone: the overall proportions are wrong, the camera
should zoom out, and the boat should be smaller so the coverage is visible. Root cause (Explore):
`Rig` in `src/experiments/2026-09-23-sonar-lake-3d/Scene.jsx:377-378` uses one fixed camera,
`position(-14,52,66)`, `lookAt(3,-9,0)`, vertical fov 38 (`:410`), with no aspect logic.
- On 390×844 the horizontal view is ~29 m wide at the target, against ~112 m on 16:9.
- The boat (6.6 m, `boat.js:10`) starts at (-6,4), left of the look-at point.
- Forward (~24 m) and Panoramic (30 m+) footprints point +x and can't fit.

Layout (`index.jsx`):
- The phone inset sits at `bottom-[240px] w-[88vw]`, a guess of the panel height, so the panel
  overlaps it at 360 px.
- The step cards appear at md (768 px) wide, which breaks landscape phones.
- The hint is never clamped (`Scene.jsx:340-345`).

The direction matches `docs/mobile-marketing-plan.md` "Principles for mobile" (#47).

## Phase 1: aspect-aware camera (Scene.jsx `Rig`, desktop unchanged)

- Keep the same viewing direction (azimuth and elevation) as desktop. When
  `camera.aspect < 16/9`, increase the distance d so the horizontal field covers W_target. The
  horizontal field is `2·d·tan(hfov/2)`, with `hfov = 2·atan(tan(fov/2)·aspect)`.
  - W_target is ~70 m in portrait.
  - Blend smoothly between portrait and desktop. At aspect ≥ 1.6, use exactly today's
    position/lookAt.
- Shift the look-at to frame the boat area plus the footprint. Put the boat at ~30% from the
  left of the lake region, with the beam opening to the right. Compute the visible lake region
  from the DOM: the band of the canvas not covered by the sonar/panel. Use a view offset
  (`camera.setViewOffset`, or a lookAt shifted by the projected band centre) so the 3D content
  centres in the free band, not behind the UI.
- Keep the camera fixed while dragging (no follow-cam), so the boat moves across a stable lake.
  Re-frame only on resize/orientation change and on step presets.
- Clamp parallax on touch (pointermove drives it; on phones set it to 0).
- Check the fog/far plane (400) and the fog density at the larger distance (≈ 1.6–2.3× today).
  Lake detail stays readable; the fog density may need a per-distance compensation, via the
  existing uniform in `lakeMaterial.js` if one exists.
- Reuse: `useThree().size`, which is already in `Rig`, and `TRANSDUCER_OFFSET` / `s.apex` for
  the boat position.

## Phase 2: portrait layout "screen up, water down" (index.jsx, index.css, SonarScreen/SonarChrome)

- Below `sm` in portrait (use an orientation/aspect media query, not width alone):
  1. **Top (~25%):** keep the landscape iPhone frame. Jason asked for this on 2026-10-03: "手机能否保留边框 合理安排一下空间".
     - It sits at the top, almost full width, with a 12 px side gutter and the safe-area top
       inset.
     - On phones the tilt is reduced to a near-flat pose, about rotY −4° / rotX 2° instead of
       −16° / 6°, so the frame fills the width and the picture is ~15% larger.
     - Make `PHONE_POSE` responsive. The GL quad uses the same maths in `SonarScreen.jsx`, so it
       stays perspective-correct.
     - The aspect stays 2.08:1, because the frame is the real landscape phone.
     - The `SonarChrome` cqh sizes follow the frame.
     - The decorative app buttons keep their look, but get invisible ≥ 32 px hit areas.
  2. **Middle strip (~8%):** the View pills (≥ 44 px), plus a "More" button opening a bottom sheet
     with Device and Range (the big panel is gone on phones).
  3. **Bottom (~65%):** the lake. Phase 1's free band is this region.
- Replace the `bottom-[240px]` guess with a flex/grid column, so nothing overlaps at 360 px.
- Keep the step cards hidden on phones in both orientations, using a pointer/height rule.
- Add `viewport-fit=cover` and safe-area padding (notch, home bar).

## Phase 3: touch drag (Scene.jsx `PickPlane`)

- On touch (`pointerType === 'touch'`), the drag is relative: the boat target moves by the
  finger's world delta. Keep the ±58 m clamp.
- Mouse keeps today's absolute "jump to cursor".
- Clamp the hint (`s.hintEl`) inside the free band. On phones the hint reads "Swipe the water
  to move the boat".
- Step presets (`index.jsx:160-168`) also re-frame the camera, so a preset boat at x=-50 or
  x=16 is in view. Lessons: drive the boat, don't teleport, and test reachability.

## Phase 4 (second round): landscape "real device mode" and quality tiers

- **Landscape phone** (aspect > 1, height < 500): the sonar full-screen with the app chrome, and
  the lake as a ~28% inset that taps to expand.
- **Quality tiers:** pick dpr 1–1.5 and a 30 fps cap from the measured frame time; budget GPU
  target ≥ 30 fps (baseline 10–24, `sonar-page-real-device-perf` memory).

## Not in scope

- The Boat/Kayak/Ice scenes (#53/#56); the layout leaves room for a scene chip in "More".
- Sign-up gate changes, desktop layout, sonar look.

## Docs to update when building

- `docs/decisions.md`, a new entry (re-read the last number; it is #76 now).
- The `docs/mobile-marketing-plan.md` layout section: resolve its "lake on top" line in favour
  of principle 3.
- `docs/backlog.md` mobile items.

## Verification

1. A dev server (`preview_start lab`) at viewports 360×800, 390×844, 430×932 and 1440×900, plus
   844×390 (landscape, after Phase 4). Before/after composite screenshots with Chinese labels go
   to Jason via SendUserFile.
2. Per viewport:
   - the boat and the full footprint are visible for PL Down, PL Forward 80 ft, PL Panoramic
     70 ft and PLM Combo;
   - the hint stays fully on screen;
   - nothing overlaps;
   - touch drag works: CDP `Input.dispatchTouchEvent`, as in the 2026-09-24 test;
   - desktop is pixel-identical in framing.
3. The step presets 1–3 frame the boat, and the boat can be driven to the lockup and the wreck.
4. `sonar-qa` scaled pass: build, Safari texture grep, the touched views, console errors.
5. A real device: the V10 tablet over adb + CDP (phone-size emulation) for fps and touch. Ask
   Jason to check on his own phone.
6. Only after Jason approves the screenshots: update the public link (`lab-test-link` skill).
