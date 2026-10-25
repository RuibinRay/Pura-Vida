// Baird's Tapir (Tapirus bairdii) — dark grey-brown stocky body, the short flexible trunk-like snout, pale cream
// cheeks and throat, white-tipped round ears, short legs. Standing, facing left, trunk raised in a curl.
import { Eye, GroundShadow, INK, O, Part, ell } from './_shapes';

const P = 'pv-tapir';
const HIDE = '#5e5048';
const HIDE_HI = '#7d6d64';
const HIDE_SH = '#3f342e';
const CREAM = '#e6d7bd';

function Leg({ x, back }: { x: number; back?: boolean }) {
  return (
    <g>
      <path d={`M${x - 11} 128L${x - 11} 166Q${x - 11} 172 ${x - 5} 172L${x + 5} 172Q${x + 11} 172 ${x + 11} 166L${x + 11} 128Z`} fill={back ? HIDE_SH : HIDE} {...O} />
      <path d={`M${x - 8} 172L${x - 8} 166M${x} 172L${x} 165M${x + 8} 172L${x + 8} 166`} stroke={INK} strokeWidth={2.2} strokeLinecap="round" />
    </g>
  );
}

// the trunk: a thick stroke curling forward and up from the front of the face
const TRUNK = 'M40 94C28 96 18 90 16 78';

export function BairdsTapir() {
  return (
    <g>
      <GroundShadow cx={104} cy={176} rx={62} ry={8} />
      <Leg x={76} back />
      <Leg x={148} back />
      {/* stocky body with a high rounded back */}
      <Part id={`${P}-body`} d="M50 112C50 80 78 64 116 64C154 64 176 84 176 114C176 138 154 150 116 150C78 150 50 140 50 112Z" fill={HIDE} shade={HIDE_SH}>
        <path d={ell(118, 80, 32, 9)} fill={HIDE_HI} transform="rotate(-6 118 80)" />
      </Part>
      <Leg x={92} />
      <Leg x={132} />
      {/* head */}
      <Part id={`${P}-head`} d="M30 86C30 64 48 50 74 50C100 50 114 66 112 88C110 108 94 118 70 118C48 118 30 106 30 86Z" fill={HIDE} shade={HIDE_SH} shift={[0, 5]}>
        <path d={ell(72, 108, 30, 14)} fill={CREAM} />
        <path d={ell(64, 60, 14, 6)} fill={HIDE_HI} transform="rotate(-20 64 60)" />
      </Part>
      {/* the trunk-like snout */}
      <path d={TRUNK} fill="none" stroke={INK} strokeWidth={24} strokeLinecap="round" />
      <path d={TRUNK} fill="none" stroke={HIDE} strokeWidth={18} strokeLinecap="round" />
      <path d="M34 90C26 90 22 86 20 80" fill="none" stroke={HIDE_HI} strokeWidth={3} strokeLinecap="round" />
      <circle cx={14} cy={76} r={2.2} fill={INK} />
      <circle cx={20} cy={72} r={2.2} fill={INK} />
      {/* white-tipped round ears */}
      <circle cx={54} cy={52} r={10} fill={HIDE} {...O} />
      <path d="M46 46a10 10 0 0 1 16 0" fill="none" stroke="#f1ece0" strokeWidth={4} strokeLinecap="round" />
      <circle cx={96} cy={54} r={10} fill={HIDE} {...O} />
      <path d="M88 48a10 10 0 0 1 16 0" fill="none" stroke="#f1ece0" strokeWidth={4} strokeLinecap="round" />
      <Eye cx={58} cy={82} r={9} look={[-0.4, 0.1]} />
      <path d="M46 106q8 6 16 0" fill="none" stroke={INK} strokeWidth={2.6} strokeLinecap="round" />
      {/* stubby tail */}
      <path d="M174 112q10 4 10 14" fill="none" stroke={INK} strokeWidth={7} strokeLinecap="round" />
      <path d="M174 112q10 4 10 14" fill="none" stroke={HIDE} strokeWidth={3} strokeLinecap="round" />
    </g>
  );
}
