#!/usr/bin/env python3
"""Downloads the photographs of the five dishes from Wikimedia Commons into tools/cache/food/ (not committed) and
writes tools/food/sources.json with what each one is: title, author, licence, page. Standard library only.

    python3 -I tools/fetch_food.py

The choice of photograph per dish is in PHOTOS below; tools/food_plates.py cuts the plates out of them.
"""
import json
import os
import re
import time
import urllib.error
import urllib.parse
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.path.join(ROOT, 'tools', 'cache', 'food')
UA = 'food-photo-fetch/1.0 (static educational site; cached, one-off)'
PHOTOS = {
    'gallo-pinto': 'File:Desayuno tradicional de Costa Rica.jpg',
    'casado': 'File:Casado tipico Costa Rica.jpg',
    'tamal': 'File:Tamaldecostarica.jpg',
    'olla-de-carne': 'File:Olla de carne 2.jpg',
    # what goes into the pot, as a second picture on the food page
    'olla-de-carne-ingredients': 'File:Olla de carne 1.png',
    'rice-and-beans': 'File:Casado de rice and beans.png',
}


def api(params):
    url = 'https://commons.wikimedia.org/w/api.php?' + urllib.parse.urlencode(params)
    for k in range(5):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': UA}), timeout=60) as r:
                return json.load(r)
        except urllib.error.HTTPError as e:
            if e.code != 429:
                raise
            time.sleep(10 * (k + 1))
        except (urllib.error.URLError, TimeoutError, OSError):
            time.sleep(5 * (k + 1))
    raise RuntimeError('rate limited: ' + url)


def strip(html):
    return re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', '', html or '')).strip()


def main():
    os.makedirs(CACHE, exist_ok=True)
    out = {}
    for dish, title in PHOTOS.items():
        d = api({'action': 'query', 'titles': title, 'prop': 'imageinfo', 'iiprop': 'url|extmetadata|size|sha1', 'iiurlwidth': 2200, 'format': 'json'})
        page = next(iter(d['query']['pages'].values()))
        ii = page['imageinfo'][0]
        em = ii.get('extmetadata', {})
        ext = os.path.splitext(urllib.parse.urlparse(ii['url']).path)[1].lower()  # the URL may carry a query string
        path = os.path.join(CACHE, dish + ext)
        if not os.path.exists(path):
            # the original when it is small, a 2200 px rendering of it otherwise
            src = ii['url'] if ii['width'] <= 2400 else ii['thumburl']
            blob = None
            for k in range(6):  # the image host rate-limits anonymous clients: wait and try again
                time.sleep(3 + 20 * k)
                try:
                    with urllib.request.urlopen(urllib.request.Request(src, headers={'User-Agent': UA}), timeout=120) as r:
                        blob = r.read()
                    break
                except urllib.error.HTTPError as e:
                    if e.code != 429:
                        raise
                except (urllib.error.URLError, TimeoutError, OSError):
                    pass  # a dropped connection: the next pass tries again
            if blob is None:
                raise RuntimeError('rate limited: ' + src)
            with open(path, 'wb') as f:
                f.write(blob)
        out[dish] = {
            'file': os.path.basename(path),
            'title': title,
            'author': strip(em.get('Artist', {}).get('value')),
            'licence': strip(em.get('LicenseShortName', {}).get('value')),
            'licenceUrl': em.get('LicenseUrl', {}).get('value', ''),
            'page': ii['descriptionurl'],
            'original': {'width': ii['width'], 'height': ii['height'], 'sha1': ii.get('sha1', '')},
            'description': strip(em.get('ImageDescription', {}).get('value'))[:300],
            'retrieved': time.strftime('%Y-%m-%d'),
        }
        print(dish, '|', out[dish]['author'], '|', out[dish]['licence'], '|', os.path.getsize(path) // 1024, 'KB')
        time.sleep(2)
    os.makedirs(os.path.join(ROOT, 'tools', 'food'), exist_ok=True)
    with open(os.path.join(ROOT, 'tools', 'food', 'sources.json'), 'w', encoding='utf-8') as f:
        json.dump(out, f, indent=1, ensure_ascii=False)


if __name__ == '__main__':
    main()
