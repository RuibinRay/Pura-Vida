#!/usr/bin/env python3
"""Builds the homepage plates from the owner's three reference images.

  python3 tools/hero_assets.py <ref3_base.png> <ref2.jpg> <ref1.jpg>

Outputs (public/plates/):
  forest/base-{w}.webp            the hero plate (image A, EDSR-upscaled 2x)
  forest/near-left-{w}.webp       near-frame cut-outs with alpha (left / right halves), cropped to their boxes
  forest/near-right-{w}.webp
  forest/manifest.json            sizes, boxes (fractions of the plate), focal points
  beach/base-{w}.webp             the illustrated wildlife plate (image B)
  beach/near-left-{w}.webp / near-right-{w}.webp
  beach/manifest.json
  poster/base-{w}.webp            the end card (image C)
  poster/manifest.json
  mist-1.png / mist-2.png         tileable mist textures (alpha)
  ../og.jpg                       1200x630 social card from the poster

The near-frame mask is a heuristic (saturation x darkness x local contrast x a spatial frame prior,
sky and water excluded) — documented in docs/HOMEPAGE_REDESIGN.md. No depth model is used.
"""
import json
import os
import sys

import cv2
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'public', 'plates')
WIDTHS = [2752, 1920, 1376, 960, 640]


def poly(h, w, pts):
    m = np.zeros((h, w), np.float32)
    cv2.fillPoly(m, [np.array([(int(x * w), int(y * h)) for x, y in pts], np.int32)], 1.0)
    return m


def near_mask(im, frame_polys, boxes=(), blur=3, lo=0.12, span=0.5):
    """Soft mask of the near foliage frame of a plate (values 0..1)."""
    h, w = im.shape[:2]
    hsv = cv2.cvtColor(im, cv2.COLOR_BGR2HSV).astype(np.float32)
    H, S, V = hsv[:, :, 0] / 180, hsv[:, :, 1] / 255, hsv[:, :, 2] / 255
    sky = cv2.GaussianBlur(((V > 0.62) & (S < 0.28)).astype(np.float32), (0, 0), 6)
    water = (((H > 0.42) & (H < 0.62)) & (S > 0.25) & (V > 0.3)).astype(np.float32)
    near = np.clip((S - 0.22) * 2.4, 0, 1) * np.clip((0.9 - V) * 1.5, 0, 1)
    gray = cv2.cvtColor(im, cv2.COLOR_BGR2GRAY).astype(np.float32) / 255
    lap = np.abs(cv2.Laplacian(cv2.GaussianBlur(gray, (0, 0), 1.2), cv2.CV_32F))
    lap = cv2.GaussianBlur(lap, (0, 0), 10)
    lap = np.clip(lap / (lap.mean() * 2.5), 0, 1)
    score = np.clip(0.7 * near + 0.5 * lap, 0, 1)
    prior = np.zeros((h, w), np.float32)
    for pts in frame_polys:
        prior = np.maximum(prior, poly(h, w, pts))
    prior = cv2.GaussianBlur(prior, (0, 0), 18)
    mask = np.clip(score * prior * 1.3 + prior * 0.35, 0, 1)
    for pts, fn in boxes:  # forced regions (e.g. a dark animal inside the frame)
        mask = np.clip(mask + 0.9 * poly(h, w, pts) * fn(S, V) * np.maximum(prior, 0.6), 0, 1)
    mask = mask * (1 - sky) * (1 - 0.95 * water)
    mask = cv2.GaussianBlur(mask, (0, 0), blur)
    return np.clip((mask - lo) / span, 0, 1)


def save_webp(path, arr_bgr_or_bgra, quality):
    if arr_bgr_or_bgra.shape[2] == 4:
        rgba = cv2.cvtColor(arr_bgr_or_bgra, cv2.COLOR_BGRA2RGBA)
        Image.fromarray(rgba, 'RGBA').save(path, 'WEBP', quality=quality, method=6)
    else:
        rgb = cv2.cvtColor(arr_bgr_or_bgra, cv2.COLOR_BGR2RGB)
        Image.fromarray(rgb, 'RGB').save(path, 'WEBP', quality=quality, method=6)


def resize_to_width(arr, width):
    h, w = arr.shape[:2]
    if width >= w:
        return arr
    nh = round(h * width / w)
    return cv2.resize(arr, (width, nh), interpolation=cv2.INTER_AREA)


def write_plate(name, base, mask, split, focal, widths=WIDTHS, base_q=82, layer_q=84):
    """base: BGR plate; mask: float mask (0..1) at the plate's size or None; split: (x0, x1) feather band as fractions."""
    d = os.path.join(OUT, name)
    os.makedirs(d, exist_ok=True)
    h, w = base.shape[:2]
    manifest = {'width': w, 'height': h, 'widths': [x for x in widths if x <= w], 'focal': focal, 'layers': []}
    for width in manifest['widths']:
        save_webp(os.path.join(d, f'base-{width}.webp'), resize_to_width(base, width), base_q)
    if mask is not None:
        xs = np.linspace(0, 1, w, dtype=np.float32)
        x0, x1 = split
        right_w = np.clip((xs - x0) / max(1e-6, (x1 - x0)), 0, 1)  # 0 on the left, 1 on the right
        left_w = 1 - right_w
        for lname, wgt in (('near-left', left_w), ('near-right', right_w)):
            a = np.clip(mask * wgt[None, :], 0, 1)
            ys, xs2 = np.where(a > 0.02)
            if len(ys) == 0:
                continue
            by0, by1, bx0, bx1 = ys.min(), ys.max() + 1, xs2.min(), xs2.max() + 1
            crop = base[by0:by1, bx0:bx1]
            alpha = (a[by0:by1, bx0:bx1] * 255).astype(np.uint8)
            bgra = np.dstack([crop, alpha])
            # premultiply-safe: the colour under alpha 0 is irrelevant for WebP lossy alpha, keep as is
            layer = {'name': lname, 'box': [bx0 / w, by0 / h, (bx1 - bx0) / w, (by1 - by0) / h], 'widths': []}
            for width in manifest['widths']:
                lw = round((bx1 - bx0) * width / w)
                save_webp(os.path.join(d, f'{lname}-{width}.webp'), resize_to_width(bgra, lw), layer_q)
                layer['widths'].append(width)
            manifest['layers'].append(layer)
    with open(os.path.join(d, 'manifest.json'), 'w') as f:
        json.dump(manifest, f)
    sizes = {fn: os.path.getsize(os.path.join(d, fn)) for fn in sorted(os.listdir(d))}
    print(name, {k: f'{v // 1024} KB' for k, v in sizes.items()})


def tileable_noise(size, octaves, seed):
    rng = np.random.default_rng(seed)
    acc = np.zeros((size, size), np.float32)
    amp, freq = 1.0, 4
    for _ in range(octaves):
        g = rng.random((freq, freq)).astype(np.float32)
        up = cv2.resize(np.tile(g, (3, 3)), (size * 3, size * 3), interpolation=cv2.INTER_CUBIC)[size:size * 2, size:size * 2]
        acc += amp * up
        amp *= 0.5
        freq *= 2
    acc = (acc - acc.min()) / (acc.max() - acc.min())
    return acc


def write_mist():
    os.makedirs(OUT, exist_ok=True)
    for i, seed in ((1, 7), (2, 23)):
        n = tileable_noise(512, 5, seed)
        a = np.clip((n - 0.35) / 0.65, 0, 1) ** 1.6
        rgba = np.dstack([np.full_like(a, 1.0), np.full_like(a, 1.0), np.full_like(a, 1.0), a * 0.85])
        Image.fromarray((rgba * 255).astype(np.uint8), 'RGBA').save(os.path.join(OUT, f'mist-{i}.png'), optimize=True)
    print('mist textures written')


def write_og(poster):
    h, w = poster.shape[:2]
    target = 1200 / 630
    cw = w
    ch = round(w / target)
    y0 = max(0, round(h * 0.47 - ch / 2))
    crop = poster[y0:y0 + ch, 0:cw]
    og = cv2.resize(crop, (1200, 630), interpolation=cv2.INTER_AREA)
    Image.fromarray(cv2.cvtColor(og, cv2.COLOR_BGR2RGB)).save(os.path.join(ROOT, 'public', 'og.jpg'), 'JPEG', quality=86, optimize=True)
    print('og.jpg', os.path.getsize(os.path.join(ROOT, 'public', 'og.jpg')) // 1024, 'KB')


def main():
    ref3, ref2, ref1 = sys.argv[1:4]
    # --- forest plate (image A) ---
    base = cv2.imread(ref3)
    h, w = base.shape[:2]
    small = cv2.resize(base, (1376, 768), interpolation=cv2.INTER_AREA) if w > 1376 else base
    forest_polys = [
        [(0, 0), (0.36, 0), (0.30, 0.12), (0.20, 0.20), (0.17, 0.32), (0.13, 0.45), (0.10, 0.6), (0.12, 0.78), (0, 0.9)],
        [(0.64, 0), (1, 0), (1, 1), (0.72, 1), (0.74, 0.86), (0.80, 0.7), (0.78, 0.55), (0.76, 0.40), (0.78, 0.25), (0.68, 0.12)],
        [(0, 0.80), (0.15, 0.80), (0.30, 0.86), (0.45, 0.92), (0.56, 0.92), (0.70, 0.86), (1, 0.84), (1, 1), (0, 1)],
    ]
    boxes = [
        ([(0.06, 0.08), (0.26, 0.08), (0.26, 0.40), (0.06, 0.40)], lambda S, V: np.clip((0.5 - V) * 3, 0, 1)),  # toucans
        ([(0.74, 0.12), (0.96, 0.12), (0.96, 0.62), (0.74, 0.62)], lambda S, V: ((S < 0.45) & (V > 0.25) & (V < 0.8)).astype(np.float32)),  # sloth
    ]
    m = near_mask(small, forest_polys, boxes)
    m = cv2.resize(m, (w, h), interpolation=cv2.INTER_LINEAR)
    write_plate('forest', base, m, (0.44, 0.56), {'x': 0.47, 'y': 0.24, 'waterfall': [0.24, 0.62]})
    # --- beach plate (image B): the foliage tunnel is the near frame ---
    beach = cv2.imread(ref2)
    bh, bw = beach.shape[:2]
    bsmall = cv2.resize(beach, (1376, round(1376 * bh / bw)), interpolation=cv2.INTER_AREA)
    beach_polys = [
        [(0, 0), (0.42, 0), (0.36, 0.2), (0.30, 0.45), (0.24, 0.6), (0.18, 0.75), (0, 0.8)],
        [(0.58, 0), (1, 0), (1, 0.85), (0.80, 0.78), (0.70, 0.6), (0.66, 0.4), (0.64, 0.2)],
    ]
    bm = near_mask(bsmall, beach_polys, blur=4, lo=0.18, span=0.5)
    bm = cv2.resize(bm, (bw, bh), interpolation=cv2.INTER_LINEAR)
    write_plate('beach', beach, bm, (0.40, 0.60), {'x': 0.5, 'y': 0.45})
    # --- poster (image C) ---
    poster = cv2.imread(ref1)
    write_plate('poster', poster, None, (0.5, 0.5), {'x': 0.5, 'y': 0.5})
    write_og(poster)
    write_mist()
    # one importable manifest for the app
    allm = {n: json.load(open(os.path.join(OUT, n, 'manifest.json'))) for n in ('forest', 'beach', 'poster')}
    with open(os.path.join(ROOT, 'src', 'journey', 'plates.generated.json'), 'w') as f:
        json.dump(allm, f)


if __name__ == '__main__':
    main()
