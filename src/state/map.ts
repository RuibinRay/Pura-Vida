import { create } from 'zustand';
import { loadJSON, saveJSON } from '../save/storage';

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

interface MapState {
  selected: ProvinceId | null;
  hovered: ProvinceId | null;
  activeLandmark: string | null;
  layers: Layers;
  view: '3d' | '2d';
  goal: CameraGoal;
  select: (id: ProvinceId | null, fly?: boolean) => void;
  hover: (id: ProvinceId | null) => void;
  setLandmark: (id: string | null) => void;
  toggleLayer: (k: keyof Layers) => void;
  setView: (v: '3d' | '2d') => void;
  flyTo: (goal: GoalInput) => void;
  reset: () => void;
}

const persistedLayers = loadJSON<Layers>('map.layers', { relief: true, borders: true, cities: true, peaks: true, parks: false, labels: true });
const persistedView = loadJSON<{ view: '3d' | '2d' }>('map.view', { view: '3d' }).view;

export const useMap = create<MapState>((set, get) => ({
  selected: null,
  hovered: null,
  activeLandmark: null,
  layers: persistedLayers,
  view: persistedView,
  goal: { kind: 'country', seq: 0 },
  select: (id, fly = true) => {
    set({ selected: id, activeLandmark: null });
    if (fly) set({ goal: id ? { kind: 'province', id, seq: get().goal.seq + 1 } : { kind: 'country', seq: get().goal.seq + 1 } });
  },
  hover: (hovered) => set({ hovered }),
  setLandmark: (activeLandmark) => set({ activeLandmark }),
  toggleLayer: (k) => set({ layers: { ...get().layers, [k]: !get().layers[k] } }),
  setView: (view) => set({ view }),
  flyTo: (goal) => set({ goal: { ...goal, seq: get().goal.seq + 1 } as CameraGoal }),
  reset: () => set({ selected: null, activeLandmark: null, goal: { kind: 'country', seq: get().goal.seq + 1 } }),
}));

useMap.subscribe((s, prev) => {
  if (s.layers !== prev.layers) saveJSON('map.layers', s.layers);
  if (s.view !== prev.view) saveJSON('map.view', { view: s.view });
});
