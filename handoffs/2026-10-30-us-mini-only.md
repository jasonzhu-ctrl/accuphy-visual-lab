状态：DONE（5c2e69a，网站 03 复查通过）
From：accuphy-website HQ   To：accuphy-visual-lab HQ   创建：2026-10-30   期限：11-02 广告开投前（美国黑五）

# 美国访客只给 PingLive Mini 版本的 Lab

背景：
- 03 10-30 用美国 IP 测线上 /en-us/pages/lab：按钮写 “Shop PingLive”，点了落到 PingLive Mini 页（店铺 302 转址）（证据：accuphy-website `docs/verification/2026-10-30-lab-a1fd3ee/result.md` 第 28 行）。
- Jason 2026-10-30 在网站 HQ 回复这件事，原话：“美国只能给只有PingLive Mini的版本”。
- 美国到 2027 年 2 月前不卖大 PingLive，只卖 Mini（网站决定 #226）。

任务：
1. 店铺框里 `market=us` 时（网站的桥已经传了），Lab 只出 PingLive Mini：不出大 PingLive 的产品选择，按钮写 Mini，不让美国访客看到或选到大 PingLive。
2. 分享链接、二维码在美国也要落回 Mini 版本。
3. 怎么做、改到哪些文件由 Lab 定；有多种做法且结果不同，由 Lab HQ 问 Jason。

不要做：不改网站主题文件；桥要改就写交接单给网站 HQ。

完成标准：美国 IP 打开 /en-us/pages/lab，全程只见 PingLive Mini，“去商店”到 /en-us/products/pinglive-mini。

批准：Jason 的原话是方向。上传 lab.accuphy.ca 仍要他在 Lab HQ 亲口说“动”。

证据：docs/decisions.md #190；docs/2026-10-30-us-mini-only.jpg
结果：
- 2026-10-30 手机网页端：代码做完（#190，embed.js miniOnly + index.jsx）。店铺框和主题挂载两条路，market=us 都只见 Mini，按钮和跳转都是 Mini，分享链接回 /en-us/pages/lab；加拿大、德国、/fr、独立打开不变。桥不用改。还没上测试链接和线上（HQ 负责，等 Jason“动”）；上线后告诉网站 HQ，03 用美国 IP 复查。
- 2026-10-30 网站 03：线上 5c2e69a 复查通过。美国 IP /en-us/pages/lab 电脑、手机：大 PingLive 字样 0 处（第一屏、进视图后、分享弹框），只有 PingLive Mini，“去商店”只跳 1 次到 /en-us/products/pinglive-mini，分享链接和二维码都回 /en-us/pages/lab（utm_campaign=bf2026_lab_us）。加拿大 /pages/lab、/fr/pages/lab 没变。无 Lab 报错。证据：accuphy-website `docs/verification/2026-10-30-lab-5c2e69a/result.md`。
