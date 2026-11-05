# 带锁版（MKT 版 = 投放版）：现状（Lab 营销版维护，最后整理 2026-11-05）

决定：
- 复制成带锁版：#213；
- 不覆盖 Base / 免费版：#228；
- 投放链接：#229、#230；
- 营销版负责：#231；
- 三个版本：#233；
- 多语言搬进来再上：#234；
- 拉脱维亚链接、分两批上线：#238、#239；
- 锁的范围：#240–#242；
- 每国一个名单：#244；
- 欧洲：#245–#247。

上线要齐的东西和每次的证据：`docs/2026-11-03-mkt-go-live-checklist.md`。投放链接：`docs/lab-links-sheet.md` 第一节。

## 三个版本（#233）

| 版本 | 代码 | lab.accuphy.ca 地址（后面那一层） | 客人看到的店铺页 |
|---|---|---|---|
| Base（源头，不上线） | `2026-09-23-sonar-lake-3d/` | — | — |
| 免费版（网站嵌入版，不带锁） | `2026-11-03-sonar-lake-web/` | `/`、`/mini/`、`/ice/` | 各市场 `/pages/lab` |
| **带锁版 MKT（投放用）** | `2026-11-03-sonar-lake-bf/` | `/mktbf2026/`（冰钓页 `/mktbf2026/ice/` 是免费版 `/ice/` 的复制） | 各市场 `/pages/sonarlab-mktbf2026` |

- 硬规则（#232）：客人、广告、邮件只拿店铺链接；lab.accuphy.ca 的地址只在后台用。
- 带锁版绝对不覆盖免费版（#228）：每次上线前后，都要用 md5 证明 `/`、`/mini/`、`/ice/` 没变。

## 带锁版 MKT 现在是什么样

1. **复制件** `src/experiments/2026-11-03-sonar-lake-bf/`：
   - 从 Base 86bf80e 复制，只由营销版改；`devices.js`、`wedge.js` 也各有自己的一份（9e96e0d）。
   - 11-04 搬进了 Base 的五种语言（#212）和冰钓 120 ft（#224）（c442045，Jason：“搬”）。以后 Base 的改进，也要 Jason 说了才搬。
2. **锁：**
   - 没订阅的人点 Mini 的 Combo、Mini 的 Panoramic、PingLive 的 Panoramic（#240）、冰钓格子，先出订阅卡，填了邮箱才开，这台设备记住。
   - 美国店铺页只有 Mini，Combo 免费，Panoramic 照锁（#241）。
   - 入场教程里用到的视图，教程期间都能用，教程结束才上锁（#242）。
   - 带 `?lab_unlock=sub` 的邮件链接直接解锁，不算新 Lead。
3. **名单（只在上线包里用构建变量填，测试链接不填）：**
   - 加拿大 W24Qdc（`VITE_BF_LIST_ID`）、美国 SPeeP6（`VITE_BF_LIST_ID_US`）、澳洲 Scdcct（`VITE_BF_LIST_ID_AU`）。
   - 欧洲各国的两步确认名单：`VITE_BF_LISTS_EU="国家:名单号,…"`（#247），还没有号。
   - 没有号的国家，在真实域名上订阅会被拒，绝不会进别国的名单。
4. **文字：** 同意那句、“解锁成功”那句，Jason 11-03 定过；欧洲订阅卡的译文网站核过（#246）。
5. **上线情况：**
   - **北美澳：已上线、可投广告。** 线上是 b572dde（11-05 核过，md5 一致）。
   - **欧洲：没上线。** #245–#247 已在代码里，等欧洲名单号。
   - 下一次打上线包会把这三项一起带上去（见清单“欧洲这一批”）。

## 测试

- 单元测试：`LAB_DIR=2026-11-03-sonar-lake-bf node scripts/dev/<shop-url|share-url|signup-guard|app-qr>-test.mjs`；另外还有 `mkt-lock-rule-test.mjs`、`mkt-list-route-test.mjs`。
- 假店铺页：`LAB_LOCKED=1 node scripts/dev/store-frame/run.mjs <out>/mktbf2026`；美国用 `LAB_SHOP=/en-us`（lock-us）。
- 测锁一定要用全新的浏览器：订阅过的浏览器会记住，页面会全部打开。

## 要知道的

- 黑五以后 MKT 页留不留、怎么改，到时候问 Jason。
