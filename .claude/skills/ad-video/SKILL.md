---
name: ad-video
description: Make Accuphy Lab ad videos (stills, 15 s films, 9:16 / 4:5, EN / FR) recorded from the 3D sonar lake — use for any ad still, ad film, caption or format work. The procedure and the rules of the ad video chat.
---

# Ad videos from the Lab

Owner: the chat **"广告视频制作"** (decision #179, Jason 2026-10-27: "做广告视频……单独制作视频……视频制作专门让他做"). It reports to
Lab HQ (`local_1022478a-b63a-4fff-8403-7c58646dab95`).

## Role since 2026-10-28 (#183, #185) — read first

Jason, 2026-10-28: "广告我们目前为止先不做了，孙英杰那边在优化……这种小视频不做了。做的话，你也就做一个就可以了……只是为了跑通项目为主嘛，
跑通那漏斗啊，跟投放那些测试走嘛，但不要花精力继续做各种版本的……横版竖版为了去跑通是没问题的，那多语言版本完全没必要".
- **No ad versions:** no language versions, no Mini US film, no 1:1, no other cuts. His colleague 孙英杰 (AJ-nb) is optimizing
  the ad films.
- **At most ONE film**, the one Jason names, only to run the funnel and the ad-delivery tests through. Its vertical and
  horizontal formats are allowed. Start it only on Jason's word, relayed by HQ.
- Already made and kept, not pushed further: the PingLive v3 EN and FR files in `reference/ads/2026-11-bf/v3/`. The shot plans
  in `scripts/dev/ads/` stay as reference.

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

## Where things stand (2026-10-31)

This lane is **paused** (#183, #185). Nothing is rendered or recorded unless HQ relays Jason's go for one named job.

- **The one test film (#185, Jason 10-28 "用 Mini 的片子"):** PingLive Mini, English, 15 s, silent, for the funnel and ad
  tests in Canada and the US (11-02 on). Four files in `reference/ads/2026-11-bf/mini-test/`: `plm-test-916-en.mp4` and
  `plm-test-169-en.mp4` (with the type), `plm-test-916-clean.mp4` and `plm-test-169-clean.mp4` (no type). 9:16 and 16:9
  only. HQ checked it from the sheets on 10-28 (`docs/2026-10-28-ad-mini-test-916-sheet.jpg`, `-169-sheet.jpg`).
  - **Backed up on the shared Drive** with a 说明.txt: Accuphy Public Drive → Marketing → 05_Paid Ads → Paid Ads →
    2026-11 Black Friday（Lab 广告）→ "Mini 测试片 2026-10-28". Byte-identical to the local files.
  - It was recorded from a clean checkout of the lake at 479ca21 (Mini-only build). The recorder is `FILM=mini` in
    `scripts/dev/ads/v3/film3.mjs`, the type layer `overlay-mini.html`; the shot plan and build notes are in
    `scripts/dev/ads/v3/README.md` ("Mini US" and "Mini test film: built").
  - The English lines are placeholders (`lines-mini.json`); only the end card ("Play the free sonar demo" /
    "Accuphy Lab") is final.
- **PingLive v3** (`reference/ads/2026-11-bf/v3/`, 9:16 and 4:5, EN and clean, plus the French `pinglive-*-fr.mp4` with the
  website's final lines): kept, not pushed further. The four English v3 files also sit on the Drive as a draft
  ("v3 草稿 2026-10-27", copied by IT & HR on 10-28, before #185). The French files are local only.
- **No "Simulated demo" tag in the corner** (Jason 10-29: "不加"). The caption-burning script stays as it is. Klaviyo says
  the demo is simulated in the ad text.
- **Open video questions** live in Klaviyo's `Campaigns/2026-11 Black Friday/视频问题清单.md`, owned by the BF funnel chat,
  not by this one. Two of them would mean a new render here if Jason answers yes: the end card name ("Accuphy Sonar
  Lab" in the ads), and the placeholder lines. Do not act on them until HQ relays his answer.
- **孙英杰 (AJ-nb) optimizes the single-language masters** (PingLive v3, US Mini, 16:9, 1:1; #183). His pull requests
  #30 and #31 are reference only, not merged (Jason 10-30). This chat makes language versions only when HQ relays an
  approved master and Jason's go (#185: no language versions for now).
- **Earlier work:** v2 (`scripts/dev/ads/v2/`), the BF clips (#168, `docs/2026-10-26-bf-ad-clips.md`), the numbers draft
  (`scripts/dev/ads/numbers/`), the v3 stills (`docs/2026-10-27-ad-v3-stills-r3.jpg`).
- **`reference/ads/` has no backup of its own.** The Drive copies above are the only other copy. Local
  `reference/ads/lake-checkout/` and `lake-mini-479ca21/` are throwaway lake checkouts for recording.
