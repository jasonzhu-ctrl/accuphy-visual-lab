# BF 广告样片方案：PingLive 湖上版（只是方案，Jason 定了再做）

2026-10-26，Lab HQ。Jason 原话：“你先做一个在湖上的 PingLive 的版本，我们商量好内容的策略，一起做一个 draft……
那个对话框一样的这个形式不合适，视觉效果要更高级更好……不要用句子，用一个一个 bullet point，最好是数字，然后是可以有动效的那种数字……
比如说 PingLive 在 panoramic view 的时候……先闪现一个……这是 panoramic view，然后……Scan shallow structures full beam width 135度……
然后 forward 的时候又对应是什么样的，你思考一下，给我 propose 一个 idea。”

做法：先只做这一条（9:16、英文），定下样式和内容规则，再套到其他版本。之前那 18 个版本先不动。

## 一、字幕的样子（取代对话框）

- **不要底框。** 字直接压在湖面上，画面上三分之一加一层很淡的暗色渐变，让字清楚。
- **三层字：**
  - 视图名：大写，Eurostile Heavy，白色，约占画面宽度的 70%。例：`PANORAMIC VIEW`。
  - 大数字：最大的元素，Eurostile，从 0 跳到目标值（0.6 秒，先快后慢）。例：`135°`。
  - 一行小标签：Inter，全大写、加宽字距，白色 70% 透明度。例：`FULL BEAM WIDTH`。
- **品牌蓝 #028CDF 只做点缀：** 数字下面一条细线，随数字一起画出来；或者一条细细的引线，从数字指到湖面上的波束。这样有“仪表盘、科技感”（#50）。
- **位置：** 画面上三分之一，靠左对齐，避开下面的声纳手机屏和船。
- **出场：** 视图名先闪一下（0.15 秒白光），数字跳动，小标签最后淡入；换下一组时整组往上滑走。
- **录屏时把页面上的面板、步骤卡、“去商店”按钮都藏掉**，画面只剩湖、船、波束和声纳屏，更干净。
- 法文版只换标签那一行，数字和视图名不用翻译，几乎不会变长。

## 二、15 秒分镜（数字只用 specs.md 里有的）

| 时间 | 画面 | 字（大数字 / 小标签） |
|---|---|---|
| 0–1 秒 | 手指拖船，波束在湖面上张开 | （先不出字，让动作先抓眼球） |
| 1–5 秒 | Panoramic：扇形扫过浅水的树和石头，声纳屏上一大片 | `PANORAMIC VIEW` → **`135°`** `FULL BEAM WIDTH` → 第二行 `SCAN SHALLOW STRUCTURE` |
| 5–9.5 秒 | 点一下切到 Forward，船往深一点的地方开，前方的鱼和树出现 | `FORWARD VIEW` → **`230 FT`** `MAX RANGE`（淡水，specs：70 m / 230 ft）→ 第二行 `SEE WHAT'S AHEAD` |
| 9.5–12.5 秒 | 切到 Down，船停在鱼群上方 | `DOWN VIEW` → **`3`** `VIEWS · 1 TRANSDUCER` |
| 12.5–15 秒 | 画面慢慢变暗，出 Accuphy 标志 | `PLAY THE FREE SONAR DEMO` / `ACCUPHY LAB`（Klaviyo 定稿的片尾） |

- 数字的出处：135° × 20° 波束、70 m（230 ft）淡水最大量程，都来自 `accuphy-website/docs/specs.md` 的 PingLive 一节。
  “3 VIEWS” 是 Lab 和 App 里 PingLive 的三个视图（Panoramic、Forward、Down）。
- `SEE WHAT'S AHEAD` 和 `SCAN SHALLOW STRUCTURE` 是说法，不是参数，要请 Klaviyo HQ 定稿；法文请网站 HQ 核。
- 第二行用不用、写什么，Jason 定。也可以只留“视图名 + 一个大数字”，更干净。

## 三、做样片的步骤（Jason 说“动”以后）

1. 冰钓聊天先出一张静帧样张（Panoramic 那一段，9:16），给 Jason 看字的样子。
2. 样式定了再出 15 秒英文样片。
3. 样片定了，用同一套规则出 Mini 前视、冰钓、4:5、法文版。
