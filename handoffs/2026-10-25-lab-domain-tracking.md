状态：DONE
From：项目总管 | CHIEF Agent（IT/CHIEF Agent）   To：accuphy-visual-lab HQ   创建：2026-10-25   期限：2026-10-27   编号：X-5C

# Lab 放在哪个域名、怎么从广告追踪到下单（只查不改）

## 背景（4 个项目都收到同一段）

Jason 2026-10-25 在总管聊天里的原话：
“Visual Lab 这边有一个诉求，就是要确认一下它的项目要在哪里，哪个域名上线。……需要 acccuphy-website 去查一下我们整个店铺的 setup。店铺应该域名注册的是用的是 .ca，但是有中转到 shop.accuphy.com，让他核实一下。然后这个项目的话，lab 这个东西有两个用处，一个是我们的 klayvio 是需要知道它在上面会要做一个那个subscribe 的一个框嘛……要记录这信息。还有的话，做那个 Meta 的或者是YouTube 的广告的链接，然后进来去获取客人的，我们要去 tracking 它的入口啊，后面下单没有啊，这些信息。这个事情比较复杂，是需要相对深度，并且多 agent 多个 project 去协作最后分析的这么一个事情。”

Jason 同意了总管的分工（2026-10-25）。总题目是：**Lab 放在哪个域名、用什么方式放，才能做到下面两件事——**
1. Klaviyo 订阅框能拿到邮箱，并且记下这个人从哪里来；
2. 从 Meta、YouTube 广告点进来的人，从入口一路跟到最后有没有下单。

分工：A + B 网站 HQ；C Lab HQ；D Klaviyo HQ；E IT-HR HQ。最后由总管把 5 块合成一页建议，交 Jason 定。
注意：之前总管说过“域名已定 lab.accuphy.com”，那只是照 Lab 以前的记录（#102）说的，没有核实过店铺真实的域名设置。**这件事现在重新打开，接 CNAME 先停。**

先读 Drive `Market Research/` 里已有的 3 份调研，不重复做：
- `2026-10-16 Hosting for the Accuphy Lab pages (EN).md`
- `2026-10-17 Black Friday full funnel with the Lab (EN).md`
- `2026-10-23 Which browser opens ad and email links (EN).md`

## 规矩（4 个项目都一样）

- **这一轮只查不改。** 可以读 Shopify / Klaviyo / Meta / Vercel 的设置，可以查 whois 和 DNS（dig / nslookup），可以看网页源码和网络请求。不改任何设置，不发布，不加 DNS 记录，不改像素。
- 拿不准的地方写“存疑”，并写清楚怎么才能确认。不要猜。（全局新规则：复杂了就停下来问。）
- 结果写进本项目的 `docs/2026-10-xx-lab-domain-tracking-<你这块的字母>.md`，大白话，写清楚每条事实的出处（截图路径、命令输出、设置页面名称）。
- **期限：2026-10-27 晚上前**，回报给“项目总管 | CHIEF Agent”：`X-5<字母> | 结果 | 文件路径 | 需要谁做什么`。
- 只往本项目写文件。需要别的项目配合的，写进回报，由总管去协调。

## 你这块：C Lab 页面本身

1. Lab 页面现在会记录哪些动作（events 模块），记到哪里去；有没有装 Meta 像素、GA4、Klaviyo 的代码；有没有读取广告链接里的 UTM。
2. 报名卡现在怎么连 Klaviyo：用的公开钥匙、进哪个名单、带不带来源信息。
3. 三种放法各写一段：放框（iframe，嵌在店铺 /pages/lab）、挂进店铺主题（#142）、独立子域名（lab.accuphy.com 或 .ca）。每段写清楚：
   - 广告点击能不能一路跟到店铺下单；
   - Klaviyo 能不能认出这个人；
   - Safari / Instagram 内置浏览器里会不会断（参考 10-23 那份调研）；
   - 11/2 前做不做得完。
4. 现在 Vercel 上的部署（https://accuphy-lab.vercel.app/）有哪些限制，比如能不能接任意域名、要加什么头信息。

## 证据

`docs/2026-10-25-lab-domain-tracking-C.md`（代码出处、线上源码检查、curl 头信息、dig、Vercel CLI，均 2026-10-25）。

## 结果

Lab 自己不装像素、不装 Klaviyo、不读 UTM，只把 4 个动作交给店铺页；留邮箱卡片线上关着，名单号也空着。放框和挂进主题都能追到下单，靠的是店铺页；独立子域名现在什么都追不到，11/2 前不现实。用框时 Lab 用 .com 还是 .ca 对追踪几乎没影响。Lab HQ 2026-10-25。
