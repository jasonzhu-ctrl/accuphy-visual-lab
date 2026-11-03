# MKT 版（带锁版 = 投放版）的链接规则：已定（Lab 营销版维护，最后整理 2026-11-03）

决定：#228（不覆盖 Base）、#229（规则和页面名）、#230（加上澳洲）、#218（店铺没有的语言放主站下）、#231（营销版维护）。
每个市场的完整链接只记在 `docs/lab-links-sheet.md` 第一节，这里只写规则。

## 规则

- **Base（不带锁）：**
  - lab.accuphy.ca `/`（PingLive，能切 Mini）、`/mini/`、`/ice/`（Jason：“很好 记住”）；#233 起由“网站嵌入版”的复制件打包；
  - 店铺各市场的 `<市场主页>/pages/lab` 嵌 Base；
  - 不用来投放。
- **MKT 版（带锁、投放用）：**
  - 店铺页面：`<市场主页网址>/pages/sonarlab-mktbf2026`；
  - 页面里嵌：lab.accuphy.ca/mktbf2026/。
- **店铺没有这种语言的市场（波兰、拉脱维亚，#218）：** 主站加语言，`https://shop.accuphy.com/pages/sonarlab-mktbf2026?lang=pl` / `?lang=lv`。
  - 网站给波兰加了波兰语页以后，波兰换成那一页。
  - `?lang=` 只换 Lab 的语言，店铺页其他地方还是英文。
- **10 个市场：** 加拿大英、加拿大法、美国（只出 Mini）、澳洲、法国、比荷卢荷、比荷卢法、德国、波兰、拉脱维亚。
  - 奥地利、瑞士用德国链接（网站 03 测过，不跳转）。拉脱维亚走主站还是 /en-ro，等 Jason 定。

## 为什么这样定

- 规则只有一条，跟着店铺现有的市场前缀走。页面是全店共用的，建一次，每个市场前缀都自动有。
- Base 的 `/pages/lab` 一点不动，两个版本同时在。广告投 MKT 链接；视频、素材、别的页面用 Base。
- MKT 页也在店铺里，所以去商店按市场走、统计事件（Meta、GA4、Klaviyo）照常，和 Base 页一样。
- Lab 的地址用 `/mktbf2026/`（#233，原来叫 /bf/），跟店铺页 `sonarlab-mktbf2026` 同一个名字，一看就知道是一对。

## 谁做（都经 HQ）

- **网站：** 建 `sonarlab-mktbf2026` 页面，用和 `/pages/lab` 同一个嵌入区块，地址改成 lab.accuphy.ca/mktbf2026/，不放菜单。要 Jason 在网站 HQ 说“动”。
- **Lab 营销版：** 打包 `/mktbf2026/`（`scripts/build-bf-site.mjs`）。lab.accuphy.ca/mktbf2026/ 上线要 Jason 在 Lab HQ 说“动”。
- **Klaviyo：** 只在 `/pages/sonarlab-mktbf2026` 上关掉 20 秒弹窗 VpD3CV，`/pages/lab` 照旧。

上线前要齐的全部东西：`docs/2026-11-03-mkt-go-live-checklist.md`。
