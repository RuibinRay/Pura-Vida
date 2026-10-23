// Chapter 3: the relief map rises out of the valley mist. The camera is a pure function of the journey time
// (no orbit controls here — the wheel scrolls the page), provinces highlight on hover and open on click after a
// short dive. The province list in the chapter copy is the keyboard twin of the same state.
import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Province, Borders, SelectedOutline, NeighborPlates, MapLights } from '../map/mapParts';
import { Anchor, Projector, RegistryContext, type AnchorRegistry } from '../map/overlay';
import { project, surfaceY } from '../map/relief.js';
import { PROVINCE_COLORS, type MapData } from '../map/geo';
import { useMap, type ProvinceId } from '../state/map';
import { useTier, makeFpsWatchdog } from '../perf/tier';
import { pickLang, useT } from '../i18n';
import { journey, onJourney, seg, easeInOut } from './driver';

const SKY = '#0d1f1a';
const TARGET = new THREE.Vector3(-12, 0, -22);

/** A still, dark sea: the page behind the map is dark, so the explore page's lively ocean would read as noise here. */
function DarkSea() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]} receiveShadow>
      <planeGeometry args={[3200, 3200]} />
      <meshStandardMaterial color="#0f3a53" roughness={0.75} metalness={0} />
    </mesh>
  );
}
const sph = new THREE.Spherical();
const tmp = new THREE.Vector3();

/** Camera and map-group placement from the journey time; the dive toward a clicked province is layered on top. */
function ScrollCamera({ group, dive }: { group: React.RefObject<THREE.Group | null>; dive: React.MutableRefObject<{ id: ProvinceId; t0: number } | null> }) {
  const { camera, invalidate, size } = useThree();
  const data = useMapDataCtx();
  const demote = useTier((s) => s.demote);
  const watchdog = useRef(makeFpsWatchdog(() => demote('low fps')));
  useEffect(() => onJourney(() => invalidate()), [invalidate]);
  useFrame((st) => {
    const t = journey.t;
    // only judge the frame rate while the map is the thing on stage (continuous frames)
    if (t > 2.3 && t < 3.0) watchdog.current();
    const u = easeInOut(seg(t, 2.0, 2.6));          // the rise
    const leave = easeInOut(seg(t, 3.0, 3.25));      // handing over to chapter 4
    const calm = journey.calm;
    const aspect = size.width / Math.max(1, size.height);
    const portrait = aspect < 1.25;
    const fit = portrait ? Math.min(1.9, 1.25 / Math.max(0.5, aspect)) : 1; // portrait: back off so the country fits the narrow frame
    const polar = THREE.MathUtils.lerp(1.42, portrait ? 0.8 : 0.95, u) + leave * 0.12;
    const distance = (THREE.MathUtils.lerp(900, 600, u) + leave * 180) * fit;
    const azimuth = THREE.MathUtils.lerp(-0.62, -0.32, u) + (calm ? 0 : Math.sin(st.clock.elapsedTime * 0.08) * 0.012) + (calm ? 0 : journey.px * -0.04);
    const target = tmp.copy(TARGET);
    // desktop: the chapter copy sits on the right, so the country sits left of centre; portrait: the copy sits below, so the country sits high
    target.x += portrait ? 0 : 70;
    target.z += portrait ? 150 : 0;
    target.y = THREE.MathUtils.lerp(-70, 0, u);
    if (st.scene.fog && st.scene.fog instanceof THREE.Fog) { st.scene.fog.near = distance + 400; st.scene.fog.far = distance + 1700; }
    if (group.current) group.current.position.y = THREE.MathUtils.lerp(-110, 0, u);
    let pos = new THREE.Vector3().setFromSpherical(sph.set(distance, polar, azimuth)).add(target);
    const d = dive.current;
    if (d && data) {
      const p = data.provinces.find((q) => q.id === d.id);
      if (p) {
        const k = easeInOut(Math.min(1, (st.clock.elapsedTime - d.t0) / 0.75));
        const [x0, z0, x1, z1] = p.bbox;
        const c = new THREE.Vector3((x0 + x1) / 2, 2, (z0 + z1) / 2);
        const near = new THREE.Vector3().setFromSpherical(sph.set(Math.max(90, Math.max(x1 - x0, z1 - z0) * 1.3), 0.8, azimuth)).add(c);
        pos = pos.lerp(near, k);
        target.lerp(c, k);
      }
    }
    camera.position.copy(pos);
    camera.lookAt(target);
    if (u > 0 && u < 1) invalidate();
    if (d) invalidate();
  });
  return null;
}

import { createContext, useContext } from 'react';
const MapDataCtx = createContext<MapData | null>(null);
const useMapDataCtx = () => useContext(MapDataCtx);

export function HomeMap({ data, onOpen }: { data: MapData; onOpen: (id: ProvinceId) => void }) {
  const tier = useTier((s) => s.tier);
  const dpr = useTier((s) => s.dpr);
  const lite = tier !== 'full';
  const { lang } = useT();
  const registry = useMemo<AnchorRegistry>(() => new Map(), []);
  const group = useRef<THREE.Group>(null);
  const dive = useRef<{ id: ProvinceId; t0: number } | null>(null);
  const [active, setActive] = useState(false);
  const hovered = useMap((s) => s.hovered);
  const selected = useMap((s) => s.selected);

  // only render continuously while the chapter is on stage
  useEffect(() => {
    const check = () => { const a = journey.t > 1.75 && journey.t < 3.4; setActive((prev) => (prev === a ? prev : a)); };
    check();
    return onJourney(check);
  }, []);

  // a click (selection) → dive, then open the chapter
  useEffect(() => {
    if (!selected) return;
    const id = selected;
    dive.current = { id, t0: performance.now() / 1000 };
    const timer = window.setTimeout(() => { onOpen(id); }, journey.calm ? 60 : 720);
    return () => window.clearTimeout(timer);
  }, [selected, onOpen]);
  useEffect(() => () => { useMap.getState().select(null, false); useMap.getState().hover(null); document.body.style.cursor = ''; }, []);

  return (
    <MapDataCtx.Provider value={data}>
      <div className={'home-map' + (active ? ' is-active' : '')}>
        <Canvas
          dpr={[1, lite ? 1.25 : Math.min(2, dpr)]}
          shadows={!lite}
          frameloop={active ? 'always' : 'demand'}
          camera={{ fov: 38, near: 2, far: 6000, position: [0, 300, 500] }}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          onCreated={({ gl, scene }) => {
            gl.setClearColor(0x000000, 0);
            scene.fog = new THREE.Fog(SKY, 900, 2300);
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 1.0;
          }}
        >
          <MapLights lite={lite} sun={[260, 420, 140]} />
          <group ref={group}>
            <DarkSea />
            <NeighborPlates data={data} color="#5e5a4c" water="#1a5f7e" />
            {data.provinces.map((p) => (
              <Province key={p.id} province={p} relief lite={lite} lang={lang} />
            ))}
            <Borders data={data} show />
            <SelectedOutline data={data} />
          </group>
          <ScrollCamera group={group} dive={dive} />
          <Projector registry={registry} />
        </Canvas>
        <div className="map-overlay home-map__labels" aria-hidden="true">
          <RegistryContext.Provider value={registry}>
            {data.provinces.map((p) => {
              const [x, z] = project(p.centroid[0], p.centroid[1]);
              const y = surfaceY(p.centroid[0], p.centroid[1]) + 4;
              const isActive = hovered === p.id || selected === p.id;
              return (
                <Anchor key={p.id} id={'home-prov-' + p.id} position={[x, y, z]}>
                  <span className={'map-label map-label--province' + (isActive ? ' is-active' : '')} style={{ ['--swatch' as string]: PROVINCE_COLORS[p.id] }}>{pickLang(p.name, lang)}</span>
                </Anchor>
              );
            })}
          </RegistryContext.Provider>
        </div>
      </div>
    </MapDataCtx.Provider>
  );
}
