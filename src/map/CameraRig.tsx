import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { useMap } from '../state/map';
import { framingFor, levelFor, useZoomLevel, easeInOut, COUNTRY_TARGET, COUNTRY_DISTANCE, COUNTRY_POLAR, COUNTRY_AZIMUTH } from './camera';
import type { MapData } from './geo';
import { makeFpsWatchdog, useTier } from '../perf/tier';

interface Glide {
  t: number;
  dur: number;
  fromPos: THREE.Vector3;
  fromTarget: THREE.Vector3;
  toPos: THREE.Vector3;
  toTarget: THREE.Vector3;
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
    c.target.copy(COUNTRY_TARGET);
    sph.set(COUNTRY_DISTANCE, COUNTRY_POLAR, COUNTRY_AZIMUTH);
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
    glide.current = { t: 0, dur: 1.15, fromPos: camera.position.clone(), fromTarget: c.target.clone(), toPos, toTarget: f.target.clone() };
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
      c.target.y = THREE.MathUtils.clamp(c.target.y, 0, 20);
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
      camera.position.lerpVectors(g.fromPos, g.toPos, e);
      c.target.lerpVectors(g.fromTarget, g.toTarget, e);
      if (g.t >= 1) glide.current = null;
    }
    c.update();
    const lv = levelFor(c.getDistance());
    if (lv !== level.current) { level.current = lv; setLevel(lv); }
  });

  return <OrbitControls ref={controls} makeDefault enableDamping dampingFactor={0.08} minDistance={32} maxDistance={760} minPolarAngle={0.12} maxPolarAngle={1.32} screenSpacePanning={false} zoomToCursor rotateSpeed={0.6} enablePan />;
}
