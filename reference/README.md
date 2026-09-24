# reference/

Input material for experiments — not code. **Everything here except this
README is gitignored** (videos and large PNGs); the originals live in Jason's
Google Drive and are copied in from the local Drive sync folder
`~/Library/CloudStorage/GoogleDrive-jason.zhu@accuphy.ca/Shared drives/`.

Copied 2026-09-23. To re-copy, see the source paths below.

## recordings/ — real app screen recordings (sonar look source of truth)

| Local folder | Source (Shared drives/…) | Files |
|---|---|---|
| `recordings/pinglive/` | `CA Authorized Dealers/Dealer Digital Assests/Master Version/PingLive Screen Recordings/` | 3257, 4479_raw, 6041_raw, 6089, 86789ab9…, b5690b3e…, ScreenRecording_09-23-2026 19-42-23, …19-45-33 |
| `recordings/pinglive-mini/` | `…/Master Version/PingLive Mini Screen Recordings/` + `Distributors/Prime Sports/09.23.2026 Graphics/` | Mini Combo View-04-30, Mini Down View, ScreenRecording_09-23-2026 19-49-57, Mini Down View_1 (1), PLM big fish, RPReplay_Final1787183497 + …255969 (PLM, yellow, split view, 40/60 ft) |

Skipped: `mini Panoramic View.MP4` (218 MB, Panoramic is out of scope for v1).

## animations/ — Accuphy's PingLive mode animations (3D concept reference)

`PL_down-view_anim_1Ftq5.gif`, `PL_forward-view_anim_1xS_K.gif`,
`PL_panoramic-view_anim_1Z1uC.gif` — Jason's Drive links 2026-09-23 (same
files as `Product Digitals/PingLive/{Down,Forward,Panoramic} View PingLive.gif`).
Analysed in `docs/3d-beam-reference.md`. Garmin LVS34 reference is a YouTube
video (NznEbu0V2Wc), not stored here.

## product-images/ — device art for the on-water cursor

From `Distributors/Prime Sports/Product Digitals/{PingLive, PingLive Mini}/`
and `…/09.23.2026 Graphics/`:
`Transparent PingLive Shaft Mount.png`, `Transparent PingLive Mini.png`,
`PingLive Mini (1).png`, `PingLive Mini (2).png`, `PingLive Mini Views.png`,
`PingLive Product Page Image.png`, `PingLive Mini Product Page.png`,
`3tablets mock.png`.

## sonar-data/ — raw `.sonar` app exports (gitignored, proprietary format)

Two small `PingBeam_Combo View_20260910_*.sonar` files from
`…/09.23.2026 Graphics/BEST RECENT 2.0 IMAGE DATA/`.

**Recordings used for the tablet study 2026-09-24** (chosen with Jason; the
older files were too old — "这个 data 太老了"). They live on the V10 tablet in
`/Download/Accuphy Sonar/Sonar Data`, not in this repo:

| File | Device / view | Source |
|---|---|---|
| `PingLive_Forward View_20260906_162600.sonar` (804 MB) | PL Forward — a wreck at 8–10 m, 18 m range | Jason's `~/Downloads` |
| `PingLive_Down View_20260803_191159_PL 2.0.13 down human 4.sonar` (978 MB) | PL Down — diver test, 12 m | `~/Downloads/2.0.13.zip` |
| `PingLive_Panoramic View_20260803_185807_Pinglive2.0.13 pano human.sonar` (978 MB) | PL Panoramic — pool/diver test, 12 m | `~/Downloads/2.0.13.zip` |
| `PingLive Mini_Live Forward_20260816_213926.sonar` (369 MB) | PLM Forward — night, piling + fish school, 18 m | `My Drive/Maiky/` |
| `PingLive Mini_Live Combo_20260816_213259.sonar` (369 MB) | PLM Combo — dock with pilings | `My Drive/Maiky/` |
| `PingLive Mini_动态下扫_20260923_145047.sonar` (229 MB) | PLM Down — fish school at 2 m, 8 m range | `…/BEST RECENT 2.0 IMAGE DATA/` |

More PLM recordings (≈ 50, Jul 31 – Aug 16) are in `My Drive/Maiky/`; the
only other PL file is `Distributors/OMAKEE/PingLive_Forward View_20260713_195155.sonar` (1.7 GB).

## app-study/ — screenshots of the real app (committed, JPEG)

Tablet screenshots taken over adb during the 2026-09-24 study: settings and
menus (`settings-*`, `menu-*`, `home*`), one set per view
(`pl-forward-*`, `pl-down-*`, `pl-pano-*`, `plm-forward-*`, `plm-down-*`,
`plm-combo-*`) and full-resolution PNG **crops of fish marks**
(`*-fish-crop-*.png`). Findings: `docs/sonar-style.md` §6, `docs/app-chrome.md`.

## Accuphy Sonar App — latest APK (for the emulator study)

`AccuphySonar_20260901_2.0.0_beta_14.apk` (v2.0.0 beta 14), Jason 2026-09-24:
https://www.dropbox.com/scl/fi/kus9fnv0kv6y044q89tcr/AccuphySonar_20260901_2.0.0_beta_14.apk?rlkey=u8qk1vg6mm79d69taktytxn8k&st=x00fkdjx&dl=0
Downloaded to `~/Downloads/` and `~/android-sdk/dl/` (same SHA-256); installed on the V10 tablet 2026-09-24. Older dev build: `ACCUPHY/IT/Accuhy Sonar App APK versions/June18,2026/AccuphySonar_0615_dev.apk`.
