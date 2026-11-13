"""Generates one shot of the home page's film with the Higgsfield CLI, downloads it and makes a contact sheet.

    python3 -I tools/film_gen.py <take-name> <model> [--param value ...]

The CLI must be installed and signed in (`npm i -g @higgsfield/cli`, `higgsfield auth login`). Every take is kept:
tools/cache/film/takes/<take-name>.mp4, its job record beside it as .json (model, parameters, prompt, job id), and
a 6-frame contact sheet as .jpg. tools/cache is not in the repository; the takes chosen for the site are listed in
tools/film_shots.json and cut into clips by tools/film_build.py.
"""
import json
import os
import re
import subprocess
import sys
import urllib.request

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'cache', 'film', 'takes')


def find_urls(node, found):
    if isinstance(node, dict):
        for v in node.values():
            find_urls(v, found)
    elif isinstance(node, list):
        for v in node:
            find_urls(v, found)
    elif isinstance(node, str) and re.match(r'^https?://\S+\.(mp4|mov|webm|png|jpe?g|webp)(\?\S*)?$', node, re.I):
        if node not in found:
            found.append(node)


def main():
    name, model, rest = sys.argv[1], sys.argv[2], sys.argv[3:]
    os.makedirs(OUT, exist_ok=True)
    base = os.path.join(OUT, name)
    cmd = ['higgsfield', 'generate', 'create', model, *rest, '--wait', '--wait-timeout', '40m', '--wait-interval', '10s', '--json']
    run = subprocess.run(cmd, capture_output=True, text=True)
    record = {'take': name, 'model': model, 'args': rest, 'exit': run.returncode, 'stderr': run.stderr[-2000:]}
    text = run.stdout.strip()
    try:
        record['result'] = json.loads(text)
    except ValueError:
        # --wait may print more than one JSON document: keep the last that parses
        docs = []
        dec = json.JSONDecoder()
        i = 0
        while i < len(text):
            try:
                doc, end = dec.raw_decode(text, i)
                docs.append(doc)
                i = end
            except ValueError:
                i += 1
        record['result'] = docs[-1] if docs else None
        record['stdout'] = text[-3000:]
    urls = []
    find_urls(record.get('result'), urls)
    media = [u for u in urls if re.search(r'\.(mp4|mov|webm)(\?|$)', u, re.I)] or urls
    record['urls'] = urls
    with open(base + '.json', 'w') as f:
        json.dump(record, f, indent=1)
    if not media:
        print(name, 'FAILED: no media url; see', base + '.json')
        print((run.stderr or text)[-600:])
        sys.exit(1)
    url = media[0]
    ext = re.search(r'\.(\w+)(\?|$)', url).group(1).lower()
    path = base + '.' + ext
    req = urllib.request.Request(url, headers={'User-Agent': 'media-fetch/1.0'})
    with urllib.request.urlopen(req, timeout=600) as r, open(path, 'wb') as f:
        f.write(r.read())
    if ext in ('mp4', 'mov', 'webm'):
        dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path], capture_output=True, text=True).stdout.strip() or 0)
        size = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height,r_frame_rate', '-of', 'csv=p=0', path], capture_output=True, text=True).stdout.strip()
        subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', path, '-vf', f'fps=6/{max(dur, 0.1):.3f},scale=640:-2,tile=3x2', '-frames:v', '1', base + '.jpg'])
        print(name, 'ok', size, f'{dur:.2f}s', f'{os.path.getsize(path) / 1e6:.1f} MB')
    else:
        print(name, 'ok', path)


if __name__ == '__main__':
    main()
