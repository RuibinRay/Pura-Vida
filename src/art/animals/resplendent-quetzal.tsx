// Resplendent Quetzal (Pharomachrus mocinno) — emerald head, back and wings, crimson belly, white under-tail, two
// very long green tail streamers trailing below the branch, small yellow bill and a fluffy crest. Perched on a short
// branch stub set high, so the streamers have room to hang; facing left.
import { Branch, Eye, Foot, GroundShadow, O, Part, ell, scallop } from './_shapes';

const P = 'pv-quetzal';
const GREEN = '#1f9b6a';
const GREEN_HI = '#5fd39a';
const GREEN_SH = '#136b48';
const RED = '#d8303a';
const RED_SH = '#a81f2b';

const BODY = 'M98 26C118 26 132 40 132 58C132 68 128 76 122 82C136 90 142 106 140 122C138 140 124 146 108 146C92 146 78 140 76 124C74 110 76 96 84 84C72 76 64 66 64 54C64 36 80 26 98 26Z';
const WING = 'M122 78C140 84 148 108 142 132C138 142 128 140 124 130C118 114 114 96 118 82Z';

export function ResplendentQuetzal() {
  return (
    <g>
      <GroundShadow cx={118} cy={194} rx={40} ry={4} />
      {/* the two tail streamers, curving out behind and below the branch */}
      <path d="M118 140C120 160 128 180 142 196L152 192C140 176 134 158 132 138Z" fill={GREEN} {...O} />
      <path d="M130 136C134 156 144 174 160 188L168 182C154 168 146 152 142 132Z" fill={GREEN_SH} {...O} />
      <path d="M124 142C128 160 136 176 146 190" fill="none" stroke={GREEN_HI} strokeWidth={2.5} strokeLinecap="round" opacity={0.8} />
      {/* white under-tail */}
      <path d="M102 128L104 150L128 152L132 128Z" fill="#f4f1ea" {...O} />
      <Branch id={P} x1={40} x2={176} y={154} r={7} />
      {/* fluffy crest */}
      <path d={scallop(96, 32, 30, 14, 10, 0.3)} fill={GREEN} {...O} />
      <Part id={`${P}-body`} d={BODY} fill={GREEN} shade={GREEN_SH}>
        <path d={ell(102, 114, 36, 30)} fill={RED} />
        <path d={ell(108, 126, 20, 14)} fill={RED_SH} opacity={0.6} />
        <path d={ell(80, 44, 14, 7)} fill={GREEN_HI} transform="rotate(-24 80 44)" />
      </Part>
      <Part id={`${P}-wing`} d={WING} fill={GREEN} shade={GREEN_SH} shift={[3, 5]}>
        <path d="M122 86C132 92 138 108 136 124" fill="none" stroke={GREEN_HI} strokeWidth={3.5} strokeLinecap="round" />
        <path d="M124 102q8 8 12 22M120 114q6 8 10 18" fill="none" stroke={GREEN_SH} strokeWidth={2.4} strokeLinecap="round" />
      </Part>
      {/* small yellow bill, dark eye */}
      <path d="M70 54L52 60L70 66Z" fill="#f2c531" {...O} strokeWidth={2.5} />
      <Eye cx={84} cy={50} r={9} look={[-0.4, 0]} />
      <Foot x={96} y={147} color="#8b7a5a" s={0.9} />
      <Foot x={120} y={147} color="#8b7a5a" s={0.9} />
    </g>
  );
}
