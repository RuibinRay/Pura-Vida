// Builds the map's vector data. Run after tools/fetch_geo.py and tools/build_terrain.py:
//   node tools/build_geo.mjs
//
// Sources (cached in tools/cache/, see docs/ASSET_CREDITS.md):
//   provinces   geoBoundaries gbOpen CRI ADM1 — OpenStreetMap-derived (ODbL 1.0): the official seven provinces
//   heights     public/geo/dem.png — the measured elevation grid (tools/build_terrain.py)
//   context     Natural Earth 1:10m (public domain): Nicaragua, Panama, their lakes, populated places
//   water       OpenStreetMap through Overpass (ODbL 1.0): rivers, lakes and reservoirs
//   protected   OpenStreetMap through Overpass (ODbL 1.0): SINAC's protected areas
//
// Outputs (committed):
//   public/geo/costa-rica.topo.json  — provinces, neighbours, neighbour lakes (TopoJSON, quantised 1e5)
//   public/geo/mesh.json             — per-province triangulated land surface, 1.5 km interior spacing, measured heights
//   public/geo/mesh-lite.json        — the same outlines with a 3 km interior (lite tier, home map)
//   public/geo/water.json            — rivers (ranked) and lakes
//   public/geo/parks.json            — protected areas as polygons
//   public/geo/places.json           — Natural Earth populated places inside Costa Rica
//   tools/cache/geo-report.json      — areas, counts, triangle checks (for tests and the docs)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as shapefile from 'shapefile';
import * as topojsonServer from 'topojson-server';
import * as topojsonClient from 'topojson-client';
import * as topojsonSimplify from 'topojson-simplify';
import cdt2d from 'cdt2d';
import { PNG } from 'pngjs';
import { project, unproject, reliefKmAtXZ, elevationToY, installDem, EXTENT } from '../src/map/relief.js';
import { provinceLocator } from './province_at.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CACHE = path.join(ROOT, 'tools', 'cache');
const OUT = path.join(ROOT, 'public', 'geo');
fs.mkdirSync(OUT, { recursive: true });

const clean = (s) => (typeof s === 'string' ? s.replace(/\0+$/, '') : s);
const ISO_TO_SLUG = { 'CR-SJ': 'san-jose', 'CR-A': 'alajuela', 'CR-C': 'cartago', 'CR-H': 'heredia', 'CR-G': 'guanacaste', 'CR-P': 'puntarenas', 'CR-L': 'limon' };
const NAMES = {
  'san-jose': { en: 'San José', es: 'San José', zh: '圣何塞省' },
  alajuela: { en: 'Alajuela', es: 'Alajuela', zh: '阿拉胡埃拉省' },
  cartago: { en: 'Cartago', es: 'Cartago', zh: '卡塔戈省' },
  heredia: { en: 'Heredia', es: 'Heredia', zh: '埃雷迪亚省' },
  guanacaste: { en: 'Guanacaste', es: 'Guanacaste', zh: '瓜纳卡斯特省' },
  puntarenas: { en: 'Puntarenas', es: 'Puntarenas', zh: '蓬塔雷纳斯省' },
  limon: { en: 'Limón', es: 'Limón', zh: '利蒙省' },
};
const SPACING = { full: 1.5, lite: 3 };
/** Visvalingam threshold for the province outlines, in square degrees (≈ a 110 m × 110 m triangle). */
const SIMPLIFY_MIN_AREA = 5e-7;

const readJSON = (name) => JSON.parse(fs.readFileSync(path.join(CACHE, name), 'utf8'));
const hasCache = (name) => fs.existsSync(path.join(CACHE, name));

async function readShp(name, pred) {
  const src = await shapefile.open(path.join(CACHE, name + '.shp'), path.join(CACHE, name + '.dbf'), { encoding: 'utf-8' });
  const out = [];
  for (;;) {
    const r = await src.read();
    if (r.done) break;
    const f = r.value;
    for (const k in f.properties) f.properties[k] = clean(f.properties[k]);
    if (pred(f)) out.push(f);
  }
  return out;
}
function allCoords(g) { const out = []; const walk = (c) => (typeof c[0] === 'number' ? out.push(c) : c.forEach(walk)); walk(g.coordinates); return out; }
const inBox = (g, [x0, y0, x1, y1]) => allCoords(g).some(([x, y]) => x > x0 && x < x1 && y > y0 && y < y1);

// ---- 0. the measured elevation grid ---------------------------------------------------------
{
  const png = PNG.sync.read(fs.readFileSync(path.join(OUT, 'dem.png')));
  const data = new Uint8Array(png.width * png.height);
  for (let i = 0; i < data.length; i++) data[i] = png.data[i * 4];
  const meta = JSON.parse(fs.readFileSync(path.join(OUT, 'terrain.json'), 'utf8'));
  if (meta.extent.cx !== EXTENT.cx || meta.extent.cz !== EXTENT.cz || meta.extent.half !== EXTENT.half) throw new Error('terrain.json and relief.js disagree on the extent');
  installDem({ size: png.width, data, maxMetres: meta.dem.maxMetres });
}
// Isla del Coco lies outside the square: its own small grid
const cocoDem = hasCache('coco-dem.json') ? readJSON('coco-dem.json') : null;
function cocoKm(lon, lat) {
  if (!cocoDem) return 0;
  const { west, south, east, north, cols, rows, metres } = cocoDem;
  let fx = ((lon - west) / (east - west)) * cols - 0.5, fy = ((north - lat) / (north - south)) * rows - 0.5;
  fx = Math.max(0, Math.min(cols - 1.001, fx)); fy = Math.max(0, Math.min(rows - 1.001, fy));
  const ix = Math.floor(fx), iy = Math.floor(fy), tx = fx - ix, ty = fy - iy;
  const at = (x, y) => metres[y * cols + x];
  return ((at(ix, iy) * (1 - tx) + at(ix + 1, iy) * tx) * (1 - ty) + (at(ix, iy + 1) * (1 - tx) + at(ix + 1, iy + 1) * tx) * ty) / 1000;
}

// ---- 1. source features -------------------------------------------------------------------
const gb = readJSON('geoBoundaries-CRI-ADM1.geojson');
const provincesRaw = gb.features.map((f) => {
  const iso = f.properties.shapeISO;
  const id = ISO_TO_SLUG[iso];
  if (!id) throw new Error('unknown province ' + iso);
  return { type: 'Feature', id, properties: { id, iso, name: NAMES[id] }, geometry: f.geometry };
});
if (provincesRaw.length !== 7) throw new Error('expected 7 provinces, got ' + provincesRaw.length);

// simplify the outlines as one topology, so a border shared by two provinces stays one line
let provinces;
{
  let t = topojsonServer.topology({ provinces: { type: 'FeatureCollection', features: provincesRaw } }, 1e6);
  const before = t.arcs.reduce((s, a) => s + a.length, 0);
  t = topojsonSimplify.presimplify(t);
  t = topojsonSimplify.simplify(t, SIMPLIFY_MIN_AREA);
  const after = t.arcs.reduce((s, a) => s + a.length, 0);
  console.log(`province outlines: ${before} → ${after} points`);
  provinces = topojsonClient.feature(t, t.objects.provinces).features.map((f, i) => ({ ...f, id: provincesRaw[i].id, properties: provincesRaw[i].properties }));
}

const CONTEXT_BOX = [-86.8, 7.3, -81.6, 12.3];
const adm0 = await readShp('ne_10m_admin_0_countries', (f) => ['NIC', 'PAN'].includes(f.properties.ADM0_A3));
const neighbors = adm0.map((f) => {
  const polys = f.geometry.type === 'MultiPolygon' ? f.geometry.coordinates : [f.geometry.coordinates];
  const kept = polys.filter((p) => p[0].length >= 12 && inBox({ type: 'Polygon', coordinates: p }, CONTEXT_BOX));
  return { type: 'Feature', id: f.properties.ADM0_A3.toLowerCase(), properties: { id: f.properties.ADM0_A3.toLowerCase(), name: { en: f.properties.NAME_EN || f.properties.NAME, es: f.properties.NAME_ES || f.properties.NAME, zh: f.properties.NAME_ZH || f.properties.NAME } }, geometry: { type: 'MultiPolygon', coordinates: kept } };
});
// the neighbours' lakes only (Lago de Nicaragua, Lago de Managua); Costa Rica's own come from OpenStreetMap below
const lakes = (await readShp('ne_10m_lakes', (f) => inBox(f.geometry, CONTEXT_BOX) && /Nicaragua|Managua|Gat[uú]n/i.test(f.properties.name || ''))).map((f) => ({ type: 'Feature', id: f.properties.name, properties: { name: f.properties.name }, geometry: f.geometry }));
// the Río San Juan runs on the Nicaraguan side of the border, so the Costa Rican extract does not carry it
const neRivers = (await readShp('ne_10m_rivers_lake_centerlines', (f) => inBox(f.geometry, [-86.2, 7.9, -82.3, 11.5]) && /San Juan/i.test(f.properties.name || ''))).map((f) => ({ name: 'Río San Juan', geometry: f.geometry }));

// ---- 2. topology (shared borders stay shared) ---------------------------------------------
const topo = topojsonServer.topology(
  {
    provinces: { type: 'FeatureCollection', features: provinces },
    neighbors: { type: 'FeatureCollection', features: neighbors },
    lakes: { type: 'FeatureCollection', features: lakes },
    rivers: { type: 'FeatureCollection', features: [] },
  },
  1e5,
);

// ---- 3. geometry helpers (planar km frame) --------------------------------------------------
function ringToXZ(ring) {
  const pts = [];
  for (const [lon, lat] of ring) {
    const p = project(lon, lat);
    const last = pts[pts.length - 1];
    if (last && Math.abs(last[0] - p[0]) < 1e-6 && Math.abs(last[1] - p[1]) < 1e-6) continue;
    pts.push(p);
  }
  const f = pts[0], l = pts[pts.length - 1];
  if (pts.length > 1 && Math.abs(f[0] - l[0]) < 1e-6 && Math.abs(f[1] - l[1]) < 1e-6) pts.pop();
  return pts;
}
function signedArea(pts) { let a = 0; for (let i = 0, n = pts.length; i < n; i++) { const [x1, z1] = pts[i], [x2, z2] = pts[(i + 1) % n]; a += x1 * z2 - x2 * z1; } return a / 2; }
function centroid(pts) { let cx = 0, cz = 0, a = 0; for (let i = 0, n = pts.length; i < n; i++) { const [x1, z1] = pts[i], [x2, z2] = pts[(i + 1) % n]; const c = x1 * z2 - x2 * z1; cx += (x1 + x2) * c; cz += (z1 + z2) * c; a += c; } a /= 2; return [cx / (6 * a), cz / (6 * a)]; }
function pointInRing(x, z, ring) { let inside = false; for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) { const [xi, zi] = ring[i], [xj, zj] = ring[j]; if (zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) inside = !inside; } return inside; }

/** A uniform bucket grid over a ring's segments: distance-to-ring and point-in-ring without walking every edge. */
function ringIndex(ring, cell) {
  const xs = ring.map((p) => p[0]), zs = ring.map((p) => p[1]);
  const x0 = Math.min(...xs) - cell, z0 = Math.min(...zs) - cell;
  const cols = Math.ceil((Math.max(...xs) + cell - x0) / cell), rows = Math.ceil((Math.max(...zs) + cell - z0) / cell);
  const buckets = new Map();
  for (let i = 0, n = ring.length; i < n; i++) {
    const [ax, az] = ring[i], [bx, bz] = ring[(i + 1) % n];
    const c0 = Math.floor((Math.min(ax, bx) - x0) / cell), c1 = Math.floor((Math.max(ax, bx) - x0) / cell);
    const r0 = Math.floor((Math.min(az, bz) - z0) / cell), r1 = Math.floor((Math.max(az, bz) - z0) / cell);
    for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) { const k = r * cols + c; let b = buckets.get(k); if (!b) buckets.set(k, (b = [])); b.push(i); }
  }
  /** true when some segment lies within `d` (d ≤ cell) of the point */
  const near = (x, z, d) => {
    const c = Math.floor((x - x0) / cell), r = Math.floor((z - z0) / cell);
    const d2 = d * d;
    for (let rr = r - 1; rr <= r + 1; rr++) for (let cc = c - 1; cc <= c + 1; cc++) {
      const b = buckets.get(rr * cols + cc);
      if (!b) continue;
      for (const i of b) {
        const [ax, az] = ring[i], [bx, bz] = ring[(i + 1) % ring.length];
        const abx = bx - ax, abz = bz - az; const l2 = abx * abx + abz * abz;
        let t = l2 ? ((x - ax) * abx + (z - az) * abz) / l2 : 0; t = Math.max(0, Math.min(1, t));
        const dx = x - (ax + t * abx), dz = z - (az + t * abz);
        if (dx * dx + dz * dz < d2) return true;
      }
    }
    return false;
  };
  return { near };
}

function triangulate(outer, holes, spacing, extra) {
  const points = [], edges = [];
  const addRing = (ring) => { const start = points.length; for (const p of ring) points.push(p); for (let i = 0; i < ring.length; i++) edges.push([start + i, start + ((i + 1) % ring.length)]); };
  addRing(outer);
  for (const h of holes) addRing(h);
  const xs = outer.map((p) => p[0]), zs = outer.map((p) => p[1]);
  const bbox = [Math.min(...xs), Math.min(...zs), Math.max(...xs), Math.max(...zs)];
  const s = spacing;
  const index = [outer, ...holes].map((r) => ringIndex(r, Math.max(1, s)));
  const clear = (x, z, d) => !index.some((ix) => ix.near(x, z, d));
  // the named summits first, so a peak is a vertex and not the middle of a triangle
  const peaks = [];
  for (const [x, z] of extra) {
    if (x < bbox[0] || x > bbox[2] || z < bbox[1] || z > bbox[3]) continue;
    if (!pointInRing(x, z, outer) || holes.some((h) => pointInRing(x, z, h)) || !clear(x, z, 0.3)) continue;
    // the landmark list names some summits twice (a peak and a province's own entry): one vertex each
    if (peaks.some(([px, pz]) => (px - x) * (px - x) + (pz - z) * (pz - z) < 0.25)) continue;
    peaks.push([x, z]); points.push([x, z]);
  }
  let row = 0;
  for (let z = bbox[1] + s / 2; z < bbox[3]; z += s * 0.866, row++) {
    for (let x = bbox[0] + (row % 2 ? s / 2 : 0); x < bbox[2]; x += s) {
      if (!pointInRing(x, z, outer)) continue;
      if (holes.some((h) => pointInRing(x, z, h))) continue;
      if (!clear(x, z, 0.45 * s)) continue;
      if (peaks.some(([px, pz]) => (px - x) * (px - x) + (pz - z) * (pz - z) < 0.36 * s * s)) continue;
      points.push([x, z]);
    }
  }
  let tris = cdt2d(points, edges, { exterior: false, delaunay: true });
  let dropped = 0;
  if (holes.length) {
    tris = tris.filter((t) => { const cx = (points[t[0]][0] + points[t[1]][0] + points[t[2]][0]) / 3, cz = (points[t[0]][1] + points[t[1]][1] + points[t[2]][1]) / 3; const inHole = holes.some((h) => pointInRing(cx, cz, h)); if (inHole) dropped++; return !inHole; });
  }
  if (!tris.length) throw new Error('triangulation produced no triangles (duplicate or touching points?)');
  // sanity: every triangle centroid inside the polygon
  let outside = 0;
  for (const t of tris) { const cx = (points[t[0]][0] + points[t[1]][0] + points[t[2]][0]) / 3, cz = (points[t[0]][1] + points[t[1]][1] + points[t[2]][1]) / 3; if (!pointInRing(cx, cz, outer)) outside++; }
  return { points, tris, dropped, outside, bbox };
}

// ---- 4. per-province meshes ----------------------------------------------------------------
// named summits become mesh vertices (coordinates from the content's sourced landmark list)
const landmarkFile = path.join(ROOT, 'src', 'content', 'generated', 'landmarks.json');
const summitXZ = fs.existsSync(landmarkFile)
  ? JSON.parse(fs.readFileSync(landmarkFile, 'utf8')).landmarks.filter((l) => (l.kind === 'volcano' || l.kind === 'mountain') && Number.isFinite(l.lon) && Number.isFinite(l.lat)).map((l) => project(l.lon, l.lat))
  : [];

const feats = topojsonClient.feature(topo, topo.objects.provinces).features;
function buildMesh(spacing, label) {
  const mesh = { units: 'km (scene units)', relief: 'measured — public/geo/dem.png (see src/map/relief.js)', spacingKm: spacing, provinces: [] };
  const report = { provinces: {}, totals: {} };
  let totalArea = 0, totalTris = 0, totalVerts = 0;
  for (const f of feats) {
    const polys = f.geometry.type === 'MultiPolygon' ? f.geometry.coordinates : [f.geometry.coordinates];
    const parts = [];
    let area = 0;
    for (const poly of polys) {
      const outerRaw = ringToXZ(poly[0]);
      if (outerRaw.length < 4) continue;
      // ensure counter-clockwise in the x/z frame (z grows south, so flip sign convention consistently)
      let outer = outerRaw;
      if (signedArea(outer) < 0) outer = outer.slice().reverse();
      const holes = poly.slice(1).map(ringToXZ).filter((h) => h.length >= 4).map((h) => (signedArea(h) > 0 ? h.slice().reverse() : h));
      const a = Math.abs(signedArea(outer)) - holes.reduce((s, h) => s + Math.abs(signedArea(h)), 0);
      const c = centroid(outer);
      const [clon, clat] = unproject(c[0], c[1]);
      const isCoco = clon < -86.5;
      if (!isCoco && a < 0.8) { area += a; continue; } // rocks under ~1 km² count toward the area but are not drawn
      const { points, tris, dropped, outside, bbox } = triangulate(outer, holes, isCoco ? Math.min(spacing, 0.8) : spacing, isCoco ? [] : summitXZ);
      const positions = new Array(points.length * 3);
      let maxY = 0;
      for (let i = 0; i < points.length; i++) {
        const [x, z] = points[i];
        let km;
        if (isCoco) { const [lon, lat] = unproject(x, z); km = cocoKm(lon, lat); } else km = reliefKmAtXZ(x, z);
        const y = elevationToY(km);
        if (y > maxY) maxY = y;
        positions[i * 3] = +x.toFixed(2); positions[i * 3 + 1] = +y.toFixed(3); positions[i * 3 + 2] = +z.toFixed(2);
      }
      parts.push({ coco: isCoco || undefined, areaKm2: +a.toFixed(1), centroid: [+clon.toFixed(4), +clat.toFixed(4)], bbox: bbox.map((v) => +v.toFixed(2)), maxY: +maxY.toFixed(3), positions, indices: tris.flatMap((t) => [t[0], t[2], t[1]]), ringCount: outer.length, steinerCount: points.length - outer.length - holes.reduce((s, h) => s + h.length, 0) });
      area += a;
      totalTris += tris.length; totalVerts += points.length;
      report.provinces[f.id] = report.provinces[f.id] || { parts: [] };
      report.provinces[f.id].parts.push({ coco: isCoco, areaKm2: +a.toFixed(1), vertices: points.length, triangles: tris.length, droppedInHoles: dropped, centroidOutsidePolygon: outside });
    }
    parts.sort((p, q) => (q.areaKm2 - p.areaKm2));
    const main = parts.find((p) => !p.coco);
    mesh.provinces.push({ id: f.id, iso: f.properties.iso, name: f.properties.name, areaKm2: +area.toFixed(1), centroid: main.centroid, bbox: main.bbox, parts });
    report.provinces[f.id].areaKm2 = +area.toFixed(1);
    totalArea += area;
    if (label === 'full') {
      // decorate the topology's province properties so the TopoJSON file carries them too
      const obj = topo.objects.provinces.geometries.find((g) => g.id === f.id);
      obj.properties = { ...obj.properties, areaKm2: +area.toFixed(1), centroid: main.centroid, bbox: main.bbox };
    }
  }
  report.totals = { areaKm2: +totalArea.toFixed(1), vertices: totalVerts, triangles: totalTris };
  return { mesh, report };
}
const full = buildMesh(SPACING.full, 'full');
const lite = buildMesh(SPACING.lite, 'lite');
const report = { ...full.report, lite: lite.report.totals };

// ---- 5. places ---------------------------------------------------------------------------------
const placesRaw = await readShp('ne_10m_populated_places', (f) => f.properties.ADM0_A3 === 'CRI');
// Natural Earth's Chinese place names mix traditional and simplified forms; the site is Simplified Chinese.
const ZH_PLACES = { 'San José': '圣何塞', Alajuela: '阿拉胡埃拉', Cartago: '卡塔戈', Heredia: '埃雷迪亚', Puntarenas: '蓬塔雷纳斯', 'Limón': '利蒙', Liberia: '利韦里亚', Quesada: '克萨达', 'Cañas': '卡尼亚斯', Golfito: '戈尔菲托', 'La Cruz': '拉克鲁斯', 'Ciudad Cortés': '科尔特斯城', Sixaola: '锡克绍拉' };
// a town's province is the outline it stands in (or stands beside: Puntarenas is on a sand spit the simplified coast cuts)
const provinceAt = provinceLocator(feats, 6);
const places = placesRaw.map((f) => ({ id: f.properties.NAME.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-'), name: { en: f.properties.NAME_EN || f.properties.NAME, es: f.properties.NAME_ES || f.properties.NAME, zh: ZH_PLACES[f.properties.NAME] || f.properties.NAME }, lon: +f.properties.LONGITUDE.toFixed(4), lat: +f.properties.LATITUDE.toFixed(4), kind: f.properties.ADM0CAP ? 'capital' : f.properties.FEATURECLA === 'Admin-1 capital' ? 'province-capital' : 'town', province: provinceAt(f.properties.LONGITUDE, f.properties.LATITUDE), popNE: f.properties.POP_MAX })).sort((a, b) => b.popNE - a.popNE);

// ---- 6. water (OpenStreetMap) --------------------------------------------------------------------
const q4 = (v) => Math.round(v * 1e4);
/** Douglas–Peucker on lon/lat points, tolerance in km. */
function simplifyLine(pts, tolKm) {
  if (pts.length <= 2) return pts;
  const xz = pts.map(([lon, lat]) => project(lon, lat));
  const keep = new Uint8Array(pts.length); keep[0] = keep[pts.length - 1] = 1;
  const stack = [[0, pts.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop();
    let worst = -1, wd = tolKm * tolKm;
    const [ax, az] = xz[a], [bx, bz] = xz[b]; const abx = bx - ax, abz = bz - az; const l2 = abx * abx + abz * abz;
    for (let i = a + 1; i < b; i++) {
      let t = l2 ? ((xz[i][0] - ax) * abx + (xz[i][1] - az) * abz) / l2 : 0; t = Math.max(0, Math.min(1, t));
      const dx = xz[i][0] - (ax + t * abx), dz = xz[i][1] - (az + t * abz); const d = dx * dx + dz * dz;
      if (d > wd) { wd = d; worst = i; }
    }
    if (worst > 0) { keep[worst] = 1; stack.push([a, worst], [worst, b]); }
  }
  return pts.filter((_, i) => keep[i]);
}
const lineKm = (pts) => { let s = 0; for (let i = 1; i < pts.length; i++) { const [ax, az] = project(pts[i - 1][0], pts[i - 1][1]), [bx, bz] = project(pts[i][0], pts[i][1]); s += Math.hypot(bx - ax, bz - az); } return s; };
const flat = (pts) => pts.flatMap(([lon, lat]) => [q4(lon), q4(lat)]);

// The country's principal rivers (IGN / MINAE drainage basins): always rank 1. Others earn rank 1 by length.
const PRINCIPAL = ['Tempisque', 'Bebedero', 'San Carlos', 'Sarapiquí', 'Frío', 'Reventazón', 'Pacuare', 'Parismina', 'Matina', 'Chirripó', 'Sixaola', 'Telire', 'Estrella', 'Banano', 'Grande de Térraba', 'Térraba', 'General', 'Coto Brus', 'Sierpe', 'Savegre', 'Naranjo', 'Parrita', 'Pirrís', 'Grande de Tárcoles', 'Tárcoles', 'Virilla', 'Barranca', 'Colorado', 'Tortuguero', 'Sucio', 'Toro', 'San Juan', 'Coto Colorado', 'Abangares', 'Grande de Candelaria'];
const principal = (name) => PRINCIPAL.some((p) => name === 'Río ' + p || name === 'Río ' + p + ' del Atlántico');
const water = { source: 'OpenStreetMap contributors (ODbL 1.0) through the Overpass API; the Río San Juan from Natural Earth (public domain)', rivers: [], lakes: [] };
if (hasCache('osm-rivers.json')) {
  const ways = readJSON('osm-rivers.json').elements.filter((e) => e.type === 'way' && e.geometry?.length > 1 && e.tags?.name).map((e) => ({ name: e.tags.name.trim(), pts: e.geometry.map((g) => [g.lon, g.lat]) }));
  // a river is the set of same-named ways that touch end to end (names repeat across the country: there are a dozen "Río Blanco")
  const byName = new Map();
  for (const w of ways) { let l = byName.get(w.name); if (!l) byName.set(w.name, (l = [])); l.push(w); }
  let kept = 0, pointsOut = 0;
  for (const [name, list] of byName) {
    const parent = list.map((_, i) => i);
    const find = (i) => { while (parent[i] !== i) { parent[i] = parent[parent[i]]; i = parent[i]; } return i; };
    const ends = new Map();
    list.forEach((w, i) => {
      for (const p of [w.pts[0], w.pts[w.pts.length - 1]]) {
        const k = p[0].toFixed(5) + ',' + p[1].toFixed(5);
        if (ends.has(k)) parent[find(i)] = find(ends.get(k)); else ends.set(k, i);
      }
    });
    const groups = new Map();
    list.forEach((w, i) => { const r = find(i); let g = groups.get(r); if (!g) groups.set(r, (g = { km: 0, ways: [] })); g.km += lineKm(w.pts); g.ways.push(w); });
    for (const g of groups.values()) {
      const major = g.km >= 55 || (principal(name) && g.km >= 12);
      if (!major && g.km < 22) continue;
      kept++;
      for (const w of g.ways) {
        const pts = simplifyLine(w.pts, major ? 0.07 : 0.12);
        pointsOut += pts.length;
        water.rivers.push({ n: name, r: major ? 1 : 2, km: Math.round(g.km), p: flat(pts) });
      }
    }
  }
  console.log(`rivers: ${ways.length} named ways → ${kept} rivers, ${water.rivers.length} lines, ${pointsOut} points`);
}
for (const r of neRivers) {
  const lines = r.geometry.type === 'MultiLineString' ? r.geometry.coordinates : [r.geometry.coordinates];
  for (const l of lines) water.rivers.push({ n: r.name, r: 1, km: Math.round(lineKm(l)), p: flat(simplifyLine(l, 0.1)) });
}

/** Joins the member ways of an OSM relation (or one closed way) into closed rings. */
function assembleRings(el, role) {
  const segs = el.type === 'way' ? [el.geometry.map((g) => [g.lon, g.lat])] : (el.members || []).filter((m) => m.type === 'way' && m.geometry && (role === 'outer' ? m.role !== 'inner' : m.role === 'inner')).map((m) => m.geometry.map((g) => [g.lon, g.lat]));
  const key = (p) => p[0].toFixed(6) + ',' + p[1].toFixed(6);
  const rings = [];
  const open = segs.filter((s) => s.length > 1).map((s) => s.slice());
  while (open.length) {
    let cur = open.pop();
    for (;;) {
      if (key(cur[0]) === key(cur[cur.length - 1]) && cur.length > 3) { rings.push(cur); break; }
      const tail = key(cur[cur.length - 1]);
      const i = open.findIndex((s) => key(s[0]) === tail || key(s[s.length - 1]) === tail);
      if (i < 0) break; // an unclosed chain: dropped (and counted by the caller)
      const next = open.splice(i, 1)[0];
      cur = cur.concat((key(next[0]) === tail ? next : next.slice().reverse()).slice(1));
    }
  }
  return rings;
}
const ringKm2 = (ring) => Math.abs(signedArea(ring.map(([lon, lat]) => project(lon, lat))));

if (hasCache('osm-lakes.json')) {
  for (const el of readJSON('osm-lakes.json').elements) {
    const rings = assembleRings(el, 'outer');
    for (const ring of rings) {
      const a = ringKm2(ring);
      if (a < 0.6) continue;
      water.lakes.push({ n: el.tags?.name || '', kind: el.tags?.water || 'lake', km2: +a.toFixed(1), p: flat(simplifyLine(ring, 0.05)) });
    }
  }
  water.lakes.sort((a, b) => b.km2 - a.km2);
  console.log('lakes:', water.lakes.length, water.lakes.slice(0, 6).map((l) => `${l.n} ${l.km2}`).join(' · '));
}

// ---- 7. protected areas (OpenStreetMap, SINAC's system) --------------------------------------------
const PARK_KINDS = [
  [/^Parque (Nacional|Internacional)/i, 'park'],
  [/^Reserva (Biol[oó]gica|Natural Absoluta|Bosque Nuboso)/i, 'reserve'],
  [/^Refugio/i, 'refuge'],
  [/^Humedal/i, 'wetland'],
  [/^(Zona Protectora|Reserva Forestal)/i, 'forest'],
  [/^Monumento/i, 'monument'],
];
const parks = { source: 'OpenStreetMap contributors (ODbL 1.0) through the Overpass API — the protected areas of SINAC as mapped in OSM', areas: [] };
if (hasCache('osm-protected.json')) {
  let unclosed = 0;
  const seen = new Set();
  for (const el of readJSON('osm-protected.json').elements) {
    const name = (el.tags?.name || '').trim();
    const kind = PARK_KINDS.find(([re]) => re.test(name))?.[1];
    if (!kind || seen.has(name)) continue;
    // "Parque Nacional Marino Ballena" also exists as two sector relations: keep the whole
    if (/ - Sector /.test(name)) continue;
    const outers = assembleRings(el, 'outer');
    if (!outers.length) { unclosed++; continue; }
    const rings = outers.map((r) => ({ km2: ringKm2(r), r })).filter((o) => o.km2 >= 0.3);
    const km2 = rings.reduce((s, o) => s + o.km2, 0);
    if (km2 < 2) continue;
    const c = rings.reduce((best, o) => (o.km2 > best.km2 ? o : best), rings[0]);
    const cxz = centroid(c.r.map(([lon, lat]) => project(lon, lat)));
    const [clon, clat] = unproject(cxz[0], cxz[1]);
    if (clon < -86.5) continue; // Isla del Coco is drawn in the inset
    seen.add(name);
    parks.areas.push({ id: `${el.type[0]}${el.id}`, n: name.replace(/^Parque nacional/, 'Parque Nacional'), kind, km2: Math.round(km2), c: [+clon.toFixed(4), +clat.toFixed(4)], sinac: el.tags['ref:CR:SINAC'] || undefined, rings: rings.map((o) => flat(simplifyLine(o.r, 0.09))) });
  }
  parks.areas.sort((a, b) => b.km2 - a.km2);
  const count = (k) => parks.areas.filter((p) => p.kind === k).length;
  console.log(`protected areas: ${parks.areas.length} (parks ${count('park')}, reserves ${count('reserve')}, refuges ${count('refuge')}, wetlands ${count('wetland')}, forest/protective ${count('forest')}, monuments ${count('monument')}); ${unclosed} with open outlines dropped`);
  report.protected = { total: parks.areas.length, parks: count('park'), points: parks.areas.reduce((s, p) => s + p.rings.reduce((t, r) => t + r.length / 2, 0), 0) };
}
report.water = { rivers: water.rivers.length, lakes: water.lakes.length };

// ---- 8. write ----------------------------------------------------------------------------------
fs.writeFileSync(path.join(OUT, 'costa-rica.topo.json'), JSON.stringify(topo));
fs.writeFileSync(path.join(OUT, 'mesh.json'), JSON.stringify(full.mesh));
fs.writeFileSync(path.join(OUT, 'mesh-lite.json'), JSON.stringify(lite.mesh));
fs.writeFileSync(path.join(OUT, 'water.json'), JSON.stringify(water));
fs.writeFileSync(path.join(OUT, 'parks.json'), JSON.stringify(parks));
fs.writeFileSync(path.join(OUT, 'places.json'), JSON.stringify({ source: 'Natural Earth 1:10m populated places (public domain); population figures are Natural Earth estimates, not census results', places }, null, 0));
fs.writeFileSync(path.join(CACHE, 'geo-report.json'), JSON.stringify(report, null, 1));
const sizes = ['costa-rica.topo.json', 'mesh.json', 'mesh-lite.json', 'water.json', 'parks.json', 'places.json'].map((n) => n + ' ' + (fs.statSync(path.join(OUT, n)).size / 1024).toFixed(0) + ' KB');
console.log(sizes.join('\n'));
console.log(JSON.stringify({ totals: report.totals, lite: report.lite, areas: Object.fromEntries(Object.entries(report.provinces).map(([k, v]) => [k, v.areaKm2])) }, null, 1));
