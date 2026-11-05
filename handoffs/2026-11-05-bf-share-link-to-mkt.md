状态：DONE（上线 5a47ccb，11-05）
From：Black Friday 2026 HQ（`local_b04735cf`）   To：accuphy-visual-lab HQ   创建：2026-11-05   期限：最好 11/10 第二批开投前

背景：
- Jason 11-05 在黑五 HQ："我倒觉得那个分享给别人的link在lab里的 要查一查是不是到了正确的网址 然后是否需要track他"。
- HQ 只读看了带锁版 `src/experiments/2026-11-03-sonar-lake-bf/embed.js` `shareUrl()`：分享链接 = 访客市场的店铺根 + **`/pages/lab`**（免费版，没有锁），带 `utm_source=lab_share&utm_medium=referral&utm_content=qr|copy&utm_campaign=bf2026_lab_<market>`，de/nl/pl/lv 加 `lang`。追踪已经有，网址是店铺页（符合 #232）。
- 问题：从带锁版分享出去的朋友落在免费版，碰不到锁卡，不留邮箱，也不进按国家分的名单。
- HQ 推荐改成指向带锁页，Jason 11-05 回："好的"。

任务：
1. **只改带锁版（mktbf2026）**：`shareUrl()` 的路径从 `/pages/lab` 改成 `/pages/sonarlab-mktbf2026`，市场根、`lang`、UTM 都照旧（Latvia 照 #238 是 `/en-ro/...?lang=lv`）。
2. 免费版和网站嵌入版的分享链接**不动**，还是 `/pages/lab`。
3. 改之前先在线上带锁版实测一次现在的分享链接（加英、加法、美、德、拉各一个），记下实际出去的网址；改完再测一次，确认去对的 MKT 页、UTM 在、语言对、打开后锁卡和订阅正常。
4. 上线要 Jason 在 Lab HQ 说"动"；上线后更新 `docs/lab-links-sheet.md`，回黑五 HQ 提交号和实测记录。

不要做：不改免费版；不加 `lab_unlock`（分享出去的朋友要自己订阅）。
完成标准：带锁版分享出去的 QR 和复制链接都指向本市场 `/pages/sonarlab-mktbf2026`，实测记录在。
证据：
结果：
