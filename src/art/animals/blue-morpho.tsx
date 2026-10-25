// Blue Morpho (Morpho helenor) — wings open flat, two iridescent blues, black edges dotted with small white spots,
// dark body with clubbed antennae. Hovering, so the shadow is small and low.
import { Eye, GroundShadow, INK, O, Part } from './_shapes';

const P = 'pv-morpho';
const BLUE = '#2f8df0';
const BLUE_HI = '#8fd8ff';
const BLUE_SH = '#1550b8';
const EDGE = '#1c1f2b';

// right-hand wing pair (forewing + hindwing as one outline); mirrored for the left
const WING = 'M104 86C112 54 140 32 170 36C190 40 190 66 174 82C186 92 190 116 174 134C158 150 126 146 108 130Z';
const INNER = 'M106 88C114 62 138 44 166 46C180 50 180 68 166 82C176 92 178 112 166 126C152 138 128 136 112 124Z';
const SPOTS = [[172, 42], [184, 56], [181, 72], [182, 102], [181, 120], [168, 138], [150, 148], [128, 146]] as const;

function Wing({ flip }: { flip?: boolean }) {
  const id = `${P}-wing-${flip ? 'l' : 'r'}`;
  return (
    <g transform={flip ? 'translate(200 0) scale(-1 1)' : undefined}>
      <Part id={id} d={WING} fill={EDGE} shade="#0d1018" shift={[0, 4]}>
        <path d={INNER} fill={BLUE} />
        <path d="M110 86C120 68 138 56 160 56C150 72 146 90 150 110C136 100 122 96 110 102Z" fill={BLUE_HI} opacity={0.75} />
        <path d="M156 84C170 92 172 112 162 124C150 132 132 132 114 124C132 116 148 104 156 84Z" fill={BLUE_SH} opacity={0.8} />
        <path d="M108 110C120 116 140 118 158 112" fill="none" stroke={EDGE} strokeWidth={2.5} opacity={0.6} />
        {SPOTS.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={2.8} fill="#ffffff" />)}
      </Part>
    </g>
  );
}

export function BlueMorpho() {
  return (
    <g>
      <GroundShadow cx={100} cy={182} rx={34} ry={5} />
      <Wing flip />
      <Wing />
      {/* body */}
      <path d="M100 70C106 70 108 78 108 90L106 128C106 140 103 148 100 148C97 148 94 140 94 128L92 90C92 78 94 70 100 70Z" fill={EDGE} {...O} />
      <path d="M94 96h12M94 108h12M95 120h10M96 132h8" stroke="#3a3f52" strokeWidth={2} strokeLinecap="round" />
      <path d="M97 78L90 72" stroke="#ffffff" strokeWidth={2} opacity={0.3} />
      {/* head with big round eyes and clubbed antennae */}
      <path d="M96 64L82 38M104 64L118 38" fill="none" stroke={INK} strokeWidth={2.5} strokeLinecap="round" />
      <circle cx={82} cy={37} r={4} fill={INK} />
      <circle cx={118} cy={37} r={4} fill={INK} />
      <circle cx={100} cy={64} r={12} fill={EDGE} {...O} />
      <Eye cx={95} cy={63} r={5} look={[-0.2, 0.2]} sw={2} />
      <Eye cx={105} cy={63} r={5} look={[-0.2, 0.2]} sw={2} />
      <path d="M96 71q4 4 8 0" fill="none" stroke="#ffffff" strokeWidth={1.8} strokeLinecap="round" opacity={0.9} />
    </g>
  );
}
