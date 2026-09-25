# Backlog — Sonar Beam Visualizer (kept current every round)

Jason 2026-09-24: "别把之前说过的任务丢了" — every promised task lives here until
it is done. ✅ done · 🔧 in progress · ⬜ open.

## Sonar screen (Phase 4)
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
- ✅ Bark striations on timber (procedural, in the lake shader)
- 🔧 Boat restyled to Ranger Z521R proportions (charcoal metal flake, red waterline stripe, rub rail, wraparound windshield, Power-Poles, jack plate) — next: metal-flake sparkle, decals
- ✅ Beam footprint rim on the bottom
- ✅ Wreck +30 % (≈10 m) with cabin/windows/mast after the app imaging
- ✅ PL Panoramic clips studied (`sonar-style.md` §3b); screen now opens upward from a bottom apex
- ✅ Panoramic screen rebuilt from the lake recordings (§7.12): even crimson field from the apex, soft mottle, darker-red shadows, tangential dashes
- ⬜ Panoramic colour: the app's lake recording reads pinker crimson than garmin_amber's brown-red — check which app map that recording used (likely 'red') and decide
- ⬜ PLM Live Panoramic (left apex, opens right) is not a mode in the lab yet — add if Jason wants it in the page
- ✅ Water: ripple rings spread from the boat while it moves (simple wake; the fluid-sim trick stays optional)
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
- ⬜ Option for Jason: a guide step or a "find the logo" button that parks the boat on the lockup's line (today: a link with `?boat=41,1.5`, or drag the boat to the monument's west side)
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
  tournament bass boat (**decided #53: Boat, Kayak, Ice**; the default and the boat type are still open) (status-ladder study in Drive: no single vehicle carries the brand; the
  default follows the season: ice in winter, an aluminium deep-V in open water, the kayak never
  the default); target Canada before ice season, and the US only after its availability and
  checkout are fixed; the Lab as an onboarding tool (reading the picture) and a dealer demo; show
  multi-device sharing; UTM, Pixel and Klaviyo tags before any ad spend. Next data to get: the HelpScout
  queue (~4,200 conversations) and a 5-question owner survey.
- ⬜ **Mobile plan: PLANNING ONLY, do not build until Jason says go** (decision #45: "我没说动不要动").
  `docs/mobile-marketing-plan.md`: no deadline (decision #47), so the plan optimises for the
  best mobile experience. The interactive experience is the core, shaped by the "Principles for
  mobile" (the phone is the sonar screen, portrait re-layout, screen up / water down, drag anywhere,
  hints not teleports, quality tiers, landscape = real device mode); Plan B's video story is the
  fallback for slow phones. Decided: main action = email for an offer (#45). Next question for
  Jason: the "aha" (what a visitor should feel first). Remind him when he is back on this project.

## Engineering
- ✅ Dev helper `?bigphone` (DEV only): the phone frame fills the viewport so the sonar picture can be inspected in screenshots
- 🔧 Mobile performance: dpr capped at 1.5, high-performance GL context; real-device check done 2026-09-24 (budget GPU 10–24 fps, see "Mobile + Meta ads readiness")
- ✅ React 19 + R3F `refCleanup` console error — gone since StrictMode was removed (no new occurrences in this session's checks)
- ⬜ **Local for now** (Jason 2026-09-24): `npm run build` + `npm run preview` on this Mac. Public hosting + Shopify embed stay in the plan for later, unchanged

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
