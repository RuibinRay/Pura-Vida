"""Downloads the photographs the film's culture shots start from (Wikimedia Commons) and records author and licence.

    python3 tools/film_photos.py            → tools/cache/film/photos/<key>.jpg, 16:9 start frames in
                                              tools/cache/film/stills/<key>.png, and src/film/photoSources.json

Each photograph is the first frame of a generated clip: the clip is an AI animation of that photograph, so the
photographer is credited and the licence carried in docs/ASSET_CREDITS.md and on the page.
"""
import json
import os
import re
import subprocess
import time
import urllib.parse
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'tools', 'cache', 'film', 'photos')
STILLS = os.path.join(ROOT, 'tools', 'cache', 'film', 'stills')
RECORD = os.path.join(ROOT, 'src', 'film', 'photoSources.json')
API = 'https://commons.wikimedia.org/w/api.php'
UA = 'site-photo-research/1.0 (static educational site)'

# key → Commons file title, and how the 16:9 start frame is cut from it ("x:y" = centre of the crop, 0–1)
PHOTOS = {
    'theatre-front': {'file': 'Teatro Nacional CRI 07 2019 8963.jpg', 'centre': (0.5, 0.5)},
    'theatre-foyer': {'file': 'Costa Rica - San José 20.jpg', 'centre': (0.5, 0.5)},
    'ruins-a': {'file': 'Old-ruins-in-cartago-daniel-vargas19.jpg', 'centre': (0.5, 0.5)},
    'ruins-b': {'file': 'Old Ruins in Cartago, Costa Rica by Daniel Vargas - 25.jpg', 'centre': (0.5, 0.5)},
    'spheres-yard': {'file': 'Diquis Stone Spheres Museo Nacional CRI 01 2020 4174.jpg', 'centre': (0.5, 0.5)},
    'spheres-yard-b': {'file': 'Diquis Stone Spheres Museo Nacional CRI 01 2020 4204.jpg', 'centre': (0.5, 0.5)},
    'spheres-hall': {'file': 'Diquis Stone Spheres Museo Nacional CRI 01 2020 1880.jpg', 'centre': (0.5, 0.5)},
    'gold-hall': {'file': 'Sala Museo del Oro BCCR CRI 07 2019 9256.jpg', 'centre': (0.5, 0.5)},
    'usure': {'file': 'Úsure.jpg', 'centre': (0.5, 0.5)},
    'diablitos': {'file': 'Keeper of the Wind.jpg', 'centre': (0.5, 0.5)},
}


def call(params):
    url = API + '?' + urllib.parse.urlencode({**params, 'format': 'json'})
    for attempt in range(5):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': UA}), timeout=40) as r:
                return json.load(r)
        except Exception:  # noqa: BLE001
            time.sleep(3 + attempt * 4)
    raise SystemExit('Commons did not answer for ' + url)


def strip(html):
    return re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', '', html or '')).strip()


def main():
    os.makedirs(OUT, exist_ok=True)
    os.makedirs(STILLS, exist_ok=True)
    record = {}
    for key, spec in PHOTOS.items():
        d = call({'action': 'query', 'titles': 'File:' + spec['file'], 'prop': 'imageinfo', 'iiprop': 'url|size|extmetadata', 'iiurlwidth': 1920})
        page = next(iter(d['query']['pages'].values()))
        if 'imageinfo' not in page:
            print('  missing on Commons:', spec['file'])
            continue
        ii = page['imageinfo'][0]
        em = ii.get('extmetadata', {})
        path = os.path.join(OUT, key + '.jpg')
        if not os.path.exists(path):
            for attempt in range(5):
                try:
                    with urllib.request.urlopen(urllib.request.Request(urllib.parse.quote(ii.get('thumburl') or ii['url'], safe=':/%?=&'), headers={'User-Agent': UA}), timeout=120) as r, open(path, 'wb') as f:
                        f.write(r.read())
                    break
                except Exception:  # noqa: BLE001
                    time.sleep(4 + attempt * 5)
            time.sleep(1.5)
        cx, cy = spec['centre']
        # the largest 16:9 window of the photograph around the centre, scaled to 1920×1080
        vf = (f"crop='min(iw,ih*16/9)':'min(ih,iw*9/16)':'(iw-min(iw,ih*16/9))*{cx}':'(ih-min(ih,iw*9/16))*{cy}',scale=1920:1080:flags=lanczos")
        cut = subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', path, '-vf', vf, '-frames:v', '1', '-update', '1', os.path.join(STILLS, key + '.png')])
        if cut.returncode:  # a download that Commons cut short: drop it so the next run fetches it again
            if os.path.exists(path):
                os.remove(path)
            print('  could not read', key, '- removed, run again')
            continue
        record[key] = {
            'file': spec['file'],
            'page': ii.get('descriptionurl'),
            'author': strip((em.get('Artist') or {}).get('value')),
            'licence': strip((em.get('LicenseShortName') or {}).get('value')),
            'licenceUrl': (em.get('LicenseUrl') or {}).get('value'),
            'description': strip((em.get('ImageDescription') or {}).get('value'))[:300],
            'size': [ii.get('width'), ii.get('height')],
        }
        print(' ', key, '|', record[key]['author'], '|', record[key]['licence'])
    with open(RECORD, 'w') as f:
        json.dump(record, f, indent=1, ensure_ascii=False)
        f.write('\n')


if __name__ == '__main__':
    main()
