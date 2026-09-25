# Mobile plan: Accuphy Lab as an ad landing experience

**Status:** proposal, 2026-09-24, waiting on Jason (see "Decisions for Jason" at the end).
Jason asked: 移动端你帮我策划一下我应该怎么搞合理好用 符合我们最终用于体验营销.

**Inputs:** the real-device test (backlog, "Mobile + Meta ads readiness") and decisions #38–#40.

## Goal

A visitor from a Meta ad arrives on a phone, in portrait, inside the Facebook or Instagram
in-app browser. On the page they should:

1. see something within 1 s;
2. get the "so that's what PingLive shows" moment within about 10 s;
3. finish a short guided play in about 60 s;
4. leave an email for an offer, or tap through to the shop.

## The 60-second experience (portrait)

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

- **Primary (proposed):** an email sign-up for an offer through Klaviyo. Show it after the "aha"
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

## Order of work

1. Smooth mode and a lighter first load. Everything else depends on these.
2. The portrait redesign: a big sonar picture, big buttons and the bottom sheet. This also fixes
   the 360 px overlap.
3. The guided tour with automatic scenes, the hidden-sign challenge and the calls to action.
4. Klaviyo, the Meta Pixel, UTM tags and public hosting.
5. A pass on real devices: an iPhone and a cheap Android, inside the Facebook and Instagram apps.
6. A small-budget ad test. After that: the landscape layout, the video fallback and more scene
   links.

## Decisions for Jason (one at a time)

1. **Main action:** an email for an offer (recommended), or straight to the shop.
2. **The offer itself:** for example a discount, early access or free shipping.
3. **Where the page lives:** the subdomain.
4. **Wording** of the headline and the step cards (first drafts exist).
