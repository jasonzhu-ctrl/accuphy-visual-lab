# 模糊格子：订阅后才打开（调研，2026-10-30，Lab HQ）

Jason 10-30：trigger 是访客点模糊格子 → 弹窗让他 subscribe → 成功后才打开。广告人群在 Meta 里设，随机投，不是只发给已有订阅者（他说之前“发给 subscriber”是搞错了）。要调研 Klaviyo 确认流程，以及 subscribe 后回来是否真能打开，手机 / iPad / 电脑各浏览器都要看。还没动代码。

## 现状
- 5 个模糊格子（Live Panoramic、Down Scan、Chirp Sonar、Ice Fishing、Live Ice Fishing）**后面没有画面**：Lab 没做这些视图。点开只有提示。
- 商店页已有 Klaviyo 留邮箱框 VpD3CV，20 秒自动出，进 Lab 名单 W24Qdc。
- Klaviyo 记录：W24Qdc 是单次确认（`handoffs/2026-10-26-opt-in-single.md`，还要读线上设置再核一次）。美加另两个名单现在是两步确认，不能用。
- `SignupGate.jsx`、`signup.js` 是旧的留邮箱卡，公开版关着，`listId` 没填。Jason 10-24 说过 Lab 这一层不要注册门，由 Klaviyo 漏斗决定（#139）；这次是他自己改方向，要告诉 Klaviyo HQ。

## 两种做法
1. **Lab 自己的卡（推荐）：** 卡在 Lab 里，用 Klaviyo 公开接口直接进 W24Qdc，成功立刻打开。商店框里、主题挂载、单独打开都能用；不用改网站主题。要补：同意文字 Klaviyo 定；Meta Lead 要网站把 Lab 的 signup 事件算进去。
2. **用 Klaviyo 表单：** Lab 经桥叫商店页打开表单（`_klOnsite.push(['openForm', id])`，要改成自定义触发），商店页听 `klaviyoForms` 的 submit 再告诉 Lab。要改网站桥；单独打开的 lab.accuphy.ca 没有 Klaviyo.js，用不了。Klaviyo 说自定义触发会跳过表单的定向和频率规则。

## 查到的限制
- 单次确认：不用去邮箱，回来这一步不存在。两步确认才会有“回来打不开”的问题。
- Lab 不能查“这人是否已订阅”（要私钥，不能放网页），只能在这台设备上记住。
- 记住靠浏览器存储。框里的存储按商店站点隔开，Safari 对这种存储可能不长久；在手机订了，电脑上不算。最坏结果是再填一次邮箱，不会重复订阅。
- 邮件里的 Lab 链接可带记号，一点就打开，能解决换设备（做法待定）。
- 假邮箱也能打开，单次确认防不住。

## 要实测的设备（都做完才算过）
Facebook / Instagram App 内置浏览器（iPhone、安卓，**广告落地就在这里**）；iPhone Safari、Chrome；安卓 Chrome；iPad Safari；Mac Safari、Chrome；Windows Edge / Chrome。每台测：弹窗输入键盘不挡、提交成功、打开、刷新后还开着、关掉再回来、进 Klaviyo 名单、Meta Lead 到。

## 待 Jason 定
打开之后给看什么：这 5 个格子现在没有画面。

## 文字（Jason 10-30 改的方向，法文待网站核）
- 第 1 步：标题 “The PingLive Mini sonar beam”；正文 “Drag the boat — anything inside the beam appears on your phone.”
- 第 2 步：“This is what PingLive Mini sees, live on your phone in the Accuphy Sonar app: the bottom, timber and fish.”
- 产品名跟设备变（PingLive / PingLive Mini）。

资料：Klaviyo [按钮触发表单](https://help.klaviyo.com/hc/en-us/articles/4418052317339)、[表单事件](https://developers.klaviyo.com/en/docs/track_klaviyo_form_activity_using_javascript)；WebKit [Storage Access](https://www.webkit.org/blog/8124/introducing-storage-access-api)。
