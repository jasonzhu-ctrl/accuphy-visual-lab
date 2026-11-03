# 营销版（MKT，带锁版）的链接规则（2026-11-03，Jason 定了，#229）

> **定了（Jason 11-03）：** 规则照下面，只是页面名换成 **`/pages/sonarlab-mktbf2026`**（不用 sonar-lab）。Lab 这边的地址保留 **lab.accuphy.ca/bf/**（HQ 定：页面名已经带 bf2026，不再改名 /mkt/）。下文里的 sonar-lab 都读作 sonarlab-mktbf2026、/mkt/ 都读作 /bf/。

Jason 11-03：“带锁版本也就是 MKT 版本应该按照现有 shopify 市场的主页网址后面定一个规则，你提议。”

## 已经定的

- **Base（不带锁）**只用 lab.accuphy.ca：`/`（PingLive，能切 Mini）、`/mini/`、`/ice/`（Jason：“很好 记住”）。
- 店铺各市场的 `/pages/lab` 嵌的是 Base，营销版绝对不覆盖 Base（#228）。

## 提议：MKT 版 = 每个市场主页网址 + `/pages/sonar-lab`

| 部分 | Base（不变） | MKT 版（新） |
|---|---|---|
| 店铺里的页面 | `<市场主页>/pages/lab` | `<市场主页>/pages/sonar-lab` |
| 页面里嵌的 Lab | lab.accuphy.ca/ | lab.accuphy.ca/mkt/（现在测试里叫 /bf/，建议改名，因为不只黑五用） |

**每个市场的 MKT 链接：**

| 市场 | MKT 链接 |
|---|---|
| 加拿大 英 | https://shop.accuphy.com/pages/sonar-lab |
| 加拿大 法 | https://shop.accuphy.com/fr/pages/sonar-lab |
| 美国（只出 Mini） | https://shop.accuphy.com/en-us/pages/sonar-lab |
| 法国 | https://shop.accuphy.com/fr-fr/pages/sonar-lab |
| 比荷卢 荷 / 法 | https://shop.accuphy.com/nl-benelux/pages/sonar-lab 、/fr-benelux/pages/sonar-lab |
| 德国 | https://shop.accuphy.com/de-de/pages/sonar-lab |
| 波兰、拉脱维亚 | 照 #218：主站 + 语言，https://shop.accuphy.com/pages/sonar-lab?lang=pl 、?lang=lv |

**为什么这样定：**
- 规则只有一条，跟着店铺现有的市场前缀走，Shopify 会自动给每个市场生成这个地址，不用一个个建。
- Base 的 `/pages/lab` 一点不动，两个版本同时都在。广告投 MKT 链接，视频、素材、别的页面用 Base。
- MKT 页面也在店铺里，所以去商店按市场走、统计事件（Meta、GA4、Klaviyo）照常，和 Base 页一样。
- “sonar-lab” 跟广告里的名字 “Accuphy Sonar Lab” 一致，客人看到的网址好懂。

**要谁做：**
- 网站：在 Shopify 建一个新页面 `sonar-lab`，用跟 `/pages/lab` 同一个嵌入区块，只把框的地址改成 lab.accuphy.ca/mkt/。要 Jason 在网站 HQ 说“动”。
- Lab：营销版改名 /bf/ → /mkt/（打包脚本），上线 lab.accuphy.ca/mkt/ 要 Jason 在 Lab HQ 说“动”。
- Klaviyo：只在 `/pages/sonar-lab` 上关掉 20 秒弹窗；`/pages/lab` 照旧。

**上线前要齐的**照旧（#213）：名单号、同意文字（已定）、订阅成功那句、网站核一次真实订阅。
