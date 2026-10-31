# Grain direction: which way do the speckle's long axis run relative to the ray? (0 deg = along the ray, 90 = across.)
# Method behind decision #148 (the grain rule): high-pass the window, 2-D autocorrelation, principal axes of the >0.5 lobe.
# usage: python3 -I grain.py <lab burst dir>      app side: reference/vivo-bursts-2026-10-23/pl-down/d00-d19.png
# Result 2026-10-24 (before #148): app 80-90 deg everywhere, Lab 0-5 deg. After #148: Lab 78-86 deg (sonar-style.md section 10).
import sys, glob, os, numpy as np
from scipy import ndimage as nd
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from measure import load, PXF, PYF, X, Y, REC
def orient(win, cx_ft, cy_ft):
    w = win - nd.gaussian_filter(win, (0.5 * PYF, 0.5 * PXF)); w = w - w.mean()
    F = np.fft.fft2(w, s=(2 * w.shape[0], 2 * w.shape[1])); ac = np.fft.fftshift(np.fft.ifft2(np.abs(F) ** 2).real); ac /= ac.max()
    lab, _ = nd.label(ac > 0.5); c = lab[ac.shape[0] // 2, ac.shape[1] // 2]; ys, xs = np.where(lab == c)
    xs = (xs - ac.shape[1] // 2) / PXF * 12; ys = (ys - ac.shape[0] // 2) / PYF * 12  # inches
    ev, evec = np.linalg.eigh(np.cov(np.vstack([xs, ys]))); m = evec[:, 1]
    ang = np.degrees(np.arctan2(m[1], m[0])) % 180; ray = np.degrees(np.arctan2(cy_ft, cx_ft)) % 180   # ray from the apex at (0,0), y down
    d = abs(ang - ray); return 4 * np.sqrt(ev[1]), 4 * np.sqrt(ev[0]), min(d, 180 - d)
def run(files, tag, boxes):
    print('===', tag)
    for name, (x0, x1, y0, y1) in boxes.items():
        r = []
        for p in files:
            L = load(p).sum(-1)[Y(y0):Y(y1), X(x0):X(x1)]
            if (L >= 60).mean() < 0.6: continue
            r.append(orient(L, (x0 + x1) / 2, (y0 + y1) / 2))
        if not r: print(f'  {name}: not lit enough'); continue
        r = np.array(r); print(f'  {name:14s} grain long {r[:,0].mean():4.1f} in  short {r[:,1].mean():4.1f} in  long axis vs ray {r[:,2].mean():4.0f} deg  n={len(r)}')
if __name__ == '__main__':
    boxes = {'hull core': (10, 18, 27, 31), 'hull core 2': (18, 26, 27, 31)}  # ft, on the wreck study scene
    run(sorted(glob.glob(REC)), 'APP recording', boxes)
    for d in sys.argv[1:]: run(sorted(glob.glob(d + '/f*.png')), 'LAB ' + os.path.basename(d.rstrip('/')), boxes)
