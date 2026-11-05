# MKT 版（带锁版 = 投放版）上线清单（Lab 营销版维护，2026-11-03）

> **硬规则（#232，Jason 定，每次都要记住）：店铺页只是“相框”，Lab 本身放在 lab.accuphy.ca 上。**
> - 客人、广告、邮件只拿**店铺链接**（`shop.accuphy.com/<市场>/pages/…`）。lab.accuphy.ca 的地址只在后台用，不给客人。
> - 每个店铺页的框里只显示一个 lab.accuphy.ca 地址：
>   - `/pages/lab` 嵌 `lab.accuphy.ca/`（Base，不带锁）；
>   - `/pages/sonarlab-mktbf2026` 嵌 `lab.accuphy.ca/mktbf2026/`（MKT 版，带锁）。
> - Lab 的程序不放进 Shopify。
> - 清单里每一项都写清楚是哪一层：**客人看到的店铺页**，还是**它后面的 lab.accuphy.ca 地址**。

MKT 版归 “Lab 营销版” 窗口负责（#231）。HQ 管它，和网站、Klaviyo 的往来都经 HQ。

**全部打勾才上线，缺一样就不上。** 每完成一样，营销版在这里打勾、写日期和证据，然后告诉 HQ。

## 现在是什么（营销版 11-05 整理）

- **带锁版 MKT 北美澳：已上线、可投广告。**
  - 客人看到的店铺页：加拿大 `/pages/sonarlab-mktbf2026`、美国 `/en-us/…`、澳洲 `/en-au/…`，都是 200。
  - 后面那一层 lab.accuphy.ca/mktbf2026/ 线上是 **b572dde**（11-05 营销版核：重新打包 md5 6cfc3363 = 线上）。
  - 线上带着：五种语言和冰钓 120 ft（c442045）；PingLive Panoramic 加锁（#240）；美国 Combo 免费（#241）；导览中不锁（#242）；每国一个名单（#244：加拿大 W24Qdc、美国 SPeeP6、澳洲 Scdcct）。
- **带锁版 MKT 欧洲：没上线。** 代码已在复制件里，上线包没打：
  - 欧洲法语用米（#245）；
  - 订阅卡欧洲译文，加网站的 7 处更正（#246）；
  - 按国家分名单 `VITE_BF_LISTS_EU`（#247）。
  - 等 Klaviyo HQ 在 Jason 说“动”后，直接给欧洲名单号（第六点五节）。没有名单号时，欧洲客人订阅会被拒，不会进北美澳的名单。
- **复制件：** `src/experiments/2026-11-03-sonar-lake-bf/`。从 Base 86bf80e 复制，锁永远开着（#191、#213），只由营销版改。
- **打包：** `node scripts/build-bf-site.mjs <out> [版本]`（#228、#233 的布局），名单号用构建变量填（第二节）。
  - `/`、`/mini/`、`/ice/`：免费版（网站嵌入版，不带锁，从它的复制件 `2026-11-03-sonar-lake-web/` 打包），md5 必须和线上一样；
  - `/mktbf2026/`：带锁版 MKT；
  - `/mktbf2026/ice/`：免费版冰钓页 `/ice/` 的一份复制，不带锁。
- **投放链接：** 见 `docs/lab-links-sheet.md` 第一节。

> **#234（Jason 11-03：“等多语言一起上”）：已做到。** 11-04 先搬了多语言（c442045），然后才上线。

> **下一次打带锁版的上线包 = “欧洲这一批”（HQ 11-05 要求记下）：**
> - 从现在的代码打包，会把欧洲 #245、#246、#247 一起带上去。
> - 北美澳的客人也会看到 #246 改过的法语订阅卡文字（加拿大法语）。
> - 所以那次上线，要按欧洲这一批来核：
>   - 北美澳三国：重核锁、名单、法语卡片；
>   - 欧洲各国：名单对照、“请查收邮箱”、用米；
>   - 免费版 `/`、`/mini/`、`/ice/`：md5 不变。

## 一、Jason 要说的两个“动”

- [x] **后面那一层 lab.accuphy.ca/mktbf2026/ 上线：** Jason 11-04 在 **Lab HQ** 说“动，上线”，HQ 部署了 0117d52（北美澳名单 W24Qdc，欧洲名单未填），证据见记录表。
  - HQ 用上线包部署。上线包是填了名单号的那份，见第二节。
  - `/`、`/mini/`、`/ice/` 仍是网站嵌入版，部署前用 md5 证明和当时的线上一样（#228：营销版不覆盖不带锁的那一份）。
- [x] **客人看到的那一层，店铺 MKT 页 /pages/sonarlab-mktbf2026：** Jason 11-03 在 **网站 HQ** 说了“动”（网站 #241），网站 00 正在建，框指向 `https://lab.accuphy.ca/mktbf2026/`。
  - **注意：** 后面那一层 /mktbf2026/ 上线以前，这个店铺页的框里是空的（404）。页面不在菜单里，客人找不到，但**不能拿去投广告**。
  - 网站方案：`accuphy-website/docs/plans/2026-11-03-lab-mkt-store-page.md`。
  - 复制 `page.lab.json`，嵌入地址改成 `https://lab.accuphy.ca/mktbf2026/`；新页面 handle 是 `sonarlab-mktbf2026`；不放进菜单；`/pages/lab` 不动。
  - 页面可以先建好；/mktbf2026/ 上线前，这批链接不给广告。

## 二、名单号

- [x] **W24Qdc 只在上线包里填：**（11-04：线上 `/mktbf2026/` 有 W24Qdc，`/` 没有） `VITE_BF_LIST_ID=W24Qdc node scripts/build-bf-site.mjs <out> [版本]`。
  - 测试链接不填，所以测试访客进不了真名单。
  - 没填时：真实域名上订阅卡说 “Subscribing isn’t open yet”、Combo 不开；测试链接上是 “Test mode: nothing is sent”。
  - 部署后核一次：线上 `/mktbf2026/` 的页面里能找到 `W24Qdc`，`/` 里找不到。

## 三、文字

- [x] **同意文字**（Jason 11-03 在 BF 漏斗窗口亲口定，4d41681 已放进复制件）：
  - 英：“By subscribing, you agree to receive marketing emails from Accuphy. Unsubscribe anytime.”
  - 法：“En vous abonnant, vous acceptez de recevoir des courriels marketing d’Accuphy. Désabonnement en tout temps.”
  - 后面接 Privacy Policy / Politique de confidentialité 链接；一行小字，11 px，灰色。
- [x] **unlock_done**（订阅成功后显示 1.1 秒）：Jason 11-03 确认（经 HQ，“可以”），已放进复制件。
  - 英：“You’re in. {view} is unlocked.”（不改）；法：“C’est fait. La vue {view} est débloquée.”。

## 四、Klaviyo（经 HQ，Klaviyo HQ 做）

- [x] **20 秒弹窗 VpD3CV 只在 MKT 页上关掉**（Klaviyo HQ 11-04 只读核过：不用改。VpD3CV 只在 `shop.accuphy.com/pages/lab` 和 `/en-us/pages/lab` 出，TpVDh9 只在 `/fr/pages/lab` 出，MKT 页不在里面；MKT 页上线后它再读一次）。原文：（`/pages/sonarlab-mktbf2026`，所有市场前缀）。`/pages/lab` 和店里其他页照旧。
  - 不关的话，Lab 的订阅卡和 Klaviyo 的弹窗会一起出来。
  - 要 Jason 在 Klaviyo HQ 说“动”。
- [x] **商店弹窗不进 Lab 页和 MKT 页**（11-04 已做：Jason 在 Klaviyo HQ 说“动”，11:50 读回核过，记录在 Klaviyo `Maintenance and Fix/Forms/2026-11-04 Lab 页和 MKT 页弹窗 改动记录.md`；网站 03 测订阅时也没见店铺弹窗）（K4b，Klaviyo HQ e8f7de4 清单 + 预览）：CA RUd8QJ、DE W8UPFL、BNL RwEkZj、FR TeNugm、RO WgcWSj 加 `*/pages/lab*` 和 `*/pages/sonarlab-mktbf2026*`；美国 SRSX6U、TWCLKy 只加 MKT 那条；澳洲弹窗没发布。顺带去掉挡 Skip tour 的小圆标。等 Jason 在 Klaviyo HQ 说“动”。
- [ ] 发给老订阅者的邮件链接带 `lab_unlock=sub`：直接解锁，不出卡，不算新 Lead。由漏斗和 Klaviyo 定。

## 五、网站 03 的检查（经 HQ）

- [x] **真实订阅测一次：**（11-04 两次通过：网站 #245 224f413b + 全新邮箱一次，Klaviyo HQ 读回：新档案进 W24Qdc、单次确认、6 个属性齐、没发欢迎邮件；档案国家为空，看市场用 signup_market） 在店铺 MKT 页上用一个测试邮箱。只提交一次，要 Jason 同意。要看到：
  - 邮箱进了 W24Qdc，档案上带 `signup_page=accuphy-lab`、`signup_channel=lab_unlock`、`signup_language`、`signup_market`、`lab_scene`、`lab_product`；
  - Combo 打开了；
  - 店铺这边算一次 Meta Lead / GA4 generate_lead（form = lab_unlock），事件里不带邮箱；
  - 没有 Klaviyo 弹窗。
- [x] **各国 IP 测试：** 网站 03 11-03 做完（194a98c0），结果已整理进 `docs/lab-links-sheet.md` 第一节。
  - 10 个市场都能用。奥地利、瑞士用德国链接。波兰会转到 /en-pl，lang=pl 还在。
  - **拉脱维亚已定（#238，Jason 11-04：“用英语”）：** 用 `/en-ro/pages/sonarlab-mktbf2026?lang=lv`。网站 03 还要实测一次（店铺页建好后，和 MKT 页本身一起测）。
  - 网站还看到：德国 IP 打开 /de-de 时，Klaviyo 的全屏弹窗会盖住 Lab。所以第四节在 MKT 页上关 VpD3CV 是必须的。
- [x] **MKT 页本身：** 店铺页建好后，03 核一次。（11-04 通过，网站 fe7d485a：10 个前缀 200、框指 /mktbf2026/、lang/shop/market 对、去商店到本市场、美国只 Mini、拉脱维亚 /en-ro 对、无店铺弹窗、事件对；没测：测试订阅、真 iPhone）
  - 每个市场前缀都能打开，含澳洲 `/en-au/pages/sonarlab-mktbf2026`；
  - 框的地址是 `/mktbf2026/`；
  - `lang` / `shop` / `market` 照传；
  - 事件和 `/pages/lab` 一样；
  - 美国只出 Mini。

## 六、Base 的改动搬进复制件（#216、#226）

- [x] **多语言 #212 和冰钓 #224 一起搬（#234：这一项做完，MKT 版才上线）：** 2026-11-04 搬完（Jason 11-04 在 Lab HQ：“搬”），证据见下面“11-04 搬完”和记录表。
  - **11-04 搬完：** 把 Base 这几次提交按顺序搬进复制件（只改 `2026-11-03-sonar-lake-bf/`）：066623a、3db81b2、99e15c8（#224，Scene.jsx）、3df49de（五种语言的表）、
    12f5918、43c2d45、ac71a78、40eca0f、348d3d2（面板标签、导览标题、视图名排版，和网站嵌入版 29c90af / 96a37dd / 5a00dc8 / d8cd16c / ee7b8d0 同一套）。
    **没搬：** 322f47f、c8ace42（#225 广告用的开发开关，打包里没有）。复制件自己的锁（#191）、同意文字（4d41681）、unlock_done（bab47fc）都留着。
    搬完和 Base 比：只差复制件自己的这几处 + #225 开关。
  - **单元测试**（`LAB_DIR=2026-11-03-sonar-lake-bf`）：app-qr 4/4、share-url 22/22（原来那 4 条德荷波拉现在通过）、shop-url 26/26、signup-guard 全过。
  - **假店铺页**（`LAB_LOCKED=1`）：9/9 PASS，含 share-de（分享链接带 `&lang=de`，去商店进 `/de-de/products/`，`<html lang=de>`）和 lock-desktop。
  - **打包：** `/mktbf2026/` md5 c4c8bce9；`/mktbf2026/ice/` = `/ice/`。`/`、`/mini/`、`/ice/` 用 `BASE_REF=537adc2` 打，md5 = 线上（afb82b9c、26abb62f、f22f445a）。
    **注意（给 HQ）：** 用 HEAD 打，`/`、`/mini/`、`/ice/` 是网站嵌入版已经放进五种语言、但还没上线的那份（58ed5de8 / 6bd00616 / 14e6cc38），所以和线上不一样。这是网站嵌入版自己的改动，营销版没碰。上线那天用哪个 `BASE_REF`，由 HQ 和网站嵌入版定。
  - **看过：** 带锁湖页 en fr de nl pl lv，电脑 1440×900 和手机 390×844 各一次，都能打开，0 报错，`<html lang>` 对，德荷波拉用米；锁卡和同意文字都放得下（同意文字 11 px，英 2 行，法 3 行）。冰钓页（`/mktbf2026/ice/?lang=de`）看了一次，0 报错。
    锁卡六种语言的图：`docs/2026-11-04-mkt-lock-card-6lang.png`。
- [x] **（11-04 已译，#246：13 条德荷波拉 + 欧洲成功两句五种语言，Lab HQ 自核，网站再核中）锁卡这 13 条还没有德、荷、波、拉（不自己编，报 HQ）：** unlock_title、unlock_locked、unlock_text、unlock_done、unlock_email、unlock_cta、unlock_sending、
  unlock_consent、unlock_privacy、unlock_err_email、unlock_err_send、unlock_err_closed、back_to_lake。
  五种语言的表（`docs/2026-11-03-lab-strings-5lang.md` 第九节）专门写了“锁（营销版）不在这张表里”。现在德、荷、波、拉的访客看到的锁卡是英文，只有视图名是那种语言（“Unlock Live-Kombi”）。
  卡上的 “Test mode: nothing is sent.” 和隐私链接 `shop.accuphy.com/policies/privacy-policy` 也只有一种写法。要 Lab 多语言出译文、网站核过，再放进复制件。
  - #212：`embed.js`、`i18n.js` 等文件，066623a 及以后。
  - #224：99e15c8，冰钓页前视 120 ft 进画面。要搬的只是复制件里湖页那部分代码（#226）。
  - 搬完要做的：
    - 重跑四套单元测试，`LAB_DIR=2026-11-03-sonar-lake-bf`，share-url 那 4 条失败要变成通过；
    - 重跑假店铺页：`/mktbf2026/` 用 `LAB_LOCKED=1`，含 share-de；
    - 湖页和冰钓页各看一眼；
    - 报 HQ。
  - `/ice/`、`/mktbf2026/ice/` 是网站嵌入版的冰钓页，已经有 120 ft：它的复制件取自 96fdc22，96fdc22 包含 99e15c8。
  - 没搬之前：德、荷、波、拉的访客在 MKT 页上看到英文，分享出去的链接也不带语言。

## 六点五、欧洲两步确认名单（Jason 11-04 在 Klaviyo HQ：“欧洲需要做两步的”）

- [ ] **Klaviyo：** 新建欧洲 Lab 名单，两步确认（double opt-in），确认邮件出各语言。Klaviyo HQ 先出预览，Jason 在 Klaviyo HQ 说“动”才建；名单号建好后给 Lab HQ。
- [x] **Lab（带锁版复制件）：** 订阅卡按市场送名单：加拿大、美国、澳洲 → W24Qdc（单次确认）；欧洲各市场（fr-fr、nl-benelux、fr-benelux、de-de、波兰、拉脱维亚）→ 欧洲新名单。欧洲成功页写“去邮箱点确认”（五种语言，要网站 / Lab 多语言核过，不自己编）。
  **11-04 做好了，等名单号和译文**（HQ 转 Jason 11-04：“现在做”；更正：“不用再单独做订阅还没开放的显示了”）：
  - **怎么分：** 只有店铺页给的信息全都指向北美澳，才送 W24Qdc：`market` 是 ca / us / au（有传的话），而且 `shop` 是 `/`、`/fr`、`/en-us`、`/en-au`（有传的话），两样至少有一样，语言也不是 de / nl / pl / lv。
    其他情况一律送欧洲名单，包括什么都没传（直接打开 lab.accuphy.ca）、只有 `?lang=fr`、市场和网址对不上。欧洲访客永远进不了 W24Qdc。
  - **名单号：** 欧洲的放 `VITE_BF_LIST_ID_EU`，只在上线包里填：`VITE_BF_LIST_ID=W24Qdc VITE_BF_LIST_ID_EU=<Klaviyo 给的号> node scripts/build-bf-site.mjs <out>`。
    欧洲名单号没填时，照没填名单号的老规矩：真实域名上欧洲访客订不了（“Subscribing isn’t open yet”，不解锁），没有新界面；测试链接上两边都是测试模式。
  - **欧洲成功卡：** 标题 “Check your inbox”，下一行 “Click the link in our email to confirm your subscription. {view} is unlocked now.”，停 4.5 秒，然后视图马上打开（Lab 看不到确认那一下）。北美澳照旧 “You’re in. {view} is unlocked.”，停 1.5 秒。
    这两句英文是草稿，放进了 `docs/2026-11-03-lab-strings-5lang.md` 第十一节，等 HQ 送核；法、德、荷、波、拉没写（欧洲的法国、比荷卢法语访客现在也看到英文）。
  - **不变：** 档案属性（signup_market 等）、事件都照旧，事件里没有邮箱。
  - **测试：** `node scripts/dev/mkt-list-route-test.mjs` 33/33（23 种店铺网址 / 市场 / 语言 → 哪个名单；10 种名单号填没填 → 送哪个、拒绝还是测试模式）；四套单元测试照旧全过（Base 的 signup-guard 也过）。
    假店铺页（`LAB_LOCKED=1`，新加 `LAB_SHOP=` 选店铺网址）：测试包 9/9（德国页，成功卡 “Check your inbox”）+ 加拿大页 lock-desktop PASS（“You’re in…”）；
    再用临时假名单号打一份草稿包（只在本机，不上线，fetch 被拦住什么都不发）：德国页送到欧洲那个号，加拿大 `/` 和美国 `/en-us` 送到北美那个号。
    `/`、`/mini/`、`/ice/` 用 `BASE_REF=537adc2` 打，md5 = 线上；名单号只出现在 `/mktbf2026/`。
    手机 390×844：欧洲卡（德、法、波）和北美卡（英、法）都放得下，没有溢出，0 报错。图：`docs/2026-11-04-mkt-success-card-phone.png`。
  - **还差：** Klaviyo 的欧洲名单号；两句新英文定稿和五种语言译文；锁卡那 13 条的德荷波拉（第六节）。
- [x] **上线顺序：** Jason 11-04 在 Lab HQ 选“北美澳先上”：加拿大、美国、澳洲照原计划先上线投广告；欧洲 6 个市场的链接先不给广告，等欧洲名单建好、Lab 按市场送名单、“去邮箱点确认”文字核好再上。

## 七、上线当天（HQ 做，营销版核）

北美澳这一批已做过（11-04，见记录表 0117d52、c743dfe、00ff0d9、b572dde 那几行）。欧洲那一批上线时，再做一遍：

- [x] 上线包和测试链接用同一个提交打包，写进 `docs/versions.md`、`docs/version-sheet.md`、`docs/lab-links-sheet.md`。（11-04 北美澳每次都做了）
- [x] 线上 `/`、`/mini/`、`/ice/` 的 md5 = 部署前的线上（不带锁的那份没被覆盖）；`/mktbf2026/` 和 `/mktbf2026/ice/` 打开返回 200，0 报错。（11-04 北美澳每次都核了）
- [x] 网站 03 复测 MKT 页的真实订阅。（11-04 北美澳：网站 224f413b，加上 Klaviyo 读回）
- [x] **欧洲那一批：** 11-05 上线（e6efaf3），见记录表。还差 Klaviyo HQ 在手机上走一遍“订阅 → 确认信 → 跳回解锁”并用 API 读回。

## 记录

| 日期 | 哪一项 | 证据 |
|---|---|---|
| 2026-11-03 | 复制件 + 打包脚本 | 6d65f00、dfa9a55；假店铺页带锁 8/8 |
| 2026-11-03 | 同意文字 | 4d41681；卡片显示新句子，lock-desktop PASS |
| 2026-11-03 | 布局 #228（/ = Base，带锁版另放） | 5c2178b；`/`、`/mini/`、`/ice/` md5 = 线上 86bf80e |
| 2026-11-03 | 改名 #233：/bf/ → /mktbf2026/ | 63862df；`BASE_REF=96fdc22` 打包，`/`、`/mini/`、`/ice/` md5 = 线上 96fdc22；/mktbf2026/ 带锁场景 PASS |
| 2026-11-03 | 网站嵌入版接手 /、/mini/、/ice/（5171be3） | 从 5171be3 打包：`/`、`/mini/`、`/ice/` md5 = 线上；/mktbf2026/ 还是 475bf95f；/mktbf2026/ice/ = /ice/；假店铺页带锁场景 PASS，只剩 share-de（多语言，预料中） |
| 2026-11-03 | 复制件自带 devices.js、wedge.js（9e96e0d，取自 86bf80e） | /mktbf2026/ md5 还是 475bf95f；假店铺页带锁场景 PASS |
| 2026-11-03 | unlock_done 法文（bab47fc） | 打包页里有 “C’est fait. La vue {view} est débloquée.”；`/`、`/mini/`、`/ice/` md5 = 线上；单元测试和假店铺页带锁场景通过，只剩多语言用例（预料中） |
| 2026-11-04 | 第四节 Klaviyo：HQ 把三件事转给本 app 的 Klaviyo HQ（local_c57e9aed，另一个账户的窗口停用，不写交接）：MKT 页关 VpD3CV；所有商店弹窗排除 */pages/lab* 和 */pages/sonarlab-mktbf2026*（K4b，左下角小圆标挡 Skip tour）；老订阅者邮件带 lab_unlock=sub。先出预览，Jason 在 Klaviyo HQ 说“动”才改 | Jason 11-04：“你和klaviyo窗口说一下弹窗要解决的事” |
| 2026-11-04 | 第四节 Klaviyo HQ 回（e8f7de4） | VpD3CV 不用改；商店弹窗排除清单 + 预览已出，Klaviyo 未改；lab_unlock=sub 由 Klaviyo HQ 问 Jason（BF 漏斗窗口已停用） |
| 2026-11-04 | #242 改 #240：教程里用到的视图教程期间都能用（Jason 11-04：“在卡片的时候应该大家是可以用的”，“好的”） | 本次提交。教程跑的时候，它自己用到的视图（Mini 第 1 站 Combo、PingLive 第 3 站 Panoramic，只限教程那台设备）不锁；第 3 站和第 2 站一样：点格子就开 Panoramic，停 5 秒，原来的教程字（tour_pano_*），没有锁、没有卡。教程结束（走完或 Skip，Replay 也一样）时，没订阅又停在锁住的视图，就回 Forward（同一台设备），格子上锁回来，再点才出卡。Tour.jsx 恢复成 #240 以前的样子（不再有锁卡文字）；时间不变（拖 4 秒、格子停 5 秒）。框里测：加拿大电脑整套教程 + Replay、第 3 站 Skip → Forward、加拿大手机整套教程、美国 Mini 教程（结束停在 Down，Combo 免费，Panoramic 出卡）、美国第 1 站 Skip（留在 Combo）都过，0 报错；假店铺页德国 9/9、加拿大 lock-desktop、美国 lock-us PASS；单元测试全过。`BASE_REF=96fdc22` 时 `/`、`/mini/`、`/ice/` md5 = 线上，`/mktbf2026/` 312e33c8。图 `docs/2026-11-04-mkt-tour-free-views.png`。没上线 |
| 2026-11-04 | #241 美国页 Live Combo 免费（Jason 11-04 在 Lab HQ：“美国的把combo打开吧 保留panoramic”） | 本次提交。规则在复制件 `locks.js`：店铺里、市场 us（`miniOnly()`）时 Combo 不锁，Panoramic、冰钓照旧锁；别的市场不变。`node scripts/dev/mkt-lock-rule-test.mjs` 11/11；四套单元测试 + mkt-list-route 全过；假店铺页：德国 9/9、加拿大 lock-desktop PASS、美国新场景 lock-us PASS（`LAB_SHOP=/en-us`：只有 Mini，Combo 直接开、有 view 事件没有 signup，Panoramic 出卡）；框里美国电脑 / 手机、加拿大电脑 / 手机、美国教程第 1 站（Combo 不锁）都过，0 报错。`BASE_REF=96fdc22` 时 `/`、`/mini/`、`/ice/` md5 = 线上，`/mktbf2026/` bd72c350。美国访客进不了 PingLive：设备只有 Mini（没有网址参数能换），手机 Home 只有 Mini 一栏，分享链接去 `/en-us/pages/lab`（网站嵌入版，美国也只有 Mini），去商店进 Mini。美国访客要是用了没有 /en-us 的主站链接（market = ca），看到的是加拿大版（有 PingLive，Combo 要订阅）。图 `docs/2026-11-04-mkt-us-combo-free.png`。没上线 |
| 2026-11-04 | #240 PingLive 全景也上锁（Jason 11-04 在 Lab HQ：“锁全景 Panoramic”） | 本次提交。加拿大页：Down、Forward 不锁，Panoramic 出卡（“Unlock Live Panoramic” / “Débloquer la vue Panoramique en direct”），订阅后打开，signup 事件 view=panoramic、product=pinglive-sonar；`lab_unlock=sub` 直接打开；手机 Home 的 Panoramic View 格子带锁；入场教程第 3 站没订阅时停在 Forward、用锁卡原有的两句话，点格子出卡，不点 8 秒后教程自己结束；美国页（框里）只有 Mini。四套单元测试 + mkt-list-route 全过；假店铺页带锁 9/9；`BASE_REF=96fdc22` 时 `/`、`/mini/`、`/ice/` md5 = 线上，`/mktbf2026/` 7c00c804；0 报错。图 `docs/2026-11-04-mkt-pl-panoramic-lock.png`。没上线 |
| 2026-11-04 | 第六点五节 Lab：订阅卡按市场送名单（北美澳 → W24Qdc，欧洲和不明 → `VITE_BF_LIST_ID_EU`），欧洲成功卡“Check your inbox” | 本次提交；mkt-list-route-test 33/33；假店铺页德国 9/9、加拿大 lock PASS；假名单号草稿包：德 → 欧洲号，加拿大 / 美国 → 北美号；手机卡都放得下。等名单号和译文 |
| 2026-11-04 | 第六节搬完（新的 Lab 营销版，本 app） | 本次提交；单元测试四套全过（share-url 22/22）；假店铺页带锁 9/9 含 share-de；`/mktbf2026/` md5 c4c8bce9；`BASE_REF=537adc2` 时 `/`、`/mini/`、`/ice/` md5 = 线上；六种语言 × 电脑/手机 0 报错；`docs/2026-11-04-mkt-lock-card-6lang.png`。锁卡 13 条德荷波拉没有，报 HQ |
| 2026-11-04 | 第六节：Jason 在 Lab HQ 说“搬”（五种语言 #212 + 冰钓 #224 搬进带锁版） | 旧营销版窗口在停用的另一个账户里找不到；HQ 在本 app 建了新的“Lab 营销版”任务卡（lab-mkt），按第六节做，只改复制件，不上线 |
| 2026-11-04 | 后面那一层上线（第一、二、七节） | 0117d52 + BASE_REF 96fdc22，Vercel FaE6Y1UjSaYBVW3o7FCtL5gX1DhP；`/`、`/mini/`、`/ice/`、`/embed/lab.js` md5 = 上线前；`/mktbf2026/`、`/mktbf2026/ice/` 200；W24Qdc 只在 /mktbf2026/；浏览器加拿大参数 → Live Combo 出订阅卡，0 报错，没提交 |
| 2026-11-04 | 客人看到的店铺页上线（第一节） | 网站 #244，00 446dbfb6（Jason 在网站 HQ 说“动”）；HQ curl 各前缀 200，框指向 lab.accuphy.ca/mktbf2026/；03 在查全部前缀、拉脱维亚 /en-ro、无店铺弹窗；真实订阅测试等 Jason 点头；核完前链接不进广告 |
| 2026-11-04 | 网站 03 核 MKT 页（第五节） | fe7d485a 通过；剩测试订阅（等 Jason 在网站 HQ 点头），过了北美澳链接才进广告 |
| 2026-11-04 | 真实测试订阅（第五节，网站 #245） | 一次，测试邮箱，加拿大英文 MKT 页、加拿大 IP；网站 224f413b 通过：Combo 打开、重开仍解锁、无店铺弹窗、Meta Lead 1 次、GA4 generate_lead form=lab_unlock 1 次、请求里无邮箱。剩 Klaviyo HQ 读回 W24Qdc + 6 个属性，并把测试地址排除；读回通过才给广告 |
| 2026-11-04 | **北美澳可以进广告** | 店铺页 + Lab 都上线，网站 03 核过（fe7d485a），两次测试订阅通过（224f413b + Klaviyo 读回新邮箱）。欧洲名单、按国家分名单的后续、欧洲锁卡翻译：Jason 11-04 经 Klaviyo HQ “lab的先暂停 不重要的”，先停 |
| 2026-11-04 | #240 + #241 上线 | c743dfe，Vercel 9gzQuK8CM4gzNUYFLgVr226avow4；/、/mini/、/ice/、/embed/ md5 = 上线前；/mktbf2026/ = 打包；直接打开（加拿大参数、未订阅）PingLive 全景和 Mini 全景都锁；美国页待网站 03 用美国 IP 核 |
| 2026-11-04 | #240/#241 线上核（Lab HQ 自测；网站 HQ：锁哪些是 Lab 的内容，网站不核，#238） | 全新无头浏览器、真店铺页 /pages/sonarlab-mktbf2026，把框的 market 换成 ca / us：加拿大 = PingLive 全景锁、Mini Combo 和全景锁；美国 = 只有 Mini、Combo 不锁、全景锁；Lab 没有报错（只有店铺自己的两条 Shopify/Goaffpro 脚本提示） |
| 2026-11-04 | #242 上线（导览中导览的视图都能用，结束回 Forward） | 00ff0d9，Jason 在 Lab HQ 说“动, go live”；Vercel 6BTnuoHcTnRYCrrMCvoEJVn4ebs2；/、/mini/、/ice/、/embed/ md5 = 上线前；/mktbf2026/ b3d64b9d = 打包。同一份文件跑导览测试：加拿大电脑完整导览 + 重播、第 3 站跳过、加拿大手机、美国 Mini 导览和第 1 站跳过，都对、0 报错；真店铺页全新浏览器：加拿大锁 PingLive 全景、Mini Combo 和全景，美国只有 Mini、Combo 不锁、全景锁 |
| 2026-11-04 | #244 上线（订阅按国家进名单） | b572dde，Jason 在 Lab HQ 选“动，改好直接上线”；Vercel 3hZdxnHtUJH1vuJuuX1etH7HQDCZ；/、/mini/、/ice/、/embed/ md5 = 上线前；/mktbf2026/ 6cfc3363 = 打包。真店铺页全新浏览器提交（拦下请求，没发到 Klaviyo）：加拿大 → W24Qdc、美国 → SPeeP6、澳洲 → Scdcct，signup_market 对。等 Klaviyo HQ 用测试邮箱读回 |
| 2026-11-04 | #244 Klaviyo 读回通过 | Klaviyo HQ 23:15 UTC，Jason 同意提交 3 次（直接开 lab.accuphy.ca/mktbf2026/ 带 shop/market）：us → SPeeP6（没进 W24Qdc）、au → Scdcct、ca → W24Qdc，属性对，signup_market = us/au/ca；测试地址已进排除清单。US 档案 lab_product=pinglive-sonar 是因为直接开 Lab、不在店铺框里（miniOnly 只在店铺里生效），真店铺美国页只有 Mini（HQ 全新浏览器核过）。Klaviyo 那个浏览器里店铺框全景没锁 = 那个浏览器存过订阅记号（和 11-04 之前一样），全新浏览器里有锁 |
| 2026-11-04 | 欧洲重启（Jason 在 Lab HQ：“带锁版的欧洲的事情都可以开始搞了”） | #245 欧洲法语页默认米（330dba5）；#246 订阅卡欧洲四语 + 成功两句五语（截图 docs/2026-11-04-mkt-eu-card-4lang.jpg）；都没上线。已请 Klaviyo HQ：欧洲两步名单（一个还是按国家，等 Jason 在 Klaviyo HQ 定）+ 确认邮件各语言 + 同意那句够不够；已请网站 HQ：03 用波兰、拉脱维亚 IP 复查 /pl-pl、/en-ro 两页，再核卡片译文。上线要名单号到 + Jason 在 Lab HQ 说“动” |
| 2026-11-04 | 欧洲按国家分名单代码 + 网站复查 | #247 代码好了没上线（VITE_BF_LISTS_EU）；网站 03 da81cf99：/pl-pl 和 /en-ro?lang=lv 框对、去商店对、无店铺弹窗，拉脱维亚 IP 带 market=ee；HQ 真店铺页拦截核：欧洲提交不发送、不解锁、显示“还没开放”。等 Klaviyo 名单表（Benelux 分不分、罗马尼亚/拉脱维亚建不建由 Jason 在 Klaviyo HQ 定）和同意那句 |
| 2026-11-04 | 订阅卡译文网站核过 | 网站 HQ 232d587c 改 7 条（德 3、荷 1、波 2、拉 1），已放进复制件；公司名照英文写 “Accuphy”（不改成 Accuphy Trading Ltd.）。网站说明：不是母语者核的，波兰语最好请 Prime Power 看（要不要找由 Jason 定） |
| 2026-11-04 | Klaviyo 欧洲名单对照（Jason 在 Klaviyo HQ 定：Benelux 按语言分，罗马尼亚+波罗的海一个、英文确认信） | de/at/ch→DE；fr→FR；nl/nl-nl/be-nl/lu-nl/be→BENELUX NL；be-fr/lu-fr/lu→BENELUX FR；pl→PL；ro/lv/ee→RO-LV。HQ 用占位号走真链路全对；回 Klaviyo 两个边角（瑞士法语在 /fr-fr 会进 DE；/de-benelux 的德语进荷/法名单），加键即可。同意那句不用改。Klaviyo 定边角：ch-fr→FR，be-de/lu-de→BENELUX FR。等名单建好给号（含这三个键） |
| 2026-11-05 | 换号后营销版接回（SW-1104），整理清单 | 线上 /mktbf2026/ md5 6cfc3363 = b572dde 加三个名单号重新打包；三个店铺 MKT 页 200；线上没有欧洲名单对照 |
| 2026-11-05 | 欧洲这一批上线包备好（没部署：营销版这个窗口没有部署权限） | 从 e6efaf3（复制件和打包脚本到现在没再改过）打包，BASE_REF=96fdc22，三个北美澳名单号 + VITE_BF_LISTS_EU（Klaviyo HQ 给的 6 个号，19 个市场键），不设 VITE_BF_LIST_ID_EU。`/`、`/mini/`、`/ice/`、`/embed/lab.js`、`/embed/lab-0c39d390cc.js` md5 = 线上；/mktbf2026/ 7d1ba67d。9 个名单号只在 /mktbf2026/。用 lab.accuphy.ca 的假主机、拦下请求（没发到 Klaviyo），11 个场景全对、0 报错：加拿大英/法 → W24Qdc（法语“C’est fait. La vue … est débloquée.”）、澳洲 → Scdcct、德国/奥地利 → VGcbFE、法国 → Usa6sq、比荷卢荷 → XpYNQK、比荷卢法 → TzfgMB、波兰 → R9NkEv、拉脱维亚（ee / ro）→ RGc8VJ；欧洲都显示本国语言的“请查收邮箱”。假店铺页：德国 9/9、加拿大 lock-desktop、美国 lock-us 通过。单元测试全过（signup-guard 用对接 a9f0195 的新版）、mkt-list-route / lock-rule / units 全过。拉脱维亚卡片是拉脱维亚语、确认信是英语，这是 #227 定的。 |
| 2026-11-05 | **欧洲这一批上线**（Jason 在 Lab HQ 卡片上点“动，HQ 部署”；也在营销版窗口点了“允许在这里部署”） | e6efaf3 + BASE_REF=96fdc22 + 9 个名单号（VITE_BF_LISTS_EU 19 个键）。同一个包部署了三次：HQ 两次（dpl_6btnPxkzAj4dVSB5TeVt46PxEUYX，https://vercel.com/accuphy/accuphy-lab/6btnPxkzAj4dVSB5TeVt46PxEUYX），营销版一次 dpl_9MPtmHsQw3f1bdS7o9G73zRDntC2（最后一次，现在 lab.accuphy.ca 指向它）。营销版线上核：`/` afb82b9c、`/mini/`、`/ice/`、`/embed/lab.js`、`lab-0c39d390cc.js` 和上线前一样；`/mktbf2026/` 7d1ba67d = 包；`/mktbf2026/ice/` = `/ice/`；9 个名单号只在 /mktbf2026/；noindex 和 frame-ancestors 在；.env、.env.local、.vercel 404；9 个店铺 MKT 页 200。真 lab.accuphy.ca 上 11 个场景（拦下请求，没发到 Klaviyo）全对、0 报错。等 Klaviyo HQ 手机实测和读回 |
| 2026-11-05 | 下一个上线包备好（自动重试 + 成功条件收紧 + lock_shown；没部署） | 代码 529b533（测试 8b5077e），BASE_REF=96fdc22 + 9 个名单号；包在营销版 scratchpad 的 rel-3。`/`、`/mini/`、`/ice/` md5 = 线上；/mktbf2026/ 9638344b；9 个号只在 /mktbf2026/。单元测试全过（signup-guard 含 8 条重试）；mkt-list-route / lock-rule / units 全过；营销版自己补的 10 种回复（202/200 成功；status 0、opaque、重定向、没回复、503×3 → 试满 3 次失败；403 → 1 次失败）全对。假店铺页：德国全套、加拿大 lock-desktop、美国 lock-us 通过（对接 12/12）。浏览器里：503 一次后成功 / 网络错误后成功 → 解锁；503×3 → 约 2.1 秒后出错提示、不解锁、不发 signup；lock_shown 一次访问一次（开两次卡只发一次），带 product + view，导览和 lab_unlock=sub 都不发；11 个市场的名单和成功卡都对，0 报错。lock_shown 进 Meta / GA4 还要网站在桥里加一行（对接已起草交接单，HQ 发） |
| 2026-11-05 | **上线：自动重试 + 成功条件收紧 + lock_shown**（Jason 在 Lab HQ 卡片上点“动，上线”，又在营销版窗口点“允许在这里部署”） | 529b533（测试 8b5077e），BASE_REF=96fdc22 + 9 个名单号；营销版部署 dpl_EVpBUxsKAXej9vMQ7YeZmCMxDk8c，https://vercel.com/accuphy/accuphy-lab/EVpBUxsKAXej9vMQ7YeZmCMxDk8c。线上核：/mktbf2026/ 9638344b = 包；`/` afb82b9c、`/mini/`、`/ice/`、`/embed/lab.js`、`lab-0c39d390cc.js` 不变；/mktbf2026/ice/ = /ice/；9 个名单号只在 /mktbf2026/；noindex、frame-ancestors 在；.env、.env.local、.vercel 404。真 lab.accuphy.ca 上（拦下请求，没发到 Klaviyo）：11 个市场名单和成功卡都对；503 一次后成功 / 网络错误后成功 → 解锁；503×3 → 约 2.1 秒出错提示、不解锁、不发 signup；400 → 1 次失败；lock_shown 一次访问一次（product + view），导览、lab_unlock=sub 不发；0 报错。lock_shown 进 Meta / GA4 还等网站在桥里加一行 |
| 2026-11-05 | 同一个包（rel-3）部署了两次 | HQ 一次（https://vercel.com/accuphy/accuphy-lab/5x9AMaCMkc1i4RaCoakuuJGCmrsh，Jason 在 Lab HQ 选“HQ 部署”），营销版一次（dpl_EVpBUxsKAXej9vMQ7YeZmCMxDk8c，Jason 在营销版窗口点“允许在这里部署”）。内容一样。lab.accuphy.ca 现在指向 dpl_EVpBUxsK（13:53）；/mktbf2026/ 9638344b、/ afb82b9c；真 lab.accuphy.ca 上 11 个市场重跑一遍，全对、0 报错 |
| 2026-11-05 | 分享链接改指向 MKT 页（5a47ccb，没上线） | 改前线上实测（10 个市场，QR 用 jsQR 解）：二维码和复制链接都指向免费版 `<市场>/pages/lab`，带 lab_share utm，没有 lab_unlock。改后包 rel-4（BASE_REF=96fdc22 + 9 个名单号）：10 个市场的二维码和复制链接都是 `<市场>/pages/sonarlab-mktbf2026`，市场前缀、lang（de/nl/pl/lv）、utm 照旧，20 条里没有 lab_unlock（来访链接带着 lab_unlock=sub 也没带出去）；10 个目标店铺页都 200、框都是 lab.accuphy.ca/mktbf2026/。`/`、`/mini/`、`/ice/` md5 = 线上；/mktbf2026/ 4d384927。单元测试其余全过；share-url-test 21 条按旧路径失败，等对接给 MKT 新预期 |
| 2026-11-05 | 分享链接改动全套测完（没上线） | 代码 5a47ccb，测试 297bbbb。单元测试全过（share-url 22/22 按 MKT 新预期）；mkt-list-route / lock-rule / units 全过；假店铺页德国全套、加拿大 lock-desktop、美国 lock-us 通过（对接 12/12）；11 个市场的名单和成功卡、重试、lock_shown 都和上一版一样对，0 报错。包 rel-4 已放进 /embed/（= 线上）并 link 好，/mktbf2026/ 4d384927，免费版 md5 = 线上。等 Jason 在 Lab HQ 说“动”，再在营销版窗口点允许部署 |
