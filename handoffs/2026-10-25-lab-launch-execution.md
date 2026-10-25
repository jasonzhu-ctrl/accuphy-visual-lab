状态：DONE
From：项目总管 | CHIEF Agent（IT/CHIEF Agent）   To：accuphy-visual-lab HQ   创建：2026-10-25   期限：2026-10-30（11/2 广告开投）   编号：X-6L

# Lab 上线执行（方向已定，交给你执行）

## Jason 2026-10-25 在总管聊天里定的方向（原话或他选的选项）

- **D1** Lab 页（shop.accuphy.com/pages/lab）11/2 前放进现在的线上主题（只加 3 个文件）。Jason 选了“放进线上主题”。
- **D2** 一次做完整版：Lab 的 4 个动作也转给 Meta、GA4、Klaviyo。Jason 选了“一次做完整版”。
- **D3** 留邮箱用店铺 Lab 页上的 Klaviyo 表单，Lab 自己的报名卡继续关着；进新名单 “Accuphy Lab sign-ups”，只确认一次；以后 Meta 线索广告也进这个名单，用一个字段区分渠道；Lab 页这一页不出原来的加拿大弹窗。Jason 选了“按推荐做”。
- **D4** Lab 框里的地址接 **lab.accuphy.ca**（DNS 在 Hostinger，Jason 自己管）。Jason 选了“接 lab.accuphy.ca”。
- **D5** 所有广告和邮件链接统一写 UTM：
  - utm_source：meta / youtube / google / klaviyo
  - utm_medium：paid_social / paid_video / cpc / email
  - utm_campaign：年份_活动_市场，例如 bf2026_lab_ca
  - utm_content：哪一条广告或哪一封邮件

  Jason 选了“可以，就用这套”。
- **D6** accuphy.com 续费：总管起草了给 Eric 的邮件，等 Jason 批准后发出。

汇总和依据：`IT/CHIEF Agent/docs/2026-10-25-lab-domain-tracking-summary.md`。
**期限：11/2 广告开投。完整版大约 3–3.5 个工作日，目标 10-30 做完，10-31 到 11-1 做真机测试。**

## 规矩

- 方向已经定了，**具体怎么做由你们项目自己定**。拿不准的，按全局规则“复杂了就停下来问 Jason”，在你的聊天里问他。
- 凡是改线上的（Shopify 主题和页面、Klaviyo 表单和名单、DNS、Vercel 域名），都要 Jason 在**你的聊天里**亲口说“动”。总管这里定方向，不算批准。
- 这次要几个项目配合（事件名、表单、弹窗、域名），你们之间直接用交接单对齐，有冲突报总管。
- 每天在状态栏更新进度。一旦发现 10-30 做不完，马上报总管，不要拖。

## 你做

1. 接域名 lab.accuphy.ca：
   - 先在 Vercel 加这个域名；
   - 再带 Jason 登录 Hostinger 加一条记录（一步一步写清楚，他不懂技术）；
   - 最后确认 https://lab.accuphy.ca 能打开。

   这是改线上，要 Jason 在你这里说“动”。之前叫停的 CNAME（lab.accuphy.com）**不做了**。
2. 准备嵌入版（/embed/），照你报告里写的来；frame-ancestors 只允许 shop.accuphy.com（以后要是换主域名，再改）。
3. 4 个动作的事件名，和网站对齐（网站建议加前缀）。
4. “去商店”按钮的链接要带上 UTM（按 D5）。

## 证据

- https://lab.accuphy.ca/ 、/mini/、/ice/、/embed/lab.js 都返回 200；头信息里有 frame-ancestors，也有 X-Robots-Tag noindex（curl，2026-10-25 22:45）。`vercel domains verify lab.accuphy.ca`：configured_correctly。
- Hostinger 里 accuphy.ca 新加了一条 CNAME：`lab` → `4d23262254a8e936.vercel-dns-016.com`，TTL 3600，其他记录都没动。
- 代码：Lab 50ad8ca（#157，含 afc9af3、3c89e87）。版本记录：`docs/versions.md`。

## 结果

1–4 都做完了，2026-10-25，比 10-30 早。
- 域名接到 lab.accuphy.ca（Jason 当天在 Lab HQ 说了“动”）。
- 嵌入版 `/embed/` 已经上线。
- 事件名和网站对齐了：`accuphy:lab`，带的字段 data 里只有 product，没有 device。
- “去商店”按钮用 Jason 选的方案 B。和总管商量后改了一处：Lab 在店铺里时，按钮链接不带 UTM，靠 shop_click 事件来记；只有单独打开 Lab 时才带 UTM。
- frame-ancestors 照网站的要求，保留 myshopify 和 admin.shopify.com。

## 回报格式

`X-6L | 结果 | 证据 | 需要谁做什么`，发给“项目总管 | CHIEF Agent”。
