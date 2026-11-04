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
