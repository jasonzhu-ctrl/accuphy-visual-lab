# 9:16 frames (1080×1920) → 4:5 frames (1080×1350): the whole picture centred, a blurred, darkened copy filling the sides
import sys, os
from PIL import Image, ImageFilter, ImageEnhance
src, dst = sys.argv[1], sys.argv[2]; os.makedirs(dst, exist_ok=True)
for fn in sorted(x for x in os.listdir(src) if x.endswith('.jpg')):
    im = Image.open(os.path.join(src, fn)).convert('RGB')
    bg = im.crop((0, (1920 - 1350) // 2, 1080, (1920 - 1350) // 2 + 1350)).resize((270, 338)).filter(ImageFilter.GaussianBlur(9)).resize((1080, 1350))
    bg = ImageEnhance.Brightness(bg).enhance(0.5)
    fg = im.resize((759, 1350), Image.LANCZOS)
    bg.paste(fg, ((1080 - 759) // 2, 0)); bg.save(os.path.join(dst, fn), quality=94)
print('4:5', dst)
