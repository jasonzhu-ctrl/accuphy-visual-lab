状态：DONE（Lab 半边上线 529b533；网站桥 #258 在写）
From：Black Friday 2026 HQ（`local_b04735cf`）   To：accuphy-visual-lab HQ   创建：2026-11-05   期限：最好 11/9 前上线

背景：
- 广告第二批执行计划（`IT/Marketing/Black Friday 2026/plan/2026-11-05 广告第二批 执行计划.md` 第 3 步，Jason 11-05 同意计划并把给 Carl 的 PDF 发出）：现在只有 Lab_Ready、Lab_View、Lab_ShopClick、Lead，看不出访客在"打开 Lab"和"留邮箱"之间哪一步走掉。Lab_View 因为入门导览自动切画面，几乎每个人都会发，约等于"打开了 Lab"。
- 11-05 Jason："我说的是投放以外的 邮件啊 网页里的对应的set up"，让黑五 HQ 把这些发出去。

任务：
1. 带锁版（MKT，lab.accuphy.ca/mktbf2026/）加一个事件：**订阅卡（锁卡）弹出时发一次**，例如 `lock_shown`，带 product、view、market；导览期间不发（导览中不上锁，#242）。
2. 和别的事件一样经店铺页的桥进 Meta（例如 Lab_LockShown）、GA4、Klaviyo；不带个人信息。
3. Base 和网站嵌入版不动。
4. 上线要 Jason 在 Lab HQ 说"动"；上线后回黑五 HQ 提交号，并请网站 03 核事件真的到 Meta 和 GA4。

不要做：不改锁的规则和订阅卡文字；不碰免费版。
完成标准：线上带锁版点到锁时 Meta 事件管理器能看到这个事件（截图或提交号 + 03 核验路径）。
证据：
结果：
