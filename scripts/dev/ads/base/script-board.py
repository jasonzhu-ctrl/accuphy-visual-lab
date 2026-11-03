# The Base ad storyboard (2026-11-03, docs/2026-11-03-ad-base-script.md): one row Mini, one row PingLive, 9:16 tiles with
# the Reels safe lines (14 % top, 35 % bottom), the caption drawn where it will sit, and under each tile: number, time,
# picture, caption, sound. Frames come from script-shots.mjs (graded with ../v3/grade.py); the end card is drawn here.
# Storyboard type is Instrument Sans (repo, OFL); the film uses Creative Cloud Eurostile Heavy for the headlines.
# usage: python3 script-board.py <graded frames dir> <repo root> <out .jpg>
import re, sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter
g, root, out = sys.argv[1:4]
CJK = '/System/Library/Fonts/Hiragino Sans GB.ttc'
def ins(size, w=620):
    f = ImageFont.truetype(f'{root}/public/brand/fonts/InstrumentSans-Variable.ttf', size)
    try: f.set_variation_by_axes([w, 100])
    except Exception: pass
    return f
cj = lambda s: ImageFont.truetype(CJK, s)
BG, FG, MUT, BLUE, RED = (14, 18, 24), (235, 240, 245), (150, 160, 172), (2, 140, 223), (230, 70, 70)
FW, FH = 1080, 1920  # frames are drawn at full size, then scaled into the tile
TW, TH, GAP, PAD = 300, 533, 14, 36

def caption(im, lines, top=300, big=None, size=66):
    """the line(s) as they will sit in the film: a soft dark band, white text; with `big`, the line comes first and the
    big number sits under it on the left (the fan is to its right or below it)"""
    d = ImageDraw.Draw(im, 'RGBA')
    lh = round(size * 1.36)
    h = lh * len(lines) + (150 if big else 0) + 30
    for i in range(h + 120):  # gradient band
        a = int(150 * min(1, (h + 120 - i) / 120)) if i > h else 150
        d.line([(0, top - 40 + i), (FW, top - 40 + i)], fill=(5, 10, 16, a))
    y = top
    for ln in lines:
        d.text((72, y), ln, font=ins(size), fill=(255, 255, 255)); y += lh
    if big:
        d.text((68, y), big, font=ins(116, 700), fill=(255, 255, 255))
        d.line([(76, y + 150), (76 + d.textlength(big, font=ins(116, 700)), y + 150)], fill=BLUE, width=8)
    return im

def finger(im, x, y, dx=150):
    d = ImageDraw.Draw(im, 'RGBA')
    d.ellipse([x - 70, y - 70, x + 70, y + 70], outline=(2, 140, 223, 255), width=8)
    d.ellipse([x - 34, y - 34, x + 34, y + 34], fill=(255, 255, 255, 235))
    d.line([(x + 90, y), (x + 90 + dx, y)], fill=(255, 255, 255, 230), width=10)
    d.polygon([(x + 110 + dx, y), (x + 80 + dx, y - 22), (x + 80 + dx, y + 22)], fill=(255, 255, 255, 230))
    return im

def endcard(src, product):
    im = Image.open(src).convert('RGB').filter(ImageFilter.GaussianBlur(14))
    im = Image.blend(im, Image.new('RGB', im.size, (4, 8, 14)), 0.78)
    logo = Image.open(f'{root}/public/brand/logo/White Accuphy Logo.png').convert('RGBA')
    lw = 640; logo = logo.resize((lw, round(logo.height * lw / logo.width)), Image.LANCZOS)
    im.paste(logo, ((FW - lw) // 2, 560), logo)
    d = ImageDraw.Draw(im)
    y = 560 + logo.height + 40
    d.line([(FW // 2 - 320, y), (FW // 2 + 320, y)], fill=BLUE, width=6)
    for txt, f, dy in [('Learn live sonar', ins(76, 680), 60), ('in under 2 minutes.', ins(76, 680), 92), ('Try the free Accuphy Lab', ins(60, 600), 140)]:
        w = d.textlength(txt, font=f); y += dy; d.text(((FW - w) / 2, y), txt, font=f, fill=(255, 255, 255) if dy != 140 else (120, 196, 245))
    w = d.textlength(product, font=ins(40)); d.text(((FW - w) / 2, y + 110), product, font=ins(40), fill=(170, 180, 192))
    return im

def frame(name): return Image.open(f'{g}/{name}.jpg').convert('RGB')
ROWS = [
  ('PingLive Mini 版（约 20 s，加拿大 + 美国）', [
    ('1', '0–2.5 s', caption(frame('m1'), ['Learn live sonar', 'in under 2 minutes.']), '整个湖，湖岸针叶林，镜头推近船', 'Learn live sonar in under 2 minutes.', '一声 ping；音乐位留空'),
    ('2', '2.5–6 s', finger(caption(frame('m2'), ['Drag the boat.']), 215, 905), '手指拖船，Forward 波束扫过树林里的鱼（只有 3D）', 'Drag the boat.', '水声；鱼进波束轻 ping'),
    ('3 前', '6.0 s', caption(frame('m3a'), ['See it live in the', 'Accuphy Sonar App.']), '手机从底下冒头', 'See it live in the Accuphy Sonar App.', '“嗖”的弹出声'),
    ('3 后', '6.3–9 s', caption(frame('m3b'), ['See it live in the', 'Accuphy Sonar App.']), '手机到位（页面原尺寸），Live Forward 鱼亮起；3D 被盖住没关系', '（同上）', 'ping 跟着回波'),
    ('4', '9–13 s', caption(frame('m4'), ['Forward. Down. Both at once.'], top=290, big='39° → 78°', size=58), '角度动画：Forward 39° → Combo 78°；手机里 Forward / Down / Combo 切换', 'Forward. Down. Both at once.', '每切一次一声 ping'),
    ('5', '13–17 s', caption(frame('m5'), ['Open water or hard water.'], top=640, size=62), '冰面：点冰打洞，Mini 放下去，手机 Live Down 看到鱼', 'Open water or hard water.', '冰钻声、ping'),
    ('6', '17–20 s', endcard(f'{g}/m1.jpg', 'PingLive Mini'), '片尾：ACCUPHY + 蓝线', 'Learn live sonar in under 2 minutes. / Try the free Accuphy Lab', '收尾一声 ping'),
  ]),
  ('PingLive 版（约 20 s，只给加拿大：美国 2 月前不卖）', [
    ('1', '0–2.5 s', caption(frame('p1'), ['Learn live sonar', 'in under 2 minutes.']), '整个湖，镜头推近船（PingLive）', 'Learn live sonar in under 2 minutes.', '一声 ping；音乐位留空'),
    ('2', '2.5–6 s', finger(caption(frame('p2'), ['Drag the boat.']), 215, 905), '手指拖船，Forward 波束扫过鱼', 'Drag the boat.', '水声；鱼进波束轻 ping'),
    ('3 前', '6.0 s', caption(frame('p3a'), ['See it live in the', 'Accuphy Sonar App.']), '手机从底下冒头', 'See it live in the Accuphy Sonar App.', '“嗖”的弹出声'),
    ('3 后', '6.3–9 s', caption(frame('p3b'), ['See it live in the', 'Accuphy Sonar App.']), '手机到位，Forward View 鱼亮起', '（同上）', 'ping 跟着回波'),
    ('4', '9–13 s', caption(frame('p4'), ['Down. Forward. Panoramic.'], top=290, big='135°', size=58), '135° 动画：Down → Forward → Panoramic，扇面张到 135°（沿用 v3）', 'Down. Forward. Panoramic.（占位）', '每切一次一声 ping，到 135° 一声长 ping'),
    ('5', '13–17 s', caption(frame('p5'), ['Open water or hard water.'], size=62), '默认：浅滩树林上 Panoramic（湖里没有专门的鲈鱼窝）。要不要换成 Mini 冰钓画面，等 Jason 定', 'Open water or hard water.（要跟着定）', 'ping'),
    ('6', '17–20 s', endcard(f'{g}/p1.jpg', 'PingLive'), '片尾：ACCUPHY + 蓝线', 'Learn live sonar in under 2 minutes. / Try the free Accuphy Lab', '收尾一声 ping'),
  ]),
]
cols = 7
W = PAD * 2 + cols * TW + (cols - 1) * GAP
TXT = 300
H = 150 + len(ROWS) * (60 + TH + TXT) + 40
board = Image.new('RGB', (W, H), BG); d = ImageDraw.Draw(board)
d.text((PAD, 22), 'Accuphy Lab 广告分镜（标准 Base 86bf80e）：Mini 一条、PingLive 一条，各约 20 秒，9:16（16:9 同样分镜）', font=cj(34), fill=FG)
d.text((PAD, 74), '字幕是草稿，画在成片里的位置；红线 = Reels 上下安全区（14 % / 35 %），字和要紧画面都在中间。分镜字体是 Instrument Sans，成片标题用 Eurostile Heavy。声音全是程序合成的音效，暂不放音乐。', font=cj(20), fill=MUT)
y = 150
def wrap(text, font, width):
    # Latin words (with their trailing space) stay whole; Chinese breaks between characters
    out, cur = [], ''
    for tok in re.findall(r"[A-Za-z0-9°’'.,!?/()+→\-]+ ?|.", text):
        if cur and d.textlength(cur + tok, font=font) > width: out.append(cur.rstrip()); cur = tok.lstrip()
        else: cur += tok
    return out + [cur] if cur else out
for title, tiles in ROWS:
    d.text((PAD, y), title, font=cj(28), fill=BLUE); y += 50
    for i, (num, t, im, pic, cap, snd) in enumerate(tiles):
        x = PAD + i * (TW + GAP)
        dd = ImageDraw.Draw(im)
        for yy in (round(FH * 0.14), round(FH * 0.65)): dd.line([(0, yy), (FW, yy)], fill=RED, width=6)
        board.paste(im.resize((TW, TH), Image.LANCZOS), (x, y))
        ty = y + TH + 10
        d.text((x, ty), f'{num}  ·  {t}', font=cj(24), fill=FG); ty += 36
        for label, text, col in (('画面', pic, MUT), ('字幕', cap, FG), ('声音', snd, MUT)):
            for k, ln in enumerate(wrap(f'{label}：{text}', cj(17), TW)):
                d.text((x, ty), ln, font=cj(17), fill=col); ty += 23
            ty += 6
    y += TH + TXT
board.save(out, quality=88)
print(board.size)
