# Backlog — Sonar Beam Visualizer (kept current every round)

> 状态（2026-10-26 更新）
> 阶段：X-6L Lab 上线执行，目标 10-30 做完、10-31～11-1 真机测，11/2 广告开投；域名定为 lab.accuphy.ca（Jason，经总管）
> 进行中：湖面波纹 · 第 2 版做完（544316a，#163，只在本地）：斜纹没了，但比真实湖面暗、糊、没层次（HQ 看法）；湖面接免费的天空照片 + 水波法线图 · 做完（30c17d0，#162，只在本地，+154 kB，许可证在 assets/LICENSES.md），HQ 看过；湖面 B+C · 做完（e9505ae，#161，只在本地），HQ 看过对比图；真机帧率还没测（平板不在）；拖船提示停船后重新出现 · 做完（250016d，#160，只在本地），跟下一次上传一起上线；X-6L-fr Lab 法文版（?lang=fr）· 代码做完，HQ 核过（bfc43d6，#159）· 网站已核字表（eddba1a5），“手机网页端”照改，10-27 晚交 HQ 核，再请 Jason 说“动”上传；上线后复查 frame-ancestors（网站要在 myshopify 预览和主题编辑器里测，所以留着 *.myshopify.com、admin.shopify.com；网站不再需要时再收紧）；X-6L-2/3/4 · 代码做完，HQ 核过（#157，0f74eb7…4991453），按钮方案 B 已做完，HQ 核过（afc9af3，docs/2026-10-25-shop-button-final.jpg）；等 Jason 说“动”再上传 Vercel；#153 鱼回波 · 私密预览；冰钓页 · “冰钓版本视觉效果”
> 等 Jason：湖面波纹第 2 版的看法（docs/2026-10-26-lake-ripples-desktop.jpg）· 10-26 起；C 的船尾浪和 #91 去掉的“三条射线浪”要分清）· 10-26 起；做不做法文版（网站可以在框网址上加 ?lang=fr）· 10-26 起；#153 · 新鱼回波看法 · 10-24 起；#154 · Forward AUTO 深度留不留 · 10-25 起
> 卡住：无（网站在做店铺页 3 个文件和转交代码，交接单 `accuphy-website/handoffs/2026-10-23-lab-store-page.md`）
> 本周做完：X-6L Lab 上线 · https://lab.accuphy.ca 新版（按钮 B、accuphy:lab、/embed/）· docs/versions.md · HQ 自查（四个地址 200、头信息对、Vercel 显示配置正确），网站 HQ 也核过；网站预览里的框已经换成 lab.accuphy.ca；#102 Lab 上 Vercel · https://accuphy-lab.vercel.app（docs/versions.md）· HQ 自查（三页 200、头信息对、无报错），未经别的聊天核；#150–#156 · `docs/decisions.md` #150–#156 + 各自的提交 · 自称（还没别的聊天核过）

Jason 2026-09-24: "别把之前说过的任务丢了" — every promised task lives here until
it is done. ✅ done · 🔧 in progress · ⬜ open.

## Sonar screen (Phase 4)
- 🔧 (#153, on the local test page `#2026-10-24-sonar-fish-echo` — fish from their 3D bodies, smooth ping to ping; waiting for Jason's verdict) **Fish marks tremble (Jason 2026-10-24: 鱼还有不停的颤抖).** Measured at his spot (PLM Forward 90 ft, boat −12.3, 20.4, 45
  frames at 30 fps): every 1/8 s a mark gets new speckle, its outline swings 168–454 px (2–3×), brightness ±25 %, centre
  jumps up to 10 px — same on #128, #139 and #150, so it dates from #120 (per-ping speckle + ragged rim + `fl` flicker +
  tail wag + 0.2 s ghost). Proposal: blend ping to ping instead of jumping, calmer rim, smaller flicker. Waiting for Jason's go.
- ✅ (#154) **The far bottom vanished in Forward past 100–200 ft and turned into "一大群鱼" (Jason 2026-10-25).** A band along the real
  bottom now fills in from ~60 ft, softer and weaker with distance. ⬜ **Open for Jason:** at the phone start the bottom
  behind the island is deeper than the 25 ft AUTO depth (#41: AUTO follows the water under the boat) and leaves the screen
  at ~95 ft — keep (like the app) or let Forward AUTO keep the bottom ahead on screen?
- ✅ (#155) **The small wreck was too simple (Jason 2026-10-25).** A real workboat: decks at three levels, a wheelhouse with windows, rails, mast, gantry.
- ✅ (#156) **The lake surface looked odd (Jason 2026-10-25: 可能跟底部的纹理有关).** Wood-grain stripes on the lakebed removed; the water column
  tints the bottom (shallows clear, deep dark); a wind-sea surface with sky reflection.
- ✅ (#152, fixed: the rows' gaps are filled; holes 9.5 % → 2.3 % at the rocky spot) **Thick bottom bands turn into a net with holes since #148 (Jason 2026-10-24: 底部在某些区域很虚).** Deep or
  side-sloping bottom (his spots −5.4, −8.2 at 46 ft and 15, −2.2 at 30 ft with rocks): #128/#139 drew a solid band,
  #148's arc grain leaves dark holes between the arcs there; the thin shallow band is fine. The grain is the LiveScope
  chat's active work — who fixes it is Jason's call.
- ✅ AUTO depth on PL Forward: bottom kept at ~80 % of the screen in deep water; sound reaches the whole picture box; the 3D curtain = that box (decision #38)
- ✅ AUTO depth follows the depth readout under the boat, like the app, not the deepest bottom in the picture (decision #41)
- ✅ Shallow water no longer blows out: near-range gain on bottom and structure echoes (decision #42)
- ✅ Panoramic shows only what the 5°–25° beam covers; the curtain matches the picture box (decision #44)
- ✅ Panoramic background looks like sonar again: soft cross-beam speckle up to ~35 m, radial streaks only at long range, no weed clumps, soft shadows (decision #46)
- ✅ Faint Panoramic sidelobe near the boat (≈ 0.8 from 25°, gone by 60°), like the app's lake recordings
- ✅ Down View AUTO range: the range in use never leaves the bottom off screen; the phone shows AUTO when it is raised
- ⬜ Down / PLM views: the app also draws echoes out to the screen corners beyond the range (PL Down 12 m frame, `reference/app-study/pl-down-menu.jpg`); the engine still cuts at the range arc there. Apply the box rule + box-shaped curtain to those views after checking the 3D look with Jason
- ✅ Big fish bloom: bigger marks for big fish only (musky ×1.9, chinook ×1.6, bass ×1.1), range logic unchanged (decision #39)
- ⬜ Panoramic in dense bait: the 64-mark cap is reached at ~15 % of boat positions (120 ft), so the weakest dashes drop out; raise to 96 if phone fps allows
- ⬜ Deep water: the bottom band gets thick where the lake floor slopes sideways (the 20° slab is ≈ 11 m wide at 31 m). Physically right, but check against a deep app recording (all current app frames are ≈ 10 m)
- ✅ Panoramic rebuilt as a plan-view photograph; fish = analytic persistence streaks with shadows in all views (decision #36)
- ✅ Fish marks rebuilt from the beam's point spread (decision #120, `sonar-style.md` §7.19): needles along the arc far out, body and heading near, swim-bladder kernel, aspect swing ~17–20 dB, per-ping speckle and activity flicker, tail beat, faint 0.2 s ghost; Panoramic streaks along the arc (§7.13 corrected). Jig unchanged
- ⬜ #120 on a real phone: fps of the new fish shader on the Android baseline (`sonar-page-real-device-perf` memory) and a look on an iPhone; only checked in headless SwiftShader so far
- ⬜ #120 follow-ups if Jason wants more: per-species looks (walleye hump, musky torpedo, bait sparkle cloud with crisp herded edges), fish fading as they cross the slab is already physical (slab weight) but untested against a recording
- ⏸ Bake-off with another vendor's AI (Codex / Cursor / Gemini) on a clean copy of the Lab — plan archived in `docs/bakeoff-plan.md`, not started (Jason 2026-10-23: 先存档不做). Do nothing until he says go
- ✅ Sonar picture measured against LiveScope and the app; water-column specks; fish cores smoother (decision #129, `sonar-style.md` §7.20)
- ⬜ Study LiveScope video directly: the cloud container blocks YouTube (www.youtube.com, *.googlevideo.com, i.ytimg.com) — allow those hosts in the environment's network settings, or do it on the Mac; watch-list in `docs/livescope-fish-research.md`
- ✅ Panoramic wreck: the 40 m cargo ship (decision #38) now shows hatches, masts and deck gear from above like the app's 35 m wreck. It lies at ~36 m; moving it shallower stays Jason's call
- ⬜ Small far fish still show a faint dot grid inside the blob: the 24 sampled thickness rows miss a 4-row-tall bait fish depending on where it sits → fix with a column-reduction pre-pass (per angle column: fish coverage + nearest fish depth over all 128 rows), then one fetch per tap
- ✅ Public UI trimmed to Device / View / Range; colour map, gain, contrast, noise, depth axis are `?dev` only (decision #34). No TVG, no tuning controls on the page
- ✅ Brightness/orange balance calibration: LUT-index histogram of the confirmed frames vs the engine (`__sonarHist`), default map = Moreland_Black_Body, uGamma 0.8 (§6.11)
- ⬜ Re-run the histogram check on a wreck-in-view scene (the wreck scene used had mostly bottom in the fan) and after any pulse/tail change
- ✅ Range vs depth-range behaviour measured on the app (§6.9) and mirrored: PL Forward has its own Depth slider (vertical scale only), near-field rays sized in metres, structure echoes ×0.8 (case-2 verdict)
- ✅ Contrast + Noise Reject controls (Tune row) mapped to the app's tone curve per Jason's tuning strategy (`sonar-style.md` §6.5); defaults gain 57 / contrast 40 / noise 30 after the confirmed ideal picture (decision #28)
- ✅ Side-by-side checks vs the confirmed frames — running loop, composites in `reference/engine-compare/`
- ✅ **Sonar screen rework** (2026-09-24, after the tablet study): screen box per view fills the display with independent axes (`screenLayout` in `SonarScreen.jsx`), dark-red noise floor with radial streaks (mottled for PLM Down), thick bottom band with tail + faint second echo, near-apex rays, PLM Forward apex top-left, PLM Down stretched to the screen corners, Combo two-panel with the grey diagonal. Root cause of the old "small fan in black" picture: the screen-box code had been dropped by mistake in commit 4952966 (phone restyle)
- ✅ Fish echoes v3 (photograph model §7, decision #32): true size in the sonar pass, silhouette ⊗ beam/pulse blur, solid lumpy soft-rimmed marks; verified vs the Down-view near-field recording with `?fishtest`
- ✅ Colour: `garmin_amber` measured from LVS34 footage is the default (decision #33); `accuphy_red` demoted
- ✅ Fish texture rounds 3–5 judged by Jason (solid core, rim bites, short marks, sharp structure)
- ⬜ School stacking (overlapping dashes brighten) — still open
- ⬜ More LVS34 study: near-field fish blobs in Garmin's Down mode, bottom-band fibre density, the dark-red haze rays (yt-dlp is installed: `~/Library/Python/3.13/bin/yt-dlp`)
- ✅ Small/far fish: full-brightness beam-width dashes (max tap), 128-row depth strip so bait fish are not dotted; head-on fish flicker ping to ping
- ⬜ Bottom band white tip a little too wide vs the app
- ✅ Surface clutter streak under the transducer (side views)
- ✅ Combo (PLM): two-panel layout — Down panel lower-left (R/3, stretched ×2), Forward upper-right, shared apex at x≈20 %, grey double diagonal to x≈0.8 at the bottom
- ✅ Forward View screen: apex ~20 % from the left, like the recordings
- ✅ App chrome on the phone inset (`SonarChrome.jsx`, 2026-09-24): italic rulers on three edges from the live screen box, live depth readout (water depth under the transducer), temp/voltage, wordmark + `1440p (QHD)` tag, range −/+, pause, gain −/+, back, ⋯, PL-Forward depth-range control, Combo variant
- ✅ App buttons on the phone are display-only (42 % opacity); a tap opens the sign-up gate, the picture freezes until sign-up (decision #38)
- ⬜ Klaviyo: Jason creates the list "Accuphy Lab sign-ups" (name per decision #43), picks single/double opt-in, sends the public key + list ID → paste into `signup.js` (`docs/signup-klaviyo-plan.md`)
- ⬜ Before public launch: decide on a quiet "No thanks, just exploring" link under the sign-up button (GDPR consent-wall risk, plan §4)
- ✅ App tone curve adopted (log compression + gain/dynamic-range window → LUT)
- ✅ All 11 app colour maps available on the phone screen (amber default); gain slider

## 3D lake (Phase 3 polish)
- ✅ Rocks rebuilt in code as Shield boulders, six shapes; the old dodecahedron shards are gone (decision #133, `rocks.js`)
- ✅ The drag cue is a thin reticle on the water round the boat with one plain caption, no glass pill (decision #132; Jason picked it from four mock-ups)
- ✅ `lakeMaterial.js`: the speckle and bark grooves ran after `base` was computed, so no surface texture ever showed; fixed (decision #136)
- ⬜ Rocks, if Jason wants more: per-instance colour (needs instanceColor in lakeMaterial), lichen/algae bands, a few split boulders
- 🔧 **Boat + fish plan (2026-10-03):** `docs/boat-fish-plan.md`. Boat decided (#83): a low-key bass boat; no raised
  bow, no Power-Poles; the trolling motor and transducer stay as they are. Fish decided (#85): all species stay, yellow
  perch and northern pike join in phase 3, display size per species (musky 2.2× (#89), the rest 2.6×). Four phases:
  - (1) ✅ **built (#86), waiting for Jason's look:** the bodies swim with a travelling wave on the GPU, the tail beat
    follows the speed, the body curves into quick turns, the wrong-axis "wag" is gone, lighter smelt (−13 % triangles).
    The files it took are free again. Still open: Jason picks the musky's size (2.6× / 2.2× / 1.9× side-by-side).
  - (2) ✅ **built (#88), waiting for Jason's look:** a low-key bass boat lofted in code (V hull, strakes, flat sheer,
    flared bow), new decks, consoles, seats and outboard. The trolling motor and transducer are unchanged; there is a
    gentle bob and a foam line when dragged (the V wake was removed in #91). The files it took are free again.
  - (3) ✅ **built (#90), waiting for Jason's look:**
    - eyes, spiny + soft dorsals, pelvic and adipose fins, see-through rayed fins, round spots;
    - walleye on its own body; new yellow perch (25) and northern pike (4); walleye 16; smelt 137.
    The files it took are free again.
  - (4) optional: world edge, depth light, caustics, weeds.
- ✅ **Middle of the lake: a gentle slope into the deep (#92), waiting for Jason's look.** #91 made the middle a 20–29 ft
  valley and removed the wake streaks; Jason found the middle too flat and shallow and marked the area that should ease
  into the deep ("相对缓慢得向深水过度"):
  - now ~30 ft by the shelf–island line, ~36 ft at the boat's start, 50–60 ft by the north edge of his area, the floor
    at ~78 ft; 10–20° slopes nearly everywhere; shelf, island (15 ft), deep floor and wrecks unchanged;
  - the sonar bottom re-tuned for the new depths (PingLive and the Mini), all views back in their old ranges;
  - still for Jason to judge from #91: the calmer Down picture over the island, Panoramic lit over most of the screen.
- ⬜ **Desktop: range on the phone + phone size (approved #84, plan B; the local phone-layout chat builds it):**
  `docs/desktop-phone-controls-plan.md`. The desktop counterpart of #78/#79:
  - the panel's Range row goes, and the app's own −/+ on the phone set the range;
  - the app control set scales 1.3× on desktop (range ring ≈ 16 → 23 px);
  - ✅ (#150, 2026-10-24) the phone frame is `min(42vw, 600px, 83.2vh)` on the lake and the ice page (≈ 74 % of a real
    16 Pro Max on a laptop, ≈ real size on a 24″ monitor); the two items above are still open.
- ⬜ Optional: the water's wave displacement is applied within the plane (`p.y` of the rotated plane), so the drawn
  surface is flat; only its shading suggests waves. A real vertical wave needs a finer grid near the camera
  (today 10 m cells). Found in #88; harmless as it is.
- ✅ Deep water 40 → 24 m, fish off the bottom, chasing / darting / bursting fish (decision #64)
- ✅ Down view fully AUTO on both devices; PL Down fills its box to the corners (decision #65)
- ✅ Bottom toned down to orange with a thin hot edge; lockup moved into the boat's reach (decision #66)
- ✅ Panoramic structure: bright near faces, dark shadows, no rock rings (decision #67)
- ⬜ Panoramic shadow edges are still grainy (per-pixel march offsets); smoother ones need a better method than the two tried in #67
- ✖ The wreck in ~10–12 m so it fills the phone like the tablet recording — Jason 2026-09-25: 不用 (it stays on the 24 m floor)
- ✅ PLM Down in deep water no longer burns white (~11 % white after decision #66)
- ✅ Bark striations on timber (procedural, in the lake shader)
- 🔧 Boat restyled to Ranger Z521R proportions (charcoal metal flake, red waterline stripe, rub rail, wraparound windshield, Power-Poles, jack plate) — next: metal-flake sparkle, decals
- ✅ Beam footprint rim on the bottom
- ✅ Wreck +30 % (≈10 m) with cabin/windows/mast after the app imaging
- ✅ PL Panoramic clips studied (`sonar-style.md` §3b); screen now opens upward from a bottom apex
- ✅ Panoramic screen rebuilt from the lake recordings (§7.12): even crimson field from the apex, soft mottle, darker-red shadows, tangential dashes
- ⬜ Panoramic colour: the app's lake recording reads pinker crimson than garmin_amber's brown-red — check which app map that recording used (likely 'red') and decide
- ⬜ PLM Live Panoramic (left apex, opens right) is not a mode in the lab yet — add if Jason wants it in the page
- ✅ Water: ripple rings spread from the boat while it moves (simple wake; the fluid-sim trick stays optional). They were
  never visible (#88); the V wake that replaced them was removed at Jason's request (#91)
- ✅ Fish rim glow inside the beam (bright edge)

## Content
- ✅ Second, ~20 m, more complete wreck on the deep slope up-and-right
- ✅ That wreck doubled to a 40 m cargo ship with holds, hatches, masts, derricks, crane, stern house, railings, lifeboats and debris (decision #38)
- ✅ Big wreck moved 20 m up the default view to the 40 m basin floor and drawn at 70 % (decision #44)
- ✅ Big wreck turned 35° counter-clockwise, debris with it (decision #49)
- ✅ "往上20米" for the big wreck confirmed as up the screen (Jason 2026-09-24)
- ✅ Bass / musky / salmon spread through the water column (bass 2–17 m, musky 5–13 m, salmon 4–33 m)
- ✅ No fish swims through timber, rocks, wrecks or the logo: swim loops routed at load (decision #39)
- ✅ Accuphy logo on the lakebed, standing in the boat's forward plane so Forward / Down image the whole mark (decision #39)
- ⬜ Option for Jason: a guide step or a "find the logo" button that parks the boat on the lockup's line (today: a link with `?boat=-14,-52.5` and range ≥ 140 ft, or drag the boat to the monument's west side; decisions #61, #66)
- ✅ The full ACCUPHY lockup on the lakebed (the resume point after Jason's pause): white letters + blue fan from the brand SVG, 22 m wide, on a stone plinth that lifts it clear of the bottom echo; Forward and Down show the whole word at the default 80 ft (decision #40)
- ⬜ Default camera on 16:10 screens: the word's right end is cut at the screen edge (fully visible on 16:9 and wider). Jason noted it ("哦"), no change asked; options if he wants one: pan the default camera ~3 m right, or shrink the word
- ✅ Salmon / lake trout also up-and-right in the deep water
- ✅ App playback study done on the real V10 tablet (emulator route stays blocked by GLES 3.2): all PL and PLM views captured, findings in `sonar-style.md` §6 + `app-chrome.md`
- ⬜ App study leftovers: every colour map on one frame, range stepping, imperial units (tablet route, cheap)

## Brand / UI
- ✅ Control panel + guide cards: Apple-style frosted glass (decision #37) — replaced the earlier near-black DJI-style panels
- ✅ Animated "Drag the boat" hint that follows the boat until the first drag
- ✅ Phone frame turned in 3D (perspective + rotateY/rotateX); the GL picture uses the same maths with per-vertex w, so it stays perspective-correct inside the display
- 🔧 Phone realism (Jason: keep improving): Pro Max proportions, bezel, titanium band, buttons, glass reflection, Dynamic Island, antenna lines — next: camera-side depth, screen-off reflections
- ✅ Control panel in Accuphy brand (white wordmark, Instrument Sans, Eurostile Heavy headline, brand blue #0d8fdb)
- ✅ Sonar screen inside an iPhone Pro Max frame (landscape, natural-titanium ring, dynamic island); the GL picture is drawn into the DOM display hole
- ✅ The sonar picture's own chrome — done (see Sonar screen section)

## Experience (the three-step guide)
- ✅ Three-step guide strip with presets — step 2 now lands on standing timber + bass (PL Forward 60 ft); copy is a first draft for Jason to edit
- ✅ Mobile portrait layout: phone above the control panel, guide strip hidden; fixed camera kept
- ⬜ Device side-view cutouts (or stylised silhouettes) — still owed by Jason

## Mobile + Meta ads readiness (real-device test 2026-09-24)
Jason is weighing Meta ads, which bring mostly phone traffic, for this page. The numbers come from a
production build of the decision #38 state in Chrome 153 on the V10 tablet (Unisoc T616 / Mali-G57 MP1,
the cheapest Android phone class). Phone size was emulated at 360×800.
- ⬜ **Phone smooth mode.** Measured fps: 10–13 at tablet size, 14–19 at phone size and 18–24 even at
  dpr 1 (Panoramic and Combo are the slowest). The main thread is only ~17 % busy, so the page is
  GPU-bound. Cut the fixed per-frame work (sonar strip passes, sonar shader, scene draws) until cheap
  phones reach 30 fps, and pick the quality from the measured frame time.
- ⬜ **First load.** A first visit downloads ~976 KB: JS 404 KB gzip, fonts 430 KB as TTF, logo PNG
  144 KB. The 3D appears at 2.8 s on 9 Mbps/60 ms and at 4.4 s on 1.6 Mbps/150 ms, with a ~1.8 s
  freeze while the scene builds. Fixes: WOFF2 subset fonts, SVG logo, a public build that ships only
  this page, and a poster + progress bar shown at once.
- ⬜ **Touch targets.** Panel buttons are 26 px tall and the range track is 4 px. The phone-inset app
  buttons (the sign-up trigger) are only 8–13 px, so the gate is almost unreachable by finger. Give
  them ~44 px hit areas and add one obvious sign-up button. Real-finger drag, taps and the slider
  all work, with no page scroll or zoom.
- ⬜ **360 px-wide phones.** The panel grows and overlaps the phone inset.
- ⬜ **Orientation.** Jason leans towards landscape on phone and tablet. Tablet landscape already works.
  Phone landscape (800×300) is broken: the panel and step cards cover the screen and hide the inset.
  A web page cannot force landscape (iOS Safari has no orientation lock, and Instagram's iPhone app
  does not rotate). Proposal, waiting on Jason: keep portrait fully working, add a compact phone
  landscape layout and an optional dismissible "turn for a bigger view" hint. No rotate wall.
- ⬜ **Before any US ad spend (decision #57):** walk the US store's checkout on a phone (view only, no
  payment) and find where US buyers drop off; US ads lead with the PingLive Mini.
- ⬜ **Before any ad spend:** public hosting; drop "← Lab" and the gallery from the public build;
  add a "Shop PingLive" button with UTM tags; add the Meta Pixel; wire Klaviyo (see above); remove
  the logo source files (.ai/.cdr/.zip/.DS_Store) from `public/`.
- To re-run the test: see the `sonar-page-real-device-perf` memory note (adb reverse + Chrome
  DevTools over adb).
- ⬜ **Users and market analysis (2026-09-24, proposals waiting on Jason):** `docs/users-and-market.md`
  (canonical, maintained copy: Google Drive `My Drive/Market Research/`).
  The real buyers are northern, portable-minded and value-driven (ice hole-hoppers, priced-out upgraders,
  LiveScope owners wanting a second unit, francophone and Chinese-speaking communities), not tournament
  bass pros. Proposals in its §7: lead with "live sonar on the phone you already own" (answers the
  pending "aha" question with A); a "How do you fish? Boat · Kayak · Ice" scene choice instead of the
  tournament bass boat (**decided #53/#56: Boat (an aluminium deep-V), Kayak, Ice; no gate on phones**; the seasonal default is a working assumption) (status-ladder study in Drive: no single vehicle carries the brand; the
  default follows the season: ice in winter, an aluminium deep-V in open water, the kayak never
  the default); target Canada before ice season, and the US only after its availability and
  checkout are fixed; the Lab as an onboarding tool (reading the picture) and a dealer demo; show
  multi-device sharing; UTM, Pixel and Klaviyo tags before any ad spend. Next data to get: the HelpScout
  queue (~4,200 conversations) and a 5-question owner survey.
- ⬜ **Market research round 1 + continuous learning (2026-09-25, decision #82, proposals waiting on
  Jason):** `docs/market/` (start with `report-2026-09.md`; the loop is in `README.md`). Questions for
  Jason, in this order:
  1. **US store:** decision #57 settles the product (US = PingLive Mini is fine for ads). Still open:
     US checkout completion is 4.8 % vs Canada 19 %, with duties added at checkout. The view-only phone
     walk-through (Mobile section, #57) comes first; may we then run one test checkout to a US address
     to see what is added (E1)?
  2. **Pre-ice priorities** (the season starts now): product-page first screen "no display to buy" +
     myth line (E15), checkout-abandon emails v2 (E4), ice campaign and kits (E5, E17), cold-weather
     guide (E19), reviews from past buyers (E3). Which ones go?
  3. **Continuous learning:** keep the monthly refresh + three seasonal reviews? Run them as a
     scheduled routine (a fresh session each time, results committed here and summarised in Drive)?
  4. Put round 1's Chinese summary into Drive `My Drive/Market Research/` next to round 0?
  Remind Jason of these when he is back on this project. Next research round: Chinese low-cost live
  sonar, rival display prices, Help Scout themes, the owner survey (search quota is 200 per session:
  run it fresh).
- ⬜ **Klaviyo: "Simulator Mode" → "Playback Mode" in the two Abandoned Cart emails (2026-09-25, waiting
  on Jason).** The connector cannot save flow emails (404), so Jason changes one word in each email in
  the Klaviyo editor (about 5 minutes); a chat then diffs both against the backups. Found on the way,
  his call: the flow's coupon email (#2) has not been sent since the 2026-04-14 edit (0 people since;
  its Yes/No paths look swapped, L25); the shared header's "Quick Setup Guide" link is a 404 (site
  audit); two blog posts still say "Simulator Mode". Steps and details: `docs/market/klaviyo-changes.md`.
  Remind Jason when he is back on this project.
- ⬜ **Phone layout + camera plan (2026-10-03, plan accepted, build on Jason's go):** `docs/mobile-phone-layout-plan.md`.
  Jason: "船应该更小一点…zoom out" and "手机能否保留边框 合理安排一下空间". Four phases:
  1. an aspect-aware camera, about 70 m of lake across on phones;
  2. the iPhone frame on top, near-flat, with view pills in the middle and the lake on the
     bottom ~65%;
  3. relative touch drag and a clamped hint;
  4. landscape real-device mode and quality tiers.
- ⬜ **Mobile plan: PLANNING ONLY, do not build until Jason says go** (decision #45: "我没说动不要动").
  `docs/mobile-marketing-plan.md`: no deadline (decision #47), so the plan optimises for the
  best mobile experience. The interactive experience is the core, shaped by the "Principles for
  mobile" (the phone is the sonar screen, portrait re-layout, screen up / water down, drag anywhere,
  hints not teleports, quality tiers, landscape = real device mode); Plan B's video story is the
  fallback for slow phones. Decided: main action = email for an offer (#45). Next question for
  Jason: the "aha" (what a visitor should feel first). Remind him when he is back on this project.

- ✅ **Embed: theme-mounted Lab (#142):** `mount(el)` entry, stable loader `embed/lab.js`, CORS/caching in `vercel.json`, events via `Shopify.analytics.publish`; handoff draft `docs/handoffs/2026-10-24-lab-theme-mount.md`
- ⬜ **Carry the #142 handoff to `accuphy-website/handoffs/`** (a chat on Jason's Mac); then the Vercel deploy (#102) and the theme-copy test
- ⬜ Phone-mode gaps left after #139: ice page Home-first + live gain/pause on phones, and the ice page held sideways (ice chat; the lake page's #141 mode is lake-only)
- ✅ **Phone landscape "real device mode" (#141, 2026-10-24):** a sideways phone is the app — Home with the frosted
  tiles, then the sonar full-screen with the app's controls and the lake as a top-right inset that taps to swap.
  Lake page only. Still open from Phase 4: quality tiers (dpr / 30 fps cap).
- ⬜ **iPad layout: on hold (#119).** iPads get the desktop controls today; Jason decides after the phone layout is final.

## Engineering
- ✅ Dev helper `?bigphone` (DEV only): the phone frame fills the viewport so the sonar picture can be inspected in screenshots
- 🔧 Mobile performance: dpr capped at 1.5, high-performance GL context; real-device check done 2026-09-24 (budget GPU 10–24 fps, see "Mobile + Meta ads readiness")
- ✅ React 19 + R3F `refCleanup` console error — gone since StrictMode was removed (no new occurrences in this session's checks)
- ⬜ **Local for now** (Jason 2026-09-24): `npm run build` + `npm run preview` on this Mac. Public hosting + Shopify embed stay in the plan for later, unchanged
- ✅ **Old private preview link, superseded** (2026-09-25): https://claude.ai/artifact/4GdHHYZKTHgYyEzjV12RmW was built
  from main `6738310`, before the Safari fix (#73), so on an iPhone or iPad its sonar picture can be black. Friends and
  phones use the public test link (#72, #76): https://jasonzhu-ctrl.github.io/accuphy-lab-test/. Delete the old one
  when Jason agrees (a delete needs his confirmation).
- ✅ **Private preview updated** (2026-10-04, Jason: "给我链接先看一看"): https://claude.ai/artifact/RnCBYTexY5vcEqJy2hAsN7
  (version 6) now shows main `340e98d`, with fish phase 1 (#86), the new boat (#88), fish phase 3 (#90), no wake
  streaks (#91) and the middle sloping gently into the deep (#92). Only Jason can open it (he needs to be logged in
  to Claude). Tested before publishing: the share build has no gate, makes zero
  network requests, loads the fonts and shows no console errors on desktop or phone.
- ⬜ **Public test link still on the old build** (#81): https://jasonzhu-ctrl.github.io/accuphy-lab-test/. Rebuild it
  (skill `lab-test-link`) only when Jason says so.
- ⬜ **Who can see the code** (checked 2026-09-30, Jason: "这个别人看得到代码吗"):
  - **Visible to anyone:** the public test page and its repository `accuphy-lab-test` (public, 4 files).
    Anyone can save `index.html` from the page or download it from GitHub. It is one minified file.
    It includes the shader code as plain text (the sonar look), the three brand fonts and the white logo.
  - **Not exposed:** the source repository `accuphy-visual-lab` (private), with the docs and market
    data. The page carries no keys (the Klaviyo key is empty) and no source maps.
  - **Search engines:** `robots.txt` and `noindex` keep the page out of results. The GitHub repository
    itself is public.
  - **Open — font licence:** Eurostile Heavy is a commercial font and is now served publicly.
    Confirm that the licence covers web embedding. If it does not, use a web-licensed copy or subset
    before sharing more widely.
  - **Limits:** code that runs in a browser cannot be hidden; obfuscation only slows a reader down.

## Handed to the website project (decision #69) — tracked in `accuphy-website/docs/backlog.md`
- Lab page location (~~lab.accuphy.ca~~ 已定 .com（#102）: lab.accuphy.com, behind the store page) · lite section's Shopify test page · Klaviyo list,
  opt-in and keys · Meta Pixel, UTM, "Shop PingLive" button · US phone checkout walk (decision #57).
  The design work for each stays here; the Shopify side is theirs.
- ⬜ **Store page as the front door (decisions #133–#134, 2026-10-23, adopted):** `shop.accuphy.com/pages/lab` = header-less
  template + full-screen iframe of the Vercel-hosted Lab (#102 unchanged). Handoff: `accuphy-website/handoffs/2026-10-23-lab-store-page.md`.
  Lab side to do: embed events module (`ready`, `first_drag`, `view`, `found_sign`, `signup`, `shop_click` via `postMessage`),
  `100dvh`, Klaviyo keys, `window.top` shop links, `vercel.json` (`frame-ancestors`, `noindex`), Vercel deploy when the
  website project is ready. Study: `docs/shopify-embed-feasibility.md`.
  Website HQ 2026-10-23 (#204 there): Globo dropped; theme copy 189488890029; `pages/lab` built by 00, not published; Klaviyo public
  key XWcjZ5 filled in `signup.js`, list id pending; shop links = `/products/pinglive-sonar`, `/products/pinglive-mini` with the
  market prefix (CA none or `/fr`, US `/en-us`, AU `/en-au`) — for the future `shop_click` button.
  Website #208 (Jason, 2026-10-23 evening): the Klaviyo popup STAYS on /pages/lab (not excluded); trigger rules and the
  funnel are decided later; the "Accuphy Lab sign-ups" list is not created yet, and whether the Lab keeps its own sign-up
  card is decided then. `signup.js` keeps the public key with `listId: null` (sends nothing) until that decision.

## Lite section (planning only — decision #48)
- ⬜ **Do not build until Jason says go.** `docs/lite-section-plan.md`: the original side-view visualizer as a
  light web component `<accuphy-sonar>` for accuphy.ca sections — the fan is the screen (no phone inset),
  two controls, no three.js, ≤ 90 KB first visit, ≥ 50 fps target on the V10. Remind Jason of the go/no-go
  when he is back; when he says go, §8 of the plan is the build order (prototype → packaging → measure → Shopify test page)
- ⬜ **Look gate (decision #50):** premium + technical is a hard requirement (Jason: 视觉的高级感科技感非常非常重要). Plan §3b
  lists the light, beam-volume, parallax, bloom, motion and glass-UI rules; phones get the same look with fewer samples.
  Jason reviews the prototype's look against the LVS34 frames, Accuphy's animations and the 3D Lab before packaging
- ✅ Mood decided: dark cinematic water, the dusk palette of plan §3b (decision #51)
- ✅ Look references: Jason picked groups A + B and gave the "dark lakebed lit up" lamp concept (decision #54, `docs/look-references.md`)

## Ice scene (decision #94, 2026-10-16) — local only
- ✅ Snow cover: black ice (`glass`) chosen 2026-10-16 (#96); the snow-and-cutaway look stays as `?look=snow`
- ⬜ **Jason's look picks still open**: the black ice's realism (rebuilt from photographs in #96 — his verdict pending), time of day (dusk / day / night), ice views in jet or amber
- ⬜ Black ice next steps if he wants more: methane bubble stacks, a pressure ridge or two, skate/boot scuffs near the hole, a thin snow film that the wind moves
- ⬜ Camera tilt (or an intro move) so the sky dome, the afterglow and the night aurora are in frame; the dome is built but the ⅔-aerial camera never sees the horizon
- ⬜ Glass UI on bright scenes: on the `day` preset the frosted panel and cards lose contrast against white snow — a darker tint when the scene is bright
- ⬜ Footprints and sled tracks in the snow between the camp and the holes (a stamped trail texture)
- ⬜ Winter fish behaviour: walleye and perch should come in under the hole more often (the summer behaviours run unchanged); a jig mark on the flasher and in the 2D history
- ⬜ Forward and Combo through the ice: check the window shape and the picture against the app's Live Forward; the Mini's forward range from a hole
- ⬜ Phones: the ice page at 375×812 and landscape; the hint and the aim ring under a finger
- ⬜ sonar-qa for the ice views (dial brightness vs the app's Ice Fishing View, the history's speckle floor)
- ⬜ Publish as `/ice/` (`VITE_SCENE=ice`) + `docs/versions.md` — only when Jason says go
- ✅ Direction: the SECTION camera (B), Jason 2026-10-16 night (#101); the surface: black ice with thin wind-swept snow (#108)
- ⬜ Section view tuning (round 1 done in #102: lens, slab face, soil, marine snow, cards under the panel, camp): still open — the slab edge opening where a hole is near the wall, snow lying on the slab top, the water column's tint, camp details, phone fine-tuning; decide the fate of Top and Under the ice (keep as a switch, or drop)

## PLM Combo at long range (Jason 2026-10-23: Range 拉到很高的时候 画面只剩下顶部那一点点) — ✅ DONE as a softer option A (see decisions)
- Cause: the Combo Forward panel's depth axis is fixed at 0.7 × range (copied from the one app frame, 16 m range in 4 m of
  water, `SonarScreen.jsx screenLayout`, `index.jsx` Combo box). At 200 ft range in 36 ft of water the panel is 140 ft
  deep, so the bottom and everything on it sit in the top quarter, under the depth readout; the rest is black.
- The real app (2.0.0, `reference/app-study/2026-10-23/40-live-combo.jpg`) uses the same 0.7–0.75 × range proportion
  and has no range −/+ in its Combo bottom bar; only the Lab's desktop slider reaches 200 ft in Combo.
- **Option A (recommended):** the Forward panel's depth follows the water, like the single Live Forward view already does
  (decision of 2026-09-25): depth axis = min(0.7 × range, ~1.2 × the deepest water the beam crosses). Nothing changes at
  the default ranges; at long range the bottom and structure grow 2–3× taller. Mock-up checked at 60/100/150/200 ft.
- Option B: cap the range in Combo at ~100 ft (the slider stops there), keep the app's proportion.
- Option C: A + B together.

## Jason's four asks, 2026-10-23 evening ("有几个是我需要你持续优化 … 你可以一个一个做")
1. ✅ (#125) **PLM Combo, Forward part: the bottom-vs-range relationship** must read easily for a beginner ("初学者相对来说比较容易好接受").
2. ✅ (#128 first round; redone like-for-like against the vivo recording, see decisions) **Sonar engine: structure** — the picture of structure is still far from the real app's ("结构物的画面跟真实的声纳的画面差距还是比较远").
   Research against the app recordings first (`sonar-look-tuning` skill, `reference/`), then tune.
3. ✅ (#126) **Ice page: the tap area** is too limited — taps farther up the ice do not go through ("往冰面的上面再去点 它是过不太过去的").
   Re-evaluate which area is the most intuitive for a new user.
4. ✅ (#127) **Ice page: fish and the jig** — nearby fish should come to the jig naturally but quickly, and interact with it
   ("又自然又快 … 跟鱼饵能够有一些自然的互动").

## Jason's look round, 2026-10-24 (vs the app's bottom close-up)
- ✅ (#143) bright cores fading to orange rims; flat bottom edge with fine fibres
- ✅ (#144) bottom and structure at one brightness; thicker Forward / Mini bottoms; steel even
- ✅ (#145) solid targets hide the bottom (no see-through rocks); branches whole, no mosaic; wooden hull halfway back
- ✅ (#146) fibres inside hulls and rocks like the bottom close-up, opacity kept
- ✅ (#147) ragged fibrous outlines on every object ("边缘的纤维对了")
- ✅ (#148) the grain rule: every return is a short arc across the beam — bottom, insides and outlines ("这版纹理做得非常的好")
- ✅ (#149) big hulls get bright middles; the steel wreck no longer dark and even ("钢船这样对了")
- ⬜ From the LiveScope session's check (2026-10-24), not yet done: ping-to-ping life (app hull |ΔL|/L 0.46 vs Lab 0.17,
  band 64 % vs 43 % class change); rim 0–2 in too bright (app L 174 vs 236); Down band ~25 % thicker than the app's and
  without its white points; Down water column lit 0.79 % vs 0.04 %; Combo / phone Forward white 10–15 % (target 6–10 %);
  the far ice Forward band frays into thin wavy threads; a dotted vertical bar in PL Panoramic at deep / lockup
- ✅ fps on a real phone after #145–#149: vivo fold (V2545A, Mali-G1-Ultra MC12, Chrome 152, unfolded, canvas 1067×876): a
  steady 60 fps in PL Forward / Down / Panoramic and Mini Forward / Down, no black or broken picture (2026-10-24)
- ⬜ The cheap-device baseline (V10 tablet, 10–24 fps before) after #145–#149: re-measure when the tablet is back
- ✅ On the unfolded fold (viewport 711×584) the drag hint sat on the panel's Range value: the hint now slides clear of
  anything marked `data-hint-avoid` (the panel, the step cards, the phone) — checked at 711×584, 1024×768, 1440×900,
  390×844 on the lake and the ice page, zero overlap (2026-10-24)
- ✅ At 711×584 (the unfolded fold) the boat sat under the glass panel: the view now shifts clear of it on mid screens (#150)

## UI rules for every screen and browser (research 2026-10-24, `docs/ui-screen-rules.md`) — waiting for Jason's go
- ⬜ Class C compact layout (folds, iPad portrait, small windows): collapsible panel, cards as a sheet, 44 px touch targets
- ⬜ WebGL context-loss recovery; `color-scheme: dark` against forced dark modes
- ⬜ Screen classes from the mount box (container queries / ResizeObserver), before the store mount (#142)
- ⬜ Height from innerHeight / visualViewport, bottom controls above the safe area; verify on a real iPhone (Safari, Instagram, iOS 26)
- ⬜ Class F scale-up (≥ 2200 px); low performance tier + loading poster (Phase 4)

## Handoff to the phone-chrome owner (SonarChrome.jsx): the app's "sonar working" icon (Jason 2026-10-23)
- ⬜ In the real app's Down views a small "sonar working" icon sits at the top centre of the picture, just under the 0 of the
  range ruler (partly hidden by it), whenever the sonar runs — Jason identified it on the 2.0.0 recording
  (`reference/app-study/2026-10-23-vivo/pl-down-d00.jpg`, region ②). The Lab's phone chrome has none. Shape: a small
  fan/arc glyph a few px wide, the colour-map's orange. Owner: the chat that owns SonarChrome.jsx.
