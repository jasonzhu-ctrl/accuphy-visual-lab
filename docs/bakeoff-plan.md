# 对比试验：把 Lab 复制给别家 AI（已存档，未开始）

> Jason 2026-10-23："如果我想把这个项目单独从这个version开始让别的ai模型去跑 … 应该怎么做 给他什么东西 给他什么access"；
> 回答：别家的 AI 工具（Codex / Cursor / Gemini 这类）、复制成新仓库、用来做对比试验。计划写好后 Jason："先存档不做"。
> **没有 Jason 的明确开始指令不要动手。** 起点版本是 main `a773abf`（#120）；开始时先和 Jason 确认是用这个版本还是当时最新的 main。


## Context
Jason 想让一个别家的 AI 工具（Codex / Cursor / Gemini 这类）从现在的版本（main `a773abf`，含 #120 鱼的新画法）
开始，在一个**独立的新仓库**里做同样的事，和我们这边**对比**。

现状里有三个会让对方"起跑不公平"或"泄露东西"的问题：
1. **测试工具不在仓库里。** fishlab 抓图、6×6 grid、前后对比、冰钓实时抓图、拼图这些脚本都在我的临时目录
   (scratchpad)，容器一重置就没了；对方拿到仓库也没有这些工具。
2. **规则写给 Claude 的。** `CLAUDE.md` 和 `.claude/skills/` 别家工具不会自动读；里面还有多对话协作、RMA 这类对它
   没用的规则。别家工具读的是 `AGENTS.md`。
3. **仓库里有公司业务数据。** `docs/market/`（营收、订单、省份分布、Zoho/Klaviyo 数据、Klaviyo 备份）和
   `docs/users-and-market.md` 不该交给第三方 AI；而且它们在 git 历史里，所以不能直接复制整个仓库历史。

## 我会做的事（你批准后）
1. **固定起点**：主仓库打标签 `bakeoff-start` → `a773abf`。
2. **把测试工具放进主仓库** `scripts/dev/capture/`（走 PR，两边用同一套工具，我们这边以后也不会再丢）：
   `fishcap` / `fishshot`（?fishlab 抓图）、`grid`（6 点 × 6 视图 + 亮度直方图）、`icereal`（冰钓页实时抓图）、
   `tile` / `sheet`（拼图、中文对比图）。改成可移植：Playwright 作为 devDependency、相对路径、一页 README
   写清用法和坑（Tailwind 改任何文件都会刷新页面、最多同时开 2 个浏览器、冰钓页要用实时模式）。
3. **做一份干净副本**（新历史，只有一个起始提交）：
   - **带上**：`src/`、`public/`、`share/`、`scripts/`、`reference/app-study/`（43 张 app 实拍截图）、配置文件、
     和画面相关的文档（`sonar-style.md`、`decisions.md`、`lessons.md`、`backlog.md`、`livescope-fish-research.md`、
     `app-chrome.md`、冰钓/手机排版方案等）。
   - **去掉**：`docs/market/`、`docs/users-and-market.md`、`docs/mobile-marketing-plan.md`、
     `docs/signup-klaviyo-plan.md`、整个 git 历史；`CLAUDE.md` 换成下面的 `AGENTS.md`。
   - **新增 `AGENTS.md`**（通用说明，Codex/Cursor 直接读，Gemini 加一行 `GEMINI.md` 指向它）：技术栈和运行命令、
     "app 实拍是真相 > LiveScope > 感觉"、验收流程（改前改后同场景对比、grid、湖和冰钓互查）、不碰 Shopify、
     不发布任何链接、决定记录用 `B1、B2…` 编号（合并回来不撞号）、用中文白话跟 Jason 汇报。
     三个 skills 原样保留为 `docs/procedures/*.md`，AGENTS.md 指向它们。
   - **新增 `BAKEOFF.md`**：任务原文（你写，同一段话给双方）、交付物、评判方法（见下）。
4. **新仓库**：你在 GitHub 网页上建一个**私有空仓库**（例如 `accuphy-lab-bakeoff`，不勾 README）——我这边的
   GitHub 权限只覆盖现在这个仓库，这一步要你点；建好后我把它加进本会话并推送副本。

## 给对方什么权限
- **给**：只有新仓库的读写；能装 npm 包、能访问 GitHub 的网络；Node 22 + Chromium（Playwright）用来截图。
  最好在**有显卡的电脑**上跑（你的 Mac）——云端无显卡环境里冰钓页会崩，我们这次就遇到了。
- **可选**：YouTube（让它真去看 LiveScope 视频——我这边被拦了，这一点它可能占优）；
  Drive 里 app 录屏文件夹的**只读**链接（`reference/recordings` 不在 git 里，`reference/README.md` 有路径）。
  要公平的话，两边给一样的东西。
- **不给**：主仓库 `accuphy-visual-lab`、公开测试页仓库 `accuphy-lab-test`、`accuphy-website`、Shopify、Klaviyo、
  Gmail、Zoho、整个 Google Drive、claude.ai 预览链接。**不需要任何密钥**（Lab 是纯前端，Klaviyo key 本来就是空的）。
  发布权不给：它只交分支和图，好的结果由我们这边合并、检查、发布。

## 怎么比才公平
- 同一个起点标签、同一段任务原文、同样的参考图和工具、同样的验收清单、差不多的轮数/时间。
- 双方都交：一张前后对比图（同一个 `sheet` 模板、同样的 `?fishlab` 场景）、6×6 grid、改了哪些文件、一条决定记录。
- **盲评**：我把两边的图标成 A / B 给你，不说哪个是谁的。
- 任务建议二选一：①下一个真实任务（比如手机竖屏/横屏排版、或各鱼种的特征），双方都从 #120 开始；
  ②"重放"：从 #120 之前的 `78d307c` 给它你那句"鱼是椭圆的球"的原话，直接和我们的 #120 比。

## 结果怎么拿回来
赢的部分由我从新仓库拉它的分支，挑着合并进主仓库：走 PR、跑 sonar-qa、写决定记录、按你的话再发布。
它不直接碰主仓库。

## 验证（做完后我会逐条跑）
- 新仓库在空目录里 `git clone` → `npm ci` → `npm run dev` 能开、`npm run build` 通过。
- `scripts/dev/capture/grid.cjs` 出满 36 张图、`fishcap ... &fishlab` 出图、`sheet` 出中文对比图。
- 副本里 grep 不到 `docs/market`、营收/订单数字、Klaviyo 备份；`AGENTS.md` 里每条命令在干净目录试一遍。
- 关键文件：`scripts/dev/capture/*`（新）、`AGENTS.md`、`BAKEOFF.md`（新仓库）、主仓库 `docs/decisions.md`（用当时下一个空号记录这次做法；#121、#122 已被别的对话用掉）。
