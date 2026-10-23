import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { frame, useHomeUI, TOUR_STOPS, REST } from './sceneState';
import { dayState, phaseFor } from './daycycle';
import { useSettings } from '../../state/settings';
import { makeFpsWatchdog, useTier } from '../../perf/tier';

const INTRO_SECONDS = 13;

/** Updates the shared per-frame state (time, day cycle, wind) once per frame. */
export function FrameDriver({ calm }: { calm: boolean }) {
  const timeMode = useSettings((s) => s.timeMode);
  const demote = useTier((s) => s.demote);
  const watchdog = useRef(makeFpsWatchdog(() => demote('low fps')));
  useFrame((_, dt) => {
    watchdog.current();
    frame.elapsed += Math.min(dt, 0.1);
    frame.calm = calm;
    frame.wind += ((calm ? 0.3 : 1) - frame.wind) * 0.05;
    dayState(phaseFor(timeMode, frame.elapsed), frame.day);
  });
  return null;
}

/**
 * The walk in, the idle look-around and the guided tour.
 * - intro: the camera follows a curve through the forest to the clearing (skippable; calm mode crossfades instead)
 * - idle: a small parallax from the pointer or a touch drag
 * - tour: four stops, each a smooth move
 */
export function CameraPath({ playIntro, onIntroEnd }: { playIntro: boolean; onIntroEnd: () => void }) {
  const { camera, gl } = useThree();
  const tour = useHomeUI((s) => s.tour);
  const introPlaying = useHomeUI((s) => s.introPlaying);
  const setIntroPlaying = useHomeUI((s) => s.setIntroPlaying);
  const curve = useMemo(() => new THREE.CatmullRomCurve3([new THREE.Vector3(1.6, 1.6, 46), new THREE.Vector3(-1.5, 1.7, 34), new THREE.Vector3(1.2, 1.9, 22), new THREE.Vector3(-0.9, 2.0, 11), new THREE.Vector3(0.2, 1.95, 5), new THREE.Vector3(REST.pos[0], REST.pos[1], REST.pos[2])], false, 'catmullrom', 0.4), []);
  const t = useRef(0);
  const pos = useRef(new THREE.Vector3());
  const look = useRef(new THREE.Vector3());
  const curPos = useRef(new THREE.Vector3(...REST.pos));
  const curLook = useRef(new THREE.Vector3(...REST.look));
  const drag = useRef({ active: false, x: 0, y: 0, ox: 0, oy: 0 });
  const started = useRef(false);
  const endedRef = useRef(false);
  const freeze = useRef<number | null>((() => { const q = new URLSearchParams(window.location.search).get('intro'); return q ? Math.max(0, Math.min(0.999, Number(q))) : null; })());

  // the scene can unmount mid-walk (tier change, navigation): never leave the overlay hidden
  useEffect(() => () => { useHomeUI.getState().setIntroPlaying(false); frame.introT = 1; }, []);

  // start / skip handling
  useEffect(() => {
    if (playIntro && !started.current) {
      started.current = true;
      t.current = 0;
      endedRef.current = false;
      setIntroPlaying(true);
    }
    if (!playIntro && introPlaying) {
      t.current = 1;
      setIntroPlaying(false);
    }
  }, [playIntro, introPlaying, setIntroPlaying]);

  // pointer parallax & touch drag
  useEffect(() => {
    const el = gl.domElement;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') {
        if (!drag.current.active) return;
        const dx = (e.clientX - drag.current.x) / window.innerWidth, dy = (e.clientY - drag.current.y) / window.innerHeight;
        frame.cursor.set(THREE.MathUtils.clamp(drag.current.ox - dx * 3, -1, 1), THREE.MathUtils.clamp(drag.current.oy - dy * 3, -1, 1));
        return;
      }
      frame.cursor.set((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
    };
    const onDown = (e: PointerEvent) => { if (e.pointerType === 'touch') drag.current = { active: true, x: e.clientX, y: e.clientY, ox: frame.cursor.x, oy: frame.cursor.y }; };
    const onUp = () => { drag.current.active = false; };
    window.addEventListener('pointermove', onMove, { passive: true });
    el.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('pointerup', onUp, { passive: true });
    return () => { window.removeEventListener('pointermove', onMove); el.removeEventListener('pointerdown', onDown); window.removeEventListener('pointerup', onUp); };
  }, [gl]);

  useFrame((_, dt) => {
    const calm = frame.calm;
    const intro = introPlaying && t.current < 1;
    if (intro) {
      t.current = freeze.current !== null ? freeze.current : Math.min(1, t.current + dt / (calm ? 1.2 : INTRO_SECONDS));
      const e = t.current < 0.5 ? 2 * t.current * t.current : 1 - Math.pow(-2 * t.current + 2, 2) / 2;
      const ease = 0.15 * e + 0.85 * t.current; // mostly linear, soft ends
      curve.getPointAt(Math.min(0.9999, ease), pos.current);
      const ahead = Math.min(1, ease + 0.08);
      curve.getPointAt(ahead, look.current);
      look.current.y += 0.6;
      // blend toward the vista in the last stretch
      const blend = THREE.MathUtils.smoothstep(t.current, 0.78, 1);
      look.current.lerp(new THREE.Vector3(...REST.look), blend);
      curPos.current.copy(pos.current);
      curLook.current.copy(look.current);
      frame.introT = t.current;
      if (t.current >= 1 && !endedRef.current) { endedRef.current = true; setIntroPlaying(false); onIntroEnd(); }
    } else {
      const stop = tour ? TOUR_STOPS[tour] : null;
      const targetPos = stop ? stop.pos : REST.pos;
      const targetLook = stop ? stop.look : REST.look;
      const k = calm ? 1 : 1 - Math.exp(-dt * 1.6);
      curPos.current.lerp(new THREE.Vector3(...targetPos), k);
      curLook.current.lerp(new THREE.Vector3(...targetLook), k);
      frame.introT = 1;
    }
    // apply with pointer parallax
    const par = calm ? 0.25 : 1;
    camera.position.copy(curPos.current);
    camera.position.x += frame.cursor.x * 0.25 * par;
    camera.position.y += -frame.cursor.y * 0.12 * par;
    const l = look.current.copy(curLook.current);
    const dir = l.clone().sub(camera.position);
    const len = dir.length();
    l.x += frame.cursor.x * 0.08 * len * par;
    l.y += -frame.cursor.y * 0.05 * len * par;
    camera.lookAt(l);
    frame.cameraPos.copy(camera.position);
  });
  return null;
}
