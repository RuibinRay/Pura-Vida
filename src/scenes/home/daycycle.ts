// Day cycle: phase p in [0,1) — 0 midnight, 0.25 sunrise, 0.5 noon, 0.75 sunset.
// The sun rises behind the viewer (east, +z) and sets ahead, over the Pacific (-z).
import * as THREE from 'three';
import type { TimeMode } from '../../state/settings';

interface Key { p: number; zenith: string; horizon: string; sun: string; ambient: number; sunI: number; shaft: number }
const KEYS: Key[] = [
  { p: 0.0, zenith: '#070c22', horizon: '#15223f', sun: '#8da2ff', ambient: 0.16, sunI: 0.12, shaft: 0 },
  { p: 0.2, zenith: '#1a2a55', horizon: '#5b4f6e', sun: '#b9a2c9', ambient: 0.28, sunI: 0.25, shaft: 0.05 },
  { p: 0.27, zenith: '#6f93cf', horizon: '#f1b784', sun: '#ffd4a0', ambient: 0.55, sunI: 1.4, shaft: 0.75 },
  { p: 0.38, zenith: '#4d86d6', horizon: '#dbe8f1', sun: '#fff0d8', ambient: 1.15, sunI: 2.1, shaft: 0.9 },
  { p: 0.5, zenith: '#3f80d8', horizon: '#d2e4f0', sun: '#fff5e4', ambient: 1.25, sunI: 2.3, shaft: 0.55 },
  { p: 0.65, zenith: '#4a7fcf', horizon: '#dfd8c4', sun: '#ffe9c4', ambient: 1.1, sunI: 2.0, shaft: 0.7 },
  { p: 0.76, zenith: '#4b5aa4', horizon: '#f08a4a', sun: '#ffb070', ambient: 0.55, sunI: 1.3, shaft: 0.8 },
  { p: 0.84, zenith: '#1c2550', horizon: '#6a3f58', sun: '#c58fa8', ambient: 0.3, sunI: 0.3, shaft: 0.08 },
  { p: 1.0, zenith: '#070c22', horizon: '#15223f', sun: '#8da2ff', ambient: 0.16, sunI: 0.12, shaft: 0 },
];

export interface DayState {
  p: number;
  zenith: THREE.Color;
  horizon: THREE.Color;
  sun: THREE.Color;
  sunDir: THREE.Vector3;
  elevation: number; // 0..1 (sin of elevation), negative at night
  ambient: number;
  sunI: number;
  shaft: number;
  night: number; // 0..1
}

const cA = new THREE.Color(), cB = new THREE.Color();
export function dayState(p: number, out?: DayState): DayState {
  const s: DayState = out ?? { p, zenith: new THREE.Color(), horizon: new THREE.Color(), sun: new THREE.Color(), sunDir: new THREE.Vector3(), elevation: 0, ambient: 0, sunI: 0, shaft: 0, night: 0 };
  p = ((p % 1) + 1) % 1;
  let i = 0;
  while (i < KEYS.length - 2 && KEYS[i + 1].p < p) i++;
  const a = KEYS[i], b = KEYS[i + 1];
  const t = THREE.MathUtils.smoothstep(p, a.p, b.p);
  s.p = p;
  s.zenith.copy(cA.set(a.zenith)).lerp(cB.set(b.zenith), t);
  s.horizon.copy(cA.set(a.horizon)).lerp(cB.set(b.horizon), t);
  s.sun.copy(cA.set(a.sun)).lerp(cB.set(b.sun), t);
  s.ambient = THREE.MathUtils.lerp(a.ambient, b.ambient, t);
  s.sunI = THREE.MathUtils.lerp(a.sunI, b.sunI, t);
  s.shaft = THREE.MathUtils.lerp(a.shaft, b.shaft, t);
  const e = ((p - 0.25) / 0.5) * Math.PI; // 0 at sunrise, π at sunset
  s.elevation = Math.sin(e);
  if (p < 0.25 || p > 0.75) {
    // moon: opposite arc
    const m = ((p + 0.25) % 1) / 0.5 * Math.PI;
    s.sunDir.set(-0.35, Math.max(0.15, Math.sin(m)), Math.cos(m)).normalize();
  } else {
    // while the sun is behind the viewer (z > 0) keep it high enough that the canopy does not shadow the clearing
    const y = Math.sin(e);
    s.sunDir.set(0.3, Math.cos(e) > 0 ? Math.max(0.7, y) : Math.max(0.03, y), Math.cos(e)).normalize();
  }
  s.night = THREE.MathUtils.clamp(1 - THREE.MathUtils.smoothstep(p, 0.17, 0.3) + THREE.MathUtils.smoothstep(p, 0.72, 0.86), 0, 1);
  return s;
}

export function phaseFor(mode: TimeMode, elapsed: number): number {
  switch (mode) {
    case 'morning': return 0.34;
    case 'afternoon': return 0.58;
    case 'sunset': return 0.765;
    case 'night': return 0.04;
    case 'costaRica': {
      const d = new Date();
      const h = ((d.getUTCHours() - 6 + 24) % 24) + d.getUTCMinutes() / 60;
      return h / 24;
    }
    default: return (0.33 + elapsed / 240) % 1; // a full day every four minutes
  }
}
