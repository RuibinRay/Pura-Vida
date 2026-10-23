// DOM labels over the 3D map without portals: anchors register a world position, and a Projector
// inside the Canvas writes screen positions straight to the DOM every frame (no React re-renders).
import { createContext, useContext, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';

interface AnchorEntry { pos: THREE.Vector3; el: HTMLElement | null }
export type AnchorRegistry = Map<string, AnchorEntry>;

export const RegistryContext = createContext<AnchorRegistry | null>(null);

export function useRegistry() {
  const r = useContext(RegistryContext);
  if (!r) throw new Error('Anchor used outside a registry');
  return r;
}

/** Runs inside the Canvas: projects every registered anchor to screen space. */
export function Projector({ registry }: { registry: AnchorRegistry }) {
  const { camera, size } = useThree();
  const v = useMemo(() => new THREE.Vector3(), []);
  useFrame(() => {
    registry.forEach((a) => {
      const el = a.el;
      if (!el) return;
      v.copy(a.pos).project(camera);
      const x = ((v.x + 1) / 2) * size.width;
      const y = ((1 - v.y) / 2) * size.height;
      const visible = v.z > -1 && v.z < 1 && x > -80 && x < size.width + 80 && y > -60 && y < size.height + 60;
      if (visible) {
        el.style.transform = `translate(-50%, -50%) translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
        if (el.style.visibility !== 'visible') el.style.visibility = 'visible';
      } else if (el.style.visibility !== 'hidden') el.style.visibility = 'hidden';
    });
  });
  return null;
}

/** A DOM element pinned to a world position. Render it inside the overlay, outside the Canvas. */
export function Anchor({ id, position, className, children, interactive }: { id: string; position: [number, number, number]; className?: string; children: React.ReactNode; interactive?: boolean }) {
  const registry = useRegistry();
  const ref = useRef<HTMLDivElement>(null);
  const [x, y, z] = position;
  useEffect(() => {
    registry.set(id, { pos: new THREE.Vector3(x, y, z), el: ref.current });
    return () => { registry.delete(id); };
  }, [registry, id, x, y, z]);
  return (
    <div ref={ref} className={'map-anchor' + (className ? ' ' + className : '')} style={{ pointerEvents: interactive ? 'auto' : 'none' }}>
      {children}
    </div>
  );
}
