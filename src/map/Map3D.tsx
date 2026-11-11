import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { Province, Borders, SelectedOutline, Ocean, ContextLand, LandmarkMarkers, CocoInset, Atmosphere, SkyDome, Clouds, Rain, SeaLines, useParkOverlay, type ProvinceLines } from './mapParts';
import { MapOverlay } from './mapLabels';
import { Projector, RegistryContext, type AnchorRegistry } from './overlay';
import { CameraRig } from './CameraRig';
import { installSurface, loadDenseMesh, loadParks, type MapData, type MeshProvince, type ParkArea } from './geo';
import { drapeLines, type SurfaceIndex } from './terrain';
import { useMap, type ProvinceId } from '../state/map';
import { useTier } from '../perf/tier';
import { useSettings, useCalmMotion } from '../state/settings';
import { useT } from '../i18n';
import type { Landmark } from '../content/types';

const SKY = '#d5e4f0';

/** The wash of the protected areas lives in a texture every land material reads; it needs the Canvas's context. */
function ParkWash({ parks, show, lite }: { parks: ParkArea[] | null; show: boolean; lite: boolean }) {
  useParkOverlay(parks, show, lite);
  return null;
}

export function Map3D({ data, landmarks, stageRef }: { data: MapData; landmarks: Landmark[]; stageRef: React.RefObject<HTMLDivElement | null> }) {
  const tier = useTier((s) => s.tier);
  const dpr = useTier((s) => s.dpr);
  const lite = tier !== 'full';
  const calm = useCalmMotion();
  const paused = useSettings((s) => s.paused);
  const layers = useMap((s) => s.layers);
  const style = useMap((s) => s.style);
  const weather = useMap((s) => s.weather);
  const { lang } = useT();
  const registry = useMemo<AnchorRegistry>(() => new Map(), []);

  // the dense mesh on a capable device; until it arrives (and on the lite tier) the lighter one is drawn
  const [dense, setDense] = useState<{ provinces: MeshProvince[]; surface: SurfaceIndex } | null>(null);
  const wantDense = useRef(!lite);
  useEffect(() => {
    if (!wantDense.current) return;
    let alive = true;
    loadDenseMesh().then((d) => { if (alive) { installSurface(d.surface); setDense(d); } }).catch(() => undefined);
    return () => { alive = false; installSurface(data.surface); };
  }, [data]);
  const provinces = dense?.provinces ?? data.provinces;
  const surface = dense?.surface ?? data.surface;

  const [parks, setParks] = useState<ParkArea[] | null>(null);
  useEffect(() => {
    if (!layers.areas || parks) return;
    let alive = true;
    loadParks().then((p) => alive && setParks(p)).catch(() => undefined);
    return () => { alive = false; };
  }, [layers.areas, parks]);

  // rivers and park outlines, draped on the drawn mesh and sorted by the province they cross
  const lines = useMemo(() => {
    const rivers = drapeLines(surface, data.water.rivers.filter((r) => r.r === 1).map((r) => r.p), { lift: 0.16 });
    const streams = drapeLines(surface, data.water.rivers.filter((r) => r.r === 2).map((r) => r.p), { lift: 0.14 });
    const lakes = drapeLines(surface, data.water.lakes.map((l) => l.p), { lift: 0.16 });
    const outlines = parks ? drapeLines(surface, parks.flatMap((p) => p.rings), { lift: 0.2, step: 1 }) : null;
    const by = new Map<ProvinceId, ProvinceLines>();
    for (const id of surface.ids) by.set(id, { rivers: [...(rivers.byProvince.get(id) ?? []), ...(lakes.byProvince.get(id) ?? [])], streams: streams.byProvince.get(id), parks: outlines?.byProvince.get(id) });
    return { by, seaRivers: [...rivers.sea, ...streams.sea], seaParks: outlines?.sea };
  }, [surface, data, parks]);

  return (
    <div className="map3d">
      <Canvas
        dpr={[1, lite ? 1.25 : Math.min(2, dpr)]}
        shadows={!lite}
        frameloop={paused ? 'demand' : 'always'}
        camera={{ fov: 40, near: 2, far: 6000, position: [0, 300, 400] }}
        gl={{ antialias: true, powerPreference: 'high-performance', alpha: false }}
        onCreated={({ gl, scene }) => {
          gl.setClearColor(new THREE.Color(SKY));
          scene.fog = new THREE.Fog(SKY, 950, 3000);
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.08;
        }}
        onPointerMissed={() => { useMap.getState().setLandmark(null); }}
      >
        <Atmosphere lite={lite} />
        <SkyDome />
        <Ocean lite={lite} />
        <ContextLand style={style} lite={lite} relief={layers.relief} />
        {provinces.map((p) => (
          <Province key={p.id} province={p} relief={layers.relief} lite={lite} lang={lang} style={style} lines={lines.by.get(p.id)} showRivers={layers.rivers} showAreas={layers.areas} />
        ))}
        <SeaLines rivers={lines.seaRivers} parks={lines.seaParks} showRivers={layers.rivers} showAreas={layers.areas} />
        <ParkWash parks={parks} show={layers.areas} lite={lite} />
        <Borders data={data} show={layers.borders} surface={surface} relief={layers.relief} light={style !== 'terrain'} />
        <SelectedOutline data={data} provinces={provinces} relief={layers.relief} />
        {layers.markers && <LandmarkMarkers landmarks={landmarks} surfaceKey={surface} />}
        <CocoInset data={data} />
        {!lite && weather !== 'clear' && <Clouds data={data} weather={weather} still={calm} />}
        {!lite && !calm && weather === 'rain' && <Rain />}
        <CameraRig data={data} calm={calm} stageRef={stageRef} />
        <Projector registry={registry} />
      </Canvas>
      <div className="map-overlay" aria-hidden="true">
        <RegistryContext.Provider value={registry}>
          <MapOverlay data={data} landmarks={landmarks} lang={lang} surfaceKey={surface} />
        </RegistryContext.Provider>
      </div>
    </div>
  );
}
