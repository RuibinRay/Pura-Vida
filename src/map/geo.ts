// Loads and indexes the processed geodata in public/geo (built by tools/build_geo.mjs).
import * as topojson from 'topojson-client';
import type { Topology, GeometryCollection, Polygon, MultiPolygon } from 'topojson-specification';
import type { Feature, Polygon as GPolygon, MultiPolygon as GMultiPolygon } from 'geojson';
import { project, installDem, setSurfaceSampler } from './relief.js';
import { buildSurfaceIndex, type SurfaceIndex } from './terrain';
import type { ProvinceId } from '../state/map';
import type { Localized } from '../i18n';

export interface MeshPart {
  coco?: boolean;
  areaKm2: number;
  centroid: [number, number];
  bbox: [number, number, number, number];
  maxY: number;
  positions: number[];
  indices: number[];
  ringCount: number;
  steinerCount: number;
}
export interface MeshProvince {
  id: ProvinceId;
  iso: string;
  name: Localized;
  areaKm2: number;
  centroid: [number, number];
  bbox: [number, number, number, number];
  parts: MeshPart[];
}
export interface Place {
  id: string;
  name: Localized;
  lon: number;
  lat: number;
  kind: 'capital' | 'province-capital' | 'town';
  province: ProvinceId | null;
  popNE: number;
}
export interface ArcLine {
  points: [number, number][]; // [x, z] scene km
  shared: boolean; // border between two provinces (vs coastline / national border)
}
export interface ProvinceShape {
  id: ProvinceId;
  /** rings in lon/lat (outer rings only, mainland first), for the 2D map */
  rings: [number, number][][];
}
/** A river line from OpenStreetMap: `p` is a flat list of lon, lat in 1e-4 degrees. Rank 1 = the principal rivers. */
export interface River { n: string; r: 1 | 2; km: number; p: number[] }
export interface Lake { n: string; kind: string; km2: number; p: number[] }
export type ParkKind = 'park' | 'reserve' | 'refuge' | 'wetland' | 'forest' | 'monument';
/** A protected area of SINAC's system as mapped in OpenStreetMap; rings are flat lon, lat lists in 1e-4 degrees. */
export interface ParkArea { id: string; n: string; kind: ParkKind; km2: number; c: [number, number]; rings: number[][] }

export interface MapData {
  provinces: MeshProvince[];
  places: Place[];
  arcs: ArcLine[];
  shapes: ProvinceShape[];
  neighbors: { id: string; name: Localized; rings: [number, number][][] }[];
  /** lake outlines in lon/lat: the neighbours' great lakes and Costa Rica's larger ones (for the 2D map) */
  lakes: [number, number][][];
  /** the principal rivers in lon/lat (for the 2D map) */
  rivers: [number, number][][];
  /** every river and lake kept by the builder (for the 3D map) */
  water: { rivers: River[]; lakes: Lake[] };
  /** heights and provinces on the lighter mesh (the 3D map swaps in the dense one, see loadDenseMesh) */
  surface: SurfaceIndex;
  bbox: [number, number, number, number]; // scene km of the mainland
}

type ProvProps = { id: ProvinceId; iso: string; name: Localized; areaKm2: number; centroid: [number, number]; bbox: [number, number, number, number] };

let cache: Promise<MapData> | null = null;

/** The elevation grid: an 8-bit grey PNG read back through a canvas (one byte per 500 m cell, see relief.js). */
async function loadDem(url: string): Promise<{ size: number; data: Uint8Array }> {
  const res = await fetch(url);
  if (!res.ok) throw new Error('elevation grid failed to load');
  const blob = await res.blob();
  let bmp: ImageBitmap;
  try { bmp = await createImageBitmap(blob, { colorSpaceConversion: 'none', premultiplyAlpha: 'none' }); } catch { bmp = await createImageBitmap(blob); }
  const canvas = document.createElement('canvas');
  canvas.width = bmp.width; canvas.height = bmp.height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('no 2D canvas for the elevation grid');
  ctx.drawImage(bmp, 0, 0);
  const rgba = ctx.getImageData(0, 0, bmp.width, bmp.height).data;
  const data = new Uint8Array(bmp.width * bmp.height);
  for (let i = 0; i < data.length; i++) data[i] = rgba[i * 4];
  bmp.close?.();
  return { size: bmp.width, data };
}

const unflat = (p: number[]): [number, number][] => { const out: [number, number][] = []; for (let i = 0; i < p.length; i += 2) out.push([p[i] / 1e4, p[i + 1] / 1e4]); return out; };

/**
 * Loads the map once per session: the outlines, the places, the water and the lighter land mesh (3 km interior), which
 * every page can afford. The 3D map on a capable device then asks for the dense mesh (`loadDenseMesh`).
 */
export function loadMapData(): Promise<MapData> {
  if (cache) return cache;
  const base = import.meta.env.BASE_URL.replace(/\/?$/, '/');
  cache = (async () => {
    const [meshRes, topoRes, placesRes, waterRes, terrainRes, demGrid] = await Promise.all([
      fetch(base + 'geo/mesh-lite.json'), fetch(base + 'geo/costa-rica.topo.json'), fetch(base + 'geo/places.json'), fetch(base + 'geo/water.json'), fetch(base + 'geo/terrain.json'),
      loadDem(base + 'geo/dem.png').catch(() => null),
    ]);
    if (!meshRes.ok || !topoRes.ok || !placesRes.ok) throw new Error('map data failed to load');
    const mesh = (await meshRes.json()) as { provinces: MeshProvince[] };
    const waterRaw = waterRes.ok ? ((await waterRes.json()) as { rivers: River[]; lakes: Lake[] }) : { rivers: [], lakes: [] };
    const terrain = terrainRes.ok ? ((await terrainRes.json()) as { dem: { maxMetres: number } }) : null;
    // the measured relief: from here on reliefKm() samples the grid, and surfaceY() the mesh itself
    if (demGrid) installDem({ size: demGrid.size, data: demGrid.data, maxMetres: terrain?.dem.maxMetres });
    const surface = buildSurfaceIndex(mesh.provinces);
    installSurface(surface);
    const topo = (await topoRes.json()) as Topology<{ provinces: GeometryCollection<ProvProps>; neighbors: GeometryCollection<{ id: string; name: Localized }>; lakes: GeometryCollection }>;
    const places = ((await placesRes.json()) as { places: Place[] }).places;

    // arcs: count how many province geometries use each arc
    const usage = new Map<number, number>();
    const count = (idx: number) => usage.set(idx, (usage.get(idx) || 0) + 1);
    const walkArcs = (arcs: number[][] | number[][][]) => {
      for (const ring of arcs as number[][]) for (const a of ring as unknown as number[]) count(a < 0 ? ~a : a);
    };
    for (const g of topo.objects.provinces.geometries) {
      if (g.type === 'Polygon') walkArcs((g as Polygon).arcs);
      else if (g.type === 'MultiPolygon') for (const poly of (g as MultiPolygon).arcs) walkArcs(poly);
    }
    const arcs: ArcLine[] = [];
    const tf = topo.transform;
    const decode = (arc: number[][]): [number, number][] => {
      let x = 0, y = 0;
      return arc.map(([dx, dy]) => {
        x += dx; y += dy;
        const lon = tf ? x * tf.scale[0] + tf.translate[0] : x;
        const lat = tf ? y * tf.scale[1] + tf.translate[1] : y;
        return project(lon, lat) as [number, number];
      });
    };
    usage.forEach((n, idx) => arcs.push({ points: decode(topo.arcs[idx] as number[][]), shared: n > 1 }));

    const fc = topojson.feature(topo, topo.objects.provinces) as unknown as { features: Feature<GPolygon | GMultiPolygon, ProvProps>[] };
    const shapes: ProvinceShape[] = fc.features.map((f) => {
      const polys = f.geometry.type === 'MultiPolygon' ? f.geometry.coordinates : [f.geometry.coordinates];
      const rings = polys.map((p) => p[0] as [number, number][]);
      return { id: f.properties.id, rings };
    });
    const nfc = topojson.feature(topo, topo.objects.neighbors) as unknown as { features: Feature<GPolygon | GMultiPolygon, { id: string; name: Localized }>[] };
    const neighbors = nfc.features.map((f) => ({ id: f.properties.id, name: f.properties.name, rings: (f.geometry.type === 'MultiPolygon' ? f.geometry.coordinates : [f.geometry.coordinates]).map((p) => p[0] as [number, number][]) }));
    const lfc = topojson.feature(topo, topo.objects.lakes) as unknown as { features: Feature<GPolygon | GMultiPolygon>[] };
    const lakes = lfc.features.flatMap((f) => (f.geometry.type === 'MultiPolygon' ? f.geometry.coordinates : [f.geometry.coordinates]).map((p) => p[0] as [number, number][]))
      .concat(waterRaw.lakes.filter((l) => l.km2 >= 1.5).map((l) => unflat(l.p)));
    const rivers = waterRaw.rivers.filter((r) => r.r === 1).map((r) => unflat(r.p));

    let bbox: [number, number, number, number] = [Infinity, Infinity, -Infinity, -Infinity];
    for (const p of mesh.provinces) for (const part of p.parts) {
      if (part.coco) continue;
      bbox = [Math.min(bbox[0], part.bbox[0]), Math.min(bbox[1], part.bbox[1]), Math.max(bbox[2], part.bbox[2]), Math.max(bbox[3], part.bbox[3])];
    }
    return { provinces: mesh.provinces, places, arcs, shapes, neighbors, lakes, rivers, water: waterRaw, surface, bbox };
  })();
  cache.catch(() => (cache = null));
  return cache;
}

/** Makes a mesh the height source of `surfaceY` (markers, labels and the camera's targets stand on it). */
export function installSurface(surface: SurfaceIndex) {
  setSurfaceSampler((x: number, z: number) => { const h = surface.sample(x, z); return h ? h.y : null; });
}

let denseCache: Promise<{ provinces: MeshProvince[]; surface: SurfaceIndex }> | null = null;
/** The dense land mesh (1.5 km interior, ~36,000 vertices) for the 3D map on the full tier. */
export function loadDenseMesh(): Promise<{ provinces: MeshProvince[]; surface: SurfaceIndex }> {
  if (denseCache) return denseCache;
  const base = import.meta.env.BASE_URL.replace(/\/?$/, '/');
  denseCache = fetch(base + 'geo/mesh.json').then((r) => { if (!r.ok) throw new Error('dense mesh failed to load'); return r.json(); }).then((mesh: { provinces: MeshProvince[] }) => ({ provinces: mesh.provinces, surface: buildSurfaceIndex(mesh.provinces) }));
  denseCache.catch(() => (denseCache = null));
  return denseCache;
}

let parksCache: Promise<ParkArea[]> | null = null;
/** The protected areas as polygons (loaded when the layer is first shown). */
export function loadParks(): Promise<ParkArea[]> {
  if (parksCache) return parksCache;
  const base = import.meta.env.BASE_URL.replace(/\/?$/, '/');
  parksCache = fetch(base + 'geo/parks.json').then((r) => { if (!r.ok) throw new Error('protected areas failed to load'); return r.json(); }).then((j: { areas: ParkArea[] }) => j.areas);
  parksCache.catch(() => (parksCache = null));
  return parksCache;
}

export const PROVINCE_COLORS: Record<ProvinceId, string> = {
  'san-jose': '#c25d4b',
  alajuela: '#d9933f',
  cartago: '#7f5aa6',
  heredia: '#3f8f7a',
  guanacaste: '#d6b345',
  puntarenas: '#3b78a8',
  limon: '#4f9e5c',
};
export const PROVINCE_ORDER: ProvinceId[] = ['san-jose', 'alajuela', 'cartago', 'heredia', 'guanacaste', 'puntarenas', 'limon'];
