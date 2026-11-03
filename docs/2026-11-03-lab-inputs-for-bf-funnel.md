# Lab 给黑五漏斗的输入（营销和外部系统对接，2026-11-03）

给：BF 营销漏斗窗口（Klaviyo 项目），经 Lab HQ 转。
Jason 11-03：“营销整体方案不是你的活，你提供给漏斗就行”。这一页只写 Lab 的事实、链接和要配合的地方，不替漏斗定策略。

## 1. Lab 现在线上是什么

线上版本是 86bf80e（11-03，标准 Base 版，`docs/version-sheet.md`），**没有订阅锁**。

- **入场教程**（取代了原来右上角的步骤卡）：
  - Mini：拖船（在 Combo 里）→ Tap Forward View → Tap Down View；
  - PingLive：拖船（在 Down 里）→ Tap Forward View → Tap Panoramic View；
  - 看过一次不再自动弹，左下角有 Replay。
- **去商店和分享：**
  - 电脑：Shop 按钮、“Send to a fishing buddy”；
  - 手机：“Learn More →”、“Share to a Fishing Buddy”。
  - 去商店按市场走，在店铺页里不加 utm，不会盖掉广告来源。
- **App 下载：**
  - 电脑：手机画面上方两个徽章，点了出那个商店的二维码；
  - 手机：不放徽章。
- **美国：** 店铺里的美国市场只出 PingLive Mini。
- **冰钓页：** `lab.accuphy.ca/ice/`，只有 Mini，有自己的入场教程。
- **湖岸：** 夏天湖和冰钓页同一条湖岸。
- **法文：** 法文页上，入场教程和新按钮暂时显示英文。Base 页的法、德、荷、波、拉脱维亚文由新窗口“Lab 多语言”负责（#212，Jason 11-03）。

## 2. 落地链接

| 用途 | 链接 |
|---|---|
| 店铺页里的 Lab（加拿大英文） | `https://shop.accuphy.com/pages/lab` |
| 法文 | `https://shop.accuphy.com/fr/pages/lab` |
| 美国（只出 Mini） | `https://shop.accuphy.com/en-us/pages/lab`（只给美国人用；加拿大人点了会进美国市场、看到美元） |
| 冰钓页直达 | `https://lab.accuphy.ca/ice/`（单独打开，不在店铺框里，见下面的注意） |

- 店铺页会把链接上的参数（utm、`_kx` 等）转进 Lab，**只丢 `view`**。所以别用 `view=` 当参数名。
- **现在没有能直接打开“Mini + Combo”的参数。** 矛盾清单 A8（Mini 广告点进来开的是 PingLive）和 e01 都卡在这一点。
  - 办法已评估：`docs/2026-10-31-e01-deeplink-scoping.md`。加 `?device=plm&lab_view=combo`，商店不用改；Lab 的 Base 改 `index.jsx` 约 20 行；要 Jason 在 Lab HQ 说“动”。
  - 在那之前的替代：`boat=x,z` 能把船停在好位置，但设备和视图要访客自己点。
- **单独打开 lab.accuphy.ca 的注意：** 不在店铺框里时，Lab 什么事件都不发（没有父页面），店铺页的 Klaviyo 也认不出人；Klaviyo 自己的点击统计照常。要统计的链接，用店铺页那几个。

## 3. 带锁营销版（Jason 11-03 定要锁，HQ 安排）

Jason 原话：“要锁，但是不是直接在 base 上做，是用之前锁的方式直接把 base 复制出来单独做带锁的版本，这个要 HQ 安排”。

- **锁是什么（#191）：** 没订阅的人点 Combo（以及 Mini 的 Panoramic、冰钓格子），先出订阅卡，填邮箱后打开；这台设备记住。
- **订阅进 Klaviyo 名单 W24Qdc**（单次确认），档案上带：
  - `signup_page=accuphy-lab`、`signup_channel=lab_unlock`；
  - `signup_language`（en / fr）、`signup_market`（ca / us …）；
  - `lab_scene`（解锁的视图）、`lab_product`（pinglive-sonar / pinglive-mini）。

  漏斗分群可以用这些。邮箱只从 Lab 直接进 Klaviyo，不经过店铺页，也从不进任何统计事件。
- **订阅成功会发 `signup`**，店铺的桥把它算成 Meta Lead、GA4 generate_lead（form = lab_unlock）。
- **要漏斗 / Klaviyo 配合的：**
  1. Jason 看过同意文字和“解锁成功”那句（Klaviyo HQ 起草，`i18n.js` 的 `unlock_consent`、`unlock_done`）；
  2. 带锁版上线时，在店铺 Lab 页关掉 Klaviyo 的 20 秒框 VpD3CV，不然两个留邮箱的框一起弹；
  3. 发给**老订阅者**的链接加 `lab_unlock=sub`：直接解锁，不出卡，不发 `signup`，不会被算成新 Lead。只认这一个值。分享链接永远不会带它；
  4. 同一个人在 Lab 和 Klaviyo 框各填一次，会算两个 Lead（网站 10-30 说量很小，先不处理）。

## 4. Lab 发的统计事件（按国家周表可以用）

事件名 `accuphy:lab`，经店铺页的桥进 Shopify、Meta、GA4、Klaviyo（按访客的 Cookie 同意）。数据里从来没有个人信息。

| 事件 | 什么时候 | 带什么 |
|---|---|---|
| `ready` | 3D 湖能用了，每次打开一次 | — |
| `first_drag` | 第一次拖船 | — |
| `view` | 访客换视图 | view、product |
| `shop_click` | 点去商店 | product、placement（电脑 `panel`，手机 `frame-top`） |
| `share` | 打开分享 / 复制链接 | channel（qr_shown / copy）、market |
| `app_badge` | 电脑点 App 徽章（打开二维码） | store（app_store / google_play） |
| `signup` | 带锁版订阅成功 | source、product、view |

**现在的缺口**（归网站和 Jason，已在各自清单里，这里只提醒）：
- 桥里没接 `app_badge`，UTM 也没进事件（网站 `docs/2026-10-30-lab-tracking-check.md` §2）；
- GA4 自定义维度没注册，注册前的数据补不回来（同上 §4）；
- Meta Lead 只走浏览器，CAPI 选 A / B / C 没定（同上 §1）。

## 5. 说法和 Lab 一致

- **Mini 的视图名：**
  - 手机 App 首页的格子：Forward View、Down View、Live Combo、Live Panoramic；
  - 电脑面板的短名：Forward、Down、Combo、Panoramic；
  - 教程：“Tap Forward View”“Tap Down View”。
  - 对应矛盾清单 C12：建议邮件和广告用 App 首页那套。
- **波束：** 只写宽度：Mini 39°、Mini Combo 78°、PingLive 135°（Jason 11-02 去掉厚度）。不说 thin，不说 curtain。
- **美国：** 只讲 PingLive Mini；Lab 在店铺美国市场里只出 Mini，按钮写 Shop PingLive Mini（矛盾清单 A7 已由 #190 解决）。
- **App：** 名字是 “Accuphy Sonar App”。App Store 链接不带国家：`https://apps.apple.com/app/id6743123048`。

## Lab 这条线接下来自己做的（不属于营销方案）

- 翻译不归我了：Base 页的各语言由“Lab 多语言”做（#212）；带锁版的订阅卡文字（`unlock_*`）等营销版。
- 带锁版做好后跑测试：单元测试四套，假店铺页加“带锁”场景。
- 深链 `?device=plm&lab_view=combo`：Jason 说“动”后，Base 改代码，我写测试，再把链接给 Klaviyo 和 Carl。
