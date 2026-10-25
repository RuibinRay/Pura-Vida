// The wildlife trail: the sticky stage of the wildlife page. Seven habitats pass as the visitor scrolls — the
// backdrop of each zone walks in (a slow zoom and pan), its animals come out one by one from the direction the
// walk reveals them, idle on their own loops, and open their sourced journal entry on a tap. The same scroll driver
// as the homepage walk (driver.ts): every move is a function of the scroll position, so walking back replays it.
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { useT, type MessageKey } from '../i18n';
import { useCalmMotion, useSettings } from '../state/settings';
import { useTier } from '../perf/tier';
import { usePassport } from '../state/passport';
import type { Species } from '../content/types';
import { useJourneyDriver, journey, onJourney, scrollToChapter } from './driver';
import { ZONES, ZONE_COUNT, STICKERS, ENV, TRAIL_SPECIES, stickerSrc, stickerSrcSet, envSrc, envSrcSet, type TrailAnimal, type TrailZone } from './trail';
import { startAmbience, stopAmbience, ambienceAvailable } from '../audio/ambience';
import { Icon } from '../ui/Icon';
import { FLOCK } from './Scene';

const FX = import.meta.env.BASE_URL.replace(/\/?$/, '/') + 'plates/';

const PERIODS: Record<string, number> = { hang: 5.6, perch: 4.2, hover: 2.6, fly: 3.1, stand: 4.8, prowl: 5.4, crawl: 4.4, swim: 6.2, breathe: 3.4 };
const FROM: Record<string, [number, number]> = { left: [-18, 0], right: [18, 0], up: [0, -14], down: [0, 14] };

function Animal({ a, zone, sp, spotted, onOpen, live }: { a: TrailAnimal; zone: string; sp?: Species; spotted: boolean; onOpen: (sp: Species, zone: string) => void; live: boolean }) {
  const { t, l } = useT();
  const s = STICKERS[a.id];
  if (!s) return null;
  const [ex, ey] = FROM[a.from || 'down'];
  const name = sp ? l(sp.commonNames) : a.id;
  const style = {
    '--x': a.at[0], '--y': a.at[1], '--w': a.at[2],
    '--mx': a.phone[0], '--my': a.phone[1], '--mw': a.phone[2],
    '--d': a.d ?? 0.1, '--depth': a.depth ?? 0.8, '--ex': ex, '--ey': ey,
    '--period': `${a.period ?? PERIODS[a.loop]}s`, '--base': s.baseline, '--ratio': `${s.w} / ${s.h}`,
    ...(a.dip ? { '--dip': a.dip } : {}),
  } as CSSProperties;
  // the sticker is drawn at --w % of the stage; `sizes` says so, so the browser picks the file for that width
  const sizes = `(orientation: portrait) ${a.phone[2]}vw, ${a.at[2]}vw`;
  return (
    <button
      type="button"
      className={`zoo-animal zoo-animal--${a.loop}` + (a.flip ? ' zoo-animal--flip' : '') + (a.dip ? ' zoo-animal--dip' : '') + (spotted ? ' is-spotted' : '')}
      style={style}
      onClick={() => sp && onOpen(sp, zone)}
      aria-label={sp ? t('trail.open', { name }) : name}
      disabled={!sp}
    >
      <span className="zoo-animal__shadow" aria-hidden="true" />
      <img
        className="zoo-animal__img"
        src={stickerSrc(a.id, s.widths[Math.min(s.widths.length - 1, 1)])}
        srcSet={stickerSrcSet(a.id)}
        sizes={sizes}
        width={s.w}
        height={s.h}
        alt=""
        decoding="async"
        loading={live ? 'eager' : 'lazy'}
        draggable={false}
      />
      <span className="zoo-animal__tag" aria-hidden="true">
        <b>{name}</b>
        {sp?.scientific && <i>{sp.scientific}</i>}
        {spotted && <em>{t('trail.spotted')}</em>}
      </span>
    </button>
  );
}

function Zone({ z, index, active, species, spotted, onOpen, live }: { z: TrailZone; index: number; active: boolean; species: Map<string, Species>; spotted: Set<string>; onOpen: (sp: Species, zone: string) => void; live: boolean }) {
  const { t } = useT();
  const e = ENV[z.env];
  const style = { '--i': index, '--fx': `${z.focal[0]}%`, '--fy': `${z.focal[1]}%` } as CSSProperties;
  // the backdrop covers the stage like the plates: 100vw in landscape, 100vh × ratio (capped) in portrait
  const sizes = e ? `(max-aspect-ratio: ${e.w}/${e.h}) min(${((e.w / e.h) * 100).toFixed(1)}vh, 900px), 100vw` : '100vw';
  return (
    <section className={`zone zone--${z.key} zone--sign-${z.sign}` + (active ? ' is-current' : '')} style={style} data-scene={index} data-fade aria-label={t(`trail.zones.${z.key}.name` as MessageKey)}>
      <div className="zone__back">
        {e && <img className="zone__bg" src={envSrc(z.env, e.widths[2] ?? e.widths[0])} srcSet={envSrcSet(z.env)} sizes={sizes} width={e.w} height={e.h} alt="" decoding="async" loading={index <= 2 ? 'eager' : 'lazy'} fetchPriority={index === 1 ? 'high' : 'auto'} draggable={false} />}
        <div className="zone__wash" aria-hidden="true" />
        {live && z.ambient?.shafts && <div className="plate__shafts zone__shafts" style={{ backgroundImage: `url(${FX}shafts.png)` }} aria-hidden="true" />}
        {live && z.ambient?.mist && <div className="plate__mist plate__mist--1 zone__mist"><div className="plate__drift" style={{ backgroundImage: `url(${FX}mist-1-fade.png)` }} /></div>}
        {live && z.ambient?.birds && (
          <div className="plate__birds" style={{ left: `${z.ambient.birds[0] * 100}%`, top: `${z.ambient.birds[1] * 100}%`, width: `${z.ambient.birds[2] * 100}%`, height: `${z.ambient.birds[3] * 100}%` }} aria-hidden="true">
            {FLOCK.map((b, i) => (
              <span key={i} className="bird" style={{ top: `${b.y}%`, ['--d' as string]: `${b.d}s`, ['--t' as string]: `${b.t}s`, ['--s' as string]: b.s }}>
                <svg viewBox="0 0 24 10" width="22" height="9"><path d="M1 7 Q6.5 0.5 12 6.5 Q17.5 0.5 23 7" fill="none" stroke="#1b1a12" strokeWidth="1.7" strokeLinecap="round" /></svg>
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="zone__animals">
        {z.animals.map((a) => (
          <Animal key={a.id} a={a} zone={z.key} sp={species.get(a.id)} spotted={spotted.has(a.id)} onOpen={onOpen} live={live} />
        ))}
      </div>
      <div className="zone__sign">
        <span className="zone__num">{String(index).padStart(2, '0')} / {String(ZONE_COUNT).padStart(2, '0')}</span>
        <h2 className="zone__name">{t(`trail.zones.${z.key}.name` as MessageKey)}</h2>
        <p className="zone__lede">{t(`trail.zones.${z.key}.lede` as MessageKey)}</p>
        <p className="zone__count ui">{z.animals.length === 1 ? t('trail.speciesOne') : t('trail.speciesHere', { n: z.animals.length })}</p>
      </div>
      <div className="zone__ground" aria-hidden="true" />
    </section>
  );
}

export function Trail({ species, onOpen }: { species: Species[]; onOpen: (sp: Species, zone: string) => void }) {
  const { t } = useT();
  const calm = useCalmMotion();
  const tier = useTier((s) => s.tier);
  const live = tier !== 'text';
  const rootRef = useRef<HTMLDivElement>(null);
  useJourneyDriver(rootRef, calm);
  const byId = useMemo(() => new Map(species.map((s) => [s.id, s])), [species]);
  const discoveries = usePassport((s) => s.discoveries);
  const spotted = useMemo(() => new Set(discoveries.filter((d) => d.kind === 'species').map((d) => d.id)), [discoveries]);
  const seen = TRAIL_SPECIES.filter((id) => spotted.has(id)).length;

  const [reach, setReach] = useState(0);
  const [chapter, setChapter] = useState(0);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const update = () => {
      setReach((r) => (journey.t > r ? journey.t : r));
      setChapter((c) => (journey.chapter === c ? c : journey.chapter));
      setProgress(Math.round((journey.t / ZONE_COUNT) * 200) / 200);
    };
    update();
    return onJourney(update);
  }, []);
  const mounted = (i: number) => i === 1 || reach > i - 2 + 0.25;
  const goTo = useCallback((i: number) => { if (rootRef.current) scrollToChapter(rootRef.current, i, !calm); }, [calm]);

  const sound = useSettings((s) => s.sound);
  const setSound = useSettings((s) => s.setSound);
  useEffect(() => () => { stopAmbience(); setSound(false); }, [setSound]);
  const toggleSound = async () => { if (sound) { stopAmbience(); setSound(false); return; } setSound(await startAmbience()); };

  return (
    <div ref={rootRef} className={'trail' + (live ? ' trail--live' : ' trail--still') + (calm ? ' trail--calm' : '')} data-chapter="1">
      <div className="trail__stage">
        {ZONES.map((z, i) => mounted(i + 1) && (
          <Zone key={z.key} z={z} index={i + 1} active={chapter === i} species={byId} spotted={spotted} onOpen={onOpen} live={live} />
        ))}
        <div className="trail__hint ui" data-scene="1" aria-hidden="true">
          <span className="trail__hint-scroll">{t('trail.scrollHint')}</span>
          <span className="trail__hint-tap">{t('trail.tapHint')}</span>
        </div>
        <div className="trail__top ui">
          <span className={'trail__spotted' + (seen >= TRAIL_SPECIES.length ? ' is-complete' : '')} title={t('trail.spottedTitle')}><Icon name={seen >= TRAIL_SPECIES.length ? 'stamp' : 'paw'} /> {seen >= TRAIL_SPECIES.length ? t('trail.complete') : t('trail.spottedCount', { n: seen, total: TRAIL_SPECIES.length })}</span>
          {ambienceAvailable() && (
            <button type="button" className={'btn btn--ghost btn--sm trail__sound' + (sound ? ' is-on' : '')} onClick={toggleSound} aria-pressed={sound}>
              <Icon name={sound ? 'sound' : 'mute'} /> {sound ? t('trail.soundOff') : t('trail.soundOn')}
            </button>
          )}
        </div>
        <nav className="trail__rail ui" aria-label={t('trail.railLabel')}>
          <div className="trail__path" aria-hidden="true"><span className="trail__walked" style={{ '--p': progress } as CSSProperties} /></div>
          <ol>
            {ZONES.map((z, i) => (
              <li key={z.key} className={i === chapter ? 'is-current' : i < chapter ? 'is-walked' : ''}>
                <button type="button" onClick={() => goTo(i)} aria-current={i === chapter ? 'step' : undefined}>
                  <span className="trail__dot" aria-hidden="true" />
                  <span className="trail__label">{t(`trail.zones.${z.key}.name` as MessageKey)}</span>
                </button>
              </li>
            ))}
          </ol>
        </nav>
      </div>
      {ZONES.map((z, i) => (
        <div key={z.key} className={`trail__chapter trail__chapter--${z.key}`} style={z.length ? { minHeight: `${z.length}vh` } : undefined} data-chapter={i + 1} aria-hidden="true" />
      ))}
    </div>
  );
}
