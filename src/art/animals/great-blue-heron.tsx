// Great Blue Heron (Ardea herodias) — tall grey-blue bird, S-curved neck, white head with a black stripe and plume
// over the eye, long yellow dagger bill, long legs standing in shallow water beside a reed. Facing left.
import { Eye, GroundShadow, INK, O, Part, ell } from './_shapes';

const P = 'pv-heron';
const GREY = '#7d93a8';
const GREY_HI = '#a3b6c8';
const GREY_SH = '#55697d';
const WHITE = '#f3f1ea';
const LEG = '#8c8a6a';

// neck as a thick S stroke: leaves the chest, swings forward, back, then up to the head
const NECK = 'M110 118C86 112 74 92 86 74C94 62 106 60 108 46';

export function GreatBlueHeron() {
  return (
    <g>
      {/* water */}
      <path d={ell(102, 176, 70, 10)} fill="#8fd3cf" {...O} strokeWidth={2.5} />
      <path d="M52 176q10 -4 20 0M120 178q10 -4 20 0M84 172q10 -4 20 0" fill="none" stroke="#2cb1a6" strokeWidth={2.5} strokeLinecap="round" opacity={0.8} />
      <GroundShadow cx={112} cy={176} rx={34} ry={5} />
      {/* reed */}
      <path d="M162 174C164 150 162 120 164 94" fill="none" stroke={INK} strokeWidth={7} strokeLinecap="round" />
      <path d="M162 174C164 150 162 120 164 94" fill="none" stroke="#7a8a3c" strokeWidth={3.5} strokeLinecap="round" />
      <path d={ell(164, 84, 5, 14)} fill="#6b4a2d" {...O} strokeWidth={2.5} />
      <path d="M158 150C150 140 148 126 152 112" fill="none" stroke="#7a8a3c" strokeWidth={3.5} strokeLinecap="round" />
      {/* long legs */}
      <path d="M106 144L102 170M124 144L128 170" fill="none" stroke={INK} strokeWidth={7} strokeLinecap="round" />
      <path d="M106 144L102 170M124 144L128 170" fill="none" stroke={LEG} strokeWidth={3.5} strokeLinecap="round" />
      <path d="M90 172L102 170L114 172M116 172L128 170L140 172" fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M90 172L102 170L114 172M116 172L128 170L140 172" fill="none" stroke={LEG} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      {/* neck */}
      <path d={NECK} fill="none" stroke={INK} strokeWidth={26} strokeLinecap="round" />
      <path d={NECK} fill="none" stroke={GREY_HI} strokeWidth={20} strokeLinecap="round" />
      <path d="M104 112C86 106 80 90 90 76" fill="none" stroke={WHITE} strokeWidth={6} strokeLinecap="round" opacity={0.7} />
      {/* body */}
      <Part id={`${P}-body`} d="M78 122C82 102 106 96 132 100C156 104 168 120 162 140C156 156 134 160 112 156C88 152 74 140 78 122Z" fill={GREY} shade={GREY_SH}>
        <path d={ell(114, 154, 40, 10)} fill={GREY_HI} />
        <path d={ell(112, 108, 22, 7)} fill={GREY_HI} transform="rotate(-10 112 108)" />
      </Part>
      {/* wing */}
      <Part id={`${P}-wing`} d="M108 112C132 106 156 116 160 134C160 146 150 154 136 152C118 148 104 130 108 112Z" fill={GREY_SH} shade="#3e5062" shift={[3, 4]}>
        <path d="M114 116C132 114 148 122 154 136" fill="none" stroke={GREY} strokeWidth={4} strokeLinecap="round" />
        <path d="M120 134q10 6 22 10M116 124q12 4 26 14" fill="none" stroke="#3e5062" strokeWidth={2.4} strokeLinecap="round" />
      </Part>
      {/* head: white, black stripe through the eye sweeping back into a plume, yellow dagger bill */}
      <Part id={`${P}-head`} d={ell(104, 42, 26, 21)} fill={WHITE} shade="#d8d6cc" shift={[0, 5]}>
        <path d="M80 36C94 26 116 26 130 32L132 46C114 40 96 40 80 46Z" fill="#2b2a30" />
      </Part>
      <path d="M124 34C138 26 150 28 160 36" fill="none" stroke={INK} strokeWidth={7} strokeLinecap="round" />
      <path d="M126 35C138 29 148 30 156 36" fill="none" stroke="#2b2a30" strokeWidth={3.5} strokeLinecap="round" />
      <path d="M86 42L30 52L86 58Z" fill="#e8c23a" {...O} />
      <path d="M82 50L42 52" stroke="#b8911f" strokeWidth={2} strokeLinecap="round" />
      <Eye cx={96} cy={44} r={9} look={[-0.4, 0]} />
    </g>
  );
}
