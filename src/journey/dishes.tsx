// Illustrated dishes for the "Flavors" chapter: ink outlines and flat painterly fills, in the register of the
// site's illustrated plates (docs/ART_STYLE.md, "Stickers" / "Dishes"). Each dish is drawn in its own local
// coordinate system (0,0 at its centre) inside viewBox "-260 -200 520 400".
// Purely visual — the accessible controls are DOM buttons placed over them (FlavorsTable.tsx).

const INK = '#2a1d14';

/** deterministic pseudo-random, so the bean dots are the same on every render */
function prng(seed: number) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

function Dots({ n, rx, ry, seed, colors, r = 4, cx = 0, cy = 0, ink = false }: { n: number; rx: number; ry: number; seed: number; colors: string[]; r?: number; cx?: number; cy?: number; ink?: boolean }) {
  const rnd = prng(seed);
  const dots: React.ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const a = rnd() * Math.PI * 2;
    const d = Math.sqrt(rnd());
    const x = cx + Math.cos(a) * rx * d;
    const y = cy + Math.sin(a) * ry * d;
    const rr = r * (0.7 + rnd() * 0.7);
    dots.push(<ellipse key={i} cx={x} cy={y} rx={rr} ry={rr * 0.62} fill={colors[i % colors.length]} stroke={ink ? INK : undefined} strokeWidth={ink ? 0.8 : undefined} transform={`rotate(${rnd() * 180} ${x} ${y})`} />);
  }
  return <>{dots}</>;
}

/** rice grains: little pale ovals with a thin shade line */
function Grains({ n, rx, ry, seed, cx = 0, cy = 0, r = 3.2, colors = ['#fffbf0', '#f3ead2', '#fff6e2'] }: { n: number; rx: number; ry: number; seed: number; cx?: number; cy?: number; r?: number; colors?: string[] }) {
  const rnd = prng(seed);
  const out: React.ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const a = rnd() * Math.PI * 2;
    const d = Math.sqrt(rnd());
    const x = cx + Math.cos(a) * rx * d;
    const y = cy + Math.sin(a) * ry * d;
    const rot = rnd() * 180;
    out.push(<ellipse key={i} cx={x} cy={y} rx={r} ry={r * 0.42} fill={colors[i % colors.length]} stroke="#d8c9a0" strokeWidth={0.7} transform={`rotate(${rot} ${x} ${y})`} />);
  }
  return <>{out}</>;
}

function Plate({ r, rim = '#8fb27e', rim2 }: { r: number; rim?: string; rim2?: string }) {
  return (
    <>
      <ellipse cx={8} cy={12} rx={r} ry={r * 0.72} fill="rgba(20,10,5,0.35)" />
      <ellipse cx={0} cy={0} rx={r} ry={r * 0.72} fill="#f5efe2" stroke={INK} strokeWidth={3} />
      <ellipse cx={-r * 0.12} cy={-r * 0.1} rx={r * 0.9} ry={r * 0.62} fill="#fbf7ee" opacity={0.7} />
      <ellipse cx={0} cy={0} rx={r * 0.86} ry={r * 0.6} fill="none" stroke={rim} strokeWidth={5} opacity={0.9} />
      {rim2 && <ellipse cx={0} cy={0} rx={r * 0.92} ry={r * 0.655} fill="none" stroke={rim2} strokeWidth={2} opacity={0.8} />}
      <ellipse cx={0} cy={0} rx={r * 0.8} ry={r * 0.55} fill="#fbf7ee" />
      <ellipse cx={0} cy={r * 0.1} rx={r * 0.76} ry={r * 0.46} fill="#f1e8d4" opacity={0.55} />
    </>
  );
}

/** a slice of fried ripe plantain: caramel edges, golden middle, dark sear marks */
function Plantain({ x, y, rot = 0, s = 1 }: { x: number; y: number; rot?: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <ellipse cx={2} cy={3} rx={30} ry={14} fill="rgba(20,10,5,0.25)" />
      <ellipse cx={0} cy={0} rx={30} ry={14} fill="#d98f2b" stroke={INK} strokeWidth={2.5} />
      <ellipse cx={0} cy={0} rx={22} ry={9} fill="#eeb648" />
      <ellipse cx={-6} cy={-3} rx={12} ry={4} fill="#f8d57a" />
      <path d="M-24 5 Q 0 13 24 5" fill="none" stroke="#8c4a12" strokeWidth={3} opacity={0.75} strokeLinecap="round" />
      <path d="M-14 -9 q 8 -2 16 0" fill="none" stroke="#8c4a12" strokeWidth={2} opacity={0.5} strokeLinecap="round" />
    </g>
  );
}

/** corn tortilla with toasted spots and a slightly rough edge */
function Tortilla({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={3} cy={4} rx={62} ry={26} fill="rgba(20,10,5,0.22)" />
      <path d="M-62 0 C -60 -16, -36 -26, 0 -26 C 36 -26, 62 -16, 62 0 C 60 16, 34 26, 0 26 C -34 26, -62 16, -62 0 Z" fill="#efd9a6" stroke={INK} strokeWidth={2.5} />
      <ellipse cx={-6} cy={-5} rx={44} ry={15} fill="#f6e6bd" />
      <Dots n={16} rx={48} ry={17} seed={9} colors={['#d2a95e', '#b98843', '#e2c27c']} r={3.4} />
      <path d="M-40 10 C -20 16, 20 16, 40 10" fill="none" stroke="#d9b874" strokeWidth={2} opacity={0.8} />
    </g>
  );
}

function Culantro({ x, y, rot = 0, s = 1 }: { x: number; y: number; rot?: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <path d="M0 0 C 8 -10, 14 -24, 10 -40 C 2 -34, -6 -30, -10 -36 C -14 -24, -10 -10, 0 0 Z" fill="#4f9a4a" stroke={INK} strokeWidth={2} />
      <path d="M0 -2 L 6 -30" fill="none" stroke="#2f6b3a" strokeWidth={1.6} />
      <path d="M-4 -14 l 4 -2 M-2 -22 l 5 -2" fill="none" stroke="#8cc04b" strokeWidth={1.6} strokeLinecap="round" />
    </g>
  );
}

function Steam({ x, y, s = 1, opacity = 0.55 }: { x: number; y: number; s?: number; opacity?: number }) {
  return (
    <g className="dish__steam" transform={`translate(${x} ${y}) scale(${s})`} fill="none" stroke="#ffffff" strokeWidth={5} strokeLinecap="round" opacity={opacity}>
      <path d="M-30 0 c -14 -20, 14 -34, 0 -54" />
      <path d="M8 -8 c -14 -20, 14 -34, 0 -54" />
      <path d="M44 2 c -14 -20, 14 -34, 0 -54" />
    </g>
  );
}

/** a small cup of coffee seen from a high angle */
function CoffeeCup({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={4} cy={30} rx={36} ry={14} fill="rgba(20,10,5,0.3)" />
      <ellipse cx={0} cy={26} rx={44} ry={16} fill="#f5efe2" stroke={INK} strokeWidth={2.5} />
      <ellipse cx={0} cy={26} rx={36} ry={11} fill="none" stroke="#c8793a" strokeWidth={2} opacity={0.7} />
      <path d="M-30 -2 C -30 20, 30 20, 30 -2 L 30 -2 C 34 -14, 24 -24, 0 -24 C -24 -24, -34 -14, -30 -2 Z" fill="#f5efe2" stroke={INK} strokeWidth={2.5} />
      <ellipse cx={0} cy={-4} rx={30} ry={12} fill="#f5efe2" stroke={INK} strokeWidth={2.5} />
      <ellipse cx={0} cy={-4} rx={24} ry={9} fill="#4a2a18" />
      <ellipse cx={-6} cy={-6} rx={12} ry={4} fill="#7a4a2a" opacity={0.8} />
      <ellipse cx={-12} cy={-7} rx={4} ry={1.6} fill="#c9a37a" opacity={0.8} />
      <path d="M30 0 c 16 -2, 18 16, 2 16" fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" />
      <path d="M30 0 c 16 -2, 18 16, 2 16" fill="none" stroke="#f5efe2" strokeWidth={3} strokeLinecap="round" />
      <Steam x={0} y={-24} s={0.45} opacity={0.6} />
    </g>
  );
}

/** a fried egg: wobbly white, bright yolk with a glint */
function FriedEgg({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-44 -6 C -50 -30, -14 -44, 14 -36 C 30 -32, 52 -22, 48 0 C 46 20, 28 30, 6 32 C -20 34, -46 24, -44 -6 Z" fill="rgba(20,10,5,0.2)" transform="translate(3 4)" />
      <path d="M-44 -6 C -50 -30, -14 -44, 14 -36 C 30 -32, 52 -22, 48 0 C 46 20, 28 30, 6 32 C -20 34, -46 24, -44 -6 Z" fill="#fbf6ee" stroke={INK} strokeWidth={2.5} />
      <path d="M-30 -16 C -16 -30, 12 -30, 26 -20" fill="none" stroke="#ffffff" strokeWidth={5} strokeLinecap="round" />
      <path d="M-36 8 C -24 22, 4 26, 26 18" fill="none" stroke="#e9d9b8" strokeWidth={4} strokeLinecap="round" opacity={0.9} />
      <path d="M-44 -6 C -46 -16, -40 -24, -30 -28" fill="none" stroke="#c99a52" strokeWidth={3} strokeLinecap="round" opacity={0.7} />
      <circle cx={-4} cy={-2} r={16} fill="#f2a71c" stroke="#c9780f" strokeWidth={2} />
      <circle cx={-4} cy={-2} r={11} fill="#f8bd34" />
      <ellipse cx={-9} cy={-7} rx={4.5} ry={3} fill="#fde38a" />
    </g>
  );
}

export function GalloPinto() {
  return (
    <g>
      <Plate r={172} rim="#8fb27e" rim2="#c8793a" />
      <Tortilla x={-62} y={52} s={0.95} />
      {/* the pinto mound */}
      <ellipse cx={14} cy={2} rx={112} ry={62} fill="rgba(20,10,5,0.22)" />
      <path d="M-98 -2 C -102 -40, -60 -66, 10 -66 C 80 -66, 122 -40, 118 -2 C 114 30, 70 54, 10 54 C -56 54, -98 32, -98 -2 Z" fill="#d9bf8c" stroke={INK} strokeWidth={3} />
      <path d="M-70 -26 C -40 -52, 50 -56, 90 -30" fill="none" stroke="#efdfb8" strokeWidth={14} strokeLinecap="round" opacity={0.9} />
      <path d="M-78 22 C -40 44, 50 46, 96 22" fill="none" stroke="#b8975e" strokeWidth={10} strokeLinecap="round" opacity={0.6} />
      <Grains n={120} rx={100} ry={52} seed={41} cx={10} cy={-6} r={3.4} colors={['#f6ead0', '#fff6e2', '#ead9b2']} />
      <Dots n={150} rx={100} ry={52} seed={3} cx={10} cy={-6} colors={['#4a2219', '#6a2f24', '#3b1a14', '#7a3a2a']} r={4.4} ink />
      <Dots n={34} rx={96} ry={50} seed={11} cx={10} cy={-6} colors={['#4f9a4a', '#8cc04b', '#d94b3a']} r={2.6} />
      <Culantro x={-16} y={-58} rot={-20} s={0.8} />
      <Culantro x={2} y={-62} rot={14} s={0.7} />
      {/* fried egg */}
      <FriedEgg x={106} y={36} s={0.95} />
      <Plantain x={-122} y={-34} rot={-18} />
      <Plantain x={-104} y={-6} rot={-10} s={0.92} />
      {/* natilla */}
      <g transform="translate(118 -52)">
        <ellipse cx={2} cy={3} rx={24} ry={14} fill="rgba(20,10,5,0.2)" />
        <path d="M-24 0 C -24 -12, -8 -18, 4 -16 C 16 -14, 26 -8, 24 2 C 20 12, 4 16, -8 14 C -20 12, -26 8, -24 0 Z" fill="#fbf7ee" stroke={INK} strokeWidth={2.2} />
        <ellipse cx={-6} cy={-5} rx={10} ry={4.5} fill="#ffffff" />
        <path d="M-12 8 c 8 4, 16 3, 20 -2" fill="none" stroke="#e6dcc4" strokeWidth={2} strokeLinecap="round" />
      </g>
      {/* coffee beside the plate */}
      <CoffeeCup x={198} y={92} s={0.82} />
    </g>
  );
}

export function Casado() {
  return (
    <g>
      <ellipse cx={8} cy={14} rx={238} ry={152} fill="rgba(20,10,5,0.35)" />
      <ellipse cx={0} cy={0} rx={238} ry={152} fill="#f5efe2" stroke={INK} strokeWidth={3} />
      <ellipse cx={-30} cy={-20} rx={210} ry={128} fill="#fbf7ee" opacity={0.7} />
      <ellipse cx={0} cy={0} rx={214} ry={132} fill="none" stroke="#c8793a" strokeWidth={5} opacity={0.85} />
      <ellipse cx={0} cy={0} rx={226} ry={142} fill="none" stroke="#8fb27e" strokeWidth={2} opacity={0.8} />
      <ellipse cx={0} cy={0} rx={202} ry={122} fill="#fbf7ee" />
      {/* white rice */}
      <g transform="translate(-116 -34)">
        <ellipse cx={3} cy={5} rx={76} ry={46} fill="rgba(20,10,5,0.2)" />
        <path d="M-76 0 C -74 -30, -40 -48, 0 -48 C 40 -48, 76 -30, 76 0 C 76 28, 40 46, 0 46 C -40 46, -76 28, -76 0 Z" fill="#e6d8b4" stroke={INK} strokeWidth={2.5} />
        <ellipse cx={-10} cy={-12} rx={50} ry={22} fill="#f6eed6" />
        <path d="M-60 18 C -30 40, 30 40, 62 16" fill="none" stroke="#cdb989" strokeWidth={9} strokeLinecap="round" opacity={0.7} />
        <Grains n={150} rx={68} ry={40} seed={21} r={4} colors={['#fffdf4', '#f7efdc', '#ede2c4']} />
      </g>
      {/* black beans */}
      <g transform="translate(-106 56)">
        <path d="M-54 -16 C -44 -44, 36 -46, 54 -16 C 64 6, 40 34, 0 34 C -40 34, -66 8, -54 -16 Z" fill="#2b1a1a" stroke={INK} strokeWidth={2.5} />
        <ellipse cx={-14} cy={-14} rx={24} ry={9} fill="#5a3e3e" opacity={0.55} />
        <Dots n={46} rx={46} ry={26} seed={5} colors={['#3d2626', '#1c1010', '#4d3030', '#2f1c1c']} r={4.4} ink />
        <path d="M-34 10 C -14 20, 14 20, 36 8" fill="none" stroke="#6b4a4a" strokeWidth={2.4} opacity={0.6} strokeLinecap="round" />
      </g>
      {/* picadillo (potato dice with carrot and herbs) */}
      <g transform="translate(-20 62)">
        <path d="M-40 -6 C -34 -26, 30 -28, 42 -8 C 48 8, 30 22, 0 22 C -30 22, -48 8, -40 -6 Z" fill="#e8c884" stroke={INK} strokeWidth={2.4} />
        <g stroke={INK} strokeWidth={1.2}>
          <rect x={-30} y={-12} width={12} height={10} rx={2} fill="#f4dc9a" transform="rotate(-12 -24 -7)" />
          <rect x={-12} y={-18} width={12} height={10} rx={2} fill="#f7e2a8" transform="rotate(8 -6 -13)" />
          <rect x={6} y={-14} width={12} height={10} rx={2} fill="#f4dc9a" transform="rotate(-20 12 -9)" />
          <rect x={20} y={-4} width={12} height={10} rx={2} fill="#f7e2a8" transform="rotate(14 26 1)" />
          <rect x={-22} y={2} width={11} height={9} rx={2} fill="#e8812a" transform="rotate(20 -16 6)" />
          <rect x={0} y={4} width={12} height={10} rx={2} fill="#f4dc9a" transform="rotate(-6 6 9)" />
          <rect x={14} y={8} width={10} height={9} rx={2} fill="#e8812a" transform="rotate(-18 19 12)" />
        </g>
        <Dots n={12} rx={34} ry={14} seed={47} colors={['#4f9a4a', '#2f6b3a']} r={2} />
      </g>
      {/* salad */}
      <g transform="translate(24 -50)">
        <path d="M-62 10 C -54 -32, 0 -44, 42 -24 C 72 -8, 62 36, 22 42 C -20 46, -66 42, -62 10 Z" fill="#8cc04b" stroke={INK} strokeWidth={2.5} />
        <path d="M-50 2 C -36 -22, -4 -30, 24 -20 C 44 -12, 50 10, 36 26" fill="none" stroke="#cfe3a0" strokeWidth={6} strokeLinecap="round" opacity={0.9} />
        <path d="M-40 6 C -20 -16, 10 -20, 30 -6 M-50 20 C -30 4, 0 0, 24 14 M-20 34 C 0 26, 20 26, 40 30" fill="none" stroke="#4f9a4a" strokeWidth={3} strokeLinecap="round" />
        <g stroke={INK} strokeWidth={2}>
          <path d="M-22 -4 l 24 -12 l 10 18 z" fill="#d94b3a" />
          <path d="M-18 -4 l 16 -8 l 6 12 z" fill="#ef6f55" />
          <path d="M12 16 l 22 -10 l 8 16 z" fill="#d94b3a" />
          <path d="M16 16 l 14 -6 l 5 10 z" fill="#ef6f55" />
        </g>
        <ellipse cx={-36} cy={24} rx={10} ry={6} fill="#f3f0f7" stroke="#8e4a9e" strokeWidth={1.4} />
        <ellipse cx={-36} cy={24} rx={6} ry={3.4} fill="none" stroke="#8e4a9e" strokeWidth={1.2} />
        <path d="M-30 30 c 10 -4 24 -4 36 2" fill="none" stroke="#e0a526" strokeWidth={3} strokeLinecap="round" opacity={0.8} />
      </g>
      {/* grilled chicken breast */}
      <g transform="translate(122 14)">
        <path d="M-60 -24 C -40 -58, 30 -56, 54 -26 C 70 -6, 56 34, 20 42 C -20 50, -70 30, -60 -24 Z" fill="rgba(20,10,5,0.22)" transform="translate(4 6)" />
        <path d="M-60 -24 C -40 -58, 30 -56, 54 -26 C 70 -6, 56 34, 20 42 C -20 50, -70 30, -60 -24 Z" fill="#c4782f" stroke={INK} strokeWidth={2.8} />
        <path d="M-48 -26 C -26 -46, 20 -46, 40 -30" fill="none" stroke="#e8a85c" strokeWidth={8} strokeLinecap="round" opacity={0.85} />
        <path d="M-40 30 C -10 40, 30 36, 48 14" fill="none" stroke="#8a4a1a" strokeWidth={7} strokeLinecap="round" opacity={0.5} />
        <path d="M-46 -14 C -20 -30, 20 -30, 44 -14 M-50 6 C -20 -6, 20 -6, 46 4 M-42 26 C -16 16, 14 16, 36 24" fill="none" stroke="#5e2f0e" strokeWidth={4.5} strokeLinecap="round" opacity={0.85} />
        <Dots n={10} rx={44} ry={26} seed={53} colors={['#3f2a1a']} r={1.6} />
      </g>
      {/* white cheese slice */}
      <g transform="translate(60 -96) rotate(-8)">
        <path d="M-28 -6 L 24 -16 L 32 0 L 32 8 L -20 18 L -28 2 Z" fill="#e8d9a6" stroke={INK} strokeWidth={2} strokeLinejoin="round" />
        <path d="M-28 -6 L 24 -16 L 32 0 L -20 10 Z" fill="#f6ecc8" stroke={INK} strokeWidth={2} strokeLinejoin="round" />
        <path d="M-20 10 L -20 18" stroke={INK} strokeWidth={1.4} opacity={0.6} />
        <g fill="#dcc98e"><circle cx={-8} cy={0} r={3} /><circle cx={10} cy={-6} r={2.4} /><circle cx={18} cy={2} r={2} /></g>
        <path d="M-22 -4 L 18 -12" stroke="#ffffff" strokeWidth={2} strokeLinecap="round" opacity={0.7} />
      </g>
      <Plantain x={8} y={82} rot={12} />
      <Plantain x={58} y={96} rot={8} s={0.92} />
      <Plantain x={-32} y={100} rot={20} s={0.86} />
      <Tortilla x={120} y={100} s={0.85} />
      {/* lime wedge */}
      <g transform="translate(186 44) rotate(200)">
        <path d="M0 0 L 46 -16 A 50 50 0 0 1 46 16 Z" fill="#d9ea7a" stroke={INK} strokeWidth={2.2} />
        <path d="M0 0 L 46 -16 A 50 50 0 0 1 46 16 Z" fill="none" stroke="#7aa52a" strokeWidth={4} />
        <path d="M6 0 L 40 -11 M 6 0 L 40 11 M 6 0 L 44 0" stroke="#b8d34a" strokeWidth={1.6} />
        <path d="M14 -3 l 10 -4 l 4 6 z M14 3 l 10 4 l 4 -6 z" fill="#f2f8c8" />
      </g>
      <Steam x={20} y={-120} s={0.7} opacity={0.4} />
    </g>
  );
}

/** a tamal packet in plantain leaf; `open` shows the masa filling */
function TamalParcel({ x, y, rot, open, s = 1 }: { x: number; y: number; rot: number; open?: boolean; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <rect x={-96} y={-56} width={192} height={112} rx={18} fill="rgba(20,10,5,0.32)" transform="translate(8 10)" />
      <rect x={-96} y={-56} width={192} height={112} rx={18} fill="#3f7a34" stroke={INK} strokeWidth={3} />
      <rect x={-86} y={-48} width={172} height={28} rx={10} fill="#5f9d47" opacity={0.85} />
      <rect x={-86} y={30} width={172} height={20} rx={8} fill="#2d5a26" opacity={0.7} />
      {/* leaf veins and folds */}
      <g stroke="#2a5222" strokeWidth={1.6} opacity={0.7}>
        <path d="M-80 -56 l 0 112 M-56 -56 l 0 112 M-32 -56 l 0 112 M-8 -56 l 0 112 M16 -56 l 0 112 M40 -56 l 0 112 M64 -56 l 0 112 M84 -56 l 0 112" />
      </g>
      <path d="M-70 -56 C -74 -20, -74 20, -70 56 M 70 -56 C 74 -20, 74 20, 70 56" fill="none" stroke={INK} strokeWidth={2.4} opacity={0.6} />
      <path d="M-96 0 C -40 -6, 40 6, 96 0" fill="none" stroke="#1e4218" strokeWidth={3} opacity={0.55} />
      {open && (
        <g>
          <path d="M-60 -56 C -70 -40, -74 10, -60 56 L 60 56 C 72 10, 70 -40, 60 -56 Z" fill="#e4b659" stroke={INK} strokeWidth={2.6} />
          <path d="M-54 -40 C -30 -50, 30 -50, 54 -40" fill="none" stroke="#f3d484" strokeWidth={8} strokeLinecap="round" />
          <path d="M-56 42 C -30 50, 30 50, 56 42" fill="none" stroke="#c79a3c" strokeWidth={7} strokeLinecap="round" opacity={0.8} />
          <Dots n={60} rx={52} ry={44} seed={17} colors={['#f0cc7a', '#d9a53f', '#f6dc96']} r={3.5} />
          {/* pork */}
          <path d="M-30 -18 C -10 -30, 20 -28, 34 -12 C 40 6, 20 22, -4 22 C -26 22, -40 2, -30 -18 Z" fill="#8c5a3c" stroke={INK} strokeWidth={2.2} />
          <path d="M-22 -14 C -8 -22, 14 -20, 26 -10" fill="none" stroke="#b07a55" strokeWidth={4} strokeLinecap="round" />
          <path d="M-18 8 C -4 14, 14 12, 24 4" fill="none" stroke="#5e3a24" strokeWidth={3} strokeLinecap="round" opacity={0.8} />
          {/* carrot, peas, achiote rice, olive */}
          <circle cx={-36} cy={24} r={10} fill="#e8812a" stroke={INK} strokeWidth={2} />
          <circle cx={-36} cy={24} r={5} fill="#f4a65a" />
          <circle cx={30} cy={32} r={6} fill="#6fae3e" stroke={INK} strokeWidth={1.8} /><circle cx={28} cy={30} r={2} fill="#a6d46e" />
          <circle cx={44} cy={18} r={6} fill="#6fae3e" stroke={INK} strokeWidth={1.8} /><circle cx={42} cy={16} r={2} fill="#a6d46e" />
          <circle cx={36} cy={-30} r={6} fill="#6fae3e" stroke={INK} strokeWidth={1.8} /><circle cx={34} cy={-32} r={2} fill="#a6d46e" />
          <Grains n={14} rx={14} ry={9} seed={61} cx={-40} cy={-30} r={3} colors={['#e8502f', '#f07045', '#d9402a']} />
          <ellipse cx={0} cy={38} rx={7} ry={5} fill="#3a3236" stroke={INK} strokeWidth={1.6} /><ellipse cx={0} cy={38} rx={2.5} ry={1.8} fill="#c9484f" />
          <path d="M-54 2 l -6 -8 l 8 -2 z" fill="#d2402f" stroke={INK} strokeWidth={1.2} />
        </g>
      )}
      {/* twine */}
      <path d="M-96 -12 L 96 -12 M -96 14 L 96 14" stroke={INK} strokeWidth={6} strokeLinecap="round" />
      <path d="M-96 -12 L 96 -12 M -96 14 L 96 14" stroke="#e8d6a8" strokeWidth={3.5} strokeLinecap="round" />
      <path d="M-4 -12 c 6 4 6 22 0 26 M 4 -12 c -6 4 -6 22 0 26" fill="none" stroke={INK} strokeWidth={6} />
      <path d="M-4 -12 c 6 4 6 22 0 26 M 4 -12 c -6 4 -6 22 0 26" fill="none" stroke="#e8d6a8" strokeWidth={3.5} />
      <circle cx={0} cy={1} r={5} fill="#d9c492" stroke={INK} strokeWidth={1.8} />
    </g>
  );
}

export function Tamales() {
  return (
    <g>
      {/* a banana leaf under the parcels */}
      <path d="M-244 66 C -200 -80, 180 -116, 252 -10 C 200 92, -120 134, -244 66 Z" fill="rgba(20,10,5,0.3)" transform="translate(8 12)" />
      <path d="M-244 66 C -200 -80, 180 -116, 252 -10 C 200 92, -120 134, -244 66 Z" fill="#3f6f32" stroke={INK} strokeWidth={3} />
      <path d="M-200 20 C -120 -52, 120 -86, 236 -16" fill="none" stroke="#5a9144" strokeWidth={14} opacity={0.45} strokeLinecap="round" />
      <path d="M-230 50 C -140 -20, 140 -60, 240 -10" fill="none" stroke="#2c5424" strokeWidth={4} />
      <g stroke="#5a9144" strokeWidth={1.8} opacity={0.7}>
        <path d="M-180 20 l 30 -40 M-130 0 l 30 -46 M-80 -16 l 30 -50 M-30 -30 l 28 -52 M20 -40 l 26 -54 M70 -46 l 26 -54 M120 -46 l 24 -50" />
        <path d="M-170 54 l 26 -34 M-120 46 l 26 -40 M-70 36 l 26 -44 M-20 26 l 24 -48 M30 14 l 24 -48 M80 4 l 24 -46 M130 -4 l 24 -42 M180 -4 l 22 -36" />
      </g>
      {/* the "piña": two tied parcels, one opened */}
      <TamalParcel x={-78} y={28} rot={-12} s={0.96} />
      <TamalParcel x={60} y={-10} rot={8} open />
      {/* string joining the two */}
      <path d="M-20 -30 C -10 -50, 10 -56, 24 -60" fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" />
      <path d="M-20 -30 C -10 -50, 10 -56, 24 -60" fill="none" stroke="#e8d6a8" strokeWidth={3.5} strokeLinecap="round" />
      <Steam x={70} y={-80} s={0.6} opacity={0.45} />
      <CoffeeCup x={198} y={86} s={0.82} />
    </g>
  );
}

export function OllaDeCarne() {
  return (
    <g>
      <ellipse cx={10} cy={34} rx={192} ry={122} fill="rgba(20,10,5,0.35)" />
      {/* side bowl of white rice */}
      <g transform="translate(-200 92) scale(0.9)">
        <ellipse cx={4} cy={8} rx={54} ry={28} fill="rgba(20,10,5,0.3)" />
        <path d="M-54 -4 C -56 22, -26 36, 0 36 C 26 36, 56 22, 54 -4 Z" fill="#3a6f7a" stroke={INK} strokeWidth={2.6} />
        <ellipse cx={0} cy={-4} rx={54} ry={22} fill="#4d8a94" stroke={INK} strokeWidth={2.6} />
        <path d="M-44 -6 C -40 -26, 40 -26, 44 -6 C 40 8, -40 8, -44 -6 Z" fill="#efe6cc" stroke={INK} strokeWidth={2} />
        <ellipse cx={-6} cy={-12} rx={26} ry={8} fill="#fbf7ee" />
        <Grains n={36} rx={36} ry={10} seed={71} cy={-8} r={3} />
      </g>
      {/* the pot */}
      <path d="M-170 -10 C -176 60, -120 108, 0 108 C 120 108, 176 60, 170 -10 Z" fill="#8f4d31" stroke={INK} strokeWidth={3} />
      <path d="M-150 20 C -120 70, 120 70, 150 20" fill="none" stroke="#5e2f1d" strokeWidth={4} opacity={0.6} />
      <path d="M-120 60 C -60 90, 60 90, 120 60" fill="none" stroke="#5e2f1d" strokeWidth={6} opacity={0.45} strokeLinecap="round" />
      <path d="M-150 6 C -130 36, -90 56, -40 68" fill="none" stroke="#b8694a" strokeWidth={8} strokeLinecap="round" opacity={0.6} />
      <ellipse cx={0} cy={-10} rx={172} ry={64} fill="#a95b39" stroke={INK} strokeWidth={3} />
      <ellipse cx={0} cy={-10} rx={150} ry={52} fill="#c98a3c" stroke={INK} strokeWidth={2.5} />
      <ellipse cx={0} cy={-6} rx={140} ry={44} fill="#d99b48" opacity={0.7} />
      <ellipse cx={-40} cy={-28} rx={60} ry={14} fill="#f0c468" opacity={0.6} />
      <ellipse cx={60} cy={10} rx={50} ry={12} fill="#e8b45a" opacity={0.5} />
      {/* fat droplets on the broth */}
      <g fill="#f6d57a" opacity={0.8}><circle cx={-100} cy={-6} r={3} /><circle cx={-88} cy={6} r={2} /><circle cx={120} cy={-14} r={3} /><circle cx={104} cy={18} r={2.4} /><circle cx={20} cy={30} r={2} /></g>
      {/* handles */}
      <path d="M-170 -4 C -210 -8, -210 36, -172 32" fill="none" stroke={INK} strokeWidth={14} strokeLinecap="round" />
      <path d="M-170 -4 C -210 -8, -210 36, -172 32" fill="none" stroke="#8f4d31" strokeWidth={9} strokeLinecap="round" />
      <path d="M170 -4 C 210 -8, 210 36, 172 32" fill="none" stroke={INK} strokeWidth={14} strokeLinecap="round" />
      <path d="M170 -4 C 210 -8, 210 36, 172 32" fill="none" stroke="#8f4d31" strokeWidth={9} strokeLinecap="round" />
      <path d="M-190 6 C -200 10, -200 20, -192 26" fill="none" stroke="#b8694a" strokeWidth={3} strokeLinecap="round" />
      <path d="M190 6 C 200 10, 200 20, 192 26" fill="none" stroke="#b8694a" strokeWidth={3} strokeLinecap="round" />
      <g transform="translate(0 -8) scale(1.18)">
      {/* corn cob section */}
      <g transform="translate(-78 -16) rotate(-8)">
        <ellipse cx={0} cy={0} rx={34} ry={19} fill="#e6c54a" stroke={INK} strokeWidth={2.4} />
        <g fill="#f5df7c" stroke="#b89426" strokeWidth={1}>
          <circle cx={-22} cy={-7} r={4} /><circle cx={-11} cy={-10} r={4} /><circle cx={0} cy={-11} r={4} /><circle cx={11} cy={-10} r={4} /><circle cx={22} cy={-7} r={4} />
          <circle cx={-24} cy={3} r={4} /><circle cx={-13} cy={2} r={4} /><circle cx={-2} cy={1} r={4} /><circle cx={9} cy={2} r={4} /><circle cx={20} cy={3} r={4} />
          <circle cx={-16} cy={11} r={3.6} /><circle cx={-5} cy={11} r={3.6} /><circle cx={6} cy={11} r={3.6} /><circle cx={17} cy={11} r={3.6} />
        </g>
        <ellipse cx={-26} cy={-9} rx={6} ry={3} fill="#fff3b0" opacity={0.9} />
      </g>
      {/* beef chunks */}
      <path d="M-10 -34 C 10 -50, 44 -44, 50 -26 C 54 -12, 30 -2, 10 -6 C -10 -2, -24 -18, -10 -34 Z" fill="#6b3a2a" stroke={INK} strokeWidth={2.4} />
      <path d="M-2 -30 C 10 -40, 30 -38, 40 -28" fill="none" stroke="#9a5a44" strokeWidth={4} strokeLinecap="round" />
      <path d="M0 -14 C 12 -8, 28 -10, 38 -16" fill="none" stroke="#4a2419" strokeWidth={3} strokeLinecap="round" opacity={0.8} />
      <path d="M-150 12 C -140 -2, -120 -2, -110 10 C -106 22, -128 30, -142 26 C -154 22, -156 18, -150 12 Z" fill="#6b3a2a" stroke={INK} strokeWidth={2.2} />
      <path d="M-142 10 C -134 2, -122 2, -116 8" fill="none" stroke="#9a5a44" strokeWidth={3} strokeLinecap="round" />
      {/* carrot, yuca, chayote, potato, green plantain */}
      <path d="M60 -32 C 80 -40, 110 -34, 112 -18 C 112 -6, 84 0, 68 -6 Z" fill="#e8812a" stroke={INK} strokeWidth={2.2} />
      <path d="M70 -26 C 84 -32, 100 -30, 106 -20" fill="none" stroke="#f6a85a" strokeWidth={4} strokeLinecap="round" />
      <path d="M-128 -6 C -118 -22, -88 -22, -84 -6 C -82 6, -100 14, -112 12 C -126 10, -134 4, -128 -6 Z" fill="#f0e0b8" stroke={INK} strokeWidth={2.2} />
      <path d="M-120 -8 C -110 -16, -96 -16, -90 -8" fill="none" stroke="#ffffff" strokeWidth={4} strokeLinecap="round" opacity={0.9} />
      <path d="M-124 6 C -112 12, -98 10, -90 4" fill="none" stroke="#d6c08c" strokeWidth={3} strokeLinecap="round" />
      <g transform="translate(100 14)">
        <path d="M-28 0 C -26 -14, -8 -18, 6 -14 C 22 -10, 30 0, 26 8 C 20 16, -8 18, -20 12 C -30 8, -32 6, -28 0 Z" fill="#b9d48a" stroke={INK} strokeWidth={2.2} />
        <path d="M-18 -4 C -10 -10, 6 -10, 16 -4" fill="none" stroke="#dfeab8" strokeWidth={4} strokeLinecap="round" />
        <path d="M-8 2 C -2 -2, 8 -2, 14 2 M-12 8 C 0 4, 10 6, 18 8" fill="none" stroke="#7a9a4a" strokeWidth={2} strokeLinecap="round" />
      </g>
      <g transform="translate(14 22)">
        <ellipse cx={0} cy={0} rx={24} ry={13} fill="#e9d28f" stroke={INK} strokeWidth={2.2} />
        <ellipse cx={-6} cy={-4} rx={11} ry={4.5} fill="#f8e8b4" />
        <circle cx={10} cy={4} r={2} fill="#b89a52" /><circle cx={-12} cy={5} r={1.6} fill="#b89a52" />
      </g>
      <g transform="translate(-44 30) rotate(-6)">
        <rect x={-24} y={-10} width={48} height={20} rx={9} fill="#e3d28c" stroke={INK} strokeWidth={2.2} />
        <path d="M-16 -4 L 14 -4" stroke="#f6eab8" strokeWidth={4} strokeLinecap="round" />
        <rect x={-24} y={-10} width={48} height={20} rx={9} fill="none" stroke="#8aa64a" strokeWidth={3} />
      </g>
      </g>
      <Culantro x={40} y={-44} rot={-30} s={0.9} />
      <Culantro x={128} y={-34} rot={20} s={0.75} />
      <Steam x={-10} y={-88} s={1.1} opacity={0.55} />
    </g>
  );
}

/** a fried green plantain disc (patacón): pale, craggy edges */
function Patacon({ x, y, rot = 0, s = 1 }: { x: number; y: number; rot?: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <ellipse cx={2} cy={3} rx={30} ry={18} fill="rgba(20,10,5,0.25)" />
      <path d="M-30 0 C -30 -12, -18 -18, -6 -17 C 4 -19, 16 -18, 26 -12 C 32 -6, 30 6, 24 12 C 14 19, -6 20, -18 15 C -28 11, -32 6, -30 0 Z" fill="#e3c25c" stroke={INK} strokeWidth={2.4} />
      <path d="M-20 -6 C -10 -12, 8 -12, 18 -6" fill="none" stroke="#f6dd8e" strokeWidth={5} strokeLinecap="round" />
      <Dots n={10} rx={22} ry={11} seed={83} colors={['#c99a2c', '#b4841e']} r={2.4} />
      <path d="M-18 8 C -8 12, 8 12, 18 8" fill="none" stroke="#b4841e" strokeWidth={2} strokeLinecap="round" opacity={0.7} />
    </g>
  );
}

export function RiceAndBeans() {
  return (
    <g>
      {/* coconut halves beside the plate */}
      <g transform="translate(-204 -80) rotate(-12)">
        <ellipse cx={3} cy={5} rx={34} ry={22} fill="rgba(20,10,5,0.3)" />
        <ellipse cx={0} cy={0} rx={34} ry={22} fill="#6b4a2d" stroke={INK} strokeWidth={2.6} />
        <ellipse cx={0} cy={-2} rx={27} ry={16} fill="#fbf7ee" stroke={INK} strokeWidth={2} />
        <ellipse cx={0} cy={-2} rx={12} ry={7} fill="#e9f3f7" opacity={0.9} />
        <path d="M-30 6 C -20 16, 20 16, 30 6" fill="none" stroke="#8a6a44" strokeWidth={2.4} strokeLinecap="round" />
      </g>
      <g transform="translate(-214 -24) rotate(10)">
        <ellipse cx={3} cy={5} rx={30} ry={20} fill="rgba(20,10,5,0.3)" />
        <ellipse cx={0} cy={0} rx={30} ry={20} fill="#6b4a2d" stroke={INK} strokeWidth={2.6} />
        <ellipse cx={-4} cy={-6} rx={14} ry={6} fill="#8a6a44" opacity={0.8} />
        <path d="M-20 4 c 6 8, 12 10, 20 8 M -6 -4 c 8 2 14 6 18 10" fill="none" stroke="#4a3220" strokeWidth={2} strokeLinecap="round" />
      </g>
      <Plate r={176} rim="#c8793a" rim2="#2cb1a6" />
      {/* the bowl of rice and beans */}
      <g transform="translate(-30 -8)">
        <ellipse cx={6} cy={8} rx={120} ry={76} fill="rgba(20,10,5,0.3)" />
        <ellipse cx={0} cy={0} rx={118} ry={74} fill="#2f4d42" stroke={INK} strokeWidth={3} />
        <path d="M-110 10 C -90 50, 90 50, 110 10" fill="none" stroke="#1d3a30" strokeWidth={8} strokeLinecap="round" opacity={0.6} />
        <path d="M-100 -28 C -70 -60, 70 -60, 100 -28" fill="none" stroke="#4a6a5c" strokeWidth={5} strokeLinecap="round" opacity={0.7} />
        <ellipse cx={0} cy={-16} rx={104} ry={54} fill="#9d5a34" stroke={INK} strokeWidth={2.6} />
        <path d="M-96 -16 C -90 -56, 90 -56, 96 -16 C 86 14, -86 14, -96 -16 Z" fill="#b57143" />
        <ellipse cx={-20} cy={-34} rx={60} ry={18} fill="#c98454" opacity={0.7} />
        <Grains n={110} rx={92} ry={44} seed={77} cy={-16} r={3.4} colors={['#e8cf9e', '#f4e2b8', '#d9b982']} />
        <Dots n={100} rx={92} ry={44} seed={31} cy={-16} colors={['#7a2a24', '#8f3a2c', '#5a1e18', '#a04a36']} r={4.6} ink />
        <path d="M-40 -48 c 4 -8, 10 -10, 18 -6 M-34 -42 l 6 -6" fill="none" stroke="#4f9a4a" strokeWidth={2.2} strokeLinecap="round" />
      </g>
      {/* chicken caribeño: a stewed thigh and drumstick in dark sauce */}
      <g transform="translate(112 34)">
        <path d="M-44 -18 C -30 -50, 30 -50, 48 -20 C 60 0, 44 30, 10 36 C -26 42, -58 18, -44 -18 Z" fill="rgba(20,10,5,0.25)" transform="translate(4 6)" />
        <path d="M-44 -18 C -30 -50, 30 -50, 48 -20 C 60 0, 44 30, 10 36 C -26 42, -58 18, -44 -18 Z" fill="#9a5a2c" stroke={INK} strokeWidth={2.8} />
        <path d="M-32 -22 C -14 -42, 22 -40, 38 -22" fill="none" stroke="#c98a4a" strokeWidth={8} strokeLinecap="round" opacity={0.9} />
        <path d="M-30 14 C -8 28, 22 26, 42 8" fill="none" stroke="#5e3416" strokeWidth={7} strokeLinecap="round" opacity={0.7} />
        <path d="M-20 -8 C -6 -16, 14 -16, 26 -6 M-24 6 C -8 0, 16 0, 30 8" fill="none" stroke="#5e3416" strokeWidth={3} strokeLinecap="round" opacity={0.8} />
        {/* drumstick with its bone end */}
        <path d="M30 26 C 46 36, 58 44, 70 50" fill="none" stroke={INK} strokeWidth={10} strokeLinecap="round" />
        <path d="M30 26 C 46 36, 58 44, 70 50" fill="none" stroke="#f3ecdf" strokeWidth={6} strokeLinecap="round" />
        <circle cx={72} cy={52} r={6} fill="#f3ecdf" stroke={INK} strokeWidth={2} />
        <circle cx={78} cy={46} r={4} fill="#f3ecdf" stroke={INK} strokeWidth={2} />
        <Dots n={10} rx={40} ry={24} seed={59} colors={['#2f6b3a', '#e0a526']} r={1.8} />
      </g>
      <Patacon x={70} y={-78} rot={-12} />
      <Patacon x={118} y={-66} rot={10} s={0.92} />
      <Patacon x={96} y={-48} rot={-4} s={0.86} />
      {/* small salad */}
      <g transform="translate(-130 58)">
        <path d="M-40 6 C -32 -16, 6 -24, 30 -12 C 46 -2, 40 20, 14 24 C -14 28, -46 24, -40 6 Z" fill="#8cc04b" stroke={INK} strokeWidth={2.2} />
        <path d="M-28 2 C -12 -12, 8 -14, 24 -4" fill="none" stroke="#cfe3a0" strokeWidth={4} strokeLinecap="round" />
        <path d="M-8 -2 l 16 -8 l 6 12 z" fill="#d94b3a" stroke={INK} strokeWidth={1.8} />
        <path d="M-28 14 c 10 -4 20 -2 30 2" fill="none" stroke="#4f9a4a" strokeWidth={2.4} strokeLinecap="round" />
      </g>
      {/* chile panameño (whole, orange-red, lantern-shaped) */}
      <g transform="translate(-40 86)">
        <ellipse cx={2} cy={12} rx={20} ry={8} fill="rgba(20,10,5,0.25)" />
        <path d="M-16 -4 C -10 -24, 24 -22, 26 -2 C 28 12, 12 22, -2 20 C -16 18, -22 8, -16 -4 Z" fill="#ef6a24" stroke={INK} strokeWidth={2.2} />
        <path d="M-6 -4 C -4 -14, 8 -16, 16 -10" fill="none" stroke="#f9a05a" strokeWidth={4} strokeLinecap="round" />
        <path d="M-10 12 C 0 18, 12 16, 20 8" fill="none" stroke="#c4441a" strokeWidth={3} strokeLinecap="round" opacity={0.8} />
        <path d="M-6 -12 c -4 -8, 2 -14, 8 -12" fill="none" stroke="#2f6b3a" strokeWidth={3.5} strokeLinecap="round" />
        <path d="M-10 -10 l 6 -2 l 6 2 l -6 -6 z" fill="#4f9a4a" stroke={INK} strokeWidth={1.4} />
      </g>
      <Culantro x={-150} y={-66} rot={-26} s={0.8} />
      <path d="M26 100 c 6 -8, 14 -10, 22 -8 m -16 -2 c 2 4, 2 8, 0 12" fill="none" stroke="#4f9a4a" strokeWidth={2} strokeLinecap="round" />
      <Steam x={-40} y={-96} s={0.7} opacity={0.4} />
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
