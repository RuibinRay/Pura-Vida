// Panamanian White-faced Capuchin (Cebus imitator) — black body and cap, white/cream face, chest and shoulders,
// pinkish face skin, long prehensile tail curled up behind; sitting with one hand raised in a wave.
import { Eye, GroundShadow, INK, Limb, O, Part, Smile, ell } from './_shapes';

const P = 'pv-capuchin';
const BLACK = '#2f2a2e';
const BLACK_HI = '#4d464c';
const BLACK_SH = '#1d191c';
const CREAM = '#f3e9d2';
const CREAM_SH = '#d9ccad';
const SKIN = '#e9b9a6';

export function WhiteFacedCapuchin() {
  return (
    <g>
      <GroundShadow cx={100} cy={176} rx={52} ry={8} />
      {/* curled prehensile tail, swung out to the left */}
      <Limb d="M64 140C40 142 22 128 24 104C26 84 44 76 54 88C60 96 54 108 44 104" color={BLACK} w={10} />
      {/* legs folded, feet in front */}
      <path d={ell(74, 156, 22, 16)} fill={BLACK} {...O} />
      <path d={ell(126, 156, 22, 16)} fill={BLACK} {...O} />
      <path d="M60 166q4 6 10 2M70 168q4 4 8 0M126 168q4 4 8 0M134 166q4 6 10 2" fill="none" stroke={SKIN} strokeWidth={3} strokeLinecap="round" />
      {/* body */}
      <Part id={`${P}-body`} d="M56 150C50 120 64 90 100 88C136 90 150 120 144 150C140 166 60 166 56 150Z" fill={BLACK} shade={BLACK_SH}>
        <path d="M62 112C72 94 128 94 138 112C130 122 118 134 100 140C82 134 70 122 62 112Z" fill={CREAM} />
        <path d="M62 112C72 94 128 94 138 112C128 110 116 108 100 112C84 108 72 110 62 112Z" fill={CREAM_SH} opacity={0.6} />
      </Part>
      {/* left arm resting, right arm waving */}
      <Limb d="M70 110C58 126 60 146 72 158" color={BLACK} w={11} />
      <path d={ell(74, 160, 9, 7)} fill={SKIN} {...O} strokeWidth={2.5} />
      <Limb d="M132 108C146 104 160 90 164 70" color={BLACK} w={11} />
      <path d="M154 72C150 60 160 52 168 56C176 58 178 70 170 76C164 80 156 80 154 72Z" fill={SKIN} {...O} strokeWidth={2.5} />
      <path d="M158 58v10M164 55v12" fill="none" stroke={INK} strokeWidth={1.8} strokeLinecap="round" opacity={0.5} />
      {/* head: black cap over a cream face mask with pink skin */}
      <Part id={`${P}-head`} d={ell(100, 66, 40, 36)} fill={BLACK} shade={BLACK_SH} shift={[0, 5]}>
        <path d="M60 62C66 76 76 100 100 102C124 100 134 76 140 62C130 60 118 52 100 52C82 52 70 60 60 62Z" fill={CREAM} />
        <path d={ell(100, 76, 20, 16)} fill={SKIN} />
        <path d={ell(86, 42, 12, 5)} fill={BLACK_HI} transform="rotate(-20 86 42)" />
      </Part>
      {/* ears */}
      <circle cx={60} cy={70} r={8} fill={SKIN} {...O} strokeWidth={2.5} />
      <circle cx={140} cy={70} r={8} fill={SKIN} {...O} strokeWidth={2.5} />
      <Eye cx={88} cy={70} r={9} look={[0.3, 0.2]} />
      <Eye cx={112} cy={70} r={9} look={[0.3, 0.2]} />
      <path d="M96 81q4 3 8 0" fill="none" stroke={INK} strokeWidth={2.5} strokeLinecap="round" />
      <Smile cx={100} cy={86} w={16} h={5} />
    </g>
  );
}
