// Volcano Hummingbird (Selasphorus flammula) — tiny, green back, greyish-white underparts, the male's purple-magenta
// throat gorget, short straight black bill, hovering upright with two translucent wing fans beside a small red flower.
import { Eye, GroundShadow, INK, O, Part, WingFan, ell, fan } from './_shapes';

const P = 'pv-volcano-hb';
const GREEN = '#4f9a4a';
const GREEN_HI = '#8cc04b';
const GREEN_SH = '#2f6b3a';
const BELLY = '#edf0ea';
const GORGET = '#c93a9e';

export function VolcanoHummingbird() {
  return (
    <g>
      <GroundShadow cx={104} cy={184} rx={30} ry={4} />
      {/* red flower on a stalk, lower left */}
      <path d="M44 176C42 150 38 130 42 104" fill="none" stroke={INK} strokeWidth={7} strokeLinecap="round" />
      <path d="M44 176C42 150 38 130 42 104" fill="none" stroke={GREEN} strokeWidth={3.5} strokeLinecap="round" />
      <path d="M42 150C30 148 22 140 20 130C30 130 40 138 42 150Z" fill={GREEN_HI} {...O} strokeWidth={2.5} />
      <g transform="translate(42 96)">
        {[0, 72, 144, 216, 288].map((a) => (
          <path key={a} d={ell(0, -12, 7, 12)} fill="#d9484f" {...O} strokeWidth={2.4} transform={`rotate(${a})`} />
        ))}
        <circle cx={0} cy={0} r={7} fill="#f2c531" {...O} strokeWidth={2.4} />
      </g>
      {/* wing fans: translucent, blurred-motion look */}
      <WingFan d={fan(112, 90, 50, 188, 258)} color={GREEN_HI} />
      <WingFan d={fan(112, 90, 48, 258, 328)} color={GREEN_HI} />
      {/* short tail */}
      <path d="M118 116L134 140L120 142L110 120Z" fill="#6b5a3a" {...O} />
      <path d="M126 112L146 134L134 140L118 118Z" fill={GREEN_SH} {...O} />
      {/* body: an upright teardrop */}
      <Part id={`${P}-body`} d="M82 70C92 56 116 56 128 70C140 86 134 112 118 122C104 130 86 124 80 108C76 96 76 80 82 70Z" fill={GREEN} shade={GREEN_SH}>
        <path d={ell(100, 112, 28, 22)} fill={BELLY} />
        <path d={ell(100, 66, 12, 5)} fill={GREEN_HI} transform="rotate(-10 100 66)" />
      </Part>
      {/* head */}
      <Part id={`${P}-head`} d={ell(88, 68, 20, 18)} fill={GREEN} shade={GREEN_SH} shift={[0, 4]}>
        <path d={ell(84, 56, 9, 4)} fill={GREEN_HI} transform="rotate(-20 84 56)" />
      </Part>
      {/* magenta gorget: a bib over the lower half of the head, drawn on top so it reads at small size */}
      <path d="M69 72C70 86 78 94 92 94C104 94 112 84 112 72C100 76 82 76 69 72Z" fill={GORGET} {...O} strokeWidth={2.4} />
      <path d="M76 80q6 6 14 7" fill="none" stroke="#f07ad0" strokeWidth={2.4} strokeLinecap="round" />
      <Eye cx={80} cy={66} r={7} look={[-0.4, 0]} sw={2.5} />
      {/* short straight black bill */}
      <path d="M70 68L42 70L70 73Z" fill="#1d1a16" {...O} strokeWidth={2.4} />
    </g>
  );
}
