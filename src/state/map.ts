import { create } from 'zustand';
import { loadJSON, saveJSON } from '../save/storage';
import type { KindFilter } from '../map/explore';

export type ProvinceId = 'san-jose' | 'alajuela' | 'cartago' | 'heredia' | 'guanacaste' | 'puntarenas' | 'limon';
export const PROVINCE_IDS: ProvinceId[] = ['san-jose', 'alajuela', 'cartago', 'heredia', 'guanacaste', 'puntarenas', 'limon'];

export interface Layers {
  relief: boolean;
  borders: boolean;
  cities: boolean;
  peaks: boolean;
  parks: boolean;
  labels: boolean;
}

/** A request for the camera: fit a province, a point, or the whole country. */
export type CameraGoal =
  | { kind: 'country'; seq: number }
  | { kind: 'province'; id: ProvinceId; seq: number }
  | { kind: 'point'; lon: number; lat: number; distance?: number; seq: number };

type DistributiveOmit<T, K extends keyof T> = T extends unknown ? Omit<T, K> : never;
export type GoalInput = DistributiveOmit<CameraGoal, 'seq'>;

export interface Tour {
  active: boolean;
  step: number;
  auto: boolean;
}

interface MapState {
  selected: ProvinceId | null;
  hovered: ProvinceId | null;
  activeLandmark: string | null;
  /** a species card open on the wildlife layer */
  activeAnimal: string | null;
  /** a dish card open on the food layer */
  activeFood: string | null;
  layers: Layers;
  filter: KindFilter;
  showWildlife: boolean;
  showFood: boolean;
  tour: Tour;
  view: '3d' | '2d';
  goal: CameraGoal;
  select: (id: ProvinceId | null, fly?: boolean) => void;
  hover: (id: ProvinceId | null) => void;
  setLandmark: (id: string | null) => void;
  setAnimal: (id: string | null) => void;
  setFood: (id: string | null) => void;
  toggleLayer: (k: keyof Layers) => void;
  setFilter: (f: KindFilter) => void;
  setShowWildlife: (on: boolean) => void;
  setShowFood: (on: boolean) => void;
  setTour: (tour: Partial<Tour>) => void;
  setView: (v: '3d' | '2d') => void;
  flyTo: (goal: GoalInput) => void;
  reset: () => void;
}

const persistedLayers = { ...{ relief: true, borders: true, cities: true, peaks: true, parks: true, labels: true }, ...loadJSON<Partial<Layers>>('map.layers', {}) };
const persistedView = loadJSON<{ view: '3d' | '2d' }>('map.view', { view: '3d' }).view;
const persistedOverlays = loadJSON<{ wildlife: boolean; food: boolean }>('map.overlays', { wildlife: true, food: false });

export const useMap = create<MapState>((set, get) => ({
  selected: null,
  hovered: null,
  activeLandmark: null,
  activeAnimal: null,
  activeFood: null,
  layers: persistedLayers,
  filter: 'all',
  showWildlife: persistedOverlays.wildlife,
  showFood: persistedOverlays.food,
  tour: { active: false, step: 0, auto: false },
  view: persistedView,
  goal: { kind: 'country', seq: 0 },
  select: (id, fly = true) => {
    set({ selected: id, activeLandmark: null, activeAnimal: null, activeFood: null });
    if (fly) set({ goal: id ? { kind: 'province', id, seq: get().goal.seq + 1 } : { kind: 'country', seq: get().goal.seq + 1 } });
  },
  hover: (hovered) => set({ hovered }),
  setLandmark: (activeLandmark) => set({ activeLandmark, activeAnimal: null, activeFood: null }),
  setAnimal: (activeAnimal) => set({ activeAnimal, activeLandmark: null, activeFood: null }),
  setFood: (activeFood) => set({ activeFood, activeLandmark: null, activeAnimal: null }),
  toggleLayer: (k) => set({ layers: { ...get().layers, [k]: !get().layers[k] } }),
  setFilter: (filter) => set({ filter }),
  setShowWildlife: (showWildlife) => set({ showWildlife, activeAnimal: showWildlife ? get().activeAnimal : null }),
  setShowFood: (showFood) => set({ showFood, activeFood: showFood ? get().activeFood : null }),
  setTour: (tour) => set({ tour: { ...get().tour, ...tour } }),
  setView: (view) => set({ view }),
  flyTo: (goal) => set({ goal: { ...goal, seq: get().goal.seq + 1 } as CameraGoal }),
  reset: () => set({ selected: null, activeLandmark: null, activeAnimal: null, activeFood: null, tour: { active: false, step: 0, auto: false }, goal: { kind: 'country', seq: get().goal.seq + 1 } }),
}));

useMap.subscribe((s, prev) => {
  if (s.layers !== prev.layers) saveJSON('map.layers', s.layers);
  if (s.view !== prev.view) saveJSON('map.view', { view: s.view });
  if (s.showWildlife !== prev.showWildlife || s.showFood !== prev.showFood) saveJSON('map.overlays', { wildlife: s.showWildlife, food: s.showFood });
});
