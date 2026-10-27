# contact sheet of film frames, labelled by film time; with --reels the Reels ad safe zones are drawn on each frame
# (14 % top, 35 % bottom, 6 % sides, as third-party checkers quote Meta's Reels ad specs: y 269 / 1248, x 65 / 1015)
# usage: sheet3.py <frameDir> <out.jpg> <frame numbers, comma-separated> [--reels] [--cols 4]
import os, sys
from PIL import Image, ImageDraw, ImageFont
src, out, nums = sys.argv[1], sys.argv[2], [int(x) for x in sys.argv[3].split(',')]
reels = '--reels' in sys.argv
cols = int(sys.argv[sys.argv.index('--cols') + 1]) if '--cols' in sys.argv else 4
W, H, pad, lab = 324, 576, 10, 34
rows = (len(nums) + cols - 1) // cols
sheet = Image.new('RGB', (cols * (W + pad) + pad, rows * (H + lab + pad) + pad), (18, 20, 24))
try: font = ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial.ttf', 22)
except OSError: font = ImageFont.load_default()
d = ImageDraw.Draw(sheet)
for i, n in enumerate(nums):
    im = Image.open(os.path.join(src, f'f{n:05d}.jpg')).convert('RGB')
    if reels:
        ov = Image.new('RGBA', im.size, (0, 0, 0, 0)); o = ImageDraw.Draw(ov)
        o.rectangle([0, 0, 1080, 269], fill=(255, 40, 40, 70)); o.rectangle([0, 1248, 1080, 1920], fill=(255, 40, 40, 70))
        o.rectangle([0, 269, 65, 1248], fill=(255, 40, 40, 50)); o.rectangle([1015, 269, 1080, 1248], fill=(255, 40, 40, 50))
        im = Image.alpha_composite(im.convert('RGBA'), ov).convert('RGB')
    x, y = pad + (i % cols) * (W + pad), pad + (i // cols) * (H + lab + pad)
    sheet.paste(im.resize((W, H), Image.LANCZOS), (x, y + lab))
    d.text((x + 2, y + 6), f'{n / 30:.1f} s  (f{n})', fill=(230, 230, 230), font=font)
sheet.save(out, quality=88)
print(out)
