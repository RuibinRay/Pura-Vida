// Central American Agouti (Dasyprocta punctata) — reddish-brown rodent with a high rounded rump, slim long legs,
// small round ears and a tapering snout, sitting up on its haunches holding a nut in its front paws.
import { Eye, GroundShadow, INK, O, Part, ell } from './_shapes';

const P = 'pv-agouti';
const FUR = '#b8683a';
const FUR_HI = '#d48c58';
const FUR_SH = '#8c4a24';
const BELLY = '#e3b98a';

export function CentralAmericanAgouti() {
  return (
    <g>
      <GroundShadow cx={100} cy={176} rx={54} ry={8} />
      {/* far hind leg */}
      <path d="M118 120C140 118 152 134 148 152C146 162 134 170 122 168L112 140Z" fill={FUR_SH} {...O} />
      {/* body: high rounded rump sloping down to the chest */}
      <Part id={`${P}-body`} d="M60 118C60 86 84 58 120 58C150 58 166 84 162 120C160 146 144 166 112 166C80 166 58 148 60 118Z" fill={FUR} shade={FUR_SH}>
        <path d={ell(84, 136, 24, 30)} fill={BELLY} />
        <path d={ell(126, 80, 18, 8)} fill={FUR_HI} transform="rotate(-34 126 80)" />
        <path d="M136 100q6 -4 10 0M142 114q6 -4 10 0M134 128q6 -4 10 0M146 142q6 -4 10 0" fill="none" stroke={FUR_SH} strokeWidth={2} strokeLinecap="round" opacity={0.5} />
      </Part>
      {/* near hind leg: slim thigh and a long slender foot */}
      <path d="M96 122C120 118 132 134 128 152C126 162 114 170 102 168L92 144Z" fill={FUR} {...O} />
      <path d="M70 170C70 162 84 160 100 162C116 164 126 168 124 172L72 172Z" fill={FUR} {...O} />
      <path d="M84 172v-5M96 172v-5M108 172v-5" stroke={INK} strokeWidth={2} strokeLinecap="round" />
      {/* front paws holding a nut */}
      <path d="M72 112C62 120 60 132 66 140" fill="none" stroke={INK} strokeWidth={14} strokeLinecap="round" />
      <path d="M72 112C62 120 60 132 66 140" fill="none" stroke={FUR} strokeWidth={8} strokeLinecap="round" />
      <Part id={`${P}-nut`} d={ell(56, 126, 13, 12)} fill="#8a5a32" shade="#5e3a1c" shift={[3, 4]}>
        <path d={ell(52, 120, 5, 3.5)} fill="#b07a48" />
      </Part>
      <path d="M44 118C48 110 64 110 68 118" fill="#5e3a1c" {...O} strokeWidth={2.4} />
      <path d="M74 124C68 128 64 136 62 142" fill="none" stroke={INK} strokeWidth={12} strokeLinecap="round" />
      <path d="M74 124C68 128 64 136 62 142" fill="none" stroke={FUR} strokeWidth={6} strokeLinecap="round" />
      <path d="M62 142l-4 2M62 142l0 4" stroke={INK} strokeWidth={2} strokeLinecap="round" />
      {/* head with a tapering snout */}
      <Part id={`${P}-head`} d="M34 86C40 62 60 48 88 48C110 48 122 64 120 84C118 102 102 110 80 108C60 106 40 100 34 86Z" fill={FUR} shade={FUR_SH} shift={[0, 5]}>
        <path d={ell(62, 98, 26, 12)} fill={BELLY} />
        <path d={ell(96, 58, 12, 6)} fill={FUR_HI} transform="rotate(-20 96 58)" />
      </Part>
      {/* small round ears */}
      <circle cx={108} cy={50} r={9} fill={FUR} {...O} />
      <circle cx={108} cy={50} r={4} fill="#e9b7a0" />
      <circle cx={82} cy={44} r={8} fill={FUR} {...O} />
      <Eye cx={68} cy={74} r={9} look={[-0.4, 0.1]} />
      <path d={ell(36, 86, 5, 4)} fill="#3d2a1e" stroke={INK} strokeWidth={2} />
      <path d="M40 92q4 6 10 2" fill="none" stroke={INK} strokeWidth={2.4} strokeLinecap="round" />
      <path d="M28 82l-8 -2M28 88l-8 2" stroke={INK} strokeWidth={1.8} strokeLinecap="round" opacity={0.6} />
    </g>
  );
}
