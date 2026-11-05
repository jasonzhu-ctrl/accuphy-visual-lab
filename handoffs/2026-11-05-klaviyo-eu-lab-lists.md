# 2026-11-05 Klaviyo → Lab 营销版：欧洲 6 个两步确认名单号

状态：OPEN
来自：Klaviyo HQ（local_d6e30aae）
给：Lab 营销版 local_5d3f1b7f（抄送 Lab HQ local_1022478a，按 Lab HQ 11-05 的要求）
Jason 的话（2026-11-05，在 Klaviyo HQ）："去搞定"（指把欧洲名单号发给 Lab）

## 名单（Klaviyo 11-05 03:33 UTC 建，都是 double_opt_in，不接流程）

| 名单 | Klaviyo ID | 送这些 signup_market | 确认信语言 |
|---|---|---|---|
| DE - Sonar Lab | VGcbFE | de, at, ch | 德语 |
| FR - Sonar Lab | Usa6sq | fr, ch-fr | 法语 |
| BENELUX NL - Sonar Lab | XpYNQK | nl, nl-nl, be-nl, lu-nl, be | 荷兰语 |
| BENELUX FR - Sonar Lab | TzfgMB | be-fr, lu-fr, lu, be-de, lu-de | 法语 |
| PL - Sonar Lab | R9NkEv | pl | 波兰语 |
| RO-LV - Sonar Lab | RGc8VJ | ro, lv, ee | 英语 |

市场代码用的是 Klaviyo 建名单时按 Lab 的 signup_market 写的。如果和 Lab 代码里的实际值不一样，以 Lab 代码为准，告诉 Klaviyo HQ。

## 已经在 Klaviyo 做好的
- 每个名单的确认信都用本国语言写好、已发布，Klaviyo 自带的其他语言翻译都删了。
- 点确认后直接跳回本国 MKT 页，带 `lab_unlock=sub` 和 utm（例：/de-de/pages/sonarlab-mktbf2026?lab_unlock=sub&utm_source=klaviyo&utm_medium=email&utm_campaign=bf2026_optin_de）。
- 记录：`Marketing/Klaviyo/Maintenance and Fix/Lists/2026-11-05 欧洲 Sonar Lab 名单 建立记录.md`

## 要 Lab 做
1. 现在代码里只有一个 `VITE_BF_LIST_ID_EU`。要改成按市场送上面 6 个名单。
2. 欧洲成功卡写"去邮箱确认"（11-04 英文两句："Check your inbox" / "Click the link in our email to confirm your subscription. {view} is unlocked now."），各语言版本要和确认信的语言对上。
3. 上线要 Jason 在 Lab 那边说"动"。

## 上线后
回 commit 号给 Klaviyo HQ。Klaviyo HQ 接着用测试邮箱在手机上走一遍：订阅 → 收确认信 → 点确认 → 跳回已解锁的页面，再用 API 读回。母语审还没定谁做，Klaviyo HQ 跟 Jason 定。
