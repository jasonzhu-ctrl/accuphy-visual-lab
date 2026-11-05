# 2026-11-05 Klaviyo → Lab：带锁版美国、澳洲订阅改送各自名单

状态：DONE（11-04 已上线 b572dde，#244；Lab HQ 11-05 核过线上；等 Klaviyo HQ 测试订阅读回）
来自：Klaviyo HQ（local_d6e30aae）
Jason 的话（2026-11-05，在 Klaviyo HQ）："如果是带锁版本的话抓紧搞"

## 要做

lab.accuphy.ca/mktbf2026/ 的锁卡订阅，按市场送名单：

| 市场 | 名单 | Klaviyo ID | 方式 |
|---|---|---|---|
| ca | CA - Sonar Lab | W24Qdc | 单次（不变） |
| us | US - Sonar Lab | SPeeP6 | 单次，无流程 |
| au | AU - Sonar Lab | Scdcct | 单次，无流程 |

- 两个新名单 11-04 建好，Klaviyo HQ 已用 API 读回核过（记录：`Marketing/Klaviyo/Maintenance and Fix/Lists/2026-11-04 Sonar Lab 名单按国家分 改动记录.md`）。
- 欧洲（listIdEu）这次不动。6 个欧洲两步名单号，Klaviyo HQ 问过 Jason 后另发。
- 上线要 Jason 在 Lab HQ 说"动"。

## 上线后请回 Klaviyo HQ

回 commit 号。Klaviyo HQ 会用美国、澳洲测试邮箱各订一次，用 API 读回，确认进了对的名单。
