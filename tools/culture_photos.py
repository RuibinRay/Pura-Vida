#!/usr/bin/env python3
"""Sizes the culture chapter's photographs for the site and writes their credits.

    python3 tools/culture_photos.py        (Pillow; run `tools/fetch_food.py --set culture` first)

Input   tools/cache/culture/<id>.<ext>, tools/culture/sources.json
Output  public/culture/<id>-{640,1200}.webp, src/content/culturePhotos.generated.json

The photographs are shown whole (a crop to 3:2 or 4:5 about a focal point, nothing cut out or retouched but a
light, even grade).
"""
import json
import os

from PIL import Image, ImageEnhance, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.path.join(ROOT, 'tools', 'cache', 'culture')
OUT = os.path.join(ROOT, 'public', 'culture')
# the frame each picture is shown in (width / height) and where its subject sits (fractions), for the crop
FRAMES = {
    'boyeo-carreta': (1.0, (0.5, 0.5)),
    'mascaradas': (0.8, (0.5, 0.38)),
    'calypso-limonense': (1.5, (0.5, 0.5)),
    'romeria': (1.5, (0.5, 0.5)),
    'punto-guanacasteco': (1.5, (0.5, 0.55)),
    'coffee-history': (1.5, (0.5, 0.55)),
    'coffee-growing': (1.5, (0.55, 0.5)),
    'coffee-cup': (1.5, (0.5, 0.45)),
}


def crop_to(im, ratio, focal):
    w, h = im.size
    if w / h > ratio:
        nw = round(h * ratio)
        x0 = min(max(0, round(focal[0] * w - nw / 2)), w - nw)
        return im.crop((x0, 0, x0 + nw, h))
    nh = round(w / ratio)
    y0 = min(max(0, round(focal[1] * h - nh / 2)), h - nh)
    return im.crop((0, y0, w, y0 + nh))


def main():
    os.makedirs(OUT, exist_ok=True)
    sources = json.load(open(os.path.join(ROOT, 'tools', 'culture', 'sources.json'), encoding='utf-8'))
    index = {}
    for key, src in sources.items():
        ratio, focal = FRAMES.get(key, (1.5, (0.5, 0.5)))
        im = ImageOps.exif_transpose(Image.open(os.path.join(CACHE, src['file']))).convert('RGB')
        im = crop_to(im, ratio, focal)
        im = ImageEnhance.Contrast(im).enhance(1.03)
        widths = [w for w in (640, 1200) if w <= im.width * 1.1] or [640]
        for w in widths:
            path = os.path.join(OUT, f'{key}-{w}.webp')
            im.resize((w, round(w / ratio)), Image.LANCZOS).save(path, 'WEBP', quality=80, method=6)
            print(f'{key}-{w}.webp {os.path.getsize(path) // 1024} KB')
        index[key] = {'widths': widths, 'aspect': ratio, 'title': src['title'].replace('File:', ''), 'author': src['author'], 'licence': src['licence'], 'licenceUrl': src['licenceUrl'], 'page': src['page']}
    with open(os.path.join(ROOT, 'src', 'content', 'culturePhotos.generated.json'), 'w', encoding='utf-8') as f:
        json.dump(index, f, indent=1, ensure_ascii=False)
        f.write('\n')


if __name__ == '__main__':
    main()
