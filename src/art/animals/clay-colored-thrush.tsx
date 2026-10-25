// Clay-colored Thrush / yigüirro (Turdus grayi), the national bird — olive-brown above, buff below with a faintly
// streaked throat, pale yellow-green bill, dark eye. Standing on the ground, bill open and singing.
import { Eye, GroundShadow, INK, Note, O, Part, ell } from './_shapes';

const P = 'pv-thrush';
const BACK = '#8a6e45';
const BACK_HI = '#a88a5c';
const BACK_SH = '#6b5233';
const BELLY = '#e3c99a';
const BILL = '#d5cf6a';
const LEG = '#b59a6c';

const BODY = 'M70 44C70 26 86 18 102 20C118 22 126 34 124 50C140 58 158 74 160 104C162 132 142 154 110 156C80 158 52 140 50 112C48 90 56 76 70 66C64 60 66 50 70 44Z';
const WING = 'M106 70C130 68 150 82 152 106C152 122 140 134 120 130C104 124 96 104 100 86C100 78 102 72 106 70Z';

export function ClayColoredThrush() {
  return (
    <g>
      <GroundShadow cx={104} cy={178} rx={48} ry={7} />
      {/* tail */}
      <path d="M140 130L176 142L178 156L146 150Z" fill={BACK_SH} {...O} />
      {/* legs */}
      <path d="M94 150L92 170M118 150L120 170" fill="none" stroke={INK} strokeWidth={7} strokeLinecap="round" />
      <path d="M94 150L92 170M118 150L120 170" fill="none" stroke={LEG} strokeWidth={3.5} strokeLinecap="round" />
      <path d="M82 172L92 170L102 172M92 170L94 164M110 172L120 170L130 172M120 170L122 164" fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M82 172L92 170L102 172M110 172L120 170L130 172" fill="none" stroke={LEG} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      {/* body: olive-brown back, one buff front from throat to belly */}
      <Part id={`${P}-body`} d={BODY} fill={BACK} shade={BACK_SH}>
        <path d="M74 54C60 68 48 90 46 112C44 142 70 162 104 162C128 160 138 140 132 112C126 92 112 84 98 80C88 76 82 64 74 54Z" fill={BELLY} />
        <path d="M78 64q4 4 1 9M86 64q4 4 1 9M94 66q4 4 1 9M82 74q4 4 1 9M90 76q4 4 1 9" fill="none" stroke={BACK} strokeWidth={2.2} strokeLinecap="round" opacity={0.5} />
        <path d={ell(92, 30, 12, 5)} fill={BACK_HI} transform="rotate(-10 92 30)" />
      </Part>
      <Part id={`${P}-wing`} d={WING} fill={BACK} shade={BACK_SH} shift={[4, 5]}>
        <path d="M108 76C124 78 138 90 140 108" fill="none" stroke={BACK_HI} strokeWidth={4} strokeLinecap="round" />
        <path d="M112 112q10 8 24 8M110 100q12 10 30 10" fill="none" stroke={BACK_SH} strokeWidth={2.5} strokeLinecap="round" />
      </Part>
      {/* open singing bill */}
      <path d="M72 46L42 42L70 54Z" fill={BILL} {...O} />
      <path d="M70 54L44 60L72 60Z" fill="#b8b24e" {...O} />
      <path d="M60 50L56 50" stroke="#f1eca0" strokeWidth={2} strokeLinecap="round" />
      <Eye cx={92} cy={38} r={9} look={[-0.4, 0]} />
      <Note x={36} y={28} s={0.9} />
      <Note x={56} y={16} s={0.7} />
    </g>
  );
}
