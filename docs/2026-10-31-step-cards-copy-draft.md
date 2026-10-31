# 步骤卡文字草稿：三站导览（营销和外部系统对接，2026-10-31）

接 `docs/2026-10-31-step-cards-review.md` §5（Jason 10-31 选 A：三站导览，最后一站接着去商店）。
这里只有英文草稿，没改 `i18n.js`。Jason 批了英文，再交网站核法文。

## 依据

- **买家：** 加拿大北方的人，看重便携和性价比：冰钓换洞的人（P1），以及嫌大品牌太贵、想先升级一台的人（P2）。不是 bass 职业钓手。
- **最打动他们的一句：** 实时声纳就用你自己的手机或平板看。
- **说话要实在：** 客户公认 Garmin 的画面稍清楚一点，所以不说“一样清楚”“最好”这类话。
- 来源：Drive `Market Research/2026-09-24 Users and market - first principles (EN).md` §1、§3、§7，以及 `docs/market/README.md`。
- **数字只用 `accuphy-website/docs/specs.md` 里的：**
  - PingLive Mini 重 0.6 kg（1.31 lb）；
  - Mini 的 Live Combo 能同时看前方和正下方。
- 波束角度不写进文字，等 Jason 确认数字（HQ 10-31）。
- 没用的说法：最大量程、“唯一”、“比某某清楚”、价格。价格按市场不一样，归店铺页。

## 写法规矩（HQ 给的，我照做）

- 标题不超过约 6 个英文词，说的就是屏幕上正在看的东西。
- 正文最多两短行，一行一个意思：
  - 第 1 行讲这一站看到的东西；
  - 第 3 站的第 2 行讲“它适合你怎么钓”。
- 不写 “side by side”。Mini 的 Combo 在屏幕上是一条斜线把两边分开。
- 面板下面已经有一行描述（“… beam. Drag the boat — whatever the beam touches lights up.”），卡片不再重复它。

## 九张卡

`{device}` 由代码代入 PingLive 或 PingLive Mini（和现在的 s1 一样）。

### 夏天湖 PingLive（`/`）

| 站 | 看到的 | 标题（草稿） | 正文（草稿） |
|---|---|---|---|
| 1 | Down | Your sonar beam, under the boat | Drag the boat anywhere on the lake. Whatever the beam touches shows up on your phone, live. |
| 2 | Forward，对着立木和鱼 | Fish ahead, on your phone | This is the Accuphy Sonar app’s Forward View: timber and fish in front of the boat. |
| 3 | Panoramic | Panoramic: a wide scan for fish | Sweep a wide arc to find fish and structure fast. It runs on the phone or tablet you already own. **［按钮：Shop PingLive］** |

### Mini（`/mini/`，美国店也是这页）

| 站 | 看到的 | 标题（草稿） | 正文（草稿） |
|---|---|---|---|
| 1 | Down | Your sonar beam, under the boat | 同 PingLive 第 1 站 |
| 2 | Forward | Fish ahead, on your phone | 同 PingLive 第 2 站 |
| 3（已订阅） | Live Combo | Ahead and below, one screen | Live Combo shows Forward and Down together, split on one screen. At 0.6 kg (1.3 lb), it goes from boat to kayak to ice. **［按钮：Shop PingLive Mini］** |
| 3（没订阅） | Forward | Cast to the fish ahead | Forward View finds the fish in front of you. Live Combo adds Down on the same screen: **unlock it** with your email. **［按钮：Shop PingLive Mini］** |

### 冰钓页（`/ice/`，只有 Mini）

| 站 | 看到的 | 标题（草稿） | 正文（草稿） |
|---|---|---|---|
| 1 | Live Ice，冰洞往下 | The beam under the ice | The PingLive Mini hangs in the hole and pings straight down. Tap the ice to drill a new hole. |
| 2 | Live Ice，鱼游上来 | Fish rising to your bait | The flasher shows the bottom, your bait and each fish by depth. The panel beside it draws the same fish as marks. |
| 3 | Forward | Look ahead under the ice | Forward View turns the beam sideways: fish out ahead, under ice you haven’t drilled. At 0.6 kg (1.3 lb), it moves hole to hole with you. **［按钮：Shop PingLive Mini］** |

## 和现在的文字比：改了什么，为什么

| 卡 | 现在 | 改成 | 为什么 |
|---|---|---|---|
| 湖 / Mini 1 标题 | The {device} sonar beam | Your sonar beam, under the boat | 这一站看到的是 Down，标题直接说“船下的波束”，和画面对上。产品名面板上已经有了 |
| 湖 / Mini 1 正文 | Drag the boat — anything inside the beam appears on your phone. | Drag the boat anywhere on the lake. Whatever the beam touches shows up on your phone, live. | 意思不变，拆成两短行，加上 “live”（实时） |
| 湖 / Mini 2 标题 | This is what your phone shows | Fish ahead, on your phone | 说出屏幕上是什么（前方的鱼），不是空泛的“手机上看到的” |
| 湖 / Mini 2 正文 | This is what {device} sees, live on your phone in the Accuphy Sonar app: the bottom, timber and fish. | This is the Accuphy Sonar app’s Forward View: timber and fish in front of the boat. | 点名 Forward 视图，访客才知道现在在看哪种视图；“the bottom” 删掉，这一站的重点是前方 |
| 湖 3 标题 | Which view, when | Panoramic: a wide scan for fish | 旧卡讲了 3 个视图，只切到 1 个。现在只讲屏幕上的 Panoramic |
| 湖 3 正文 | Panoramic scans wide…; Forward to cast…; Down to fish straight below. | Sweep a wide arc to find fish and structure fast. It runs on the phone or tablet you already own. | 第 1 行只讲 Panoramic，不写波束角度（见下面“10-31 加的用词规矩”）；第 2 行是最打动买家的那句，接着就是去商店按钮 |
| Mini 3 已订阅 | Combo shows Down and Forward side by side; … | Live Combo shows Forward and Down together, split on one screen. At 0.6 kg (1.3 lb)… | 去掉错的 “side by side”；第 2 行讲便携（0.6 kg 来自 specs），对的是冰钓和小船的人 |
| Mini 3 没订阅 | …Combo shows both side by side: subscribe to unlock it. | Forward View finds the fish in front of you. Live Combo adds Down on the same screen: unlock it with your email. | 去掉 “side by side”；“unlock it” 做成能点的（见下面问题 2），不再是卡片里点不了的一句话 |
| 冰 1 | …Tap the ice anywhere to drill a new hole — whatever the beam touches lights up. | …Tap the ice to drill a new hole. | 删掉和面板描述重复的半句，变成两短行 |
| 冰 2 标题 | Watch them come in | Fish rising to your bait | 说出屏幕上是什么 |
| 冰 2 正文 | The flasher is the dial: the bottom, your bait and every fish that rises, by depth around the ring. … | The flasher shows the bottom, your bait and each fish by depth. … | 一样的意思，更短 |
| 冰 3 标题 | Look ahead without drilling | Look ahead under the ice | 小改，说眼前的画面；“不用钻洞” 的意思移进正文 |
| 冰 3 正文 | Forward View turns the beam sideways: fish and structure out ahead, under ice you never cut. | …under ice you haven’t drilled. At 0.6 kg (1.3 lb), it moves hole to hole with you. | 第 2 行加便携，对着换洞的冰钓人（P1）；然后是去商店按钮 |

长度：最长的标题 6 个词（“Your sonar beam, under the boat”“Panoramic: a wide scan for fish”）。最长的一行正文约 13 个词。界面设计出图时，卡片宽度如果放不下，告诉我，我再砍。

## 10-31 加的用词规矩（Klaviyo HQ 转 Jason 的决定，HQ 10-31 转来）

- 波束不说 “thin”（薄），也不说 “curtain”（帘子）。
- 波束角度先不写进文字，等 Jason 确认数字。

查了这份草稿（ad012c7）、`i18n.js` 和湖文件夹里所有文件：

| 在哪 | 找到的 | 访客看得到吗 | 建议 |
|---|---|---|---|
| 本草稿，湖第 3 站 | “135° wide, …” | 草稿，还没上 | **已改成** “Sweep a wide arc to find fish and structure fast.”，不带数字 |
| 本草稿，依据一节 | “PingLive 波束 135° × 20°” | 不是访客文字 | 已删 |
| `i18n.js` 的 `desc_lake`、`desc_ice` + `index.jsx` 第 443 行 | 面板下面那行描述带角度，`{device} · {beam} beam`。`{beam}` 由代码拼：湖上 PingLive 是 “135° × 20°”，Mini 是 **“39° × 18°”**，冰上 Mini 是 “39° × 20°” | **看得到，线上就有** | 见下面 |
| 全部访客文字里的 “thin” / “curtain” / “mince” / “rideau” | 没有。只在代码注释里有（`Scene.jsx` 说 Forward 的 “curtain” 形状、`sonarShader.js` 的 “thin line” 等），访客看不到 | 看不到 | 不用改。注释归 Base 和界面设计，我不碰 |

**面板描述那行的建议（只是草稿，代码没动）：**
- 现在：“PingLive Mini · 39° × 18° beam. Drag the boat — whatever the beam touches lights up.”
- 去掉角度：“PingLive Mini. Drag the boat — whatever the beam touches lights up.”（冰上：“PingLive Mini, through the ice. Tap the ice to drill a new hole — whatever the beam touches lights up.”）
- 法文：只是把 “· faisceau de {beam}” 这一段去掉，剩下的句子网站已经核过，应该不用再核；交网站时注明。
- 顺带发现：湖上 Mini 显示的是 18°，`specs.md` 写 39° × 20°。代码注释说文字该按 specs，但湖上的拼法用了引擎的 18°。去掉角度，这个不一致就跟着没了；不去的话，Jason 确认数字后要改成一致。
- 改动的位置：`i18n.js` 两个键归我；`index.jsx` 第 443 行是共用文件，传 `beam` 的那一行要改，改之前先告诉界面设计和 HQ。

## 第 3 站按钮

- **文字：** 建议沿用现在的 `shop` 键 “Shop {name}”，也就是 Shop PingLive / Shop PingLive Mini。
  - 法文 “Achetez le {name}” 网站已经核过，不用再送审。
  - 点了以后的 “Opening the store…” 也是现成的。
  - 和面板上的按钮一字不差，访客知道是同一件事。
  - 我也想过 “See it in the store”，但它不说是哪台机器，美国（只有 Mini）也容易误会，所以不推荐。
- **`embed.js` 不用改：**
  - `openShop(deviceId, placement)` 收任何 placement 字符串，原样放进 `shop_click { product, placement, lang, url }`。
  - 店铺的桥（`sections/lab-embed.liquid`，网站 #233 版）对 placement 只是原样转发：`if (data.placement !== undefined) out.placement = data.placement`，没有白名单。
  - 所以在卡片里放 `<ShopButton deviceId={…} placement="step3" />` 就行：按市场走、等 1 秒、等桥回执、美国只有 Mini、按下后整页不能再点，全都照旧。
- **要注意的 3 件事：**
  1. 按钮放在卡片里，卡片本身点了会切站。`ShopButton` 已经在 pointerdown 和 click 上 `stopPropagation()`，应该不会误切；做的时候要实测一次。
  2. 按钮的样子和位置归界面设计。
  3. 上线时通过 HQ 告诉网站：`shop_click` 多了一个 placement 值 `step3`。GA4 的 placement 维度注册还在等 Jason 登录（`accuphy-website/docs/2026-10-30-lab-tracking-check.md` §4）；不注册不影响数据进 GA4，只是报表上分不出来。

## 要 HQ 定（或问 Jason）的

1. **0.6 kg 写不写磅数：** 现在写 “0.6 kg (1.3 lb)”，两个单位都给，因为美国也看这页。也可以按市场只给一种单位，代码稍微多一点。
2. **Mini 第 3 站没订阅时有两个下一步（订阅、去商店）：**
   - 我建议：“unlock it” 做成文字链接，点了打开现有的订阅卡（和点 Combo 锁一样，走 `pickView`），去商店仍是那个按钮。
   - 也可以只留去商店，订阅只靠面板上的锁。
   - 链接的行为归我，样子归界面设计。
3. **湖 / Mini 第 1 站标题去掉了产品名：** 面板和描述行上已经有产品名。HQ 如果要卡片里也出现名字，就改成 “The {device} beam, under the boat”。
4. **第 2 站说 “the Accuphy Sonar app’s Forward View”：** 画面是模拟的，但视图名和样子跟真 App 一致，这样说不算夸大。广告里 “视频和演示是模拟的” 那句仍归 Klaviyo 的广告文字。

法文：Jason 批了英文以后，我把定稿列成表，经 HQ 交网站核（和 #191 一样）。
