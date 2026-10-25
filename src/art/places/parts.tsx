// Reusable scene parts for the place postcards (docs/ART_STYLE.md, "Postcards").
// Canvas is 320 x 200. Every part is a <g> drawn in canvas units; no outlines, no filters, no text.
// Ids inside <defs> take a per-postcard prefix `p` so many postcards can share one page.

export type TimeOfDay = 'day' | 'dawn' | 'dusk' | 'night' | 'misty';

/** deterministic pseudo-random */
export function prng(seed: number) {
  let s = (seed >>> 0) || 1;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}
export function hashId(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) { h ^= id.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

export interface Palette {
  skyTop: string; skyBottom: string; haze: string; far: string; mid: string; near: string; dark: string;
  water: string; waterDeep: string; sun: string; sand: string; light: string;
}
export const PALETTES: Record<TimeOfDay, Palette> = {
  day: { skyTop: '#7fb9d8', skyBottom: '#e9f3f7', haze: '#b8d3e2', far: '#8fb0bd', mid: '#4f9a4a', near: '#2f6b3a', dark: '#1d3d26', water: '#2cb1a6', waterDeep: '#1a6f8e', sun: '#fff1b8', sand: '#e8d6a8', light: '#ffffff' },
  dawn: { skyTop: '#c98aa0', skyBottom: '#fbe3c4', haze: '#e3c1c0', far: '#a98aa0', mid: '#5c8f48', near: '#2f5c38', dark: '#243a26', water: '#7fb5c4', waterDeep: '#3f7897', sun: '#ffd99a', sand: '#efdcb0', light: '#fff4e4' },
  dusk: { skyTop: '#8b5a8e', skyBottom: '#f3b27a', haze: '#d9a08a', far: '#8e6a86', mid: '#5a6a3c', near: '#2e3f2a', dark: '#1e2a1f', water: '#e2a06a', waterDeep: '#6a4e72', sun: '#ffd27a', sand: '#e3c08f', light: '#ffe7c2' },
  night: { skyTop: '#121a2f', skyBottom: '#2d3f62', haze: '#3a4b6a', far: '#2f3e58', mid: '#20362a', near: '#152418', dark: '#0d1711', water: '#243f66', waterDeep: '#15294a', sun: '#f4efd6', sand: '#8c8a7a', light: '#dce5f5' },
  misty: { skyTop: '#aebfc6', skyBottom: '#eef2f1', haze: '#ccd8da', far: '#9fb3b4', mid: '#5f8f58', near: '#36633d', dark: '#243f2a', water: '#8fbcc4', waterDeep: '#5a8a98', sun: '#ffffff', sand: '#e2d8c0', light: '#ffffff' },
};

/** mix two hex colours, t in 0..1 toward b */
export function mix(a: string, b: string, t: number): string {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const ch = (s: number) => Math.round(((pa >> s) & 255) * (1 - t) + ((pb >> s) & 255) * t);
  return '#' + [16, 8, 0].map((s) => ch(s).toString(16).padStart(2, '0')).join('');
}

// ---------- sky, light, weather ----------

export function Sky({ p, pal }: { p: string; pal: Palette }) {
  const id = `${p}-sky`;
  return (
    <g>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={pal.skyTop} />
          <stop offset="1" stopColor={pal.skyBottom} />
        </linearGradient>
      </defs>
      <rect x={0} y={0} width={320} height={200} fill={`url(#${id})`} />
    </g>
  );
}

export function Sun({ x, y, r = 16, color = '#fff1b8', glow = 'rgba(255,240,200,0.35)' }: { x: number; y: number; r?: number; color?: string; glow?: string }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r * 2.2} fill={glow} />
      <circle cx={x} cy={y} r={r} fill={color} />
    </g>
  );
}

export function Moon({ x, y, r = 12, color = '#f4efd6' }: { x: number; y: number; r?: number; color?: string }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r * 2} fill="rgba(244,239,214,0.12)" />
      <circle cx={x} cy={y} r={r} fill={color} />
      <circle cx={x + r * 0.45} cy={y - r * 0.3} r={r * 0.82} fill="#1b2740" opacity={0.9} />
    </g>
  );
}

export function Stars({ seed, n = 18, color = '#fff' }: { seed: number; n?: number; color?: string }) {
  const r = prng(seed);
  const pts = Array.from({ length: n }, () => [r() * 320, r() * 90, 0.6 + r() * 0.9]);
  return <path d={pts.map(([x, y, s]) => `M${x.toFixed(1)} ${y.toFixed(1)}h${s.toFixed(1)}v${s.toFixed(1)}h-${s.toFixed(1)}z`).join('')} fill={color} opacity={0.8} />;
}

export function Cloud({ x, y, s = 1, fill = 'rgba(255,255,255,0.85)' }: { x: number; y: number; s?: number; fill?: string }) {
  return (
    <path transform={`translate(${x} ${y}) scale(${s})`} fill={fill}
      d="M-30 8 Q-32 -4 -20 -4 Q-16 -16 -2 -12 Q6 -22 18 -12 Q30 -14 30 0 Q40 2 36 8 Z" />
  );
}

export function Birds({ x, y, n = 3, s = 1, color = '#2a3a3a' }: { x: number; y: number; n?: number; s?: number; color?: string }) {
  const d: string[] = [];
  for (let i = 0; i < n; i++) {
    const bx = x + i * 11 * s + (i % 2) * 4, by = y + (i % 2 ? 3 : 0) * s - i * 2;
    d.push(`M${bx - 4 * s} ${by} q4 ${-3 * s} ${4 * s} 0 q0 ${-3 * s} ${4 * s} 0`);
  }
  return <path d={d.join(' ')} fill="none" stroke={color} strokeWidth={1.2} strokeLinecap="round" opacity={0.8} />;
}

export function Rain({ seed, color = 'rgba(255,255,255,0.35)', n = 26 }: { seed: number; color?: string; n?: number }) {
  const r = prng(seed);
  const d: string[] = [];
  for (let i = 0; i < n; i++) { const x = r() * 320, y = r() * 170, l = 8 + r() * 10; d.push(`M${x.toFixed(0)} ${y.toFixed(0)}l-2 ${l.toFixed(0)}`); }
  return <path d={d.join(' ')} stroke={color} strokeWidth={1} fill="none" strokeLinecap="round" />;
}

/** a horizontal band of mist, fading at both ends */
export function Mist({ p, y, x = 0, w = 320, h = 14, color = '#ffffff', opacity = 0.55, k = 0 }: { p: string; y: number; x?: number; w?: number; h?: number; color?: string; opacity?: number; k?: number }) {
  const id = `${p}-mist${k}`;
  return (
    <g>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={color} stopOpacity={0} />
          <stop offset="0.25" stopColor={color} stopOpacity={opacity} />
          <stop offset="0.75" stopColor={color} stopOpacity={opacity} />
          <stop offset="1" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <ellipse cx={x + w / 2} cy={y} rx={w / 2} ry={h / 2} fill={`url(#${id})`} />
    </g>
  );
}

// ---------- land ----------

/** rolling hills: a filled band whose top edge is a smooth wavy line */
export function Hills({ y, color, seed, amp = 14, bumps = 4, bottom = 200, left = 0, right = 320 }: { y: number; color: string; seed: number; amp?: number; bumps?: number; bottom?: number; left?: number; right?: number }) {
  const r = prng(seed);
  const w = right - left;
  const pts: [number, number][] = [];
  for (let i = 0; i <= bumps; i++) pts.push([left + (w * i) / bumps, y + (r() - 0.5) * amp * 2]);
  let d = `M${left} ${bottom} L${left} ${pts[0][1]}`;
  for (let i = 1; i <= bumps; i++) {
    const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
    const cx = (x0 + x1) / 2;
    const peak = Math.min(y0, y1) - amp * (0.4 + r() * 0.8);
    d += ` Q${cx} ${peak} ${x1} ${y1}`;
  }
  d += ` L${right} ${bottom} Z`;
  return <path d={d} fill={color} />;
}

/** a jagged mountain range (Talamanca) */
export function Range({ y, color, seed, amp = 30, peaks = 5, bottom = 200, sharp = 1 }: { y: number; color: string; seed: number; amp?: number; peaks?: number; bottom?: number; sharp?: number }) {
  const r = prng(seed);
  let d = `M0 ${bottom} L0 ${y + amp * 0.3}`;
  const step = 320 / (peaks * 2);
  for (let i = 1; i <= peaks * 2; i++) {
    const x = i * step + (r() - 0.5) * step * 0.6;
    const yy = i % 2 ? y - amp * (0.5 + r() * 0.5) * sharp : y + amp * 0.3 * r();
    d += ` L${x.toFixed(1)} ${yy.toFixed(1)}`;
  }
  d += ` L320 ${y + amp * 0.2} L320 ${bottom} Z`;
  return <path d={d} fill={color} />;
}

export function Ground({ y, color, bottom = 200 }: { y: number; color: string; bottom?: number }) {
  return <rect x={0} y={y} width={320} height={bottom - y} fill={color} />;
}

/** a volcano cone with optional crater lake, flat/collapsed top and steam plume */
export function VolcanoCone({ x, baseY, w = 200, h = 90, color, shade, lake, lakeW, steam, flat = 0.18, p = 'v', ridge }:
  { x: number; baseY: number; w?: number; h?: number; color: string; shade?: string; lake?: string; lakeW?: number; steam?: boolean; flat?: number; p?: string; ridge?: string }) {
  const top = baseY - h;
  const fw = w * flat; // crater width
  const l = x - fw / 2, r = x + fw / 2;
  const sh = shade ?? mix(color, '#000000', 0.18);
  return (
    <g>
      <path d={`M${x - w / 2} ${baseY} C${x - w * 0.3} ${baseY - h * 0.25} ${x - w * 0.14} ${top + h * 0.1} ${l} ${top} L${r} ${top + 2} C${x + w * 0.14} ${top + h * 0.1} ${x + w * 0.3} ${baseY - h * 0.25} ${x + w / 2} ${baseY} Z`} fill={color} />
      {/* shaded flank */}
      <path d={`M${x} ${baseY} L${r} ${top + 2} C${x + w * 0.14} ${top + h * 0.1} ${x + w * 0.3} ${baseY - h * 0.25} ${x + w / 2} ${baseY} Z`} fill={sh} opacity={0.6} />
      {ridge && <path d={`M${l} ${top} Q${x} ${top - 2} ${r} ${top + 2} L${r} ${top + 7} Q${x} ${top + 9} ${l} ${top + 6} Z`} fill={ridge} />}
      {lake && (() => { const lw = Math.min(lakeW ?? fw * 0.8, fw * 0.84); return (
        <g>
          <ellipse cx={x} cy={top + 2.5} rx={lw / 2 + 3} ry={lw * 0.085 + 2.5} fill={mix(color, '#000', 0.42)} />
          <ellipse cx={x} cy={top + 1.5} rx={lw / 2} ry={lw * 0.07} fill={lake} />
          <ellipse cx={x - lw * 0.12} cy={top + 0.5} rx={lw * 0.2} ry={lw * 0.022} fill="#ffffff" opacity={0.35} />
        </g>
      ); })()}
      {steam && <Steam x={x + (lake ? fw * 0.3 : 0)} y={top + (lake ? 4 : 0)} p={p} />}
    </g>
  );
}

export function Steam({ x, y, p, s = 1, color = '#ffffff' }: { x: number; y: number; p: string; s?: number; color?: string }) {
  const id = `${p}-steam`;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <defs>
        <linearGradient id={id} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor={color} stopOpacity={0.85} />
          <stop offset="1" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d="M-8 2 Q-14 -12 -4 -20 Q-2 -34 10 -36 Q22 -44 24 -30 Q36 -30 30 -16 Q40 -4 26 0 Z" fill={`url(#${id})`} />
    </g>
  );
}

/** dark vegetation silhouette framing a bottom corner */
export function Fringe({ side, color, seed, s = 1, y = 200 }: { side: 'left' | 'right'; color: string; seed: number; s?: number; y?: number }) {
  const r = prng(seed);
  const fronds: string[] = [];
  const ox = side === 'left' ? -10 : 330;
  const dir = side === 'left' ? 1 : -1;
  for (let i = 0; i < 5; i++) {
    const a = (0.35 + i * 0.28 + r() * 0.2) * dir;
    const len = (70 + r() * 40) * s;
    const ex = ox + Math.cos(a) * len * dir * (dir > 0 ? 1 : -1), ey = y - Math.sin(Math.abs(a)) * len;
    const cx = ox + (ex - ox) * 0.5 + 10 * dir, cy = ey - 10;
    fronds.push(`M${ox} ${y} Q${cx} ${cy} ${ex} ${ey} Q${cx + 6 * dir} ${cy + 18} ${ox + 2 * dir} ${y + 10} Z`);
  }
  return (
    <g fill={color}>
      <path d={fronds.join(' ')} />
      <Leaf x={ox + 20 * dir} y={y - 2} s={1.1 * s} rot={-30 * dir} color={color} />
    </g>
  );
}

export function Leaf({ x, y, s = 1, rot = 0, color }: { x: number; y: number; s?: number; rot?: number; color: string }) {
  return <path transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} fill={color} d="M0 0 C-14 -14 -16 -34 -4 -52 C12 -36 14 -14 0 0 Z" />;
}

export function Fern({ x, y, s = 1, rot = 0, color }: { x: number; y: number; s?: number; rot?: number; color: string }) {
  const d: string[] = [];
  for (let i = 0; i < 7; i++) {
    const t = i / 7, yy = -t * 44, w = 14 * (1 - t) + 3;
    d.push(`M0 ${yy} q${-w} -3 ${-w - 3} ${-7 + t * 4} q${w} 1 ${w + 3} ${7 - t * 4}z M0 ${yy} q${w} -3 ${w + 3} ${-7 + t * 4} q${-w} 1 ${-w - 3} ${7 - t * 4}z`);
  }
  return <path transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} fill={color} d={d.join(' ') + ' M-1 0 L1 0 L0.5 -50 L-0.5 -50 Z'} />;
}

export function Palm({ x, y, s = 1, lean = 0, color, trunk }: { x: number; y: number; s?: number; lean?: number; color: string; trunk?: string }) {
  const fr: string[] = [];
  for (let i = 0; i < 7; i++) {
    const a = -160 + i * 40 + (i % 2) * 8;
    const rad = (a * Math.PI) / 180;
    const ex = Math.cos(rad) * 30, ey = Math.sin(rad) * 18 + 4;
    fr.push(`M0 0 Q${ex * 0.6} ${ey * 0.6 - 10} ${ex} ${ey} Q${ex * 0.55} ${ey * 0.6 + 1} 0 0 Z`);
  }
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d={`M-3 0 Q${lean * 0.5 - 2} -40 ${lean} -70 L${lean + 3} -70 Q${lean * 0.5 + 3} -40 3 0 Z`} fill={trunk ?? mix(color, '#6b4a2d', 0.5)} />
      <g transform={`translate(${lean} -72)`} fill={color}>
        <path d={fr.join(' ')} />
        <circle cx={0} cy={0} r={4} />
      </g>
    </g>
  );
}

/** a broad-crowned tree (guanacaste / rainforest emergent) */
export function BroadTree({ x, y, s = 1, color, trunk = '#5a3f28', wide = 1 }: { x: number; y: number; s?: number; color: string; trunk?: string; wide?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-3 0 L-2 -22 L-14 -34 L-3 -28 L-1 -40 L2 -28 L13 -35 L2 -22 L3 0 Z" fill={trunk} />
      <g transform={`scale(${wide} 1)`} fill={color}>
        <ellipse cx={-18} cy={-36} rx={18} ry={11} />
        <ellipse cx={16} cy={-38} rx={20} ry={12} />
        <ellipse cx={0} cy={-46} rx={24} ry={13} />
        <ellipse cx={-6} cy={-30} rx={14} ry={8} />
      </g>
      <ellipse cx={-4} cy={-50} rx={12} ry={5} fill={mix(color, '#ffffff', 0.18)} transform={`scale(${wide} 1)`} />
    </g>
  );
}

/** a mass of round canopy tops along a line — forest at a given depth */
export function Canopy({ y, color, seed, n = 9, r = 14, left = 0, right = 320, light, bottom = 200, solid = true }: { y: number; color: string; seed: number; n?: number; r?: number; left?: number; right?: number; light?: string; bottom?: number; solid?: boolean }) {
  const rnd = prng(seed);
  const nodes: React.ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const x = left + ((right - left) * (i + 0.5)) / n + (rnd() - 0.5) * r;
    const rr = r * (0.7 + rnd() * 0.6), yy = y + (rnd() - 0.5) * r * 0.5;
    nodes.push(<ellipse key={i} cx={x} cy={yy} rx={rr} ry={rr * 0.75} fill={color} />);
    if (light && i % 2 === 0) nodes.push(<ellipse key={'l' + i} cx={x - rr * 0.25} cy={yy - rr * 0.3} rx={rr * 0.45} ry={rr * 0.25} fill={light} />);
  }
  return <g>{solid && <rect x={left} y={y} width={right - left} height={bottom - y} fill={color} />}{nodes}</g>;
}

export function Mangrove({ x, y, s = 1, color, roots = '#4a3524' }: { x: number; y: number; s?: number; color: string; roots?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-20 0 Q-14 -14 -6 -20 M-10 2 Q-8 -14 -2 -20 M4 2 Q2 -12 2 -20 M14 0 Q12 -14 6 -20 M22 1 Q16 -12 8 -21" fill="none" stroke={roots} strokeWidth={2.2} strokeLinecap="round" />
      <ellipse cx={0} cy={-28} rx={26} ry={11} fill={color} />
      <ellipse cx={-8} cy={-36} rx={16} ry={8} fill={color} />
      <ellipse cx={10} cy={-35} rx={14} ry={7} fill={mix(color, '#ffffff', 0.15)} />
    </g>
  );
}

export function Cypress({ x, y, s = 1, color }: { x: number; y: number; s?: number; color: string }) {
  return <path transform={`translate(${x} ${y}) scale(${s})`} fill={color} d="M-5 0 Q-7 -16 -3 -30 Q0 -40 3 -30 Q7 -16 5 0 Z" />;
}

// ---------- water ----------

export function Sea({ p, y, pal, bottom = 200, surf = true, k = '' }: { p: string; y: number; pal: Palette; bottom?: number; surf?: boolean; k?: string }) {
  const id = `${p}-sea${k}`;
  return (
    <g>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={mix(pal.waterDeep, pal.haze, 0.35)} />
          <stop offset="1" stopColor={pal.water} />
        </linearGradient>
      </defs>
      <rect x={0} y={y} width={320} height={bottom - y} fill={`url(#${id})`} />
      {surf && <path d={`M0 ${y + (bottom - y) * 0.55} q40 -4 80 0 t80 0 t80 0 t80 0 M30 ${y + (bottom - y) * 0.8} q40 -3 80 0 t80 0 t80 0`} fill="none" stroke={pal.light} strokeWidth={1.2} opacity={0.5} />}
    </g>
  );
}

/** lagoon / lake surface with a soft reflection stripe */
export function Lake({ x, y, rx, ry, color, light }: { x: number; y: number; rx: number; ry: number; color: string; light?: string }) {
  return (
    <g>
      <ellipse cx={x} cy={y} rx={rx} ry={ry} fill={color} />
      <ellipse cx={x} cy={y + ry * 0.25} rx={rx * 0.55} ry={ry * 0.22} fill={light ?? mix(color, '#ffffff', 0.25)} opacity={0.7} />
    </g>
  );
}

export function Beach({ y, sand, curve = 24, bottom = 200, side = 'right' }: { y: number; sand: string; curve?: number; bottom?: number; side?: 'left' | 'right' }) {
  const d = side === 'right'
    ? `M0 ${bottom} L0 ${y + curve} Q100 ${y + curve * 0.6} 200 ${y} Q280 ${y - curve * 0.3} 320 ${y - curve * 0.5} L320 ${bottom} Z`
    : `M320 ${bottom} L320 ${y + curve} Q220 ${y + curve * 0.6} 120 ${y} Q40 ${y - curve * 0.3} 0 ${y - curve * 0.5} L0 ${bottom} Z`;
  return (
    <g>
      <path d={d} fill="rgba(255,255,255,0.6)" transform="translate(0 -3)" />
      <path d={d} fill={sand} />
    </g>
  );
}

/** a river winding down the picture; `d` is the centre line */
export function River({ d, color, w = 20, light }: { d: string; color: string; w?: number; light?: string }) {
  return (
    <g fill="none" strokeLinecap="round">
      <path d={d} stroke={color} strokeWidth={w} />
      <path d={d} stroke={light ?? mix(color, '#ffffff', 0.3)} strokeWidth={w * 0.25} opacity={0.5} />
    </g>
  );
}

export function Waterfall({ x, top, bottom, w = 10, color = '#ffffff', pool = '#8fd3cf' }: { x: number; top: number; bottom: number; w?: number; color?: string; pool?: string }) {
  return (
    <g>
      <rect x={x - w / 2} y={top} width={w} height={bottom - top} fill={color} opacity={0.85} />
      <rect x={x - w / 2 + 1} y={top} width={w * 0.3} height={bottom - top} fill={color} opacity={0.5} />
      <ellipse cx={x} cy={bottom} rx={w * 1.6} ry={w * 0.35} fill={pool} />
      <ellipse cx={x} cy={bottom - 2} rx={w * 1.1} ry={w * 0.25} fill={color} opacity={0.6} />
    </g>
  );
}

export function Island({ x, y, w = 60, h = 20, color, flat = false }: { x: number; y: number; w?: number; h?: number; color: string; flat?: boolean }) {
  return flat
    ? <path d={`M${x - w / 2} ${y} Q${x - w * 0.3} ${y - h} ${x} ${y - h * 0.9} Q${x + w * 0.35} ${y - h} ${x + w / 2} ${y} Z`} fill={color} />
    : <path d={`M${x - w / 2} ${y} L${x - w * 0.2} ${y - h} L${x + w * 0.05} ${y - h * 0.7} L${x + w * 0.25} ${y - h * 1.1} L${x + w / 2} ${y} Z`} fill={color} />;
}

export function Reef({ x, y, s = 1, seed }: { x: number; y: number; s?: number; seed: number }) {
  const r = prng(seed);
  const cols = ['#e07a5f', '#f2cc8f', '#d9484f', '#8e4a9e', '#f4a261'];
  const items: React.ReactNode[] = [];
  for (let i = 0; i < 7; i++) {
    const xx = (i - 3) * 16 + (r() - 0.5) * 6, c = cols[i % cols.length];
    if (i % 3 === 0) items.push(<path key={i} d={`M${xx} 0 q-3 -10 -8 -16 M${xx} 0 q0 -12 2 -20 M${xx} 0 q4 -8 9 -14`} stroke={c} strokeWidth={2.4} fill="none" strokeLinecap="round" />);
    else items.push(<ellipse key={i} cx={xx} cy={-4} rx={9} ry={6} fill={c} />);
  }
  return <g transform={`translate(${x} ${y}) scale(${s})`}>{items}</g>;
}

export function Boat({ x, y, s = 1, hull = '#e8e2d2', trim = '#2a7fa1', sail }: { x: number; y: number; s?: number; hull?: string; trim?: string; sail?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-18 -4 L18 -4 L13 4 L-13 4 Z" fill={hull} />
      <path d="M-18 -4 L18 -4 L17 -2 L-17 -2 Z" fill={trim} />
      {sail ? <path d="M0 -4 L0 -30 L14 -6 Z" fill="#fff" /> : <path d="M-8 -4 L-6 -12 L6 -12 L8 -4 Z" fill={trim} />}
    </g>
  );
}

export function WhaleTail({ x, y, s = 1, color = '#2a4a5a' }: { x: number; y: number; s?: number; color?: string }) {
  return (
    <path transform={`translate(${x} ${y}) scale(${s})`} fill={color}
      d="M-2 0 Q-4 -12 -14 -18 Q-28 -24 -30 -14 Q-20 -12 -6 -4 Q-3 -8 0 -8 Q3 -8 6 -4 Q20 -12 30 -14 Q28 -24 14 -18 Q4 -12 2 0 Z" />
  );
}

export function Turtle({ x, y, s = 1, color = '#3b5a3a' }: { x: number; y: number; s?: number; color?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill={color}>
      <ellipse cx={0} cy={0} rx={10} ry={6} />
      <ellipse cx={11} cy={-1} rx={4} ry={2.6} />
      <path d="M-6 -4 l-6 -4 l1 4 M6 -4 l6 -4 l-1 4 M-7 4 l-5 4 l3 0 M7 4 l5 4 l-3 0" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </g>
  );
}

export function Heron({ x, y, s = 1, color = '#f4f1ea' }: { x: number; y: number; s?: number; color?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-8 0 Q-6 -10 2 -12 Q10 -12 10 -6 Q8 0 0 0 Z" fill={color} />
      <path d="M8 -10 L10 -24 L13 -26 L19 -25" stroke={color} strokeWidth={2.2} fill="none" strokeLinecap="round" />
      <path d="M-2 0 L-2 10 M3 0 L3 10" stroke={mix(color, '#000', 0.5)} strokeWidth={1.2} />
    </g>
  );
}

// ---------- built things ----------

/** church façade: two bell towers, central gable, optional dome; `tone` is the wall colour */
export function Church({ x, y, s = 1, tone = '#f1ead9', roof = '#8a5a3a', dome, towers = 2 }: { x: number; y: number; s?: number; tone?: string; roof?: string; dome?: string; towers?: 1 | 2 }) {
  const shade = mix(tone, '#000', 0.18);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* nave */}
      <rect x={-34} y={-40} width={68} height={40} fill={tone} />
      <path d="M-36 -40 L0 -58 L36 -40 Z" fill={roof} />
      {/* towers */}
      <g>
        <rect x={-46} y={-70} width={20} height={70} fill={tone} />
        <rect x={-46} y={-70} width={6} height={70} fill={shade} />
        <path d="M-47 -70 L-36 -86 L-25 -70 Z" fill={roof} />
        <rect x={-39} y={-64} width={6} height={10} fill={shade} />
      </g>
      {towers === 2 && (
        <g>
          <rect x={26} y={-70} width={20} height={70} fill={tone} />
          <rect x={26} y={-70} width={6} height={70} fill={shade} />
          <path d="M25 -70 L36 -86 L47 -70 Z" fill={roof} />
          <rect x={33} y={-64} width={6} height={10} fill={shade} />
        </g>
      )}
      {dome && (
        <g>
          <rect x={-12} y={-66} width={24} height={10} fill={tone} />
          <path d="M-14 -66 Q0 -90 14 -66 Z" fill={dome} />
          <rect x={-1} y={-94} width={2} height={6} fill={roof} />
        </g>
      )}
      {/* door, windows */}
      <path d="M-7 0 L-7 -18 Q0 -26 7 -18 L7 0 Z" fill={shade} />
      <circle cx={0} cy={-42} r={4} fill={shade} />
      {towers === 2 || <rect x={-3} y={-34} width={6} height={8} fill={shade} />}
    </g>
  );
}

/** neo-classical façade with columns and pediment (Teatro Nacional) */
export function Theatre({ x, y, s = 1, tone = '#e9e0cc', accent = '#b9a98a' }: { x: number; y: number; s?: number; tone?: string; accent?: string }) {
  const shade = mix(tone, '#000', 0.2);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-60} y={-52} width={120} height={52} fill={tone} />
      <rect x={-60} y={-52} width={120} height={6} fill={accent} />
      <path d="M-30 -52 L0 -68 L30 -52 Z" fill={accent} />
      <rect x={-26} y={-58} width={52} height={6} fill={tone} />
      {[-44, -26, -8, 10, 28].map((cx) => <rect key={cx} x={cx} y={-46} width={6} height={30} fill={shade} opacity={0.55} />)}
      {[-44, -26, -8, 10, 28].map((cx) => <rect key={'w' + cx} x={cx + 9} y={-40} width={6} height={14} fill={shade} />)}
      <rect x={-60} y={-16} width={120} height={4} fill={accent} />
      <path d="M-6 0 L-6 -12 Q0 -16 6 -12 L6 0 Z" fill={shade} />
      <rect x={-6} y={-78} width={4} height={10} fill={accent} /><rect x={2} y={-80} width={4} height={12} fill={accent} />
      <circle cx={0} cy={-82} r={3} fill={accent} />
    </g>
  );
}

/** a plain modern block (museum / university / station) */
export function Block({ x, y, w = 80, h = 36, tone = '#d9d2c3', roof, windows = 5, glass = '#6f93a6' }: { x: number; y: number; w?: number; h?: number; tone?: string; roof?: string; windows?: number; glass?: string }) {
  const nodes: React.ReactNode[] = [];
  const cw = (w - 10) / windows;
  for (let i = 0; i < windows; i++) nodes.push(<rect key={i} x={x - w / 2 + 5 + i * cw + 2} y={y - h + 8} width={cw - 4} height={h - 16} fill={glass} opacity={0.8} />);
  return (
    <g>
      <rect x={x - w / 2} y={y - h} width={w} height={h} fill={tone} />
      <rect x={x - w / 2} y={y - h} width={w} height={4} fill={roof ?? mix(tone, '#000', 0.25)} />
      {nodes}
    </g>
  );
}

/** El Fortín: round crenellated stone tower */
export function Fortin({ x, y, s = 1, tone = '#c9b9a0' }: { x: number; y: number; s?: number; tone?: string }) {
  const shade = mix(tone, '#000', 0.22);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-16 0 L-15 -60 L15 -60 L16 0 Z" fill={tone} />
      <path d="M4 0 L5 -60 L15 -60 L16 0 Z" fill={shade} />
      <path d="M-17 -60 h5 v-6 h5 v6 h4 v-6 h5 v6 h4 v-6 h5 v6 h4 v6 h-36 z" fill={shade} />
      <path d="M-6 -28 l3 -8 l0 10 l-3 8 z M3 -44 l3 -8 l0 10 l-3 8 z" fill={mix(tone, '#000', 0.5)} />
      <path d="M-5 0 L-5 -12 Q0 -16 5 -12 L5 0 Z" fill={mix(tone, '#000', 0.5)} />
    </g>
  );
}

/** roofless stone church shell with arched windows (Ruinas de Cartago) */
export function Ruins({ x, y, s = 1, tone = '#9a9387' }: { x: number; y: number; s?: number; tone?: string }) {
  const shade = mix(tone, '#000', 0.25), sky = 'rgba(255,255,255,0.35)';
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-50 0 L-50 -44 L-44 -44 L-44 -50 L-34 -50 L-34 -44 L-22 -44 L-22 -50 L-12 -50 L-12 -44 L-6 -44 L0 -64 L6 -44 L12 -44 L12 -50 L22 -50 L22 -44 L34 -44 L34 -50 L44 -50 L44 -44 L50 -44 L50 0 Z" fill={tone} />
      <rect x={44} y={-44} width={6} height={44} fill={shade} />
      {[-36, -18, 18, 36].map((cx) => <path key={cx} d={`M${cx - 5} -4 L${cx - 5} -28 Q${cx} -38 ${cx + 5} -28 L${cx + 5} -4 Z`} fill={sky} />)}
      <path d="M-7 0 L-7 -26 Q0 -40 7 -26 L7 0 Z" fill={shade} />
      <circle cx={0} cy={-50} r={3} fill={sky} />
      <path d="M-40 0 Q-30 -8 -20 0 M10 0 Q22 -10 34 0" fill="#4f9a4a" />
    </g>
  );
}

export function Lighthouse({ x, y, s = 1, tone = '#f4efe4', band = '#d9484f', lit = true }: { x: number; y: number; s?: number; tone?: string; band?: string; lit?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-7 0 L-5 -36 L5 -36 L7 0 Z" fill={tone} />
      <path d="M-6 -12 L-5.5 -20 L5.5 -20 L6 -12 Z" fill={band} />
      <rect x={-6} y={-40} width={12} height={4} fill={mix(tone, '#000', 0.4)} />
      <rect x={-4} y={-48} width={8} height={8} fill={lit ? '#ffe28a' : '#bcd'} />
      <path d="M-6 -50 L0 -55 L6 -50 Z" fill={mix(tone, '#000', 0.4)} />
      {lit && <path d="M4 -46 L60 -60 L60 -32 Z" fill="#ffe28a" opacity={0.25} />}
    </g>
  );
}

/** Sarchí painted oxcart, seen from the side: one big spoked wheel and a bed */
export function Oxcart({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  const spokes: string[] = [];
  for (let i = 0; i < 8; i++) { const a = (i * Math.PI) / 4; spokes.push(`M0 0 L${(Math.cos(a) * 17).toFixed(1)} ${(Math.sin(a) * 17).toFixed(1)}`); }
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* bed */}
      <path d="M-44 -22 L34 -22 L38 -2 L-48 -2 Z" fill="#e8893a" />
      <path d="M-44 -22 L34 -22 L34 -16 L-45 -16 Z" fill="#d9484f" />
      <path d="M-40 -13 L30 -13 L31 -8 L-41 -8 Z" fill="#2a7fa1" />
      <path d="M-30 -20 l3 -6 l3 6 M-12 -20 l3 -6 l3 6 M6 -20 l3 -6 l3 6 M22 -20 l3 -6 l3 6" fill="#fff1b8" />
      <path d="M34 -14 L58 -8 L58 -5 L36 -9 Z" fill="#6b4a2d" />
      {/* wheel */}
      <g transform="translate(-6 0)">
        <circle r={21} fill="#d9484f" />
        <circle r={17} fill="#fff1b8" />
        <path d={spokes.join(' ')} stroke="#2a7fa1" strokeWidth={3} />
        <circle r={8} fill="#e0a526" />
        <circle r={3} fill="#2a1d14" />
        <circle r={21} fill="none" stroke="#e0a526" strokeWidth={1.5} strokeDasharray="4 4" />
      </g>
    </g>
  );
}

export function Bridge({ x, y, w = 120, tone = '#5a4a3a', suspension = false, cable = '#f0e8d8' }: { x: number; y: number; w?: number; tone?: string; suspension?: boolean; cable?: string }) {
  return (
    <g>
      <rect x={x - w / 2} y={y} width={w} height={3} fill={tone} />
      {suspension
        ? <g>
            <path d={`M${x - w / 2} ${y - 6} Q${x} ${y + 10} ${x + w / 2} ${y - 6}`} stroke={tone} strokeWidth={3} fill="none" />
            <path d={`M${x - w / 2} ${y - 16} Q${x} ${y} ${x + w / 2} ${y - 16}`} stroke={cable} strokeWidth={1.2} fill="none" />
            {[0.15, 0.3, 0.45, 0.6, 0.75, 0.9].map((t) => { const u = 1 - t; const dy = u * u * -16 + 2 * u * t * 0 + t * t * -16, dd = u * u * -6 + 2 * u * t * 10 + t * t * -6; const xx = x - w / 2 + w * t; return <path key={t} d={`M${xx} ${y + dy} L${xx} ${y + dd}`} stroke={cable} strokeWidth={0.8} />; })}
            <rect x={x - w / 2 - 2} y={y - 24} width={4} height={32} fill={tone} /><rect x={x + w / 2 - 2} y={y - 24} width={4} height={32} fill={tone} />
          </g>
        : <g>
            {[0.25, 0.5, 0.75].map((t) => <path key={t} d={`M${x - w / 2 + w * t - 12} ${y + 3} Q${x - w / 2 + w * t} ${y + 16} ${x - w / 2 + w * t + 12} ${y + 3} Z`} fill={tone} opacity={0.3} />)}
            <rect x={x - w / 2} y={y - 3} width={w} height={3} fill={mix(tone, '#fff', 0.4)} />
          </g>}
    </g>
  );
}

export function Plane({ x, y, s = 1, color = '#f4f1ea' }: { x: number; y: number; s?: number; color?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill={color}>
      <path d="M-24 0 L20 -2 Q28 -2 26 2 L-20 4 Q-26 3 -24 0 Z" />
      <path d="M-4 0 L10 12 L2 12 L-10 2 Z M-4 -1 L8 -12 L2 -12 L-10 -2 Z" />
      <path d="M-22 1 L-14 -10 L-10 -10 L-14 1 Z" />
      <circle cx={16} cy={1} r={1.4} fill="#2a7fa1" />
    </g>
  );
}

/** cluster of low town houses with a church; `n` houses, spread `w` */
export function Town({ x, y, w = 160, n = 7, seed, tone = '#f1ead9', roof = '#c0533c', church = true, s = 1, churchTone }: { x: number; y: number; w?: number; n?: number; seed: number; tone?: string; roof?: string; church?: boolean; s?: number; churchTone?: string }) {
  const r = prng(seed);
  const houses: React.ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const hx = x - w / 2 + (w * (i + 0.5)) / n + (r() - 0.5) * 8;
    const hw = 16 + r() * 12, hh = 10 + r() * 8;
    const t = i % 3 === 1 ? mix(tone, '#e0a526', 0.25) : i % 3 === 2 ? mix(tone, '#2cb1a6', 0.2) : tone;
    houses.push(
      <g key={i} transform={`translate(${hx} ${y}) scale(${s})`}>
        <rect x={-hw / 2} y={-hh} width={hw} height={hh} fill={t} />
        <path d={`M${-hw / 2 - 2} ${-hh} L0 ${-hh - 7} L${hw / 2 + 2} ${-hh} Z`} fill={roof} />
        <rect x={-2} y={-hh * 0.55} width={4} height={hh * 0.55} fill={mix(t, '#000', 0.4)} />
      </g>,
    );
  }
  return <g>{houses}{church && <Church x={x + w * 0.05} y={y} s={0.5 * s} tone={churchTone ?? tone} roof={roof} />}</g>;
}

export function ClockTower({ x, y, s = 1, tone = '#e8dcc0' }: { x: number; y: number; s?: number; tone?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-8} y={-56} width={16} height={56} fill={tone} />
      <rect x={3} y={-56} width={5} height={56} fill={mix(tone, '#000', 0.2)} />
      <path d="M-10 -56 L0 -70 L10 -56 Z" fill="#8a5a3a" />
      <circle cx={0} cy={-46} r={5} fill="#fff" />
      <path d="M0 -46 L0 -50 M0 -46 L3 -45" stroke="#2a1d14" strokeWidth={1} />
    </g>
  );
}

/** Caribbean wooden hall with verandas (Black Star Line) */
export function WoodHall({ x, y, s = 1, tone = '#3f8f5a', trim = '#f4f1ea' }: { x: number; y: number; s?: number; tone?: string; trim?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-50} y={-56} width={100} height={56} fill={tone} />
      <rect x={-54} y={-62} width={108} height={8} fill="#8a3a2a" />
      <rect x={-54} y={-30} width={108} height={4} fill={trim} />
      {[-40, -22, 14, 32].map((cx) => <rect key={cx} x={cx} y={-52} width={8} height={16} fill={trim} opacity={0.9} />)}
      {[-40, -22, 14, 32].map((cx) => <rect key={'l' + cx} x={cx} y={-24} width={8} height={16} fill={trim} opacity={0.9} />)}
      {[-50, -26, 26, 50].map((cx) => <rect key={'p' + cx} x={cx - 1.5} y={-56} width={3} height={56} fill={trim} />)}
      <path d="M-6 0 L-6 -20 L6 -20 L6 0 Z" fill="#2a1d14" opacity={0.6} />
      <rect x={-20} y={-74} width={40} height={12} fill={tone} /><rect x={-22} y={-76} width={44} height={3} fill="#8a3a2a" />
    </g>
  );
}

/** castle-like crenellated prison front (Museo de los Niños) */
export function Castle({ x, y, s = 1, tone = '#e9d79a', accent = '#2a7fa1' }: { x: number; y: number; s?: number; tone?: string; accent?: string }) {
  const shade = mix(tone, '#000', 0.2);
  const cren = (cx: number, w: number, top: number) => `M${cx - w / 2} ${top} h5 v-5 h5 v5 h5 v-5 h5 v5 h5 v-5 h5 v5 h${w - 30} v6 h-${w} z`;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-70} y={-40} width={140} height={40} fill={tone} />
      <rect x={-78} y={-62} width={26} height={62} fill={tone} /><rect x={52} y={-62} width={26} height={62} fill={tone} />
      <rect x={-78} y={-62} width={6} height={62} fill={shade} /><rect x={52} y={-62} width={6} height={62} fill={shade} />
      <path d={cren(-65, 30, -62) + cren(65, 30, -62)} fill={shade} />
      <path d="M-50 -40 h10 v-5 h5 v5 h10 v-5 h5 v5 h10 v-5 h5 v5 h10 v-5 h5 v5 h10 v-5 h5 v5 h10 v-5 h5 v5 h10 v4 h-100 z" fill={shade} />
      <path d="M-12 0 L-12 -24 Q0 -36 12 -24 L12 0 Z" fill={accent} />
      {[-40, -26, 26, 40].map((cx) => <rect key={cx} x={cx - 3} y={-30} width={6} height={12} fill={shade} />)}
      <rect x={-68} y={-50} width={6} height={10} fill={shade} /><rect x={62} y={-50} width={6} height={10} fill={shade} />
      <rect x={-20} y={-6} width={40} height={6} fill="#d9484f" />
    </g>
  );
}

export function CaveMouth({ x, y, s = 1, rock = '#8a7b66', dark = '#241c18' }: { x: number; y: number; s?: number; rock?: string; dark?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-70 0 L-66 -30 Q-50 -62 -10 -66 Q40 -70 66 -36 L70 0 Z" fill={rock} />
      <path d="M-40 0 Q-36 -36 -8 -40 Q26 -44 40 -16 Q44 -6 42 0 Z" fill={dark} />
      <path d="M-20 -36 l3 12 l3 -12 M0 -40 l3 16 l3 -16 M18 -34 l2 9 l3 -9" fill={mix(rock, '#fff', 0.2)} />
      <path d="M-14 0 l2 -8 l2 8 M8 0 l3 -12 l3 12" fill={mix(rock, '#fff', 0.2)} />
    </g>
  );
}

/** Guayabo: stone mounds (montículos) and a cobbled causeway */
export function Mounds({ x, y, s = 1, grass = '#7fb050', stone = '#8f8779' }: { x: number; y: number; s?: number; grass?: string; stone?: string }) {
  const ring = (cx: number, cy: number, rx: number) => (
    <g key={cx}>
      <ellipse cx={cx} cy={cy} rx={rx} ry={rx * 0.3} fill={stone} />
      <ellipse cx={cx} cy={cy - 3} rx={rx - 3} ry={(rx - 3) * 0.3} fill={grass} />
      <ellipse cx={cx} cy={cy - 4} rx={rx * 0.55} ry={rx * 0.16} fill={stone} />
      <ellipse cx={cx} cy={cy - 6} rx={rx * 0.55 - 2} ry={rx * 0.16 - 1} fill={grass} />
      <path d={`M${cx - rx * 0.1} ${cy + rx * 0.3} l${rx * 0.2} 0 l-2 -8 l-${rx * 0.2 - 4} 0 z`} fill={stone} opacity={0.8} />
    </g>
  );
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-14 0 L14 0 L5 -44 L-5 -44 Z" fill={mix(stone, '#fff', 0.12)} />
      <path d="M-11 -6 h22 M-9 -14 h18 M-8 -22 h16 M-6 -30 h12 M-5 -38 h10" stroke={mix(stone, '#000', 0.22)} strokeWidth={1} />
      {ring(-54, -10, 36)}
      {ring(50, -8, 32)}
      {ring(0, -44, 20)}
    </g>
  );
}

/** rock stacks / sea stacks */
export function Rocks({ x, y, s = 1, color = '#4a4440', seed }: { x: number; y: number; s?: number; color?: string; seed: number }) {
  const r = prng(seed);
  const d: string[] = [];
  for (let i = 0; i < 3; i++) { const ox = (i - 1) * 18 + (r() - 0.5) * 8, h = 8 + r() * 12, w = 10 + r() * 10; d.push(`M${ox - w / 2} 0 Q${ox - w * 0.3} ${-h} ${ox + w * 0.1} ${-h} Q${ox + w / 2} ${-h * 0.6} ${ox + w / 2} 0 Z`); }
  return <path transform={`translate(${x} ${y}) scale(${s})`} d={d.join(' ')} fill={color} />;
}

export function Sailboat({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return <Boat x={x} y={y} s={s} sail />;
}
