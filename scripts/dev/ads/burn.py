# burn one language's captions into a frame folder → a new frame folder. usage: burn.py frames out captions.json clip lang(2|3) aspect
import sys, os, json
from PIL import Image, ImageDraw, ImageFont, ImageFilter
src, dst, cj, clip, li, aspect = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4], int(sys.argv[5]), sys.argv[6]
rows = json.load(open(cj))[clip]
os.makedirs(dst, exist_ok=True)
FONT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../../public/brand/fonts/InstrumentSans-Variable.ttf')
cache = {}
def card(text, W):
    if text in cache: return cache[text]
    size = int(W * 0.052); f = ImageFont.truetype(FONT, size)
    f.set_variation_by_axes([100, 620])  # axes: width, weight
    words = text.split(' ')
    if f.getlength(text) <= W * 0.82: lines = [text]
    else:  # two balanced lines
        k = min(range(1, len(words)), key=lambda k: max(f.getlength(' '.join(words[:k])), f.getlength(' '.join(words[k:]))))
        lines = [' '.join(words[:k]), ' '.join(words[k:])]
    lh = int(size * 1.25); pad = int(size * 0.55)
    tw = int(max(f.getlength(l) for l in lines)); th = lh * len(lines)
    im = Image.new('RGBA', (tw + 2 * pad, th + 2 * pad), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.rounded_rectangle((0, 0, im.width - 1, im.height - 1), radius=int(size * 0.5), fill=(8, 18, 28, 150))
    for i, l in enumerate(lines):
        x = (im.width - f.getlength(l)) / 2; y = pad + i * lh - int(size * 0.08)
        d.text((x, y), l, font=f, fill=(255, 255, 255, 255))
    cache[text] = im; return im
files = sorted(x for x in os.listdir(src) if x.endswith('.jpg'))
for i, fn in enumerate(files):
    t = i / 30; im = Image.open(os.path.join(src, fn)).convert('RGB'); W, H = im.size
    for r in rows:
        if r[0] <= t < r[1]:
            c = card(r[li], W)
            a = min(1, (t - r[0]) / 0.2, (r[1] - t) / 0.2) if r[1] < 14.99 else min(1, (t - r[0]) / 0.2)  # quick fades
            if r[0] == 0: a = min(1, (r[1] - t) / 0.2)
            cy = int(H * (0.215 if aspect == '916' else 0.12))
            ov = c.copy(); ov.putalpha(ov.getchannel('A').point(lambda v: int(v * a)))
            im.paste(ov, ((W - c.width) // 2, cy - c.height // 2), ov)
    im.save(os.path.join(dst, fn), quality=94)
print('burned', len(files), dst)
