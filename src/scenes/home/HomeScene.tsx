import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CanopyTrees, Palms, Understory, ForestFloor, LightShafts, Motes } from './Forest';
import { Toucan, Sloth, Morphos, Birds } from './Creatures';
import { Ground, Ridges, Volcano, Sea, Sky, DayLights, HillTrees } from './Vista';
import { CameraPath, FrameDriver } from './CameraPath';
import { useTier } from '../../perf/tier';
import { useSettings, useCalmMotion } from '../../state/settings';

function Ready({ onReady }: { onReady: () => void }) {
  const done = useRef(false);
  useFrame(() => { if (!done.current) { done.current = true; onReady(); } });
  return null;
}

export function HomeScene({ playIntro, onIntroEnd, onMorpho, onVolcano, onReady }: { playIntro: boolean; onIntroEnd: () => void; onMorpho: () => void; onVolcano: () => void; onReady: () => void }) {
  const tier = useTier((s) => s.tier);
  const dpr = useTier((s) => s.dpr);
  const lite = tier !== 'full';
  const calm = useCalmMotion();
  const paused = useSettings((s) => s.paused);
  return (
    <Canvas
      dpr={[1, lite ? 1.25 : Math.min(2, dpr)]}
      shadows={!lite}
      frameloop={paused ? 'demand' : 'always'}
      camera={{ fov: 52, near: 0.1, far: 4000, position: [0, 1.9, 2] }}
      gl={{ antialias: !lite, powerPreference: 'high-performance', alpha: false }}
      onCreated={({ gl, scene }) => {
        gl.setClearColor(new THREE.Color('#d2e4f0'));
        scene.fog = new THREE.Fog('#d2e4f0', 60, 900);
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.0;
        gl.shadowMap.type = THREE.PCFSoftShadowMap;
      }}
    >
      <FrameDriver calm={calm} />
      <DayLights />
      <Sky />
      <Sea />
      <Ridges />
      <Ground />
      <HillTrees count={lite ? 90 : 220} />
      <Volcano onActivate={onVolcano} />
      <ForestFloor />
      <CanopyTrees count={lite ? 120 : 230} />
      <Palms count={lite ? 26 : 54} />
      <Understory dense={!lite} />
      {!lite && <LightShafts count={12} />}
      <Motes count={lite ? 120 : 360} />
      <Toucan />
      <Sloth />
      <Morphos count={lite ? 7 : 14} onActivate={onMorpho} />
      <Birds count={lite ? 12 : 26} />
      <CameraPath playIntro={playIntro} onIntroEnd={onIntroEnd} />
      <Ready onReady={onReady} />
    </Canvas>
  );
}
