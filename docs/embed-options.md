<!-- decision #138: research only, pending Jason. Written by a research sub-agent of the lake chat, 2026-10-24. -->

> **Adopted 2026-10-24 (#142):** Option 3, the theme-mounted Lab; the iframe stays as the fallback. Lab side built
> (`scripts/build-embed.mjs`); handoff draft `docs/handoffs/2026-10-24-lab-theme-mount.md`.
# Putting the Lab on the store's address — the realistic options compared (2026-10-24)

Research only; nothing built, nothing written into the repo. Baseline: decisions #133/#134 and
`docs/shopify-embed-feasibility.md` (store page `/pages/lab` + header-less template + full-screen iframe of the
Vercel Lab, `postMessage` → `Shopify.analytics.publish` → Custom Pixel → Meta, Klaviyo client API, UTM pass-through).

**Method and its limits.** The container blocks direct page fetches (shopify.dev and shop.accuphy.com both refused
through the proxy), so every external fact below comes from **search-result excerpts**, not from reading the pages.
Labels: **[search]** = seen in a search excerpt (source listed at the end); **[repo]** = from this repo's docs/code;
**[reasoning]** = my inference, not verified. Anything marked **unverified** must be tested on the unpublished theme
copy before it is relied on.

---

## 中文摘要（给 Jason）

**问题：** 除了"店铺页面 + 全屏 iframe"，还有没有更合适、更实用、落地效果更好的办法，把 Lab 放到店铺地址下？

**结论：有。推荐换成"主题挂载"方案（选项 3）：** 店里还是开 `/pages/lab`，还是用没有页眉页脚的专用模板，但页面里**不放 iframe**，
而是放一个空的 `<div>` 加一行 `<script type="module" src="https://lab.accuphy.com/embed/lab.js">`。Lab 的代码照旧放在
Vercel、照旧自己发布（换一个固定地址的小"引导文件"即可，主题永远不用再碰），但它**直接画在店铺自己的页面里**。
好处：同一个页面、同一个域名，Shopify 统计、Web Pixel、Meta、Klaviyo 全是现成的，Lab 直接调用 `Shopify.analytics.publish`
和 `klaviyo`，不再需要 postMessage 那套转发；手机上只有一个滚动层，锁屏幕、防拖船打架都好做得多；"去买"是普通站内链接；
页面还能放真实文字给搜索引擎。代价：Lab 要做一个"挂载到 div"的构建版本（而不是整页），CSS 要防止和主题互相影响
（专用布局里不加载 Taiga 的样式，必要时用 Shadow DOM），Vercel 要加 CORS 头。

**其他选项：** ① 现在的 iframe 方案能用，但 iOS 滚动打架、双滚动条、Meta 自动高级匹配在 iframe 里失效、Klaviyo 在 iframe
里是第三方 cookie、事件要靠 postMessage 转发 —— 都是"能修但麻烦"的事。② App Proxy（`/apps/lab` 原样转发 Vercel 的 HTML）
能做到同域、无 iframe，但页面不经过主题，Shopify 统计/Web Pixel/Klaviyo 都不会自动加载，要自己补 Meta 和 Klaviyo 代码，
Shopify 自己的会话统计补不上；还要注册自定义 App、验签、Shopify 转发多出 0.6–1.4 秒延迟（社区反馈），不值。
④ 独立 `lab.accuphy.com` 最快最简单，但丢掉 Shopify 的会话/归因/客户事件；因为是同一主域的子域名，Meta 的 `_fbp` cookie
仍可共享，损失比"完全不同域名"小得多。⑤ Hydrogen 无脑过大。⑥ 还有一个备选：自定义 App 的"主题应用扩展"（app block），
Lab 资源放 Shopify CDN，用 `shopify app deploy` 更新、不用重新发布主题 —— 也不用 iframe，但有文件大小限制和
发布后资源不刷新的社区反馈，做第二备选。

**全屏问题哪个方案都一样：** iPhone 和 Facebook/Instagram 内置浏览器都没有网页全屏 API，只能把页面做成"正好填满可见
区域"（dvh/svh + `viewport-fit=cover`），浏览器自己的地址栏/底栏去不掉。无 iframe 的方案只是让这件事容易一倍。

**等你定：** ① 换成选项 3 吗（iframe 方案留作备用）？② Lab 的挂载版可以开始做了吗？③ 是否接受专用布局里不加载 Taiga
样式（最干净，但页面上任何店铺元素都要我们自己画）？

---

## 0. What the owner actually needs (the checklist every option is scored against)

| # | Goal | Why it matters |
|---|---|---|
| G1 | Ads land on the store domain (`shop.accuphy.com/...`) | one domain for Meta, Shopify attribution, trust |
| G2 | Store pixels / Shopify analytics / Klaviyo see the visit and the Lab's events | #134 tracking design [repo] |
| G3 | The Lab keeps its own release cycle (Vercel deploy; the theme is not republished per Lab change) | #133/#134 [repo]; Globo publish risk is gone but theme publishes are still work |
| G4 | Phone full-screen, no scroll fighting, orientation handled | 68 % of sessions are phones [repo: feasibility §2] |
| G5 | Works in Facebook/Instagram in-app browsers | that is where ad clicks open |
| G6 | Low total effort and few moving parts | one person runs this |

Two facts that bound **every** option, so they are not a differentiator:

- **No page can go "truly full-screen" on iPhone or inside Meta's in-app browsers.** Element fullscreen
  (`requestFullscreen` on a `<div>`) is not available on iPhone Safari (only `<video>` has it), a 2026 WebKit bug comment says
  the Safari 27 beta still has nothing for element fullscreen on iPhone, and an open WebKit bug says `WKWebView` (which
  Facebook/Instagram use) ignores `webkitRequestFullscreen` [search: Apple forums 133248/770080, WebKit 193078/265438].
  The only lever is a layout that exactly fills the *visible* viewport (`100dvh`/`100svh`, `viewport-fit=cover`); the browser's
  own bars stay. A WebKit bug reports scroll jank when `dvh` is used on the root scroller as the address bar resizes
  [search: WebKit 266835]; a developer reports `100dvh` overlays leaving a gap after an iOS update [search: Apple forum 803987].
  → use `svh`/fixed positioning plus a resize listener rather than relying on `dvh` alone [reasoning].
- **WebGL itself runs in the in-app browsers** (WKWebView has had WebGL since iOS 8) but there are reports of Three.js
  scenes failing in some in-app browsers specifically when assets are loaded by loaders [search: SD Times, three.js discourse
  39476]. Our page has 0 external requests in the share build [repo: feasibility §2], which is the safest shape for this.

---

## 1. Option 1 — the current plan: store page + full-screen iframe (#134)

**How.** `pages/lab` → `templates/page.lab.json` → alternative layout without header/footer → one Custom Liquid section
with `<iframe src="https://<vercel>/…?utm…">`; Lab posts events with `postMessage`; the section calls
`Shopify.analytics.publish('accuphy_lab', …)`; a Custom Pixel forwards to Meta; sign-up from the Lab card to Klaviyo's
client API; Vercel sends `frame-ancestors` [repo: #134, `scripts/build-share.mjs`].

**Effort.** Lab: events module, `100dvh` root, Klaviyo keys, `window.top` links, `vercel.json` (already drafted in
`build-share.mjs`) [repo]. Shopify: page, template, layout, section with ~10 lines of JS, Custom Pixel. Moderate on both
sides, and the two halves must agree on an event contract.

**Real weaknesses (the "mess").**
1. *Two scrollers / scroll hand-off.* iOS Safari does not hand scroll back to the parent at an iframe boundary ("feels
   stuck unless I move my touch outside the iframe") and people patch it with JS `scrollBy` hacks [search: Power BI community
   5157894]. With the parent locked (`overflow:hidden`) this mostly disappears, but every Taiga/app element that reserves
   height (announcement bars, cookie banner, app embeds) reopens the fight [reasoning].
2. *Double scrollbars / height mismatch.* The iframe must be sized by the parent's `dvh`, which has the jank bug above, and the
   inner document has its own viewport units that may disagree [reasoning + search: WebKit 266835].
3. *Meta Advanced Matching.* A Shopify-focused write-up quotes Meta's docs: Automatic Advanced Matching "won't work if your
   pixel is set up in an iframe" (manual advanced matching does) [search: WeltPixel]. In #134 the pixel runs on the parent,
   so this only bites the sign-up form, which is inside the frame — the email never reaches the parent-side pixel unless the
   Lab posts it (and #134 says "no personal data" in postMessage) [repo + reasoning].
4. *Third-party-context cookies inside the frame.* Anything the Lab itself stores or any tracker running inside the frame
   (Klaviyo onsite cookie, `_fbp`) is a third-party cookie there; Safari blocks third-party cookies outright
   [search: Cometly]. Klaviyo's client Subscriptions API call still works (no cookie needed) [repo: `signup.js`], but
   "Active on Site"/browse tracking for the Lab visit happens only on the parent [reasoning].
5. *Custom Pixel plumbing.* Custom pixels run in a `lax` sandbox iframe (`allow-scripts allow-forms` only) with no access
   to the top frame [search: shopify.dev pixels]. So the chain is Lab → postMessage → section JS → `Shopify.analytics.publish`
   → sandboxed pixel → Meta. Four hops, three places to debug, and Shopify only fires web pixels after consent in markets that
   require it [search: help.shopify custom pixels].
6. *Core Web Vitals / SEO.* Chrome's LCP API does not report iframe content to the main frame [search: Chromium M88 notes];
   the store page's metrics describe an empty shell, and nothing inside the frame counts as the page's content for search
   (the feasibility note already says a bare iframe cannot rank) [repo].
7. *`frame-ancestors` and theme editor.* Must list `shop.accuphy.com`, `*.myshopify.com`, `admin.shopify.com` (already in
   `build-share.mjs`) [repo]; any future domain (a US market domain) is another edit.

**Landing quality:** acceptable after tuning, but the tuning is exactly the fiddly part. **Tracking:** good for page-level
(store-native), hop-based for Lab events. **Risks:** iOS scroll hand-off, in-app browser height quirks, event contract drift.
**Unverified:** actual behaviour in the Instagram in-app browser; whether Taiga's app embeds reserve height on the
header-less layout.

---

## 2. Option 2 — Shopify App Proxy (`shop.accuphy.com/apps/lab` → Vercel)

**How it works (rules confirmed in excerpts).**
- A custom app declares a proxy; Shopify forwards `/apps|/a|/community|/tools/<subpath>/…` to the app URL, **keeps the
  original query string** (`?extra=1&extra=2` example) and appends `shop`, `path_prefix`, `timestamp`, `signature`
  (`logged_in_customer_id` when signed in); the signature is an HMAC-SHA256 over the other params with the app secret
  [search: shopify.dev app-proxies, authenticate-app-proxies]. A community thread reports an encoding wrinkle (`%2B` arriving
  as a space) [search: community 164965]. UTM pass-through is therefore plausible but not explicitly documented **[unverified]**.
- **Content type:** if the response is `Content-Type: application/liquid`, Shopify renders the Liquid "using the shop's
  active theme"; **otherwise the response is returned directly to the client** [search: shopify.dev]. 30x redirects are
  followed; `Set-Cookie`, `Cookie`, `Server`, `X-Powered-By` headers are stripped [search: shopify.dev]. Full-page
  (non-Liquid) rendering is even recommended by Shopify's subscription-portal docs because "apps and themes can execute
  untrusted JavaScript" [search: shopify.dev customer-portal].
- **Liquid responses:** rendered inside the theme's `content_for_layout`, so the header/footer appear and can flash
  before the proxied content [search: community.shopify.dev 24153]. The Remix/React-Router app library has a `layout: false`
  option; a third-party doc shows `{% layout 'theme' %}` in a proxy response, **not confirmed** against Shopify docs
  [search]. `Cache-Control` set by the app on Liquid responses is ignored [search: community.shopify.dev 29426].
- **Limits:** no documented response-size or timeout figure found; community measurements put the proxy's own overhead at
  ~600 ms to ~1.4 s per request [search: community 30176, 37437]. Shopify's generic response-code page says 504 after
  10 s, which is about the API, not the proxy **[unverified for proxies]**.
- **Markets:** localized proxy routes (`/de/apps/…`) have broken and been fixed before; a bug report says moving from a
  non-primary locale to a proxy page resets the locale [search: community 40988, 7909, 13039]. `/en-us/apps/lab`
  **[unverified]**.

**Can a raw HTML Lab page be served same-origin under the store domain with no iframe?** Yes, by the content-type rule
[search]. Vercel would answer `/apps/lab` with the full page HTML (`text/html`), with absolute asset URLs on Vercel
(or relative ones re-served through the proxy, which pays the latency per asset — so absolute) [reasoning].

**But what the page loses.** A raw (non-Liquid) response never passes through the theme layout, so **nothing that
`content_for_header` injects is there**: Shopify's trekkie analytics, the web-pixels manager (standard pixels and the
Custom Pixel), Klaviyo onsite, the Facebook & Instagram app's pixel. Community threads confirm these are injected through
`content_for_header` and are not under theme control [search: community 14993, 160657]; there is no supported way to load the
web-pixels manager on a page Shopify did not render [reasoning]. The Lab would have to embed the Meta base pixel and Klaviyo's
`klaviyo.js` (`company_id=<public key>`) itself — both are plain snippets that work on any site [search: Klaviyo developer
docs] — but the duplicate-install warning applies (Klaviyo advises one injection method, not both) [search: Klaviyo
community 443], and **Shopify analytics sessions, Shopify's Meta/Klaviyo integrations, and `Shopify.analytics.publish`
custom events are simply not available** on such a page [reasoning]. Also: `Set-Cookie` is stripped, so nothing server-side
can cookie the visitor [search].

**The hybrid** (`application/liquid` + a header-less layout, so the theme injects the trackers and Vercel supplies the
body) gets the trackers back, but then the page is a theme page anyway, with the extra proxy latency, a custom app,
HMAC code, ignored cache headers and the layout/flicker uncertainty — everything Option 3 gives without a proxy
[reasoning].

**Effort.** Lab: a Vercel route per market serving the page + HMAC check (optional for a public page) + pixel/Klaviyo
snippets. Shopify: create a custom app (Dev Dashboard), configure the proxy, nothing in the theme. **Landing quality:**
best possible (one document, the Lab owns `<html>`), minus 0.6–1.4 s first-byte. **Tracking fidelity:** Meta pixel/CAPI
and Klaviyo only if self-installed; Shopify analytics and customer events: none. **Risks:** proxy latency, unknown limits,
market prefixes, duplicate pixels. **Unverified:** limits, UTM forwarding, `/en-us/apps/…`.

Verdict: solves "same origin, no iframe" and nothing else; it trades the iframe mess for a tracking mess.

---

## 3. Option 3 — theme-hosted Lab: the store page mounts the Vercel bundle into a `<div>` (recommended)

**How.** Keep #134's page, JSON template and header-less alternative layout `layouts/lab.liquid`. The section body is:

```liquid
<div id="accuphy-lab" data-market="{{ localization.country.iso_code }}" data-shop-url="{{ product_url }}" …></div>
<script type="module" crossorigin src="https://lab.accuphy.com/embed/lab.js"></script>
```

`lab.js` is a small, **stable-URL loader** (Vercel header `Cache-Control: max-age=300` or `no-cache`) that `import()`s the
hashed chunk of the latest deploy; a new Lab release changes only what the loader points at, so the theme is never
touched again (G3) [reasoning]. Shopify's ~15-min page cache is irrelevant because the page HTML does not change
[repo: feasibility §4.2].

**Why it fits the goals better than the iframe.**
- One document, same origin: `Shopify.analytics.publish('accuphy_lab', …)` is called **directly by the Lab** ("can be
  called from theme.liquid script tags or theme app extensions" [search: shopify.dev emitting-data]), the Custom Pixel from
  #134 is unchanged, and the postMessage hop disappears. Klaviyo's onsite object (`klaviyo`/`_learnq`) is on the page as a
  first-party script; the sign-up card can call it or the client API as now [repo + reasoning]. The Meta pixel is on the page
  itself (no iframe → Automatic Advanced Matching unaffected) [search: WeltPixel + reasoning].
- Phone: one scroller to lock (`html,body{overflow:hidden;overscroll-behavior:none}`, `touch-action:none` on the canvas),
  no iframe hand-off, no double viewport units. The fullscreen ceiling (section 0) is the same for everybody.
- SEO: real copy can sit under/beside the Lab in the same page; the content is the page's own.
- Shop links are plain same-origin links; Liquid can inject the market's product URL and currency into `data-*`.

**Constraints and how the bundle must change.**
- *Assets:* Shopify's 256 KB Liquid cap does not apply (the section is ~20 lines); the bundle lives on Vercel, so theme
  asset limits do not apply either (the limits page lists no per-file cap for `assets/` anyway) [search: shopify.dev limits].
- *CORS:* a cross-origin `<script type="module">` and cross-origin `@font-face` files require `Access-Control-Allow-Origin`
  from Vercel (one `vercel.json` header) [reasoning, standard browser rule].
- *CSP:* Shopify sets no `script-src` on Liquid storefronts (merchants "do not control the response headers" and stores
  load dozens of third-party scripts) [search: Report URI, community 181585]; a store page already loads 20 external scripts
  [repo]. No blocker.
- *Build shape:* an `embed` Vite entry exporting `mount(el, opts)` instead of rendering into `#root`; the share-build inliner
  already resolves fonts/logo into data URIs, so the same script can emit a hashed chunk + loader [repo: `build-share.mjs`].
- *CSS scoping:* two defensible designs. (a) **Lean layout:** `layouts/lab.liquid` includes `content_for_header` and our
  section only, **not** Taiga's `theme.css`, so almost nothing of the theme can collide; app embeds (Help Scout, goaffpro,
  Klaviyo forms) still inject via `content_for_header` and are hidden with a few CSS rules [reasoning]. (b) **Shadow DOM
  root:** inject the Lab CSS into a shadow root for hard isolation; `@font-face` must then be declared in the light DOM
  (known quirk) [reasoning]. Community reports of React in theme pages name "CSS conflicts due to theme overrides" as the
  main pain and the iframe as the escape hatch [search: community 175347]; (a) removes most of the cause.
- *Theme JS conflicts:* Taiga's own scripts are not loaded in the lean layout; only app embeds remain. Tailwind 4 preflight
  resets must be scoped (prefix/layer) if (a) is not chosen [reasoning].
- *Update flow:* Vercel deploy → loader points at new hash → live within the loader's max-age. Rollback = redeploy.
  The theme is republished only when the section/layout changes.

**Effort.** Lab: embed entry + loader + CORS headers + CSS scoping + replace postMessage with direct
`Shopify.analytics.publish`/Klaviyo calls (smaller than the iframe events module, since no contract is needed). Shopify
(website project): the same page/template/layout as #134 with a `<div>` + `<script>` instead of an iframe, the Custom Pixel,
and the lean-layout decision. **Landing quality:** best of the store-domain options. **Tracking fidelity:** store-native
for everything (Shopify sessions, web pixels, Meta via Shopify's app or Custom Pixel, Klaviyo onsite + API). **Risks:** CSS /
app-embed interference (mitigated by the lean layout), a broken loader breaks the page (keep a static fallback message in
the section), content-type/MIME on Vercel for `.js`, the page editor's "Custom Liquid" must keep the `<script>` tag (it
does; a forum report says the page editor does not strip script tags either [search: community 32647]). **Unverified:**
Shopify's theme editor preview with a cross-origin module script (should work; test on `?preview_theme_id=`).

---

## 4. Option 4 — standalone `lab.accuphy.com` on Vercel with the trackers installed directly

**How.** #102 as decided [repo]: Vercel project, CNAME, the Lab page as-is, plus Meta pixel base code, `klaviyo.js`,
GA4 if used; "Shop" links to `shop.accuphy.com/products/…?utm_…`.

**What is lost vs. the store domain.** Shopify analytics never sees the visit (no sessions, no "online store sessions",
no Shopify marketing attribution for the landing), no customer events / Custom Pixel, Shopify's Facebook & Instagram app
and Klaviyo integrations do not cover the page; the Lab must carry its own pixels and consent handling [reasoning].
Meta documents that a landing domain and the store domain are "unrelated, no shared cookies" and names a **subfolder or
subdomain of the store** as the fix [search: aimerce]; because `lab.accuphy.com` and `shop.accuphy.com` share the registrable
domain `accuphy.com`, first-party cookies such as `_fbp` set on `.accuphy.com` are shared across both, so the loss is much
smaller than with a foreign domain — **but whether Meta's pixel sets `_fbp` on the registrable domain rather than the host is
[unverified]** here. Redirects that drop `fbclid` break attribution [search: aimerce]; keep the click landing directly.
Shop Pay is not involved on a landing page [reasoning].

**What is gained.** Fastest, simplest page (no store shell, no 20 scripts, no iframe, no theme), full control of
`<html>`, orientation and viewport, instant releases, no dependency on the website project. Ads can still land on
`shop.accuphy.com/lab` via a Shopify URL redirect, but that is just a hop and keeps none of the store's tracking
[reasoning].

**Effort.** Lab only: pixels + consent + CNAME. **Landing quality:** best. **Tracking fidelity:** Meta pixel/CAPI and
Klaviyo yes (self-installed), Shopify none. **Risk:** two tracking setups to keep in sync; the owner wanted "tracking done
the proper Shopify way" (#134) [repo].

---

## 5. Option 5 — Hydrogen/Oxygen or another headless route

Hydrogen is free and Oxygen hosting is included with paid plans [search: Weaverse, Charle], but it replaces the whole
storefront; agencies quote six-figure builds and 1–3 FTE for upkeep, and Liquid apps do not carry over [search: askphill].
A Hydrogen storefront on a subdomain beside the Online Store is possible in principle, but that is Option 4 with a bigger
framework [reasoning]. **Too big; noted only.**

---

## 6. Other credible options

- **6a. Page-content HTML with `<div>` + `<script type=module>`** (the Pages editor instead of a section). Same mechanics as
  Option 3; the editor reportedly does not strip `<script>` [search: community 32647] but it rewrites HTML and offers no
  Liquid, so the section is the better home. Fallback only.
- **6b. Custom app → theme app extension (app block "Accuphy Lab")**. The Lab bundle ships as extension assets on
  Shopify's CDN ("extension assets are hosted on Shopify's CDN"; the theme stays untouched [search: Shopify Partners blog]);
  the merchant adds the block to the lab template once; updates go out with `shopify app deploy` from the Lab repo, no
  theme publish (G3 inside Shopify). Same-origin, no iframe, trackers native — like Option 3 but with no Vercel dependency
  at run time. Caveats: theme app extensions have their own file/content limits that I could not read (community: 100 KB
  total Liquid across blocks, JS lint threshold 10 KB "not yet enforced"; per-asset limit **unverified**) [search: community
  9879/188314, shopify.dev theme-check]; reports of a storefront keeping old JS after a deploy until reinstall, and of a custom
  version name 404-ing every asset URL [search: community.shopify.dev 34651, 32932]; requires the Dev Dashboard/CLI toolchain.
  A solid **second choice** if the owner prefers "everything on Shopify".
- **6c. Vercel (or Cloudflare) reverse-proxying the store under one host** — Vercel rewrites can proxy external origins
  [search: Vercel KB], but Shopify's hostname validation means only Cloudflare's O2O-style setup is supported in front of a
  store [search: Stape]; Jason ruled Cloudflare out (#102) [repo]. Not practical.
- **6d. Shopify URL redirect `shop.accuphy.com/lab` → Vercel.** Ads show the store URL for a moment; nothing else gained.
  Only as a vanity link for print/QR.

---

## 7. Side-by-side

| | 1 Iframe (#134) | 2 App Proxy raw HTML | 3 Theme mount (Vercel bundle) | 4 Standalone subdomain | 6b App block |
|---|---|---|---|---|---|
| Store domain (G1) | yes | yes | yes | no (subdomain) | yes |
| Shopify analytics / web pixels / Custom Pixel (G2) | yes (page) + hop for Lab events | **no** (self-installed Meta/Klaviyo only) | **yes, direct** | no | yes, direct |
| Klaviyo onsite | parent only; API from frame | self-installed | native | self-installed | native |
| Lab release independent of theme (G3) | yes | yes | yes (loader URL) | yes | yes (`app deploy`) |
| Phone full-screen / scroll (G4) | two scrollers, iOS hand-off | one doc, best | one doc | one doc, best | one doc |
| In-app browsers (G5) | same ceiling + iframe quirks | same ceiling | same ceiling | same ceiling | same ceiling |
| Extra moving parts | postMessage contract, frame-ancestors | custom app, HMAC, proxy latency 0.6–1.4 s, limits unknown | CORS header, CSS scoping, loader | second tracking stack | CLI/Dev Dashboard, size limits, stale-asset reports |
| SEO / page content | shell only | page owns content | page owns content | own site | page owns content |
| Lab-side effort | medium | medium | medium | low | medium–high |
| Shopify-side effort | medium | low (app setup) | medium (same as 1) | none | medium |

---

## 8. Recommendation (ranked)

1. **Option 3 — theme-mounted Lab.** Keeps everything #134 wanted (store address, store-native tracking, own release
   cycle) and removes the parts the owner calls a mess: no iframe, no postMessage, one scroller, Meta/Klaviyo first-party,
   real page content. The Lab work is comparable to the planned "embed build" and the Shopify work is the same page/template/
   layout with a `<div>`+`<script>` instead of an `<iframe>`. Decide the lean layout (no Taiga CSS) up front.
2. **Option 6b — app block via a custom app**, if the owner would rather have the runtime on Shopify's CDN with no Vercel
   dependency. Verify the extension size limits first (our bundle is ~1 MB compressed [repo]).
3. **Option 1 — iframe**, as the fallback if 3 hits an unexpected theme/app-embed conflict on the preview theme. It works;
   it is just the fiddliest.
4. **Option 4 — standalone subdomain** only if store-side analytics stop mattering (e.g. a pure brand teaser).
5. **Option 2 — App Proxy**: not for a landing page; keep it in mind only for a later *API* need (e.g. a same-origin
   endpoint). **Option 5**: no.

What changes in #134 if Option 3 is adopted: the tracking design stays (`accuphy_lab` customer event, Custom Pixel → Meta,
Klaviyo client API, UTMs now simply in the page URL), the iframe-specific items go (postMessage, `window.top` links,
`frame-ancestors`), and "embed build" becomes "mount build + loader + CORS".

---

## 9. Open questions for the owner

1. Switch the front-door plan from iframe to **theme mount (Option 3)**, keeping the iframe as fallback? (the handoff
   `accuphy-website/handoffs/2026-10-23-lab-store-page.md` would be revised, not rewritten)
2. Lean layout: may `layouts/lab.liquid` skip Taiga's stylesheet entirely (cleanest; any store element on that page is then
   ours to draw), or must the store's cookie banner/announcement bar remain?
3. Is a Vercel dependency at run time acceptable (loader + chunks served by Vercel on a store page), or should the runtime
   live on Shopify's CDN (Option 6b, needs the custom-app toolchain)?
4. Go-ahead for the Lab-side **mount build** (embed entry, loader, CORS, direct `Shopify.analytics.publish`/Klaviyo calls)?
5. Which items to test on the unpublished theme copy before deciding: Instagram/Facebook in-app browser height, Taiga app
   embeds on the lean layout, theme-editor preview with a cross-origin module script, Shopify's consent gating of pixels in
   the markets you sell to.

## Unverified list (for the test plan)
App Proxy size/timeout limits, UTM forwarding and `/en-us/apps/…`; theme-app-extension asset limits; `_fbp` scope across
`*.accuphy.com`; Shopify page editor keeping `<script>` after re-save; theme editor preview with cross-origin module
scripts; actual in-app-browser viewport behaviour of the lean layout.

## Sources (search excerpts only; pages themselves were not fetched)
- https://shopify.dev/docs/apps/build/online-store/display-dynamic-data (app proxies: content types, params, headers)
- https://shopify.dev/docs/apps/build/online-store/app-proxies/authenticate-app-proxies
- https://shopify.dev/docs/apps/build/purchase-options/customer-portal (full-page proxy rendering recommended)
- https://shopify.dev/docs/api/shopify-app-remix/latest/authenticate/public/app-proxy.md (`layout` option)
- https://community.shopify.dev/t/using-app-proxy-with-response-liquid-loads-the-header-and-footer-before-loading-the-proxy-html-and-styles-causing-a-glitch-in-appearance/24153
- https://community.shopify.dev/t/caching-app-proxy-liquid-response/29426
- https://community.shopify.com/t/why-is-my-app-proxy-speed-significantly-slower-than-the-server-response-time/30176/1
- https://community.shopify.com/t/shopify-app-with-js-and-proxy-performance/37437
- https://community.shopify.com/t/app-proxy-deforming-original-url-query-params/164965
- https://community.shopify.com/t/shopify-store-does-not-respect-the-defined-app-proxy/40988 ; https://community.shopify.com/t/localisation-with-app-proxy/7909 ; https://community.shopify.dev/t/app-proxy-configuration-not-automatically-updating-404-error-issue/13039
- https://shopify.dev/docs/apps/build/marketing/pixels.md (lax/strict sandboxes)
- https://shopify.dev/docs/api/web-pixels-api/emitting-data ; https://help.shopify.com/en/manual/promoting-marketing/pixels/custom-pixels/code
- https://community.shopify.com/t/shopify-trekkie-loading-extra-tracking-pixels/14993 ; https://community.shopify.com/t/is-that-possible-to-remove-browser-js-or-change-to-another-cdn/160657
- https://shopify.dev/docs/storefronts/themes/architecture/limits ; https://shopify.dev/docs/storefronts/themes/tools/theme-check/checks/asset-size-app-block-javascript
- https://community.shopify.dev/t/theme-app-extensions-vs-sections-file-size-settings-limitations/9879 ; https://community.shopify.com/t/why-is-there-a-100-kb-limit-on-theme-app-extension-files/188314
- https://www.shopify.com/partners/blog/theme-app-extensions ; https://community.shopify.dev/t/theme-app-extension-js-updated-but-storefront-ui-only-changed-after-reinstalling-the-app/34651 ; https://community.shopify.dev/t/releasing-a-new-version-from-the-dev-dashboard-breaks-the-extension-when-using-a-custom-version-name/32932
- https://community.shopify.com/t/use-react-in-app-block-theme-extension/175347 ; https://community.shopify.com/t/bug-shopify-page-editor-stripping-stylesheet-links-from-page-source/32647
- https://docs.ams.report-uri.com/md/platforms/shopify.md ; https://community.shopify.com/t/creating-a-content-security-meta-tag-that-works-with-shopify/181585
- https://developers.klaviyo.com/en/docs/getting-started-with-track-and-identify-apis ; https://help.klaviyo.com/hc/de-de/articles/115005076767-Guide-to-Klaviyo-Web-Tracking ; https://community.klaviyo.com/marketing-30/why-is-klaviyo-slowing-down-the-site-load-on-pages-without-a-sign-up-form-443
- https://weltpixel.com/blogs/news/meta-pixel-through-gtm-on-shopify-why-match-quality-drops ; https://www.cometly.com/post/safari-blocking-tracking-pixels ; https://www.aimerce.ai/blogs/4-meta-tracking-mistakes
- https://developer.apple.com/forums/thread/133248 ; https://developer.apple.com/forums/thread/770080 ; https://bugs.webkit.org/show_bug.cgi?id=193078 ; https://onbugs.webkit.org/show_bug.cgi?id=265438
- https://bugs.webkit.org/show_bug.cgi?id=266835 ; https://developer.apple.com/forums/thread/803987 ; https://community.fabric.microsoft.com/t5/Developer/Powerbi-embedded-iframe-IOS-scrolling-issues/td-p/5157894
- https://chromium.googlesource.com/chromium/src/+/master/docs/speed/metrics_changelog/2020_11_lcp.md
- https://discourse.threejs.org/t/three-js-not-working-using-linkedin-in-app-browser-on-ios/39476 ; https://sdtimes.com/apple/guest-view-hybrid-app-developers-love-new-ios-8/3
- https://blog.weaverse.io/blogs/shopify-headless-pricing ; https://www.askphill.com/shopify-hydrogen-remix/ ; https://www.charle.co.uk/articles/shopify-hydrogen-oxygen/
- https://vercel.com/kb/guide/vercel-reverse-proxy-rewrites-external ; https://stape.io/helpdesk/documentation/same-origin-domain-configuration-for-shopify
- Repo: `docs/decisions.md` #102/#133/#134, `docs/shopify-embed-feasibility.md`, `docs/backlog.md`, `scripts/build-share.mjs`, `src/experiments/2026-09-23-sonar-lake-3d/signup.js`
