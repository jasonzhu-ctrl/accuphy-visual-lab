# Black Friday ad clips from the Lab (2026-10-26, decision #168)

Lab HQ's order, item 4 of `handoffs/2026-10-26-bf-funnel-lab-extras.md` (BF funnel; Jason 2026-10-16/17: the Lab as the
traffic entry for Meta / YouTube, test budget CAD 2,000, 11/2–11/15, Canada only, French too).

**What was asked:**
- 3 vertical clips of 15 s: ice-fishing Mini drilling a hole and seeing fish, PingLive on the boat, Mini Live Forward.
- Each in 9:16 and 4:5.
- A finger and lit fish within the first 1–2 s.
- English and French caption versions.
- Recorded on the fixed version (#165 lake, #166 wake).

## Where the files are

`reference/ads/2026-11-bf/`. This folder is **not in git**, because `reference/**` is git-ignored. It holds about
280 MB, and **this computer has no backup**.

| File | What |
|---|---|
| `{ice,boat,mini}-916-{clean,en,fr}.mp4` | 1080×1920, H.264, 30 fps, 15 s, ~10 Mbit/s (13–18 MB) |
| `{ice,boat,mini}-45-{clean,en,fr}.mp4` | 1080×1350, same encoding |
| `{ice,boat,mini}-{en,fr}.srt` | The captions as subtitle files, for platforms that take SRT on the clean video |
| `captions.json` | The caption source (start, end, EN, FR); `burn.py` reads it |

**The three clips:**
- **ice:** the ice page in the section view.
  - A fish is already coming to the lure at 0 s; the finger taps open ice at 1 s.
  - The kit drills (the sonar is blank about 1.5–4.5 s), the Mini drops, and a fish comes to the jig at about 5–8 s.
- **boat:** the lake with PingLive in Panoramic View.
  - The finger drags the boat bow-first at 0.4–2.2 s and again at 8–9.6 s.
  - Timber and fish fill the sonar; fish rise toward the boat (dev hook `__chase`).
- **mini:** the lake with PingLive Mini in Live Forward, the same drags; trees and the bottom ahead.

## How they were made (`scripts/dev/ads/`)

- **`rec.mjs`** records each 9:16 clip from the dev server.
  - Viewport 360×640 at 3× gives 1080×1920.
  - The page runs on a virtual clock: `requestAnimationFrame`, `performance.now` and `Date.now` step exactly 1/30 s per
    frame, so the motion is smooth whatever the GPU's speed.
  - Touches are real touch events (CDP), shown by a white finger dot.
  - The "← Lab" button and the cue caption are hidden, because the clip carries its own caption.
- **`to45.py`** makes the 4:5 frames from the 9:16 frames.
  - The whole picture sits centred (759×1350), with a blurred, darkened copy filling the sides.
  - Recording at 4:5 directly did not work: at that ratio the page lays out wide, the boat sits at the right edge and
    a drag takes it out of the frame, and on the ice page the tap misses the ice.
- **`burn.py`** burns the captions in: Instrument Sans (the Lab's UI font, OFL) at weight 620, white on a dark
  translucent pill, two balanced lines.
  - Position: 21.5 % from the top on 9:16, 12 % on 4:5. This keeps clear of the Reels top bar and of the bottom
    third, where the sonar phone and the Shop button are.
- **`frames2mp4.swift`** encodes H.264 MP4 with AVFoundation. This computer has no ffmpeg.
- **`make.sh`** runs all of it.
  - After the captions are final, edit `captions.json`, then run `SKIP_REC=1 sh scripts/dev/ads/make.sh`. That
    re-burns the captions on the existing frames, if they are still in `$WORK`; otherwise run it without `SKIP_REC`
    to re-record.
  - `playwright-core` is not a repo dependency.

## Captions (final, 2026-10-26)

- **English:** Klaviyo HQ's final wording (`IT/Marketing/Klaviyo/Campaigns/2026-11 Black Friday/2026-10-26 广告字幕 定稿.md`).
- **French:** the website HQ's final table (`handoffs/2026-10-26-bf-ad-captions-fr-review.md`). It is burned with a
  no-break space (U+00A0) before the colon and curly apostrophes ’. U+202F is missing from Instrument Sans, so it is
  not used.
- "Simulated demo / Démo simulée" is not added; that waits for Jason.

| Clip | s | EN | FR |
|---|---|---|---|
| ice | 0–2.4 | Tap the ice to drill a hole. | Touchez la glace pour percer un trou. |
|  | 2.4–5 | PingLive Mini drops down the hole. | Le PingLive Mini descend dans le trou. |
|  | 5–8.5 | See the fish under the ice, live. | Voyez les poissons sous la glace, en direct. |
|  | 8.5–12 | Watch them come to your lure. | Regardez-les venir à votre leurre. |
|  | 12–15 | Play the free sonar demo: Accuphy Lab | Essayez la démo de sonar gratuite : Accuphy Lab |
| boat | 0–2.5 | Drag the boat. Watch the sonar. | Faites glisser le bateau. Regardez le sonar. |
|  | 2.5–6 | PingLive in panoramic view: a wide, live picture. | PingLive en vue panoramique : une image large, en direct. |
|  | 6–9.5 | Timber, bottom and fish, in real time. | Arbres immergés, fond et poissons, en temps réel. |
|  | 9.5–12 | Fish light up as the beam finds them. | Les poissons s’allument quand le faisceau les touche. |
|  | 12–15 | Play the free sonar demo: Accuphy Lab | Essayez la démo de sonar gratuite : Accuphy Lab |
| mini | 0–2.5 | Drag the boat. The beam looks ahead. | Faites glisser le bateau. Le faisceau pointe vers l’avant. |
|  | 2.5–6 | PingLive Mini in forward view. | PingLive Mini en vue avant. |
|  | 6–9.5 | See the trees and cover before you get there. | Voyez les arbres immergés et les structures avant d’y arriver. |
|  | 9.5–12 | Find the spot. Then cast. | Trouvez le bon coin. Puis lancez. |
|  | 12–15 | Play the free sonar demo: Accuphy Lab | Essayez la démo de sonar gratuite : Accuphy Lab |

## Re-recorded 2026-10-26 with the #170 fish

All 18 files were recorded again after the #153 round-3 fish went onto the live pages (#170), then burned with the
final captions.

To make the fish read larger without changing their true size, the boat clips shorten the sonar range on the phone
screen ("Range shorter"): Panoramic 80 → 60 ft, Live Forward 80 → 50 ft.

## Known weak points (for HQ / Jason to judge)

- **Small fish:**
  - Ice: the fish on the sonar are small (a perch, a lake trout at the end). Real, but not very loud.
  - Mini Live Forward (50 ft): the trees and cover read big, fish only now and then.
  - A fix would need a staged school of fish. That is a Lab change, not done.
- **Ice timing:** the clip opens with a fish already lit. The tap at 1 s starts a drill, and the sonar is blank for
  about 3 s while the kit drills. That is how the page works.
- **4:5 framing:** the 4:5 frames keep the whole 9:16 picture at 70 % width with blurred sides, not a true 4:5 layout.
- **Boat direction:** the drags go bow-first (to the right), because the hull does not turn (#166; Jason: not to be changed).
- **CTA:** "Play the free sonar demo: Accuphy Lab" (final). The clips carry no BF offer and no price.
- **Not checked:** how Meta crops or overlays these in the Reels / feed preview.

## 中文摘要（给 Jason）

- 三条 15 秒竖屏广告素材已经做好：冰钓钻洞看鱼、船上 PingLive 全景、Mini 前视。每条都有 9:16 和 4:5，各有无字幕、英文字幕、法文字幕三版，一共 18 个视频。
- 文件放在 `reference/ads/2026-11-bf/`，这里**不进 GitHub**（约 280 MB），这台电脑也没有备份。建议我复制一份到 Google Drive。
- 第 1 秒就有手指点冰或拖船，声纳上有鱼和树亮起来。
- 字幕是我起草的：英文交 Klaviyo HQ 定稿，法文交网站 HQ 核。改字幕后几分钟就能重出视频。
- 不足：冰钓和 Mini 前视里的鱼比较小；4:5 是把竖屏画面放在中间、两边用模糊背景补齐。
