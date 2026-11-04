# Mini 广告片 r7：旁白 + 背景音乐（Lab video creation，2026-11-03）

Jason（Lab HQ 原话）：“用artlist做一下字幕旁白和背景音乐”。画面 = 第 6 轮（19728ea），一帧未动；只加了声音。

成品（git 不收，reference/ads 无备份）：`reference/ads/2026-11-bf/base/plm-base-preview-10fps-r7.mp4`（40 MB）、`plm-base-preview-10fps-r7-small.mp4`（22 MB）。
声音素材在 `reference/ads/2026-11-bf/base/sound-r7/`（每句旁白的 mp3 原件和贴合后的 wav、音乐 wav、最终混音 mix-r7.wav）。
混音脚本 `scripts/dev/ads/base/mix-base.py`，贴合脚本 `fit-line.py`，本轮参数 `plan-r7.json`。

## 旁白

Artlist AI 配音，声音 **Jon – Warm & Grounded Storyteller**（男声、中年、美音；模型 ElevenLabs Eleven v3），台词 = 各段字幕原文，没有增减词。
共 9 句，用掉 83 点（套餐 Max Pro，8 万点/月，生成前余额 69,462，不另付钱）。

| 段 | 字幕时间 | 旁白发声 | 台词 | 处理 |
|---|---|---|---|---|
| 1 开场 | 0.0–4.0 | 0.60–3.47 | Learn Forward-Facing Sonar in 2 minutes. | 原样 |
| 2 拖船 | 4.0–9.5 | 4.30–7.86 | Drag the boat. See what the beam finds for you in the timber. | 原样 |
| 3 手机 | 9.5–14.5 | 9.75–13.53 | Here’s how it looks on your phone. Spot the fish among the trees. | 原样 |
| 4 角度 | 14.5–19.0 | 14.75–17.20 | One beam ahead. Two with Combo. | 原样 |
| 4b 手机 Combo | 19.0–22.5 | 19.20–22.03 | Ahead and straight down, at the same time. | 原样 |
| 5 冰上 1 | 22.5–25.3 | 22.60–25.24 | No black box. No heavy battery and plotter. | 停顿压短 0.17 s + 提速 15 %（原 3.21 s） |
| 5 冰上 2 | 25.3–27.6 | 25.45–27.25 | Wireless image to your phone. | 原样 |
| 5 冰上 3 | 27.6–30.0 | 27.40–30.02 | Hop holes faster with PingLive Mini on hard water. | 提速 15 %（原 3.01 s，读不进 2.4 s）；提前 0.2 s 起、压黑场 0.02 s |
| 6 片尾 | 30.0–34.0 | 30.05–33.93 | Try Accuphy Sonar Lab. No fee. No download. Right in your browser. | 停顿压短 0.14 s + 提速 18 %（原 4.82 s） |

ElevenLabs v3 在 Artlist 里没有语速参数，提速是本地做的（WSOLA，不变音高）。要是 Jason 觉得这三句急，备选是重新生成更短的说法——但那要改词，等他定。

## 背景音乐

用的：**Walking the Universe — Norvik**（2:58，86 bpm，纯器乐）  
https://artlist.io/royalty-free-music/song/walking-the-universe/58141  
取曲子 144.5–178.5 s 这一段（含它自己的结尾，33 s 处已近无声，所以片尾收得干净），开头 1.2 s 淡入；整体 −19 dBFS，旁白出现时再压低 9 dB。

另外两首候选（只给链接，Jason 挑）：
- **Some Light — Flint**（2:52，89 bpm，更暖更软）https://artlist.io/royalty-free-music/song/some-light/6002069
- **Levitator — Tamuz Dekel**（3:44，91 bpm，更“科技”、慢慢铺开）https://artlist.io/royalty-free-music/song/levitator/113390

授权：账号是 Artlist **Max Pro** 订阅。按 Artlist 的订阅许可，订阅期内下载的曲库音乐可终身用于所有平台，**包括付费广告（Meta 投放在内）**；AI 配音同属套餐内容。这是 Artlist 公开的许可条款，不是账号页面逐条核过的——投放前让 HQ 在账号的 License 页确认一次最稳。三首候选都是曲库里的正式曲目，许可相同。

## 电平

整片 RMS −14.6 dBFS，峰值 −1.0 dBFS；只有音乐时约 −23 dBFS，旁白段约 −15 dBFS。

## 核对方式

没有人耳听（这个会话没有放音），用的是数值和曲线核对：每句发声起止（上表）都在它那段字幕时间内，不互相重叠；音乐在旁白下方；片尾最后 0.3 s −22 dBFS 且音乐已自然收尾。请 Jason 实听。

---

# r8：后段旁白改法（Jason 听 r7 后：“人声最后一大段不太行”“少读几句可以的 但是要详细改”）

画面和字幕 = 第 6 轮，一帧未动；0–22.5 s 的五句旁白和 r7 完全一样；音乐同 r7。只改了 22.5 s 之后的旁白：
**一律原生语速，不提速、不压停顿；每句只读字幕里最要紧的词（全是字幕原文，没有新词）；句与句之间至少留 0.5 s 让音乐露出来；片尾那句前面留 1 s 的明显停顿。**

成品：`reference/ads/2026-11-bf/base/plm-base-preview-10fps-r8.mp4`（40 MB）、`plm-base-preview-10fps-r8-small.mp4`（22 MB）。新 take 在 `sound-r8/`（8 个 take 的 mp3/wav，混音 mix-r8.wav），参数 `scripts/dev/ads/base/plan-r8.json`。
新生成 8 个 take（冰上 1 ×2、冰上 3 全句 ×2、冰上 3 短句 ×1、片尾长句 ×2、片尾短句 ×1），共 39 点，套餐内（余额 69,379 → 约 69,340）。

| 段 | 字幕原文 | 字幕时间 | 旁白实际读 | 发声起止 | 与下一句的间隔 | take 怎么选 |
|---|---|---|---|---|---|---|
| 4b 手机 Combo | Ahead and straight down, at the same time. | 19.0–22.5 | （同 r7，全句） | 19.20–22.03 | 0.78 s | 不动 |
| 5 冰上 1 | No black box. No heavy battery and plotter. | 22.5–25.3 | **No black box.** | 22.81–24.11 | 1.39 s | take a（1.30 s）；take b 三个词里夹了 0.29 s 的停顿，不自然 |
| 5 冰上 2 | Wireless image to your phone. | 25.3–27.6 | **Wireless image to your phone.**（全句，r7 原 take，本来就是原生语速） | 25.50–27.30 | 0.57 s | 不动 |
| 5 冰上 3 | Hop holes faster with PingLive Mini on hard water. | 27.6–30.0 | **Hop holes faster on hard water.** | 27.87–30.06 | 1.01 s | 全句原生 2.19 s 读得下，比只读 “Hop holes faster.” 完整；两个 take 时长一样，取峰值余量更大的 a。尾音压过字幕结束 0.06 s，落在黑场上 |
| 6 片尾 | Try Accuphy Sonar Lab. No fee. No download. Right in your browser. | 30.0–34.0 | **Try Accuphy Sonar Lab.** | 31.07–32.91 | 片尾，之后 1.1 s 只有音乐收尾 | 加上 “No fee. No download.” 原生要 3.9 s，只能从 30.07 s 黑场一出现就讲、讲到最后一帧才完，前面留不出停顿，又回到“急”的问题；所以只读标题句，在片尾字出现（30.8 s）后起，“No fee. No download.” 由画面上的字说 |

为什么这样选：Jason 不要机器味，核心是不碰语速、句子短、句间有空。后段四句现在总共发声 6.5 s，分散在 22.8–32.9 s 的 10 秒里，其余时间音乐露出来；片尾前停 1.0 s，片尾后还有 1.1 s 纯音乐收尾（曲子本身的结尾，30 s 后已接近无声）。

电平：整片 RMS −15.5 dBFS，峰值 −1.0 dBFS；句间只有音乐时 −16～−29 dBFS，片尾 30–31 s −36 dBFS，最后 0.3 s 静音。
核对仍靠数值（本会话无放音）：每句发声起止如上表，无重叠，间隔都 ≥0.5 s。请 Jason 实听。

---

# r9：按 Jason 逐句定稿换旁白（Jason：“修改的comment写完了 你再继续做一个版本吧”，HQ 转来定稿表）

画面、字幕、音乐 = r8，一个没动（视频轨与 r8 逐帧同一份：340 帧，哈希一致；音乐参数同 r8）。只按定稿换旁白。
规则同 r8：一律原生语速，不提速、不压停顿；每句落在它那段字幕时间里；句间 ≥0.5 s。

成品：`reference/ads/2026-11-bf/base/plm-base-preview-10fps-r9.mp4`（40 MB）、`plm-base-preview-10fps-r9-small.mp4`（22 MB），整段混音单独一份 `plm-base-r9-mix.wav`（34 s，48 kHz；本机不能直接编 mp3，所以给 wav）。
新 take 在 `sound-r9/`（10 个 take 的 mp3/wav、`phone-half.wav`、`mix-r9.wav`），参数 `scripts/dev/ads/base/plan-r9.json`。
新生成 10 个 take（5 句新词 × 2），共 47 点，套餐内（余额 69,340 → 69,293，11-08 续满）。

| 段 | 字幕时间 | 旁白读 | 发声起止 | 与下一句的间隔 | take 怎么选 |
|---|---|---|---|---|---|
| 1 开场 | 0.0–4.0 | Learn Forward-Facing Sonar in 2 minutes. | 0.60–3.47 | 0.83 s | r7 原 take，不动 |
| 2 拖船 | 4.0–9.5 | Drag the boat. See what the beam finds for you in the timber. | 4.30–7.86 | 1.89 s | r7 原 take，不动 |
| 3 手机 | 9.5–14.5 | Here’s how it looks on your phone. | 9.75–11.16 | 3.60 s | 不另生成：r7 原 take 在两句之间有 0.45 s 自然停顿，从停顿处剪下前半句（尾部 80 ms 淡出），语气、语速都是原来的 |
| 4 角度 | 14.5–19.0 | **Switch to Combo View.**（新） | 14.76–16.11 | 3.09 s | take b：音高起伏更大（读起来不平），1.35 s；a 更平、1.29 s |
| 4b 手机 Combo | 19.0–22.5 | Ahead and straight down, at the same time. | 19.20–22.03 | 0.82 s | r7 原 take，不动 |
| 5 冰上 1 | 22.5–25.3 | **Combo View on Ice.**（新） | 22.85–24.77 | 0.72 s | take b：起伏更大、更从容（1.7 s 加尾部一口很轻的气 −49 dB）；a 1.6 s 较平 |
| 5 冰上 2 | 25.3–27.6 | **Drill a hole in the ice.**（新） | 25.49–26.85 | 0.99 s | take b：干净无尾音、起伏更大；a 句尾多一段 0.2 s 的气声 |
| 5 冰上 3 | 27.6–30.0 | **Be part of the action.**（新，品牌口号） | 27.84–29.00 | 1.98 s | take b（生成时加了 “confident” 语气提示，不会读出来）：音高中位 134 Hz，比 a 的 150 Hz 低，有力但不喊、不像念口号；a 更高更亮，像宣传腔。两条时长一样 1.17 s |
| 6 片尾 | 30.0–34.0 | **Try it free, right in your browser.**（新，CTA） | 30.98–33.00 | 片尾，之后 1 s 只有音乐收尾 | take b（加了 “warmly” 提示，free 大写强调）：“free” 后有一个 0.12 s 的逗号停顿、整体语调更亮，像朋友在邀请；a 一口气读完，free 没有突出 |

**旁白和字幕不一样的几段（字幕先不改，等 HQ 问过 Jason）：**

| 段 | 字幕（画面上现在的字） | 旁白（r9） |
|---|---|---|
| 3 手机 | Here’s how it looks on your phone. Spot the fish among the trees. | Here’s how it looks on your phone.（只读前半句） |
| 4 角度 | One beam ahead. Two with Combo. | Switch to Combo View. |
| 5 冰上 1 | No black box. No heavy battery and plotter. | Combo View on Ice. |
| 5 冰上 2 | Wireless image to your phone. | Drill a hole in the ice. |
| 5 冰上 3 | Hop holes faster with PingLive Mini on hard water. | Be part of the action. |
| 6 片尾 | Try Accuphy Sonar Lab. No fee. No download. Right in your browser. | Try it free, right in your browser. |

1 开场、2 拖船、4b 手机 Combo 三段旁白和字幕一致。

电平：整片 RMS −15.4 dBFS，峰值 −1.2 dBFS；片尾前 29.1–30.9 s 只有音乐 −32 dBFS，最后 0.3 s 静音。
核对靠数值（本会话无放音）：每句发声起止如上表，都在各自字幕时间内，无重叠，间隔都 ≥0.72 s。take 是按时长、停顿、音高起伏和尾音挑的，不是听出来的，请 Jason 实听；每句另一个 take 都在 `sound-r9/`，要换随时换。

---

# r10：换音乐和旁白声音（Jason 在 Lab HQ 原话：“Space Brunch — Guy Mar音乐配Adam（Dark and Tough）”）

画面、字幕 = r9，一个没动：视频轨和 r9 逐帧同一份，340 帧，哈希一致。台词照 r9 定稿表，一个词没改。
规则同 r8/r9：原生语速，不提速、不压停顿；每句落在它那段字幕时间里；句间 ≥0.5 s。

成品（git 不收）：在 `reference/ads/2026-11-bf/base/`。
- `plm-base-preview-10fps-r10.mp4`（40 MB）
- `plm-base-preview-10fps-r10-small.mp4`（22 MB）
- 整段混音 `plm-base-r10-mix.wav`（34 s，48 kHz）

素材在 `sound-r10/`：18 个 take 的 mp3/wav、音乐原文件、混音。参数是 `scripts/dev/ads/base/plan-r10.json`。

## 音乐：Space Brunch — Guy Mar（trap 器乐）

- 链接：https://artlist.io/royalty-free-music/song/space-brunch/77373
- 标 75 bpm（听感是 150 的 trap 节拍），全曲 3:03。
- **已在 Artlist 正式下载**，2026-11-03，WAV（44.1 kHz / 24 bit，无水印）。走的是 Max Pro 订阅里的曲库下载，不另收钱。文件存为 `sound-r10/space-brunch.wav`。
- **这条下载记录就是许可证明。** 它在 Artlist 账号的下载历史里；投 Meta 前请 HQ 在账号 License 页把这首的证书存一份。
- 用的段：曲子 **0:00–0:32.85**。曲子开头本来有 1.0 s 静音。
- **对齐 808**：整段往后挪了 1.15 s，让曲子第 26.62 s 的 808 第一下落在片子第 27.77 s，就是 “Be part of the action” 开口那一刻（发声从 27.81 s 起）。片尾那句从 808 的另一拍 31.15 s 开口。
- **代价**：片头前 2.15 s 只有人声，没有音乐（冷开场），音乐从拖船那段才进来。
- 不挪的话，808 会落在 26.62 s，正好压在 “Drill a hole in the ice” 句尾（那句要读到 27.03 s），两句都会被盖。

## 旁白：Adam – American, Dark and Tough

所有句子都用 “relaxed” 语气提示，只有 “Be part of the action.” 用 “confident”。
新生成 16 条，加上上一轮挑声音时 Adam 已读的两条，每句 2 个 take。共 133 点，套餐内，余额 69,224 → 69,091（11-08 续满）。
挑法：按音高起伏（太平的像念稿，排除）、停顿位置、长度。不是听出来的。

| 段 | 字幕时间 | 旁白 | 发声起止 | 与下一句间隔 | 人声比音乐高 | 选哪条、为什么 |
|---|---|---|---|---|---|---|
| 1 开场 | 0.0–4.0 | Learn Forward-Facing Sonar in 2 minutes. | 0.64–3.32 | 1.06 s | 28.5 dB | b：音高 117 Hz、起伏大。a 的 136 Hz 偏高，不像 Adam 平时的声音 |
| 2 拖船 | 4.0–9.5 | Drag the boat. See what the beam finds for you in the timber. | 4.38–7.84 | 2.02 s | 21.1 dB | b：两句之间自然停 0.59 s，有起伏。a 太平 |
| 3 手机 | 9.5–14.5 | Here’s how it looks on your phone. | 9.86–11.15 | 3.69 s | 21.6 dB | b：有起伏。a 几乎一个调 |
| 4 角度 | 14.5–19.0 | Switch to Combo View. | 14.84–16.28 | 3.03 s | 16.1 dB | a：起伏正常。b 很平、音量也偏小 |
| 4b 手机 Combo | 19.0–22.5 | Ahead and straight down, at the same time. | 19.31–21.78 | 0.95 s | 17.9 dB | b：逗号处有小停顿，起伏比 a 大 |
| 5 冰上 1 | 22.5–25.3 | Combo View on Ice. | 22.73–24.60 | 0.76 s | 15.9 dB | a：“Combo View” 和 “on Ice” 之间自然停 0.2 s。b 句尾带一口气 |
| 5 冰上 2 | 25.3–27.6 | Drill a hole in the ice. | 25.36–27.03 | 0.78 s | 18.6 dB | a：起伏最大。b 很平 |
| 5 冰上 3 | 27.6–30.0 | Be part of the action. | 27.81–28.81 | 2.35 s | 11.9 dB | a（上一轮挑声音时那条）：1.0 s 一口气说完，短促有力，开口在 808 第一下后 0.04 s。b 长 0.2 s、更平 |
| 6 片尾 | 30.0–34.0 | Try it free, right in your browser. | 31.16–33.19 | 片尾，后面 0.8 s 音乐收 | 12.9 dB | a（上一轮挑声音时那条）：“free” 后停 0.15 s，起伏比 b 大。开口在 808 的一拍上 |

## 混音

- 音乐整体 −19 dBFS，人声出现时压低 13 dB（r9 是 9 dB）。
- 从 27.6 s（808 进来）起，音乐再整体低 5 dB。否则 808 和人声只差 3–4 dB，最后两句会被盖住。
- 现在每句人声都比音乐高至少 11.9 dB。
- 808 进来后句与句之间的音乐是 −17 dBFS，比前面 −24 dBFS 高 7 dB，起落还在。
- 最后 0.8 s 淡出，最后 0.3 s 是 −41 dBFS。
- 整片 RMS −16.1 dBFS，峰值 −1.5 dBFS。

这次 `mix-base.py` 加了两样：`musicIn` 可以是负数（音乐晚进），`bedSteps` 可以从某一刻起改音乐的音量。

旁白和字幕不同的段落跟 r9 一样，共 6 段：3 手机、4 角度、5 冰上三句、6 片尾（表在 r9 一节）。字幕没改，等 Jason 定。
核对靠数值，这里不能放音：每句起止、间隔、人声比音乐高多少都在上表。请 Jason 实听；每句另一个 take 都在 `sound-r10/`，要换随时换。
