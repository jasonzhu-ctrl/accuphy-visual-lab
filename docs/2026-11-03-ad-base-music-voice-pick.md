# Mini 广告片：重新挑背景音乐和旁白声音（Lab video creation，2026-11-03）

要求来自一个旁支会话，经 Lab HQ 问过 Jason 后照做（Jason 在 HQ 原话：“要做，照那份做”）。
只挑：没买、没下载曲库音乐、没合成整片；画面和字幕都没动。
片子：34 秒竖版 Reels（r9 画面）。节奏要求：开头安静，中段起来，“Be part of the action”（27.8 s）最高，片尾干净收住。
受众：北美重度钓鱼的中年男人（40–60 岁），讨厌广告腔。

**怎么挑的（重要）：这个会话不能放音，没有人耳听过。**
- 乐器：从 Artlist 曲库用“原声吉他 + 电子”“民谣 + 鼓 + 合成器”“户外冒险”几组词搜，只要纯器乐、85–100 bpm，选同时出现在几组结果里的曲子。Artlist 网页拒绝自动读取，看不到它自己的风格标签。
- 段落：把每首的免费试听流（只存在临时目录，不是下载）逐秒量响度，找“开头轻、中段满、最后几秒自然收尾”的 34 秒。
- 声音：量音高和起伏，再用片尾那句各试读一遍。
请 Jason 实听决定。

## 背景音乐 5 首（按推荐排序）

| # | 曲名 — 作者 | bpm | 时长 | 建议用的段（原曲时间） | 为什么合适 |
|---|---|---|---|---|---|
| 1 | **Western Ride — Russo** https://artlist.io/royalty-free-music/song/western-ride/9829 | 97 | 2:24 | **1:47.0–2:21.0**（107–141 s） | 这段的形状最贴画面：前 9 s 只有轻的一层（比满音量低约 9 dB），第 10 s 整个乐队进来，正好落在切到手机那一刻。之后一直满到第 30 s，盖住冰上和 “Be part of the action”。最后 4 s 是曲子自己的结尾，第 34 s 已近无声，片尾 CTA 落在收尾上 |
| 2 | **Here on Out — Kai Livermore** https://artlist.io/royalty-free-music/song/here-on-out/6002276 | 95 | 2:58 | **2:20.5–2:54.5**（140.5–174.5 s） | 开头 4 s 满，第 5–8 s 落下去，再一路慢慢往上推。最后 5 s 是曲子本身的结尾（第 29 s 起渐收，34 s 前收完）。开头偏满，要在前 4 s 做一个 1 s 淡入 |
| 3 | **Fields of Light — Ace** https://artlist.io/royalty-free-music/song/fields-of-light/6001936 | 90 | 2:43 | **1:53.0–2:27.0**（113–147 s） | 前 13 s 偏轻，从第 14 s 起逐渐变满，满点在第 28–32 s，正好在 “Be part of the action” 到片尾那几秒。缺点是第 34 s 是乐句结尾，不是全曲结尾，需要最后 1 s 淡出 |
| 4 | **Third Pulse — Assaf Ayalon** https://artlist.io/royalty-free-music/song/third-pulse/4161 | 99 | 2:50 | **2:08.0–2:42.0**（128–162 s） | 原声味最重，往前推的劲最足。但这段从头到尾一样满，没有“开头安静”。最后 6 s 是曲子自己的结尾 |
| 5 | **Late Bloomer（纯器乐版）— CTRL S** https://artlist.io/royalty-free-music/song/late-bloomer-instrumental-version/108999 | 93 | 2:59 | **2:20.5–2:54.5**（140.5–174.5 s） | 电子层最明显，科技感最强。这段也是一路平满，最后 3 s 干净收住（34 s 处已无声） |

没选的：Sunlight（86 bpm，结尾太长，从第 24 s 就开始往下收，盖不住 27.8 s 的高点）、Own It（找不到能自然收尾的 34 s）、Open Sky、Walking on Thin Air、Woodcraft、Blanket of Starlight、Tomorrow’s Promise（这几首在 34 s 里要么一直平、要么收得太早）。
现在 r9 用的 Walking the Universe（Norvik，86 bpm）也比要求的 85–100 bpm 偏慢、偏柔，可以跟这 5 首一起比。

## 旁白声音 3 个（按推荐排序）

试读台词都是片尾那句 “Try it free, right in your browser.”。语气提示和现在一样，用 “warmly”。
文件在 `reference/ads/2026-11-bf/base/voice-pick/`（git 不收）。

| # | 声音（Artlist 名字） | 文件 | 发声长度 | 音高中位 / 起伏 | 推荐理由 |
|---|---|---|---|---|---|
| 1 | **James – Husky, Engaging and Bold**（中年，美音） | `cta-james.mp3` / `.wav` | 1.88 s | 99 Hz / 70 Hz | 中低音、起伏不大，最接近“平静、有底气”。“free” 后面有 0.18 s 的自然停顿，像随口在推荐。音色偏沙哑，有户外感。风险是名字里的 “Bold”，要听是否太硬 |
| 2 | **Alpha**（中年，美音） | `cta-alpha.mp3` / `.wav` | 2.33 s | 127 Hz / 79 Hz | 三个里最慢、最从容，不赶。音高中等，不像预告片低音。可能偏“讲解员”，要听有没有笑意 |
| 3 | **Keen**（中年，美音） | `cta-keen.mp3` / `.wav` | 1.92 s | 130 Hz / 141 Hz | 起伏最大，最有表情。如果笑意最足会是它，但也最容易偏“推销腔”，所以排第三 |
| 对比 | Jon（现在 r9 用的） | `cta-jon-current.mp3` / `.wav` | 2.02 s | 141 Hz / 100 Hz | 现有的 r9 片尾 take，放在一起比 |

口音：Artlist 这批声音只标“American”，没有“中西部”或“加拿大”这一档，所以朴实感只能靠听来挑。
试读花了 24 点（每条 8 点），在 Max Pro 套餐内，余额 69,269（11-08 续满）。没有额外付钱。

## 推荐组合

**Western Ride + James。**
- 这首的段落结构最贴画面：安静开场，手机那一刻起势，冰上一直满，片尾自然收。
- James 的声音最不像广告，中低音又不压过吉他。
- 第二选择是 Here on Out + Alpha。

## 能不能投 Meta 付费广告

可以，条件如下。
- 账号是 Artlist **Max Pro** 订阅。按 Artlist 的订阅许可，订阅期内下载的曲库音乐可以用在所有平台的作品里，**包括 Meta 付费广告**，下载过的曲子在退订后也能继续用于当时的作品。
- **必须在订阅期内从 Artlist 正式下载**，那份下载记录就是许可证明。现在只是挑，还没下载。Jason 定了之后下载选中的那首，套餐内，不另收钱。
- AI 配音是 Artlist 套餐内生成的内容，同样可以商用（含广告）。
- 这是 Artlist 公开的许可条款，不是在账号的 License 页上逐条核过的。投放前请 HQ 在账号里确认一次，并保存那首曲子的许可证明，以备 Meta 版权投诉时用。

---

# 第二轮：更酷的选择（Jason 听了第一轮：“再给我几个酷一点的选择”）

方向（HQ 转述）：现代、有态度。可以是有节奏感的电子、带鼓点的 hip-hop 或 trap 器乐、电影感的低频脉冲、带一点失真吉他的 indie rock。不要“温暖户外原声”那一类。
声音要更酷、更低沉、更有态度，但不要广告腔，也不要喊。
规矩同第一轮：只挑，不买、不正式下载、不合成整片，画面和字幕不动。挑法同上（搜索交叉 + 逐秒量响度），这里不能放音，请 Jason 实听。

**能直接听的文件：** 每首建议用的 34 秒，从 Artlist 免费试听里剪出来，放在 `reference/ads/2026-11-bf/base/music-pick/`（git 不收）。
- 第二轮是 `r2-1…r2-5`，第一轮的 5 首也补上了，是 `r1-1…r1-5`。
- 每个文件开头 0.3 s 淡入，结尾 0.8 s 淡出，只供试听，不能用在成片里。成片要用正式下载的版本。

## 音乐 5 首（按推荐排序）

| # | 曲名 — 作者 | 风格 | bpm | 时长 | 建议用的段 | 为什么 |
|---|---|---|---|---|---|---|
| 1 | **Totalitarian — Evgeny Bardyuzha** https://artlist.io/royalty-free-music/song/totalitarian/122399 | 电影感低频脉冲 | 100 | 3:07 | **1:14–1:48**（74–108 s） | 结构最贴画面：前 12 s 只有压着的低频（比满音量低约 17 dB），拖船时很安静。第 12 s 整体砸进来，正好在手机画面那段，之后一路满到片尾。第 34 s 是乐句尾（−13 dB），最后 1 s 淡出就干净 |
| 2 | **Space Brunch — Guy Mar** https://artlist.io/royalty-free-music/song/space-brunch/77373 | trap 器乐（标 75 bpm，听感是 150 的 trap 节拍） | 75 | 3:03 | **0:00–0:34**（曲子开头） | 最有态度：前 25 s 是压着的前奏，第 26 s 大鼓和 808 一下子落下来，就在 “Be part of the action”（27.8 s）前面一点，高点最明显。缺点是前 25 s 一直平，“中段起来”不明显；结尾要 1 s 淡出 |
| 3 | **Fall Apart（纯器乐版）— Company Gun** https://artlist.io/royalty-free-music/song/fall-apart-instrumental-version/6000206 | indie rock，失真吉他 | 110 | 4:15 | **3:24–3:58**（204–238 s） | 前 5 s 轻，第 6 s 乐队进来。之后一直满，第 32 s 起是全曲收尾，34 s 处自然收。节奏比要求的快一点，更有冲劲 |
| 4 | **Machine（纯器乐版）— FLAMEBOY** https://artlist.io/royalty-free-music/song/machine-instrumental-version/6001260 | hip-hop 鼓点 | 87 | 2:01 | **1:27–2:01**（全曲最后 34 s） | 前 12 s 稍收着，第 12 s 起满，第 34 s 正好是全曲结尾。速度稳、低频厚，像在船上开着车载音响 |
| 5 | **Chimera — Kryptos** https://artlist.io/royalty-free-music/song/chimera/63066 | 暗色电子 | 98 | 3:31 | **2:55–3:29**（175–209 s） | 电子感、科技感最强。这段一路平满，最后 3 s 是全曲结尾，34 s 处已无声 |

没选的：Deprimido（Guy Mar，trap）的 drop 在第 20 s，但收不了尾；Code Runner、God Particle 太快（115–129 bpm），起伏乱；Tale of the G.O.A.T、Waste Me、Send It、FRWD.、Who Are You Really? 的 34 s 要么一直平满，要么收不了尾。

## 旁白声音 3 个（更低沉，按推荐排序）

两句都读了：片尾 “Try it free, right in your browser.” 用 “relaxed” 语气提示，“Be part of the action.” 用 “confident”。三个声音提示一样，方便比较。
文件在 `reference/ads/2026-11-bf/base/voice-pick/`，文件名是 `r2-<声音>-cta` 和 `r2-<声音>-action`（各有 mp3 和 wav）。

| # | 声音（Artlist 名字） | 片尾那句 | Be part of the action | 音高中位 | 推荐理由 |
|---|---|---|---|---|---|
| 1 | **Adam – American, Dark and Tough**（中年，美音） | 2.04 s，“free” 后停 0.15 s | 1.07 s，短促有力 | 92 / 81 Hz | 低沉但干脆，两句都不拖，最“酷”。“Be part of the action” 一口气说完，不喊 |
| 2 | **Gravity**（中年） | 2.49 s，中间两处小停顿 | 1.35 s | 81 / 86 Hz | 三个里音色最低、起伏最小，像压着嗓子说话，很稳。片尾那句稍慢 |
| 3 | **Shadow**（中年） | 3.48 s，“free” 后停 0.6 s | 1.69 s，几乎没有起伏 | 90 / 83 Hz | 最暗、最慢、最有戏剧感。但片尾那句要 3.5 s，“action” 那句平到像念白，容易变成预告片腔，所以排第三 |

试读 6 条共 45 点，在套餐内，余额 69,224（11-08 续满）。没有额外付钱。

## 推荐组合（第二轮）

**Totalitarian + Adam。**
- 音乐的“安静→手机那一刻砸进来→一路满→片尾收”和画面节奏对得最准。
- Adam 低沉干脆，压得住这种低频，又不像广告。
- 要更有冲击力就选 **Space Brunch + Adam**，808 落在 “Be part of the action” 前一刻。

授权同第一轮：Max Pro 订阅期内正式下载即可用于 Meta 付费广告，等 Jason 定了曲子再下载。
