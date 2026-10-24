# Lessons from the Accuphy Lab (2026-09-23 → 09-26)

Retrospective of decisions #1–#73 and the notes of every Lab chat (the sonar-lake chat, the mobile / market
chats, the lite-section chat). Jason asked for it: "你们一起去回顾一下项目做下对之后有帮助的技能总结吧". The
repeatable procedures are also project skills in `.claude/skills/` (`sonar-qa`, `sonar-look-tuning`,
`lab-test-link`), so a new chat in this folder picks them up.

## 中文摘要（给 Jason）

1. **先对照原版，再动手。** 画面问题几乎都靠"同样条件下和原版 app 截图对比"找到根因（沉船抬到同样深度对比、平板录像、LUT 亮度直方图）。凭感觉调参数的几次都走了弯路。
2. **亮度用数字衡量。** 湖底场景白色约 6–7%、结构物约 14%，是原版 app 的实测比例。每次改画面都量一遍，不靠肉眼。
3. **改一处，查全局。** 每次改完都在 6 个位置 × 6 种画面检查，还要确认已经校准好的场景（Mini 浅滩）没被带坏。有两次改法看着不错，就是因为这一步查出副作用而退回的。
4. **像真实用户那样测。** 用网址参数直接放船，漏掉了 logo 船开不到的问题；只在 Chrome 测，漏掉了 iPad Safari 黑屏。以后要按正常操作测，也要测苹果设备。
5. **改地形要冻结布局。** 深水改浅时，树和石头的位置会整体重新洗牌，所以用"旧深度"来决定摆放。
6. **鱼的动作要先模拟验证。** 模拟船开 30 分钟，逐帧检查每条鱼不穿结构物、不钻湖底、不出水面。
7. **发给别人看：** 用 GitHub Pages 做公开链接，谁都能打开；Claude 的 Artifact 链接要登录，只适合自己看。"开启公开网页"这一步系统规定必须你亲手点。
8. **几个对话同时改一个项目：** 决定编号会撞（#69 就撞过），写之前先重新读最新编号，只提交自己改的文件。
9. **鱼的画面要按声纳成像来画（#120）。** 鱼是"声束眼中的鱼"：沿声波方向很薄、沿弧线方向按固定角度拉长，鱼鳔最亮，侧身亮、正对暗，每次 ping 斑点都变。画成平滑椭圆或游动轨迹就会像"椭圆的球"。

## 1. Working with Jason

- One question at a time, Chinese, short and concrete; never hand him a procedure unless a safety rule forces a
  manual step (then: the exact clicks, once, and Claude tracks it — e.g. the GitHub Pages switch, #72).
- "A plan is not a go-ahead" — but a direct description of wanted behaviour ("鱼可以…追饵") in the same message as
  an approval is a request; do it in full.
- Show proof as images: before/after or app-vs-engine composites with Chinese labels (`reference/engine-compare/*`),
  sent with SendUserFile. He judges the look, not the numbers.
- **When he marks an area on a screenshot,** project the outline through the scene camera onto the lakebed to find
  the world area he means (#92). Then show the change the way he met it: he judged #91 by dragging the boat and
  watching the depth number, so #92 was shown as the depth along that drag path and Down pictures along it.
- Say plainly what was not verified (the live Artifact behind a login, Safari without a simulator).
- The premium dark cinematic look is the first criterion (`visual-premium-tech-feel` memory, #50, #54, #55).

## 2. Getting the sonar picture right

- **Reference first.** The truth is the real app on the V10 tablet (#25) and real recordings
  (`reference/app-study/**`). Extract frames with the repo's `ffmpeg-static`. Early app clips (2025-03, 72–78 % gain)
  are brighter than the calibration frames; say which reference a target comes from.
- **Compare like for like.** Different depth or scale makes a correct engine look wrong. #63 raised the wreck to the
  recording's depth with a dev flag (`?wrecklift=`) and set the same range/depth (`?dev` sliders). Only then was the
  real fault visible (a line drawing where the app draws glowing bands).
- **Measure brightness.** `window.__sonarHist(10)` = LUT-index histogram of the lit pixels. Targets (§6.11): a
  bottom/fish scene ~6–7 % white with a dark-red/orange body; a structure scene ~13–14 % white. #66 found PL scenes at
  38–44 % white this way.
- **Tune with temporary knobs, then bake.** Add a uniform fed from `window.__x`, sweep values with `__sonarSnap`
  snapshots of 4–6 scenes, tile them with PIL, pick one, bake the constants, delete the knobs (grep for `TEMP`).
- **Displacing a non-indexed mesh tears it (#131).** three's polyhedra (Dodecahedron, Icosahedron…) are non-indexed:
  every corner exists once per triangle. Move the copies by their own random amounts and the skin splits into shards
  (the "popcorn" rocks). Weld first (`mergeVertices`), displace the unique points, then `computeVertexNormals`. Shape
  comes from a few operations in order — mass bumps, planar cuts with rounded shoulders, grain — not from noise alone.
- **Materials matter.** Steel (wrecks) ≠ wood/rock (#63): a separate sonar tag gives steel wide bright bands and
  long tails, while timber stays sharp. A global change broke timber. Check the calibrated scenes after every
  change: the Mini shelf (`?boat=-40,-5`), the default view, the hump, the deep, the wreck, the lockup.
- **A terrain change moves the calibration.** The bottom's soft cap and near gain ramp on range, tuned for the depths
  the lake had (5 m shelf, 17 m middle). #91 put the main play area at 8–9 m, inside the 6–14 m ramp, and the default
  view went to 20 % white. Run the grid after every terrain change, and prefer a fix that leaves the calibrated scenes
  untouched (#91: a PingLive-only cap by depth below the transducer; a range-only ramp dimmed the shelf and the Mini).
  #92 needed more: a per-device cap (the Mini's own near gain changes where it needs one) and, in Forward, bottoms
  toned no nearer than 80 % of the visitor's fixed range window. The white share jumps with small gain changes when
  a third of the lit pixels sit just under white, so measure every view, not just Down.
- **Physics limits are answers, not bugs:** the Mini cannot see the bottom closer than ~1.2 × depth ahead; the
  Panoramic flat fan meets a 40 m floor 86 m out. Explain them, then offer a design choice.
- **Fish are images of a beam, not glowing bodies (#120).** Draw what the beam makes of the body now: thin along the
  ray, a fixed angle across it, a bright swim-bladder kernel, brightness set by aspect, speckle that changes every
  ping. A swept path or a smooth Gaussian reads as an "椭圆的球形". Check the orientation rule in Panoramic too: mirror
  images left and right of the boat mean "along the arc" (§7.13 had misread them as swim paths for a month).
- **Measure the picture in the sonar's own units (#129):** LUT index (through the measured `garmin_amber` map) and polar
  ft/degrees around the transducer, read off the frame's own grid. Then LiveScope, the app and the engine compare as
  numbers (a fish is 2–3° × 0.1–0.15 m, noise one cell of 0.5° × 5 cm, structure as bright as the bottom), and a
  "looks wrong" turns into one knob. `scripts/dev/measure/`.
- **Averaged value noise is low-contrast** (two octaves + a ping blend sit in 0.3–0.7). Under the log tone curve a
  ±15 % modulation is invisible: stretch it back to 0–1 before using it, or the texture "changes" without showing.
- **Sampling noise:** per-pixel random row sampling turned big faces into dust; ray-coherent sampling fixed the side
  views (#62). For the Panoramic shadow march, coherent and fixed offsets both looked worse, so per-pixel stays (#67).

## 3. 3D scene engineering

- **Changing terrain:** vegetation is seeded rejection sampling with depth bands, so any depth change reshuffles the
  whole lake. Place against a frozen `layoutDepth` and let only heights follow (#64). Prove it with
  `scripts/dev/layout-dump.mjs` before and after.
- **Shallower water:** tall things on the bottom and fish placed at a height above it can break the surface. Cap them
  (#91: drowned-tree tops ≥ 1.2 m under water, `keepUnderSurface` for fish) and count them with `layout-dump.mjs`.
- **Placed objects must stay reachable:** the boat is clamped to ±58 m (`Scene.jsx`). The lockup at z −62 could not be
  swept (#66). Test by driving the boat, not with `?boat=`.
- **Fish:** loops are cleared of structure at load (#39). Behaviours are pure functions of time layered on the loop
  (acts ease in, hold, ease out), so the 3D fish and the sonar marks always agree (#64). Every act's path is sampled
  before it starts; `scripts/dev/fish-sim.mjs` must report 0 structure/bottom/surface hits. A fish that rises into
  the thin slab must hold still there, or it drifts out of the picture.
- **Fish swimming (#86):** a vertex-shader body wave fed by one per-fish attribute (`aSwim`). Tune it with a quick
  per-species simulation of speed, tail beat and bend before rendering anything: fish drawn 2.6× long on tight loops
  saturate any bend that follows the path's curvature, and their slow speeds (0.1–0.4 body lengths per second) make a
  pure speed-driven beat look rigid.
- **The water surface is flat (#88):** the water shader adds its waves to the rotated plane's `p.y`, which is
  horizontal, and its grid has 10 m cells. Anything that should sit on the water (boat, foam) sits at y ≈ 0; a wake
  has to be drawn in the fragment shader.
- **Performance:** keep per-frame JS tiny (behaviours 0.04 ms, worst 1–2 ms when an act starts). Pre-filter
  obstacles near a path, cap cascades (≤ 8 bait scatter).

## 4. Browsers and shipping

- **Safari/WebKit (iPad, iPhone, Mac):** never sample a FloatType texture with LinearFilter. There is no
  float-linear filtering, and the texture reads black (the sonar LUT did, #73). Use 8-bit, or half-float
  (filterable in WebGL2), or float with NearestFilter. Chrome hides this, so test WebKit before sharing. This Mac has
  no Xcode (no iOS simulator), and Safari is read-only for Claude.
- **Real phones:** the Android baseline and the method (adb + CDP) are in the `sonar-page-real-device-perf` memory.
  Budget GPUs run at 10–24 fps; landscape phones need their own layout.
- **Sharing:** a claude.ai Artifact needs a Claude login (fine for Jason, not for friends). The public test link is
  GitHub Pages `jasonzhu-ctrl.github.io/accuphy-lab-test` (#72), built by `scripts/build-share.mjs` as ONE
  self-contained file (fonts and logo inlined, `noindex`, no sign-up gate, #71). The script refuses to finish if
  any file reference is left. Switching on a new public surface is Jason's click, not Claude's.
- **Repeatable before/after clips (Playwright):** in an init script, freeze `performance.now()` and queue
  `requestAnimationFrame` behind a `__step(ms)` virtual clock, and seed `Math.random`; run the old code from a frozen
  copy on a second port. Frames come out byte-identical run to run. Playwright's own `page.clock` hung the screenshots,
  and `waitForFunction` must poll on a timer (`polling: 100`), not on animation frames.
- **The grid's Combo tiles can settle at a different AUTO range** (#131: 21 % vs 17 % white, "depthAxis 70 ft" vs
  45 ft on one run): the log prints the AUTO depth and range per tile — when a Combo tile differs, compare those two
  numbers first and re-run that view alone (`VIEWS=Combo node grid.cjs <label> <port> <spots> PLM`) before blaming
  the change.
- **Headless in the cloud container (2026-10-23):** 4 CPUs, 15 GB, SwiftShader only. Three or four Chromium pages
  at once got the container OOM-killed (restart, background servers lost): run at most two. The ice page under the
  virtual clock dies at ~frame 200 on both old and new code; capture it in real time instead (load, wait ~40 s,
  click a view, wait, snapshot). Never edit ANY repo file while a grid runs on the dev server, docs included: Tailwind 4 scans every file for class
  names and reloads the page, and the run dies with "Execution context was destroyed" (three grid runs lost this way).
  YouTube is blocked there (www.youtube.com, *.googlevideo.com, i.ytimg.com): video study needs those hosts allowed
  in the environment's network settings, or the Mac.
- **Build gotchas:** the minifier writes string literals with backticks. Vite rewrites public CSS URLs to
  `../brand/…`. Both broke naive find-and-replace. `vite build` must pass before any share.
- **Fonts:** the Lab's local `Eurostile-Heavy.otf` has an unverified web licence. The website moved to the Adobe kit
  `tgt1pkw` + Inter + #028CDF (`brand-visual-system-website-v1` memory). Converge before a public launch.

## 5. Several chats, one repo

- Re-read the last decision number right before appending (#69 collided). Stage only your own files, and
  `git pull --rebase` before pushing. Other chats' uncommitted edits are not yours to commit.
- One project = one folder. A chat stuck in the wrong worktree keeps writing only into the right folder, and hands
  off through memory notes (`sonar-lab-handoff`).
- Lab designs and the live site are separate (#69): anything for shop.accuphy.com goes through `accuphy-website`
  handoffs.
- Safety checks are hard stops. Copying chat records, and creating public surfaces, were refused. Explain the
  refusal and give Jason the one manual step; never route around it.

## 6. Tool inventory

| Tool | What it does |
|---|---|
| `?boat=x,z` · `?bigphone` · `?dev` · `?cam=logo/wreck/boat[:side/bow/stern/top/under]/fish:<sp>[:<i>][:top/side/tq]` · `?wrecklift=m` | Dev URL flags: park the boat, enlarge the phone, tuning rows, cameras (the boat from six angles; a fish from above, the side or three-quarter), lift the wreck |
| `?cam=rocks[:hump]` (dev builds only) | Circles the island rock pile (or the first rock hump) under water (#131) |
| `?fishlab` (dev builds only) | Scripted test fish in front of and under the default boat (#120): crossing the slab, turning in place, hovering, toward/away, a musky, two under the boat, a crappie school — one per state the fish marks must get right |
| `window.__sonarSnap()` + `POST /__snap?name=` | Save the sonar picture as a PNG in `reference/engine-compare/` (gitignored) |
| `window.__lakeSnap()` | The 3D view alone as a PNG |
| `window.__sonarHist(10)` | LUT-index histogram of the lit sonar pixels |
| `window.__chase('laketrout')` | Force a boat-triggered rise on the nearest fish |
| `window.__fish`, `window.__sonarState` | The population; the page state (boat, target, apex, depthM …) |
| `scripts/dev/fish-sim.mjs`, `scripts/dev/layout-dump.mjs` | Node checks (run with `--import ./scripts/dev/node-register.mjs`) |
| `scripts/build-share.mjs <outDir>` | Self-contained share build (Artifact file + `pages/` for GitHub Pages) |

## Ice: noSignal is state, signal is the visual gate (2026-10-17)
`s.noSignal` is the hop state machine's boolean; `s.signal` (0..1) is "is the transducer wet". Drive every visual from
`s.signal`, never from `noSignal` or a private ease, or the cone, bottom and screen fall out of step (worst at phone fps).
Gate with a multiplier uniform defaulting to 1, not by passing [] specs (that pops, and zeroes `uFanCount`, turning the
fan black instead of "no echo"). In lakeMaterial scale `beam` and `edge` after the rim (`edge = wide - beam`). Beams
remounts on specKey (AUTO range change mid-hop): find its materials by walking the group each frame.

## Tune the engine against a real recording, like for like (2026-10-23)
Two app stills of other objects, judged by eye, are not a reference (#128 drew wrecks from pilings). The method that
works: the app's own recording on a phone over adb (`adb shell screencap` bursts), the picture measured on the
screen's own scale (px/ft from the rulers) — classes of lit pixels, texture correlation length, ping-to-ping flicker,
band thickness, the colour ramp — then the SAME scene in the Lab (`?study=wreck&boat=x,z&gain=&contrast=&noise=&depth=`,
`window.__sonarFlat(w, h)` for the flat picture) compared on the same boxes with `scratchpad/real/stats.py`-style
numbers, one knob at a time (`window.__sonarTune`). Keep the UI text out of the measured boxes. Ask Jason what the
unknown blobs are before modelling them.
