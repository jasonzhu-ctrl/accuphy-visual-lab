# 交接笔记：界面设计（ui-design），2026-10-31

由 Lab HQ 从旧窗口“手机网页端”的完整交接 `docs/handover/chats/mobile-web.md` 拆出（Jason 10-31 说“动”，规划 `docs/2026-10-31-split-page-window-plan.md`，决定 #196）。
旧笔记是底稿，本笔记写你的部分；遇到细节以旧笔记对应小节为准（下面标了 §）。
另一半归“营销和外部系统对接”：`docs/handover/chats/marketing-integration.md`。

## 1. 你管什么、不碰什么

**你的线 = 访客看到、点到的那层界面。** 面板、按钮、视图格、步骤卡、手机上的 App 首页、动画、logo 和字体、页面加载速度、打包页面。

只有你改的文件（都在 `src/experiments/2026-09-23-sonar-lake-3d/`，另写的除外）：
- `index.jsx` 的界面部分：面板、行、按钮、步骤卡、手机 dock、视图切换的样子。
- `ViewIcon.jsx`、`SonarFan.jsx`（选中格的小声纳）、`GlassLayer.jsx`（玻璃试验）。
- `home/AppHome.jsx`、`home/*.jpg`（手机 App 首页和缩略图）。
- `public/brand/`（logo 图片、字体）、`src/index.css`。（`logo.js` 是湖底那块立体 ACCUPHY 雕塑，归 Base。）
- `scripts/build-share.mjs`、`vite.share.config.js`（打包页面，跟加载速度有关）。
- `SonarChrome.jsx` 的按钮样子；刻度、range、深度逻辑归 Base。

**两边共用的文件：样子归你，行为归对接。** 改之前先发消息告诉对方和 HQ，提交后说“放开了”：
- `ShareButton.jsx`、`UnlockCard.jsx`、`ShopButton.jsx`、`AppBadges.jsx`。
- `index.jsx` 里发事件、锁视图、美国只出 Mini 的那几行，归对接。

**`i18n.js` 归对接：** 你要加或改访客看到的字，把英文给对接，由它写进去并找网站核法文。

**绝不碰：**
- 湖景和声纳（#176、#195，归“Lab 场景和声纳画面Base”）：`Scene.jsx`、`sonarShader.js`、`SonarScreen.jsx`、`lake*`、`terrain.js`、`fish*.js`、`ice*.js` 等。
- `embed.js`、`signup.js`（对接）。
- Shopify、lab.accuphy.ca、测试链接（HQ 做，上线要 Jason 在 Lab HQ 说“动”）。
- 广告片；孙英杰的分支（#183）。
- 夏天湖面和冰钓页共用代码（#94）：你的改动两个页面都要看。

## 2. 现在的状态（10-31）

- 线上 lab.accuphy.ca = 5c2e69a，不含 #191、#192、#193。测试链接 = 5764b06（含 #191、#192、#193）。见 `docs/versions.md`。
- `git push` 一次推两处（#194）。
- 你这条线做过并上线的：#180 加载提速 B（woff2 字体、SVG logo、缩略图外置，4G 下载 1122→624 KB）、#117/#118 手机版、#167 封面。

## 3. 进行中：#192 新电脑面板（测试版，没上线）（旧笔记 §3b）

- **Brief：** `docs/2026-10-30-panel-redesign-brief.md`。
- **标题：** logo 21 px + “LAB”，Eurostile Heavy 24 px 大写，用 Lab 自带的 woff2，不用 Adobe kit。
- **按钮：** 6 px 圆角，平的 #028CDF，Eurostile 大写，没有发光；面板和步骤卡 12 px 圆角。
- **视图格：**
  - 电脑上只留图标（`ViewIcon.jsx`），名字在下。PingLive 3 个、Mini 4 个、冰钓页 5 个。
  - 缩略图电脑上不再启动时加载；手机首页保留图片。
- **选中格的小声纳（`SonarFan.jsx`）：**
  - 普通 WebGL 片元着色器，从 Jason 10-31 说“可以”的 `/fx/` 原型移植。
  - 颜色取 `colormaps.js` 的 `accuphy_mid`，30 fps 封顶，整页只有一个 WebGL 画布。
  - 没有 WebGL 时退成纯橙色扇形；减少动态效果时是静止帧。
  - 批准的原文件：`~/Library/Application Support/Claude/side-session-notes/local_90665788-29de-4821-b1fc-3064b7fea5d2/2026-10-31-view-icon-effect-approved.html`。
- **Jason 否掉过的：** 蓝渐变和 ping（“太AI了”）、Paper Shaders 抖动（依赖已删干净）。
- **玻璃试验（`GlassLayer.jsx`）：**
  - 步骤卡的液态玻璃，默认关，`?glass=shu` 或 `?glass=rdev` 打开。
  - 两个都是 MIT 来源改写，声明在 `assets/LICENSES.md`。
  - `liquid-glass-js` 不用：它截不到 WebGL 湖面。
- **图：** `docs/2026-10-31-sonar-tiles.jpg`、`docs/2026-10-30-glass-trials.jpg`、`docs/2026-10-30-panel-redesign.jpg`。
- **上线配方：** 要 Jason 说“动”，HQ 打包上传。如果 #191 先上线，HQ 会从 c91bf7e 构建，不带 #192。

## 3b. 进行中：三步入场教程小样（A9，Jason 11-01 在 Lab HQ：“动，先做小样”）

- 代码在 `src/experiments/2026-11-01-tour-proto/`（`index.jsx` 包装页、`TourProto.jsx`、`tour.css`、`share/` 打包入口），**默认页面没改**：教程靠页面已有的 window 事件（`ready`、`view`）和面板按钮的 DOM 接上，锁面板是 `body.lab-tour` + 自己的 CSS。
- 本地地址：`http://localhost:5173/?lab_unlock=sub#2026-11-01-tour-proto`（Mini 脚本：Combo → Forward → Down；`&tour=pl` 是 PingLive 脚本：Down → Forward → Panoramic）。`lab_unlock=sub` 只因为 Combo 现在还在订阅锁后面（#191）；无锁基础版出来后不用。
- 打包：`VITE_LAB=tour VITE_DEVICES=PLM node scripts/build-share.mjs <out>`（`build-share.mjs` 和 `vite.share.config.js` 加了 tour 变体，其他变体不变）。
- 开发辅助：`?tourslow[=k]` 把停顿和淡入淡出放慢 k 倍（默认 4），截中间帧用；只在开发环境生效。
- 文字都是占位；手机版只做到够截图（选完视图后出，第 1 步点湖面，第 2、3 步按 Next，不换视图）；看过一次下次不弹还没做。
- 等 Jason 看小样（经 HQ）；HQ 核过后放到测试链接单独一页。

## 4. 等人

**等 Jason**（HQ 会放进他的卡片，你不要自己问他）：
1. 看 #192 测试版，玻璃选 off / shu / rdev（10-30）。
2. Ice Fishing 那格的小声纳太小、看不出纹理，接不接受（10-31）。
3. 11-02 前上不上线 #192（10-31）。

**补测（10-31 第 1 轮，结果在 HQ 共享笔记 `2026-10-31-ui-design-round1-report.md`）：**
- WebKit（Playwright，打包测试版 8139417）：电脑三种玻璃参数、冰钓页、手机都跑了，除冰钓步骤卡出屏外全过，0 报错；WebKit 里玻璃不生效、磨砂保留。
- Firefox：**没跑**。Playwright 的 Firefox 在这台 macOS 27.0.1 上起不来；HQ 10-31：先不测（广告访客很少用，Meta 内置浏览器是 WebKit 和 Chromium）。
- 还要真机才能测（等有人有设备）：真 Safari、真手机、弱电脑或弱显卡的玻璃和小声纳真实开销（现在只量过被垂直同步封顶的 60 fps）。
- 手机分享弹窗在 390×844 时离去商店胶囊约 15 px（截图实测，旧数据写的是约 6 px）。

**已知问题：**
- **#197 最终（Jason 10-31 在 Lab HQ：“写 39×19 / 78×19 / 135×20”）。排队：跟步骤卡测试版一起出，不能提前**：面板文字 Mini 39° × 19°；Mini 在 Combo 视图时 78° × 19°；PingLive 135° × 20°；冰钓页同 Mini。只改 `index.jsx:443` 的 beam 字符串，加一个按设备/视图的小查表（如 `const BEAM_TEXT = { PL: '135° × 20°', PLM: '39° × 19°', PLM_combo: '78° × 19°' }`），去掉 ICE 分支。`i18n.js` 不改（法文 “faisceau de 39° × 19°” 能读），`devices.js`（thickDeg 18）和引擎不动。见 `handoffs/2026-10-31-mini-beam-text-summer.md`；共用文件，改之前先通知对接和 HQ，提交后说“放开了”。之前的 18/20/不写厚度几版都作废。
- 冰钓页步骤卡叠在面板下面，屏幕高度低于约 890 px 时最后一张出屏（实测最后一张底边在 888 px；720 高时第 1 张就被切）。修法提议（三张卡缩成一行放右上角天空）已给 HQ，图 `2026-10-31-ice-step-cards-proposal.jpg`；Jason 说要之前不写代码。
- Mini Forward 的 1.0x 按钮（App 有，Lab 没有）：没做，要和 Base 商量，等 HQ 派。
- 加载提速 C（冻屏 2.6–2.9 s，地形噪声和着色器）归 Base，黑五后。
- 测试页 `fx/`：#192 上线并核过之后可以删，在那之前留着对照。

## 5. 窍门（旧笔记 §5b、§5c）

- **开发页：**
  - `preview_start lab`，端口 5173。
  - 手机检查用 `resize_window` mobile 预设（375×812）；手机上首页在前，先点“Forward View”格才出现去商店胶囊和分享。
  - 浏览器面板在隐藏标签页里 `requestAnimationFrame` 不跑，测动画要把标签页前置。
  - 软件渲染的无头 Chrome 起 3D 要 10 秒以上：等元素出现再点，别用固定延时。
- **加载测量**（脚本已没，方法在）：
  - 无头 Chrome + CDP，390×844 dpr 2，4G = 9 Mbps / 60 ms + CPU 慢 4×。
  - 量封面首次绘制、首页出现（`.ph-tile`）、湖面第一帧（rAF 钩子）。
  - 前后对比在 `docs/2026-10-26-lab-load-time.md` 第五节。
- **字体：** 本机没有 fonttools，用 venv：`python3 -m venv v && v/bin/pip install fonttools brotli`；`fonttools varLib.instancer` 把宽度轴固定 100，`pyftsubset --unicodes=… --flavor=woff2`。Unicode 范围见 #180。完整字体留在 `public/brand/fonts/`，给广告脚本用。
- **打包物：**
  - `dist-share/pages/index.html` + `pages/home/*.jpg`，整个 `pages/` 一起上传。
  - logo 在打包时把 PNG 路径换成 2 KB 的 SVG（`public/brand/logo/accuphy-white.svg`）。
  - 打包后跑一遍 `node scripts/dev/store-frame/run.mjs`（对接的测试），确认没弄坏店铺页的流程。
- **坑：** `.glass` / `.ac-card` 会强制 `position: relative`，要绝对定位的玻璃元素用 `ac-hint`。
- **提交：** 只用 `git commit -- <你的路径>`；提交前 `git status`；决定编号追加前重读 `docs/decisions.md` 末尾。

## 6. Jason 的偏好

- 中文、简短、一次一个问题；计划不是批准（“我没说动不要动”，09-24）；复杂了先问（“问我 问我 问我”，10-25）；问题用可点击卡片（10-30）。这些都经 HQ。
- **不要“太 AI”：**
  - 10-28：“要的，但是按钮徽章设计做的太ai了”，他选店铺风格：“方案一我推荐的，推 store 那些，你看一下是不是有必要，看看大公司怎么干的”。
  - 10-31：蓝渐变和 ping“太AI了”；你可以去找特别好的、能用的特效。
- **高级感、科技感第一**，不用画面去换字节或帧率（#50，记忆 visual-premium-tech-feel）。
- **视图格：** 10-31“只保留下半部分icon吧”，最后确认 Lab 声纳色 + Garmin 式纹理的缩小版：“可以”。纹理是我们自己写的，没用 Garmin 的画面。
- **手机菜单：** “noise reject这些功能不要加进去”，“把color map也去掉 这三个点的设置灰色按钮不让进”（约 10-26）。

## 7. 先读这些（按顺序）

1. `CLAUDE.md` 和 `~/.claude/CLAUDE.md`。
2. 本笔记，再看 `docs/handover/chats/mobile-web.md` 的 §3b、§5b、§5c。
3. `docs/backlog.md` 顶部状态栏。
4. `docs/decisions.md` #180、#190、#192、#195、#196。
5. `docs/2026-10-30-panel-redesign-brief.md`、`docs/2026-10-26-lab-load-time.md`。
6. 代码：`index.jsx`（界面部分）、`ViewIcon.jsx`、`SonarFan.jsx`、`GlassLayer.jsx`、`home/AppHome.jsx`。
7. 开 `preview_start lab`，电脑和手机各看一遍，带 `?glass=shu`、`?glass=rdev` 再看一遍。
