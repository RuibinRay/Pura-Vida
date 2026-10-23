import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { morphoWing } from '../shared/textures';
import { rng } from '../shared/wind';
import { frame, useHomeUI, TOUCAN_POS, SLOTH_POS } from './sceneState';

const dummy = new THREE.Object3D();

/** A keel-billed toucan on a branch. Hover: it turns its head and opens its bill a little. */
export function Toucan({ onActivate }: { onActivate?: () => void }) {
  const head = useRef<THREE.Group>(null);
  const lower = useRef<THREE.Mesh>(null);
  const body = useRef<THREE.Group>(null);
  const hovered = useHomeUI((s) => s.hovered === 'toucan');
  const setHovered = useHomeUI((s) => s.setHovered);
  const t0 = useRef(Math.random() * 10);
  useFrame((_, dt) => {
    const k = Math.min(1, dt * 6);
    if (head.current) {
      head.current.rotation.z += ((hovered ? 0.45 : 0.05 * Math.sin(frame.elapsed * 0.7 + t0.current)) - head.current.rotation.z) * k;
      head.current.rotation.y += ((hovered ? -0.5 : 0) - head.current.rotation.y) * k;
    }
    if (lower.current) lower.current.rotation.x += ((hovered ? 0.3 : 0) - lower.current.rotation.x) * k;
    if (body.current) body.current.position.y += (((hovered ? 0.06 : 0) + Math.sin(frame.elapsed * 1.8) * 0.01) - body.current.position.y) * k;
  });
  const over = (e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); setHovered('toucan'); document.body.style.cursor = 'default'; };
  const out = () => setHovered(null);
  const [x, y, z] = TOUCAN_POS;
  return (
    <group position={[x, y, z]} rotation={[0, 0.9, 0]}>
      {/* branch */}
      <mesh position={[-0.2, -0.22, 0]} rotation={[0, 0, Math.PI / 2 + 0.05]} castShadow>
        <cylinderGeometry args={[0.07, 0.1, 3.4, 7]} />
        <meshStandardMaterial color="#6b5236" roughness={1} />
      </mesh>
      <group ref={body} onPointerOver={over} onPointerOut={out} onClick={() => onActivate?.()}>
        {/* body */}
        <mesh scale={[1, 0.95, 1.45]} castShadow>
          <sphereGeometry args={[0.19, 18, 14]} />
          <meshStandardMaterial color="#121212" roughness={0.7} />
        </mesh>
        <mesh position={[0, -0.02, 0.12]} scale={[0.85, 0.9, 1]}>
          <sphereGeometry args={[0.14, 16, 12]} />
          <meshStandardMaterial color="#f2d23a" roughness={0.75} />
        </mesh>
        {/* tail */}
        <mesh position={[0, 0.02, -0.36]} rotation={[0.35, 0, 0]}>
          <boxGeometry args={[0.1, 0.03, 0.34]} />
          <meshStandardMaterial color="#121212" roughness={0.8} />
        </mesh>
        <mesh position={[0, -0.01, -0.42]}>
          <boxGeometry args={[0.08, 0.02, 0.12]} />
          <meshStandardMaterial color="#c8302a" roughness={0.8} />
        </mesh>
        {/* head */}
        <group ref={head} position={[0, 0.14, 0.2]}>
          <mesh castShadow>
            <sphereGeometry args={[0.12, 16, 12]} />
            <meshStandardMaterial color="#121212" roughness={0.7} />
          </mesh>
          <mesh position={[0, -0.03, 0.06]} scale={[0.9, 0.8, 0.9]}>
            <sphereGeometry args={[0.1, 14, 10]} />
            <meshStandardMaterial color="#f2d23a" roughness={0.75} />
          </mesh>
          {/* eyes with the pale ring */}
          {[-1, 1].map((s) => (
            <group key={s} position={[s * 0.085, 0.03, 0.06]}>
              <mesh><sphereGeometry args={[0.028, 10, 8]} /><meshStandardMaterial color="#8fd0b8" /></mesh>
              <mesh position={[s * 0.012, 0, 0.012]}><sphereGeometry args={[0.016, 8, 6]} /><meshStandardMaterial color="#111" /></mesh>
            </group>
          ))}
          {/* bill: upper, lower, tip */}
          <mesh position={[0, 0.005, 0.33]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 1, 0.85]} castShadow>
            <coneGeometry args={[0.075, 0.46, 8]} />
            <meshStandardMaterial color="#8cc63f" roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.04, 0.3]} rotation={[Math.PI / 2, 0, 0]} scale={[0.7, 1, 0.5]}>
            <coneGeometry args={[0.05, 0.3, 8]} />
            <meshStandardMaterial color="#f28c28" roughness={0.5} />
          </mesh>
          <mesh ref={lower} position={[0, -0.04, 0.3]} rotation={[Math.PI / 2, 0, 0]} scale={[0.95, 1, 0.6]}>
            <coneGeometry args={[0.06, 0.4, 8]} />
            <meshStandardMaterial color="#5ca84c" roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.005, 0.56]}>
            <sphereGeometry args={[0.038, 10, 8]} />
            <meshStandardMaterial color="#c8302a" roughness={0.5} />
          </mesh>
        </group>
        {/* feet */}
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.06, -0.19, 0.02]} rotation={[0.3, 0, 0]}>
            <cylinderGeometry args={[0.012, 0.012, 0.12, 5]} />
            <meshStandardMaterial color="#6b7f8a" />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/** A three-toed sloth hanging under a branch over the path. */
export function Sloth() {
  const head = useRef<THREE.Group>(null);
  const arm = useRef<THREE.Group>(null);
  const hovered = useHomeUI((s) => s.hovered === 'sloth');
  const setHovered = useHomeUI((s) => s.setHovered);
  useFrame((_, dt) => {
    const k = Math.min(1, dt * 2.2);
    if (head.current) {
      head.current.rotation.y += ((hovered ? -0.9 : 0.15 * Math.sin(frame.elapsed * 0.25)) - head.current.rotation.y) * k;
      head.current.rotation.x += ((hovered ? 0.25 : 0) - head.current.rotation.x) * k;
    }
    if (arm.current) arm.current.rotation.z += ((hovered ? 0.35 : 0) - arm.current.rotation.z) * k;
  });
  const [x, y, z] = SLOTH_POS;
  const fur = '#8a7a5a';
  const limb = (px: number, pz: number, rz: number, ref?: React.RefObject<THREE.Group | null>) => (
    <group position={[px, 0.1, pz]} rotation={[0, 0, rz]} ref={ref}>
      <mesh position={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.045, 0.06, 0.62, 7]} />
        <meshStandardMaterial color={fur} roughness={1} />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[(i - 1) * 0.03, 0.66, 0.02]} rotation={[Math.PI / 2 + 0.4, 0, 0]}>
          <coneGeometry args={[0.012, 0.1, 5]} />
          <meshStandardMaterial color="#d9cfa5" />
        </mesh>
      ))}
    </group>
  );
  return (
    <group position={[x, y, z]} rotation={[0, -0.5, 0]}>
      {/* branch across the path */}
      <mesh position={[0, 0.72, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.09, 0.12, 5.2, 8]} />
        <meshStandardMaterial color="#5f4a33" roughness={1} />
      </mesh>
      <group onPointerOver={(e) => { e.stopPropagation(); setHovered('sloth'); }} onPointerOut={() => setHovered(null)}>
        <mesh scale={[1.5, 1, 1.05]} castShadow>
          <sphereGeometry args={[0.24, 18, 14]} />
          <meshStandardMaterial color={fur} roughness={1} />
        </mesh>
        <mesh scale={[1.3, 0.8, 0.9]} position={[0, -0.05, 0]}>
          <sphereGeometry args={[0.24, 18, 14]} />
          <meshStandardMaterial color="#75774f" roughness={1} />
        </mesh>
        {limb(-0.28, 0.12, 0.35, arm)}
        {limb(0.28, 0.12, -0.35)}
        {limb(-0.22, -0.14, 0.3)}
        {limb(0.22, -0.14, -0.3)}
        {/* head */}
        <group ref={head} position={[0.36, -0.02, 0.06]}>
          <mesh castShadow><sphereGeometry args={[0.15, 16, 12]} /><meshStandardMaterial color={fur} roughness={1} /></mesh>
          <mesh position={[0.08, -0.01, 0]} scale={[0.6, 1, 1]}><sphereGeometry args={[0.13, 14, 10]} /><meshStandardMaterial color="#cdbf96" roughness={1} /></mesh>
          {[-1, 1].map((s) => (
            <mesh key={s} position={[0.13, 0.02, s * 0.06]} rotation={[0, 0, 0.3 * s]}>
              <boxGeometry args={[0.03, 0.025, 0.1]} />
              <meshStandardMaterial color="#2b2118" />
            </mesh>
          ))}
          <mesh position={[0.15, -0.03, 0]}><sphereGeometry args={[0.02, 8, 6]} /><meshStandardMaterial color="#1c1612" /></mesh>
          <mesh position={[0.135, -0.07, 0]} rotation={[0, 0, Math.PI]}>
            <torusGeometry args={[0.035, 0.008, 6, 10, Math.PI]} />
            <meshStandardMaterial color="#3b2a1e" />
          </mesh>
        </group>
      </group>
    </group>
  );
}

interface Flight { cx: number; cy: number; cz: number; a: number; b: number; c: number; r: number; ph: number; speed: number }

function Morpho({ f, hero, onActivate }: { f: Flight; hero?: boolean; onActivate?: () => void }) {
  const g = useRef<THREE.Group>(null);
  const left = useRef<THREE.Mesh>(null);
  const right = useRef<THREE.Mesh>(null);
  const tex = useMemo(() => morphoWing(), []);
  const hovered = useHomeUI((s) => s.hovered === 'morpho');
  const setHovered = useHomeUI((s) => s.setHovered);
  const isHov = useRef(false);
  const last = useRef(new THREE.Vector3());
  useFrame(() => {
    const t = frame.elapsed * f.speed + f.ph;
    const node = g.current; if (!node) return;
    const x = f.cx + Math.sin(t * f.a) * f.r, y = f.cy + Math.sin(t * f.b + 1.0) * 0.35 + Math.sin(t * 7) * 0.03, z = f.cz + Math.cos(t * f.c) * f.r * 0.8;
    const dx = x - last.current.x, dz = z - last.current.z;
    node.position.set(x, y, z);
    if (Math.abs(dx) + Math.abs(dz) > 1e-4) node.rotation.y = Math.atan2(dx, dz);
    last.current.set(x, y, z);
    const flap = Math.sin(t * (isHov.current ? 14 : 9)) * 1.05;
    if (left.current) left.current.rotation.z = flap;
    if (right.current) right.current.rotation.z = -flap;
  });
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ map: tex, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.35, metalness: 0.15, emissive: new THREE.Color('#1646b0'), emissiveIntensity: 0.25 }), [tex]);
  useEffect(() => { mat.emissiveIntensity = hovered && hero ? 0.8 : 0.25; isHov.current = hovered && !!hero; }, [hovered, hero, mat]);
  const wingL = useMemo(() => { const p = new THREE.PlaneGeometry(0.42, 0.4); p.translate(-0.21, 0, 0); return p; }, []);
  const wingR = useMemo(() => { const p = new THREE.PlaneGeometry(0.42, 0.4); p.translate(0.21, 0, 0); p.scale(-1, 1, 1); return p; }, []);
  return (
    <group ref={g} scale={hero ? 1 : 0.8}>
      <group rotation={[Math.PI / 2, 0, 0]}>
        <mesh ref={left} geometry={wingL} material={mat} />
        <mesh ref={right} geometry={wingR} material={mat} />
        <mesh><capsuleGeometry args={[0.014, 0.16, 3, 6]} /><meshStandardMaterial color="#141414" /></mesh>
      </group>
      {hero && (
        <mesh onPointerOver={(e) => { e.stopPropagation(); setHovered('morpho'); document.body.style.cursor = 'pointer'; }} onPointerOut={() => { setHovered(null); document.body.style.cursor = ''; }} onClick={(e) => { e.stopPropagation(); onActivate?.(); }}>
          <sphereGeometry args={[0.42, 8, 8]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
}

export function Morphos({ count, onActivate }: { count: number; onActivate: () => void }) {
  const flights = useMemo(() => { const r = rng(404); return Array.from({ length: count }, (): Flight => { const side = r() < 0.5 ? -1 : 1; return { cx: side * (2.2 + r() * 4), cy: 1.0 + r() * 2.4, cz: -2 + r() * 42, a: 0.5 + r() * 0.5, b: 0.8 + r() * 0.6, c: 0.4 + r() * 0.5, r: 0.6 + r() * 1.2, ph: r() * 50, speed: 0.7 + r() * 0.5 }; }); }, [count]);
  const heroes = useMemo<Flight[]>(() => [{ cx: -1.8, cy: 1.3, cz: -8.5, a: 0.6, b: 0.9, c: 0.5, r: 1.1, ph: 3, speed: 0.7 }, { cx: 2.2, cy: 1.7, cz: -7.5, a: 0.55, b: 1.1, c: 0.45, r: 1.0, ph: 11, speed: 0.8 }], []);
  return (
    <group>
      {flights.map((f, i) => (<Morpho key={i} f={f} />))}
      {heroes.map((f, i) => (<Morpho key={'h' + i} f={f} hero onActivate={onActivate} />))}
    </group>
  );
}

/** Distant birds crossing the vista. Instanced; each has its own line and flap. */
export function Birds({ count }: { count: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const geo = useMemo(() => { const g = new THREE.BufferGeometry(); const v = new Float32Array([-1.4, 0, 0.2, 0, 0, -0.25, 0, 0, 0.35, 1.4, 0, 0.2, 0, 0, -0.25, 0, 0, 0.35]); g.setAttribute('position', new THREE.BufferAttribute(v, 3)); g.computeVertexNormals(); return g; }, []);
  const birds = useMemo(() => { const r = rng(808); return Array.from({ length: count }, () => ({ x0: -220 + r() * 440, y: 24 + r() * 40, z: -120 - r() * 160, dir: r() < 0.5 ? 1 : -1, speed: 6 + r() * 6, ph: r() * 10, flock: Math.floor(r() * 4) })); }, [count]);
  useFrame(() => {
    const m = ref.current; if (!m) return;
    const t = frame.elapsed;
    birds.forEach((b, i) => {
      const x = ((b.x0 + b.dir * t * b.speed + 300) % 600) - 300;
      dummy.position.set(x, b.y + Math.sin(t * 0.8 + b.ph) * 3, b.z);
      dummy.rotation.set(0, b.dir > 0 ? Math.PI / 2 : -Math.PI / 2, 0);
      const flap = Math.sin(t * 6 + b.ph);
      dummy.scale.set(1, 1 + flap * 0.8, 1);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[geo, undefined, count]} frustumCulled={false}>
      <meshBasicMaterial color="#1a2430" side={THREE.DoubleSide} />
    </instancedMesh>
  );
}
