# UI rules for every screen size and browser (2026-10-24)

Jason (2026-10-24): "适合这个项目的各种屏幕大小和浏览器的ui规则你调研一下". Research only: nothing here is built until
Jason says go. It pulls together what the project already decided (#47, #78–#84, #119, #141, #142, #150), what the
store's and Meta's data say about who opens the Lab, current screen and browser statistics, and the browser bugs we
know of. Each rule says whether the Lab meets it today (✅) or not (⬜).

## 中文摘要（给 Jason）

1. **谁来看：** 商店 68% 的访客用手机；从 Facebook/Instagram 广告点进来的，91–99% 在 Meta 自带的浏览器里，
   其中 63–82% 是 iPhone。加拿大手机上 Safari 约占 51–56%，Chrome 约 37–43%，三星浏览器约 3.5%。
   最常见的手机屏幕是 iPhone 的 414×896、375×812、390×844；电脑最常见 1920×1080，其次 1536×864。
2. **按屏幕分 6 类，每类一套规则：** 竖屏手机、横屏手机、折叠屏和小平板（新加的一类）、平板和笔记本、
   台式大屏、超大屏。另外，嵌在商店页面里时，要按页面里那块区域的大小来判断类别，而不是整个浏览器窗口。
3. **最大的缺口是"中间尺寸"**（折叠屏展开、iPad 竖放，宽 640–1023 像素）：现在直接套用电脑版布局，
   面板占得太多、按钮太小、不好点（今天的折叠屏问题就出在这里，只是临时修好了）。建议给这一类单独做紧凑布局：
   面板可以收起，步骤卡片收到底部。
4. **能点的东西至少 44 像素：** 凡是触屏设备（包括 iPad 和折叠屏），按钮都要至少 44 像素高。现在面板按钮只有约 25 像素。
5. **超大屏（27 寸 2K 以上）：** 面板、卡片、手机都是固定像素，看起来偏小。建议在超大屏上整体放大约 1.25 倍。
6. **浏览器规则：**
   - **Safari（含所有 iPhone 浏览器和 Meta 内置浏览器）：** 不用会变黑的浮点贴图（已做到）；底部按钮要留出安全区；
     页面高度不能依赖 `100vh`/`dvh`，Meta 内置浏览器里这些单位会出错。
   - **三星浏览器和 Chrome 的"强制深色模式"：** 可能把画面颜色反转，要加一行声明关掉（现在没有）。
   - **显卡掉线：** 手机切后台或内存不够时，画面可能变黑且不会自己恢复，要能自动恢复（现在没有）。
7. **外部规范怎么说：** 谷歌 Material 3 按宽度分 5 档（600 / 840 / 1200 / 1600），高度分 3 档（480 / 900）；
   苹果分"紧凑 / 常规"两档（iPhone 竖放是紧凑，iPad 是常规）；微软分 3 档（640 / 1008）。三家都强调：
   按"程序实际拿到的空间"分类，而不是按屏幕；都有一个"不是手机也不是电脑"的中间档；高度要单独看。
   我们现在恰恰缺中间档。
8. **同类网站怎么做：** 汽车配置器、地图、专业三维查看器的共同做法：主体（车、地图、模型）始终在中间，
   操作放边上；手机上画面在上、选项在下半屏；需要一边操作一边看的，用"可收起的底部面板"
   （展开时也不挡主体），大屏才改成侧边面板；放不下的按钮收进"更多"。
9. **浏览器支持：** 按区域大小分类的写法（容器查询）2025 年起所有主流浏览器都支持；
   `dvh` 这类高度单位支持率约 95%，但在 Facebook 内置浏览器里有问题；关掉强制深色的声明，Chrome 和三星浏览器都认；
   iPhone 内存不够时可能直接把页面杀掉、不给任何提示，所以除了能自动恢复，还要控制显存占用。
10. **每次发版要测的组合：** 列了一张表（第 6 节），包括 iPhone 的 Safari 和 Instagram 内置浏览器、安卓 Chrome、
   折叠屏、iPad、笔记本、24 寸和 27 寸屏。
11. **建议先做的三件事（等你决定）：** ① 中间尺寸的紧凑布局和 44 像素按钮；② 显卡掉线自动恢复 + 关掉强制深色；
   ③ 嵌入商店时按区域大小判断屏幕类别。

---

## 1. Who opens the Lab

| Fact | Number | Source |
|---|---|---|
| Store sessions on phones (last 90 days) | 68 % (20,388 of ~29,800) | `accuphy-website/docs/site-audit.md` §5 |
| Facebook / Instagram ad and post visits inside Meta's in-app browser | 91.5 % / 99.2 % (365 days) | Drive: `2026-10-23 Which browser opens ad and email links (EN).md` |
| iOS share of Meta in-app browser visits | 63–82 % | same |
| Average Meta in-app visit length | 44–54 s | same |
| Canada mobile browsers (StatCounter, Jun–Jul 2026) | Safari 51–56 %, Chrome 37–43 % (Android 35 %, iPhone 7 %), Samsung Internet 3.5 %, Firefox 1 % | [StatCounter mobile CA] |
| Canada mobile screens (CSS px, Jun 2026) | 414×896 19 %, 375×812 13 %, 390×844 13 % (all iPhones) | [StatCounter res mobile CA] |
| Canada desktop screens (Jun 2026) | 1920×1080 21 %, 1536×864 8 % (a 1920 laptop at 125 %) | [StatCounter res desktop CA] |
| Foldables | Galaxy Z Fold 7 inner screen ≈ 984×1092 CSS px (dpr 2); Jason's vivo fold in Chrome: 711×584 at dpr 3.25 (measured 2026-10-24) | [yesviz Fold7]; our device test |

What follows from it: the typical first visit is an **iPhone, portrait, inside Instagram or Facebook, for under a minute**.
Every iPhone browser (Safari, Chrome for iPhone, Meta's in-app browser) is WebKit, so WebKit rules are the hard floor.
Desktop visitors mostly come from search and email and sit at 1366–1920 px wide.

## 1b. What the established design systems say

| System | Width classes | Height classes | Notes |
|---|---|---|---|
| **Google Material 3** (Android, also used for the web) | compact < 600 dp · medium 600–839 · expanded 840–1199 · large 1200–1599 · extra-large ≥ 1600 (desktop) | compact < 480 · medium 480–899 · expanded ≥ 900 | the class picks the layout ("canonical layouts"); classes come from the **window**, not the device [M3 window classes] |
| **Apple** (iOS/iPadOS size classes) | compact or regular per axis | compact or regular | every iPhone in portrait is compact width; iPads are regular; big iPhones turned sideways become regular width; touch targets 44 × 44 pt [Apple size classes] |
| **Microsoft** (Windows apps) | small < 640 · medium 641–1007 · large ≥ 1008 (effective px) | — | "design for the space available to your app (the app's window), not the screen size" [MS breakpoints] |
| **Tailwind** (what the Lab's CSS uses) | sm 640 · md 768 · lg 1024 · xl 1280 · 2xl 1536 | — | the Lab uses `sm:` (panel) and `md:` (step cards) today |

The three systems agree on three things the Lab should copy: (1) classes come from the space the app actually gets,
which for us is the mount box in the store page; (2) there is a middle class (Material medium/expanded 600–1199, Microsoft
medium 641–1007, Apple regular-width iPad) that is neither phone nor desktop — the Lab has none, which is exactly where the
fold went wrong; (3) height is its own axis (Material compact height < 480 ≈ our sideways-phone test `height < 500`).

## 1c. How comparable interactive pages lay out

- **The object stays the hero, controls go to the edge.** Mobile-first car configurators (Demodern's smart configurator)
  keep the car centred with a reduced interface and use step-by-step navigation and card swipes on phones; designs that
  started on desktop are criticised as cluttered on phones [Demodern smart]; [Magebit configurators].
- **Phones: picture on top, choices in the bottom half.** The common configurator pattern keeps the visual changes in the
  top half and the option strip in the bottom half [Dribbble configurator]. The Lab's class A already does this (lake on
  top, the phone display at the bottom).
- **A canvas you keep using → a standard (non-modal) sheet.** Material: a standard bottom sheet leaves the rest of the
  screen usable (the map example: read a place while still panning); the newer expanding sheet starts collapsed and grows
  on demand; on larger screens the same content moves to a side sheet [M3 bottom sheets]. This is the pattern for the
  Lab's class C panel: a collapsed pill or bottom sheet that never covers the boat, a side panel only from class D up.
- **Professional 3D viewers** (Trimble Connect, AVEVA, DELMIA) change the toolbar placement at width breakpoints, hide
  the tools that do not fit behind a drag or a "more" control, and let side panels collapse with a tap or swipe; one
  finger pans, two fingers rotate or zoom [Trimble responsive]. The Lab's drag-the-boat is one finger; it should never
  need two-finger gestures.

## 1d. Browser support for what the rules need

| Feature | Support | Use in the Lab |
|---|---|---|
| CSS container queries | Baseline "widely available" since Aug 2025; ~93 % of users already in Nov 2024; Safari 16+, Chrome/Edge 105+, Firefox 110+, Samsung Internet 20+ [container queries] | classes from the mount box (rule in §2) |
| `dvh`/`svh`/`lvh` units | ~95 % (early 2026) but broken in Facebook's in-app browser (WebKit 255852) | do not rely on them; `fixed inset-0` + `innerHeight` |
| `color-scheme` meta (opt out of forced dark) | Chrome (Auto Dark Theme opt-out), Samsung Internet 13.2+ [Chrome auto dark]; [Samsung dark mode] | declare `dark` |
| WebGL2 + MSAA render targets | every current browser we tested (headless Chromium/WebKit, real Mali GPU) | ✅ |
| `webglcontextlost` / restored | all browsers, but iOS can kill a heavy page for memory with **no** event first (WebKit 300782) [WebKit 300782] | handle the events **and** keep GPU memory low (dpr cap, few large targets) |
| DevTools phone emulation | does not simulate mobile GPU limits [R3F mobile] | real devices for frame rate and memory |

## 2. Screen classes

Mapped to the standards above: A = Material compact / Apple compact width; B = compact height (< 480–500); C = Material
medium–expanded, Microsoft medium, iPad portrait; D–E = Material large / extra-large, Microsoft large; F = a split of
Material's extra-large that the Lab needs only because its UI is drawn in fixed pixels. The Lab's 640 px edge matches
Microsoft and Tailwind `sm`; 1024 matches Tailwind `lg` and an iPad turned sideways.

Decide the class from the **Lab's own box** (the element it is mounted in), not from `window`. Standalone, the box is the
window; mounted in the store page (#142) it is the section. Today every check reads `window.innerWidth/innerHeight`
(`isPhoneLayout`, `isLandscapePhone`, Tailwind `sm:`/`md:`) — ⬜ switch to a `ResizeObserver` on the mount element and CSS
container queries before the store mount goes live.

| Class | Detected by (box size, CSS px) | Typical devices | Layout |
|---|---|---|---|
| **A. Phone, portrait** | width < 640 | every iPhone (375–430 wide), Android 360–412 | ✅ #78–#81, #119: lake band on top, the phone display full width at the bottom (12 px gutter + safe area), app controls 1.55×, no glass panel, no step cards, Home first |
| **B. Phone, sideways** | wider than tall and height < 500 | the same phones turned | ✅ lake page #141: the app itself full screen with a lake inset; ⬜ the ice page keeps its desktop-like layout (the ice chat's to do) |
| **C. Compact: fold, small tablet, small window** | 640 ≤ width < 1024, or height < 700 with width ≥ 640 | unfolded folds (711×584, 984×1092), iPad portrait (768–834 × 1024–1194), a half-screen laptop window | ⬜ today it gets the full desktop layout: the 400 px panel covers a third to half of the screen and its buttons are ~25 px. Proposal: panel collapsible to a 44 px pill (Device · View · Range in one row when open), step cards as a bottom sheet or hidden, phone frame 42 % (#150) or 48 % on portrait tablets, the view kept clear of the panel (#150 ✅) |
| **D. Tablet landscape and laptop** | 1024 ≤ width < 1600 | iPad landscape 1024–1366, laptops 1280–1536 | ✅ the current desktop layout: panel 400 px top-left, step cards top-right (lake) or under the panel (ice), phone `min(42vw, 600px, 83.2vh)` (#84 / #150) |
| **E. Desktop** | 1600 ≤ width < 2200 | 1920×1080 monitors | ✅ as D; the phone stops at 600 px (≈ real size on a 24″ monitor) |
| **F. Large** | width ≥ 2200 (CSS px) | 27″ 2560×1440 at 100 %, ultrawide | ⬜ everything is fixed px, so panel, cards and phone shrink to 16–23 % of the width. Proposal: scale the UI layer 1.25× (panel, cards, hint, phone cap 750 px) from 2200 px, 1.5× from 3200 px |

Rules for all classes:
- **The boat (or the ice kit) is never under UI.** ✅ #150 shifts the view clear of the panel; ⬜ also keep it clear of the
  phone frame and the step cards on C-class screens.
- **The drag hint never covers UI.** ✅ #150 (`data-hint-avoid`).
- **No horizontal scroll, no page zoom, no rubber-band.** ✅ `fixed inset-0`, `touch-none`, `overscroll-behavior: none`.
- **Orientation changes and window resizes re-layout live** without a reload. ✅ for the canvas and the frame (#112 gate
  `live = started || !phone`); ⬜ re-check A ↔ B ↔ C switches on a real fold (fold / unfold changes the class mid-session).

## 3. Sizes

| Item | Rule | Today |
|---|---|---|
| Phone frame (desktop-like classes) | `min(42vw, 600px, 83.2vh)`, one rule for lake and ice | ✅ #150 |
| Phone display (class A) | full width minus 2 × 12 px, aspect 2.08:1, above the home indicator | ✅ |
| Glass panel | 400 px (D, E); collapsible pill (C); 1.25× (F) | ⬜ C and F |
| Touch targets on touch screens (`pointer: coarse`) | ≥ 44 × 44 px (Apple HIG 44 pt, Material 48 dp; WCAG 2.2 minimum 24 px) | ✅ class A app controls (#79); ⬜ panel buttons ~25 px and the 4 px range track on iPads and folds |
| Text | ≥ 11 px on screen; body 12.5–14 px | ✅ mostly (11 px labels) |
| Hover-only cues | never the only way to find something on touch screens | ✅ |
| Safe areas | `viewport-fit=cover` + `env(safe-area-inset-*)` on anything at an edge | ✅ meta tag in both HTML files; ✅ class A frame; ⬜ check B on a real iPhone (#141 open item) |

## 4. Browsers

**WebKit (every iPhone browser, Mac Safari, Meta's in-app browser on iPhone)**
- ✅ Never sample a `FloatType` texture with `LinearFilter` — it reads black (#73, `lessons.md`). Float + Nearest,
  HalfFloat + Linear and 8-bit + Linear are fine. The MSAA echo targets (#145) are 8-bit: checked in headless WebKit.
- ⬜ Do not size anything from `100vh`/`dvh`/`svh` alone: in Facebook's in-app browser all of them collapse to the current
  height and reflow on scroll (WebKit bug 255852); iOS 26 also has fixed-bottom bugs (content under its floating bar is
  cut off; a blank strip the size of the home-indicator inset, fixed in 26.1; `visualViewport.offsetTop` not resetting
  after the keyboard). Use `position: fixed; inset: 0` (✅ today) and read `window.innerHeight` /
  `visualViewport` on resize for anything computed; keep bottom controls above `env(safe-area-inset-bottom)` + 8 px.
- No full-screen API on iPhone or in Meta's in-app browsers (`embed-options.md`): never offer a full-screen button there.
- ⬜ WebGL context loss: iOS drops the GPU context under memory pressure or after the tab is backgrounded; the picture
  goes black for good unless `webglcontextlost` is handled (prevent default, show the poster) and `webglcontextrestored`
  rebuilds the render targets. Today nothing handles it.
- Meta injects its own script into pages in the in-app browser (2022 evidence) and autofills forms: keep the sign-up
  field `type=email autocomplete=email`.

**Chromium (Chrome, Edge, Samsung Internet, Meta's in-app browser on Android)**
- ⬜ Samsung Internet's and Chrome's "force dark" can invert or tint a page that does not declare a colour scheme. The
  Lab is dark by design: declare `<meta name="color-scheme" content="dark">` (or `:root { color-scheme: dark }`) so
  nothing gets auto-darkened. Today neither is set.
- WebGL2 and MSAA: ✅ checked on a real Mali-G1-Ultra (vivo fold, Chrome 152, 60 fps).
- Facebook on Android uses Meta's own Chromium WebView (since 2022); Instagram's engine on Android is unconfirmed.

**Firefox (≈ 1 %)**: WebGL2 fine; test once per major layout change.

## 5. Performance tiers

| Tier | When | Settings |
|---|---|---|
| High | desktop, recent phones (60 fps measured on the fold) | dpr cap 1.5 (✅ `Canvas dpr={[1, 1.5]}`), MSAA echo targets, full fish |
| Low | cheap Android (V10: 10–24 fps before #145), or the frame rate stays < 30 fps for 3 s | ⬜ dpr 1, no canvas antialias, echo targets without MSAA, half the fish, no wake/clutter — Phase 4 quality tiers, not built |

Show something useful while the 2.6 MB bundle loads (Meta visits last < 1 min): ⬜ a light poster frame with the
headline and the sign-up field (the Drive study's recommendation).

## 6. Test matrix (every public release)

| # | Size (CSS px) | Browser | How |
|---|---|---|---|
| 1 | 390×844 | WebKit (iPhone Safari) | headless WebKit ✅; real iPhone ⬜ |
| 2 | 390×844 | Instagram and Facebook in-app, iPhone | real phone only ⬜ (link in a DM to yourself) |
| 3 | 412×915 / 360×800 | Android Chrome, cheap phone | V10 tablet or a cheap Android ⬜ |
| 4 | 844×390 | WebKit + Chromium, sideways | headless ✅ |
| 5 | 711×584 and 984×1092 | Chrome on a fold | real fold ✅ (2026-10-24) |
| 6 | 768×1024 and 1024×768 | iPad Safari | headless WebKit ✅; real iPad ⬜ |
| 7 | 1366×768, 1440×900, 1536×864 | Chrome, Safari | headless ✅ |
| 8 | 1920×1080, 2560×1440 | Chrome | headless ✅ |
| 9 | the store page mount | the same 1, 4, 7 inside the theme copy | ⬜ (#142, not deployed) |

Each run: no console errors; the picture renders (not black); the boat / kit and the hint clear of every UI box; touch
targets ≥ 44 px on touch sizes; frame rate on real devices. The `sonar-qa` skill covers rows 1, 4, 6–8 headlessly.

## 7. Gaps, most important first (none built — waiting for Jason)

1. **Class C compact layout** (folds, iPad portrait, small windows): collapsible panel, cards as a sheet, 44 px targets.
2. **WebGL context loss recovery** + **`color-scheme: dark`** (cheap, prevents a black or inverted picture).
3. **Classes from the mount box, not the window** (container queries / `ResizeObserver`), before the store mount.
4. **Height from `innerHeight`/`visualViewport`, bottom controls above the safe area** — verify on a real iPhone in
   Safari and Instagram (iOS 26).
5. **Class F scale-up** (≥ 2200 px).
6. **Low performance tier** for cheap Android (Phase 4) and a loading poster.
7. Ice page, sideways phones (the ice chat's).

## Sources

- [StatCounter mobile CA] https://gs.statcounter.com/browser-market-share/mobile/canada
- [StatCounter res mobile CA] https://gs.statcounter.com/screen-resolution-stats/mobile/canada
- [StatCounter res desktop CA] https://gs.statcounter.com/screen-resolution-stats/desktop/canada
- [yesviz Fold7] https://yesviz.com/devices/samsung-z-fold7/
- iOS 26 fixed-bottom reports: https://developer.apple.com/forums/thread/800798 ; https://bugs.webkit.org/show_bug.cgi?id=300523 ;
  https://developer.apple.com/forums/thread/799216
- Meta in-app browser behaviour, viewport bug, Apple Pay, autofill: Drive `Market Research/2026-10-23 Which browser opens
  ad and email links (EN).md` (WebKit bug 255852, Krause 2022, Meta help pages) and `docs/embed-options.md`.
- Touch targets: Apple Human Interface Guidelines (44 pt), Material Design (48 dp), WCAG 2.2 SC 2.5.8 (24 px).
- [M3 window classes] https://developer.android.com/develop/ui/views/layout/window-size-classes ;
  https://developer.android.com/develop/ui/compose/layouts/adaptive/window-size-classes
- [Apple size classes] https://developer.apple.com/videos/play/wwdc2017/812
- [MS breakpoints] https://learn.microsoft.com/en-us/windows/apps/design/layout/screen-sizes-and-breakpoints-for-responsive-design
- [Demodern smart] https://www.demodern.de/en/projects/smart-web-configurator
- [Magebit configurators] https://magebit.com/blogs/designing-user-friendly-product-configurators-for-automotive-merchants
- [Dribbble configurator] https://dribbble.com/shots/5909186-Configurator-Redesign
- [M3 bottom sheets] https://material.io/components/sheets-bottom ; https://m1.material.io/components/bottom-sheets.html
- [Trimble responsive] https://help.trimble.com/en/trimble-connect/trimble-connect/connect-for-browsers-3d-viewer/getting-started-in-the-3d-viewer/responsive-layout
- [container queries] https://joshwcomeau.com/css/browser-support ; https://educative.io/courses/mastering-the-latest-features-in-css/support-and-future-of-container-queries
- [Chrome auto dark] https://developer.chrome.com/blog/auto-dark-theme
- [Samsung dark mode] https://developer.samsung.com/internet/blog/en/2020/12/15/dark-mode-in-samsung-internet
- [WebKit 300782] https://bugs.webkit.org/show_bug.cgi?id=300782
- [R3F mobile] https://www.technetexperts.com/react-three-fiber-skinnedmesh-mobile-fix/
- Not verified (single secondary source): the ~95 % `dvh` figure; the Fold 7 viewport (third-party database).
