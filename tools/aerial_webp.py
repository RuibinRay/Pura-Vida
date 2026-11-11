#!/usr/bin/env python3
"""Turns the renders of tools/aerial_plates.mjs into the responsive plates of the home page's opening.
    python3 tools/aerial_webp.py     (Pillow)  →  public/plates/aerial/{high,low}-{960,1600,2560}.webp
"""
import os
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'tools', 'scratch', 'aerial')
OUT = os.path.join(ROOT, 'public', 'plates', 'aerial')
os.makedirs(OUT, exist_ok=True)
for name in ('high', 'low'):
    im = Image.open(os.path.join(SRC, name + '.png')).convert('RGB')
    w, h = im.size
    im = im.crop((8, 8, w - 8, h - 8))  # the stage's hairline border
    for width in (960, 1600, 2560):
        out = im.resize((width, round(width * im.height / im.width)), Image.LANCZOS)
        path = os.path.join(OUT, f'{name}-{width}.webp')
        out.save(path, 'WEBP', quality=80 if width > 960 else 76, method=6)
        print(f'{name}-{width}.webp {os.path.getsize(path) // 1024} KB')
