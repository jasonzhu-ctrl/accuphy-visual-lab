# Accuphy Lab 链接总表：各市场、各语言、各版本（HQ 维护）

Jason 11-03：“一定要搞个文档，专门把这些不同的版本啊，那些啥的都全都记下来。”

- 规则：每个市场的店铺有自己的 Lab 页，店铺告诉 Lab 用什么语言。Lab 里没有切换语言的按钮。
- 店铺没有这种语言的市场，就在店铺 Lab 页的网址后面加上语言（`?lang=pl`）。
- 版本的详细记录在 `docs/version-sheet.md` 和 `docs/versions.md`。每次上线或换测试链接，HQ 同时更新这三份。

最后核对：2026-11-03。HQ 用 curl 打开下面每个店铺链接，都返回 200，都嵌着 lab.accuphy.ca/。

## 一、客人看到的：店铺里的 Lab 页（广告就投这些）

“Lab 语言”一栏：“现在”= 线上 86bf80e；“多语言上线后”= #212 的字核完、Jason 说“动”之后。

| 市场 | 店铺 Lab 链接 | 店铺语言 | Lab 语言（现在） | Lab 语言（多语言上线后） |
|---|---|---|---|---|
| 加拿大 英文 | https://shop.accuphy.com/pages/lab | 英 | 英 | 英 |
| 加拿大 法文 | https://shop.accuphy.com/fr/pages/lab | 法 | 法（部分还是英文） | 法 |
| 美国（只出 Mini） | https://shop.accuphy.com/en-us/pages/lab | 英 | 英 | 英 |
| 法国 | https://shop.accuphy.com/fr-fr/pages/lab | 法 | 法（部分还是英文） | 法 |
| 法国 英文 | https://shop.accuphy.com/en-fr/pages/lab | 英 | 英 | 英 |
| 德国 | https://shop.accuphy.com/de-de/pages/lab | 德 | 英 | **德** |
| 德国 英文 | https://shop.accuphy.com/en-de/pages/lab | 英 | 英 | 英 |
| 比荷卢 荷兰语 | https://shop.accuphy.com/nl-benelux/pages/lab | 荷 | 英 | **荷** |
| 比荷卢 法语 | https://shop.accuphy.com/fr-benelux/pages/lab | 法 | 法（部分还是英文） | 法 |
| 比荷卢 德语 | https://shop.accuphy.com/de-benelux/pages/lab | 德 | 英 | **德** |
| 比荷卢 英文 | https://shop.accuphy.com/en-benelux/pages/lab | 英 | 英 | 英 |
| **波兰**（只展示、不能网上下单） | https://shop.accuphy.com/en-pl/pages/lab?lang=pl | 店铺只有英文 | 英 | **波兰语**（靠 `?lang=pl`） |
| **拉脱维亚**（在罗马尼亚市场里） | https://shop.accuphy.com/en-ro/pages/lab?lang=lv | 店铺没有拉脱维亚语 | 英 | **拉脱维亚语**（靠 `?lang=lv`） |
| 罗马尼亚 | https://shop.accuphy.com/ro-ro/pages/lab | 罗马尼亚语 | 英 | 英（这次不做罗马尼亚语） |
| 巴拉圭 | https://shop.accuphy.com/es-py/pages/lab | 西班牙语 | 英 | 英（这次不做西班牙语） |

**波兰、拉脱维亚为什么这样写：**
- Jason 11-03 说，没有对应语言的，就用店铺的链接后面加语言。
- 波兰 10-22 起有了自己的市场 `/en-pl`，有波兰门店页和找代理商的链接；拉脱维亚在罗马尼亚市场 `/en-ro` 里。
- 所以加语言的地方用这两个市场自己的链接，“去商店”、门店和货币也就都对。只有加拿大店铺 `shop.accuphy.com/pages/lab?lang=pl` 也能出波兰语，但去商店会进加拿大店。
- Shopify 做不了“/pages/lab/pl”这种斜杠路径，用 `?lang=` 是现成的：店铺框已经会把它传给 Lab（网站 #228）。

**注意：** 带 `?lang=` 的链接只是 Lab 换语言，店铺页别的地方还是英文。

## 二、Lab 自己的地址

| 地址 | 现在是什么 | 黑五带锁版上线后（#213） |
|---|---|---|
| https://lab.accuphy.ca/ | 标准 Base 86bf80e，无锁；店铺所有 Lab 页嵌的都是它 | **带锁版**（店铺所有 Lab 页跟着变） |
| https://lab.accuphy.ca/base/ | （还没有） | 干净的 Base，录视频、做素材用 |
| https://lab.accuphy.ca/mini/ | 只有 Mini 的 Base | 照旧 Base |
| https://lab.accuphy.ca/ice/ | 冰钓页 Base | 照旧 Base |

直接打开 lab.accuphy.ca（不经过店铺）时，Lab 不发统计事件，“去商店”进加拿大店。广告请用第一节的店铺链接。

## 三、给 Jason 和朋友看的测试链接（不是客人用的）

| 地址 | 现在是什么（11-03） |
|---|---|
| https://jasonzhu-ctrl.github.io/accuphy-lab-test/ | 黑五带锁版，测试模式，订阅不发出去 |
| https://jasonzhu-ctrl.github.io/accuphy-lab-test/base/ | Base 86bf80e（= 线上） |
| https://jasonzhu-ctrl.github.io/accuphy-lab-test/mini/ 、/ice/ | Base 86bf80e |

测试链接后面加 `?lang=de`（或 fr、nl、pl、lv）可以看那种语言。只有核好的字放进去以后，才看得出区别。

## 四、两个版本

| 版本 | 代码在哪 | 谁改 | 多语言 |
|---|---|---|---|
| 标准 Base（无锁） | `src/experiments/2026-09-23-sonar-lake-3d/` | 只有 “Lab 场景和声纳画面Base” | 先做在这里（#212） |
| 黑五带锁版 | `src/experiments/2026-11-03-sonar-lake-bf/`（复制自 86bf80e） | 只有 “Lab 营销版” | 多语言做完再搬进来（#216） |

## 改动记录

- 2026-11-03 HQ：建表（Jason 11-03）。
