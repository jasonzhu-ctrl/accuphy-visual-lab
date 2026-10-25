# X-5C · Lab 页面本身：记录了什么、怎么连 Klaviyo、三种放法能不能追到下单

Lab HQ，2026-10-25。只查不改。交接单：`handoffs/2026-10-25-lab-domain-tracking.md`。
已读的旧调研（Drive `Market Research/`）：2026-10-16 Hosting、2026-10-17 BF 全漏斗、2026-10-23 广告链接用哪个浏览器。
这里不重复它们，只补 Lab 代码和线上部署的实情。

## 一句话结论

- Lab 自己**不装任何追踪代码**：没有 Meta 像素、没有 GA4、没有 Klaviyo 网页代码，也不读广告链接里的 UTM。
  它只会把 4 个动作“报告”给外面的店铺页面，由店铺页面去记。
- Lab 自带的留邮箱卡片，在所有线上版本里都是**关掉的**；就算打开，名单号也没填，什么都发不出去。
  现在留邮箱只靠店铺页上的 Klaviyo 弹窗（网站 #208）。
- 所以**广告追踪和 Klaviyo 认人，全看店铺页面**。放框（11/2）和挂进主题（BF 后）都能一路追到下单；
  独立子域名现在什么都追不到，要补很多东西，11/2 前不现实。
- 用框的时候，Lab 用哪个域名对追踪**几乎没影响**（Lab 不存东西、不放像素）。只有“独立子域名”这种放法，.com 和 .ca 才差很多。

## 1. Lab 现在记录哪些动作，记到哪里

出处：`src/experiments/2026-09-23-sonar-lake-3d/embed.js`（`labEvent`）及调用处。

| 动作 | 什么时候发 | 带什么 | 出处 |
|---|---|---|---|
| `ready` | 3D 画面第一次画出来 | 无 | `Scene.jsx:745` |
| `first_drag` | 第一次拖船（只发一次） | 无 | `Scene.jsx:688` |
| `view` | 每次选视图 | 视图、设备、从哪里选的 | `index.jsx:229` |
| `signup` | Lab 自己的留邮箱卡片提交成功 | `source: gate` | `SignupGate.jsx:26` — 线上版本卡片关着，所以**实际上不会发** |

- 交接单里提过的 `found_sign`（找到标记）、`shop_click`（点商店按钮）**还没做**：Lab 里现在没有商店按钮。
- 发到哪里，看 Lab 是怎么放的（`embed.js`）：
  - 挂进主题：直接调用店铺的 `Shopify.analytics.publish('accuphy_lab', …)`，成为店铺的自定义“顾客事件”。
  - 放框：`postMessage` 给外面的店铺页面，由店铺页面的 section 转成同一个顾客事件（网站那边要写这段，交接单 2026-10-23）。
  - 单独打开（比如现在的 accuphy-lab.vercel.app、GitHub 链接）：**什么都不发**。
- 不带任何个人信息（代码注释写明了规矩）。
- **没有** Meta 像素、GA4、Klaviyo onsite 脚本。证据：线上首页源码里只出现 `a.klaviyo.com/client/subscriptions`（留邮箱接口地址，没在用）和 `accuphy_lab` 事件名；
  没有 `connect.facebook.net`、`googletagmanager`、`fbq(`、`gtag(`、`utm_`（2026-10-25 对 https://accuphy-lab.vercel.app/ 的源码做的检查）。
- **不读 UTM、fbclid 这类广告记号**（源码中没有 `URLSearchParams` 读取这些参数的代码；只读开发用的参数）。

## 2. 留邮箱卡片怎么连 Klaviyo

出处：`signup.js`、`SignupGate.jsx`、`vite.share.config.js`、`vite.embed.config.js`。

- 方式：Klaviyo 的“前端订阅”接口 `POST https://a.klaviyo.com/client/subscriptions?company_id=…`，只用公开钥匙，不放私钥。
- 公开钥匙：`XWcjZ5`（网站 HQ 2026-10-23 给的）。
- 名单：`listId: null`。名单“Accuphy Lab sign-ups”还没建（网站 #208：漏斗以后再定），**没填名单号，就什么都不发**，只在本机记一下“已报名”。
- 带的来源：`custom_source: "Accuphy Lab"`，资料里 `signup_page: "accuphy-lab"`。**不带 UTM、不带广告来源。**
- 线上版本（分享版、嵌入版）都设了 `VITE_NO_GATE=1`：卡片根本不出现（#71、#139）。
- Klaviyo 能不能“认出这个人”：Lab 里没有 Klaviyo 网页代码，所以 Lab 自己认不出谁。认人要靠店铺页上的 Klaviyo（店铺本来就装了）。

## 3. 三种放法

### A. 放框（iframe，嵌在 shop.accuphy.com/pages/lab）— 计划 11/2 用

- **追到下单：能。** 广告链接打开的是店铺页，UTM 和 fbclid 留在店铺的网址上，店铺的 Meta 像素、Shopify 统计在同一次访问里记下入口；
  加购、下单都在同一个店里，也是同一次访问。Lab 的动作通过 postMessage 交给店铺页，变成同一次访问里的顾客事件。
  前提：网站要写“收消息、发顾客事件”这一小段，还要建自定义像素（交接单 2026-10-23 写了）。
- **Klaviyo 认人：能，靠店铺页。** 留邮箱放在店铺页（Klaviyo 弹窗，或者以后店铺页上的表单），不放在框里。框里的 Lab 不需要认人。
- **Safari / Instagram 内置浏览器：** 跨站的框通常存不了 cookie 和本地数据（10-23 调研第 52 条）。
  Lab 在框里**不存任何东西**（卡片关着），所以不受影响。真机效果（画面高度、性能）还要在手机上实测（10-23 调研第 60 条，存疑，要真机测）。
- **Lab 用哪个域名：** 顾客看不到。lab.accuphy.com 和 shop.accuphy.com 同属 accuphy.com，算“同站”；lab.accuphy.ca 或 vercel.app 算“跨站”。
  因为 Lab 在框里不存东西，**这个差别现在几乎没影响**。以后 Lab 要在框里记东西，用 .com 会好一点。
  框的地址可以先用 https://accuphy-lab.vercel.app/，换域名只是改一下框的地址。
- **11/2 前做得完吗：** Lab 这边已经做好，地址也有了。剩下的全在网站那边（模板、收消息的代码、自定义像素），要看网站 02 的进度。

### B. 挂进店铺主题（#142）— 计划 BF 后改

- **追到下单：能，而且最干净。** Lab 直接在店铺页面里运行，动作直接调用店铺的 `Shopify.analytics.publish`，不用中转。
- **Klaviyo 认人：能，跟店铺其他页面一样。**
- **内置浏览器：** Lab 的数据和店铺同站，没有跨站限制（10-23 调研推荐这种方法）。
- **11/2 前做得完吗：不建议赶。** Lab 侧的嵌入版已经写好（`scripts/build-embed.mjs`），但**还没传上 Vercel**（线上没有 `/embed/`），
  也**没有在真的主题里试过**。店铺的 CSS、JS 可能和 Lab 打架。交接单草稿 `docs/handoffs/2026-10-24-lab-theme-mount.md` 还没交给网站。和总管 X-2 定的“BF 后再改”一致。
- 存疑：店铺页的 `window.Shopify.analytics.publish` 能不能在普通主题代码里直接用（Shopify 文档说可以，但我们店没试过）。网站 A 块可以顺带确认。

### C. 独立子域名（顾客直接打开 lab.accuphy.com 或 lab.accuphy.ca）

- **追到下单：现在不能。** Lab 没装像素、没装 Klaviyo、不读 UTM，也没有去商店的按钮。从广告进来，一个都记不到。
  要做到，需要在 Lab 里加：Meta 像素、Klaviyo 网页代码、读 UTM 和 fbclid 并带到商店链接上的代码、商店按钮，以及 cookie 同意（店铺页本来就有，独立页要自己做）。
- **跨到商店时会断一截：**
  - 用 **.com**：Meta 像素的 `_fbp` cookie 一般种在主域 accuphy.com 上，lab 和 shop 可以共用。Klaviyo 的 cookie 也可能这样。
    存疑，要在真机上看 cookie 的 Domain 才能确定。
  - 用 **.ca**：和 shop.accuphy.com 完全是两个站，cookie 不共享，只能靠链接把记号带过去，断得最多。
- **Klaviyo 认人：** 要在 Lab 里另装 Klaviyo 代码。Lab 认出的人，到了商店是不是同一个人，看上一条的 cookie。
- **内置浏览器：** 是第一方页面，不受跨站框的限制。但从 Lab 跳到商店是换站，又要重新认人。
- **11/2 前做得完吗：不现实。** 要补的东西多，还涉及隐私同意。10-23 调研也建议用店铺页，不用独立子域名。

## 4. 现在的 Vercel 部署（https://accuphy-lab.vercel.app/）

查于 2026-10-25（Vercel CLI、curl）。

- 团队 accuphy（Pro 版，付费到 2026-11-16 续费），项目 `accuphy-lab`。内容和朋友测试的 GitHub 链接同一版（Lab #152）：`/`、`/mini/`、`/ice/`。
- 头信息（线上实测）：`Content-Security-Policy: frame-ancestors https://shop.accuphy.com https://*.myshopify.com https://admin.shopify.com`
  （只有店铺和主题编辑器能把它放进框），`X-Robots-Tag: noindex, nofollow`。另有 `robots.txt` 禁止收录。
- 体积：首页 2.6 MB，传输时压缩成约 1.07 MB（br）。Vercel 自动加 HTTPS。
- **接域名：** Vercel Pro 可以接任何自己控制的域名，只需要在那个域名的 DNS 里加一条记录（子域名加 CNAME）。
  - accuphy.com 的 DNS 在阿里云（`dns9/dns10.hichina.com`），由同事管。
  - accuphy.ca 的 DNS 在 Hostinger（`ns1/ns2.dns-parking.com`），在 Jason 手上。
  - partner.accuphy.ca、prostaff.accuphy.ca 已经这样接在同一个 Vercel 团队上。
- **限制：**
  - 每次上传的单独地址（`accuphy-xxxx-accuphy.vercel.app`）要登录 Vercel 才能看（302 跳登录），只有正式地址公开。
  - 如果以后要挂进主题，嵌入版 `/embed/` 还要传上去。`vercel.json` 已经写好了跨站读取（CORS）的头信息。
  - 如果框的地址换成 lab.accuphy.xx，`frame-ancestors` 不用改（它限制的是谁能放框，不是 Lab 自己的地址）。
  - 店铺以后要是换主域名，就要改 `frame-ancestors`。
- 上传方式：Vercel 连接器没有建项目的权限（403），改用 Vercel CLI（Jason 2026-10-25 授权登录）。

## 需要谁做什么

- **网站（A/B 块）：** 确认店铺真实域名设置（.ca 注册、跳 shop.accuphy.com），确认 `/pages/lab` 上 Meta 像素和 Klaviyo 是同一次访问，
  框里的 `postMessage` → 顾客事件 → 自定义像素这条线 11/2 前能不能做完。
- **Klaviyo（D 块）：** 留邮箱放店铺页弹窗还是表单；要不要给弹窗带上 UTM 来源。Lab 的卡片保持关闭，除非漏斗要用它。
- **总管：** 如果选“放框”，Lab 的域名对追踪几乎没影响，可以按方便来（.ca 今天就能接；.com 要等同事）。
  如果选“独立子域名”，就只能用 .com，而且 11/2 前做不完。
- **Lab：** 等定了再做。可能要做的：传嵌入版 `/embed/`、接域名、加商店按钮和 `shop_click`、把 UTM 带到商店链接上。
