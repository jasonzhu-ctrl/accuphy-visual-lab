# fit.py: grid-search an ad camera so given lake points land in a screen box. Camera = look point (subject centre moved `sh` m
# toward the camera along the ground) + azimuth / elevation / distance + fov
import numpy as np, itertools
from proj import proj
def fit(pts, box, c, az_rng, el_rng, dist_rng, fovs=(48,), shifts=(0,), fill=1.0):
    x0, x1, y0, y1 = box; best = None
    for az, el, d, fov, sh in itertools.product(az_rng, el_rng, dist_rng, fovs, shifts):
        a, e = np.radians(az), np.radians(el)
        look = [c[0] + sh * np.cos(a), c[1], c[2] + sh * np.sin(a)]
        pos = [look[0] + d * np.cos(e) * np.cos(a), look[1] + d * np.sin(e), look[2] + d * np.cos(e) * np.sin(a)]
        cam = {'pos': [round(float(v), 1) for v in pos], 'look': [round(float(v), 1) for v in look], 'fov': fov}
        P = proj(cam, pts); xs = [p[0] for p in P]; ys = [p[1] for p in P]
        out = sum(max(0, x0 - x) + max(0, x - x1) for x in xs) + sum(max(0, y0 - y) + max(0, y - y1) for y in ys)
        span = (max(xs) - min(xs)) / (x1 - x0) + (max(ys) - min(ys)) / (y1 - y0)
        cost = out * 10 - span * 100 * fill
        if best is None or cost < best[0]: best = (cost, cam, P)
    return best
