# App 下载二维码：/app 页和文字方案（营销和外部系统对接，2026-11-01，只是方案，没改代码）

> **11-01 改（见文末）：** Jason 改了做法，/app 页不做了，第 1–5 节搁置，只留作参考。现在的做法在最后一节“11-01 改”。

HQ 派活 A8。Jason 11-01 在 Lab HQ 说“可以”，定了做法：
- **电脑：** 面板里不再放徽章，改成手机画面上方一个二维码加一句话。
- **手机：** 照旧两个徽章，上方一句 “Tap to download Accuphy Sonar App”（Jason 原文）。
- **二维码：** 只有一个，指向 lab.accuphy.ca/app。iPhone 扫了跳 App Store，安卓扫了跳 Google Play，认不出时就停在这页，显示两个徽章。

二维码和卡片的样子归界面设计。下面是 /app 页、数据、文字和影响。

## 1. /app 页

### 放在哪里

- lab.accuphy.ca 是 Vercel 上一个静态文件夹，HQ 用 Vercel CLI 整个上传：
  - `pages/` 是 `scripts/build-share.mjs` 打出来的，旁边放 `mini/`、`ice/`、`embed/`；
  - `vercel.json` 只加头信息，没有服务器代码。
- **建议：** 再放一个 `app/index.html`。它是一个独立的小静态页，几 KB，不带 React、不带 3D。打开就判断手机，立刻跳走。
  - 用一个新的小脚本 `scripts/build-app-page.mjs`（归我）生成。文字从 `i18n.js` 取，英法不用抄两遍。
  - 上线时和其他文件夹一起上传。测试链接（GitHub Pages）上也一样能用。
- **不用 Vercel 按 user-agent 在服务器端跳转。** 那样更快，但页面根本不打开，就没法记一次（见第 2 节）；而且跳转规则写在 `vercel.json` 里，测试链接上没法测。
- 现有的 `vercel.json` 头信息对 /app 没有影响：
  - `noindex`：本来就不想被搜到；
  - `frame-ancestors`：只管谁能把页面嵌进框里，扫码是直接打开，不受影响。

### 怎么认手机

- **iPhone / iPod：** user-agent 里有 `iPhone` 或 `iPod`。
- **iPad：** iPadOS 13 以后，iPad 的 Safari 默认装成 Mac（user-agent 是 `Macintosh`），所以要加一条：`Macintosh` 并且 `navigator.maxTouchPoints > 1`，就当作 iPad。普通 Mac 的触点数是 0。
- **安卓：** user-agent 里有 `Android`（手机和平板都有）。
- **其他**（电脑、认不出的）：不跳，显示后备页面。
- 用相机扫码，会用系统浏览器打开（Safari / Chrome），不是 Facebook 那种 App 内浏览器，认起来很稳。
- 跳转用 `location.replace(…)`，用户按“返回”不会又回到 /app 再跳一次。

### 跳哪两个商店链接

- **App Store：** `https://apps.apple.com/app/id6743123048`
  - 现在的徽章写死了 `/ca/`（加拿大商店）。不写国家，iPhone 会打开用户自己那个国家的 App Store，美国用户不会被带去加拿大商店。
  - 建议徽章也一起改成这样，见我 10-31 列给 HQ 的小修第 5 条。
  - 法文加 `?l=fr-CA`，和现在一样。
- **Google Play：** `https://play.google.com/store/apps/details?id=com.accuphy.sonar&hl=en_CA`（法文 `fr_CA`）
  - 加 `referrer=` 标来源。
  - 用 https 链接，不用 `market://`：手机上同样会打开 Play 商店，在电脑或奇怪的浏览器里也不会坏。

### 来源标记

| 商店 | 标记 | 现在能不能用 |
|---|---|---|
| Google Play | `referrer=utm_source=accuphy-lab&utm_medium=qr&utm_campaign=bf2026_lab_<market>` | 能加。但要 App 自己读 Install Referrer 才看得到，App 是杭州的，我们不去找他们，所以**先只是带上**，Play 后台的“获取”报表也许能看到一部分 |
| App Store | `pt=<provider token>&ct=lab_qr_<market>` | **现在不能用**：没有 provider token（Jason 10-26 起待给，HQ 列表 C8）。只加 `ct` 没有 `pt`，Apple 不认。等 token 到了加一行就行；Apple 后台按 ct 显示下载数，24 小时后出数，至少 5 次首次下载才显示 |

`<market>` 由二维码带过去，见第 2 节。

### 认不出时显示什么

- 和 Lab 一样的深色底，Accuphy logo。
- 一句标题：“Download Accuphy Sonar App”。
- 两个官方徽章（现在的 SVG / PNG，40 px 以上，原样），点了照常去商店。
- 一行小字：“Open this page on your iPhone or Android phone to go straight to the app.”
- 一个文字链接 “← Back to the Lab” 回 lab.accuphy.ca。

这些都是草稿，样子交界面设计。

### 法文

- 电脑上的二维码地址带上 Lab 当时的语言：`lab.accuphy.ca/app?lang=fr`。
- /app 读 `lang`：法文徽章，App Store 加 `?l=fr-CA`，Play 用 `hl=fr_CA`，后备页面用法文。
- 法文文字定稿后和其他句子一起交网站核。

## 2. 数据统计

### 电脑上扫码

- 电脑这边不知道有没有人扫了，只有 /app 被打开时能记一次。
- 二维码地址带上来源和市场：`/app?src=qr&m=<market>&lang=<en|fr>`。`<market>` 就是 `shareMarket()`，和分享链接用的一样（ca / us / de …）。这些都不是个人信息。
- /app 能记的：来源（qr）、市场、语言、跳去哪里（ios / android / 没跳）。

**记到哪里：** lab.accuphy.ca 自己打开时什么都不发，这是 10-25 的设计，没有 GA4，也没有 Meta，事件只能经店铺页的桥。所以要选一种：

| 选项 | 怎么做 | 好 | 不好 |
|---|---|---|---|
| A. Vercel Web Analytics（推荐） | 在 Vercel 项目里打开，/app 页加一小段官方脚本，按页面数 | 不用 Cookie、不认人，按国家看；只数 /app，不碰 Lab 本身 | 要 Jason 批，还要核价格和团队方案（10-30 追踪方案“做法二”就在等这个） |
| B. 加 GA4 | /app 页加店铺的 GA4 代码 | 和店铺报表在一起 | Lab 的域名上要放第三方追踪；欧洲要先弹 Cookie 同意，要网站给 GA4 编号和同意处理；比 A 重 |
| C. 不记 | 只靠商店后台（Play 的获取报表；App Store 等 token） | 什么都不用做 | 扫了多少次不知道 |

- 我建议 A。要是这次来不及批，就先 C：页面里先留好位置，记录逻辑写上但不发任何东西，批了再打开。
- 不管选哪种，都不记 IP、设备编号、邮箱。

### 手机上点徽章

- 照旧发 `app_badge { store: 'app_store' | 'google_play' }`。
- 提醒：店铺桥的事件表里还没有 `app_badge`，所以现在这个事件哪都没进。网站 00 已评估过：MAP 加一行，`normalize()` 要加 `store` 字段（`accuphy-website/docs/2026-10-30-lab-tracking-check.md` §2），要 Jason 在网站 HQ 说“动”。这条和二维码无关，但不做的话，手机上的徽章点击也看不到。

## 3. 英文草稿：电脑二维码旁那句

和 Jason 手机那句 “Tap to download Accuphy Sonar App” 用一样的说法：同一个动词 download，同一个名字 Accuphy Sonar App，不加 “the”。

| 选项 | 文字 | 说明 |
|---|---|---|
| 1（推荐） | **Scan to download Accuphy Sonar App** | 就是图里的占位。和手机那句只差一个词（Scan / Tap），一看就是一对 |
| 2 | Scan with your phone to download Accuphy Sonar App | 多说一句“用手机扫”，给不熟悉二维码的人；长一点，二维码旁边要放两行 |
| 3 | Scan to get Accuphy Sonar App on your phone | 说清是装到手机上；但换了动词，和手机那句不成对 |

- 两句都是新字，`i18n.js` 现在没有。上线时加两个键，比如 `app_qr_caption` 和 `app_tap_caption`，再加 /app 后备页的几句。
- 现有的 `get_app`（“Get the Accuphy Sonar app”）在电脑和手机上都会被这两句取代，可以删掉。
- 英文 Jason 定了，法文交网站核。
- 我的法文起草方向是“Scannez pour télécharger l’application Accuphy Sonar”，按 #198 店铺用不定式的习惯，以网站定稿为准。

## 4. 影响

- **网站和店铺页：不用改。**
  - 二维码只是 Lab 里的一张图，在 iframe 里照常显示，扫码在访客自己手机上发生，和店铺页无关。
  - /app 在 lab.accuphy.ca 上，不经过商店。
  - 唯一相关的，是上面说的 `app_badge` 进桥（本来就欠着）。
- **#191 订阅：不冲突。** 二维码和徽章不碰订阅卡和锁。电脑面板去掉徽章以后，订阅卡和锁的位置不受影响（面板布局归界面设计，出图时看一眼）。
- **#188 分享：要注意一处。** 电脑上会有两个二维码：
  - 分享弹窗里的，打开 Lab，给朋友；
  - 新的这个，下载 App。

  分享那个只在点了 “Send to a fishing buddy” 后的弹窗里出现，平时看不到，所以不太会撞。但两个都要有一句说清是干什么的：分享那句是 “Scan with your phone camera to open the Lab on your phone”，这里是 “Scan to download …”。界面设计出图时别让两个二维码同时出现在一屏，或者长得一模一样。
- **#186：** 这次改的是 #186 定的徽章位置，电脑上从面板挪成二维码。要 HQ 新记一条决定。
- **美国：** 美国只看 Mini，App 是同一个，不受影响。

## 5. 做的时候谁做什么（等 Jason 批文字和统计方式以后）

- **我：**
  - `scripts/build-app-page.mjs` 和 /app 页；
  - 认设备、跳转和来源标记；
  - 二维码地址（`src`、`m`、`lang`）；
  - `i18n.js` 的新字；
  - 一个 node 测试：各种 user-agent 跳对地方，二维码能解回原地址。
- **界面设计：** 电脑二维码卡片和手机徽章的样子、/app 后备页的样子；`AppBadges.jsx` 是共用文件，改之前互相说一声。
- **HQ：** 上传时把 `app/` 一起传；问 Jason 统计选 A 还是 C；provider token 到了告诉我。
- **网站：** 无（`app_badge` 进桥是另一件欠着的事）。

## 11-01 改：徽章点开弹二维码，码直接指向商店（HQ 转 Jason 11-01）

**新做法：**
- 电脑：手机画面上方放两个小徽章，点哪个就弹出哪个商店的二维码，码直接指向那个商店的 App 页，不经过 /app。
- 手机：不再放徽章。底部两个按钮改成 “Learn More →” 和 “Share to a Fishing Buddy”。
- 电脑面板上的按钮不改。
- 统计：电脑上点徽章照旧发 `app_badge { store }`，能知道多少人想下载。扫码这件事不另外统计，也先不问 Jason。

### 两个商店直达链接（二维码里装的就是这两个）

| 商店 | 英文 | 法文 |
|---|---|---|
| App Store | `https://apps.apple.com/app/id6743123048` | `https://apps.apple.com/app/id6743123048?l=fr-CA` |
| Google Play | `https://play.google.com/store/apps/details?id=com.accuphy.sonar&hl=en_CA&referrer=utm_source%3Daccuphy-lab%26utm_medium%3Dqr` | 同左，`hl=fr_CA` |

- **App Store 不带国家：** iPhone 会打开用户自己国家的 App Store，美国用户不会被带到加拿大店。现在 `AppBadges.jsx` 里写的是 `/ca/`，做的时候一起改。
- **App Store 的来源标记（`pt` / `ct`）：** 还是等 provider token（HQ 列表 C8），先不加。
- **Google Play 的 referrer：** `utm_medium` 从现在的 `referral` 改成 `qr`，能和以前的点击分开。要是想少一个改动，也可以保持 `referral`，两个都行。referrer 让二维码稍微密一点，168 px 的码照样能扫；做的时候用现有的二维码测试（jsQR 解回原文，1–3 px 每格）确认。
- 法文按 Lab 当前语言（`LANG`）选链接，和徽章图片用同一个判断。

### i18n 键：加、改、删

| 键 | 英文 | 法文草稿（交网站核） | 用在哪 | 状态 |
|---|---|---|---|---|
| `learn_more` | Learn More | En savoir plus | 手机底部左边的按钮，取代 “Shop {name}”；箭头 → 是按钮自带的图标，不放进文字 | 新加 |
| `share_buddy_phone` | Share to a Fishing Buddy | Partager | 手机底部右边的按钮，取代 `share_short`（“Share”） | 新加 |
| `app_qr_caption` | Scan to download Accuphy Sonar App | Scannez pour télécharger l’application Accuphy Sonar | 电脑上点徽章后弹框里的那句 | 新加，英文已定稿 |
| `app_qr_open` | Show the {store} QR code | Afficher le code QR {store} | 电脑徽章的读屏标签（徽章现在是“打开弹框”，不再是链接）；{store} = App Store / Google Play，不翻译 | 新加，建议 |
| `get_app` | Get the Accuphy Sonar app | Télécharger l’application Accuphy Sonar | 现在是两处徽章上方的小标题 | **删**：手机不放徽章；电脑只有两个小徽章，没有标题。界面设计的图里要是还放一行标题，就留着它 |
| `share_short` | Share | Partager | 现在的手机分享按钮 | **删**（被 `share_buddy_phone` 取代）；只有它一处在用 |
| `share` | Send to a fishing buddy | Partager | 电脑面板的分享按钮 | 不变（电脑按钮不改） |
| `shop` | Shop {name} | Achetez le {name} | 电脑面板的去商店按钮 | 不变；手机上不再用它 |
| `share_close` | Close | Fermer | 二维码弹框的关闭按钮，沿用 | 不变 |

法文说明：
- `share_buddy_phone` 写 “Partager”，是照网站 #198 的定法：“Partager” 是所有分享位置的法文，“Send to a friend” 也算。要是 Jason 想让法文也说出“钓友”，备选 “Partager avec un ami pêcheur”，按钮会长很多，要界面设计确认放得下。由网站定。
- `learn_more`：“En savoir plus” 是店铺 /fr 的常见说法，以网站核定为准。
- 二维码弹框里 “QR code” 的读屏文字现在是写死的英文（`ShareButton.jsx` 的 `aria-label="QR code"`），法文写 “code QR”，做的时候一起放进 i18n。

### “Learn More →” 点了去哪（HQ 11-01 定）

- 只换文字，行为和现在手机上的 Shop 按钮完全一样：
  - 按市场去当前设备的商品页；
  - 等 1 秒，显示 “Opening the store…”；
  - 发 `shop_click`，`placement` 仍是 `frame-top`；
  - 美国只出 Mini。
- HQ 说这和 Jason 当时说的“点了照旧去商店产品页”一致。
- 所以 `embed.js` 不用改，只是手机那处 `ShopButton` 显示 `learn_more`，电脑面板照旧显示 `shop`。

### 影响

- **事件：**
  - 电脑：点徽章发 `app_badge { store: 'app_store' | 'google_play' }`。意思从“去了商店”变成“打开了二维码”。桥现在还没接这个事件（网站欠着，见上文第 2 节）。
  - 手机：不再有 `app_badge`。
  - 手机的 `shop_click`、`share` 不变。
- **共用文件：**
  - `AppBadges.jsx`：徽章变成按钮加弹框，样子归界面设计，链接和事件归我；
  - `index.jsx` 第 360、446 行：手机徽章去掉，电脑徽章换位置；
  - `ShopButton.jsx` 手机那处换文字；
  - `ShareButton.jsx` 手机那处换文字。

  做的时候先和界面设计、HQ 说好谁改哪几行。
- **二维码：** 沿用 `ShareButton.jsx` 里的 `qrSvgPath()`（qrcode-generator，页面内生成，不经第三方，不过期）。分享弹框和 App 弹框长得像，各自那句说明要清楚（这句已定稿）。
- 网站、店铺页、#191 订阅：都不受影响。
