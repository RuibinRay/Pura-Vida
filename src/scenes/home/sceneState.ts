import * as THREE from 'three';
import { create } from 'zustand';
import { dayState, type DayState } from './daycycle';

/** Mutable per-frame data shared by scene components without React re-renders. */
export const frame = {
  day: dayState(0.34) as DayState,
  cursor: new THREE.Vector2(0, 0), // -1..1
  wind: 1,
  calm: false,
  elapsed: 0,
  introT: 1, // 0..1 progress of the walk in
  cameraPos: new THREE.Vector3(),
};

export type TourStep = 0 | 1 | 2 | 3 | 4; // 0 = no tour
export type Creature = 'toucan' | 'sloth' | 'morpho' | 'volcano';

interface HomeUI {
  introPlaying: boolean;
  tour: TourStep;
  hovered: Creature | null;
  setIntroPlaying: (v: boolean) => void;
  setTour: (s: TourStep) => void;
  setHovered: (c: Creature | null) => void;
}

export const useHomeUI = create<HomeUI>((set) => ({
  introPlaying: false,
  tour: 0,
  hovered: null,
  setIntroPlaying: (introPlaying) => set({ introPlaying }),
  setTour: (tour) => set({ tour }),
  setHovered: (hovered) => set({ hovered }),
}));

/** Where the camera sits for each tour stop: [position, lookAt]. */
export const TOUR_STOPS: Record<Exclude<TourStep, 0>, { pos: [number, number, number]; look: [number, number, number] }> = {
  1: { pos: [-0.2, 2.6, 23.5], look: [-2.4, 3.1, 19.6] }, // toucan
  2: { pos: [0.6, 1.9, 33.8], look: [1.9, 4.0, 30.6] }, // sloth
  3: { pos: [0.2, 2.0, -1.0], look: [-1.0, 1.4, -8] }, // morphos
  4: { pos: [0, 2.3, -3.5], look: [8, 12, -110] }, // the vista
};
export const REST = { pos: [0, 2.1, -3.5] as [number, number, number], look: [3, 6, -90] as [number, number, number] };

/** Resting camera when the intro is skipped or already seen. */
export const TOUCAN_POS: [number, number, number] = [-2.4, 3.1, 19.6];
export const SLOTH_POS: [number, number, number] = [1.9, 4.05, 30.6];
