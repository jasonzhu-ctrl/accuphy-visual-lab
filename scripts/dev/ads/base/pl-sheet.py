# The PingLive ad's boat-position sheet (r1, 2026-11-05; Jason: 船的定位的位置特别重要): one or two stills per shot from the recorded,
# graded frames, with the boat's lake position, the depth read-out and the fish counted inside the active beam (__beamFish, logged per
# frame by film-pl.mjs) over the shot's seconds. usage: pl-sheet.py <comp dir with bg/ and info.json> <beats-pl.json> <out.jpg>
import json, sys
from PIL import Image, ImageDraw, ImageFont
comp, beats_f, out = sys.argv[1:4]
B = json.load(open(beats_f)); info = json.load(open(f'{comp}/info.json'))
by = {f['name']: f for f in info}
def at(t): return min(info, key=lambda f: abs(f['t'] - t))
def fish(a, b):
    v = [sum(f['fish']) for f in info if a <= f['t'] < b and f.get('fish')]
    return (min(v), max(v), sorted(v)[len(v) // 2]) if v else (0, 0, 0)
SHOTS = [ # (title, beat key, [still times], why)
    ('1 Hook · Forward', 'hook', [B['hook'][0] + 3.6], 'timber flat, the 135° fan opens'),
    ('2 Drag · Forward', 'drag', [B['drag'][0] + 1.0, B['drag'][1] - 0.4], 'dragged east to the island timber'),
    ('3 Phone · Forward View', 'phone', [B['phone'][0] + 2.2], 'trees + bass on the phone'),
    ('4 Down View', 'down', [B['down'][0] + 0.6, B['down'][0] + 3.6], 'the workboat wreck under the boat'),
    ('5 Panoramic View', 'pano', [B['pano'][0] + 2.9, B['pano'][0] + 4.4], 'west shelf: crappie, bass, rock, timber'),
    ('6 Reveal · Forward 140 ft', 'reveal', [B['reveal'][0] + 4.0, B['reveal'][1] - 0.1], 'the cargo ship inside the curtain'),
]
W = 300; H = W * 16 // 9; pad = 14; lab = 118
f1 = ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', 21); f2 = ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', 17)
cols = [(s, t) for s in SHOTS for t in s[2]]
sheet = Image.new('RGB', (len(cols) * (W + pad) + pad, H + lab + 2 * pad + 40), (14, 16, 20)); d = ImageDraw.Draw(sheet)
d.text((pad, 10), 'Accuphy PingLive ad r1 · boat positions (frozen lake 96fdc22) · fish = inside the active beam over the shot (min–max, median)', fill=(230, 235, 240), font=f1)
x = pad
for (title, key, ts, why), t in cols:
    f = at(t); im = Image.open(f"{comp}/bg/{f['name']}.jpg").convert('RGB').resize((W, H))
    sheet.paste(im, (x, 40)); y = 40 + H + 6
    a, b = B[key]; lo, hi, med = fish(a, b)
    d.text((x, y), title, fill=(255, 255, 255), font=f1)
    d.text((x, y + 26), f"t {f['t']:.1f} s · boat ({f['bx']}, {f['bz']}) · {f.get('depth') or ''}", fill=(200, 210, 220), font=f2)
    d.text((x, y + 48), f"fish in beam {lo}–{hi} (median {med}) · now {sum(f['fish'] or [0])}", fill=(200, 210, 220), font=f2)
    d.text((x, y + 70), why, fill=(150, 165, 180), font=f2)
    x += W + pad
sheet.save(out, quality=88); print(out, sheet.size)
