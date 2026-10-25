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
  /** ambient overlays drawn over the plate (only when motion is allowed): mist, light shafts, a sun glow, and
   *  drifting clouds / a passing flock inside a box of the plate ([x, y, w, h] in plate fractions) */
  ambient?: { mist?: boolean; shafts?: boolean; clouds?: [number, number, number, number]; sun?: boolean; birds?: [number, number, number, number] };
  /** the foliage frame layers sway in the wind; 'sync' sways both halves together (a crown that crosses the split) */
  wind?: 'free' | 'sync';
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
  /** animals on the ground move the same way, without the flier's bank and lift (the turtle crawling toward the surf) */
  walk?: Record<string, [number, number]>;
}

export const STOPS: Stop[] = [
  // A route through the country: the opening forest, then north to Arenal, west over the Tilarán range to Monteverde,
  // north again to Río Celeste, down to the Guanacaste coast, the table, then the Central Valley (Heredia's coffee,
  // the old capital, Irazú), the Talamanca peaks, the Osa Peninsula, the Caribbean, and the closing Pacific beach.
  { key: 'discover', kind: 'scene', plate: 'forest', copy: 'left', ambient: { mist: true, shafts: true, clouds: [0.2, 0, 0.62, 0.3], birds: [0.3, 0.06, 0.5, 0.22] }, wind: 'free', wash: 'mist', length: 230, facing: { 'toucan-a': 1, 'toucan-b': 1 }, fly: { 'macaw-a': [-26, -5], 'macaw-b': [-30, -8], morpho: [9, -14] } },
  { key: 'arenal', kind: 'scene', plate: 'arenal', place: 'arenal', copy: 'right', ambient: { clouds: [0.26, 0.02, 0.52, 0.32], birds: [0.3, 0.1, 0.5, 0.2] }, wind: 'free', wash: 'mist', facing: { toucan: 1 } },
  { key: 'monteverde', kind: 'scene', plate: 'monteverde', place: 'monteverde', copy: 'top-center', ambient: { mist: true, shafts: true, clouds: [0.3, 0.08, 0.5, 0.3] }, wind: 'free', wash: 'mist', facing: { quetzal: 1 }, fly: { morpho: [-12, 10] } },
  { key: 'rio-celeste', kind: 'scene', plate: 'rio-celeste', place: 'rio-celeste', copy: 'bottom', ambient: { mist: true, shafts: true }, wind: 'free', wash: 'mist', fly: { hummingbird: [5, -3] } },
  { key: 'guanacaste', kind: 'scene', plate: 'guanacaste', place: 'guanacaste', copy: 'bottom', ambient: { sun: true, clouds: [0.3, 0.08, 0.7, 0.4], birds: [0.4, 0.28, 0.5, 0.2] }, wind: 'sync', wash: 'warm', facing: { deer: 1 }, fly: { 'macaw-a': [22, -4], 'macaw-b': [26, -6], 'macaw-c': [20, -3], 'macaw-d': [24, -7] } },
  { key: 'flavors', kind: 'table', copy: 'top', length: 210, wash: 'warm' },
  { key: 'coffee', kind: 'scene', plate: 'coffee', place: 'heredia-coffee', copy: 'bottom', ambient: { sun: true, clouds: [0.24, 0.04, 0.56, 0.3] }, wind: 'free', wash: 'warm', facing: { thrush: 1 }, fly: { hummingbird: [-6, -3] } },
  { key: 'cartago', kind: 'scene', plate: 'cartago', place: 'cartago-basilica', copy: 'right', ambient: { clouds: [0.24, 0.1, 0.56, 0.28], birds: [0.3, 0.14, 0.45, 0.18] }, wind: 'free', wash: 'mist', fly: { 'hummingbird-a': [4, -4], 'hummingbird-b': [5, 3] } },
  { key: 'irazu', kind: 'scene', plate: 'irazu', place: 'irazu', copy: 'right', ambient: { clouds: [0.36, 0.04, 0.48, 0.4] }, wind: 'free', eruption: true, wash: 'mist', facing: { thrush: 1 } },
  { key: 'chirripo', kind: 'scene', plate: 'chirripo', place: 'chirripo', copy: 'bottom', ambient: { sun: true, clouds: [0.2, 0.28, 0.8, 0.4] }, wind: 'free', wash: 'mist', facing: { thrush: 1 } },
  // The relief map was a stop here (kind 'map'); it broke the photographic flow of the walk — a dark screen between
  // two plates — so it is one click away instead (chapter 1, every stop's province link, the closing chips, /explore).
  // Restoring it is one line: { key: 'provinces', kind: 'map', copy: 'right', length: 240, wash: 'mist' }.
  { key: 'corcovado', kind: 'scene', plate: 'corcovado', place: 'corcovado', copy: 'right', ambient: { clouds: [0.3, 0, 0.6, 0.32], birds: [0.35, 0.08, 0.45, 0.2] }, wind: 'free', wash: 'mist', facing: { tapir: 1 }, fly: { macaw: [24, 4], morpho: [10, -12] } },
  { key: 'tortuguero', kind: 'scene', plate: 'tortuguero', place: 'tortuguero', copy: 'bottom', ambient: { mist: true }, wind: 'free', wash: 'mist', facing: { toucan: 1, heron: -1 }, fly: { macaw: [-28, 6], morpho: [12, -10] } },
  { key: 'close', kind: 'close', plate: 'manuel-antonio', place: 'manuel-antonio', copy: 'bottom', ambient: { sun: true, clouds: [0, 0, 0.72, 0.42], birds: [0.02, 0.1, 0.5, 0.25] }, wind: 'sync', wash: 'warm', length: 170, facing: { turtle: 1 }, walk: { turtle: [2.6, -0.5] } },
];

export const STOP_COUNT = STOPS.length;
