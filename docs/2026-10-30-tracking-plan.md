# Lab 数据追踪方案（草案，2026-10-30，Lab HQ；还没动）

目标（Jason）：按国家看邮件打开、点击，到站后一连串动作；方案要可行，不行就换思路。
结论：四个缺口都有可行做法。三件事做不到完美，写在“做不到的”。

## 1. App 徽章点击
- 现状：Lab 发 `app_badge`（带 store），桥的表里没有，哪都不进。
- 做法：桥加一行（已和网站提）。Meta、GA4、Klaviyo 都收到。
- 再进一步（下载数）：App Store 链接加 `pt`、`ct`（按市场分，比如 `lab_us`、`lab_ca`）。Apple 后台能看下载，24 小时后出数，至少 5 次首次下载才显示。provider token 从 10-26 起等 Jason。
- Google Play：要 App 自己读 Install Referrer。App 是杭州的，不主动联系，所以先只看点击。
- 不行就换：只看点击，不看下载。

## 2. UTM 跟到每个事件
- 现状：UTM 进了 iframe 网址，事件字段里没有。
- 做法：桥在店铺页读 utm_source / medium / campaign / content，存在本次访问里，加进 `normalize()`。只改桥，不改 Lab。
- GA4 要把 market、product、view、utm_* 注册成自定义维度，不然报表看不到。这一步要查。
- 不行就换：GA4 用会话来源（店铺页自带），Meta 用广告后台自己的数字；Klaviyo 看 `signup_market` 和名单。

## 3. Klaviyo 认得这个人
三类人分开：
- **点邮件来的：** Klaviyo 链接带 `_kx`，店铺页的 Klaviyo 脚本自动认人，事件就记到资料上。不用开发，要实测。
- **在 Lab 新订阅的：** 邮箱进了 Klaviyo，但店铺页不知道是谁。
  - 做法：订阅成功后 Lab 单独发一条消息给店铺页，**目标写死店铺网址，不用 `*`**，桥收到后 `klaviyo.identify({email})`。事件 `signup` 里继续绝不带邮箱。
  - 好处：之后在商店的浏览、弃购流程也记得上；官方文档说匿名行为会在认出后补上，要实测。
  - 不行就换：Lab 用 Klaviyo 客户端事件接口直接发，带邮箱和公开 key，只管本次访问。缺点是商店里的行为记不上。
- **没订阅的广告访客：** 不认人是对的，只看总数。

## 4. Cookie 同意比例
已有事实：
- Ontario 实测：无横幅，marketing、analytics 都是 yes（网站 10-27）。
- 要同意的只有 BE DE EE FR LT LU LV NL PL RO；美国 15 个州有“数据出售退出”。
- 商店后台 Cookie banner 到底开没开，10-27 起没人查（Customer privacy 页面）。
所以加拿大、美国几乎都算同意，丢数据的主因是广告拦截和 iOS 限制，不是 Cookie。
- 做法一（不用开发）：Shopify 的 Lab 页 sessions 按国家 ÷ GA4 `lab_ready` 按国家，得到丢失比例。
- 做法二（要批）：Lab 开 Vercel Web Analytics，只算总数，按国家。要先核：是否不用 Cookie、team 的方案、费用。
- Meta Lead 现在只走浏览器 fbq，没有服务器一路。要查 Facebook 应用的服务器回传（CAPI）是否覆盖；否则 Lead 会少算。Carl 的广告按 Lead 优化，这条最重要。

## 按国家看的报表
一张周表，Klaviyo HQ 出：国家 | 发送 | 点击 | Lab 打开 | 拖船 | 看视图 | 解锁 | 去商店 | App 徽章 | 加购 | 下单。
- 用**点击**不用打开：Apple 邮件隐私保护会虚报打开。
- 前两列来自 Klaviyo，中间来自 GA4，后面来自 Shopify。

## 做不到的
- 一个人换设备后，除非点邮件或再填邮箱，否则算两个人。
- 广告拦截和 iOS 限制，总有一部分看不到；只能估比例。
- 假邮箱能解锁，也会算一个 Lead。

## 怎么验收（全过才算）
用测试邮箱（Jason 批），加拿大、美国各一次，手机内置浏览器 + 电脑：
1. 带 UTM 进页面，GA4 DebugView、Meta 测试事件、Klaviyo 三处事件都带 market 和 UTM。
2. 点徽章，三处都有。
3. Lab 订阅：W24Qdc 有人，资料上有 lab_scene、signup_market，之前的事件补上了；Meta Lead 和 GA4 generate_lead 各一次。
4. 去商店加购，Klaviyo 资料上看得到。
5. 从邮件带 `lab_unlock=sub` 进来：解锁，没有新 Lead，事件记到这个人。
6. 分享链接不带 `lab_unlock`，不带邮箱。

## 谁做什么
- 网站：桥（app_badge、UTM、identify 收件）、GA4 维度、Customer privacy 查看、CAPI 查看。
- Lab：定向发邮箱给店铺页，随 #191。
- Klaviyo：确认 email-to-website tracking 开着，周表。
- Jason：批测试邮箱；App Store provider token；各处“动”。

资料：[Klaviyo 客户端事件](https://developers.klaviyo.com/en/reference/create_client_event)、[Klaviyo Cookie](https://help.klaviyo.com/hc/en-us/articles/360034666712)、[Shopify Customer Privacy](https://shopify.dev/docs/api/customer-privacy)、[Apple 活动链接](https://developer.apple.com/help/app-store-connect-analytics/acquisition/campaign-links/)、[Google Play 归因](https://developers.google.com/analytics/devguides/collection/android/v4/campaigns)、[Vercel 分析价格](https://vercel.com/docs/analytics/limits-and-pricing)。
