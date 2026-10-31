> **HQ, 10-31:** superseded by `ui-design.md` and `marketing-integration.md` (#196). Kept as the base; the 冰钓 id `local_2b04f455…` in it is retired.

# Handover: 手机网页端 (mobile-web) — 写于 2026-10-31，Lab HQ 的 “B 收+换新” 方案

写的人：旧 app 里的 “手机网页端” 窗口（session `local_b65bc15d-…`，我的记忆到 10-29 为止，之后由新 app 里的同名窗口接着做，那个窗口的记录是
`~/.claude/projects/-Users-jason-zhujishuaihotmail-com-Documents-WORK-ACCUPHY-IT-accuphy-visual-lab/59298660-0587-4e84-8721-d3a1ed9b27ea.jsonl`，
10-31 11:20 用量到上限停了）。本文件把两边合在一起，接手的新窗口只读它就能开工。HQ 确认换人之前，我仍是这条线的负责人。
Jason 的要求（10-31）：“不要掉东西 … 要丝滑不能卡不能掉”。

## 1. 这条线管什么、绝对不碰什么

**我的线 = 手机网页端和整个“外壳”：** 页面加载、封面、手机/电脑的按钮和面板、去商店、分享、App 徽章、订阅解锁、和商店页的桥（embed）、打包。
文件（都在 `src/experiments/2026-09-23-sonar-lake-3d/`，除非另写）：
`index.jsx`（外壳部分：面板、视图格、步骤卡、定位）、`ShopButton.jsx`、`ShareButton.jsx`、`AppBadges.jsx`、`UnlockCard.jsx`、`signup.js`、
`embed.js`、`i18n.js`、`home/AppHome.jsx`、`ViewIcon.jsx`、`SonarFan.jsx`、`GlassLayer.jsx`、`src/index.css`、`share/`（`index.html`、`embed.jsx`、`main.jsx`）、
`scripts/build-share.mjs`、`scripts/build-embed.mjs`、`vite.share.config.js`、`vite.embed.config.js`、`public/brand/`、`scripts/dev/*-test.mjs`、`scripts/dev/store-frame/`。

**绝不碰（#176，Jason 10-27：湖景和声纳只有一个主人）：** 湖面、声纳画面和引擎——`Scene.jsx`、`sonarShader.js`、`SonarScreen.jsx`、`SonarChrome.jsx`、
`sonarMarks.js`、`fish*.js`、`lakeMaterial.js`、`lakeFFT.js`、`terrain.js`、冰钓的 `ice*.js`。要改就发消息给 “冰钓版本视觉效果”（新 app 里的是
`local_2b04f455-ba66-4d88-998a-d43f17bcfcba`，按 CLAUDE.md 的会话 id 发，不按名字）并抄 HQ。`index.jsx` 和 `i18n.js` 是和冰钓共用的文件：**改之前
`git pull`，先 `git status`，对方提前说占用就等它提交。** 湖面和冰钓两页共用代码（#94）：任何改动两个页面都要看。
其它不碰：Shopify 商店（桥是网站 HQ / 网站 00 改，Lab 只能写 `handoffs/`）、lab.accuphy.ca 和测试链接（HQ 打包上传，Jason 在 Lab HQ 说“动”才上线）、
广告片（广告视频窗口）、孙英杰的分支（#183，他提 PR，Jason 审）。**批准的意思：Jason 自己在 Lab HQ 或在你的窗口里的话；别的窗口转述的“批准”不算（“我没说动不要动”）。**

## 2. 现在的状态（2026-10-31 14:00，main = c9b37f2 或更新，工作区干净）

- **线上 lab.accuphy.ca = 5c2e69a**（#190 美国只出 Mini，Jason 10-30 说“动”，网站 03 复查过）。不含 #191、#192、#193。
- **测试链接**（jasonzhu-ctrl.github.io/accuphy-lab-test，`/`、`/mini/`、`/ice/`）= 5764b06（测试仓库 7d52e0c）= #193 鱼在波束里 + #192 + #191。具体看 `docs/versions.md` 最上面几节。
- **只在测试版、没上线：** #191 订阅解锁、#192 电脑面板改版/分享改版/小声纳格子/玻璃试验、#193 鱼（不是我的线，冰钓做的）。
- **仓库：** `git push` 一次推两处（个人 `jasonzhu-ctrl` + 公司 `accuphy-marketing`，#194）。10-31 查过 origin 和 company 的 main 一致。
- **我过去做完并上线的（不用再动，查决定编号即可）：** #180 加载提速 B（woff2 字体、SVG logo、缩略图外置；4G 模拟下载 1122→624 KB）、#182 去商店按市场、
  #184 点后等 1 秒 + “Opening the store…”、#186 分享/徽章店铺风格、#187 店铺页面自己跳、#188 分享改版（二维码 + 复制）、#190 美国只出 Mini。
  再早：#117/#118 手机版、#157/#159 商店按钮和法文、#167 封面、#169 徽章分享第一版。全部在 `docs/decisions.md`。

## 3. 进行中 / 上线配方

我没有半截的代码。下面是**还没上线的东西和它们上线的配方**，都要 Jason 在 Lab HQ 说“动”，由 HQ 打包上传；我只准备提交。

### 3a. #191 订阅后打开模糊视图（订阅解锁）

- **是什么：** Jason 10-30：“把 live combo 给 blur 了吧 … 订阅以后可以全部给看”，后来加宽：“订阅就打开”。电脑和手机的 Live Combo（及手机 Home 上 Live Panoramic、
  Ice Fishing、Live Ice Fishing）模糊/带锁；点了出 `UnlockCard.jsx`（原来的 `SignupGate.jsx` 改的），填邮箱订阅，成功后打开，浏览器记住（localStorage `accuphy_sonar_signup_v1`）。
  门只有一个：`index.jsx` 里的 `pickView`；手机 Home 的锁是 `home/AppHome.jsx` 的 `isLocked`。Down Scan 和 Chirp 点了出说明（“需要船慢慢开，模拟环境暂时不 available”）。
  邮件链接 `?lab_unlock=sub` 直接解锁、不出卡、不发 `signup` 事件。冰钓格子跳冰钓页（`embed.js iceUrl`，带 `from=lake`）。详细：`docs/decisions.md` #191，调研 `docs/2026-10-30-unlock-with-subscribe.md`。
- **事件：** 成功发 `signup { source: 'combo' | 'unlock', product, view }`，**永远不带邮箱**。网站桥把它算成 Meta Lead / GA4 generate_lead（网站 HQ 10-30 结论，他们改主题）。
- **没有假成功：** `signup.js` 里 `KLAVIYO.listId` 现在是 `null`。在真实域名（accuphy.ca / accuphy.com / vercel.app / myshopify.com）卡片会拒绝（“Subscribing isn't open yet”），Combo 保持关；
  测试链接和 localhost 会解锁并显示 “Test mode: nothing is sent.”。
- **上线配方（HQ 已接受，10-31）：**
  1. #191 若要在 #192 之前上线：以 **c91bf7e** 为底（它是 #191 最后一个提交；之后 src 里只有 #192 和 #193 的文件，#191 文件里只有 `home/AppHome.jsx` 被碰过一次，615b6eb，多导出一个 `viewThumb`，不是修复。
     我在 c91bf7e 的干净检出上跑过 shop-url-test 26/26、share-url-test 16/16、signup-guard-test 全过）。
  2. 在它上面**新提交一次**，把 `signup.js` 的 `listId: null` 改成 `'W24Qdc'`（所以上线构建**不是** c91bf7e 原样，hash 会变；用新分支，别在 main 上改）。
  3. 如果 #192 先上线，就在 main 上直接做第 2 步。
  4. 先在测试链接看一遍：真订阅一次（用 Jason 给的测试邮箱）、`lab_unlock=sub` 链接、法文、手机。
  **Jason 明确说过：别填 list id、别翻测试模式——要等他的“动”。** 我 10-31 没填。
- **上线前还差（都没完成）：**
  - 法文：网站 HQ 核。网站交接单 `accuphy-website/handoffs/2026-10-30-lab-subscribe-unlock.md` 第 2 条（Lab 定稿英文 → 请核法文）**没有结果**。`i18n.js` 里卡片、s1、s2、s3_text_locked、not_available、na_moving
    的法文仍是草稿。我这边欠的一步：把定稿英文列成表发给网站 HQ（local_2f48043d-43bf-440c-ba78-2f53beaa0a5a）。
  - Klaviyo 文字：`unlock_consent`、`unlock_done` 是 Klaviyo HQ 起草的，Jason 没看过。同意文字不能乱改，`signup.js` 顶部 `CONSENT = 'SUBSCRIBED'` 是硬编码。
  - 真机：V10 平板没插电脑；iPhone Safari 要 Jason 手机看。
  - Klaviyo 在店铺页的 20 秒留邮箱框 **VpD3CV**：上线时要关（HQ 5d5a425 记了），归 Klaviyo HQ，我没法验证。
  - 上线当天告诉网站 HQ，网站 03 再测真实弹窗（桥 #233 已核 9a182111，真实流程没走过）。
- **图：** `docs/2026-10-30-unlock-design.jpg`、`docs/2026-10-30-combo-unlock.jpg`。

### 3b. #192 电脑面板改版（测试版，Jason 10-30 的 brief：`docs/2026-10-30-panel-redesign-brief.md`）

- **标题：** logo 21 px + “LAB”，Eurostile Heavy 24 px 大写（Lab 自带的 woff2，不用 Adobe kit）。**按钮：** 6 px 圆角、平的 #028CDF “Shop”、Eurostile 大写，没有发光；面板和步骤卡 12 px 圆角。
- **视图格：** 电脑上只留图标（`ViewIcon.jsx`），名字在下；PingLive 3 个、Mini 4 个、冰钓页 5 个；锁、卡、`pickView`、`aria-pressed`、aria 标签都保留。缩略图电脑上不再启动时加载（分享弹窗和订阅卡打开时才加载）；手机 Home 保留图片。
  选中的格子是**小声纳动画**（`SonarFan.jsx`，一段普通 WebGL 片元着色器，Jason 10-31 “可以”批准的 `/fx/` 原型移植来的；颜色取 `colormaps.js` 的 `accuphy_mid`；30 fps 封顶；整页同时只有一个 WebGL 画布；
  无 WebGL 退成纯橙色扇形，减少动态效果时是静止帧）。Jason 之前否掉过蓝渐变/ping（“太AI了”）和 Paper Shaders 抖动（已从依赖里删干净）。图：`docs/2026-10-31-sonar-tiles.jpg`。
- **玻璃试验（`GlassLayer.jsx`）：** 步骤卡上的液态玻璃效果，**默认关**，URL 加 `?glass=shu` 或 `?glass=rdev` 打开（两个都是 MIT 来源改写，没装包，声明在 `assets/LICENSES.md`；`dashersw/liquid-glass-js` 不用：它用 html2canvas 截图，截不到 WebGL 湖面）。
  Jason 还没选（backlog ⓪b）。图：`docs/2026-10-30-glass-trials.jpg`。
- **“Send to a fishing buddy”（电脑面板的分享按钮，Jason 选的措辞；手机还是 “Share”）：** 弹窗顶上多一张预览卡（当前视图缩略图 + 一句话），下面是原来的二维码 + Copy link。预览卡里那一句英文只是草稿
  （“Show a buddy what's under the boat” / “Drag the boat. Watch the sonar light up.”），**要 Jason 选**；法文要等网站核，现在法文不显示这句。分享**不解锁任何东西**（解锁只靠订阅），不发 `lab_unlock`。
- **没测过的（诚实清单）：** 弱电脑（玻璃试验在这台 Mac 的无头 Chromium 量到 60 fps，被垂直同步封顶，真实开销没量）、Firefox（没跑）、真 Safari（只跑过 Playwright WebKit 的 `?glass=rdev`：0 张玻璃卡、磨砂保留、0 报错）、
  真手机（手机分享弹窗在 390×844 离去商店胶囊约 6 px，很紧）、选中格 WebGL 小声纳在弱显卡上的表现。已知：冰钓页步骤卡叠在面板下面，电脑高度低于约 860 px 时最后一张会出屏。
  **最弱的一格：Ice Fishing 的小声纳（扇形很小，看不出纹理）**，双胞胎标过，要 Jason 决定接不接受。

## 4. 等人（精确的问题 / 起始 / 在哪问的）

等 Jason（HQ 会放进他的卡片列表；问题一律用可点击卡片，记忆 `questions-as-cards`）：
1. 看 #191、#192 测试版并选玻璃 off / shu / rdev · 10-30 · backlog ⓪b。
2. “Send to a fishing buddy” 预览卡的两句英文草稿选哪句 · 10-30 · 双胞胎的 9869b3f 回报。
3. Ice Fishing 小声纳格子要不要接受 · 10-31。
4. 11-02 开投前 #191 / #192 / #193 哪些上线、从哪个提交构建（#191 先上线用 c91bf7e + W24Qdc）· 10-31。
5. #191 的 Klaviyo 文字（`unlock_consent`、`unlock_done`）他没看过 · 10-30。
6. 追踪：CAPI 选 A/B/C、app_badge / UTM / identify（`accuphy-website/docs/2026-10-30-lab-tracking-check.md`，网站 HQ 牵头）· 10-30。
7. 玻璃之外的杂项：确认提醒方式、版本管理方案、LiveScope 7 问（都在 backlog，不急）。

等别的窗口：网站 HQ → #191 法文（上面）和 #228 第 4 条德/荷/波兰/拉脱维亚界面（不急，波/拉谁来核总管在问 Jason，先别用机器翻译）；Klaviyo HQ → 文字 + 关 VpD3CV；
网站 HQ + 00 → 桥（`sections/lab-embed.liquid`）改动；HQ → 打包、上传、更新 `docs/versions.md`。

## 5. 笔记里没有的本事（代码和决定记录里查不到的）

### 5a. 和店铺页的桥（`embed.js`，这块最容易出错）
- 事件名 `accuphy:lab`：店内主题挂载时走 `Shopify.analytics.publish('accuphy:lab', { event, ...data })`；在 iframe 里走 `window.parent.postMessage({ source: 'accuphy-lab', event, data }, '*')`；两种都另发 `window` 的 CustomEvent `accuphy-lab`。
  事件：`ready`、`first_drag`、`view {view, product, source}`、`signup`、`shop_click {product, placement, lang, url}`、`share {channel, market}`、`app_badge {store}`。**不要加 `device` 字段**（网站拿它当 phone/desktop）。数据里**永远没有个人信息**。
- 店铺参数：iframe 网址上的 `?shop=`（市场根路径 `/`、`/fr`、`/en-us`、`/de-de`、`/fr-benelux`、`/en-pl`、`/en-ro`，匹配 `^/([a-z]{2}(-[a-z]{2,})?)?$`）、`?market=`（国家码）、`?lang=`；主题挂载时是挂载元素的 `data-shop` / `data-market` / `data-lang`（`share/embed.jsx` → `setEmbedOptions`）。
  `shopRoot()` 解析；`storeOrigin()` 在 iframe 里取 `ancestorOrigins[0]` → referrer → `https://shop.accuphy.com`，主题挂载取 `window.location.origin`。
- 去商店 `openShop()`（#184 + #187）：发 `shop_click`（带 `url`）→ iframe 里最多等 400 ms 回执 `{ type: 'shop_click_ack' }`（只认 `e.source === window.parent` 且 `e.origin === storeOrigin()`）→ 有回执就不自己跳（店铺页面自己跳，约 1 秒后）→ 没回执 1000 ms 后 Lab 自己跳 `window.top`。按钮显示 “Opening the store…”，期间再点无效，`pageshow persisted` 复位。
  独立打开（lab.accuphy.ca）带访客的 utm 或默认 `utm_source=accuphy_lab&utm_medium=referral&utm_campaign=bf2026_lab_ca`；**店里不加 utm**（会盖掉广告来源）。理由：1 秒是因为 GA4 的 gtag 攒事件 ~5 秒，离开页面才补发，150 ms 跳会丢 `lab_shop_click`（网站 00 实测）。
- 市场规则：`/` 和 `/fr` → `ca`；`/en-us` → `us`；`/fr-fr` → `fr`；`/*-benelux` → `be`；`/de-de` → `de`；`/en-pl` → `pl`；`/en-ro`、`/ro-ro` → `ro`；缺省 `ca`；桥传的 `market` 优先。美国（店里 + market us）只出 Mini：`miniOnly()`。
- 分享链接 `shareUrl(medium)`：`https://shop.accuphy.com<root>/pages/lab?utm_source=lab_share&utm_medium=referral&utm_content=<qr|copy>&utm_campaign=bf2026_lab_<market>`（**没有 `ref=share`**，已去掉；渠道放 `utm_content` 因为 GA4 把未知 medium 归“未分配”）。
  分享弹窗：二维码 168 CSS px（SVG，页面内 `qrcode-generator` 生成，MIT，纠错 M，四模块留白）+ 只读链接 + Copy link；不调 `navigator.share`，没有 WhatsApp/短信（Jason 10-29：“手机也用二维码和copy”）；
  复制三级退路：`clipboard.writeText` → `execCommand('copy')` → 文字保持选中 + “Press ⌘C”（从不用 `window.prompt`）。手机弹窗通过 portal 挂到 `<body>`（在有 transform 的手机 dock 里 `position: fixed` 会错位）。
  网站要给 iframe 加 `allow="clipboard-write; web-share"`（随 #229 的桥上线）。
- App 徽章：官方图原样，≥40 px，谷歌 PNG 已裁掉透明边（不裁会显得比苹果小）；链接 App Store id6743123048、Play `com.accuphy.sonar`（带 `referrer=utm_source=accuphy-lab…`）；App Store 的 campaign 参数要 provider token，截至 10-29 Jason 还没给（HQ 在问他）。

### 5b. 测试（在仓库里，能跑）
- 单元（10-31 在当前 main 上跑过，全过）：`node scripts/dev/shop-url-test.mjs`（26 条：去商店地址、市场、miniOnly）、`node scripts/dev/share-url-test.mjs`（16 条：每个市场的分享链接，二维码用 jsQR 解回来必须一字不差，1–3 px/模块三档都要能解）、
  `node scripts/dev/signup-guard-test.mjs`（订阅守卫：真实域名拒绝、测试域名解锁、`lab_unlock=sub`）。几秒钟，纯 node。改 `embed.js` / `signup.js` 必跑。
- 打包页 + 假店铺页（今天重写的，我旧的 scratchpad 脚本 10-31 已经没了）：`node scripts/build-share.mjs && node scripts/dev/store-frame/run.mjs`，细节见 `scripts/dev/store-frame/README.md`。
  6 个场景（回执 / 无回执 / 来源不对 / 类型不对 / 电脑分享弹窗 / 手机分享弹窗）**今天对当前 main 全 PASS**（无回执时点后 1018–1022 ms 才发商品页请求）。
  已知局限：假店铺页和 Lab 同源，所以“错 origin 的回执”造不出来，源头检查盖住了兄弟框的情形；Chrome 路径写死 macOS，可用环境变量 `CHROME` 覆盖。
- 开发页检查：`preview_start lab`（`.claude/launch.json`，端口 5173），`resize_window` 用 mobile 预设（375×812）。手机上 Home 在前：先点 “Forward View” 格才会出现去商店胶囊和分享。
  测 Meta 一定要用普通 Chrome 的 UA（无头 UA 里的 HeadlessChrome，Meta 像素一个请求都不发）。
- 加载测量（脚本已没，方法在）：无头 Chrome + CDP，手机 390×844 dpr 2，4G = 下载 9 Mbps / 延迟 60 ms + CPU 慢 4×；量封面首次绘制、首页出现（`.ph-tile`）、湖面第一帧（rAF 钩子）。前后对比结果在 `docs/2026-10-26-lab-load-time.md` 第五节；
  冻屏 2.6–2.9 s（地形噪声、着色器同步检查）是“改法 C”，归湖景（Scene.jsx），11-02 后。
- 字体：本机没有 fonttools，用 venv：`python3 -m venv v && v/bin/pip install fonttools brotli`，`fonttools varLib.instancer` 把宽度轴固定 100，`pyftsubset --unicodes=… --flavor=woff2`。Unicode 范围见 #180。完整字体留在 `public/brand/fonts/` 给广告脚本用。
- 打包物：`dist-share/pages/index.html` + `pages/home/*.jpg`（缩略图是旁边的文件，**整个 pages/ 一起上传**）+ `vercel.json`；`accuphy-lab.html`（单文件）只给私人预览。`build-embed.mjs` 出 `embed/lab-<hash>.js`。logo 在打包时把 PNG 路径替换成 2 KB 的 SVG（`public/brand/logo/accuphy-white.svg`）。

### 5c. 坑
- `.glass` / `.ac-card` 会强制 `position: relative`：要绝对定位的玻璃元素用 `ac-hint`。
- R3F 的 uniforms 会被复制（见 CLAUDE.md）——但那是湖面的事，你不碰。
- 浏览器面板在隐藏标签页里 `requestAnimationFrame` 不跑，测动画要把标签页前置。
- 软件渲染的无头 Chrome 起 3D 很慢（10 秒以上）；等元素出现再点，别用固定延时。
- 提交：只用 `git commit -- <你的路径>`；别 `git add -A`；提交前 `git status`；决定编号在追加前重读 `docs/decisions.md` 末尾，`git fetch` 后提交前再核一次（多个窗口撞过 #69、#102）。
- 窗口间消息会被限流（“Paused until your user's next message”）：这时把回报写进 `docs/backlog.md` 状态栏下面，提交推送，HQ 会去读。
- 文字改动：英法两边都在 `i18n.js`；法文必须由网站 HQ 核（词表 `accuphy-website/docs/glossary.csv`；店铺风格：商店用不定式 “Télécharger…”、`Partager` 通用）；起草的句子要在注释里标“待核”，核过再去掉标记。弯引号 `’`。

## 6. Jason 的偏好（引他的话 + 日期）

- 语言/方式：中文、简短、一次一个问题；Claude 做 git 和终端；**不给他要记的步骤**（2026-09-24 “我记不住这么多 你要记住”）；计划不是批准（“我没说动不要动 … 提醒我以防万一我忘记”，2026-09-24）；
  复杂了先问他（2026-10-25 “问我 问我 问我”）；问题用可点击卡片（2026-10-30）。
- 设计：**不要“太 AI”**——玻璃胶囊/渐变/发光被他否：2026-10-28 “要的，但是按钮徽章设计做的太ai了”；他选店铺风格：“方案一我推荐的，推 store 那些，你看一下是不是有必要，看看大公司怎么干的”；
  2026-10-31 否掉蓝渐变和 ping（“太AI了”）。高级感/科技感优先，不用画面换字节或帧率（记忆 `visual-premium-tech-feel`，决定 #50）。
- 手机菜单（约 2026-10-26，具体日期我没记）：“noise reject这些功能不要加进去”，又 “把color map也去掉 这三个点的设置灰色按钮不让进”。
- 分享（2026-10-29）：“开搞 要做到丝滑 顺畅 无误 的”；“手机也用二维码和copy”（不要系统分享）。电脑上 macOS 分享面板（AirDrop、备忘录）他觉得不对。
- 修复授权：去商店跳错市场（2026-10-28 对网站 HQ：“修复”），店铺页自己跳（2026-10-29 对网站 HQ：“好的”）。
- 加载提速（2026-10-27 对 HQ：“没问题”）。
- 订阅解锁（2026-10-30）：“把live combo给blur了吧 电脑手机各个版本你要想一想 订阅以后可以全部给看 …”；后来 “订阅就打开”；效果 “可以”（2026-10-31，批准 `/fx/` 原型）。
- 每家公司只看自己的价格（2026-10-28，合作伙伴门户）——这个 Lab 里没有价格，但别把任何公司的价目放进 Lab。
- 杭州（Eric 他们）是合作方，不要主动联系（2026-10-26）。

## 7. 先读这些（按顺序）

1. `CLAUDE.md`（仓库根）和 `~/.claude/CLAUDE.md`——规矩、窗口名单、#176、#183、#194。
2. `docs/handover/2026-10-31-recovery/00-verified-status.md`（HQ 核过的状态）。
3. `docs/backlog.md` 顶上五行状态栏 + 状态栏下面各窗口的回报。
4. `docs/decisions.md` #180–#194（我的线是 #180、#182、#184、#186–#188、#190–#192；#189、#193 是冰钓的）。
5. `docs/versions.md`（线上和测试链接各是哪个提交；#191 上线前提）。
6. `src/experiments/2026-09-23-sonar-lake-3d/embed.js`、`signup.js`、`ShareButton.jsx`、`UnlockCard.jsx`（桥、订阅、分享、解锁——全文读，注释就是规格）。
7. `docs/2026-10-30-unlock-with-subscribe.md` 和 `docs/2026-10-30-panel-redesign-brief.md`。
8. 网站交接单：`handoffs/2026-10-29-lab-shop-nav-by-store.md`、`handoffs/2026-10-30-us-mini-only.md`、`accuphy-website/handoffs/2026-10-30-lab-subscribe-unlock.md`、`accuphy-website/docs/2026-10-30-lab-tracking-check.md`。
9. `scripts/dev/store-frame/README.md`，然后跑一遍 `node scripts/dev/*-test.mjs`，确认你的环境是好的。

## 测试页 pr30/、pr31/、fx/（测试仓库 jasonzhu-ctrl/accuphy-lab-test 里的子页面）

三个现在都能打开（10-31 查过，HTTP 200）。仓库代码不依赖它们（`SonarFan.jsx` 顶上只在注释里提到 `/fx/`）。
- `pr30/`、`pr31/`：孙英杰 PR #30、#31 的试跑页，**只作参考、不合并**（Jason 10-30：“不要拉进主线”）；backlog 写的是 Jason 看完就删。看完之前留着。
- `fx/`：Jason 批准的小声纳效果原型，代码已移植进 `SonarFan.jsx`；批准的原文件 HQ 另存了一份（`~/Library/Application Support/Claude/side-session-notes/local_90665788-29de-4821-b1fc-3064b7fea5d2/2026-10-31-view-icon-effect-approved.html`）。
  上线并核过之后可以删；在那之前留着对照。**都别自己删**——HQ 说留着。
