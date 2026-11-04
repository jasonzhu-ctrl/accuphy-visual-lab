# Accuphy Lab 链接总表：各市场、各语言、各版本（HQ 维护）

Jason 11-03：“一定要搞个文档，专门把这些不同的版本啊，那些啥的都全都记下来。”

- 规则：每个市场的店铺有自己的 Lab 页，店铺告诉 Lab 用什么语言。Lab 里没有切换语言的按钮。
- 店铺没有这种语言的市场，就在店铺 Lab 页的网址后面加上语言（`?lang=pl`）。
- 版本的详细记录在 `docs/version-sheet.md` 和 `docs/versions.md`。每次上线或换测试链接，HQ 同时更新这三份。

最后核对：2026-11-03。HQ 用 curl 打开下面每个店铺链接，都返回 200，都嵌着 lab.accuphy.ca/。

> **硬规则（#232，Jason 11-03，要反复提醒）：** 店铺页只是一个“相框”，Lab 本身放在 lab.accuphy.ca 上。
> - 客人和广告、邮件只拿**店铺链接**（shop.accuphy.com/<市场>/pages/…），lab.accuphy.ca 的地址在后台，不给客人。
> - 每个店铺页里的框只显示一个 lab.accuphy.ca 地址：`/pages/lab` → lab.accuphy.ca/（不带锁）；`/pages/sonarlab-mktbf2026` → lab.accuphy.ca/mktbf2026/（MKT 版，带锁；#233 起由 /mktbf2026/ 改名）。
> - Lab 的程序不放进 Shopify。Lab 更新只改 lab.accuphy.ca（Jason 在 Lab HQ 说“动”）；店铺页只改框里的地址（网站，Jason 在网站 HQ 说“动”）。

## 一、投放链接（= MKT 版，#229，Jason 11-03：“MKT 和投放的是一回事”）

**这一节由 Lab 营销版维护（#231）**，其他几节照旧由 HQ 维护。

只有这一批。规则：**每个市场的主页网址 + `/pages/sonarlab-mktbf2026`**，页面里嵌带锁版 lab.accuphy.ca/mktbf2026/（#233，原来叫 /bf/）。
店铺没有这种语言的市场（波兰、拉脱维亚），照 #218 用主站 + `?lang=`。

| 市场 | 投放链接 | Lab 语言 |
|---|---|---|
| 加拿大 英 | https://shop.accuphy.com/pages/sonarlab-mktbf2026 | 英 |
| 加拿大 法 | https://shop.accuphy.com/fr/pages/sonarlab-mktbf2026 | 法 |
| 美国（只出 Mini） | https://shop.accuphy.com/en-us/pages/sonarlab-mktbf2026 | 英 |
| 澳洲（Jason 11-03 加进投放，#230） | https://shop.accuphy.com/en-au/pages/sonarlab-mktbf2026 | 英 |
| 法国 | https://shop.accuphy.com/fr-fr/pages/sonarlab-mktbf2026 | 法 |
| 比荷卢 荷兰语 | https://shop.accuphy.com/nl-benelux/pages/sonarlab-mktbf2026 | 荷 |
| 比荷卢 法语 | https://shop.accuphy.com/fr-benelux/pages/sonarlab-mktbf2026 | 法 |
| 德国（含奥地利、瑞士：网站 03 测过，打开不跳转，看到德国市场、欧元） | https://shop.accuphy.com/de-de/pages/sonarlab-mktbf2026 | 德 |
| 波兰 | https://shop.accuphy.com/pages/sonarlab-mktbf2026?lang=pl（波兰客人会被 302 转到 /en-pl/…?lang=pl，店铺那层是英文，Lab 还是波兰语，能用；网站给波兰市场加了波兰语以后，换成波兰页） | 波兰语 |
| 拉脱维亚（#238，Jason 11-04：“用英语”；第二批欧洲） | https://shop.accuphy.com/en-ro/pages/sonarlab-mktbf2026?lang=lv（拉脱维亚属于罗马尼亚市场，用它的英语页；店铺那层英文，Lab 拉脱维亚语；网站 03 还要实测一次） | 拉脱维亚语 |

- 状态：【客人看到的店铺页】Jason 已在网站 HQ 说“动”（网站 #241），网站 00 在建。【后面那一层】lab.accuphy.ca/mktbf2026/ 等多语言一起上（#234），要 Jason 在 Lab HQ 说“动”。在那之前店铺页的框是空的（404），**这批链接不要给广告**。
- 德、荷、波、拉的 Lab 文字要等译文放进去才是那种语言（现在显示英文、用米）。
- **各国 IP 测试（网站 03，11-03，194a98c0；测的是 `/pages/lab`，市场前缀一样，所以结果也适用于这批链接）：**
  - 加拿大英、加拿大法、美国、法国、比荷卢荷、比荷卢法、德国、澳洲：都不跳转，框里 lang、shop、market 都对；加上 utm 和 fbclid 也能传到框里。
  - 奥地利、瑞士：打开 /de-de 不跳转，没有选国家的弹窗，看到德国市场（欧元）。
  - 波兰：302 转到 /en-pl，lang=pl 还在；去商店进 /en-pl/products/pinglive-sonar，能打开。
  - 拉脱维亚：302 转到 /ro-ro（有一次是 /en-ro），lang=lv 还在；去商店进 /ro-ro/products/…，能打开。
  - 只有浏览器带着语言信息才会 302，光用 curl 不会跳。
  - 没测：下单、加购物车，以及各国客人点 Lab 里的按钮。
  - 网站还看到：德国 IP 打开 /de-de 时，Klaviyo 的全屏订阅弹窗会盖住 Lab。MKT 页上要靠关掉 VpD3CV 解决（上线清单第四节）。
- 规矩（#218）：“有网站 market 的就放网站，没有的就放在主站下，不懂问我。” 带 `?lang=` 的链接只换 Lab 的语言，店铺页其他地方还是英文。

**店铺原来的 `/pages/lab`**（各市场都有）：嵌的是网站嵌入版（#233），不带锁，**不用来投放**。它照旧留在店里（#228：营销版不覆盖它）。链接见下面第一点五节。

## 一点五、店铺 Lab 页 `/pages/lab`（= 网站嵌入版，#233）

**这一节由 Lab 网站嵌入版维护。** 框里显示 lab.accuphy.ca/（`/mini/`、`/ice/` 从里面点进去），代码是复制件 `src/experiments/2026-11-03-sonar-lake-web/`（复制自 96fdc22）。上线清单：`docs/2026-11-03-web-embed-checklist.md`。

| 市场 | 店铺链接 | Lab 语言 |
|---|---|---|
| 加拿大 英 | https://shop.accuphy.com/pages/lab | 英 |
| 加拿大 法 | https://shop.accuphy.com/fr/pages/lab | 法 |
| 美国（只出 Mini） | https://shop.accuphy.com/en-us/pages/lab | 英 |
| 澳洲 | https://shop.accuphy.com/en-au/pages/lab | 英 |
| 法国 | https://shop.accuphy.com/fr-fr/pages/lab | 法 |
| 比荷卢 荷兰语 | https://shop.accuphy.com/nl-benelux/pages/lab | 荷 |
| 比荷卢 法语 | https://shop.accuphy.com/fr-benelux/pages/lab | 法 |
| 德国 | https://shop.accuphy.com/de-de/pages/lab | 德 |
| 波兰（#218） | https://shop.accuphy.com/pages/lab?lang=pl | 波兰语 |
| 拉脱维亚（#218、#227） | https://shop.accuphy.com/pages/lab?lang=lv | 拉脱维亚语 |

- 11-03 核对：8 个市场前缀都 200，框里是 lab.accuphy.ca/。
- 五种语言的字 11-03 已放进复制件，上线后才在线上看到；现在线上德、荷、波、拉还显示英文、用米。

## 二、lab.accuphy.ca 上的地址（后台那一层，#232：不给客人）

| 地址 | 是哪个版本 | 现在 | 被哪个店铺页的框显示 |
|---|---|---|---|
| https://lab.accuphy.ca/ | 网站嵌入版（无锁） | 96fdc22（11-03 晚上线） | 各市场 `/pages/lab` |
| https://lab.accuphy.ca/mini/ | 网站嵌入版，只有 Mini | 96fdc22 | — |
| https://lab.accuphy.ca/ice/ | 网站嵌入版，冰钓页 | 96fdc22 | — |
| https://lab.accuphy.ca/mktbf2026/ | MKT 版（带锁） | 还没上线 | 各市场 `/pages/sonarlab-mktbf2026`（还没建） |
| https://lab.accuphy.ca/mktbf2026/ice/ | MKT 版里冰钓格子去的页，是网站嵌入版冰钓页的拷贝 | 还没上线 | — |

直接打开 lab.accuphy.ca（不经过店铺）时，Lab 不发统计事件，“去商店”进加拿大店。广告请用第一节的投放链接。

## 三、给 Jason 和朋友看的测试链接（不是客人用的）

| 地址 | 现在是什么（11-03） |
|---|---|
| https://jasonzhu-ctrl.github.io/accuphy-lab-test/ | Base 96fdc22（= 线上） |
| https://jasonzhu-ctrl.github.io/accuphy-lab-test/mktbf2026/ | 黑五带锁版，测试模式，订阅不发出去（11-03 从首页挪到这里，#228） |
| https://jasonzhu-ctrl.github.io/accuphy-lab-test/mini/ | Base 96fdc22（= 线上） |
| https://jasonzhu-ctrl.github.io/accuphy-lab-test/ice/ | Base 96fdc22（= 线上） |

测试链接后面加 `?lang=de`（或 fr、nl、pl、lv）可以看那种语言。只有核好的字放进去以后，才看得出区别。

## 四、三个版本（#233）

| 版本 | 代码在哪 | 谁改 | 网址 |
|---|---|---|---|
| Base（本体，无锁） | `src/experiments/2026-09-23-sonar-lake-3d/` | “Lab 场景和声纳画面Base” | 测试链接首页、/mini/、/ice/ |
| 网站嵌入版（无锁） | `src/experiments/2026-11-03-sonar-lake-web/`（复制自 96fdc22） | “Lab 网站嵌入版” | lab.accuphy.ca/、/mini/、/ice/ |
| MKT 版（带锁） | `src/experiments/2026-11-03-sonar-lake-bf/`（复制自 86bf80e） | “Lab 营销版” | lab.accuphy.ca/mktbf2026/ |

Base 的改进要不要搬进两份复制件，HQ 问 Jason，他说了才搬（多语言 #212、冰钓 120 ft #224 已定：多语言做完一起搬进 MKT 版）。

## 改动记录

- 2026-11-03 HQ：建表（Jason 11-03）。
- 2026-11-03 HQ：加澳洲（Jason：“加进去”；之前漏了）。
- 2026-11-03 HQ：合并第一节和第一点五节：投放链接只有一批，就是 MKT（Jason：“MKT 和投放的是一回事”）。
- 2026-11-03 HQ：#228 营销版不覆盖 Base：首页留 Base，带锁版放 /mktbf2026/。
- 2026-11-03 HQ：波兰、拉脱维亚改按 #218 的规矩（拉脱维亚放主站；波兰等网站加波兰语）。
- 2026-11-03 Lab 网站嵌入版：加第一点五节（店铺 /pages/lab = 网站嵌入版，#233）。
- 2026-11-04 HQ：#238 拉脱维亚 MKT 链接用 /en-ro（英语）；#239 带锁版分两批：北美澳先上，欧洲等两步确认名单。
