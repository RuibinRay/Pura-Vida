// Shared primitives for the animal stickers (docs/ART_STYLE.md → "Stickers").
// Every animal is drawn in a 0..200 canvas: thick warm-ink outline, flat fills with one highlight and one shade
// shape per big part, big round eyes with one glint, an elliptical ground shadow.
import { useId, type ReactNode } from 'react';

export const INK = '#2a1d14';
export const SW = 3;
export const IRIS = '#1d1a16';
export const BARK = '#6b4a2d';
export const BARK_HI = '#8a6540';
export const BARK_SH = '#4e3520';
export const LEAF = '#4f9a4a';
export const LEAF_HI = '#8cc04b';
export const LEAF_SH = '#2f6b3a';

/** outline props shared by every sticker part */
export const O = { stroke: INK, strokeWidth: SW, strokeLinejoin: 'round', strokeLinecap: 'round' } as const;

/** path data for an ellipse, so a part can be a <path> and clip itself */
export function ell(cx: number, cy: number, rx: number, ry = rx): string {
  return `M${cx - rx} ${cy}a${rx} ${ry} 0 1 0 ${rx * 2} 0a${rx} ${ry} 0 1 0 ${-rx * 2} 0Z`;
}

/**
 * A big flat-filled part with its outline on top. `shade` paints a crescent along the lower-right edge (the fill is
 * re-drawn shifted up-left over the shade colour); children are clipped to the part (highlight, markings).
 * `id` is the per-drawing prefix (e.g. "pv-toucan-body"); a React id is appended so several copies of one drawing
 * on a page never share a clip path.
 */
export function Part({ id, d, fill, shade, shift = [5, 6], sw = SW, stroke = INK, children }: {
  id: string; d: string; fill: string; shade?: string; shift?: [number, number]; sw?: number; stroke?: string; children?: ReactNode;
}) {
  const uid = `${id}-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  return (
    <g>
      <defs><clipPath id={uid}><path d={d} /></clipPath></defs>
      <path d={d} fill={shade ?? fill} />
      <g clipPath={`url(#${uid})`}>
        {shade && <path d={d} fill={fill} transform={`translate(${-shift[0]} ${-shift[1]})`} />}
        {children}
      </g>
      <path d={d} fill="none" stroke={stroke} strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round" />
    </g>
  );
}

/** Big round eye: white, dark iris, one glint. `look` nudges the iris (-1..1 of the eye radius / 3); `k` is the iris/eye ratio. */
export function Eye({ cx, cy, r = 10, look = [0, 0], iris = IRIS, sw = SW, k = 0.62 }: { cx: number; cy: number; r?: number; look?: [number, number]; iris?: string; sw?: number; k?: number }) {
  const ir = r * k;
  const ix = cx + look[0] * r * 0.3;
  const iy = cy + look[1] * r * 0.3;
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="#ffffff" stroke={INK} strokeWidth={sw} />
      <circle cx={ix} cy={iy} r={ir} fill={iris} />
      <circle cx={ix - ir * 0.36} cy={iy - ir * 0.38} r={Math.max(1.4, ir * 0.3)} fill="#ffffff" />
    </g>
  );
}

/** A small friendly smile centred on (cx, cy), `w` wide and `h` deep. */
export function Smile({ cx, cy, w = 14, h = 6, sw = 2.5 }: { cx: number; cy: number; w?: number; h?: number; sw?: number }) {
  return <path d={`M${cx - w / 2} ${cy}q${w / 2} ${h * 2} ${w} 0`} fill="none" stroke={INK} strokeWidth={sw} strokeLinecap="round" />;
}

export function GroundShadow({ cx = 100, cy = 176, rx = 50, ry = 8 }: { cx?: number; cy?: number; rx?: number; ry?: number }) {
  return <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="rgba(42,29,20,0.18)" />;
}

/** A thick limb/neck/tail drawn as a stroke with the ink underneath (joins hide under the body). */
export function Limb({ d, color, w, sw = SW, cap = 'round' }: { d: string; color: string; w: number; sw?: number; cap?: 'round' | 'butt' }) {
  return (
    <g>
      <path d={d} fill="none" stroke={INK} strokeWidth={w + sw * 2} strokeLinecap={cap} strokeLinejoin="round" />
      <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap={cap} strokeLinejoin="round" />
    </g>
  );
}

/** A horizontal branch (perch). `id` prefixes its clip id. */
export function Branch({ id, x1, x2, y, r = 9 }: { id: string; x1: number; x2: number; y: number; r?: number }) {
  const d = `M${x1} ${y - r}L${x2} ${y - r}a${r} ${r} 0 0 1 0 ${r * 2}L${x1} ${y + r}a${r} ${r} 0 0 1 0 ${-r * 2}Z`;
  const mid = (x1 + x2) / 2;
  return (
    <Part id={`${id}-branch`} d={d} fill={BARK} shade={BARK_SH} shift={[0, 5]}>
      <path d={`M${x1 + 10} ${y - r + 3}L${x2 - 10} ${y - r + 3}`} stroke={BARK_HI} strokeWidth={3} strokeLinecap="round" />
      <path d={`M${mid - 30} ${y + 1}l12 0M${mid + 8} ${y + 3}l16 0M${mid - 50} ${y + 4}l8 0`} stroke={BARK_SH} strokeWidth={2} strokeLinecap="round" />
    </Part>
  );
}

/** Bird foot gripping a perch whose top edge is at y: a rounded knuckle with three toes curling down. */
export function Foot({ x, y, color, s = 1 }: { x: number; y: number; color: string; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-9 1Q-9 -8 0 -8Q9 -8 9 1L7 9Q5 11 3 8L1 3L0 9Q-1 11 -3 9L-5 3L-7 9Q-8 11 -9 8Z" fill={color} {...O} strokeWidth={2.5} />
    </g>
  );
}

/** A small music note (ink). */
export function Note({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={0} cy={0} rx={5.5} ry={4} fill={INK} transform="rotate(-20)" />
      <path d="M4.5 -1.5V-22q9 1 9 9" fill="none" stroke={INK} strokeWidth={3} strokeLinecap="round" />
    </g>
  );
}

/** Translucent wing fan for hovering hummingbirds (two per bird, blurred-motion look without any blur filter). */
export function WingFan({ d, color }: { d: string; color: string }) {
  return <path d={d} fill={color} fillOpacity={0.4} stroke={INK} strokeOpacity={0.5} strokeWidth={2.5} strokeLinejoin="round" />;
}

/** Path data for a scalloped ellipse (shaggy fur / fluffy feathers): n bumps of relative height ~k/2. */
export function scallop(cx: number, cy: number, rx: number, ry: number, n = 14, k = 0.22, rot = 0): string {
  const pt = (a: number, m: number) => `${(cx + Math.cos(a) * rx * m).toFixed(1)} ${(cy + Math.sin(a) * ry * m).toFixed(1)}`;
  let d = `M${pt(rot, 1)}`;
  for (let i = 0; i < n; i++) {
    const a1 = rot + ((i + 1) / n) * Math.PI * 2;
    const am = rot + ((i + 0.5) / n) * Math.PI * 2;
    d += `Q${pt(am, 1 + k)} ${pt(a1, 1)}`;
  }
  return d + 'Z';
}

/** A sector (fan) with apex (cx, cy), radius r, from angle a0 to a1 in degrees. */
export function fan(cx: number, cy: number, r: number, a0: number, a1: number): string {
  const p = (a: number) => `${(cx + Math.cos((a * Math.PI) / 180) * r).toFixed(1)} ${(cy + Math.sin((a * Math.PI) / 180) * r).toFixed(1)}`;
  const large = Math.abs(a1 - a0) > 180 ? 1 : 0;
  const sweep = a1 > a0 ? 1 : 0;
  return `M${cx} ${cy}L${p(a0)}A${r} ${r} 0 ${large} ${sweep} ${p(a1)}Z`;
}
