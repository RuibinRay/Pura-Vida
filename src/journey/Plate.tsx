// Responsive "plates": the owner's images cut into a base, moving parts (animals, water) and near-frame layers
// (tools/plates.py). A plate keeps its aspect ratio and covers the stage like object-fit: cover; layers are
// positioned in plate space from the generated manifest.
import manifests from './plates.generated.json';

export type PlateName = string;
export interface LayerInfo { name: string; box: number[]; widths: number[] }
export interface PartInfo extends LayerInfo { anim: string; z: number; pivot?: number[]; axis?: number[]; amp?: number; period?: number; delay?: number }
export interface AnimalInfo { id: string; species: string | null; kind: string; box: number[]; hotspot: number[] | null; parts: PartInfo[]; layer?: string; anim?: string; period?: number; amp?: number; delay?: number; static?: boolean }
export interface WaterInfo extends LayerInfo { flow: { dx: number; dy: number; period: number; amp: number }; mode: 'flow' | 'shimmer' | 'still' }
export interface Manifest {
  width: number;
  height: number;
  widths: number[];
  focal: { x: number; y: number; panFrom?: number; panTo?: number; [k: string]: number | number[] | undefined };
  layers: LayerInfo[];
  animals?: AnimalInfo[];
  water?: WaterInfo[];
  points?: Record<string, number[]>;
}

export const PLATES = manifests as unknown as Record<PlateName, Manifest>;
export const PLATE_NAMES = Object.keys(manifests);
const BASE = import.meta.env.BASE_URL.replace(/\/?$/, '/') + 'plates/';

export function plateUrl(plate: PlateName, name: string, width: number) {
  return `${BASE}${plate}/${name}-${width}.webp`;
}

function srcSet(plate: PlateName, name: string, widths: number[]) {
  return widths.map((w) => `${plateUrl(plate, name, w)} ${w}w`).join(', ');
}

/** One image of a plate: the base, a frame layer, an animal part or a water region. */
export function LayerImg({ plate, name, box, widths, sizes, className, alt = '', priority, eager, style, draggable = false }: { plate: PlateName; name: string; box?: number[]; widths?: number[]; sizes?: string; className?: string; alt?: string; priority?: boolean; /** fetched as soon as it mounts (a stop's base: the stop mounts shortly before it is reached) */ eager?: boolean; style?: React.CSSProperties; draggable?: boolean }) {
  const m = PLATES[plate];
  const ws = widths || m.widths;
  // The plate covers the stage: it is 100vw wide in wide viewports and 100vh × ratio in viewports narrower than the
  // plate's ratio (portrait phones: ~3.5× the viewport width). `sizes` must say so, or the browser picks a file that
  // is far too small for what it draws (Lighthouse's image-size-responsive). Callers that render a plate at another
  // width (the wildlife page's figure) pass their own media-query sizes.
  // In portrait the plate's true width is capped at 900 CSS px in `sizes`: the eye is ~3× closer to a phone than
  // the maths assumes, and the full-width file (×DPR) would cost ~0.5 MB per plate on mobile data.
  const autoSizes = `(max-aspect-ratio: ${m.width}/${m.height}) min(${((m.width / m.height) * 100).toFixed(1)}vh, 900px), 100vw`;
  const sizesAttr = sizes && !/^\d+(\.\d+)?vw$/.test(sizes) ? sizes : autoSizes;
  // Every file of a layer is named by the PLATE width it belongs to (a cut-out at `-1376` is box[2] × 1376 px wide),
  // so the srcset descriptors are plate widths and `sizes` is the plate's rendered width: the browser then picks,
  // for every layer, the file made for the plate width it is drawing — the same choice as for the base.
  const mid = ws[Math.min(ws.length - 1, 2)];
  // intrinsic size attributes reserve the box before the bytes arrive (no layout shift on content pages)
  const iw = box ? Math.max(1, Math.round(m.width * box[2])) : m.width;
  const ih = box ? Math.max(1, Math.round(m.height * box[3])) : m.height;
  return (
    <img
      className={className}
      width={iw}
      height={ih}
      src={plateUrl(plate, name, mid)}
      srcSet={srcSet(plate, name, ws)}
      sizes={sizesAttr}
      alt={alt}
      decoding="async"
      loading={priority || eager ? 'eager' : 'lazy'}
      fetchPriority={priority || eager ? 'high' : 'auto'}
      draggable={draggable}
      style={style}
    />
  );
}

/** The full-plate image (base) or a named frame layer. */
export function PlateImage({ plate, layer = 'base', sizes = '100vw', className, alt = '', priority, style }: { plate: PlateName; layer?: string; sizes?: string; className?: string; alt?: string; priority?: boolean; style?: React.CSSProperties }) {
  const m = PLATES[plate];
  const l = m.layers.find((x) => x.name === layer);
  return <LayerImg plate={plate} name={layer} box={l?.box} widths={l?.widths} sizes={sizes} className={className} alt={alt} priority={priority} style={style} />;
}

/** Positions a cut-out frame layer at its box inside the plate. */
export function PlateLayer({ plate, layer, className, priority, sizes, children }: { plate: PlateName; layer: string; className?: string; priority?: boolean; sizes?: string; children?: React.ReactNode }) {
  const m = PLATES[plate];
  const l = m.layers.find((x) => x.name === layer);
  if (!l) return null;
  const [x, y, w, h] = l.box;
  return (
    <div className={'plate__layer ' + (className || '')} style={{ left: `${x * 100}%`, top: `${y * 100}%`, width: `${w * 100}%`, height: `${h * 100}%` }}>
      <LayerImg plate={plate} name={layer} box={l.box} widths={l.widths} priority={priority} sizes={sizes} />
      {children}
    </div>
  );
}

/** The plate box: covers its parent, keeps the image ratio, centred on its focal point. Children are positioned in plate space. */
export function PlateBox({ plate, className, style, children }: { plate: PlateName; className?: string; style?: React.CSSProperties; children: React.ReactNode }) {
  const m = PLATES[plate];
  const f = m.focal;
  const vars = {
    ['--ratio' as string]: (m.width / m.height).toFixed(4),
    ['--fx' as string]: f.x,
    ['--fy' as string]: f.y,
    ['--pan-from' as string]: f.panFrom ?? f.x,
    ['--pan-to' as string]: f.panTo ?? f.x,
  };
  return (
    <div className={'plate ' + (className || '')} style={{ aspectRatio: `${m.width} / ${m.height}`, ...vars, ...style }}>
      {children}
    </div>
  );
}
