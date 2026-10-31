# Lab 结构自查（X-22，Lab HQ，2026-10-31）

总管交接单：`handoffs/2026-10-31-structure-self-check.md`。对照总管的两份：`IT/CHIEF Agent/reports/2026-10-31-lab-structure-proposal.md`（建议）和 `…/2026-10-31-lab-window-check.md`（检查）。
这次只核对、只写，没改结构、没挪文件、没改代码。数字是 10-31 下午在本机查的。

## 结论（先说）

1. 总管的“HQ + 引擎 + 页面 + 一次性窗口”分法**我同意**，它就是今天“收+换新”（方案 B）的目标样子。只有两处不同：
   - `SonarChrome.jsx` 不能整个划给页面；
   - 工作区（worktree）黑五后也要先试，不能直接上。
2. 总管列的风险，**大部分属实**。有两条今天已经解决或在解决：
   - 另一个 app 的同名窗口已停用；
   - 归档的窗口已经写了交接笔记。
3. **最该先做的（不影响干活，也不用 Jason 定）：**
   - 把项目外的 2 份笔记和“调研 mods”的结论拷进项目；
   - 新窗口开好后改正名单和编号。
4. **要 Jason 定的只有一件，现在问：** `reference/` 的 1.3 GB 素材要不要备份到共享盘。
   其余等黑五后，或者不做。

## 一、逐条核对总管的两份

| 总管说的 | 对不对 | 补充 / 更正 |
|---|---|---|
| 6 条线：引擎、页面、上线对接、广告、调研、同事改动 | 对 | 还漏一条：**多语言和店铺对接的文字**，法文要网站核。它属于页面线，但每次都要等网站 HQ，是最常卡住的地方 |
| 所有窗口挤在一个文件夹，共用 `index.jsx`、`i18n.js` | 对 | 10-20 以来：`index.jsx` 改了 43 次，`i18n.js` 16 次，`home/AppHome.jsx` 12 次。还有一个总管没写的共用文件：`SonarChrome.jsx`。#181、#189 是冰钓改的，横屏和返回键是手机网页端改的。两份交接笔记对它说法相反：冰钓说 Combo / range 逻辑归它，手机网页端说“绝不碰” |
| 10-26 撞过一次（914c570） | 对 | 那次是 HQ 自己用了不带路径的 `git commit`，不是两个干活窗口同时写同一个文件。规矩已改（`git commit -- <路径>`），之后没再撞过 |
| 冰钓 380 MB、HQ 90 MB | 对 | 冰钓今天写好交接，等换新；HQ 的问题见第三节第 3 条 |
| `docs/` 112 个文件、56 张图；`decisions.md` 3467 行；`backlog.md` 409 行 | 对 | 数字核过，一致 |
| `reference/` 1.3 GB 没备份 | 基本对 | 广告成片已在共享盘（Marketing → 05_Paid Ads）。没备份的主要是：`recordings/` 462 MB（真机录屏，最难再得）、`vivo-bursts` 61 MB、`app-study` 40 MB、LiveScope 帧 |
| 代码在 `src/experiments/…` | 对 | 一起在里面的还有 4 个早期试验文件夹（beam-shapes、sonar-beam、hello、sonar-fish-echo）。正式的只有 `2026-09-23-sonar-lake-3d` 和冰钓的包装 `2026-10-16-sonar-ice-3d` |
| `CLAUDE.md` 名单过时 | 对 | 今天已改回本 app 的编号，但还列着已归档的 4 个窗口。新窗口开好后一起改 |
| 交接笔记里指着另一套的编号 | 对 | 只有 `docs/handover/chats/mobile-web.md` 写了 `local_2b04f455`。换新时改 |
| 项目外 2 份笔记、“调研 mods”没交接 | 对 | 那个窗口在本 app 里联系不上。但它的记录文件还在本机：`~/.claude/projects/…-accuphy-visual-lab/c90f28cb-*.jsonl`，结论在另一套 HQ 的笔记 `2026-10-30-confirmation-alert-mods.md` 里。丢不了，只是不在项目里 |

## 二、各窗口管什么（换新之后的样子）

| 窗口 | 管什么 | 只归它的文件 | 共用文件和谁先改 |
|---|---|---|---|
| **HQ** | 统筹、backlog / decisions / versions、上线 lab.accuphy.ca、测试链接、对接网站 / Klaviyo / 总管、看同事的合并请求 | `docs/backlog.md` 状态栏、`docs/versions.md`、`docs/handover/`、`handoffs/` | 不写代码 |
| **引擎**（现“冰钓版本视觉效果”） | 湖景、声纳成像、鱼、地形、冰钓场景（#176） | `Scene.jsx`、`sonarShader.js`、`SonarScreen.jsx`、`lake*`、`terrain.js`、`fish*.js`、`rocks/vegetation/wreck.js`、`colormaps.js`、`ice*.js`、`IceCamp.jsx`、`snow.js` | `SonarChrome.jsx`：屏幕刻度、range、深度显示逻辑归引擎，按钮样子归页面 |
| **页面**（现“手机网页端”） | 手机和电脑界面、面板、分享、订阅解锁、去商店、徽章、店铺桥、打包、多语言 | `ShareButton/ShopButton/UnlockCard/GlassLayer/ViewIcon/SonarFan.jsx`、`AppBadges.jsx`、`embed.js`、`signup.js`、`home/`、`share/`、`scripts/build-*.mjs` | `index.jsx`：外壳归页面；Combo range 和视图状态归引擎。`i18n.js`：归页面，引擎要加字就交给页面 |
| **一次性窗口**（广告、调研、复查） | 按 Jason 的话开，做完写笔记归档 | 自己的文档和 `scripts/dev/<名字>/` | 不碰代码；广告只能从 `ad-video` skill 起步 |

**同时写共用文件的规矩：** 改 `index.jsx`、`i18n.js`、`SonarChrome.jsx` 之前，先发消息告诉另一个窗口和 HQ “我占用了”，提交后说“放开了”。这条 `CLAUDE.md` 里已有（“For multi-file work…”），换新时我在新窗口的开场简报里再写一遍。

**和总管的分法比：** 引擎 / 页面的划分我同意。不同意两处：
- `SonarChrome.jsx` 整个归页面。实际上 #181、#189 的逻辑在里面，要按上表拆成两半。
- 复查只用 HQ 的子代理。声纳对照（sonar-qa）要对着上一个提交跑网格，跑一次 15–30 分钟，还要会看图。我建议改动大的时候由引擎窗口自己跑，HQ 抽查图，不用子代理代替。

## 三、风险逐条：现在实际情况 + 建议

1. **同一文件夹多窗口写代码。**
   - 现在：两个写代码的窗口。共用文件按上表先占先改。
   - 建议：黑五前照旧。黑五后先拿一个小改动试 worktree，再决定要不要长期用。理由：
     - worktree 每次都要合并，测试服务器要分端口；
     - 测试链接只能从一个提交构建，合并出错反而更难查；
     - 我们只有两个写代码的窗口，冲突其实很少。
   - 要 Jason 定（黑五后）。
2. **两套登录里各有一个冰钓、一个手机网页端。**
   - 现在：总管 10-31 转告 Jason 的话“对，就用这个”，另一套停用。
   - 建议：写进 `CLAUDE.md` 一句：“另一个 app 的 Lab 窗口不再用；同一时间每条线只有一个窗口写”。换新时一起改，不用问 Jason。
3. **记录太长。**
   - 冰钓、手机网页端：今天换新。
   - HQ：我自己的记录也长（90 MB，已自动压缩多次）。建议黑五后 HQ 也照“收+换新”交接一次。现在换会打断 11-02 的上线协调。要 Jason 定（黑五后）。
4. **`docs/` 乱、`decisions.md` / `backlog.md` 长。**
   - 建议这周做两件，都不用问 Jason：
     - 新建 `docs/rules-now.md`，现在有效的规矩一条一行，新窗口先读它。
     - 把 `backlog.md` 状态栏下面 10-27～10-29 的长版原文挪到 `docs/archive/`。
   - **不同意现在挪 56 张图和调研文件：** `decisions.md` 和交接笔记里有几百处按路径引用它们，挪了链接全断。建议只让新图进 `docs/images/`，旧的不动。
5. **`reference/` 1.3 GB 没备份。**
   - 现在：只在这台电脑上，这台电脑本身也没有备份（全局规矩里写过）。
   - 建议：拷到共享盘 Accuphy Public Drive 的 Marketing 或一个 Lab 文件夹，`reference/README.md` 写清楚哪份在哪。
   - 要 Jason 定放哪（现在问）。
6. **项目外笔记、“调研 mods”没交接。**
   - 建议现在做，不用问：把另一套 HQ 的 2 份笔记拷进 `docs/handover/2026-10-31-recovery/extra/`，写一页“调研 mods 结论”指向它。
   - 注意：确认提醒方案（mods）影响所有项目的聊天，总管已知道。它本身还在等 Jason 定，不急。
7. **名单和编号过时。**
   - 新窗口开好后一次改完：`CLAUDE.md` 只列现有窗口；手机网页端笔记里的 `local_2b04f455` 改成新的引擎窗口编号；已归档的写进 `docs/handover/chats/` 的索引行。
8. **代码在 `src/experiments/`。**
   - 建议黑五后再定，而且价值不大。改名要动打包脚本、skill、交接笔记和几十份文档里的路径，还要整页重测。
   - 收益只是名字好看：新窗口靠 `CLAUDE.md` 就知道正式代码在哪。
   - 我的推荐是不改名，只在 `CLAUDE.md` 写一句“正式代码 = 这两个文件夹，其余是早期试验”。要 Jason 定（黑五后，一件事）。

## 四、先做什么

| 时间 | 做什么 | 要不要 Jason |
|---|---|---|
| 现在 | 做完“收+换新”（开新引擎、新页面窗口，挂在 HQ 下）；改名单和编号；拷项目外笔记和 mods 结论 | 开新窗口要 Jason 在 HQ 说一声（系统要求）；其他不用 |
| 现在问 | `reference/` 备份到共享盘哪里 | 要（一件） |
| 这周 | `rules-now.md`、backlog 长版原文挪走、新图进 `docs/images/` | 不用 |
| 黑五后 | 试 worktree；HQ 自己换新；代码文件夹改不改名 | 要，一次问一件 |
