# 网站嵌入版 上线清单（Lab 网站嵌入版维护，2026-11-03，#233）

> **硬规则（#232，Jason 定，每次都要记住）：店铺页只是“相框”，Lab 本身放在 lab.accuphy.ca 上。**
> - 客人、广告、邮件只拿**店铺链接**（`shop.accuphy.com/<市场>/pages/lab`）。lab.accuphy.ca 的地址只在后台用，不给客人。
> - 各市场的 `/pages/lab` 框里显示的就是网站嵌入版：`lab.accuphy.ca/`（PingLive + Mini）、`/mini/`、`/ice/`，**不带锁**。
> - 带锁的 MKT 版是另一页 `/pages/sonarlab-mktbf2026` → `lab.accuphy.ca/mktbf2026/`，归 “Lab 营销版”，不在这份清单里。
> - Lab 的程序不放进 Shopify。
> - 清单里每一项都写清楚是哪一层：**客人看到的店铺页**，还是**它后面的 lab.accuphy.ca 地址**。

网站嵌入版归 “Lab 网站嵌入版” 窗口。HQ 管它；和网站、Klaviyo 的往来都经 HQ。上线 lab.accuphy.ca 要 Jason 在 **Lab HQ** 说“动”，由 HQ 打包、部署、核对；本窗口不部署，也不推测试链接。

## 现在是什么（11-03）

- **复制件：** `src/experiments/2026-11-03-sonar-lake-web/`，用 `git archive 96fdc22` 从 git 取出（60 个文件，和 96fdc22 的湖文件夹逐个一样），另加自己的入口 `share/`，画廊标题改成 “website embed”。
- **打包：** `BASE_REF=<版本> node scripts/build-bf-site.mjs <out>`：
  - `/`、`/mini/`、`/ice/` 从复制件打（`LAB_ENTRY=web`，这个变量不进代码）；
  - `/mktbf2026/`、`/mktbf2026/ice/` 归营销版，不变；
  - `BASE_REF` 指向没有复制件的旧版本（如 96fdc22）时，照旧从 Base 文件夹打。
- **证据（11-03）：** 复制件打出来的三页 md5 和线上 lab.accuphy.ca 一样：`/` afb82b9c、`/mini/` 26abb62f、`/ice/` f22f445a；11 张 App 首页小图也一样。故意把 Base 文件夹和 devices.js、wedge.js 的 Base 原件都弄坏再打，复制件照样打出这三个 md5 和 lab-0c39d390cc.js，所以确实只用复制件自己的文件。
- **自己的两个小文件（HQ 11-03）：** 设备参数 `devices.js`、波束形状 `wedge.js` 也各复制了一份进复制件（取自 96fdc22），不再和 Base 共用。
- **`/embed/`（HQ 11-03 定：从复制件打包，照旧部署）：** `node scripts/build-embed.mjs <out>` 只要复制件在，就从复制件打（`LAB_ENTRY=base` 才打 Base）。打出来 `lab-0c39d390cc.js`，和线上逐字一样（md5 b22f7398），`lab.js` 也一样。
- **冰钓格子：** 跳到“当前路径 + ice/”：`/` → `/ice/`，`/mini/` → `/ice/`，`/ice/` → `/ice/`，带上原来的 `?shop=`、`?lang=`，再加 `from=lake`。
- **客人看到的没变：** 线上还是 96fdc22 打的那一版，内容一样。

## 一、店铺各市场的 Lab 页（客人看到的那一层）

11-03 用 curl 打开，8 个市场前缀都是 200，框里是 lab.accuphy.ca/。

| 市场 | 店铺链接 | Lab 语言 |
|---|---|---|
| 加拿大 英 | https://shop.accuphy.com/pages/lab | 英 |
| 加拿大 法 | https://shop.accuphy.com/fr/pages/lab | 法 |
| 美国（只出 Mini，#190） | https://shop.accuphy.com/en-us/pages/lab | 英 |
| 澳洲 | https://shop.accuphy.com/en-au/pages/lab | 英 |
| 法国 | https://shop.accuphy.com/fr-fr/pages/lab | 法 |
| 比荷卢 荷兰语 | https://shop.accuphy.com/nl-benelux/pages/lab | 荷 |
| 比荷卢 法语 | https://shop.accuphy.com/fr-benelux/pages/lab | 法 |
| 德国 | https://shop.accuphy.com/de-de/pages/lab | 德 |
| 波兰（#218） | https://shop.accuphy.com/pages/lab?lang=pl | 波兰语 |
| 拉脱维亚（#218、#227） | https://shop.accuphy.com/pages/lab?lang=lv | 拉脱维亚语 |

- 五种语言的字已放进复制件（11-03，见第四节）；德、荷、波、拉先用米。线上还是旧版，要等上线才看得到。
- 店铺页本身（框、框里的地址）由网站改，要 Jason 在网站 HQ 说“动”。本窗口只管框后面的 lab.accuphy.ca。

## 二、店铺和 Lab 之间的通信（复制件里的 `embed.js`）

店铺的框把市场和语言通过网址告诉 Lab（`?shop=<市场根>&lang=…`）。复制件里的 `embed.js` 用这些：

- **统计事件：** 访客做了什么（看哪个视图、点去商店、分享），发给框外的店铺页，店铺记成 `accuphy:lab` 事件给 Meta。不发个人信息。直接打开 lab.accuphy.ca（不经店铺）时什么都不发。
- **去商店：** 进访客所在市场的产品页（`<市场根>/products/pinglive-sonar` 或 `pinglive-mini`），店铺里不加 utm。
- **分享：** 分享出去的是店铺链接 `<市场根>/pages/lab`，带 `lang` 和 lab_share 的 utm，不会把 lab.accuphy.ca 给出去。
- **美国只出 Mini：** 在店铺里、市场是美国时只给 Mini（#190）。
- **冰钓页：** 见上面“冰钓格子”。

规矩：`embed.js` 的行为和事件，测试照旧由 “营销和外部系统对接” 做（三个版本都测）；本复制件里的改动由本窗口改，改前告诉 HQ 和对接窗口。

## 三、上线前、上线后的核对

**上线前（每次 lab.accuphy.ca `/`、`/mini/`、`/ice/` 要换版本）：**

- [ ] Jason 在 Lab HQ 说了“动”（别的窗口转述的不算）。
- [ ] 复制件的改动都写进了 `docs/decisions.md` / 本清单；Base 的改进只在 Jason 说“搬”之后才搬进来。
- [ ] 打包用干净的 git 版本：`BASE_REF=<版本> node scripts/build-bf-site.mjs <out>`，再在同一份干净代码里跑 `node scripts/build-embed.mjs <out>`（出 `/embed/`）；打出来的 `/`、`/mini/`、`/ice/` 和 `embed/lab-*.js` 记下 md5。
- [ ] 先上测试链接试一遍：`/`、`/mini/`、`/ice/`、`/?lang=fr`、`/?lang=de` 都能打开，控制台 0 错误；冰钓格子跳到 `/ice/`；手机和电脑都看。
- [ ] 对接窗口测过统计事件、去商店、分享（店里框着测）。
- [ ] `/mktbf2026/` 没被这次打包改掉（营销版的那一页 md5 和它自己记的一样）。

**上线后（HQ 部署之后）：**

- [ ] 线上 `/`、`/mini/`、`/ice/`、`/embed/lab-*.js` 的 md5 = 打包时记的 md5。
- [ ] 第一节 10 个店铺链接都是 200，框里是 lab.accuphy.ca/。
- [ ] 店铺页里：拖船、换视图、冰钓格子、去商店（进对的市场）、分享（是店铺链接）都正常。
- [ ] 防嵌（frame-ancestors）和 noindex 还在；`.env.local`、`.vercel` 打不开（404）。
- [ ] 更新 `docs/lab-links-sheet.md` 的 /pages/lab 部分，并告诉 HQ 更新 `docs/version-sheet.md`、`docs/versions.md`。

## 四、各市场的语言

- 文字由 “Lab 多语言” 窗口整理、网站核过；核好的字经 HQ 交过来。
- 本窗口把核好的字放进复制件的 `i18n.js`；Base 那份由 Base 窗口放进它自己的 `i18n.js`，留作底本。两份要一样。
- 放进去以后：测试链接上 `?lang=` 每种语言看一遍（文字不溢出、不缺字），再走第三节上线。
- **11-03 已放进复制件**（Jason 在 Lab HQ 说“动，放进去”）：对照表 `docs/2026-11-03-lab-strings-5lang.md`（aa64746）里 64 个键的 fr / de / nl / pl / lv 全部照表填；英文一个字没动；法文 14 条换成表里的（教程 11 条原来没有法文、range_down、share_title 原来是 “Partager”、share_line 原来是空的）。不在表里的键（冰钓专用、锁）不动。
  - 自查：电脑 1280 上 de / nl / pl / lv / fr 首页、切到 Mini、分享框，屏幕上除了产品名都是那种语言，0 报错；手机 390 上 de / pl / lv 的按钮和提示也对。
  - 还剩英文的（表外，第十节，交 Base）：App Store / Google Play 徽章图、读屏和悬停字（“AUTO: follows the water depth”“ft / m”“App control — shown for reference”）。
  - 冰钓页借用了教程的标题和 Tap / Skip，所以德荷波拉的冰钓页会一半是那种语言、一半英文（冰钓专用句子还没翻）。
- 还没：线上（上线要 Jason 在 Lab HQ 说“动”）。

## 五、已定 / 要记着的

1. ~~`/embed/` 从哪打~~：HQ 11-03 定，从复制件打，照旧部署（见上面“现在是什么”）。
2. ~~和 Base 共用的两个小文件~~：HQ 11-03 定，各复制一份进复制件，已做。
3. 有人直接打开 `lab.accuphy.ca/index.html`（不是 `/`）时，冰钓格子会跳错。店铺框的是 `/`，客人碰不到；先记着。
4. **合作方网站放嵌入版（Jason 11-06 只是问问，不做、不用跟进）：** 德国经销商 Echolotzentrum（www.echolotzentrum.de，WordPress + WooCommerce），有 PingLive、PingLive Mini、两个套装的产品页，还有一篇 App 2.0 文章。
   - 他们那边：产品页和文章页没有防嵌设置，已经在放 YouTube 框，技术上放得进。
   - 真要做的话，我们这边三处要改：① lab.accuphy.ca 现在只许 shop.accuphy.com 和 Shopify 来框（frame-ancestors），要加他们的网址；② “去商店”按钮会跳到框外网站自己的 `/products/pinglive-sonar`，在他们网站上是 404，要改成去他们自己的产品页或我们的店；③ 分享链接同理，会变成他们网站上不存在的 `/pages/lab`。
   - 和 #232（客人只拿店铺链接）是新情况，要 Jason 定；联系合作方经 HQ，不由本窗口去。

## 改动记录

- 2026-11-03 Lab 网站嵌入版：建清单；复制件从 96fdc22 取出；打包改成 `/`、`/mini/`、`/ice/` 从复制件打，md5 = 线上。
- 2026-11-03 Lab 网站嵌入版：devices.js、wedge.js 复制进来；/embed/ 改从复制件打，= 线上 lab-0c39d390cc.js（HQ 定）。
- 2026-11-03 Lab 网站嵌入版：五种语言的字放进复制件 i18n.js（对照表 aa64746，Jason “动，放进去”）。
- 2026-11-06 Lab 网站嵌入版：查了合作方 Echolotzentrum 网站能不能放嵌入版（只看，没改），记进第五节第 4 条。
