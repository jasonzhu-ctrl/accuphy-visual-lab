---
name: ad-video
description: Make Accuphy Lab ad videos (stills, 15 s films, 9:16 / 4:5, EN / FR) recorded from the 3D sonar lake — use for any ad still, ad film, caption or format work. The procedure and the rules of the ad video chat.
---

# Ad videos from the Lab

Owner: the chat **"广告视频制作"** (decision #179, Jason 2026-10-27: "做广告视频……单独制作视频……视频制作专门让他做"). It reports to
Lab HQ (`local_1022478a-b63a-4fff-8403-7c58646dab95`).

## Role since 2026-10-28 (#183)

Jason handed every ad film's **single-language master** to his colleague 孙英杰 (GitHub AJ-nb). That covers the PingLive
v3 film, the US Mini film and the 16:9 / 1:1 formats. Jason agrees the changes with him. **This chat makes the language
versions** (FR, DE, NL, PL, LV…) from the approved masters: type passes on the clean films, the 4:5 and other crops, the
encodes. It starts a language only when HQ relays Jason's go. The shot plans and scripts in `scripts/dev/ads/` stay as
reference for the colleague.

## What this chat may and may not touch

- **Yours:** `scripts/dev/ads/`, `reference/ads/` (git-ignored, see Storage), ad briefs and boards in `docs/` (`*-ad-*`).
- **Never yours: the lake scene and the sonar** (`src/experiments/2026-09-23-sonar-lake-3d/`, #176). Only
  "冰钓版本视觉效果" (`local_9a5a9e56-c21c-4be3-8006-c552790ba7ce`) changes them. If a shot needs a new dev hook, a camera
  knob, a fish placed or a look changed, send it the request (copy HQ) and wait. The canon is `docs/lake-canon.md`.
- Existing dev-only hooks (they never reach a built page): `__sonarState.camOverride` (`noLogo`), `fanOpen`, `adClean`,
  `adBeam`, `adFlash`, `window.__camera`, `__lakeSnap()`, `__sonarFlat(w, h)`, `__chase`, `__jig` (ice page).
- Git: shared working copy. `git status` first, stage by path, `git commit -- <paths>`, push right away. Decisions go to
  `docs/decisions.md` (re-read the last number before appending).

## Approval chain (never skip)

1. Brief → **stills first** (one board image in `docs/`) → **HQ checks** → HQ shows Jason.
2. **The film only after Jason nods the stills** (relayed by HQ with his words).
3. Final copy: English lines go to Klaviyo HQ (`IT/Marketing/Klaviyo/handoffs/`), French to the website HQ
   (`IT/accuphy-website/handoffs/`). Until they answer, lines are marked placeholder.
4. Nothing is uploaded to Meta, YouTube, Shopify or anywhere public by this chat.

## Content rules

- **Claims:** specs only from `IT/accuphy-website/docs/specs.md` (PingLive 135° × 20°, 70 m / 230 ft max range; Mini
  39° × 20°). No theoretical or exaggerated numbers (Jason dropped the 230 ft beat as "过度宣传"). Depth is shown by the
  app's real read-out on the phone, not a big number. The only big number in v3 is 135°.
- **Look:** Jason's top rule is 高级感 / 科技感 (memory `visual-premium-tech-feel`). The sonar appears at the phone's real
  size or not at all (no magnified sonar). Keep the beam and coverage clear of the phone; type big enough to read on a
  phone.
- **Audience:** read `docs/market/README.md` and the Drive knowledge base `My Drive/Market Research/README.md` before
  writing lines. Real buyers are Canadian ice / portable / value anglers, not bass pros.
- **Product order (#174):** PingLive first, made very well, as the template for Mini, ice, 4:5 and French.

## Brand

- Display type: **Eurostile Heavy from the company's Creative Cloud activation** via
  `@font-face{font-family:'Eurostile Heavy';src:local('Eurostile Heavy'),local('Eurostile-Hea')}`. Creative Cloud must
  be running. **Never** use `public/brand/fonts/Eurostile-Heavy.otf` in an ad (licence unverified).
- Body type: Instrument Sans (OFL, in the repo). Brand blue `#028CDF`. The ACCUPHY wordmark top left (see
  `scripts/dev/ads/v2/overlay2.html`).

## Pipeline (`scripts/dev/ads/`)

- **Dev server:** `npm run dev` (port 5173) for the dev hooks. Use the Browser preview tools to start it, never a bare
  background shell.
- **Playwright:** not a repo dependency. Install once into your scratchpad: `npm i playwright-core` in
  `<scratchpad>/pw`, and import it as `import pkg from '<scratchpad>/pw/node_modules/playwright-core/index.js'; const
  { chromium } = pkg`. The Chromium build is already cached in `~/Library/Caches/ms-playwright`.
- **Recording (`rec.mjs`):** 360×640 at 3× = 1080×1920; a virtual clock steps rAF, `performance.now` and `Date.now` exactly
  1/30 s per frame, so motion is smooth whatever the GPU's speed; touches are real CDP touch events with a white finger dot.
- **Stills and backgrounds:** `v3/v3a.mjs`, `v3/v3deep.mjs`, `v3/stills3.mjs`, type layer `v2/overlay2.html`; grade with PIL
  (lake ×1.2, a little cooler). Each folder's README has the exact cameras.
- **4:5:** `to45.py` centres the 9:16 picture (759×1350) on a blurred, darkened copy. Don't record at 4:5 (the layout
  changes).
- **Captions:** `captions.json` + `burn.py` (Instrument Sans 620, dark pill, 21.5 % from the top on 9:16, 12 % on 4:5);
  SRT files for platforms that take them.
- **Encoding:** `frames2mp4.swift` (AVFoundation H.264, 30 fps, ~10 Mbit/s). **There is no ffmpeg** on this Mac; use
  PIL for crops and conversions.
- `make.sh` runs the whole BF clip set (#168).

## Formats

- 9:16 1080×1920 and 4:5 1080×1350, 15 s, 30 fps, H.264. Keep text out of the Reels top bar and the bottom third.

## Storage

`reference/ads/**` is git-ignored and **this computer has no backup**. Small boards and stills go in `docs/` (in git).
When a film is approved, tell HQ so the finals can be copied somewhere safe.

## Where things stand (2026-10-27)

- Brief: end of `docs/2026-10-26-ad-v2-pinglive-brief.md` (第 3 版 + "Jason 10-27 定（#174）").
- Stills, PingLive only: `docs/2026-10-27-ad-v3-stills-r3.jpg` (opening, 135°, deep water at ~100 ft over the hole).
  Waiting for Jason's nod before the 15 s film.
- Earlier work: v2 (`scripts/dev/ads/v2/`), the BF clips (#168, `docs/2026-10-26-bf-ad-clips.md`), the numbers draft
  (`scripts/dev/ads/numbers/`).
