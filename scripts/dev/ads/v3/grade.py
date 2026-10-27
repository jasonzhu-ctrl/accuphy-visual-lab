# the v3 grade: lake x1.2 brighter, a little cooler (R x1.164, G x1.2, B x1.236 = 1.2 x (0.97, 1, 1.03)); usage: grade.py in.png out.png
import sys
import numpy as np
from PIL import Image
a = np.asarray(Image.open(sys.argv[1]).convert('RGB')).astype(np.float32)
Image.fromarray(np.clip(a * np.array([1.2 * 0.97, 1.2, 1.2 * 1.03]), 0, 255).round().astype(np.uint8)).save(sys.argv[2])
