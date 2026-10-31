状态：DONE（Lab HQ 2026-10-31）
From：项目总管 | CHIEF Agent（IT/CHIEF Agent）   To：accuphy-visual-lab HQ（local_1022478a）   创建：2026-10-31   编号：X-22

# 先自己理一遍：各窗口管什么、哪里可能出问题

## 背景

Jason 2026-10-31 在总管聊天：“调研一个这个项目的事项和整体最合适的结构 文件夹管理 和窗口结构”。总管写了建议：`IT/CHIEF Agent/reports/2026-10-31-lab-structure-proposal.md`（检查记录 `reports/2026-10-31-lab-window-check.md`）。

Jason 接着说：“那要不要让他自己先整理确认一下各个窗口的责任和你说的这些可能有问题的情况”。

## 任务（只核对、只写，不改结构）

1. 读总管那两份。逐条说对不对、漏了什么（你比总管清楚 Lab）。
2. 写一张表：每个窗口（HQ、冰钓、手机网页端，以及按需开的广告、调研等）负责哪些事、哪些文件归它、哪些是共用文件、谁先改。和总管建议的“引擎 / 页面”分法比，说你同意哪里、不同意哪里。
3. 逐条核对总管列的风险，写现在实际情况和你的建议：
   - 几个窗口在同一个文件夹改代码，共用 `index.jsx`、`i18n.js`；
   - 两套登录里各有一个冰钓、一个手机网页端；
   - 冰钓、HQ 的记录太长；
   - `docs/` 太乱、`decisions.md` 和 `backlog.md` 太长；
   - `reference/` 1.3 GB 没有备份；
   - 项目外的笔记（`~/Library/Application Support/Claude/side-session-notes/local_47bc36c3…/` 2 份）、另一套“调研 mods”窗口没有交接；
   - 交接笔记和 `CLAUDE.md` 里还写着另一套或已归档窗口的编号；
   - 代码在 `src/experiments/…` 下。
4. 写成一份 `docs/2026-10-31-structure-self-check.md`：你的结论、你建议先做什么、哪些要等黑五后、哪些要 Jason 定（一次一件）。

## 不要做

- 不改窗口结构、不挪文件、不改代码、不碰线上。你已经在做的“收+换新”（Jason 选的 B）照常做完。
- 不新开窗口做这件事，你自己核对就行（要读大量文件可以用子代理）。

## 回报

`X-22 | 结果 | 文件路径 + 提交号 | 需要谁做什么`，用 SendMessage 发给“项目总管 | CHIEF Agent”（local_88265dd9-3ef4-4076-8fbb-0aa0c44e209a）。

## 结果（Lab HQ，2026-10-31）

见 `docs/2026-10-31-structure-self-check.md`。只核对、只写，没改结构。
