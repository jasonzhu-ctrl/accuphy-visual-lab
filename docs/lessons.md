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

## 1. Working with Jason

- One question at a time, Chinese, short and concrete; never hand him a procedure unless a safety rule forces a
  manual step (then: the exact clicks, once, and Claude tracks it — e.g. the GitHub Pages switch, #72).
- "A plan is not a go-ahead" — but a direct description of wanted behaviour ("鱼可以…追饵") in the same message as
  an approval is a request; do it in full.
- Show proof as images: before/after or app-vs-engine composites with Chinese labels (`reference/engine-compare/*`),
  sent with SendUserFile. He judges the look, not the numbers.
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
- **Materials matter.** Steel (wrecks) ≠ wood/rock (#63): a separate sonar tag gives steel wide bright bands and
  long tails, while timber stays sharp. A global change broke timber. Check the calibrated scenes after every
  change: the Mini shelf (`?boat=-40,-5`), the default view, the hump, the deep, the wreck, the lockup.
- **Physics limits are answers, not bugs:** the Mini cannot see the bottom closer than ~1.2 × depth ahead; the
  Panoramic flat fan meets a 40 m floor 86 m out. Explain them, then offer a design choice.
- **Sampling noise:** per-pixel random row sampling turned big faces into dust; ray-coherent sampling fixed the side
  views (#62). For the Panoramic shadow march, coherent and fixed offsets both looked worse, so per-pixel stays (#67).

## 3. 3D scene engineering

- **Changing terrain:** vegetation is seeded rejection sampling with depth bands, so any depth change reshuffles the
  whole lake. Place against a frozen `layoutDepth` and let only heights follow (#64). Prove it with
  `scripts/dev/layout-dump.mjs` before and after.
- **Placed objects must stay reachable:** the boat is clamped to ±58 m (`Scene.jsx`). The lockup at z −62 could not be
  swept (#66). Test by driving the boat, not with `?boat=`.
- **Fish:** loops are cleared of structure at load (#39). Behaviours are pure functions of time layered on the loop
  (acts ease in, hold, ease out), so the 3D fish and the sonar marks always agree (#64). Every act's path is sampled
  before it starts; `scripts/dev/fish-sim.mjs` must report 0 structure/bottom/surface hits. A fish that rises into
  the thin slab must hold still there, or it drifts out of the picture.
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
| `?boat=x,z` · `?bigphone` · `?dev` · `?cam=logo/wreck/boat/fish:<sp>` · `?wrecklift=m` | Dev URL flags: park the boat, enlarge the phone, tuning rows, cameras, lift the wreck |
| `window.__sonarSnap()` + `POST /__snap?name=` | Save the sonar picture as a PNG in `reference/engine-compare/` (gitignored) |
| `window.__lakeSnap()` | The 3D view alone as a PNG |
| `window.__sonarHist(10)` | LUT-index histogram of the lit sonar pixels |
| `window.__chase('laketrout')` | Force a boat-triggered rise on the nearest fish |
| `window.__fish`, `window.__sonarState` | The population; the page state (boat, target, apex, depthM …) |
| `scripts/dev/fish-sim.mjs`, `scripts/dev/layout-dump.mjs` | Node checks (run with `--import ./scripts/dev/node-register.mjs`) |
| `scripts/build-share.mjs <outDir>` | Self-contained share build (Artifact file + `pages/` for GitHub Pages) |
