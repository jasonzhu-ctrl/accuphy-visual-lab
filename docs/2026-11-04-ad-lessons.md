# Lessons from the Mini ad film (r1–r17, 2026-11-03 → 11-04)

Lab HQ, 2026-11-04. Jason: "等lab广告片做完检查一遍 确定之后总结经验 开始做pinglive的稿子". The Mini English film is final
at r17 (Drive `Accuphy Mini Ad handover 2026-11/01-current-cut/FINAL-EN-r17/`, decision #237). Every Lab ad film reads this
first, together with the `ad-video` skill.

## 中文摘要（给 Jason）

1. **先画面后声音。** 画面先定稿，再做旁白和音乐；每轮只改一类东西。
2. **船停在哪、镜头跟不跟船，决定一条片的成败。** 路线按 Jason 自己录的屏来定，镜头要一直跟着船，让整个波束留在画面里。
3. **提示和特效用 Lab 网页自己的样子。** 自己加的粗白圈、大手指被说“太粗、不高级”，发光渐变被说“太AI”。网页里的细圈、小字最好。
4. **旁白一口气读完，只在停顿处剪开。** 一句一句分开生成，语气每句都会重新开始。
5. **字幕给静音看的人，旁白负责气氛，两者可以不同。** 片尾只留 logo 和 SONAR LAB。
6. **直接录每秒 30 帧。** 整条只要几分钟；10 帧预览会一顿一顿，反而让人误会。
7. **量尺寸要在原尺寸的画面上量。** 在缩小的图上量，曾经把安全区算错。
8. **保留画面素材。** 语言版本只换字幕重新合成，不用重录，鱼和镜头逐帧相同。
9. **我们听不到声音。** 响度、时长用数字核对，但好不好听只能 Jason 听。

## Process

- **Order:** storyboard stills (numbered: time, picture, caption, sound) → picture rounds on a feedback page, one comment per
  shot → picture locked → voice and music rounds → 30 fps final → language versions. Mini took 17 rounds in about two days.
- **One change type per round.** r8–r11b changed only sound; r15 only one caption; r17 only shot 2. Jason can then judge one thing.
- **Number every round** (`rNN`), save it in its own folder, add one line to the handover file. Never reuse a number.
- **Ask Jason with cards, one question at a time**, with stills or a short clip to choose from (end card A/B, caption styles A/B/C,
  voice samples). He decides fast from pictures, slowly from text.

## Picture

- **Record frame by frame** from a frozen Lab checkout (`film-base.mjs` on the virtual clock of `rec.mjs`). Nothing drops frames,
  so record **30 fps from the first full preview**: all six passes took about 5 minutes. The 10 fps previews of r1–r15 looked
  choppy and Jason asked why (11-04).
- **Freeze the lake version** the film is recorded from (Mini: `reference/ads/lake-base-96fdc22`, = what visitors see on
  lab.accuphy.ca). Record from the same copy every round.
- **Boat route and camera:** the route came from Jason's own screen recording (`reference/ads/2026-11-bf/base/jason/`), then
  "再往回一点" by 15 ft. The camera must **follow the boat** so the whole beam stays in frame (r6, "镜头最后没有跟着船").
  Check every route on depth and on what the phone shows before rendering (`docs/2026-11-03-ad-base-r5-route-check*.jpg`).
- **Fish are random.** A re-recording differs slightly in fish. To be sure fish are in a beam, use the dev hooks
  (`__chase`, the ice page's `adIce` fish) and check the beam count, as the Mini ice pass does.
- **Cues look like the Lab itself.** The ad's thick ring + big finger was "太粗了 一点不高级" (r16); the fix was the web's own
  thin reticle on the water and its small caption "Drag the boat to move it" (r17). The same rule killed the glowing tile
  effects in the Lab ("太AI了", 10-31).
- **Keep the frames.** `reference/ads/2026-11-bf/base/r17-comp/` holds r17's graded frames and `info.json` (git-ignored,
  ~415 MB). Language versions re-composite the caption layer only.

## Captions and end card

- Style A: Eurostile Heavy head (white ~90 %), a short blue rule, Instrument Sans sub, darkened top; no box.
- **Reels safe band y 269–1248** on 1080×1920. Measure on full-resolution frames: r14's check measured a cropped picture and
  reported the header outside the band when it was 31 px inside.
- Don't break a hyphenated word across lines ("Learn" / "Forward-Facing Sonar", r15). Explicit line breaks are kept (`pre-line`).
- Captions are for muted viewers and may differ from the voice; Jason keeps them as written.
- End card: only the white logo file and "SONAR LAB" (stacked), on black, fade-in and slight scale-up. Nothing else.

## Voice

- Artlist AI voice-over, Eleven v3. Mini: **Adam – American, Dark and Tough**.
- **One continuous take of all lines, cut only in the pauses** (r11, Jason: "每一句停下来再开始语气都会变 很糟糕"). No speed changes;
  shorten the wording instead.
- Inline tags such as `[confident]` before the slogan and `[warmly]` before the end line gave the best rise and fall.
- Adam has no French or Dutch: pick a similar dark, steady male voice from short samples.

## Music and mix

- Only Artlist downloads under the Max Pro plan (keep the licence certificate from the account's License page before the ad runs).
  Final Mini track: **Hype Me Up – Instrumental version (IamDayLight)**; Space Brunch was dropped.
- Land a strong beat on the slogan line.
- Jason on r11: "现在的音乐太轻了 人声太响了". Final: about −14 LUFS integrated (r17: −13.9), true peak ≤ −1 dBTP.
- We cannot hear: report numbers as "not heard yet"; Jason listens to every round.

## Claims and names

- Promise understanding ("Learn …"), never "catch more fish", "see every fish", depth or performance promises. The imagery is a
  simulation. "Free" is true for the Lab only.
- Names as in the app: Forward View, Down View, Live Combo / Combo View, Panoramic. Products: PingLive, PingLive Mini. The demo:
  Accuphy Sonar Lab.

## Coordination

- One chat owns editing, sound and language versions (Lab 广告片); Lab HQ records and composites the picture. The Drive handover
  folder is the shared state; each round adds a line to its change log.
- An approval relayed by another chat is fine for internal rounds, never for anything live or for spending money beyond the plan.
- Language versions: translate captions and voice together, with words local anglers use (Lab 广告片's terms research), plain
  words for the ice shots where ice fishing is rare. Jason chose fr, de, nl, pl (no lv).
