// A dish presented on a table: warm backdrop (wood grain or a banana leaf), a cloth placemat, the plate from
// DISH_ART and two or three small props that suit the dish. Same sticker rules as the dishes (docs/ART_STYLE.md).
import type { CSSProperties } from 'react';
import { DISH_ART } from '../../journey/dishes';

const INK = '#2a1d14';

/** deterministic pseudo-random for the wood grain / leaf veins */
function prng(seed: number) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

function Wood({ p }: { p: string }) {
  const rnd = prng(19);
  const lines: React.ReactNode[] = [];
  for (let y = 10; y < 400; y += 12 + rnd() * 10) {
    const amp = 2 + rnd() * 5;
    lines.push(<path key={y} d={`M-10 ${y} C 120 ${y - amp}, 240 ${y + amp}, 360 ${y - amp * 0.6} S 520 ${y + amp}, 540 ${y}`} fill="none" stroke="#4e2e18" strokeWidth={1 + rnd() * 1.4} opacity={0.18 + rnd() * 0.18} />);
  }
  return (
    <g>
      <rect x={0} y={0} width={520} height={400} fill={`url(#${p}-wood)`} />
      <g>{lines}</g>
      {/* plank seams */}
      <g stroke="#3c2213" strokeWidth={3} opacity={0.5}><line x1={0} y1={100} x2={520} y2={100} /><line x1={0} y1={236} x2={520} y2={236} /><line x1={0} y1={360} x2={520} y2={360} /></g>
      <g stroke="#9a6a40" strokeWidth={1.2} opacity={0.45}><line x1={0} y1={103} x2={520} y2={103} /><line x1={0} y1={239} x2={520} y2={239} /><line x1={0} y1={363} x2={520} y2={363} /></g>
      {/* a knot */}
      <ellipse cx={452} cy={60} rx={16} ry={9} fill="none" stroke="#4e2e18" strokeWidth={2} opacity={0.4} />
      <ellipse cx={452} cy={60} rx={8} ry={4} fill="#4e2e18" opacity={0.35} />
      <rect x={0} y={0} width={520} height={400} fill={`url(#${p}-light)`} />
    </g>
  );
}

function Leaf({ p }: { p: string }) {
  const veins: React.ReactNode[] = [];
  for (let x = -40; x < 580; x += 22) {
    veins.push(<path key={x} d={`M${x} 0 L ${x + 70} 400`} stroke="#2a5a24" strokeWidth={1.6} opacity={0.5} />);
    veins.push(<path key={x + 'b'} d={`M${x + 11} 0 L ${x + 81} 400`} stroke="#7fbf5a" strokeWidth={1} opacity={0.35} />);
  }
  return (
    <g>
      <rect x={0} y={0} width={520} height={400} fill={`url(#${p}-leaf)`} />
      <g>{veins}</g>
      {/* midrib */}
      <path d="M-20 300 C 160 220, 380 160, 540 110" fill="none" stroke="#1e4218" strokeWidth={14} opacity={0.6} strokeLinecap="round" />
      <path d="M-20 296 C 160 216, 380 156, 540 106" fill="none" stroke="#9ccf6a" strokeWidth={3} opacity={0.5} strokeLinecap="round" />
      {/* a torn edge at one corner */}
      <path d="M520 0 L 520 60 C 500 54, 490 30, 470 40 C 460 18, 440 20, 436 0 Z" fill="#2f6b3a" opacity={0.8} />
      <rect x={0} y={0} width={520} height={400} fill={`url(#${p}-light)`} />
    </g>
  );
}

function Placemat({ p, hue }: { p: string; hue: string }) {
  return (
    <g>
      <ellipse cx={262} cy={228} rx={214} ry={132} fill="rgba(20,10,5,0.28)" />
      <ellipse cx={256} cy={218} rx={212} ry={130} fill={hue} stroke={INK} strokeWidth={2.5} />
      <ellipse cx={256} cy={218} rx={196} ry={118} fill="none" stroke="#ffffff" strokeWidth={2} opacity={0.5} strokeDasharray="10 8" />
      <ellipse cx={256} cy={218} rx={212} ry={130} fill={`url(#${p}-weave)`} />
    </g>
  );
}

/* ---------- props ---------- */
function Fork({ x, y, rot = 0, s = 1 }: { x: number; y: number; rot?: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <path d="M-6 60 L 6 60 L 5 -10 L -5 -10 Z" fill="#cfd3d6" stroke={INK} strokeWidth={2.4} strokeLinejoin="round" transform="translate(3 4)" opacity={0.3} />
      <path d="M-6 60 L 6 60 L 5 -10 L -5 -10 Z" fill="#dfe3e6" stroke={INK} strokeWidth={2.4} strokeLinejoin="round" />
      <path d="M-12 -12 C -12 -36, -10 -48, -10 -58 L -4 -58 L -4 -24 L 0 -24 L 0 -58 L 4 -58 L 4 -24 L 8 -24 L 8 -58 L 11 -58 C 12 -46, 12 -32, 12 -12 C 12 -4, -12 -4, -12 -12 Z" fill="#dfe3e6" stroke={INK} strokeWidth={2.4} strokeLinejoin="round" />
      <path d="M-2 50 L -2 0" stroke="#ffffff" strokeWidth={2.4} strokeLinecap="round" opacity={0.8} />
    </g>
  );
}

function Napkin({ x, y, rot = 0, color = '#d9484f' }: { x: number; y: number; rot?: number; color?: string }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <path d="M-30 -40 L 30 -40 L 30 40 L -30 40 Z" fill="rgba(20,10,5,0.25)" transform="translate(4 5)" />
      <path d="M-30 -40 L 30 -40 L 30 40 L -30 40 Z" fill={color} stroke={INK} strokeWidth={2.4} strokeLinejoin="round" />
      <path d="M-30 -40 L 30 -40 L 30 -14 L -30 -14 Z" fill="#ffffff" opacity={0.25} />
      <path d="M-30 14 L 30 14" stroke={INK} strokeWidth={1.6} opacity={0.5} />
      <path d="M-30 -14 L 30 -14" stroke="#ffffff" strokeWidth={1.6} opacity={0.6} />
      <g stroke="#ffffff" strokeWidth={1.6} opacity={0.7}><path d="M-22 -30 h 44 M-22 -24 h 44" /></g>
    </g>
  );
}

/** a glass of agua dulce (cane-sugar water) */
function Glass({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={4} cy={34} rx={28} ry={11} fill="rgba(20,10,5,0.3)" />
      <path d="M-22 -40 L -18 30 C -18 36, 18 36, 18 30 L 22 -40 Z" fill="#c98a2c" stroke={INK} strokeWidth={2.4} strokeLinejoin="round" />
      <path d="M-22 -40 L -20 -16 L 20 -16 L 22 -40 Z" fill="#e8f1f5" opacity={0.75} />
      <ellipse cx={0} cy={-40} rx={22} ry={8} fill="#e9f3f7" stroke={INK} strokeWidth={2.4} />
      <ellipse cx={0} cy={-16} rx={20} ry={6} fill="#e0a526" opacity={0.9} />
      <path d="M-14 -30 L -11 24" stroke="#ffffff" strokeWidth={3} strokeLinecap="round" opacity={0.7} />
      <path d="M12 -8 L 10 20" stroke="#ffffff" strokeWidth={2} strokeLinecap="round" opacity={0.4} />
    </g>
  );
}

function Hibiscus({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  const petal = (a: number) => <path key={a} d="M0 0 C 8 -14, 24 -22, 32 -10 C 36 -2, 24 8, 0 0 Z" fill="#d9484f" stroke={INK} strokeWidth={2} transform={`rotate(${a})`} />;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-30 20 C -10 10, 10 12, 26 26 C 10 34, -14 34, -30 20 Z" fill="#2f6b3a" stroke={INK} strokeWidth={2} />
      <path d="M-26 22 L 22 26" stroke="#8cc04b" strokeWidth={1.6} />
      {[0, 72, 144, 216, 288].map(petal)}
      {[0, 72, 144, 216, 288].map((a) => <path key={'h' + a} d="M6 -2 C 12 -10, 22 -14, 26 -8" fill="none" stroke="#f08a8a" strokeWidth={3} strokeLinecap="round" transform={`rotate(${a})`} />)}
      <path d="M0 0 L 10 -26" stroke="#e0a526" strokeWidth={3.5} strokeLinecap="round" />
      <circle cx={10} cy={-27} r={4} fill="#f6d04a" stroke={INK} strokeWidth={1.4} />
      <circle cx={0} cy={0} r={4} fill="#8b1e2a" />
    </g>
  );
}

function LizanoBottle({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={4} cy={46} rx={22} ry={9} fill="rgba(20,10,5,0.3)" />
      <path d="M-8 -50 L 8 -50 L 8 -34 C 18 -28, 20 -16, 20 0 L 20 36 C 20 44, -20 44, -20 36 L -20 0 C -20 -16, -18 -28, -8 -34 Z" fill="#7a4a1a" stroke={INK} strokeWidth={2.4} strokeLinejoin="round" />
      <rect x={-16} y={-4} width={32} height={30} rx={3} fill="#e8d6a8" stroke={INK} strokeWidth={1.6} />
      <rect x={-12} y={2} width={24} height={6} rx={2} fill="#2f6b3a" />
      <rect x={-12} y={12} width={24} height={4} rx={2} fill="#d9484f" />
      <rect x={-10} y={-56} width={20} height={10} rx={3} fill="#e0a526" stroke={INK} strokeWidth={2} />
      <path d="M-14 -24 L -14 32" stroke="#ffffff" strokeWidth={3} strokeLinecap="round" opacity={0.35} />
    </g>
  );
}

function Spoon({ x, y, rot = 0, s = 1 }: { x: number; y: number; rot?: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <path d="M-5 60 L 5 60 L 5 -14 L -5 -14 Z" fill="#dfe3e6" stroke={INK} strokeWidth={2.4} strokeLinejoin="round" />
      <ellipse cx={0} cy={-34} rx={14} ry={22} fill="#dfe3e6" stroke={INK} strokeWidth={2.4} />
      <ellipse cx={-3} cy={-38} rx={7} ry={13} fill="#ffffff" opacity={0.7} />
    </g>
  );
}

function Lime({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={3} cy={4} rx={18} ry={16} fill="rgba(20,10,5,0.3)" />
      <circle cx={0} cy={0} r={17} fill="#8cc04b" stroke={INK} strokeWidth={2.4} />
      <ellipse cx={-6} cy={-6} rx={7} ry={5} fill="#cfe3a0" opacity={0.9} />
      <circle cx={10} cy={6} r={2} fill="#4f9a4a" />
    </g>
  );
}

const PROPS: Record<string, () => React.JSX.Element> = {
  'gallo-pinto': () => (<g><Fork x={62} y={210} rot={-8} /><Napkin x={70} y={312} rot={-14} color="#2a7fa1" /><LizanoBottle x={462} y={132} s={0.8} /></g>),
  casado: () => (<g><Fork x={34} y={212} rot={-6} s={0.9} /><Glass x={468} y={300} s={0.9} /><Napkin x={60} y={326} rot={12} color="#d9484f" /></g>),
  tamal: () => (<g><Napkin x={66} y={306} rot={-10} color="#8e4a9e" /><Fork x={44} y={180} rot={-10} s={0.85} /><Hibiscus x={448} y={56} s={0.7} /></g>),
  'olla-de-carne': () => (<g><Spoon x={54} y={214} rot={-6} /><Napkin x={450} y={318} rot={16} color="#e8893a" /><Lime x={430} y={78} s={0.9} /></g>),
  'rice-and-beans': () => (<g><Hibiscus x={456} y={64} s={0.9} /><Fork x={56} y={226} rot={-12} s={0.9} /><Glass x={470} y={318} s={0.85} /></g>),
};

const MAT: Record<string, string> = {
  'gallo-pinto': '#e8d6a8', casado: '#cfe3a0', tamal: '#e8c9a8', 'olla-de-carne': '#dcd0b8', 'rice-and-beans': '#8fd3cf',
};

export function DishCard({ id, size = 320, title, className, style, backdrop = 'wood' }: { id: string; size?: number | string; title?: string; className?: string; style?: CSSProperties; backdrop?: 'wood' | 'leaf' | 'none' }) {
  const Art = DISH_ART[id];
  const Props = PROPS[id];
  const p = `pv-dish-${id}`;
  const a11y = title ? { role: 'img', 'aria-label': title } : { 'aria-hidden': true as const };
  // the dish is drawn in -260..260 × -200..200; fit it inside the placemat with a little margin
  const scale = backdrop === 'none' ? 1 : 0.82;
  return (
    <svg viewBox="0 0 520 400" width={size} height={typeof size === 'number' ? (size * 400) / 520 : undefined} className={className} style={style} focusable="false" {...a11y}>
      <defs>
        <linearGradient id={`${p}-wood`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8a5632" /><stop offset="0.5" stopColor="#7a4a2a" /><stop offset="1" stopColor="#5f381f" />
        </linearGradient>
        <linearGradient id={`${p}-leaf`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#4f9a4a" /><stop offset="0.6" stopColor="#3f7a34" /><stop offset="1" stopColor="#2f6b3a" />
        </linearGradient>
        <radialGradient id={`${p}-light`} cx="0.35" cy="0.3" r="0.9">
          <stop offset="0" stopColor="#ffe3b0" stopOpacity="0.28" /><stop offset="0.6" stopColor="#ffe3b0" stopOpacity="0" /><stop offset="1" stopColor="#000000" stopOpacity="0.35" />
        </radialGradient>
        <pattern id={`${p}-weave`} width="8" height="8" patternUnits="userSpaceOnUse">
          <path d="M0 4 H 8 M4 0 V 8" stroke="#2a1d14" strokeWidth="0.8" opacity="0.1" />
        </pattern>
      </defs>
      {backdrop === 'wood' && <Wood p={p} />}
      {backdrop === 'leaf' && <Leaf p={p} />}
      {backdrop !== 'none' && <Placemat p={p} hue={MAT[id] ?? '#e8d6a8'} />}
      {Art && (
        <g transform={`translate(260 ${backdrop === 'none' ? 200 : 210}) scale(${scale})`}>
          <Art />
        </g>
      )}
      {backdrop !== 'none' && Props && <Props />}
    </svg>
  );
}
