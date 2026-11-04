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
