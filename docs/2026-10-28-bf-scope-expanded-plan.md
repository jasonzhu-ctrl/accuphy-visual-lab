# BF scope expanded: what it means for the Lab (X-14L, Lab HQ, 2026-10-28, plan only)

Source: CHIEF's handoff `handoffs/2026-10-28-bf-scope-expanded.md`. Jason (10-28, IT-HR chat): Meta, YouTube, maybe
Google Ads from 11-02 to Canada, the US and the European countries with a distributor, each with its own language version
of the live page and the ad videos. Not decided yet (CHIEF asks Jason; this plan does not guess): budget, Google Ads,
HU/RS/EE, and whether 11-02 is everything at once or Canada + US first.

## Where the Lab stands today (10-28)

- **Pages:** Both `/`, Mini `/mini/`, Ice `/ice/` on lab.accuphy.ca (9ed9341). Two languages: English, and French with
  `?lang=fr` (website-reviewed, #159). Units default to **feet**; a visitor can switch.
- **Store:** shop.accuphy.com/pages/lab and /fr/pages/lab frame lab.accuphy.ca/. Store locales are en, de, es, fr, nl, ro.
  **There is no Polish or Latvian locale.** Poland is in the "International" market, which **cannot buy online**. Latvia
  is in the Romania market (EUR, en/ro pages).
- **Fonts:** the #180 subsets cover Latin and Latin-1 only. German and Dutch are fine. **Polish and Latvian letters
  (ą ć ę ł ń ś ź ż, ā č ē ģ ī ķ ļ ņ š ū ž) are missing** and would fall back to a system font. The subsets must be re-cut
  with Latin Extended-A (a few KB more).
- **Ad:** the PingLive v3 film (15 s) exists in English, 9:16 and 4:5, plus clean versions with no type. Jason asked for
  changes and has not said which yet. **The US cannot use it:** PingLive is not sold there before February. The US needs a
  PingLive Mini film.

## What each market needs

| Market | Device | Lab page | Ad |
|---|---|---|---|
| Canada | PingLive + Mini | `/` EN, FR (exist) | PingLive v3, EN + FR |
| US | **Mini only** | `/mini/` EN, feet (exists) | **a new Mini film**, EN |
| France, Belgium (FR) | both | `/?lang=fr`, metres | PingLive v3, FR |
| Belgium (NL) | both | `/?lang=nl` (new), metres | PingLive v3, NL |
| Germany, Austria, Switzerland | both | `/?lang=de` (new), metres | PingLive v3, DE |
| Poland | both | `/?lang=pl` (new), metres; **no store locale, can't buy online** | PingLive v3, PL |
| Latvia | both | `/?lang=lv` (new), metres; store = Romania market, EN | PingLive v3, LV |

## 11-02 must have / after 11-02

| 11-02 must have (if Jason confirms the market goes live on 11-02) | After 11-02 |
|---|---|
| **Canada EN + FR:** Lab done. Ad: Jason's changes, then a French type pass (~2 h once the FR lines are final). | YouTube / Google 16:9 versions (we have only 9:16 and 4:5) |
| **US:** Lab `/mini/` done. **Mini film:** record and compose on the PingLive template, ~1 day. Store: the `/en-us` Lab page must frame `lab.accuphy.ca/mini/` (website). | Mini films in other languages, if Mini is pushed in Europe too |
| **DE, NL, PL, LV Lab pages:** about 45 strings each. Code ~½ day for all four: language switch, store paths, metres by default outside North America, fonts re-cut. Translations: draft by HQ from the glossary, reviewed by the website HQ (rule #198), ~1 day turnaround. | The ice page `/ice/` in the new languages (the ice season starts later) |
| **DE, NL, PL, LV ads:** a type pass on the clean film per language, ~1–2 h each, 9:16 + 4:5. Lines from Klaviyo HQ (EN final), translated and reviewed with the page strings. | The old #168 BF clips (EN/FR) are superseded by v3; no new languages for them |

Realistic by 11-02, **if Jason answers the open points by 10-29 and the translations are reviewed by 10-31**: everything in
the left column. The tight one is the US Mini film. The safest order is Canada + US first, then the four European
languages as they clear review.

## What other projects must do

- **Website (accuphy-website HQ):**
  - Store Lab pages for de and nl (locales exist), each framing `lab.accuphy.ca/?lang=xx`.
  - The US page `/en-us/pages/lab` framing `/mini/`.
  - Poland and Latvia: no store locale. Either add pl and lv, or send PL/LV ads straight to `lab.accuphy.ca/?lang=pl|lv`
    with the Shop button going to the English store. **Poland can't buy online at all.** Is the PL ad meant to send people
    to the distributor (Prime Power)? This is a question for Jason via CHIEF.
  - Review the DE/NL/PL/LV page strings (#198), the same way as French.
- **Klaviyo (Klaviyo HQ):**
  - The final English ad lines, the sign-up form in the new languages, and lists or segments per country.
  - **EU consent:** the sign-up in the EU needs GDPR-style consent (Germany usually double opt-in). Klaviyo HQ decides how.
- **CHIEF / Jason:** the open points in the handoff, plus Poland (can't buy online) and whether Mini is pushed in Europe.

## Not done here

Nothing built, nothing live, no ads, no email. Building starts on Jason's 动 in Lab HQ.

## 中文摘要（给 Jason）

- **加拿大：** 页面现成（英、法）；广告等你说改哪里，改完再出法文版。
- **美国：** 只卖 Mini，Lab 有现成的 Mini 页；但广告片是 PingLive 的，美国用不了，要新做一条 Mini 片，大约 1 天。
- **欧洲 4 种新语言（德、荷、波兰、拉脱维亚）：**
  - **页面：** 每种约 45 句话要翻译，网站那边要审，大约 1 天。
  - **代码：** 一起改大约半天，包括欧洲默认用米、字体补上波兰和拉脱维亚字母。
  - **广告：** 每种语言换一层字幕，1–2 小时。
- **两个要你知道的问题：**
  - **波兰：** 商店里没有波兰语，而且波兰现在在“不能网上下单”的市场。投波兰的广告让人去哪买，要你定。
  - **拉脱维亚：** 商店里也没有拉脱维亚语。
- **11 月 2 日：** 只要你在 10 月 29 日前定下还没定的几点，翻译在 10 月 31 日前审完，上表左栏都能做完。最稳的是加拿大和美国先上，欧洲四种语言审完一个上一个。
