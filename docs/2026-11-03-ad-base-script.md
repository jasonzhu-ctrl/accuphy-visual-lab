# 广告分镜：标准 Base 版，Mini 一条、PingLive 一条（2026-11-03）

窗口 "Lab video creation"。构思来自 Lab HQ 11-03 的计划（Jason 的新方向："片子怎么拍"一节）。
分镜图：`docs/2026-11-03-ad-base-script.jpg`，Mini 一排、PingLive 一排。**这一轮只出分镜，不出片，不加音乐，不上传。**
它取代同一天的 `docs/2026-11-03-ad-base-brief.md`（那份只是一条 Mini 片、四段、无声）。

## 总的

- **两条：** PingLive Mini（加拿大 + 美国）和 PingLive（只给加拿大，美国 2 月前不卖）。各约 20 秒，9:16 和 16:9。
  不出语言版，不出 4:5、1:1。
- **主信息：** "Learn live sonar in under 2 minutes." / "On open water or hard water."。片尾写 "Try the free Accuphy Lab"：
  2 分钟说的是免费的 Lab 体验，不是产品本身。
- **讲法：** 先在 3D 里拖船（看懂"波束扫到什么"），再让手机从下面弹上来、盖住 3D；从那以后手机是主角。
- **画面来源：** 都从 86bf80e 的干净检出录（`reference/ads/lake-base-86bf80e/`，服务器 "ad-lake-base"，端口 5192，
  不带 `VITE_DEVICES`）。PingLive 是默认设备，Mini 用页面的设备切换。冰钓是同一检出里的冰钓页。脚本：
  `scripts/dev/ads/base/script-shots.mjs`（画面）、`script-board.py`（分镜板）。
- **红线：** Reels 上面约 14 %、下面约 35 % 会被挡住。所有字和要紧的画面都在两条线中间。
- **手机不挡波束（#219）：** 手机弹上来以后，3D 被盖住没关系。第 4、5 段手机上面那条 3D 带里，船和整片波束都留在字和手机中间，
  手机一点不挡。
- **手机大小：** 用页面自己的手机大小。9:16 里它本来就占满宽度，所以不再放大。Jason 10-26 说过，放大的声纳"看起来很糙"。
  手机抬到画面中间偏下（y 748–1233 / 1920），避开下面的红线。

## Mini 版（约 20 s）

| # | 时间 | 画面 | 字幕（草稿） | 声音 |
|---|---|---|---|---|
| 1 | 0–2.5 s | 整个湖：湖岸、针叶林，船在湖中间，镜头慢慢推近 | Learn live sonar in under 2 minutes. | 一声 ping；音乐位留空 |
| 2 | 2.5–6 s | 手指拖船（Lab 教程里那种圈和手指），Forward 波束扫过树林浅滩里的鱼。只有 3D | Drag the boat. | 水声；鱼进波束时轻 ping |
| 3 前 | 6.0 s | 手机从屏幕底下冒头 | See it live in the Accuphy Sonar App. | "嗖"的弹出声 |
| 3 后 | 6.3–9 s | 手机到位，盖住下面的 3D；手机里 Live Forward，树和鱼亮起来 | （同上） | ping 跟着回波 |
| 4 | 9–13 s | 角度动画：从正上方看，扇面从 Forward 39° 张到 Combo 78°；手机里 Forward / Down / Combo 跟着切。大数字在左，扇面在右下，不压字 | Forward. Down. Both at once. 大数字 `39° → 78°` | 每切一次一声 ping |
| 5 | 13–17 s | 冰面：点冰打洞，Mini 放下去；手机里 Live Down 看到鱼。字幕放在波束下面、手机上面 | Open water or hard water. | 冰钻声、ping |
| 6 | 17–20 s | 片尾：ACCUPHY 标志 + 蓝线 | Learn live sonar in under 2 minutes. / Try the free Accuphy Lab | 收尾一声 ping |

## PingLive 版（约 20 s）

结构和 Mini 一样，第 4、5 段不同。

| # | 时间 | 画面 | 字幕（草稿） | 声音 |
|---|---|---|---|---|
| 1 | 0–2.5 s | 整个湖，镜头推近船 | Learn live sonar in under 2 minutes. | 一声 ping；音乐位留空 |
| 2 | 2.5–6 s | 手指拖船，Forward 波束扫过鱼 | Drag the boat. | 水声；轻 ping |
| 3 前 / 后 | 6–9 s | 手机冒头 → 到位，Forward View 鱼亮起 | See it live in the Accuphy Sonar App. | 弹出声；ping |
| 4 | 9–13 s | 135° 动画：Down → Forward → Panoramic，扇面张到 135°，沿用 v3 那段的做法（`fanOpen`，数字跟扇面一起数到 135°） | Down. Forward. Panoramic.（占位）大数字 `135°` | 每切一次一声 ping，到 135° 一声长 ping |
| 5 | 13–17 s | **默认：** 浅滩树林上 Panoramic，鲈鱼进扇面。湖里没有专门的"鲈鱼窝"地形，用的是开场那片树林浅滩 | Open water or hard water.（跟着第 5 段定） | ping |
| 6 | 17–20 s | 片尾 | Learn live sonar in under 2 minutes. / Try the free Accuphy Lab | 收尾一声 ping |

**PingLive 第 5 段要 Jason 定：** 冰钓页只有 Mini。可以去掉冰钓、用开阔水面（默认，就是图上这张），也可以借用 Mini 的冰钓画面，
加一句 "with PingLive Mini on the ice"。选了开阔水面，"Open water or hard water." 这句在 PingLive 版里就要换掉。

## 声音怎么来

- 全部自己用程序合成（Python + numpy 写成 WAV），没有版权问题：
  - **ping：** 约 2.5 kHz 的短正弦音，很快衰减，带一点回声尾巴；"长 ping" 拉长尾巴。
  - **弹出：** 一段由低到高的扫频，加一点滤过的噪声（"嗖"）。
  - **水声：** 低通滤过的噪声，音量跟着拖船的速度走。
  - **冰钻：** 带电机嗡声的噪声，响约 1.5 秒（冰钓页打洞的时长）。
- **音乐：** 暂不放。以后可以 Jason 提供一首有授权的，或者在 Meta 投放时用 Meta 的免费音乐库加。
- **要补的工具：** 现在的编码器 `frames2mp4.swift` 只出画面。出片时要给它加一条音轨（AVFoundation 能做；这台 Mac 上没有 ffmpeg）。
  字幕本身就能把意思讲清楚，很多人静音看。

## 16:9

同样的分镜。湖的镜头横着重录。手机放在右边，避开 YouTube 的跳过按钮和底部进度条。字放在左边一栏，和 10-28 那条横版做法一样。
16:9 的分镜图等 9:16 认可以后再出。

## 字幕

第 1 段和片尾用的是 Jason 定的主信息。第 2–5 段是 HQ 的草稿，第 4 段 PingLive 那句是占位。照 ad-video 的规矩，
英文定稿交 Klaviyo HQ。视频问题清单里的 Q2（片尾名字）、Q8（占位字幕）都和这里有关：这次片尾按 HQ 写成 "Try the free Accuphy Lab"，
"Serious deep water ready." 这句已经不用了。

## 要 Jason 定的（HQ 一次问一个）

1. 分镜整体行不行（两条、6 段、手机弹上来的讲法）。
2. PingLive 第 5 段：开阔水面（默认），还是借用 Mini 冰钓。
