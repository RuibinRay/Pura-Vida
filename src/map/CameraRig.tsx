import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { useMap } from '../state/map';
import { framingFor, levelFor, useZoomLevel, easeInOut, COUNTRY_POLAR, COUNTRY_AZIMUTH } from './camera';
import type { MapData } from './geo';
import { makeFpsWatchdog, useTier } from '../perf/tier';

/** A flight between two views, in the orbit's own terms (target, distance, tilt, bearing) so the camera swings
 *  round the land instead of cutting a straight line through it; long hops rise before they come down. */
interface Glide {
  t: number;
  dur: number;
  fromTarget: THREE.Vector3;
  toTarget: THREE.Vector3;
  fromR: number; toR: number;
  fromPhi: number; toPhi: number;
  fromTheta: number; toTheta: number;
  /** extra distance at the middle of the flight */
  rise: number;
}

const sph = new THREE.Spherical();
const tmp = new THREE.Vector3();

export function CameraRig({ data, calm, stageRef }: { data: MapData; calm: boolean; stageRef: React.RefObject<HTMLDivElement | null> }) {
  const controls = useRef<OrbitControlsImpl>(null);
  const { camera, size } = useThree();
  const goal = useMap((s) => s.goal);
  const glide = useRef<Glide | null>(null);
  const setLevel = useZoomLevel((s) => s.set);
  const level = useRef<'far' | 'mid' | 'near'>('far');
  const demote = useTier((s) => s.demote);
  const watchdog = useRef(makeFpsWatchdog(() => demote('low fps')));

  // initial framing
  useEffect(() => {
    const c = controls.current;
    if (!c) return;
    const f0 = framingFor({ kind: 'country', seq: 0 }, data, (camera as THREE.PerspectiveCamera).fov, size.width / Math.max(1, size.height));
    c.target.copy(f0.target);
    sph.set(f0.distance, COUNTRY_POLAR, COUNTRY_AZIMUTH);
    camera.position.copy(c.target).add(tmp.setFromSpherical(sph));
    c.update();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // goal → glide
  useEffect(() => {
    const c = controls.current;
    if (!c || goal.seq === 0) return;
    const persp = camera as THREE.PerspectiveCamera;
    const f = framingFor(goal, data, persp.fov, size.width / Math.max(1, size.height));
    const offset = tmp.copy(camera.position).sub(c.target);
    sph.setFromVector3(offset);
    sph.radius = f.distance;
    sph.phi = f.polar;
    const toPos = f.target.clone().add(new THREE.Vector3().setFromSpherical(sph));
    if (calm) {
      camera.position.copy(toPos);
      c.target.copy(f.target);
      c.update();
      glide.current = null;
      return;
    }
    const fromR = offset.length();
    const from = new THREE.Spherical().setFromVector3(offset);
    const travel = c.target.distanceTo(f.target);
    // a short hop is quick; crossing the country takes its time and lifts a little on the way
    const dur = THREE.MathUtils.clamp(0.95 + travel / 260 + Math.abs(Math.log(f.distance / Math.max(1, fromR))) * 0.35, 1.05, 2.6);
    const rise = Math.max(0, travel * 0.55 - Math.abs(f.distance - fromR) * 0.5);
    // arriving at a place, the bearing swings a few degrees: the land turns under the camera as it comes in
    const swing = goal.kind === 'country' ? 0 : (f.target.x - c.target.x >= 0 ? 0.16 : -0.16);
    glide.current = { t: 0, dur, fromTarget: c.target.clone(), toTarget: f.target.clone(), fromR, toR: f.distance, fromPhi: from.phi, toPhi: f.polar, fromTheta: from.theta, toTheta: goal.kind === 'country' ? COUNTRY_AZIMUTH : from.theta + swing, rise };
  }, [goal, data, camera, size, calm]);

  // cancel glide on user interaction + clamp target
  useEffect(() => {
    const c = controls.current;
    if (!c) return;
    const onStart = () => { glide.current = null; };
    const [x0, z0, x1, z1] = data.bbox;
    const onChange = () => {
      c.target.x = THREE.MathUtils.clamp(c.target.x, x0 - 80, x1 + 80);
      c.target.z = THREE.MathUtils.clamp(c.target.z, z0 - 80, z1 + 80);
      c.target.y = THREE.MathUtils.clamp(c.target.y, 0, 22);
    };
    c.addEventListener('start', onStart);
    c.addEventListener('change', onChange);
    return () => { c.removeEventListener('start', onStart); c.removeEventListener('change', onChange); };
  }, [data]);

  // keyboard: arrows pan, +/- zoom, Home resets (on the stage element)
  useEffect(() => {
    const el = stageRef.current;
    const c = controls.current;
    if (!el || !c) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest('input, textarea, select, [role=listbox]')) return;
      const step = c.getDistance() * 0.08;
      const dir = new THREE.Vector3();
      camera.getWorldDirection(dir);
      dir.y = 0; dir.normalize();
      const right = new THREE.Vector3().crossVectors(dir, new THREE.Vector3(0, 1, 0));
      let handled = true;
      switch (e.key) {
        case 'ArrowUp': c.target.addScaledVector(dir, step); camera.position.addScaledVector(dir, step); break;
        case 'ArrowDown': c.target.addScaledVector(dir, -step); camera.position.addScaledVector(dir, -step); break;
        case 'ArrowLeft': c.target.addScaledVector(right, -step); camera.position.addScaledVector(right, -step); break;
        case 'ArrowRight': c.target.addScaledVector(right, step); camera.position.addScaledVector(right, step); break;
        case '+': case '=': { const off = camera.position.clone().sub(c.target).multiplyScalar(0.85); camera.position.copy(c.target).add(off); break; }
        case '-': case '_': { const off = camera.position.clone().sub(c.target).multiplyScalar(1.18); camera.position.copy(c.target).add(off); break; }
        case 'Home': useMap.getState().reset(); break;
        default: handled = false;
      }
      if (handled) { e.preventDefault(); glide.current = null; c.update(); }
    };
    el.addEventListener('keydown', onKey);
    return () => el.removeEventListener('keydown', onKey);
  }, [stageRef, camera]);

  useFrame((_, dt) => {
    watchdog.current();
    const c = controls.current;
    if (!c) return;
    const g = glide.current;
    if (g) {
      g.t = Math.min(1, g.t + dt / g.dur);
      const e = easeInOut(g.t);
      c.target.lerpVectors(g.fromTarget, g.toTarget, e);
      // distance eases in log space (a zoom feels even), plus the rise of a long hop
      const r = Math.exp(THREE.MathUtils.lerp(Math.log(g.fromR), Math.log(g.toR), e)) + g.rise * Math.sin(Math.PI * g.t);
      let dTheta = g.toTheta - g.fromTheta;
      if (dTheta > Math.PI) dTheta -= Math.PI * 2; else if (dTheta < -Math.PI) dTheta += Math.PI * 2;
      sph.set(r, THREE.MathUtils.lerp(g.fromPhi, g.toPhi, e), g.fromTheta + dTheta * e);
      camera.position.copy(c.target).add(tmp.setFromSpherical(sph));
      if (g.t >= 1) glide.current = null;
    }
    c.update();
    const lv = levelFor(c.getDistance());
    if (lv !== level.current) { level.current = lv; setLevel(lv); }
  });

  return <OrbitControls ref={controls} makeDefault enableDamping dampingFactor={0.08} minDistance={22} maxDistance={820} minPolarAngle={0.08} maxPolarAngle={1.38} screenSpacePanning={false} zoomToCursor rotateSpeed={0.6} enablePan />;
}
