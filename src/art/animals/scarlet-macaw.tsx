// Scarlet Macaw (Ara macao) — scarlet body, yellow then blue band on the wing, blue tail feathers, white bare face
// patch with thin dark feather lines, big pale upper bill over a dark lower bill. Perched on a branch, facing left.
import { Branch, Eye, Foot, GroundShadow, INK, O, Part, ell } from './_shapes';

const P = 'pv-macaw';
const RED = '#d9383c';
const RED_HI = '#ef6a5e';
const RED_SH = '#a9262c';
const YELLOW = '#f2c531';
const BLUE = '#2f6fc9';
const BLUE_SH = '#1f4b93';

const BODY = 'M108 30C130 30 146 46 146 66C146 80 142 90 136 98C152 108 160 126 156 146C152 162 134 166 118 166C100 166 84 160 82 142C80 128 80 112 90 100C78 92 72 80 72 66C72 46 88 30 108 30Z';
const WING = 'M136 94C156 100 164 122 158 150C154 160 144 160 138 150C132 136 128 116 132 100Z';

export function ScarletMacaw() {
  return (
    <g>
      <GroundShadow cx={112} cy={188} rx={56} ry={6} />
      {/* long blue tail feathers hanging below the branch */}
      <path d="M120 150L132 198L146 196L140 150Z" fill={BLUE} {...O} />
      <path d="M134 150L152 194L164 190L150 148Z" fill={BLUE_SH} {...O} />
      <path d="M126 158L134 186" stroke="#5b94e8" strokeWidth={3} strokeLinecap="round" />
      <Branch id={P} x1={40} x2={190} y={172} r={8} />
      <Part id={`${P}-body`} d={BODY} fill={RED} shade={RED_SH}>
        <path d={ell(92, 50, 14, 8)} fill={RED_HI} transform="rotate(-30 92 50)" />
        <path d={ell(96, 120, 12, 24)} fill={RED_HI} opacity={0.6} />
      </Part>
      {/* wing: red shoulder, yellow band, blue flight feathers */}
      <Part id={`${P}-wing`} d={WING} fill={RED} shade={RED_SH} shift={[3, 4]}>
        <path d="M128 112C142 110 156 120 162 134L164 160L132 160Z" fill={YELLOW} />
        <path d="M128 128C142 124 158 134 164 146L166 164L130 164Z" fill={BLUE} />
        <path d="M140 136q8 8 12 20M148 132q6 8 10 20" fill="none" stroke={BLUE_SH} strokeWidth={2.5} strokeLinecap="round" />
      </Part>
      {/* white bare face patch with thin feather lines */}
      <path d="M76 52C86 44 100 42 110 52C116 62 112 76 102 82C90 86 76 80 72 68C70 62 72 56 76 52Z" fill="#f7f1ea" {...O} strokeWidth={2.5} />
      <path d="M80 62q8 -2 14 2M82 70q8 -2 14 2" fill="none" stroke={INK} strokeWidth={1.6} strokeLinecap="round" opacity={0.45} />
      <Eye cx={100} cy={60} r={8.5} look={[-0.4, 0]} />
      {/* hooked bill: pale upper mandible curving down to a point, dark lower mandible tucked beneath */}
      <path d="M78 56C60 52 44 60 44 76C44 86 48 94 54 98C58 92 60 84 66 80C72 76 78 74 82 72C84 64 82 58 78 56Z" fill="#e9e1cf" {...O} />
      <path d="M56 66C62 62 70 62 76 66" fill="none" stroke="#ffffff" strokeWidth={3} strokeLinecap="round" opacity={0.8} />
      <path d="M66 80C72 78 80 78 86 82C86 90 78 96 70 94C64 92 62 86 66 80Z" fill="#3b3337" {...O} strokeWidth={2.5} />
      {/* feet */}
      <Foot x={104} y={164} color="#6e6468" />
      <Foot x={130} y={164} color="#6e6468" />
    </g>
  );
}
