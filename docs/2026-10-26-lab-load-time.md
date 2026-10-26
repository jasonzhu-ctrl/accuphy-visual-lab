# Lab 加载时间：量了什么、慢在哪、怎么改（2026-10-26，手机网页端，只查不改）

Jason 2026-10-26 在 iPhone 上开朋友测试链接（GitHub Pages，bd1e13e）：“整个加载的时间还是偏慢一点点”。
Lab HQ 派：量时间、找慢的地方、提 2–3 个改法。本文中文在前，英文摘要在后。

## 一、量到的数字

怎么量：无头 Chrome 156 走 CDP，手机视口 390×844 @2x、iPhone UA、关缓存；“4G”= 9 Mbps / 60 ms 延迟 + CPU 慢 4 倍
（约等于一台中档安卓）；“慢 3G”= 1.6 Mbps / 150 ms + CPU 慢 6 倍；“不限速”= 这台 Mac 本身。在页面开头注入钩子，
记下 WebGL 创建、第一帧、App 首页出现、选视图后的第一帧、主线程卡顿（Long Task）。每种各跑 1–2 次，取值接近。
脚本在本次聊天的 scratchpad（`load/measure.mjs`、`load/profile.mjs`），要重跑可再生成。

| 时间点（从点开算，秒） | lab.accuphy.ca（Vercel，br）4G | GitHub Pages（gzip）4G | Vercel 慢 3G | Vercel 不限速 |
|---|---|---|---|---|
| 页面文件下载完（第一屏可以画） | 1.03–1.07 | 1.07 | 7.6 | 0.53 |
| App 首页（手机框里的选视图页）出来 | 1.44–1.47 | 1.40–1.53 | 8.4 | 0.63 |
| WebGL 建好（湖面开始搭） | 1.59–1.68 | 1.55–1.74 | 8.7 | 0.70 |
| **第一帧 3D 画出来（湖面出来）** | **3.7–3.8** | **3.7–4.1** | **11.9** | 1.19 |
| 选视图 → 下一帧（能拖船） | +0.04 | +0.03 | +0.05 | +0.01 |
| 主线程最长一次卡住 | 2.1–2.2 s | 2.2–2.4 s | 3.3 s | 0.49 s |
| 之后帧率 | 60 | 60 | 60 | 60 |

- 两个链接**差不多**：Vercel 传 1 051 KB（brotli），GitHub 1 101 KB（gzip），4G 下都约 1.0 s 下载完；Vercel 首字节快一点（30–45 ms 对 20–170 ms）。
  换链接不会让 Jason 觉得快。
- 页面是一个 2.73 MB 的 HTML，什么都内联在里面；压缩后约 1.05 MB。
- 旧数据对照：2026-09-24 V10 平板（最便宜那档）4G 上 2.8 s 到 3D，当时页面只有 976 KB、没有 FFT 水面和冰钓代码；
  现在在“CPU 慢 4 倍”的模拟下是 3.7 s。真机（便宜安卓）估计 4–6 s，Jason 的 iPhone 估计 2–3 s。

**结论：** 访客要等约 3.7 s 才看到湖面；其中约 1.0 s 是下载，0.5 s 是解析和画出首页，**2.2 s 是建场景时主线程卡死**（这一段屏幕上什么都不动，最像“慢”）。

## 二、慢在哪（按大小排）

### 1. 建场景卡住 2.2 s（4G/中档 CPU）— 最大头

CPU 采样（不限速时这段共约 0.75 s 脚本时间，乘 4 就是模拟值）：

| 块 | 不限速自耗 | 是什么 | 出处 |
|---|---|---|---|
| 地形高度（噪声） | ≈ 0.35 s（nA 0.26 + dA/aA/iA/rA ≈ 0.1） | 湖底 161×161 网格每个点算分形噪声 + 几处岩堆/陡坡，纯 JS 循环 | `terrain.js`（`depthAt`/`bedY`/`fbm`），`Scene.jsx` 的地形 useMemo |
| 着色器编译检查 | ≈ 0.09 s（three.js `checkShaderErrors`，`getProgramInfoLog`/`LINK_STATUS`） | 25–29 个着色器程序；检查会把编译**同步等完**。真机 GPU 驱动编译慢得多（便宜安卓常 0.5–1.5 s） | three.js 默认 `renderer.debug.checkShaderErrors = true` |
| logo 贴图 | ≈ 0.03 s（ZM/QM：画 1464 px 画布 + 距离变换） | 湖底 ACCUPHY LAB 字的距离场贴图，每次打开都现算 | `logo.js` |
| 其余（鱼、沉船、船、FFT 水面初始化、React 挂载） | ≈ 0.2 s 合计 | 分散 | `fish.js`、`wreck.js`、`boat.js`、`lakeFFT.js` |

着色器**链接本身**只记到 1–2 ms（Chrome 有并行编译扩展，不等）；但 three.js 的错误检查在没有并行编译的手机 GPU 上会卡在那里等编译完，
这就是 2026-09-24 V10 上“冻住 1.8 s”的主要来源。本次模拟量不出真机 GPU 编译时间，这一块要真机复测。

### 2. 下载 1.05 MB（4G 约 1.0 s）

压缩后各占多少（gzip 估算，br 相近）：

| 内容 | 原始 | 压缩后 | 说明 |
|---|---|---|---|
| JS + CSS + HTML（three、React、R3F、motion、Lab 代码、冰钓代码） | 1.68 MB | **0.49 MB** | 冰钓页的代码（IceCamp、iceSheet、snow…约 90 KB 源码）也在夏季湖里 |
| 字体 3 个（Instrument Sans 正体 193 KB、斜体 201 KB、Eurostile Heavy 44 KB，全字库 TTF/OTF，base64） | 0.59 MB | **0.31 MB** | 斜体只用在手机框里的刻度数字和 “1440p (QHD)”；全字库里几千字我们只用几十个 |
| 白色 logo PNG（147 KB，内联 1 份 base64 200 KB） | 0.20 MB | **0.12 MB** | `public/brand/logo/` 里有同一 logo 的 SVG，4 KB |
| App 首页 12 张缩略图 JPG | 0.27 MB | **0.19 MB** | 只有手机才显示；电脑白下 |

即 **压缩后的 1.05 MB 里，字体 + 图片占 0.6 MB，代码只占 0.5 MB。**

### 3. 缓存

- Vercel：`cache-control: max-age=0, must-revalidate`，每次打开都要问服务器（ETag 命中就不重传），回访约 0.1–0.2 s 开销。
- GitHub Pages：`max-age=600`，10 分钟内回访直接用本地。
- 都是一个 HTML 文件：改任何一个字，整个 1.05 MB 重下。

### 4. 和加载无关但要说明

- `ready` 事件在 WebGL 创建时就发（1.6 s），比湖面真正出来早 2 s；统计“看到 3D”的时间要用第一帧，不要用 `ready`。
- 选视图后能立刻拖船（+40 ms），帧率 60，这段不是问题。

## 三、改法（11/2 前能做的在前）

### 改法 A：先给一个轻的封面，3D 在后面搭（11/2 前，1 天）

- **做什么：** HTML 里放一个纯 CSS 的封面（湖蓝底 + Accuphy 标 + “Loading the lake…” 细进度条），下载完就显示；
  3D 等封面画出来一帧后再挂载；地形/鱼/logo 分 3–4 帧搭，每帧不超过 100 ms；湖面第一帧画出来再淡出封面。
- **能快多少：** 真正的第一帧时间不变（约 3.7 s），但访客 **1.0 s 就看到东西、1.4 s 看到首页**，中间不再是白屏/冻屏。
  “感觉慢”主要来自冻屏，这一条解决感觉。
- **风险：** 低。封面只是 HTML/CSS；分帧搭场景要改 Scene.jsx 的 useMemo 顺序——Scene.jsx 现在冰钓聊天在改，**分帧那半等它空出来再做**，封面可先做。
- **改哪些文件：** `share/index.html`（封面）、`scripts/build-share.mjs`（把封面写进去）、`index.jsx`（第一帧后淡出）、之后 `Scene.jsx`（分帧）。

### 改法 B：把下载从 1.05 MB 减到约 0.5 MB（11/2 前，1 天）

- **做什么：**
  1. 字体子集化 + woff2：三个字体只留用到的字符（拉丁字母、数字、°×’→ 等），woff2 压缩。估计 0.31 MB → **0.05 MB**。
     斜体可以去掉，刻度数字用 CSS 假斜体（`font-synthesis`），看不出差别。
  2. logo 用现成 SVG（4 KB）代替 147 KB PNG：**−0.12 MB**。
  3. 12 张首页缩略图不内联，改成页面旁边的文件、首页显示时才下载（电脑永远不下）：**−0.19 MB**。
  4. 冰钓代码从夏季湖的包里拆出去（动态 import，只有冰钓页才下）：估计 **−0.03 MB** 压缩后，但少解析约 90 KB 源码。
- **能快多少：** 4G 下载 1.0 s → **约 0.5 s**；慢 3G 7.6 s → 约 3.5 s。首页也随之提前 0.5 s。
- **风险：** 低–中。字体子集要装 `fonttools`（本机没有，`pip install fonttools brotli` 即可）；缩略图改成外部文件后，页面不再是“一个文件”——
  Vercel 没问题，GitHub Pages 也没问题，只是 `docs/versions.md` 的“单文件”说法要更新；Shopify 框里也没影响。
- **改哪些文件：** `scripts/build-share.mjs`（字体内联、图片外置、logo）、`src/index.css`（@font-face 指向子集）、`public/brand/fonts/`（新子集文件）、
  `home/AppHome.jsx`（缩略图改 URL）、`vite.share.config.js`（`assetsInlineLimit`）。不碰 Scene.jsx。

### 改法 C：把 2.2 s 的冻屏本身砍掉（11/2 后，2–3 天，要真机复测）

- **做什么：**
  1. 地形高度表预先算好：161×161 的高度 + 法线算一次存成二进制（约 100 KB，压缩后 ~40 KB）随页面带上，打开时直接读，不再跑噪声循环：**−0.35 s（不限速）/ −1.4 s（4G 模拟）**。
     或者保留算法，但分帧算（和改法 A 的分帧一起）。
  2. 着色器：`renderer.debug.checkShaderErrors = false`（发布版），并在封面期间用 `renderer.compileAsync()` 预热 25–29 个程序，让 GPU 并行编译，
     不在第一帧前同步等。真机上这条可能省 0.5–1.5 s，模拟量不出来。
  3. logo 距离场贴图改成构建时生成的 PNG（R8，约 30 KB）。
- **能快多少：** 第一帧估计 3.7 s → **约 2.0 s**（4G/中档 CPU）；便宜安卓受益最大。
- **风险：** 中。地形表要和 `terrain.js` 的 `depthAt`（声呐引擎也用它算深度）保持一致，否则湖面和声呐画面对不上——所以表只替代**几何**，深度仍按函数算，或两边都读表；
  关闭 checkShaderErrors 后着色器出错不再报，开发版保留。要改 Scene.jsx（冰钓聊天的文件）和 lakeMaterial/logo，按 #94 夏季湖和冰钓页都要看。
- **改哪些文件：** `terrain.js`、`Scene.jsx`、`logo.js`、`scripts/`（预生成脚本）。

### 不建议

- 换托管（Vercel 和 GitHub 一样快）。
- 分包把 three.js 拆出去：three + R3F 压缩后约 0.2 MB，拆开只换来并行下载，手机上多一次连接反而不一定快。
- 降画质：帧率已经 60，和加载无关。

## 四、建议顺序

11/2 前：**B（减半下载）+ A 的封面**，合计约 2 天，第一帧 3.7 s → 约 3.2 s，但 1.0 s 就有画面、不再冻屏白屏。
11/2 后：**C** 把冻屏砍掉，到 2 s 左右；做完在 V10（便宜安卓）和 Jason 的 iPhone 上各量一次。

---

## English summary

Measured 2026-10-26 with headless Chrome 156 over CDP (390×844 @2x, iPhone UA, cache off; "4G" = 9 Mbps / 60 ms + 4× CPU
slowdown; "slow 3G" = 1.6 Mbps / 150 ms + 6×). Hooks timed the WebGL context, the first frame, the Home page, and long tasks.

- lab.accuphy.ca (Vercel, brotli 1 051 KB) and GitHub Pages (gzip 1 101 KB) are the same: HTML done ≈ 1.05 s on 4G, Home
  page at 1.45 s, WebGL at 1.6 s, **first 3D frame at 3.7–4.1 s**, with one **2.1–2.4 s main-thread freeze** while the scene
  builds. Slow 3G: 11.9 s to the first frame. Unthrottled Mac: 1.2 s. After the view pick the boat drags within 40 ms at 60 fps.
- The freeze (unthrottled ≈ 0.75 s of script): terrain height noise ≈ 0.35 s (`terrain.js` fbm over a 161×161 grid), three.js
  `checkShaderErrors` ≈ 0.09 s (synchronous link checks on 25–29 programs; on phones without parallel compile this is where
  the 2026-09-24 V10 freeze came from), the logo distance-field texture ≈ 0.03 s, the rest (fish, wreck, boat, FFT, React) ≈ 0.2 s.
- The 1.05 MB transfer: code 0.49 MB, three full fonts 0.31 MB, the logo PNG 0.12 MB, 12 Home thumbnails 0.19 MB.
- `ready` fires at WebGL creation, 2 s before the first frame — use the first frame for "saw the 3D".

Proposals: **A** a CSS cover shown at 1.0 s with the scene mounted after it (perceived; Scene.jsx frame-splitting waits for the
ice chat); **B** halve the download (font subsets as woff2, the SVG logo, thumbnails as lazy files, ice code split) → 4G
download 1.0 s → 0.5 s; **C** (after 11/2) precomputed terrain table, `checkShaderErrors` off + `compileAsync` warm-up behind
the cover, prebaked logo texture → first frame ≈ 2.0 s; re-measure on the V10 and Jason's iPhone. Not worth it: changing host,
splitting three.js into its own file, lowering quality.
