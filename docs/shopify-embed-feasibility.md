# Can the phone Lab be a page of the Shopify store? (feasibility, 2026-10-23)

Question (Jason, 2026-10-23): take the phone version of the Accuphy Lab as it is and make it a web page of
shop.accuphy.com — is that feasible, and what does it mean for technology, speed, ads/conversion and upkeep?
Research by Claude, read-only: the live store's HTML, Shopify's theme-limits docs, the Lab's public page, the
2026-10-16 hosting study in the Drive knowledge base. Status: recommendation; Jason decides (see §6).
Nothing was built; the Shopify side belongs to the website project (`accuphy-website`), reached through a handoff.

中文摘要在文末。

## 1. What was decided before, and what is new

- **#102 (2026-10-16):** the Lab pages will be hosted on the existing Vercel team (Pro) at `lab.accuphy.com` when the
  ads start; no new platform. That study rejected "a Shopify theme page" because the 2.3 MB WebGL page cannot live
  *inside* theme files (Liquid files max 256 KB) and a Shopify subdomain can only redirect.
- **New in this note:** a second way that #102 did not weigh — the store gets a page `shop.accuphy.com/pages/lab`
  whose whole body is a full-screen embed (iframe) of the Vercel-hosted Lab. Hosting stays exactly as #102; what
  changes is the **front door**: the address visitors and ads see is the store, not a subdomain.

## 2. Facts checked on 2026-10-23

| Fact | Value | Source |
|---|---|---|
| Lab public page (Both) | 2.57 MB raw, **1.04 MB compressed**, 0 external requests, no `X-Frame-Options` (embeddable) | `curl` of https://jasonzhu-ctrl.github.io/accuphy-lab-test/ |
| Store, an ordinary page (`/pages/contact`, phone UA) | HTML 245 KB, **20 external scripts**: Shopify trekkie, web-pixels-manager, Klaviyo, Help Scout beacon, goaffpro, synctrack, shop.app | `curl` of shop.accuphy.com |
| Store homepage / Mini page | 338 KB / 388 KB HTML, 21 / 27 external scripts (the 58 MB / 33 MB of the audit come from videos and GIFs) | same; `accuphy-website/docs/site-audit.md` §6 |
| Live theme | Taiga 3.8.0, "Taiga — Resource Page 2026-10-23" (188593668269); no iframe anywhere on the pages checked | page source `Shopify.theme` |
| Shopify theme limits | JSON template ≤ 512 KB, Liquid file ≤ 256 KB, theme package ≤ 50 MB compressed; **no per-file cap listed for `assets/`** | https://shopify.dev/docs/storefronts/themes/architecture/limits |
| Header/footer-less page in Online Store 2.0 | assign an alternative layout in the JSON template (`layouts/lab.liquid` keeping `content_for_header`); `{% layout none %}` is legacy and drops Shopify's own head injection | community threads on removing header/footer (Dawn) |
| Visitors on phones | 68 % of sessions | site-audit §5 |
| Lab sign-up code | `signup.js` already calls Klaviyo's client Subscriptions API once a public key + list id are filled in | `src/experiments/2026-09-23-sonar-lake-3d/signup.js` |

## 3. Two ways to put it in the store

| | **A. Store page + full-screen embed** (recommended) | B. Lab code inside the theme |
|---|---|---|
| How | `pages/lab` with its own template `templates/page.lab.json` → alternative layout without header/footer, body fixed to the viewport → one Custom Liquid section holding `<iframe src="https://lab.accuphy.com/…">` | Lab JS/CSS pushed as theme `assets/`, a section renders the `#root` |
| Hosting | Vercel as in #102 (unchanged) | Shopify CDN |
| Isolation from Taiga / apps | complete — nothing of the theme runs inside the frame | none: Taiga CSS resets, app scripts and the chat/gift bubbles share the page |
| Updating the Lab | redeploy on Vercel; the theme is never touched | every Lab change = duplicate theme → push → preview → publish → **re-publish Globo Mega Menu** (site-audit §7) |
| Tracking Lab events (3D ready, first drag, sign-up) | the Lab posts them to the parent with `postMessage`; a 10-line script in the section forwards them to the pixel / Klaviyo | direct |
| Shopify limits | none that matter (an iframe is one line of Liquid) | assets uncapped, but the 256 KB Liquid cap forbids inlining; Shopify's CDN serves the ~1 MB bundle fine |
| Risk | a full-screen iframe on iOS Safari needs `100dvh` + `overflow:hidden` on the parent, or the boat drag fights the page scroll; test in Facebook / Instagram in-app browsers | theme conflicts, publish risk every time |

## 4. The four questions

### 4.1 Technology — feasible
A is standard Shopify (Online Store 2.0 page template + alternative layout + Custom Liquid). Both pieces already exist
on our side: `scripts/build-share.mjs` makes the self-contained page; `signup.js` is Klaviyo-ready. What the Lab
would add for an embed build: no sign-up gate (already so on the public pages, #71), `postMessage` events, a
`100dvh` root, and `Content-Security-Policy: frame-ancestors https://shop.accuphy.com` on Vercel so only the store may
frame it.

### 4.2 Speed and experience — the Lab is unchanged, the store shell is the extra cost
- Lab: 1.04 MB compressed today; the planned slimming (WOFF2 subsets, SVG logo, page-only build,
  `docs/mobile-marketing-plan.md` "Loading") brings it to ~0.5 MB.
- Store shell with the alternative layout: Taiga's sections are gone, but `content_for_header` still loads Shopify's
  analytics, the web-pixels manager, Klaviyo onsite and any app embeds (Help Scout, goaffpro) — estimate
  **0.3–0.6 MB and 10–15 requests** on top. Measure on the unpublished theme copy before deciding whether to hide the
  app embeds on this page.
- Phone frame rate is a property of the Lab, not of the host: the V10 still runs 10–24 fps (`docs/backlog.md`
  "Mobile + Meta ads readiness"). Nothing here helps or hurts it.
- Shopify page cache ≈ 15 min (`accuphy-website/docs/shopify-access.md`): irrelevant for the iframe content, which is
  served by Vercel.

### 4.3 Ads and conversion — the main gain of a store page
- **One domain.** Meta Pixel (via Shopify's web pixels, if the Facebook & Instagram app is installed — not readable
  with our API access), Shopify analytics and Klaviyo onsite are already on every store page; the subdomain plan
  needs each added by hand (#102 "Meta Pixel" step) and Meta sees a cross-domain hop from Lab to shop.
- **Sign-up** lands in the store's Klaviyo either way; in A it can even be a Klaviyo form on the parent page instead of
  the Lab's own card.
- **"Shop PingLive"** is an in-site link, no new tab, no domain change.
- **Markets:** the page exists per market address — `/pages/lab` (Canada), `/en-us/pages/lab` (US). Each needs its
  context template, and ad links must point at the right market (Canada first per `docs/users-and-market.md`; US ads
  lead with the Mini, pending-reminder 12). Shopify's geolocation banner may still offer a market switch on the page.
- **SEO:** indexing is a choice (the test pages are `noindex`); a store page with real copy around the embed can rank
  for "live sonar", a bare iframe cannot.

### 4.4 Cost and upkeep
- A: the website project does the page, template, layout and the forwarding script **once**; afterwards the Lab team
  redeploys on Vercel and the store never changes. Cost: nothing new (Vercel Pro is paid since #102).
- B: every Lab release goes through the website project's publish procedure with the Globo risk. Not recommended.
- Either way the DNS record for `lab.accuphy.com` (one CNAME at Alibaba Cloud, #102) is still needed as the iframe
  source — or Vercel's own `*.vercel.app` address can be framed and no DNS is touched at all.

## 5. Recommendation
Keep #102 (Vercel) and add **A**: the store page `shop.accuphy.com/pages/lab` as the public front door, the Lab
framed from Vercel inside it. It gives the ads a store address, free pixels and Klaviyo, one-time theme work, and the
Lab keeps its own release cycle. Measure the shell's weight on the theme copy first; if it exceeds ~0.6 MB, hide the
app embeds on this template.

## 6. Open for Jason (one at a time)
1. Adopt A — the store page as the front door — alongside #102? (Yes / keep the subdomain only.)
2. Which market first: Canada `/pages/lab`, then US `/en-us/pages/lab`?
3. Should the embed source be `lab.accuphy.com` (needs the CNAME at Alibaba Cloud) or the plain Vercel address (no
   DNS work; the address is never visible)?

After his answers: a handoff to `accuphy-website/handoffs/` (page, template, layout, iframe, event forwarding, per-
market context templates, test on `?preview_theme_id=`), and in this repo an "embed" build variant when he says go.

## Sources
- https://shopify.dev/docs/storefronts/themes/architecture/limits
- https://community.shopify.com/t/removing-header-and-footer-from-dawn-template-page/67143/20
- https://community.shopify.com/t/custom-pixel-event-stopped-working/553216
- Drive, Market Research: "2026-10-16 Hosting for the Accuphy Lab pages (EN).md"
- `accuphy-website/docs/site-audit.md`, `accuphy-website/docs/shopify-access.md` (read only)

---

## 中文摘要（给 Jason）

**问题：** 现在的手机版 Lab 能不能直接做成 shop.accuphy.com 里的一个网页？

**结论：可行，推荐做法 A。** 店里开一个页面 `/pages/lab`，用一个没有页眉页脚、全屏不滚动的专用模板，里面一个全屏窗口（iframe）
指向我们放在 Vercel 上的 Lab（#102 的托管方案不变）。顾客和广告看到的地址是店铺，Lab 的发布还是我们自己管。

**四个方面：**
1. **技术：** 能放。Shopify 的限制（模板 ≤ 512 KB、Liquid ≤ 256 KB）只卡「把代码塞进主题」的做法 B，不卡做法 A。
2. **速度体验：** Lab 本身压缩后 1.04 MB（瘦身后约 0.5 MB）。店铺的「外壳」再加 0.3–0.6 MB（Shopify 统计、像素、Klaviyo、
   客服/返利气泡）。手机帧数不变（便宜安卓 10–24 fps），和放哪无关。要在 iPhone Safari 和 Facebook 内置浏览器实测拖船不会和页面滚动打架。
3. **广告转化：这是最大的好处。** 同一个域名，Meta 像素、Shopify 统计、Klaviyo 都现成；注册直接进店里的 Klaviyo；「去买」是站内跳转。
   注意各市场地址不同（加拿大 `/pages/lab`，美国 `/en-us/pages/lab`），广告链接要对应。
4. **成本维护：** 做法 A 网站项目只做一次，以后 Lab 更新不碰主题；做法 B 每次更新都要走主题发布，还有 Globo 菜单掉线风险，不推荐。

**和之前决定的关系：** #102 定了 Vercel 托管，没有评估过「店内页面 + 全屏嵌入」；这个做法是在 #102 之上加一个店铺入口，不冲突。

**等你定（一次一个）：** ① 要不要做 A；② 先上哪个市场；③ 嵌入源用 lab.accuphy.com（要在阿里云加一条 DNS）还是直接用 Vercel 的地址（不用动 DNS，地址不露出）。
