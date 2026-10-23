import { useMemo } from 'react';
import { project } from '../map/relief.js';
import { PROVINCE_COLORS, type MapData } from '../map/geo';
import type { ProvinceId } from '../state/map';

/** The province's real outline as a small inline SVG, from the same geodata as the map. */
export function ProvinceSilhouette({ data, id, size = 56, label }: { data: MapData | null; id: ProvinceId; size?: number; label?: string }) {
  const d = useMemo(() => {
    if (!data) return null;
    const shape = data.shapes.find((s) => s.id === id);
    if (!shape) return null;
    const rings = shape.rings.filter((r) => r[0][0] > -86.5);
    let minX = Infinity, minZ = Infinity, maxX = -Infinity, maxZ = -Infinity;
    const proj = rings.map((r) => r.map(([lon, lat]) => { const [x, z] = project(lon, lat); minX = Math.min(minX, x); maxX = Math.max(maxX, x); minZ = Math.min(minZ, z); maxZ = Math.max(maxZ, z); return [x, z]; }));
    const w = maxX - minX, h = maxZ - minZ, s = 100 / Math.max(w, h);
    const ox = (100 - w * s) / 2, oz = (100 - h * s) / 2;
    const path = proj.map((r) => r.map(([x, z], i) => (i ? 'L' : 'M') + ((x - minX) * s + ox).toFixed(1) + ' ' + ((z - minZ) * s + oz).toFixed(1)).join('') + 'Z').join(' ');
    return path;
  }, [data, id]);
  return (
    <svg className="silhouette" viewBox="0 0 100 100" width={size} height={size} role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      {d ? <path d={d} fill={PROVINCE_COLORS[id]} stroke="#1d2b22" strokeWidth={1.2} strokeLinejoin="round" /> : <circle cx="50" cy="50" r="30" fill={PROVINCE_COLORS[id]} opacity={0.4} />}
    </svg>
  );
}
