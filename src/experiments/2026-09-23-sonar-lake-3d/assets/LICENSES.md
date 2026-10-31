# Third-party material in this folder

The image is inlined into the page's code (`?inline` import in `Scene.jsx`), so it ships in every build, including the
single-file share build (decision #162). The waves' code is adapted from an MIT project (#165).

## lake-sky.jpg — the sky mirrored in the summer lake

- **Source:** "Kloofendal 48d Partly Cloudy (Pure Sky)", Poly Haven,
  https://polyhaven.com/a/kloofendal_48d_partly_cloudy_puresky (2K .hdr, downloaded 2026-10-26)
- **Authors:** Greg Zaal, Jarod Guest
- **Licence:** CC0 1.0 (public domain dedication), https://polyhaven.com/license. Commercial use allowed, no
  attribution required. It is credited here anyway.
- **What we did:** we kept the upper hemisphere, tone-mapped it to 8-bit (exposure set from the sky's 95th
  percentile, gamma 2.2), and resized it to 1536 × 384. JPEG quality 82, 52 kB.
- **Alternatives** (same source, licence and processing), in `docs/lake-skies/`:
  - `evening_road_01_puresky` (Jarod Guest, Sergej Majboroda);
  - `kloofendal_38d_partly_cloudy_puresky` (Greg Zaal, Jarod Guest).

## lakeFFT.js — the lake's waves (code, not an image)

- **Source:** adapted from ABYSSAL by Sacha (@squall01337), https://github.com/squall01337/abyssal-ocean (read
  2026-10-26). Taken: the wind-sea spectrum (JONSWAP + TMA + Donelan–Banner spreading), the Tessendorf h0 and its time
  evolution, and the butterfly-texture inverse FFT. Cut down to surface slopes only, for a lake. Decision #165.
- **Licence:** MIT. The notice:

```
MIT License

Copyright (c) 2026 Sacha (@squall01337)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Removed

- `waternormals.jpg` (three.js / jbouny, MIT) was used from #162 to #164 for fine ripples. The FFT replaced it in #165, and
  the file was deleted.

three.js: Copyright © 2010–2026 three.js authors, MIT licence (https://github.com/mrdoob/three.js/blob/dev/LICENSE).

## qrcode-generator 1.5.2 (npm) — MIT

QR encoder for "Send to a friend" (#188, 2026-10-29): the share link drawn as an SVG in the page, no network call.
Copyright (c) 2009 Kazuhiko Arase. MIT License — https://github.com/kazuhikoarase/qrcode-generator

## Liquid glass trial (`GlassLayer.jsx`, ?glass=)

The idea and SVG filter structure are adapted, no package is installed. Both MIT; licence texts checked 2026-10-30.
- https://github.com/shuding/liquid-glass — MIT License, Copyright (c) 2025 Shu Ding
- https://github.com/rdev/liquid-glass-react — MIT, Copyright 2025 Max Rovensky

## @paper-design/shaders 0.0.82 (npm) — Apache-2.0

The dithered ripple on the selected view tile (`DitherFan.jsx`). LICENSE read in the package 2026-10-30. Its NOTICE:

    Paper Shaders
    Copyright 2026 Paper

    Powered by Paper Shaders:
    https://shaders.paper.design
