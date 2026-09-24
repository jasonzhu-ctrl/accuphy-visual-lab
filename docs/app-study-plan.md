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
