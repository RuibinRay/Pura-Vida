import { useEffect, useMemo, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { Province, Borders, SelectedOutline, Ocean, NeighborPlates, LandmarkMarkers, CocoInset, MapLights } from './mapParts';
import { MapOverlay } from './mapLabels';
import { Projector, RegistryContext, type AnchorRegistry } from './overlay';
import { CameraRig } from './CameraRig';
import type { MapData } from './geo';
import { useMap } from '../state/map';
import { useTier } from '../perf/tier';
import { useSettings, useCalmMotion } from '../state/settings';
import { useT } from '../i18n';
import type { Landmark } from '../content/types';

const SKY = '#d8e4ee';

export function Map3D({ data, landmarks, stageRef }: { data: MapData; landmarks: Landmark[]; stageRef: React.RefObject<HTMLDivElement | null> }) {
  const tier = useTier((s) => s.tier);
  const dpr = useTier((s) => s.dpr);
  const lite = tier !== 'full';
  const calm = useCalmMotion();
  const paused = useSettings((s) => s.paused);
  const layers = useMap((s) => s.layers);
  const { lang } = useT();
  const registry = useMemo<AnchorRegistry>(() => new Map(), []);
  const hidden = useRef(false);

  useEffect(() => {
    const onVis = () => { hidden.current = document.hidden; };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  return (
    <div className="map3d">
      <Canvas
        dpr={[1, lite ? 1.25 : Math.min(2, dpr)]}
        shadows={!lite}
        frameloop={paused ? 'demand' : 'always'}
        camera={{ fov: 40, near: 2, far: 5000, position: [0, 300, 400] }}
        gl={{ antialias: true, powerPreference: 'high-performance', alpha: false }}
        onCreated={({ gl, scene }) => {
          gl.setClearColor(new THREE.Color(SKY));
          scene.fog = new THREE.Fog(SKY, 900, 2200);
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
        }}
        onPointerMissed={() => { useMap.getState().setLandmark(null); }}
      >
        <MapLights lite={lite} sun={[260, 420, 140]} />
        <Ocean lite={lite} skyHex={SKY} />
        <NeighborPlates data={data} />
        {data.provinces.map((p) => (
          <Province key={p.id} province={p} relief={layers.relief} lite={lite} lang={lang} />
        ))}
        <Borders data={data} show={layers.borders} />
        <SelectedOutline data={data} />
        <LandmarkMarkers landmarks={landmarks} />
        <CocoInset data={data} />
        <CameraRig data={data} calm={calm} stageRef={stageRef} />
        <Projector registry={registry} />
      </Canvas>
      <div className="map-overlay" aria-hidden="true">
        <RegistryContext.Provider value={registry}>
          <MapOverlay data={data} landmarks={landmarks} lang={lang} />
        </RegistryContext.Provider>
      </div>
    </div>
  );
}
