// Red-eyed Tree Frog (Agalychnis callidryas) — lime green body, huge red eyes with vertical pupils, blue and
// yellow striped flanks, orange feet with round toe pads, clinging to a big leaf.
import { GroundShadow, INK, LEAF, LEAF_HI, LEAF_SH, O, Part, ell } from './_shapes';

const P = 'pv-frog';
const GREEN = '#7cc242';
const GREEN_HI = '#a9dd6a';
const GREEN_SH = '#4f9a2e';
const ORANGE = '#f0872a';
const EYE_RED = '#e23c2e';

function Toes({ x, y, flip, s = 1 }: { x: number; y: number; flip?: boolean; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <path d="M0 0L-14 8M0 0L-6 14M0 0L6 12" fill="none" stroke={INK} strokeWidth={8} strokeLinecap="round" />
      <path d="M0 0L-14 8M0 0L-6 14M0 0L6 12" fill="none" stroke={ORANGE} strokeWidth={4} strokeLinecap="round" />
      <circle cx={-15} cy={9} r={5} fill={ORANGE} {...O} strokeWidth={2.2} />
      <circle cx={-6} cy={15} r={5} fill={ORANGE} {...O} strokeWidth={2.2} />
      <circle cx={7} cy={13} r={5} fill={ORANGE} {...O} strokeWidth={2.2} />
    </g>
  );
}

function FrogEye({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={16} fill={EYE_RED} {...O} />
      <path d={ell(cx - 5, cy - 6, 6, 4)} fill="#ff8a7a" transform={`rotate(-30 ${cx - 5} ${cy - 6})`} />
      <path d={ell(cx, cy, 3.2, 10)} fill="#1d1a16" />
      <circle cx={cx - 4} cy={cy - 5} r={2.4} fill="#ffffff" />
    </g>
  );
}

export function RedEyedTreeFrog() {
  return (
    <g>
      <GroundShadow cx={100} cy={186} rx={60} ry={6} />
      {/* big leaf, tilted */}
      <Part id={`${P}-leaf`} d="M18 164C30 112 96 86 184 104C176 150 120 184 40 178C30 176 22 172 18 164Z" fill={LEAF} shade={LEAF_SH} shift={[0, 6]}>
        <path d="M22 162C60 136 120 118 182 106" fill="none" stroke={LEAF_SH} strokeWidth={3} strokeLinecap="round" />
        <path d="M60 140q10 -14 8 -30M96 128q10 -12 10 -28M130 118q10 -8 12 -22M70 146q14 4 22 18M108 134q14 4 22 16" fill="none" stroke={LEAF_SH} strokeWidth={2} strokeLinecap="round" opacity={0.7} />
        <path d="M40 150C60 128 100 112 150 104" fill="none" stroke={LEAF_HI} strokeWidth={5} strokeLinecap="round" opacity={0.7} />
      </Part>
      {/* back legs tucked, toes gripping the leaf */}
      <path d={ell(52, 132, 20, 14)} fill={GREEN} {...O} />
      <path d={ell(148, 128, 20, 14)} fill={GREEN} {...O} />
      <Toes x={38} y={138} s={1} />
      <Toes x={162} y={134} flip />
      {/* body */}
      <Part id={`${P}-body`} d="M44 104C44 76 68 60 100 60C132 60 156 76 156 104C156 128 136 144 100 144C64 144 44 128 44 104Z" fill={GREEN} shade={GREEN_SH}>
        <path d={ell(100, 128, 52, 22)} fill="#eef5d6" />
        <path d="M44 100C50 112 56 122 56 130L48 134Z" fill="#4e86d8" />
        <path d="M58 104q4 10 4 20M66 110q4 8 4 16" fill="none" stroke="#f4d13f" strokeWidth={4} strokeLinecap="round" />
        <path d="M156 100C150 112 144 122 144 130L152 134Z" fill="#4e86d8" />
        <path d="M142 104q-4 10 -4 20M134 110q-4 8 -4 16" fill="none" stroke="#f4d13f" strokeWidth={4} strokeLinecap="round" />
        <path d={ell(84, 70, 20, 7)} fill={GREEN_HI} transform="rotate(-8 84 70)" />
      </Part>
      {/* front feet on the leaf */}
      <path d="M68 128C62 140 64 150 72 156" fill="none" stroke={INK} strokeWidth={14} strokeLinecap="round" />
      <path d="M68 128C62 140 64 150 72 156" fill="none" stroke={GREEN} strokeWidth={8} strokeLinecap="round" />
      <path d="M132 128C138 140 136 150 128 156" fill="none" stroke={INK} strokeWidth={14} strokeLinecap="round" />
      <path d="M132 128C138 140 136 150 128 156" fill="none" stroke={GREEN} strokeWidth={8} strokeLinecap="round" />
      <Toes x={74} y={154} />
      <Toes x={126} y={154} flip />
      {/* face */}
      <FrogEye cx={70} cy={74} />
      <FrogEye cx={130} cy={74} />
      <circle cx={92} cy={88} r={1.8} fill={INK} />
      <circle cx={108} cy={88} r={1.8} fill={INK} />
      <path d="M76 100q24 16 48 0" fill="none" stroke={INK} strokeWidth={2.8} strokeLinecap="round" />
    </g>
  );
}
