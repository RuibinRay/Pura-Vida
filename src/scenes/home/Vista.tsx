import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { rng } from '../shared/wind';
import { softSprite } from '../shared/textures';
import { frame, useHomeUI } from './sceneState';

const tmpC = new THREE.Color();

function noise2(x: number, z: number) {
  return Math.sin(x * 0.013 + 1.3) * Math.cos(z * 0.011) + 0.5 * Math.sin(x * 0.031 - z * 0.023) + 0.25 * Math.sin(x * 0.07 + z * 0.05 + 2.0);
}

/** Height of the land beyond the clearing (also used to plant the hill trees). */
export function groundHeight(x: number, z: number) {
  let y = 0;
  const drop = THREE.MathUtils.smoothstep(-z, 8, 22); // 0 at the clearing edge, 1 past the drop
  y -= 9 * drop;
  const hills = THREE.MathUtils.smoothstep(-z, 60, 260) * THREE.MathUtils.smoothstep(x, -140, 60); // hills rise on the right
  y += (6 + 14 * noise2(x, z)) * hills + Math.max(0, noise2(x * 1.7, z * 1.7)) * 4 * hills;
  // the land slopes down to the sea toward the left and the far distance
  const sea = Math.max(THREE.MathUtils.smoothstep(-z, 300, 470), THREE.MathUtils.smoothstep(-x, 120, 320) * THREE.MathUtils.smoothstep(-z, 40, 160));
  return THREE.MathUtils.lerp(y, -13, sea);
}

/** The land beyond the clearing: a drop, a valley floor, then rolling hills toward the ridges. */
export function Ground() {
  const geo = useMemo(() => {
    const W = 900, D = 700, nx = 150, nz = 120;
    const g = new THREE.PlaneGeometry(W, D, nx, nz);
    g.rotateX(-Math.PI / 2);
    g.translate(0, 0, -D / 2 - 6); // starts where the forest floor ends
    const p = g.attributes.position as THREE.BufferAttribute;
    const col = new Float32Array(p.count * 3);
    const near = new THREE.Color('#2e5a33'), valley = new THREE.Color('#4a7f3f'), hill = new THREE.Color('#5e8550'), far = new THREE.Color('#6d8c7c');
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), z = p.getZ(i);
      const y = groundHeight(x, z);
      p.setY(i, y);
      const t = THREE.MathUtils.clamp((-z - 10) / 420, 0, 1);
      tmpC.copy(near).lerp(valley, THREE.MathUtils.smoothstep(t, 0, 0.3)).lerp(hill, THREE.MathUtils.smoothstep(t, 0.3, 0.6) * (0.5 + 0.5 * Math.max(0, noise2(x + 7, z - 3)))).lerp(far, THREE.MathUtils.smoothstep(t, 0.6, 1));
      col[i * 3] = tmpC.r; col[i * 3 + 1] = tmpC.g; col[i * 3 + 2] = tmpC.b;
    }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    g.computeVertexNormals();
    return g;
  }, []);
  return (
    <mesh geometry={geo} receiveShadow>
      <meshStandardMaterial vertexColors roughness={1} flatShading />
    </mesh>
  );
}

/** Trees on the near hills: instanced trunks and crowns, planted where the ground rises. */
export function HillTrees({ count }: { count: number }) {
  const trunkRef = useRef<THREE.InstancedMesh>(null);
  const crownRef = useRef<THREE.InstancedMesh>(null);
  const items = useMemo(() => {
    const r = rng(1234);
    const list: { x: number; y: number; z: number; s: number; col: string }[] = [];
    const greens = ['#2f6b3b', '#3b7d47', '#467f3d', '#2a5e34'];
    let tries = 0;
    while (list.length < count && tries++ < count * 30) {
      const x = -60 + r() * 360, z = -70 - r() * 200;
      const y = groundHeight(x, z);
      if (y < -7) continue; // only on the hills, never on the valley floor
      list.push({ x, y, z, s: 1.4 + r() * 1.6, col: greens[Math.floor(r() * greens.length)] });
    }
    return list;
  }, [count]);
  const trunkGeo = useMemo(() => new THREE.CylinderGeometry(0.25, 0.4, 4, 5), []);
  const crownGeo = useMemo(() => new THREE.IcosahedronGeometry(1.6, 1), []);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const c = useMemo(() => new THREE.Color(), []);
  useEffect(() => {
    const t = trunkRef.current, k = crownRef.current;
    if (!t || !k) return;
    items.forEach((it, i) => {
      dummy.position.set(it.x, it.y + 2 * it.s * 0.5, it.z); dummy.scale.set(it.s, it.s, it.s); dummy.rotation.set(0, 0, 0); dummy.updateMatrix(); t.setMatrixAt(i, dummy.matrix);
      dummy.position.set(it.x, it.y + 2.6 * it.s, it.z); dummy.scale.set(it.s * 1.1, it.s * 0.9, it.s * 1.1); dummy.rotation.set(0, i, 0); dummy.updateMatrix(); k.setMatrixAt(i, dummy.matrix); k.setColorAt(i, c.set(it.col));
    });
    t.instanceMatrix.needsUpdate = true; k.instanceMatrix.needsUpdate = true;
    if (k.instanceColor) k.instanceColor.needsUpdate = true;
  }, [items, dummy, c]);
  return (
    <group>
      <instancedMesh ref={trunkRef} args={[trunkGeo, undefined, items.length]} frustumCulled={false}><meshStandardMaterial color="#6b5236" roughness={1} /></instancedMesh>
      <instancedMesh ref={crownRef} args={[crownGeo, undefined, items.length]} frustumCulled={false} castShadow><meshStandardMaterial color="#ffffff" roughness={0.9} flatShading emissive="#163a22" emissiveIntensity={0.3} /></instancedMesh>
    </group>
  );
}

/** Distant ridges as silhouettes with aerial perspective (colour mixes toward the horizon). */
export function Ridges() {
  const specs = useMemo(() => [
    { z: -520, base: 18, amp: 50, color: '#2f5f42', mix: 0.3, seed: 3, x: 420, w: 1500 },
    { z: -700, base: 30, amp: 70, color: '#3b6a6c', mix: 0.52, seed: 7, x: 520, w: 1700 },
    { z: -900, base: 46, amp: 90, color: '#5a7f98', mix: 0.74, seed: 11, x: 600, w: 2000 },
  ], []);
  const mats = useRef<THREE.MeshBasicMaterial[]>([]);
  const geos = useMemo(() => specs.map((s) => {
    const g = new THREE.PlaneGeometry(s.w, 300, 320, 1);
    const p = g.attributes.position as THREE.BufferAttribute;
    const r = rng(s.seed);
    const offs = Array.from({ length: 12 }, () => r() * 10);
    for (let i = 0; i < p.count; i++) {
      if (p.getY(i) > 0) {
        const x = p.getX(i);
        // ridgeline: a few octaves with wavelengths from ~600 m down to ~60 m, fading out toward the left (sea)
        let h = 0;
        const freqs = [0.0105, 0.021, 0.047, 0.1, 0.21];
        freqs.forEach((f, k) => { h += Math.sin(x * f + offs[k]) / (k + 1.4); });
        const fade = THREE.MathUtils.smoothstep(x, -s.w / 2, -s.w / 2 + 500);
        p.setY(i, (s.base + s.amp * (0.55 + 0.45 * h)) * fade - 20 * (1 - fade));
      } else p.setY(i, -60);
    }
    return g;
  }), [specs]);
  useFrame(() => {
    const d = frame.day;
    specs.forEach((s, i) => { const m = mats.current[i]; if (m) m.color.set(s.color).lerp(d.horizon, s.mix).multiplyScalar(0.55 + 0.45 * (1 - d.night)); });
  });
  return (
    <group>
      {specs.map((s, i) => (
        <mesh key={i} geometry={geos[i]} position={[s.x, -12, s.z]}>
          <meshBasicMaterial ref={(m) => { if (m) mats.current[i] = m; }} color={s.color} side={THREE.DoubleSide} fog={false} />
        </mesh>
      ))}
    </group>
  );
}

/** A volcano cone with a crater and a ring of clouds. Clicking it opens the map. */
export function Volcano({ onActivate }: { onActivate: () => void }) {
  const hovered = useHomeUI((s) => s.hovered === 'volcano');
  const setHovered = useHomeUI((s) => s.setHovered);
  const cone = useRef<THREE.Mesh>(null);
  const clouds = useRef<THREE.Group>(null);
  const tex = useMemo(() => softSprite(), []);
  const geo = useMemo(() => {
    const pts = [new THREE.Vector2(0, 0), new THREE.Vector2(110, 0), new THREE.Vector2(84, 18), new THREE.Vector2(60, 40), new THREE.Vector2(40, 64), new THREE.Vector2(24, 90), new THREE.Vector2(13, 112), new THREE.Vector2(9, 118), new THREE.Vector2(0, 114)];
    const g = new THREE.LatheGeometry(pts, 56);
    const p = g.attributes.position as THREE.BufferAttribute;
    const col = new Float32Array(p.count * 3);
    const r = rng(21);
    const low = new THREE.Color('#3b6b45'), mid = new THREE.Color('#66705c'), high = new THREE.Color('#8a857c');
    for (let i = 0; i < p.count; i++) {
      const y = p.getY(i);
      const n = (r() - 0.5) * (y > 2 ? 2.4 : 0);
      p.setX(i, p.getX(i) + n); p.setZ(i, p.getZ(i) + n);
      const t = y / 118;
      tmpC.copy(low).lerp(mid, THREE.MathUtils.smoothstep(t, 0.25, 0.6)).lerp(high, THREE.MathUtils.smoothstep(t, 0.6, 0.95));
      col[i * 3] = tmpC.r; col[i * 3 + 1] = tmpC.g; col[i * 3 + 2] = tmpC.b;
    }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    g.computeVertexNormals();
    return g;
  }, []);
  const puffs = useMemo(() => { const r = rng(33); return Array.from({ length: 11 }, (_, i) => ({ a: (i / 11) * Math.PI * 2, r: 46 + r() * 16, y: 74 + r() * 16, s: 26 + r() * 18, sp: 0.02 + r() * 0.02 })); }, []);
  useFrame((_, dt) => {
    const c = clouds.current; if (c) c.rotation.y += dt * 0.025 * frame.wind;
    const m = cone.current?.material as THREE.MeshStandardMaterial | undefined;
    if (m) m.emissiveIntensity = THREE.MathUtils.damp(m.emissiveIntensity, hovered ? 0.35 : 0, 6, dt);
  });
  const over = (e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); setHovered('volcano'); document.body.style.cursor = 'pointer'; };
  const out = () => { setHovered(null); document.body.style.cursor = ''; };
  return (
    <group position={[240, -13, -560]} scale={[1.1, 1.05, 1.1]}>
      <mesh ref={cone} geometry={geo} onPointerOver={over} onPointerOut={out} onClick={(e) => { e.stopPropagation(); onActivate(); }} castShadow>
        <meshStandardMaterial vertexColors roughness={0.95} flatShading emissive="#f0c25a" emissiveIntensity={0} />
      </mesh>
      <group ref={clouds}>
        {puffs.map((p, i) => (
          <sprite key={i} position={[Math.cos(p.a) * p.r, p.y, Math.sin(p.a) * p.r]} scale={[p.s, p.s * 0.55, 1]}>
            <spriteMaterial map={tex} transparent opacity={0.85} depthWrite={false} color="#ffffff" fog />
          </sprite>
        ))}
      </group>
    </group>
  );
}

/** The sea at the horizon, with ripples and a sun glint that grows as the sun drops. */
export function Sea() {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uDeep: { value: new THREE.Color('#1f5f8c') }, uShallow: { value: new THREE.Color('#4fa6c9') }, uSky: { value: new THREE.Color('#d2e4f0') }, uSun: { value: new THREE.Color('#fff0d8') }, uGlint: { value: 0 }, uGlintX: { value: 0 }, uNight: { value: 0 } }), []);
  useFrame(() => {
    const m = mat.current; if (!m) return;
    const d = frame.day;
    m.uniforms.uTime.value = frame.elapsed;
    m.uniforms.uSky.value.copy(d.horizon);
    m.uniforms.uSun.value.copy(d.sun);
    const low = THREE.MathUtils.clamp(1 - d.sunDir.y * 2.2, 0, 1);
    m.uniforms.uGlint.value = d.sunDir.z < 0 ? low * (1 - d.night) * 0.9 : 0;
    m.uniforms.uGlintX.value = d.sunDir.x * 900;
    m.uniforms.uNight.value = d.night;
  });
  return (
    <mesh position={[0, -12.5, -1100]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[4000, 1500, 1, 1]} />
      <shaderMaterial
        ref={mat}
        uniforms={uniforms}
        vertexShader={`varying vec3 vWorld; void main(){ vec4 w = modelMatrix * vec4(position,1.0); vWorld = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`}
        fragmentShader={`uniform float uTime; uniform vec3 uDeep; uniform vec3 uShallow; uniform vec3 uSky; uniform vec3 uSun; uniform float uGlint; uniform float uGlintX; uniform float uNight; varying vec3 vWorld;
          void main(){
            float w = sin(vWorld.x*0.05 + uTime*0.5)*0.5 + sin(vWorld.z*0.04 - uTime*0.35)*0.5;
            float w2 = sin((vWorld.x*0.6+vWorld.z)*0.09 + uTime*0.7);
            float shade = 0.5 + 0.12*w + 0.07*w2;
            vec3 col = mix(uDeep, uShallow, smoothstep(0.3, 0.78, shade));
            col = mix(col, col*vec3(0.25,0.3,0.45), uNight);
            float dist = clamp((-vWorld.z - 300.0)/1200.0, 0.0, 1.0);
            col = mix(col, uSky, smoothstep(0.05, 1.0, dist) * 0.85);
            float g = exp(-pow((vWorld.x - uGlintX)*0.0022, 2.0)) * uGlint * (0.55 + 0.45*w2) * smoothstep(0.0, 0.6, dist);
            col += uSun * g * 0.9;
            gl_FragColor = vec4(col, 1.0);
          }`}
      />
    </mesh>
  );
}

/** Sky dome: gradient, sun glow, stars at night. */
export function Sky() {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(() => ({ uZenith: { value: new THREE.Color() }, uHorizon: { value: new THREE.Color() }, uSun: { value: new THREE.Color() }, uSunDir: { value: new THREE.Vector3(0, 1, 0) }, uNight: { value: 0 }, uTime: { value: 0 } }), []);
  useFrame(() => {
    const m = mat.current; if (!m) return;
    const d = frame.day;
    m.uniforms.uZenith.value.copy(d.zenith);
    m.uniforms.uHorizon.value.copy(d.horizon);
    m.uniforms.uSun.value.copy(d.sun);
    m.uniforms.uSunDir.value.copy(d.sunDir);
    m.uniforms.uNight.value = d.night;
    m.uniforms.uTime.value = frame.elapsed;
  });
  return (
    <mesh>
      <sphereGeometry args={[1800, 32, 20]} />
      <shaderMaterial
        ref={mat}
        side={THREE.BackSide}
        depthWrite={false}
        uniforms={uniforms}
        vertexShader={`varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`}
        fragmentShader={`uniform vec3 uZenith; uniform vec3 uHorizon; uniform vec3 uSun; uniform vec3 uSunDir; uniform float uNight; uniform float uTime; varying vec3 vDir;
          float hash(vec3 p){ p = fract(p*0.3183099 + vec3(0.1,0.2,0.3)); p *= 17.0; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
          void main(){
            float h = clamp(vDir.y, 0.0, 1.0);
            vec3 col = mix(uHorizon, uZenith, pow(h, 0.55));
            float sd = max(dot(normalize(vDir), uSunDir), 0.0);
            float glow = pow(sd, 48.0) * 0.9 + pow(sd, 6.0) * 0.18;
            col += uSun * glow * (1.0 - uNight*0.6);
            // stars
            vec3 sp = floor(vDir * 160.0);
            float s = step(0.9975, hash(sp)) * smoothstep(0.55, 1.0, uNight) * smoothstep(0.02, 0.25, vDir.y);
            float tw = 0.6 + 0.4*sin(uTime*2.0 + hash(sp+1.0)*30.0);
            col += vec3(0.9, 0.95, 1.0) * s * tw;
            gl_FragColor = vec4(col, 1.0);
          }`}
      />
    </mesh>
  );
}

/** Sun/moon light, hemisphere light and fog follow the day cycle. */
export function DayLights() {
  const sun = useRef<THREE.DirectionalLight>(null);
  const hemi = useRef<THREE.HemisphereLight>(null);
  const { scene } = useThree();
  useFrame(() => {
    const d = frame.day;
    if (sun.current) {
      sun.current.position.copy(d.sunDir).multiplyScalar(120).add(new THREE.Vector3(0, 0, 10));
      sun.current.intensity = d.sunI;
      sun.current.color.copy(d.sun);
      sun.current.shadow.intensity = 0.65;
    }
    if (hemi.current) {
      hemi.current.intensity = d.ambient;
      hemi.current.color.copy(d.horizon).lerp(d.zenith, 0.4);
      hemi.current.groundColor.set('#2a3a22');
    }
    if (scene.fog) (scene.fog as THREE.Fog).color.copy(d.horizon).lerp(d.zenith, 0.25);
  });
  return (
    <>
      <hemisphereLight ref={hemi} args={['#dfe9f3', '#2a3a22', 0.8]} />
      <directionalLight ref={sun} position={[30, 80, 20]} intensity={2} castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-70} shadow-camera-right={70} shadow-camera-top={90} shadow-camera-bottom={-70} shadow-camera-near={5} shadow-camera-far={320} shadow-bias={-0.0008} shadow-normalBias={0.04} />
    </>
  );
}
