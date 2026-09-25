# accuphy.ca / shop.accuphy.com — site audit (2026-09-25, read-only)

Jason: "我现在需要你仔细去看一下我们的网站 … 对我们的工具使用 多语言国家的制作方式 历史 现在网站的
明显问题 都通盘去了解我才敢让你之后尝试". Nothing was changed. Sources: the Shopify Admin API
(the Shopify connector in Claude Code, read-only queries), the live storefront in a real
browser (desktop 1440×900 and phone 375×812), page HTML, DNS, the Wayback Machine, and the
earlier notes of the Shopify US chat (its memory + `备忘录-PingLive-Mini-库存显示修复-2026-07-18.md`).

## 1. The map

| Address | What it is |
|---|---|
| **shop.accuphy.com** | The Shopify store — the real website for North America and Europe. Store "Accuphy", `bhuekt-nw.myshopify.com`, plan **Advanced**, base currency **CAD**, Canada. |
| accuphy.ca, www.accuphy.ca | 301 to shop.accuphy.com (homepage only — deep links break, see §6). Until mid-2025 accuphy.ca *was* the store's address (Wayback, incl. `/fr`). |
| account.accuphy.ca | Customer accounts (linked from the account menu). |
| **www.accuphy.com** | A different site: Chinese-language WordPress + Elementor on Alibaba Cloud, owned by 北京精相科技有限公司 (ICP 京ICP备15004512号), mail on Alibaba. Links to "Global Shop" = shop.accuphy.com. Archived since 2018. |
| partner.accuphy.ca | The Partner Portal (Vercel) — separate project. |

Consequence for the lab: a sub-domain like `lab.accuphy.com` needs DNS on the Beijing
company's domain. `lab.accuphy.ca` (or a page on shop.accuphy.com) is under Canadian control.

## 2. Tools in use

- **Theme:** Taiga 3.8.0 (theme store 1751). Live: "Taiga — US no old router" (ID 156680585389,
  last edited 2026-09-23). **12 themes** in total: 10 old drafts + Shogun's dev theme.
- **Shogun** page builder: the homepages and many sections are Shogun-generated
  (`sections/shogun-custom-*`); editing those files by hand can be overwritten from Shogun.
- **Globo Mega Menu** renders the real top menu. Its publish is bound **per theme**: after any
  theme publish it must be re-published to the new theme, or PingLive Mini disappears from the
  menu (happened 2026-07-18). The native Shopify "Main menu" does not contain PingLive Mini.
- Seen in the storefront code (the app list itself is not readable with our API access):
  **Klaviyo** (email), **Weglot** + **T Lab AI Language Translate** + a "content translation"
  app (three translation tools on top of Shopify's own languages), **UpPromote** and
  **Secomapp** (two affiliate apps; the gift widget), **Globo Pre-order**, **Region
  Restrictions**, **Blockify fraud filter**, **Synctrack**, **Affirm** (financing), a
  wholesale app (`/pages/ws-*`, Wholesale registration), a chat widget, Shop Pay.
- **Products:** PingLive Sonar (9 in stock), PingLive Mini (65), 0° Mount (19); KingFisher 10
  as a draft product. Blog "News": 22 articles. 48 pages. Only **3 URL redirects**.

## 3. Countries and languages — how it is built

Shopify **Markets** with sub-folders on shop.accuphy.com; languages are Shopify locales
(en primary; de, es, fr, nl, ro). Page content per market comes from theme **context templates**
(`templates/*.context.us.json`, `.ca`, `.france`, `.romania`, `.benelux` …), so one change
often has to be made in several files.

| Market | Countries | Currency | Address and languages |
|---|---|---|---|
| Canada (primary) | CA | CAD | root `/` — **English only** |
| United States | US | USD | `/en-us` |
| France | FR | EUR | `/fr-fr`, `/en-fr` |
| Germany | DE | EUR | `/de-de`, `/en-de` |
| Benelux | BE, NL | EUR | `/nl-benelux`, `/fr-`, `/de-`, `/en-benelux` |
| Luxembourg | LU | EUR | no own address |
| Romania | RO, LV, LT, EE | EUR | `/ro-ro`, `/en-ro` |
| Paraguay | PY | USD | `/es-py`, `/en-py` |
| International | UK, AU, JP, Nordics, IT, ES, PL… (22) | CAD | **Draft — these countries cannot buy online** |

## 4. History (as far as the records show)

- 2018 → www.accuphy.com exists (Chinese company site).
- Dec 2024 – Jan 2025: Shopify store set up (Dawn installed 2024-12-26, Taiga 2025-01-10);
  address accuphy.ca; French added by 2025-10.
- 2025: Shogun pages, FAQ pages (all edited 2025-07-08), Klaviyo, wholesale (2025-12).
- Mid 2025 → primary address moved to shop.accuphy.com; accuphy.ca redirects.
- 2026: Accuphy Sonar App 1.6 → 2.0 updates on the homepage; market fixes in June; US theme
  fixes on 18–19 July (sold-out text, old router block); retail-location pages for RO/FR in Sept.

## 5. Traffic and sales (Shopify analytics)

| Last 90 days | Sessions | Conversion |
|---|---|---|
| United States | 12,988 | 0.21 % |
| Canada | 6,825 | 0.42 % |
| Germany / France / Poland / China / Finland / Russia / Japan … | 400–1,200 each | 0 % |
| **Phone** | 20,388 (68 %) | 0.20 % |
| Desktop | 9,423 | 0.17 % |

Last 12 months, online orders: Canada 259 orders (CA$292k), US 97 (CA$70k), almost nothing
elsewhere (Europe sells through distributors).

## 6. Obvious problems, most important first

1. **The pages are extremely heavy.** Homepage: **58 MB, 371 requests** (four product videos of
   4–17 MB each load at once, plus 2 MB screen-recording GIFs). PingLive Mini page: 33 MB, 425
   requests. On a phone connection this is slow and costly — and 68 % of visitors are on phones.
   Several video boxes show as black rectangles until loaded.
2. **Wrong or conflicting specs on the PingLive Mini page.** Router One spec still says
   "Power Input: **10–18 VDC**" (correct: 11–18 VDC, decided 2026-07-02); a comparison block says
   "**100 ft** Wi-Fi Range" while the Router One block says 70 ft (70 ft is correct, 2026-07-19).
3. **Broken links.** The Help & Support menu's "Quick Set Up Guide" goes to
   `/blogs/news/setup-guide-for-pinglive-sonar` → **404**. Old accuphy.ca deep links and old
   handles (`pingaio-sonar`) → 404; there are only 3 redirects.
4. **Language mess.** On `/fr-fr` the menu is French but the hero stays English, and a raw
   "Translation missing: fr.Pays/région" is visible. Three translation apps run on top of Shopify's
   languages, with two language switchers (the globe icon and Weglot's "EN" box). The page's
   hreflang list has a broken entry (`fr-ca` → `https:///`). Canada has no French version.
5. **Fragile structure.** The Mini's place in the menu depends on Globo being re-published after
   every theme change; five homepage-like Shogun pages are published (incl. "OLD …", "Copy of Copy
   …"); 19 FAQ pages each have their own template; 10 stale draft themes; "In Stock" is
   hard-coded for PingLive Sonar.
6. **Phone layout collisions.** Weglot's "EN" box sits on the hero headline; the gift (affiliate)
   bubble and the chat bubble cover content at the bottom corners.
7. **SEO basics.** The homepage's only H1 is "GET APP FEATURE UPDATES FIRST!" (the newsletter
   block); 6 of 29 homepage images lack alt text.
8. **International market is a draft**, so visitors from the UK, Australia, the Nordics, Japan etc.
   (hundreds of sessions each) cannot check out — may be deliberate (distributors); worth a
   conscious decision and a clear "where to buy" path for them.

## 7. What this means before Claude touches anything

- **Access:** the Shopify connector reads markets, themes, content, products and analytics; it can
  duplicate a theme and write files into an **unpublished copy**; publishing the live theme is
  blocked for it and is done in the admin (Chrome, keyboard navigation in the Shopify iframes). The
  app list is not readable.
- **Safe way to change anything:** duplicate the live theme → edit the copy → preview with
  `?preview_theme_id=` in every market that uses the file → publish → **re-publish Globo Mega
  Menu to the new theme** → keep the previous theme as the rollback.
- **For the lite section:** the site's weight problem is the strongest argument for the section's
  ≤ 90 KB budget and for a poster-first load; it must be added per market template (context files),
  and its words must go through Shopify's own translations, not Weglot.
