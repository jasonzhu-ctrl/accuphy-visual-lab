# PingLive ad r1: boat positions (2026-11-05)

Chat "Lab PingLive 广告片", for Lab HQ's script `docs/2026-11-04-pinglive-ad-script.md`. Jason 11-04: "船的定位的位置特别重要". The sheet
with one still per shot is `docs/2026-11-05-pinglive-ad-r1-positions.jpg` (also in Drive `Accuphy PingLive Ad 2026-11/r1/`).

## 中文摘要（给 Jason）

- 六个镜头的船位都在冻结的湖（96fdc22，就是访客看到的 Lab）里先试过：看水深、波束里的鱼、手机上的结构、整个波束在不在画面里。
- 和稿子比，改了两处位置：**全景（Panoramic）**稿子写船头朝西，但船头在 Lab 里永远朝东，所以船放到浅滩**西边** (−44, 6)，
  波束朝东扫过大口黑鲈、莓鲈群（crappie）、石头和树桩，范围 60 ft（80 ft 时波束里有 21–31 条鱼，太多）；**大货船**：船放在大货船西边 30 m (24, −46)，
  Forward 140 ft，整条船都在波束里。
- 鱼数（波束里，整段的最少–最多）：开场 9，拖船时 0–9、到树林时只剩 1（Lab 里船一动鱼就离开波束，下一段手机同一位置马上是 8），手机 8，Down 5，全景 10–11，
  大货船 9。目标是 Forward 4–8、Down 4–8、全景 6–10（10-31）：大货船和全景各多 1–3 条，拖船结束时少。

## The positions

Every boat move in the Lab is bow-first (+x, east): the hull never turns (#166), so the boat sits WEST of whatever a view should see.
Depths are the phone's own read-out. Fish = `__beamFish()` (fish inside the active beam) logged on every 30 fps frame.

| Shot | Boat (x, z) | View / range | Depth | Fish in beam | Why |
|---|---|---|---|---|---|
| 1 Hook | (0, 12) | Forward 80 ft | 31.0 ft | 9 | the timber flat: the bottom rises to the island, timber at the far end; the slit-to-135° fan reads in its own plane |
| 2 Drag | (0, 12) → (14, 11) | Forward 80 ft | 31 → 21.1 ft | 0–9, 1 at the end | dragged east onto the island timber: trees in the curtain at the end (fish leave a moving boat in the Lab; they come back within seconds) |
| 3 Phone | (14, 11) | Forward View 80 ft | 21.1 ft | 8 | trees and bass in the Forward picture |
| 4 Down | (14, −26) | Down View, AUTO 90 ft | 64.4 ft | 5 | the transducer (boat + 2.1 m) right over the 10 m workboat (16, −26): the wreck in the middle of the Down picture |
| 5 Panoramic | (−44, 6) | Panoramic View 60 ft | 18.4 ft | 10–11 | the west shelf seen from its west end: crappie (−27, 4), (−21, 15), largemouth (−35, 9), the rock and timber on the phone |
| 6 Reveal | (24, −46) | Forward View 140 ft | 78.5 ft | 9 | 30 m west of the cargo ship (58, −47): the whole ship inside the curtain and on the phone |

## What was tried and dropped

- **Panoramic at (−10, 4) heading west** (the script): the Lab's fans only point east, so from there the fan looked away from the shelf
  (7 fish, no structure). (−40, 8) at 80 ft had 30–31 fish and (−44, 6) at 80 ft 21–23: too many marks to read. (−44, 6) at 60 ft: 9–11.
- **Cargo ship at (30, −44), 120 ft:** the ship fills the right edge of the picture; (24, −46) at 140 ft keeps the whole ship in the
  curtain with water before it.
- **Down at (16, −26)** (the wreck's own point): the transducer sits 2.1 m ahead of the boat's centre, so the boat goes to (14, −26).
- **Hook from straight behind:** the 135° Forward fan is a vertical fan; from behind it is edge-on. The camera starts low behind-left
  and cranes round so the fan opens in its own plane.
