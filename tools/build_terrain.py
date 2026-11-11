#!/usr/bin/env python3
"""Builds the measured terrain of the map from the tiles fetched by tools/fetch_geo.py.

    python3 -I tools/build_terrain.py            # needs numpy and Pillow

Everything is resampled into the scene frame of src/map/relief.js (a local planar frame, 1 unit = 1 km, x east,
z south) over one square: centre (-5, 14) km, half-size 256 km. Outputs, all committed:

  public/geo/dem.png             1024 px, 8-bit grey: elevation, square-root encoded (h = (v/255)^2 * 3900 m);
                                 0 = sea level or below. The app and tools/build_geo.mjs sample this one grid, so a
                                 marker and the mesh under it agree.
  public/geo/normal-2048.webp    object-space normals of the 250 m relief with the vertical exaggeration baked in
  public/geo/normal-1024.webp    (x east, y up, z south), so the light of the day/night control models the slopes.
  public/geo/sat-4096.webp       Sentinel-2 cloudless 2016 (EOX, CC BY 4.0), alpha = land.
  public/geo/sat-2048.webp
  public/geo/relief-2048.webp    hypsometric tints from the same elevation ("terrain" style), alpha = land.
  public/geo/relief-1024.webp
  public/geo/bathy.png           512 px, 8-bit grey: sea depth, square-root encoded (d = (v/255)^2 * 4000 m).
  public/geo/night-1024.webp     the lights of the night view: NASA Black Marble (VIIRS), public domain.
  public/geo/terrain.json        the square, the encodings, the measured summits, the sources.
  tools/cache/coco-dem.json      Isla del Coco's own small grid (it lies outside the square), for build_geo.mjs.
"""
import json
import math
import os
import re
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.path.join(ROOT, 'tools', 'cache')
OUT = os.path.join(ROOT, 'public', 'geo')

relief_js = open(os.path.join(ROOT, 'src', 'map', 'relief.js'), encoding='utf-8').read()


def const(name):
    return float(re.search(r'export const ' + name + r' = (-?[0-9.]+)', relief_js).group(1))


LON0, LAT0 = const('LON0'), const('LAT0')
EXAG = const('VERTICAL_EXAGGERATION')
KM_LAT = 110.57
KM_LON = 111.32 * math.cos(math.radians(LAT0))
CX, CZ, HALF = -5.0, 14.0, 256.0
HMAX, DMAX = 3900.0, 4000.0


def merc_px(lon, lat, z):
    """Web-Mercator pixel coordinates (global, 256 px tiles) of lon/lat arrays."""
    n = 256.0 * 2 ** z
    x = (lon + 180.0) / 360.0 * n
    y = (1.0 - np.arcsinh(np.tan(np.radians(lat))) / math.pi) / 2.0 * n
    return x, y


def load_mosaic(name, z, mode):
    meta = json.load(open(os.path.join(CACHE, name, f'z{z}.json')))
    x0, y0, x1, y1, ext = meta['x0'], meta['y0'], meta['x1'], meta['y1'], meta['ext']
    w, h = (x1 - x0 + 1) * 256, (y1 - y0 + 1) * 256
    mosaic = Image.new(mode, (w, h))
    for x in range(x0, x1 + 1):
        for y in range(y0, y1 + 1):
            tile = Image.open(os.path.join(CACHE, name, str(z), f'{x}_{y}.{ext}')).convert(mode)
            mosaic.paste(tile, ((x - x0) * 256, (y - y0) * 256))
    return mosaic, x0 * 256, y0 * 256


def scene_grid(size, cx=CX, cz=CZ, half=HALF):
    """lon/lat of the pixel centres of a size×size raster over the square (row 0 = north)."""
    step = 2 * half / size
    xs = cx - half + (np.arange(size) + 0.5) * step
    zs = cz - half + (np.arange(size) + 0.5) * step
    X, Z = np.meshgrid(xs, zs)
    return X / KM_LON + LON0, -Z / KM_LAT + LAT0


def bilinear(arr, px, py):
    """Bilinear sample of arr[h, w(, c)] at float pixel coordinates (pixel centres at +0.5)."""
    h, w = arr.shape[:2]
    fx = np.clip(px - 0.5, 0, w - 1.001)
    fy = np.clip(py - 0.5, 0, h - 1.001)
    x0 = np.floor(fx).astype(np.int32)
    y0 = np.floor(fy).astype(np.int32)
    tx = (fx - x0).astype(np.float32)
    ty = (fy - y0).astype(np.float32)
    if arr.ndim == 3:
        tx, ty = tx[..., None], ty[..., None]
    a = arr[y0, x0].astype(np.float32)
    b = arr[y0, x0 + 1].astype(np.float32)
    c = arr[y0 + 1, x0].astype(np.float32)
    d = arr[y0 + 1, x0 + 1].astype(np.float32)
    return (a * (1 - tx) + b * tx) * (1 - ty) + (c * (1 - tx) + d * tx) * ty


def pool(a, k):
    """Mean of k×k blocks."""
    h, w = a.shape[:2]
    return a.reshape(h // k, k, w // k, k, *a.shape[2:]).mean(axis=(1, 3))


def terrarium(mosaic):
    rgb = np.asarray(mosaic, dtype=np.float32)
    return rgb[..., 0] * 256.0 + rgb[..., 1] + rgb[..., 2] / 256.0 - 32768.0


def save_webp(arr, name, quality, **kw):
    Image.fromarray(arr).save(os.path.join(OUT, name), 'WEBP', quality=quality, method=6, **kw)
    print(f'  {name}: {os.path.getsize(os.path.join(OUT, name)) / 1024:.0f} KB')


def main():
    os.makedirs(OUT, exist_ok=True)

    # ---- elevation ------------------------------------------------------------------------------------------
    print('elevation…')
    mosaic, ox, oy = load_mosaic('dem', 10, 'RGB')
    elev_src = terrarium(mosaic)
    del mosaic
    lon, lat = scene_grid(4096)
    px, py = merc_px(lon, lat, 10)
    elev4k = bilinear(elev_src, px - ox, py - oy)          # 125 m, oversampled from ~150 m
    elev2k = pool(elev4k, 2)                               # 250 m: the normals and the tints
    elev1k = pool(elev4k, 4)                               # 500 m: the height grid
    land1k = np.clip(elev1k, 0, HMAX)
    dem8 = np.round(255.0 * np.sqrt(land1k / HMAX)).astype(np.uint8)
    Image.fromarray(dem8, 'L').save(os.path.join(OUT, 'dem.png'), optimize=True)
    print(f'  dem.png: {os.path.getsize(os.path.join(OUT, "dem.png")) / 1024:.0f} KB, max {elev1k.max():.0f} m (500 m cells), {elev_src.max():.0f} m in the source')

    # the measured summits the tests and the docs quote: the highest source cell within 1.2 km of each
    summits = {}
    for name, (slon, slat) in {'chirripo': (-83.4886, 9.4842), 'irazu': (-83.852, 9.979), 'arenal': (-84.7033, 10.4626), 'poas': (-84.233, 10.2), 'turrialba': (-83.767, 10.025), 'rincon-de-la-vieja': (-85.324, 10.83)}.items():
        sx, sy = merc_px(np.array([slon]), np.array([slat]), 10)
        cx, cy = int(sx[0] - ox), int(sy[0] - oy)
        summits[name] = round(float(elev_src[cy - 8:cy + 9, cx - 8:cx + 9].max()))
    print('  summits (m):', summits)

    # ---- normals (object space, exaggeration baked in) ------------------------------------------------------
    print('normals…')
    step_km = 2 * HALF / 2048
    hk = np.clip(elev2k, 0, None) / 1000.0 * EXAG
    dzdx = (np.roll(hk, -1, axis=1) - np.roll(hk, 1, axis=1)) / (2 * step_km)
    dzdz = (np.roll(hk, -1, axis=0) - np.roll(hk, 1, axis=0)) / (2 * step_km)
    nx, ny, nz = -dzdx, np.ones_like(hk), -dzdz
    inv = 1.0 / np.sqrt(nx * nx + ny * ny + nz * nz)
    normal = np.stack([nx * inv, ny * inv, nz * inv], axis=-1)
    n8 = np.clip(np.round((normal * 0.5 + 0.5) * 255.0), 0, 255).astype(np.uint8)
    save_webp(n8, 'normal-2048.webp', 90)
    save_webp(np.asarray(Image.fromarray(n8).resize((1024, 1024), Image.LANCZOS)), 'normal-1024.webp', 88)
    slope = 1.0 - normal[..., 1]                           # 0 flat … 1 vertical (of the exaggerated relief)

    # ---- land mask -------------------------------------------------------------------------------------------
    # Land is where the elevation model is above the sea. Along Costa Rica's own coast the province polygons are
    # the authority (they are what the mesh is cut from): a cell outside them but within 2.5 km of them and of the
    # sea is sea, so no sliver of the flat context shows beyond the raised coastline.
    print('land mask…')
    land = elev2k > 0.5
    gb = json.load(open(os.path.join(CACHE, 'geoBoundaries-CRI-ADM1.geojson')))
    cr = Image.new('L', (2048, 2048), 0)
    draw = ImageDraw.Draw(cr)
    scale = 2048 / (2 * HALF)
    for f in gb['features']:
        g = f['geometry']
        for poly in (g['coordinates'] if g['type'] == 'MultiPolygon' else [g['coordinates']]):
            for i, ring in enumerate(poly):
                pts = [(((lo - LON0) * KM_LON - (CX - HALF)) * scale, (-(la - LAT0) * KM_LAT - (CZ - HALF)) * scale) for lo, la in ring]
                if len(pts) >= 3:
                    draw.polygon(pts, fill=255 if i == 0 else 0)
    cr_mask = np.asarray(cr) > 127
    near_cr = np.asarray(cr.filter(ImageFilter.MaxFilter(21))) > 127
    sea = Image.fromarray((~land).astype(np.uint8) * 255, 'L')
    near_sea = np.asarray(sea.filter(ImageFilter.MaxFilter(21))) > 127
    land = (land | cr_mask) & ~(near_cr & ~cr_mask & near_sea)
    alpha2k = np.asarray(Image.fromarray(land.astype(np.uint8) * 255, 'L').filter(ImageFilter.GaussianBlur(0.8)))
    alpha4k = np.asarray(Image.fromarray(alpha2k, 'L').resize((4096, 4096), Image.BILINEAR))

    # ---- hypsometric tints ("terrain" style) ------------------------------------------------------------------
    print('tints…')
    stops = np.array([0, 40, 250, 700, 1300, 2000, 2700, 3300, 3900], dtype=np.float32)
    cols = np.array([[112, 152, 96], [124, 163, 99], [150, 178, 104], [191, 196, 124], [205, 184, 124], [181, 150, 108], [158, 132, 108], [176, 166, 154], [226, 224, 218]], dtype=np.float32)
    e = np.clip(elev2k, 0, HMAX)
    tint = np.stack([np.interp(e, stops, cols[:, c]) for c in range(3)], axis=-1)
    rock = np.array([138, 124, 108], dtype=np.float32)
    k = np.clip((slope - 0.12) / 0.5, 0, 1)[..., None] * 0.55   # steep ground reads as rock
    tint = tint * (1 - k) + rock * k
    rgba = np.dstack([np.clip(tint, 0, 255).astype(np.uint8), alpha2k])
    save_webp(rgba, 'relief-2048.webp', 82)
    save_webp(np.asarray(Image.fromarray(rgba).resize((1024, 1024), Image.LANCZOS)), 'relief-1024.webp', 80)

    # ---- bathymetry -------------------------------------------------------------------------------------------
    depth = np.clip(-pool(elev4k, 8), 0, DMAX)
    b8 = np.round(255.0 * np.sqrt(depth / DMAX)).astype(np.uint8)
    b8 = np.asarray(Image.fromarray(b8, 'L').filter(ImageFilter.GaussianBlur(1.2)))
    Image.fromarray(b8, 'L').save(os.path.join(OUT, 'bathy.png'), optimize=True)
    print(f'  bathy.png: {os.path.getsize(os.path.join(OUT, "bathy.png")) / 1024:.0f} KB, deepest {depth.max():.0f} m')
    del elev4k

    # ---- satellite --------------------------------------------------------------------------------------------
    print('satellite…')
    m10, ox10, oy10 = load_mosaic('sat', 10, 'RGB')
    a10 = np.asarray(m10)
    px, py = merc_px(lon, lat, 10)
    sat = bilinear(a10, px - ox10, py - oy10)
    del a10, m10
    m11, ox11, oy11 = load_mosaic('sat', 11, 'RGB')
    a11 = np.asarray(m11.filter(ImageFilter.GaussianBlur(0.55)))   # ~75 m source → 125 m cells
    px, py = merc_px(lon, lat, 11)
    qx, qy = px - ox11, py - oy11
    inside = (qx > 2) & (qx < a11.shape[1] - 2) & (qy > 2) & (qy < a11.shape[0] - 2)
    # feather the edge of the deeper mosaic so the change of sharpness is not a line
    edge = np.minimum.reduce([qx - 2, a11.shape[1] - 2 - qx, qy - 2, a11.shape[0] - 2 - qy])
    w11 = (np.clip(edge / 48.0, 0, 1) * inside)[..., None].astype(np.float32)
    sat = sat * (1 - w11) + bilinear(a11, qx, qy) * w11
    del a11, m11
    # a light grade: the mosaic is hazy and dark for a lit 3D surface (the scene's own light shades it again)
    s = sat / 255.0
    s = np.power(s, 0.86)
    lum = (s * np.array([0.299, 0.587, 0.114], dtype=np.float32)).sum(axis=-1, keepdims=True)
    s = lum + (s - lum) * 1.22
    s = (s - 0.5) * 1.06 + 0.52
    sat8 = np.clip(np.round(s * 255.0), 0, 255).astype(np.uint8)
    rgba = np.dstack([sat8, alpha4k])
    save_webp(rgba, 'sat-4096.webp', 80)
    save_webp(np.asarray(Image.fromarray(rgba).resize((2048, 2048), Image.LANCZOS)), 'sat-2048.webp', 80)

    # ---- night lights -----------------------------------------------------------------------------------------
    if os.path.exists(os.path.join(CACHE, 'night.png')):
        print('night lights…')
        nb = json.load(open(os.path.join(CACHE, 'night.json')))
        night = np.asarray(Image.open(os.path.join(CACHE, 'night.png')).convert('RGB'))
        lon1k, lat1k = scene_grid(1024)
        qx = (lon1k - nb['west']) / (nb['east'] - nb['west']) * nb['size']
        qy = (nb['north'] - lat1k) / (nb['north'] - nb['south']) * nb['size']
        lights = bilinear(night, qx, qy) / 255.0
        # keep the lights, drop the dark-blue ground the mosaic paints under them
        lum = lights.max(axis=-1, keepdims=True)
        gain = np.clip((lum - 0.13) / 0.5, 0, 1) ** 0.8
        lights = np.clip(lights * gain * 1.5, 0, 1)
        save_webp(np.round(lights * 255).astype(np.uint8), 'night-1024.webp', 84)

    # ---- Isla del Coco ----------------------------------------------------------------------------------------
    print('isla del coco…')
    mc, oxc, oyc = load_mosaic('dem-coco', 12, 'RGB')
    ec = terrarium(mc)
    w, s_, e_, n = -87.13, 5.49, -87.01, 5.57
    cols_, rows_ = 96, 64
    lons = w + (np.arange(cols_) + 0.5) * (e_ - w) / cols_
    lats = n - (np.arange(rows_) + 0.5) * (n - s_) / rows_
    LO, LA = np.meshgrid(lons, lats)
    px, py = merc_px(LO, LA, 12)
    chip = np.clip(bilinear(ec, px - oxc, py - oyc), 0, None)
    json.dump({'west': w, 'south': s_, 'east': e_, 'north': n, 'cols': cols_, 'rows': rows_, 'metres': [int(round(v)) for v in chip.flatten()]}, open(os.path.join(CACHE, 'coco-dem.json'), 'w'))
    print(f'  highest cell {chip.max():.0f} m (Cerro Iglesias: 575.5 m)')

    meta = {
        'extent': {'cx': CX, 'cz': CZ, 'half': HALF},
        'dem': {'file': 'dem.png', 'size': 1024, 'encoding': 'sqrt8', 'maxMetres': HMAX, 'cellKm': 2 * HALF / 1024},
        'bathy': {'file': 'bathy.png', 'size': 512, 'encoding': 'sqrt8', 'maxMetres': DMAX},
        'verticalExaggeration': EXAG,
        'summitsMetres': summits,
        'sources': {
            'elevation': 'Terrain Tiles on AWS, zoom 10 (Mapzen terrarium; SRTM, GMTED2010, ETOPO1 and others)',
            'imagery': 'Sentinel-2 cloudless 2016 by EOX IT Services GmbH (contains modified Copernicus Sentinel data 2016 & 2017), CC BY 4.0',
            'nightLights': 'NASA Earth Observatory / NASA GIBS: Black Marble (Suomi NPP VIIRS), public domain',
        },
    }
    json.dump(meta, open(os.path.join(OUT, 'terrain.json'), 'w'), indent=1)
    print('done')


if __name__ == '__main__':
    sys.exit(main())
