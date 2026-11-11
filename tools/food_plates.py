#!/usr/bin/env python3
"""Cuts the plate out of each dish photograph and writes the responsive, transparent plates the site shows.

    python3 tools/food_plates.py [--preview DIR]        (numpy, Pillow; run tools/fetch_food.py first)

Input   tools/cache/food/<dish>.<ext>     the photographs (Wikimedia Commons, see tools/food/sources.json)
        tools/food/plates.json            per dish: the outline of the plate in the photograph and a light grade
Output  public/food/<dish>-{360,720,1080}.webp   square, transparent outside the plate
        src/content/foodPhotos.generated.json     widths and the credit of every photograph

The outline is given by hand, in fractions of the photograph: an ellipse [cx, cy, rx, ry] with an optional rotation
in degrees (plus "union" polygons for food that stands above the rim), or a polygon. Nothing is segmented or generated: what is inside the outline is the photograph, what is
outside is gone. "flatten" stretches an ellipse seen at an angle back to a circle, so plates photographed from the
side sit on a table seen from above without leaning.
"""
import argparse
import json
import math
import os

import numpy as np
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.path.join(ROOT, 'tools', 'cache', 'food')
OUT = os.path.join(ROOT, 'public', 'food')
WIDTHS = (360, 720, 1080)
SS = 3  # the mask is drawn at three times the size and reduced: a clean edge


def outline_mask(size, spec):
    w, h = size
    big = Image.new('L', (w * SS, h * SS), 0)
    d = ImageDraw.Draw(big)
    if 'poly' in spec:
        d.polygon([(x * w * SS, y * h * SS) for x, y in spec['poly']], fill=255)
    else:
        cx, cy, rx, ry = spec['ellipse']
        rot = math.radians(spec.get('rot', 0))
        pts = []
        for k in range(360):
            a = math.radians(k)
            ex, ey = rx * w * math.cos(a), ry * h * math.sin(a)
            pts.append(((cx * w + ex * math.cos(rot) - ey * math.sin(rot)) * SS, (cy * h + ex * math.sin(rot) + ey * math.cos(rot)) * SS))
        d.polygon(pts, fill=255)
    for extra in spec.get('union', []):  # food that stands above the rim (a slice of bread, a tortilla)
        d.polygon([(x * w * SS, y * h * SS) for x, y in extra], fill=255)
    mask = big.resize((w, h), Image.LANCZOS)
    feather = spec.get('feather', 0.0018) * max(w, h)
    # feather inward only: blur, then pull the edge in so no background shows through the soft rim
    blurred = np.asarray(mask.filter(ImageFilter.GaussianBlur(feather)), dtype=np.float32) / 255.0
    return np.clip((blurred - 0.5) * 2.0, 0, 1)


def grade(im, g):
    if g.get('brightness'):
        im = ImageEnhance.Brightness(im).enhance(g['brightness'])
    if g.get('contrast'):
        im = ImageEnhance.Contrast(im).enhance(g['contrast'])
    if g.get('saturation'):
        im = ImageEnhance.Color(im).enhance(g['saturation'])
    if g.get('warmth'):
        a = np.asarray(im, dtype=np.float32)
        k = g['warmth']
        a[..., 0] *= 1 + 0.06 * k
        a[..., 2] *= 1 - 0.06 * k
        im = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
    return im


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--preview')
    args = ap.parse_args()
    os.makedirs(OUT, exist_ok=True)
    sources = json.load(open(os.path.join(ROOT, 'tools', 'food', 'sources.json'), encoding='utf-8'))
    specs = json.load(open(os.path.join(ROOT, 'tools', 'food', 'plates.json'), encoding='utf-8'))
    index = {}
    for dish, spec in specs.items():
        src = sources[dish]
        im = Image.open(os.path.join(CACHE, src['file'])).convert('RGB')
        if spec.get('rotate'):  # some phone photographs carry their orientation only in metadata
            im = im.rotate(spec['rotate'], expand=True)
        im = grade(im, spec.get('grade', {}))
        alpha = outline_mask(im.size, spec)
        rgba = np.dstack([np.asarray(im), np.round(alpha * 255).astype(np.uint8)])
        ys, xs = np.where(alpha > 0.01)
        x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
        cut = Image.fromarray(rgba[y0:y1, x0:x1], 'RGBA')
        if spec.get('flatten') and 'ellipse' in spec:
            # true: all the way to a circle; a number: only until the plate is that round (height / width), which
            # keeps food photographed at a steep angle from being stretched out of shape
            target = 1.0 if spec['flatten'] is True else float(spec['flatten'])
            ex, ey = spec['ellipse'][2] * im.width, spec['ellipse'][3] * im.height
            k = max(1.0, target * ex / ey)
            cut = cut.resize((cut.width, round(cut.height * k)), Image.LANCZOS)
        side = max(cut.size)
        pad = round(side * 0.02)
        canvas = Image.new('RGBA', (side + pad * 2, side + pad * 2), (0, 0, 0, 0))
        canvas.paste(cut, (pad + (side - cut.width) // 2, pad + (side - cut.height) // 2))
        widths = [w for w in WIDTHS if w <= canvas.width * 1.15] or [WIDTHS[0]]
        for w in widths:
            out = canvas.resize((w, w), Image.LANCZOS)
            path = os.path.join(OUT, f'{dish}-{w}.webp')
            out.save(path, 'WEBP', quality=84, method=6, alpha_quality=92)
            print(f'{dish}-{w}.webp {os.path.getsize(path) // 1024} KB')
        if args.preview:
            os.makedirs(args.preview, exist_ok=True)
            bg = Image.new('RGBA', canvas.size, (106, 66, 40, 255))
            bg.alpha_composite(canvas)
            bg.convert('RGB').resize((600, 600), Image.LANCZOS).save(os.path.join(args.preview, dish + '.jpg'), quality=88)
        index[dish] = {
            'widths': widths,
            'title': src['title'].replace('File:', ''),
            'author': src['author'],
            'licence': src['licence'],
            'licenceUrl': src['licenceUrl'],
            'page': src['page'],
            'plate': spec.get('plate', 'own'),
            'note': spec.get('note', ''),
        }
    # uncut companion pictures (what goes into the pot)
    for key, src in sources.items():
        if key in specs:
            continue
        im = Image.open(os.path.join(CACHE, src['file'])).convert('RGB')
        widths = [w for w in (640, 1080) if w <= im.width]
        for w in widths:
            path = os.path.join(OUT, f'{key}-{w}.webp')
            im.resize((w, round(w * im.height / im.width)), Image.LANCZOS).save(path, 'WEBP', quality=80, method=6)
            print(f'{key}-{w}.webp {os.path.getsize(path) // 1024} KB')
        index[key] = {'widths': widths, 'aspect': round(im.width / im.height, 4), 'title': src['title'].replace('File:', ''), 'author': src['author'], 'licence': src['licence'], 'licenceUrl': src['licenceUrl'], 'page': src['page'], 'plate': 'photo', 'note': ''}
    with open(os.path.join(ROOT, 'src', 'content', 'foodPhotos.generated.json'), 'w', encoding='utf-8') as f:
        json.dump(index, f, indent=1, ensure_ascii=False)
        f.write('\n')


if __name__ == '__main__':
    main()
