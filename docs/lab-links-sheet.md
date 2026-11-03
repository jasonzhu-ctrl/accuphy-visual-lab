# Accuphy Lab 链接总表：各市场、各语言、各版本（HQ 维护）

Jason 11-03：“一定要搞个文档，专门把这些不同的版本啊，那些啥的都全都记下来。”

- 规则：每个市场的店铺有自己的 Lab 页，店铺告诉 Lab 用什么语言。Lab 里没有切换语言的按钮。
- 店铺没有这种语言的市场，就在店铺 Lab 页的网址后面加上语言（`?lang=pl`）。
- 版本的详细记录在 `docs/version-sheet.md` 和 `docs/versions.md`。每次上线或换测试链接，HQ 同时更新这三份。

最后核对：2026-11-03。HQ 用 curl 打开下面每个店铺链接，都返回 200，都嵌着 lab.accuphy.ca/。

## 一、投放链接（= MKT 版，#229，Jason 11-03：“MKT 和投放的是一回事”）

只有这一批。规则：**每个市场的主页网址 + `/pages/sonarlab-mktbf2026`**，页面里嵌带锁版 lab.accuphy.ca/bf/。
店铺没有这种语言的市场（波兰、拉脱维亚），照 #218 用主站 + `?lang=`。

| 市场 | 投放链接 | Lab 语言 |
|---|---|---|
| 加拿大 英 | https://shop.accuphy.com/pages/sonarlab-mktbf2026 | 英 |
| 加拿大 法 | https://shop.accuphy.com/fr/pages/sonarlab-mktbf2026 | 法 |
| 美国（只出 Mini） | https://shop.accuphy.com/en-us/pages/sonarlab-mktbf2026 | 英 |
| 法国 | https://shop.accuphy.com/fr-fr/pages/sonarlab-mktbf2026 | 法 |
| 比荷卢 荷兰语 | https://shop.accuphy.com/nl-benelux/pages/sonarlab-mktbf2026 | 荷 |
| 比荷卢 法语 | https://shop.accuphy.com/fr-benelux/pages/sonarlab-mktbf2026 | 法 |
| 德国（奥地利、瑞士等网站 03 测完再定） | https://shop.accuphy.com/de-de/pages/sonarlab-mktbf2026 | 德 |
| 波兰 | https://shop.accuphy.com/pages/sonarlab-mktbf2026?lang=pl（网站给波兰市场加了波兰语以后，换成波兰页） | 波兰语 |
| 拉脱维亚 | https://shop.accuphy.com/pages/sonarlab-mktbf2026?lang=lv（Jason 选了主站） | 拉脱维亚语 |

- 状态：还没建。店铺页要 Jason 在网站 HQ 说“动”；lab.accuphy.ca/bf/ 要 Jason 在 Lab HQ 说“动”。网站提醒：/bf/ 上线前，这批链接不要给广告。
- 德、荷、波、拉的 Lab 文字要等译文放进去才是那种语言（现在显示英文、用米）。
- 网站 03 正在用各国 IP 测这些市场前缀（同样适用这批链接），结果出来再更新这一节。
- 规矩（#218）：“有网站 market 的就放网站，没有的就放在主站下，不懂问我。” 带 `?lang=` 的链接只换 Lab 的语言，店铺页其他地方还是英文。

**店铺原来的 `/pages/lab`**（各市场都有，如 https://shop.accuphy.com/pages/lab、/de-de/pages/lab）：嵌的是 Base，不带锁，**不用来投放**。它照旧留在店里（#228：营销版不覆盖 Base）。

## 二、Lab 自己的地址

| 地址 | 现在是什么 | 黑五带锁版上线后（#213） |
|---|---|---|
| https://lab.accuphy.ca/ | 标准 Base 96fdc22（11-03 晚），无锁；店铺所有 Lab 页嵌的都是它 | 照旧是 Base（#228：营销版绝不覆盖 Base） |
| https://lab.accuphy.ca/bf/ | （还没有） | 黑五带锁版（店铺 Lab 页要不要指向它，等 Jason 定） |
| https://lab.accuphy.ca/mini/ | 只有 Mini 的 Base | 照旧 Base |
| https://lab.accuphy.ca/ice/ | 冰钓页 Base | 照旧 Base |

直接打开 lab.accuphy.ca（不经过店铺）时，Lab 不发统计事件，“去商店”进加拿大店。广告请用第一节的投放链接。

## 三、给 Jason 和朋友看的测试链接（不是客人用的）

| 地址 | 现在是什么（11-03） |
|---|---|
| https://jasonzhu-ctrl.github.io/accuphy-lab-test/ | Base 96fdc22（= 线上） |
| https://jasonzhu-ctrl.github.io/accuphy-lab-test/bf/ | 黑五带锁版，测试模式，订阅不发出去（11-03 从首页挪到这里，#228） |
| https://jasonzhu-ctrl.github.io/accuphy-lab-test/mini/ | Base 96fdc22（= 线上） |
| https://jasonzhu-ctrl.github.io/accuphy-lab-test/ice/ | Base 96fdc22（= 线上） |

测试链接后面加 `?lang=de`（或 fr、nl、pl、lv）可以看那种语言。只有核好的字放进去以后，才看得出区别。

## 四、两个版本

| 版本 | 代码在哪 | 谁改 | 多语言 |
|---|---|---|---|
| 标准 Base（无锁） | `src/experiments/2026-09-23-sonar-lake-3d/` | 只有 “Lab 场景和声纳画面Base” | 先做在这里（#212） |
| 黑五带锁版 | `src/experiments/2026-11-03-sonar-lake-bf/`（复制自 86bf80e） | 只有 “Lab 营销版” | 多语言做完再搬进来（#216） |

## 改动记录

- 2026-11-03 HQ：建表（Jason 11-03）。
- 2026-11-03 HQ：合并第一节和第一点五节：投放链接只有一批，就是 MKT（Jason：“MKT 和投放的是一回事”）。
- 2026-11-03 HQ：#228 营销版不覆盖 Base：首页留 Base，带锁版放 /bf/。
- 2026-11-03 HQ：波兰、拉脱维亚改按 #218 的规矩（拉脱维亚放主站；波兰等网站加波兰语）。
