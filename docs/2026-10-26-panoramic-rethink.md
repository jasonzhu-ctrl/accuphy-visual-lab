# Panoramic: what goes wrong on the phone, and the root cause (2026-10-26, research only)

Jason, 2026-10-26, in this chat: "我发现我们 panoramic view 的在手机上面的显示效果非常的糟糕 … 重新调研一下 panoramic view 的画面模式应该
怎么做，我觉得是画面逻辑的根源问题。" Research and a plan only; nothing has been built.

Board: `docs/2026-10-26-panoramic-refs.jpg`. It shows three rows:
- ours on a 390×844 phone, and the same picture flat;
- the Accuphy app's own recordings: a lake at 14 m, and the sunk boat at 62 m;
- Garmin LiveScope's Perspective mode, the same top-down fan: timber at 19 ft deep, and a 7 ft flat.

## What the real pictures have in common (app and LiveScope)

1. **The whole fan is one continuous, soft image of the bottom.** It is an even field with fine grain, radial beam
   streaks, and soft brighter and darker patches. There are no hard edges and no dotted pixels.
2. **Structure is a soft bright patch with a soft dark wedge behind it** that fades over metres. The wreck is the hull's
   footprint lit on the side facing the boat; the trees at 19 ft are smeared bright clumps.
3. **Fish are short streaks across the beam**, yellow in orange, all in the same plane. Their shadows are soft blotches.
4. **Where the beam has not reached the bottom yet** (near the boat in deeper water), the picture is darker, with a
   near-field glow and spokes. Further out, everything is filled.
5. **Everything is limited by the beam, not by the model:**
   - Across the bearing, detail is about 1–2° wide.
   - Along the range, it is the pulse length.
   - A 0.5 m stump at 20 m is a smudge, not a disc.

## What ours does instead (`sonarShader.js` Panoramic branch, `sonarMarks.js`; docs/sonar-style.md §7.13)

Since #7.13, Panoramic is **"a picture taken from above"**, built in four steps:
- an orthographic depth map of the 3D models seen from straight above (`topRT`), dilated to a footprint;
- the baked terrain for the bottom;
- shadows found by marching each ray back to the transducer;
- fish as analytic ellipse marks.

That logic produces exactly what Jason sees on the phone:

| On the phone | Why |
|---|---|
| Tree crowns as **round blobs and rings**, rocks as **balls** | The plan view draws the model's outline from above. A sonar never sees an outline; it hears echo strength per bearing and range. |
| **Hard black spokes** across the fan | The geometric shadows are sharp and full strength from every stump. Real shadows are soft and partial, and on the app's 14 m lake they hardly show. |
| **Dotted, pixel-grain texture** | The top map and its dilation are sampled at map resolution, then shrunk into a ~360 px wide phone box: aliasing. |
| **Gaps and a ragged, half-empty fan** | Coverage comes from the plan-view footprint and the 5–25° band test. It does not come from where sound actually lands, so the edges are cut, not soft. |
| **Big glowing ellipses** for fish | Fish here are still the old analytic marks (#120). #153 / #170 changed only the vertical views. |
| **Its own texture** | It breaks the standing rule of #148 / #153 ("every echo takes its texture from `arcGrain`"); Panoramic was left out of it. |

**The root:** the vertical views (Down, Forward, Combo) are already drawn as a **sound picture**: what the transducer
hears, angle × range, `arcGrain`, and #153 fish. Panoramic alone is still a **photograph of the geometry**. On a
desktop the big screen hides much of it; on the phone the fan is small and the geometric shapes dominate.

## Plan (for Jason to decide; nothing done)

**A. Rebuild Panoramic as a sound picture (the root fix, recommended).**
- Draw it with the same pipeline as Forward. The fan is turned flat: 135° across, 20° thick, tilted 5–25° down.
- For each bearing and each slant range, take what the beam's thickness hits (bottom, structure, fish), as Forward does
  now. Blur it with the beam pattern across the bearing (~1.6°) and the pulse along the range.
- The texture comes from `arcGrain`, and the fish from the #153 pass.
- Shadows then come by themselves: behind a stump the ray has already hit something. They are soft, because the 20°
  thickness is only partly blocked.
- Coverage comes by itself too: dark near the boat until the beam reaches the bottom, filled beyond.
- Screen: the app's layout as today (apex at bottom centre, slant range as the radius).
- **How:** first a separate test page (like #153's fish page), so Jason can compare old and new on his phone. It moves
  to the live page only after his OK.
- **Cost:** about one more vertical-view pass, in place of today's top-down map. To be measured on the phone and the
  V10 (#50).
- **Scope:** the summer lake only. The ice page has no Panoramic, and PLM Live Panoramic is still frosted.

**B. Patch the phone only (fast, keeps the root problem).**
- Soften and shorten the shadows.
- Filter the top map to remove the dots.
- Start the phone at a shorter range, e.g. 50 ft.
- It would look less broken, but the circles, balls and ellipses stay, because they come from the plan-view logic.

## Questions for Jason (one at a time)

1. A (rebuild as a sound picture, on a test page first) or B (quick phone patch)? Recommended: A.

## 中文摘要（给 Jason）

- 你说得对，是画面逻辑的根源问题。
  - **我们的全景是“从正上方给 3D 模型拍照”：** 树冠拍成圆圈，石头拍成球，阴影按几何算成又硬又黑的放射条，再缩到手机的小框里就全是颗粒点；鱼也还是旧画法的光球。
  - **真 App 和 LiveScope 的全景是“声音的图”：** 每个方向、每个距离上听到的回声有多强。所以整片是连续柔和的水底纹理，结构是一团亮、后面一道慢慢变淡的影子，鱼是一条条短划。
  - 前视、下视早就是按“声音的图”画的（#148 纹理规则、#153 新鱼），只有全景还是旧的拍照法。
- **方案 A（推荐）：** 把全景改成和前视同一套画法，只是把扇面放平。影子、远近的明暗都会自然出来，纹理和鱼也和前视统一。先做一个测试页，你在手机上对比，满意了再搬进正式页面。
- **方案 B：** 只给手机打补丁（影子调软、去颗粒、默认量程调短）。快，但圆圈和光球这些根本问题还在。
- 对比图：`docs/2026-10-26-panoramic-refs.jpg`。什么都还没改，等你决定。
