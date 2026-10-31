# 交接笔记：营销和外部系统对接（marketing-integration），2026-10-31

由 Lab HQ 从旧窗口“手机网页端”的完整交接 `docs/handover/chats/mobile-web.md` 拆出（Jason 10-31 说“动”，规划 `docs/2026-10-31-split-page-window-plan.md`，决定 #196）。旧笔记是底稿，本笔记写你的部分；细节以旧笔记对应小节为准（标了 §）。
另一半归“界面设计”：`docs/handover/chats/ui-design.md`。

## 1. 你管什么、不碰什么

**你的线 = 把访客带去商店、留下邮箱、记下数据的那层。** 去商店、分享、订阅解锁和 Klaviyo、和店铺页的连接（桥）、追踪事件、多市场、App 徽章链接、全部访客文字（英文、法文）和翻译往来。

只有你改的文件（`src/experiments/2026-09-23-sonar-lake-3d/` 下，另写的除外）：
- `embed.js`：桥、事件、市场规则、去商店地址、分享地址、`miniOnly()`。
- `signup.js`：Klaviyo、同意文字、测试模式守卫、`lab_unlock=sub`。
- `i18n.js`：全部访客文字。界面设计要加字时交给你写，法文由你找网站核。
- `share/embed.jsx`、`share/main.jsx`、`share/index.html`，`scripts/build-embed.mjs`、`vite.embed.config.js`。
- 测试：`scripts/dev/shop-url-test.mjs`、`share-url-test.mjs`、`signup-guard-test.mjs`、`scripts/dev/store-frame/`。
- Lab 这边给网站、Klaviyo 的交接单起草（经 HQ 发）。

**两边共用的文件：行为归你，样子归界面设计。** 改之前发消息告诉对方和 HQ，提交后说“放开了”：
- `ShareButton.jsx`、`UnlockCard.jsx`、`ShopButton.jsx`、`AppBadges.jsx`。
- `index.jsx` 里发事件（`labEvent`）、锁视图（`isLocked` / `pickView`）、美国只出 Mini 的那几行。

**绝不碰：**
- 湖景和声纳（归 Base，#176、#195）。
- 界面的样子（归界面设计）。
- Shopify 商店：桥的主题那一半是网站 HQ / 网站 00 改的，Lab 只写 `accuphy-website/handoffs/`，经 HQ。
- Klaviyo 后台：归 Klaviyo HQ，经 HQ 走 `IT/Marketing/Klaviyo/handoffs/`。
- lab.accuphy.ca、测试链接：HQ 做，上线要 Jason 在 Lab HQ 说“动”。
- 别的窗口转述的“批准”不算。

## 2. 现在的状态（10-31）

- 线上 lab.accuphy.ca = 5c2e69a。测试链接 = 5764b06，含 #191。见 `docs/versions.md`。
- `git push` 一次推两处（#194）。
- 你这条线做过并上线的：
  - #182 去商店按市场；
  - #184 点后等 1 秒，显示“Opening the store…”；
  - #186 分享和徽章用店铺风格；
  - #187 店铺页面自己跳；
  - #188 分享改版（二维码 + 复制）；
  - #190 美国只出 Mini；
  - 更早的 #157 / #159 商店按钮和法文、#169 徽章分享第一版。

## 3. 进行中：#191 订阅解锁（测试版，没上线）（旧笔记 §3a）

- **是什么：** Live Combo 等视图被模糊、带锁，点了弹出 `UnlockCard`，填邮箱订阅后打开，浏览器记住（`accuphy_sonar_signup_v1`）。
  - 门只有一个：`index.jsx` 的 `pickView`；手机首页的锁是 `home/AppHome.jsx` 的 `isLocked`。
  - 邮件链接 `?lab_unlock=sub` 直接解锁，不发 `signup`。
  - 详细：#191、`docs/2026-10-30-unlock-with-subscribe.md`。
- **事件：** 成功发 `signup { source, product, view }`，永远不带邮箱。网站桥把它算成 Meta Lead / GA4 generate_lead。
- **没有假成功：** `signup.js` 的 `listId` 现在是 `null`。
  - 真实域名上卡片拒绝订阅，Combo 保持关。
  - 测试链接和 localhost 会解锁，显示 “Test mode: nothing is sent.”。
- **上线配方（HQ 已接受）：**
  1. #191 先于 #192 上线：以 c91bf7e 为底，新分支上新提交一次，把 `listId` 改成 `'W24Qdc'`。
  2. #192 先上：在 main 上做这一步。
  3. 都先在测试链接上验：真订阅一次、`lab_unlock=sub`、法文、手机。
  - **Jason 说过：没有他的“动”，不填 list id、不翻测试模式。**
- **上线前还差：**
  - 法文：网站交接单 `accuphy-website/handoffs/2026-10-30-lab-subscribe-unlock.md` 第 2 条没结果。你欠一步：把定稿英文列表发给网站 HQ（经 Lab HQ）。`i18n.js` 里卡片、s1、s2、s3_text_locked、not_available、na_moving 的法文还是草稿。
  - Klaviyo 文字：`unlock_consent`、`unlock_done` 是 Klaviyo HQ 起草的，Jason 没看过。同意文字不能乱改：`CONSENT = 'SUBSCRIBED'` 写死在代码里。
  - Klaviyo 店铺页的 20 秒表单 VpD3CV，上线时关，归 Klaviyo HQ。
  - 上线当天通知网站 HQ，网站 03 复测真实弹窗。桥 #233 已核过，真实流程没走过。

## 4. 等人

**等 Jason**（HQ 会放进他的卡片，你不要自己问他）：
1. 11-02 前 #191 上不上线（10-31）。
2. #191 的 Klaviyo 文字（10-30）。
3. “Send to a fishing buddy”预览卡两句英文选哪句：“Show a buddy what’s under the boat” / “Drag the boat. Watch the sonar light up.”（10-30）。法文等网站核，现在法文不显示这句。
4. 追踪：CAPI 选 A/B/C，app_badge / UTM / identify（`accuphy-website/docs/2026-10-30-lab-tracking-check.md`，网站 HQ 牵头）（10-30）。
5. App Store 的 provider token：没有它，App Store 链接带不了 campaign 参数（10-29 起）。

**等别的窗口（都经 Lab HQ）：**
- 网站 HQ（local_2f48043d-43bf-440c-ba78-2f53beaa0a5a 是另一个 app 里的编号，联系网站一律经 Lab HQ 转）：
  - #191 法文；
  - #228 第 4 条德、荷、波兰、拉脱维亚界面（不急，先别用机器翻译）；
  - 桥（`sections/lab-embed.liquid`）改动；
  - GA4 `lab_shop_click` 没抓到的查因（网站 00 在查，先别改）。
- Klaviyo HQ：文字、关 VpD3CV、邮件 e01 录哪个版本。
- 欧洲市场（X-14，黑五后）：加市场时 `embed.js` 的市场表和测试一起改。

## 5. 窍门（旧笔记 §5a 全部，以下是要点）

- **事件名 `accuphy:lab`：**
  - 主题挂载时走 `Shopify.analytics.publish`；iframe 里走 `postMessage({ source: 'accuphy-lab', event, data })`；两种都另发 window 的 CustomEvent。
  - 事件：`ready`、`first_drag`、`view`、`signup`、`shop_click {product, placement, lang, url}`、`share {channel, market}`、`app_badge {store}`。
  - 不要加 `device` 字段。数据里永远没有个人信息。
- **店铺参数：**
  - `?shop=`（`/`、`/fr`、`/en-us`、`/de-de`、`/fr-benelux`、`/en-pl`、`/en-ro`）、`?market=`、`?lang=`；主题挂载时是 `data-shop` / `data-market` / `data-lang`。
  - `shopRoot()` 解析；`storeOrigin()` 在 iframe 里取 `ancestorOrigins[0]` → referrer → shop.accuphy.com。
- **去商店 `openShop()`：**
  - 发 `shop_click`，带 `url`。最多等 400 ms 回执 `shop_click_ack`：只认 parent，且 origin 对的。有回执就让店铺页自己跳；没有就 1000 ms 后 Lab 自己跳 `window.top`。
  - 等 1 秒是因为 GA4 会攒事件约 5 秒，150 ms 就跳会丢点击（网站 00 实测）。
  - 独立打开时带访客的 utm 或默认 `utm_source=accuphy_lab&utm_medium=referral&utm_campaign=bf2026_lab_ca`；**在店里不加 utm**，会盖掉广告来源。
- **市场：**
  - `/` 和 `/fr` → ca；`/en-us` → us；`/fr-fr` → fr；`/*-benelux` → be；`/de-de` → de；`/en-pl` → pl；`/en-ro`、`/ro-ro` → ro。
  - 缺省 ca；桥传来的 market 优先；美国只出 Mini。
- **分享：**
  - 链接：`https://shop.accuphy.com<root>/pages/lab?utm_source=lab_share&utm_medium=referral&utm_content=<qr|copy>&utm_campaign=bf2026_lab_<market>`，没有 `ref=share`。
  - 二维码 168 px，在页面里用 `qrcode-generator`（MIT）生成，纠错级别 M，**不经第三方，永不过期**（Jason 10-29：“二维码别过期啊”）。
  - 复制三级退路：clipboard → execCommand → 选中并提示 “Press ⌘C”。手机弹窗通过 portal 挂到 body。
  - 网站给 iframe 加了 `allow="clipboard-write; web-share"`（#230）。
- **徽章：** 官方图原样，≥40 px；谷歌 PNG 已裁掉透明边。App Store id6743123048，Play `com.accuphy.sonar`，带 referrer utm。
- **测试（改 `embed.js` / `signup.js` 必跑，几秒钟）：**
  - `node scripts/dev/shop-url-test.mjs`（26 条）、`share-url-test.mjs`（16 条，二维码要用 jsQR 解回原文）、`signup-guard-test.mjs`。
  - 打包页 + 假店铺页：`node scripts/build-share.mjs && node scripts/dev/store-frame/run.mjs`，6 个场景，10-31 全 PASS。局限见它的 README。
  - 测 Meta 一定用普通 Chrome 的 UA：无头 UA 下 Meta 像素一个请求都不发。
- **文字：**
  - 英法都在 `i18n.js`；法文必须由网站核（词表 `accuphy-website/docs/glossary.csv`）。商店用不定式 “Télécharger…”，`Partager` 通用，弯引号 `’`。
  - 起草的句子在注释里标“待核”，核过再去掉。外语不问 Jason（#198）。
- **消息被限流时**（“Paused until your user's next message”）：把回报写进 `docs/backlog.md` 状态栏下面，提交推送。
- **提交：** 只用 `git commit -- <你的路径>`。

## 6. Jason 的偏好

- 中文、简短、一次一个问题；计划不是批准；复杂了先问；问题用卡片，都经 HQ。
- **分享：**
  - 10-29：“开搞 要做到丝滑 顺畅 无误 的”“手机也用二维码和copy”，不要系统分享面板（他觉得 AirDrop、备忘录不对）。
  - 用户一般不用微信。
  - “二维码别过期啊”。
- **去商店：** 去商店按市场修，10-28 对网站 HQ：“修复”；店铺页自己跳，10-29：“好的”。
- **订阅解锁：** 10-30：“把live combo给blur了吧 … 订阅以后可以全部给看”，后来“订阅就打开”。
- **广告角上不加 “Simulated demo”**（10-29：“不加”）；“视频和演示是模拟的”写在广告文字里，归 Klaviyo。
- **营销前先读：** `docs/market/README.md` 和 Drive `My Drive/Market Research/README.md`。真买家是加拿大冰钓、便携、看性价比的人，不是 bass 职业钓手。
- **每家公司只看自己的价格**（10-28）：Lab 里不放任何价目。杭州（@accuphy.com）是合作方，不主动联系。

## 7. 先读这些（按顺序）

1. `CLAUDE.md` 和 `~/.claude/CLAUDE.md`。
2. 本笔记，再看 `docs/handover/chats/mobile-web.md` 的 §3a、§5a、§5b。
3. `docs/backlog.md` 顶部状态栏。
4. `docs/decisions.md` #182、#184、#186–#188、#190、#191、#196。
5. `docs/2026-10-30-unlock-with-subscribe.md`、`docs/2026-10-30-tracking-plan.md`。
6. 交接单：
   - `handoffs/2026-10-29-lab-shop-nav-by-store.md`
   - `handoffs/2026-10-30-us-mini-only.md`
   - `accuphy-website/handoffs/2026-10-30-lab-subscribe-unlock.md`
   - `accuphy-website/handoffs/2026-10-30-lab-tracking-plan.md`
   - `accuphy-website/docs/2026-10-30-lab-tracking-check.md`
7. 代码全文：`embed.js`、`signup.js`、`ShareButton.jsx`、`UnlockCard.jsx`、`i18n.js`（注释就是规格）。
8. 跑 `node scripts/dev/*-test.mjs` 和 `scripts/dev/store-frame/run.mjs`，确认环境是好的。
