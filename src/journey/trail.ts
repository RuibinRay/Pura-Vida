// The wildlife trail: a walk through nine habitats over a sticky stage. Each zone is one of the owner's environment
// images (research/plates-original/2026-10-25/environments/, none used elsewhere on the site; the ladder under
// public/zoo/env/ is built by tools/zoo_envs.py) with his animal cut-outs placed on it (public/zoo/, cut by
// tools/zoo_stickers.py). Positions are percentages of the stage (left, top, width) for a landscape screen, with a
// portrait layout for phones. Every animal is a species of the wildlife journal, placed only where the journal's
// sources put it; a tap opens the sourced entry.
import ZOO from './zoo.generated.json';
import ENVS from './envs.generated.json';

export type Loop = 'hang' | 'perch' | 'hover' | 'fly' | 'stand' | 'prowl' | 'crawl' | 'swim' | 'breathe';

export interface TrailAnimal {
  /** species id (content.species) and sticker name (public/zoo/<id>-<w>.webp) */
  id: string;
  /** landscape: left %, top %, width % of the stage */
  at: [number, number, number];
  /** portrait (phones): left %, top %, width % */
  phone: [number, number, number];
  loop: Loop;
  /** 0 … 1: how deep in the scene (0 far, 1 near) — parallax and size with the walk */
  depth?: number;
  /** the entrance: where the animal comes from as the visitor walks in */
  from?: 'left' | 'right' | 'up' | 'down';
  /** entrance order 0 … 1 (fraction of the zone's progress at which it starts) */
  d?: number;
  flip?: boolean;
  /** loop period in s (defaults by loop) */
  period?: number;
  /** fraction of the sticker's height under the water line (a swimmer: the cut-out fades out below it) */
  dip?: number;
}

export interface TrailZone {
  key: string;
  /** backdrop (public/zoo/env/<env>-<w>.webp) */
  env: string;
  /** where the backdrop is centred (object-position, %) */
  focal: [number, number];
  /** the trail sign's corner on landscape screens (phones: always the bottom) */
  sign: 'tl' | 'tr';
  /** scroll length of the zone in vh (default 150) */
  length?: number;
  /** the walk's ambient layers (the same textures as the homepage plates): drifting mist, light shafts, a passing
   *  flock inside a box of the stage ([x, y, w, h] in fractions) */
  ambient?: { mist?: boolean; shafts?: boolean; birds?: [number, number, number, number] };
  animals: TrailAnimal[];
}

export const ZONES: TrailZone[] = [
  // From the lowland canopy up through the cloud forest to the crater, then down through the gardens and the dry
  // forest to the forest floor, the Caribbean canals and the Pacific shore.
  {
    key: 'canopy', env: 'canopy', focal: [50, 45], sign: 'tr', ambient: { shafts: true, birds: [0.3, 0.16, 0.5, 0.2] },
    animals: [
      { id: 'brown-throated-three-toed-sloth', at: [2, 6, 13], phone: [1, 15, 30], loop: 'hang', depth: 0.9, from: 'up', d: 0.02 },
      { id: 'geoffroys-spider-monkey', at: [17, 9, 8], phone: [70, 15, 22], loop: 'hang', depth: 0.8, from: 'up', d: 0.08 },
      { id: 'scarlet-macaw', at: [50, 9, 15], phone: [30, 24, 42], loop: 'fly', depth: 0.4, from: 'right', d: 0.05 },
      { id: 'keel-billed-toucan', at: [21, 42, 12], phone: [4, 36, 32], loop: 'perch', depth: 0.9, from: 'left', d: 0.12 },
      { id: 'mantled-howler-monkey', at: [58, 58, 15], phone: [52, 44, 44], loop: 'perch', depth: 0.8, from: 'right', d: 0.16 },
      { id: 'kinkajou', at: [80, 62, 9], phone: [8, 54, 22], loop: 'perch', depth: 1, from: 'down', d: 0.22 },
    ],
  },
  {
    key: 'cloud', env: 'cloud', focal: [50, 45], sign: 'tr', ambient: { mist: true, shafts: true },
    animals: [
      { id: 'resplendent-quetzal', at: [30, 8, 11], phone: [52, 14, 32], loop: 'perch', depth: 0.9, from: 'up', d: 0.02 },
      { id: 'purple-throated-mountain-gem', at: [12, 30, 8], phone: [8, 24, 30], loop: 'hover', depth: 0.8, from: 'left', d: 0.1 },
      { id: 'fleischmanns-glass-frog', at: [40, 62, 9], phone: [6, 46, 36], loop: 'breathe', depth: 1, from: 'down', d: 0.16 },
    ],
  },
  {
    key: 'waterfall', env: 'waterfall', focal: [55, 50], sign: 'tl', ambient: { mist: true },
    animals: [
      { id: 'rufous-tailed-hummingbird', at: [26, 36, 9], phone: [8, 28, 32], loop: 'hover', depth: 0.9, from: 'left', d: 0.04 },
      { id: 'blue-morpho', at: [56, 44, 10], phone: [54, 44, 40], loop: 'hover', depth: 0.6, from: 'right', d: 0.1, period: 5.2 },
    ],
  },
  {
    key: 'volcano', env: 'volcano', focal: [50, 50], sign: 'tr', length: 120, ambient: { mist: true },
    animals: [
      { id: 'volcano-hummingbird', at: [14, 50, 9], phone: [12, 38, 34], loop: 'hover', depth: 1, from: 'left', d: 0.06 },
    ],
  },
  {
    key: 'gardens', env: 'gardens', focal: [50, 55], sign: 'tr', ambient: { birds: [0.2, 0.12, 0.5, 0.2] },
    animals: [
      { id: 'clay-colored-thrush', at: [8, 50, 12], phone: [4, 46, 42], loop: 'perch', depth: 1, from: 'left', d: 0.04 },
      { id: 'ruby-throated-hummingbird', at: [46, 60, 10], phone: [52, 26, 40], loop: 'hover', depth: 1, from: 'right', d: 0.12 },
    ],
  },
  {
    key: 'dry', env: 'dry', focal: [50, 55], sign: 'tr', ambient: { birds: [0.35, 0.18, 0.5, 0.2] },
    animals: [
      { id: 'white-faced-capuchin', at: [26, 8, 9], phone: [2, 14, 30], loop: 'perch', depth: 0.8, from: 'up', d: 0.04 },
      { id: 'white-tailed-deer', at: [22, 50, 16], phone: [6, 38, 44], loop: 'stand', depth: 0.9, from: 'left', d: 0.1 },
      { id: 'green-iguana', at: [50, 70, 17], phone: [38, 54, 50], loop: 'crawl', depth: 1, from: 'right', d: 0.16 },
    ],
  },
  {
    key: 'floor', env: 'floor', focal: [50, 55], sign: 'tr', ambient: { shafts: true, mist: true },
    animals: [
      { id: 'jaguar', at: [8, 43, 22], phone: [0, 30, 56], loop: 'prowl', depth: 1, from: 'left', d: 0.02 },
      { id: 'bairds-tapir', at: [64, 56, 18], phone: [44, 46, 52], loop: 'stand', depth: 0.8, from: 'right', d: 0.08 },
      { id: 'white-nosed-coati', at: [32, 62, 9], phone: [6, 50, 22], loop: 'stand', depth: 1, from: 'down', d: 0.14 },
      { id: 'plumed-basilisk', at: [50, 74, 12], phone: [50, 58, 40], loop: 'crawl', depth: 1, from: 'right', d: 0.2 },
      { id: 'strawberry-poison-dart-frog', at: [5, 33, 6], phone: [4, 22, 18], loop: 'breathe', depth: 1, from: 'down', d: 0.24 },
      { id: 'eyelash-viper', at: [84, 66, 10], phone: [64, 24, 30], loop: 'breathe', depth: 1, from: 'down', d: 0.28 },
    ],
  },
  {
    key: 'rivers', env: 'rivers', focal: [50, 55], sign: 'tr', ambient: { mist: true },
    animals: [
      { id: 'great-green-macaw', at: [44, 7, 18], phone: [26, 14, 48], loop: 'fly', depth: 0.4, from: 'up', d: 0.02 },
      { id: 'great-blue-heron', at: [10, 42, 11], phone: [4, 28, 34], loop: 'stand', depth: 0.8, from: 'left', d: 0.08 },
      { id: 'spectacled-caiman', at: [52, 68, 24], phone: [10, 52, 62], loop: 'swim', depth: 0.9, from: 'left', d: 0.14, dip: 0.3 },
      { id: 'west-indian-manatee', at: [68, 66, 16], phone: [50, 58, 40], loop: 'swim', depth: 1, from: 'right', d: 0.2, dip: 0.4 },
      { id: 'red-eyed-tree-frog', at: [8, 72, 8], phone: [70, 30, 24], loop: 'breathe', depth: 1, from: 'down', d: 0.26 },
    ],
  },
  {
    key: 'coast', env: 'coast', focal: [50, 55], sign: 'tl', length: 170, ambient: { birds: [0.3, 0.08, 0.5, 0.22] },
    animals: [
      { id: 'olive-ridley-sea-turtle', at: [26, 68, 16], phone: [4, 54, 50], loop: 'crawl', depth: 1, from: 'left', d: 0.02 },
      { id: 'humpback-whale', at: [72, 34, 16], phone: [48, 22, 48], loop: 'swim', depth: 0.5, from: 'down', d: 0.1 },
      { id: 'bottlenose-dolphin', at: [58, 48, 10], phone: [62, 44, 30], loop: 'swim', depth: 0.6, from: 'down', d: 0.18, dip: 0.08 },
    ],
  },
];

export const ZONE_COUNT = ZONES.length;
export const TRAIL_SPECIES = ZONES.flatMap((z) => z.animals.map((a) => a.id));

export interface Sticker { w: number; h: number; widths: number[]; baseline: number }
export const STICKERS = ZOO as Record<string, Sticker>;
export interface Env { w: number; h: number; widths: number[]; source: string }
export const ENV = ENVS as Record<string, Env>;

const BASE = import.meta.env.BASE_URL.replace(/\/?$/, '/') + 'zoo/';
export function stickerSrc(id: string, w: number) {
  return `${BASE}${id}-${w}.webp`;
}
export function stickerSrcSet(id: string) {
  const s = STICKERS[id];
  if (!s) return '';
  return s.widths.map((w) => `${stickerSrc(id, w)} ${w}w`).join(', ');
}
export function envSrc(key: string, w: number) {
  return `${BASE}env/${key}-${w}.webp`;
}
export function envSrcSet(key: string) {
  const e = ENV[key];
  if (!e) return '';
  return e.widths.map((w) => `${envSrc(key, w)} ${w}w`).join(', ');
}
