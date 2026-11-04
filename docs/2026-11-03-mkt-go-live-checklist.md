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

## 现在是什么

- **复制件：** `src/experiments/2026-11-03-sonar-lake-bf/`，从 Base 86bf80e 复制，锁永远开着（#191、#213）。同意文字已经放进去（4d41681）。
- **打包：** `node scripts/build-bf-site.mjs <out> [版本]`（#228、#233 的布局；两份复制件都从同一个提交打包，`BASE_REF` 只在要重打旧版本时用）。
  - `/`、`/mini/`、`/ice/` 是网站嵌入版（不带锁，#233，从它的复制件 `2026-11-03-sonar-lake-web/` 打包），md5 和线上一样；
  - `/mktbf2026/` 是带锁版；
  - `/mktbf2026/ice/` 是网站嵌入版冰钓页 `/ice/` 的一份复制（不带锁）。
- **测试链接：** HQ 已更新，`/mktbf2026/` 是测试模式，什么都不发。
- **投放链接：** 10 个市场，每个市场主页网址 + `/pages/sonarlab-mktbf2026`，页面里嵌 lab.accuphy.ca/mktbf2026/（#229、#230）。见 `docs/lab-links-sheet.md` 第一节。
- **还没上线：** lab.accuphy.ca/mktbf2026/ 没上，店铺 MKT 页也没建。

> **上线时间（#234，Jason 11-03：“等多语言一起上”）：** 后面那一层 lab.accuphy.ca/mktbf2026/ 要等多语言 #212 核完、搬进复制件以后才上（第六节）。
> Klaviyo 关弹窗、Lab HQ 的“动”，都到那时候再问 Jason。上线顺序照旧：先上 /mktbf2026/（店铺链接先不投）→ 网站 03 测一次真实订阅 → 都过了再交给广告。

## 一、Jason 要说的两个“动”

- [ ] **后面那一层 lab.accuphy.ca/mktbf2026/ 上线：** Jason 在 **Lab HQ** 说“动”。
  - HQ 用上线包部署。上线包是填了名单号的那份，见第二节。
  - `/`、`/mini/`、`/ice/` 仍是网站嵌入版，部署前用 md5 证明和当时的线上一样（#228：营销版不覆盖不带锁的那一份）。
- [x] **客人看到的那一层，店铺 MKT 页 /pages/sonarlab-mktbf2026：** Jason 11-03 在 **网站 HQ** 说了“动”（网站 #241），网站 00 正在建，框指向 `https://lab.accuphy.ca/mktbf2026/`。
  - **注意：** 后面那一层 /mktbf2026/ 上线以前，这个店铺页的框里是空的（404）。页面不在菜单里，客人找不到，但**不能拿去投广告**。
  - 网站方案：`accuphy-website/docs/plans/2026-11-03-lab-mkt-store-page.md`。
  - 复制 `page.lab.json`，嵌入地址改成 `https://lab.accuphy.ca/mktbf2026/`；新页面 handle 是 `sonarlab-mktbf2026`；不放进菜单；`/pages/lab` 不动。
  - 页面可以先建好；/mktbf2026/ 上线前，这批链接不给广告。

## 二、名单号

- [ ] **W24Qdc 只在上线包里填：** `VITE_BF_LIST_ID=W24Qdc node scripts/build-bf-site.mjs <out> [版本]`。
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
- [ ] **商店弹窗不进 Lab 页和 MKT 页**（K4b，Klaviyo HQ e8f7de4 清单 + 预览）：CA RUd8QJ、DE W8UPFL、BNL RwEkZj、FR TeNugm、RO WgcWSj 加 `*/pages/lab*` 和 `*/pages/sonarlab-mktbf2026*`；美国 SRSX6U、TWCLKy 只加 MKT 那条；澳洲弹窗没发布。顺带去掉挡 Skip tour 的小圆标。等 Jason 在 Klaviyo HQ 说“动”。
- [ ] 发给老订阅者的邮件链接带 `lab_unlock=sub`：直接解锁，不出卡，不算新 Lead。由漏斗和 Klaviyo 定。

## 五、网站 03 的检查（经 HQ）

- [ ] **真实订阅测一次：** 在店铺 MKT 页上用一个测试邮箱。只提交一次，要 Jason 同意。要看到：
  - 邮箱进了 W24Qdc，档案上带 `signup_page=accuphy-lab`、`signup_channel=lab_unlock`、`signup_language`、`signup_market`、`lab_scene`、`lab_product`；
  - Combo 打开了；
  - 店铺这边算一次 Meta Lead / GA4 generate_lead（form = lab_unlock），事件里不带邮箱；
  - 没有 Klaviyo 弹窗。
- [x] **各国 IP 测试：** 网站 03 11-03 做完（194a98c0），结果已整理进 `docs/lab-links-sheet.md` 第一节。
  - 10 个市场都能用。奥地利、瑞士用德国链接。波兰会转到 /en-pl，lang=pl 还在。
  - **还剩一样：** 拉脱维亚用主站链接会转到罗马尼亚语的 /ro-ro，还是直接用 /en-ro（英文），HQ 在问 Jason，链接表里先写“待定”。
  - 网站还看到：德国 IP 打开 /de-de 时，Klaviyo 的全屏弹窗会盖住 Lab。所以第四节在 MKT 页上关 VpD3CV 是必须的。
- [ ] **MKT 页本身：** 店铺页建好后，03 核一次。
  - 每个市场前缀都能打开，含澳洲 `/en-au/pages/sonarlab-mktbf2026`；
  - 框的地址是 `/mktbf2026/`；
  - `lang` / `shop` / `market` 照传；
  - 事件和 `/pages/lab` 一样；
  - 美国只出 Mini。

## 六、Base 的改动搬进复制件（#216、#226）

- [ ] **多语言 #212 和冰钓 #224 一起搬（#234：这一项做完，MKT 版才上线）：** 等多语言核完、放进 Base，HQ 通知后，营销版一次搬这两样。
  - #212：`embed.js`、`i18n.js` 等文件，066623a 及以后。
  - #224：99e15c8，冰钓页前视 120 ft 进画面。要搬的只是复制件里湖页那部分代码（#226）。
  - 搬完要做的：
    - 重跑四套单元测试，`LAB_DIR=2026-11-03-sonar-lake-bf`，share-url 那 4 条失败要变成通过；
    - 重跑假店铺页：`/mktbf2026/` 用 `LAB_LOCKED=1`，含 share-de；
    - 湖页和冰钓页各看一眼；
    - 报 HQ。
  - `/ice/`、`/mktbf2026/ice/` 是网站嵌入版的冰钓页，已经有 120 ft：它的复制件取自 96fdc22，96fdc22 包含 99e15c8。
  - 没搬之前：德、荷、波、拉的访客在 MKT 页上看到英文，分享出去的链接也不带语言。

## 七、上线当天（HQ 做，营销版核）

- [ ] 上线包和测试链接用同一个提交打包，写进 `docs/versions.md`、`docs/version-sheet.md`、`docs/lab-links-sheet.md`。
- [ ] 线上 `/`、`/mini/`、`/ice/` 的 md5 = 部署前的线上（Base 没被覆盖）；`/mktbf2026/` 和 `/mktbf2026/ice/` 打开返回 200，0 报错。
- [ ] 通知网站 HQ：03 复测 MKT 页的真实订阅弹窗。

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
| 2026-11-04 | 第六节：Jason 在 Lab HQ 说“搬”（五种语言 #212 + 冰钓 #224 搬进带锁版） | 旧营销版窗口在停用的另一个账户里找不到；HQ 在本 app 建了新的“Lab 营销版”任务卡（lab-mkt），按第六节做，只改复制件，不上线 |
