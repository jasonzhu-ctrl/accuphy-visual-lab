状态：DONE（Lab 这边，HQ 2026-10-29）
From：accuphy-website HQ   To：accuphy-visual-lab HQ   创建：2026-10-28   期限：11-02 广告开投前（最好 10-31）

# Lab “去商店”按市场：用店铺传进来的 shop 参数拼地址（网站 #228，总管 X-14W）

## 背景和 Jason 批准了什么
- 黑五投放加了美国和欧洲代理商国家（总管 X-14，handoffs/2026-10-28-bf-scope-expanded.md）。
- 网站查到的问题：Lab 的“去商店”只认 `?lang=fr`，其余都去不带前缀的地址。德国、美国的访客点了，会去**加拿大**的产品页（加元价格、加拿大购买按钮）。美国看不到“只卖 Mini”的 301，欧洲看不到 “Find Retail Locations”。
- Jason 2026-10-28 在网站 HQ 回 X-14W 汇报（引的就是这一句：“‘去商店’按钮：德国、美国的客人点了，会跳到加拿大的商品页。”）：**“修复”**。网站决定 #228。
- lab.accuphy.ca 是你们项目的线上。要不要 Jason 在 Lab HQ 再说一次“动”，按你们的规矩定。

## 网站这边会给框多传的参数（00 改桥，Lab 不认识的参数会忽略，所以桥先上没事）
| 参数 | 值 | 例子 |
|---|---|---|
| `shop` | 访客所在市场和语言的根路径，Liquid `routes.root_url` | `/`（加拿大英文）、`/fr`、`/en-us`、`/de-de`、`/fr-benelux`、`/en-pl`、`/en-ro` |
| `market` | 国家代码小写 | `ca`、`us`、`de`、`be`、`pl`、`lv` |
| `lang` | 页面网址上带的 `?lang=`（白名单 en/fr/de/nl/pl/lv），没有就用店铺语言 | 德国页 `de`，荷兰语页 `nl`，波兰广告 `/en-pl/pages/lab?lang=pl` → `pl` |

## 请 Lab 改（embed.js 的 shopUrl）
1. 地址用 `shop` 拼：`shop` 存在、并且匹配 `^/([a-z]{2}(-[a-z]{2,})?)?$` 时，地址 = `(shop === '/' ? '' : shop) + '/products/' + product`；不匹配或没有，照现在的做法（fr → /fr，其余不带前缀）。
2. 在店里时仍然不加 utm（原规则不变）。
3. 美国：`/en-us/products/pinglive-sonar` 店里已经 301 到 Mini（网站 #118），所以第 1 条做了，美国就不会进 PingLive 页。`market=us` 时打开直接是 Mini、不出 “Shop PingLive” 按钮，是更好的做法（可以之后补）。
4. 语言：德、荷、波兰、拉脱维亚语界面另算（X-14W 方案第 3 条）。德、荷用词照法语那次，由网站 HQ 按 #198 和词表核。波兰语、拉脱维亚语谁来核，总管在问 Jason，先别上机器翻译。

## 不要做
- 不改商店（桥由网站 00 改）。

## 完成标准和证据
- lab.accuphy.ca 新版上线后，网站 03 在 /de-de、/en-us、/fr、/、/nl-benelux、/en-pl 的 Lab 页点“去商店”，打开的都是本市场的产品页（美国是 Mini）。

结果：Lab 第 1、2 条和 GA4 那 1 秒做完、已上线（#182、#184，lab.accuphy.ca 8c15c20）。网站 03 只测过加拿大英/法，其他市场待点。第 3 条（美国默认 Mini）、第 4 条（德/荷/波兰/拉脱维亚界面）没做，记进 backlog 待补。
- 2026-10-28 Lab HQ：收到，已派“手机网页端”改 embed.js 的 shopUrl（第 1、2 条；第 3、4 条之后）。代码做完 HQ 重打包测试链接；lab.accuphy.ca 上线按 Lab 规矩要 Jason 在 Lab HQ 说“动”。
- 2026-10-28 手机网页端：第 1、2 条做完（决定 #182，`embed.js` shopUrl + `share/embed.jsx` 传 data-shop；测试 `scripts/dev/shop-url-test.mjs` 16 条全过；打包页点按钮 ?shop=/de-de 去 /de-de/products/pinglive-sonar，事件不变）。等 HQ 重打包、Jason 说“动”上 lab.accuphy.ca，再请网站 03 按完成标准点一遍。第 3、4 条没做。
- 2026-10-28 Lab HQ：手机网页端做完（1fc1678，#182），HQ 核过；朋友测试链接已是新版。注意：在加拿大点去 /de-de 时，店里的按地区跳转（`/apps/theme-core/p/api/check-ip`）会把人送回加拿大页面；03 从加拿大测要用 VPN 或先在店里切到德国。Lab 发出的地址本身是对的（页面里拦截到的跳转是 /de-de/products/pinglive-sonar）。lab.accuphy.ca 等 Jason 在 Lab HQ 说“动”。
- 2026-10-28 Lab HQ：Jason 在 Lab HQ 说“动，更新”，lab.accuphy.ca 已上线 1fc1678（embed `lab-1401b14c6b.js`）。HQ 在 lab.accuphy.ca 上用 `?shop=/en-us` 点按钮：去 `/en-us/products/pinglive-sonar`（店里再 301 到 Mini）。请 03 按完成标准在各市场的 Lab 页点一遍（从加拿大测德国等要用 VPN 或先切市场，见上一条）。
- 2026-10-28 手机网页端：第二部分做完（决定 #184）：跳转等 1000 ms，按钮显示 “Opening the store… / Ouverture de la boutique…”（法文请网站 HQ 核），期间再点无效，返回后复位。实测点后 1006–1030 ms 才发出商品页请求，三次点只有一个 shop_click。提醒：?lang=fr 时 Lab 去的是 /fr/products/pinglive-sonar，店铺在没有法语偏好的浏览器里给了英文页。
- 2026-10-28 Lab HQ：第二部分（GA4 漏记 shop_click）做完：openShop 等 1000 ms，点后按钮显示 EN “Opening the store…” / FR “Ouverture de la boutique…”，跳之前再点无效（Lab 479ca21，#184）。HQ 在朋友测试链接上核过：法文、连点 3 次 → 1 个 shop_click，1002 ms 后去 /fr/products/pinglive-sonar。**请网站核这句法文。**lab.accuphy.ca 等 Jason 在 Lab HQ 说“动”。另：?lang=fr 时 Lab 请求 /fr/products/…，但浏览器没有法语偏好时店铺自己会给英文页，那是店铺的语言跳转。
- 2026-10-28 网站 03（第三步，普通 Chrome UA，加拿大 IP，1e32b6b）：英文 /pages/lab 点去商店 → 落点 /products/pinglive-sonar，Meta Lab_ShopClick 和 Shopify accuphy:lab 有，GA4 lab_shop_click 没有；法文 /fr/pages/lab 点去商店 → 也落点英文 /products/pinglive-sonar（店铺跳转），Meta 和 Shopify 有，GA4 没有；连点 3 次只算 1 次。详情：docs/verification/2026-10-28-d228-lab-shop-prefix/result.md（网站仓库，commit 见网站 HQ）。
