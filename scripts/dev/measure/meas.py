# Sonar picture measurements in physical units (ft, degrees) — LiveScope frames, the app's frames, engine snapshots
# (docs/sonar-style.md §7.20, decision #123).
#   to_index(png)            colour -> echo index 0..1 through the garmin_amber LUT (NaN for grid lines, text, UI)
#   polar(shape, apex, sx, sy) pixel -> (range ft, angle from straight down); apex in px, sx/sy in px per ft
#   blobs(idx, R, T, roi, thr) connected lit patches: size across the ray (r·dθ) and along it (dr), peak, mean
# Reference frames: read apex and scale off their own grid. Engine: window.__sonarSnap(W, H) at an even px/m, and
# window.__sonar.mat.uniforms.uBox0 (x0, y0, w, h in metres, apex at 0,0) -> apex px = (-x0/w·W, -y0/h·H).
# Needs numpy, pillow, scipy (e.g. pip install --target <scratch>/pylib numpy pillow scipy; PYTHONPATH=<scratch>/pylib).
import os, re, numpy as np
from PIL import Image
from scipy import ndimage as ndi

SRC = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../../src/experiments/2026-09-23-sonar-lake-3d/colormaps.js')
_luts = {}
LUT_NAME = 'garmin_amber'
def lut(name=None):
    name = name or LUT_NAME
    if name not in _luts:
        s = open(SRC).read()
        m = re.search(r'COLORMAPS\.' + name + r' = new Float32Array\(\[([^\]]+)\]', s)
        _luts[name] = np.array([float(v) for v in m.group(1).split(',')]).reshape(256, 3) * 255
    return _luts[name]

def to_index(path):
    """LUT index 0..1 per pixel; NaN for UI/grid pixels (greyish or bluish, not on the amber ramp)."""
    a = np.asarray(Image.open(path).convert('RGB')).astype(np.float32)
    H, W, _ = a.shape
    flat = a.reshape(-1, 3)
    L = lut()
    idx = np.empty(flat.shape[0], np.float32); dist = np.empty(flat.shape[0], np.float32)
    for s in range(0, flat.shape[0], 200000):
        d = ((flat[s:s+200000, None, :] - L[None]) ** 2).sum(-1)
        k = d.argmin(1); idx[s:s+200000] = k / 255.0; dist[s:s+200000] = np.sqrt(d[np.arange(len(k)), k])
    idx = idx.reshape(H, W); dist = dist.reshape(H, W)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    grey = (np.abs(r - g) < 25) & (np.abs(g - b) < 25) & (r > 70)        # grid lines, text, buttons
    idx[(dist > 60) | grey] = np.nan
    return idx

def polar(shape, apex, sx, sy):
    H, W = shape
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    X = (xx + 0.5 - apex[0]) / sx; Y = (yy + 0.5 - apex[1]) / sy
    return np.hypot(X, Y), np.arctan2(X, Y)

def blobs(idx, R, T, roi, thr, min_px=6):
    """Connected patches above thr inside roi=(x0,y0,x1,y1). Sizes: tangential = r*dtheta, radial = dr, in ft (5-95 %)."""
    x0, y0, x1, y1 = roi
    sub = np.nan_to_num(idx[y0:y1, x0:x1], nan=0.0)
    lab, n = ndi.label(sub > thr)
    out = []
    for k in range(1, n + 1):
        m = lab == k
        if m.sum() < min_px: continue
        r = R[y0:y1, x0:x1][m]; t = T[y0:y1, x0:x1][m]; v = sub[m]
        rm = float(np.average(r, weights=v))
        tl = float((np.percentile(t, 97) - np.percentile(t, 3)) * rm); rl = float(np.percentile(r, 97) - np.percentile(r, 3))
        out.append(dict(r=rm, tang=tl, rad=rl, deg=float(np.degrees(np.percentile(t, 97) - np.percentile(t, 3))),
                        peak=float(v.max()), mean=float(v.mean()), px=int(m.sum())))
    return out

def summ(bl, key):
    if not bl: return {}
    v = np.array([b[key] for b in bl]); return dict(p25=round(float(np.percentile(v, 25)), 3), p50=round(float(np.median(v)), 3), p75=round(float(np.percentile(v, 75)), 3))
