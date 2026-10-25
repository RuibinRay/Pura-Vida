// Brown-throated Three-toed Sloth (Bradypus variegatus) — shaggy grey-brown fur, round pale face with the dark
// stripe through each eye, dark nose and the famous smile, three long claws per hand, hanging under a branch by
// all four limbs with the head raised toward the viewer.
import { Branch, Eye, GroundShadow, INK, O, Part, ell, scallop } from './_shapes';

const P = 'pv-sloth';
const FUR = '#8c7b63';
const FUR_HI = '#a89a80';
const FUR_SH = '#6a5b47';
const FACE = '#ece2c8';
const STRIPE = '#4b3826';
const CLAW = '#e0d4b4';

/** a paw hooked over the branch (top edge at y=21): the paw sits on the branch, three long claws curl down its face */
function Paw({ x, flip, s = 1 }: { x: number; flip?: boolean; s?: number }) {
  const sx = flip ? -s : s;
  // one tapered, hooked claw; the others are shifted copies
  const claw = 'M-5 24C-9 36 -8 50 2 58C0 50 -1 38 2 26Z';
  return (
    <g transform={`translate(${x} 0) scale(${sx} ${s})`}>
      <path d={ell(0, 22, 14, 10)} fill={FUR} {...O} />
      <path d={ell(-3, 18, 7, 3.5)} fill={FUR_HI} />
      {[-9, 0, 9].map((dx) => <path key={dx} d={claw} transform={`translate(${dx} 0)`} fill={CLAW} {...O} strokeWidth={2.4} />)}
    </g>
  );
}

function Limb({ d, w, color = FUR }: { d: string; w: number; color?: string }) {
  return (
    <g>
      <path d={d} fill="none" stroke={INK} strokeWidth={w + 6} strokeLinecap="round" />
      <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" />
    </g>
  );
}

export function BrownThroatedThreeToedSloth() {
  return (
    <g>
      <GroundShadow cx={100} cy={188} rx={44} ry={5} />
      <Branch id={P} x1={14} x2={186} y={30} r={9} />
      {/* hind legs (outer, behind) and arms (inner) all reach up to the branch */}
      <Limb d="M36 30C40 60 56 84 76 96" w={16} color={FUR_SH} />
      <Limb d="M164 30C160 60 144 84 124 96" w={16} color={FUR_SH} />
      <Limb d="M64 30C62 60 70 84 86 98" w={20} />
      <Limb d="M136 30C138 60 130 84 114 98" w={20} />
      <path d="M60 42C60 62 66 76 74 86" fill="none" stroke={FUR_HI} strokeWidth={5} strokeLinecap="round" />
      {/* shaggy body hanging like a hammock */}
      <Part id={`${P}-body`} d={scallop(100, 92, 46, 36, 16, 0.2)} fill={FUR} shade={FUR_SH} shift={[0, 7]}>
        <path d={ell(82, 72, 20, 9)} fill={FUR_HI} transform="rotate(-18 82 72)" />
      </Part>
      {/* head, raised toward the viewer */}
      <Part id={`${P}-head`} d={scallop(100, 134, 42, 38, 18, 0.14)} fill={FUR} shade={FUR_SH} shift={[0, 6]}>
        <path d={ell(100, 136, 32, 28)} fill={FACE} />
        <path d="M86 128C78 128 70 134 62 142" fill="none" stroke={STRIPE} strokeWidth={11} strokeLinecap="round" />
        <path d="M114 128C122 128 130 134 138 142" fill="none" stroke={STRIPE} strokeWidth={11} strokeLinecap="round" />
      </Part>
      <Eye cx={87} cy={130} r={8.5} look={[0.2, 0.3]} />
      <Eye cx={113} cy={130} r={8.5} look={[0.2, 0.3]} />
      <path d={ell(100, 144, 6.5, 4.5)} fill={STRIPE} stroke={INK} strokeWidth={2} />
      <path d="M82 150q18 16 36 0" fill="none" stroke={INK} strokeWidth={2.8} strokeLinecap="round" />
      {/* paws last, so the claws hang in front of the branch */}
      <Paw x={36} s={0.85} />
      <Paw x={164} flip s={0.85} />
      <Paw x={64} />
      <Paw x={136} flip />
    </g>
  );
}
