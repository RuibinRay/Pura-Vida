#!/usr/bin/env python3
"""The wildlife trail's backdrops (tools/zoo/envs.json): each environment image upscaled ×2 with FSRCNN (as the
plates are) and written as a WebP ladder under public/zoo/env/<key>-<w>.webp, with src/journey/envs.generated.json
(size and widths per key).   python3 tools/zoo_envs.py [--only key,key]
"""
import sys, os, json, argparse, hashlib
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, '/home/claude/pyextra')
import cv2
from plates import ROOT, upscale2, save_webp, resize_to_width

OUT = os.path.join(ROOT, 'public', 'zoo', 'env')
SPEC = os.path.join(ROOT, 'tools', 'zoo', 'envs.json')


def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--only', default=None); args = ap.parse_args()
    spec = json.load(open(SPEC)); only = set(args.only.split(',')) if args.only else None
    os.makedirs(OUT, exist_ok=True)
    gen = os.path.join(ROOT, 'src', 'journey', 'envs.generated.json')
    manifest = json.load(open(gen)) if os.path.isfile(gen) else {}
    total = 0
    for key, rel in spec['envs'].items():
        if only and key not in only:
            continue
        path = os.path.join(ROOT, rel)
        src = cv2.imread(path)
        if src is None:
            raise SystemExit('cannot read ' + rel)
        up = upscale2(src, 'env-' + hashlib.md5(open(path, 'rb').read()).hexdigest()[:12])
        W = up.shape[1]
        widths = [w for w in spec['widths'] if w <= W]
        for fn in os.listdir(OUT):
            if fn.startswith(key + '-') and fn.endswith('.webp'):
                os.remove(os.path.join(OUT, fn))
        for w in widths:
            p = os.path.join(OUT, f'{key}-{w}.webp')
            save_webp(p, resize_to_width(up, w), 82 if w >= 2400 else 84)
            total += os.path.getsize(p)
        manifest[key] = {'w': int(W), 'h': int(up.shape[0]), 'widths': widths, 'source': os.path.basename(rel)}
        print(f'  {key}: {os.path.basename(rel)} → {W}x{up.shape[0]} {widths}')
    json.dump({k: manifest[k] for k in sorted(manifest)}, open(gen, 'w'), indent=0)
    print(f'{len(manifest)} backdrops; {total // 1024} KB written')


if __name__ == '__main__':
    main()
