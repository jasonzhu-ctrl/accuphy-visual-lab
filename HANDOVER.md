# HANDOVER — Accuphy Visual Lab / 冰钓版本视觉效果（2026-10-29 写给接手的新 AI）

> 本文件是给**下一个接手这个项目的 AI** 看的，也是给 Jason 复制粘贴用的开场白。
> 写它的时候：仓库 HEAD = `be9b66e`，决策日志到 **#189**，backlog 更新到 **10-29**。

---

## 0. 给新 AI 的开场白（Jason 直接复制下面这段发给你就行）

```
你接手 Accuphy Visual Lab 的「冰钓版本视觉效果」（ice-fishing page）项目。

仓库：accuphy-marketing/accuphy-visual-lab（公司 GitHub 组织，私有）
     旧地址 jasonzhu-ctrl/accuphy-visual-lab 仍会自动跳转，也能 clone / push。
     （如果改成推到 Jason 个人账号 jasonzhu-ctrl/accuphy-visual-lab，地址以你看到的为准。）
公开成品与测试链接仓库：jasonzhu-ctrl/accuphy-lab-test（公开，GitHub Pages）
     https://jasonzhu-ctrl.github.io/accuphy-lab-test/ice/   ← 冰钓页

开工前按顺序读这几份，别跳：
1. CLAUDE.md            项目规则、边界、技术栈
2. docs/decisions.md    所有设计/工具决策的编号日志（已到 #189）
3. docs/backlog.md      当前状态（顶部有状态块），以及手上还开着的活
4. handoffs/            别的项目交过来的单子（文件格式照抄最新的那份）

工作规矩（Jason 定的，别改）：
- 用中文回答，简短具体，一次只问一个问题；有多个选项就列出来让他挑。
- 方案不等于批准。动手/上线前必须等 Jason 说「动」「开始做」「可以做了」。
- 任何新决定都要写回 docs/decisions.md，状态要更新到 docs/backlog.md 顶部。
- 这个仓库只做设计原型，不碰 shop.accuphy.com。凡是要真正上站面的东西，
  写成交接单放进 accuphy-website/handoffs/，交出去就停，别自己去改主题。
- 改冰钓页的代码入口：src/experiments/2026-09-23-sonar-lake-3d/ 里的
  iceScene.js / iceSheet.js / iceProps.js / IceCamp.jsx / snow.js / iceSky.js。
  src/experiments/2026-10-16-sonar-ice-3d/index.jsx 只是一行壳。

先告诉我：你打算先看哪一块，或者 Jason 这次要你做什么。
```

---

## 1. 这个项目是什么

`accuphy-visual-lab` 是 **accuphy.ca 网站的视觉实验室**：为正式站做设计实验和原型
（版式、字体、颜色、动效、组件想法）。

**它不是** RMA 门户，**也不是** 经销商门户。仓库里的东西不发布到 partner.accuphy.ca，
那两个项目的代码也不许拷进来。

边界写在 CLAUDE.md 的「decision #69」：

- Lab 只做设计稿和原型，**永不碰 Shopify 店铺**。
- 任何要落到 shop.accuphy.com 的东西（板块、页面、表单、像素、埋点、文案、翻译），
  都写成交接单丢进 `accuphy-website/handoffs/`，然后**停**——由网站项目去进主题、
  翻译、量尺寸、发布。
- 正式站的事实（市场、工具、重量、流量）在 `accuphy-website/docs/site-audit.md`；
  产品规格只在 `accuphy-website/docs/specs.md`。**不要在本仓库留副本。**

## 2. 仓库与权限（2026-10-29 核实）

| 仓库 | 位置 | 谁能动 |
|---|---|---|
| `accuphy-visual-lab`（源码母仓，私有） | `accuphy-marketing/accuphy-visual-lab` | Jason（组织 Owner）、同事 AJ-nb（Write） |
| `accuphy-lab-test`（成品/测试链接，公开） | `jasonzhu-ctrl/accuphy-lab-test` | Jason |

背景：Jason 2026-10-27 说「这个项目要连到公司组织里，我需要同事也能基于我的代码去改」，
10-28 由 IT & HR 完成了转移。**转移后旧地址自动跳转，`git push` 照常**，没坏过任何东西。
交接单在 `handoffs/2026-10-28-repo-moved-to-org.md`。

> 待 Jason 确认：新 AI 到底接哪一份。名字 `accuphy-visual-lab` 在 `jasonzhu-ctrl` 名下
> **目前是空的**，可以新建同名私有仓把源码镜像过去（会变成两份，需要同步纪律）；
> 或者直接接组织仓那一份（单一来源，没有分叉风险）。

本机工作副本：`~/Documents/WORK/ACCUPHY/IT/accuphy-visual-lab`
（remote 还指着旧地址 `jasonzhu-ctrl/accuphy-visual-lab`，靠跳转工作；Jason 10-28 说「先不改」。
要改成新地址就一条命令：`git remote set-url origin git@github.com:accuphy-marketing/accuphy-visual-lab.git`）

## 3. 技术栈与目录

**Vite 8 + React 19 + Tailwind CSS 4 + Framer Motion 13 + three / @react-three-fiber 9**。
纯 JavaScript/JSX，**不用 TypeScript**。纯前端，没有后端、没有数据库。
需要更重的库（GSAP、Three.js 之类）可以在单个实验里加，但要先记进 `docs/decisions.md`。

```
src/experiments/<yyyy-mm-dd>-<slug>/index.jsx   一个实验一个文件夹，自动发现并列进 gallery 页
src/App.jsx                                      gallery + hash 路由（#<文件夹名>）
src/experiments.js                               实验发现逻辑
docs/decisions.md                                决策编号日志（已到 #189）
docs/backlog.md                                  当前状态与手上的活
docs/lake-canon.md                               湖景标准版清单（decision #176）
docs/research.md                                 工具与做法调研
reference/                                       录屏与产品图（设计输入）
handoffs/                                        交接单，文件名 YYYY-MM-DD-<topic>.md
```

常用命令：

```bash
npm run dev                 # http://localhost:5173，热更新
npm run build               # dist/ 静态产物
node scripts/build-share.mjs [outDir]   # 打包分享版，默认输出 dist-share/
node scripts/build-embed.mjs            # 打包店铺内嵌版
```

**分享版变体由环境变量决定**（`scripts/build-share.mjs`）：

- `VITE_SCENE=ice` → 只出冰钓页
- `VITE_DEVICES=PLM` → 只出 Mini 页
- `VITE_LAB=fish` → 只出湖景页
- 都不设 → PingLive + Mini 都要

产物在 `dist-share/pages/`（`index.html` + `home/` 缩略图 + `robots.txt` + `vercel.json`），
另有一份单文件 `dist-share/accuphy-lab.html`。

## 4. 冰钓页代码在哪

`src/experiments/2026-10-16-sonar-ice-3d/index.jsx` **只是一行壳**（decision #94），
真正打开的是声呐湖的 `scene="ice"`。冰钓相关代码全在湖景文件夹里：

```
src/experiments/2026-09-23-sonar-lake-3d/
  iceScene.js     冰面场景
  iceSheet.js     冰层/冰面网格
  iceProps.js     冰钓场景参数
  IceCamp.jsx     冰钓营地（UI）
  snow.js         雪
  iceSky.js       冰天
```

**湖景和冰钓页共用同一套代码**——改湖景会同时改到冰钓页，两边都要 QA（#94 的规矩）。
本地调试开关：`?time=dusk|day|night`、`?look=snow|mixed|glass`、`?icelut=amber`。

## 5. 发布链路（源码 → 测试链接 → 正式站）

```
改 visual-lab 源码
   ↓ HQ（Lab 聊天）跑打包脚本
dist-share/pages/  （冰钓页 = VITE_SCENE=ice）
   ↓ HQ 拷进 accuphy-lab-test 仓的对应目录（/ 、/mini/ 、/ice/ 、/pano/ ）并提交
GitHub Pages 自动发布
   ↓
https://jasonzhu-ctrl.github.io/accuphy-lab-test/ice/
   ↓ Jason 说「动」→ HQ 上传
lab.accuphy.ca（正式站）
```

关键点：

- **测试链接仓库 `accuphy-lab-test` 在 Jason 个人账号，公开**。
  提交信息长这样：`Rebuild /, /mini/, /ice/ from lab <源码commit> (<说明>, #编号>)`。
  改源码 → **必须由 HQ 重打包并提交一次**，否则测试链接还是旧版。
- 正式站 `lab.accuphy.ca` 的更新要 Jason 说「动」。
- **不要搬 `accuphy-lab-test`**：搬了公开链接就变。
- 店铺内嵌版走 `scripts/build-embed.mjs`，产物形如 `lab-9ccdf42625.js`（#187）。

## 6. Jason 的规矩（所有项目通用）

- 用**中文**回答，简短具体，**一次只问一个问题**；多个选项时列出来让他挑，别抛长清单。
- **方案不等于批准。** 动手、上线、发布之前，必须等到 Jason 说「动」「开始做」「可以做了」。
  别的聊天代转的「可以」不算。
- 复杂或不确定就停下来，用大白话问他，并给出你的推荐。
- 任何决定写回 `docs/decisions.md`（编号续上），状态更新到 `docs/backlog.md` 顶部。
- 改代码前先 `git pull`；提交时**只 add 自己改的文件（按文件名）**，别把别人的半成品一起提。
- 同事 AJ-nb 会在这个仓库建分支、提 PR。**他的改动不要自己合进 main**，看了再说。
- 仓库里有 `.claude/skills/`（如 `ad-video`）和 `.claude/worktrees/`，别删。

## 7. 交接单格式（`handoffs/` 里的文件）

照抄这个结构（新文件用 `YYYY-MM-DD-<topic>.md`）：

```markdown
状态：OPEN
From：<哪个项目>   To：<哪个项目>   创建：YYYY-MM-DD   期限：（有就写）

# 标题

## 背景和 Jason 批准了什么
## 约定
## 不要做
## 完成标准
## 证据

结果：
- YYYY-MM-DD <谁>：做了什么、怎么验的
```

## 8. 当前做到哪（截至 2026-10-29）

**已上线 / 已完成**

- **#189 PingLive Mini Combo 两条 range 独立**（`a1fd3ee`，Jason 10-29 提的）：
  Forward range 和 Down range 分别可调，互不影响。电脑端是两条滑杆
  （「Forward range」「Down range」，取代原来灰掉的「AUTO · follows the water」），
  手机端每个半屏底下各有 −/+（Down 在左下、Forward 在右下）。
  图：`docs/2026-10-29-plm-combo-two-ranges.jpg`。**冰钓页也已核过。**
- **#187 「去商店」改由店铺页面跳转**（决定 #187，`embed.js openShop`）：
  Lab 发 `shop_click` 时多带一个 `url` 字段；框里最多等 400 ms 回执，
  收到 `{ type: 'shop_click_ack' }` 就不自己跳，没收到照旧 1 秒后自己跳。
  只认 `window.parent` 且 origin 是店铺来源的回执。桥由网站项目先上。
- **#188 手机也有二维码 + 复制弹窗**（`dfeef9f`）：手机 Share 打开和电脑一样的弹窗
  （二维码 + 链接 + Copy），居中、不压商店胶囊和徽章；系统分享和 WhatsApp/短信已去掉。
  图：`docs/2026-10-29-share-popover-phone.jpg`。
- **#173 / #177 鱼群密度与远处鱼闪烁**：远鱼沿声波方向拉长到中间大小，闪烁大幅减少；
  鱼群密度经 3 轮调整后 Jason 说「可以」。
- **#176 湖景统一成一个版本**：标准版清单 `docs/lake-canon.md`；全景换成新画法。
- **#180 加载提速 B 第 1–3 项**：下载 1122 → 624 KB，首页 1.47 → 0.90 s。
- **#181 Mini Forward 不显示大深度数字**（`9ed9341`）。

**状态待 Jason 一句话**：`lab.accuphy.ca` 正式站要等 Jason 说「动」才会带上分享改版一起更新。
（截至 10-29，测试链接已从 `a1fd3ee` 重打包 → `84e65df` / `be9b66e`，四页都打开过、0 报错。）

**手上还开着的**

- Mini Forward 右侧的 **1.0x 放大按钮**（#181 附注）**没做**：手机版 FORWARD −/+ 和面板斜线
  撞在一起，线穿过了 − 圈。
- Combo 右上角的 **ACCUPHY 字标**：Jason 在冰钓聊天直接给过意见（镜头拉远看全覆盖、
  别被手机挡、字太小），第 2 轮定格已改好、HQ 核过。
- **同事 AJ-nb 的两个分支 / PR（#30、#31）没合并**，Sonar 逻辑各链接都是最新的。
- **真机测试没做**：V10 平板测帧率（平板没插）、iPhone 看一眼半精度浮点渲染。
- `docs/backlog.md` 顶部状态块里还挂着「等 Jason」的几条：全景手机对比、船迹圆形水纹
  （#156 替换 #166 Kelvin，等他说开始）、加载提速 B/C 怎么排、App Store provider token、
  Klaviyo 框挪左下角、#153 新鱼正式页画法、#154 Forward AUTO 深度留不留。

## 9. 别做的事

- **别把 `accuphy-lab-test` 搬到别的账号**——公开链接会变。
- **别直接改 Shopify 店铺**，要上站面的东西写交接单给 `accuphy-website`。
- **别自己合 main 上的同事 PR**。
- **别动 `/pano/`**（全景已定，等 Jason 手机对比）。
- **别在网站后台改东西**，那是 `accuphy-new-market-rollout` 和 `accuphy-website` 的活。
- **别把视频/音频进 git**（只在 `accuphy-product-faq-training` 有这条规矩，但本仓库同理：
  素材放本地和 Drive）。

## 10. 相关项目在哪（跨项目找东西时）

| 项目 | 本机路径 | GitHub |
|---|---|---|
| Website（Shopify 正式站） | `~/Documents/WORK/ACCUPHY/IT/accuphy-website` | `jasonzhu-ctrl/accuphy-website` |
| Klaviyo（邮件） | `~/Documents/WORK/ACCUPHY/IT/Marketing/Klaviyo` | `jasonzhu-ctrl/accuphy-klaviyo` |
| IT & HR | `~/Documents/WORK/ACCUPHY/IT/accuphy-it-hr` | `jasonzhu-ctrl/accuphy-it-hr` |
| CHIEF（总管） | `~/Documents/WORK/ACCUPHY/IT/CHIEF Agent` | `jasonzhu-ctrl/accuphy-chief-agent` |
| Pro-Staff Portal | `~/Documents/WORK/ACCUPHY/IT/Pro-Staff Portal` | `jasonzhu-ctrl/accuphy-prostaff-portal` |
| New Market Roll-out | `~/Documents/WORK/ACCUPHY/IT/New Market Roll-out` | `jasonzhu-ctrl/accuphy-new-market-rollout` |
| Product FAQ & Training | `~/Documents/WORK/ACCUPHY/Training/Product FAQ and Training Videos` | `jasonzhu-ctrl/accuphy-product-faq-training` |
| Visual Lab（本仓库） | `~/Documents/WORK/ACCUPHY/IT/accuphy-visual-lab` | `accuphy-marketing/accuphy-visual-lab` |

Lab 不归 CHIEF 直管，跨项目一律走 `handoffs/`。

---

## 本文件的信息来源

- **2026-10-29 直接核实**：仓库归属与组织成员、HEAD 与远端一致性、旧地址跳转、
  推送权限、`accuphy-lab-test` 最近提交、发布链接、`docs/decisions.md` 编号上限
  （#189）、`docs/backlog.md` 更新时间、代码目录结构、打包脚本变体规则。
- **来自仓库文档（未逐条独立验证）**：具体决定的历史过程、Jason 批准的原话、
  各条「已做」的细节与图片。接手时以 `docs/decisions.md` 和 `docs/backlog.md` 原文为准。
