// Responsive "plates": the owner's reference images cut into a base and near-frame layers (tools/hero_assets.py).
// A plate keeps its aspect ratio and covers the stage like object-fit: cover; layers are positioned in plate space.
import manifests from './plates.generated.json';

export type PlateName = keyof typeof manifests;
interface Layer { name: string; box: number[]; widths: number[] }
interface Manifest { width: number; height: number; widths: number[]; focal: Record<string, number | number[]>; layers: Layer[] }

export const PLATES = manifests as Record<PlateName, Manifest>;
const BASE = import.meta.env.BASE_URL.replace(/\/?$/, '/') + 'plates/';

function srcSet(plate: PlateName, layer: string, widths: number[], scale = 1) {
  return widths.map((w) => `${BASE}${plate}/${layer}-${w}.webp ${Math.round(w * scale)}w`).join(', ');
}

/** The full-plate image (base) or a cut-out layer, with a srcset over the generated widths. */
export function PlateImage({ plate, layer = 'base', sizes = '100vw', className, alt = '', priority, style }: { plate: PlateName; layer?: string; sizes?: string; className?: string; alt?: string; priority?: boolean; style?: React.CSSProperties }) {
  const m = PLATES[plate];
  const l = m.layers.find((x) => x.name === layer);
  const widths = l ? l.widths : m.widths;
  // a cut-out layer is `box[2]` of the plate wide, so its srcset widths are scaled to plate widths for correct selection
  const scale = l ? 1 / l.box[2] : 1;
  const mid = widths[Math.min(widths.length - 1, 2)];
  // intrinsic size attributes reserve the box before the bytes arrive (no layout shift on content pages)
  const iw = l ? Math.round(m.width * l.box[2]) : m.width;
  const ih = l ? Math.round(m.height * l.box[3]) : m.height;
  return (
    <img
      className={className}
      width={iw}
      height={ih}
      src={`${BASE}${plate}/${layer}-${mid}.webp`}
      srcSet={srcSet(plate, layer, widths, scale)}
      sizes={sizes}
      alt={alt}
      decoding="async"
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      draggable={false}
      style={style}
    />
  );
}

/** Positions a cut-out layer at its box inside the plate. */
export function PlateLayer({ plate, layer, className, priority, sizes }: { plate: PlateName; layer: string; className?: string; priority?: boolean; sizes?: string }) {
  const m = PLATES[plate];
  const l = m.layers.find((x) => x.name === layer);
  if (!l) return null;
  const [x, y, w, h] = l.box;
  return (
    <div className={'plate__layer ' + (className || '')} style={{ left: `${x * 100}%`, top: `${y * 100}%`, width: `${w * 100}%`, height: `${h * 100}%` }}>
      <PlateImage plate={plate} layer={layer} priority={priority} sizes={sizes} />
    </div>
  );
}

/** The plate box: covers its parent, keeps the image ratio, centred. Children are positioned in plate space. */
export function PlateBox({ plate, className, style, children }: { plate: PlateName; className?: string; style?: React.CSSProperties; children: React.ReactNode }) {
  const m = PLATES[plate];
  return (
    <div className={'plate ' + (className || '')} style={{ aspectRatio: `${m.width} / ${m.height}`, ...style }}>
      {children}
    </div>
  );
}
