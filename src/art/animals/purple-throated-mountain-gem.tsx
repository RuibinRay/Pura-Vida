// Purple-throated Mountain-gem (Lampornis calolaemus) — bronzy-green hummingbird with a vivid purple throat, a white
// stripe behind the eye and a blue-ish crown; hovering tilted at a hanging orange heliconia (top left), with a
// clearly longer dark tail than the Volcano Hummingbird.
import { Eye, GroundShadow, INK, O, Part, WingFan, ell, fan } from './_shapes';

const P = 'pv-mountain-gem';
const BRONZE = '#5f8a3c';
const BRONZE_HI = '#9cbb55';
const BRONZE_SH = '#3f5f26';
const BELLY = '#b9c2a4';
const PURPLE = '#7a2fb8';
const CROWN = '#3a8fb8';

export function PurpleThroatedMountainGem() {
  return (
    <g>
      <GroundShadow cx={110} cy={186} rx={30} ry={4} />
      {/* hanging heliconia at the top left: a stalk with alternating orange bracts */}
      <path d="M30 8C32 34 36 58 44 76" fill="none" stroke={INK} strokeWidth={7} strokeLinecap="round" />
      <path d="M30 8C32 34 36 58 44 76" fill="none" stroke="#8cc04b" strokeWidth={3.5} strokeLinecap="round" />
      {[[33, 28, 0], [39, 48, 12], [46, 68, 24]].map(([x, y, r], i) => (
        <path key={i} d="M0 0C12 -10 26 -2 28 10C20 14 6 12 0 0Z" transform={`translate(${x} ${y}) rotate(${r})`} fill="#e8893a" {...O} strokeWidth={2.4} />
      ))}
      <path d="M46 78C56 78 62 86 62 94C52 94 46 86 46 78Z" fill="#e0a526" {...O} strokeWidth={2.4} />
      {/* long dark tail, fanned */}
      <path d="M126 128L150 176L136 178L118 136Z" fill="#4a3a2c" {...O} />
      <path d="M134 124L172 160L162 170L124 134Z" fill={BRONZE_SH} {...O} />
      <path d="M132 132L160 160" stroke={BRONZE_HI} strokeWidth={2.4} strokeLinecap="round" opacity={0.7} />
      {/* wing fans */}
      <WingFan d={fan(122, 102, 52, 196, 262)} color={BRONZE_HI} />
      <WingFan d={fan(122, 102, 50, 262, 326)} color={BRONZE_HI} />
      {/* body, tilted down toward the flower */}
      <Part id={`${P}-body`} d="M86 90C94 74 112 68 130 74C148 82 152 104 140 120C128 134 106 134 92 120C84 112 82 100 86 90Z" fill={BRONZE} shade={BRONZE_SH}>
        <path d="M86 104C96 122 116 132 134 122C124 108 108 98 92 94Z" fill={BELLY} />
        <path d={ell(120, 80, 12, 5)} fill={BRONZE_HI} transform="rotate(-20 120 80)" />
      </Part>
      {/* head with blue crown, purple throat and the white eye-stripe */}
      <Part id={`${P}-head`} d={ell(82, 86, 21, 19)} fill={BRONZE} shade={BRONZE_SH} shift={[0, 4]}>
        <path d={ell(80, 72, 20, 10)} fill={CROWN} />
      </Part>
      <path d="M62 88C64 102 72 110 86 110C98 110 106 100 106 88C96 94 78 94 62 88Z" fill={PURPLE} {...O} strokeWidth={2.4} />
      <path d="M70 96q6 6 14 7" fill="none" stroke="#b86ff0" strokeWidth={2.4} strokeLinecap="round" />
      <path d="M81 82C88 80 96 82 103 88" fill="none" stroke={INK} strokeWidth={7} strokeLinecap="round" />
      <path d="M81 82C88 80 96 82 103 88" fill="none" stroke="#f6f3ea" strokeWidth={4} strokeLinecap="round" />
      <Eye cx={73} cy={84} r={7} look={[-0.4, 0.2]} sw={2.5} />
      {/* straight bill, slightly longer, pointing up-left at the flower */}
      <path d="M64 86L34 72L62 92Z" fill="#1d1a16" {...O} strokeWidth={2.4} />
    </g>
  );
}
