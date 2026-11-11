// The measured terrain behind the 3D map: a height lookup on the mesh that is actually drawn (so markers and lines
// sit on it, not on a smoother idea of it), lines draped on that mesh and sorted by province (so a river rises with
// the province that is lifted), the textures of the three map styles, and the sun of the day/night control.
import * as THREE from 'three';
import { EXTENT, PLINTH, project } from './relief.js';
import type { ProvinceId } from '../state/map';

export interface SurfaceHit { y: number; province: number }
export interface SurfaceIndex {
  /** height and province index under a scene point, or null off the land. The returned object is reused. */
  sample: (x: number, z: number) => SurfaceHit | null;
  ids: ProvinceId[];
}

interface IndexedPart { coco?: boolean; positions: ArrayLike<number>; indices: ArrayLike<number> }

/** A bucket grid over every triangle of the land mesh (2 km cells): a barycentric height in a handful of tests. */
export function buildSurfaceIndex(provinces: { id: ProvinceId; parts: IndexedPart[] }[], cell = 2): SurfaceIndex {
  let n = 0;
  let x0 = Infinity, z0 = Infinity, x1 = -Infinity, z1 = -Infinity;
  for (const p of provinces) for (const part of p.parts) {
    if (part.coco) continue;
    n += part.indices.length / 3;
    const P = part.positions;
    for (let i = 0; i < P.length; i += 3) { if (P[i] < x0) x0 = P[i]; if (P[i] > x1) x1 = P[i]; if (P[i + 2] < z0) z0 = P[i + 2]; if (P[i + 2] > z1) z1 = P[i + 2]; }
  }
  const cols = Math.max(1, Math.ceil((x1 - x0) / cell) + 1), rows = Math.max(1, Math.ceil((z1 - z0) / cell) + 1);
  const T = new Float32Array(n * 9);
  const owner = new Uint8Array(n);
  let t = 0;
  provinces.forEach((p, pi) => {
    for (const part of p.parts) {
      if (part.coco) continue;
      const P = part.positions, I = part.indices;
      for (let i = 0; i < I.length; i += 3, t++) {
        for (let k = 0; k < 3; k++) { const v = I[i + k] * 3; T[t * 9 + k * 3] = P[v]; T[t * 9 + k * 3 + 1] = P[v + 1]; T[t * 9 + k * 3 + 2] = P[v + 2]; }
        owner[t] = pi;
      }
    }
  });
  const span = (i: number) => {
    const ax = T[i * 9], az = T[i * 9 + 2], bx = T[i * 9 + 3], bz = T[i * 9 + 5], cx = T[i * 9 + 6], cz = T[i * 9 + 8];
    return [Math.floor((Math.min(ax, bx, cx) - x0) / cell), Math.floor((Math.max(ax, bx, cx) - x0) / cell), Math.floor((Math.min(az, bz, cz) - z0) / cell), Math.floor((Math.max(az, bz, cz) - z0) / cell)];
  };
  const start = new Uint32Array(cols * rows + 1);
  for (let i = 0; i < n; i++) { const [c0, c1, r0, r1] = span(i); for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) start[r * cols + c + 1]++; }
  for (let i = 0; i < cols * rows; i++) start[i + 1] += start[i];
  const fill = start.slice(0, cols * rows);
  const items = new Uint32Array(start[cols * rows]);
  for (let i = 0; i < n; i++) { const [c0, c1, r0, r1] = span(i); for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) items[fill[r * cols + c]++] = i; }

  const hit: SurfaceHit = { y: 0, province: 0 };
  const sample = (x: number, z: number): SurfaceHit | null => {
    const c = Math.floor((x - x0) / cell), r = Math.floor((z - z0) / cell);
    if (c < 0 || r < 0 || c >= cols || r >= rows) return null;
    const k = r * cols + c;
    for (let j = start[k]; j < start[k + 1]; j++) {
      const i = items[j] * 9;
      const ax = T[i], az = T[i + 2], bx = T[i + 3], bz = T[i + 5], cx = T[i + 6], cz = T[i + 8];
      const d = (bz - cz) * (ax - cx) + (cx - bx) * (az - cz);
      if (d === 0) continue;
      const w0 = ((bz - cz) * (x - cx) + (cx - bx) * (z - cz)) / d;
      const w1 = ((cz - az) * (x - cx) + (ax - cx) * (z - cz)) / d;
      const w2 = 1 - w0 - w1;
      if (w0 >= -1e-4 && w1 >= -1e-4 && w2 >= -1e-4) { hit.y = w0 * T[i + 1] + w1 * T[i + 4] + w2 * T[i + 7]; hit.province = owner[items[j]]; return hit; }
    }
    return null;
  };
  return { sample, ids: provinces.map((p) => p.id) };
}

/** Texture coordinates of a scene point in the square every raster covers (row 0 of the images = north). */
export function terrainUV(x: number, z: number): [number, number] {
  return [(x - (EXTENT.cx - EXTENT.half)) / (2 * EXTENT.half), 1 - (z - (EXTENT.cz - EXTENT.half)) / (2 * EXTENT.half)];
}

export interface DrapedLines {
  /** segment pairs (x, y, z …) per province, in the province's own frame so they rise with it */
  byProvince: Map<ProvinceId, number[]>;
  /** the parts over the sea or outside the country */
  sea: number[];
}

/**
 * Drapes polylines (lon/lat) on the mesh: every span is cut into pieces of at most `step` km, each point takes the
 * mesh height plus `lift`, and each piece goes to the province it lies on.
 */
export function drapeLines(index: SurfaceIndex, lines: ArrayLike<number>[], opts: { lift?: number; step?: number; seaY?: number; scale?: number } = {}): DrapedLines {
  const lift = opts.lift ?? 0.14, step = opts.step ?? 0.8, seaY = opts.seaY ?? 0.16, scale = opts.scale ?? 1e-4;
  const byProvince = new Map<ProvinceId, number[]>();
  for (const id of index.ids) byProvince.set(id, []);
  const sea: number[] = [];
  for (const line of lines) {
    let px = 0, py = 0, pz = 0, pp = -2;
    const visit = (x: number, z: number) => {
      const h = index.sample(x, z);
      const prov = h ? h.province : -1;
      const y = h ? h.y + lift : seaY;
      if (pp !== -2) {
        // a piece belongs to the land it starts or ends on; a piece that changes province is drawn on both ends' own heights
        const bucket = prov >= 0 ? byProvince.get(index.ids[prov])! : pp >= 0 ? byProvince.get(index.ids[pp])! : sea;
        bucket.push(px, py, pz, x, y, z);
      }
      px = x; py = y; pz = z; pp = prov;
    };
    let lx = 0, lz = 0;
    for (let i = 0; i < line.length; i += 2) {
      const [x, z] = project(line[i] * scale, line[i + 1] * scale);
      if (i > 0) {
        const d = Math.hypot(x - lx, z - lz);
        const pieces = Math.ceil(d / step);
        for (let k = 1; k < pieces; k++) visit(lx + ((x - lx) * k) / pieces, lz + ((z - lz) * k) / pieces);
      }
      visit(x, z);
      lx = x; lz = z;
    }
  }
  return { byProvince, sea };
}

// ---- textures ---------------------------------------------------------------------------------------------------
export type MapStyle = 'satellite' | 'terrain' | 'provinces';

const base = () => import.meta.env.BASE_URL.replace(/\/?$/, '/') + 'geo/';
const textures = new Map<string, THREE.Texture>();
const pending = new Set<() => void>();

/** A cached texture of public/geo; it fills in when the image arrives (`onTextureLoad` listeners are told). */
export function geoTexture(file: string, srgb: boolean): THREE.Texture {
  let tex = textures.get(file);
  if (tex) return tex;
  tex = new THREE.TextureLoader().load(base() + file, () => { for (const fn of pending) fn(); });
  tex.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.anisotropy = 8;
  textures.set(file, tex);
  return tex;
}
/** Tell a render loop on demand that a texture has arrived. */
export function onTextureLoad(fn: () => void): () => void {
  pending.add(fn);
  return () => { pending.delete(fn); };
}

export function styleTextureFile(style: MapStyle, lite: boolean): string {
  if (style === 'satellite') return lite ? 'sat-2048.webp' : 'sat-4096.webp';
  return lite ? 'relief-1024.webp' : 'relief-2048.webp';
}
export const normalTextureFile = (lite: boolean) => (lite ? 'normal-1024.webp' : 'normal-2048.webp');

/** A 1×1 transparent texture: the park overlay before any park is drawn. */
let blank: THREE.DataTexture | null = null;
export function blankTexture(): THREE.Texture {
  if (!blank) { blank = new THREE.DataTexture(new Uint8Array([0, 0, 0, 0]), 1, 1); blank.needsUpdate = true; }
  return blank;
}

// ---- the sun -----------------------------------------------------------------------------------------------------
export interface SunState {
  /** unit vector toward the light (the sun by day, the moon by night), scene axes */
  dir: THREE.Vector3;
  /** 0 night … 1 day */
  day: number;
  /** 1 while the sun is low (sunrise, sunset) */
  golden: number;
  light: THREE.Color;
  intensity: number;
  ambient: number;
  zenith: THREE.Color;
  horizon: THREE.Color;
  /** the sun itself, for the sky's disc (below the horizon at night) */
  sun: THREE.Vector3;
}

const LAT = THREE.MathUtils.degToRad(9.9); // the Central Valley
const C = (hex: string) => new THREE.Color(hex);
const NIGHT_Z = C('#060a1b'), NIGHT_H = C('#131d3a'), DAY_Z = C('#4f8fd6'), DAY_H = C('#d5e4f0'), GOLD_Z = C('#3d5c94'), GOLD_H = C('#f2a66a');
const WHITE = C('#fff4e0'), GOLD = C('#ffab63'), MOON = C('#9db7ff');
const smooth = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

/**
 * The sun over Costa Rica at an equinox for a local solar hour (0–24): it rises due east at 6, passes just south of
 * the zenith at noon (the country lies at 8–11° N) and sets due west at 18. Scene axes: x east, y up, z south.
 */
export function sunAt(hour: number, out?: SunState): SunState {
  const s = out ?? { dir: new THREE.Vector3(), day: 0, golden: 0, light: new THREE.Color(), intensity: 0, ambient: 0, zenith: new THREE.Color(), horizon: new THREE.Color(), sun: new THREE.Vector3() };
  const H = THREE.MathUtils.degToRad((hour - 12) * 15);
  const up = Math.cos(LAT) * Math.cos(H);
  s.sun.set(-Math.sin(H), up, Math.sin(LAT) * Math.cos(H)).normalize();
  s.day = smooth(-0.08, 0.16, up);
  s.golden = (1 - smooth(0.02, 0.5, up)) * smooth(-0.14, 0.02, up);
  // the light never comes in flatter than ~17°: raking enough to model the relief, not so flat that every valley is black
  if (s.day > 0.02) s.dir.copy(s.sun).setY(Math.max(0.3, s.sun.y)).normalize();
  else s.dir.set(-0.38, 0.72, 0.42).normalize(); // a high moon from the south-west
  s.light.copy(WHITE).lerp(GOLD, s.golden).lerp(MOON, 1 - s.day);
  s.intensity = THREE.MathUtils.lerp(0.7, THREE.MathUtils.lerp(2.1, 1.9, s.golden), s.day);
  s.ambient = THREE.MathUtils.lerp(0.5, 0.72, s.day) + 0.35 * s.golden;
  s.zenith.copy(NIGHT_Z).lerp(DAY_Z, s.day).lerp(GOLD_Z, s.golden * 0.8);
  s.horizon.copy(NIGHT_H).lerp(DAY_H, s.day).lerp(GOLD_H, s.golden * 0.85);
  return s;
}

export const hourLabel = (hour: number) => {
  const h = Math.floor(hour) % 24, m = Math.round((hour - Math.floor(hour)) * 60);
  return String(h).padStart(2, '0') + ':' + String(m === 60 ? 0 : m).padStart(2, '0');
};

export { PLINTH };
