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
| **波兰**（只展示、不能网上下单） | 网站加了波兰语以后：波兰市场的波兰语页（地址由网站定，比如 `/pl-pl/pages/lab`）；在那之前：https://shop.accuphy.com/pages/lab?lang=pl（主站） | 网站正在被请求加波兰语（#218） | 英 | **波兰语** |
| **拉脱维亚**（网站上没有自己的市场） | https://shop.accuphy.com/pages/lab?lang=lv（主站） | 主站英文 | 英 | **拉脱维亚语**（靠 `?lang=lv`） |
| 罗马尼亚 | https://shop.accuphy.com/ro-ro/pages/lab | 罗马尼亚语 | 英 | 英（这次不做罗马尼亚语） |
| 巴拉圭 | https://shop.accuphy.com/es-py/pages/lab | 西班牙语 | 英 | 英（这次不做西班牙语） |

**规矩（Jason 11-03，#218）：** “有网站 market 的就放网站，没有的就放在主站下，不懂问我。”
- 网站上有这个市场、也有这种语言的，Lab 就放在那个市场自己的店铺页里，语言跟着店铺走。
- 没有的，就放在主站 shop.accuphy.com/pages/lab 下面，后面加 `?lang=语言`。Shopify 做不了 “/pages/lab/pl” 这种斜杠路径；`?lang=` 店铺框已经会传给 Lab（网站 #228）。
- **波兰：** Jason 说波兰语交给网站做（给波兰市场加波兰语）。网站做好以前，按规矩先放主站。
- **拉脱维亚：** 网站上归在罗马尼亚市场里，但没有自己的市场和语言。Jason 选了放主站。主站的“去商店”进主站（加拿大）。
- 拿不准的，问 Jason。

**注意：** 带 `?lang=` 的链接只是 Lab 换语言，店铺页别的地方还是英文。

## 一点五、营销版（MKT，带锁版）的店铺链接（#229，还没建）

规则：**每个市场主页网址 + `/pages/sonarlab-mktbf2026`**，页面里嵌 lab.accuphy.ca/bf/。Base 的 `/pages/lab` 不动。波兰、拉脱维亚照 #218 用主站 + `?lang=`。

| 市场 | MKT 链接 |
|---|---|
| 加拿大 英 | https://shop.accuphy.com/pages/sonarlab-mktbf2026 |
| 加拿大 法 | https://shop.accuphy.com/fr/pages/sonarlab-mktbf2026 |
| 美国（只出 Mini） | https://shop.accuphy.com/en-us/pages/sonarlab-mktbf2026 |
| 法国 | https://shop.accuphy.com/fr-fr/pages/sonarlab-mktbf2026 |
| 比荷卢 荷 / 法 | https://shop.accuphy.com/nl-benelux/pages/sonarlab-mktbf2026 、https://shop.accuphy.com/fr-benelux/pages/sonarlab-mktbf2026 |
| 德国 | https://shop.accuphy.com/de-de/pages/sonarlab-mktbf2026 |
| 波兰 | https://shop.accuphy.com/pages/sonarlab-mktbf2026?lang=pl |
| 拉脱维亚 | https://shop.accuphy.com/pages/sonarlab-mktbf2026?lang=lv |

页面要网站在 Shopify 建（Jason 在网站 HQ 说“动”），lab.accuphy.ca/bf/ 要 Jason 在 Lab HQ 说“动”。

## 二、Lab 自己的地址

| 地址 | 现在是什么 | 黑五带锁版上线后（#213） |
|---|---|---|
| https://lab.accuphy.ca/ | 标准 Base 86bf80e，无锁；店铺所有 Lab 页嵌的都是它 | 照旧是 Base（#228：营销版绝不覆盖 Base） |
| https://lab.accuphy.ca/bf/ | （还没有） | 黑五带锁版（店铺 Lab 页要不要指向它，等 Jason 定） |
| https://lab.accuphy.ca/mini/ | 只有 Mini 的 Base | 照旧 Base |
| https://lab.accuphy.ca/ice/ | 冰钓页 Base | 照旧 Base |

直接打开 lab.accuphy.ca（不经过店铺）时，Lab 不发统计事件，“去商店”进加拿大店。广告请用第一节的店铺链接。

## 三、给 Jason 和朋友看的测试链接（不是客人用的）

| 地址 | 现在是什么（11-03） |
|---|---|
| https://jasonzhu-ctrl.github.io/accuphy-lab-test/ | Base 86bf80e（= 线上） |
| https://jasonzhu-ctrl.github.io/accuphy-lab-test/bf/ | 黑五带锁版，测试模式，订阅不发出去（11-03 从首页挪到这里，#228） |
| https://jasonzhu-ctrl.github.io/accuphy-lab-test/mini/ | Base 86bf80e |
| https://jasonzhu-ctrl.github.io/accuphy-lab-test/ice/ | Base 65486b0（11-03：冰钓 Forward / Combo 的前视 120 ft 进画面，#224；还没上线） |

测试链接后面加 `?lang=de`（或 fr、nl、pl、lv）可以看那种语言。只有核好的字放进去以后，才看得出区别。

## 四、两个版本

| 版本 | 代码在哪 | 谁改 | 多语言 |
|---|---|---|---|
| 标准 Base（无锁） | `src/experiments/2026-09-23-sonar-lake-3d/` | 只有 “Lab 场景和声纳画面Base” | 先做在这里（#212） |
| 黑五带锁版 | `src/experiments/2026-11-03-sonar-lake-bf/`（复制自 86bf80e） | 只有 “Lab 营销版” | 多语言做完再搬进来（#216） |

## 改动记录

- 2026-11-03 HQ：建表（Jason 11-03）。
- 2026-11-03 HQ：#228 营销版不覆盖 Base：首页留 Base，带锁版放 /bf/。
- 2026-11-03 HQ：波兰、拉脱维亚改按 #218 的规矩（拉脱维亚放主站；波兰等网站加波兰语）。
