// Place postcards: one illustrated SVG scene per landmark, composed from src/art/places/parts.tsx according to a
// SceneSpec (hand-tuned in scenes.ts, otherwise generated from kind + province + a hash of the id).
import type { CSSProperties, ReactNode } from 'react';
import {
  Beach, Birds, Block, Boat, Bridge, BroadTree, Canopy, Castle, CaveMouth, Church, Cloud, ClockTower, Cypress, Fern, Fortin,
  Fringe, Ground, Heron, Hills, Island, Lake, Leaf, Lighthouse, Mangrove, Mist, Moon, Mounds, Oxcart, Palm, PALETTES, Plane,
  Range, Rain, Reef, River, Rocks, Ruins, Sea, Sky, Stars, Steam, Sun, Theatre, Town, Turtle, VolcanoCone, Waterfall, WhaleTail,
  WoodHall, hashId, mix, prng,
  type Palette, type TimeOfDay,
} from './parts';
import { SCENES, type SceneBase, type SceneSpec, type SceneSubject } from './scenes';

const TIMES: TimeOfDay[] = ['day', 'day', 'dawn', 'dusk', 'misty', 'day', 'night'];

function generate(id: string, kind: string, province?: string | null): SceneSpec {
  const h = hashId(id);
  const r = prng(h);
  const time = TIMES[Math.floor(r() * TIMES.length)];
  const fringes: SceneSpec['fringe'][] = ['left', 'right', 'both', 'left', 'right'];
  const fringe = fringes[Math.floor(r() * fringes.length)];
  const common = { time, fringe, seed: h, birds: r() > 0.5, province: province ?? null } as const;
  const dry = province === 'guanacaste';
  const carib = province === 'limon';
  switch (kind) {
    case 'volcano':
      return { ...common, base: dry ? 'dry-forest' : 'volcano', cone: { x: 130 + Math.floor(r() * 70), w: 200 + Math.floor(r() * 100), h: 60 + Math.floor(r() * 50), flat: 0.08 + r() * 0.25, steam: r() > 0.6, lake: r() > 0.6 ? '#5fc8b8' : undefined, color: mix('#5a6a56', '#857a6a', r()) } };
    case 'mountain': return { ...common, base: r() > 0.5 ? 'highland' : 'mountain', depth: 2 + Math.floor(r() * 3) };
    case 'park': case 'reserve': case 'refuge':
      return { ...common, base: dry ? 'dry-forest' : carib ? (r() > 0.5 ? 'canal' : 'rainforest') : (['rainforest', 'cloud-forest', 'waterfall', 'river'] as SceneBase[])[Math.floor(r() * 4)], depth: 2 + Math.floor(r() * 2), rain: carib && r() > 0.5 };
    case 'monument': return { ...common, base: 'town', subject: 'ruins', backdrop: 'none' };
    case 'island': return { ...common, base: 'island', extras: ['boat'] };
    case 'waterfall': return { ...common, base: 'waterfall', depth: 2 };
    case 'beach': return { ...common, base: 'beach', palms: 1 + Math.floor(r() * 3), extras: r() > 0.5 ? ['sailboat'] : [] };
    case 'museum': return { ...common, base: 'city', subject: 'museum', backdrop: 'none' };
    case 'river': return { ...common, base: 'river', subject: r() > 0.5 ? 'boat' : 'bridge' };
    case 'building': return { ...common, base: 'city', subject: 'university', backdrop: 'none' };
    case 'wetland': return { ...common, base: 'wetland', subject: 'heron' };
    default: {
      const backdrop = ({ cartago: 'irazu', alajuela: 'poas', heredia: 'barva', 'san-jose': 'irazu', guanacaste: 'guanacaste', puntarenas: 'talamanca', limon: 'none' } as Record<string, SceneSpec['backdrop']>)[province ?? ''] ?? 'talamanca';
      return { ...common, base: kind === 'capital' || kind === 'province-capital' ? 'city' : 'town', backdrop, rain: carib, palms: carib ? 2 : 0 };
    }
  }
}

export function sceneFor(id: string, kind: string, province?: string | null): SceneSpec {
  return SCENES[id] ?? generate(id, kind, province);
}

// ---------- province flavour ----------
const PROV: Record<string, { hill: string; ground: string; roof: string; wall: string }> = {
  'san-jose': { hill: '#5f8f58', ground: '#7aa062', roof: '#b9533c', wall: '#f1ead9' },
  alajuela: { hill: '#6a9a52', ground: '#8db25c', roof: '#c96a3a', wall: '#f3ecd8' },
  cartago: { hill: '#4f7f58', ground: '#6f9a5e', roof: '#8a5a7a', wall: '#ece6d8' },
  heredia: { hill: '#4d8a66', ground: '#73a56a', roof: '#b04a3a', wall: '#f4efe0' },
  guanacaste: { hill: '#b8a054', ground: '#d6b345', roof: '#b9533c', wall: '#faf6ec' },
  puntarenas: { hill: '#5a8f6a', ground: '#8fb06a', roof: '#3b78a8', wall: '#f4efe0' },
  limon: { hill: '#3f8a4e', ground: '#5fa05a', roof: '#d9484f', wall: '#f4efe0' },
};

interface Ctx { p: string; pal: Palette; rnd: () => number; spec: SceneSpec; seed: number; time: TimeOfDay }

function hazeColor(ctx: Ctx, i: number, n: number) {
  // far layers fade toward the haze colour
  const t = n <= 1 ? 0.3 : 0.25 + (0.6 * (n - 1 - i)) / Math.max(1, n - 1);
  return mix(ctx.pal.near, ctx.pal.haze, t);
}

function skyLayer(ctx: Ctx, horizon = 110): ReactNode {
  const { p, pal, time, seed, rnd } = ctx;
  const sunX = 60 + rnd() * 200;
  return (
    <g key="sky">
      <Sky p={p} pal={pal} />
      {time === 'night' && <Stars seed={seed} />}
      {time === 'night' ? <Moon x={sunX} y={34 + rnd() * 20} /> : ctx.spec.sun !== false && time !== 'misty' && <Sun x={sunX} y={time === 'day' ? 30 + rnd() * 24 : horizon - 30 - rnd() * 20} r={time === 'day' ? 11 : 15} color={pal.sun} glow={time === 'dusk' ? 'rgba(255,200,120,0.35)' : 'rgba(255,245,220,0.3)'} />}
      {time !== 'night' && <Cloud x={40 + rnd() * 100} y={30 + rnd() * 30} s={0.8 + rnd() * 0.5} fill={time === 'misty' ? 'rgba(255,255,255,0.9)' : time === 'dusk' ? 'rgba(255,220,190,0.8)' : 'rgba(255,255,255,0.85)'} />}
      {time !== 'night' && <Cloud x={200 + rnd() * 90} y={24 + rnd() * 30} s={0.6 + rnd() * 0.5} fill={time === 'dusk' ? 'rgba(255,210,180,0.7)' : 'rgba(255,255,255,0.75)'} />}
      {ctx.spec.birds && <Birds x={180 + rnd() * 80} y={40 + rnd() * 30} n={3} color={time === 'night' ? '#9ab' : '#3a4a4a'} />}
    </g>
  );
}

/** stacked far ridges with mist between them */
function depthLayers(ctx: Ctx, n: number, top: number, bottom: number, jagged = false): ReactNode[] {
  const out: ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const y = top + ((bottom - top) * i) / n;
    const c = hazeColor(ctx, i, n);
    out.push(jagged
      ? <Range key={'r' + i} y={y} color={c} seed={ctx.seed + i * 7} amp={22 - i * 3} peaks={4 + i} sharp={1 - i * 0.15} />
      : <Hills key={'h' + i} y={y} color={c} seed={ctx.seed + i * 7} amp={12 + i * 2} bumps={3 + i} />);
    if (i < n - 1) out.push(<Mist key={'m' + i} p={ctx.p} k={i} y={y + (bottom - top) / n - 4} h={12} opacity={ctx.time === 'misty' ? 0.7 : 0.4} color={ctx.pal.light} />);
  }
  return out;
}

const BACKDROPS: Record<string, (ctx: Ctx, c: string) => ReactNode> = {
  irazu: (ctx, c) => <VolcanoCone x={170} baseY={120} w={330} h={48} flat={0.3} color={c} shade={mix(c, '#000', 0.1)} p={ctx.p} />,
  turrialba: (ctx, c) => <VolcanoCone x={150} baseY={120} w={300} h={56} flat={0.16} color={c} steam p={ctx.p} />,
  poas: (ctx, c) => <VolcanoCone x={150} baseY={120} w={360} h={44} flat={0.4} color={c} steam p={ctx.p} />,
  arenal: (ctx, c) => <VolcanoCone x={210} baseY={120} w={170} h={78} flat={0.06} color={c} p={ctx.p} />,
  barva: (ctx, c) => <VolcanoCone x={160} baseY={120} w={300} h={46} flat={0.35} color={c} p={ctx.p} />,
  talamanca: (ctx, c) => <Range y={92} color={c} seed={ctx.seed} amp={26} peaks={5} bottom={120} />,
  guanacaste: (ctx, c) => <g><VolcanoCone x={90} baseY={120} w={200} h={40} flat={0.1} color={c} p={ctx.p} /><VolcanoCone x={240} baseY={120} w={220} h={48} flat={0.12} color={c} p={ctx.p + 'b'} /></g>,
};

// ---------- subjects ----------
function subject(ctx: Ctx, s: SceneSubject | undefined, x: number, y: number, k: string): ReactNode {
  if (!s) return null;
  const { pal, p } = ctx;
  const prov = PROV[ctx.spec.province ?? ''] ?? PROV['san-jose'];
  switch (s) {
    case 'church': return <Church key={k} x={x} y={y} s={0.95} tone={prov.wall} roof={prov.roof} />;
    case 'basilica': return <Church key={k} x={x} y={y} s={1.05} tone="#c9c6bf" roof="#5f6a70" dome="#6a7a80" />;
    case 'theatre': return <Theatre key={k} x={x} y={y} s={1} />;
    case 'museum': return (
      <g key={k}>
        <Block x={x} y={y} w={140} h={40} tone="#e4c76a" roof="#c8a84a" windows={7} glass="#6f6a5a" />
        <rect x={x - 76} y={y - 56} width={24} height={56} fill="#e4c76a" /><rect x={x + 52} y={y - 56} width={24} height={56} fill="#e4c76a" />
        <rect x={x - 76} y={y - 56} width={24} height={4} fill="#c8a84a" /><rect x={x + 52} y={y - 56} width={24} height={4} fill="#c8a84a" />
        <path d={`M${x - 10} ${y} L${x - 10} ${y - 20} Q${x} ${y - 30} ${x + 10} ${y - 20} L${x + 10} ${y} Z`} fill="#8a6a3a" />
      </g>
    );
    case 'castle': return <Castle key={k} x={x} y={y} s={0.9} />;
    case 'fortin': return <Fortin key={k} x={x} y={y} s={1.1} />;
    case 'ruins': return <Ruins key={k} x={x} y={y} s={1} />;
    case 'lighthouse': return <Lighthouse key={k} x={x} y={y} s={0.9} lit={ctx.time !== 'day'} />;
    case 'oxcart': return <Oxcart key={k} x={x} y={y} s={1} />;
    case 'plane': return <Plane key={k} x={x} y={y} s={1.4} />;
    case 'woodhall': return <WoodHall key={k} x={x} y={y} s={1} />;
    case 'clocktower': return <ClockTower key={k} x={x} y={y} s={1} />;
    case 'university': return (
      <g key={k}>
        <Block x={x - 40} y={y} w={70} h={34} tone="#d9d2c3" windows={4} />
        <Block x={x + 30} y={y} w={80} h={52} tone="#b8c9c4" windows={5} glass="#5f7f8f" />
        <Block x={x + 86} y={y} w={30} h={26} tone="#cfc6b4" windows={2} />
      </g>
    );
    case 'station': return (
      <g key={k}>
        <Block x={x} y={y} w={120} h={22} tone="#c8bfae" windows={6} glass="#4a5a60" />
        <rect x={x - 70} y={y - 26} width={140} height={5} fill="#8fa07a" />
        <rect x={x - 76} y={y - 24} width={152} height={2} fill="#6f8a5a" />
      </g>
    );
    case 'topiary': return (
      <g key={k}>
        {[-60, -30, 0, 30, 60].map((dx, i) => <Cypress key={dx} x={x + dx} y={y} s={1 + (i % 2) * 0.4} color="#2f6b3a" />)}
        <path d={`M${x - 80} ${y} Q${x - 70} ${y - 18} ${x - 60} ${y} M${x + 60} ${y} Q${x + 70} ${y - 18} ${x + 80} ${y}`} fill="#3f8a46" />
        <path d={`M${x - 20} ${y} q-2 -6 -8 -10 q6 -1 8 -8 q2 7 8 8 q-6 4 -8 10 M${x + 20} ${y} q-2 -6 -8 -10 q6 -1 8 -8 q2 7 8 8 q-6 4 -8 10`} fill="#4f9a4a" />
        <Church x={x} y={y - 2} s={0.6} tone="#f6f1e6" roof="#8b5a8e" />
      </g>
    );
    case 'mounds': return <Mounds key={k} x={x} y={y} s={1} />;
    case 'pier': return (
      <g key={k}>
        <rect x={x - 90} y={y - 8} width={180} height={4} fill="#5a4a3a" />
        {[-80, -56, -32, -8, 16, 40, 64].map((dx) => <rect key={dx} x={x + dx} y={y - 8} width={2.5} height={16} fill="#4a3a2c" />)}
        <rect x={x - 90} y={y - 10} width={180} height={2} fill="#9a8a6a" />
      </g>
    );
    case 'whale': return <WhaleTail key={k} x={x} y={y} s={1} color={mix(pal.sand, '#000', 0.05)} />;
    case 'turtle': return <Turtle key={k} x={x} y={y} s={1.2} color="#3b4a3a" />;
    case 'boat': return <Boat key={k} x={x} y={y} s={1} />;
    case 'canoe': return <Boat key={k} x={x} y={y} s={0.9} hull="#6b4a2d" trim="#e0a526" />;
    case 'sailboat': return <Boat key={k} x={x} y={y} s={0.6} sail />;
    case 'bridge': return <Bridge key={k} x={x} y={y} w={140} />;
    case 'suspension': return <Bridge key={k} x={x} y={y} w={150} suspension tone="#5a4a3a" cable={pal.light} />;
    case 'heron': return <Heron key={k} x={x} y={y} s={1.2} />;
    case 'reef': return <Reef key={k} x={x} y={y} s={1} seed={ctx.seed} />;
    case 'cave': return <CaveMouth key={k} x={x} y={y} s={1} />;
    case 'town': return <Town key={k} x={x} y={y} w={150} n={5} seed={ctx.seed} tone={prov.wall} roof={prov.roof} churchTone="#f6f1e6" />;
    case 'casona': return (
      <g key={k}>
        <rect x={x - 50} y={y - 30} width={100} height={30} fill="#f3ead6" />
        <path d={`M${x - 56} ${y - 30} L${x} ${y - 48} L${x + 56} ${y - 30} Z`} fill="#b86a3c" />
        <rect x={x - 54} y={y - 14} width={108} height={2} fill="#8a6a4a" />
        {[-40, -24, 8, 24].map((dx) => <rect key={dx} x={x + dx} y={y - 26} width={6} height={10} fill="#6b4a2d" />)}
        <path d={`M${x - 6} ${y} L${x - 6} ${y - 18} L${x + 6} ${y - 18} L${x + 6} ${y} Z`} fill="#4a3524" />
        {[-48, -16, 16, 48].map((dx) => <rect key={'c' + dx} x={x + dx - 1.5} y={y - 14} width={3} height={14} fill="#8a6a4a" />)}
      </g>
    );
    case 'garden': return (
      <g key={k}>
        <path d={`M${x - 70} ${y} Q${x - 50} ${y - 40} ${x - 20} ${y - 30} Q${x - 30} ${y - 10} ${x - 70} ${y} Z`} fill="#4f9a4a" />
        {[-50, -10, 30, 70].map((dx, i) => <g key={dx}><path d={`M${x + dx} ${y} l0 -24`} stroke="#3f7a3a" strokeWidth={1.5} /><path d={`M${x + dx} ${y - 24} m-5 0 a5 4 0 1 0 10 0 a5 4 0 1 0 -10 0`} fill={['#d9484f', '#8e4a9e', '#e0a526', '#f4a2c0'][i]} /></g>)}
        <Fern x={x + 50} y={y + 4} s={0.9} color="#2f6b3a" />
      </g>
    );
  }
  return <Steam key={k} x={x} y={y} p={p} />;
}

// ---------- bases ----------
function baseScene(ctx: Ctx): ReactNode[] {
  const { spec, pal, p, seed, rnd, time } = ctx;
  const out: ReactNode[] = [];
  const depth = spec.depth ?? 2;
  const cone = spec.cone;
  const water = spec.water ?? pal.water;
  const prov = PROV[spec.province ?? ''] ?? PROV['san-jose'];
  const palms = (y: number, n: number, color: string, from = 30, to = 290) => Array.from({ length: n }, (_, i) => <Palm key={'palm' + i} x={from + ((to - from) * (i + 0.5)) / n + (rnd() - 0.5) * 30} y={y} s={0.7 + rnd() * 0.5} lean={(rnd() - 0.5) * 24} color={color} />);

  switch (spec.base) {
    case 'volcano': {
      out.push(...depthLayers(ctx, 1, 100, 118));
      const c = cone ?? {};
      const col = c.color ?? '#5a6a56';
      if (c.second) out.push(<VolcanoCone key="c2" x={c.second.x} baseY={140} w={c.second.w} h={c.second.h} flat={0.4} lake={c.second.lake} color={mix(col, pal.haze, 0.25)} steam={c.second.steam} p={p + 'c2'} />);
      out.push(<VolcanoCone key="cone" x={c.x ?? 160} baseY={142} w={c.w ?? 240} h={c.h ?? 80} flat={c.flat ?? 0.18} lake={c.lake} lakeW={c.lake ? (c.w ?? 240) * (c.flat ?? 0.18) * 0.9 : undefined} steam={c.steam} color={mix(col, pal.haze, 0.1)} p={p} ridge={!c.lake && c.flat && c.flat > 0.25 ? mix(col, '#000', 0.25) : undefined} />);
      out.push(<Mist key="mv" p={p} k={9} y={140} x={-40} w={400} h={10} opacity={0.45} color={pal.light} />);
      if (spec.water) {
        out.push(<Hills key="shore" y={140} color={mix(pal.mid, pal.haze, 0.2)} seed={seed + 3} amp={6} bumps={5} bottom={156} />);
        out.push(<Lake key="lake" x={160} y={172} rx={200} ry={24} color={spec.water} light={pal.light} />);
        out.push(<Hills key="fg" y={186} color={pal.near} seed={seed + 5} amp={8} bumps={5} />);
      } else {
        out.push(<Hills key="h1" y={142} color={mix(pal.mid, pal.haze, 0.15)} seed={seed + 3} amp={10} bumps={5} />);
        out.push(<Hills key="h2" y={162} color={pal.mid} seed={seed + 4} amp={10} bumps={4} />);
        out.push(<Canopy key="cn" y={184} color={pal.near} seed={seed + 6} n={10} r={12} light={mix(pal.near, pal.light, 0.15)} />);
      }
      break;
    }
    case 'dry-forest': {
      out.push(...depthLayers(ctx, 1, 96, 112));
      if (cone) out.push(<VolcanoCone key="cone" x={cone.x ?? 170} baseY={128} w={cone.w ?? 240} h={cone.h ?? 70} flat={cone.flat ?? 0.14} steam={cone.steam} lake={cone.lake} color={mix(cone.color ?? '#7a6a58', pal.haze, 0.2)} p={p} />);
      else out.push(<Hills key="dh" y={100} color={mix('#8a8a5a', pal.haze, 0.4)} seed={seed + 2} amp={16} bumps={4} bottom={130} />);
      out.push(<Hills key="h1" y={126} color={mix('#b8a054', pal.haze, 0.25)} seed={seed + 3} amp={6} bumps={5} />);
      out.push(<Ground key="g" y={150} color={time === 'dusk' ? '#c99a4a' : '#d6b345'} />);
      out.push(<Hills key="h2" y={152} color={time === 'dusk' ? '#b58a3c' : '#c9a63c'} seed={seed + 4} amp={4} bumps={6} bottom={200} />);
      out.push(<path key="grass" d="M30 170 l2 -6 l2 6 M60 182 l2 -6 l2 6 M120 176 l2 -6 l2 6 M200 184 l2 -6 l2 6 M260 174 l2 -6 l2 6 M290 188 l2 -6 l2 6" fill="none" stroke="#a8862a" strokeWidth={1} />);
      if (spec.subject === 'casona') out.push(subject(ctx, 'casona', 150, 160, 'casona'));
      else if (spec.subject && spec.subject !== 'town') out.push(subject(ctx, spec.subject, 150, 168, 'sub'));
      out.push(<BroadTree key="t1" x={60 + rnd() * 30} y={176} s={1.1} color="#5a7a3a" wide={1.3} />);
      out.push(<BroadTree key="t2" x={240 + rnd() * 40} y={168} s={0.7} color="#6a8a42" />);
      out.push(<BroadTree key="t3" x={150 + rnd() * 30} y={158} s={0.4} color="#7a8a48" />);
      break;
    }
    case 'cloud-forest': {
      out.push(...depthLayers(ctx, depth, 70, 130));
      out.push(<Canopy key="c1" y={136} color={mix(pal.mid, pal.haze, 0.3)} seed={seed + 11} n={9} r={14} />);
      out.push(<Mist key="mc" p={p} k={8} y={146} h={14} opacity={0.75} color={pal.light} />);
      if (spec.subject === 'suspension') out.push(subject(ctx, 'suspension', 160, 150, 'br'));
      if (spec.subject === 'bridge') out.push(subject(ctx, 'bridge', 160, 160, 'br'));
      out.push(<Canopy key="c2" y={168} color={pal.near} seed={seed + 12} n={8} r={16} light={mix(pal.near, pal.light, 0.15)} />);
      if (spec.water) out.push(<River key="rv" d="M110 200 Q150 180 190 184 Q230 188 240 170" color={spec.water} w={14} />);
      out.push(<BroadTree key="bt" x={250 + rnd() * 30} y={190} s={0.9} color={pal.near} />);
      break;
    }
    case 'rainforest': {
      out.push(...depthLayers(ctx, depth, 80, 126));
      out.push(<Canopy key="c1" y={130} color={mix(pal.mid, pal.haze, 0.25)} seed={seed + 11} n={10} r={13} />);
      if (spec.water) out.push(<Lake key="lk" x={160} y={160} rx={190} ry={20} color={spec.water} light={pal.light} />);
      if (spec.subject === 'mounds') out.push(<Ground key="g" y={150} color="#6fa04a" />, <Mounds key="mo" x={160} y={192} s={1.1} />, <BroadTree key="gt" x={120} y={150} s={0.5} color="#4f7f48" />);
      else if (spec.subject === 'garden') out.push(<Ground key="g" y={152} color="#8cc04b" />, subject(ctx, 'garden', 150, 190, 'ga'));
      else out.push(<Canopy key="c2" y={158} color={pal.mid} seed={seed + 12} n={9} r={15} light={mix(pal.mid, pal.light, 0.2)} />);
      out.push(<Palm key="p1" x={60 + rnd() * 40} y={178} s={0.9} lean={-8} color={pal.near} />);
      out.push(<BroadTree key="bt" x={240 + rnd() * 40} y={182} s={1} color={pal.near} />);
      break;
    }
    case 'highland': {
      out.push(...depthLayers(ctx, depth, 60, 116, true));
      out.push(<Range key="main" y={96} color={mix('#6a6a5a', pal.haze, 0.15)} seed={seed + 21} amp={34} peaks={3} bottom={160} sharp={1.1} />);
      out.push(<Hills key="par" y={150} color="#9a9a5a" seed={seed + 22} amp={8} bumps={5} />);
      out.push(<Hills key="par2" y={170} color="#7a8a3c" seed={seed + 23} amp={8} bumps={6} />);
      out.push(<Lake key="lk" x={120 + rnd() * 60} y={186} rx={34} ry={6} color="#4a7a8a" light={pal.light} />);
      out.push(<path key="rocks" d="M30 200 q6 -22 24 -16 q10 4 12 16 Z M240 200 q4 -16 18 -12 q8 3 10 12 Z" fill="#6a6a62" />);
      out.push(<path key="rockl" d="M40 190 q8 -10 18 -4 Z M248 192 q6 -8 14 -3 Z" fill="#8a8a80" />);
      break;
    }
    case 'mountain': {
      out.push(...depthLayers(ctx, depth, 60, 130, true));
      out.push(<Canopy key="c1" y={140} color={mix(pal.mid, pal.haze, 0.2)} seed={seed + 11} n={9} r={14} />);
      out.push(<Mist key="mm" p={p} k={8} y={150} h={12} opacity={0.6} color={pal.light} />);
      out.push(<Canopy key="c2" y={170} color={pal.near} seed={seed + 12} n={8} r={16} light={mix(pal.near, pal.light, 0.12)} />);
      break;
    }
    case 'beach': {
      out.push(<Hills key="far" y={98} color={mix(pal.far, pal.haze, 0.4)} seed={seed + 1} amp={10} bumps={3} bottom={116} right={200} />);
      out.push(<Sea key="sea" p={p} y={112} pal={pal} bottom={186} />);
      if (spec.subject !== 'pier') out.push(<Island key="is" x={240 + rnd() * 50} y={114} w={40 + rnd() * 30} h={10 + rnd() * 8} color={mix(pal.far, pal.haze, 0.3)} flat />);
      out.push(<Rocks key="rk" x={250 + rnd() * 40} y={150} s={0.9} seed={seed + 2} color={mix('#4a4440', pal.haze, 0.1)} />);
      (spec.extras ?? []).forEach((e, i) => {
        if (e === 'town') out.push(subject(ctx, 'town', 90, 118, 'x' + i));
        else if (e === 'sailboat') out.push(subject(ctx, 'sailboat', 120 + rnd() * 60, 130, 'x' + i));
        else if (e === 'lighthouse') return;
        else out.push(subject(ctx, e, 170 + i * 50 + rnd() * 30, 140 + i * 6, 'x' + i));
      });
      if (spec.subject === 'boat') out.push(subject(ctx, 'boat', 200, 150, 'bt'));
      out.push(<Beach key="beach" y={158} sand={pal.sand} curve={22} side={spec.fringe === 'left' ? 'right' : 'left'} />);
      if (spec.subject === 'pier') out.push(subject(ctx, 'pier', 170, 148, 'pier'), ...(spec.extras?.includes('lighthouse') ? [subject(ctx, 'lighthouse', 84, 150, 'lh')] : []));
      if (spec.subject === 'turtle') out.push(subject(ctx, 'turtle', 190, 184, 'tt'), <path key="tracks" d="M150 200 Q170 190 190 186" stroke={mix(pal.sand, '#000', 0.2)} strokeWidth={4} strokeDasharray="2 3" fill="none" />);
      if (spec.subject === 'town') out.push(subject(ctx, 'town', 110, 160, 'tw'));
      out.push(...palms(192, spec.palms ?? 2, pal.near, 20, 300));
      break;
    }
    case 'reef': {
      out.push(<Hills key="far" y={100} color={mix(pal.far, pal.haze, 0.45)} seed={seed + 1} amp={8} bumps={3} bottom={116} left={120} />);
      out.push(<Sea key="sea" p={p} y={110} pal={pal} bottom={200} surf={false} />);
      out.push(<path key="shallow" d="M0 140 Q80 128 160 136 T320 132 L320 200 L0 200 Z" fill={mix(pal.water, pal.light, 0.35)} />);
      out.push(<path key="surf" d="M0 142 q30 -4 60 0 t60 0 t60 0 t60 0 t60 0" fill="none" stroke={pal.light} strokeWidth={2} opacity={0.7} />);
      (spec.extras ?? []).forEach((e, i) => out.push(subject(ctx, e, 220 + i * 40, 126, 'x' + i)));
      if (spec.subject === 'whale') {
        out.push(<path key="tailsurf" d="M128 200 Q136 170 150 160 Q110 150 96 140 Q92 134 102 134 Q140 140 160 150 Q180 140 218 134 Q228 134 224 140 Q210 150 170 160 Q184 170 192 200 Z" fill={pal.light} opacity={0.75} />);
        out.push(<path key="tailsand" d="M134 200 Q140 172 156 162 Q116 150 102 142 Q100 139 106 139 Q140 144 160 154 Q180 144 214 139 Q220 139 218 142 Q204 150 164 162 Q180 172 186 200 Z" fill={pal.sand} />);
      } else {
        out.push(<Reef key="reef" x={160 + rnd() * 40} y={190} s={1} seed={seed} />);
        out.push(<Reef key="reef2" x={70 + rnd() * 30} y={198} s={0.7} seed={seed + 3} />);
      }
      out.push(<Beach key="bch" y={168} sand={pal.sand} curve={14} side="left" />);
      out.push(...palms(196, spec.palms ?? 2, pal.near, 200, 320));
      break;
    }
    case 'island': {
      out.push(<Sea key="sea" p={p} y={100} pal={pal} bottom={200} />);
      out.push(<Island key="far" x={60} y={102} w={60} h={10} color={mix(pal.far, pal.haze, 0.4)} />);
      out.push(<path key="isl" d="M80 150 L96 110 L124 84 L160 66 L200 70 L236 92 L256 118 L266 150 Z" fill={mix('#3f6a40', pal.haze, 0.15)} />);
      out.push(<path key="cliff" d="M84 150 L92 126 L130 118 L200 116 L250 122 L266 150 Z" fill="#5a4a3c" />);
      out.push(<path key="cliffS" d="M190 150 L200 116 L250 122 L266 150 Z" fill="#4a3c30" />);
      out.push(<Canopy key="cn" y={104} color="#2f6b3a" seed={seed + 5} n={7} r={16} left={100} right={250} light="#4f9a4a" bottom={122} />);
      out.push(<path key="peak" d="M130 104 L160 70 L196 104 Z" fill="#2f6b3a" />);
      out.push(<Waterfall key="wf1" x={130} top={120} bottom={150} w={5} pool="transparent" />);
      out.push(<Waterfall key="wf2" x={228} top={124} bottom={150} w={4} pool="transparent" />);
      out.push(<path key="sea2" d="M0 150 L320 150 L320 200 L0 200 Z" fill={mix(pal.water, pal.waterDeep, 0.4)} />);
      out.push(<path key="surf" d="M80 152 q20 -4 40 0 t40 0 t40 0 t40 0 t40 0" fill="none" stroke={pal.light} strokeWidth={2} opacity={0.6} />);
      (spec.extras ?? []).forEach((e, i) => out.push(subject(ctx, e, 60 + i * 40, 176, 'x' + i)));
      out.push(<Rocks key="rk" x={290} y={166} s={0.8} seed={seed + 4} color="#3a3236" />);
      break;
    }
    case 'canal': {
      out.push(...depthLayers(ctx, 1, 86, 110));
      out.push(<Canopy key="c1" y={112} color={mix(pal.mid, pal.haze, 0.3)} seed={seed + 11} n={10} r={14} />);
      out.push(<Mist key="mcn" p={p} k={8} y={124} h={12} opacity={0.5} color={pal.light} />);
      const wcol = mix(spec.water ?? '#3f6a5a', pal.skyBottom, 0.25);
      out.push(<path key="water" d="M130 130 L190 130 L320 200 L0 200 Z" fill={wcol} />);
      out.push(<path key="refl" d="M120 166 h40 M150 182 h60 M200 170 h30" stroke={pal.light} strokeWidth={1.4} opacity={0.45} />);
      out.push(<Canopy key="c2" y={128} color={pal.mid} seed={seed + 12} n={7} r={16} left={0} right={135} light={mix(pal.mid, pal.light, 0.2)} solid={false} />);
      out.push(<Canopy key="c3" y={126} color={pal.mid} seed={seed + 13} n={7} r={16} left={185} right={320} light={mix(pal.mid, pal.light, 0.2)} solid={false} />);
      out.push(<path key="bankL" d="M0 128 L135 128 L0 200 Z" fill={pal.mid} />, <path key="bankR" d="M185 126 L320 126 L320 200 Z" fill={pal.mid} />);
      out.push(<path key="bankLd" d="M0 150 L100 148 L0 200 Z" fill={pal.near} />, <path key="bankRd" d="M220 148 L320 146 L320 200 Z" fill={pal.near} />);
      out.push(<Mangrove key="mg1" x={70} y={168} s={0.9} color={pal.near} />, <Mangrove key="mg2" x={262} y={166} s={0.85} color={pal.near} />);
      if (spec.subject === 'town') out.push(<path key="sand" d="M118 132 L202 132 L212 140 L108 140 Z" fill={pal.sand} />, <Town key="tw" x={160} y={132} w={90} n={3} seed={seed} tone="#f4efe0" roof="#d9484f" churchTone="#f6f1e6" s={0.8} />);
      const canoeX = 140 + rnd() * 40;
      if (spec.subject === 'canoe' || spec.extras?.includes('canoe')) out.push(subject(ctx, 'canoe', canoeX, 178, 'cn'), <path key="wake" d={`M${canoeX - 34} 182 h68`} stroke={pal.light} strokeWidth={1} opacity={0.4} />);
      out.push(...palms(200, 1, pal.dark, 250, 300));
      break;
    }
    case 'wetland': {
      out.push(...depthLayers(ctx, 1, 94, 112));
      out.push(<Hills key="h" y={112} color={mix(pal.mid, pal.haze, 0.35)} seed={seed + 2} amp={5} bumps={6} bottom={134} />);
      out.push(<Lake key="lk" x={160} y={168} rx={200} ry={36} color={water} light={pal.light} />);
      out.push(<path key="reeds" d="M20 150 l0 -22 M26 152 l1 -18 M300 150 l0 -20 M306 152 l-1 -16 M150 140 l0 -14 M156 141 l1 -12" stroke="#7a8a3c" strokeWidth={1.6} strokeLinecap="round" />);
      out.push(<path key="pads" d="M80 170 a7 3 0 1 0 14 0 a7 3 0 1 0 -14 0 M230 180 a8 3.5 0 1 0 16 0 a8 3.5 0 1 0 -16 0 M120 186 a6 2.5 0 1 0 12 0 a6 2.5 0 1 0 -12 0" fill="#4f9a4a" />);
      if (spec.subject === 'bridge') out.push(<g key="br"><path d="M20 128 Q160 112 300 128" stroke="#8a8a80" strokeWidth={2} fill="none" /><rect x={20} y={128} width={280} height={4} fill="#5a5a52" /><path d="M60 132 v14 M120 132 v18 M200 132 v18 M260 132 v14" stroke="#5a5a52" strokeWidth={4} /><path d="M40 126 v2 M80 124 v2 M120 122 v2 M160 121 v2 M200 122 v2 M240 124 v2 M280 126 v2" stroke="#8a8a80" strokeWidth={1} /></g>);
      if (spec.subject === 'heron') out.push(<Heron key="hr" x={190} y={164} s={1.3} />);
      (spec.extras ?? []).forEach((e, i) => out.push(subject(ctx, e, 90 + i * 100, 176, 'x' + i)));
      out.push(<BroadTree key="t1" x={40} y={150} s={0.7} color={mix(pal.mid, pal.haze, 0.2)} wide={1.3} />);
      out.push(<Mangrove key="mg" x={280} y={156} s={0.8} color={pal.near} />);
      break;
    }
    case 'river': {
      out.push(...depthLayers(ctx, 1, 86, 110));
      if (cone) out.push(<VolcanoCone key="cone" x={cone.x ?? 180} baseY={122} w={cone.w ?? 240} h={cone.h ?? 70} flat={cone.flat ?? 0.1} color={mix(cone.color ?? '#4f7f58', pal.haze, 0.3)} p={p} />);
      out.push(<Canopy key="c1" y={118} color={mix(pal.mid, pal.haze, 0.25)} seed={seed + 11} n={10} r={13} />);
      out.push(<Mist key="mr" p={p} k={8} y={128} h={10} opacity={0.5} color={pal.light} />);
      const wc = spec.water ?? pal.water;
      // the river comes from the far bank at the middle and widens to the bottom edge
      out.push(<path key="riv" d="M128 132 L192 132 Q214 156 270 170 Q310 180 320 200 L0 200 Q10 180 50 170 Q106 156 128 132 Z" fill={mix(wc, pal.skyBottom, 0.15)} />);
      out.push(<path key="riv2" d="M142 140 L178 140 Q196 160 236 174 Q258 184 262 200 L58 200 Q62 184 84 174 Q124 160 142 140 Z" fill={mix(wc, pal.light, 0.22)} />);
      out.push(<path key="refl" d="M120 176 h30 M170 188 h40 M150 160 h20" stroke={pal.light} strokeWidth={1.2} opacity={0.45} />);
      out.push(<path key="rocks" d="M92 184 a6 3 0 1 0 12 0 a6 3 0 1 0 -12 0 M222 188 a7 3 0 1 0 14 0 a7 3 0 1 0 -14 0" fill="#6a6a62" />);
      out.push(<Canopy key="c2" y={134} color={pal.near} seed={seed + 12} n={6} r={15} left={0} right={126} light={mix(pal.near, pal.light, 0.15)} solid={false} />);
      out.push(<Canopy key="c3" y={134} color={pal.near} seed={seed + 13} n={6} r={15} left={194} right={320} light={mix(pal.near, pal.light, 0.15)} solid={false} />);
      out.push(<path key="bankL" d="M0 136 L130 136 Q110 158 50 172 L0 184 Z" fill={pal.near} />, <path key="bankR" d="M190 136 L320 136 L320 184 L270 172 Q210 158 190 136 Z" fill={pal.near} />);
      (spec.extras ?? []).forEach((e, i) => {
        if (e === 'station') out.push(<g key={'x' + i}><rect x={222} y={132} width={52} height={14} fill="#e8e2d2" /><path d="M218 132 L248 122 L278 132 Z" fill="#8a5a3a" /><rect x={244} y={138} width={6} height={8} fill="#4a5a60" /><rect x={230} y={136} width={6} height={5} fill="#6f93a6" /><rect x={260} y={136} width={6} height={5} fill="#6f93a6" /></g>);
        else if (e === 'town') out.push(<Town key={'x' + i} x={70} y={150} w={110} n={4} seed={seed + 5} tone={PROV.heredia.wall} roof={PROV.heredia.roof} s={0.9} />);
        else out.push(subject(ctx, e, 70, 150, 'x' + i));
      });
      if (spec.subject === 'suspension') out.push(<Bridge key="br" x={160} y={154} w={170} suspension cable={pal.light} tone="#3a2c20" />);
      if (spec.subject === 'bridge') out.push(<Bridge key="br" x={160} y={148} w={190} tone="#4a3a2a" />, <path key="brr" d="M66 142 h188" stroke="#6a5a4a" strokeWidth={1.5} />, <path key="brv" d="M80 142 v6 M100 142 v6 M120 142 v6 M140 142 v6 M160 142 v6 M180 142 v6 M200 142 v6 M220 142 v6 M240 142 v6" stroke="#6a5a4a" strokeWidth={1} />, <rect key="brp1" x={98} y={148} width={5} height={30} fill="#4a3a2a" />, <rect key="brp2" x={217} y={148} width={5} height={30} fill="#4a3a2a" />);
      if (spec.subject === 'boat') out.push(<Boat key="bt" x={160 + rnd() * 20} y={182} s={1} hull="#6b4a2d" trim="#e0a526" />, <path key="wk" d="M120 186 h80" stroke={pal.light} strokeWidth={1} opacity={0.4} />);
      out.push(<Palm key="pm" x={30 + rnd() * 20} y={176} s={0.7} lean={6} color={pal.near} />);
      break;
    }
    case 'waterfall': {
      out.push(...depthLayers(ctx, depth, 70, 110));
      out.push(<Canopy key="c1" y={110} color={mix(pal.mid, pal.haze, 0.25)} seed={seed + 11} n={9} r={14} />);
      out.push(<path key="cliff" d="M90 112 Q100 100 130 104 L210 102 Q236 100 240 120 L232 182 L96 182 Z" fill="#5a5048" />);
      out.push(<path key="cliffL" d="M90 112 Q100 100 130 104 L150 104 L148 182 L96 182 Z" fill="#6a6058" />);
      out.push(<path key="moss" d="M96 130 q10 -8 22 0 q-6 10 -22 0 M206 140 q8 -10 24 -2 q-8 10 -24 2" fill="#4f7f48" />);
      out.push(<Waterfall key="wf" x={166} top={106} bottom={182} w={18} pool={mix(water, pal.light, 0.3)} />);
      out.push(<Mist key="mw" p={p} k={8} y={182} h={16} opacity={0.6} color={pal.light} />);
      out.push(<Lake key="pool" x={160} y={190} rx={120} ry={14} color={water} light={pal.light} />);
      if (spec.subject === 'bridge') out.push(<Bridge key="br" x={160} y={168} w={130} tone="#5a4a3a" />);
      out.push(<Canopy key="c2" y={160} color={pal.near} seed={seed + 12} n={3} r={18} left={0} right={100} light={mix(pal.near, pal.light, 0.15)} />);
      out.push(<Canopy key="c3" y={156} color={pal.near} seed={seed + 13} n={3} r={18} left={220} right={320} light={mix(pal.near, pal.light, 0.15)} />);
      out.push(<Fern key="f1" x={70} y={200} s={1} rot={-15} color={pal.dark} />, <Fern key="f2" x={262} y={200} s={0.9} rot={12} color={pal.dark} />);
      break;
    }
    case 'cave': {
      out.push(...depthLayers(ctx, 1, 94, 112));
      out.push(<Hills key="h" y={112} color={mix('#8a8a5a', pal.haze, 0.3)} seed={seed + 2} amp={8} bumps={4} bottom={140} />);
      out.push(<Ground key="g" y={140} color="#a08a5a" />);
      out.push(<CaveMouth key="cv" x={160} y={196} s={1.1} />);
      out.push(<BroadTree key="t1" x={50} y={160} s={0.8} color="#6a8a42" wide={1.3} />, <BroadTree key="t2" x={270} y={156} s={0.7} color="#7a8a48" />);
      break;
    }
    case 'city':
    case 'town': {
      const far = mix(prov.hill, pal.haze, 0.55);
      const bd = spec.backdrop ?? 'none';
      if (bd !== 'none' && BACKDROPS[bd]) out.push(<g key="bd">{BACKDROPS[bd](ctx, mix(bd === 'talamanca' ? '#5a6a5a' : '#6a6a5e', pal.haze, 0.4))}</g>);
      out.push(<Hills key="far" y={114} color={far} seed={seed + 2} amp={8} bumps={5} bottom={134} />);
      out.push(<Mist key="mt" p={p} k={7} y={130} x={-40} w={400} h={8} opacity={0.45} color={pal.light} />);
      out.push(<Ground key="g" y={132} color={spec.province === 'guanacaste' ? '#d9c070' : prov.ground} />);
      const dusky = time === 'dusk' || time === 'night';
      if (spec.base === 'city' && !spec.subject) {
        out.push(<Town key="t0" x={160} y={146} w={300} n={5} seed={seed + 1} tone={mix(prov.wall, pal.haze, 0.4)} roof={mix(prov.roof, pal.haze, 0.3)} church={false} s={0.8} />);
        out.push(<Block key="b1" x={80} y={150} w={34} h={46} tone="#cfc9bc" windows={3} glass={dusky ? '#ffd27a' : '#6f93a6'} />, <Block key="b2" x={210} y={152} w={28} h={60} tone="#c8c0b0" windows={2} glass={dusky ? '#ffd27a' : '#6f93a6'} />, <Block key="b3" x={248} y={150} w={40} h={38} tone="#d9d2c3" windows={4} glass={dusky ? '#ffd27a' : '#6f93a6'} />);
        out.push(<Town key="t1" x={160} y={168} w={300} n={6} seed={seed + 3} tone={prov.wall} roof={prov.roof} churchTone="#f6f1e6" />);
        out.push(<ClockTower key="ct" x={130} y={168} s={0.6} />);
      } else if (spec.base === 'city' && spec.subject) {
        out.push(<Town key="t0" x={160} y={148} w={320} n={6} seed={seed + 1} tone={mix(prov.wall, pal.haze, 0.35)} roof={mix(prov.roof, pal.haze, 0.3)} church={spec.subject !== 'basilica'} s={0.8} />);
        out.push(<Ground key="plaza" y={148} color={mix(prov.ground, '#c9b98a', 0.5)} />);
        if (spec.subject === 'plane') {
          out.push(<rect key="rw" x={0} y={166} width={320} height={14} fill="#6a6a62" />, <path key="rwl" d="M10 173 h30 M60 173 h30 M110 173 h30 M160 173 h30 M210 173 h30 M260 173 h30" stroke="#f4f1ea" strokeWidth={1.5} />);
          out.push(<Block key="term" x={230} y={166} w={120} h={22} tone="#d9d2c3" windows={7} glass="#6f93a6" />, <ClockTower key="tower" x={300} y={166} s={0.6} tone="#cfc9bc" />);
          out.push(subject(ctx, 'plane', 120, 120, 'pl'));
        } else out.push(subject(ctx, spec.subject, 160, 172, 'sub'));
        out.push(<BroadTree key="tr" x={spec.fringe === 'right' ? 36 : 290} y={176} s={0.7} color={pal.near} />);
      } else {
        out.push(<Town key="t0" x={160} y={150} w={300} n={5} seed={seed + 1} tone={mix(prov.wall, pal.haze, 0.35)} roof={mix(prov.roof, pal.haze, 0.3)} church={false} s={0.8} />);
        if (spec.subject && spec.subject !== 'town') {
          out.push(<Town key="t1" x={spec.fringe === 'right' ? 70 : 250} y={168} w={120} n={4} seed={seed + 3} tone={prov.wall} roof={prov.roof} church={false} />);
          out.push(subject(ctx, spec.subject, spec.subject === 'oxcart' ? 150 : 160, spec.subject === 'oxcart' ? 190 : 172, 'sub'));
          if (spec.subject === 'oxcart') out.push(<Church key="ch" x={240} y={168} s={0.6} tone={prov.wall} roof={prov.roof} />);
        } else {
          out.push(<Town key="t1" x={160} y={172} w={300} n={6} seed={seed + 3} tone={prov.wall} roof={prov.roof} churchTone="#f6f1e6" s={1.1} />);
        }
        (spec.extras ?? []).forEach((e, i) => out.push(subject(ctx, e, 160, 140, 'x' + i)));
        if (spec.province === 'limon' || spec.palms) out.push(...palms(196, spec.palms || 2, pal.near, 20, 300));
        else out.push(<BroadTree key="tr" x={spec.fringe === 'right' ? 40 : 284} y={190} s={0.8} color={pal.near} wide={spec.province === 'guanacaste' ? 1.4 : 1} />);
      }
      break;
    }
  }
  return out;
}

function Scene({ spec, p, seed }: { spec: SceneSpec; p: string; seed: number }) {
  const time = spec.time ?? 'day';
  const ctx: Ctx = { p, pal: PALETTES[time], rnd: prng(seed), spec, seed, time };
  const fr = spec.fringe ?? 'left';
  return (
    <>
      {skyLayer(ctx)}
      {baseScene(ctx)}
      {(fr === 'left' || fr === 'both') && <Fringe side="left" color={ctx.pal.dark} seed={seed + 31} />}
      {(fr === 'right' || fr === 'both') && <Fringe side="right" color={ctx.pal.dark} seed={seed + 32} />}
      {fr === 'both' && <Leaf x={300} y={60} s={1.2} rot={120} color={ctx.pal.dark} />}
      {spec.rain && <Rain seed={seed} />}
    </>
  );
}

export function LandmarkArt({ id, kind, province, title, className, style }: { id: string; kind: string; province?: string | null; title?: string; className?: string; style?: CSSProperties }) {
  const spec = sceneFor(id, kind, province);
  const seed = spec.seed ?? hashId(id);
  const p = `pv-${id.replace(/[^a-z0-9-]/gi, '')}`;
  return (
    <svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" className={className} style={style} role={title ? 'img' : undefined} aria-label={title} aria-hidden={title ? undefined : true} focusable="false">
      <Scene spec={spec} p={p} seed={seed} />
    </svg>
  );
}
