# Third-party images in this folder

Both are inlined into the page's code (`?inline` imports in `Scene.jsx`), so they ship in every build, including the
single-file share build. Decision #162.

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

## waternormals.jpg — the fine ripples on the summer lake

- **Source:** `examples/textures/waternormals.jpg` in three.js
  (https://github.com/mrdoob/three.js/blob/dev/examples/textures/waternormals.jpg). It was imported into three.js in 2014
  from Jérémy Bouny's Ocean shader (https://github.com/jbouny/ocean).
- **Licence:** MIT. Both projects are MIT; neither gives the image a separate licence. The notice is reproduced
  below, as the MIT licence requires.
- **What we did:** resized it from 1024² to 512². JPEG quality 88, 66 kB.

```
The MIT License (MIT)

Copyright (c) 2013 Jérémy Bouny

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
```

three.js: Copyright © 2010–2026 three.js authors, MIT licence (https://github.com/mrdoob/three.js/blob/dev/LICENSE).
