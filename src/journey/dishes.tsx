// Illustrated dishes for the "Flavors" chapter: ink outlines and flat painterly fills, in the register of the
// site's illustrated plates. Each dish is drawn in its own local coordinate system (0,0 at its centre).
// Purely visual — the accessible controls are DOM buttons placed over them (FlavorsTable.tsx).

const INK = '#2a1d14';

/** deterministic pseudo-random, so the bean dots are the same on every render */
function prng(seed: number) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

function Dots({ n, rx, ry, seed, colors, r = 4 }: { n: number; rx: number; ry: number; seed: number; colors: string[]; r?: number }) {
  const rnd = prng(seed);
  const dots: React.ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const a = rnd() * Math.PI * 2;
    const d = Math.sqrt(rnd());
    const x = Math.cos(a) * rx * d;
    const y = Math.sin(a) * ry * d;
    const rr = r * (0.7 + rnd() * 0.7);
    dots.push(<ellipse key={i} cx={x} cy={y} rx={rr} ry={rr * 0.7} fill={colors[i % colors.length]} transform={`rotate(${rnd() * 180} ${x} ${y})`} />);
  }
  return <>{dots}</>;
}

function Plate({ r, rim = '#8fb27e' }: { r: number; rim?: string }) {
  return (
    <>
      <ellipse cx={6} cy={10} rx={r} ry={r * 0.72} fill="rgba(20,10,5,0.35)" />
      <ellipse cx={0} cy={0} rx={r} ry={r * 0.72} fill="#f5efe2" stroke={INK} strokeWidth={3} />
      <ellipse cx={0} cy={0} rx={r * 0.86} ry={r * 0.6} fill="none" stroke={rim} strokeWidth={5} opacity={0.9} />
      <ellipse cx={0} cy={0} rx={r * 0.8} ry={r * 0.55} fill="#fbf7ee" />
    </>
  );
}

function Plantain({ x, y, rot = 0, s = 1 }: { x: number; y: number; rot?: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <ellipse cx={0} cy={0} rx={30} ry={14} fill="#d99a2b" stroke={INK} strokeWidth={2.5} />
      <ellipse cx={-4} cy={-3} rx={16} ry={6} fill="#f0c45a" opacity={0.9} />
      <path d="M-22 6 Q0 14 22 6" fill="none" stroke="#8c5a1a" strokeWidth={2.5} opacity={0.8} />
    </g>
  );
}

function Tortilla({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx={0} cy={0} rx={62} ry={26} fill="#efd9a6" stroke={INK} strokeWidth={2.5} />
      <Dots n={14} rx={50} ry={18} seed={9} colors={['#d9b874', '#c9a25c']} r={3} />
    </g>
  );
}

export function GalloPinto() {
  return (
    <g>
      <Plate r={170} />
      <Tortilla x={-70} y={40} />
      {/* the pinto mound */}
      <ellipse cx={10} cy={-6} rx={110} ry={60} fill="#e4d2a8" stroke={INK} strokeWidth={3} />
      <ellipse cx={0} cy={-18} rx={70} ry={28} fill="#efe1bc" />
      <Dots n={160} rx={100} ry={52} seed={3} colors={['#5a2c22', '#7a3a2a', '#4a2219', '#8d4a36']} r={4.5} />
      <Dots n={26} rx={96} ry={50} seed={11} colors={['#5f8c3a', '#8aa64a']} r={2.4} />
      {/* fried egg */}
      <g transform="translate(96 30)">
        <path d="M-40 -8 C -46 -30, -8 -40, 14 -30 C 44 -18, 46 10, 26 22 C 6 34, -30 30, -40 12 Z" fill="#fbf6ee" stroke={INK} strokeWidth={2.5} />
        <circle cx={-6} cy={-2} r={15} fill="#f2b32a" stroke="#d48c12" strokeWidth={2} />
        <circle cx={-10} cy={-6} r={4} fill="#fbd97a" />
      </g>
      <Plantain x={-110} y={-30} rot={-18} />
      <Plantain x={-96} y={-2} rot={-10} s={0.9} />
      {/* natilla */}
      <ellipse cx={120} cy={-40} rx={22} ry={13} fill="#fbf7ee" stroke={INK} strokeWidth={2.2} />
      <ellipse cx={116} cy={-44} rx={10} ry={5} fill="#ffffff" />
      {/* cilantro */}
      <path d="M-20 -62 l10 -14 l6 12 l10 -12 l2 14" fill="none" stroke="#3f7a3a" strokeWidth={3} strokeLinecap="round" />
    </g>
  );
}

export function Casado() {
  return (
    <g>
      <ellipse cx={8} cy={14} rx={236} ry={150} fill="rgba(20,10,5,0.35)" />
      <ellipse cx={0} cy={0} rx={236} ry={150} fill="#f5efe2" stroke={INK} strokeWidth={3} />
      <ellipse cx={0} cy={0} rx={212} ry={130} fill="none" stroke="#c8793a" strokeWidth={5} opacity={0.85} />
      <ellipse cx={0} cy={0} rx={200} ry={120} fill="#fbf7ee" />
      {/* white rice */}
      <ellipse cx={-110} cy={-30} rx={74} ry={44} fill="#f6f0dc" stroke={INK} strokeWidth={2.5} />
      <Dots n={70} rx={64} ry={36} seed={21} colors={['#e9e0c4', '#fffaf0']} r={3} />
      {/* black beans */}
      <path d="M-150 40 C -140 10, -60 10, -40 36 C -30 60, -70 84, -110 80 C -150 76, -162 60, -150 40 Z" fill="#2b1a1a" stroke={INK} strokeWidth={2.5} />
      <Dots n={40} rx={48} ry={28} seed={5} colors={['#3d2626', '#1c1010', '#4d3030']} r={4} />
      <ellipse cx={-120} cy={44} rx={14} ry={6} fill="#5a4040" opacity={0.6} />
      {/* salad */}
      <g transform="translate(30 -42)">
        <path d="M-60 10 C -50 -30, 0 -40, 40 -20 C 70 -4, 60 36, 20 40 C -20 44, -64 40, -60 10 Z" fill="#7fb35a" stroke={INK} strokeWidth={2.5} />
        <path d="M-40 6 C -20 -16, 10 -20, 30 -6" fill="none" stroke="#5c8f3b" strokeWidth={3} />
        <path d="M-50 20 C -30 4, 0 0, 24 14" fill="none" stroke="#5c8f3b" strokeWidth={3} />
        <path d="M-18 -4 l 22 -10 l 8 16 z" fill="#d94b3a" stroke={INK} strokeWidth={2} />
        <path d="M14 18 l 20 -8 l 6 14 z" fill="#d94b3a" stroke={INK} strokeWidth={2} />
        <path d="M-30 26 c 10 -4 24 -4 36 2" fill="none" stroke="#cfe3a0" strokeWidth={4} strokeLinecap="round" />
      </g>
      {/* chicken */}
      <g transform="translate(120 20)">
        <path d="M-60 -24 C -40 -58, 30 -56, 54 -26 C 70 -6, 56 34, 20 42 C -20 50, -70 30, -60 -24 Z" fill="#b5692c" stroke={INK} strokeWidth={2.8} />
        <path d="M-46 -20 C -20 -36, 20 -36, 44 -20" fill="none" stroke="#7e4216" strokeWidth={4} strokeLinecap="round" />
        <path d="M-50 2 C -20 -10, 20 -10, 46 0" fill="none" stroke="#7e4216" strokeWidth={4} strokeLinecap="round" />
        <path d="M-42 22 C -16 12, 14 12, 36 22" fill="none" stroke="#7e4216" strokeWidth={4} strokeLinecap="round" />
        <ellipse cx={-14} cy={-28} rx={16} ry={7} fill="#e2a062" opacity={0.8} />
      </g>
      <Plantain x={10} y={70} rot={12} />
      <Plantain x={60} y={84} rot={8} s={0.9} />
      <Plantain x={-30} y={86} rot={20} s={0.85} />
      {/* lime wedge */}
      <g transform="translate(160 -70) rotate(-20)">
        <path d="M0 0 L 46 -16 A 50 50 0 0 1 46 16 Z" fill="#cfe36a" stroke={INK} strokeWidth={2.2} />
        <path d="M0 0 L 46 -16 A 50 50 0 0 1 46 16 Z" fill="none" stroke="#7aa52a" strokeWidth={4} />
      </g>
      <Tortilla x={150} y={92} />
    </g>
  );
}

export function Tamales() {
  const Parcel = ({ x, y, rot, open }: { x: number; y: number; rot: number; open?: boolean }) => (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <rect x={-96} y={-56} width={192} height={112} rx={18} fill="rgba(20,10,5,0.32)" transform="translate(8 10)" />
      <rect x={-96} y={-56} width={192} height={112} rx={18} fill="#4f7f3b" stroke={INK} strokeWidth={3} />
      <path d="M-70 -56 L -70 56 M 70 -56 L 70 56" stroke="#2f5a26" strokeWidth={3} opacity={0.8} />
      <path d="M-96 -20 L 96 -20 M -96 20 L 96 20" stroke="#6ea553" strokeWidth={2} opacity={0.6} />
      <path d="M-96 0 L 96 0" stroke="#3b6a2d" strokeWidth={3} opacity={0.5} />
      {/* twine */}
      <path d="M-96 -12 L 96 -12 M -96 12 L 96 12" stroke="#d9c492" strokeWidth={4} />
      <path d="M-4 -12 c 6 4 6 20 0 24 M 4 -12 c -6 4 -6 20 0 24" fill="none" stroke="#d9c492" strokeWidth={4} />
      {open && (
        <g>
          <path d="M-60 -56 C -70 -40, -74 10, -60 56 L 60 56 C 72 10, 70 -40, 60 -56 Z" fill="#e4b659" stroke={INK} strokeWidth={2.6} />
          <Dots n={60} rx={52} ry={44} seed={17} colors={['#f0cc7a', '#d9a53f']} r={3.5} />
          <path d="M-30 -18 C -10 -30, 20 -28, 34 -12 C 40 6, 20 22, -4 22 C -26 22, -40 2, -30 -18 Z" fill="#8c5a3c" stroke={INK} strokeWidth={2.2} />
          <circle cx={-34} cy={22} r={9} fill="#e8812a" stroke={INK} strokeWidth={2} />
          <circle cx={30} cy={30} r={6} fill="#6fae3e" stroke={INK} strokeWidth={1.8} />
          <circle cx={42} cy={16} r={6} fill="#6fae3e" stroke={INK} strokeWidth={1.8} />
          <path d="M-46 -34 l 30 -6" stroke="#d2402f" strokeWidth={6} strokeLinecap="round" />
        </g>
      )}
    </g>
  );
  return (
    <g>
      {/* a banana leaf under the parcels */}
      <path d="M-240 60 C -200 -80, 180 -110, 250 -10 C 200 90, -120 130, -240 60 Z" fill="#3f6f32" stroke={INK} strokeWidth={3} />
      <path d="M-230 50 C -140 -20, 140 -60, 240 -10" fill="none" stroke="#2c5424" strokeWidth={4} />
      <g stroke="#5a9144" strokeWidth={1.8} opacity={0.7}>
        <path d="M-180 20 l 30 -40 M-130 0 l 30 -46 M-80 -16 l 30 -50 M-30 -30 l 28 -52 M20 -40 l 26 -54 M70 -46 l 26 -54 M120 -46 l 24 -50" />
      </g>
      <Parcel x={-70} y={10} rot={-10} />
      <Parcel x={76} y={-6} rot={8} open />
    </g>
  );
}

export function OllaDeCarne() {
  return (
    <g>
      <ellipse cx={8} cy={30} rx={190} ry={120} fill="rgba(20,10,5,0.35)" />
      {/* the pot */}
      <path d="M-170 -10 C -176 60, -120 108, 0 108 C 120 108, 176 60, 170 -10 Z" fill="#8f4d31" stroke={INK} strokeWidth={3} />
      <path d="M-150 20 C -120 70, 120 70, 150 20" fill="none" stroke="#5e2f1d" strokeWidth={4} opacity={0.6} />
      <ellipse cx={0} cy={-10} rx={172} ry={64} fill="#a95b39" stroke={INK} strokeWidth={3} />
      <ellipse cx={0} cy={-10} rx={150} ry={52} fill="#c5873a" stroke={INK} strokeWidth={2.5} />
      <ellipse cx={-30} cy={-24} rx={60} ry={16} fill="#dba04e" opacity={0.6} />
      {/* handles */}
      <path d="M-170 -4 C -210 -8, -210 36, -172 32" fill="none" stroke={INK} strokeWidth={14} strokeLinecap="round" />
      <path d="M-170 -4 C -210 -8, -210 36, -172 32" fill="none" stroke="#8f4d31" strokeWidth={9} strokeLinecap="round" />
      <path d="M170 -4 C 210 -8, 210 36, 172 32" fill="none" stroke={INK} strokeWidth={14} strokeLinecap="round" />
      <path d="M170 -4 C 210 -8, 210 36, 172 32" fill="none" stroke="#8f4d31" strokeWidth={9} strokeLinecap="round" />
      {/* the pieces */}
      <g transform="translate(-70 -16)">
        <ellipse cx={0} cy={0} rx={30} ry={18} fill="#e6c54a" stroke={INK} strokeWidth={2.4} />
        <g fill="#f3da78" stroke="#b89426" strokeWidth={1}>
          <circle cx={-18} cy={-6} r={4} /><circle cx={-6} cy={-8} r={4} /><circle cx={6} cy={-8} r={4} /><circle cx={18} cy={-6} r={4} />
          <circle cx={-16} cy={4} r={4} /><circle cx={-4} cy={4} r={4} /><circle cx={8} cy={4} r={4} /><circle cx={19} cy={4} r={4} />
        </g>
      </g>
      <path d="M-10 -30 C 10 -46, 44 -40, 50 -22 C 54 -8, 30 2, 10 -2 C -10 2, -24 -14, -10 -30 Z" fill="#6b3a2a" stroke={INK} strokeWidth={2.4} />
      <path d="M60 -28 C 80 -36, 110 -30, 112 -14 C 112 -2, 84 4, 68 -2 Z" fill="#e07b2a" stroke={INK} strokeWidth={2.2} />
      <ellipse cx={-110} cy={-2} rx={26} ry={14} fill="#f0e0b8" stroke={INK} strokeWidth={2.2} />
      <ellipse cx={96} cy={10} rx={28} ry={14} fill="#bcd48a" stroke={INK} strokeWidth={2.2} />
      <path d="M-50 12 C -30 2, 10 2, 36 16" fill="none" stroke="#e8c04a" strokeWidth={10} strokeLinecap="round" />
      <path d="M-50 12 C -30 2, 10 2, 36 16" fill="none" stroke={INK} strokeWidth={1.4} opacity={0.5} />
      <path d="M26 -46 l8 -14 l6 12 l10 -14 l2 16" fill="none" stroke="#3f7a3a" strokeWidth={3} strokeLinecap="round" />
      {/* steam */}
      <g className="dish__steam" fill="none" stroke="#ffffff" strokeWidth={5} strokeLinecap="round" opacity={0.5}>
        <path d="M-40 -90 c -14 -20, 14 -34, 0 -54" />
        <path d="M10 -100 c -14 -20, 14 -34, 0 -54" />
        <path d="M60 -86 c -14 -20, 14 -34, 0 -54" />
      </g>
    </g>
  );
}

export function RiceAndBeans() {
  return (
    <g>
      <Plate r={180} rim="#c8793a" />
      {/* the bowl */}
      <ellipse cx={-20} cy={-10} rx={118} ry={74} fill="#2f4d42" stroke={INK} strokeWidth={3} />
      <ellipse cx={-20} cy={-26} rx={104} ry={54} fill="#9d5a34" stroke={INK} strokeWidth={2.6} />
      <ellipse cx={-30} cy={-34} rx={60} ry={24} fill="#b56f42" opacity={0.7} />
      <Dots n={110} rx={94} ry={46} seed={31} colors={['#5a2c22', '#6f3b2c', '#4a2219']} r={4.5} />
      <Dots n={60} rx={90} ry={44} seed={37} colors={['#d9b982', '#e8cf9e']} r={2.6} />
      {/* chicken caribeño */}
      <g transform="translate(96 24)">
        <path d="M-50 -20 C -34 -56, 36 -52, 54 -20 C 66 2, 48 34, 10 40 C -30 46, -64 20, -50 -20 Z" fill="#5c3a26" stroke={INK} strokeWidth={2.8} />
        <ellipse cx={-10} cy={-22} rx={18} ry={7} fill="#8a5c3b" opacity={0.8} />
        <path d="M-30 10 C -10 0, 20 0, 40 10" fill="none" stroke="#3a2416" strokeWidth={3} />
      </g>
      <Plantain x={60} y={-80} rot={-24} />
      <Plantain x={100} y={-66} rot={-16} s={0.9} />
      {/* chile panameño */}
      <g transform="translate(-130 56)">
        <path d="M-14 -6 C -6 -24, 24 -22, 26 -4 C 28 12, 10 20, -2 18 C -14 16, -20 6, -14 -6 Z" fill="#e35d2a" stroke={INK} strokeWidth={2.2} />
        <path d="M-6 -8 c -4 -8, 2 -14, 8 -12" fill="none" stroke="#3f7a3a" strokeWidth={3} strokeLinecap="round" />
      </g>
      <path d="M-140 -70 l10 -14 l6 12 l10 -12 l2 14" fill="none" stroke="#3f7a3a" strokeWidth={3} strokeLinecap="round" />
    </g>
  );
}

export const DISH_ART: Record<string, () => React.JSX.Element> = {
  'gallo-pinto': GalloPinto,
  casado: Casado,
  tamal: Tamales,
  'olla-de-carne': OllaDeCarne,
  'rice-and-beans': RiceAndBeans,
};
