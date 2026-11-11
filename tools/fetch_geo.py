#!/usr/bin/env python3
"""Downloads the open geodata the map is built from into tools/cache/ (not committed).

    python3 -I tools/fetch_geo.py            # everything that is missing
    python3 -I tools/fetch_geo.py --only dem,sat,osm,vector,night

Sources and licences (recorded in docs/ASSET_CREDITS.md):
  dem     Terrain Tiles on AWS (Mapzen "terrarium" encoding; SRTM, GMTED, ETOPO1 and others) — open data,
          attribution required. Elevation in metres = R*256 + G + B/256 - 32768. Zoom 10 (~150 m at 10° N).
  sat     Sentinel-2 cloudless 2016 by EOX IT Services GmbH (contains modified Copernicus Sentinel data 2016/2017),
          CC BY 4.0. Zoom 10 for the context, zoom 11 over Costa Rica.
  vector  Natural Earth 1:10m (public domain): countries, lakes, rivers, populated places.
          geoBoundaries gbOpen CRI ADM1 (OpenStreetMap-derived, ODbL 1.0): the seven provinces.
  osm     OpenStreetMap through the Overpass API (ODbL 1.0): rivers, lakes and reservoirs, protected areas.
  night   NASA Black Marble (VIIRS, Earth at Night) through NASA GIBS — public domain: the lights of the night view.

Standard library only. Everything is cached: a second run downloads nothing.
"""
import argparse
import io
import json
import math
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import zipfile
from concurrent.futures import ThreadPoolExecutor

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.path.join(ROOT, 'tools', 'cache')
UA = 'geo-build/1.0 (static educational map; cached, one-off fetch)'

# The scene frame of src/map/relief.js (keep in sync): a local planar frame, 1 unit = 1 km.
LON0, LAT0 = -84.2, 9.75
KM_LAT = 110.57
KM_LON = 111.32 * math.cos(math.radians(LAT0))
# The square the rasters cover, in scene km: centre and half-size (see tools/build_terrain.py).
EXTENT = {'cx': -5.0, 'cz': 14.0, 'half': 256.0}


def unproject(x, z):
    return x / KM_LON + LON0, -z / KM_LAT + LAT0


def extent_lonlat(pad_km=4.0):
    h = EXTENT['half'] + pad_km
    w, n = unproject(EXTENT['cx'] - h, EXTENT['cz'] - h)
    e, s = unproject(EXTENT['cx'] + h, EXTENT['cz'] + h)
    return w, s, e, n


def tile_xy(lon, lat, z):
    n = 2 ** z
    x = int((lon + 180.0) / 360.0 * n)
    y = int((1.0 - math.asinh(math.tan(math.radians(lat))) / math.pi) / 2.0 * n)
    return x, y


def get(url, tries=5, timeout=60, data=None):
    last = None
    for i in range(tries):
        try:
            req = urllib.request.Request(url, data=data, headers={'User-Agent': UA, 'Accept': '*/*'})
            with urllib.request.urlopen(req, timeout=timeout) as r:
                return r.read()
        except (urllib.error.URLError, TimeoutError, ConnectionError, OSError) as e:  # noqa: PERF203
            last = e
            time.sleep(1.5 * (i + 1))
    raise RuntimeError(f'failed: {url}: {last}')


def fetch_tiles(name, url_tpl, z, bounds, ext):
    w, s, e, n = bounds
    x0, y0 = tile_xy(w, n, z)
    x1, y1 = tile_xy(e, s, z)
    out = os.path.join(CACHE, name, str(z))
    os.makedirs(out, exist_ok=True)
    jobs = [(x, y) for x in range(x0, x1 + 1) for y in range(y0, y1 + 1)]
    todo = [(x, y) for x, y in jobs if not os.path.exists(os.path.join(out, f'{x}_{y}.{ext}'))]
    print(f'{name} z{z}: {len(jobs)} tiles ({x0}..{x1} × {y0}..{y1}), {len(todo)} to download', flush=True)

    def one(xy):
        x, y = xy
        blob = get(url_tpl.format(z=z, x=x, y=y))
        tmp = os.path.join(out, f'{x}_{y}.{ext}.part')
        with open(tmp, 'wb') as f:
            f.write(blob)
        os.replace(tmp, os.path.join(out, f'{x}_{y}.{ext}'))
        return len(blob)

    total = 0
    with ThreadPoolExecutor(max_workers=8) as pool:
        for i, size in enumerate(pool.map(one, todo)):
            total += size
            if (i + 1) % 100 == 0:
                print(f'  {i + 1}/{len(todo)}', flush=True)
    with open(os.path.join(CACHE, name, f'z{z}.json'), 'w') as f:
        json.dump({'z': z, 'x0': x0, 'y0': y0, 'x1': x1, 'y1': y1, 'ext': ext}, f)
    if todo:
        print(f'  downloaded {total / 1e6:.1f} MB', flush=True)


def fetch_dem():
    fetch_tiles('dem', 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png', 10, extent_lonlat(), 'png')
    # Isla del Coco (5.53° N, 87.07° W) lies 500 km off the mainland, outside the square: its own small mosaic.
    fetch_tiles('dem-coco', 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png', 12, (-87.14, 5.48, -87.0, 5.58), 'png')


def fetch_sat():
    url = 'https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless_3857/default/g/{z}/{y}/{x}.jpg'
    fetch_tiles('sat', url, 10, extent_lonlat(), 'jpg')
    # Costa Rica itself one zoom level deeper (~75 m), for the 4096 px texture.
    fetch_tiles('sat', url, 11, (-86.05, 7.95, -82.45, 11.3), 'jpg')


def fetch_night():
    path = os.path.join(CACHE, 'night.png')
    if os.path.exists(path):
        return
    w, s, e, n = extent_lonlat()
    url = ('https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi?SERVICE=WMS&REQUEST=GetMap&VERSION=1.1.1'
           f'&LAYERS=VIIRS_Black_Marble&SRS=EPSG:4326&BBOX={w:.5f},{s:.5f},{e:.5f},{n:.5f}&WIDTH=1536&HEIGHT=1536&FORMAT=image/png&STYLES=')
    print('night lights (NASA Black Marble)', flush=True)
    with open(path, 'wb') as f:
        f.write(get(url, timeout=180))
    with open(os.path.join(CACHE, 'night.json'), 'w') as f:
        json.dump({'west': w, 'south': s, 'east': e, 'north': n, 'size': 1536}, f)


NE = {
    'ne_10m_admin_0_countries': 'cultural',
    'ne_10m_populated_places': 'cultural',
    'ne_10m_lakes': 'physical',
    'ne_10m_rivers_lake_centerlines': 'physical',
}


def fetch_vector():
    for name, group in NE.items():
        if os.path.exists(os.path.join(CACHE, name + '.shp')) and os.path.exists(os.path.join(CACHE, name + '.dbf')):
            continue
        print('natural earth', name, flush=True)
        blob = get(f'https://naciscdn.org/naturalearth/10m/{group}/{name}.zip', timeout=180)
        with zipfile.ZipFile(io.BytesIO(blob)) as zf:
            for member in zf.namelist():
                if member.endswith(('.shp', '.dbf', '.prj', '.cpg')):
                    with open(os.path.join(CACHE, os.path.basename(member)), 'wb') as f:
                        f.write(zf.read(member))
    gb = os.path.join(CACHE, 'geoBoundaries-CRI-ADM1.geojson')
    if not os.path.exists(gb):
        print('geoBoundaries CRI ADM1', flush=True)
        meta = json.loads(get('https://www.geoboundaries.org/api/current/gbOpen/CRI/ADM1/'))
        with open(gb, 'wb') as f:
            f.write(get(meta['gjDownloadURL'], timeout=180))
        with open(os.path.join(CACHE, 'geoBoundaries-CRI-ADM1.meta.json'), 'w') as f:
            json.dump(meta, f, indent=1)


OVERPASS = [
    'https://overpass-api.de/api/interpreter',
    'https://overpass.private.coffee/api/interpreter',
    'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter',
]
AREA = 'area["ISO3166-1"="CR"][admin_level=2]->.cr;'
QUERIES = {
    # every way tagged as a river; the builder joins them by name and keeps the long ones.
    # (`out geom` on a relation carries its member ways with their coordinates; `out tags geom` would drop the members)
    'osm-rivers': f'[out:json][timeout:180];{AREA}(way["waterway"="river"](area.cr););out tags geom;',
    'osm-lakes': f'[out:json][timeout:180];{AREA}(way["natural"="water"]["water"~"^(lake|reservoir|lagoon)$"](area.cr);relation["natural"="water"]["water"~"^(lake|reservoir|lagoon)$"](area.cr););out geom;',
    'osm-protected': f'[out:json][timeout:240];{AREA}(relation["boundary"~"^(national_park|protected_area)$"](area.cr);way["boundary"~"^(national_park|protected_area)$"](area.cr););out geom;',
}


def fetch_osm():
    for name, query in QUERIES.items():
        path = os.path.join(CACHE, name + '.json')
        if os.path.exists(path):
            continue
        body = urllib.parse.urlencode({'data': query}).encode()
        done = False
        for attempt in range(4):
            for server in OVERPASS:
                try:
                    print(f'{name}: {server} (attempt {attempt + 1})', flush=True)
                    blob = get(server, tries=1, timeout=300, data=body)
                    parsed = json.loads(blob)
                    if 'elements' not in parsed:
                        raise RuntimeError('no elements')
                    with open(path, 'wb') as f:
                        f.write(blob)
                    print(f'  {len(parsed["elements"])} elements, {len(blob) / 1e6:.1f} MB', flush=True)
                    done = True
                    break
                except Exception as e:  # noqa: BLE001
                    print('  ', str(e)[:160], flush=True)
            if done:
                break
            time.sleep(20 * (attempt + 1))
        if not done:
            print(f'{name}: NOT FETCHED — the builder falls back to Natural Earth for this layer', flush=True)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--only', default='vector,dem,sat,night,osm')
    args = ap.parse_args()
    os.makedirs(CACHE, exist_ok=True)
    steps = {'vector': fetch_vector, 'dem': fetch_dem, 'sat': fetch_sat, 'night': fetch_night, 'osm': fetch_osm}
    for key in args.only.split(','):
        steps[key.strip()]()
    print('done')


if __name__ == '__main__':
    sys.exit(main())
