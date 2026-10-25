// The stops of the homepage walk, in order. Each chapter of the scroll journey is one of these: a plate (one of the
// owner's images with its moving animals and water), the relief map, the table, or the closing beach.
import type { PlateName } from './Plate';

export type StopKind = 'scene' | 'map' | 'table' | 'close';
export type CopyPlacement = 'left' | 'right' | 'bottom' | 'top' | 'top-center';

export interface Stop {
  /** i18n key under journey.stops.<key> and the rail label */
  key: string;
  kind: StopKind;
  plate?: PlateName;
  /** id of the sourced place record (content.places) that supplies the copy and fact tiles */
  place?: string;
  copy: CopyPlacement;
  /** ambient overlays drawn over the plate (only when motion is allowed) */
  ambient?: { mist?: boolean; shafts?: boolean; clouds?: boolean; sun?: boolean };
  /** a light wash at the transition INTO this stop (peaks while the stop fades in) */
  wash?: 'mist' | 'warm';
  /** the Irazú "what if it erupted?" layer */
  eruption?: boolean;
  /** how many 100vh of scroll the stop takes (default in CSS: 185) */
  length?: number;
  /** per-animal overrides: facing direction for head moves (+1 faces right) */
  facing?: Record<string, 1 | -1>;
  /** flying animals cross the frame as the stop progresses: [dx, dy] in vw over the whole stop (+x = right, +y = down) */
  fly?: Record<string, [number, number]>;
}

export const STOPS: Stop[] = [
  { key: 'discover', kind: 'scene', plate: 'forest', copy: 'left', ambient: { mist: true, shafts: true }, wash: 'mist', length: 230, facing: { 'toucan-a': 1, 'toucan-b': 1 }, fly: { 'macaw-a': [-26, -5], 'macaw-b': [-30, -8], morpho: [9, -14] } },
  { key: 'monteverde', kind: 'scene', plate: 'monteverde', place: 'monteverde', copy: 'top-center', ambient: { mist: true, shafts: true }, wash: 'mist', facing: { quetzal: 1 }, fly: { morpho: [-12, 10] } },
  { key: 'rio-celeste', kind: 'scene', plate: 'rio-celeste', place: 'rio-celeste', copy: 'left', ambient: { mist: true } },
  { key: 'irazu', kind: 'scene', plate: 'irazu', place: 'irazu', copy: 'right', ambient: { clouds: true }, eruption: true, wash: 'mist', facing: { thrush: 1 } },
  // The relief map was a stop here (kind 'map'); it broke the photographic flow of the walk — a dark screen between
  // two plates — so it is one click away instead (chapter 1, every stop's province link, the closing chips, /explore).
  // Restoring it is one line: { key: 'provinces', kind: 'map', copy: 'right', length: 240, wash: 'mist' }.
  { key: 'guanacaste', kind: 'scene', plate: 'guanacaste', place: 'guanacaste', copy: 'bottom', ambient: { sun: true }, wash: 'warm', facing: { deer: 1 }, fly: { 'macaw-a': [22, -4], 'macaw-b': [26, -6], 'macaw-c': [20, -3], 'macaw-d': [24, -7] } },
  { key: 'flavors', kind: 'table', copy: 'top', length: 210, wash: 'warm' },
  { key: 'corcovado', kind: 'scene', plate: 'corcovado', place: 'corcovado', copy: 'right', wash: 'mist', facing: { tapir: 1 }, fly: { macaw: [24, 4], morpho: [10, -12] } },
  { key: 'tortuguero', kind: 'scene', plate: 'tortuguero', place: 'tortuguero', copy: 'bottom', ambient: { mist: true }, wash: 'mist', facing: { toucan: 1, heron: -1 }, fly: { macaw: [-28, 6], morpho: [12, -10] } },
  { key: 'close', kind: 'close', plate: 'manuel-antonio', place: 'manuel-antonio', copy: 'bottom', ambient: { sun: true }, wash: 'warm', length: 170 },
];

export const STOP_COUNT = STOPS.length;
