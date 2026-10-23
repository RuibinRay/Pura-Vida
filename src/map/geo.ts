// Loads and indexes the processed geodata in public/geo (built by tools/build_geo.mjs).
import * as topojson from 'topojson-client';
import type { Topology, GeometryCollection, Polygon, MultiPolygon } from 'topojson-specification';
import type { Feature, Polygon as GPolygon, MultiPolygon as GMultiPolygon } from 'geojson';
import { project } from './relief.js';
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
export interface MapData {
  provinces: MeshProvince[];
  places: Place[];
  arcs: ArcLine[];
  shapes: ProvinceShape[];
  neighbors: { id: string; name: Localized; rings: [number, number][][] }[];
  lakes: [number, number][][];
  rivers: [number, number][][];
  bbox: [number, number, number, number]; // scene km of the mainland
}

type ProvProps = { id: ProvinceId; iso: string; name: Localized; areaKm2: number; centroid: [number, number]; bbox: [number, number, number, number] };

let cache: Promise<MapData> | null = null;

export function loadMapData(): Promise<MapData> {
  if (cache) return cache;
  const base = import.meta.env.BASE_URL.replace(/\/?$/, '/');
  cache = (async () => {
    const [meshRes, topoRes, placesRes] = await Promise.all([fetch(base + 'geo/mesh.json'), fetch(base + 'geo/costa-rica.topo.json'), fetch(base + 'geo/places.json')]);
    if (!meshRes.ok || !topoRes.ok || !placesRes.ok) throw new Error('map data failed to load');
    const mesh = (await meshRes.json()) as { provinces: MeshProvince[] };
    const topo = (await topoRes.json()) as Topology<{ provinces: GeometryCollection<ProvProps>; neighbors: GeometryCollection<{ id: string; name: Localized }>; lakes: GeometryCollection; rivers: GeometryCollection }>;
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
    const lakes = lfc.features.flatMap((f) => (f.geometry.type === 'MultiPolygon' ? f.geometry.coordinates : [f.geometry.coordinates]).map((p) => p[0] as [number, number][]));
    const rfc = topojson.feature(topo, topo.objects.rivers) as unknown as { features: { geometry: { type: 'LineString' | 'MultiLineString'; coordinates: number[][] | number[][][] } }[] };
    const rivers = rfc.features.flatMap((f) => (f.geometry.type === 'MultiLineString' ? (f.geometry.coordinates as number[][][]) : [f.geometry.coordinates as number[][]]).map((l) => l as [number, number][]));

    let bbox: [number, number, number, number] = [Infinity, Infinity, -Infinity, -Infinity];
    for (const p of mesh.provinces) for (const part of p.parts) {
      if (part.coco) continue;
      bbox = [Math.min(bbox[0], part.bbox[0]), Math.min(bbox[1], part.bbox[1]), Math.max(bbox[2], part.bbox[2]), Math.max(bbox[3], part.bbox[3])];
    }
    return { provinces: mesh.provinces, places, arcs, shapes, neighbors, lakes, rivers, bbox };
  })();
  cache.catch(() => (cache = null));
  return cache;
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
