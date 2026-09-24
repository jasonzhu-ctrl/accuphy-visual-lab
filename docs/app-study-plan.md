# Accuphy Sonar App — playback study plan (emulator)

Goal: learn exactly how the real app draws the sonar screen so the phone inset
can copy it — chrome (scales, numbers, buttons), every colour mode, gain/range
behaviour, fish/bottom/structure looks per view. Jason 2026-09-24.

## Setup (this Mac, user-level, no admin)
- `~/android-sdk/jdk` Temurin 17 · `~/android-sdk/cmdline-tools/latest` · platform-tools · emulator
- system image `system-images;android-34;google_apis;arm64-v8a`, AVD `pixel` (Pixel 6 profile)
- APK `~/android-sdk/dl/AccuphySonar_20260901_2.0.0_beta_14.apk` (v2.0.0 beta 14)
- data: `reference/sonar-data/*.sonar` → device `Files / Accuphy Sonar App / Sonar Data`

## Procedure (Jason)
1. Install APK, launch, allow storage permission if asked.
2. Copy the `.sonar` files into `Files/Accuphy Sonar App/Sonar Data` (adb push).
3. Open **Playback** in the app, pick a file.
4. In each view use the **⋯** menu → settings: change colour mode, range,
   gain, units; watch how the picture reacts.

## What to capture (adb screencap, saved under reference/app-study/)
| # | Screen | Why |
|---|---|---|
| 1 | Playback file list + main view chrome (scales, numbers, buttons, logo) | inset chrome |
| 2 | Every colour mode on the same frame (yellow, blue/red, blue, …) | colour ramps |
| 3 | Range 5 → max in steps, same frame | how the picture rescales, axis numbers |
| 4 | Gain low / mid / high | noise floor, bottom band thickness |
| 5 | Down / Forward / Combo / Panoramic layouts (PLM data first, PL if files exist) | screen geometry per mode |
| 6 | Metric vs imperial | unit rule |
| 7 | Frames with fish close & far | fish mark shape/size vs range |

Findings go into `docs/sonar-style.md`; UI copy into `docs/app-chrome.md`.

## Result of the first attempt (2026-09-24, overnight)
- Emulator (Pixel 6 / Android 14 / arm64) runs; APK v2.0.0 beta 14 installs and
  launches; Playback switch found under **Setting → Playback**; the app reads
  `.sonar` files from **`/Download/Accuphy Sonar/Sonar Data`** (pushed the two
  PingBeam Combo files + the 229 MB PingLive Mini file there). Home lists
  PingBeam (Side / Down / Traditional), PingLive (Panoramic / Forward / Down)
  and PingLive Mini (4 views); each view first downloads a **simulation data
  pack** (PingLive Forward: 149 MB, done).
- **Blocked:** every sonar view crashes on the emulator with
  `Shader compile error: unsupported shader version` — the app's 19 shaders
  declare `#version 320 es` (GLES 3.2). The macOS emulator offers GLES 3.0 on
  the host GPU and 3.1 with SwiftShader-ANGLE; nothing offers 3.2. The shaders
  use only 3.1 features (SSBO, compute, imageStore, texelFetch — no geometry /
  tessellation), so a build declaring `#version 310 es` would run here. I did
  NOT re-sign a patched APK (the auto-mode safety check refused, correctly).
- **Two ways forward:** (a) ask the dev team for an emulator build with
  `#version 310 es` (one line per shader), or (b) plug a real Android phone/
  tablet into this Mac — `adb` can screenshot and drive it the same way.
- **Learned from the app's own shader (`assets/aio_shader.glsl`):** raw sample →
  `× rawDataScale`, cutoff `nCutoffValue`, then **log compression**
  `255·log(1+x/bs)/log(1+65535/bs)`, then a **gain/dynamic-range window**
  (`nWidth = dynaRange·255/maxDynaRangeDB`, offset from gain, floor/ceil) → a
  0–255 **colour index into a 256-entry RGBA LUT** (`colors[]`, supplied by the
  app per colour mode); consecutive scan lines are linearly interpolated
  across the pixel span. Our sonar shader should adopt this tone curve and
  sample the yellow LUT from the recordings.
- Extracted APK contents live in `~/android-sdk/dl/apk_x` (not in the repo).
