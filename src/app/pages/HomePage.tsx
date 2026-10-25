// The homepage is one scroll journey — a walk through the country in nine stops over a sticky stage (see
// docs/HOMEPAGE_REDESIGN.md). Empty sections give each stop its scroll length; the stage shows the plates, the map,
// the table and the closing beach, and the copy of each stop is pinned in the stage and keyed to its progress.
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from '../../ui/Link';
import { useT, type MessageKey } from '../../i18n';
import { useCalmMotion, useSettings } from '../../state/settings';
import { useTier } from '../../perf/tier';
import { useContent } from '../../content';
import type { Species } from '../../content/types';
import { useMapData } from '../../map/useMapData';
import { useMap, PROVINCE_IDS, type ProvinceId } from '../../state/map';
import { PROVINCE_COLORS } from '../../map/geo';
import { useJourneyDriver, journey, onJourney, scrollToChapter, CHAPTER_COUNT } from '../../journey/driver';
import { STOPS } from '../../journey/scenes';
import { Scene } from '../../journey/Scene';
import { StopCopy } from '../../journey/StopCopy';
import { EruptionLayers, EruptionSheet } from '../../journey/Eruption';
import { FlavorsTable } from '../../journey/FlavorsTable';
import { NatureFacts } from '../../journey/NatureFacts';
import { PERSONAL } from '../../content/personal';
import { startAmbience, stopAmbience, ambienceAvailable, rumble } from '../../audio/ambience';
import { Icon } from '../../ui/Icon';
import { Sheet } from '../../ui/Sheet';
import { SpeciesEntry } from '../../ui/SpeciesEntry';
import { StatusTag } from '../../ui/Sources';
import { usePassport } from '../../state/passport';
import { SECTIONS } from '../sections';
import { usePageTitle } from '../usePageTitle';

const HomeMap = lazy(() => import('../../journey/HomeMap').then((m) => ({ default: m.HomeMap })));
const Map2D = lazy(() => import('../../map/Map2D').then((m) => ({ default: m.Map2D })));

export function HomePage() {
  const { t, l, lang } = useT();
  usePageTitle();
  const navigate = useNavigate();
  const calm = useCalmMotion();
  const motionPref = useSettings((s) => s.motion);
  const setMotion = useSettings((s) => s.setMotion);
  const tier = useTier((s) => s.tier);
  // the walk has no WebGL any more: every tier but text gets the moving plates (the loops are CSS transforms)
  const live = tier !== 'text';
  // motion is off because the system asked for it and the visitor has not said otherwise: offer the switch
  const [motionNoticeOff, setMotionNoticeOff] = useState(false);
  const motionNotice = calm && motionPref === 'auto' && live && !motionNoticeOff;
  const content = useContent();
  const { data: mapData } = useMapData();
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  useJourneyDriver(rootRef, calm);

  // which stage pieces are mounted: later stops wait until the visitor approaches them
  const [reach, setReach] = useState(0);
  const [chapter, setChapter] = useState(0);
  useEffect(() => {
    const update = () => {
      setReach((r) => (journey.t > r ? journey.t : r));
      setChapter((c) => (journey.chapter === c ? c : journey.chapter));
    };
    update();
    return onJourney(update);
  }, []);
  const mounted = (i: number) => i === 1 || reach > i - 2 + 0.25; // stop i (1-based) mounts 0.75 of a chapter before it starts

  const sound = useSettings((s) => s.sound);
  const setSound = useSettings((s) => s.setSound);
  useEffect(() => () => { stopAmbience(); setSound(false); }, [setSound]);
  const toggleSound = async () => { if (sound) { stopAmbience(); setSound(false); return; } setSound(await startAmbience()); };

  // species entries opened from the hotspots
  const [openSp, setOpenSp] = useState<{ sp: Species; stop: string } | null>(null);
  const stamp = usePassport((s) => s.stamp);
  const openSpecies = useCallback((sp: Species, stop: string) => { setOpenSp({ sp, stop }); stamp('species', sp.id); }, [stamp]);

  // the Irazú eruption
  const [erupting, setErupting] = useState(false);
  const [dossier, setDossier] = useState(false);
  const toggleEruption = () => {
    const next = !erupting;
    setErupting(next);
    if (next && live && !calm) {
      rumble(7);
      const st = stageRef.current;
      if (st) { st.classList.add('is-tremor'); window.setTimeout(() => st.classList.remove('is-tremor'), 900); }
    }
  };

  const openProvince = useCallback((id: ProvinceId) => navigate('/provinces/' + id, { viewTransition: true }), [navigate]);
  const hover = useMap((s) => s.hover);
  const select = useMap((s) => s.select);
  const hovered = useMap((s) => s.hovered);
  const mapIndex = STOPS.findIndex((s) => s.kind === 'map') + 1;
  // the 2D fallback map selects through the same store; open the chapter when it does
  const selected2d = useMap((s) => s.selected);
  useEffect(() => { if (!live && selected2d && journey.chapter === mapIndex - 1) openProvince(selected2d); }, [live, selected2d, openProvince, mapIndex]);

  const goTo = (i: number) => { if (rootRef.current) scrollToChapter(rootRef.current, i, !calm); };
  const provinceLine = (id: ProvinceId) => {
    const p = content?.provinces.find((x) => x.id === id);
    if (!p) return '';
    const text = l(p.overview);
    const first = text.split(/(?<=[.!?。])\s+/)[0] || text;
    return first.length > 140 ? first.slice(0, 137).replace(/\s+\S*$/, '') + '…' : first;
  };
  const website = PERSONAL.links?.website;
  const github = PERSONAL.links?.github || 'https://github.com/RuibinRay/Pura-Vida';
  const email = PERSONAL.links?.email;
  const place = (id?: string) => (id ? content?.places.find((p) => p.id === id) : undefined);
  const stopMarkers = STOPS.map((s, i) => ({ s, n: i + 1 })).filter((x) => x.s.place).map((x) => { const p = place(x.s.place); return p?.coords ? { n: x.n, id: p.id, name: l(p.name).replace(/ (National Park|Cloud Forest Reserve|dry forest and savanna|Parque Nacional.*|Reserva.*|国家公园|云雾森林.*)$/i, '').split(/,|，/)[0], coords: p.coords } : null; }).filter((x): x is { n: number; id: string; name: string; coords: [number, number] } => !!x);
  const fit = openSp ? openSp.sp.stops?.[openSp.stop === 'discover' ? 'opening' : openSp.stop] : undefined;
  const species = content?.species || [];

  return (
    <div ref={rootRef} className={'journey' + (live ? ' journey--live' : ' journey--still') + (calm ? ' journey--calm' : '') + (erupting ? ' is-erupting' : '')} data-chapter="1">
      <div className="journey__stage" ref={stageRef}>
        {STOPS.map((stop, i) => {
          const n = i + 1;
          if (!mounted(n)) return null;
          if (stop.kind === 'scene' || stop.kind === 'close') {
            return (
              <Scene key={stop.key} index={n} stop={stop} live={live} chapter={chapter} species={species} onOpenSpecies={openSpecies} priority={n === 1}>
                {stop.eruption && <EruptionLayers on={erupting} live={live && !calm} />}
              </Scene>
            );
          }
          if (stop.kind === 'map') {
            return mapData ? (
              <div key={stop.key} className={`scene scene--${n} scene--map stage__map${chapter === i ? ' is-current' : ''}`} style={{ ['--i' as string]: n, ['--pn' as string]: `var(--p${n})`, zIndex: n, visibility: Math.abs(chapter - i) <= 1 ? 'visible' : 'hidden' }}>
                <Suspense fallback={null}>
                  {live ? <HomeMap data={mapData} onOpen={openProvince} index={n} stops={stopMarkers} /> : <div className="home-map home-map--2d"><Map2D data={mapData} landmarks={[]} /></div>}
                </Suspense>
                {stop.wash && <div className={`scene__wash scene__wash--${stop.wash}`} />}
              </div>
            ) : null;
          }
          if (stop.kind === 'table') {
            return content ? (
              <div key={stop.key} className={`scene scene--${n} scene--table${chapter === i ? ' is-current' : ''}`} style={{ ['--i' as string]: n, ['--pn' as string]: `var(--p${n})`, zIndex: n, visibility: Math.abs(chapter - i) <= 1 ? 'visible' : 'hidden' }}>
                <FlavorsTable foods={content.foods} index={n} />
                {stop.wash && <div className={`scene__wash scene__wash--${stop.wash}`} />}
              </div>
            ) : null;
          }
          return null;
        })}

        <div className="journey__copy">
          {STOPS.map((stop, i) => {
            const n = i + 1;
            const pn = { ['--pn' as string]: `var(--p${n})` } as React.CSSProperties;
            const pl = place(stop.place);
            const vis = chapter === i;
            const sec = (children: React.ReactNode) => (
              <section key={stop.key} className={`jchapter jchapter--${n} jchapter--${stop.key}`} aria-labelledby={`ch${n}-title`} style={{ ...pn, visibility: vis ? 'visible' : 'hidden' }}>
                {children}
              </section>
            );
            if (stop.key === 'discover') {
              return sec(
                <>
                  <div className="jcopy jcopy--hero on-dark">
                    <p className="jcopy__kicker">01 / {t('journey.ch1.kicker')}</p>
                    <h1 id="ch1-title" className="jcopy__h1">COSTA RICA</h1>
                    <p className="jcopy__tagline">{t('journey.ch1.tagline')}</p>
                    <p className="jcopy__intro">{t('journey.ch1.intro')}</p>
                    <div className="jcopy__actions ui">
                      <button type="button" className="btn btn--primary btn--lg" onClick={() => goTo(1)}>{t('journey.ch1.begin')} <Icon name="chevron" /></button>
                      <Link to="/explore" className="btn btn--glass btn--lg">{t('journey.ch1.openMap')}</Link>
                    </div>
                    {!live && <p className="jcopy__note ui">{t('journey.stillNote')}</p>}
                    <p className="jcopy__scrollhint ui" aria-hidden="true"><span /> {t('journey.scrollHint')}</p>
                  </div>
                  <p className="visually-hidden">{t('journey.ch1.plateAlt')}</p>
                </>,
              );
            }
            if (stop.kind === 'map') {
              return sec(
                <div className="jcopy jcopy--panel jcopy--right on-dark" style={pn}>
                  <p className="jcopy__kicker">{String(n).padStart(2, '0')} / {t('journey.ch3.kicker')}</p>
                  <h2 id={`ch${n}-title`} className="jcopy__h2">{t('journey.ch3.title')}</h2>
                  <p className="jcopy__text">{t('journey.ch3.text')}</p>
                  <ol className="province-list" aria-label={t('journey.ch3.listLabel')}>
                    {PROVINCE_IDS.map((id) => {
                      const geo = mapData?.provinces.find((p) => p.id === id);
                      const name = geo ? (geo.name[lang] || geo.name.en) : id;
                      return (
                        <li key={id} style={{ ['--swatch' as string]: PROVINCE_COLORS[id] }}>
                          <button type="button" className={'province-list__btn' + (hovered === id ? ' is-on' : '')} onPointerEnter={() => hover(id)} onPointerLeave={() => hover(null)} onFocus={() => hover(id)} onBlur={() => hover(null)} onClick={() => (live ? select(id, false) : openProvince(id))}>
                            <b>{name}</b>
                            <span>{provinceLine(id)}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ol>
                  {content && (
                    <>
                      <p className="jcopy__kicker jcopy__kicker--sub">{t('journey.countryFacts')}</p>
                      <NatureFacts facts={content.country} limit={3} />
                    </>
                  )}
                  <p className="jcopy__links ui"><Link to="/provinces">{t('journey.ch3.all')}</Link><Link to="/explore">{t('journey.ch3.fullMap')}</Link></p>
                  <p className="jcopy__caption"><small>{t('explore.reliefNote')}</small></p>
                </div>,
              );
            }
            if (stop.kind === 'table') {
              return sec(
                <>
                  <div className="jcopy jcopy--panel jcopy--top on-dark" style={pn}>
                    <p className="jcopy__kicker">{String(n).padStart(2, '0')} / {t('journey.ch5.kicker')}</p>
                    <h2 id={`ch${n}-title`} className="jcopy__h2">{t('journey.ch5.title')}</h2>
                    <p className="jcopy__text">{t('journey.ch5.text')}</p>
                    <p className="jcopy__links ui"><Link to="/food">{t('journey.ch5.all')}</Link><Link to="/culture">{t('nav.culture')} <small>· {t('journey.soon')}</small></Link></p>
                  </div>
                  <ul className="visually-hidden">
                    {content?.foods.map((f) => (<li key={f.id}><Link to={'/food?focus=' + f.id}>{l(f.name)}</Link></li>))}
                  </ul>
                </>,
              );
            }
            if (stop.kind === 'close') {
              return sec(
                <div className="jcopy jcopy--close on-dark" style={pn}>
                  <p className="jcopy__kicker">{String(n).padStart(2, '0')} / {t('journey.ch6.kicker')}</p>
                  <h2 id={`ch${n}-title`} className="jcopy__h2">{t('journey.ch6.title')}</h2>
                  <blockquote className="jcopy__quote"><p>{t('journey.ch6.quote')}</p></blockquote>
                  <p className="jcopy__text">{t('journey.ch6.text')}</p>
                  <ul className="closing-links ui">
                    {website && <li><a href={website} rel="me noopener">{t('journey.ch6.website')} <Icon name="external" /></a></li>}
                    <li><a href={github} rel="noopener">{t('journey.ch6.github')} <Icon name="external" /></a></li>
                    {email ? <li><a href={'mailto:' + email}>{t('journey.ch6.contact')}</a></li> : <li><Link to="/my-costa-rica">{t('journey.ch6.contact')}</Link></li>}
                    <li><Link to="/my-costa-rica">{t('nav.myCostaRica')}</Link></li>
                  </ul>
                  <p className="jcopy__kicker jcopy__kicker--sub">{t('journey.ch6.explore')}</p>
                  <ul className="chips-row ui">
                    {SECTIONS.filter((s) => s.id !== 'home' && s.ready === true).map((s) => (
                      <li key={s.id}><Link to={s.path} className="chip chip--section" style={{ ['--tab' as string]: s.color }}>{t(s.labelKey)}</Link></li>
                    ))}
                  </ul>
                  <p className="jcopy__caption">
                    <small>{t('journey.ch6.coming')}: {SECTIONS.filter((s) => s.ready !== true).map((s) => t(s.labelKey)).join(' · ')}.</small>
                  </p>
                  <p className="jcopy__links ui">
                    {pl?.province && <Link to={'/provinces/' + pl.province}>{l(pl.name)}</Link>}
                    <Link to="/sources">{t('nav.sources')}</Link>
                    <button type="button" className="btn btn--link" onClick={() => goTo(0)}>{t('journey.ch6.again')}</button>
                  </p>
                  <p className="jcopy__caption"><small>{t('journey.plateCredit')}</small></p>
                </div>,
              );
            }
            // a scene stop: the sourced place copy, plus the eruption controls at Irazú
            return sec(
              <StopCopy
                index={n}
                stop={stop}
                place={pl}
                extraLinks={<Link to="/wildlife">{t('journey.stopWildlife')}</Link>}
              >
                {stop.eruption && (
                  <div className="erupt-ctl ui">
                    <button type="button" className={'btn btn--lg ' + (erupting ? 'btn--glass' : 'btn--primary')} aria-pressed={erupting} onClick={toggleEruption}>
                      <Icon name={erupting ? 'pause' : 'spark'} /> {erupting ? t('journey.erupt.stop') : t('journey.erupt.button')}
                    </button>
                    <button type="button" className="btn btn--ghost btn--sm" onClick={() => setDossier(true)}>{t('journey.erupt.read')}</button>
                    <p className="jcopy__caption erupt-ctl__hint" aria-live="polite">{erupting ? t('journey.erupt.live') + ' ' : ''}<small>{t('journey.erupt.hint')}</small></p>
                  </div>
                )}
              </StopCopy>,
            );
          })}
        </div>
      </div>

      {/* scroll length for each stop; the copy and the visuals live in the stage and read --p1…--pN */}
      {STOPS.map((stop, i) => (<div key={stop.key} className={`jspace jspace--${i + 1} jspace--${stop.kind}`} style={stop.length ? { minHeight: `${stop.length}vh` } : undefined} data-chapter={i + 1} aria-hidden="true" />))}
      <span className="visually-hidden">{t('journey.chaptersCount', { n: CHAPTER_COUNT })}</span>

      {/* chapter rail: where you are in the walk */}
      <nav className="rail ui" aria-label={t('journey.railLabel')}>
        <ol>
          {STOPS.map((stop, i) => (
            <li key={stop.key}>
              <button type="button" className={'rail__item' + (chapter === i ? ' is-current' : '')} aria-current={chapter === i ? 'step' : undefined} onClick={() => goTo(i)}>
                <span className="rail__n tnum">{String(i + 1).padStart(2, '0')}</span>
                <span className="rail__label">{t(`journey.stops.${stop.key}.kicker` as MessageKey)}</span>
              </button>
            </li>
          ))}
        </ol>
        {live && ambienceAvailable() && (
          <button type="button" className="rail__sound" aria-pressed={sound} onClick={toggleSound} title={t('journey.soundNote')} aria-label={sound ? t('journey.soundOn') : t('journey.soundOff')}>
            <Icon name={sound ? 'sound' : 'mute'} />
          </button>
        )}
      </nav>

      {/* the system asked for reduced motion: say so, and offer the animals anyway */}
      {motionNotice && (
        <div className="motion-notice ui" role="status">
          <p>{t('journey.motionOffNote')}</p>
          <div className="motion-notice__actions">
            <button type="button" className="btn btn--primary btn--sm" onClick={() => setMotion('full')}>{t('journey.motionOn')}</button>
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => setMotionNoticeOff(true)}>{t('journey.motionKeep')}</button>
          </div>
        </div>
      )}

      {/* the species entry opened from any stop, with whether the animal belongs in that scene */}
      <Sheet open={!!openSp} onClose={() => setOpenSp(null)} title={openSp ? l(openSp.sp.commonNames) : ''}>
        {openSp && (
          <div className="sheet-entry">
            {fit && (
              <p className={'habitat-fit ui ' + (fit.fit ? 'habitat-fit--yes' : 'habitat-fit--no')}>
                <b>{t('journey.habitat.q')}</b> <span className="habitat-fit__verdict">{fit.fit ? t('journey.habitat.yes') : t('journey.habitat.no')}</span>
                {fit.note && <span className="habitat-fit__note"> — {l(fit.note)}</span>}
                {fit.status && fit.status !== 'confirmed' && <> <StatusTag status={fit.status} /></>}
              </p>
            )}
            <SpeciesEntry sp={openSp.sp} heading="h3" compact />
            <p className="ui"><Link to={'/wildlife?focus=' + openSp.sp.id} className="btn btn--ghost btn--sm">{t('journey.habitat.open')}</Link></p>
          </div>
        )}
      </Sheet>
      <EruptionSheet open={dossier} onClose={() => setDossier(false)} />
    </div>
  );
}
