# Backlog — Sonar Beam Visualizer (kept current every round)

Jason 2026-09-24: "别把之前说过的任务丢了" — every promised task lives here until
it is done. ✅ done · 🔧 in progress · ⬜ open.

## Sonar screen (Phase 4)
- ✅ AUTO depth on PL Forward: bottom kept at ~80 % of the screen in deep water; sound reaches the whole picture box; the 3D curtain = that box (decision #38)
- ⬜ Down View in water deeper than the range: the bottom is out of range (the app behaves the same). Option for Jason: auto range in Down View too (the Range slider would move by itself) — not done without his call
- ⬜ Down / PLM views: the app also draws echoes out to the screen corners beyond the range (PL Down 12 m frame, `reference/app-study/pl-down-menu.jpg`); the engine still cuts at the range arc there. Apply the box rule + box-shaped curtain to those views after checking the 3D look with Jason
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
- ⬜ Klaviyo: Jason creates the list "Website — Sonar Beam Explorer", picks single/double opt-in, sends the public key + list ID → paste into `signup.js` (`docs/signup-klaviyo-plan.md`)
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
- ✅ Bass / musky / salmon spread through the water column (bass 2–17 m, musky 5–13 m, salmon 4–33 m)
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

## Engineering
- ✅ Dev helper `?bigphone` (DEV only): the phone frame fills the viewport so the sonar picture can be inspected in screenshots
- 🔧 Mobile performance: dpr capped at 1.5, high-performance GL context; real-device fps check still to do
- ✅ React 19 + R3F `refCleanup` console error — gone since StrictMode was removed (no new occurrences in this session's checks)
- ⬜ **Local for now** (Jason 2026-09-24): `npm run build` + `npm run preview` on this Mac. Public hosting + Shopify embed stay in the plan for later, unchanged
