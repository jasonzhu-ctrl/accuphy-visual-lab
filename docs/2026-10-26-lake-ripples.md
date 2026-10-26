# Lake ripples — matched to drone photos of real lakes (2026-10-26, decision #163)

Jason in Lab HQ, 2026-10-26, after the sky comparison: "差别不大 但是水面波纹还是很糟糕". Sky A stays. This round only
changes the ripples on the summer lake (`Scene.jsx` Water). Local only, not uploaded.

Pictures:
- `docs/2026-10-26-lake-ripples-desktop.jpg`: now / after / real, desktop 1440×900, default camera, with 1:1 crops
  of the near water.
- `docs/2026-10-26-lake-ripples-phone.jpg`: now / after / real, phone 390×844.

## Real references

Drone and high oblique photos, about our camera height (30–60 m above the water, looking down at 40–90°). Four are
Ontario lakes. All from Wikimedia Commons, under free licences. They are shown in the comparison sheets with their
credits. The full-size files were not copied into the repo.

| # | Lake | What it shows | Author, licence, source |
|---|---|---|---|
| 1 | Rice Lake, Ontario (drone, near-vertical) | A light breeze: scattered short ripples, ~0.5–1.5 m crescents, never a regular grain. Brighter and darker bands where the sky reflects. Bottom visible through the water. | Drozwik Drones, CC BY 3.0, [01](https://commons.wikimedia.org/wiki/File:Abandoned_Submerged_Train_Tracks_in_Rice_Lake_(2024-08-02)_01.jpg) |
| 2 | Rice Lake, Ontario (same flight) | The same ripples around a submerged track bed. Their size against the trees and rocks gives the scale. | Drozwik Drones, CC BY 3.0, [02](https://commons.wikimedia.org/wiki/File:Abandoned_Submerged_Train_Tracks_in_Rice_Lake_(2024-08-02)_02.jpg) |
| 3 | Lake 239, IISD Experimental Lakes Area, Ontario (drone, straight down) | Almost glassy: the sky as a smooth sheen. Fine ripples only in one patch. | Sbath iisd, CC BY-SA 4.0, [link](https://commons.wikimedia.org/wiki/File:Image_of_Lake_239_at_IISD_Experimental_Lakes_Area_from_above.jpg) |
| 4 | Hutcheson Beach, Huntsville, Ontario (high oblique) | Near water rippled; far water a smooth sheen with darker wind lanes, no fine texture far off. | Huntsville Ontario, CC BY 2.0, [link](https://commons.wikimedia.org/wiki/File:Hutcheson_Beach_(30392464023).jpg) |
| 5 | Ritzensee, Germany (drone, oblique) | A small calm lake: mostly smooth, with a few soft ripple patches (cat's paws). | Gerhard Kleinheinz, CC BY-SA 4.0, [link](https://commons.wikimedia.org/wiki/File:Drohnenaufnahme_Ritzensee.jpg) |

## Where #162 differed from them

1. **One even texture everywhere.** The whole lake had the same fine, regular, diagonal grain, like scratches or
   cloth. The real lakes are mostly calm, with ripples only in patches.
2. **It repeated.** The ripple map tiled every 4.7 m and 13 m. Its own diagonal grain lined up across the lake.
3. **The short wind waves were ruled lines.** Seven sine waves, all within ±46° of the wind, down to 0.4 m. Their
   0.4–1 m members drew parallel hatching. Hiding the water (a test render) showed the hatching came from them,
   not from the lakebed.
4. **No scale to the boat.** The grain was a few pixels whatever the distance. Real breeze ripples are 0.5–1.5 m,
   about a fifth of our 5 m boat.
5. **Far water stayed grainy.** In the photos far water becomes a smooth sheen with broad light and dark lanes.

## What changed (#163)

- **Calm and wind in patches:**
  - Wind lanes 40–80 m across.
  - Cat's paws, 8–25 m gust patches that run downwind (~1 m/s) and change shape.
  - Calm slicks keep 6 % of the roughness (nearly a mirror).
  - Lanes keep about a third; paws inside lanes up to full.
- **Breeze ripples drawn as short crests, 0.6–1.6 m:**
  - Four wavelengths within ±37° of the wind.
  - Bent into crescents by a warp.
  - Each one only lives in small groups a few crests long.
  - Gravity plus surface-tension speeds.
  - This is what reads as the scattered ripples in references 1 and 2.
- **Distance:**
  - Every ripple fades once a pixel covers about a third of its length.
  - Beyond ~0.9 m per pixel the crest code is skipped.
  - Far water is left with the long, low waves (7 m … 1.7 m, slope 0.03), so it turns into a sheen that stretches
    the sky photo.
- **The ripple map (#162):**
  - Kept as a faint undulation: one copy, 22 m, read one and a half mip levels blurred (its fine grit read as stone).
  - It is read through a ±1.5 m warp, so its repeat never lines up.
  - The 4.7 m copy is gone.
- **The short members of the wind sea (0.4–1 m) are gone**; their ±46° spread widened to ±69°.
- **Ripples catch more light near the camera:** the facet-to-eye terms went from 6 → 9 for the sheen and from
  2.2 → 3.0 for the scattered light. The boat's wake is scaled by 0.67, so it looks as before.

## Checks

- **Desktop and phone:** default camera, at rest (the sheets above). After a 1.5 s drag, the wake reads as before.
- **Ice page (#94):** unchanged. It has no Water mesh; checked desktop + phone.
- **Console:** 0 errors.
- **Frame time:** no measurable change against #162 at 1920×1200, 2560×1600 and 390×844 (numbers in decision #163). A first
  version cost +10–15 %; sharing noise samples removed that (#50).

## For Jason (中文)

- 找了 5 张真实湖面的航拍照片做参考，4 张是安大略的湖（Rice Lake、Lake 239、Huntsville），都在维基共享资源上，可以免费使用。
- 原来的问题：整个湖面铺着一层一样的细斜纹，还看得出贴图在重复，远处近处一个样。真实的湖是大部分平静、一块一块起风，
  波纹约 0.5–1.5 米（大概是船长的五分之一），远处变成平滑的反光。
- 现在：平静的地方像镜子；起风的地方是一块块随风移动的波纹，弯弯的短波纹而不是直线；越远越平、变成反光。
  拖船尾浪看起来和原来一样，冰钓页不受影响。手机不变慢（实测和上一版一样）。
