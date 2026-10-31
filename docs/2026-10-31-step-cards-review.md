# 步骤卡：它是干什么的，现在写了什么（Lab HQ，2026-10-31，等 Jason 定）

Jason 2026-10-31：“首先我觉得这个卡片的意义是什么我们先要搞清楚，然后把内容再核对一下，一次性全部都搞定吧。之前其实不太确定这个内容跟这个对应的意义在哪里。”

依据：`index.jsx` 第 336–352、534–543 行（main，10-31），`i18n.js` 第 41–55 行，决定 #1xx 里的步骤卡记录，backlog “Experience (the three-step guide)”。

## 1. 它现在实际做什么

- **只在电脑上有**，手机上不显示（手机用 App 首页选视图）。
- **三张卡 = 三个“带你去看”的站点。** 点一张卡会同时做 4 件事：
  1. 把船移到预设的位置；
  2. 切到指定的设备和视图；
  3. 把 range 设成预设值；
  4. 展开这张卡的说明，其他两张只剩标题。
- 第一次打开页面时，默认停在第 1 步。

## 2. 每页每张卡的内容（英文是现在的定稿，法文网站已核）

### 夏天湖面 PingLive（`/`）

| 步 | 标题 | 说明 | 点了以后 | 问题 |
|---|---|---|---|---|
| 1 | The PingLive sonar beam | Drag the boat — anything inside the beam appears on your phone. | 船到 (−20, 6)，**Down**，80 ft | 标题说“波束”，但切到的是 Down；说明是在教“拖船”，和标题不是一回事 |
| 2 | This is what your phone shows | This is what PingLive sees, live on your phone in the Accuphy Sonar app: the bottom, timber and fish. | 船到 (16, 11)，**Forward**，60 ft，正对立木和鲈鱼 | 内容对；但没说这是 Forward、为什么好 |
| 3 | Which view, when | Panoramic scans wide to find fish and structure; Forward to cast at them; Down to fish straight below. | 船到浅滩边，**Panoramic**，70 ft | 一句话讲了 3 个视图，但只切到 1 个；读的人没机会看另两个 |

### Mini（`/mini/`，美国店也是这页）

| 步 | 标题 | 说明 | 点了以后 | 问题 |
|---|---|---|---|---|
| 1 | The PingLive Mini sonar beam | 同上（拖船） | Mini，**Down**，80 ft | 同上 |
| 2 | This is what your phone shows | 同上，设备换成 Mini | Mini，**Forward**，60 ft | 同上 |
| 3（没订阅） | Which view, when | Forward to cast at fish ahead; Down to fish straight below. Combo shows both **side by side**: subscribe to unlock it. | Mini，**Forward** | “side by side”不对：屏幕上是一条斜线把两边分开。说明里在叫人订阅，但卡片本身不能订阅 |
| 3（已订阅） | Which view, when | Combo shows Down and Forward **side by side**; … | Mini，**Combo** | 同上，“side by side” |

### 冰钓页（`/ice/`，只有 Mini）

| 步 | 标题 | 说明 | 点了以后 | 问题 |
|---|---|---|---|---|
| 1 | The beam under the ice | The PingLive Mini hangs in the hole and pings straight down. Tap the ice anywhere to drill a new hole — whatever the beam touches lights up. | 营地冰洞，**Live Ice**，60 ft | 内容对 |
| 2 | Watch them come in | The flasher is the dial: the bottom, your bait and every fish that rises… The panel beside it draws the same fish as marks. | 换一个冰洞，**Live Ice** | 对 |
| 3 | Look ahead without drilling | Forward View turns the beam sideways: fish and structure out ahead, under ice you never cut. | **Forward** | 对 |
| — | （位置） | 三张卡叠在面板下面 | — | 矮屏幕（< ~890 px）出屏，见界面设计的两版对比图 |

## 3. 我看到的根本问题

1. **没人定过卡片要达到什么目的。** backlog 写的是“文字是第一稿，等 Jason 改”（9 月），一直没改。
2. **夏天湖面三张卡的标题和点了以后看到的东西对不上**（第 1 步标题是“波束”，看到的是 Down；第 3 步讲 3 个视图，只看到 1 个）。冰钓页三张是对得上的。
3. **没有一张卡把人往下一步带**（去商店、下载 App、订阅）。看完第 3 步就结束了。
4. Mini 第 3 步“side by side”是错的。
5. 手机上没有卡片（这是有意的，手机用 App 首页），所以卡片只服务电脑访客。

## 4. 卡片可以是什么（三选一，推荐 A）

- **A. 三站导览（推荐）：** 给第一次来的电脑访客，用三次点击讲完“这东西是什么 → 手机上看到什么 → 该买哪种 / 怎么用”。每站停在一个鱼多、画面好看的位置，标题就说眼前看到的东西。最后一站带一个下一步（去商店或下载 App）。
- **B. 操作说明：** 只教怎么玩（拖船、换视图、调 range），不带位置。简单，但浪费了“带你去好位置”的能力。
- **C. 去掉：** 面板和画面自己能说清楚，卡片只是占地方。最省事，但第一次来的人可能不知道看哪里。

定了用途，再一次性改三页九张卡的文字、站点和样子（冰钓那张图也一起定），英法一起交网站核。

## 5. Jason 定了 A（2026-10-31：“a”）：三站导览，最后一站带下一步

### 统一的故事线（三页都照这个讲，具体字由窗口起草）

| 站 | 访客应该明白的一件事 | 夏天湖 PingLive | Mini（含美国） | 冰钓页（Mini） |
|---|---|---|---|---|
| 1 | **波束就是你在水下的眼睛**：拖船，波束碰到的东西会出现在手机上 | Down，停在鱼和结构都有的地方 | Down，同上 | Live Ice，冰洞往下打（现有第 1 张基本对） |
| 2 | **手机上就是这样看鱼的**：真 App 的画面，鱼、底、立木 | Forward，对着立木和鲈鱼 | Forward，同上 | Live Ice，鱼游上来（现有第 2 张） |
| 3 | **这台机器适合你怎么钓，下一步去哪** | Panoramic 找鱼，卡片里放“去商店”按钮（Shop PingLive） | 已订阅：Combo（斜线分开两屏，不说 side by side）；没订阅：Forward + 订阅开 Combo；卡片里放“去商店”（Shop PingLive Mini） | Forward 看冰下远处，卡片里放“去商店”（Shop PingLive Mini） |

规矩：
- 标题就说眼前看到的东西；说明最多 2 行，只讲一件事。
- 每站停的位置，鱼数要达到 #193 的最低数，画面要好看。
- 第 3 站的按钮行为和现有“去商店”按钮完全一样：按市场、等 1 秒、记 `shop_click`，`placement` 用 `step3`。
- 英法一起，法文交网站核。手机上照旧不显示卡片。
- 只做测试版。上线要 Jason 在 Lab HQ 说“动”。

### 分工（同时做，各交一份给 HQ，HQ 合成一张图给 Jason）
- **Lab 场景和声纳画面Base：** 三页九站各定一个停靠点（船的位置、视图、range），截手机屏和 3D 画面，报每站开场鱼数。只出点位，不改代码。
- **营销和外部系统对接：** 起草九张卡的英文标题和说明，加第 3 站按钮的文字。先读市场资料（真买家是加拿大冰钓、便携、看性价比的人）。只出草稿表，不改 `i18n.js`。
- **界面设计：** 卡片的样子。夏天湖面加第 3 站按钮；冰钓页用方案 a（右上一张完整卡 + 01·02·03 切换），夏天湖要不要也改成同样的样子一起出图。只出图，不改代码。
