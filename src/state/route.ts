// The visitor's own route across the map: an ordered list of places (landmark ids), kept on this device and
// shareable as a link (/explore?route=a,b,c).
import { create } from 'zustand';
import { loadJSON, saveJSON } from '../save/storage';

export const ROUTE_MAX = 12;

interface RouteState {
  stops: string[];
  has: (id: string) => boolean;
  add: (id: string) => void;
  remove: (id: string) => void;
  /** move the stop at `index` one place earlier (-1) or later (+1) */
  move: (index: number, by: -1 | 1) => void;
  set: (ids: string[]) => void;
  clear: () => void;
}

const clean = (ids: unknown): string[] => (Array.isArray(ids) ? [...new Set(ids.filter((x): x is string => typeof x === 'string' && /^[a-z0-9-]{2,80}$/.test(x)))].slice(0, ROUTE_MAX) : []);

export const useRoute = create<RouteState>((set, get) => ({
  stops: clean(loadJSON<{ stops: string[] }>('route', { stops: [] }).stops),
  has: (id) => get().stops.includes(id),
  add: (id) => { if (!get().stops.includes(id) && get().stops.length < ROUTE_MAX) set({ stops: [...get().stops, id] }); },
  remove: (id) => set({ stops: get().stops.filter((x) => x !== id) }),
  move: (index, by) => {
    const s = get().stops.slice();
    const j = index + by;
    if (index < 0 || index >= s.length || j < 0 || j >= s.length) return;
    [s[index], s[j]] = [s[j], s[index]];
    set({ stops: s });
  },
  set: (ids) => set({ stops: clean(ids) }),
  clear: () => set({ stops: [] }),
}));

useRoute.subscribe((s) => saveJSON('route', { stops: s.stops }));

/** Great-circle distance between two points in km (haversine, mean Earth radius). */
export function distanceKm(a: [number, number], b: [number, number]): number {
  const R = 6371.0088, rad = Math.PI / 180;
  const dLat = (b[1] - a[1]) * rad, dLon = (b[0] - a[0]) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a[1] * rad) * Math.cos(b[1] * rad) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** The straight-line length of a route through [lon, lat] points, leg by leg. */
export function routeLegs(points: [number, number][]): number[] {
  const out: number[] = [];
  for (let i = 1; i < points.length; i++) out.push(distanceKm(points[i - 1], points[i]));
  return out;
}

/** The route as a link's query value, and back. */
export const routeToParam = (ids: string[]) => ids.join(',');
export const routeFromParam = (v: string | null) => clean((v || '').split(',').filter(Boolean));
