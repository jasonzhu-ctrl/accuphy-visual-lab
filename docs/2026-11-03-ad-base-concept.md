# Base 版广告片：重新构思，先出分镜脚本（Lab HQ，11-03）

## Context

Jason 看了静帧，说片子有问题，给了新方向（11-03，Lab HQ）：
- **手机和整个声纳覆盖范围放不进同一个画面。** 改成用分镜：
  - 先拍拖船，要拍得 make sense；
  - 拖到位以后，手机用好看的方式“啪”地上来，盖住不需要看的 3D 声纳画面；
  - 这时重点就在手机上。
- **之前做过的 PingLive 和 PingLive Mini 不同版本的动画**（135° 那些）“挺不错的”，要用上。
- **时间拉长到 20 秒内**。之前太短，说不清楚是怎么回事。
- **片子要有声音。**
- **主信息：** “learn using live sonar under 2 minutes”，冰上和开阔水面都能用，要用地道的说法（冰钓圈叫 hard water，夏天叫 open water）。
- **先想好怎么拍，截图按 1、2、3、4、5 写成脚本给他看。**他说“都是 OK 的”，就是让我们开始构思。
- **Mini 和 PingLive“都要做”**，放宽 #185 的“最多一条”。

## 片子怎么拍（HQ 的构思，交视频窗口照着出分镜）

**片尾和广告标题用的一句话（英文）：**
- 主句：**“Learn live sonar in under 2 minutes.”**
- 副句：**“On open water or hard water.”**
- “2 分钟”说的是免费的 Accuphy Lab 体验，不是说产品，所以片尾要写“Try the free Accuphy Lab”，不要让人以为在说产品本身两分钟就会。

**Mini 版，约 20 秒，9:16 + 16:9：**

| # | 时间 | 画面 | 字幕（红线内） | 声音 |
|---|---|---|---|---|
| 1 | 0–2.5 s | 开场：整个湖，湖岸、针叶林，船在水上，镜头慢慢推近 | Learn live sonar in under 2 minutes | 一声声纳“ping”，进背景音乐 |
| 2 | 2.5–6 s | 拖船：Lab 教程里那种手指拖船，船滑过去，波束扫过鱼和水下结构（只有 3D，没有手机） | Drag the boat. | 拖动的水声，鱼进波束时轻“ping” |
| 3 | 6–9 s | 手机“啪”地从下面弹上来，放大占满画面中下部，盖住 3D；手机里 Live Forward 鱼亮起来 | See it live in the Accuphy Sonar App | 弹出音效，ping 跟着回波 |
| 4 | 9–13 s | 视图对比动画（沿用以前的 PingLive / Mini 角度动画）：Mini 39° → Combo 78°，手机里 Forward / Down / Combo 切换 | Forward. Down. Both at once. | 每切一次一声 ping |
| 5 | 13–17 s | 冰钓：切到冰面，点冰打洞，Mini 放下去，手机里 Live Down 看到饵和鱼 | Open water or hard water. | 冰钻声、ping |
| 6 | 17–20 s | 片尾：ACCUPHY 标志 + 蓝线 | Learn live sonar in under 2 minutes / Try the free Accuphy Lab | 音乐收尾 |

**PingLive 版：** 同样的结构。
- 第 4 段换成 PingLive 的 135° 全景动画（Down → Forward → Panoramic，沿用以前那段 135° 的动画）。
- 第 5 段：冰钓页只有 Mini，所以 PingLive 版第 5 段要么去掉、换成开阔水面浅滩结构（Panoramic 看鲈鱼窝），要么用 Mini 的冰钓画面加一句“with PingLive Mini on the ice”。默认去掉冰钓，因为 PingLive 本身不用在冰上。这条要 Jason 定。
- 美国 2 月前不卖 PingLive，这条只给加拿大用。

**规矩照旧：**
- 手机不挡波束（#219）：手机上来的时候，它就是主角，3D 被盖住没关系。
- 字和重要画面都在红线中间：Reels 广告上面约 14%、下面约 35% 会被挡，广告的行动按钮在下面，挡得更多。
- 不出语言版，不出 4:5 和 1:1。

**声音：**
- 声纳 ping、弹出、水声这些音效，我们自己用程序合成，没有版权问题。
- 背景音乐要有授权：可以 Jason 提供一首，或在 Meta 投放时用 Meta 的免费音乐库加。默认先放合成音效，音乐位置留空。
- 字幕本身就能把意思讲清楚（很多人静音看）。

## 交给视频窗口做什么（"Lab video creation"，local_575bc8a6-28cd-4cfb-b367-63a0c78c335d）

1. 照上面的分镜，从 Base（86bf80e 干净检出）截每一段的关键画面。冰钓段用 /ice/ 的检出；PingLive 版用不带 `VITE_DEVICES` 的检出。以前的 135° 角度动画从它的旧脚本里找出来重用。
2. 出一张**分镜脚本图** `docs/2026-11-03-ad-base-script.jpg`：
   - Mini 一排、PingLive 一排；
   - 每格写编号、时间、画面、字幕、声音；
   - 画上红线；
   - 手机“弹上来”那一段画前后两张。
3. 写一页脚本 `docs/2026-11-03-ad-base-script.md`，内容和图一样，并写清楚音效怎么来。
4. 不出片，不加音乐，不上传。报 HQ，HQ 核过给 Jason 看。

## HQ 另外要做

- 记决定：
  - Jason 定的“都要做”、20 秒内、有声音、主信息，以及分镜做法；
  - 多语言窗口的 #222（以后翻译措辞由它定）已经记了，只告诉 Jason 一行。
- 核分镜图：红线、手机不挡、字能看清、两版结构对得上。
- 给 Jason 看，一次问一个问题：先问整体，再问 PingLive 版第 5 段。

## 检查

- 分镜图每格都有编号、时间、字幕、声音四样，Mini 和 PingLive 各一排。
- 所有字都在红线中间。
