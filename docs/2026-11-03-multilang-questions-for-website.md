# 给网站 HQ 的问题：Lab Base 版 5 种语言（#212，Lab 多语言窗口起草，2026-11-03）

**经 Lab HQ 转。** Lab 多语言窗口不直接发给网站；下面“正文”由 Lab HQ 写进 `accuphy-website/handoffs/` 或照它的格式转。

---

## 正文（可以直接转）

From：accuphy-visual-lab HQ   To：accuphy-website HQ   创建：2026-11-03
背景：Jason 11-03 定了给 Lab 的 Base 版（lab.accuphy.ca 的 `/` 页，店铺 /pages/lab 嵌的就是它）做法、德、荷、波兰、
拉脱维亚 5 种语言（Lab #212）。你们 10-28 改的店铺框已经会传 `lang`（en/fr/de/nl/pl/lv，网站 #228），所以 Lab 一认德语、
荷兰语，/de-de 和 /nl-benelux 的 Lab 会自动变过去。Lab 要先核完字再上线。

对照表：`IT/accuphy-visual-lab/docs/2026-11-03-lab-strings-5lang.md`（约 60 条，英 + 5 种语言；法语已核的照抄，其余是机器草稿）。
这次只想先问清楚 3 件事，字表还不用核：

1. **德语、荷兰语、法语：你们怎么翻、谁核？**
   - 还是照 #198 的顺序（线上已核原文 → glossary → 大品牌）由网站 HQ 核吗？德、荷的店铺原文以哪个页为准（/de-de、/nl-benelux）？
   - 称呼：德语用 Sie 还是 du？荷兰语用 u 还是 je？（草稿先用了 Sie、je）
   - 法语这次只剩十几条草稿（新按钮、教程、岸边提示、分享框几句），能和德、荷一起核吗？
2. **波兰语、拉脱维亚语谁能核？** 网站的 glossary 没有这两列，总管的 C4 也还没定。以前提过请代理商看（拉脱维亚是 Slanpo）。
   网站这边有人或有路子吗？没有的话，Lab HQ 就把这件事报给总管，用卡片问 Jason。
3. **Accuphy Sonar App 有没有德、荷、波兰、拉脱维亚语界面？有的话原字在哪？**
   - 你们 10-26 解析安装包（0615 dev 版）时在 glossary 的 `app-view-names` 一行记了 “the app has de/fr/ja/pl/ru/zh, no nl/ro/es”。
     现在的 App 还是这样吗？有没有更新的安装包加了荷兰语或拉脱维亚语？
   - 如果有德语、波兰语：能不能像法语那次一样，从安装包取出这些字的原文给 Lab：首页格子 Panoramic View、Forward View、
     Down View、Live Panoramic、Live Forward、Live Down、Live Combo、Down Scan、Chirp Sonar、Ice Fishing、Live Ice Fishing，
     底栏 Setting / Home / Map；再看 App 的 Live Combo 有没有 “FORWARD / DOWN” 这类小字。
   - App 没有的语言（看来是 nl、lv），手机框里照规矩留英文，跟客人买回去看到的一样。你们同意吗？

不要做：现在不用核字表、不改 Lab 的代码。回答写在本单下面就行；字表要核时 Lab HQ 另发一张。

## Log
- 2026-11-03 Lab 多语言：起草，交 Lab HQ。
