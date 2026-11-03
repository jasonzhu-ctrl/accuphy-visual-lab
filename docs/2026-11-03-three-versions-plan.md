# 三个版本：Base、网站嵌入版、MKT 版（Lab HQ，2026-11-03，Jason：“好的，可以的。可以”，#233）

> MKT 版后台地址定为 **lab.accuphy.ca/mktbf2026/**（原 /bf/）。下文的 /bf/ 都读作 /mktbf2026/。

Jason 11-03：“命名 明确 lab叫网站嵌入版 我觉得这个也可以单独开个窗口专门弄”；卡片“网站嵌入版跟 Base 是同一份代码吗？”→“单独复制一份”。

## 三个版本

| 名字 | 是什么 | 代码在哪 | 网址 | 谁管 |
|---|---|---|---|---|
| **Base** | 场景和声纳画面的本体，不带锁；录视频、做素材、新功能都先在这里做 | `src/experiments/2026-09-23-sonar-lake-3d/`（不变） | 测试链接 jasonzhu-ctrl.github.io/accuphy-lab-test/（`/`、`/mini/`、`/ice/`），给 Jason 和视频用 | Lab 场景和声纳画面Base |
| **网站嵌入版** | 客人在店里看到的、不带锁的 Lab | 新复制一份：`src/experiments/2026-11-03-sonar-lake-web/`，从现在线上的 96fdc22 复制 | lab.accuphy.ca/（加 `/mini/`、`/ice/`），嵌在店铺各市场的 `/pages/lab` | 新窗口 “Lab 网站嵌入版” |
| **MKT 版** | 带锁，投放用 | `src/experiments/2026-11-03-sonar-lake-bf/`（已有） | lab.accuphy.ca/bf/，嵌在店铺的 `/pages/sonarlab-mktbf2026` | Lab 营销版 |

## 规矩

- 三份代码各改各的，谁都不碰别人的文件夹。
- Base 有了改进，要不要搬进网站嵌入版、MKT 版，每次由 HQ 问 Jason，说“搬”才搬（跟 #216 一样）。
- 营销版、网站嵌入版都不覆盖 Base（#228）。
- 上线：lab.accuphy.ca 上的网站嵌入版和 MKT 版，都要 Jason 在 Lab HQ 说“动”；HQ 打包、部署、核对。
- 跟网站、Klaviyo 的协调都经过 HQ。

## 新窗口 “Lab 网站嵌入版” 管什么

- 复制件 `2026-11-03-sonar-lake-web/` 和它的打包。
- 店铺里的 Lab：各市场 `/pages/lab` 的链接表（`docs/lab-links-sheet.md` 里网站嵌入版那部分）、店铺和 Lab 之间那段通信程序（复制件里的 `embed.js`）、上线清单和上线后的核对。
- 各市场的语言：多语言窗口核好的字，放进网站嵌入版（也放进 Base，留作底本）。
- 不碰：Base（场景和声纳）、MKT 版、Shopify。

## 现在的东西怎么迁

- 线上 lab.accuphy.ca 现在就是 96fdc22，网站嵌入版从这一版复制，所以客人看到的不变。
- 打包程序 `scripts/build-bf-site.mjs` 改成：`/`、`/mini/`、`/ice/` 从网站嵌入版打；`/bf/` 从 MKT 版打。由营销版和新窗口一起改，HQ 核 md5。
- 测试链接改成专门看 Base；网站嵌入版、MKT 版的测试另放 `/web/`、`/bf/`。
- “营销和外部系统对接”：店铺通信、统计事件的测试照旧由它做，三个版本都测。
- 要改的记录：`CLAUDE.md` 窗口表、`docs/version-sheet.md`、`docs/lab-links-sheet.md`。

## 要 Jason 定

1. 照这个方案做吗？（说“动”）
2. 地址：MKT 版留 `/bf/`，还是改成 `/mkt/`？
