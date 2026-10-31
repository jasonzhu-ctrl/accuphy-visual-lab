# 邮件 e01 直接打开 Mini + Live Combo：评估（营销和外部系统对接，2026-10-31，只评估，没改代码）

Klaviyo 的 e01 邮件 11-02 发出，讲 Mini 的 Live Combo。他们要一个链接，点开就是 Mini + Combo。今天点 shop.accuphy.com/pages/lab，打开的是 PingLive 的 Forward。

## 一句话结论

- **商店不用改。** 桥会把页面网址上的参数全部转给 Lab，只丢 `view`（还有 `preview_theme_id`）。所以只要别用 `view` 这个名字，新参数今天就能到 Lab。
- **Lab 要加约 20 行。** 读两个新参数，比如 `?device=plm&lab_view=combo`，在 5c2e69a 上开一个分支单独上线就行，不带 #191/#192/#193。
- 11-02 前做得完。前提：Jason 在 Lab HQ 说“动”，HQ 重新上传 lab.accuphy.ca。

## 1. 商店的桥今天转什么（读的线上文件，没改）

- 线上文件是 `sections/lab-embed.liquid`，md5 5b0cee6b…，9627 字节，就是网站 #233 那版（网站备份 `backups/2026-10-30-d233-lab-signup-lead/new__sections__lab-embed.liquid`，网站 00 的 10-31 交接记下的 md5 一致）。
- 第 19–20 行：店铺页网址上的每个参数都原样加到 iframe 网址上，**只跳过 `view` 和 `preview_theme_id`**。Lab 网址上已经有的参数不会被覆盖。
  - 为什么丢 `view`：Shopify 自己用 `?view=` 选页面的备用模板。
- 第 25–28 行：桥自己设 `lang`、`shop`、`market`，会盖掉页面上写的同名参数（`lang` 除外，页面上的 `lang` 优先）。
- 所以：
  - Klaviyo 说“商店会丢 `view`”，这话对；
  - 但 `device`、`lab_view`、`boat`、`lab_unlock`、`utm_*`、`_kx` 都会被转进 Lab。
  - **网站什么都不用加。**

## 2. Lab 这边要做什么

### 今天的行为

- 文件 `src/experiments/2026-09-23-sonar-lake-3d/index.jsx`。
- 开场设备：`useState(ONLY || 'PL')`（main 第 76 行，5c2e69a 第 73 行）。
- 开场视图：`'forward'`（main 第 77 行，5c2e69a 第 74 行）。只有冰钓页读 `?view=ice`。
- 手机上先显示 App 首页：`homeFirst`，main 第 134 行。
- `?boat=x,z` 线上就能用，不是只在开发时（main 第 225 行，5c2e69a 第 221 行）。所以 Klaviyo 的备用办法 `boat=-18,-36` 今天就有效，但设备和视图还得访客自己点。

### 要加的

1. 开场时读 `device`（`pl` / `plm`）和 `lab_view`（`down` / `forward` / `combo` / `panoramic`）。值不认识就照旧，按现在的方式开。
2. 合法性检查：
   - Combo 只有 Mini 有，所以 `lab_view=combo` 自动配 Mini；
   - 美国店里本来就只有 Mini（`miniOnly()`，#190），`device=pl` 在那里被忽略。
3. 手机上带了这两个参数就跳过 App 首页，直接进视图（`home=false`、`started=true`）。
4. 开场发一次 `view` 事件，`source: 'link'`，好在数据里看出是邮件带来的。桥的 `view` 一行本来就转发 `source`。
5. 加一个小的 node 测试（参数 → 设备 / 视图，含美国和乱填的值）。

**谁的文件：**
- `index.jsx` 是共用文件。开场读参数、锁和事件归我（对接）；船的位置归 Base；样子没变，不涉及界面设计。
- 改之前要告诉界面设计、Base 和 HQ。

### 和 #191 订阅锁的关系

- **线上 5c2e69a 没有锁**：`lab_view=combo` 直接打开 Combo。邮件里带不带 `lab_unlock=sub` 都没关系，5c2e69a 不认这个参数，也不会出错。
- **#191 上线以后**：Combo 被锁。e01 发给订阅者，所以链接里**应该带 `lab_unlock=sub`**。带了就直接解锁、不出订阅卡、不发 `signup`，不会把老订阅者算成新的 Meta Lead。
  - 建议 Klaviyo 现在就把它写进链接，以后 #191 上线不用再改邮件。
- **没带 `lab_unlock=sub`、又已经有锁时**：建议停在 Mini Forward，并弹出订阅卡（等于访客自己点了 Combo）。这需要 #191 的代码，所以只在 main 上做，不在 5c2e69a 的分支上做。
- 转发邮件的人也能用这个链接解锁。这是 #191 当时就接受的。

## 3. 能不能 11-02 前单独上线

- **能。** 做法：
  1. 从 5c2e69a 开一个新分支，只加上面 1–5 条，大约 20 行加一个测试；
  2. 打包，跑三套单元测试、假店铺页测试；
  3. 在测试链接上测：电脑、手机、加拿大、美国、法文；
  4. Jason 在 Lab HQ 说“动”，HQ 上传 lab.accuphy.ca。
- **工作量：** 写代码和测试大约 1–2 小时，加上 HQ 上传和复测。
- **合回 main：** main 已经比 5c2e69a 多 87 个提交，开场视图那行被 #191 改过（加了冰钓的 `?view=ice`）。合并时有一处小冲突，在 main 上同样的改法再做一次就行（加上第 2 节说的锁的处理）。
- **网站要做的：** 不改代码。上线后请网站 03 用真链接点一次，确认进来就是 Mini + Combo，`lab_view`、`device` 到了框里。
- **Klaviyo 要做的：** 用这个链接（加拿大英文；法文版把路径换成 `/fr/pages/lab`）：
  `https://shop.accuphy.com/pages/lab?device=plm&lab_view=combo&lab_unlock=sub&utm_source=klaviyo&utm_medium=email&utm_campaign=…`
  - utm 用 Klaviyo 自己的命名，我只示意。
  - `boat=-18,-36` 想带也可以带，但那是 Base 定的停靠点，要先问 Base 这个点在 Combo 下鱼多不多、好不好看。

## 4. 不改商店、也不改 Lab 的办法

| 办法 | 能做到 | 丢了什么 |
|---|---|---|
| A. 链接带 `boat=-18,-36`，访客自己点 Mini、再点 Combo（Klaviyo 的备用） | 今天就能用，船停在好位置 | 两次点击，有人会走掉；手机上还要先过 App 首页 |
| B. 链接直接指向 `lab.accuphy.ca/mini/?…` | `/mini/` 今天就在线（5c2e69a），只有 Mini，不用点设备 | 1）**还是开在 Forward**，Combo 要自己点，不改 Lab 就做不到直接 Combo；2）**不在店铺框里，Lab 的事件一个都不发**（没有父页面，Meta / GA4 / Klaviyo 都收不到 `view`、`shop_click`、`share`）；3）店铺页的 Klaviyo 脚本不认人（`_kx`），这次访问不会记到订阅者身上；4）去商店按钮会加 Lab 默认的 utm（`utm_source=accuphy_lab…`），盖掉邮件的 utm（除非邮件链接自己带 utm，Lab 会原样转）。Klaviyo 自己的点击统计照常 |
| C. 链接用 `/en-us/pages/lab` 骗出“只有 Mini” | 今天就能用 | **不推荐**：加拿大读者会进美国市场，去商店落到美元价格的 `/en-us` 商品页 |

**我的建议：** 走第 3 节，Lab 加参数，商店不动。这样事件、Klaviyo 认人和去商店都照旧。11-02 赶不上的话，先用 A，等 Lab 上线后把链接换成带 `device` 和 `lab_view` 的版本（老链接仍能用，只是多点两下）。
