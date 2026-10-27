# the v3 grade: lake x1.2 brighter, a little cooler (R x1.164, G x1.2, B x1.236 = 1.2 x (0.97, 1, 1.03))
# usage: grade.py in.png out.png, or grade.py <inDir> <outDir> (every .png/.jpg → .jpg, quality 95)
import os, sys
import numpy as np
from PIL import Image
GAIN = np.array([1.2 * 0.97, 1.2, 1.2 * 1.03], dtype=np.float32)
def grade(src, dst, **kw):
    a = np.asarray(Image.open(src).convert('RGB')).astype(np.float32)
    Image.fromarray(np.clip(a * GAIN, 0, 255).round().astype(np.uint8)).save(dst, **kw)
src, dst = sys.argv[1], sys.argv[2]
if os.path.isdir(src):
    os.makedirs(dst, exist_ok=True)
    for fn in sorted(f for f in os.listdir(src) if f.endswith(('.png', '.jpg'))):
        grade(os.path.join(src, fn), os.path.join(dst, os.path.splitext(fn)[0] + '.jpg'), quality=95)
else:
    grade(src, dst)
