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
- **打包：** `BASE_REF=<Base 版本> node scripts/build-bf-site.mjs <out>`（#228 的布局）。
  - `/`、`/mini/`、`/ice/` 是 Base，md5 和线上一样；
  - `/mktbf2026/` 是带锁版；
  - `/mktbf2026/ice/` 是 Base 冰钓页的一份复制。
- **测试链接：** HQ 已更新，`/mktbf2026/` 是测试模式，什么都不发。
- **投放链接：** 10 个市场，每个市场主页网址 + `/pages/sonarlab-mktbf2026`，页面里嵌 lab.accuphy.ca/mktbf2026/（#229、#230）。见 `docs/lab-links-sheet.md` 第一节。
- **还没上线：** lab.accuphy.ca/mktbf2026/ 没上，店铺 MKT 页也没建。

## 一、Jason 要说的两个“动”

- [ ] **后面那一层 lab.accuphy.ca/mktbf2026/ 上线：** Jason 在 **Lab HQ** 说“动”。
  - HQ 用上线包部署。上线包是填了名单号的那份，见第二节。
  - `/`、`/mini/`、`/ice/` 仍是 Base，部署前用 md5 证明和当时的线上一样（#228：营销版不覆盖 Base）。
- [ ] **客人看到的那一层，店铺 MKT 页 /pages/sonarlab-mktbf2026 上线：** Jason 在 **网站 HQ** 说“动”。
  - 网站方案：`accuphy-website/docs/plans/2026-11-03-lab-mkt-store-page.md`。
  - 复制 `page.lab.json`，嵌入地址改成 `https://lab.accuphy.ca/mktbf2026/`；新页面 handle 是 `sonarlab-mktbf2026`；不放进菜单；`/pages/lab` 不动。
  - 页面可以先建好；/mktbf2026/ 上线前，这批链接不给广告。

## 二、名单号

- [ ] **W24Qdc 只在上线包里填：** `VITE_BF_LIST_ID=W24Qdc BASE_REF=<Base 版本> node scripts/build-bf-site.mjs <out>`。
  - 测试链接不填，所以测试访客进不了真名单。
  - 没填时：真实域名上订阅卡说 “Subscribing isn’t open yet”、Combo 不开；测试链接上是 “Test mode: nothing is sent”。
  - 部署后核一次：线上 `/mktbf2026/` 的页面里能找到 `W24Qdc`，`/` 里找不到。

## 三、文字

- [x] **同意文字**（Jason 11-03 在 BF 漏斗窗口亲口定，4d41681 已放进复制件）：
  - 英：“By subscribing, you agree to receive marketing emails from Accuphy. Unsubscribe anytime.”
  - 法：“En vous abonnant, vous acceptez de recevoir des courriels marketing d’Accuphy. Désabonnement en tout temps.”
  - 后面接 Privacy Policy / Politique de confidentialité 链接；一行小字，11 px，灰色。
- [ ] **unlock_done**（订阅成功后显示 1.1 秒）：**等 Jason 确认**，HQ 问他。
  - 推荐：英文不改，“You’re in. {view} is unlocked.”；法文改成 “C’est fait. La vue {view} est débloquée.”。
  - 复制件现在的法文是 “C’est fait. {view} est débloquée.”。
  - Jason 确认后由营销版改进复制件，跑测试，报 HQ。

## 四、Klaviyo（经 HQ，Klaviyo HQ 做）

- [ ] **20 秒弹窗 VpD3CV 只在 MKT 页上关掉**（`/pages/sonarlab-mktbf2026`，所有市场前缀）。`/pages/lab` 和店里其他页照旧。
  - 不关的话，Lab 的订阅卡和 Klaviyo 的弹窗会一起出来。
  - 要 Jason 在 Klaviyo HQ 说“动”。
- [ ] 发给老订阅者的邮件链接带 `lab_unlock=sub`：直接解锁，不出卡，不算新 Lead。由漏斗和 Klaviyo 定。

## 五、网站 03 的检查（经 HQ）

- [ ] **真实订阅测一次：** 在店铺 MKT 页上用一个测试邮箱。只提交一次，要 Jason 同意。要看到：
  - 邮箱进了 W24Qdc，档案上带 `signup_page=accuphy-lab`、`signup_channel=lab_unlock`、`signup_language`、`signup_market`、`lab_scene`、`lab_product`；
  - Combo 打开了；
  - 店铺这边算一次 Meta Lead / GA4 generate_lead（form = lab_unlock），事件里不带邮箱；
  - 没有 Klaviyo 弹窗。
- [ ] **各国 IP 测试：** `accuphy-website/handoffs/2026-11-03-lab-ad-landing-links-check.md`，网站还没写答复。
  - 写完后，营销版把结果整理进 `docs/lab-links-sheet.md` 第一节：每个市场留下来还是被转走、`?lang=` 还在不在、奥地利和瑞士用哪个链接、加上 UTM 和 fbclid 后是否正常。
  - 地理转址按网址前缀走，所以 `/pages/lab` 的结果同样适用于 MKT 链接。
  - 澳洲已加进那份表（第 10 行 `/en-au/pages/lab`，网站 e947b900），03 用澳洲 IP 测。
- [ ] **MKT 页本身：** 店铺页建好后，03 核一次。
  - 每个市场前缀都能打开，含澳洲 `/en-au/pages/sonarlab-mktbf2026`；
  - 框的地址是 `/mktbf2026/`；
  - `lang` / `shop` / `market` 照传；
  - 事件和 `/pages/lab` 一样；
  - 美国只出 Mini。

## 六、Base 的改动搬进复制件（#216、#226）

- [ ] **多语言 #212 和冰钓 #224 一起搬：** 等多语言核完、放进 Base，HQ 通知后，营销版一次搬这两样。
  - #212：`embed.js`、`i18n.js` 等文件，066623a 及以后。
  - #224：99e15c8，冰钓页前视 120 ft 进画面。
  - 搬完要做的：
    - 重跑四套单元测试，`LAB_DIR=2026-11-03-sonar-lake-bf`，share-url 那 4 条失败要变成通过；
    - 重跑假店铺页：`/mktbf2026/` 用 `LAB_LOCKED=1`，含 share-de；
    - 湖页和冰钓页各看一眼；
    - 报 HQ。
  - `/ice/`、`/mktbf2026/ice/` 是用 BASE_REF 那个版本的 Base 打包的，所以只要 BASE_REF 含 99e15c8，它们就带上 #224。
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
