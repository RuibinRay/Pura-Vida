"""Cuts the home page's film into the clips the site scrubs through.

    python3 tools/film_build.py [shot-id ...]      (all shots when none is named)

Reads tools/film_shots.json: for each shot the chosen take (a clip in tools/cache/film/takes/, made by
tools/film_gen.py or tools/film_map.mjs) and the part of it to use. Writes

    public/film/<shot>/<set>.pvf     the shot as H.264 in a small container of our own (below), one per size set
    public/film/<shot>/poster.webp   the shot's still, shown when motion is off (and on the text tier)
    public/film/<shot>/thumb.webp    the same still at 480 px (~15 KB): what stands in while the clip is on its way
    src/film/manifest.json           frame counts and sizes, read by the player

Why a container of our own: the page decodes single frames with WebCodecs as the visitor scrolls, forwards and
backwards, so it needs every frame's bytes and where the keyframes are, and nothing else an MP4 carries. A .pvf is

    "PVF1"  u16 width  u16 height  u16 frames  u16 keyint  u16 fps×100
    u8 codecLen  codec (ASCII, e.g. "avc1.4d401f")
    u16 descLen  the avcC record (SPS and PPS) the decoder is configured with
    frames × u32  byte size of each frame, top bit set on keyframes
    the frames, each as length-prefixed NAL units (the "avc" form WebCodecs takes), back to back

(all integers big-endian). The video is Main-profile H.264 with no B-frames and a keyframe every `keyint` frames, so
any frame is at most keyint - 1 decodes from a keyframe. Needs ffmpeg with libx264 and libwebp.
"""
import json
import os
import shutil
import struct
import subprocess
import sys
import tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TAKES = os.path.join(ROOT, 'tools', 'cache', 'film', 'takes')
PUBLIC = os.path.join(ROOT, 'public', 'film')
MANIFEST = os.path.join(ROOT, 'src', 'film', 'manifest.json')


def duration(path):
    out = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path], capture_output=True, text=True).stdout
    return float(out.strip())


def nal_units(data):
    """The NAL units of an Annex B stream (start codes removed)."""
    out = []
    i = data.find(b'\x00\x00\x01')
    while i >= 0:
        start = i + 3
        j = data.find(b'\x00\x00\x01', start)
        end = len(data) if j < 0 else (j - 1 if data[j - 1] == 0 else j)
        out.append(data[start:end])
        i = j
    return out


def pack(annexb, width, height, keyint, fps):
    """An Annex B stream with an access unit delimiter before every frame → the bytes of a .pvf and its frame count."""
    sps = pps = None
    frames = []  # (is_key, bytes)
    cur = []
    key = False

    def close():
        nonlocal cur, key
        if cur:
            frames.append((key, b''.join(struct.pack('>I', len(n)) + n for n in cur)))
        cur, key = [], False

    for nal in nal_units(annexb):
        kind = nal[0] & 0x1F
        if kind == 9:  # access unit delimiter: a new frame begins
            close()
        elif kind == 7:
            sps = sps or nal
        elif kind == 8:
            pps = pps or nal
        elif kind in (1, 5):
            key = key or kind == 5
            cur.append(nal)
        # SEI and the rest are not needed to decode
    close()
    if not sps or not pps or not frames or not frames[0][0]:
        raise SystemExit('unexpected H.264 stream: no SPS/PPS, or it does not start on a keyframe')
    if sps[1] not in (66, 77):
        raise SystemExit('expected Baseline or Main profile (the avcC record written here has no High-profile fields)')
    codec = ('avc1.%02x%02x%02x' % (sps[1], sps[2], sps[3])).encode()
    desc = bytes([1, sps[1], sps[2], sps[3], 0xFF, 0xE1]) + struct.pack('>H', len(sps)) + sps + bytes([1]) + struct.pack('>H', len(pps)) + pps
    head = b'PVF1' + struct.pack('>HHHHH', width, height, len(frames), keyint, round(fps * 100))
    head += bytes([len(codec)]) + codec + struct.pack('>H', len(desc)) + desc
    table = b''.join(struct.pack('>I', len(b) | (0x80000000 if k else 0)) for k, b in frames)
    return head + table + b''.join(b for _, b in frames), len(frames)


def make_thumb(out_dir):
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', os.path.join(out_dir, 'poster.webp'), '-vf', 'scale=480:270:flags=lanczos',
                    '-c:v', 'libwebp', '-quality', '55', '-preset', 'photo', os.path.join(out_dir, 'thumb.webp')], check=True)


def main():
    if sys.argv[1:2] == ['--thumbs']:  # only the small stills, from the posters already cut
        for sid in sorted(os.listdir(PUBLIC)):
            if os.path.exists(os.path.join(PUBLIC, sid, 'poster.webp')):
                make_thumb(os.path.join(PUBLIC, sid))
        print('thumbs written')
        return
    cfg = json.load(open(os.path.join(ROOT, 'tools', 'film_shots.json')))
    sets = cfg['sets']
    keyint = int(cfg.get('keyint', 12))
    only = set(sys.argv[1:])
    manifest = json.load(open(MANIFEST)) if os.path.exists(MANIFEST) else {}
    manifest['sets'] = {name: {'w': s['w'], 'h': s['h']} for name, s in sets.items()}
    manifest['keyint'] = keyint
    shots = manifest.setdefault('shots', {})
    total = 0
    for shot in cfg['shots']:
        sid = shot['id']
        if only and sid not in only:
            continue
        src = os.path.join(TAKES, shot['take'] + '.mp4')
        if not os.path.exists(src):
            print(f'  {sid}: take {shot["take"]} is missing, skipped')
            continue
        dur = duration(src)
        start = float(shot.get('from', 0))
        end = min(float(shot.get('to', dur)), dur)
        fps = float(shot.get('fps', cfg.get('fps', 12)))
        out_dir = os.path.join(PUBLIC, sid)
        shutil.rmtree(out_dir, ignore_errors=True)
        os.makedirs(out_dir)
        chain = [f'fps={fps}']
        if cfg.get('denoise'):  # generated clips shimmer from frame to frame; a temporal denoise makes them far cheaper to encode
            chain.append(cfg['denoise'])
        if shot.get('crop'):  # "w:h:x:y" in source pixels, before scaling
            chain.append('crop=' + shot['crop'])
        if shot.get('eq'):  # an ffmpeg colour filter, to bring a take in line with its neighbours
            chain.append(shot['eq'])
        count = 0
        size = 0
        sizes = {}
        for name, s in sets.items():
            vf = ','.join(chain + [f'scale={s["w"]}:{s["h"]}:force_original_aspect_ratio=increase:flags=lanczos', f'crop={s["w"]}:{s["h"]}'])
            with tempfile.TemporaryDirectory() as tmp:
                raw = os.path.join(tmp, 'clip.h264')
                x264 = f'keyint={keyint}:min-keyint={keyint}:scenecut=0:bframes=0:aud=1:repeat-headers=1'
                subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-ss', f'{start:.3f}', '-to', f'{end:.3f}', '-i', src, '-an', '-vf', vf,
                                '-c:v', 'libx264', '-preset', 'slow', '-profile:v', 'main', '-pix_fmt', 'yuv420p', '-crf', str(shot.get('crf', s['crf'])),
                                '-x264-params', x264, '-f', 'h264', raw], check=True)
                blob, count = pack(open(raw, 'rb').read(), s['w'], s['h'], keyint, fps)
            with open(os.path.join(out_dir, name + '.pvf'), 'wb') as f:
                f.write(blob)
            sizes[name] = len(blob)
            size += len(blob)
        # the poster: the frame named by "poster" (0–1 through the shot, default the middle)
        at = start + (end - start) * float(shot.get('poster', 0.5))
        subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-ss', f'{min(at, end - 0.05):.3f}', '-i', src, '-frames:v', '1', '-vf', ','.join([c for c in chain[1:] if not c.startswith('hqdn3d')] + ['scale=1600:900:force_original_aspect_ratio=increase:flags=lanczos', 'crop=1600:900']),
                        '-c:v', 'libwebp', '-quality', '62', '-preset', 'photo', os.path.join(out_dir, 'poster.webp')], check=True)
        make_thumb(out_dir)
        shots[sid] = {'frames': count, 'fps': fps, 'bytes': sizes}
        total += size
        print(f'  {sid}: {count} frames from {shot["take"]} [{start:.2f}–{end:.2f} s], ' + ', '.join(f'{n} {b / 1e6:.1f} MB' for n, b in sizes.items()), flush=True)
    # drop shots that are no longer in the list
    ids = {s['id'] for s in cfg['shots']}
    for sid in [k for k in shots if k not in ids]:
        del shots[sid]
        shutil.rmtree(os.path.join(PUBLIC, sid), ignore_errors=True)
    manifest['shots'] = {s['id']: shots[s['id']] for s in cfg['shots'] if s['id'] in shots}
    os.makedirs(os.path.dirname(MANIFEST), exist_ok=True)
    with open(MANIFEST, 'w') as f:
        json.dump(manifest, f, indent=1)
        f.write('\n')
    for name in sets:
        print(f'  {name}: {sum(v.get("bytes", {}).get(name, 0) for v in manifest["shots"].values()) / 1e6:.1f} MB for the whole film')
    print(f'written {os.path.relpath(MANIFEST, ROOT)}')


if __name__ == '__main__':
    main()
