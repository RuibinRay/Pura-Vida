import * as THREE from 'three';
import { create } from 'zustand';
import type { MapData } from './geo';
import type { CameraGoal } from '../state/map';
import { project, surfaceY } from './relief.js';

export const COUNTRY_TARGET = new THREE.Vector3(-12, 0, -22);
export const COUNTRY_DISTANCE = 430;
export const COUNTRY_POLAR = 1.0;
export const COUNTRY_AZIMUTH = -0.32;

/** Camera framing for a goal, keeping the current azimuth. */
export function framingFor(goal: CameraGoal, data: MapData, fovDeg: number, aspect: number): { target: THREE.Vector3; distance: number; polar: number } {
  const fov = THREE.MathUtils.degToRad(fovDeg);
  if (goal.kind === 'province') {
    const p = data.provinces.find((q) => q.id === goal.id);
    if (p) {
      const [x0, z0, x1, z1] = p.bbox;
      const w = x1 - x0, d = z1 - z0;
      const span = Math.max(w / Math.max(0.6, Math.min(aspect, 1.9)), d * 1.15) * 1.18;
      const distance = Math.max(70, span / (2 * Math.tan(fov / 2)) + 30);
      const [cx, cz] = [(x0 + x1) / 2, (z0 + z1) / 2];
      return { target: new THREE.Vector3(cx, 2, cz), distance, polar: 0.82 };
    }
  }
  if (goal.kind === 'point') {
    const [x, z] = project(goal.lon, goal.lat);
    return { target: new THREE.Vector3(x, surfaceY(goal.lon, goal.lat), z), distance: goal.distance ?? 60, polar: 0.75 };
  }
  return { target: COUNTRY_TARGET.clone(), distance: COUNTRY_DISTANCE, polar: COUNTRY_POLAR };
}

/** Zoom level buckets for label density (updated from the render loop only when a threshold is crossed). */
export const useZoomLevel = create<{ level: 'far' | 'mid' | 'near'; set: (l: 'far' | 'mid' | 'near') => void }>((set) => ({ level: 'far', set: (level) => set({ level }) }));
export function levelFor(distance: number): 'far' | 'mid' | 'near' {
  return distance > 330 ? 'far' : distance > 140 ? 'mid' : 'near';
}

export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
