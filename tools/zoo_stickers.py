#!/usr/bin/env python3
"""Cuts the wildlife trail's stickers from the owner's cut-outs and sprite sheets (tools/zoo/stickers.json).

  python3 tools/zoo_stickers.py [--only id,id] [--preview DIR]

For each sticker: the file's alpha inside `pick`, minus `erase` polygons, cropped to the silhouette; small sheet
animals upscaled ×2 with FSRCNN (the RGB with the transparent pixels filled by their nearest opaque colour, the alpha
bicubic); a WebP ladder under public/zoo/<id>-<w>.webp (premultiplied resize, so no dark rim), and
src/journey/zoo.generated.json with each sticker's aspect, widths and ground baseline.
"""
import sys, os, json, argparse
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, '/home/claude/pyextra')  # the OpenCV contrib build (dnn_superres), as in plates.py
import cv2
import numpy as np
from plates import ROOT, poly_mask, bbox_of, upscale2, save_webp

OUT = os.path.join(ROOT, 'public', 'zoo')
SPEC = os.path.join(ROOT, 'tools', 'zoo', 'stickers.json')


def fill_transparent(bgr, alpha, eps=1e-3):
    """RGB under alpha≈0 replaced by the nearest opaque pixel's colour (so resampling never mixes in black)."""
    inv = (alpha <= eps).astype(np.uint8)
    if not inv.any():
        return bgr
    _, lab = cv2.distanceTransformWithLabels(inv, cv2.DIST_L2, 3, labelType=cv2.DIST_LABEL_PIXEL)
    ys, xs = np.nonzero(inv == 0)
    lut = np.zeros((int(lab.max()) + 1, 3), np.float32)
    lut[lab[ys, xs]] = bgr[ys, xs]
    return np.where(inv[..., None] == 1, lut[lab], bgr)


def cut(entry):
    path = os.path.join(ROOT, entry['png'])
    im = cv2.imread(path, cv2.IMREAD_UNCHANGED)
    if im is None or im.ndim != 3 or im.shape[2] != 4:
        raise SystemExit(f'{entry["png"]} is not RGBA')
    alpha = im[:, :, 3].astype(np.float32) / 255
    H, W = alpha.shape
    if entry.get('pick'):
        x0, y0, x1, y1 = entry['pick']
        keep = np.zeros_like(alpha)
        keep[max(0, y0):min(H, y1), max(0, x0):min(W, x1)] = 1
        alpha = alpha * keep
    for pts in entry.get('erase', []):
        alpha = alpha * (1 - poly_mask(H, W, pts, 1.0, feather=1.0))
    # drop specks: keep the largest connected blobs (an animal, its perch) — anything under 1.5 % of the biggest goes
    m8 = (alpha > 0.15).astype(np.uint8)
    n, lab, stats, _ = cv2.connectedComponentsWithStats(m8, 8)
    if n > 2:
        areas = stats[1:, cv2.CC_STAT_AREA]
        big = areas.max()
        keep = np.zeros_like(alpha)
        for i in range(1, n):
            if stats[i, cv2.CC_STAT_AREA] >= 0.015 * big:
                keep[lab == i] = 1
        keep = cv2.dilate(keep, np.ones((5, 5), np.uint8))
        alpha = alpha * keep
    box = bbox_of(alpha, 0.02, pad=1)
    if box is None:
        raise SystemExit(f'{entry["id"]}: nothing inside the pick box')
    bx0, by0, bx1, by1 = box
    bgr = im[by0:by1, bx0:bx1, :3].astype(np.float32)
    a = alpha[by0:by1, bx0:bx1]
    if entry.get('flip'):
        bgr = bgr[:, ::-1].copy(); a = a[:, ::-1].copy()
    bgr = fill_transparent(bgr, a)
    if entry.get('upscale'):
        key = f"zoo-{entry['id']}-{bx0}-{by0}-{bx1}-{by1}"
        up = upscale2(np.clip(bgr, 0, 255).astype(np.uint8), key)
        a = cv2.resize(a, (up.shape[1], up.shape[0]), interpolation=cv2.INTER_CUBIC)
        bgr = up.astype(np.float32)
    a = np.clip(a, 0, 1)
    return bgr, a


def ladder(bgr, a, widths):
    """(width, BGRA uint8) for each width ≤ the sticker's own width (plus the native width if smaller than all)."""
    h, w = a.shape
    prem = bgr * a[..., None]
    out = []
    ws = [x for x in widths if x <= w] or [w]
    if w not in ws and w < max(widths):
        ws = [w] + ws
    for tw in ws:
        th = max(1, round(h * tw / w))
        p = cv2.resize(prem, (tw, th), interpolation=cv2.INTER_AREA)
        aa = np.clip(cv2.resize(a, (tw, th), interpolation=cv2.INTER_AREA), 0, 1)
        rgb = np.clip(p / np.maximum(aa[..., None], 1e-3), 0, 255)
        rgb = fill_transparent(rgb, aa)
        out.append((tw, np.dstack([rgb.astype(np.uint8), (aa * 255).astype(np.uint8)])))
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--only', default=None)
    ap.add_argument('--preview', default=None)
    args = ap.parse_args()
    spec = json.load(open(SPEC))
    only = set(args.only.split(',')) if args.only else None
    os.makedirs(OUT, exist_ok=True)
    gen_path = os.path.join(ROOT, 'src', 'journey', 'zoo.generated.json')
    manifest = json.load(open(gen_path)) if os.path.isfile(gen_path) else {}
    if args.preview:
        os.makedirs(args.preview, exist_ok=True)
    total = 0
    for entry in spec['stickers']:
        if only and entry['id'] not in only:
            continue
        bgr, a = cut(entry)
        for fn in os.listdir(OUT):
            if fn.startswith(entry['id'] + '-') and fn.endswith('.webp') and fn[len(entry['id']) + 1:-5].isdigit():
                os.remove(os.path.join(OUT, fn))
        widths = []
        for tw, bgra in ladder(bgr, a, spec['widths']):
            p = os.path.join(OUT, f"{entry['id']}-{tw}.webp")
            save_webp(p, bgra, 86)
            widths.append(tw); total += os.path.getsize(p)
        h, w = a.shape
        manifest[entry['id']] = {'w': int(w), 'h': int(h), 'widths': sorted(widths, reverse=True), 'baseline': entry.get('baseline', 1)}
        print(f"  {entry['id']}: {w}x{h} from {os.path.basename(entry['png'])}{' ×2' if entry.get('upscale') else ''} → {widths}")
        if args.preview:
            grey = np.full_like(bgr, 128)
            comp = (bgr * a[..., None] + grey * (1 - a[..., None])).astype(np.uint8)
            cv2.imwrite(os.path.join(args.preview, entry['id'] + '.png'), comp)
    manifest = {k: manifest[k] for k in sorted(manifest)}
    json.dump(manifest, open(gen_path, 'w'), indent=0)
    json.dump(manifest, open(os.path.join(OUT, 'manifest.json'), 'w'))  # a copy the live site serves (deployment checks)
    print(f'{len(manifest)} stickers in the manifest; {total // 1024} KB written')


if __name__ == '__main__':
    main()
