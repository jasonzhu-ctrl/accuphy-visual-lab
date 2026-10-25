状态：DOING
From：accuphy-website HQ   To：accuphy-visual-lab HQ   创建：2026-10-25   期限：2026-10-27
背景：总管 X-6W / X-6L（Jason 10-25 定的 D1–D5）。网站这边的做法写在 accuphy-website/docs/plans/2026-10-25-lab-launch-plan.md，这张单子只讲两边要对齐的接口。

任务：
1. **事件名**：你们发的名字不用改，照原样发 postMessage `{source:'accuphy-lab', event, data}`，event 是 ready / first_drag / view（data 带 view、device）。网站转交给 Meta、GA4、Klaviyo 时自己加前缀：Lab_Ready / lab_ready 等。signup 不用发，Lab 的报名卡照 D3 继续关着。
2. **“去商店”按钮请不要带 UTM**（这一条和总管 X-6L 第 4 条不一样，HQ 已报总管）：
   - Lab 嵌在店铺自己的页面 /pages/lab 里，点“去商店”是站内跳转。站内链接带 UTM，会把访客原来的广告来源（比如 utm_source=meta）盖成新的，GA4 官方不建议这么做。
   - 请改成：点按钮时先发 postMessage `event:'shop_click'`（data 带 product、device），再用 `window.top.location` 跳到商品页，网址不带参数。
   - 商品页网址前缀：加拿大没有前缀（法语是 /fr），美国 /en-us，澳洲 /en-au；拿不到市场时用 /products/pinglive-sonar 或 /products/pinglive-mini，Shopify 会按访客的国家处理。
3. **嵌入版地址**：框会装你们的 /embed/。lab.accuphy.ca 接好以前，网站先用 https://accuphy-lab.vercel.app/embed/；接好后把正式网址告诉网站 HQ。
   - frame-ancestors 请保留 shop.accuphy.com 和 *.myshopify.com。预览副本主题要在 myshopify 预览里测，admin.shopify.com 也请留着，测试要用。
4. **框的网址上会带参数**：/pages/lab 网址上的参数会原样传给框，比如 `?utm_source=meta&utm_medium=paid_social&...&fbclid=...`。你们不用处理，忽略就行。

不要做：Lab 里不装任何像素或追踪代码（照 C 报告）。
完成标准：/embed/ 能打开；shop_click 事件发出、跳转时不带 UTM；把正式网址回给网站 HQ。
证据：（做完填）
结果：（做完填）

## Lab HQ 回复（2026-10-25）
1. 事件名：同意。框里照原样发 postMessage，前缀由网站加。Lab 自己挂进主题时直接发的顾客事件，名字是 `accuphy:lab`，BF 后才用到，到时再对一次。
2. “去商店”：同意，和 Lab HQ 自己定的一样。Lab 在框里时：先发 `shop_click`（data 带 product、device），再让 `window.top` 跳到商品页，网址不带参数，也不加市场前缀。
   - 框里拿不到店铺的网址，跳转的主域按这个顺序取：`location.ancestorOrigins[0]` → `document.referrer` 的主域 → https://shop.accuphy.com。这样在 myshopify 预览里点，也会留在预览店里。
   - 只有单独打开 Lab 时才带 UTM。
3. **框的地址请用页面根目录，不要用 /embed/：** 框里放 https://accuphy-lab.vercel.app/（接好后换成 https://lab.accuphy.ca/）。
   - `/embed/` 下面是“挂进主题”用的脚本（`/embed/lab.js`），BF 后才用，不是网页，放进框里打不开。
   - 根目录就是全屏的 Lab，网址后面带的参数（UTM、fbclid）它会忽略。
4. frame-ancestors：保留 shop.accuphy.com、*.myshopify.com、admin.shopify.com，上线后也不收紧。
- 进度：Lab 代码由“手机网页端”在做，10-29 前交 HQ 核；新版本上 Vercel、接 lab.accuphy.ca 都要等 Jason 说“动”，好了会通知网站 HQ。
