# The Base ad stills board (2026-11-03): top row = the 10-28 Mini test film (cut from its contact sheet), bottom rows = the
# same beats recorded from the Base 86bf80e by stills-base.mjs and graded with ../v3/grade.py, plus the two new frames.
# usage: python3 board.py <graded dir: open combo deep tour wide .jpg> <raw desk.png> <old sheet .jpg> <out .jpg>
import sys
from PIL import Image, ImageDraw, ImageFont
g, desk, old, out = sys.argv[1:5]
F = lambda s: ImageFont.truetype('/System/Library/Fonts/Hiragino Sans GB.ttc', s)
W, H, GAP, PAD = 405, 720, 16, 40  # one 9:16 tile
BG, FG, MUT, BLUE, RED = (14, 18, 24), (235, 240, 245), (150, 160, 172), (2, 140, 223), (230, 70, 70)
cols = 5
board = Image.new('RGB', (PAD * 2 + cols * W + (cols - 1) * GAP, 2010), BG)
d = ImageDraw.Draw(board)
d.text((PAD, 24), 'Accuphy Lab 广告静帧：标准 Base 版（86bf80e）对比 10-28 的 Mini 测试片', font=F(40), fill=FG)
d.text((PAD, 80), '只有画面，字幕和片尾照旧（占位稿，等 Q8）。红线 = Reels 上下安全区（14 % / 35 %）。PingLive Mini，英文单位 ft。', font=F(24), fill=MUT)

def tile(img, x, y, cap, sub, zones=True, w=W, h=H):
    im = img.convert('RGB').resize((w, h), Image.LANCZOS)
    if zones:
        dd = ImageDraw.Draw(im)
        for yy in (round(h * 0.14), round(h * 0.65)): dd.line([(0, yy), (w, yy)], fill=RED, width=2)
    board.paste(im, (x, y))
    d.text((x, y + h + 10), cap, font=F(24), fill=FG)
    if sub: d.text((x, y + h + 44), sub, font=F(19), fill=MUT)

# row 1: the old film, from its 10 fps contact sheet (2348×1250, 7 columns × 2 rows, Reels zones already tinted)
sh = Image.open(old); k = sh.width / 2000
crop = lambda c, r: sh.crop((round((8 + c * 284.5) * k), round((38 + r * 528) * k), round((8 + c * 284.5 + 276) * k), round((38 + r * 528 + 490) * k)))
y1 = 130
d.text((PAD, y1), '以前：Mini 测试片（10-28，从 479ca21 录）', font=F(28), fill=BLUE)
old_tiles = [(crop(0, 0), '1 开场 0–3 s', 'Live Forward，树林浅滩'), (crop(4, 0), '2 主镜头 3–7.5 s', 'Live Combo，AHEAD + BELOW'),
             (crop(2, 1), '3 深水 7.5–11.5 s', '波束跑到手机后面去了'), (crop(6, 1), '4 片尾 11.5–15 s', 'Play the free sonar demo')]
for i, (im, c, s) in enumerate(old_tiles):
    tile(im, PAD + i * (W + GAP), y1 + 46, c, s, zones=False)
# row 2: the Base
y2 = y1 + 46 + H + 100
d.text((PAD, y2), '现在：标准 Base 版（86bf80e，干净检出，Mini 专用页 = /mini/）', font=F(28), fill=BLUE)
new_tiles = [('open', '1 开场（同机位）', '新：后面有湖岸和针叶林'), ('combo', '2 主镜头 Live Combo', '同机位；页面写 Mini Combo 78°'),
             ('deep', '3 深水（新机位）', '船和整条波束在手机上方，不被挡'), ('tour', '4 新：页面教程（可选）', '真页面；手机落在底部区，要处理'),
             ('wide', '新：整个湖（可选开场）', '湖岸一圈，船在湖中间')]
for i, (n, c, s) in enumerate(new_tiles):
    tile(Image.open(f'{g}/{n}.jpg'), PAD + i * (W + GAP), y2 + 46, c, s)
d.text((PAD, y2 + 46 + H + 84), '横版（16:9）参考：Base 电脑页 —— 新标题 ACCUPHY | LAB、视图格只有图标、波束文字只写宽度、手机上方 App 徽章、无锁', font=F(22), fill=MUT)
board = board.crop((0, 0, board.width, y2 + 46 + H + 130))
# the desktop page as a strip on the right of row 1 (16:9)
dw = board.width - (PAD + 4 * (W + GAP)) - PAD
dh = round(dw * 9 / 16)
im = Image.open(desk).convert('RGB').resize((dw, dh), Image.LANCZOS)
x = PAD + 4 * (W + GAP); board.paste(im, (x, y1 + 46))
d = ImageDraw.Draw(board)
d.text((x, y1 + 46 + dh + 10), '新：电脑页（横版参考）', font=F(24), fill=FG)
d.text((x, y1 + 46 + dh + 44), 'Combo 78°、App 徽章', font=F(19), fill=MUT)
board.save(out, quality=88)
print(board.size)
