# The caption-style board for Jason (#225 step 1): three styles (A B C from styles.html) on the same two frames, the Reels
# lines drawn in. usage: python3 styles-board.py <styles-render.mjs out dir> <out .jpg>
import re, sys
from PIL import Image, ImageDraw, ImageFont
src, out = sys.argv[1:3]
cj = lambda s: ImageFont.truetype('/System/Library/Fonts/Hiragino Sans GB.ttc', s)
BG, FG, MUT, BLUE, RED = (14, 18, 24), (235, 240, 245), (150, 160, 172), (2, 140, 223), (230, 70, 70)
TW, TH, GAP, PAD = 480, 853, 24, 40
STYLES = [('A', 'A · 标题 + 蓝线', 'Eurostile 大标题，一道短蓝线，副句用 Instrument Sans。没有框，上方一层淡淡的压暗。最干净。'),
          ('B', 'B · 玻璃板', '和 Lab 面板一样的磨砂玻璃块，细描边，蓝点 + ACCUPHY LAB 小字。字永远清楚，板子不盖波束。'),
          ('C', 'C · 电影字幕', '左边一道竖的蓝线，ACCUPHY LAB 小字拉开字距，大标题，画面四角轻微压暗。最像电影。')]
ROWS = [('open', '第 1 段 · 整个湖'), ('drag', '第 2 段 · 拖船')]
W = PAD * 2 + 3 * TW + 2 * GAP
H = 170 + len(ROWS) * (TH + 70) + 20
board = Image.new('RGB', (W, H), BG); d = ImageDraw.Draw(board)
d.text((PAD, 24), 'Mini 广告片字幕样式：三种，同一帧，选一种', font=cj(40), fill=FG)
d.text((PAD, 82), '字都在红线中间（Reels 上 14 % / 下 35 %），不压船和波束。标题 Eurostile Heavy（Creative Cloud），副句 Instrument Sans。文字是改动单里的新字幕。', font=cj(21), fill=MUT)
for i, (k, title, desc) in enumerate(STYLES):
    x = PAD + i * (TW + GAP)
    d.text((x, 128), title, font=cj(28), fill=BLUE)
y = 170
for key, label in ROWS:
    for i, (k, _, desc) in enumerate(STYLES):
        x = PAD + i * (TW + GAP)
        im = Image.open(f'{src}/{k}-{key}.png').convert('RGB')
        dd = ImageDraw.Draw(im)
        for yy in (round(1920 * 0.14), round(1920 * 0.65)): dd.line([(0, yy), (1080, yy)], fill=RED, width=6)
        board.paste(im.resize((TW, TH), Image.LANCZOS), (x, y))
        d.text((x, y + TH + 10), label if key == 'open' else label, font=cj(22), fill=FG)
        if key == 'drag':
            # the style's description under its second tile, wrapped by character
            lines, cur = [], ''
            for tok in re.findall(r"[A-Za-z0-9+]+ ?|.", desc):  # Latin words stay whole
                if cur and d.textlength(cur + tok, font=cj(18)) > TW: lines.append(cur.rstrip()); cur = tok.lstrip()
                else: cur += tok
            lines.append(cur)
            for j, ln in enumerate(lines): d.text((x, y + TH + 40 + j * 24), ln, font=cj(18), fill=MUT)
    y += TH + 70
board = board.crop((0, 0, W, y + 30))
board.save(out, quality=88)
print(board.size)
