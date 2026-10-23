// Builds the map data from Natural Earth (public domain) shapefiles cached in tools/cache/.
//   node tools/build_geo.mjs
// Outputs (committed):
//   public/geo/costa-rica.topo.json  — provinces, neighbours, lakes, rivers (TopoJSON, quantised 1e5)
//   public/geo/mesh.json             — per-province triangulated land surface with stylised relief
//   public/geo/places.json           — Natural Earth populated places inside Costa Rica
//   tools/cache/geo-report.json      — areas, counts, triangle checks (for tests and the docs)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as shapefile from 'shapefile';
import * as topojsonServer from 'topojson-server';
import * as topojsonClient from 'topojson-client';
import cdt2d from 'cdt2d';
import { project, unproject, reliefKmAtXZ, elevationToY } from '../src/map/relief.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CACHE = path.join(ROOT, 'tools', 'cache');
const OUT = path.join(ROOT, 'public', 'geo');
fs.mkdirSync(OUT, { recursive: true });

const clean = (s) => (typeof s === 'string' ? s.replace(/\0+$/, '') : s);
const ISO_TO_SLUG = { 'CR-SJ': 'san-jose', 'CR-A': 'alajuela', 'CR-C': 'cartago', 'CR-H': 'heredia', 'CR-G': 'guanacaste', 'CR-P': 'puntarenas', 'CR-L': 'limon' };
const STEINER_SPACING_KM = 3;

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

// ---- 1. source features -------------------------------------------------------------------
const adm1 = await readShp('ne_10m_admin_1_states_provinces', (f) => f.properties.adm0_a3 === 'CRI');
const provinces = adm1.map((f) => {
  const iso = f.properties.iso_3166_2;
  return { type: 'Feature', id: ISO_TO_SLUG[iso], properties: { id: ISO_TO_SLUG[iso], iso, name: { en: f.properties.name_en || f.properties.name, es: f.properties.name_es || f.properties.name, zh: f.properties.name_zh || f.properties.name } }, geometry: f.geometry };
});
if (provinces.length !== 7) throw new Error('expected 7 provinces, got ' + provinces.length);

const CONTEXT_BOX = [-86.8, 7.3, -81.6, 12.3];
const adm0 = await readShp('ne_10m_admin_0_countries', (f) => ['NIC', 'PAN'].includes(f.properties.ADM0_A3));
const neighbors = adm0.map((f) => {
  const polys = f.geometry.type === 'MultiPolygon' ? f.geometry.coordinates : [f.geometry.coordinates];
  const kept = polys.filter((p) => p[0].length >= 12 && inBox({ type: 'Polygon', coordinates: p }, CONTEXT_BOX));
  return { type: 'Feature', id: f.properties.ADM0_A3.toLowerCase(), properties: { id: f.properties.ADM0_A3.toLowerCase(), name: { en: f.properties.NAME_EN || f.properties.NAME, es: f.properties.NAME_ES || f.properties.NAME, zh: f.properties.NAME_ZH || f.properties.NAME } }, geometry: { type: 'MultiPolygon', coordinates: kept } };
});
const lakes = (await readShp('ne_10m_lakes', (f) => inBox(f.geometry, CONTEXT_BOX))).map((f) => ({ type: 'Feature', id: f.properties.name, properties: { name: f.properties.name }, geometry: f.geometry }));
const rivers = (await readShp('ne_10m_rivers_lake_centerlines', (f) => inBox(f.geometry, [-86.2, 7.9, -82.3, 11.5]))).map((f) => ({ type: 'Feature', id: f.properties.name + ':' + f.properties.featurecla, properties: { name: f.properties.name, kind: f.properties.featurecla }, geometry: f.geometry }));

// ---- 2. topology (shared borders stay shared) ---------------------------------------------
const topo = topojsonServer.topology(
  {
    provinces: { type: 'FeatureCollection', features: provinces },
    neighbors: { type: 'FeatureCollection', features: neighbors },
    lakes: { type: 'FeatureCollection', features: lakes },
    rivers: { type: 'FeatureCollection', features: rivers },
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
function distToRing(x, z, ring) { let best = Infinity; for (let i = 0, n = ring.length; i < n; i++) { const [ax, az] = ring[i], [bx, bz] = ring[(i + 1) % n]; const abx = bx - ax, abz = bz - az; const l2 = abx * abx + abz * abz; let t = l2 ? ((x - ax) * abx + (z - az) * abz) / l2 : 0; t = Math.max(0, Math.min(1, t)); const dx = x - (ax + t * abx), dz = z - (az + t * abz); const d = dx * dx + dz * dz; if (d < best) best = d; } return Math.sqrt(best); }

function triangulate(outer, holes) {
  const points = [], edges = [];
  const addRing = (ring) => { const start = points.length; for (const p of ring) points.push(p); for (let i = 0; i < ring.length; i++) edges.push([start + i, start + ((i + 1) % ring.length)]); };
  addRing(outer);
  for (const h of holes) addRing(h);
  const xs = outer.map((p) => p[0]), zs = outer.map((p) => p[1]);
  const bbox = [Math.min(...xs), Math.min(...zs), Math.max(...xs), Math.max(...zs)];
  const s = STEINER_SPACING_KM;
  let row = 0;
  for (let z = bbox[1] + s / 2; z < bbox[3]; z += s * 0.866, row++) {
    for (let x = bbox[0] + (row % 2 ? s / 2 : 0); x < bbox[2]; x += s) {
      if (!pointInRing(x, z, outer)) continue;
      if (holes.some((h) => pointInRing(x, z, h))) continue;
      if (distToRing(x, z, outer) < 0.45 * s) continue;
      if (holes.some((h) => distToRing(x, z, h) < 0.45 * s)) continue;
      points.push([x, z]);
    }
  }
  let tris = cdt2d(points, edges, { exterior: false, delaunay: true });
  let dropped = 0;
  if (holes.length) {
    tris = tris.filter((t) => { const cx = (points[t[0]][0] + points[t[1]][0] + points[t[2]][0]) / 3, cz = (points[t[0]][1] + points[t[1]][1] + points[t[2]][1]) / 3; const inHole = holes.some((h) => pointInRing(cx, cz, h)); if (inHole) dropped++; return !inHole; });
  }
  // sanity: every triangle centroid inside the polygon
  let outside = 0;
  for (const t of tris) { const cx = (points[t[0]][0] + points[t[1]][0] + points[t[2]][0]) / 3, cz = (points[t[0]][1] + points[t[1]][1] + points[t[2]][1]) / 3; if (!pointInRing(cx, cz, outer)) outside++; }
  return { points, tris, dropped, outside, bbox };
}

// ---- 4. per-province meshes ----------------------------------------------------------------
const feats = topojsonClient.feature(topo, topo.objects.provinces).features;
const mesh = { units: 'km (scene units)', relief: 'stylised — see src/map/relief.js', provinces: [] };
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
    if (!isCoco && a < 0.8) continue; // skip rocks smaller than ~1 km² on the main map
    const { points, tris, dropped, outside, bbox } = triangulate(outer, holes);
    const positions = new Array(points.length * 3);
    let maxY = 0;
    for (let i = 0; i < points.length; i++) {
      const [x, z] = points[i];
      const y = elevationToY(reliefKmAtXZ(x, z));
      if (y > maxY) maxY = y;
      positions[i * 3] = +x.toFixed(3); positions[i * 3 + 1] = +y.toFixed(3); positions[i * 3 + 2] = +z.toFixed(3);
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
  // decorate the topology's province properties so the TopoJSON file carries them too
  const obj = topo.objects.provinces.geometries.find((g) => g.id === f.id);
  obj.properties = { ...obj.properties, areaKm2: +area.toFixed(1), centroid: main.centroid, bbox: main.bbox };
}
report.totals = { areaKm2: +totalArea.toFixed(1), vertices: totalVerts, triangles: totalTris };

// ---- 5. places ---------------------------------------------------------------------------------
const placesRaw = await readShp('ne_10m_populated_places', (f) => f.properties.ADM0_A3 === 'CRI');
// Natural Earth's Chinese place names mix traditional and simplified forms; the site is Simplified Chinese.
const ZH_PLACES = { 'San José': '圣何塞', Alajuela: '阿拉胡埃拉', Cartago: '卡塔戈', Heredia: '埃雷迪亚', Puntarenas: '蓬塔雷纳斯', 'Limón': '利蒙', Liberia: '利韦里亚', Quesada: '克萨达', 'Cañas': '卡尼亚斯', Golfito: '戈尔菲托', 'La Cruz': '拉克鲁斯', 'Ciudad Cortés': '科尔特斯城', Sixaola: '锡克绍拉' };
const places = placesRaw.map((f) => ({ id: f.properties.NAME.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-'), name: { en: f.properties.NAME_EN || f.properties.NAME, es: f.properties.NAME_ES || f.properties.NAME, zh: ZH_PLACES[f.properties.NAME] || f.properties.NAME }, lon: +f.properties.LONGITUDE.toFixed(4), lat: +f.properties.LATITUDE.toFixed(4), kind: f.properties.ADM0CAP ? 'capital' : f.properties.FEATURECLA === 'Admin-1 capital' ? 'province-capital' : 'town', province: ISO_TO_SLUG[Object.keys(ISO_TO_SLUG).find((k) => provinces.find((p) => p.properties.iso === k && p.properties.name.en === f.properties.ADM1NAME))] || null, popNE: f.properties.POP_MAX })).sort((a, b) => b.popNE - a.popNE);

// ---- 6. write ----------------------------------------------------------------------------------
fs.writeFileSync(path.join(OUT, 'costa-rica.topo.json'), JSON.stringify(topo));
fs.writeFileSync(path.join(OUT, 'mesh.json'), JSON.stringify(mesh));
fs.writeFileSync(path.join(OUT, 'places.json'), JSON.stringify({ source: 'Natural Earth 1:10m populated places (public domain); population figures are Natural Earth estimates, not census results', places }, null, 0));
fs.writeFileSync(path.join(CACHE, 'geo-report.json'), JSON.stringify(report, null, 1));
const sizes = ['costa-rica.topo.json', 'mesh.json', 'places.json'].map((n) => n + ' ' + (fs.statSync(path.join(OUT, n)).size / 1024).toFixed(0) + ' KB');
console.log(sizes.join('\n'));
console.log(JSON.stringify(report, null, 1));
