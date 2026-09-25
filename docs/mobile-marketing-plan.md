# Mobile plan: Accuphy Lab as an ad landing experience

**Status: planning only.** Nothing gets built until Jason says go. On 2026-09-24 he said
"我没说动不要动 … 后面可以提醒提醒我以防万一我忘记". Claude reminds him of the pending choice when
he is back on this project, and before any launch or ad work.

He first asked 移动端你帮我策划一下我应该怎么搞合理好用 符合我们最终用于体验营销, then asked for a
second option (你多出一个移动端的方案吧), which is Plan B below.

**Decided:** the page's main action is an email sign-up for an offer. Jason chose A (decision #45).

**Direction (decision #47):** there is no deadline. Jason: "我不着急 时间不是问题 我们只是规划 思考
如何把移动端做得更合理". So the plan optimises for the best mobile experience, not the fastest
launch. The interactive experience is the core (experiential marketing means the visitor drives
it); Plan B's video story is the fallback for phones that cannot run the 3D, not the main plan.
The "Principles for mobile" section below is the current thinking.

## Principles for mobile (current thinking, 2026-09-24)

1. **The visitor's phone is the sonar screen.** On desktop the sonar sits inside a drawn iPhone,
   to say "this is what your phone shows". On a phone the visitor is already holding the device,
   so the drawn frame is redundant and wastes pixels. Show the sonar picture edge to edge with the
   real app's chrome, as if PingLive were running on this phone.
2. **Re-lay the sonar picture for portrait, don't shrink the landscape one.** At full width the
   app's 2:1 picture is only ~170 px tall on a 360 px phone. The engine already fills any box and
   scales each axis on its own (`screenLayout`), so give the portrait picture a taller box
   (about 6:5) and let the axes follow.
3. **Screen up, water down.** Sonar at the top, where the eyes go (the unit on a boat's console);
   the lake at the bottom, where the thumb is (the water below the boat). The view pills sit
   between them, in the most reachable strip of the screen.
4. **Drag anywhere in the water.** Dragging any point of the lake area moves the boat by the same
   amount (relative drag), so the finger never has to land on the small boat and never covers it.
   Tapping a fish or a structure sends the boat there (autopilot) as a second, touch-friendly way.
5. **Guide with hints, not teleports.** The visitor drives to each moment (first fish, bass under
   the timber, the wreck, the hidden ACCUPHY sign) following an arrow or a hint. Each moment gets a
   small callout on the sonar picture ("Bass · 12 ft"). The boat starts next to fish, so the very
   first drag already shows something.
6. **Quality tiers done properly.** A mobile render path: dpr 1–1.5 by measured frame time, a
   30 fps cap on slow phones, the sonar picture rendered at half resolution and upscaled (the
   noise texture hides it), fewer plants. Target: 30 fps on V10-class hardware, 60 on good phones.
   Video (Plan B) only for phones that still cannot.
7. **Landscape is "real device mode".** If the visitor rotates, the sonar fills the screen exactly
   like the real app, and the lake becomes a small inset (tap to enlarge). Portrait stays the
   default and complete; nothing ever asks the visitor to rotate.
8. **Three ways to fish (decisions #53, #56).** Boat (an aluminium deep-V), Kayak and Ice. On a
   phone the choice is never a gate. The page opens straight into one scene: the ad's scene, or
   the season's default. Switching is a small chip or sits in the "More" sheet. Only the scene in
   use is loaded; the others download on tap.
9. **Ask for the email after the "aha", never before.** Inline, dismissible, with "Shop PingLive"
   next to it (decision #45).

**Inputs:** the real-device test (backlog, "Mobile + Meta ads readiness") and decisions #38–#40.

## Goal

A visitor from a Meta ad arrives on a phone, in portrait, inside the Facebook or Instagram
in-app browser. On the page they should:

1. see something within 1 s;
2. get the "so that's what PingLive shows" moment within about 10 s;
3. finish a short guided play in about 60 s;
4. leave an email for an offer, or tap through to the shop.

## Plan A: the 60-second guided game (portrait)

The sections from here down to Plan B describe Plan A. Loading, Conversion, Measurement and Ads
apply to both plans.

| Time | What the visitor sees and does | What the page does |
|---|---|---|
| 0–3 s | A poster of the lake, the headline "Drag the boat. See the fish." and a loading bar | The poster and headline are plain HTML, so they show at once; the 3D loads behind them |
| 3–10 s | Drags the boat with a thumb. The beam touches a fish, and the sonar screen lights up with a labelled mark ("Bass · 12 ft") | Shows a first-touch hint. The boat starts next to fish, so the first drag always finds one. Labels appear only during the tour |
| 10–40 s | Three guided steps, each advanced with a big "Next" button: Down (right under the boat), Forward (bass by the timber) and Panoramic (scan wide) | Each step moves the boat to its preset scene (the presets exist) |
| 40–60 s | A challenge: "Find the hidden ACCUPHY sign on the lakebed." Finding it opens the reward card | Detects the boat on the lockup's line in Forward or Down |
| After | Free play: device (PL / PLM), view and range | These controls sit in a bottom sheet that starts collapsed |

## Layout (phone, portrait)

- **Top ~55 %:** the 3D lake, which is the drag area.
- **Middle:** the sonar picture at full width, because the product is the hero. Keep only a thin
  phone frame, and hide the tiny decorative app buttons on phones.
- **Bottom:** one row of big view pills (at least 44 px tall) and a "More" sheet for device and
  range.
- **Step cards and calls to action** slide up from the bottom, within thumb reach.
- **Landscape:**
  - Offer an optional compact layout (lake on the left, sonar on the right) for people who rotate.
  - Show a dismissible hint only where rotation is possible.
  - Never block the page with a "rotate your phone" wall. A web page cannot force landscape, and
    Instagram's iPhone app does not rotate.

## Smooth on cheap phones

The budget-GPU baseline is 10–24 fps; see the backlog.

- **Quality tiers:** pick the tier from the measured frame time in the first 2 s. Phones start
  on the light tier and step up if they run fast.
- **Light tier:**
  - dpr 1 and a 30 fps cap;
  - the sonar strips refresh at ~15 Hz;
  - no MSAA and fewer plants.

  The target is at least 30 fps on V10-class hardware.
- **Pause** rendering when the page is idle or hidden, to save battery and heat.
- **Fallback:** if WebGL is missing, or the light tier still runs under 15 fps, show a short video
  of the experience with the same calls to action. No dead ends.

## Loading

- Put the poster and the progress bar in the first HTML, so something shows in under 1 s.
- Cut the download from ~1 MB to ~0.5 MB:
  - WOFF2 subset fonts;
  - an SVG logo;
  - a public build that contains only this page (no gallery, no "← Lab").
- Host a standalone page on a CDN subdomain (for example `lab.accuphy.com`, matching the name), not an iframe
  inside Shopify.

## Conversion

- **Primary (decided, #45):** an email sign-up for an offer through Klaviyo. Show it after the "aha"
  moment (the end of the tour, or finding the sign), with a "No thanks, keep exploring" option.
- **Secondary:** a "Shop PingLive" button that opens the Shopify product page, with UTM tags.
- The display-only app buttons open the same offer card and can be dismissed. They are not a
  trap.

## Measurement

Use the Meta Pixel and UTM tags. The funnel events are:

PageView → 3D ready → first drag → tour step 1 / 2 / 3 → found the sign → Lead (sign-up) → shop
click.

Meta's learning phase needs roughly 50 optimisation events a week. Until leads reach that level,
optimise for landing-page views or engagement; after that, optimise for Lead.

## Ads

- **Creative:** screen recordings of the experience, in 9:16 (Reels and Stories) and 4:5 (Feed).
  The first second is the hook: a thumb drags the boat and a fish lights up.
- **Links:** give each ad variant its own scene preset link (the wreck, bass under timber, the
  hidden sign), so the page opens on what the ad showed.
- **Budget:** start small, compare cost per engaged visitor and cost per lead, then scale.
- **Meta feasibility (2026-09-25; the Drive study "Meta ads feasibility"):** Meta fits awareness,
  leads and retargeting, not direct sales. The order is:
  1. tracking first;
  2. test on our own ~1,700 never-ordered subscribers, at no cost;
  3. Canada before the ice season, and the US only after PingLive is available there and the
     checkout problems are fixed;
  4. the goal is an email lead, and Klaviyo does the selling.

## Order of work

1. Smooth mode and a lighter first load. Everything else depends on these.
2. The portrait redesign: a big sonar picture, big buttons and the bottom sheet. This also fixes
   the 360 px overlap.
3. The guided tour with automatic scenes, the hidden-sign challenge and the calls to action.
4. Klaviyo, the Meta Pixel, UTM tags and public hosting.
5. A pass on real devices: an iPhone and a cheap Android, inside the Facebook and Instagram apps.
6. A small-budget ad test. After that: the landscape layout, the video fallback and more scene
   links.

## Plan B: story first, play second (portrait)

A short vertical story that the visitor scrolls, like a product page. Pre-recorded loops from
the lab carry the message, and the live 3D is an opt-in "try it" section.

| Section | What the visitor sees | Notes |
|---|---|---|
| 1. Hero (0–2 s) | A full-width looping clip: the boat passes and fish light up on the sonar. Headline: "See every fish under your boat, live." | Muted, autoplaying inline video with a poster image, so something shows at once |
| 2. The beam | A loop of the 3D curtain touching fish and timber | One line of copy |
| 3. Three views | Down, Forward and Panoramic, each a 3–4 s loop with one line on when to use it | Swipeable or stacked cards |
| 4. Try it yourself | A card, "Drive the boat (live 3D)". Tapping it opens the interactive lab full screen | The 3D loads only on this tap. Phones that are too slow get a longer clip instead |
| 5. The offer | An email field and a button for early offers and PingLive tips, with "Shop PingLive" below | An inline section, not a pop-up |
| Always | After the first scroll, a sticky bottom bar: "Get the offer" | Within thumb reach; jumps to section 5 |

- **Why:**
  - It opens in about 1 s and plays smoothly on any phone, because video is decoded by hardware.
  - It gets the message across even to visitors who never touch anything.
  - The same loops become the ads, so the ad and the page match.
- **Costs:**
  - There is less play on mobile, because the game becomes optional.
  - The clips have to be recorded from the lab, and recorded again whenever its look changes.
- **Desktop** keeps the full interactive lab under either plan.

## Plan A vs Plan B

| | Plan A: guided game | Plan B: story + optional play |
|---|---|---|
| First thing on screen | A poster, then the 3D in 2–4 s | Video in about 1 s |
| Cheap phones | Needs the smooth mode first | Smooth anywhere (video) |
| "Wow" | Strong: visitors drive it themselves | Medium: they watch, then play if they want |
| Work before launch | Large: performance, layout, tour | Medium: record clips, build the page |
| Ads | Screen recordings | The same clips, so ad and page match |
| Email sign-up | A card after finding the hidden sign | An inline section plus a sticky button |

**Recommendation (revised, decision #47):** since there is no deadline, build the interactive
experience properly along the principles above (Plan A's direction, reshaped by the principles).
Plan B's video story is the fallback for phones that cannot run the 3D, and its loops double as
the ad creative. The earlier "B first because it is faster" advice no longer applies.

## Decisions for Jason (one at a time)

1. ~~Main action~~: decided on 2026-09-24. It is an email sign-up for an offer (A, decision #45).
2. ~~Which plan~~: decided on 2026-09-24 (#47). The interactive experience is the core; video is
   the fallback for phones that cannot run the 3D.
3. **The "aha":** what should a visitor from an ad understand or feel first? (a) "I can see the
   fish under the water on my phone" (new to live sonar); (b) "PingLive's picture is as clear as
   the big brands" (anglers who know LiveScope); (c) "See the fish first, then cast" (the outcome).
   This sets the first ten seconds and the ad hook.
4. **Layout:** screen up, water down (principle 3) versus lake up, sonar down (Plan A's table).
5. **Guidance:** hints the visitor follows, or a tour that moves the boat.
6. **The offer itself:** for example a discount, early access or free shipping.
7. **Where the page lives:** the subdomain (for example `lab.accuphy.com`).
8. **Wording** of the headline, the callouts and the story sections (first drafts exist).
