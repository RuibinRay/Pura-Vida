#!/usr/bin/env python3
"""Builds a homepage plate from one of the owner's images and a spec file.

  python3 tools/plates.py tools/plates/<id>.json [--preview DIR] [--no-upscale]

A spec names the source image, the upscale factor, the focal point, the animals that move (each cut out by
U²-Net on a crop, corrected by include/exclude polygons and optional GrabCut, then split into parts that the
site animates — a head that turns, wings that flap, a tail that sways), the water regions that flow, and the
optional near-frame layers (the heuristic from the first journey build). Coordinates in the spec are SOURCE
pixels; the tool scales them by the upscale factor.

Outputs under public/plates/<id>/:
  base-{w}.webp                     the plate, inpainted under every moving part
  <animal>-<part>-{w}.webp          cut-outs with alpha, cropped to their boxes
  water-<name>-{w}.webp             water regions with soft alpha (the site makes them flow)
  near-left-{w}.webp / near-right   near-frame layers when the spec has a "frame"
  manifest.json                     sizes, boxes (fractions of the plate), pivots, axes, animations

Models: U²-Net (u2net.onnx, github.com/danielgatis/rembg) through onnxruntime; FSRCNN x2
(github.com/Saafke/FSRCNN_Tensorflow) through OpenCV's dnn_superres. Both are downloaded once into ~/models.
"""
import sys
sys.path.insert(0, '/home/claude/pyextra')  # OpenCV contrib build (dnn_superres, xphoto)
import argparse
import hashlib
import json
import os
import time

import cv2
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'public', 'plates')
MODELS = os.environ.get('PLATES_MODELS', '/home/claude/models')
U2NET = os.path.join(MODELS, 'rembg', 'u2net.onnx')
FSRCNN = os.path.join(MODELS, 'fsrcnn', 'models', 'FSRCNN_x2.pb')
CACHE = os.path.join(os.environ.get('PLATES_CACHE', os.path.join(MODELS, 'plates-cache')))
os.makedirs(CACHE, exist_ok=True)

_sess = None


def u2net_session():
    global _sess
    if _sess is None:
        import onnxruntime as ort
        _sess = ort.InferenceSession(U2NET, providers=['CPUExecutionProvider'])
    return _sess


def u2net_mask(bgr):
    """Salient-object mask of a crop, 0..1, at the crop's size."""
    sess = u2net_session()
    inp = sess.get_inputs()[0].name
    h, w = bgr.shape[:2]
    rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)
    x = cv2.resize(rgb, (320, 320), interpolation=cv2.INTER_AREA).astype(np.float32) / 255.0
    x = (x - np.array([0.485, 0.456, 0.406], np.float32)) / np.array([0.229, 0.224, 0.225], np.float32)
    out = sess.run(None, {inp: x.transpose(2, 0, 1)[None]})[0][0, 0]
    out = (out - out.min()) / max(1e-6, out.max() - out.min())
    return cv2.resize(out, (w, h), interpolation=cv2.INTER_LINEAR)


def upscale2(src, cache_key):
    p = os.path.join(CACHE, cache_key + '-x2.png')
    if os.path.exists(p):
        return cv2.imread(p)
    sr = cv2.dnn_superres.DnnSuperResImpl_create()
    sr.readModel(FSRCNN)
    sr.setModel('fsrcnn', 2)
    t = time.time()
    out = sr.upsample(src)
    print(f'  upscaled x2 with FSRCNN in {time.time() - t:.1f} s → {out.shape[1]}x{out.shape[0]}')
    cv2.imwrite(p, out)
    return out


def poly_mask(h, w, pts, s=1.0, feather=0.0):
    """Polygon → mask. Points are source px (scaled by s) or, when every value is ≤ 1, fractions of the plate."""
    m = np.zeros((h, w), np.float32)
    if all(abs(x) <= 1 and abs(y) <= 1 for x, y in pts):
        poly = [(round(x * w), round(y * h)) for x, y in pts]
    else:
        poly = [(round(x * s), round(y * s)) for x, y in pts]
    cv2.fillPoly(m, [np.array(poly, np.int32)], 1.0)
    if feather > 0:
        m = cv2.GaussianBlur(m, (0, 0), feather)
    return m


def signed_dist(h, w, p0, p1):
    """Signed distance of every pixel to the line p0→p1 (positive on the 'pos' side: cross(d, q-p0) > 0)."""
    ys, xs = np.mgrid[0:h, 0:w].astype(np.float32)
    dx, dy = p1[0] - p0[0], p1[1] - p0[1]
    n = max(1e-6, (dx * dx + dy * dy) ** 0.5)
    return (dx * (ys - p0[1]) - dy * (xs - p0[0])) / n


def along(h, w, p0, p1):
    """Position along the axis p0→p1 in pixels (0 at p0)."""
    ys, xs = np.mgrid[0:h, 0:w].astype(np.float32)
    dx, dy = p1[0] - p0[0], p1[1] - p0[1]
    n = max(1e-6, (dx * dx + dy * dy) ** 0.5)
    return (dx * (xs - p0[0]) + dy * (ys - p0[1])) / n


def save_webp(path, arr, quality):
    if arr.shape[2] == 4:
        Image.fromarray(cv2.cvtColor(arr, cv2.COLOR_BGRA2RGBA), 'RGBA').save(path, 'WEBP', quality=quality, method=6)
    else:
        Image.fromarray(cv2.cvtColor(arr, cv2.COLOR_BGR2RGB), 'RGB').save(path, 'WEBP', quality=quality, method=6)


def resize_to_width(arr, width):
    h, w = arr.shape[:2]
    if width >= w:
        return arr
    return cv2.resize(arr, (width, max(1, round(h * width / w))), interpolation=cv2.INTER_AREA)


def bbox_of(alpha, thresh=0.01, pad=2):
    ys, xs = np.where(alpha > thresh)
    if len(ys) == 0:
        return None
    h, w = alpha.shape
    return [max(0, xs.min() - pad), max(0, ys.min() - pad), min(w, xs.max() + 1 + pad), min(h, ys.max() + 1 + pad)]


def animal_alpha(plate, a, s):
    """Full alpha of an animal at plate resolution from its spec ops."""
    H, W = plate.shape[:2]
    m = np.zeros((H, W), np.float32)
    for box in a.get('u2net', [a['box']]):
        x0, y0, x1, y1 = [round(v * s) for v in box]
        pad = round(0.06 * max(x1 - x0, y1 - y0))
        cx0, cy0, cx1, cy1 = max(0, x0 - pad), max(0, y0 - pad), min(W, x1 + pad), min(H, y1 + pad)
        crop = plate[cy0:cy1, cx0:cx1]
        mm = u2net_mask(crop)
        # keep only what lies inside the declared box (the model may grab a neighbouring object)
        inside = np.zeros_like(mm)
        inside[y0 - cy0:y1 - cy0, x0 - cx0:x1 - cx0] = 1
        m[cy0:cy1, cx0:cx1] = np.maximum(m[cy0:cy1, cx0:cx1], mm * cv2.GaussianBlur(inside, (0, 0), 3))
    # include polygons are definite foreground, or probable foreground when GrabCut will refine them (so it can trim)
    inc_value = 0.6 if a.get('grabcut') else 1.0
    for pts in a.get('include', []):
        m = np.maximum(m, poly_mask(H, W, pts, s) * inc_value)
    for pts in a.get('exclude', []):
        m = m * (1 - poly_mask(H, W, pts, s))
    # GrabCut refinement inside boxes (thin structures such as antlers, or where the model's edge is soft)
    for box in a.get('grabcut', []):
        x0, y0, x1, y1 = [round(v * s) for v in box]
        sub = plate[y0:y1, x0:x1]
        ms = m[y0:y1, x0:x1]
        gc = np.full(ms.shape, cv2.GC_PR_BGD, np.uint8)
        gc[ms > 0.4] = cv2.GC_PR_FGD
        gc[ms > 0.85] = cv2.GC_FGD
        gc[ms < 0.02] = cv2.GC_BGD
        bgd, fgd = np.zeros((1, 65), np.float64), np.zeros((1, 65), np.float64)
        try:
            cv2.grabCut(sub, gc, None, bgd, fgd, 4, cv2.GC_INIT_WITH_MASK)
            fg = ((gc == cv2.GC_FGD) | (gc == cv2.GC_PR_FGD)).astype(np.float32)
            m[y0:y1, x0:x1] = cv2.GaussianBlur(fg, (0, 0), 1.0)
        except cv2.error as e:
            print('  grabcut failed:', e)
    lo, hi = a.get('threshold', [0.3, 0.7])
    m = np.clip((m - lo) / max(1e-6, hi - lo), 0, 1)
    m = cv2.GaussianBlur(m, (0, 0), a.get('feather', 0.8))
    # restrict to the declared box (soft)
    x0, y0, x1, y1 = [round(v * s) for v in a['box']]
    box = np.zeros((H, W), np.float32)
    box[max(0, y0 - 4):y1 + 4, max(0, x0 - 4):x1 + 4] = 1
    return m * cv2.GaussianBlur(box, (0, 0), 2)


def resolve_overlaps(alphas, animals, s, H, W):
    """A pixel belongs to one animal. Two animals whose boxes overlap (the toucan pair) each get the other's pixels
    from the segmentation of their own crop — the second bird's body would then travel with the first bird's body
    part, and the first bird's beak with the second's. Where both masks claim a pixel, an explicit poly part (a head)
    wins; otherwise the pixel goes to the animal whose box it lies deeper inside, with a soft boundary. The loser keeps
    only what the winner leaves uncovered, so a feathered edge over a solid interior costs the interior nothing."""
    n = len(animals)
    if n < 2:
        return alphas
    ys, xs = np.mgrid[0:H, 0:W].astype(np.float32)
    claims, depths = [], []
    for a in animals:
        c = np.zeros((H, W), np.float32)
        for p in a.get('parts', []):
            if 'poly' in p:
                c = np.maximum(c, poly_mask(H, W, p['poly'], s, feather=1.0))
        claims.append(c)
        x0, y0, x1, y1 = [v * s for v in a['box']]
        depths.append(np.clip(np.minimum(np.minimum(xs - x0, x1 - xs), np.minimum(ys - y0, y1 - ys)), 0, None))
    for i in range(n):
        for j in range(i + 1, n):
            both = (alphas[i] > 0.05) & (alphas[j] > 0.05)
            if not both.any():
                continue
            w = np.clip((depths[i] - depths[j]) / (4 * s) + 0.5, 0, 1)  # share of the pixel that i wins
            w = np.where(claims[i] > 0.5, 1.0, w)
            w = np.where(claims[j] > 0.5, 0.0, w)
            ai, aj = alphas[i], alphas[j]
            ni = ai * (w + (1 - w) * (1 - aj))
            nj = aj * ((1 - w) + w * (1 - ai))
            alphas[i] = np.where(both, ni, ai).astype(np.float32)
            alphas[j] = np.where(both, nj, aj).astype(np.float32)
            print(f'  overlap {animals[i]["id"]} × {animals[j]["id"]}: {int(both.sum())} px resolved')
    return alphas


def split_parts(alpha, a, s, H, W):
    """Returns [(part spec, alpha)] in draw order (z ascending)."""
    parts = []
    taken = np.zeros_like(alpha)
    rest = None
    for p in a.get('parts', []):
        if p.get('rest'):
            rest = p
            continue
        if 'poly' in p:
            wgt = poly_mask(H, W, p['poly'], s, feather=p.get('edge', 1.5))
        elif 'half' in p:
            hf = p['half']
            p0 = [v * s for v in hf['axis'][0]]
            p1 = [v * s for v in hf['axis'][1]]
            d = signed_dist(H, W, p0, p1)
            if hf.get('side', 'pos') == 'neg':
                d = -d
            # the wing starts (halfWidth − overlap) from the axis; the body band stays in the rest part
            start = (hf.get('halfWidth', 12) - hf.get('overlap', 5)) * s / 2
            wgt = np.clip((d - start) / max(1.0, hf.get('feather', 3) * s / 2), 0, 1)
            if 'span' in hf:  # limit along the axis (fractions of the axis length)
                al = along(H, W, p0, p1)
                L = ((p1[0] - p0[0]) ** 2 + (p1[1] - p0[1]) ** 2) ** 0.5
                a0, a1 = hf['span']
                wgt = wgt * np.clip((al - a0 * L) / 6 + 0.5, 0, 1) * np.clip(((a1 * L) - al) / 6 + 0.5, 0, 1)
        elif 'band' in p:
            bd = p['band']
            p0 = [v * s for v in bd['axis'][0]]
            p1 = [v * s for v in bd['axis'][1]]
            d = np.abs(signed_dist(H, W, p0, p1))
            hw = bd['halfWidth'] * s / 2
            wgt = np.clip((hw - d) / max(1.0, bd.get('feather', 3) * s / 2) + 0.5, 0, 1)
        else:
            raise SystemExit(f'part {p["name"]} needs poly, half, band or rest')
        pa = alpha * wgt
        parts.append((p, pa))
        taken = np.maximum(taken, wgt)
    if rest is not None:
        parts.append((rest, alpha * np.clip(1 - taken, 0, 1)))
    parts.sort(key=lambda t: t[0].get('z', 1))
    return parts


def inpaint(plate, mask, method, source=None, s=1.0):
    m8 = (mask > 0.15).astype(np.uint8) * 255
    m8 = cv2.dilate(m8, np.ones((7, 7), np.uint8))
    if m8.max() == 0:
        return plate
    if method == 'clone':
        # a large hole: clone foliage from a neighbouring patch with Poisson blending (texture survives, colours match)
        ys, xs = np.where(m8 > 0)
        y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
        bh, bw = y1 - y0, x1 - x0
        if source:
            sx0, sy0, sx1, sy1 = [round(v * s) for v in source]
        else:  # default: the patch to the left, or to the right when there is no room
            sx0 = x0 - bw - 8 if x0 - bw - 8 >= 0 else x1 + 8
            sx1 = sx0 + bw
            sy0, sy1 = y0, y1
        src = plate[max(0, sy0):sy1, max(0, sx0):sx1]
        src = cv2.resize(src, (bw, bh), interpolation=cv2.INTER_AREA)
        hole = m8[y0:y1, x0:x1]
        # seamlessClone needs the mask strictly inside the patch
        hole = cv2.erode(hole, np.ones((3, 3), np.uint8))
        hole[0, :] = 0; hole[-1, :] = 0; hole[:, 0] = 0; hole[:, -1] = 0
        center = (x0 + bw // 2, y0 + bh // 2)
        try:
            return cv2.seamlessClone(src, plate, hole, center, cv2.NORMAL_CLONE)
        except cv2.error as e:
            print('  clone failed, falling back to telea:', e)
            return cv2.inpaint(plate, m8, 9, cv2.INPAINT_TELEA)
    if method in ('fsr', 'fsr-best'):
        ys, xs = np.where(m8 > 0)
        pad = 48
        y0, y1, x0, x1 = max(0, ys.min() - pad), min(plate.shape[0], ys.max() + pad), max(0, xs.min() - pad), min(plate.shape[1], xs.max() + pad)
        sub = plate[y0:y1, x0:x1].copy()
        # xphoto.inpaint expects the mask to be 1 where the pixel is KNOWN
        known = (m8[y0:y1, x0:x1] == 0).astype(np.uint8)
        dst = np.zeros_like(sub)
        cv2.xphoto.inpaint(sub, known, dst, cv2.xphoto.INPAINT_FSR_BEST if method == 'fsr-best' else cv2.xphoto.INPAINT_FSR_FAST)
        out = plate.copy()
        out[y0:y1, x0:x1] = dst
        return out
    return cv2.inpaint(plate, m8, 9, cv2.INPAINT_TELEA)


def water_alpha(plate, wspec, s):
    H, W = plate.shape[:2]
    a = poly_mask(H, W, wspec['poly'], s, feather=wspec.get('feather', 6) * s / 2)
    if wspec.get('whiteOnly'):
        hsv = cv2.cvtColor(plate, cv2.COLOR_BGR2HSV).astype(np.float32)
        S, V = hsv[:, :, 1] / 255, hsv[:, :, 2] / 255
        white = np.clip((V - wspec.get('vMin', 0.55)) / 0.25, 0, 1) * np.clip((wspec.get('sMax', 0.45) - S) / 0.2, 0, 1)
        white = cv2.GaussianBlur(white, (0, 0), 2 * s)
        a = a * np.clip(white * 1.4, 0, 1)
    return a


# ---- near-frame mask (from the first journey build) ---------------------------------------------
def near_mask(im, frame_polys, s, blur=3, lo=0.12, span=0.5):
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
        prior = np.maximum(prior, poly_mask(h, w, pts, s))
    prior = cv2.GaussianBlur(prior, (0, 0), 18)
    mask = np.clip(score * prior * 1.3 + prior * 0.35, 0, 1)
    mask = mask * (1 - sky) * (1 - 0.95 * water)
    mask = cv2.GaussianBlur(mask, (0, 0), blur)
    return np.clip((mask - lo) / span, 0, 1)


def export_layer(d, name, plate, alpha, widths, W, quality=84):
    box = bbox_of(alpha)
    if box is None:
        return None
    bx0, by0, bx1, by1 = box
    crop = plate[by0:by1, bx0:bx1]
    a8 = (np.clip(alpha[by0:by1, bx0:bx1], 0, 1) * 255).astype(np.uint8)
    bgra = np.dstack([crop, a8])
    out_widths = []
    for width in widths:
        lw = max(1, round((bx1 - bx0) * width / W))
        save_webp(os.path.join(d, f'{name}-{width}.webp'), resize_to_width(bgra, lw), quality)
        out_widths.append(width)
    return box, out_widths


def frac_box(box, W, H):
    x0, y0, x1, y1 = box
    return [x0 / W, y0 / H, (x1 - x0) / W, (y1 - y0) / H]


def write_index():
    """Merges every public/plates/*/manifest.json into the importable index the app reads."""
    idx = {}
    for name in sorted(os.listdir(OUT)):
        mp = os.path.join(OUT, name, 'manifest.json')
        if os.path.isfile(mp):
            idx[name] = json.load(open(mp))
    with open(os.path.join(ROOT, 'src', 'journey', 'plates.generated.json'), 'w') as f:
        json.dump(idx, f)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('spec', nargs='?')
    ap.add_argument('--index-only', action='store_true', help='only rebuild src/journey/plates.generated.json')
    ap.add_argument('--preview', default=None, help='directory for review sheets')
    ap.add_argument('--no-upscale', action='store_true')
    args = ap.parse_args()
    if args.index_only or not args.spec:
        write_index()
        print('index written')
        return
    spec = json.load(open(args.spec))
    pid = spec['id']
    src_path = os.path.join(ROOT, spec['source'])
    src = cv2.imread(src_path)
    if src is None:
        raise SystemExit('cannot read ' + src_path)
    s = 1.0
    plate = src
    if spec.get('upscale', 1) == 2 and not args.no_upscale:
        key = hashlib.md5(open(src_path, 'rb').read()).hexdigest()[:12]
        plate = upscale2(src, key)
        s = 2.0
    H, W = plate.shape[:2]
    widths = [W] + [round(W * f) for f in (0.72, 0.5, 0.33, 0.215)]
    widths = [w for w in widths if w <= W]
    d = os.path.join(OUT, pid)
    os.makedirs(d, exist_ok=True)
    for fn in os.listdir(d):
        if fn.endswith('.webp') or fn == 'manifest.json':
            os.remove(os.path.join(d, fn))
    manifest = {'width': W, 'height': H, 'widths': widths, 'focal': spec.get('focal', {'x': 0.5, 'y': 0.5}), 'layers': [], 'animals': [], 'water': [], 'points': spec.get('points', {})}
    preview = args.preview
    if preview:
        os.makedirs(preview, exist_ok=True)

    # animals → parts
    inpaint_mask = np.zeros((H, W), np.float32)
    inpaint_jobs = []  # (mask, method) per animal, so a big fill can use the slow synthesis
    exported = []
    animals = spec.get('animals', [])
    alphas = []
    for a in animals:
        t = time.time()
        alphas.append(animal_alpha(plate, a, s))
        print(f'  {a["id"]}: mask in {time.time() - t:.1f} s')
    alphas = resolve_overlaps(alphas, animals, s, H, W)
    for a, alpha in zip(animals, alphas):
        t = time.time()
        parts = split_parts(alpha, a, s, H, W)
        entry = {'id': a['id'], 'species': a.get('species'), 'kind': a.get('kind', a['id']), 'box': frac_box([round(v * s) for v in a['box']], W, H), 'hotspot': [a['hotspot'][0] * s / W, a['hotspot'][1] * s / H] if 'hotspot' in a else None, 'parts': []}
        if a.get('static'):
            entry['static'] = True
        if a.get('layer'):
            entry['layer'] = a['layer']
        if a.get('anim'):
            entry['anim'] = a['anim']
            for k in ('period', 'amp', 'delay'):
                if k in a:
                    entry[k] = a[k]
        amask = np.zeros((H, W), np.float32)
        for p, pa in parts:
            inpaint_mask = np.maximum(inpaint_mask, pa)
            amask = np.maximum(amask, pa)
            exported.append((a['id'] + '-' + p['name'], pa, p, entry))
        inpaint_jobs.append((amask, a.get('inpaint', spec.get('inpaint', 'fsr')), a.get('inpaintSource')))
        for name, pa, p, _ in exported[-len(parts):]:
            r = export_layer(d, name, plate, pa, widths, W)
            if r is None:
                print(f'  {name}: empty, skipped')
                continue
            box, lw = r
            bx0, by0, bx1, by1 = box
            pv = p.get('pivot')
            part = {'name': p['name'], 'anim': p.get('anim', 'none'), 'box': frac_box(box, W, H), 'widths': lw, 'z': p.get('z', 1)}
            if pv:
                part['pivot'] = [(pv[0] * s - bx0) / max(1, bx1 - bx0), (pv[1] * s - by0) / max(1, by1 - by0)]
            ax = p.get('axis') or (p.get('half') or {}).get('axis') or (p.get('band') or {}).get('axis')
            if ax:
                dx, dy = ax[1][0] - ax[0][0], ax[1][1] - ax[0][1]
                n = max(1e-6, (dx * dx + dy * dy) ** 0.5)
                part['axis'] = [round(dx / n, 4), round(dy / n, 4)]
            for k in ('amp', 'period', 'delay', 'phase'):
                if k in p:
                    part[k] = p[k]
            entry['parts'].append(part)
        manifest['animals'].append(entry)
        print(f'  {a["id"]}: {len(entry["parts"])} parts in {time.time() - t:.1f} s')
        if preview:
            x0, y0, x1, y1 = [round(v * s) for v in a['box']]
            pad = 20
            x0, y0, x1, y1 = max(0, x0 - pad), max(0, y0 - pad), min(W, x1 + pad), min(H, y1 + pad)
            crop = plate[y0:y1, x0:x1]
            comp = np.full_like(crop, (200, 0, 200))
            coded = crop.copy()
            colours = [(0, 0, 255), (0, 200, 0), (255, 120, 0), (0, 220, 255), (255, 0, 200)]
            for i, (name, pa, p, _) in enumerate(exported[-len(parts):]):
                af = pa[y0:y1, x0:x1][..., None]
                comp = (crop * af + comp * (1 - af)).astype(np.uint8)
                col = np.array(colours[i % len(colours)], np.float32)
                coded = (coded * (1 - 0.55 * af) + col * 0.55 * af).astype(np.uint8)
                pv = p.get('pivot')
                if pv:
                    cv2.circle(coded, (round(pv[0] * s) - x0, round(pv[1] * s) - y0), 5, (255, 255, 255), -1)
                    cv2.circle(coded, (round(pv[0] * s) - x0, round(pv[1] * s) - y0), 5, (0, 0, 0), 1)
            sheets = [crop, comp, coded]
            cv2.imwrite(os.path.join(preview, f'{pid}-{a["id"]}.png'), np.hstack(sheets))

    # water
    water_layers = []
    for wsp in spec.get('water', []):
        wa = water_alpha(plate, wsp, s)
        r = export_layer(d, 'water-' + wsp['name'], plate, wa, widths, W, quality=80)
        if r is None:
            continue
        box, lw = r
        water_layers.append({'name': wsp['name'], 'box': frac_box(box, W, H), 'widths': lw, 'flow': wsp.get('flow', {'dx': 0, 'dy': 1, 'period': 1.8, 'amp': 0.05}), 'mode': wsp.get('mode', 'flow')})
    manifest['water'] = water_layers

    # base, inpainted under the moving parts
    base = plate
    if inpaint_mask.max() > 0:
        t = time.time()
        base = plate.copy()
        for amask, method, source in inpaint_jobs:
            if amask.max() > 0:
                base = inpaint(base, amask, method, source, s)
        print(f'  inpainted base in {time.time() - t:.1f} s')
        if preview:
            for a in spec.get('animals', []):
                x0, y0, x1, y1 = [round(v * s) for v in a['box']]
                pad = 20
                x0, y0, x1, y1 = max(0, x0 - pad), max(0, y0 - pad), min(W, x1 + pad), min(H, y1 + pad)
                sheet = cv2.imread(os.path.join(preview, f'{pid}-{a["id"]}.png'))
                cv2.imwrite(os.path.join(preview, f'{pid}-{a["id"]}.png'), np.hstack([sheet, base[y0:y1, x0:x1]]))

    # near-frame layers
    fr = spec.get('frame')
    if fr:
        mask = near_mask(base, fr['polys'], s, blur=fr.get('blur', 3), lo=fr.get('lo', 0.12), span=fr.get('span', 0.5))
        xs = np.linspace(0, 1, W, dtype=np.float32)
        x0, x1 = fr['split']
        right_w = np.clip((xs - x0) / max(1e-6, (x1 - x0)), 0, 1)
        for lname, wgt in (('near-left', 1 - right_w), ('near-right', right_w)):
            r = export_layer(d, lname, base, np.clip(mask * wgt[None, :], 0, 1), widths, W)
            if r:
                manifest['layers'].append({'name': lname, 'box': frac_box(r[0], W, H), 'widths': r[1]})

    for width in widths:
        save_webp(os.path.join(d, f'base-{width}.webp'), resize_to_width(base, width), spec.get('baseQuality', 80))
    with open(os.path.join(d, 'manifest.json'), 'w') as f:
        json.dump(manifest, f)
    write_index()
    total = sum(os.path.getsize(os.path.join(d, fn)) for fn in os.listdir(d))
    largest = {fn: os.path.getsize(os.path.join(d, fn)) // 1024 for fn in os.listdir(d) if fn.endswith(f'-{widths[0]}.webp')}
    print(f'{pid}: {len(manifest["animals"])} animals, {sum(len(a["parts"]) for a in manifest["animals"])} parts, {len(water_layers)} water, {len(manifest["layers"])} frame layers; {total // 1024} KB total; largest width: {largest}')


if __name__ == '__main__':
    main()
