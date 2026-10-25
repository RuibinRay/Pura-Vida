// White-tailed Deer (Odocoileus virginianus) — a tan doe with white belly and throat, white inside the big ears,
// large dark eyes, black nose, slim legs and the white flag of a tail. Standing alert, facing left.
import { Eye, GroundShadow, INK, O, Part, ell } from './_shapes';

const P = 'pv-deer';
const TAN = '#c48c55';
const TAN_HI = '#ddab74';
const TAN_SH = '#96632f';
const WHITE = '#f5efe3';

function Leg({ x, y, back }: { x: number; y: number; back?: boolean }) {
  return (
    <g>
      <path d={`M${x - 6} ${y}L${x - 5} 164L${x + 5} 164L${x + 6} ${y}Z`} fill={back ? TAN_SH : TAN} {...O} />
      <path d={`M${x - 6} 164L${x - 6} 172L${x + 6} 172L${x + 6} 164Z`} fill="#3a2d26" {...O} strokeWidth={2.5} />
    </g>
  );
}

export function WhiteTailedDeer() {
  return (
    <g>
      <GroundShadow cx={104} cy={176} rx={56} ry={7} />
      {/* the white flag tail, raised */}
      <path d="M160 100C174 92 182 100 178 114C176 122 168 124 162 118Z" fill={WHITE} {...O} />
      <path d="M166 100C170 108 170 114 166 118" fill="none" stroke={TAN} strokeWidth={3} strokeLinecap="round" />
      <Leg x={78} y={130} back />
      <Leg x={148} y={128} back />
      {/* body */}
      <Part id={`${P}-body`} d="M58 104C62 82 86 76 116 78C142 80 166 90 166 116C166 134 146 142 110 142C80 142 56 134 58 104Z" fill={TAN} shade={TAN_SH}>
        <path d={ell(112, 142, 54, 16)} fill={WHITE} />
        <path d={ell(118, 90, 26, 7)} fill={TAN_HI} transform="rotate(-6 118 90)" />
      </Part>
      <Leg x={90} y={130} />
      <Leg x={136} y={130} />
      {/* neck */}
      <path d="M72 108C66 90 66 70 72 56L96 60C92 76 92 96 98 110Z" fill={TAN} {...O} />
      <path d="M78 106C72 90 74 72 80 60" fill="none" stroke={WHITE} strokeWidth={7} strokeLinecap="round" />
      {/* head */}
      <Part id={`${P}-head`} d="M38 60C38 42 54 32 74 32C94 32 104 44 102 62C100 78 86 86 62 84C46 82 38 74 38 60Z" fill={TAN} shade={TAN_SH} shift={[0, 5]}>
        <path d={ell(62, 78, 22, 10)} fill={WHITE} />
        <path d={ell(70, 40, 14, 5)} fill={TAN_HI} transform="rotate(-12 70 40)" />
      </Part>
      {/* big ears with white inside */}
      <path d="M56 36C44 22 34 16 30 24C28 34 38 44 54 46Z" fill={TAN} {...O} />
      <path d="M50 38C44 30 38 26 36 28C38 34 44 40 50 42Z" fill={WHITE} />
      <path d="M90 36C100 20 110 14 116 22C118 32 108 44 92 46Z" fill={TAN} {...O} />
      <path d="M94 40C100 30 106 26 108 28C106 34 100 40 94 42Z" fill={WHITE} />
      <Eye cx={58} cy={60} r={9.5} look={[-0.4, 0.1]} />
      <path d={ell(42, 70, 6, 4.5)} fill="#2a2320" stroke={INK} strokeWidth={2} />
      <path d="M46 78q6 4 12 0" fill="none" stroke={INK} strokeWidth={2.4} strokeLinecap="round" />
      <circle cx={40} cy={68} r={1.6} fill="#ffffff" opacity={0.7} />
    </g>
  );
}
