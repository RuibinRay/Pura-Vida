// Building blocks of the 3D map. The land is the measured terrain (see relief.js and terrain.ts): one mesh per
// province, painted with satellite imagery, elevation tints or the province colour, lit through a normal map of the
// real slopes, with its rivers and park outlines draped on it so they rise with the province when it is lifted.
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import { PLINTH, PLINTH_DEPTH, EXTENT, project, surfaceY, reliefKmAtXZ } from './relief.js';
import { PROVINCE_COLORS, type MapData, type MeshPart, type MeshProvince, type ParkArea } from './geo';
import { useMap, type ProvinceId, type MapStyle, type Weather } from '../state/map';
import { useZoomLevel } from './camera';
import type { Landmark } from '../content/types';
import { COCO_INSET, MARKER_COLORS, displayLonLat, isCocoPlace, showAtLevel, type KindFilter } from './explore';
import { pickLang, type Lang } from '../i18n';
import { blankTexture, geoTexture, normalTextureFile, onTextureLoad, styleTextureFile, sunAt, terrainUV, type SunState, type SurfaceIndex } from './terrain';

// ---- the shared atmosphere ----------------------------------------------------------------------------------------
// One set of uniforms for everything that answers the light: the sea, the sky, the clouds. <Atmosphere> writes them
// each frame from the hour and the weather of the map store; without it they stay at a clear mid-morning.
const initial = sunAt(9.5);
export const ATMO = {
  uTime: { value: 0 },
  uSunDir: { value: initial.dir.clone() },
  uSun: { value: initial.sun.clone() },
  uSunColor: { value: initial.light.clone() },
  uZenith: { value: initial.zenith.clone() },
  uHorizon: { value: initial.horizon.clone() },
  uDay: { value: 1 },
  uOvercast: { value: 0 },
};
/** Uniforms every land material shares: the wash of the protected areas. */
const LAND = { uOverlay: { value: blankTexture() as THREE.Texture }, uOverlayAmt: { value: 0 } };
/** How far the selected province is lifted (scene km); markers on it follow. */
export const SELECT_LIFT = 1.6;
const HOVER_LIFT = 0.22;
/** Rainforest seen from orbit is dark; under a tone-mapped sun the imagery needs this much gain to read as it does in print. */
const SAT_GAIN = 1.75;
const FLAT_SCALE = 0.04;

const STONE_TOP = new THREE.Color('#6d5a44');
const STONE_DARK = new THREE.Color('#2b2622');

function landGeometry(part: MeshPart) {
  const g = new THREE.BufferGeometry();
  const pos = new Float32Array(part.positions);
  const uv = new Float32Array((pos.length / 3) * 2);
  for (let i = 0, j = 0; i < pos.length; i += 3, j += 2) { const [u, v] = terrainUV(pos[i], pos[i + 2]); uv[j] = u; uv[j + 1] = v; }
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  g.setIndex(part.indices);
  g.computeVertexNormals();
  return g;
}

function wallGeometry(part: MeshPart) {
  const n = part.ringCount;
  const P = part.positions;
  const pos = new Float32Array(n * 2 * 3);
  const col = new Float32Array(n * 2 * 3);
  for (let i = 0; i < n; i++) {
    const x = P[i * 3], y = P[i * 3 + 1], z = P[i * 3 + 2];
    // the top sits 60 m (scene) under the land's edge: seen from above, a wall can never show through a shared border
    pos.set([x, y - 0.06, z], i * 6);
    pos.set([x, -PLINTH_DEPTH, z], i * 6 + 3);
    col.set([STONE_TOP.r, STONE_TOP.g, STONE_TOP.b], i * 6);
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

interface LandUniforms { uTint: { value: THREE.Color }; uTintAmt: { value: number }; uGlow: { value: number } }

/** The land's material: a standard lit surface with the park wash, the province tint and a hover glow added. */
function landMaterial(tintHex: string): THREE.MeshStandardMaterial {
  const mat = new THREE.MeshStandardMaterial({ roughness: 0.94, metalness: 0, emissive: new THREE.Color('#ffc983'), emissiveIntensity: 0 });
  // the lines draped on the land win the depth test against it
  mat.polygonOffset = true; mat.polygonOffsetFactor = 1; mat.polygonOffsetUnits = 1;
  const u: LandUniforms = { uTint: { value: new THREE.Color(tintHex) }, uTintAmt: { value: 0 }, uGlow: { value: 0 } };
  mat.userData.u = u;
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, u, LAND);
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform sampler2D uOverlay; uniform float uOverlayAmt; uniform vec3 uTint; uniform float uTintAmt; uniform float uGlow;')
      .replace('#include <map_fragment>', `#include <map_fragment>
#ifdef USE_MAP
  vec4 pvOverlay = texture2D(uOverlay, vMapUv);
  diffuseColor.rgb = mix(diffuseColor.rgb, pvOverlay.rgb, pvOverlay.a * uOverlayAmt);
#endif
  float pvLum = dot(diffuseColor.rgb, vec3(0.299, 0.587, 0.114));
  diffuseColor.rgb = mix(diffuseColor.rgb, mix(vec3(pvLum), vec3(1.0), 0.5) * uTint, uTintAmt);`)
      .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n  totalEmissiveRadiance += uTint * uGlow;');
  };
  mat.customProgramCacheKey = () => 'pv-land';
  return mat;
}

export interface ProvinceLines { rivers?: number[]; streams?: number[]; parks?: number[] }

function segGeometry(points: number[] | undefined) {
  if (!points || !points.length) return null;
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(points), 3));
  return g;
}

export function Province({ province, relief, lite, lang, style = 'satellite', lines, showRivers = true, showAreas = false, night = true }: { province: MeshProvince; relief: boolean; lite: boolean; lang: Lang; style?: MapStyle; lines?: ProvinceLines; showRivers?: boolean; showAreas?: boolean; night?: boolean }) {
  const group = useRef<THREE.Group>(null);
  const hovered = useMap((s) => s.hovered === province.id);
  const selected = useMap((s) => s.selected === province.id);
  const anySelected = useMap((s) => s.selected !== null);
  const hover = useMap((s) => s.hover);
  const select = useMap((s) => s.select);
  const level = useZoomLevel((s) => s.level);
  const invalidate = useThree((s) => s.invalidate);
  const base = PROVINCE_COLORS[province.id];

  const parts = useMemo(() => province.parts.filter((p) => !p.coco).map((p) => ({ top: landGeometry(p), wall: wallGeometry(p) })), [province]);
  useEffect(() => () => parts.forEach((p) => { p.top.dispose(); p.wall.dispose(); }), [parts]);
  const mat = useMemo(() => landMaterial(base), [base]);
  useEffect(() => () => mat.dispose(), [mat]);
  useEffect(() => onTextureLoad(() => { mat.needsUpdate = true; invalidate(); }), [mat, invalidate]);

  // the paint: imagery or tints; the province style tints the relief with the province's colour
  useEffect(() => {
    mat.map = geoTexture(styleTextureFile(style, lite), true);
    mat.normalMap = relief ? geoTexture(normalTextureFile(lite), false) : null;
    mat.normalMapType = THREE.ObjectSpaceNormalMap;
    mat.emissiveMap = night ? geoTexture('night-1024.webp', true) : null;
    mat.needsUpdate = true;
    invalidate();
  }, [mat, style, lite, relief, night, invalidate]);

  const riverGeo = useMemo(() => segGeometry(lines?.streams), [lines?.streams]);
  const parkGeo = useMemo(() => segGeometry(lines?.parks), [lines?.parks]);
  useEffect(() => () => { riverGeo?.dispose(); parkGeo?.dispose(); }, [riverGeo, parkGeo]);

  const lift = useRef(0);
  const dim = useRef(1);
  useFrame((_, dt) => {
    const targetLift = selected ? SELECT_LIFT : hovered ? HOVER_LIFT : 0;
    lift.current = THREE.MathUtils.damp(lift.current, targetLift, 6, dt);
    if (group.current) group.current.position.y = lift.current;
    const u = mat.userData.u as LandUniforms;
    const political = style === 'provinces';
    u.uTintAmt.value = THREE.MathUtils.damp(u.uTintAmt.value, political ? (hovered || selected ? 1 : 0.9) : hovered ? 0.3 : selected ? 0.14 : 0, 8, dt);
    u.uGlow.value = THREE.MathUtils.damp(u.uGlow.value, hovered ? 0.07 : selected ? 0.035 : 0, 8, dt);
    dim.current = THREE.MathUtils.damp(dim.current, anySelected && !selected && !hovered ? 0.62 : 1, 6, dt);
    mat.color.setScalar(dim.current * (style === 'satellite' ? SAT_GAIN : 1));
    // the lights of the towns come up as the day goes (NASA's night imagery as the emissive map)
    mat.emissiveIntensity = night ? (1 - ATMO.uDay.value) * 2.4 : 0;
  });

  const onOver = (e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); hover(province.id); document.body.style.cursor = 'pointer'; };
  const onOut = () => { hover(null); document.body.style.cursor = ''; };
  const onClick = (e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); select(province.id); };
  const name = pickLang(province.name, lang);
  const water = style === 'satellite' ? '#74c4ee' : '#2a7fa1';

  return (
    <group ref={group} name={'province-' + province.id} userData={{ name }} scale={[1, relief ? 1 : FLAT_SCALE, 1]}>
      {parts.map((p, i) => (
        <group key={i}>
          <mesh geometry={p.top} material={mat} onPointerOver={onOver} onPointerOut={onOut} onClick={onClick} castShadow={!lite} receiveShadow={!lite} />
          <mesh geometry={p.wall} onPointerOver={onOver} onPointerOut={onOut} onClick={onClick}>
            <meshStandardMaterial vertexColors roughness={0.95} metalness={0} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}
      {showRivers && lines?.rivers && lines.rivers.length > 0 && (
        <Line points={lines.rivers} segments color={water} lineWidth={1.25} transparent opacity={0.8} raycast={() => null} />
      )}
      {showRivers && riverGeo && (
        <lineSegments geometry={riverGeo} visible={level !== 'far'} raycast={() => null}>
          <lineBasicMaterial color={water} transparent opacity={0.5} />
        </lineSegments>
      )}
      {showAreas && parkGeo && (
        <lineSegments geometry={parkGeo} raycast={() => null}>
          <lineBasicMaterial color="#e9ffd0" transparent opacity={0.9} />
        </lineSegments>
      )}
    </group>
  );
}

/** Lines over the sea or beyond the border (marine park limits, the Río San Juan). */
export function SeaLines({ rivers, parks, showRivers, showAreas }: { rivers?: number[]; parks?: number[]; showRivers: boolean; showAreas: boolean }) {
  const riverGeo = useMemo(() => segGeometry(rivers), [rivers]);
  const parkGeo = useMemo(() => segGeometry(parks), [parks]);
  useEffect(() => () => { riverGeo?.dispose(); parkGeo?.dispose(); }, [riverGeo, parkGeo]);
  return (
    <group>
      {showRivers && riverGeo && (<lineSegments geometry={riverGeo}><lineBasicMaterial color="#8fdcff" transparent opacity={0.7} /></lineSegments>)}
      {showAreas && parkGeo && (<lineSegments geometry={parkGeo}><lineBasicMaterial color="#c9f2ff" transparent opacity={0.75} /></lineSegments>)}
    </group>
  );
}

export function Borders({ data, show, surface, relief = true, light = true }: { data: MapData; show: boolean; surface?: SurfaceIndex; relief?: boolean; light?: boolean }) {
  const index = surface ?? data.surface;
  const shared = useMemo(() => {
    const out: number[] = [];
    for (const arc of data.arcs) {
      if (!arc.shared) continue;
      let px = 0, py = 0, pz = 0;
      arc.points.forEach(([x, z], i) => {
        const h = index.sample(x, z);
        const y = (h ? h.y : PLINTH) + 0.3;
        if (i > 0) out.push(px, py, pz, x, y, z);
        px = x; py = y; pz = z;
      });
    }
    return out;
  }, [data, index]);
  if (!show || !shared.length) return null;
  return (
    <group scale={[1, relief ? 1 : FLAT_SCALE, 1]}>
      <Line points={shared} segments color={light ? '#fff4d6' : '#2a2420'} lineWidth={1.5} transparent opacity={light ? 0.9 : 0.8} />
    </group>
  );
}

export function SelectedOutline({ data, provinces, relief = true }: { data: MapData; provinces?: MeshProvince[]; relief?: boolean }) {
  const selected = useMap((s) => s.selected);
  const list = provinces ?? data.provinces;
  const points = useMemo(() => {
    if (!selected) return [] as number[];
    const p = list.find((q) => q.id === selected);
    if (!p) return [];
    const out: number[] = [];
    for (const part of p.parts) {
      if (part.coco) continue;
      const n = part.ringCount, P = part.positions;
      for (let i = 0; i < n; i++) {
        const a = i, b = (i + 1) % n;
        out.push(P[a * 3], P[a * 3 + 1] + SELECT_LIFT + 0.12, P[a * 3 + 2], P[b * 3], P[b * 3 + 1] + SELECT_LIFT + 0.12, P[b * 3 + 2]);
      }
    }
    return out;
  }, [selected, list]);
  if (!points.length) return null;
  return (
    <group scale={[1, relief ? 1 : FLAT_SCALE, 1]} position={[0, relief ? 0 : SELECT_LIFT, 0]}>
      <Line points={points} segments color="#f0c25a" lineWidth={2.4} />
    </group>
  );
}

/** A ShaderMaterial that keeps the uniform objects it is given (R3F would copy a `uniforms` prop, cutting the link to ATMO). */
function useShader(uniforms: Record<string, THREE.IUniform>, vertexShader: string, fragmentShader: string, opts: THREE.ShaderMaterialParameters = {}) {
  const mat = useMemo(() => new THREE.ShaderMaterial({ uniforms, vertexShader, fragmentShader, ...opts }), [uniforms]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => mat.dispose(), [mat]);
  return mat;
}

const SHADER_TAIL = '\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n';

const OCEAN_VS = `varying vec3 vWorld; void main(){ vec4 w = modelMatrix * vec4(position,1.0); vWorld = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`;
const OCEAN_FS = `uniform float uTime; uniform sampler2D uBathy; uniform vec3 uExtent; uniform vec3 uSunDir; uniform vec3 uSunColor; uniform vec3 uHorizon; uniform float uDay; uniform float uWaves; uniform float uOvercast;
          varying vec3 vWorld;
          void main(){
            vec2 uv = vec2((vWorld.x - uExtent.x) / uExtent.z, 1.0 - (vWorld.z - uExtent.y) / uExtent.z);
            vec2 e = smoothstep(vec2(0.0), vec2(0.14), uv) * smoothstep(vec2(0.0), vec2(0.14), 1.0 - uv);
            float v = texture2D(uBathy, clamp(uv, 0.0, 1.0)).r;
            float depth = mix(3000.0, v * v * 4000.0, e.x * e.y);
            vec3 col = mix(vec3(0.12, 0.52, 0.56), vec3(0.045, 0.27, 0.46), smoothstep(0.0, 70.0, depth));
            col = mix(col, vec3(0.018, 0.115, 0.27), smoothstep(50.0, 1100.0, depth));
            col = mix(col, vec3(0.008, 0.055, 0.16), smoothstep(1100.0, 3800.0, depth));
            vec3 view = normalize(cameraPosition - vWorld);
            float dist = length(cameraPosition - vWorld);
            // ripples only where the camera is close enough to resolve them (farther off they would alias into a grid)
            float amp = uWaves * (1.0 - smoothstep(45.0, 190.0, dist));
            vec2 p = vWorld.xz;
            vec2 g = vec2(0.0);
            g += vec2(0.83, 0.56) * cos(dot(p, vec2(0.83, 0.56)) * 0.61 + uTime * 0.9) * 0.040;
            g += vec2(-0.37, 0.93) * cos(dot(p, vec2(-0.37, 0.93)) * 0.97 - uTime * 1.2) * 0.030;
            g += vec2(0.98, -0.21) * cos(dot(p, vec2(0.98, -0.21)) * 1.43 + uTime * 1.5) * 0.022;
            g += vec2(0.29, 0.96) * cos(dot(p, vec2(0.29, 0.96)) * 2.31 - uTime * 2.0) * 0.014;
            vec3 n = normalize(vec3(g.x * amp, 1.0, g.y * amp));
            float lit = mix(0.14, 1.0, uDay) * (0.72 + 0.28 * max(dot(n, uSunDir), 0.0)) * (1.0 - 0.3 * uOvercast);
            float spec = pow(max(dot(n, normalize(uSunDir + view)), 0.0), 120.0) * uDay * (1.0 - uOvercast);
            float fres = pow(1.0 - max(dot(n, view), 0.0), 4.0);
            col = col * lit + uHorizon * fres * 0.4 * mix(0.25, 1.0, uDay) + uSunColor * spec * 0.9;
            col = mix(col, uHorizon, smoothstep(650.0, 2600.0, dist));
            gl_FragColor = vec4(col, 1.0);${SHADER_TAIL}
          }`;
const SKY_VS = `varying vec3 vDir; void main(){ vDir = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const SKY_FS = `uniform vec3 uZenith; uniform vec3 uHorizon; uniform vec3 uSun; uniform vec3 uSunColor; uniform float uDay; uniform float uOvercast; varying vec3 vDir;
          void main(){
            vec3 d = normalize(vDir);
            vec3 col = mix(uHorizon, uZenith, pow(clamp(d.y, 0.0, 1.0), 0.42));
            col = mix(col, uHorizon * 0.7, smoothstep(0.0, -0.35, d.y));
            float s = max(dot(d, normalize(uSun)), 0.0);
            float up = smoothstep(-0.08, 0.02, uSun.y) * (1.0 - uOvercast);
            col += uSunColor * (pow(s, 900.0) * 6.0 + pow(s, 24.0) * 0.35 + pow(s, 4.0) * 0.08) * up;
            vec3 g = floor(d * 260.0);
            float h = fract(sin(dot(g, vec3(12.9898, 78.233, 37.719))) * 43758.5453);
            col += vec3(step(0.9972, h) * (0.5 + 0.5 * fract(h * 91.7))) * (1.0 - uDay) * (1.0 - uOvercast) * smoothstep(0.03, 0.3, d.y);
            gl_FragColor = vec4(col, 1.0);${SHADER_TAIL}
          }`;
const CLOUDS_VS = `attribute vec3 aPos; attribute float aSize; attribute float aSeed; uniform float uTime; uniform float uDrift; uniform vec4 uBox; varying vec2 vUv; varying float vFade; varying float vSeed;
          void main(){
            vec3 c = aPos;
            c.xz += vec2(-1.0, 0.38) * uTime * uDrift * (0.55 + 0.5 * aSeed);
            c.x = uBox.x + mod(c.x - uBox.x, uBox.z);
            c.z = uBox.y + mod(c.z - uBox.y, uBox.w);
            // dissolve at the edges of the wrap, so a cloud never pops
            vec2 e = min((c.xz - uBox.xy) / 30.0, (uBox.xy + uBox.zw - c.xz) / 30.0);
            vec4 mv = viewMatrix * vec4(c, 1.0);
            mv.xy += position.xy * aSize * vec2(1.25, 0.8);
            // one of the four shapes of the atlas, mirrored for half of them
            float pick = floor(aSeed * 4.0);
            vec2 q = vec2(aSeed > 0.5 ? 1.0 - uv.x : uv.x, uv.y);
            vUv = (q + vec2(mod(pick, 2.0), floor(pick / 2.0))) * 0.5; vSeed = aSeed;
            vFade = clamp(min(e.x, e.y), 0.0, 1.0) * smoothstep(40.0, 130.0, -mv.z);
            gl_Position = projectionMatrix * mv;
          }`;
const CLOUDS_FS = `uniform sampler2D uPuff; uniform vec3 uSunColor; uniform vec3 uZenith; uniform float uDay; uniform float uOvercast; uniform float uOpacity; varying vec2 vUv; varying float vFade; varying float vSeed;
          void main(){
            vec4 t = texture2D(uPuff, vUv);
            float a = t.a * uOpacity * vFade * (0.72 + 0.28 * vSeed);
            if (a < 0.012) discard;
            vec3 lit = mix(vec3(1.0), uSunColor, 0.55) * mix(0.16, 1.0, uDay);
            vec3 shade = mix(uZenith * 0.35 + 0.6, vec3(0.42, 0.44, 0.48), uOvercast) * mix(0.3, 1.0, uDay);
            vec3 col = mix(shade, lit, smoothstep(0.45, 0.95, t.r) * (1.0 - 0.55 * uOvercast));
            gl_FragColor = vec4(col, a);${SHADER_TAIL}
          }`;
const RAIN_VS = `attribute float aEnd; uniform float uTime; uniform vec3 uCenter; uniform float uScale; varying float vA;
          void main(){
            vec3 p = position;
            float sp = 46.0 * (0.8 + 0.4 * fract(p.x * 3.17 + p.z * 1.31));
            p.y = mod(p.y - uTime * sp, 70.0);
            vA = smoothstep(0.0, 8.0, p.y) * (1.0 - smoothstep(55.0, 70.0, p.y));
            p.y -= aEnd * 3.4; p.x -= aEnd * 0.9;
            p = p * uScale + vec3(uCenter.x, 0.0, uCenter.z);
            gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0);
          }`;
const RAIN_FS = `uniform float uDay; varying float vA; void main(){ gl_FragColor = vec4(vec3(0.78, 0.86, 0.95) * mix(0.35, 1.0, uDay), 0.3 * vA);${SHADER_TAIL} }`;

/** The sea, coloured by its real depth (the shelf, the slope and the trench of the bathymetry grid), lit by the sun. */
export function Ocean({ lite }: { lite: boolean; skyHex?: string }) {
  const invalidate = useThree((s) => s.invalidate);
  const uniforms = useMemo(() => ({
    ...ATMO,
    uBathy: { value: geoTexture('bathy.png', false) },
    uExtent: { value: new THREE.Vector3(EXTENT.cx - EXTENT.half, EXTENT.cz - EXTENT.half, EXTENT.half * 2) },
    uWaves: { value: lite ? 0 : 1 },
  }), [lite]);
  useEffect(() => onTextureLoad(() => invalidate()), [invalidate]);
  const mat = useShader(uniforms, OCEAN_VS, OCEAN_FS);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} material={mat} raycast={() => null}>
      <planeGeometry args={[6400, 6400, 1, 1]} />
    </mesh>
  );
}

/**
 * The land around Costa Rica — Nicaragua and Panama — as a flat plate in the same paint (the texture's alpha is the
 * land), lit through the same normal map so its mountains read, and held back so the country stands out.
 */
export function ContextLand({ style, lite, relief = true }: { style: MapStyle; lite: boolean; relief?: boolean }) {
  const invalidate = useThree((s) => s.invalidate);
  const mat = useMemo(() => {
    // blended, not alpha-tested: the coast keeps the mask's soft edge and the plate dissolves toward the edges of the square
    const m = new THREE.MeshStandardMaterial({ roughness: 1, metalness: 0, transparent: true, alphaTest: 0.02, color: '#8f8f8f' });
    m.onBeforeCompile = (shader) => {
      shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>', `#include <map_fragment>
#ifdef USE_MAP
  vec2 pvEdge = smoothstep(vec2(0.0), vec2(0.1), vMapUv) * smoothstep(vec2(0.0), vec2(0.1), 1.0 - vMapUv);
  diffuseColor.a *= pvEdge.x * pvEdge.y;
#endif`);
    };
    m.customProgramCacheKey = () => 'pv-context';
    return m;
  }, []);
  useEffect(() => () => mat.dispose(), [mat]);
  useEffect(() => onTextureLoad(() => { mat.needsUpdate = true; invalidate(); }), [mat, invalidate]);
  useEffect(() => {
    mat.map = geoTexture(styleTextureFile(style, lite), true);
    mat.normalMap = relief ? geoTexture(normalTextureFile(lite), false) : null;
    mat.normalMapType = THREE.ObjectSpaceNormalMap;
    // held back against the country: the imagery a little under its own gain, the tints paler still
    mat.color.setScalar(style === 'satellite' ? SAT_GAIN * 0.62 : 0.7);
    mat.needsUpdate = true;
    invalidate();
  }, [mat, style, lite, relief, invalidate]);
  // a quad built in the scene's own axes (not a turned plane): the normal map is in object space, x east, y up, z south
  const geometry = useMemo(() => {
    const x0 = EXTENT.cx - EXTENT.half, x1 = EXTENT.cx + EXTENT.half, z0 = EXTENT.cz - EXTENT.half, z1 = EXTENT.cz + EXTENT.half, y = PLINTH * 0.4;
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array([x0, y, z0, x1, y, z0, x0, y, z1, x1, y, z1]), 3));
    g.setAttribute('normal', new THREE.BufferAttribute(new Float32Array([0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0]), 3));
    g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array([0, 1, 1, 1, 0, 0, 1, 0]), 2));
    g.setIndex([0, 2, 1, 1, 2, 3]);
    return g;
  }, []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return <mesh geometry={geometry} material={mat} receiveShadow={!lite} renderOrder={-1} raycast={() => null} />;
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

/** The neighbours as plain plates (the home map's dark stage); the explore map uses ContextLand. */
export function NeighborPlates({ data, color = '#d3c9ad' }: { data: MapData; color?: string; water?: string }) {
  const plates = useMemo(() => data.neighbors.map((n) => ({ id: n.id, geoms: flatShape(n.rings, PLINTH * 0.55) })), [data]);
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

/** Scene height of a place's marker: on the drawn surface, on the lifted province when it is the selected one. */
export function placeY(lm: Pick<Landmark, 'id' | 'lon' | 'lat' | 'province'>, selected: ProvinceId | null, relief: boolean): number {
  const [lon, lat] = displayLonLat(lm);
  const lift = lm.province && lm.province === selected ? SELECT_LIFT : 0;
  if (!relief) return PLINTH * FLAT_SCALE + lift + (isCocoPlace(lm.id) ? 1.8 : 0);
  return surfaceY(lon, lat) + lift + (isCocoPlace(lm.id) ? 1.8 : 0);
}

export function LandmarkMarkers({ landmarks, surfaceKey }: { landmarks: Landmark[]; surfaceKey?: unknown }) {
  const level = useZoomLevel((s) => s.level);
  const active = useMap((s) => s.activeLandmark);
  const setLandmark = useMap((s) => s.setLandmark);
  const select = useMap((s) => s.select);
  const selected = useMap((s) => s.selected);
  const filter = useMap((s) => s.filter);
  const relief = useMap((s) => s.layers.relief);
  const groupRef = useRef<THREE.Group>(null);
  const scaleRef = useRef(1);
  useFrame((st) => {
    const d = st.camera.position.distanceTo((st.controls as unknown as { target?: THREE.Vector3 })?.target ?? new THREE.Vector3());
    const s = THREE.MathUtils.clamp(d / 260, 0.35, 2.2);
    if (groupRef.current && (Math.abs(s - scaleRef.current) > 0.01 || groupRef.current.userData.n !== groupRef.current.children.length)) {
      scaleRef.current = s;
      groupRef.current.userData.n = groupRef.current.children.length;
      groupRef.current.children.forEach((c) => c.scale.setScalar(s));
    }
  });
  const visible = visibleLandmarks(landmarks, filter, level, active);
  void surfaceKey; // the heights below are read from the installed surface: a new mesh re-renders the markers
  return (
    <group ref={groupRef}>
      {visible.map((l) => {
        const [lon, lat] = displayLonLat(l);
        const [x, z] = project(lon, lat);
        const y = placeY(l, selected, relief) + (l.kind === 'volcano' || l.kind === 'mountain' ? 0.6 : 0.3);
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
              {spec.shape === 'cone' && <coneGeometry args={[1.7, 3.4, 5]} />}
              {spec.shape === 'dot' && <sphereGeometry args={[1.2, 12, 10]} />}
              {spec.shape === 'tree' && <sphereGeometry args={[1.5, 10, 8]} />}
              {spec.shape === 'square' && <boxGeometry args={[2, 2, 2]} />}
              {spec.shape === 'drop' && <octahedronGeometry args={[1.5, 0]} />}
              {spec.shape === 'shell' && <cylinderGeometry args={[1.7, 1.7, 0.8, 12]} />}
              <meshStandardMaterial color={spec.color} emissive={spec.color} emissiveIntensity={isActive ? 0.8 : 0.35} roughness={0.55} />
            </mesh>
            {/* a pale collar so a marker reads against forest and night alike */}
            <mesh position={[0, -0.9, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[isActive ? 2.6 : 1.9, isActive ? 3.4 : 2.3, 28]} />
              <meshBasicMaterial color={isActive ? '#f0c25a' : '#fff6e0'} transparent opacity={isActive ? 0.95 : 0.7} side={THREE.DoubleSide} depthWrite={false} />
            </mesh>
            {(spec.shape === 'tree' || spec.shape === 'dot') && (
              <mesh position={[0, -1.1, 0]}>
                <cylinderGeometry args={[0.2, 0.2, 2, 6]} />
                <meshStandardMaterial color={spec.shape === 'tree' ? '#5a3d22' : '#1d2b22'} />
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
  const frame: [number, number, number][] = [[CX - half, 0.5, CZ - half], [CX + half, 0.5, CZ - half], [CX + half, 0.5, CZ + half], [CX - half, 0.5, CZ + half], [CX - half, 0.5, CZ - half]];
  return (
    <group name="coco-inset">
      <mesh position={[CX, 0.4, CZ]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[half * 2, half * 2]} />
        <meshStandardMaterial color="#0d3657" roughness={0.7} transparent opacity={0.9} />
      </mesh>
      <Line points={frame} color="#f4eedf" lineWidth={1} transparent opacity={0.8} />
      <mesh geometry={geom}>
        <meshStandardMaterial color="#3f7a45" roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

/** Fixed lights (the home map). The explore map is lit by <Atmosphere>. */
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

const WEATHER: Record<Weather, { overcast: number; fogNear: number; fogFar: number }> = {
  clear: { overcast: 0, fogNear: 1100, fogFar: 3400 },
  clouds: { overcast: 0.12, fogNear: 950, fogFar: 3000 },
  rain: { overcast: 0.85, fogNear: 300, fogFar: 1500 },
};

/**
 * The light of the map: the sun of the chosen hour (it rises in the east, passes just south of overhead, sets in the
 * west), the sky and haze that go with it, and the weather's overcast. Changes ease over about a second.
 */
export function Atmosphere({ lite }: { lite: boolean }) {
  const hour = useMap((s) => s.hour);
  const weather = useMap((s) => s.weather);
  const { scene, gl, invalidate } = useThree();
  const sunLight = useRef<THREE.DirectionalLight>(null);
  const hemi = useRef<THREE.HemisphereLight>(null);
  const fill = useRef<THREE.DirectionalLight>(null);
  const shown = useRef({ hour, overcast: WEATHER[weather].overcast, fogNear: WEATHER[weather].fogNear, fogFar: WEATHER[weather].fogFar });
  const state = useMemo<SunState>(() => sunAt(hour), []); // eslint-disable-line react-hooks/exhaustive-deps
  const grey = useMemo(() => new THREE.Color('#8e979f'), []);
  const tmp = useMemo(() => new THREE.Color(), []);
  useEffect(() => { invalidate(); }, [hour, weather, invalidate]);
  useFrame((st, dt) => {
    const s = shown.current, w = WEATHER[weather];
    // the hour eases the short way round the clock
    let dh = hour - s.hour;
    if (dh > 12) dh -= 24; else if (dh < -12) dh += 24;
    const k = 1 - Math.exp(-dt * 3.2);
    s.hour = (s.hour + dh * k + 24) % 24;
    s.overcast += (w.overcast - s.overcast) * k;
    s.fogNear += (w.fogNear - s.fogNear) * k;
    s.fogFar += (w.fogFar - s.fogFar) * k;
    if (Math.abs(dh) > 0.002 || Math.abs(w.overcast - s.overcast) > 0.002) invalidate();
    sunAt(s.hour, state);
    ATMO.uTime.value = st.clock.elapsedTime;
    ATMO.uSunDir.value.copy(state.dir);
    ATMO.uSun.value.copy(state.sun);
    ATMO.uDay.value = state.day;
    ATMO.uOvercast.value = s.overcast;
    ATMO.uSunColor.value.copy(state.light).lerp(grey, s.overcast * 0.7);
    ATMO.uZenith.value.copy(state.zenith).lerp(tmp.copy(grey).multiplyScalar(0.25 + 0.6 * state.day), s.overcast);
    ATMO.uHorizon.value.copy(state.horizon).lerp(tmp.copy(grey).multiplyScalar(0.3 + 0.75 * state.day), s.overcast);
    if (sunLight.current) {
      sunLight.current.position.copy(state.dir).multiplyScalar(520);
      sunLight.current.color.copy(ATMO.uSunColor.value);
      sunLight.current.intensity = state.intensity * (1 - 0.62 * s.overcast);
    }
    if (hemi.current) { hemi.current.intensity = state.ambient * (1 + 0.5 * s.overcast); hemi.current.color.copy(ATMO.uZenith.value).lerp(tmp.set('#ffffff'), 0.55); }
    if (fill.current) fill.current.intensity = 0.3 * state.day;
    if (scene.fog instanceof THREE.Fog) { scene.fog.color.copy(ATMO.uHorizon.value); scene.fog.near = s.fogNear; scene.fog.far = s.fogFar; }
    gl.setClearColor(ATMO.uHorizon.value);
  });
  return (
    <>
      <hemisphereLight ref={hemi} args={['#dfe9f3', '#4f5a44', 0.72]} />
      <directionalLight
        ref={sunLight}
        position={[260, 420, 140]}
        intensity={1.9}
        color="#fff3dc"
        castShadow={!lite}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-270}
        shadow-camera-right={270}
        shadow-camera-top={270}
        shadow-camera-bottom={-270}
        shadow-camera-near={10}
        shadow-camera-far={1400}
        shadow-bias={-0.0012}
        shadow-normalBias={0.6}
      />
      <directionalLight ref={fill} position={[-300, 200, -200]} intensity={0.3} color="#cfe2ff" />
    </>
  );
}

/** The sky: a gradient from the horizon's haze to the zenith, the sun's disc and glow, stars once it is dark. */
export function SkyDome() {
  const mesh = useRef<THREE.Mesh>(null);
  const uniforms = useMemo(() => ({ ...ATMO }), []);
  const mat = useShader(uniforms, SKY_VS, SKY_FS, { side: THREE.BackSide, depthWrite: false, depthTest: false, fog: false });
  useFrame((st) => { if (mesh.current) mesh.current.position.copy(st.camera.position); });
  return (
    <mesh ref={mesh} renderOrder={-10} frustumCulled={false} material={mat} raycast={() => null}>
      <sphereGeometry args={[2400, 32, 20]} />
    </mesh>
  );
}

/** Four cumulus shapes in a 2×2 atlas, built from fractal noise inside a soft dome: lumpy edges, no outline. */
function puffTexture(): THREE.Texture {
  const cell = 128, size = cell * 2;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d')!;
  const img = ctx.createImageData(size, size);
  const hash = (x: number, y: number, s: number) => { const h = Math.sin(x * 127.1 + y * 311.7 + s * 74.7) * 43758.5453; return h - Math.floor(h); };
  const noise = (x: number, y: number, s: number) => {
    const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
    const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
    return (hash(ix, iy, s) * (1 - ux) + hash(ix + 1, iy, s) * ux) * (1 - uy) + (hash(ix, iy + 1, s) * (1 - ux) + hash(ix + 1, iy + 1, s) * ux) * uy;
  };
  for (let v = 0; v < 4; v++) {
    const ox = (v % 2) * cell, oy = Math.floor(v / 2) * cell;
    for (let y = 0; y < cell; y++) for (let x = 0; x < cell; x++) {
      const u = (x + 0.5) / cell - 0.5, w = (y + 0.5) / cell - 0.5;
      const f = noise(x / 22, y / 22, v) * 0.5 + noise(x / 11, y / 11, v + 9) * 0.3 + noise(x / 5.5, y / 5.5, v + 21) * 0.2;
      // a dome that the noise eats into: dense in the middle, ragged at the rim
      const dome = 1 - Math.hypot(u * 2.05, w * 2.6);
      const a = Math.max(0, Math.min(1, (dome + (f - 0.5) * 0.95) * 2.4));
      const light = Math.max(0, Math.min(1, 0.62 + f * 0.5 - w * 0.35));
      const i = ((oy + y) * size + ox + x) * 4;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = Math.round(light * 255);
      img.data[i + 3] = Math.round(a * a * (3 - 2 * a) * 235);
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.NoColorSpace;
  tex.premultiplyAlpha = false;
  return tex;
}

// a small deterministic generator, so the sky is the same on every visit
function mulberry(seed: number) { return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

/**
 * Cumulus over the country. They gather where the land is high — the measured relief decides the odds, as the
 * cordilleras do with the trade winds — drift west-south-west with those winds, and thin out as the camera comes
 * close so they never stand between the visitor and a place.
 */
export function Clouds({ data, weather, still = false }: { data: MapData; weather: Weather; still?: boolean }) {
  const mesh = useRef<THREE.Mesh>(null);
  const count = weather === 'rain' ? 520 : 300;
  const { geometry, uniforms } = useMemo(() => {
    const rnd = mulberry(20261111);
    const [x0, z0, x1, z1] = data.bbox;
    const pad = 70;
    const pos: number[] = [], size: number[] = [], seed: number[] = [];
    let guard = 0;
    while (seed.length < count && guard++ < 20000) {
      const x = x0 - pad + rnd() * (x1 - x0 + pad * 2), z = z0 - pad + rnd() * (z1 - z0 + pad * 2);
      const land = data.surface.sample(x, z) !== null;
      const km = land ? reliefKmAtXZ(x, z) : 0;
      const odds = weather === 'rain' ? (land ? 0.8 : 0.3) : land ? 0.08 + km * 0.45 : 0.02;
      if (rnd() > odds) continue;
      const puffs = 3 + Math.floor(rnd() * 5);
      const y = 9 + km * 2.6 + rnd() * 5;
      for (let k = 0; k < puffs && seed.length < count; k++) {
        pos.push(x + (rnd() - 0.5) * 13, y + (rnd() - 0.5) * 2, z + (rnd() - 0.5) * 10);
        size.push(5 + rnd() * 8);
        seed.push(rnd());
      }
    }
    const g = new THREE.InstancedBufferGeometry();
    const plane = new THREE.PlaneGeometry(1, 1);
    g.index = plane.index;
    g.setAttribute('position', plane.attributes.position);
    g.setAttribute('uv', plane.attributes.uv);
    g.setAttribute('aPos', new THREE.InstancedBufferAttribute(new Float32Array(pos), 3));
    g.setAttribute('aSize', new THREE.InstancedBufferAttribute(new Float32Array(size), 1));
    g.setAttribute('aSeed', new THREE.InstancedBufferAttribute(new Float32Array(seed), 1));
    g.instanceCount = seed.length;
    const u = { ...ATMO, uDrift: { value: 1 }, uPuff: { value: puffTexture() }, uBox: { value: new THREE.Vector4(x0 - pad, z0 - pad, x1 - x0 + pad * 2, z1 - z0 + pad * 2) }, uOpacity: { value: 0 } };
    return { geometry: g, uniforms: u };
  }, [data, count, weather]);
  useEffect(() => () => { geometry.dispose(); uniforms.uPuff.value.dispose(); }, [geometry, uniforms]);
  const mat = useShader(uniforms, CLOUDS_VS, CLOUDS_FS, { transparent: true, depthWrite: false });
  useFrame((st, dt) => {
    const target = (st.controls as unknown as { target?: THREE.Vector3 })?.target;
    const d = target ? st.camera.position.distanceTo(target) : 400;
    // full from the country view, gone by the time a single park fills the frame
    const want = THREE.MathUtils.smoothstep(d, 110, 300) * (weather === 'rain' ? 0.92 : 0.86);
    uniforms.uOpacity.value = THREE.MathUtils.damp(uniforms.uOpacity.value, want, 3, dt);
    uniforms.uDrift.value = still ? 0 : 1; // reduced motion: the clouds stand where they are
  });
  return <mesh ref={mesh} geometry={geometry} material={mat} frustumCulled={false} renderOrder={5} raycast={() => null} />;
}

/** Rain as streaks falling around the point the camera looks at (the "rain" atmosphere; not a forecast). */
export function Rain() {
  const count = 1100;
  const { geometry, uniforms } = useMemo(() => {
    const rnd = mulberry(77);
    const base = new Float32Array(count * 2 * 3), end = new Float32Array(count * 2);
    for (let i = 0; i < count; i++) {
      const a = rnd() * Math.PI * 2, r = Math.sqrt(rnd()) * 150, y = rnd() * 70;
      for (let k = 0; k < 2; k++) { base.set([Math.cos(a) * r, y, Math.sin(a) * r], (i * 2 + k) * 3); end[i * 2 + k] = k; }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(base, 3));
    g.setAttribute('aEnd', new THREE.BufferAttribute(end, 1));
    return { geometry: g, uniforms: { ...ATMO, uCenter: { value: new THREE.Vector3() }, uScale: { value: 1 } } };
  }, []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  const mat = useShader(uniforms, RAIN_VS, RAIN_FS, { transparent: true, depthWrite: false });
  useFrame((st) => {
    const target = (st.controls as unknown as { target?: THREE.Vector3 })?.target;
    if (target) uniforms.uCenter.value.copy(target);
    uniforms.uScale.value = target ? THREE.MathUtils.clamp(st.camera.position.distanceTo(target) / 260, 0.3, 2.2) : 1;
  });
  return <lineSegments geometry={geometry} material={mat} frustumCulled={false} renderOrder={6} raycast={() => null} />;
}

const PARK_FILL: Record<ParkArea['kind'], string> = { park: 'rgba(70, 200, 96, 0.5)', reserve: 'rgba(40, 170, 150, 0.5)', refuge: 'rgba(150, 205, 80, 0.42)', wetland: 'rgba(70, 170, 220, 0.45)', forest: 'rgba(120, 170, 90, 0.3)', monument: 'rgba(200, 120, 210, 0.5)' };

/** Paints the protected areas as a translucent wash into the texture every land material reads. */
export function useParkOverlay(parks: ParkArea[] | null, show: boolean, lite: boolean) {
  const invalidate = useThree((s) => s.invalidate);
  const texture = useMemo(() => {
    if (!parks) return null;
    const size = lite ? 1024 : 2048;
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const ctx = c.getContext('2d')!;
    const k = size / (EXTENT.half * 2);
    // the faint ones first, so a national park inside a forest reserve keeps its own colour
    const order: ParkArea['kind'][] = ['forest', 'refuge', 'wetland', 'reserve', 'monument', 'park'];
    for (const kind of order) {
      ctx.fillStyle = PARK_FILL[kind];
      for (const p of parks) {
        if (p.kind !== kind) continue;
        ctx.beginPath();
        for (const ring of p.rings) {
          for (let i = 0; i < ring.length; i += 2) {
            const [x, z] = project(ring[i] / 1e4, ring[i + 1] / 1e4);
            const px = (x - (EXTENT.cx - EXTENT.half)) * k, py = (z - (EXTENT.cz - EXTENT.half)) * k;
            if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
          }
          ctx.closePath();
        }
        ctx.fill('evenodd');
      }
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
  }, [parks, lite]);
  useEffect(() => {
    LAND.uOverlay.value = texture ?? blankTexture();
    LAND.uOverlayAmt.value = texture && show ? 1 : 0;
    invalidate();
    return () => { LAND.uOverlayAmt.value = 0; };
  }, [texture, show, invalidate]);
  useEffect(() => () => { texture?.dispose(); LAND.uOverlay.value = blankTexture(); }, [texture]);
}

export type { ProvinceId };
