import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { applyWind, makeWindUniforms, rng } from '../shared/wind';
import { palmFrond, fernTexture, heliconiaTexture, bigLeafTexture, shaftTexture, softSprite, barkTexture } from '../shared/textures';
import { frame } from './sceneState';

const dummy = new THREE.Object3D();
const color = new THREE.Color();

/** Forest extent: z from -4 (clearing edge) to 72 (deep), x ±30. The path corridor is |x| < 3. */
const FOREST = { zMin: -4, zMax: 72, xMax: 30, corridor: 3.0 };

function placeTrees(count: number, seed: number, minDist: number, corridor: number) {
  const r = rng(seed);
  const pts: { x: number; z: number; s: number; rot: number }[] = [];
  let tries = 0;
  while (pts.length < count && tries < count * 40) {
    tries++;
    const x = (r() * 2 - 1) * FOREST.xMax;
    const z = FOREST.zMin + r() * (FOREST.zMax - FOREST.zMin);
    if (z < 8 && Math.abs(x) < corridor + 6) continue; // the clearing is open ground
    if (Math.abs(x) < corridor) continue; // keep the path open
    if (pts.some((p) => (p.x - x) ** 2 + (p.z - z) ** 2 < minDist * minDist)) continue;
    pts.push({ x, z, s: 0.7 + r() * 0.7, rot: r() * Math.PI * 2 });
  }
  return pts;
}

export function CanopyTrees({ count }: { count: number }) {
  const trunkRef = useRef<THREE.InstancedMesh>(null);
  const crownRef = useRef<THREE.InstancedMesh>(null);
  const uTrunk = useMemo(() => makeWindUniforms(0.12, 1, 9, 0), []);
  const uCrown = useMemo(() => makeWindUniforms(0.35, -2, 3, 0.02), []);
  const trees = useMemo(() => placeTrees(count, 11, 3.2, FOREST.corridor + 0.6), [count]);
  const trunkGeo = useMemo(() => new THREE.CylinderGeometry(0.16, 0.34, 10, 7, 4), []);
  const crownGeo = useMemo(() => { const g = new THREE.IcosahedronGeometry(1, 1); const p = g.attributes.position as THREE.BufferAttribute; const r = rng(5); for (let i = 0; i < p.count; i++) p.setXYZ(i, p.getX(i) * (0.85 + r() * 0.3), p.getY(i) * (0.85 + r() * 0.3), p.getZ(i) * (0.85 + r() * 0.3)); g.computeVertexNormals(); return g; }, []);
  const bark = useMemo(() => barkTexture(), []);
  const trunkMat = useMemo(() => { const m = new THREE.MeshStandardMaterial({ map: bark, color: '#8a7055', roughness: 0.95 }); applyWind(m, uTrunk); return m; }, [bark, uTrunk]);
  const crownMat = useMemo(() => { const m = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.9, flatShading: true, emissive: '#163a22', emissiveIntensity: 0.35 }); applyWind(m, uCrown); return m; }, [uCrown]);
  const crowns = useMemo(() => {
    const r = rng(23);
    const list: { x: number; y: number; z: number; sx: number; sy: number; col: string }[] = [];
    const greens = ['#2f7a3e', '#3f9a4c', '#276b35', '#4ea85a', '#1f5a2f', '#5bb563'];
    for (const t of trees) {
      const n = 3 + Math.floor(r() * 3);
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + r();
        const rad = (0.6 + r() * 1.4) * t.s;
        list.push({ x: t.x + Math.cos(a) * rad, y: 7.5 * t.s + 1.2 + r() * 2.4 * t.s, z: t.z + Math.sin(a) * rad, sx: (1.6 + r() * 1.6) * t.s, sy: (1.1 + r() * 0.9) * t.s, col: greens[Math.floor(r() * greens.length)] });
      }
    }
    return list;
  }, [trees]);

  useEffect(() => {
    const tr = trunkRef.current, cr = crownRef.current;
    if (!tr || !cr) return;
    trees.forEach((t, i) => { dummy.position.set(t.x, 5 * t.s, t.z); dummy.rotation.set(0, t.rot, 0); dummy.scale.set(t.s, t.s, t.s); dummy.updateMatrix(); tr.setMatrixAt(i, dummy.matrix); });
    tr.instanceMatrix.needsUpdate = true;
    crowns.forEach((c, i) => { dummy.position.set(c.x, c.y, c.z); dummy.rotation.set(0, i, 0); dummy.scale.set(c.sx, c.sy, c.sx); dummy.updateMatrix(); cr.setMatrixAt(i, dummy.matrix); cr.setColorAt(i, color.set(c.col)); });
    cr.instanceMatrix.needsUpdate = true;
    if (cr.instanceColor) cr.instanceColor.needsUpdate = true;
  }, [trees, crowns]);

  useFrame(() => { uTrunk.uTime.value = frame.elapsed; uCrown.uTime.value = frame.elapsed; uTrunk.uWind.value = 0.12 * frame.wind; uCrown.uWind.value = 0.35 * frame.wind; });

  return (
    <group>
      <instancedMesh ref={trunkRef} args={[trunkGeo, trunkMat, trees.length]} castShadow receiveShadow frustumCulled={false} />
      <instancedMesh ref={crownRef} args={[crownGeo, crownMat, crowns.length]} castShadow receiveShadow frustumCulled={false} />
    </group>
  );
}

export function Palms({ count }: { count: number }) {
  const trunkRef = useRef<THREE.InstancedMesh>(null);
  const frondRef = useRef<THREE.InstancedMesh>(null);
  const uTrunk = useMemo(() => makeWindUniforms(0.1, 0.5, 7, 0), []);
  const uFrond = useMemo(() => makeWindUniforms(0.3, 0, 3.2, 0.05), []);
  const palms = useMemo(() => placeTrees(count, 77, 4.5, FOREST.corridor + 1.2), [count]);
  const trunkGeo = useMemo(() => new THREE.CylinderGeometry(0.11, 0.2, 8, 6, 3), []);
  const frondGeo = useMemo(() => { const g = new THREE.PlaneGeometry(0.9, 3.2, 1, 8); g.translate(0, 1.6, 0); const p = g.attributes.position as THREE.BufferAttribute; for (let i = 0; i < p.count; i++) { const y = p.getY(i); p.setZ(i, -Math.pow(y / 3.2, 2) * 1.4); } g.computeVertexNormals(); return g; }, []);
  const tex = useMemo(() => palmFrond(), []);
  const trunkMat = useMemo(() => { const m = new THREE.MeshStandardMaterial({ color: '#8b7a5e', roughness: 0.95 }); applyWind(m, uTrunk); return m; }, [uTrunk]);
  const frondMat = useMemo(() => { const m = new THREE.MeshStandardMaterial({ map: tex, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.85, color: '#dff5d0', emissive: '#163a22', emissiveIntensity: 0.3 }); applyWind(m, uFrond); return m; }, [tex, uFrond]);
  const fronds = useMemo(() => { const r = rng(91); const list: { x: number; y: number; z: number; ry: number; rx: number; s: number }[] = []; for (const p of palms) { const n = 7 + Math.floor(r() * 3); for (let i = 0; i < n; i++) list.push({ x: p.x, y: 8 * p.s - 0.2, z: p.z, ry: (i / n) * Math.PI * 2 + r() * 0.3, rx: 0.9 + r() * 0.5, s: p.s * (0.9 + r() * 0.3) }); } return list; }, [palms]);
  useEffect(() => {
    const tr = trunkRef.current, fr = frondRef.current;
    if (!tr || !fr) return;
    palms.forEach((p, i) => { dummy.position.set(p.x, 4 * p.s, p.z); dummy.rotation.set(0.04, p.rot, 0.06); dummy.scale.set(p.s, p.s, p.s); dummy.updateMatrix(); tr.setMatrixAt(i, dummy.matrix); });
    tr.instanceMatrix.needsUpdate = true;
    fronds.forEach((f, i) => { dummy.position.set(f.x, f.y, f.z); dummy.rotation.set(0, f.ry, 0); dummy.rotateX(f.rx); dummy.scale.set(f.s, f.s, f.s); dummy.updateMatrix(); fr.setMatrixAt(i, dummy.matrix); });
    fr.instanceMatrix.needsUpdate = true;
  }, [palms, fronds]);
  useFrame(() => { uTrunk.uTime.value = frame.elapsed; uFrond.uTime.value = frame.elapsed; uFrond.uWind.value = 0.3 * frame.wind; uTrunk.uWind.value = 0.1 * frame.wind; });
  return (
    <group>
      <instancedMesh ref={trunkRef} args={[trunkGeo, trunkMat, palms.length]} castShadow frustumCulled={false} />
      <instancedMesh ref={frondRef} args={[frondGeo, frondMat, fronds.length]} castShadow frustumCulled={false} />
    </group>
  );
}

function Planes({ seed, count, geo, tex, tint, band, scale, uniforms, zRange }: { seed: number; count: number; geo: THREE.BufferGeometry; tex: THREE.Texture; tint: string; band: [number, number]; scale: [number, number]; uniforms: ReturnType<typeof makeWindUniforms>; zRange?: [number, number] }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const mat = useMemo(() => { const m = new THREE.MeshStandardMaterial({ map: tex, alphaTest: 0.45, side: THREE.DoubleSide, roughness: 0.9, color: tint, emissive: '#163a22', emissiveIntensity: 0.3 }); applyWind(m, uniforms); return m; }, [tex, tint, uniforms]);
  const items = useMemo(() => { const r = rng(seed); const list: { x: number; z: number; s: number; ry: number }[] = []; const [z0, z1] = zRange ?? [FOREST.zMin, FOREST.zMax]; for (let i = 0; i < count; i++) { const side = r() < 0.5 ? -1 : 1; const x = side * (band[0] + r() * (band[1] - band[0])); const z = z0 + r() * (z1 - z0); list.push({ x, z, s: scale[0] + r() * (scale[1] - scale[0]), ry: r() * Math.PI * 2 }); } return list; }, [seed, count, band, scale, zRange]);
  useEffect(() => { const m = ref.current; if (!m) return; items.forEach((it, i) => { dummy.position.set(it.x, it.s * 0.5 * (geo.boundingBox ? 1 : 1), it.z); dummy.rotation.set(0, it.ry, 0); dummy.scale.set(it.s, it.s, it.s); dummy.updateMatrix(); m.setMatrixAt(i, dummy.matrix); }); m.instanceMatrix.needsUpdate = true; }, [items, geo]);
  useFrame(() => { uniforms.uTime.value = frame.elapsed; });
  return <instancedMesh ref={ref} args={[geo, mat, items.length]} frustumCulled={false} castShadow />;
}

export function Understory({ dense }: { dense: boolean }) {
  const fernGeo = useMemo(() => { const g = new THREE.PlaneGeometry(1.3, 1.3); g.translate(0, 0.65, 0); return g; }, []);
  const heliGeo = useMemo(() => { const g = new THREE.PlaneGeometry(0.6, 1.8); g.translate(0, 0.9, 0); return g; }, []);
  const leafGeo = useMemo(() => { const g = new THREE.PlaneGeometry(1.5, 1.9, 1, 4); g.translate(0, 0.95, 0); const p = g.attributes.position as THREE.BufferAttribute; for (let i = 0; i < p.count; i++) { const y = p.getY(i); p.setZ(i, Math.sin((y / 1.9) * Math.PI) * 0.35); } g.computeVertexNormals(); return g; }, []);
  const uFern = useMemo(() => makeWindUniforms(0.08, 0, 1.3, 0.03), []);
  const uHeli = useMemo(() => makeWindUniforms(0.12, 0, 1.8, 0.02), []);
  const uLeaf = useMemo(() => makeWindUniforms(0.1, 0, 1.9, 0.04), []);
  const fern = useMemo(() => fernTexture(), []);
  const heli = useMemo(() => heliconiaTexture(), []);
  const leaf = useMemo(() => bigLeafTexture(), []);
  return (
    <group>
      <Planes seed={301} count={dense ? 420 : 200} geo={fernGeo} tex={fern} tint="#ffffff" band={[2.4, 9]} scale={[0.6, 1.3]} uniforms={uFern} zRange={[3, 72]} />
      <Planes seed={302} count={dense ? 160 : 80} geo={fernGeo} tex={fern} tint="#cfe8c0" band={[9, 28]} scale={[1.2, 2.4]} uniforms={uFern} />
      <Planes seed={303} count={dense ? 46 : 24} geo={heliGeo} tex={heli} tint="#ffffff" band={[2.4, 4.5]} scale={[0.8, 1.3]} uniforms={uHeli} zRange={[2, 50]} />
      <Planes seed={304} count={dense ? 70 : 34} geo={leafGeo} tex={leaf} tint="#ffffff" band={[2.6, 6]} scale={[0.8, 1.5]} uniforms={uLeaf} zRange={[4, 70]} />
      {/* the clearing's edge: foliage framing the lower corners of the vista */}
      <Planes seed={305} count={dense ? 90 : 40} geo={fernGeo} tex={fern} tint="#ffffff" band={[1.8, 9]} scale={[0.7, 1.4]} uniforms={uFern} zRange={[-10, 1]} />
      <Planes seed={306} count={dense ? 16 : 8} geo={heliGeo} tex={heli} tint="#ffffff" band={[2.2, 5]} scale={[0.9, 1.3]} uniforms={uHeli} zRange={[-9, 0]} />
      <Planes seed={307} count={dense ? 24 : 12} geo={leafGeo} tex={leaf} tint="#ffffff" band={[2.4, 7]} scale={[0.9, 1.6]} uniforms={uLeaf} zRange={[-9, 0]} />
    </group>
  );
}

/** Forest floor: dark soil with a lighter, worn path. */
export function ForestFloor() {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(90, 86, 60, 60);
    g.rotateX(-Math.PI / 2);
    g.translate(0, 0, 37); // z from -6 (clearing edge) to 80
    const p = g.attributes.position as THREE.BufferAttribute;
    const col = new Float32Array(p.count * 3);
    const r = rng(17);
    const soil = new THREE.Color('#3d4a2a'), path = new THREE.Color('#7a6744'), moss = new THREE.Color('#4f6a30'), grass = new THREE.Color('#5c7a33');
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), z = p.getZ(i);
      const onPath = THREE.MathUtils.smoothstep(1.9 - Math.abs(x - Math.sin(z * 0.11) * 1.1), 0, 1.4) * THREE.MathUtils.smoothstep(z, -8, -2);
      const clearing = THREE.MathUtils.smoothstep(-z, -4, 4);
      color.copy(soil).lerp(moss, r() * 0.6).lerp(grass, clearing * 0.8).lerp(path, onPath);
      col[i * 3] = color.r; col[i * 3 + 1] = color.g; col[i * 3 + 2] = color.b;
      p.setY(i, (r() - 0.5) * 0.12 + (Math.abs(x) > 3 ? 0.1 : 0));
    }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    g.computeVertexNormals();
    return g;
  }, []);
  return (
    <mesh geometry={geo} receiveShadow>
      <meshStandardMaterial vertexColors roughness={1} />
    </mesh>
  );
}

export function LightShafts({ count }: { count: number }) {
  const ref = useRef<THREE.Group>(null);
  const tex = useMemo(() => shaftTexture(), []);
  const items = useMemo(() => { const r = rng(55); return Array.from({ length: count }, () => ({ x: (r() * 2 - 1) * 10, z: 2 + r() * 44, w: 0.6 + r() * 1.4, ph: r() * 10 })); }, [count]);
  useFrame(() => {
    const g = ref.current; if (!g) return;
    const d = frame.day;
    const az = Math.atan2(d.sunDir.x, d.sunDir.z);
    g.rotation.y = az;
    g.children.forEach((c, i) => {
      const m = (c as THREE.Mesh).material as THREE.MeshBasicMaterial;
      m.opacity = d.shaft * (0.35 + 0.25 * Math.sin(frame.elapsed * 0.3 + items[i].ph));
      c.rotation.z = -(Math.PI / 2 - Math.asin(THREE.MathUtils.clamp(d.sunDir.y, 0.05, 1))) * 0.9;
    });
  });
  return (
    <group ref={ref}>
      {items.map((it, i) => (
        <mesh key={i} position={[it.x, 8, it.z]} rotation={[0, 0, -0.35]}>
          <planeGeometry args={[it.w, 16]} />
          <meshBasicMaterial map={tex} transparent opacity={0.3} depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

/** Dust motes by day, fireflies by night. */
export function Motes({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null);
  const tex = useMemo(() => softSprite(), []);
  const { positions, seeds } = useMemo(() => { const r = rng(99); const positions = new Float32Array(count * 3); const seeds = new Float32Array(count); for (let i = 0; i < count; i++) { positions[i * 3] = (r() * 2 - 1) * 9; positions[i * 3 + 1] = 0.4 + r() * 6; positions[i * 3 + 2] = -2 + r() * 40; seeds[i] = r() * 100; } return { positions, seeds }; }, [count]);
  const base = useMemo(() => positions.slice(), [positions]);
  useFrame(() => {
    const pts = ref.current; if (!pts) return;
    const p = pts.geometry.attributes.position as THREE.BufferAttribute;
    const t = frame.elapsed;
    for (let i = 0; i < count; i++) { const s = seeds[i]; p.setXYZ(i, base[i * 3] + Math.sin(t * 0.3 + s) * 0.5, base[i * 3 + 1] + Math.sin(t * 0.5 + s * 1.3) * 0.3, base[i * 3 + 2] + Math.cos(t * 0.25 + s) * 0.5); }
    p.needsUpdate = true;
    const m = pts.material as THREE.PointsMaterial;
    const n = frame.day.night;
    m.color.setRGB(1 - 0.3 * n, 0.95 - 0.15 * n, 0.8 - 0.5 * n);
    m.size = 0.07 + n * 0.1;
    m.opacity = 0.35 + n * 0.55 * (0.5 + 0.5 * Math.sin(t * 2.0));
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial map={tex} size={0.07} transparent opacity={0.4} depthWrite={false} sizeAttenuation blending={THREE.AdditiveBlending} color="#fff2cc" />
    </points>
  );
}
