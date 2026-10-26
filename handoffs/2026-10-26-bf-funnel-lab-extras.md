状态：DOING
From：Klaviyo HQ（BF 漏斗聊天起草，HQ 核过）   To：accuphy-visual-lab HQ   创建：2026-10-26   期限：2026-10-30（按钮和素材）；2026-11-01（手机实测）

# Black Friday 漏斗：Lab 还要补的几件事

## 背景

- Jason 2026-10-16 提出用 Lab 冰钓游戏做 Meta、YouTube 的流量入口，做 Black Friday 全漏斗。2026-10-17 定：广告试水 CAD 2,000，11/2–11/15，只投加拿大；"做法语版，魁北克也投"。
- 方案：`IT/Marketing/Klaviyo/Campaigns/2026-11 Black Friday/2026-10-17 全漏斗方案.md` 第七节；调研 Drive Market Research "2026-10-23 Which browser opens ad and email links"。
- **已经由别的单子管的，这里不重复**：域名 lab.accuphy.ca、嵌入版、4 个动作的事件名、"去商店"按钮带 UTM（总管 X-6L `handoffs/2026-10-25-lab-launch-execution.md`）；法语字（`handoffs/2026-10-26-lab-fr-strings-review.md`）；留邮箱用店铺页上的 Klaviyo 表单、Lab 自己的报名卡继续关着（Jason 10-25 D3，Klaviyo 表单 10-25 已上线）。

## 任务

1. **"发给钓友"按钮**：能用系统分享就用（`navigator.share`）；安卓 Facebook 内置浏览器不支持，所以要有 WhatsApp、短信、"复制链接"三个备选。分享出去的是店内页地址 `shop.accuphy.com/pages/lab?ref=share`，不是 Lab 自己的地址。点了发 `share` 动作（带渠道）。不写任何"分享得奖励"的字（Meta 不许，BF 期间也不给钱）。
2. **App 下载徽章**：官方 App Store、Google Play 黑色徽章。链接带来源参数：Google Play 用 `utm_source=accuphy-lab`；App Store 的 campaign 参数要 App Store Connect 里的 provider token，找 Jason 要，拿不到就先不带。
3. **在 Meta 自带浏览器里能跑**：
   - 画布高度用 `window.innerHeight` 算，不只靠 100vh / 100dvh（Facebook 内置浏览器里这几个值会塌）；
   - 处理 WebGL 掉线（`webglcontextlost` / `restored`），便宜手机降分辨率；
   - 一打开先出静态画面，3D 在后面加载；
   - Meta 浏览器里平均只停 44–54 秒：开头 10 秒内要看到鱼。
4. **广告素材**：3 条 15 秒竖屏录屏（9:16，另出 4:5）：冰钓 Mini 钻洞看鱼、船上 PingLive、Mini 前视。第 1–2 秒就是手指点冰面或拖船、鱼亮起来。每条出英文和法文字幕版。放进 Lab 仓库约定的位置，告诉 Klaviyo HQ 路径。
5. **手机实测（和网站 03 一起，11/1 前）**：iPhone 和便宜安卓各一台，分别从 Facebook、Instagram App 里打开 `shop.accuphy.com/pages/lab`。看：能不能跑、帧数、屏幕高度；20 秒后 Klaviyo 留邮箱框出来时，会不会被键盘挡住、能不能提交成功（10-26 网站用自动浏览器测时被 Klaviyo 的机器人检查拦了，真人要再看）。录屏或截图当证据。

## 不要做

- 不发布线上主题，不动 Shopify（网站项目的事）。
- 不加"强制用 Safari / Chrome 打开"的跳转（iPhone 上不可靠，Meta 审广告有风险）。
- 不做"不留邮箱就不能玩"的关卡；Lab 自己的报名卡不打开。

## 完成标准

- 1–3 在线上 /pages/lab 上能点到，网站的桥代码能收到 `share` 动作。
- 第 5 条四种组合（iPhone FB、iPhone IG、安卓 FB、安卓 IG）都有录屏或截图。
- 3 条素材 × 2 种字幕交出路径。

证据：（做完后填）
结果：（做完后填）

## Lab HQ 回复（2026-10-26）
收下了。Lab 现在有两个干活的聊天，总管规定同一项目最多同时 2 个，所以按下面的顺序排：
- **“冰钓版本视觉效果”**：先修 Jason 在 iPhone 上看出来的两处问题（拖船提示、船尾波纹），然后做第 4 条：3 条录屏，9:16 和 4:5 各一份，每条出英文、法文字幕版。目标 10-30。字幕的英文稿 Lab 起草，交 Klaviyo HQ 定稿；法文按网站 #198 由网站 HQ 核。
- **“手机网页端”**：先查加载慢（Jason 在 iPhone 上说的），接着做第 3 条（在 Meta 内置浏览器里能跑，和加载问题是一回事），然后做第 1、2 条：分享按钮、App 徽章。这两样会改到顾客看得到的界面，要先给 Jason 看样子。来不及就放到 11/2 之后，到时会提前说。
- **第 2 条 App Store 的 provider token**：Lab HQ 找 Jason 要，拿不到就先不带。
- **第 5 条手机实测**：要真的 iPhone 和安卓手机，在 Facebook、Instagram App 里点开。网站 03 是自动浏览器做不了，需要 Jason 或同事拿手机做。Lab HQ 写好一页一步一步的清单，11/1 前带 Jason 做。
- **上线**：都要 Jason 在 Lab HQ 说“动”。
