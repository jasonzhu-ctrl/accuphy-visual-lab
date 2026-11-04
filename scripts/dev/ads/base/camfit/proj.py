# proj.py: three.js-style projection for fitting ad cameras without rendering. proj(cam, pts) -> [(x, y)] on 1080×1920
import numpy as np
def proj(cam, pts, W=1080, H=1920):
    p, l = np.array(cam['pos'], float), np.array(cam['look'], float)
    f = l - p; f /= np.linalg.norm(f); r = np.cross(f, [0, 1, 0]); r /= np.linalg.norm(r); u = np.cross(r, f)
    t = np.tan(np.radians(cam['fov']) / 2); out = []
    for q in pts:
        d = np.array(q, float) - p; x, y, z = d @ r, d @ u, d @ f
        out.append((round((1 + x / z / (t * W / H)) / 2 * W), round((1 - y / z / t) / 2 * H)))
    return out
