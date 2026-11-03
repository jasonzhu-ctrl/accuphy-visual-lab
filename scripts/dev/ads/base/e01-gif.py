# 1600×900 frames → a 600×338 GIF under 1 MB for the e01 email (10 fps, loops). Size is kept down by holding pixels that
# barely change (the water) from the previous frame, then one adaptive palette for the whole clip.
# usage: python3 e01-gif.py <frameDir> <out.gif> [colors=160] [hold=14] [fps=10] [step=1] [dither=0]
# step 2 keeps every other frame (5 fps from a 10 fps recording); dither 1 looks smoother but roughly doubles the file
import os, sys
import numpy as np
from PIL import Image
src, out = sys.argv[1], sys.argv[2]
colors = int(sys.argv[3]) if len(sys.argv) > 3 else 160
hold = int(sys.argv[4]) if len(sys.argv) > 4 else 14
fps = int(sys.argv[5]) if len(sys.argv) > 5 else 10
step = int(sys.argv[6]) if len(sys.argv) > 6 else 1
dither = Image.Dither.FLOYDSTEINBERG if len(sys.argv) > 7 and sys.argv[7] == '1' else Image.Dither.NONE
files = sorted(f for f in os.listdir(src) if f.endswith('.png'))[::step]
frames = [np.asarray(Image.open(os.path.join(src, f)).convert('RGB').resize((600, 338), Image.LANCZOS)).astype(np.int16) for f in files]
# hold: where a pixel moved less than `hold` (sum of channel differences) since the kept previous frame, keep the old value
kept = [frames[0]]
for fr in frames[1:]:
    prev = kept[-1]
    diff = np.abs(fr - prev).sum(axis=2)
    cur = np.where((diff < hold)[..., None], prev, fr)
    kept.append(cur)
# one palette from a strip of several frames, so colours do not flicker between frames; the phone (bottom right) is added
# four times enlarged so its oranges get their share of the palette (they were lost to the water's blues otherwise)
picks = [k.astype(np.uint8) for k in kept[::max(1, len(kept) // 6)]]
phones = [np.asarray(Image.fromarray(k[220:338, 380:600]).resize((600, 322), Image.NEAREST)) for k in picks[::2]]
strip = Image.fromarray(np.concatenate(picks + phones, axis=0))
pal = strip.quantize(colors=colors, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
q = [Image.fromarray(k.astype(np.uint8)).quantize(colors=colors, palette=pal, dither=dither) for k in kept]
q[0].save(out, save_all=True, append_images=q[1:], duration=round(1000 * step / fps), loop=0, optimize=True, disposal=1)
print(out, f'{os.path.getsize(out) / 1024:.0f} KB', len(q), 'frames', f'{len(q) / fps:.1f} s')
