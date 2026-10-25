// The sprites of the wildlife and food layers: which cartoon goes at which place, fanned around the place so that
// several species at one park do not stack. Offsets are in scene km (the map's world units), shared by the 3D
// overlay and the 2D map so both views agree.
import type { Landmark } from '../content/types';
import { HABITATS } from '../content/habitats';
import { FOOD_PLACES } from '../content/foodPlaces';

export interface Sprite {
  key: string;
  kind: 'animal' | 'food';
  id: string; // species id or dish id
  lm: Landmark;
  dx: number; // km east
  dz: number; // km south
}

const RADIUS = 7.5; // km from the place marker

/** sprite size in CSS px per zoom level */
export const SPRITE_PX: Record<'far' | 'mid' | 'near', number> = { far: 30, mid: 40, near: 48 };

export function spritePositions(landmarks: Landmark[], show: { wildlife: boolean; food: boolean }, maxPerPlace = Infinity): Sprite[] {
  const byId = new Map(landmarks.map((l) => [l.id, l]));
  const perPlace = new Map<string, { kind: 'animal' | 'food'; id: string }[]>();
  const add = (at: string, kind: 'animal' | 'food', id: string) => {
    if (!byId.has(at)) return;
    const arr = perPlace.get(at) ?? [];
    arr.push({ kind, id });
    perPlace.set(at, arr);
  };
  if (show.wildlife) for (const [sp, places] of Object.entries(HABITATS)) for (const p of places) add(p.at, 'animal', sp);
  if (show.food) for (const [f, places] of Object.entries(FOOD_PLACES)) for (const p of places) add(p.at, 'food', f);
  const out: Sprite[] = [];
  perPlace.forEach((all, at) => {
    const lm = byId.get(at)!;
    const items = all.slice(0, maxPerPlace);
    const n = items.length;
    items.forEach((it, i) => {
      // one sprite sits north-east of the marker; more fan out on an arc above it
      const a = n === 1 ? -Math.PI / 4 : -Math.PI * (0.15 + (0.7 * i) / (n - 1));
      out.push({ key: `${it.kind}-${it.id}-${at}`, kind: it.kind, id: it.id, lm, dx: Math.cos(a) * RADIUS, dz: Math.sin(a) * RADIUS });
    });
  });
  return out;
}
