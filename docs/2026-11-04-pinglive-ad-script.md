# PingLive ad film: script v1 (Lab HQ, 2026-11-04)

Jason 2026-11-04 in Lab HQ: "开始做pinglive的稿子 pinglive要比mini的更精彩 可以从头搞 船的定位的位置特别重要 然后你来写稿子
安排窗口出英语样片 明天我看下". This is HQ's script. A new chat, "Lab PingLive 广告片", turns it into an English sample for Jason to
watch on 11-05. Read `docs/2026-11-04-ad-lessons.md` first: it holds everything the Mini film taught.

## 中文摘要（给 Jason）

- **一条竖版 34 秒，英文，只给加拿大**（美国 2 月前不卖 PingLive）。目标和 Mini 一样：让人点进免费的 Sonar Lab。
- **比 Mini 更精彩的地方：** 一开场就是 135° 的宽波束在水上展开；一条片里用三种视图（Forward、Down、Panoramic）；
  看两条沉船（小工作船在下面、大货船在前面）；镜头动作更大，每段都有一个“哇”的瞬间。
- **船的位置是重点：** 每段都按水深、波束里有没有结构和鱼来选位置；下面表里是我的起点，做片的窗口先在湖里逐个试，
  量过波束里的鱼和结构再定。
- **沿用 Mini 定好的：** 字幕样式、片尾只有 logo + SONAR LAB、Adam 的声音一口气读、Hype Me Up 配乐、细圈拖船提示。
- 明天你看的是**第一版英语样片**（每秒 30 帧，带旁白和音乐），加一张每段机位的静帧总览。

## The film

- **PingLive** (135° × 20° beam; views Down, Forward, Panoramic; specs only from `accuphy-website/docs/specs.md`).
- **Market:** Canada only (no PingLive in the US before February). English first; fr-CA may follow.
- **Format:** 9:16, 1080×1920, 30 fps, ~34 s. Horizontal later.
- **Viewer:** a Canadian angler with an aluminium fishing boat who has heard of live sonar (market research: 16–18 ft aluminium
  boats, walleye country; PingLive is 76 % of web-shop sales). Not a bass-pro boat as the hero.
- **Goal:** tap through to the free Accuphy Sonar Lab.
- **What makes it more exciting than Mini:** the 135° fan unfolding wide in the first second; three views in one film; two wrecks;
  bigger camera moves (low sweep, climb to top-down for Panoramic, reveal of the cargo ship); a beat on every view change.

## Shot list (v1)

Positions are starting points in lake metres (x, z), from the lake's own layout; depths from `terrain.js`. The sample chat checks
each one on screen and on the phone before rendering (see "Boat positions").

| # | Time | Picture | Caption (head / sub) | Voice (Adam, one take) |
|---|---|---|---|---|
| 1 Hook | 0–3.5 | Low, behind the boat on the timber flat; the **135° Forward fan unfolds** from a slit to full width across the frame. Header ACCUPHY \| SONAR LAB. | **135° of live sonar.** / PingLive | This is PingLive. One hundred thirty-five degrees of live sonar. |
| 2 Drag | 3.5–8.5 | The boat is dragged toward the island timber; the web's thin reticle rides with it, the small hint "Drag the boat to move it" for the first 2 s; the camera follows, the whole wide fan stays in frame. | **Drag the boat.** / The wide beam sweeps the timber. | Drag the boat. Sweep the timber. |
| 3 Phone Forward | 8.5–13.5 | The phone pops up: **Live Forward**, trees and bass in a wide picture. | **Your phone is the screen.** / Trees and fish, as they move. | Watch it live, right on your phone. |
| 4 Down | 13.5–18.5 | Cut to the small wreck: side view, the **Down fan** straight under the boat over the sunken workboat; the phone slides in with **Live Down** showing the wreck. | **Live Down.** / What's right under the boat. | Switch to Down. The wreck, right under you. |
| 5 Panoramic | 18.5–24.5 | The camera **climbs to almost top-down**; the fan lays flat ahead of the bow over the shelf's schools; the phone shows **Panoramic** with marks spread across it. | **Panoramic.** / See what's around the boat. | Go Panoramic. See what's around you. |
| 6 Reveal | 24.5–30 | Forward again at the **cargo ship**: the camera pulls back and up to reveal the whole wreck inside the wide beam, fish around it; the phone picture of the ship for the last second. | **Built for open water.** / PingLive on your boat. | Be part of the action. |
| 7 End card | 30–34 | Black. White logo + "SONAR LAB" (stacked), as the Mini film. | (none) | Try it free, right in your browser. |

Wording notes: captions follow Mini's rules (full sentences end with a full stop; a head that runs into its sub has none). Names as in
the app. No "catch more", no range or depth promises (no "230 ft" on screen). "Your phone is the screen" is the market research's
DJI-style answer to "a phone isn't serious". The slogan "Be part of the action." lands on the music's strongest beat, as in Mini.

## Boat positions (the part Jason called most important)

Starting points, all from the frozen lake `reference/ads/lake-base-96fdc22` (the Lab visitors see):

| Shot | Boat (x, z), heading | Depth | Why |
|---|---|---|---|
| 1–2 | from about (0, 12) heading +x, dragged to about (14, 11) | 31 → 22 ft | the timber flat the phone opens on; bass hold on the island timber at (28, 10) and (31, 14), walleye at (10, 24); the 135° fan covers both groups and the trees |
| 3 | where shot 2 ends | ~22 ft | trees + bass in the Forward picture |
| 4 | over the small wreck (16, −26), heading +x | ~65 ft | the 10 m workboat under the boat for Down; walleye at (4, −20) |
| 5 | about (−10, 4) heading −x (west, toward the shelf) | ~30 ft | crappie schools at (−14, −4), (−21, 15), (−27, 4), largemouth at (−35, 9), perch on the shelf at (−31, −13): many marks across the flat fan |
| 6 | ahead of the cargo ship at (58, −47), heading toward it | check | the biggest structure in the lake; lake trout at (46, −36) |

**How the sample chat confirms each position (before rendering):**
1. Depth under the boat and the auto range on screen.
2. Fish inside the active beam over the shot's seconds (aim: Forward 4–8, Down 4–8, Panoramic 6–10, Jason's targets of 10-31),
   using the `__chase` hook if the count is short; structure clearly visible on the phone.
3. Beam fully in frame for the whole shot (log the fan's corners on screen, as `film-base.mjs` does).
4. One still per shot on a sheet with the depth and fish count written under it.
If a starting point fails, move the boat (not the beam, not the fish layout) and say where and why.

## What the sample uses

- Lake: `reference/ads/lake-base-96fdc22` served by "ad-lake-base" (port 5192); PingLive is the default device there.
- Recorder: a copy of `scripts/dev/ads/base/film-base.mjs` for PingLive (new passes and cameras); comp `comp-base.mjs` +
  `overlay-base.html` (style A, lab cue, end card stack) with a new lines file.
- Voice: Adam – American, Dark and Tough, one continuous take of the 7 lines, cut in the pauses (Artlist, ~70 credits).
- Music: Hype Me Up – Instrumental version (IamDayLight), already licensed for the Mini film.
- Mix: about −14 LUFS, true peak ≤ −1 dBTP.

## Open for Jason (after he sees the sample)

1. Does the order of views work (Forward → Down → Panoramic → Forward reveal)?
2. Any position that should move.
3. Same music as Mini, or a different track for PingLive.
