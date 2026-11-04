# camfit (PingLive ad r1, 2026-11-05)

Fit an ad camera without rendering: `proj.py` is three.js's perspective projection (lookAt with +y up, vertical fov, 1080×1920);
`fit.py` grid-searches a camera (look point moved `sh` m toward the camera, azimuth, elevation, distance, fov) so given lake points
land inside a screen box. Checked against film-pl.mjs's own log (boat at 441,613 predicted vs 443,614 logged). Used for every
camera in `../film-pl.mjs` (phone beats: boat and beam in the strip y 645–745 between the caption and the phone).
