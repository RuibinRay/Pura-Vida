// Green Iguana (Iguana iguana) — green with a row of spikes down the back and tail, a dewlap under the chin, the big
// round scale on the cheek, a long striped tail that curls up and around; lying on a rock, facing left.
import { Eye, GroundShadow, INK, O, Part, Smile, ell } from './_shapes';

const P = 'pv-iguana';
const GREEN = '#6fb04a';
const GREEN_HI = '#9fd06a';
const GREEN_SH = '#467f2e';
const STONE = '#a9a192';
const STONE_SH = '#7f7768';

/** little spikes pointing outward (x, y, angle) */
function Spikes({ pts, h = 10, w = 8 }: { pts: [number, number, number][]; h?: number; w?: number }) {
  return (
    <g>
      {pts.map(([x, y, a], i) => (
        <path key={i} d={`M${-w / 2} 1L0 ${-h}L${w / 2} 1Z`} transform={`translate(${x} ${y}) rotate(${a})`} fill="#cfe38a" {...O} strokeWidth={2.4} />
      ))}
    </g>
  );
}

// the tail leaves the rump, sweeps right and curls up over itself
const TAIL = 'M146 120C176 118 190 136 180 156C172 172 150 170 148 156C146 146 160 142 164 150';

export function GreenIguana() {
  return (
    <g>
      <GroundShadow cx={100} cy={182} rx={64} ry={7} />
      {/* rock */}
      <Part id={`${P}-rock`} d="M22 168C24 150 46 140 78 142C112 136 150 142 176 150C190 156 184 172 170 174L34 174C26 174 22 172 22 168Z" fill={STONE} shade={STONE_SH} shift={[0, 6]}>
        <path d={ell(60, 152, 18, 5)} fill="#c7bfb0" />
      </Part>
      {/* tail: ink, green, dark bands, then spikes along the top */}
      <path d={TAIL} fill="none" stroke={INK} strokeWidth={20} strokeLinecap="round" />
      <path d={TAIL} fill="none" stroke={GREEN} strokeWidth={14} strokeLinecap="round" />
      <path d="M160 116L164 128M176 126L186 134M184 148L192 154M174 166L178 176M150 150L142 158" stroke={GREEN_SH} strokeWidth={6} strokeLinecap="round" />
      <Spikes pts={[[158, 112, -8], [172, 120, 24], [182, 134, 56]]} h={8} w={7} />
      {/* legs */}
      <path d="M72 128C62 136 52 142 46 146M130 128C138 136 148 142 156 146" fill="none" stroke={INK} strokeWidth={16} strokeLinecap="round" />
      <path d="M72 128C62 136 52 142 46 146M130 128C138 136 148 142 156 146" fill="none" stroke={GREEN} strokeWidth={10} strokeLinecap="round" />
      <path d="M46 146l-12 2M46 146l-8 7M46 146l-2 9M156 146l12 2M156 146l8 7M156 146l2 9" fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" />
      <path d="M46 146l-12 2M46 146l-8 7M46 146l-2 9M156 146l12 2M156 146l8 7M156 146l2 9" fill="none" stroke={GREEN} strokeWidth={2.5} strokeLinecap="round" />
      {/* dorsal crest */}
      <Spikes pts={[[76, 88, -18], [90, 82, -8], [104, 80, 0], [118, 82, 8], [132, 88, 18], [144, 98, 30]]} h={12} w={9} />
      {/* body */}
      <Part id={`${P}-body`} d="M52 118C52 94 80 82 110 84C142 86 160 104 158 130C156 148 130 154 100 152C70 150 52 140 52 118Z" fill={GREEN} shade={GREEN_SH}>
        <path d={ell(100, 146, 50, 14)} fill="#bcd88a" />
        <path d={ell(98, 98, 26, 8)} fill={GREEN_HI} transform="rotate(-6 98 98)" />
        <path d="M118 108q0 16 -2 36M134 112q0 14 -2 32" fill="none" stroke={GREEN_SH} strokeWidth={3.5} strokeLinecap="round" opacity={0.6} />
      </Part>
      {/* dewlap */}
      <path d="M46 110C40 120 42 134 58 140C66 134 68 122 66 112Z" fill="#8ec45e" {...O} />
      <path d="M50 116q0 10 6 18M58 116q0 8 4 16" fill="none" stroke={GREEN_SH} strokeWidth={2} strokeLinecap="round" opacity={0.5} />
      {/* head */}
      <Part id={`${P}-head`} d="M20 94C20 76 36 64 58 64C80 64 92 76 92 94C92 110 78 118 54 118C34 118 20 108 20 94Z" fill={GREEN} shade={GREEN_SH} shift={[0, 5]}>
        <path d={ell(44, 72, 14, 5)} fill={GREEN_HI} transform="rotate(-10 44 72)" />
      </Part>
      <Spikes pts={[[50, 66, -4], [62, 66, 6]]} h={8} w={7} />
      {/* the round cheek scale */}
      <circle cx={76} cy={102} r={8} fill="#d3e59a" {...O} strokeWidth={2.4} />
      <Eye cx={46} cy={88} r={9} look={[-0.4, 0.1]} />
      <circle cx={26} cy={92} r={1.8} fill={INK} />
      <Smile cx={34} cy={104} w={14} h={4} />
    </g>
  );
}
