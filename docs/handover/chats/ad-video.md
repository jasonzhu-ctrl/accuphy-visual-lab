# Handover: 广告视频制作 (ad-video chat), 2026-10-31

Plan B of Lab HQ's tidy-up: this window is archived. A new ad window opens only when Jason names a film. The `ad-video`
skill (`.claude/skills/ad-video/SKILL.md`) holds the rules and the current state; this note adds only what it does not say.

## 1. Lane
- **Mine:** `scripts/dev/ads/`, `reference/ads/`, the ad boards and briefs in `docs/` (`*-ad-*`), the Drive copies of the films (#179).
- **Never:** the lake scene and the sonar (`src/experiments/2026-09-23-sonar-lake-3d/`, #176). Dev hooks or camera knobs go
  to "冰钓版本视觉效果". Nothing is uploaded to Meta, YouTube, Shopify or any public place by this chat.
- **Paused** since 10-28: **#183** (孙英杰 / AJ-nb optimizes the single-language masters; his PRs #30 and #31 are reference
  only, not merged) and **#185** (no more versions, no languages; at most the ONE film Jason names).

## 2. State now
- **My last commit:** `6d4c9f8` (skill section brought to 10-31). The ad scripts' last change: `25ae38d` (the README: `5bfe719`). All pushed to both
  GitHub copies; nothing of mine is uncommitted.
- **The one film (#185):** PingLive Mini, English, 15 s, silent. `reference/ads/2026-11-bf/mini-test/`:
  `plm-test-916-en.mp4` 14.0 MB, `plm-test-169-en.mp4` 14.8 MB, `plm-test-916-clean.mp4` 17.1 MB, `plm-test-169-clean.mp4`
  18.0 MB. HQ checked it from the sheets on 10-28. Nothing from this lane is live that I know of.
- **Other local films (all git-ignored):**
  - `reference/ads/2026-11-bf/v3/`: PingLive v3 (`pinglive-916|45-en|clean|fr.mp4`), plus `preview/` (outdated first-round 10 fps
    previews) and `stills/`.
  - `reference/ads/2026-11-bf/{boat,ice,mini}-{916,45}-{clean,en,fr}.mp4`: the old BF clips (#168), superseded by v3.
  - `reference/ads/lake-checkout/` (git archive of lake commit `1abeedf`, for v3) and `reference/ads/lake-mini-479ca21/`
    (for the Mini film, Mini-only build): throwaway recording checkouts, `node_modules` linked to the repo's.
- **Drive** (shared drive "Accuphy Public Drive" → Marketing → 05_Paid Ads → Paid Ads → "2026-11 Black Friday（Lab 广告）",
  <https://drive.google.com/drive/folders/19uROhYKGDWNMzHJ-e1YXdHG9yVDz9-vm>):
  - "Mini 测试片 2026-10-28" (<https://drive.google.com/drive/folders/1jNYiKwKVre8dh-Z8BP0HDhVGHiuLAJfZ>): the 4 films + 说明.txt,
    byte-identical to the local files.
  - "v3 草稿 2026-10-27": the 4 English v3 files + 说明.txt (IT & HR copied them 10-28, before #185). The French v3 files are
    local only.
  - **`reference/ads/` has no backup of its own.** The Drive is the only other copy. This computer has no backup.
- On this computer the shared drive is mounted at `~/Library/CloudStorage/GoogleDrive-jason.zhu@accuphy.ca/Shared drives/`.
  A new folder's link: `xattr -p "com.google.drivefs.item-id#S" <folder>` → `https://drive.google.com/drive/folders/<id>`;
  wait until every file in it has such an id before saying it is uploaded.

## 3. In flight
Nothing. No recording, render or upload is running or half done.

## 4. Waiting on
All three live in Klaviyo's `IT/Marketing/Klaviyo/Campaigns/2026-11 Black Friday/视频问题清单.md`, owned by the BF funnel
chat, which asks Jason (HQ will not ask a second time, 10-31). Raised 10-29, answers still blank:
- **Q2:** does the end card change from "Accuphy Lab" to **"Accuphy Sonar Lab"** (the ads call the demo that)? Yes = a new type
  pass on the Mini film.
- **Q3:** Jason said on 10-28 "视频还要改的". What exactly? The Mini film, or the later masters?
- **Q8:** the film's lines are placeholders. Keep or change them, e.g. "Serious deep water ready." (a vague performance claim
  over simulated footage; Klaviyo suggests "See it before you go." or dropping it)? A change = a new type pass.
- Also open there, not mine: Q5 (when 孙英杰's masters are ready), Q6 (French and European versions, later), Q7 (YouTube ads, not now).

## 5. Know-how not in the repo
**The temporary working folder is gone** (it died with the session): the installed `playwright-core`, the compiled
`frames2mp4`, my probe scripts, the render scripts and every graded frame. The repo scripts and the film files are intact.
Rebuilding takes about 10 minutes:
- **Toolchain.** `playwright-core` must be **1.63.0** (`npm i playwright-core@1.63.0` in a scratch folder): the cached browser is
  Chromium build 1243 in `~/Library/Caches/ms-playwright`, and the newest version wants a build that is not cached. The scripts
  import `playwright-core` bare, so run copies of `scripts/dev/ads/v3/*.mjs` from a folder whose parent has a `node_modules`
  link to that install. Build the encoder: `swiftc -O scripts/dev/ads/frames2mp4.swift -o <scratch>/frames2mp4`. There is no
  ffmpeg; use PIL for images.
- **Creative Cloud must be running:** Eurostile Heavy comes from it through `local('Eurostile Heavy')`. `comp3.mjs` stops with
  an error if it did not load. Never use `public/brand/fonts/Eurostile-Heavy.otf` (licence unverified).
- **Servers.** `.claude/launch.json` has `ad-lake` (port 5190, checkout of `1abeedf`) and `ad-lake-mini` (port 5191,
  `VITE_DEVICES=PLM`, checkout of `479ca21`). Start them with the Browser preview tool; the app may stop one after about an
  hour. A checkout: `git archive <commit> | tar -x -C reference/ads/<dir>` and `ln -sfn ../../../node_modules <dir>/node_modules`.
  Record from a clean checkout of the lake commit in `docs/versions.md`, never from the shared working copy.
- **Rebuild the Mini film** (for each aspect `A` in `916`, `169`; `$W` is a scratch folder):
  1. `FILM=mini ASPECT=$A node film3.mjs open|pano|deep $W/$A/<pass> 5191 30` (use fps 10 for a preview; frames are named by
     the 30 fps frame number, so previews and finals line up).
  2. `python3 scripts/dev/ads/v3/grade.py $W/$A/<pass> $W/$A/comp/bg`. The comp folder also needs `overlay-mini.html`,
     `fonts/InstrumentSans-Variable.ttf` (from `public/brand/fonts/`) and `logo.png` (= `public/brand/logo/White Accuphy Logo.png`).
  3. `ASPECT=$A OVERLAY=overlay-mini.html AD_LINES_FILE=scripts/dev/ads/v3/lines-mini.json node comp3.mjs $W/$A/comp $W/$A/final`
     (add `clean` as the last argument for the version without type).
  4. `frames2mp4 $W/$A/final out.mp4 30 10000000`. 4:5 is `scripts/dev/ads/to45.py`.
  5. `python3 scripts/dev/ads/v3/sheet3.py $W/$A/final sheet.jpg <frame numbers> --reels [--wide]` for the contact sheet.
  - PingLive v3 is the same with `film3.mjs` without `FILM=mini`, `overlay3.html`, and the pano pass's `frames.json` copied as
    `pano.json` into the comp folder. The v3 stills use `v3a.mjs`, `v3deep.mjs`, `grade.py`, `stills3.mjs` (see the README).
  - **A change of lines or the end card needs steps 1–4 again**, because the graded frames are gone: about 25 minutes of
    recording for both formats (my estimate from the v3 render). Re-typing from the clean MP4 would add a second compression.
    Lines only: `lines-mini.json` (Mini) or `lines-fr.json` (French v3). `AD_LINES_FILE` / `AD_LINES`, **not** `LINES`: zsh keeps
    `LINES` for the terminal height and refuses text in it.
- **zsh traps.** `for ap in "916 pano"; do node x $ap` does not split `$ap` into words (the run silently ran nothing); write the
  arguments out. A directory that does not exist yet makes a log redirect fail without running the command.
- **Camera facts.** An elevation below ~26° makes the water mirror the sky and hide the coverage block. For the 16:9 low camera,
  moving the look point along z shifts the boat sideways; along x it tilts the camera. The Mini's fan in the engine is ±21.5°
  (43°); the spec says 39°. No number is shown, so it did not block the ad; I told 冰钓 (not fixed to my knowledge).
- **Lifting the phone** out of the bottom zone (no lake code): inject
  `[data-hint-avoid]{transform:translateY(-215px)}` (9:16 phone layout; 157 px for the 16:9 desktop layout). The page draws the
  sonar into the frame's on-screen rect every frame, so the picture follows. `film3.mjs` does it.
- **Hooks that worked** (dev only): `__sonarState.camOverride` (`noLogo` hides the lakebed lockup from the 3D camera only), `fanOpen`
  (both Combo curtains), `adClean`, `adBeam`, `__chase('largemouth')`, `window.__camera`, `__lakeSnap()`. `__chase('laketrout')` at
  ~100 ft answers `blocked`; the trout swim on their own. Live Combo over the 110 ft hole paints the lakebed "ACCUPHY LAB"
  lettering into its Forward panel (`noLogo` does not reach the sonar), so the deep shot uses Live Down.
- **Safe zones are approximate.** Reels 14 % top / 35 % bottom / 6 % sides come from third-party checkers quoting Meta
  (Meta's own page was not reached); the YouTube zones (bottom 15 %, Skip button, top-left badge) are my rough version.
  Neither was checked against the platform's spec sheet.
- **Git.** `git pull --autostash` in the shared copy briefly stashed another chat's uncommitted files; don't use it. Stage by path,
  `git commit -- <paths>`, push goes to both copies (#194). The repo address moved to the `accuphy-marketing` organization;
  pushes still work.

## 6. Jason's preferences I learned
- 高级感 / 科技感 first (memory `visual-premium-tech-feel`, 2026-09-24).
- 2026-10-26 (HQ's v3 brief quotes him): the opening magnified sonar "看起来很糙，放大以后都不太好看，要换策略"; the 135° beat must be spectacular
  ("镜头拉起来一定要够精彩"); a 230 ft claim is "过度宣传" and was dropped.
- 2026-10-27: the stills "三张定格可以，做 15 秒成片" (relayed by HQ). 10-28: "用 Mini 的片子" (relayed by HQ).
- **2026-10-28, to this chat, directly:** "广告我们目前为止先不做了，孙英杰那边在优化……这种小视频不做了。做的话，你也就做一个就可以了……
  只是为了跑通项目为主嘛，跑通那漏斗啊，跟投放那些测试走嘛，但不要花精力继续做各种版本的……横版竖版为了去跑通是没问题的，那多语言版本
  完全没必要" (#185).
- 2026-10-29: no "Simulated demo" tag in the corner: "不加" (from Klaviyo's list). The ads call the demo "Accuphy Sonar Lab".
- 2026-10-30: every question to Jason goes in a clickable card (memory `questions-as-cards`).

## 7. Read first
1. `.claude/skills/ad-video/SKILL.md`
2. `docs/decisions.md` #179, #183, #185
3. `scripts/dev/ads/v3/README.md` ("Mini US", "Mini test film: built", the v3 shot plan, "Language versions")
4. `IT/Marketing/Klaviyo/Campaigns/2026-11 Black Friday/视频问题清单.md`
5. `docs/2026-10-26-ad-v2-pinglive-brief.md` (the v3 brief is at the end)
6. `docs/lake-canon.md` and `CLAUDE.md` (#176, #183)
7. The sheets: `docs/2026-10-28-ad-mini-test-916-sheet.jpg`, `-169-sheet.jpg`, `docs/2026-10-27-ad-v3-stills-r3.jpg`
