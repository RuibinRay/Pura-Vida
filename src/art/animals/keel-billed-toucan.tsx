// Keel-billed Toucan (Ramphastos sulfuratus) — black body, yellow face and bib, red under-tail, and the enormous
// lime bill with its orange patch, red tip and blue lower edge. Perched on a branch stub, facing left.
import { Branch, Eye, Foot, GroundShadow, INK, O, Part, ell } from './_shapes';

const P = 'pv-toucan';
const BLACK = '#3d3744';
const BLACK_HI = '#5c5464';
const BLACK_SH = '#2d2833';
const YELLOW = '#f6c431';
const RED = '#d9484f';

// head + body as one pear-shaped silhouette
const BODY = 'M122 36C144 36 160 52 160 72C160 86 154 96 150 104C164 112 172 126 170 142C168 160 150 166 132 166C114 166 98 160 98 142C96 130 94 112 102 100C90 92 86 82 86 72C86 52 102 36 122 36Z';
const WING = 'M152 102C168 112 172 136 162 156C154 160 144 150 140 130C138 116 142 106 152 102Z';
const BILL = 'M96 54C70 52 44 60 30 76C24 84 26 92 36 93C60 95 80 94 94 92C92 80 92 66 96 54Z';
const TAIL = 'M140 150L166 160L172 188L150 184L138 160Z';

export function KeelBilledToucan() {
  return (
    <g>
      <GroundShadow cx={116} cy={186} rx={58} ry={7} />
      {/* tail, behind the branch */}
      <Part id={`${P}-tail`} d={TAIL} fill={BLACK} shade={BLACK_SH} shift={[4, 4]}>
        <path d="M150 160L160 186M158 157L170 184" stroke={BLACK_HI} strokeWidth={3} strokeLinecap="round" />
      </Part>
      {/* red under-tail coverts peeking out behind the body */}
      <path d={ell(148, 160, 17, 11)} fill={RED} {...O} />
      <Branch id={P} x1={54} x2={186} y={172} r={8} />
      {/* body */}
      <Part id={`${P}-body`} d={BODY} fill={BLACK} shade={BLACK_SH}>
        <path d={ell(100, 106, 44, 50)} fill={RED} />
        <path d={ell(100, 98, 44, 50)} fill={YELLOW} />
        <path d={ell(72, 86, 20, 26)} fill="#fbd96a" opacity={0.7} />
        <path d={ell(130, 50, 16, 7)} fill={BLACK_HI} transform="rotate(20 130 50)" />
      </Part>
      <Part id={`${P}-wing`} d={WING} fill={BLACK} shade={BLACK_SH} shift={[4, 5]}>
        <path d={ell(152, 116, 6, 12)} fill={BLACK_HI} transform="rotate(14 152 116)" />
      </Part>
      {/* eye with its pale green bare-skin ring */}
      <circle cx={118} cy={62} r={14} fill="#b9dc7c" stroke={INK} strokeWidth={2.5} />
      <Eye cx={118} cy={62} r={9.5} look={[-0.5, 0]} />
      {/* bill */}
      <Part id={`${P}-bill`} d={BILL} fill="#a9d33a" shade="#86b12a" shift={[0, 6]}>
        <path d={ell(58, 68, 15, 8)} fill="#ef8a2a" transform="rotate(-8 58 68)" />
        <path d="M94 92C80 94 60 95 36 93C44 85 70 83 94 84Z" fill="#6fb6d8" />
        <circle cx={32} cy={84} r={13} fill={RED} />
        <path d="M88 60C70 58 56 61 46 68" fill="none" stroke="#d9ee8f" strokeWidth={4} strokeLinecap="round" />
        <path d="M94 84C70 85 52 87 34 90" fill="none" stroke={INK} strokeWidth={2.2} strokeLinecap="round" />
      </Part>
      {/* blue-grey feet gripping the branch */}
      <Foot x={116} y={164} color="#7b9ab0" />
      <Foot x={144} y={164} color="#7b9ab0" />
    </g>
  );
}
