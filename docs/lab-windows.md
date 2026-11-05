# Lab 窗口名单（Lab HQ 维护）

Jason 不想窗口没显示就被忘掉（CHIEF SW-1104 补，2026-11-05）。这里记两件事：公司号现在在用哪些窗口；个人号上的窗口在公司号这边对应哪个。总表在 `IT/CHIEF Agent/docs/windows.md`。

## 公司号在用的窗口（2026-11-05）

| 窗口 | 管什么 |
|---|---|
| accuphy-visual-lab HQ（`local_1022478a`） | 统筹、派活、核结果、上线（上线要 Jason 在这里说“动”） |
| Lab 场景和声纳画面Base（`local_58ac0683`） | 【Base】湖、冰钓、波束、声纳画面 |
| 界面设计（`local_ddf2aa3f`） | 访客看到和点的东西，手机版样子也归它 |
| 营销和外部系统对接（`local_e14cb86c`） | 店铺桥、Klaviyo 订阅、文字表、事件 |
| Lab 多语言（`local_acdc8fc8`） | 五种语言的字表 |
| Lab 营销版（`local_5d3f1b7f`） | 【带锁版 MKT】lab.accuphy.ca/mktbf2026/ |
| Lab 网站嵌入版（`local_43b32a87`） | 【免费版】lab.accuphy.ca/、/mini/、/ice/ |
| Lab video creation（`local_575bc8a6`） | 【广告片】Mini 和 PingLive 两条片子，含语言版本 |

## 个人号的窗口 = 公司号的哪个

| 个人号的窗口 | 公司号这边 | 状态 |
|---|---|---|
| Lab HQ（`local_47bc36c3`） | accuphy-visual-lab HQ | 已接上（SW-1104） |
| Lab 营销版（`local_9524f8a3`） | Lab 营销版 | 已接上 |
| Lab 广告片：Mini 广告剪辑与多语言（`local_374e9bc2`） | **Lab video creation** | 已合并：Mini 英文 r17 定稿和四语 r1/r2 已核 |
| Lab PingLive 广告片：英语样片（`local_63d2f9b6`） | **Lab video creation** | 已合并：PingLive r1 等 Jason 看；Drive 里的 r1 文件还是 29.94 fps，下一轮重出 |
| 广告视频制作（`local_4a14ee51`，10-29） | **Lab video creation** | 停用：早期的广告片窗口，活都已经在 video creation 里 |
| 冰钓版本视觉效果（`local_2b04f455`，10-31） | **Lab 场景和声纳画面Base**（#195 改名，同一个角色） | 停用：它最后那个测试包 5764b06（鱼进波束）后来由 Base 接着做 |
| 手机网页端（`local_d6ee53cb`，10-31） | **界面设计** | 做完 / 停用：换上了 Jason 批的格子效果、去掉了 Paper Shaders；手机版以后归界面设计 |
| LiveScope 研究（`local_a8d1c270`，10-29） | 无（研究记在 `docs/livescope-study.md`、`docs/handover/chats/livescope.md`） | 做完 / 停用：Jason 回答过 7 个问题；画面差距要不要修是 backlog B6，归 Base |
| 案例工具调研（`local_6918c0f4`，10-29） | 无（`docs/handover/chats/case-tools.md`） | 停用：那边没找到记录，也没派过活 |
| 调研 mods：让确认事项更醒目（`local_86adc026`，10-30） | 无 | 做完 / 停用：调研了 5 种提醒方式，推荐 B（输入框上方横幅），什么都没装；要不要装是 backlog C1，等 Jason |
| 项目账户交接（`local_820e4d34`，11-04） | 无 | 停用：按要求暂停，没改也没提交任何东西 |
| HQ 的 btw 分支（`local_668c7a29`、`local_5b654c9e`、`local_4e481669`） | accuphy-visual-lab HQ | 停用：内容和 HQ 重合 |

有活的都已经在公司号的窗口里，这次不用新开窗口。以后要再做某件“停用”的事，在对应的公司号窗口里做。
