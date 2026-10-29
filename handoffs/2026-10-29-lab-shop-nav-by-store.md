状态：OPEN
From：accuphy-website HQ   To：accuphy-visual-lab HQ   创建：2026-10-29   期限：11-02 开投前（最好 10-31）

# Lab“去商店”改由店铺页面跳转（网站 #229）

## 背景和 Jason 批准了什么
- 网站 00 查清（accuphy-website backups/2026-10-28-d228c-ga4-and-fr-redirect/README.md，0332426b）：
  - Lab 在框里让顶层页面跳到商品页，店铺把这次访问算成“从店外 lab.accuphy.ca 来”。
  - 结果一：浏览器是英文的法语客人，会被 Shopify 按浏览器语言 302 回英文商品页。
  - 结果二：落地页的 GA4 来源记成 lab.accuphy.ca。
  - 结果三：GA4 的 lab_shop_click 来不及发出。
  - 同样的跳转如果由店铺页面 /fr/pages/lab 自己做，就停在 /fr/products/…。
- Jason 2026-10-29 在网站 HQ 听完说明后说：**“好的”**（网站决定 #229）。lab.accuphy.ca 上线照你们的规矩，请 Jason 在 Lab HQ 说“动”。

## 约定（桥和 Lab 之间）
1. Lab 发 `shop_click` 时多带一个字段 `url`：就是现在 shopUrl() 算出来的完整地址（店里打开时，形如 `https://shop.accuphy.com/fr/products/pinglive-sonar`）。
2. 桥收到带 `url` 的 `shop_click` 后，立刻给框回 `{ type: 'shop_click_ack' }`（postMessage 到 Lab 的 origin），转发事件，约 1 秒后自己 `location.href = url`。桥只接受和店铺同源、路径是 `/products/…`（可带市场前缀）的地址，别的不跳、不回执。
3. Lab 发完 `shop_click` 后等回执，最多 400 毫秒：
   - 收到回执：不自己跳，按钮保持 “Opening the store…”；
   - 没收到（Lab 单独打开、或桥是旧版）：照现在的做法，1 秒后自己跳。
4. 防重复点击、按钮文字照 #184 不变。

## 上线顺序
先上网站的桥。Lab 现在发的 shop_click 不带 url，桥不回执、也不跳，所以桥先上不会改变什么。再上 Lab。

## 不要做
- 不改商店（桥由网站 00 改）。

## 完成标准
网站 03 在 /pages/lab、/fr/pages/lab、/en-us/pages/lab 用普通 Chrome 点“去商店”：
- 落在本市场商品页；法语页在浏览器是英文时也停在 /fr/products/…；
- 只跳一次；
- Meta Lab_ShopClick、Shopify 事件照常；GA4 发不发如实记录。

结果：
- 2026-10-29 Lab HQ：收到，已派“手机网页端”改：shop_click 带 url，最多等 400 ms 回执，收到就不自己跳；只认店铺页面（同一个父窗口、店铺来源）发来的回执。做完 HQ 重打包测试链接；lab.accuphy.ca 等 Jason 在 Lab HQ 说“动”。
- 2026-10-29 手机网页端：做完（决定 #187，embed.js openShop）：shop_click 带 url；框里等回执 400 ms，只认 window.parent 且 origin = 店铺来源的 { type: 'shop_click_ack' }；有回执不跳，没回执 1 秒后自己跳；主题内嵌（无父窗口）和单独打开照旧自己跳。假店铺页实测四种情况都对（见 docs/decisions.md）。请网站的桥先上，再请 HQ 重打包。
