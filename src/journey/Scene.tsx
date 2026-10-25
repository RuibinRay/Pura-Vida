// One stop of the walk: a plate (the owner's image) with its moving animals, flowing water, ambient layers and the
// hotspots that open the sourced species entries. Everything scroll-driven reads the custom properties the driver
// writes (--jt, --pN, --px/--py, --calm); the 1–5 s loops of the animals and the water are CSS animations that run
// only while the stop is on stage and only when the visitor allows motion.
import { useMemo, useState } from 'react';
import { PLATES, LayerImg, PlateBox, PlateLayer, type AnimalInfo, type PlateName, type WaterInfo } from './Plate';
import type { Stop } from './scenes';
import type { Species } from '../content/types';
import { useT } from '../i18n';

const FX = import.meta.env.BASE_URL.replace(/\/?$/, '/') + 'plates/';

const pct = (v: number) => `${(v * 100).toFixed(3)}%`;
/** box (plate fractions) → CSS position relative to a container box (plate fractions) */
function rel(box: number[], container: number[]) {
  return { left: pct((box[0] - container[0]) / container[2]), top: pct((box[1] - container[1]) / container[3]), width: pct(box[2] / container[2]), height: pct(box[3] / container[3]) };
}
const PLATE_BOX = [0, 0, 1, 1];

function Water({ plate, w, live }: { plate: PlateName; w: WaterInfo; live: boolean }) {
  const style = { ...rel(w.box, PLATE_BOX), ['--wdx' as string]: w.flow.dx, ['--wdy' as string]: w.flow.dy, ['--wperiod' as string]: `${w.flow.period}s`, ['--wamp' as string]: w.flow.amp } as React.CSSProperties;
  const copies = !live || w.mode === 'still' ? 1 : w.mode === 'flow' ? 2 : 1;
  const falls = w.mode === 'flow' && Math.abs(w.flow.dy) > 0.8; // a waterfall: spray rises where it lands
  return (
    <div className={`water water--${w.mode} water--${w.name}${falls ? ' water--falls' : ''}`} style={style} aria-hidden="true">
      {Array.from({ length: copies }, (_, i) => (
        <LayerImg key={i} plate={plate} name={'water-' + w.name} box={w.box} widths={w.widths} />
      ))}
      {live && falls && [0, 1, 2, 3].map((i) => (<span key={i} className={`water__spray water__spray--${i}`} style={{ backgroundImage: `url(${FX}fx/steam.png)` }} />))}
    </div>
  );
}

/** Whole-body motion for animals whose spec names none: perched birds hop and settle, grazers shift their weight. */
function bodyAnim(a: AnimalInfo): string | undefined {
  if (a.anim) return a.anim;
  switch (a.kind) {
    case 'toucan': case 'thrush': return 'perch';
    case 'quetzal': return 'perch-soft';
    case 'deer': case 'tapir': case 'heron': return 'stand';
    default: return undefined;
  }
}
function bodyPeriod(a: AnimalInfo, anim?: string) {
  if (a.period) return a.period;
  switch (anim) { case 'perch': return 4.2; case 'perch-soft': return 5; case 'stand': return 4.8; default: return 2.4; }
}
/** The scroll-driven flight of an animal: CSS variables read by the animal and by its hotspot, so the ring follows. */
export function flyVars(fly: [number, number] | undefined, firstStop: boolean): Record<string, string | number> {
  if (!fly) return {};
  // the first stop opens at progress 0 as the picture was drawn; later stops centre the path on their midpoint
  return { '--fdx': fly[0], '--fdy': fly[1], '--f0': firstStop ? 0 : 0.5 };
}

function Animal({ plate, a, container, facing = 1, lifted, live, fly, firstStop }: { plate: PlateName; a: AnimalInfo; container: number[]; facing?: 1 | -1; lifted: boolean; live: boolean; fly?: [number, number]; firstStop: boolean }) {
  const anim = bodyAnim(a);
  const style = { ...rel(a.box, container), ['--period' as string]: `${bodyPeriod(a, anim)}s`, ['--amp' as string]: a.amp ?? 1, ['--delay' as string]: `${a.delay ?? -(hash(a.id) % 2000) / 1000}s`, ['--sgn' as string]: facing, ...flyVars(fly, firstStop) } as React.CSSProperties;
  const parts = [...a.parts].sort((x, y) => x.z - y.z);
  return (
    <div className={`animal animal--${a.kind}${anim && live ? ' animal--' + anim : ''}${fly ? ' animal--fly' : ''}${lifted ? ' is-on' : ''}`} style={style} aria-hidden="true">
      {parts.map((p) => {
        const vars: Record<string, string | number> = { '--period': `${p.period ?? defaultPeriod(p.anim)}s`, '--amp': p.amp ?? defaultAmp(p.anim), '--delay': `${p.delay ?? -(hash(a.id + p.name) % 1700) / 1000}s` };
        if (p.axis) { vars['--ax'] = p.axis[0]; vars['--ay'] = p.axis[1]; }
        const ps = { ...rel(p.box, a.box), zIndex: p.z, ...vars } as React.CSSProperties;
        if (p.pivot) ps.transformOrigin = `${pct(p.pivot[0])} ${pct(p.pivot[1])}`;
        return (
          <div key={p.name} className={`part part--${p.name}${live && p.anim !== 'none' ? ' part--' + p.anim : ''}`} style={ps}>
            <LayerImg plate={plate} name={`${a.id}-${p.name}`} box={p.box} widths={p.widths} />
          </div>
        );
      })}
    </div>
  );
}

function defaultPeriod(anim: string) {
  switch (anim) {
    case 'flap-a': case 'flap-b': return 1.2;
    case 'flutter-a': case 'flutter-b': return 0.16;
    case 'morpho-a': case 'morpho-b': return 1.6;
    case 'turn': return 3.8; case 'tilt': return 2.8; case 'graze': return 4.6; case 'watch': return 5; case 'sway': return 5.5; case 'tail': return 4.5; case 'breathe': return 3.5;
    default: return 3;
  }
}
function defaultAmp(anim: string) {
  switch (anim) {
    case 'flap-a': case 'flap-b': return 28;
    case 'flutter-a': case 'flutter-b': return 16;
    case 'morpho-a': case 'morpho-b': return 62;
    case 'turn': return 4; case 'tilt': return 6; case 'graze': return 5; case 'watch': return 3; case 'sway': return 2; case 'tail': return 2.5; case 'breathe': return 1;
    default: return 2;
  }
}
function hash(s: string) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; }

export interface SceneProps {
  index: number;              // 1-based chapter number
  stop: Stop;
  live: boolean;              // animations and layers (full/lite tiers)
  chapter: number;            // current 0-based chapter from the driver
  species: Species[];
  onOpenSpecies: (sp: Species, stopKey: string) => void;
  priority?: boolean;
  children?: React.ReactNode; // extra layers in plate space (the eruption)
}

export function Scene({ index, stop, live, chapter, species, onOpenSpecies, priority, children }: SceneProps) {
  const { t, l } = useT();
  const plate = stop.plate as PlateName;
  const m = PLATES[plate];
  const [lift, setLift] = useState<string | null>(null);
  const byId = useMemo(() => new Map(species.map((s) => [s.id, s])), [species]);
  const current = chapter === index - 1;
  const near = Math.abs(chapter - (index - 1)) <= 1;
  const animals = m.animals || [];
  const free = animals.filter((a) => !a.layer);
  const onLayer = (name: string) => animals.filter((a) => a.layer === name);
  const facing = stop.facing || {};
  const fly = stop.fly || {};
  const withHotspot = animals.filter((a) => a.hotspot && a.species && byId.get(a.species));
  const style = { ['--i' as string]: index, ['--pn' as string]: `var(--p${index})`, visibility: near ? 'visible' : 'hidden', zIndex: index } as React.CSSProperties;
  return (
    <div className={`scene scene--${index} scene--${stop.key}${current ? ' is-current' : ''}${near ? ' is-near' : ''}`} style={style}>
      <PlateBox plate={plate} className={`plate--${plate}`}>
        <LayerImg plate={plate} name="base" className="plate__base" priority={priority} alt="" />
        {(m.water || []).map((w) => (<Water key={w.name} plate={plate} w={w} live={live} />))}
        {live && stop.ambient?.shafts && <div className="plate__shafts" />}
        {live && stop.ambient?.mist && <div className="plate__mist plate__mist--1" style={{ backgroundImage: `url(${FX}mist-1.png)` }} />}
        {live && stop.ambient?.clouds && <div className="plate__clouds" style={{ backgroundImage: `url(${FX}mist-2.png)` }} />}
        {live && stop.ambient?.sun && <div className="plate__sunglow" style={{ ['--sx' as string]: pct((m.points?.sun?.[0] ?? m.focal.x) as number), ['--sy' as string]: pct((m.points?.sun?.[1] ?? 0.4) as number) }} />}
        {m.layers.map((layer) => (
          <PlateLayer key={layer.name} plate={plate} layer={layer.name} className={`plate__near plate__near--${layer.name.replace('near-', '')}`} priority={priority}>
            {onLayer(layer.name).map((a) => (<Animal key={a.id} plate={plate} a={a} container={layer.box} facing={facing[a.id]} lifted={lift === a.id} live={live} fly={fly[a.id]} firstStop={index === 1} />))}
          </PlateLayer>
        ))}
        {free.map((a) => (<Animal key={a.id} plate={plate} a={a} container={PLATE_BOX} facing={facing[a.id]} lifted={lift === a.id} live={live} fly={fly[a.id]} firstStop={index === 1} />))}
        {live && stop.ambient?.mist && <div className="plate__mist plate__mist--2" style={{ backgroundImage: `url(${FX}mist-2.png)` }} />}
        {children}
        {withHotspot.length > 0 && (
          <nav className="plate__hotspots plate__hotspots--scene" aria-label={t('journey.animalsIn', { place: t(`journey.stops.${stop.key}.title` as never) })}>
            {withHotspot.map((a, i) => {
              const sp = byId.get(a.species as string) as Species;
              const [hx, hy] = a.hotspot as number[];
              const fit = sp.stops?.[stop.key === 'discover' ? 'opening' : stop.key];
              return (
                <button
                  key={a.id}
                  type="button"
                  className={'hotspot hotspot--scene' + (lift === a.id ? ' is-on' : '') + (fit && !fit.fit ? ' hotspot--misfit' : '') + (fly[a.id] ? ' hotspot--fly' : '')}
                  style={{ left: pct(hx), top: pct(hy), ['--i' as string]: i, ...flyVars(fly[a.id], index === 1) } as React.CSSProperties}
                  onClick={() => onOpenSpecies(sp, stop.key)}
                  onPointerEnter={() => setLift(a.id)}
                  onPointerLeave={() => setLift(null)}
                  onFocus={() => setLift(a.id)}
                  onBlur={() => setLift(null)}
                >
                  <span className="hotspot__ring" aria-hidden="true" />
                  <span className={'hotspot__label' + (hx > 0.6 ? ' hotspot__label--right' : '')}><b>{l(sp.commonNames)}</b><i>{sp.scientific}</i></span>
                </button>
              );
            })}
          </nav>
        )}
      </PlateBox>
      <div className={`stage__vignette stage__vignette--${stop.key}`} />
      {stop.wash && <div className={`scene__wash scene__wash--${stop.wash}`} />}
    </div>
  );
}
