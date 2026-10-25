// Building blocks of the 3D relief map. Each is a small, pure-ish R3F component.
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import { PLINTH, PLINTH_DEPTH, project, surfaceY, elevationToY, reliefKmAtXZ } from './relief.js';
import { PROVINCE_COLORS, type MapData, type MeshPart, type MeshProvince } from './geo';
import { useMap, type ProvinceId } from '../state/map';
import { useZoomLevel } from './camera';
import type { Landmark } from '../content/types';
import { COCO_INSET, MARKER_COLORS, displayLonLat, isCocoPlace, showAtLevel, type KindFilter } from './explore';
import { pickLang, type Lang } from '../i18n';

const tmpColor = new THREE.Color();
const HIGHLAND = new THREE.Color('#8f7a52');
const STONE_DARK = new THREE.Color('#3b3630');

function partGeometry(part: MeshPart, baseHex: string, relief: boolean) {
  const g = new THREE.BufferGeometry();
  const pos = new Float32Array(part.positions);
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setIndex(part.indices);
  g.computeVertexNormals();
  const base = new THREE.Color(baseHex);
  const colors = new Float32Array(pos.length);
  for (let i = 0; i < pos.length; i += 3) {
    const y = pos[i + 1];
    const t = relief ? THREE.MathUtils.clamp((y - PLINTH) / 14, 0, 1) : 0;
    tmpColor.copy(base).lerp(HIGHLAND, t * 0.75);
    colors[i] = tmpColor.r; colors[i + 1] = tmpColor.g; colors[i + 2] = tmpColor.b;
  }
  g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  return g;
}

function wallGeometry(part: MeshPart, baseHex: string) {
  const n = part.ringCount;
  const P = part.positions;
  const pos = new Float32Array(n * 2 * 3);
  const col = new Float32Array(n * 2 * 3);
  const top = new THREE.Color(baseHex).multiplyScalar(0.72);
  for (let i = 0; i < n; i++) {
    const x = P[i * 3], y = P[i * 3 + 1], z = P[i * 3 + 2];
    pos.set([x, y, z], i * 6);
    pos.set([x, -PLINTH_DEPTH, z], i * 6 + 3);
    col.set([top.r, top.g, top.b], i * 6);
    col.set([STONE_DARK.r, STONE_DARK.g, STONE_DARK.b], i * 6 + 3);
  }
  const idx: number[] = [];
  for (let i = 0; i < n; i++) {
    const a = i * 2, b = i * 2 + 1, c = ((i + 1) % n) * 2, d = ((i + 1) % n) * 2 + 1;
    idx.push(a, c, b, b, c, d);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

export function Province({ province, relief, lite, lang }: { province: MeshProvince; relief: boolean; lite: boolean; lang: Lang }) {
  const group = useRef<THREE.Group>(null);
  const mats = useRef<THREE.MeshStandardMaterial[]>([]);
  const hovered = useMap((s) => s.hovered === province.id);
  const selected = useMap((s) => s.selected === province.id);
  const anySelected = useMap((s) => s.selected !== null);
  const hover = useMap((s) => s.hover);
  const select = useMap((s) => s.select);
  const base = PROVINCE_COLORS[province.id];

  const parts = useMemo(() => province.parts.filter((p) => !p.coco).map((p) => ({ top: partGeometry(p, base, relief), wall: wallGeometry(p, base) })), [province, base, relief]);
  useEffect(() => () => parts.forEach((p) => { p.top.dispose(); p.wall.dispose(); }), [parts]);

  const lift = useRef(0);
  useFrame((_, dt) => {
    const targetLift = selected ? 1.6 : hovered ? 0.5 : 0;
    lift.current = THREE.MathUtils.damp(lift.current, targetLift, 6, dt);
    if (group.current) group.current.position.y = lift.current;
    const emissive = selected ? 0.22 : hovered ? 0.16 : 0;
    const dim = anySelected && !selected && !hovered ? 0.82 : 1;
    for (const m of mats.current) {
      m.emissiveIntensity = THREE.MathUtils.damp(m.emissiveIntensity, emissive, 8, dt);
      m.color.setScalar(THREE.MathUtils.damp(m.color.r, dim, 6, dt));
    }
  });

  const onOver = (e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); hover(province.id); document.body.style.cursor = 'pointer'; };
  const onOut = () => { hover(null); document.body.style.cursor = ''; };
  const onClick = (e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); select(province.id); };
  const name = pickLang(province.name, lang);

  return (
    <group ref={group} name={'province-' + province.id} userData={{ name }}>
      {parts.map((p, i) => (
        <group key={i}>
          <mesh geometry={p.top} onPointerOver={onOver} onPointerOut={onOut} onClick={onClick} castShadow={!lite} receiveShadow={!lite}>
            <meshStandardMaterial ref={(m) => { if (m) mats.current[i] = m; }} vertexColors flatShading roughness={0.88} metalness={0} emissive={base} emissiveIntensity={0} />
          </mesh>
          <mesh geometry={p.wall} onPointerOver={onOver} onPointerOut={onOut} onClick={onClick}>
            <meshStandardMaterial vertexColors roughness={0.95} metalness={0} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export function Borders({ data, show }: { data: MapData; show: boolean }) {
  const { shared, coast } = useMemo(() => {
    const lift = (pts: [number, number][]) => pts.map(([x, z]) => [x, elevationToY(reliefKmAtXZ(x, z)) + 0.08, z] as [number, number, number]);
    const shared: [number, number, number][] = [];
    const coast: [number, number, number][] = [];
    for (const arc of data.arcs) {
      const pts = lift(arc.points);
      const target = arc.shared ? shared : coast;
      for (let i = 0; i < pts.length - 1; i++) target.push(pts[i], pts[i + 1]);
    }
    return { shared, coast };
  }, [data]);
  if (!show) return null;
  return (
    <group>
      <Line points={shared} segments color="#2a2420" lineWidth={1.4} transparent opacity={0.8} />
      <Line points={coast} segments color="#3d3a33" lineWidth={0.8} transparent opacity={0.45} />
    </group>
  );
}

export function SelectedOutline({ data }: { data: MapData }) {
  const selected = useMap((s) => s.selected);
  const points = useMemo(() => {
    if (!selected) return [] as [number, number, number][];
    const p = data.provinces.find((q) => q.id === selected);
    if (!p) return [];
    const out: [number, number, number][] = [];
    for (const part of p.parts) {
      if (part.coco) continue;
      const n = part.ringCount, P = part.positions;
      for (let i = 0; i < n; i++) {
        const a = i, b = (i + 1) % n;
        out.push([P[a * 3], P[a * 3 + 1] + 1.7, P[a * 3 + 2]], [P[b * 3], P[b * 3 + 1] + 1.7, P[b * 3 + 2]]);
      }
    }
    return out;
  }, [selected, data]);
  if (!points.length) return null;
  return <Line points={points} segments color="#f0c25a" lineWidth={2.2} />;
}

export function Ocean({ lite, skyHex }: { lite: boolean; skyHex: string }) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uDeep: { value: new THREE.Color('#0f3f66') }, uShallow: { value: new THREE.Color('#2d7fae') }, uSky: { value: new THREE.Color(skyHex) } }), [skyHex]);
  useFrame((st) => { if (mat.current) mat.current.uniforms.uTime.value = st.clock.elapsedTime; });
  if (lite) {
    return (
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[2600, 2600]} />
        <meshStandardMaterial color="#1a5a86" roughness={0.6} />
      </mesh>
    );
  }
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <planeGeometry args={[2600, 2600, 1, 1]} />
      <shaderMaterial
        ref={mat}
        uniforms={uniforms}
        vertexShader={`varying vec3 vWorld; void main(){ vec4 w = modelMatrix * vec4(position,1.0); vWorld = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`}
        fragmentShader={`uniform float uTime; uniform vec3 uDeep; uniform vec3 uShallow; uniform vec3 uSky; varying vec3 vWorld;
          void main(){
            float w = sin(vWorld.x*0.11 + uTime*0.55)*0.5 + sin(vWorld.z*0.085 - uTime*0.4)*0.5;
            float w2 = sin((vWorld.x*0.7+vWorld.z)*0.19 + uTime*0.8);
            float shade = 0.5 + 0.12*w + 0.07*w2;
            vec3 col = mix(uDeep, uShallow, smoothstep(0.3, 0.78, shade));
            float d = length(vWorld.xz)/1300.0;
            col = mix(col, uSky, smoothstep(0.3, 1.0, d));
            gl_FragColor = vec4(col, 1.0);
          }`}
      />
    </mesh>
  );
}

function flatShape(rings: [number, number][][], y: number) {
  // rings are lon/lat; returns a geometry lying on the XZ plane
  const geoms = rings.map((ring) => {
    const pts = ring.map(([lon, lat]) => { const [x, z] = project(lon, lat); return new THREE.Vector2(x, z); });
    const shape = new THREE.Shape(pts);
    const g = new THREE.ShapeGeometry(shape);
    const p = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) p.setXYZ(i, p.getX(i), y, p.getY(i));
    p.needsUpdate = true;
    g.computeVertexNormals();
    return g;
  });
  return geoms;
}

export function NeighborPlates({ data, color = '#d3c9ad', water = '#2d7fae' }: { data: MapData; color?: string; water?: string }) {
  const plates = useMemo(() => data.neighbors.map((n) => ({ id: n.id, geoms: flatShape(n.rings, PLINTH * 0.55) })), [data]);
  const lakes = useMemo(() => data.lakes.map((r) => flatShape([r], PLINTH * 0.55 + 0.06)[0]), [data]);
  const rivers = useMemo(() => data.rivers.map((r) => r.map(([lon, lat]) => { const [x, z] = project(lon, lat); return [x, PLINTH * 0.55 + 0.1, z] as [number, number, number]; })), [data]);
  return (
    <group>
      {plates.map((p) => (
        <group key={p.id}>
          {p.geoms.map((g, i) => (
            <mesh key={i} geometry={g} receiveShadow>
              <meshStandardMaterial color={color} roughness={1} side={THREE.DoubleSide} />
            </mesh>
          ))}
        </group>
      ))}
      {lakes.map((g, i) => (
        <mesh key={'l' + i} geometry={g}>
          <meshStandardMaterial color={water} roughness={0.5} side={THREE.DoubleSide} />
        </mesh>
      ))}
      {rivers.map((pts, i) => (
        <Line key={'r' + i} points={pts} color={water} lineWidth={1} transparent opacity={0.7} />
      ))}
    </group>
  );
}

const KIND_SHAPES: Record<string, { color: string; shape: 'cone' | 'dot' | 'tree' | 'square' | 'drop' | 'shell' }> = {
  volcano: { color: MARKER_COLORS.volcano, shape: 'cone' },
  mountain: { color: MARKER_COLORS.mountain, shape: 'cone' },
  park: { color: MARKER_COLORS.park, shape: 'tree' },
  reserve: { color: MARKER_COLORS.reserve, shape: 'tree' },
  refuge: { color: MARKER_COLORS.refuge, shape: 'tree' },
  wetland: { color: MARKER_COLORS.wetland, shape: 'drop' },
  monument: { color: MARKER_COLORS.monument, shape: 'square' },
  island: { color: MARKER_COLORS.island, shape: 'shell' },
  beach: { color: MARKER_COLORS.beach, shape: 'shell' },
  waterfall: { color: MARKER_COLORS.waterfall, shape: 'drop' },
  river: { color: MARKER_COLORS.river, shape: 'drop' },
  museum: { color: MARKER_COLORS.museum, shape: 'square' },
  building: { color: MARKER_COLORS.building, shape: 'square' },
  capital: { color: MARKER_COLORS.capital, shape: 'dot' },
  'province-capital': { color: MARKER_COLORS['province-capital'], shape: 'dot' },
  city: { color: MARKER_COLORS.city, shape: 'dot' },
  town: { color: MARKER_COLORS.town, shape: 'dot' },
};

export function visibleLandmarks(landmarks: Landmark[], filter: KindFilter, level: 'far' | 'mid' | 'near', active?: string | null) {
  return landmarks.filter((l) => l.id === active || showAtLevel(l, filter, level));
}

export function LandmarkMarkers({ landmarks }: { landmarks: Landmark[] }) {
  const level = useZoomLevel((s) => s.level);
  const active = useMap((s) => s.activeLandmark);
  const setLandmark = useMap((s) => s.setLandmark);
  const select = useMap((s) => s.select);
  const filter = useMap((s) => s.filter);
  const groupRef = useRef<THREE.Group>(null);
  const scaleRef = useRef(1);
  useFrame((st) => {
    const d = st.camera.position.distanceTo((st.controls as unknown as { target?: THREE.Vector3 })?.target ?? new THREE.Vector3());
    const s = THREE.MathUtils.clamp(d / 260, 0.35, 2.2);
    if (Math.abs(s - scaleRef.current) > 0.01 && groupRef.current) {
      scaleRef.current = s;
      groupRef.current.children.forEach((c) => c.scale.setScalar(s));
    }
  });
  const visible = visibleLandmarks(landmarks, filter, level, active);
  return (
    <group ref={groupRef}>
      {visible.map((l) => {
        const [lon, lat] = displayLonLat(l);
        const [x, z] = project(lon, lat);
        const y = surfaceY(lon, lat) + (l.kind === 'volcano' || l.kind === 'mountain' ? 0.4 : 0.2) + (isCocoPlace(l.id) ? 1.8 : 0);
        const spec = KIND_SHAPES[l.kind] || KIND_SHAPES.town;
        const isActive = active === l.id;
        const open = () => { if (l.province) select(l.province, false); setLandmark(isActive ? null : l.id); };
        return (
          <group key={l.id} position={[x, y, z]}>
            <mesh
              onClick={(e) => { e.stopPropagation(); open(); }}
              onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
              onPointerOut={() => { document.body.style.cursor = ''; }}
            >
              {spec.shape === 'cone' && <coneGeometry args={[2.4, 4.6, 5]} />}
              {spec.shape === 'dot' && <sphereGeometry args={[1.5, 12, 10]} />}
              {spec.shape === 'tree' && <sphereGeometry args={[1.9, 10, 8]} />}
              {spec.shape === 'square' && <boxGeometry args={[2.6, 2.6, 2.6]} />}
              {spec.shape === 'drop' && <octahedronGeometry args={[1.9, 0]} />}
              {spec.shape === 'shell' && <cylinderGeometry args={[2.2, 2.2, 0.9, 12]} />}
              <meshStandardMaterial color={spec.color} emissive={spec.color} emissiveIntensity={isActive ? 0.6 : 0.12} roughness={0.6} />
            </mesh>
            {isActive && (
              <mesh position={[0, -0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[3.2, 4.2, 32]} />
                <meshBasicMaterial color="#f0c25a" transparent opacity={0.9} side={THREE.DoubleSide} />
              </mesh>
            )}
            {spec.shape === 'tree' && (
              <mesh position={[0, -1.4, 0]}>
                <cylinderGeometry args={[0.35, 0.35, 2.2, 6]} />
                <meshStandardMaterial color="#5a3d22" />
              </mesh>
            )}
            {spec.shape === 'dot' && (
              <mesh position={[0, -1.2, 0]}>
                <cylinderGeometry args={[0.18, 0.18, 2.4, 6]} />
                <meshStandardMaterial color="#1d2b22" />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
}

export { COCO_INSET };

export function CocoInset({ data }: { data: MapData }) {
  const puntarenas = data.provinces.find((p) => p.id === 'puntarenas');
  const coco = puntarenas?.parts.find((p) => p.coco);
  const { scale: S, cx: CX, cz: CZ, half } = COCO_INSET;
  const geom = useMemo(() => {
    if (!coco) return null;
    const cx = (coco.bbox[0] + coco.bbox[2]) / 2, cz = (coco.bbox[1] + coco.bbox[3]) / 2;
    const pos = new Float32Array(coco.positions.length);
    for (let i = 0; i < coco.positions.length; i += 3) {
      pos[i] = (coco.positions[i] - cx) * S + CX;
      pos[i + 1] = (coco.positions[i + 1] - PLINTH) * 2 + PLINTH + 0.8;
      pos[i + 2] = (coco.positions[i + 2] - cz) * S + CZ;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setIndex(coco.indices);
    g.computeVertexNormals();
    return g;
  }, [coco, S, CX, CZ]);
  if (!geom || !puntarenas) return null;
  const frame: [number, number, number][] = [[CX - half, 0.3, CZ - half], [CX + half, 0.3, CZ - half], [CX + half, 0.3, CZ + half], [CX - half, 0.3, CZ + half], [CX - half, 0.3, CZ - half]];
  return (
    <group>
      <mesh position={[CX, 0.2, CZ]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[half * 2, half * 2]} />
        <meshStandardMaterial color="#0d3657" roughness={0.7} transparent opacity={0.9} />
      </mesh>
      <Line points={frame} color="#f4eedf" lineWidth={1} transparent opacity={0.8} />
      <mesh geometry={geom}>
        <meshStandardMaterial color={PROVINCE_COLORS.puntarenas} flatShading roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

export function MapLights({ lite, sun }: { lite: boolean; sun: [number, number, number] }) {
  return (
    <>
      <hemisphereLight args={['#dfe9f3', '#5b6648', 0.75]} />
      <directionalLight
        position={sun}
        intensity={1.9}
        color="#fff3dc"
        castShadow={!lite}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-260}
        shadow-camera-right={260}
        shadow-camera-top={260}
        shadow-camera-bottom={-260}
        shadow-camera-near={10}
        shadow-camera-far={1400}
        shadow-bias={-0.0006}
      />
      <directionalLight position={[-300, 200, -200]} intensity={0.35} color="#cfe2ff" />
    </>
  );
}

export type { ProvinceId };
