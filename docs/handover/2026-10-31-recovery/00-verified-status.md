# Lab 交接恢复：核过的状态（2026-10-31，accuphy-visual-lab HQ）

写的人：accuphy-visual-lab HQ，聊天 `local_1022478a-b63a-4fff-8403-7c58646dab95`，在旧 app 的会话列表里。新 app 里那个 HQ（`local_47bc36c3-…`）13:34 用量到上限停了，从这里查不到也发不了消息。
原始材料不动。`01-original-hq-report-to-chief.md` 是那个 HQ 停之前发给总管的回报原文，本文件在它的基础上逐条核对。

## 1. 原交接做到哪里

- 13:31 总管开始全公司归档：`IT/CHIEF Agent/_handoff/2026-10-31-1331/`。目前只有 `02-organization.md`，`feedback/` 是空的，总管那边**没做完**。
- IT-HR 已存好自己的归档：`IT/accuphy-it-hr/docs/handover/2026-10-31-1335/`。
- Lab HQ 13:33 用消息给总管发了状态回报（发送成功，原文见 01），但**没有存进 Lab 自己的文件**。现在由本文件补上。
- 发完回报后，Lab HQ 把测试链接更新到 5764b06。这一步**已经完成**（核对见第 2 节），然后停在给 Jason 回话之前。

## 2. 已核（本聊天 10-31 亲自查过）

| 事项 | 证据 |
|---|---|
| 本机 main 干净，和 origin 一致，最新提交 c3e359a | `git status -sb`，`git ls-remote origin` |
| lab.accuphy.ca 是 5c2e69a | `/`、`/mini/`、`/ice/` 三页的 md5 和测试仓库 30df2bd 里 5c2e69a 那次构建逐字节相同 |
| 测试链接是 5764b06（#193 鱼游进波束测试版，含 #192） | 三页 md5 = 测试仓库 7d52e0c 的文件；c3e359a 已记进 versions.md 和 backlog |
| 代码只推到了 jasonzhu-ctrl | origin 和 personal（都是 jasonzhu-ctrl/accuphy-visual-lab）的 main 都是 c3e359a；**公司组织 accuphy-marketing 的 main 停在 be9b66e（10-29）**，落后约 60 个提交 |

## 3. 没核（只来自文件或别的聊天自报）

- #192 面板改版：Mini 和冰钓链接只核了 md5，弱电脑、Firefox、真机 Safari 都没测。
- #193 鱼数：只看了对比图和冰钓聊天的报告，HQ 没有自己测。已知没达标的地方见 01 第二节第 3 条。
- #191 订阅解锁：测试版，上线前的清单见 backlog。
- 新 app 里的干活窗口（冰钓 `local_2b04f455-…`、手机网页端 `local_d6ee53cb-…`、广告、LiveScope、案例工具、confirm-mods）：这里查不到，也联系不上，它们的状态只来自 10-31 的列表。
- 旧 app 里同名的窗口（冰钓 `local_9a5a9e56-…`、手机网页端 `local_b65bc15d-…`、广告 `local_8de4116d-…`）还在，但停在 10-29，不知道 10-30、10-31 的事。**不给它们派活，免得用旧状态改代码。**
- 孙英杰（AJ-nb）的分支进度：没核。

## 4. 和以前的理解相比，变了什么

- 10-29 晚 Jason 把各 HQ 搬到个人 Claude 账号的新 app（网站：`accuphy-website/docs/handover/2026-10-29-hq-to-personal-account.md`）。Lab 的 10-30、10-31 工作都是新 app 里的 HQ 做的。
- 已上线：#189 Mini Combo 两个 range + #188 分享改版（10-30，a1fd3ee），然后 #190 美国只出 Mini（10-30，5c2e69a，网站 03 复查过）。
- 新决定：#190–#193。PR #30、#31 只作参考、不合并（Jason 10-30）。问题一律用卡片（记忆 questions-as-cards）。主管用 Opus medium，干活聊天用 Sonnet（总管 10-31，protocol §0）。
- **规矩冲突（要 Jason 定）：** 10-27/28 Jason 要仓库放在公司组织 accuphy-marketing，好让同事基于他的代码改（`handoffs/2026-10-28-repo-moved-to-org.md`，#183）。10-29 他在一个 Lab 聊天里说“抓回到 jasonzhu-ctrl”，之后所有提交只推到 jasonzhu-ctrl。总管的 `02-organization.md` 写的是“accuphy-marketing，本地=远端”，和实际不符。同事现在看到的是 10-29 的旧代码。

## 5. 待办和负责人

| # | 事项 | 状态 | 负责 | 下一步 |
|---|---|---|---|---|
| 1 | 11-02 开投前，#191、#192、#193 哪些上线 | 待批准 | Jason → Lab HQ | 他在 Lab HQ 说“动”，HQ 从一个提交构建上线 |
| 2 | #193 没达标的地方接不接受 | 待批准 | Jason | 看测试链接 |
| 3 | 追踪：CAPI 选 A/B/C，app_badge、UTM、identify | 待批准 | Jason（网站 HQ 牵头） | `accuphy-website/docs/2026-10-30-lab-tracking-check.md` |
| 4 | 玻璃效果、确认提醒方式、版本管理、LiveScope 7 问、删 pr30/pr31、Combo 手机放平 | 待批准，不急 | Jason | 见 backlog |
| 5 | 公司组织仓库落后 | **冲突，要 Jason 定** | Jason → Lab HQ | 见第 4 节 |
| 6 | 总管 `_handoff/…/feedback/` 里 Lab 那份 | 缺 | 总管 | Lab 这边的内容就是本文件和 01 |
| 7 | 干活窗口在哪个 app 继续 | 缺 | Jason | 新 app 回来以后，新 app 的 HQ 读本文件接着做 |

## 6. 这次恢复没做的事

没改业务文件，没重置 git，没上线，没推测试链接，没给干活窗口派活。
